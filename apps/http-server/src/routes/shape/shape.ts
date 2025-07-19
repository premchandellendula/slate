import express, { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
const router: Router = express.Router()
import { prisma } from '@repo/db';

router.get('/:roomId', async (req, res) => {
    const roomId = Number(req.params.roomId);

    try {
        const room = await prisma.room.findUnique({
            where: {
                id: roomId
            }
        })

        if(!room){
            res.status(404).json({
                message: "Room not found"
            })
            return;
        }
        const shapes = await prisma.shape.findMany({
            where: {
                roomId
            }
        })

        res.status(200).json({
            messages: "Shapes fetched successfully",
            shapes
        })
    }catch(err) {
        res.status(500).json({
            message: "Error fetching the shapes",
            error: err instanceof Error ? err.message : "Unknown error"
        })
    }
})

export default router