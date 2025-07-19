"use client"
import { HTTP_URL } from '@/config';
import { ToolType } from '@/types/canvasengine';
import { CanvasEngine } from '@canvas-engine/CanvasEngine';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'


const Canvas = ({boardId}: {boardId: string}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [tool, setTool] = useState<ToolType>("rectangle");
    const [engine, setEngine] = useState<CanvasEngine>()

    useEffect(() => {
        engine?.setActiveTool(tool);
    }, [tool, engine]);
    useEffect(() => {
        let canvasEngine: CanvasEngine;

        const initCanvas = async () => {
            // const response = await axios.get(`${HTTP_URL}/api/v1/auth/get-token`, {
            //     withCredentials: true
            // });

            // const token = response.data.token;
            // remove this after(below)
            const token = "123434";
            if (canvasRef.current) {
                canvasEngine = new CanvasEngine(canvasRef.current, boardId, token);
                setEngine(canvasEngine)
                return () => {
                    canvasEngine.destroy()
                };
            }
        };

        initCanvas();
    }, [canvasRef])

    return (
        <>
            <canvas ref={canvasRef}></canvas>

            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-md bg-accent flex gap-2">
                <button onClick={(e) => setTool("rectangle")} className="px-2 py-1 bg-neutral-100 border border-neutral-400">
                    R
                </button>

                <button onClick={(e) => setTool("ellipse")} className="px-2 py-1 bg-neutral-100 border border-neutral-400">
                    C
                </button>

                <button onClick={(e) => setTool("line")} className="px-2 py-1 bg-neutral-100 border border-neutral-400">
                    L
                </button>
            </div>
        </>
    )
}

export default Canvas