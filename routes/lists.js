import { Router } from 'express';
import * as listsController from '../controllers/interview.controller.js'

const router = Router();

router.get('/', interviewController.getNotifications)

export default router