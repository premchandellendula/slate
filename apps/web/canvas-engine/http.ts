import { HTTP_URL } from "@/config";
import axios from "axios";

export async function getExistingShapes(boardId: string | null){
    const response = await axios.get(`${HTTP_URL}/api/v1/shape/${boardId}`)
    const data = response.data.shapes 

    const shapes = data.map((x: {message: string}) => {
        const shape = JSON.parse(x.message)
        return shape;
    })

    return shapes;
}