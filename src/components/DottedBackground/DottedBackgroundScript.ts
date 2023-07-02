const DOT_SIZE = 4;
const OPACITY_REDUCTION = 0.2;
const PROXIMITY_THRESHOLD = 200;
const SPACING = 1;

// Variables
let renderCanvas, ctx;
let dots = [];
let phantoms = [];

// Dot class
class Dot {
  constructor(x, y) {
    this.x = x + SPACING / 2 + SPACING * x;
    this.y = y + SPACING / 2 + SPACING * y;
    this.originalOpacity = 1;
    this.originalSize = DOT_SIZE;
    this.opacity = this.originalOpacity;
    this.size = this.originalSize;
  }

  draw() {
    if ((this.x == 72.5) & (this.y == 72.5)) {
      ctx.fillStyle = `rgba(0, 255, 255, ${this.opacity})`;
    } else {
      ctx.fillStyle = `rgba(48, 48, 48, ${this.opacity})`;
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  shrink(strength) {
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

// Initialize the canvas and dots
export function initialize(canvas) {
  console.clear();
  renderCanvas = canvas;
  ctx = renderCanvas.getContext("2d");
  resizeCanvas();

  const rows = Math.floor(canvas.height / (DOT_SIZE * 2));
  const cols = Math.floor(canvas.width / (DOT_SIZE * 2));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x = (j * 2 + 1) * DOT_SIZE;
      const y = (i * 2 + 1) * DOT_SIZE;
      dots.push(new Dot(x, y));
    }
  }

  phantoms.push(new Phantom());

  // canvas.addEventListener('mousemove', handleMouseMove);
  // canvas.addEventListener('mouseleave', resetDots);
  window.addEventListener("resize", resizeCanvas);

  animate();
}

class Phantom {
  vector: any;
  speed: any;
  x: number;
  y: number;
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vector = [1, 1];
    this.speed = 1;
  }

  update() {
    this.x += this.vector[0] * this.speed;
    this.y += this.vector[0] * this.speed;

    // if (this.x >)
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, DOT_SIZE, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Handle mouse movement
function handleMouseMove() {
  // const mouseX = event.pageX - canvas.offsetLeft;
  // const mouseY = event.pageY - canvas.offsetTop;

  phantoms.forEach((phantom) => {
    const mouseX = phantom.x;
    const mouseY = phantom.y;

    dots.forEach((dot) => {
      const distance = Math.sqrt(
        Math.pow(dot.x - mouseX, 2) + Math.pow(dot.y - mouseY, 2)
      );

      if (distance < PROXIMITY_THRESHOLD) {
        const strength = (PROXIMITY_THRESHOLD - distance) / PROXIMITY_THRESHOLD;
        const normalized = Math.round(strength * 100) / 100;
        const clamped = 1 - Math.max(0, Math.min(normalized, 0.5));
        if ((dot.x == 72.5) && (dot.y == 72.5)) {
          console.log(clamped);
        }

        dot.shrink(clamped);
      } else {
        dot.reset();
      }
    });
  });
}

// Reset dots to their original size and opacity
function resetDots() {
  dots.forEach((dot) => dot.reset());
}

// Resize the canvas to fit the window
function resizeCanvas() {
  const container = renderCanvas.parentElement;
  renderCanvas.width = container.offsetWidth;
  renderCanvas.height = container.offsetHeight;
}

// Main animation loop
function animate() {
  ctx.clearRect(0, 0, renderCanvas.width, renderCanvas.height);

  dots.forEach((dot) => {
    dot.draw();
  });

  phantoms.forEach((phantom) => {
    phantom.update();
    // phantom.draw();
  });

  handleMouseMove();

  requestAnimationFrame(animate);
}

// Initialize the script
// initialize();
