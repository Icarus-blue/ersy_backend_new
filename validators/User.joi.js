import Joi from "joi";


export const UserValidObject = Joi.object({
    email: Joi.string().email().required(),
    fullName: Joi.string().required(),
    password: Joi.string().required().min(6).max(65),
})

export const UserUpdateValidObject = Joi.object({
    email: Joi.string().email().min(10),
    phone: Joi.string().min(9).max(13),
    fullName: Joi.string().min(3),
    oldPassword: Joi.string().min(6),
    newPassword: Joi.string().min(6),
    newPasswordConfirm: Joi.string().valid(Joi.ref('newPassword')).messages({
        'string.min': '{{#label}} must be at least {{#limit}} characters long',
        'any.only': 'new Password confirmation must be the same as new password'
    })
})