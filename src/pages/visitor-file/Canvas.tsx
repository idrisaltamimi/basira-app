import { useRef, useState } from "react"
import CanvasDraw from "react-canvas-draw"
import { LuUndo2 } from "react-icons/lu"
import { MdDeleteForever } from "react-icons/md"

import { Button } from "@/components/ui/shadcn/button"
import muscularSystem from "../../assets/muscular-system.jpg"
import { Label } from "@radix-ui/react-label"

export default function Canvas() {
  const { undo, clear, selectColor, color, canvasRef } = useCanvas()

  return (
    <>
      <Label>مواضع العلاج</Label>
      <div className="flex items-center gap-4 my-4">
        <Button variant="outline" size="sm" onClick={undo} className="flex gap-2">
          <LuUndo2 className="-scale-x-100" />
          تراجع
        </Button>

        <Button variant="outline" size="sm" onClick={clear} className="flex gap-2">
          <MdDeleteForever />
          حذف
        </Button>

        <div className="flex gap-1 mr-auto">
          <Button
            size="icon"
            className="w-6 h-6 bg-black rounded-full"
            value="rgb(0, 0, 0)"
            onClick={selectColor}
          />
          <Button
            size="icon"
            className="w-6 h-6 bg-red-700 rounded-full"
            value="rgb(185 28 28)"
            onClick={selectColor}
          />
          <Button
            size="icon"
            className="w-6 h-6 bg-blue-700 rounded-full"
            value="rgb(29 78 216)"
            onClick={selectColor}
          />
          <Button
            size="icon"
            className="w-6 h-6 bg-green-700 rounded-full"
            value="rgb(21 128 61)"
            onClick={selectColor}
          />
        </div>
      </div>

      <div className="relative bg-white rounded-2xl">
        <CanvasDraw
          className="relative z-10"
          ref={canvasRef}
          backgroundColor="transparent"
          hideGrid
          brushColor={color}
          catenaryColor={color}
          brushRadius={2}
          lazyRadius={0}
          loadTimeOffset={0}
          canvasWidth={774}
          canvasHeight={352}
        />

        <img
          src={muscularSystem}
          alt=""
          className="absolute top-0 right-0 object-contain w-full h-full pointer-events-none"
        />
      </div>
    </>
  )
}

function useCanvas() {
  const [color, setColor] = useState("rgb(0, 0, 0)")

  const canvasRef = useRef<CanvasDraw | null>(null)

  const selectColor = (e: React.MouseEvent<HTMLButtonElement>) => {
    setColor(e.currentTarget.value)
  }

  const undo = () => {
    if (!canvasRef.current) return
    canvasRef.current.undo()
  }

  const clear = () => {
    if (!canvasRef.current) return
    canvasRef.current.clear()
  }

  const saveImage = () => {
    if (!canvasRef.current) return
    const string = canvasRef.current.getSaveData()
    console.log(string)
  }

  return { color, selectColor, undo, clear, saveImage, canvasRef }
}
