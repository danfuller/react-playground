import { useRef, useEffect } from "react";
import { DottedBackgroundAnimation } from "./DottedBackgroundScript"

export const DottedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    console.log(canvasRef.current)
    new DottedBackgroundAnimation(canvasRef.current as HTMLCanvasElement)
  }, [canvasRef])
  return (
    <canvas ref={canvasRef}></canvas>
  )
} 