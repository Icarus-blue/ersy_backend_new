import { findUserById } from "../services/userServices.js"
import bcrypt from 'bcrypt'

export default async (userId, password) => {

    try {
        const user = await findUserById(userId)
        if (!user) return { message: "User not found", status: 404 }

        const pwdCompare = await bcrypt.compare(password, user.pass_word)
        if (!pwdCompare) return { message: "Old password incorrect", status: 403 }

        return true

    } catch (error) {
        console.log('error comparing passwords', error.message)
    }
}