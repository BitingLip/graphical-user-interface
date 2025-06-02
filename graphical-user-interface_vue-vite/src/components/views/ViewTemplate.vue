<template>
  <div class="view-container">
    <h1>{{ title }}</h1>
    <div class="content">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">{{ cardTitle }}</h2>
        </div>
        <div class="card-body">
          <p>{{ content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ViewTemplate',
  props: {
    title: {
      type: String,
      required: true
    },
    cardTitle: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    }
  }
});
</script>

<style scoped>
.view-container {
  max-width: 1200px;
  margin: 0 auto;
}

.content {
  margin-top: 1.5rem;
}
</style>
