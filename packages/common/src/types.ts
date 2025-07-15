import zod from 'zod';

export const signupBody = zod.object({
    name: zod.string().min(3).max(30),
    email: zod.email(),
    password: zod.string().min(6)
})

export const signinBody = zod.object({
    email: zod.email(),
    password: zod.string().min(6)
})

export const roomBody = zod.object({
    name: zod.string().min(3).max(20)
})