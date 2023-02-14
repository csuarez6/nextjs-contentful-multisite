import React, { createRef, LegacyRef } from 'react';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import HeadingCard from '@/components/organisms/cards/heading-card/HeadingCard';
import TextBox from '@/components/atoms/input/textbox/TextBox';

interface IForm {
  contractAccount: string;
  fullName: string;
  cellPhone: string;
  email: string;
}

const regexCellPhone = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/;
const schema = yup.object({
  contractAccount: yup.string().required("Dato Requerido"),
  fullName: yup.string().required("Dato requerido"),
  cellPhone: yup.string().required("Dato requerido").matches(regexCellPhone, {
    message: "Formatos validos: ### ### #### / (###) ### #### / +## ###-###-#### / +## (###)-###-####"
  }),
  email: yup.string().email("Email no válido").required("Dato requerido"),
});

const PersonalData = ({ handleNext, formData, setFormData }) => {
  const refForm: LegacyRef<HTMLFormElement> = createRef();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<IForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: IForm) => {
    setFormData({ ...formData, ...data });
    handleNext();
  };

  return (
    <HeadingCard title="1. ¡Comencemos!" isCheck={isValid} icon="personal-data">
      <div className="bg-white rounded-lg">
        <div className='mb-6'>
          <p className='title is-4 !font-semibold text-grey-30'>Cuéntanos sobre ti</p>
        </div>

        <form ref={refForm} className="max-w-full flex flex-wrap gap-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="w-full">
            <label className="block text-lg text-grey-30" htmlFor="contractAccount">
              Escribe tu número de cuenta contrato
            </label>
            <TextBox
              id="contractAccount"
              name="contractAccount"
              label="(Lo encuentras en la parte superior izquierda de tu factura del gas)"
              placeholder="00000-000"
              {...register("contractAccount")}
            />
            {errors.contractAccount && <p className="text-red-600 mt-1">{errors.contractAccount?.message}</p>}
          </div>
          <div className="w-full">
            <TextBox
              id="fullName"
              name="fullName"
              label="Escribe tu nombre"
              placeholder="Nombre completo *"
              {...register("fullName")}
            />
            {errors.fullName && <p className="text-red-600 mt-1">{errors.fullName?.message}</p>}
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
            <TextBox
              id="email"
              name="email"
              type="email"
              label="Escribe tu correo electrónico"
              placeholder="Correo electrónico *"
              {...register("email")}
            />
            {errors.email && <p className="text-red-600 mt-1">{errors.email?.message}</p>}
          </div>

          <div className="w-full">
            <p className='text-size-p2 font-medium text-black'>NOTA: Al hacer click en “Enviar datos” serás contactado por un agente de Vanti</p>
          </div>
          <div className="w-full flex justify-end">
            <button type="submit" className='w-fit button button-primary'>
              Continuar
            </button>
          </div>
        </form>
      </div>
    </HeadingCard>
  );
};

export default PersonalData;