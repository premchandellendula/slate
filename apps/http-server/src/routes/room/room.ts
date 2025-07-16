import express, { Router } from 'express'
const router: Router = express.Router()
import { roomBody } from '@repo/common/types'
import { authMiddleware } from '../../middlewares/authMiddleware';
import { prisma } from '@repo/db';

router.post('/create-room', authMiddleware,  async (req, res) => {
    const response = roomBody.safeParse(req.body);

    if(!response.success){
        res.status(400).json({
            message: "Incorrect inputs"
        })
        return;
    }

    const { name } = response.data;

    try {
        const room = await prisma.room.create({
            data: {
                name,
                adminId: req.userId,
                code: "123213"
            }
        })
    }catch(err) {
        res.status(500).json({
            message: "Error creating a room",
            error: err instanceof Error ? err.message : "Unknown error"
        })
    }
})

export default router;