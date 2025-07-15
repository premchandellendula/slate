import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

async function authMiddleware(req: Request, res: Response, next: NextFunction){
    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        res.status(401).json({
            message: "Token in not valid"
        })
    }

    const token = authHeader?.split(" ")[1]
    if(!token){
        res.status(401).json({
            message: "Token is missing"
        });
        return;
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload

        if(decoded.userId){
            req.userId = decoded.userId
            next()
        }else{
            res.status(401).json({
                message: "Invalid token payload"
            })
        }
    }catch(err){
        const errorMessage = err instanceof Error ? err.message : "Unknown error"
        res.status(403).json({
            message: "Unauthorized",
            error: errorMessage
        })
    }
}