import express, { Router } from 'express'
const router: Router = express.Router()
import authRouter from './auth/auth';
import roomRouter from './room/room';

router.use('/auth', authRouter)
router.use('/room', roomRouter)

export default router;