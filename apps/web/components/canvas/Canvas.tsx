"use client"
import { HTTP_URL } from '@/config';
import { ToolType } from '@/types/canvasengine';
import { tools } from '@/types/tools';
import { CanvasEngine } from '@canvas-engine/CanvasEngine';
import axios from 'axios';
import { Circle, Diamond, Minus, MoveRight, Square } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';


const Canvas = ({boardId}: {boardId: string}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedTool, setSelectedTool] = useState<ToolType>("rectangle");
    const [engine, setEngine] = useState<CanvasEngine>()

    useEffect(() => {
        engine?.setActiveTool(selectedTool);
    }, [selectedTool, engine]);
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

            <div className="fixed bottom-1 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-2 py-1.5 rounded-md bg-neutral-800 flex gap-2">
                {tools.map((tool, idx) => (
                    <Tooltip key={idx}>
                        <TooltipTrigger asChild>
                            <Button 
                                size="icon"
                                variant={selectedTool === tool.type ? "secondary" : "ghost"}
                                onClick={(e) => setSelectedTool(tool.type)}
                                className={`px-2.5 py-2.5 rounded-sm text-neutral-100 hover:bg-neutral-700/60 ${selectedTool === tool.type ? "bg-neutral-700" : ""} relative`}
                            >
                                <span>{tool.icon}</span>
                                <span className="sr-only">{tool.label}</span>
                                <span className="hidden xl:block absolute bottom-0.5 right-[3px] text-[8px] text-neutral-200 dark:text-icon-fill-color-d">{tool.shortcut}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{tool.label}</TooltipContent>
                    </Tooltip>
                ))}
                {/* <button onClick={(e) => setTool("rectangle")} className={`px-2.5 py-2.5 rounded-md text-neutral-100 hover:bg-neutral-700/60 ${tool === "rectangle" ? "bg-neutral-700" : ""}`}>
                    <Square size={16} />
                </button>

                <button onClick={(e) => setTool("ellipse")} className={`px-2.5 py-2.5 rounded-md text-neutral-100 hover:bg-neutral-700/60 ${tool === "ellipse" ? "bg-neutral-700" : ""} relative`}>
                    <Circle size={16} />
                    <span className="hidden xl:block absolute bottom-0.5 right-1 text-[9px] text-neutral-200 dark:text-icon-fill-color-d">C</span>
                </button>
                <button onClick={(e) => setTool("diamond")} className={`px-2.5 py-2.5 rounded-md text-neutral-100 hover:bg-neutral-700/60 ${tool === "diamond" ? "bg-neutral-700" : ""}`}>
                    <Diamond size={16} />
                </button>

                <button onClick={(e) => setTool("line")} className={`px-2.5 py-2.5 rounded-md text-neutral-100 hover:bg-neutral-700/60 ${tool === "line" ? "bg-neutral-700" : ""}`}>
                    <Minus size={16} />
                </button>

                <button onClick={(e) => setTool("arrow")} className={`px-2.5 py-2.5 rounded-md text-neutral-100 hover:bg-neutral-700/60 ${tool === "arrow" ? "bg-neutral-700" : ""}`}>
                    <MoveRight size={16} />
                </button>


                <button onClick={(e) => setTool("text")} className={`px-2.5 py-2.5 rounded-md text-neutral-100 hover:bg-neutral-700/60 ${tool === "rectangle" ? "" : ""}`}>
                    <svg role="img" width="13" height="9" focusable="false" aria-hidden="true" viewBox="0 0 13 9" className=""><path fillRule="evenodd" clipRule="evenodd" fill="currentColor" d="M5.75 0C5.33579 0 5 0.335786 5 0.75C5 1.16421 5.33579 1.5 5.75 1.5H8V7.75C8 8.16421 8.33579 8.5 8.75 8.5C9.16421 8.5 9.5 8.16421 9.5 7.75V1.5H11.75C12.1642 1.5 12.5 1.16421 12.5 0.75C12.5 0.335786 12.1642 0 11.75 0H5.75ZM0.75 3C0.335786 3 0 3.33579 0 3.75C0 4.16421 0.335786 4.5 0.75 4.5H2V7.75C2 8.16421 2.33579 8.5 2.75 8.5C3.16421 8.5 3.5 8.16421 3.5 7.75V4.5H4.75C5.16421 4.5 5.5 4.16421 5.5 3.75C5.5 3.33579 5.16421 3 4.75 3H0.75Z"></path></svg>
                </button> */}
            </div>
        </>
    )
}

export default Canvas