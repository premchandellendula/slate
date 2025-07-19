import { WS_URL } from "@/config";
import { getExistingShapes } from "./http";
import { Shape, ToolType } from "@/types/canvasengine";

export class CanvasEngine{
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[];
    private selectedShape: Shape | null = null;
    private activeTool: ToolType = "rectangle"
    private boardId: string | null;
    private startX: number = 0;
    private startY: number = 0;
    private clicked: boolean
    private token: string | null;
    private socket: WebSocket | null = null;
    constructor(
        canvas: HTMLCanvasElement, 
        boardId: string,
        token: string
    ){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
        this.boardId = boardId;
        this.clicked = false;
        this.token = token;
        this.init();
        this.initMouseHandlers();
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;


        if(this.token && this.boardId){
            this.connectWebSocket()
        }
    }

    async init(){
        this.existingShapes = await getExistingShapes(this.boardId)
        console.log(this.existingShapes);
        this.clearCanvas()
    }

    async connectWebSocket(){
        if(this.socket){
            // console.log("Connection already exists.")
        }

        const url = `${WS_URL}?token=`
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            const data = JSON.stringify({
                type: "join_room",
                roomId: this.boardId
            });
            this.socket?.send(data);
        }

        this.socket.onmessage = (event) => {
            // console.log(event)
            const message = JSON.parse(event.data);
            // const message = event.data;
            console.log(message)
            console.log(message.type)
            // console.log(message.shape)
            // console.log(typeof event.data.shape)

            if (message.type === "chat") {
                const parsedShape = message.shape
                this.existingShapes.push(parsedShape)
                
                this.clearCanvas();
            }
        }
    }

    setActiveTool(tool: ToolType) {
        this.activeTool = tool;
    }
    initMouseHandlers(){
        this.canvas.addEventListener("mousedown", this.mouseDownHandler)

        this.canvas.addEventListener("mouseup", this.mouseUpHandler)
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler)
    }

    mouseDownHandler = (e) => {
        this.clicked = true
        this.startX = e.clientX
        this.startY = e.clientY
    }

    mouseUpHandler = (e) => {
        this.clicked = false
        const width = e.clientX - this.startX;
        const height = e.clientY - this.startY;

        const selectedShape = this.selectedShape;
        let shape: Shape | null = null;
        if(this.activeTool === "rectangle"){
            shape = {
                type: "rectangle",
                x: this.startX,
                y: this.startY,
                height,
                width
            }
        }else if(this.activeTool === "ellipse"){
            shape = {
                type: "ellipse",
                centreX: this.startX + width / 2,
                centreY: this.startY + height / 2,
                radiusX: Math.abs(width / 2),
                radiusY: Math.abs(height / 2)
            }
        }

        if (!shape) {
            return;
        }

        this.existingShapes.push(shape);

        this.socket?.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({
                shape
            }),
            roomId: this.boardId
        }))
    }

    mouseMoveHandler = (e) => {
        if(this.clicked){
            const width = e.clientX - this.startX;
            const height = e.clientY - this.startY;
            this.clearCanvas();
            this.ctx.strokeStyle = "rgba(255, 255, 255)"
            const activeTool = this.activeTool;
            // console.log(activeTool);
            if (activeTool === "rectangle") {
                this.ctx.strokeRect(this.startX, this.startY, width, height);   
            } else if (activeTool === "ellipse") {
                const centreX = this.startX + (width / 2);
                const centreY = this.startY + (height / 2);
                const radiusX = (width / 2);
                const radiusY = (height / 2);
                this.ctx.beginPath();
                this.ctx.ellipse(centreX, centreY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                this.ctx.stroke();
                this.ctx.closePath();                
            }
        }
    }

    destroy(){
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler)

        this.canvas.removeEventListener("mouseup", this.mouseUpHandler)
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)
    }

    clearCanvas(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(0, 0, 0)"
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // console.log(this.existingShapes);
        this.existingShapes.map((shape) => {
            if (shape.type === "rectangle") {
                this.ctx.strokeStyle = "rgba(255, 255, 255)"
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === "ellipse") {                
                this.ctx.beginPath();
                this.ctx.ellipse(shape.centreX, shape.centreY, shape.radiusX, shape.radiusY, Math.PI / 4, 0, 2 * Math.PI);
                this.ctx.stroke();
            }
        })
    }

    setShape(shape: Shape){
        this.selectedShape = shape
    }

    rectange(
        x: number,
        y: number,
        width: number,
        height: number
    ){

    }
}

// type Shape = {
//     type: "rectangle",
//     x: number,
//     y: number,
//     width: number,
//     height: number
// } | {
//     type: "circle",
//     x: number,
//     y: number,
//     radius: number,
//     startAngle: number,
//     endAngle: number
// } | {
//     type: "line",
//     x: number,
//     y: number,
//     endX: number,
//     endY: number
// }

