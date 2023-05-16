import CommerceLayer from '@commercelayer/sdk';
import jwtDecode from "jwt-decode";
import Cookies from "js-cookie";
import { getCustomerToken, getIntegrationToken, getSalesChannelToken } from "@commercelayer/js-auth";

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
}

export interface JWTProps {
  organization: {
    slug: string
    id: string
  }
  application: {
    kind: string
  }
  owner?: {
    id?: string
    type?: string
  }
  test: boolean
}

export const CACHE_TOKENS = {
  MERCHANT_TOKEN: null,
  APP_TOKEN: null
};

export const getAppToken = async (): Promise<string> => {

  try {
    let token = Cookies.get("clIntegrationToken");

    if (!token) {
      const auth = await getIntegrationToken({
        endpoint: process.env.COMMERCELAYER_ENDPOINT,
        clientId: process.env.COMMERCELAYER_CLIENT_ID,
        clientSecret: process.env.COMMERCELAYER_CLIENT_SECRET,
      });
      token = auth.accessToken;
      Cookies.set("clIntegrationToken", token, {
        expires: auth.expires,
      });
    }

    return token;

  } catch (error) {
    throw new Error("UNABLE_GETTING_CL_TOKEN", { cause: error });
  }
};

export const getMerchantToken = async () => {
  try {
    if (CACHE_TOKENS.MERCHANT_TOKEN !== null && CACHE_TOKENS.MERCHANT_TOKEN) {
      return CACHE_TOKENS.MERCHANT_TOKEN;
    }

    let commercelayerScope = process.env.NEXT_PUBLIC_COMMERCELAYER_MARKET_SCOPE;
    if (commercelayerScope.indexOf('[') === 0) {
      commercelayerScope = JSON.parse(commercelayerScope);
    }

    const { accessToken } = await getSalesChannelToken({
      endpoint: process.env.NEXT_PUBLIC_COMMERCELAYER_ENDPOINT,
      clientId: process.env.NEXT_PUBLIC_COMMERCELAYER_CLIENT_ID,
      scope: commercelayerScope,
    });

    CACHE_TOKENS.MERCHANT_TOKEN = accessToken;
    return accessToken;
  } catch (error) {
    console.error('Error on «getMerchantToken»', error);
    return '';
  };
};

export const getCustomerTokenCl = async ({ email, password }) => {

  try {
    let commercelayerScope = process.env.NEXT_PUBLIC_COMMERCELAYER_MARKET_SCOPE;
    if (commercelayerScope.indexOf('[') === 0) {
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
        password
      }
    );

    return { status: 200, ...token.data };
  } catch (error) {
    console.error("Error - getCustomerTokenCl: ", error);
    return { status: 400, error: error.message };
  }
};

const getCommerlayerClient = async (accessToken: string) =>
  CommerceLayer({
    organization: "vanti-poc",
    accessToken,
  });

export const getCLAdminCLient = async () => {
  try {
    const accessToken = await getAppToken();

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
  notificate
}: ICustomer) => {
  try {
    const merchantToken = await getMerchantToken();
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
      }
    });
    return { status: 201, ...createCustomer }; // this will return the created resource object

  } catch (error) {
    console.error('Error - Customer Service: ', error);
    return { status: error.response.status };
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
      }
    });
    return { status: 200 };
  } catch (error) {
    console.error('Error customerUpdate: ', error);
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
    console.error('Error customerInfo: ', error);
    return { status: 401, error: error };
  }
};

/** Create a customer password reset */
export const createCustomerResetPwd = async (customerEmail: string) => {
  try {
    const cl = await getCLAdminCLient();
    const createCustomerRPwd = await cl.customer_password_resets.create({
      customer_email: customerEmail
    });
    return { status: 200, data: createCustomerRPwd };
  } catch (error) {
    console.error('Error Create Customer Reset: ', error);
    return { status: 401, error: error };
  }
};

