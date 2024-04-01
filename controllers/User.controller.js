import AsyncHandler from 'express-async-handler'
import { UserUpdateValidObject, UserValidObject } from '../validators/User.joi.js';
import { createToken } from '../utils/createToken.js';
import generateCode from '../utils/generateCode.js';
import bcrypt from 'bcrypt'
import sendEmail from '../utils/emailTransporter.js';
import { findUserByEmail, findUserById } from '../services/userServices.js';
import _ from 'lodash';
import checkPasswords from '../utils/checkPasswords.js';
import client from '../utils/client.js';
import fs from 'fs'
import { imageToBase64 } from '../utils/convertImage.js';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));


export const createUser = AsyncHandler(async (req, res, next) => {
    const { email, password, fullName } = req.body
    if (!email || !password || !fullName) return next({ message: "All Fields are required", status: 400 });

    const { error, value } = UserValidObject.validate({ email, fullName, password })

    if (error) return next({ message: error.details[0].message, status: 400 })

    const userExists = await findUserByEmail(email);
    if (userExists) return next({ message: "email already registered", status: 409 })

    const hashedPwd = await bcrypt.hash(value.password, 10)

    const img = imageToBase64(path.join(__dirname, '..', 'public', 'default_profile.jpg'))

    const newUser = await client.users.create({
        data: {
            email: value.email,
            pass_word: hashedPwd,
            last_name: fullName.split(' ')[0],
            first_name: fullName.split(' ')[1],
            img_: img
        }
    })

    const token = await createToken(newUser.id_);
    res.status(201).json(
        {
            status: true,
            message: "User created successfully",
            user: _.omit({ ...newUser, fullName: `${newUser.last_name} ${newUser?.first_name}` }, 'pass_word'),
            access_token: token
        }
    )

})

export const getUserProfile = AsyncHandler(async (req, res, next) => {
    const id = req.userId

    if (!id) return next({ message: 'user is required', status: 400 })

    let user = await findUserById(id)
    if (!user) return next({ message: 'user was not found', status: 404 })

    res.status(200).json({
        status: true,
        user: _.omit({ ...user, fullName: `${user.first_name} ${user.last_name}`, }, 'pass_word')
    })
})


export const sendPasswordResetCode = AsyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) return next({ message: "Email is required", status: 400 })

    let user = await findUserByEmail(email);
    if (!user) return next({ message: "user not found", status: 404 })

    // await User.findOneAndUpdate({ email: user.email }, {
    //     passwordResetCode: generateCode()
    // })

    await client.users.update({
        where: {
            id_: user.id_
        },
        data: {
            passwordResetCode: generateCode()
        }
    })
    const emailSent = await sendEmail(user.email, "password reset code", `use this code to reset your password: ${user.passwordResetCode}`)
    if (!emailSent) throw new Error("Couldn't send email");


    res.status(200).json({
        message: "A code was successfully sent to your email address",
        status: true
    })
})

export const checkCode = AsyncHandler(async (req, res, next) => {
    const { code, email } = req.body

    if (!code || !email) return next({ message: "email and code are required", status: 400 })

    let user = await findUserByEmail(email)

    if (!user) return next({ message: "User does not exist", status: 404 })

    if (user.passwordResetCode !== parseInt(code)) return next({ message: 'code incorrect', status: 403 })

    res.status(200).json(
        {
            status: true,
            message: 'code was verified. You can now change your password'
        }
    )
})

export const changePassword = AsyncHandler(async (req, res, next) => {

    const { email, password } = req.body

    if (!email || !password) return next({ message: "email and password are required", status: 400 })

    if (password.toString().length < 6) return next({ message: 'password length must be atleast 6', status: 400 })
    let user = await findUserByEmail(email)

    if (!user) return next({ message: "User does not exist", status: 404 })

    const newPassword = await bcrypt.hash(password, 10)

    // await User.findOneAndUpdate({ email }, {
    //     password: newPassword,
    //     passwordResetCode: 0
    // })

    await client.users.update({
        where: {
            id_: user.id_
        },
        data: {
            pass_word: newPassword,
            passwordResetCode: 0
        }
    })
    res.status(200).json({
        status: true,
        message: 'password reset successfully. You can now login with your new password'
    })
})


export const updateProfile = AsyncHandler(async (req, res, next) => {

    const { id } = req.query

    const { error, value } = UserUpdateValidObject.validate({ ...req.body })

    if (error) return next({ message: error.details[0].message, status: 400 })


    const user = await findUserById(parseInt(id))
    if (!user) return next({ message: "User could not be found", status: 404 })

    const isOldPasswordCorrect = await checkPasswords(user.id_, req.body.oldPassword)

    if (req.body.newPassword || req.body.oldPassword) {
        if (isOldPasswordCorrect !== true) return next({ ...isOldPasswordCorrect })
    }

    // await User.findOneAndUpdate({ id_: user.id_ }, {
    //     ...req.body, password: (req.body.newPassword && isOldPasswordCorrect) ? await bcrypt.hash(req.body.newPassword, 10) : user.password
    // })

    console.log('result', req.body)
    const result = await client.users.update({
        where: {
            id_: parseInt(id)
        },
        data: {

            first_name: value.fullName && value.fullName.split(' ')[0],
            last_name: value.fullName && value.fullName.split(' ')[1],
            phone: value.phone,
            email: value.email,
            pass_word: (value.newPassword && isOldPasswordCorrect) ? await bcrypt.hash(value.newPassword, 10) : user.pass_word
        }
    })
    const updatedUser = await findUserById(id)

    res.status(200).json(
        {
            status: true,
            message: 'Your profile have been updated successfully',
            user: _.omit({ ...updatedUser, fullName: `${updatedUser.first_name} ${updatedUser.last_name}`, }, 'pass_word'),
        }
    )

})


export const uploadProfilePicture = AsyncHandler(async (req, res, next) => {

    const { userId } = req.params
    const { imageBase64 } = req.body
    if (!imageBase64) return next({ message: "Picture is needed", status: 400 })
    if (!userId) return next({ message: "User id is required", status: 400 })
    let user = await findUserById(userId)

    if (!user) return next({ message: "User could not be found", status: 404 })
    
    await client.users.update({
        where: {
            id_: user.id_
        },
        data: {
            img_: imageBase64
        }
    })

    let updatedUser = await findUserById(userId)

    res.status(200).json(
        {
            status: true,
            message: "User profile picture was updated successfully",

            user: _.omit(updatedUser, 'pass_word')
        }
    )
})