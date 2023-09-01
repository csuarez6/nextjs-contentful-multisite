import CommerceLayer, { CommerceLayerClient, ExternalPayment, LineItem, Market, Order, QueryParamsRetrieve } from '@commercelayer/sdk';
import jwtDecode from "jwt-decode";
import {
  getCustomerToken,
  getIntegrationToken,
  getSalesChannelToken,
} from "@commercelayer/js-auth";
import { PRICE_VALIDATION_ID, STOCK_VALIDATION_ID } from '@/constants/checkout.constants';
import { ExternalPayments } from '@commercelayer/sdk/lib/cjs/api';

export interface ICustomer {
  name: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  cellPhone: string;
  password: string;
  confirmPassword?: string;
  contractNumber: string;
  authorize: boolean;
  notificate: boolean;
  tokenReCaptcha?: string;
}

export interface IAdjustments {
  name?: string;
  currency_code?: string;
  amount_cents?: string;
  type?: string;
  sku_id?: string;
  sku_code?: string;
  sku_name?: string;
  sku_option_id?: string;
  sku_option_name?: string;
  categoryReference?: string;
}

export interface JWTProps {
  organization: {
    slug: string;
    id: string;
  };
  application: {
    kind: string;
  };
  owner?: {
    id?: string;
    type?: string;
  };
  test: boolean;
}

export const CACHE_TOKENS = {
  MERCHANT_TOKEN: null,
  APP_TOKEN: null,
};

/* For full integration permissions (2 hours) */
export const getIntegrationAppToken = async (): Promise<string> => {
  try {
    if (CACHE_TOKENS.APP_TOKEN) return CACHE_TOKENS.APP_TOKEN;

    const {
      accessToken,
      data: { expires_in },
    } = await getIntegrationToken({
      endpoint: process.env.COMMERCELAYER_ENDPOINT,
      clientId: process.env.COMMERCELAYER_CLIENT_ID,
      clientSecret: process.env.COMMERCELAYER_CLIENT_SECRET,
    });

    CACHE_TOKENS.APP_TOKEN = accessToken;

    setTimeout(() => {
      CACHE_TOKENS.APP_TOKEN = null;
    }, 1000 * parseInt(expires_in));
    return accessToken;
  } catch (error) {
    throw new Error("UNABLE_GETTING_CL_TOKEN", { cause: error });
  }
};

/* For CRUD in the order, items and similars (4 hours) */
export const getMerchantToken = async (cache = true) => {
  try {
    if (CACHE_TOKENS.MERCHANT_TOKEN !== null && CACHE_TOKENS.MERCHANT_TOKEN && cache)
      return CACHE_TOKENS.MERCHANT_TOKEN;

    let commercelayerScope = process.env.NEXT_PUBLIC_COMMERCELAYER_MARKET_SCOPE;
    if (commercelayerScope.indexOf("[") === 0)
      commercelayerScope = JSON.parse(commercelayerScope);

    const {
      accessToken,
      data: { expires_in },
    } = await getSalesChannelToken({
      endpoint: process.env.NEXT_PUBLIC_COMMERCELAYER_ENDPOINT,
      clientId: process.env.NEXT_PUBLIC_COMMERCELAYER_CLIENT_ID,
      scope: commercelayerScope,
    });
    if (cache) {
      CACHE_TOKENS.MERCHANT_TOKEN = accessToken;
      setTimeout(() => {
        CACHE_TOKENS.MERCHANT_TOKEN = null;
      }, 1000 * parseInt(expires_in));
    }
    return accessToken;
  } catch (error) {
    console.error("Error on «getMerchantToken»", error);
    return {
      error: true,
      data: error,
      message: "Error on «getMerchantToken»"
    };
  }
};

/* For specific user (10 min)  */
export const getCustomerTokenCl = async ({ email, password }) => {
  try {
    let commercelayerScope = process.env.NEXT_PUBLIC_COMMERCELAYER_MARKET_SCOPE;
    if (commercelayerScope.indexOf("[") === 0) {
      commercelayerScope = JSON.parse(commercelayerScope);
    }

    const token = await getCustomerToken(
      {
        endpoint: process.env.NEXT_PUBLIC_COMMERCELAYER_ENDPOINT,
        clientId: process.env.NEXT_PUBLIC_COMMERCELAYER_CLIENT_ID,
        scope: commercelayerScope,
      },
      {
        username: email,
        password,
      }
    );

    return { status: 200, ...token.data };
  } catch (error) {
    console.error("Error - getCustomerTokenCl: ", error);
    return { status: 400, error: error.message };
  }
};

