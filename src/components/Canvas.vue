<template>
  <div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const canvas = ref(null)
const ctx = ref(null)
onMounted(() => {
  ctx.value = canvas.value.getContext('2d')
  ctx.value.fillStyle = 'red'
  ctx.value.fillRect(100, 100, 100, 100)
})
</script>