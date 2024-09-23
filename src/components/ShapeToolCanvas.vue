<template>
  <canvas ref="canvas" :height="800" :width="1000"></canvas>
  <button @click="updateStuff">moveRight</button>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'

const canvas = ref()


onMounted(() => {
  
  const ctx = canvas.value.getContext('2d')!


  ctx.fillStyle = 'red'
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

  const setPosition = (x: number, y: number) => {
    notifySubscribers({ x, y }, position)
    position.x = x
    position.y = y
  }

  const subscribers = new Set<(oldPosition: Position, newPosition: Position) => void>()

  const subscribe = (callback: (oldPosition: Position, newPosition: Position) => void) => {
    subscribers.add(callback)
  }

  const notifySubscribers = (oldPosition: Position, newPosition: Position) => {
    subscribers.forEach(callback => callback(oldPosition, newPosition))
  }

  return {
    position,
    setPosition,
    subscribe,
  }
}

const object1 = ref(createObject({ x: 100, y: 100 }))
const object2 = ref(createObject({ x: 200, y: 200 }))

object1.value.subscribe((oldPosition, newPosition) => {
  object2.value.setPosition(object2.value.position.x - (oldPosition.x - newPosition.x), object2.value.position.y - (oldPosition.y - newPosition.y))
  console.log(oldPosition.x - newPosition.x)
})


const updateStuff = () => {
  const ctx = canvas.value.getContext('2d')!
  object1.value.setPosition(object1.value.position.x + 10, object1.value.position.y + 10)
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
  ctx.fillRect(object1.value.position.x, object1.value.position.y, 20, 20)
  ctx.fillRect(object2.value.position.x, object2.value.position.y, 20, 20)
}
</script>