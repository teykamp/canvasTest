<template>
  <div style="display: inline">
    <div>
      <canvas ref="canvas" :width="width" :height="height" @mousedown="startDrag" @mousemove="drag" @mouseup="endDrag"
        @mouseleave="endDrag" @dblclick="createCircle
        "></canvas>
    </div>
    <p>
      {{ overlaps }}
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'

const width = 400
const height = 400
const canvas = ref(null)
const dragging = ref(false)
const currentCircleIndex = ref(null)

const circles = reactive([])
const overlaps = reactive([])

const drawCircle = (ctx, circle, fillStyle = 'green', strokeStyle = '#003300') => {
  ctx.beginPath()
  ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false)
  ctx.fillStyle = fillStyle
  ctx.fill()
  ctx.lineWidth = 5
  ctx.strokeStyle = strokeStyle
  ctx.stroke()
}

const drawCircles = () => {
  const ctx = canvas.value.getContext('2d')
  ctx.clearRect(0, 0, width, height)
  circles.forEach(circle => drawCircle(ctx, circle))
  highlightOverlappingAreas(ctx)
}

const isInsideCircle = (x, y, circle) => {
  const dx = x - circle.x
  const dy = y - circle.y
  return dx * dx + dy * dy <= circle.radius * circle.radius
}

const startDrag = (event) => {
  const rect = canvas.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top
  currentCircleIndex.value = circles.findIndex(circle => isInsideCircle(mouseX, mouseY, circle))
  if (currentCircleIndex.value !== -1) {
    dragging.value = true
    const circle = circles[currentCircleIndex.value]
    circle.offsetX = mouseX - circle.x
    circle.offsetY = mouseY - circle.y
  }
}

const drag = (event) => {
  if (dragging.value && currentCircleIndex.value !== null) {
    const rect = canvas.value.getBoundingClientRect()
    const circle = circles[currentCircleIndex.value]
    circle.x = event.clientX - rect.left - circle.offsetX
    circle.y = event.clientY - rect.top - circle.offsetY
    drawCircles()
  }
}

const endDrag = () => {
  dragging.value = false
  currentCircleIndex.value = null
}

const createCircle = (event) => {
  const rect = canvas.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top
  circles.push({
    x: mouseX,
    y: mouseY,
    radius: 70,
    offsetX: 0,
    offsetY: 0,
  })
  drawCircles()
}

const highlightOverlappingAreas = (ctx) => {
  overlaps.length = 0 // Clear existing overlaps

  for (let i = 0; i < circles.length; i++) {
    for (let j = i + 1; j < circles.length; j++) {
      const circle1 = circles[i]
      const circle2 = circles[j]
      const dx = circle2.x - circle1.x
      const dy = circle2.y - circle1.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < circle1.radius + circle2.radius) {
        const overlap = {
          circle1,
          circle2,
          color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`,
        }
        overlaps.push(overlap)

        ctx.save()
        ctx.beginPath()
        ctx.arc(circle1.x, circle1.y, circle1.radius, 0, 2 * Math.PI)
        ctx.clip()
        ctx.beginPath()
        ctx.arc(circle2.x, circle2.y, circle2.radius, 0, 2 * Math.PI)
        ctx.clip()

        ctx.fillStyle = overlap.color
        ctx.fillRect(0, 0, width, height)
        ctx.restore()
      }
    }
  }
}

onMounted(() => {
  drawCircles()
})
</script>

<style scoped>
canvas {
  border: 1px solid black;
}
</style>
