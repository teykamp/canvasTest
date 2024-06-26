<template>
  <div>
    <canvas 
      ref="canvas" 
      :width="width" 
      :height="height" 
      @mousedown="startDrag" 
      @mousemove="drag" 
      @mouseup="endDrag"
      @mouseleave="endDrag" 
      @dblclick="createCircle" 
      @click.left="handleCanvasClick"
      @click.right.prevent="deleteCircle"
    ></canvas>
    <button @click="cycleThing">dsads</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'

import type { Circle, Overlap } from '../types/types'
import useRenderCanvas from '../composables/useRenderCanvas'
import { isInsideCircle, isOnEdge} from '../utils/circleUtils'
import { convertNameListToIdList } from '../utils/idToNameUtils'
import useGetAllSelectablePieces from '../composables/useGetAllSelectablePieces'

const thingToTest = ref([['A'], ['B']])


const allSections = ref<string[][]>([])

const width = window.innerWidth - 30
const height = window.innerHeight - 30

const currentCircleId = ref(1)
const circlesSelectedByDrag = ref(false)

const canvas = ref<HTMLCanvasElement | null>(null)
const dragging = ref(false)
const resizing = ref(false)
const currentCircleIndex = ref<number | null>(null)
const isSelecting = ref(false)
const selectionStartPoint = reactive({ x: 0, y: 0 })

const currentOverlapId = ref(1)
const overlaps = reactive<Overlap[]>([])
const selectedOverlap = ref<Overlap | null>(null)

const circles = reactive<Circle[]>([])

const getAllSelectablePieces = useGetAllSelectablePieces()

const { drawCircles } = useRenderCanvas(canvas, circles, overlaps, currentOverlapId, selectedOverlap)

const cycleThing = () => {
  thingToTest.value = [...[['A', 'B']]]
  drawCircles(convertNameListToIdList(thingToTest.value))
  drawCircles(convertNameListToIdList(thingToTest.value))
}

const getMousePos = (event: MouseEvent) => {

  if (!canvas.value) return { x: 0, y: 0 }
  const rect = canvas.value.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
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
    drawCircles(convertNameListToIdList(thingToTest.value))
  } else {
    startSelection(event)
  }
}

const drag = (event: MouseEvent) => {
  allSections.value = getAllSelectablePieces(circles, overlaps)
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

    drawCircles(convertNameListToIdList(thingToTest.value))
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
    color: 'rgba(0, 0, 0, 1)',
    offsetX: 0,
    offsetY: 0,
  })
  currentCircleId.value++
  drawCircles(convertNameListToIdList(thingToTest.value))
}

const handleCanvasClick = (event: MouseEvent) => {
  const { x, y } = getMousePos(event)
  
  // Selecting Circle Sections:
  // TODO: INCOMPLETE needs to be able to select subsections

  // let foundOverlap = false

  // for (let i = overlaps.length - 1; i >= 0; i--) {
  //   const allInside = overlaps[i].circles.every(circle => isInsideCircle(x, y, circle))
  //   if (allInside && !foundOverlap) {
  //     foundOverlap = true
  //     break
  //   }
  // }
  
  const clickedCircleIndex = circles.findIndex(circle => isInsideCircle(x, y, circle))

  if (clickedCircleIndex === -1 && !circlesSelectedByDrag.value) {
    circles.forEach(circle => circle.selected = false)
    selectedOverlap.value = null
  }
  drawCircles(convertNameListToIdList(thingToTest.value))


  circlesSelectedByDrag.value = false
}

const deleteCircle = () => {
  const selectedCircleIndex = circles.findIndex(circle => circle.selected)
  if (selectedCircleIndex !== -1) {
    circles.splice(selectedCircleIndex, 1)
    drawCircles(convertNameListToIdList(thingToTest.value))
  }
}

const startSelection = (event: MouseEvent) => {
  const { x, y } = getMousePos(event)
  Object.assign(selectionStartPoint, { x, y })
  isSelecting.value = true
}

const drawSelection = (event: MouseEvent) => {
  if (!isSelecting.value || !canvas.value) return

  const ctx = canvas.value.getContext('2d')!
  const { x, y } = getMousePos(event)
  const currentPoint = { x, y }

  const width = currentPoint.x - selectionStartPoint.x
  const height = currentPoint.y - selectionStartPoint.y

  drawCircles(convertNameListToIdList(thingToTest.value))

  ctx.strokeStyle = 'blue'
  ctx.lineWidth = 1
  ctx.strokeRect(selectionStartPoint.x, selectionStartPoint.y, width, height)
  ctx.fillStyle = 'rgba(0, 0, 255, 0.2)'
  ctx.fillRect(selectionStartPoint.x, selectionStartPoint.y, width, height)

  const minX = Math.min(selectionStartPoint.x, currentPoint.x)
  const maxX = Math.max(selectionStartPoint.x, currentPoint.x)
  const minY = Math.min(selectionStartPoint.y, currentPoint.y)
  const maxY = Math.max(selectionStartPoint.y, currentPoint.y)

  circles.forEach(circle => {
    circle.selected = (
      circle.x >= minX && circle.x <= maxX &&
      circle.y >= minY && circle.y <= maxY
    )
    if (circle.selected) circlesSelectedByDrag.value = true
  })
}

const endSelection = () => {
  isSelecting.value = false
}

onMounted(() => {
  drawCircles(convertNameListToIdList(thingToTest.value))
})
</script>

<style scoped>
canvas {
  border: 1px solid black;
}
</style>
