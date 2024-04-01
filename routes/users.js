import express from 'express';
import * as userController from '../controllers/User.controller.js'
import { verifyToken } from '../middlewares/verifyToken.js';
import upload from '../utils/multer.js';
const router = express.Router();

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address
 *               fullName:
 *                 type: string
 *                 description: The user's username
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The user's password
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Retrieve the user's profile information
 *     tags: [Users]
 *     description: This endpoint returns the user's profile details. The user is determined based on the JWT token provided in the Authorization header.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation. Returns the user's profile information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 email:
 *                   type: string
 *                   example: user@example.com
 *                 username:
 *                   type: string
 *                   example: user123
 *                 first_name:
 *                   type: string
 *                   example: John
 *                 last_name:
 *                   type: string
 *                   example: Doe
 *                 phone:
 *                   type: string
 *                   example: "+1234567890"
 *                 img_:
 *                   type: string
 *                   example: "default_profile_pic.png"
 *       401:
 *         description: Unauthorized. JWT token is missing or invalid.
 *       403:
 *         description: Forbidden. The user does not have permission to access the profile.
 */


/**
 * @swagger
 * /users/send-password-reset-code:
 *   post:
 *     summary: Send a password reset code to the user's email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address
 *     responses:
 *       200:
 *         description: Password reset code sent successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /users/check-code:
 *   post:
 *     summary: Check the password reset code
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: The password reset code
 *               email:
 *                 type: string
 *                 description: The password reset code
 *     responses:
 *       200:
 *         description: Code is valid
 *       400:
 *         description: Invalid code
 */

/**
 * @swagger
 * /users/reset-password:
 *   post:
 *     summary: Reset the user's password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The password reset code
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: The new password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Bad request
 */
/**
 * @swagger
 * /users/user:
 *   put:
 *     summary: Update the user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /users/{userId}/update-profile-picture:
 *   put:
 *     summary: Update the user's profile picture
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               img_:
 *                 type: string
 *                 format: binary
 *     responses:
 *
 */


router.post('/', userController.createUser)
router.get('/profile', verifyToken, userController.getUserProfile)
router.post('/send-password-reset-code', userController.sendPasswordResetCode)
router.post('/check-code', userController.checkCode)
router.post('/reset-password', userController.changePassword)
router.put('/user', verifyToken, userController.updateProfile)
router.put('/:userId/update-profile-picture', verifyToken, userController.uploadProfilePicture)

export default router;
