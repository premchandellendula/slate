import express, { Router } from 'express';
const router: Router = express.Router()
import zod from 'zod'
import bcrypt from 'bcrypt';

const signupBody = zod.object({
    name: zod.string(),
    email: zod.email(),
    password: zod.string().min(6)
})

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

        
    }catch(err) {
        res.status(500).json({
            message: "Error creating user",
            error: err instanceof Error ? err.message : "Unknown error",
        })
    }
})

const signinBody = zod.object({
    email: zod.email(),
    password: zod.string().min(6)
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