const getCommerlayerClient = async (accessToken: string) => (
  CommerceLayer({
    organization: "vanti-poc",
    accessToken,
  })
);

export const getCLAdminCLient = async () => {
  try {
    const accessToken = await getIntegrationAppToken();

    return getCommerlayerClient(accessToken);
  } catch (error) {
    throw new Error("UNABLE_GETTING_CL_CLIENT", { cause: error });
  }
};

/** Create customer */
export const createCustomer = async ({
  email,
  password,
  name,
  lastName,
  documentType,
  documentNumber,
  cellPhone,
  contractNumber,
  authorize,
  notificate,
}: ICustomer) => {
  try {
    const merchantToken = await getMerchantToken();
    if (merchantToken.error) {
      return {
        status: 400,
        error: merchantToken.data,
        message: merchantToken.message
      };
    }
    const cl = await getCommerlayerClient(merchantToken);

    const createCustomer = await cl.customers.create({
      email: email,
      password: password,
      metadata: {
        name: name,
        lastName: lastName,
        documentType: documentType,
        documentNumber: documentNumber,
        cellPhone: cellPhone,
        contractNumber: contractNumber,
        privacyPolicy: authorize,
        notifications: notificate,
      },
    });
    return { status: 201, ...createCustomer }; // this will return the created resource object
  } catch (error) {
    console.error("Error - Customer Service: ", error);
    return { status: error.status, error };
  }
};

/** Update customer metadata */
export const updateCustomerMetadata = async ({
  accessToken,
  name,
  lastName,
  documentType,
  documentNumber,
  cellPhone,
  contractNumber,
}) => {
  try {
    const cl = await getCommerlayerClient(accessToken);
    const { owner } = jwtDecode(accessToken) as JWTProps;
    const customerID = owner?.id;
    await cl.customers.update({
      id: customerID,
      metadata: {
        name: name,
        lastName: lastName,
        documentType: documentType,
        documentNumber: documentNumber,
        cellPhone: cellPhone,
        contractNumber: contractNumber,
      },
    });
    return { status: 200 };
  } catch (error) {
    console.error("Error customerUpdate: ", error);
    return { status: 401, error: error };
  }
};

/** get customer data */
export const getCustomerInfo = async (accessToken: string) => {
  try {
    const cl = await getCommerlayerClient(accessToken);
    const { owner } = jwtDecode(accessToken) as JWTProps;
    const customerID = owner?.id;
    const customerInfo = await cl.customers.retrieve(customerID);
    return { status: 200, data: customerInfo };
  } catch (error) {
    console.error("Error customerInfo: ", error);
    return { status: 401, error: error };
  }
};

/** Create a customer password reset */
export const createCustomerResetPwd = async (customerEmail: string) => {
  try {
    const cl = await getCLAdminCLient();
    const createCustomerRPwd = await cl.customer_password_resets.create({
      customer_email: customerEmail,
    });
    return { status: 200, data: createCustomerRPwd };
  } catch (error) {
    console.error("Error Create Customer Reset: ", error);
    return { status: 401, error: error };
  }
};

/** Update a customer password reset */
export const updateCustomerResetPwd = async (
  tokenID: string,
  customerPWD: string,
  resetToken: string
) => {
  try {
    const cl = await getCLAdminCLient();
    const updateCustomerRPwd = await cl.customer_password_resets.update({
      id: tokenID,
      customer_password: customerPWD,
      _reset_password_token: resetToken,
    });
    return { status: 200, data: updateCustomerRPwd };
  } catch (error) {
    console.error("Error Update Customer Reset: ", error);
    return { status: 401, error: error };
  }
};

