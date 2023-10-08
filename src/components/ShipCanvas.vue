<template>
<div :style="{'display': 'flex'}">
  <canvas ref="canvas" style="border: 5px white;"></canvas>
</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const c = {
  width: window.innerWidth / 4 < 200 ? 200 : window.innerWidth / 4,
  height: window.innerWidth / 4 < 200 ? 200 : window.innerWidth / 4
}
const canvas = ref()
const ctx = ref()
let particles: { x: number, y: number, c: string }[] = []

function createParticles() {
  for (let i = 0; i < c.width-2; i++) {
    particles.push({
      x: Math.random() * c.width,
      y: c.height - 5,
      c: 'blue'
    })
  }
}

function createCanvas(properties: {width: number, height: number}) {
  ctx.value = canvas.value.getContext('2d')
  canvas.value.width = properties.width
  canvas.value.height = properties.height
  return {
    canvas: canvas,
    ctx: ctx
  }
}
function move() {
  for (let particle of particles) {
    particle.y -= 1
  }
}

const status = ref({
  setOne: false,
  setTwo: false
})
onMounted(() => {
  const baseCanvas = createCanvas(c)
  createParticles()
  function animationLoop() {
    requestAnimationFrame(animationLoop)
    for (const particle of particles) {
      baseCanvas.ctx.value.fillStyle = particle.c;
      baseCanvas.ctx.value.fillRect(particle.x, particle.y, 1, 1)
    }
    move()
  }

  animationLoop()
})


// Method:
// Have all particles start at bottom
// have randmoized suction points above randomized between range at top of page
// every x animation loops turn suction on then off
// suction points have varying strength which changes every surge
// particles turn white based on proximity to suction point
// particles can only move linearly??or have them reset at the bottom and overlap animation
// with second set of particles
// probably need 2 sets of particles/suction points
</script>