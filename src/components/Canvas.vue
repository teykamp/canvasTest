<template>
  <div :style="{'display': 'flex'}">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const c = {
  width: window.innerWidth / 6 < 200 ? 200 : window.innerWidth / 6,
  height: window.innerWidth / 6 < 200 ? 200 : window.innerWidth / 6
}
const canvas = ref()
const ctx = ref()

const colors = ['#ff4200', '#ff4200', '#f03e00', '#e53c01', '#d83801', ]

function createCanvas(properties: {width: number, height: number}) {
  ctx.value = canvas.value.getContext('2d')
  canvas.value.width = properties.width
  canvas.value.height = properties.height
  return {
    canvas: canvas,
    ctx: ctx
  }
}

let particles: { x: number, y: number, a: number, c: string }[] = []

function getParticles() {
  for (let i = 0; i < c.width/50; i++) {
    particles.push({ 
      x: Math.random() * c.width, 
      y: Math.random() * (3 * c.height / 4 - c.height / 4) + c.height / 4, 
      a: 0,
      c: colors[Math.floor(Math.random() * colors.length)]
    })
  }
}

function writeText(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, text: string) {
  let size = c.width / 4
  context.font = `italic ${size}px Montserrat`;
  context.fillStyle = "#111111";
  context.textAlign = "center";
  let lineheight = 70
  let lines = text.split('\n');
  for(let i = 0; i<lines.length; i++){
    context.fillText(lines[i], canvas.width/2, canvas.height/2 + lineheight*i - (lineheight*(lines.length-1))/3);
  }
}
onMounted(() => {
  function maskCanvas(particleCanvas: {canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D}, textCanvas: {canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D}, displayCanvas: {canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D}) {
    displayCanvas.ctx.drawImage(textCanvas.canvas, 0, 0, textCanvas.canvas.width, textCanvas.canvas.height);
    displayCanvas.ctx.globalCompositeOperation = 'source-atop';
    displayCanvas.ctx.drawImage(particleCanvas.canvas, 0, 0);
    blur(particleCanvas.canvas, particleCanvas.ctx, 2)
  }

  function blur(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, amt: number) {
    ctx.filter = `blur(${ amt }px)`
    ctx.drawImage(canvas, 0, 0)
    ctx.filter = 'none'
  }

  function move() {
    let speed = 7
    for (let particle of particles) {
      particle.x += Math.cos(particle.a) * speed
      particle.y += Math.sin(particle.a) * speed
      if (particle.x > c.width 
      || particle.x < 0 
      || particle.y > c.height
      || particle.y < 0) {
        particle.a = (particle.a -Math.PI/2)
      }
      else particle.a += Math.random() * 0.8 - 0.4
    }

  }
  function animationLoop() {
    requestAnimationFrame(animationLoop)
    clear()
    particleCanvas.ctx.value.lineWidth = c.width/20;
    for (const particle of particles){
      particleCanvas.ctx.value.beginPath();
      particleCanvas.ctx.value.arc(particle.x, particle.y, 10, 0, Math.PI * 2);
      particleCanvas.ctx.value.fill();
      particleCanvas.ctx.value.strokeStyle = particle.c;
      particleCanvas.ctx.value.filter = 'blur(5px)'
      particleCanvas.ctx.value.stroke();
    }
    move()
  }
  
    function clear(){
      particleCanvas.ctx.value.globalAlpha = 0.03;
      particleCanvas.ctx.value.fillStyle = '#111111';
      particleCanvas.ctx.value.fillRect(0, 0, c.width, c.height);
      particleCanvas.ctx.value.globalAlpha = 1;
    }
    getParticles()
    let particleCanvas = createCanvas({ width: c.width, height: c.height })
    let textCanvas = createCanvas({ width: c.width, height: c.height })
    let displayCanvas = createCanvas({ width: c.width, height: c.height })
    writeText(textCanvas.canvas.value, textCanvas.ctx.value, 'Portfolio')
    maskCanvas({ canvas: particleCanvas.canvas.value, ctx: particleCanvas.ctx.value },
                { canvas: textCanvas.canvas.value, ctx: textCanvas.ctx.value },
                { canvas: displayCanvas.canvas.value, ctx: displayCanvas.ctx.value })
    
    animationLoop()
    
})
</script>