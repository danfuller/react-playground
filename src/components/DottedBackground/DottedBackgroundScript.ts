const DOT_SIZE = 18
const PHANTOM_COUNT = 2
const PHANTOM_SPEED = 3
const DRAW_PHANTOMS = false
const PROXIMITY_THRESHOLD = 500
const MIN_MODIFIER_VALUE = 0
const SPACING = 4
const RESPAWN_PHANTOMS = true
const RENDER_OFF_SCREEN = false

const PHANTOM_COLOR = `rgb(200, 0, 0)`
const BACKGROUND_COLOR = `rgb(71, 71, 71)`;
const DOT_COLOR = `rgb(63, 63, 63)`;


/* 
TODO:
Random speed
correct phantom end targets based on end edge
maybe auto scale phantom count or quality if running a crap fps
reset dots on resize (not phantoms)
debug wether dpr ratio is messing with phantom targets
*/


export class DottedBackgroundAnimation {
  targetCanvas: HTMLCanvasElement
  targetCtx: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  hasResized: boolean = false

  dots: Dot[] = []
  phantoms: Phantom[] = []
  
  constructor(
    targetCanvas : HTMLCanvasElement
  ) {
    // Target canvas, where the canvas state will be rendered
    this.targetCanvas = targetCanvas
    this.targetCtx = targetCanvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D

    // Internal / off screen canvas where the visual state is computed
    this.canvas = RENDER_OFF_SCREEN ? document.createElement("canvas") : targetCanvas
    this.ctx = this.canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D
    this.resizeCanvas()


    // reset this on resize
    const rows = Math.floor(this.canvas.height / (DOT_SIZE + (SPACING)))
    const cols = Math.floor(this.canvas.width / (DOT_SIZE + (SPACING)))

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = ((j) * SPACING) + ((j + 1) * DOT_SIZE)
        const y = ((i) * SPACING) + ((i + 1) * DOT_SIZE)
        this.dots.push(new Dot(x, y, this.ctx))
      }
    }

    for (let ps = 0; ps < PHANTOM_COUNT; ps++) {
      this.phantoms.push(new Phantom(this.canvas, this.ctx))      
    }

    window.addEventListener("resize", this.resizeCanvas.bind(this))

    this.animate()
  }

  fillBackground() {
    this.ctx.fillStyle = BACKGROUND_COLOR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  configureDPR() {
    const dpr = window.devicePixelRatio;
    const rect = this.canvas?.parentElement?.getBoundingClientRect()
    if (!rect) {
      return
    }

    // Set the "actual" size of the canvas
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    // Scale the context to ensure correct drawing operations
    this.ctx.scale(dpr, dpr);

    // Set the "drawn" size of the canvas
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
  }

  resizeCanvas() {
    const container = this.canvas.parentElement
    if (container) {
      this.canvas.width = container.offsetWidth
      this.canvas.height = container.offsetHeight
      this.targetCanvas.width = container.offsetWidth
      this.targetCanvas.height = container.offsetHeight
    }
    this.configureDPR()
    this.fillBackground()
    this.hasResized = true
  }

  updateState() {
    let distance, strength, normalized, modifierValue, coords
    this.phantoms.forEach((phantom, phantomIndex) => {
      const { x, y } = phantom
      this.dots.forEach((dot) => {
        if (this.hasResized) {
          dot.drawStaticDoc()
        }
        distance = Math.sqrt(
          Math.pow(dot.x - x, 2) + Math.pow(dot.y - y, 2)
        )
        if (distance < PROXIMITY_THRESHOLD) {
          strength = (PROXIMITY_THRESHOLD - distance) / PROXIMITY_THRESHOLD // relative distance within threshhold
          normalized = Math.round(strength * 100) / 100 // to 0.0 - 0.1
          modifierValue = 1 - (normalized * (1 - MIN_MODIFIER_VALUE))
          dot.addModifier(phantomIndex, modifierValue);
        } else {
          dot.removeModifier(phantomIndex);
        }
      })
    })
    if (this.hasResized) {
      this.hasResized = false
    }
  }

  animate() {
    // if (!RENDER_OFF_SCREEN) 
    // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    
    this.dots.forEach((dot) => {
      dot.draw()
    })

    this.phantoms.forEach((phantom) => {
      phantom.update()
      // phantom.draw()
    })

    if (RENDER_OFF_SCREEN) {
      this.targetCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.targetCtx.drawImage(this.canvas, 0, 0)
    }

    this.updateState()

    requestAnimationFrame(this.animate.bind(this))
  }
}

class Dot {
  x: number
  y: number
  ctx: CanvasRenderingContext2D

  modifiers: {[n: number]: number}
  lastModifierStrength: number
  shouldUpdate: boolean


  originalOpacity: number
  originalSize: number
  inRange: boolean
  opacity: number
  size: number

