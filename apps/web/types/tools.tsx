import { Circle, Diamond, Eraser, Hand, Minus, MousePointer, MoveRight, Pencil, Square } from "lucide-react";
import { Tool } from "./canvasengine";

export const tools: Tool[] = [
    {
        type: "select",
        icon: <MousePointer size={16} />,
        shortcut: "V",
        label: "Selection"
    },
    {
        type: "grab",
        icon: <Hand size={16} />,
        shortcut: "H",
        label: "Hand"
    },
    {
        type: "rectangle",
        icon: <Square size={16} />,
        shortcut: "R",
        label: "Rectangle"
    },
    {
        type: "ellipse",
        icon: <Circle size={16} />,
        shortcut: "O",
        label: "Ellipse"
    },
    {
        type: "diamond",
        icon: <Diamond size={16} />,
        shortcut: "D",
        label: "Diamond"
    },
    {
        type: "line",
        icon: <Minus size={16} />,
        shortcut: "L",
        label: "Line"
    },
    {
        type: "arrow",
        icon: <MoveRight size={16} />,
        shortcut: "A",
        label: "Arrow"
    },
    {
        type: "draw",
        icon: <Pencil size={16} />,
        shortcut: "P",
        label: "Free Draw"
    },
    {
        type: "text",
        icon: <TextIcon />,
        shortcut: "T",
        label: "Text"
    },
    {
        type: "eraser",
        icon: <Eraser size={16} />,
        shortcut: "E",
        label: "Eraser"
    }
]

function TextIcon(){
    return (
        <svg role="img" width="13" height="9" focusable="false" aria-hidden="true" viewBox="0 0 13 9" className=""><path fillRule="evenodd" clipRule="evenodd" fill="currentColor" d="M5.75 0C5.33579 0 5 0.335786 5 0.75C5 1.16421 5.33579 1.5 5.75 1.5H8V7.75C8 8.16421 8.33579 8.5 8.75 8.5C9.16421 8.5 9.5 8.16421 9.5 7.75V1.5H11.75C12.1642 1.5 12.5 1.16421 12.5 0.75C12.5 0.335786 12.1642 0 11.75 0H5.75ZM0.75 3C0.335786 3 0 3.33579 0 3.75C0 4.16421 0.335786 4.5 0.75 4.5H2V7.75C2 8.16421 2.33579 8.5 2.75 8.5C3.16421 8.5 3.5 8.16421 3.5 7.75V4.5H4.75C5.16421 4.5 5.5 4.16421 5.5 3.75C5.5 3.33579 5.16421 3 4.75 3H0.75Z"></path></svg>
    )
}