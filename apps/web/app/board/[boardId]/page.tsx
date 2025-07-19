
import Canvas from "@/components/canvas/Canvas";

export default async function Board({params}: {params: Promise<{boardId: string}>}){
    const {boardId} = await params
    
    return <Canvas boardId={boardId} />
    
}