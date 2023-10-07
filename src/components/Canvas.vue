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
  canvas.value.width = 500
  canvas.value.height = 500
  ctx.value.fillStyle = 'red'
  ctx.value.fillRect(0, 0, 100, 100)
  ctx.value.fillStyle = "blue";
  ctx.value.font = "bold 16px Arial";
  ctx.value.fillText("Zibri", (100 / 2) - 17, (100 / 2) + 8);
})
</script>