/** Retrieve a customer password reset */
export const retrieveCustomerResetPwd = async (tokenID: string) => {
  try {
    let isTokenValid = false;
    const dateCurrent = new Date();
    const miliSecCurrent = dateCurrent.getTime();
    let difHoursDates = null;

    const cl = await getCLAdminCLient();
    const retrieveCustomerRPwd = await cl.customer_password_resets.retrieve(
      tokenID
    );

    const dateCreate = new Date(retrieveCustomerRPwd.created_at);
    const miliSecCreate = dateCreate.getTime();
    difHoursDates = miliSecCurrent - miliSecCreate;
    // const hours = difHoursDates / 3600000;
    const minutes = difHoursDates / 1000 / 60;

    if (retrieveCustomerRPwd.reset_password_at == null && minutes <= 15) {
      //Token válido 15 min
      isTokenValid = true;
    } else {
      await deleteCustomerResetPwd(tokenID);
    }
    return {
      status: 200,
      isTokenValid,
      resetToken: retrieveCustomerRPwd.reset_password_token,
      tokenID,
    };
  } catch (error) {
    console.error("Error Check Customer Token: ", error);
    return { status: 401, error: error };
  }
};

/** Delete a customer password reset */
export const deleteCustomerResetPwd = async (tokenID: string) => {
  try {
    const cl = await getCLAdminCLient();
    const deleteCustomerRPwd = await cl.customer_password_resets.delete(
      tokenID
    );

    return deleteCustomerRPwd;
  } catch (error) {
    console.error("Error Delete Customer Token: ", error);
    return { status: 401, error: error };
  }
};

export const getCommercelayerProduct = async (skuCode: string) => {
  let product = null;
  try {
    const clientGasodomesticos = await getCLAdminCLient();

    const sku = (
      await clientGasodomesticos.skus.list({
        filters: { code_eq: decodeURI(skuCode) },
        include: [
          "prices",
          "stock_items",
          "prices.price_list",
          "stock_items.stock_location",
          "stock_items.stock_reservations"
        ],
        fields: ["id", "prices", "stock_items"],
      })
    ).first();

    let reservation = 0;
    reservation = sku?.stock_items?.find(
      (p) => p.stock_location.reference === "gasodomesticos"
    )?.['stock_reservations']?.reduce((sum, obj) => sum + obj.quantity, 0) ?? 0;

    if (sku) {
      product = {
        priceGasodomestico:
          sku?.prices?.find((p) => p.price_list.reference === "gasodomesticos")
            ?.formatted_amount ?? null,
        priceBeforeGasodomestico:
          sku?.prices?.find((p) => p.price_list.reference === "gasodomesticos")
            ?.formatted_compare_at_amount ?? null,
        priceVantiListo:
          sku?.prices?.find((p) => p.price_list.reference === "vantiListo")
            ?.formatted_amount ?? null,
        priceBeforeVantiListo:
          sku?.prices?.find((p) => p.price_list.reference === "vantiListo")
            ?.formatted_compare_at_amount ?? null,

        _priceGasodomestico:
          sku?.prices?.find((p) => p.price_list.reference === "gasodomesticos")
            ?.amount_float ?? null,
        _priceBeforeGasodomestico:
          sku?.prices?.find((p) => p.price_list.reference === "gasodomesticos")
            ?.compare_at_amount_float ?? null,
        _priceVantiListo:
          sku?.prices?.find((p) => p.price_list.reference === "vantiListo")
            ?.amount_float ?? null,
        _priceBeforeVantiListo:
          sku?.prices?.find((p) => p.price_list.reference === "vantiListo")
            ?.compare_at_amount_float ?? null,

        productsQuantityGasodomestico:
          Number(sku?.stock_items?.find(
            (p) => p.stock_location.reference === "gasodomesticos"
          )?.quantity) - reservation ?? 0,
        productsQuantityVantiListo:
          sku?.stock_items?.find(
            (p) => p.stock_location.reference === "vantiListo"
          )?.quantity ?? 0,
      };
    }
  } catch (error) {
    console.error("Error retrieving SKU: ", error);
    throw new Error(error);
  }

  return product;
};

