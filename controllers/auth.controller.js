import AsyncHandler from 'express-async-handler'
import bcrypt from 'bcrypt'
import { createToken } from '../utils/createToken.js'
import { findUserByEmail } from '../services/userServices.js'
import _ from 'lodash'


export const login = AsyncHandler(async (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password) return next({ message: "All Fields are required", status: 400 })

    let user = await findUserByEmail(email);
    if (!user) return next({ message: "incorrect email address or password", status: 404 })

    let pwdCompare = await bcrypt.compare(password, user.pass_word)
    if (!pwdCompare) return next({ message: "Password mismatch", status: 401 })

    const token = await createToken(user.id_)
    res.status(200).json(
        {
            status: true,
            user: _.omit({ ...user, fullName: `${user.first_name} ${user.last_name}`, },'pass_word'),
            access_token: token
        }
    )
})