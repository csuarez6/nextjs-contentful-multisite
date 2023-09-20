import { ReactElement, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { defaultLayout } from "../../_app";
import CheckoutLayout from "@/components/templates/checkout/Layout";
import CheckoutContext from "@/context/Checkout";
import { useLastPath } from "@/hooks/utils/useLastPath";
import TextBox from "@/components/atoms/input/textbox/TextBox";
import HeadingCard from "@/components/organisms/cards/heading-card/HeadingCard";
import { GetStaticPaths, GetStaticProps } from "next";
import { getHeader, getNavigation } from "@/lib/services/menu-content.service";
import {
  DEFAULT_FOOTER_ID,
  DEFAULT_HEADER_ID,
  DEFAULT_HELP_BUTTON_ID,
} from "@/constants/contentful-ids.constants";
import { PSE_STEPS_TO_VERIFY } from "@/constants/checkout.constants";
import Spinner from "@/components/atoms/spinner/Spinner";
import { gaEventPaymentInfo } from "@/utils/ga-events--checkout";
import SelectAtom from "@/components/atoms/select-atom/SelectAtom";
import { IdentificationTypes } from "@/lib/enum/EIdentificationTypes.enum";

interface ICustomer {
  name: string;
  lastName: string;
  cellPhone: number;
  email: string;
  documentType: string;
  documentNumber: string;
}

const schema = yup.object({
  name: yup.string().required("Dato Requerido"),
  lastName: yup.string().required("Dato Requerido"),
  cellPhone: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable()
    .required("Dato Requerido"),
  email: yup.string().email("Email no válido").required("Dato Requerido"),
  documentType: yup.string().required("Dato Requerido"),
  documentNumber: yup
    .number()
    .required("Dato Requerido")
    .nullable()
    .transform((value) => (isNaN(value) ? undefined : value))
    .positive("Solo números positivos"),
});

const CheckoutPersonalInfo = () => {
  const router = useRouter();
  const lastPath = useLastPath();

  const { order, flow, addCustomer } = useContext(CheckoutContext);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm<ICustomer>({
    resolver: yupResolver(schema),
  });

  const isCompleted = useMemo(
    () =>
      order &&
      PSE_STEPS_TO_VERIFY.map((step) => !!order.metadata?.[step]).every(
        (i) => i
      ),
    [order]
  );

  const selectOptions = [
    {
      text: "Seleccione un tipo de documento",
      value: "",
    },
    ...Object.keys(IdentificationTypes).map((key) => ({
      text: IdentificationTypes[key as keyof typeof IdentificationTypes],
      value: key,
    }))
  ];

  useEffect(() => {
    reset({
      email: order?.customer_email ?? "",
      name: order?.metadata?.name ?? "",
      lastName: order?.metadata?.lastName ?? "",
      cellPhone: order?.metadata?.cellPhone ?? "",
      documentNumber: order?.metadata?.documentNumber ?? "",
      documentType: order?.metadata?.documentType ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  const onSubmit = async (data: ICustomer) => {
    gaEventPaymentInfo(order?.line_items);

    try {
      setIsLoading(true);
      await addCustomer(data);
      await handleNext();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    await router.push(
      `/checkout/${router.query.paymentType}/${flow.getNextStep(lastPath)}`
    );
  };

  const handlePrev = async () => {
    setIsLoading(true);
    await router.push(
      `/checkout/${router.query.paymentType}/${flow.getPrevStep(lastPath)}`
    );
  };

  useEffect(() => {
    // subscribe to routeChangeStart event
    const onRouteChangeStart = () => setIsLoading(true);
    router.events.on('routeChangeStart', onRouteChangeStart);

    // unsubscribe on component destroy in useEffect return function
    return () => {
      router.events.off('routeChangeStart', onRouteChangeStart);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAllAlphaNumeric = (e) => {
    const letters = /^[ a-zA-ZñÑáéíóúÁÉÍÓÚ]+$/;
    if (!e.key.match(letters)) e.preventDefault();
  };

  return (
    <HeadingCard
      classes="col-span-2"
      title="2. Ingresar datos personales"
      icon="location"
      isCheck={isCompleted}
    >
      <div className="bg-white rounded-lg">
        <form
          className="flex flex-wrap max-w-full gap-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="w-full">
            <TextBox
              id="name"
              className="algo"
              label="Escribe tu nombre"
              placeholder="Nombre"
              isRequired={true}
              onKeyPress={(e) => checkAllAlphaNumeric(e)}
              {...register("name")}
            />
            {errors.name?.message && (
              <p className="mt-1 text-red-600">{errors.name?.message}</p>
            )}
          </div>
          <div className="w-full">
            <TextBox
              id="lastName"
              name="lastName"
              label="Escribe tu apellido"
              placeholder="Apellido"
              isRequired={true}
              onKeyPress={(e) => checkAllAlphaNumeric(e)}
              {...register("lastName")}
            />
            {errors.lastName?.message && (
              <p className="mt-1 text-red-600">{errors.lastName?.message}</p>
            )}
          </div>
          <div className="w-full">
            <TextBox
              id="cellPhone"
              type="number"
              name="cellPhone"
              label="Escribe tu número de celular"
              placeholder="000 000 0000"
              isRequired={true}
              {...register("cellPhone")}
            />
            {errors.cellPhone?.message && (
              <p className="mt-1 text-red-600">{errors.cellPhone?.message}</p>
            )}
          </div>
          <div className="w-full">
            <TextBox
              id="email"
              type="email"
              name="email"
              label="Escribe tu email"
              placeholder="Email"
              isRequired={true}
              {...register("email")}
            />
            {errors.email?.message && (
              <p className="mt-1 text-red-600">{errors.email?.message}</p>
            )}
          </div>
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            <div className="w-full">
              <SelectAtom
                id='documentType'
                labelSelect='Tipo de documento'
                listedContents={selectOptions}
                isRequired={true}
                currentValue={getValues("documentType")}
                handleChange={(value) => {
                  setValue("documentType", value);
                  clearErrors('documentType');
                }}
                {...register('documentType')}
              />
              {errors.documentType?.message && (
                <p className="mt-1 text-red-600">
                  {errors.documentType?.message}
                </p>
              )}
            </div>
            <div className="w-full">
              <TextBox
                id="documentNumber"
                type="text"
                label="Número de documento"
                className="form-input"
                autoComplete="on"
                {...register("documentNumber")}
                isRequired={true}
              />
              {errors.documentNumber?.message && (
                <p className="mt-1 text-red-600">
                  {errors.documentNumber?.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end w-full gap-3">
            <button
              className="relative button button-outline"
              type="button"
              onClick={handlePrev}
              disabled={isLoading}
            >
              Volver
            </button>
            <button className="relative button button-primary" type="submit" disabled={isLoading}>
              Continuar
            </button>
          </div>
        </form>
        {isLoading && <Spinner position="absolute" size="large" />}
      </div>
    </HeadingCard>
  );
};

export const getStaticPaths: GetStaticPaths = () => {
  const paths = [];
  return { paths, fallback: "blocking" };
};

export const revalidate = 60;

export const getStaticProps: GetStaticProps = async (context) => {
  const headerInfo = await getHeader(DEFAULT_HEADER_ID, context.preview ?? false);
  const footerInfo = await getNavigation(DEFAULT_FOOTER_ID, context.preview ?? false);
  const helpButton = await getNavigation(DEFAULT_HELP_BUTTON_ID, context.preview ?? false);

  return {
    props: {
      layout: {
        name: "Informacion personal de la orden",
        footerInfo,
        headerInfo,
        helpButton,
      },
    },
    revalidate,
  };
};

CheckoutPersonalInfo.getLayout = (page: ReactElement, pageProps: any) => {
  return defaultLayout(<CheckoutLayout>{page}</CheckoutLayout>, pageProps);
};

export default CheckoutPersonalInfo;
