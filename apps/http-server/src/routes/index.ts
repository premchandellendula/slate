import express, { Router } from 'express'
const router: Router = express.Router()
import authRouter from './auth/auth';
import roomRouter from './room/room';
import shapeRouter from './shape/shape';

router.use('/auth', authRouter)
router.use('/room', roomRouter)
router.use('/shape', shapeRouter)

export default router;