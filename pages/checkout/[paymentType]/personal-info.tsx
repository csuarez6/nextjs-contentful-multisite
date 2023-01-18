import { ReactElement, useContext, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { defaultLayout } from "../../_app";
import CheckoutLayout from "@/components/templates/checkout/Layout";
import CheckoutContext from "src/context/Checkout";
import { useLastPath } from "src/hooks/utils/useLastPath";
import { mockPageLayoutProps } from "@/components/layouts/page-layout/PageLayout.mocks";
import TextBox from "@/components/atoms/input/textbox/TextBox";
import HeadingCard from "@/components/organisms/cards/heading-card/HeadingCard";

interface ICustomer {
  firstName: string;
  lastName: string;
  cellPhone: number;
  email: string;
}

const schema = yup.object({
  firstName: yup.string().required("Dato Requerido"),
  lastName: yup.string().required("Dato Requerido"),
  cellPhone: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable()
    .required("Dato Requerido"),
  email: yup.string().email("Email no válido").required("Dato Requerido"),
});

const STEP_META_FIELD = "hasPesonalInfo";

const CheckoutPersonalInfo = () => {
  const router = useRouter();
  const lastPath = useLastPath();

  const { order, flow, addCustomer } = useContext(CheckoutContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ICustomer>({
    resolver: yupResolver(schema),
  });

  const isCompleted = useMemo(
    () => !!order?.metadata?.[STEP_META_FIELD],
    [order]
  );

  useEffect(() => {
    if (!isCompleted) return;

    const { firstName, lastName, cellPhone } = order.metadata;

    reset({
      email: order.customer_email,
      firstName,
      lastName,
      cellPhone,
    });
  }, [isCompleted, order, reset]);

  const onSubmit = async (data: ICustomer) => {
    try {
      await addCustomer(data);
      await handleNext();

    } catch (error) {
      alert(error.message);
    }
  };

  const handleNext = async () => {
    router.push(
      `/checkout/${router.query.paymentType}/${flow.getNextStep(lastPath)}`
    );
  };

  const handlePrev = async () => {
    router.push(
      `/checkout/${router.query.paymentType}/${flow.getPrevStep(lastPath)}`
    );
  };

  return (
    <>
      <HeadingCard
        classes="col-span-2"
        title="2. Ingresar datos personales"
        icon="location"
        isCheck={isCompleted}
      >
        <div className="bg-white rounded-lg">
          <form className="max-w-full flex flex-wrap gap-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="w-full">
              <TextBox
                id="firstName"
                name="firstName"
                className="algo"
                label="Escribe tu apellido"
                placeholder="Nombre"
                htmlForLabel="firstName"
                {...register("firstName")}
              />
              {
                errors.firstName?.message && <p className="text-red-600 mt-1">{errors.firstName?.message}</p>
              }
            </div>
            <div className="w-full">
              <TextBox
                id="lastName"
                name="lastName"
                htmlForLabel="lastName"
                label="Escribe tu apellido"
                placeholder="Apellido"
                {...register("lastName")}
              />
              {
                errors.lastName?.message && <p className="text-red-600 mt-1">{errors.lastName?.message}</p>
              }
            </div>
            <div className="w-full">
              <TextBox
                id="cellPhone"
                type="number"
                name="cellPhone"
                label="Escribe tu numero de celular"
                placeholder="000 000 0000"
                htmlForLabel="cellPhone"
                {...register("cellPhone")}
              />
              {
                errors.cellPhone?.message && <p className="text-red-600 mt-1">{errors.cellPhone?.message}</p>
              }
            </div>
            <div className="w-full">
              <TextBox
                id="email"
                type="email"
                name="email"
                label="Escribe tu email"
                placeholder="Email"
                htmlForLabel="email"
                {...register("email")}
              />
              {
                errors.email?.message && <p className="text-red-600 mt-1">{errors.email?.message}</p>
              }
            </div>
            <div className="flex justify-end gap-3 w-full">
              <button className="button button-outline" type="button" onClick={handlePrev}>
                Volver
              </button>
              <button className="button button-primary" type="submit">Continuar</button>
            </div>
          </form>
        </div>
      </HeadingCard>
    </>
  );
};

CheckoutPersonalInfo.getInitialProps = () => {
  return {
    layout: {
      name: mockPageLayoutProps.data.name,
      footerInfo: mockPageLayoutProps.data.layout.footerInfo,
      headerInfo: mockPageLayoutProps.data.layout.headerInfo,
    },
  };
};

CheckoutPersonalInfo.getLayout = (page: ReactElement, pageProps: any) => {
  return defaultLayout(<CheckoutLayout>{page}</CheckoutLayout>, pageProps);
};

export default CheckoutPersonalInfo;