  constructor(
    x : number, 
    y : number,
    ctx: CanvasRenderingContext2D
  ) {
    this.x = x //Math.floor(x + SPACING / 2 + SPACING * x)
    this.y = y //Math.floor(y + SPACING / 2 + SPACING * y)
    this.ctx = ctx

    this.modifiers = {}
    this.lastModifierStrength = 0
    this.shouldUpdate = false

    // tidy up
    this.originalOpacity = 1
    this.originalSize = DOT_SIZE
    this.inRange = false
    this.opacity = this.originalOpacity
    this.size = this.originalSize

    this.drawStaticDoc();
  }

  drawStaticDoc() {
    this.ctx.fillStyle = DOT_COLOR
    this.ctx.beginPath()
    this.ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2)
    this.ctx.fill()
  }

  drawDot() {
    this.ctx.fillStyle = DOT_COLOR
    this.ctx.beginPath()
    this.ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2)
    this.ctx.fill()
  }

  clearBounds() {
    const clearBounds : [number,number,number,number] = [
      Math.floor(this.x - this.originalSize / 2), 
      Math.floor(this.y - this.originalSize / 2), 
      this.originalSize,
      this.originalSize,
    ]
    this.ctx.fillStyle = BACKGROUND_COLOR
    this.ctx.fillRect(...clearBounds)
    // this.ctx.clearRect(...clearBounds)
  }

  draw() {
    // if is in range, clear the context area holding this dot
    if (this.inRange) {
      this.applyModifiers()
      if (this.shouldUpdate) {
        this.clearBounds()
        this.drawDot()
      }
    } 
  }

  applyModifiers() {
    const maxStrength = Math.min(...Object.values(this.modifiers)) || 0
    // this.opacity = 1 * maxStrength
    if (this.lastModifierStrength != maxStrength) {
      this.shouldUpdate = true
    } else {
      this.shouldUpdate = false
    }
    this.size = DOT_SIZE * maxStrength
    this.lastModifierStrength = maxStrength 
  }

  addModifier(index: number, strength: number) {
    this.modifiers[index] = strength
    if (Object.keys(this.modifiers).length && !this.inRange) {
      this.inRange = true
    }
  }

  removeModifier(index: number) {
    if (!this.modifiers[index]) {
      return
    }
    delete this.modifiers[index]
    if (!Object.keys(this.modifiers).length && this.inRange) {
      this.inRange = false
      this.reset()
    }
  }

  reset() {
    this.opacity = this.originalOpacity
    this.size = this.originalSize
    this.clearBounds()
    this.drawStaticDoc()
  }
}

type Vector = {
  x: number
  y: number
}

const PHANTOM_EDGE_SPACING = 400
class Phantom {
  vector: Vector
  speed: number
  x: number
  y: number
  isActive: boolean
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
    this.speed = PHANTOM_SPEED
    this.canvas = canvas
    this.ctx = ctx

    this.isActive = false
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
      return Math.floor(Math.random() * length) + 1;
    }

    let canvasHeight = this.canvas.height,
        canvasWidth = this.canvas.width
    switch (startingEdge) {
      case 0: 
        startPosition.x = randomPosition(canvasWidth)
        startPosition.y = -PROXIMITY_THRESHOLD
        endPosition.x = randomPosition(canvasWidth)
        endPosition.y = canvasHeight + PROXIMITY_THRESHOLD
        break
      case 1:
        startPosition.x = canvasWidth + PROXIMITY_THRESHOLD
        startPosition.y = randomPosition(canvasHeight)
        endPosition.x = -PROXIMITY_THRESHOLD
        endPosition.y = randomPosition(canvasHeight)
        break
      case 2:
        startPosition.x = randomPosition(canvasWidth)
        startPosition.y = canvasHeight + PROXIMITY_THRESHOLD
        endPosition.x = randomPosition(canvasWidth)
        endPosition.y = -PROXIMITY_THRESHOLD
        break
      case 3:
        startPosition.x = -PROXIMITY_THRESHOLD
        startPosition.y = randomPosition(canvasHeight)
        endPosition.x = canvasWidth + PROXIMITY_THRESHOLD
        endPosition.y = randomPosition(canvasHeight)
        break
    }

    this.startingEdge = startingEdge
    this.startPosition = startPosition
    this.endPosition = endPosition
    this.x = startPosition.x
    this.y = startPosition.y
    this.vector = this.directionVector(startPosition, endPosition);
    this.isActive = true
  }

  update() {
    if (!this.isActive) {
      return
    }

    this.x += this.vector.x * this.speed
    this.y += this.vector.y * this.speed

    if (DRAW_PHANTOMS) {
      this.draw()
    }

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
      this.isActive = false
      if (RESPAWN_PHANTOMS) {
        setTimeout(this.calculateTrajectory.bind(this), 200)
      }
    }

    // check if x or y position is at edge (use function)
    // add start/endPositions to class
  }

  draw() {
    this.ctx.fillStyle = PHANTOM_COLOR;
    this.ctx.beginPath()
    this.ctx.arc(this.x, this.y, DOT_SIZE / 2, 0, Math.PI * 2)
    this.ctx.fill()
  }
}