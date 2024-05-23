<template>
  <div>
    <canvas ref="canvas" :width="width" :height="height" @mousedown="startDrag" @mousemove="drag" @mouseup="endDrag"
      @mouseleave="endDrag" @dblclick="createCircle" @click.left="handleCanvasClick"
      @click.right.prevent="deleteCircle"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'

interface Circle {
  id: number
  x: number
  y: number
  radius: number
  selected: boolean
  color: string
  offsetX: number
  offsetY: number
}

interface Overlap {
  circles: Circle[]
  color: string
  originalColor: string
  id: number
}

const width = window.innerWidth - 30
const height = window.innerHeight - 30

const currentCircleId = ref(0)
const currentOverlapId = ref(0)
const circlesSelectedByDrag = ref(false)

const canvas = ref<HTMLCanvasElement | null>(null)
const dragging = ref(false)
const resizing = ref(false)
const currentCircleIndex = ref<number | null>(null)
const isDrawing = ref(false)
const startPoint = reactive({ x: 0, y: 0 })
const currentPoint = reactive({ x: 0, y: 0 })

const circles = reactive<Circle[]>([])
const overlaps = reactive<Overlap[]>([])

const drawCircle = (ctx: CanvasRenderingContext2D, circle: Circle) => {
  ctx.beginPath()
  ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false)
  ctx.fillStyle = circle.color
  ctx.fill()
  if (circle.selected) {
    ctx.lineWidth = 5
    ctx.strokeStyle = 'white'
    ctx.stroke()
  }
}

const drawCircles = () => {
  if (!canvas.value) return
  const ctx = canvas.value.getContext('2d')!
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
  circles.forEach(circle => drawCircle(ctx, circle))
  highlightOverlappingAreas(ctx)
}

const getMousePos = (event: MouseEvent) => {
  if (!canvas.value) return { x: 0, y: 0 }
  const rect = canvas.value.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

const isInsideCircle = (x: number, y: number, circle: Circle) => {
  const dx = x - circle.x
  const dy = y - circle.y
  return dx * dx + dy * dy <= circle.radius * circle.radius
}

const isOnEdge = (x: number, y: number, circle: Circle) => {
  const dx = x - circle.x
  const dy = y - circle.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return Math.abs(distance - circle.radius) < 5
}

const findLastIndex = <T>(arr: T[], predicate: (value: T, index: number, obj: T[]) => boolean) => {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i], i, arr)) {
      return i
    }
  }
  return -1
}

const startDrag = (event: MouseEvent) => {
  const { x, y } = getMousePos(event)
  currentCircleIndex.value = findLastIndex(circles, circle => isInsideCircle(x, y, circle) || isOnEdge(x, y, circle))

  if (currentCircleIndex.value !== -1) {
    const circle = circles[currentCircleIndex.value]
    if (isOnEdge(x, y, circle)) {
      resizing.value = true
    } else {
      dragging.value = true
    }

    const selectedCirclesCount = circles.filter(c => c.selected).length
    // If no circles are selected, select the clicked circle
    if (selectedCirclesCount < 2) {
      circles.forEach((c, index) => c.selected = index === currentCircleIndex.value)
    }

    circles.forEach(c => {
      if (c.selected) {
        c.offsetX = x - c.x
        c.offsetY = y - c.y
      }
    })

    circles.push(circles.splice(currentCircleIndex.value, 1)[0])
    currentCircleIndex.value = circles.length - 1
    drawCircles()
  } else {
    startSelection(event)
  }
}

const drag = (event: MouseEvent) => {
  if ((dragging.value || resizing.value) && currentCircleIndex.value !== null) {
    const { x, y } = getMousePos(event)

    if (dragging.value) {
      circles.forEach(c => {
        if (c.selected) {
          c.x = x - c.offsetX
          c.y = y - c.offsetY
        }
      })
    } else if (resizing.value) {
      const circle = circles[currentCircleIndex.value]
      const dx = x - circle.x
      const dy = y - circle.y
      circle.radius = Math.max(10, Math.sqrt(dx * dx + dy * dy))
    }

    drawCircles()
  } else {
    drawSelection(event)
  }
}

const endDrag = () => {
  dragging.value = false
  resizing.value = false
  currentCircleIndex.value = null
  endSelection()
}

const createCircle = (event: MouseEvent) => {
  const { x, y } = getMousePos(event)
  circles.push({
    id: currentCircleId.value,
    x,
    y,
    radius: 70,
    selected: true,
    color: 'rgba(255, 255, 255, 0.6)',
    offsetX: 0,
    offsetY: 0,
  })
  currentCircleId.value++
  drawCircles()
}

