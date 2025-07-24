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
import EraserCursor from './EraserCursor';


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
            <canvas ref={canvasRef} style={{
                cursor: selectedTool === "eraser" ? "none" : "crosshair",
            }}></canvas>
            {selectedTool === "eraser" && <EraserCursor size={24} isActive={true} />}

            <div className="fixed bottom-1 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-2 py-1.5 rounded-md bg-neutral-800 flex gap-2">
                {tools.map((tool, idx) => (
                    <Tooltip key={idx}>
                        <TooltipTrigger asChild>
                            <Button 
                                size="icon"
                                variant={selectedTool === tool.type ? "secondary" : "ghost"}
                                onClick={(e) => setSelectedTool(tool.type)}
                                className={`px-2.5 py-2.5 rounded-sm text-neutral-100 hover:bg-neutral-700/60 ${selectedTool === tool.type ? "bg-neutral-700" : ""} relative cursor-pointer`}
                            >
                                <span>{tool.icon}</span>
                                <span className="sr-only">{tool.label}</span>
                                <span className="hidden xl:block absolute bottom-0.5 right-[3px] text-[8px] text-neutral-200 dark:text-icon-fill-color-d">{tool.shortcut}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{tool.label}</TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </>
    )
}

export default Canvas