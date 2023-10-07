<template>
  <div>
    <canvas ref="canvas" :style="{
      border: '1px solid white',
    }"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const c = {
  width: 700,
  height: 700
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
  for (let i = 0; i < 50; i++) {
    particles.push({ 
      x: Math.random() * c.width, 
      y: Math.random() * (3 * c.height / 4 - c.height / 4) + c.height / 4, 
      a: 0,
      c: colors[Math.floor(Math.random() * colors.length)]
    })
  }
}

function writeText(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, text: string) {
  let size = c.width / 5
  context.font = size + "px Montserrat";
  context.fillStyle = "#111111";
  context.textAlign = "center";
  let lineheight = 70
  let lines = text.split('\n');
  for(let i = 0; i<lines.length; i++){
    context.fillText(lines[i], canvas.width/2, canvas.height/2 + lineheight*i - (lineheight*(lines.length-1))/3);
  }
}
onMounted(() => {
  function maskCanvas(c1: {canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D}, c2: {canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D}, c3: {canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D}) {
    c3.ctx.drawImage(c2.canvas, 0, 0, c2.canvas.width, c2.canvas.height);
    c3.ctx.globalCompositeOperation = 'source-atop';
    c3.ctx.drawImage(c1.canvas, 0, 0);
    blur(c1.canvas, c1.ctx, 2)
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
    c1.ctx.value.lineWidth = 20;
    for (const particle of particles){
      c1.ctx.value.beginPath();
      c1.ctx.value.arc(particle.x, particle.y, 10, 0, Math.PI * 2);
      c1.ctx.value.fill();
      c1.ctx.value.strokeStyle = particle.c;
      c1.ctx.value.filter = 'blur(5px)'
      c1.ctx.value.stroke();
    }
    move()
  }
  
    function clear(){
      c1.ctx.value.globalAlpha = 0.03;
      c1.ctx.value.fillStyle = '#111111';
      c1.ctx.value.fillRect(0, 0, c.width, c.height);
      c1.ctx.value.globalAlpha = 1;
    }
    getParticles()
    let c1 = createCanvas({ width: c.width, height: c.height })
    let c2 = createCanvas({ width: c.width, height: c.height })
    let c3 = createCanvas({ width: c.width, height: c.height })
    writeText(c2.canvas.value, c2.ctx.value, 'Thomas\n\nThomas')
    maskCanvas({ canvas: c1.canvas.value, ctx: c1.ctx.value },
                { canvas: c2.canvas.value, ctx: c2.ctx.value },
                { canvas: c3.canvas.value, ctx: c3.ctx.value })
    
    animationLoop()
    
})
</script>