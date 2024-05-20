<template>
  <div>
    <canvas ref="canvas" :width="width" :height="height" @mousedown="startDrag" @mousemove="drag" @mouseup="endDrag"
      @mouseleave="endDrag" @dblclick="createCircle" @click.left="handleCanvasClick"
      @click.right.prevent="deleteCircle"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'

const width = 400
const height = 400
const canvas = ref(null)
const dragging = ref(false)
const resizing = ref(false)
const currentCircleIndex = ref(null)

const circles = reactive([])
const overlaps = reactive([]) // Array to store overlapping regions

const drawCircle = (ctx, circle) => {
  ctx.beginPath()
  ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false)
  ctx.fillStyle = 'grey'
  ctx.fill()
  
  if (circle.selected) {
    ctx.lineWidth = 5
    ctx.strokeStyle = 'white'
    ctx.stroke()
  //   ctx.beginPath()
  //   ctx.strokeStyle = 'blue'
  //   ctx.lineWidth = 1
  //   ctx.rect(circle.x - circle.radius - 1, circle.y - circle.radius - 1, circle.radius * 2 + 2, circle.radius * 2 + 2)
  //   ctx.stroke()
  }
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

const isOnEdge = (x, y, circle) => {
  const dx = x - circle.x
  const dy = y - circle.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return Math.abs(distance - circle.radius) < 5 // Consider within 5px of the edge as on the edge
}

const startDrag = (event) => {
  const rect = canvas.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top
  currentCircleIndex.value = circles.findLastIndex(circle => isInsideCircle(mouseX, mouseY, circle) || isOnEdge(mouseX, mouseY, circle))

  if (currentCircleIndex.value !== -1) {
    const circle = circles[currentCircleIndex.value]

    if (isOnEdge(mouseX, mouseY, circle)) {
      resizing.value = true
      circle.resizeStartX = mouseX
      circle.resizeStartY = mouseY
      circle.startRadius = circle.radius
    } else {
      dragging.value = true
      circle.offsetX = mouseX - circle.x
      circle.offsetY = mouseY - circle.y
    }

    circles.push(circles.splice(currentCircleIndex.value, 1)[0])
    currentCircleIndex.value = circles.length - 1 
    circles.forEach((c, index) => c.selected = index === currentCircleIndex.value)
    drawCircles()
  }
}

const drag = (event) => {
  if ((dragging.value || resizing.value) && currentCircleIndex.value !== null) {
    const rect = canvas.value.getBoundingClientRect()
    const circle = circles[currentCircleIndex.value]

    if (dragging.value) {
      circle.x = event.clientX - rect.left - circle.offsetX
      circle.y = event.clientY - rect.top - circle.offsetY
    } else if (resizing.value) {
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top
      const dx = mouseX - circle.x
      const dy = mouseY - circle.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      circle.radius = Math.max(10, distance) // Minimum radius
    }

    drawCircles()
  }
}

const endDrag = () => {
  dragging.value = false
  resizing.value = false
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
    resizeStartX: 0,
    resizeStartY: 0,
    startRadius: 0,
    selected: true,
  })
  drawCircles()
}

const handleCanvasClick = (event) => {
  const rect = canvas.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top
  const clickedCircleIndex = circles.findIndex(circle => isInsideCircle(mouseX, mouseY, circle))

  if (clickedCircleIndex === -1) {
    // Clicked outside of any circle
    circles.forEach(circle => circle.selected = false)
    drawCircles()
  }
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
          color: 'rgba(255, 0, 0, 0.5)',
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

const deleteCircle = () => {
  const selectedCircleIndex = circles.findIndex(circle => circle.selected)
  circles.splice(selectedCircleIndex)
  drawCircles()
}

onMounted(() => {
  drawCircles()
})
</script>

<style scoped>
canvas {
  border: 1px solid black
}
</style>
