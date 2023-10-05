import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { ObjectShape, OptionalObjectSchema } from 'yup/lib/object';
import { customerSchema } from '../../src/schemas/customer';
import { createCustomer } from '@/lib/services/commerce-layer.service';
import reCaptchaService from '@/lib/services/re-captcha.service';

const validate = (
    schema: OptionalObjectSchema<ObjectShape>,
    handler: NextApiHandler
) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        if (['POST'].includes(req.method)) {
            try {
                req.body = await schema.validate(req.body, { abortEarly: false, stripUnknown: true });
            } catch (error) {
                return res.status(400).json(error);
            }
        } else {
            return res.status(400).json({ error: "Método de petición invalido." });
        }
        handler(req, res);
    };
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const isValidReCaptcha = await reCaptchaService.validate(req.body.tokenReCaptcha);
        if (!isValidReCaptcha) {
            res.status(400).json({
                success: false,
                data: {
                    recaptcha: "ReCaptcha validation error",
                },
                error: {
                    code: "RE_CAPTCHA_ERROR_VALIDATION",
                    message: "ReCaptcha validation error",
                },
            });
        }

        await createCustomer(req.body);
        res.status(201).json({ success: true, data: 'Usuario creado con exito'});
    } catch (error) {
        console.error("Error in signup handler: ", error.message);
        res.status(400).json({ success: false, data: 'Error al crear el usuario' });
    }
};

export default validate(customerSchema, handler);
