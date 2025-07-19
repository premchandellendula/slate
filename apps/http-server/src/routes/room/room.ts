import express, { Router } from 'express'
const router: Router = express.Router()
import { roomBody } from '@repo/common/types'
import { authMiddleware } from '../../middlewares/authMiddleware';
import { prisma } from '@repo/db';
import { customAlphabet } from "nanoid";
// QKM9CTQLE
router.post('/create-room', authMiddleware,  async (req, res) => {
    const response = roomBody.safeParse(req.body);

    if(!response.success){
        res.status(400).json({
            message: "Incorrect inputs"
        })
        return;
    }

    const { name } = response.data;
    const nanoidDigits = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 9);

    try {
        const room = await prisma.room.create({
            data: {
                name,
                adminId: req.userId,
                code: nanoidDigits()
            }
        })

        res.status(201).json({
            message: "Room created successfully",
            data: {
                name: room.name,
                code: room.code
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