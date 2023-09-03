import type { NextApiRequest, NextApiResponse } from "next";
import { getCLAdminCLient } from "@/lib/services/commerce-layer.service";
import { getOrderByAlly } from '@/lib/services/order-by-ally.service';
import { sendAllyEmail, sendClientEmail, sendVantiEmail } from "@/lib/services/send-emails.service";
import { IAllyResponse } from "@/lib/interfaces/ally-collection.interface";
import { OrderStatus } from "@/lib/enum/EOrderStatus.enum";

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const client = await getCLAdminCLient();
    const authorizations = await client.authorizations.list({
      filters: {
        token_eq: <string>req.query.token,
      },
      include: ["order"],
    });

    if (!authorizations.length) throw new Error("INVALID_TRANSACTION");

    const authorization = authorizations.at(0);

    await client.orders.update({
      id: authorization.order.id,
      _approve: true,
    });

    await client.authorizations.update({
      id: authorization.id,
      _capture: true,
    });

    const orderByAlly: IAllyResponse = await getOrderByAlly(authorization.order.id);
    if (orderByAlly.status === 200) {
      await sendClientEmail(orderByAlly.data);

      if (orderByAlly.data?.status === OrderStatus.approved) {
        await sendVantiEmail(orderByAlly.data);
        await sendAllyEmail(orderByAlly.data);
      }
    }

    res.json({
      success: true,
      data: {
        transaction_token: authorization.token,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message || 'CAPTURE_PAYMENT_ERROR',
    });
  }
};

export default handler;
