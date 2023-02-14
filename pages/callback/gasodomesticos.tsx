import { GetStaticProps } from "next";
import { DEFAULT_FOOTER_ID, DEFAULT_HEADER_ID } from "@/constants/contentful-ids.constants";
import { getMenu } from "@/lib/services/menu-content.service";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import HeadingCard from '@/components/organisms/cards/heading-card/HeadingCard';
import TextBox from '@/components/atoms/input/textbox/TextBox';
import CheckBox from "@/components/atoms/input/checkbox/CheckBox";

import React, { useState, createRef, LegacyRef, useEffect } from 'react';
import { useLastPath } from "@/hooks/utils/useLastPath";
import CustomModal from "@/components/organisms/custom-modal/CustomModal";
import Image from "next/image";

const modalBody = (isSuccess, errorMessage, closeModal, productData) => {
  return (
    <>
      {errorMessage && (
        <div className="mt-2">
          <p>{errorMessage}</p>
        </div>
      )}
      {!errorMessage && (
        <div className="mt-2 grid gap-9">
          {isSuccess
            ? (
              <p className="lg:text-size-p1 text-grey-30">
                En unos minutos te estaremos contactando al número que nos proporcionaste.
                <br /><br />
                Si quieres añadir más productos y servicios a tu compra, puedes pedirlo a nuestros asesores
              </p>
            )
            : (
              <p className="lg:text-size-p1 text-grey-30">
                Si tienes alguna inquietud o petición sobre tu afiliación, escribenos al correo: xxx@grupovanti.com, o comunicate a nuestra línea de WhatsApp 15 416 4164 opción 2 -1.
              </p>
            )
          }
        </div>
      )}

      <div className="mt-4 text-right">
        {isSuccess && (
          <a href={productData?.urlProduct}  className="button button-primary">
            Aceptar
          </a>
        )}
        {!isSuccess && (
          <button type="button" className="button button-primary" onClick={closeModal}>
            Aceptar
          </button>
        )}
      </div>
    </>
  );
};

interface IForm {
  cellPhone: string;
  agreeHD: boolean;
}

const regexCellPhone = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/;
const schema = yup.object({
  cellPhone: yup.string().required("Dato requerido").matches(regexCellPhone, {
    message: "Formatos validos: ### ### #### / (###) ### #### / +## ###-###-#### / +## (###)-###-####"
  }),
  agreeHD: yup.bool().oneOf([true], "Dato requerido")
});

