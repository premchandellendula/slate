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
    private activeTextArea: HTMLTextAreaElement | null = null;
    private activeTextPosition: { x: number; y: number } | null = null;
    private isDrawingFree = false;
    private currentFreePoints: { x: number; y: number }[] = [];

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

        const url = `${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMDQ0N2U0NS04ZTgwLTQ3MGEtYmZiZS05YzNiNGZkYjZmODIiLCJpYXQiOjE3NTMwODI5OTgsImV4cCI6MTc1MzI1NTc5OH0.-ee7VE7YNXMUqsNSoCubQ-X2a1t70dUlPszJ1n8GYx4`
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


            if (message.type === "delete-shape") {
                this.existingShapes = this.existingShapes.filter(s => s.id !== message.shapeId);
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

    mouseDownHandler = (e: MouseEvent) => {
        this.clicked = true
        this.startX = e.clientX
        this.startY = e.clientY
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if(this.activeTool === "text"){
            this.clicked = false;
            this.handleText(e);
            return;
        }else if (this.activeTool === "draw") {
            // alert(x)
            // alert(y)
            // console.log("down " + x + y).;
            
            this.isDrawingFree = true;
            this.currentFreePoints = [{ x, y }];
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
        }else if(this.activeTool === "eraser"){
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            for (let i = this.existingShapes.length - 1; i >= 0; i--) {
                const shape = this.existingShapes[i];
                if(!shape){
                    continue;
                }

                if (this.isPointInShape(x, y, shape) || this.isPointNearShape(x, y, shape)) {
                    this.existingShapes.splice(i, 1);
                    this.socket?.send(JSON.stringify({
                        type: "eraser",
                        roomId: this.boardId,
                        shapeId: shape.id
                    }))
                    this.clearCanvas();
                    break;
                }
            }

            return;
        }
    }

    mouseUpHandler = (e: MouseEvent) => {
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
        }else if(this.activeTool === "line"){
            shape = {
                type: "line",
                startX: this.startX,
                startY: this.startY,
                endX: e.clientX,
                endY: e.clientY
            }
        }else if(this.activeTool === "arrow"){
            shape = {
                type: "arrow",
                startX: this.startX,
                startY: this.startY,
                endX: e.clientX,
                endY: e.clientY
            }
        }else if(this.activeTool === "diamond"){
            shape = {
                type: "diamond",
                centreX: this.startX + (width / 2),
                centreY: this.startY + (height / 2),
                distX: width / 2,
                distY: height / 2
            }
        }else if(this.activeTool === "draw"){
            if (this.isDrawingFree && this.currentFreePoints.length > 1) {
                shape = {
                    type: "draw",
                    points: this.currentFreePoints,
                };
            }

            this.isDrawingFree = false;
            this.currentFreePoints = [];
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

    mouseMoveHandler = (e: MouseEvent) => {
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
            }else if (activeTool === "line") {
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(e.clientX, e.clientY);
                this.ctx.stroke();
                this.ctx.closePath();                
            }else if(activeTool === "arrow") {
                const angle = Math.atan2(e.clientY - this.startY, e.clientX - this.startX);
                const arrowLength = 10

                const arrowX1 = e.clientX - arrowLength * Math.cos(angle - Math.PI / 6);
                const arrowY1 = e.clientY - arrowLength * Math.sin(angle - Math.PI / 6);
                const arrowX2 = e.clientX - arrowLength * Math.cos(angle + Math.PI / 6);
                const arrowY2 = e.clientY - arrowLength * Math.sin(angle + Math.PI / 6);
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(e.clientX, e.clientY);
                this.ctx.stroke()

                this.ctx.beginPath()
                this.ctx.moveTo(e.clientX, e.clientY);
                this.ctx.lineTo(arrowX1, arrowY1);
                this.ctx.moveTo(e.clientX, e.clientY);
                this.ctx.lineTo(arrowX2, arrowY2);
                this.ctx.stroke();
                this.ctx.closePath();
            }else if(activeTool === "diamond"){
                const centreX = this.startX + (width / 2);
                const centreY = this.startY + (height / 2);

                const halfWidth = width / 2;
                const halfHeight = height / 2; 

                this.ctx.beginPath();
                this.ctx.moveTo(centreX, centreY - halfHeight);      // Top
                this.ctx.lineTo(centreX + halfWidth, centreY);      // Right
                this.ctx.lineTo(centreX, centreY + halfHeight);      // Bottom
                this.ctx.lineTo(centreX - halfWidth, centreY);      // Left
                this.ctx.closePath();
                this.ctx.stroke();
            }else if(activeTool === "draw"){
                // if (!this.isDrawingFree || this.activeTool !== "draw") return;
                // const rect = this.canvas.getBoundingClientRect();
                // const x = e.clientX - rect.left;
                // const y = e.clientY - rect.top;
                // // alert(x)
                // // alert(y)
                // // console.log("move " + x + y)

                // this.currentFreePoints.push({ x, y });

                // this.ctx.beginPath();
                // this.ctx.lineTo(x, y);
                // this.ctx.strokeStyle = "white";
                // this.ctx.lineWidth = 2;
                // this.ctx.lineJoin = "round";
                // this.ctx.lineCap = "round";
                // this.ctx.stroke();
                // this.ctx.closePath();
                if (!this.isDrawingFree || this.activeTool !== "draw") return;

                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                this.currentFreePoints.push({ x, y });

                // Draw full path from currentFreePoints
                if (this.currentFreePoints.length > 1) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.currentFreePoints[0].x, this.currentFreePoints[0].y);
                    for (let i = 1; i < this.currentFreePoints.length; i++) {
                        this.ctx.lineTo(this.currentFreePoints[i].x, this.currentFreePoints[i].y);
                    }
                    this.ctx.strokeStyle = "white";
                    this.ctx.lineWidth = 2;
                    this.ctx.lineJoin = "round";
                    this.ctx.lineCap = "round";
                    this.ctx.stroke();
                    this.ctx.closePath();
                }
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
        this.existingShapes.forEach((shape) => {
            
            if (shape.type === "rectangle") {
                this.ctx.strokeStyle = "rgba(255, 255, 255)"
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            }else if (shape.type === "ellipse") {                
                this.ctx.beginPath();
                this.ctx.ellipse(shape.centreX, shape.centreY, shape.radiusX, shape.radiusY, Math.PI / 4, 0, 2 * Math.PI);
                this.ctx.stroke();
            }else if (shape.type === "line") {                
                this.ctx.beginPath();
                this.ctx.moveTo(shape.startX, shape.startY);
                this.ctx.lineTo(shape.endX, shape.endY);
                this.ctx.stroke();
            }else if (shape.type === "arrow") {                
                const angle = Math.atan2(shape.endY - shape.startY, shape.endX - shape.startX);
                const arrowLength = 10

                const arrowX1 = shape.endX - arrowLength * Math.cos(angle - Math.PI / 6);
                const arrowY1 = shape.endY - arrowLength * Math.sin(angle - Math.PI / 6);
                const arrowX2 = shape.endX - arrowLength * Math.cos(angle + Math.PI / 6);
                const arrowY2 = shape.endY - arrowLength * Math.sin(angle + Math.PI / 6);
                this.ctx.beginPath();
                this.ctx.moveTo(shape.startX, shape.startY);
                this.ctx.lineTo(shape.endX, shape.endY);
                this.ctx.stroke()

                this.ctx.beginPath()
                this.ctx.moveTo(shape.endX, shape.endY);
                this.ctx.lineTo(arrowX1, arrowY1);
                this.ctx.moveTo(shape.endX, shape.endY);
                this.ctx.lineTo(arrowX2, arrowY2);
                this.ctx.stroke();
                this.ctx.closePath();
            }else if(shape.type === "diamond"){
                this.ctx.beginPath();
                this.ctx.moveTo(shape.centreX, shape.centreY - shape.distY);      // Top
                this.ctx.lineTo(shape.centreX + shape.distX, shape.centreY);      // Right
                this.ctx.lineTo(shape.centreX, shape.centreY + shape.distY);      // Bottom
                this.ctx.lineTo(shape.centreX - shape.distX, shape.centreY);      // Left
                this.ctx.closePath();
                this.ctx.stroke();
            }else if(shape.type === "text"){
                this.ctx.font = "18px Times New Roman, serif";
                this.ctx.fillStyle = "white";
                this.ctx.textBaseline = "top";

                const lineHeight = 27;
                const lines = shape.text.split("\n");
                lines.forEach((line, index) => {
                    this.ctx.fillText(line, shape.x, shape.y + index * lineHeight);
                });    
            }else if (shape.type === "draw") {
                const points = shape.points;
                this.ctx.beginPath();
                this.ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    this.ctx.lineTo(points[i].x, points[i].y);
                }           
                this.ctx.strokeStyle = "white";
                this.ctx.lineWidth = 2;
                this.ctx.lineJoin = "round";
                this.ctx.lineCap = "round";
                this.ctx.stroke();
                this.ctx.closePath();
                this.ctx.restore();
            }
        })
    }

    setShape(shape: Shape){
        this.selectedShape = shape
    }

    private handleText(e: MouseEvent) {
        e.stopPropagation();
        e.preventDefault();
        const x = e.clientX;
        const y = e.clientY;
        // alert(x)
        // alert(y)
        
        const canvasRect = this.canvas.getBoundingClientRect();
        const canvasX = x - canvasRect.left;
        const canvasY = y - canvasRect.top;
        // alert(canvasX)
        // alert(canvasY)

        const textarea = document.createElement("textarea");
        this.activeTextArea = textarea;
        this.activeTextPosition = { x: canvasX, y: canvasY };
        textarea.value = "";
        // alert(textarea.value)
        
        Object.assign(textarea.style, {
            position: "absolute",
            top: `${canvasRect.top + canvasY}px`,
            left: `${canvasRect.left + canvasX}px`,
            font: "16px Times New Roman, serif",
            color: "white",
            background: "#111", // like bg-neutral-900
            border: "0.5px dashed #e5e5e5",
            outline: "none",
            boxSizing: "border-box",
            padding: "2px",
            resize: "none",
            overflow: "hidden",
            minWidth: "100px",
            minHeight: "30px",
            zIndex: "9999",
        });
        
        textarea.style.left = `${canvasRect.left + canvasX}px`;
        textarea.style.top = `${canvasRect.top + canvasY}px`;
        document.body.appendChild(textarea);
        textarea.focus();

        const finalizeText = () => {
            const value = textarea.value.trim();
            if (value) {
                this.ctx.font = "18px Times New Roman, serif";
                this.ctx.fillStyle = "white";
                this.ctx.textBaseline = "top";

                const lines = value.split("\n");
                const lineHeight = 27;
                lines.forEach((line, index) => {
                    this.ctx.fillText(line, canvasX, canvasY + index * lineHeight);
                });

                const newShape: Shape = {
                    type: "text",
                    x: canvasX,
                    y: canvasY,
                    width: textarea.offsetWidth,
                    height: textarea.offsetHeight,
                    text: value,
                };

                if (!newShape) {
                    return;
                }
                this.existingShapes.push(newShape)
                this.socket?.send(JSON.stringify({
                    type: "chat",
                    message: JSON.stringify({
                        shape: newShape
                    }),
                    roomId: this.boardId
                }))
                this.clearCanvas();
            }

            textarea.remove();
            this.activeTextArea = null;
        };

        textarea.addEventListener("blur", finalizeText);
        textarea.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                textarea.blur();
            }
        });
    }

    isPointInShape(x: number, y: number, shape: Shape): boolean{
        const padding = 5

        if(shape.type === "rectangle"){
            return (
                x >= shape.x - padding &&
                x <= shape.x + padding + shape.width &&
                y >= shape.y - padding &&
                y <= shape.y + padding + shape.height
            )
        }

        if(shape.type === "ellipse"){
            const dx = x - shape.centreX;
            const dy = y - shape.centreY;
            const rx = shape.radiusX + padding;
            const ry = shape.radiusY + padding;

            return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
        }

        if (shape.type === "diamond") {
            const dx = Math.abs(x - shape.centreX);
            const dy = Math.abs(y - shape.centreY);
            return (dx / (shape.distX + padding)) + (dy / (shape.distY + padding)) <= 1;
        }

        if (shape.type === "text") {
            return (
                x >= shape.x - padding &&
                x <= shape.x + shape.width + padding &&
                y >= shape.y - padding &&
                y <= shape.y + shape.height + padding
            );
        }


        return false;
    }

    isPointNearShape(x: number, y: number, shape: Shape): boolean {
        const threshold = 5;
        if (shape.type === "line" || shape.type === "arrow") {
            return this.isPointNearLine(
                x,
                y,
                { x: shape.startX, y: shape.startY },
                { x: shape.endX, y: shape.endY },
                threshold
            );
        }

        if (shape.type === "draw" && shape.points.length > 1) {
            for (let i = 0; i < shape.points.length - 1; i++) {
                if (this.isPointNearLine(x, y, shape.points[i], shape.points[i + 1], threshold)) {
                    return true;
                }
            }
        }

        return false;
    }

    isPointNearLine(
        x: number,
        y: number,
        p1: { x: number; y: number },
        p2: { x: number; y: number },
        threshold: number
    ): boolean {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const lengthSq = dx * dx + dy * dy;

        if (lengthSq === 0) {
            const distSq = (x - p1.x) ** 2 + (y - p1.y) ** 2;
            return distSq <= threshold * threshold;
        }

        const t = ((x - p1.x) * dx + (y - p1.y) * dy) / lengthSq;
        if (t < 0 || t > 1) return false;

        const projX = p1.x + t * dx;
        const projY = p1.y + t * dy;
        const distSq = (x - projX) ** 2 + (y - projY) ** 2;

        return distSq <= threshold * threshold;
    }


    rectange(
        x: number,
        y: number,
        width: number,
        height: number
    ){

    }
}