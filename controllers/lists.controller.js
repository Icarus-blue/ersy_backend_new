import expressAsyncHandler from "express-async-handler";
import client from "../utils/client.js";

export const createNotification = expressAsyncHandler(async (req, res, next) => {


    const { type_, artist_id, cover, message_ } = req.body;
    if (!type_ || !message_) return next({ message: "Title and description are all required", status: 400 })

    const newNotification = await client.notifications.create({
        data: {
            type_,
            message_,
            artist_id,
            cover
        }
    })

    res.status(200).json({
        status: true,
        notification: newNotification
    })

})


export const getNotifications = expressAsyncHandler(async (req, res, next) => {

    const { page, pageSize } = req.query

    const notifications = await client.notifications.findMany({
        take: parseInt(pageSize),
        skip: (page - 1) * pageSize,
        orderBy: {
            date: 'desc'
        }
    })

    res.status(200).json({
        status: true,
        notifications
    })
})