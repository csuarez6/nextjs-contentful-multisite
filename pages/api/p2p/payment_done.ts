// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PaymentStatus } from "@/lib/enum/EPaymentStatus.enum";
import { DEFAULT_ORDER_PARAMS } from "@/lib/graphql/order.gql";
import { P2PRequestStatus } from "@/lib/interfaces/p2p-cf-interface";
import { getCLAdminCLient, isExternalPayment } from "@/lib/services/commerce-layer.service";
import { getP2PRequestInformation } from "@/lib/services/place-to-pay.service";
import { sendEmails } from "@/lib/services/send-emails.service";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
    const data = req.query;
    const orderId = data.id?.toString();
    let emails = false;

    try {
        console.info('p2p payment_done', req.query);

        const client = await getCLAdminCLient();
        const order = await client.orders.retrieve(orderId, DEFAULT_ORDER_PARAMS);
        if (!order) throw new Error("INVALID_ORDER");
        const authorization = order.authorizations?.at(0);
        if (!authorization) throw new Error("INVALID_TRANSACTION");

        if (order.payment_status !== PaymentStatus.paid && order.payment_status !== PaymentStatus.voided) {
            const paymentSource = order.payment_source;
            const transactionToken = isExternalPayment(paymentSource) ? paymentSource.payment_source_token : null;

            if (transactionToken) {
                const infoP2P = await getP2PRequestInformation(transactionToken);
                const metadata = {
                    medium: 'payment_done',
                    data: data,
                    paymentInfo: infoP2P
                };

                if (typeof infoP2P === 'string') {
                    throw new Error(infoP2P);
                }

                if (infoP2P.status.status === P2PRequestStatus.approved) {
                    await client.orders.update({
                        id: order.id,
                        _approve: true
                    }).then(async () => {
                        console.info('p2p payment_done approved orderId: ' + order.id);
                        await client.orders.update({
                            id: order.id,
                            _capture: true
                        }, DEFAULT_ORDER_PARAMS
                        ).then(async (orderUpdated) => {
                            console.info('p2p payment_done captured orderId: ' + order.id);
                            const captures = orderUpdated.captures.at(0);

                            await client.captures.update({
                                id: captures.id,
                                metadata: metadata
                            });
                            emails = true;
                        });
                    });
                } else if (infoP2P.status.status === P2PRequestStatus.failed || infoP2P.status.status === P2PRequestStatus.rejected) {
                    await client.orders.update({
                        id: order.id,
                        _cancel: true,
                    }, DEFAULT_ORDER_PARAMS
                    ).then(async (orderUpdated) => {
                        console.info('p2p payment_done voids orderId: ' + order.id);
                        const voids = orderUpdated.voids?.at(0);
                        await client.voids.update({
                            id: voids?.id,
                            metadata: metadata
                        });
                        emails = true;
                    });
                }

                if (emails) {
                    console.info('p2p payment_done emails orderId: ' + order.id);
                    await sendEmails(order.id, false, infoP2P.status.status);
                }
            }
        }
    } catch (error) {
        console.error(error, req.query);
    }

    res.redirect(307, `/tienda-virtual/checkout/pse/purchase-order/?id=${orderId}`);
};

export default handler;
