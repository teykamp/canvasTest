<template>
  <canvas ref="canvas" :height="800" :width="1000"></canvas>
  <button @click="updateStuff">moveRight</button>
</template>

<script setup lang="ts">
import { ref, onMounted} from 'vue'

const canvas = ref()


onMounted(() => {
  const ctx = canvas.value.getContext('2d')!
  ctx.fillStyle = object1.value.color.color
  ctx.fillRect(object1.value.position.x, object1.value.position.y, 20, 20)
  ctx.fillRect(object2.value.position.x, object2.value.position.y, 20, 20)
})

type Position = {
  x: number
  y: number
}

const createObject = (initialPosition: Position) => {
  const position: Position = {
    x: initialPosition.x,
    y: initialPosition.y
  }

  const color = {color: 'red'}

  const setPosition = (x: number, y: number) => {
    notifySubscribers({ x, y }, position)
    position.x = x
    position.y = y
  }

 const setColors = (newColor: string) => {
    notifySubscribers(color.color, newColor)
    color.color = newColor
  }

  const subscribers = new Set<(oldPosition: any, newPosition: any) => void>()

  const subscribe = (callback: (oldPosition: any, newPosition: any) => void) => {
    subscribers.add(callback)
  }

  const notifySubscribers = (oldPosition: any, newPosition: any) => {
    subscribers.forEach(callback => callback(oldPosition, newPosition))
  }

  return {
    position,
    color,
    setPosition,
    setColors,
    subscribe,
  }
}

const object1 = ref(createObject({ x: 100, y: 100 }))
const object2 = ref(createObject({ x: 200, y: 200 }))

object1.value.subscribe((oldPosition, newPosition) => {
  object2.value.color.color = newPosition
})


const updateStuff = () => {
  const ctx = canvas.value.getContext('2d')!
  object1.value.setColors('green')
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
  ctx.fillStyle = object1.value.color.color
  ctx.fillRect(object1.value.position.x, object1.value.position.y, 20, 20)
  ctx.fillStyle = object2.value.color.color
  ctx.fillRect(object2.value.position.x, object2.value.position.y, 20, 20)
}
</script>