const CallbackPage = () => {
  const refForm: LegacyRef<HTMLFormElement> = createRef();
  const lastPath = useLastPath();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm<IForm>({
    resolver: yupResolver(schema),
  });

  const [isOpen, setIsOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sku, setSku] = useState(null);
  const [isFetchingSKU, setIsFetchingSKU] = useState(true);
  const [productData, setProductData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);

  const getSKU = () => {
    const params = new URLSearchParams(location.search);
    const _SKU = params.get("sku");
    setSku(_SKU);
    setIsFetchingSKU(false);
    if (!_SKU) setIsLoading(false);
  };

  useEffect(() => {
    if (sku && !productData) {
      fetch(`/api/product/${sku}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.code === 404) {
            setErrorMessage(`Producto con SKU ${sku} no encontrado.`);
            console.log(`Producto con SKU ${sku} no encontrado.`);
          } else {
            const { name, promoTitle, promoImage, price, _price, productsQuantity, urlPath } = res;
            setProductData({
              productName: promoTitle ?? name,
              price,
              _price,
              promoImage,
              sku,
              urlProduct: `${location.origin}${urlPath}` ?? null,
              productsQuantity
            });
          }
        })
        .catch((err) => {
          console.log(err);
          if (!navigator.onLine) setErrorMessage("Comprueba tu conexión a internet e intenta de nuevo por favor.");
          else setErrorMessage(`Ocurrió un error al obtener información del Producto con SKU ${sku}.`);
        })
        .finally(() => setIsLoading(false));
    } else if (!sku && isFetchingSKU) {
      getSKU();
    }
  }, [sku]);

  const onSubmit = async (data: IForm) => {
    setErrorMessage('');

    fetch('/api/callback', {
      method: 'POST',
      body: JSON.stringify({
        type: lastPath.split('?')[0],
        ...productData,
        ...data,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    })
      .then((response) => response.json())
      .then((json) => {
        const { result } = json;
        setIsSuccess(result.success);

        if (result.errors > 0) setErrorMessage(result.message);
        else reset();
      })
      .catch(err => {
        setIsSuccess(false);
        if (!navigator.onLine) setErrorMessage("Comprueba tu conexión a internet e intenta de nuevo por favor.");
        console.log(err);
      })
      .finally(() => openModal());
  };

  return (
    <section className="section flex gap-6">
      {isLoading && (
        <div role="status" className="w-full h-60 flex justify-center items-center">
          <svg aria-hidden="true" className="w-20 h-20 text-gray-200 animate-spin fill-blue-dark" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      )}
      {sku && productData && !isLoading && (
        <>
          <HeadingCard title="1. Diligencia tus datos para llamarte" isCheck={isValid} icon="personal-data">
            <div className="bg-white rounded-lg">
              <form ref={refForm} className="max-w-full flex flex-wrap gap-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="w-full">
                  <TextBox
                    id="cellPhone"
                    name="cellPhone"
                    label="Escribe tu número de celular"
                    placeholder="300 0000000"
                    {...register("cellPhone")}
                  />
                  {errors.cellPhone && <p className="text-red-600 mt-1">{errors.cellPhone?.message}</p>}
                </div>

                <div className="w-full -mt-6">
                  <CheckBox
                    id="agreeHD"
                    name="agreeHD"
                    label="Acepto el tratamiento de datos personales conforme a la política de tratamiento de datos personales y autorizo que me contacten para realizar la compra."
                    {...register("agreeHD")}
                  />
                  {errors.agreeHD && <p className="text-red-600 mt-1">{errors.agreeHD?.message}</p>}
                </div>

                <div className="w-full">
                  <p className='text-size-p2 font-medium text-black'>NOTA: Al hacer click en “Enviar datos” serás contactado por un agente de Vanti</p>
                </div>
                <div className="w-full flex justify-end">
                  <button type="submit" className='w-fit button button-primary'>
                    Enviar datos
                  </button>
                </div>
              </form>

              {isOpen && (
                <CustomModal
                  close={closeModal}
                  icon={isSuccess ? "callback" : "close"}
                  title={isSuccess ? "Espera atento nuestra llamada" : "Intenta en otro momento"}
                >
                  {modalBody(isSuccess, errorMessage, closeModal, productData)}
                </CustomModal>
              )}
            </div>
          </HeadingCard>
          <div className="relative">
            <div className="grid gap-3 shrink-0 w-96 p-6 rounded-[20px] shadow-[-2px_-2px_0px_rgba(0,0,0,0.04),2px_2px_4px_rgba(0,0,0,0.08)]">
              <p className="title is-4 text-blue-dark !font-semibold">Detalle de tu pedido</p>
              <div className="flex gap-3 flex-col items-start min-w-full">
                <figure className="aspect-square w-[214px] self-center">
                  <Image
                    src={productData.promoImage.url}
                    alt={productData.promoImage.title}
                    width={214}
                    height={214}
                  />
                </figure>
                <div className="grid grid-cols-2 gap-3 w-full">
                  <p className="text-size-subtitle1 text-neutral-20 col-span-2">Productos</p>
                  <p className="text-size-p2 text-grey-30 leading-[1.2]">{productData.productName}</p>
                  <p className="text-size-subtitle2 text-blue-dark">{productData.price}</p>
                  <p className="text-size-p2 text-grey-30">Cantidad</p>
                  <p className="text-size-subtitle2 text-blue-dark">1</p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full items-center bg-neutral-90 p-1 rounded">
                  <p className="text-size-subtitle2 text-black text-right">TOTAL</p>
                  <p className="text-size-subtitle1 text-black">{productData.price}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {!sku && !isLoading && (
        <div className="bg-lucuma-80 border border-lucuma rounded-md px-4 py-3 w-full max-w-xs md:max-w-2xl" role="alert">
          <p className="text-black text-size-subtitle1 font-bold">¡Alerta!</p>
          <p className="text-black">La URL es invalida, el SKU es obligatorio.</p>
        </div>
      )}
      {sku && errorMessage && !isLoading && (
        <div className="bg-red-100 border border-red-400 rounded-md px-4 py-3 w-full max-w-xs md:max-w-2xl" role="alert">
          <p className="text-red-700 text-size-subtitle1 font-bold">¡Error!</p>
          <p className="text-red-600">{errorMessage}</p>
        </div>
      )}
    </section>
  );
};

export const revalidate = 60;

export const getStaticProps: GetStaticProps = async (context) => {
  const headerInfo = await getMenu(DEFAULT_HEADER_ID, context.preview ?? false);
  const footerInfo = await getMenu(DEFAULT_FOOTER_ID, context.preview ?? false, 2);

  return {
    props: {
      layout: {
        name: "Callback Gasodomésticos",
        footerInfo,
        headerInfo,
      }
    },
    revalidate,
  };
};

export default CallbackPage;