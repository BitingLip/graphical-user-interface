<template>
  <ViewTemplate 
    title="Discussions" 
    cardTitle="Recent Discussions" 
    content="This is the discussions view. Here you can participate in discussions and forums related to your projects."
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ViewTemplate from './ViewTemplate.vue';

export default defineComponent({
  name: 'ViewDiscussions',
  components: {
    ViewTemplate
  }
});
</script>
