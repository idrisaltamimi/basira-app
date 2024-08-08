import { compressToUTF16 } from "lz-string"
import { useRef, useState } from "react"
import CanvasDraw from "react-canvas-draw"

export default function useCanvas() {
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

  const image = () => {
    if (!canvasRef.current) return ""
    const imgString = canvasRef.current.getSaveData()
    const compressToUTF16Image = compressToUTF16(imgString)
    return compressToUTF16Image
  }

  return { color, selectColor, undo, clear, image, canvasRef }
}
