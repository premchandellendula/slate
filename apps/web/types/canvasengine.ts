export type ToolType =
    | "select"
    | "grab"
    | "rectangle"
    | "diamond"
    | "ellipse"
    | "line"
    | "arrow"
    | "draw"
    | "text"
    | "eraser"

export type Tool = {
    type: ToolType;
    icon: React.ReactNode;
    label: string;
    shortcut: string;
};

export type Shape = {
    type: "rectangle",
    x: number,
    y: number,
    width: number,
    height: number
} | {
    type: "ellipse",
    centreX: number,
    centreY: number,
    radiusX: number,
    radiusY: number
} | {
    type: "line",
    startX: number,
    startY: number,
    endX: number,
    endY: number
} | {
    type: "arrow",
    startX: number,
    startY: number,
    endX: number,
    endY: number
} | {
    type: "diamond",
    centreX: number,
    centreY: number,
    distX: number,
    distY: number
} | {
    type: "text",
    x: number,
    y: number,
    width: number,
    height: number,
    text: string
} | {
    type: "draw",
    points?: { x: number; y: number }[];
}