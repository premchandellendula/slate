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
    id: string,
    type: "rectangle",
    x: number,
    y: number,
    width: number,
    height: number
} | {
    id: string,
    type: "ellipse",
    centreX: number,
    centreY: number,
    radiusX: number,
    radiusY: number
} | {
    id: string,
    type: "line",
    startX: number,
    startY: number,
    endX: number,
    endY: number
} | {
    id: string,
    type: "arrow",
    startX: number,
    startY: number,
    endX: number,
    endY: number
} | {
    id: string,
    type: "diamond",
    centreX: number,
    centreY: number,
    distX: number,
    distY: number
} | {
    id: string,
    type: "text",
    x: number,
    y: number,
    width: number,
    height: number,
    text: string
} | {
    id: string,
    type: "draw",
    points: { x: number; y: number }[];
}

