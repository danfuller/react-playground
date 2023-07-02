const DOT_SIZE = 4
const OPACITY_REDUCTION = 0.2
const PROXIMITY_THRESHOLD = 200
const SPACING = 1

export class DottedBackgroundAnimation {
  targetCanvas: HTMLCanvasElement
  targetCtx: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  dots: Dot[] = []
  phantoms: Phantom[] = []
  
  constructor(
    targetCanvas : HTMLCanvasElement
  ) {
    // Target canvas, where the canvas state will be rendered
    this.targetCanvas = targetCanvas
    this.targetCtx = targetCanvas.getContext('2d') as CanvasRenderingContext2D
    // Internal / off screen canvas where the visual state is computed
    this.canvas = document.createElement("canvas")
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D
    this.resizeCanvas()

    const rows = Math.floor(this.canvas.height / (DOT_SIZE * 2))
    const cols = Math.floor(this.canvas.width / (DOT_SIZE * 2))

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = (j * 2 + 1) * DOT_SIZE
        const y = (i * 2 + 1) * DOT_SIZE
        this.dots.push(new Dot(x, y, this.ctx))
      }
    }

    this.phantoms.push(new Phantom(this.canvas, this.ctx))

    // canvas.addEventListener('mousemove', handleMouseMove)
    // canvas.addEventListener('mouseleave', resetDots)
    window.addEventListener("resize", this.resizeCanvas)

    this.animate()
  }

  resizeCanvas() {
    const container = this.targetCanvas.parentElement
    if (container) {
      this.canvas.width = container.offsetWidth
      this.canvas.height = container.offsetHeight
      this.targetCanvas.width = container.offsetWidth
      this.targetCanvas.height = container.offsetHeight
    }
  }

  updateState() {
    this.phantoms.forEach((phantom) => {
      const mouseX = phantom.x
      const mouseY = phantom.y
  
      this.dots.forEach((dot) => {
        const distance = Math.sqrt(
          Math.pow(dot.x - mouseX, 2) + Math.pow(dot.y - mouseY, 2)
        )
  
        if (distance < PROXIMITY_THRESHOLD) {
          const strength = (PROXIMITY_THRESHOLD - distance) / PROXIMITY_THRESHOLD
          const normalized = Math.round(strength * 100) / 100
          const clamped = 1 - Math.max(0, Math.min(normalized, 0.5))
          if ((dot.x == 72.5) && (dot.y == 72.5)) {
            // console.log(clamped)
          }
  
          dot.shrink(clamped)
        } else {
          dot.reset()
        }
      })
    })
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    
    this.dots.forEach((dot) => {
      dot.draw()
    })

    this.phantoms.forEach((phantom) => {
      phantom.update()
      // phantom.draw()
    })

    this.targetCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.targetCtx.drawImage(this.canvas, 0, 0)

    this.updateState()

    requestAnimationFrame(this.animate.bind(this))
  }
}

class Dot {
  x: number
  y: number
  originalOpacity: number
  originalSize: number
  opacity: number
  size: number
  ctx: CanvasRenderingContext2D

  constructor(
    x : number, 
    y : number,
    ctx: CanvasRenderingContext2D
  ) {
    this.x = x + SPACING / 2 + SPACING * x
    this.y = y + SPACING / 2 + SPACING * y
    this.ctx = ctx
    this.originalOpacity = 1
    this.originalSize = DOT_SIZE
    this.opacity = this.originalOpacity
    this.size = this.originalSize
  }

  draw() {
    if ((this.x == 72.5) && (this.y == 72.5)) {
      this.ctx.fillStyle = `rgba(0, 255, 255, ${this.opacity})`
    } else {
      this.ctx.fillStyle = `rgba(48, 48, 48, ${this.opacity})`
    }

    this.ctx.beginPath()
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    this.ctx.fill()
  }

  shrink(strength: number) {
    this.opacity = 1 * strength
    this.size = DOT_SIZE * strength
    // this.opacity = Math.max(this.opacity, 0)
    // this.size = Math.max(this.size, 0)
  }

