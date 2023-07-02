const DOT_SIZE = 4
const OPACITY_REDUCTION = 0.2
const PROXIMITY_THRESHOLD = 200
const SPACING = 1

export class DottedBackgroundAnimation {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  dots: Dot[] = []
  phantoms: Phantom[] = []
  
  constructor(
    targetCanvas : HTMLCanvasElement
  ) {
    this.canvas = targetCanvas
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D
    this.resizeCanvas()

    const rows = Math.floor(this.canvas.height / (DOT_SIZE * 2));
    const cols = Math.floor(this.canvas.width / (DOT_SIZE * 2));

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = (j * 2 + 1) * DOT_SIZE;
        const y = (i * 2 + 1) * DOT_SIZE;
        this.dots.push(new Dot(x, y, this.ctx));
      }
    }

    this.phantoms.push(new Phantom(this.ctx));

    // canvas.addEventListener('mousemove', handleMouseMove);
    // canvas.addEventListener('mouseleave', resetDots);
    window.addEventListener("resize", this.resizeCanvas);

    this.animate();
  }

  resizeCanvas() {
    const container = this.canvas.parentElement
    if (container) {
      this.canvas.width = container.offsetWidth
      this.canvas.height = container.offsetHeight
    }
  }

  updateState() {
    this.phantoms.forEach((phantom) => {
      const mouseX = phantom.x;
      const mouseY = phantom.y;
  
      this.dots.forEach((dot) => {
        const distance = Math.sqrt(
          Math.pow(dot.x - mouseX, 2) + Math.pow(dot.y - mouseY, 2)
        );
  
        if (distance < PROXIMITY_THRESHOLD) {
          const strength = (PROXIMITY_THRESHOLD - distance) / PROXIMITY_THRESHOLD;
          const normalized = Math.round(strength * 100) / 100;
          const clamped = 1 - Math.max(0, Math.min(normalized, 0.5));
          if ((dot.x == 72.5) && (dot.y == 72.5)) {
            // console.log(clamped);
          }
  
          dot.shrink(clamped);
        } else {
          dot.reset();
        }
      });
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.dots.forEach((dot) => {
      dot.draw();
    });

    this.phantoms.forEach((phantom) => {
      phantom.update();
      // phantom.draw();
    });

    this.updateState();

    requestAnimationFrame(this.animate.bind(this));
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
    this.x = x + SPACING / 2 + SPACING * x;
    this.y = y + SPACING / 2 + SPACING * y;
    this.ctx = ctx
    this.originalOpacity = 1;
    this.originalSize = DOT_SIZE;
    this.opacity = this.originalOpacity;
    this.size = this.originalSize;
  }

  draw() {
    if ((this.x == 72.5) && (this.y == 72.5)) {
      this.ctx.fillStyle = `rgba(0, 255, 255, ${this.opacity})`;
    } else {
      this.ctx.fillStyle = `rgba(48, 48, 48, ${this.opacity})`;
    }

    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  shrink(strength: number) {
    this.opacity = 1 * strength;
    this.size = DOT_SIZE * strength;
    // this.opacity = Math.max(this.opacity, 0);
    // this.size = Math.max(this.size, 0);
  }

  reset() {
    this.opacity = this.originalOpacity;
    this.size = this.originalSize;
  }
}

class Phantom {
  vector: any;
  speed: any;
  x: number;
  y: number;
  ctx: CanvasRenderingContext2D

  constructor(
    ctx: CanvasRenderingContext2D
  ) {
    this.x = 0;
    this.y = 0;
    this.vector = [1, 1];
    this.speed = 1;
    this.ctx = ctx
  }

  update() {
    this.x += this.vector[0] * this.speed;
    this.y += this.vector[0] * this.speed;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, DOT_SIZE, 0, Math.PI * 2);
    this.ctx.fill();
  }
}