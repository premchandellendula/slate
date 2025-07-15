import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from 'jsonwebtoken';

const wss = new WebSocketServer({ port: 8080})

wss.on('connection', (ws, request) => {
    const headers = request.headers;
    const authHeader = headers["authorization"];
    if (!authHeader || typeof authHeader !== 'string') {
        console.warn('Missing or invalid Authorization header');
        return;
    }

    if (!authHeader.startsWith('Bearer ')) {
        console.warn('Authorization header is not using Bearer scheme');
        return;
    }
    const token = authHeader?.split(" ")[1]
    if (!token) {
        console.warn('Bearer token is empty');
        return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload

    if(!decoded || !decoded.userId){
        ws.close()
        return;
    }

    ws.on('message', (data) => {
        console.log('received: %s', data)
    })


    ws.send("something")
})