import { DEFAULT_FOOTER_ID, DEFAULT_HEADER_ID } from "@/constants/contentful-ids.constants";
import { getMenu } from "@/lib/services/menu-content.service";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import HeadingCard from '@/components/organisms/cards/heading-card/HeadingCard';
import TextBox from '@/components/atoms/input/textbox/TextBox';

import React, { useState, createRef, LegacyRef } from 'react';
import { useLastPath } from "@/hooks/utils/useLastPath";
import CustomModal from "@/components/organisms/custom-modal/CustomModal";
import Icon from "@/components/atoms/icon/Icon";

const modalBody = (data, isSuccess, errorMessage, closeModal) => {
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
              <>
                <div className="px-[14px] py-3 bg-neutral-90 rounded-[10px] flex gap-3 justify-between items-center text-blue-dark">
                  <p className="title is-4 !font-semibold flex gap-3 items-center">
                    <span className="w-12 h-12 shrink-0">
                      <Icon icon="alert" className="w-full h-full" />
                    </span>
                    {data.date}
                  </p>
                  <p className="title is-3">{data.hour}</p>
                </div>
                <p className="lg:text-size-p1 text-neutral-20">
                  En caso de tener inconvenientes con la visita, te contactaremos al numero que nos has brindado.
                  <br /><br />
                  ¡Gracias por confiar en Vanti!
                </p>
              </>
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
        <button type="button" className="button button-primary" onClick={closeModal}>
          Aceptar
        </button>
      </div>
    </>
  );
};

interface IForm {
  cuentaContrato: boolean;
  date: string;
  hour: string;
  cellPhone: string;
}

const regexCellPhone = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/;
const regexTime = /^([0-1]?\d|2[0-4]):([0-5]\d)(:[0-5]\d)?$/;
const schema = yup.object({
  cuentaContrato: yup
    .number()
    .typeError("Dato Requerido: El valor debe ser numérico")
    .positive("Valor no valido, deben ser números positivos")
    .required("Dato Requerido"),
  date: yup.date()
    .typeError(('El valor debe ser una fecha (mm/dd/yyy)'))
    .required(('This field is required')),
  hour: yup.string().required("Dato requerido").matches(regexTime, {
    message: "No es una hora valida"
  }),
  cellPhone: yup.string().required("Dato requerido").matches(regexCellPhone, {
    message: "Formatos validos: ### ### #### / (###) ### #### / +## ###-###-#### / +## (###)-###-####"
  })
});

const CallbackPage = () => {
  const refForm: LegacyRef<HTMLFormElement> = createRef();
  const lastPath = useLastPath();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
    reset
  } = useForm<IForm>({
    resolver: yupResolver(schema),
  });

  const [isOpen, setIsOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dateValue, setDateValue] = useState('');
  const [hourValue, setHourValue] = useState('');

  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);

  const onSubmit = async (data: IForm) => {
    setDateValue('');
    setHourValue('');
    setErrorMessage('');

    fetch('/api/callback', {
      method: 'POST',
      body: JSON.stringify({
        type: lastPath,
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
        setDateValue(getValues('date'));
        setHourValue(getValues('hour'));

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
    <section className="section">
      <HeadingCard title="1. Agenda tu cita" isCheck={isValid} icon="personal-data">
        <div className="bg-white rounded-lg">
          <div className='mb-6'>
            <p className='title is-4 !font-semibold text-grey-30'>Completa tus datos para agendar tu cita para la Revisión Periódica Obligatoria</p>
          </div>
          <form ref={refForm} className="max-w-full flex flex-wrap gap-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="w-full">
              <label className="block text-lg text-grey-30" htmlFor="cuentaContrato">
                Escribe tu número de cuenta contrato
              </label>
              <TextBox
                id="cuentaContrato"
                name="cuentaContrato"
                label="(Lo encuentras en la parte superior izquierda de tu factura del gas)"
                placeholder="00000-000"
                {...register("cuentaContrato")}
              />
              {errors.cuentaContrato && <p className="text-red-600 mt-1">{errors.cuentaContrato?.message}</p>}
            </div>
            <div className="w-full">
              <TextBox
                id="date"
                name="date"
                type="date"
                label="Elige la fecha disponible en la cual quieres recibir la visita"
                placeholder="Fechas disponibles"
                {...register("date")}
              />
              {errors.date && <p className="text-red-600 mt-1">{errors.date?.message}</p>}
            </div>
            <div className="w-full">
              <TextBox
                id="hour"
                name="hour"
                label="Elige la hora disponible para recibir al técnico"
                placeholder="HH:MM"
                {...register("hour")}
              />
              {errors.hour && <p className="text-red-600 mt-1">{errors.hour?.message}</p>}
            </div>
            <div className="w-full">
              <TextBox
                id="cellPhone"
                name="cellPhone"
                label="Escribe tu número de celular para poder contactarte"
                placeholder="300 0000000"
                {...register("cellPhone")}
              />
              {errors.cellPhone && <p className="text-red-600 mt-1">{errors.cellPhone?.message}</p>}
            </div>
            <div className="w-full">
              <p className='text-size-p2 font-medium text-black'>NOTA: Al hacer click en “Enviar datos” serás contactado por un agente de Vanti</p>
            </div>
            <div className="w-full flex justify-end">
              <button type="submit" className='w-fit button button-primary'>
                Agendar cita
              </button>
            </div>
          </form>

          {isOpen && (
            <CustomModal
              close={closeModal}
              icon={isSuccess ? "alert" : "close"}
              title={isSuccess ? "¡Has agendado tu cita con éxito!" : "Intenta en otro momento"}
              subtitle={isSuccess && "Recuerda tener presente la visita del técnico a la hora y dia que agendaste"}
            >
              {modalBody({ date: dateValue, hour: hourValue }, isSuccess, errorMessage, closeModal)}
            </CustomModal>
          )}
        </div>
      </HeadingCard>
    </section>
  );
};

CallbackPage.getInitialProps = async (context: any) => {
  const headerInfo = await getMenu(DEFAULT_HEADER_ID, context.preview ?? false);
  const footerInfo = await getMenu(DEFAULT_FOOTER_ID, context.preview ?? false, 2);

  return {
    layout: {
      name: "Callback RPO",
      footerInfo,
      headerInfo,
    },
  };
};

export default CallbackPage;