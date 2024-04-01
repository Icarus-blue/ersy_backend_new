import { Router } from 'express';
import * as interviewController from '../controllers/interview.controller.js'

const router = Router();

router.get('/', interviewController.getNotifications)

export default router