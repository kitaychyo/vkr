<script setup>
// Тут вся логика (Composition API)
const props = defineProps(['text'])
</script>

<template>
  <!-- Тут твой HTML шаблон -->
  <button class="custom-btn">{{ text }}</button>
</template>

<style scoped>
/* Тут стили, которые не вылезут наружу */
.custom-btn {
  background: #42b883;
  color: white;
  border-radius: 8px;
}
</style>
