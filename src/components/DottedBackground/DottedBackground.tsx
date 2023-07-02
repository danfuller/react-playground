import { useRef, useEffect } from "react";
import { initialize } from "./DottedBackgroundScript"

export const DottedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    console.log(canvasRef)
    initialize(canvasRef.current)
  }, [canvasRef])
  return (
    <canvas ref={canvasRef}></canvas>
  )
} 