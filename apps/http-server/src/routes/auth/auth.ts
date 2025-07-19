import express, { Router } from 'express';
const router: Router = express.Router()
import bcrypt from 'bcrypt';
import { prisma } from '@repo/db';
import jwt from 'jsonwebtoken';
import { signinBody, signupBody } from '@repo/common/types';
import { authMiddleware } from '../../middlewares/authMiddleware';

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
        
        if(!user){
            throw new Error("Failed to create user")
        }

        const JWT_SECRET = process.env.JWT_SECRET;
        if(!JWT_SECRET){
            throw new Error("JWT_SECRET not defined")
        }

        const token = jwt.sign({userId: user.id}, JWT_SECRET, {expiresIn: "2d"})

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 2, // 2 days
            sameSite: "lax",
            secure: false
        })

        res.status(201).json({
            message: "User created successfully",
            data: {
                id: user.id,
                name: user.name,
                email: user.email
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
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if(!user){
            throw new Error("User not found")
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if(!isPasswordValid){
            res.status(400).json({
                message: "Incorrect password"
            })
        }

        const JWT_SECRET = process.env.JWT_SECRET;
        if(!JWT_SECRET){
            throw new Error("JWT_SECRET not defined")
        }

        const token = jwt.sign({userId: user.id}, JWT_SECRET, {expiresIn: "2d"})

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 2, // 2 days
            sameSite: "lax",
            secure: false
        })

        res.status(200).json({
            message: "User signed in successfully",
            data: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        })
    }catch(err){
        res.status(500).json({
            message: "Error creating user",
            error: err instanceof Error ? err.message : "Unknown err"
        })
    }
})

router.get('/get-token', authMiddleware, async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    res.json({ token });
})
export default router;