export type ToolType =
    | "rectangle"
    | "ellipse"
    | "line"


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
    x: number,
    y: number,
    endX: number,
    endY: number
}