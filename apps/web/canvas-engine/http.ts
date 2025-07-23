import { HTTP_URL } from "@/config";
import axios from "axios";

export async function getExistingShapes(boardId: string | null){
    const response = await axios.get(`${HTTP_URL}/api/v1/shape/${boardId}`)
    const data = response.data.shapes 
    // console.log("shapes: ", data)
    const shapes = data.map((x: { id: number; message: string }) => {
        const shape = JSON.parse(x.message)
        return { id: x.id, ...shape };
    })

    // console.log("shapes: ", shapes)

    return shapes;
}