  reset() {
    this.opacity = this.originalOpacity
    this.size = this.originalSize
  }
}

type Vector = {
  x: number
  y: number
}

const PHANTOM_EDGE_SPACING = 220
class Phantom {
  vector: Vector
  speed: number
  x: number
  y: number
  startingEdge: number
  startPosition: Vector
  endPosition: Vector
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) {
    this.x = 0
    this.y = 0
    this.vector = { x: 1, y: 1 }
    this.speed = 2
    this.canvas = canvas
    this.ctx = ctx

    this.startingEdge = 0
    this.startPosition = {x: 0, y: 0}
    this.endPosition = {x: 0, y: 0}

    this.calculateTrajectory()
  }

  directionVector(start: Vector, end: Vector) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    const normalizedX = dx / magnitude;
    const normalizedY = dy / magnitude;
    return { x: normalizedX, y: normalizedY };
  }

  calculateTrajectory() {
    // Edges 0,1,2,3 = top,right,bottom,left
    const edges = [0,1,2,3]
    // Get edges to use when calculating target positions
    const startingEdge = edges.splice(Math.floor(Math.random() * edges.length), 1)[0]
    const destinationEdge = edges.splice(Math.floor(Math.random() * edges.length), 1)[0]

    let startPosition : Vector = { x: 0, y: 0 }, 
        endPosition: Vector = { x: 0, y: 0 }

    const randomPosition = (length: number) => {
      // maybe pick from center ~80% of the width rather than whole length
      console.log(length);
      return Math.floor(Math.random() * length) + 1;
    }

    switch (startingEdge) {
      case 0: 
        startPosition.x = randomPosition(this.canvas.width)
        startPosition.y = -PHANTOM_EDGE_SPACING
        endPosition.x = randomPosition(this.canvas.width)
        endPosition.y = this.canvas.height + PHANTOM_EDGE_SPACING
        break
      case 1:
        startPosition.x = this.canvas.width + PHANTOM_EDGE_SPACING
        startPosition.y = randomPosition(this.canvas.height)
        endPosition.x = -PHANTOM_EDGE_SPACING
        endPosition.y = randomPosition(this.canvas.height)
        break
      case 2:
        startPosition.x = randomPosition(this.canvas.width)
        startPosition.y = this.canvas.height + PHANTOM_EDGE_SPACING
        endPosition.x = randomPosition(this.canvas.width)
        endPosition.y = -PHANTOM_EDGE_SPACING
        break
      case 3:
        startPosition.x = -PHANTOM_EDGE_SPACING
        startPosition.y = randomPosition(this.canvas.height)
        endPosition.x = this.canvas.width + PHANTOM_EDGE_SPACING
        endPosition.y = randomPosition(this.canvas.height)
        break
    }

    this.startingEdge = startingEdge
    this.startPosition = startPosition
    this.endPosition = endPosition
    this.x = startPosition.x
    this.y = startPosition.y
    this.vector = this.directionVector(startPosition, endPosition);

    console.log(startingEdge, -PHANTOM_EDGE_SPACING, startPosition, endPosition, this.vector)
  }

  update() {
    this.x += this.vector.x * this.speed
    this.y += this.vector.y * this.speed

    let shouldReset
    switch (this.startingEdge) {
      case 0: 
        shouldReset = this.y >= this.endPosition.y
        break
      case 1:
        shouldReset = this.x <= this.endPosition.x
        break
      case 2:  
        shouldReset = this.y <= this.endPosition.y
        break
      case 3: 
        shouldReset = this.x >= this.endPosition.x
    }

    if (shouldReset) {
      setTimeout(this.calculateTrajectory.bind(this), 200)
    }

    // check if x or y position is at edge (use function)
    // add start/endPositions to class
  }

  draw() {
    this.ctx.beginPath()
    this.ctx.arc(this.x, this.y, DOT_SIZE, 0, Math.PI * 2)
    this.ctx.fill()
  }
}