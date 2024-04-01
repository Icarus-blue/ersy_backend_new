import { Router } from 'express';
import * as NotificationController from '../controllers/Notifications.js'

const router = Router();

router.get('/', NotificationController.getNotifications)

export default router