export const getCommercelayerProductPrice = async (skuCode: string, market: Market) => {
  let prices = null;
  try {
    const clientGasodomesticos = await getCLAdminCLient();

    const sku = (
      await clientGasodomesticos.skus.list({
        filters: { code_eq: decodeURI(skuCode) },
        include: [
          "prices",
          "prices.price_list"
        ],
        fields: {
          skus: ["id", "prices"],
          prices: ["formatted_compare_at_amount", "price_list"]
        }

      })
    ).first();

    prices = sku.prices.find((price) => {
      return price.price_list?.name === market.price_list.name;
    });

  } catch (error) {
    console.error("Error retrieving SKU: ", error);
  }

  return prices;
};

export const updatePassWord = async (
  user: string,
  customerPWD: string,
  newPWD: string
) => {
  try {
    const validPassword: any = await getCustomerTokenCl({
      email: user,
      password: customerPWD,
    });
    if (validPassword?.status === 200) {
      const { owner } = jwtDecode(validPassword.access_token) as JWTProps;
      const cl = await getCommerlayerClient(validPassword.access_token);
      const response = await cl.customers.update({
        id: owner.id,
        password: newPWD,
      });
      if (response) return { status: 200, data: "password is update" };
    }
    return { status: 401, data: "password is invalid" };
  } catch (error) {
    console.error("Error updating password", error);
    return { status: 401, error: error };
  }
};

export const getReformatedOrder = (order: Order) => {
  const adjustmentsList = (order.line_items).filter(item => item.item_type === "adjustments");
  const productsList = (order.line_items)
    .filter(item => item.item_type === "skus")
    .map((item) => {
      const installAdjItem = (adjustmentsList).filter(adjItem => adjItem.item.metadata.sku_id === item.id && adjItem.item.metadata.type === "installation");
      const warrantyAdjItem = (adjustmentsList).filter(adjItem => adjItem.item.metadata.sku_id === item.id && adjItem.item.metadata.type === "warranty");
      item["installlation_service"] = installAdjItem;
      item["warranty_service"] = warrantyAdjItem;
      return item;
    });
  order.line_items = productsList;
  return order;
};

/** updateOrderAdminService */
export const updateOrderAdminService = async (idOrder?: string, defaultOrderParams?: QueryParamsRetrieve, checkUpdates?: boolean) => {
  try {
    const productUpdates = [];
    const response = { status: 200 };

    const client = await getCLAdminCLient();
    const formatedOrder = getReformatedOrder(await client.orders.retrieve(idOrder, defaultOrderParams));

    if (checkUpdates) {
      await Promise.all(formatedOrder.line_items.map(async (line_item: LineItem) => {
        try {
          const productCL = await getCommercelayerProduct(line_item.sku_code);
          if (productCL?.priceGasodomestico !== line_item.formatted_unit_amount) {
            await deleteLineItem(client, line_item);
            productUpdates.push({
              id: line_item.id,
              sku_code: line_item.sku_code,
              name: line_item.name,
              type: PRICE_VALIDATION_ID
            });
          } else if (productCL.productsQuantityGasodomestico < line_item.quantity) {
            await deleteLineItem(client, line_item);
            productUpdates.push({
              id: line_item.id,
              sku_code: line_item.sku_code,
              name: line_item.name,
              type: STOCK_VALIDATION_ID
            });
          }
        } catch (err) {
          console.error("General error in the checkUpdates section:", err, "line-item:", line_item);
        }

      }));
    }

    response["productUpdates"] = productUpdates;
    response["data"] = productUpdates.length > 0 ? getReformatedOrder(await client.orders.retrieve(idOrder, defaultOrderParams)) : formatedOrder;

    return response;
  } catch (error) {
    console.error("Error updateOrderAdminService: ", error);
    return { status: 401, error: error };
  }
};

export const deleteLineItem = async (client: CommerceLayerClient, line_item: LineItem) => {
  await client.line_items.delete(line_item.id).catch(err => { console.error("Error deleting the main line item in updateOrderAdminService:", err.errors); });

  if (line_item["installlation_service"] && line_item["installlation_service"].length > 0) {
    await client.line_items.delete(line_item["installlation_service"][0].id).catch(err => { console.error("Error deleting the instalation service in updateOrderAdminService:", err.errors); });
  }

  if (line_item["warranty_service"] && line_item["warranty_service"].length > 0) {
    await client.line_items.delete(line_item["warranty_service"][0].id).catch(err => { console.error("Error deleting the warranty service in updateOrderAdminService:", err.errors); });
  }
};

