<template>
  <div class="view-clusters">
    <h1 class="view-title">Clusters</h1>
    
    <div class="stats-row">
      <StatsCard
        icon="device_hub"
        value="12"
        label="Total Clusters"
        change="5"
        changePeriod="vs last month"
      />
      <StatsCard
        icon="call_merge"
        iconBackground="var(--bl-success)"
        value="8"
        label="Active Clusters"
      />
      <StatsCard
        icon="memory"
        iconBackground="var(--bl-warning)"
        value="86%"
        label="Average CPU Usage"
        change="-2"
      />
      <StatsCard
        icon="schedule"
        iconBackground="var(--bl-info)"
        value="124h"
        label="Total Runtime"
        change="12"
      />
    </div>
    
    <div class="cluster-actions">
      <ElementButton 
        icon="add"
        variant="primary"
        @click="showNewClusterModal = true"
      >
        New Cluster
      </ElementButton>
      
      <ElementInput
        placeholder="Search clusters..."
        prefixIcon="search"
        v-model="searchQuery"
      />
    </div>
    
    <DataTable
      :columns="columns"
      :items="filteredClusters"
      :isLoading="isLoading"
      :totalItems="clusters.length"
      :currentPage="currentPage"
      :totalPages="totalPages"
      :perPage="perPage"
      :sortKey="sortKey"
      :sortOrder="sortOrder"
      @row-click="handleClusterClick"
      @page-change="handlePageChange"
      @sort="handleSort"
      rowClickEnabled
    >
      <template #column-status="{ item }">
        <ElementBadge
          :variant="getStatusVariant(item.status)"
        >
          {{ item.status }}
        </ElementBadge>
      </template>
      
      <template #rowActions="{ item }">
        <div class="row-actions">
          <ElementButton
            variant="ghost"
            icon="more_vert"
            iconOnly
            @click.stop="handleActionsClick(item)"
          />
        </div>
      </template>
    </DataTable>
    
    <!-- New Cluster Modal -->
    <Modal
      v-model="showNewClusterModal"
      title="Create New Cluster"
      :loading="isCreating"
      @confirm="handleCreateCluster"
    >
      <Form @submit="handleCreateCluster">
        <FormFieldGroup
          label="Cluster Name"
          required
          :error="formErrors.name"
        >
          <ElementInput
            v-model="newCluster.name"
            placeholder="Enter cluster name"
          />
        </FormFieldGroup>
        
        <FormFieldGroup
          label="Cluster Type"
          required
          :error="formErrors.type"
        >
          <ElementSelect
            v-model="newCluster.type"
            :options="clusterTypes"
            placeholder="Select cluster type"
          />
        </FormFieldGroup>
        
        <FormFieldGroup
          label="Region"
          required
          :error="formErrors.region"
        >
          <ElementSelect
            v-model="newCluster.region"
            :options="regions"
            placeholder="Select region"
          />
        </FormFieldGroup>
        
        <FormFieldGroup
          label="Node Count"
          required
          :error="formErrors.nodeCount"
        >
          <ElementInput
            v-model="newCluster.nodeCount"
            type="number"
            min="1"
            max="10"
          />
        </FormFieldGroup>
        
        <FormFieldGroup
          label="Autoscaling"
        >
          <ElementToggle
            v-model="newCluster.autoscaling"
            label="Enable autoscaling"
          />
        </FormFieldGroup>
      </Form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import StatsCard from '../composites/dashboards/StatsCard.vue';
import DataTable from '../composites/tables/DataTable.vue';
import ElementButton from '../elements/ElementButton.vue';
import ElementInput from '../elements/ElementInput.vue';
import ElementBadge from '../elements/ElementBadge.vue';
import ElementSelect from '../elements/ElementSelect.vue';
import ElementToggle from '../elements/ElementToggle.vue';
import Modal from '../composites/modals/Modal.vue';
import Form from '../composites/forms/Form.vue';
import FormFieldGroup from '../composites/forms/FormFieldGroup.vue';

// Cluster data
const isLoading = ref(false);
const clusters = ref([
  { 
    id: 1, 
    name: 'Production-Main', 
    type: 'Kubernetes', 
    status: 'Running', 
    region: 'US-East',
    nodeCount: 5,
    cpuUsage: '76%',
    memoryUsage: '64%',
    createdAt: '2025-05-15'
  },
  { 
    id: 2, 
    name: 'Staging', 
    type: 'Docker Swarm', 
    status: 'Running', 
    region: 'Europe-West',
    nodeCount: 3,
    cpuUsage: '42%',
    memoryUsage: '38%',
    createdAt: '2025-05-20'
  },
  { 
    id: 3, 
    name: 'Development', 
    type: 'Kubernetes', 
    status: 'Stopped', 
    region: 'US-West',
    nodeCount: 2,
    cpuUsage: '0%',
    memoryUsage: '0%',
    createdAt: '2025-05-10'
  },
  { 
    id: 4, 
    name: 'Analytics', 
    type: 'Kubernetes', 
    status: 'Running', 
    region: 'Asia-East',
    nodeCount: 4,
    cpuUsage: '89%',
    memoryUsage: '72%',
    createdAt: '2025-05-28'
  }
]);

