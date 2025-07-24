"use client"
import React, { useEffect, useRef } from 'react'

interface IEraserCursor {
    size: number,
    isActive: boolean
}

const EraserCursor = ({size, isActive}: IEraserCursor) => {
    const cursorRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!isActive) return

        const handleMouseMove = (e: MouseEvent) => {
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
            }
        }

        document.addEventListener('mousemove', handleMouseMove)

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
        }
    }, [isActive])

    if (!isActive) return null
    return (
        <>
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 pointer-events-none z-50"
                style={{
                    width: `10px`,
                    height: `10px`,
                    borderRadius: "50%",
                    backgroundColor: "white",
                    border: `1.5px solid white`,
                    transform: "translate(-50%, -50%)",
                    boxShadow: "0 0 5px rgba(0, 0, 0, 0.2)",
                    pointerEvents: "none",
                    mixBlendMode: "exclusion",
                    maskImage: "radial-gradient(circle, white 100%, transparent 100%)",
                }}
            />
        </>
    )
}

export default EraserCursor