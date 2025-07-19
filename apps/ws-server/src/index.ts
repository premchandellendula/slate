import dotenv from 'dotenv';
dotenv.config();
import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { parse } from 'url';
import { prisma } from '@repo/db'

const wss = new WebSocketServer({ port: 8080})

interface User {
    ws: WebSocket,
    rooms: string[],
    userId: string
}

const users: User[] = []

function checkUser(token: string): string | null{
    // console.log(token)
    try {
        // console.log("start")
        const JWT_SECRET = process.env.JWT_SECRET;
        if(!JWT_SECRET){
            throw new Error("JWT_SECRET not defined")
        }
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
        // console.log("hello")
        
        if(!decoded || !decoded.userId){
            return null;
        }
    
        return decoded.userId;
    } catch (error) {
        console.log("Error while decoding")
        return null;
    }
}

wss.on('connection', (ws, request) => {
    const { query } = parse(request.url || "", true)
    const token = query.token as string;

    if (!token) {
        console.warn('token is missing');
        ws.close();
        return;
    }

    const userId = checkUser(token)
    if(!userId){
        ws.close()
        return;
    }

    users.push({
        userId,
        rooms: [],
        ws
    })

    ws.on('message', async (data) => {
        let parsedData;
        if (typeof data !== "string") {
            parsedData = JSON.parse(data.toString());
        } else {
            parsedData = JSON.parse(data);
        }
        // console.log(parsedData);

        if(parsedData.type === "join_room"){
            const user = users.find(x => x.ws === ws)
            user?.rooms.push(parsedData.roomId)
        }

        if(parsedData.type === "leave_room"){
            const user = users.find(x => x.ws === ws);
            if(!user){
                return
            }
            user.rooms = user.rooms.filter(x => x === parsedData.room)
        }

        if(parsedData.type === "chat"){
            const roomId = parsedData.roomId
            const message = JSON.parse(parsedData.message)
            // console.log(message);
            const shape = message.shape
            await prisma.shape.create({
                data: {
                    roomId: Number(roomId),
                    message: JSON.stringify(shape),
                    userId
                }
            });

            users.forEach(user => {
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        shape: shape,
                        roomId
                    }))
                }
            })
        }
    })
})