// Pagination
const currentPage = ref(1);
const perPage = ref(10);
const totalPages = computed(() => Math.ceil(clusters.value.length / perPage.value));

// Sorting
const sortKey = ref('name');
const sortOrder = ref<'asc' | 'desc'>('asc');

// Search
const searchQuery = ref('');
const filteredClusters = computed(() => {
  let result = [...clusters.value];
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(cluster => 
      cluster.name.toLowerCase().includes(query) || 
      cluster.type.toLowerCase().includes(query) ||
      cluster.status.toLowerCase().includes(query) ||
      cluster.region.toLowerCase().includes(query)
    );
  }
  
  // Apply sorting
  result.sort((a, b) => {
    const aValue = a[sortKey.value];
    const bValue = b[sortKey.value];
    
    if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });
  
  return result;
});

// Table columns
const columns = [
  { key: 'name', label: 'Cluster Name', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'region', label: 'Region', sortable: true },
  { key: 'nodeCount', label: 'Nodes', sortable: true },
  { key: 'cpuUsage', label: 'CPU', sortable: true },
  { key: 'memoryUsage', label: 'Memory', sortable: true },
  { key: 'createdAt', label: 'Created', sortable: true }
];

// Handlers
const handleClusterClick = (cluster) => {
  console.log('Cluster clicked', cluster);
  // Navigate to cluster details or expand row
};

const handleActionsClick = (cluster) => {
  console.log('Actions clicked for', cluster);
  // Show actions menu
};

const handlePageChange = (page) => {
  currentPage.value = page;
};

const handleSort = (key, order) => {
  sortKey.value = key;
  sortOrder.value = order;
};

const getStatusVariant = (status) => {
  switch(status) {
    case 'Running': return 'success';
    case 'Stopped': return 'default';
    case 'Error': return 'danger';
    case 'Pending': return 'warning';
    default: return 'default';
  }
};

// New Cluster Modal
const showNewClusterModal = ref(false);
const isCreating = ref(false);
const newCluster = ref({
  name: '',
  type: '',
  region: '',
  nodeCount: 1,
  autoscaling: false
});
const formErrors = ref({
  name: '',
  type: '',
  region: '',
  nodeCount: ''
});

const clusterTypes = ['Kubernetes', 'Docker Swarm', 'Mesos DC/OS', 'Nomad'];
const regions = ['US-East', 'US-West', 'Europe-West', 'Europe-North', 'Asia-East', 'Asia-South'];

const handleCreateCluster = () => {
  // Reset errors
  formErrors.value = {
    name: '',
    type: '',
    region: '',
    nodeCount: ''
  };
  
  // Validate form
  let isValid = true;
  
  if (!newCluster.value.name) {
    formErrors.value.name = 'Cluster name is required';
    isValid = false;
  }
  
  if (!newCluster.value.type) {
    formErrors.value.type = 'Cluster type is required';
    isValid = false;
  }
  
  if (!newCluster.value.region) {
    formErrors.value.region = 'Region is required';
    isValid = false;
  }
  
  if (!newCluster.value.nodeCount || newCluster.value.nodeCount < 1) {
    formErrors.value.nodeCount = 'Node count must be at least 1';
    isValid = false;
  }
  
  if (isValid) {
    isCreating.value = true;
    
    // Simulate API call
    setTimeout(() => {
      const newId = Math.max(...clusters.value.map(c => c.id)) + 1;
      clusters.value.push({
        id: newId,
        name: newCluster.value.name,
        type: newCluster.value.type,
        status: 'Pending',
        region: newCluster.value.region,
        nodeCount: newCluster.value.nodeCount,
        cpuUsage: '0%',
        memoryUsage: '0%',
        createdAt: new Date().toISOString().split('T')[0]
      });
      
      isCreating.value = false;
      showNewClusterModal.value = false;
      
      // Reset form
      newCluster.value = {
        name: '',
        type: '',
        region: '',
        nodeCount: 1,
        autoscaling: false
      };
    }, 1000);
  }
};
</script>

<style scoped>
.view-clusters {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.view-title {
  margin-bottom: 1.5rem;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.cluster-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.cluster-actions .element-input {
  max-width: 300px;
}

.row-actions {
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .cluster-actions {
    flex-direction: column;
  }
  
  .cluster-actions .element-input {
    max-width: none;
  }
  
  .stats-row {
    grid-template-columns: 1fr;
  }
}
</style>