// type ShapeName = "rectangle" | "circle" | "line";

// export function CanvasEngine(canvas: HTMLCanvasElement, boardId: string, shape: ShapeName){
//     const ctx = canvas.getContext("2d")
//     let existingShapes: Shape[] = []
//     if(!ctx){
//         return;
//     }

//     ctx.fillStyle = "rgb(0,0,0)"
//     ctx.fillRect(0, 0, canvas.width, canvas.height)

//     if(shape === "rectangle"){
//         let clicked = false;
//         let startX = 0;
//         let startY = 0;
//         canvas.addEventListener("mousedown", (e) => {
//             clicked = true;
//             startX = e.clientX
//             startY = e.clientY
//         })

//         canvas.addEventListener("mouseup", (e) => {
//             clicked = false;
//             const width = e.clientX - startX
//             const height = e.clientY - startY

//             existingShapes.push({
//                 type: "rectangle",
//                 x: startX,
//                 y: startY,
//                 width,
//                 height
//             })
//         })

//         canvas.addEventListener("mousemove", (e) => {
//             if(clicked){
//                 const width = e.clientX - startX
//                 const height = e.clientY - startY
//                 clearCanvas(existingShapes, ctx, canvas, shape)
//                 ctx.strokeStyle = "rgb(255, 255, 255)"
//                 ctx.strokeRect(startX, startY, width, height)
//             }
//         })
//     }else if(shape === "circle"){
//         let clicked = false;
//         let startX = 0;
//         let startY = 0;
//         const startAngle = 0;
//         const endAngle = 2 * Math.PI;
//         canvas.addEventListener("mousedown", (e) => {
//             clicked = true;
//             startX = e.clientX
//             startY = e.clientY
//         })

//         canvas.addEventListener("mouseup", (e) => {
//             clicked = false;
//             const width = e.clientX - startX

//             existingShapes.push({
//                 type: "circle",
//                 x: startX,
//                 y: startY,
//                 radius: width / 2,
//                 startAngle,
//                 endAngle
//             })
//         })

//         canvas.addEventListener("mousemove", (e) => {
//             if(clicked){
//                 const width = e.clientX - startX
//                 const height = e.clientY - startY
//                 clearCanvas(existingShapes, ctx, canvas, shape)
//                 ctx.strokeStyle = "rgb(255, 255, 255)"
//                 const centreX = startX + width / 2;
//                 const centreY = startY + height / 2;
//                 const radius = Math.max(width, height) / 2
//                 ctx.beginPath();
//                 ctx.arc(centreX,centreY,radius,0,2*Math.PI);
//                 ctx.stroke();
//                 ctx.closePath();
//             }
//         })
//     }else if(shape === "line"){
//         let clicked = false;
//         let startX = 0;
//         let startY = 0;
//         canvas.addEventListener("mousedown", (e) => {
//             clicked = true;
//             startX = e.clientX
//             startY = e.clientY
//         })

//         canvas.addEventListener("mouseup", (e) => {
//             clicked = false;
//             const width = e.clientX - startX
//             const height = e.clientY - startY

//             existingShapes.push({
//                 type: "line",
//                 x: startX,
//                 y: startY,
//                 endX: width,
//                 endY: height
//             })
//         })

//         canvas.addEventListener("mousemove", (e) => {
//             if(clicked){
//                 const width = e.clientX - startX
//                 const height = e.clientY - startY
//                 clearCanvas(existingShapes, ctx, canvas, shape)
//                 ctx.strokeStyle = "rgb(255, 255, 255)"

                
//                 ctx.beginPath();

//                 // Set a start-point
//                 ctx.moveTo(startX,startY);

//                 // Set an end-point
//                 ctx.lineTo(width,height);

//                 // Draw it
//                 ctx.stroke();
//             }
//         })
//     }
    
    
// }

// function clearCanvas(existingShapes: Shape[], ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, shape: ShapeName){
//     ctx.clearRect(0, 0, canvas.width, canvas.height)
//     ctx.fillStyle = "rgb(0,0,0)"
//     ctx.fillRect(0, 0, canvas.width, canvas.height)

//     existingShapes.map(shape => {
//         if(shape.type === "rectangle"){
//             ctx.strokeStyle = "rgb(255, 255, 255)"
//             ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
//         }else if(shape.type === "circle"){
//             ctx.beginPath();
//             ctx.arc(shape.x, shape.y, shape.radius, shape.startAngle, shape.endAngle);
//             ctx.stroke()
//         }else if(shape.type === "line"){
//             ctx.beginPath();
//             ctx.moveTo(shape.x,shape.y);

//                 // Set an end-point
//             ctx.lineTo(shape.endX,shape.endY);

//             // Draw it
//             ctx.stroke();
//         }
//     })
// }