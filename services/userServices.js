import client from "../utils/client.js"

export const findUserByEmail = async (email) => {
    try {
        const user = await client.users.findFirst({ where: { email: email } });
        if (!user) return false

        return user
    } catch (error) {
        console.log('error getting user by email:', error.message)
    }
}

export const findUserById = async (id) => {
    try {
        const user = await client.users.findFirst({ where: { id_: parseInt(id) } })
        if (!user) return false
        return user
    } catch (error) {
        console.log('error getting user by id:', error.message)
    }
}