/** Update a customer password reset */
export const updateCustomerResetPwd = async (tokenID: string, customerPWD: string, resetToken: string) => {
  try {
    const cl = await getCLAdminCLient();
    const updateCustomerRPwd = await cl.customer_password_resets.update({
      id: tokenID,
      customer_password: customerPWD,
      _reset_password_token: resetToken
    });
    return { status: 200, data: updateCustomerRPwd };
  } catch (error) {
    console.error('Error Update Customer Reset: ', error);
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
    const retrieveCustomerRPwd = await cl.customer_password_resets.retrieve(tokenID);

    const dateCreate = new Date(retrieveCustomerRPwd.created_at);
    const miliSecCreate = dateCreate.getTime();
    difHoursDates = miliSecCurrent - miliSecCreate;
    // const hours = difHoursDates / 3600000;
    const minutes = (difHoursDates / 1000) / 60;

    if (retrieveCustomerRPwd.reset_password_at == null && minutes <= 15) { //Token válido 15 min
      isTokenValid = true;
    } else {
      await deleteCustomerResetPwd(tokenID);
    }
    return { status: 200, isTokenValid, resetToken: retrieveCustomerRPwd.reset_password_token, tokenID };
  } catch (error) {
    console.error('Error Check Customer Token: ', error);
    return { status: 401, error: error };
  }
};

/** Delete a customer password reset */
export const deleteCustomerResetPwd = async (tokenID: string) => {
  try {
    const cl = await getCLAdminCLient();
    const deleteCustomerRPwd = await cl.customer_password_resets.delete(tokenID);

    return deleteCustomerRPwd;
  } catch (error) {
    console.error('Error Delete Customer Token: ', error);
    return { status: 401, error: error };
  }
};

export const getCommercelayerProduct = async (skuCode: string) => {
  let product = null;
  try {
    const token = await getMerchantToken();
    const client = await getCommerlayerClient(token);

    const sku = (
      await client.skus.list({
        filters: { code_eq: decodeURI(skuCode) },
        include: ['prices', 'stock_items'],
        fields: ['id', 'prices', 'stock_items'],
      })
    ).first();

    if (sku) {
      product = {
        price: sku?.prices[0]?.formatted_amount,
        priceBefore: sku?.prices[0]?.formatted_compare_at_amount,
        productsQuantity: sku?.stock_items[0]?.quantity,

        _price: sku?.prices[0]?.amount_float,
        _priceBefore: sku?.prices[0]?.compare_at_amount_float,
      };
    }
  } catch (error) {
    console.error('Error retrieving SKU: ', error);
  }

  return product;
};

export const updatePassWord = async (user: string, customerPWD: string, newPWD: string) => {
  try {
    const validPassword: any = await getCustomerTokenCl({ email: user, password: customerPWD });
    if (validPassword?.status === 200) {
      const { owner } = jwtDecode(validPassword.access_token) as JWTProps;
      const cl = await getCommerlayerClient(validPassword.access_token);
      const response = await cl.customers.update({
        id: owner.id,
        password: newPWD
      });
      if (response) return { status: 200, data: 'password is update' };
    }
    return { status: 401, data: 'password is invalid' };
  } catch (error) {
    console.error('Error updating password', error);
    return { status: 401, error: error };
  }
};

/** Get sku_options */
export const getSkuOptionsService = async (filter?: string) => {
  try {
    const cl = await getCLAdminCLient();
    const skuOptionList = await cl.sku_options.list({
      filters: {
        reference_eq: filter ?? "",
      }
    });

    return { status: 200, data: skuOptionList };
  } catch (error) {
    console.error('Error getSkuOptions: ', error);
    return { status: 401, error: error };
  }
};

/** Create adjustments */
export const createAdjustmentsService = async ({
  name,
  currency_code,
  amount_cents,
  type,
  sku_id,
  sku_code,
  sku_name,
  sku_option_id,
  sku_option_name
}: IAdjustments) => {
  try {
    const cl = await getCLAdminCLient();
    const adjustment = await cl.adjustments.create({
      name: name,
      currency_code: currency_code ?? "COP",
      amount_cents: parseInt(amount_cents),
      metadata: {
        type: type,
        sku_id: sku_id,
        sku_code: sku_code,
        sku_name: sku_name,
        sku_option_id: sku_option_id,
        sku_option_name: sku_option_name,
      }
    });

    return { status: 200, data: adjustment };
  } catch (error) {
    console.error('Error create-adjustments: ', error);
    return { status: 401, error: error };
  }
};