<template>
  <div class="dashboard">
    <!-- Dynamic view components -->
    <component :is="currentView" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, markRaw } from 'vue';

// Import all view components
import ViewClusters from '../views/ViewClusters.vue';
import ViewTasks from '../views/ViewTasks.vue';
import ViewModels from '../views/ViewModels.vue';
import ViewGateway from '../views/ViewGateway.vue';
import ViewProfile from '../views/ViewProfile.vue';
import ViewHome from '../views/ViewHome.vue';
import ViewIssues from '../views/ViewIssues.vue';
import ViewDiscussions from '../views/ViewDiscussions.vue';
import ViewDocumentation from '../views/ViewDocumentation.vue';

export default defineComponent({
  name: 'Dashboard',
  components: {
    ViewClusters,
    ViewTasks,
    ViewModels,
    ViewGateway,
    ViewProfile,
    ViewHome,
    ViewIssues,
    ViewDiscussions,
    ViewDocumentation
  },
  props: {
    viewName: {
      type: String,
      default: 'clusters'
    }
  },
  setup(props) {
    // Use markRaw to avoid Vue's reactivity for component references
    const viewComponents = {
      'clusters': markRaw(ViewClusters),
      'tasks': markRaw(ViewTasks),
      'models': markRaw(ViewModels),
      'gateway': markRaw(ViewGateway),
      'profile': markRaw(ViewProfile),
      'home': markRaw(ViewHome),
      'issues': markRaw(ViewIssues),
      'discussions': markRaw(ViewDiscussions),
      'documentation': markRaw(ViewDocumentation)
    };
    
    const currentView = computed(() => {
      return viewComponents[props.viewName] || viewComponents['clusters'];
    });
    
    return {
      currentView
    };
  }
});
</script>

<style scoped>
.dashboard {
  background-color: var(--shade-01);
  padding: var(--app_dashboard_margin);
  min-height: calc(100vh - var(--app_dashboard_header_height_full));
}
</style>
