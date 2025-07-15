import express, { Router } from 'express';
const router: Router = express.Router()
import bcrypt from 'bcrypt';
import { signinBody, signupBody } from '@repo/common/types'
import { prisma } from '@repo/db'

router.post('/signup', async (req, res) => {
    const response = signupBody.safeParse(req.body)

    if(!response.success){
        res.status(400).json({
            message: "Incorrect inputs"
        })
        return;
    }

    const { name, email, password } = response.data;

    try {
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })      
    }catch(err) {
        res.status(500).json({
            message: "Error creating user",
            error: err instanceof Error ? err.message : "Unknown error",
        })
    }
})

router.post('/signin', async (req, res) => {
    const response = signinBody.safeParse(req.body);

    if(!response.success){
        res.status(400).json({
            message: "Incorrect inputs"
        })
        return;
    }

    const { email, password } = response.data

    try{

    }catch(err){
        res.status(500).json({
            message: "Error creating user",
            error: err instanceof Error ? err.message : "Unknown err"
        })
    }
})
export default router;