const handleCanvasClick = (event: MouseEvent) => {
  const { x, y } = getMousePos(event)
  // let foundOverlap = false

  // const reversedOverlaps = overlaps.slice().reverse()
  // // TODO: just run for loop in reverse

  // for (let i = 0 i < reversedOverlaps.length i++) {
  //   const overlap = reversedOverlaps[i]
  //   const allInside = overlap.circles.every(circle => isInsideCircle(x, y, circle))
  //   if (allInside && !foundOverlap) {
  //     overlap.color = 'rgba(0, 255, 0, 0.5)'  // Turn overlap bright green
  //     overlaps[i] = { ...overlap, color: 'rgba(0, 255, 0, 0.5)' }  // Ensure reactivity
  //     console.log(overlap)
  //     foundOverlap = true
  //     break  // Exit early since we found an overlap
  //   } else if (!allInside) {
  //     overlaps[i] = { ...overlap, color: overlap.originalColor } // Restore original color if not selected
  //   }
  // }
  
  const clickedCircleIndex = circles.findIndex(circle => isInsideCircle(x, y, circle))

  if (clickedCircleIndex === -1 && !circlesSelectedByDrag.value) {
    circles.forEach(circle => circle.selected = false)
  }
  drawCircles()


  circlesSelectedByDrag.value = false
}

const isOverlapping = (circle1: Circle, circle2: Circle) => {
  const dx = circle2.x - circle1.x
  const dy = circle2.y - circle1.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance < circle1.radius + circle2.radius
}

const findOverlaps = (overlapGroup: Circle[], startIndex: number) => {
  if (overlapGroup.length > 1) {
    const overlapColors = [
      'rgba(0, 0, 255, 0.5)',
      'rgba(255, 0, 100, 0.5)',
      'rgba(255, 0, 0, 0.5)',
      'rgba(255, 255, 100, 0.5)',
      'rgba(0, 255, 255, 0.5)'
    ]
    const color = overlapColors[overlapGroup.length - 2]
    overlaps.push({
      circles: [...overlapGroup],
      color,
      originalColor: color,
      id: currentOverlapId.value
    })
    currentOverlapId.value++
  }

  for (let i = startIndex; i < circles.length; i++) {
    let allOverlap = true
    for (let j = 0; j < overlapGroup.length; j++) {
      if (!isOverlapping(overlapGroup[j], circles[i])) {
        allOverlap = false
        break
      }
    }

    if (allOverlap) {
      overlapGroup.push(circles[i])
      findOverlaps(overlapGroup, i + 1)
      overlapGroup.pop()
    }
  }
}

const highlightOverlappingAreas = (ctx: CanvasRenderingContext2D) => {
  overlaps.length = 0
  currentOverlapId.value = 0

  findOverlaps([], 0)
  // IMPORTANT for render order
  overlaps.sort((a, b) => a.circles.length - b.circles.length)

  overlaps.forEach(o => drawOverlappingAreas(ctx, o))
}

const drawOverlappingAreas = (ctx: CanvasRenderingContext2D, overlap: Overlap) => {
  if (!canvas.value) return
  ctx.save()
  overlap.circles.forEach(c => {
    ctx.beginPath()
    ctx.arc(c.x, c.y, c.radius, 0, 2 * Math.PI)
    ctx.clip()
  })

  ctx.fillStyle = overlap.color
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)
  ctx.restore()
}

const deleteCircle = () => {
  const selectedCircleIndex = circles.findIndex(circle => circle.selected)
  if (selectedCircleIndex !== -1) {
    circles.splice(selectedCircleIndex, 1)
    drawCircles()
  }
}

const startSelection = (event: MouseEvent) => {
  const { x, y } = getMousePos(event)
  Object.assign(startPoint, { x, y })
  isDrawing.value = true
}

const drawSelection = (event: MouseEvent) => {
  if (!isDrawing.value || !canvas.value) return

  const ctx = canvas.value.getContext('2d')!
  const { x, y } = getMousePos(event)
  const currentPoint = { x, y }

  const width = currentPoint.x - startPoint.x
  const height = currentPoint.y - startPoint.y

  drawCircles()

  ctx.strokeStyle = 'blue'
  ctx.lineWidth = 1
  ctx.strokeRect(startPoint.x, startPoint.y, width, height)
  ctx.fillStyle = 'rgba(0, 0, 255, 0.2)'
  ctx.fillRect(startPoint.x, startPoint.y, width, height)

  const minX = Math.min(startPoint.x, currentPoint.x)
  const maxX = Math.max(startPoint.x, currentPoint.x)
  const minY = Math.min(startPoint.y, currentPoint.y)
  const maxY = Math.max(startPoint.y, currentPoint.y)

  circles.forEach(circle => {
    circle.selected = (
      circle.x >= minX && circle.x <= maxX &&
      circle.y >= minY && circle.y <= maxY
    )
    if (circle.selected) circlesSelectedByDrag.value = true
  })
}

const endSelection = () => {
  isDrawing.value = false
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
