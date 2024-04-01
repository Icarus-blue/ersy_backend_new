import jwt from 'jsonwebtoken'


export const createToken = async (id) => {
    console.log(id)
    try {
        return jwt.sign({ id }, process.env.ACCESS_SECRET_TOKEN || 'my-secret-token')
    } catch (error) {
        console.log("error creating token:", error.message)
    }
}