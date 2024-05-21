<template>
  <div>
    <canvas ref="canvas" :width="width" :height="height" @mousedown="startDrag" @mousemove="drag" @mouseup="endDrag"
      @mouseleave="endDrag" @dblclick="createCircle" @click.left="handleCanvasClick"
      @click.right.prevent="deleteCircle"></canvas>
  </div>
  {{ overlaps.length }}
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';

const width = window.innerWidth - 30;
const height = window.innerHeight - 30;

const currentId = ref(0);
const circlesSelectedByDrag = ref(false);

const canvas = ref(null);
const dragging = ref(false);
const resizing = ref(false);
const currentCircleIndex = ref(null);
const isDrawing = ref(false);
const startPoint = reactive({ x: 0, y: 0 });
const currentPoint = reactive({ x: 0, y: 0 });

const circles = reactive([]);
const overlaps = reactive([]);

const drawCircle = (ctx, circle) => {
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'grey';
  ctx.fill();
  if (circle.selected) {
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'white';
    ctx.stroke();
  }
};

const drawCircles = () => {
  const ctx = canvas.value.getContext('2d');
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
  circles.forEach(circle => drawCircle(ctx, circle));
  highlightOverlappingAreas(ctx);
};

const getMousePos = (event) => {
  const rect = canvas.value.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

const isInsideCircle = (x, y, circle) => {
  const dx = x - circle.x;
  const dy = y - circle.y;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
};

const isOnEdge = (x, y, circle) => {
  const dx = x - circle.x;
  const dy = y - circle.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return Math.abs(distance - circle.radius) < 5;
};

const startDrag = (event) => {
  const { x, y } = getMousePos(event);
  currentCircleIndex.value = circles.findLastIndex(circle => isInsideCircle(x, y, circle) || isOnEdge(x, y, circle));

  if (currentCircleIndex.value !== -1) {
    // Circle clicked on
    const circle = circles[currentCircleIndex.value];
    if (isOnEdge(x, y, circle)) {
      resizing.value = true;
      Object.assign(circle, { startRadius: circle.radius });
    } else {
      dragging.value = true;
    }

    const selectedCirclesCount = circles.filter(c => c.selected).length;
    // If no circles are selected, select the clicked circle
    if (selectedCirclesCount < 2) {
      circles.forEach((c, index) => c.selected = index === currentCircleIndex.value);
    }

    // Store the initial offsets for all selected circles
    circles.forEach(c => {
      if (c.selected) {
        c.offsetX = x - c.x;
        c.offsetY = y - c.y;
      }
    });

    circles.push(circles.splice(currentCircleIndex.value, 1)[0]);
    currentCircleIndex.value = circles.length - 1;
    drawCircles();
  } else {
    startSelection(event);
  }
};

const drag = (event) => {
  if ((dragging.value || resizing.value) && currentCircleIndex.value !== null) {
    const { x, y } = getMousePos(event);

    if (dragging.value) {
      circles.forEach(c => {
        if (c.selected) {
          c.x = x - c.offsetX;
          c.y = y - c.offsetY;
        }
      });
    } else if (resizing.value) {
      const circle = circles[currentCircleIndex.value];
      const dx = x - circle.x;
      const dy = y - circle.y;
      circle.radius = Math.max(10, Math.sqrt(dx * dx + dy * dy));
    }

    drawCircles();
  } else {
    drawSelection(event);
  }
};

const endDrag = () => {
  dragging.value = false;
  resizing.value = false;
  currentCircleIndex.value = null;
  endSelection();
};

const createCircle = (event) => {
  const { x, y } = getMousePos(event);
  circles.push({
    id: currentId.value,
    x,
    y,
    radius: 70,
    selected: true,
  });
  currentId.value++;
  drawCircles();
};

const handleCanvasClick = (event) => {
  const { x, y } = getMousePos(event);
  const clickedCircleIndex = circles.findIndex(circle => isInsideCircle(x, y, circle));

  if (clickedCircleIndex === -1 && !circlesSelectedByDrag.value) {
    circles.forEach(circle => circle.selected = false);
  }
  drawCircles();
  circlesSelectedByDrag.value = false;
};

const highlightOverlappingAreas = (ctx) => {
  overlaps.length = 0;
  for (let i = 0; i < circles.length; i++) {
    for (let j = i + 1; j < circles.length; j++) {
      const circle1 = circles[i];
      const circle2 = circles[j];
      const dx = circle2.x - circle1.x;
      const dy = circle2.y - circle1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < circle1.radius + circle2.radius) {
        const overlap = {
          circles: [circle1, circle2],
          color: 'rgba(255, 255, 0, 0.5)'
        }
        overlaps.unshift(overlap);
      }

      for (let k = j + 1; k < circles.length; k++) {
        const circle3 = circles[k];
        const dx1 = circle3.x - circle1.x;
        const dy1 = circle3.y - circle1.y;
        const distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

        const dx2 = circle3.x - circle2.x;
        const dy2 = circle3.y - circle2.y;
        const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

        if (distance1 < circle1.radius + circle3.radius &&
          distance2 < circle2.radius + circle3.radius) {
          const overlap = {
            circles: [circle1, circle2, circle3],
            color: 'rgba(0, 255, 0, 0.5)'
          }
          overlaps.push(overlap);
        }
      }
    }
  }
  overlaps.forEach(o => drawOverlappingAreas(ctx, o))
};

const drawOverlappingAreas = (ctx, overlap) => {
  ctx.save()
  overlap.circles.forEach(c => {
    ctx.beginPath()
    ctx.arc(c.x, c.y, c.radius, 0, 2 * Math.PI)
    ctx.clip()
  })  

  ctx.fillStyle = overlap.color;
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
  ctx.restore();
}

const deleteCircle = () => {
  const selectedCircleIndex = circles.findIndex(circle => circle.selected);
  if (selectedCircleIndex !== -1) {
    circles.splice(selectedCircleIndex, 1);
    drawCircles();
  }
};

const startSelection = (event) => {
  const { x, y } = getMousePos(event);
  Object.assign(startPoint, { x, y });
  isDrawing.value = true;
};

const drawSelection = (event) => {
  if (!isDrawing.value) return;

  const ctx = canvas.value.getContext('2d');
  const { x, y } = getMousePos(event);
  Object.assign(currentPoint, { x, y });

  const width = currentPoint.x - startPoint.x;
  const height = currentPoint.y - startPoint.y;

  drawCircles();

  ctx.strokeStyle = 'blue';
  ctx.lineWidth = 1;
  ctx.strokeRect(startPoint.x, startPoint.y, width, height);
  ctx.fillStyle = 'rgba(0, 0, 255, 0.2)';
  ctx.fillRect(startPoint.x, startPoint.y, width, height);

  const minX = Math.min(startPoint.x, currentPoint.x);
  const maxX = Math.max(startPoint.x, currentPoint.x);
  const minY = Math.min(startPoint.y, currentPoint.y);
  const maxY = Math.max(startPoint.y, currentPoint.y);

  circles.forEach(circle => {
    circle.selected = (
      circle.x >= minX && circle.x <= maxX &&
      circle.y >= minY && circle.y <= maxY
    );
    if (circle.selected) circlesSelectedByDrag.value = true;
  });
};

const endSelection = () => {
  isDrawing.value = false;
};

onMounted(() => {
  drawCircles();
});
</script>

<style scoped>
canvas {
  border: 1px solid black;
}
</style>