/** Get sku_options */
export const getSkuOptionsService = async (filter?: string) => {
  try {
    const cl = await getCLAdminCLient();
    const skuOptionList = await cl.sku_options.list({
      filters: {
        reference_eq: filter ?? "",
      },
      pageSize: 25, // The maximum page size allowed is 25 - Commercelayer
    });

    return { status: 200, data: skuOptionList };
  } catch (error) {
    console.error("Error getSkuOptions: ", error);
    return { status: 401, error: error };
  }
};

/*** Create adjustments */
export const createAdjustmentsService = async ({
  name,
  currency_code,
  amount_cents,
  type,
  sku_id,
  sku_code,
  sku_name,
  sku_option_id,
  sku_option_name,
  categoryReference,
}: IAdjustments) => {
  try {
    const cl = await getCLAdminCLient();
    const amount_centsFloat = (parseFloat(amount_cents).toFixed(2)).replace(".", "");
    const adjustment = await cl.adjustments.create({
      name: name,
      currency_code: currency_code ?? "COP",
      amount_cents: parseInt(amount_centsFloat),
      metadata: {
        type: type,
        sku_id: sku_id,
        sku_code: sku_code,
        sku_name: sku_name,
        sku_option_id: sku_option_id,
        sku_option_name: sku_option_name,
        categoryReference: categoryReference,
      },
    });

    return { status: 200, data: adjustment };
  } catch (error) {
    console.error("Error create-adjustments: ", error);
    return { status: 401, error: error };
  }
};

/*** Create service - Aditional */
export const createServiceAditional = async (
  adjustment: IAdjustments,
  idOrder: string,
  quantity: string
) => {
  try {
    const respAdj = await createAdjustmentsService(adjustment);
    const cl = await getCLAdminCLient();
    if (respAdj) {
      const Aditional = await cl.line_items.create({
        quantity: parseInt(quantity),
        order: {
          id: idOrder,
          type: "orders",
        },
        item: {
          id: respAdj.data.id,
          type: "adjustments",
        },
      });
      return { status: 200, data: Aditional };
    }
    return { status: 200, data: null };
  } catch (error) {
    console.error("Error create-adjustments: ", error);
    return { status: 401, error: error };
  }
};

/*** Get orders status on commercelayer  ***/
export const getOrderStatusCl = async (status?: string) => {
  try {
    const cl = await getCLAdminCLient();
    const orderList = await cl.orders.list({
      filters: { status_eq: status ?? "placed" },
      sort: { created_at: "desc" },
      pageSize: 25, // The maximum page size allowed is 25 - Commercelayer
    });
    return { status: 200, data: orderList };
  } catch (error) {
    console.error("Error getOrderStatusCl: ", error);
    return { status: 401, error: error };
  }
};

/*** Get orders by ID on commercelayer  ***/
export const getOrderByIdCl = async (orderId?: string) => {
  try {
    const cl = await getCLAdminCLient();
    const orderInfo = await cl.orders.retrieve(orderId);
    return { status: 200, data: orderInfo };
  } catch (error) {
    console.error("Error getOrderByIdCl: ", error);
    return { status: 401, error: error };
  }
};

// Función para obtener los nombres de los items de una orden en formato "(cantidad) nombreItem"
export const getNameQuantityOrderItems = (order: Order): string => {
  try {
    let itemNames = '';
    order.line_items?.forEach(item => {
      if (item.item_type === 'skus') {
        if (itemNames !== '') {
          itemNames += ', ';
        }
        itemNames += `${itemNames !== '' ? ',' : ''} (${item.quantity}) ${item.name}`;
      }
    });
    return itemNames;
  } catch (error) {
    console.error("Error getNameQuantityOrderItems", error);
    return '';
  }
};

// Función para validar si un pago es de tipo ExternalPayment
export const isExternalPayment = (paymentSource: any): paymentSource is ExternalPayment => {
  return paymentSource.type === ExternalPayments.TYPE;
};

// Función para formatear una fecha a zona horaria Colombia y formato "día/mes/año hora:minutos:segundos am/pm"
export const formatDate = (date: string) : string => {
  const formattedDate = new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).format(new Date(date));

  return formattedDate;
};