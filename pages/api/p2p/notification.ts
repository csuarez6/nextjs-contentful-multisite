// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PaymentStatus } from "@/lib/enum/EPaymentStatus.enum";
import { DEFAULT_ORDER_PARAMS } from "@/lib/graphql/order.gql";
import { IP2PNotification, P2PRequestStatus } from "@/lib/interfaces/p2p-cf-interface";
import { getCLAdminCLient } from "@/lib/services/commerce-layer.service";
import { getOrderByAlly } from "@/lib/services/order-by-ally.service";
import { getP2PRequestInformation, validateP2PSignature } from "@/lib/services/place-to-pay.service";
import { sendAllyEmail, sendClientEmail, sendVantiEmail } from "@/lib/services/send-emails.service";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const client = await getCLAdminCLient();
    const data: IP2PNotification = req.body;
    const transactionToken = data.requestId;
    const validation = validateP2PSignature(data);
    let sendEmails = false;

    console.info('p2p notification', req.body);

    if (validation) {
      const paymentSource = await client.external_payments.list({
        filters: {
          payment_source_token_eq: transactionToken
        },
        include: ["order"],
      });
      if (!paymentSource.length) throw new Error("INVALID_TRANSACTION_TOKEN");
      const order = await client.orders.retrieve(paymentSource.at(0).order.id, DEFAULT_ORDER_PARAMS);
      if (!order) throw new Error("INVALID_ORDER");
      if (order.payment_status === PaymentStatus.paid || order.payment_status === PaymentStatus.voided) throw new Error("ORDER_ALREADY_CAPTURED_OR_VOIDED");
      const infoP2P = await getP2PRequestInformation(transactionToken);

      const metadata = {
        medium: 'payment_done',
        data: data,
        paymentInfo: infoP2P
      };

      if (data.status.status === P2PRequestStatus.approved) {
        await client.orders.update({
          id: order.id,
          _approve: true
        }).then(async () => {
          console.info('p2p notification approved');
          await client.orders.update({
            id: order.id,
            _capture: true
          }, DEFAULT_ORDER_PARAMS
          ).then(async (orderUpdated) => {
            console.info('p2p notification captured', orderUpdated);
            const captures = orderUpdated.captures.at(0);

            await client.captures.update({
              id: captures.id,
              metadata: metadata
            });
            sendEmails = true;
          });
        });
      } else if (data.status.status === P2PRequestStatus.failed || data.status.status === P2PRequestStatus.rejected) {
        await client.orders.update({
          id: order.id,
          _cancel: true,
        }, DEFAULT_ORDER_PARAMS
        ).then(async (orderUpdated) => {
          console.info('p2p notification voids', orderUpdated);
          const voids = orderUpdated.voids?.at(0);

          await client.voids.update({
            id: voids?.id,
            metadata: metadata
          });
          sendEmails = true;
        });
      }

      if (sendEmails) {
        console.info('p2p notification emails');
        const orderByAlly = (await getOrderByAlly(order.id)).data;
        await sendClientEmail(orderByAlly);
        if (data.status.status === P2PRequestStatus.approved) {
          await sendVantiEmail(orderByAlly);
          await sendAllyEmail(orderByAlly);
        }
      }
    }

    res.json({
      status: 200,
      message: validation
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: error.message || 'NOTIFICATION_PAYMENT_ERROR'
    });
  }
};

export default handler;
