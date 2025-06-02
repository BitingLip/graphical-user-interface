<template>
  <div class="view-models">
    <h1 class="view-title">Models</h1>
    
    <div class="stats-row">
      <StatsCard
        icon="model_training"
        value="16"
        label="Total Models"
        change="3"
        changePeriod="vs last month"
      />
      <StatsCard
        icon="publish"
        iconBackground="var(--bl-success)"
        value="8"
        label="Deployed Models"
      />
      <StatsCard
        icon="timeline"
        iconBackground="var(--bl-info)"
        value="94.7%"
        label="Average Accuracy"
        change="0.6"
      />
      <StatsCard
        icon="insights"
        iconBackground="var(--bl-warning)"
        value="450K"
        label="Total Predictions"
        change="32K"
      />
    </div>
    
    <div class="view-tabs">
      <div 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['view-tab', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <span class="material-symbols-outlined tab-icon">{{ tab.icon }}</span>
        <span class="tab-name">{{ tab.name }}</span>
        <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
      </div>
    </div>
    
    <div class="model-actions">
      <ElementButton 
        icon="add"
        variant="primary"
        @click="showNewModelModal = true"
      >
        New Model
      </ElementButton>
      
      <div class="filter-group">
        <ElementSelect
          v-model="typeFilter"
          :options="typeOptions"
          placeholder="Model Type"
          size="sm"
        />
        
        <ElementSelect
          v-model="statusFilter"
          :options="statusOptions"
          placeholder="Status"
          size="sm"
        />
        
        <ElementInput
          placeholder="Search models..."
          prefixIcon="search"
          v-model="searchQuery"
          size="sm"
        />
      </div>
    </div>
    
    <!-- Model Gallery View -->
    <div v-if="activeTab === 'gallery'" class="model-gallery">
      <ElementCard 
        v-for="model in filteredModels"
        :key="model.id"
        class="model-card"
        @click="handleModelClick(model)"
      >
        <div class="model-card-header">
          <div class="model-card-title-area">
            <h3 class="model-card-title">{{ model.name }}</h3>
            <ElementBadge :variant="getStatusVariant(model.status)">
              {{ model.status }}
            </ElementBadge>
          </div>
          <span class="material-symbols-outlined model-type-icon">{{ getModelTypeIcon(model.type) }}</span>
        </div>
        
        <div class="model-card-body">
          <div class="model-metrics">
            <div class="model-metric">
              <span class="metric-label">Accuracy</span>
              <span class="metric-value">{{ model.metrics.accuracy }}</span>
            </div>
            <div class="model-metric">
              <span class="metric-label">F1 Score</span>
              <span class="metric-value">{{ model.metrics.f1Score }}</span>
            </div>
            <div class="model-metric">
              <span class="metric-label">Size</span>
              <span class="metric-value">{{ model.size }}</span>
            </div>
          </div>
          
          <p class="model-description">{{ model.description }}</p>
          
          <div class="model-tags">
            <ElementBadge 
              v-for="tag in model.tags" 
              :key="tag" 
              variant="secondary"
            >
              {{ tag }}
            </ElementBadge>
          </div>
        </div>
        
        <div class="model-card-footer">
          <div class="model-info">
            <span class="model-version">v{{ model.version }}</span>
            <span class="model-updated">Updated {{ model.updatedAt }}</span>
          </div>
          <div class="model-actions">
            <ElementButton 
              v-if="model.status !== 'Deployed'"
              variant="success" 
              size="sm"
              icon="publish"
              @click.stop="handleDeployModel(model)"
            >
              Deploy
            </ElementButton>
            <ElementButton 
              variant="secondary" 
              size="sm"
              icon="query_stats"
              @click.stop="handleViewDetails(model)"
            >
              Details
            </ElementButton>
          </div>
        </div>
      </ElementCard>
    </div>
    
    <!-- Model Table View -->
    <DataTable
      v-if="activeTab === 'table'"
      :columns="columns"
      :items="filteredModels"
      :isLoading="isLoading"
      :totalItems="models.length"
      :currentPage="currentPage"
      :totalPages="totalPages"
      :perPage="perPage"
      :sortKey="sortKey"
      :sortOrder="sortOrder"
      @row-click="handleModelClick"
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
      
      <template #column-accuracy="{ item }">
        <div class="accuracy-display">
          <div class="accuracy-bar" :style="{ width: item.metrics.accuracy.replace('%', '') + '%' }"></div>
          <span class="accuracy-text">{{ item.metrics.accuracy }}</span>
        </div>
      </template>
      
      <template #rowActions="{ item }">
        <div class="row-actions">
          <ElementButton
            v-if="item.status !== 'Deployed'"
            variant="ghost"
            icon="publish"
            iconOnly
            title="Deploy Model"
            @click.stop="handleDeployModel(item)"
          />
          <ElementButton
            variant="ghost"
            icon="query_stats"
            iconOnly
            title="View Details"
            @click.stop="handleViewDetails(item)"
          />
          <ElementButton
            variant="ghost"
            icon="more_vert"
            iconOnly
            @click.stop="handleActionsClick(item)"
          />
        </div>
      </template>
    </DataTable>
    
    <!-- New Model Modal -->
    <Modal
      v-model="showNewModelModal"
      title="Register New Model"
      :loading="isCreating"
      @confirm="handleCreateModel"
      size="lg"
    >
      <Form @submit="handleCreateModel">
        <div class="form-row">
          <FormFieldGroup
            class="form-column"
            label="Model Name"
            required
            :error="formErrors.name"
          >
            <ElementInput
              v-model="newModel.name"
              placeholder="Enter model name"
            />
          </FormFieldGroup>
          
          <FormFieldGroup
            class="form-column"
            label="Model Type"
            required
            :error="formErrors.type"
          >
            <ElementSelect
              v-model="newModel.type"
              :options="modelTypeOptions"
              placeholder="Select model type"
            />
          </FormFieldGroup>
        </div>
        
        <div class="form-row">
          <FormFieldGroup
            class="form-column"
            label="Version"
            required
            :error="formErrors.version"
          >
            <ElementInput
              v-model="newModel.version"
              placeholder="e.g. 1.0.0"
            />
          </FormFieldGroup>
          
          <FormFieldGroup
            class="form-column"
            label="Framework"
            required
            :error="formErrors.framework"
          >
            <ElementSelect
              v-model="newModel.framework"
              :options="frameworkOptions"
              placeholder="Select framework"
            />
          </FormFieldGroup>
        </div>
        
        <FormFieldGroup
          label="Description"
          required
          :error="formErrors.description"
        >
          <ElementInput
            v-model="newModel.description"
            type="textarea"
            placeholder="Brief description of the model"
            rows="3"
          />
        </FormFieldGroup>
        
        <div class="form-row">
          <FormFieldGroup
            class="form-column"
            label="Accuracy"
            :error="formErrors.accuracy"
          >
            <ElementInput
              v-model="newModel.metrics.accuracy"
              placeholder="e.g. 95.4%"
            />
          </FormFieldGroup>
          
          <FormFieldGroup
            class="form-column"
            label="F1 Score"
            :error="formErrors.f1Score"
          >
            <ElementInput
              v-model="newModel.metrics.f1Score"
              placeholder="e.g. 0.92"
            />
          </FormFieldGroup>
        </div>
        
        <FormFieldGroup
          label="Tags"
          :error="formErrors.tags"
        >
          <ElementInput
            v-model="newModel.tagsInput"
            placeholder="Enter tags separated by commas"
          />
        </FormFieldGroup>
        
        <FormFieldGroup
          label="Upload Model File"
          :error="formErrors.file"
        >
          <div class="file-upload">
            <ElementButton
              icon="upload_file"
              variant="secondary"
              @click="handleFileUploadClick"
            >
              Upload Model File
            </ElementButton>
            <span v-if="newModel.file" class="file-name">{{ newModel.file }}</span>
          </div>
        </FormFieldGroup>
        
        <FormFieldGroup
          label="Deploy Immediately"
        >
          <ElementToggle
            v-model="newModel.deployImmediately"
            label="Deploy model after registration"
          />
        </FormFieldGroup>
      </Form>
    </Modal>
    
    <!-- Model Details Modal -->
    <Modal
      v-model="showDetailsModal"
      :title="selectedModel ? 'Model: ' + selectedModel.name : 'Model Details'"
      size="lg"
      confirmText="Close"
      :showCancel="false"
    >
      <div v-if="selectedModel" class="model-details">
        <div class="model-detail-section">
          <h3>Basic Information</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">ID:</span>
              <span class="detail-value">{{ selectedModel.id }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Name:</span>
              <span class="detail-value">{{ selectedModel.name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Type:</span>
              <span class="detail-value">{{ selectedModel.type }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status:</span>
              <span class="detail-value">
                <ElementBadge :variant="getStatusVariant(selectedModel.status)">
                  {{ selectedModel.status }}
                </ElementBadge>
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Version:</span>
              <span class="detail-value">{{ selectedModel.version }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Framework:</span>
              <span class="detail-value">{{ selectedModel.framework }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Size:</span>
              <span class="detail-value">{{ selectedModel.size }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Created:</span>
              <span class="detail-value">{{ selectedModel.createdAt }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Last Updated:</span>
              <span class="detail-value">{{ selectedModel.updatedAt }}</span>
            </div>
          </div>
        </div>
        
        <div class="model-detail-section">
          <h3>Description</h3>
          <p class="model-description-full">{{ selectedModel.description }}</p>
          
          <div class="model-tags">
            <h4>Tags</h4>
            <div>
              <ElementBadge 
                v-for="tag in selectedModel.tags" 
                :key="tag" 
                variant="secondary"
              >
                {{ tag }}
              </ElementBadge>
            </div>
          </div>
        </div>
        
        <div class="model-detail-section">
          <h3>Performance Metrics</h3>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-card-title">Accuracy</div>
              <div class="metric-card-value">{{ selectedModel.metrics.accuracy }}</div>
              <div class="metric-card-gauge">
                <div class="metric-gauge-bar" 
                     :style="{ width: selectedModel.metrics.accuracy.replace('%', '') + '%' }">
                </div>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-card-title">F1 Score</div>
              <div class="metric-card-value">{{ selectedModel.metrics.f1Score }}</div>
              <div class="metric-card-gauge">
                <div class="metric-gauge-bar" 
                     :style="{ width: (parseFloat(selectedModel.metrics.f1Score) * 100) + '%' }">
                </div>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-card-title">Precision</div>
              <div class="metric-card-value">{{ selectedModel.metrics.precision || 'N/A' }}</div>
              <div class="metric-card-gauge" v-if="selectedModel.metrics.precision">
                <div class="metric-gauge-bar" 
                     :style="{ width: (parseFloat(selectedModel.metrics.precision) * 100) + '%' }">
                </div>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-card-title">Recall</div>
              <div class="metric-card-value">{{ selectedModel.metrics.recall || 'N/A' }}</div>
              <div class="metric-card-gauge" v-if="selectedModel.metrics.recall">
                <div class="metric-gauge-bar" 
                     :style="{ width: (parseFloat(selectedModel.metrics.recall) * 100) + '%' }">
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="model-detail-section">
          <h3>Deployment History</h3>
          <table class="history-table">
            <thead>
              <tr>
                <th>Version</th>
                <th>Date</th>
                <th>Environment</th>
                <th>Status</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(deployment, index) in selectedModel.deploymentHistory || []" :key="index">
                <td>{{ deployment.version }}</td>
                <td>{{ deployment.date }}</td>
                <td>{{ deployment.environment }}</td>
                <td>
                  <ElementBadge :variant="deployment.status === 'Success' ? 'success' : 'danger'">
                    {{ deployment.status }}
                  </ElementBadge>
                </td>
                <td>{{ deployment.duration }}</td>
              </tr>
              <tr v-if="!selectedModel.deploymentHistory || selectedModel.deploymentHistory.length === 0">
                <td colspan="5" class="no-data">No deployment history available</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="model-detail-actions">
          <ElementButton 
            v-if="selectedModel.status !== 'Deployed'"
            variant="primary" 
            icon="publish"
            @click="handleDeployModel(selectedModel)"
          >
            Deploy Model
          </ElementButton>
          <ElementButton 
            variant="secondary" 
            icon="history"
            @click="handleViewVersionHistory(selectedModel)"
          >
            Version History
          </ElementButton>
          <ElementButton 
            variant="secondary" 
            icon="monitoring"
            @click="handleViewMonitoring(selectedModel)"
          >
            Monitoring
          </ElementButton>
          <ElementButton 
            variant="danger" 
            icon="delete"
            @click="handleDeleteModel(selectedModel)"
          >
            Delete
          </ElementButton>
        </div>
      </div>
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
import ElementCard from '../elements/ElementCard.vue';
import Modal from '../composites/modals/Modal.vue';
import Form from '../composites/forms/Form.vue';
import FormFieldGroup from '../composites/forms/FormFieldGroup.vue';

// Tabs configuration
const tabs = [
  { id: 'gallery', name: 'Gallery', icon: 'grid_view', count: 16 },
  { id: 'table', name: 'Table', icon: 'table_rows' }
];
const activeTab = ref('gallery');

// Models data
const isLoading = ref(false);
const models = ref([
  {
    id: 1,
    name: 'Sentiment Analysis',
    type: 'NLP',
    status: 'Deployed',
    version: '2.3.0',
    framework: 'PyTorch',
    createdAt: '2025-04-10',
    updatedAt: '2025-05-20',
    size: '1.2GB',
    description: 'Multi-language sentiment analysis model trained on customer feedback data.',
    tags: ['NLP', 'BERT', 'Multi-language'],
    metrics: {
      accuracy: '94.2%',
      f1Score: '0.93',
      precision: '0.94',
      recall: '0.92'
    },
    deploymentHistory: [
      { 
        version: '2.3.0', 
        date: '2025-05-20', 
        environment: 'Production', 
        status: 'Success', 
        duration: '45m' 
      },
      { 
        version: '2.2.0', 
        date: '2025-04-15', 
        environment: 'Production', 
        status: 'Success', 
        duration: '42m' 
      }
    ]
  },
  {
    id: 2,
    name: 'Customer Churn Predictor',
    type: 'Classification',
    status: 'Training',
    version: '1.5.1',
    framework: 'TensorFlow',
    createdAt: '2025-05-01',
    updatedAt: '2025-05-25',
    size: '820MB',
    description: 'Predictive model to identify customers at risk of churn based on behavior patterns.',
    tags: ['Classification', 'Customer Analytics'],
    metrics: {
      accuracy: '88.7%',
      f1Score: '0.86',
      precision: '0.89',
      recall: '0.84'
    }
  },
  {
    id: 3,
    name: 'Image Recognition',
    type: 'Computer Vision',
    status: 'Deployed',
    version: '3.0.2',
    framework: 'PyTorch',
    createdAt: '2025-03-15',
    updatedAt: '2025-05-10',
    size: '2.4GB',
    description: 'General purpose image recognition model trained on diverse datasets.',
    tags: ['CV', 'CNN', 'ResNet'],
    metrics: {
      accuracy: '96.5%',
      f1Score: '0.96',
      precision: '0.97',
      recall: '0.95'
    },
    deploymentHistory: [
      { 
        version: '3.0.2', 
        date: '2025-05-10', 
        environment: 'Production', 
        status: 'Success', 
        duration: '1h 12m' 
      }
    ]
  },
  {
    id: 4,
    name: 'Time Series Forecaster',
    type: 'Forecasting',
    status: 'Testing',
    version: '0.9.0',
    framework: 'scikit-learn',
    createdAt: '2025-05-15',
    updatedAt: '2025-05-26',
    size: '350MB',
    description: 'ARIMA-based forecasting model for financial time series data.',
    tags: ['Time Series', 'Finance', 'ARIMA'],
    metrics: {
      accuracy: '82.3%',
      f1Score: '0.81',
      precision: '0.83',
      recall: '0.80'
    }
  },
  {
    id: 5,
    name: 'Recommendation Engine',
    type: 'Recommendation',
    status: 'Deployed',
    version: '2.1.1',
    framework: 'TensorFlow',
    createdAt: '2025-02-20',
    updatedAt: '2025-04-30',
    size: '1.8GB',
    description: 'Collaborative filtering recommendation system for product recommendations.',
    tags: ['RecSys', 'Collaborative Filtering'],
    metrics: {
      accuracy: '89.1%',
      f1Score: '0.88',
      precision: '0.91',
      recall: '0.86'
    },
    deploymentHistory: [
      { 
        version: '2.1.1', 
        date: '2025-04-30', 
        environment: 'Production', 
        status: 'Success', 
        duration: '58m' 
      },
      { 
        version: '2.0.0', 
        date: '2025-03-15', 
        environment: 'Production', 
        status: 'Failed', 
        duration: '1h 5m' 
      },
      { 
        version: '1.0.0', 
        date: '2025-02-20', 
        environment: 'Staging', 
        status: 'Success', 
        duration: '45m' 
      }
    ]
  }
]);

// Table configuration
const currentPage = ref(1);
const perPage = ref(10);
const totalPages = computed(() => Math.ceil(models.value.length / perPage.value));
const sortKey = ref('id');
const sortOrder = ref<'asc' | 'desc'>('desc');

// Column definitions
const columns = [
  { key: 'id', label: 'ID', sortable: true, width: '60px' },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'version', label: 'Version', sortable: true },
  { key: 'framework', label: 'Framework', sortable: true },
  { key: 'accuracy', label: 'Accuracy', sortable: true },
  { key: 'updatedAt', label: 'Updated', sortable: true }
];

// Filters
const searchQuery = ref('');
const statusFilter = ref('');
const typeFilter = ref('');

// Filter options
const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'Deployed', label: 'Deployed' },
  { value: 'Training', label: 'Training' },
  { value: 'Testing', label: 'Testing' }
];

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'NLP', label: 'NLP' },
  { value: 'Computer Vision', label: 'Computer Vision' },
  { value: 'Classification', label: 'Classification' },
  { value: 'Recommendation', label: 'Recommendation' },
  { value: 'Forecasting', label: 'Forecasting' }
];

// Model creation
const showNewModelModal = ref(false);
const isCreating = ref(false);
const newModel = ref({
  name: '',
  type: '',
  version: '1.0.0',
  framework: '',
  description: '',
  metrics: {
    accuracy: '',
    f1Score: ''
  },
  tagsInput: '',
  file: '',
  deployImmediately: false
});

const formErrors = ref({
  name: '',
  type: '',
  version: '',
  framework: '',
  description: '',
  accuracy: '',
  f1Score: '',
  tags: '',
  file: ''
});

// Model types for creation
const modelTypeOptions = [
  { value: 'NLP', label: 'NLP' },
  { value: 'Computer Vision', label: 'Computer Vision' },
  { value: 'Classification', label: 'Classification' },
  { value: 'Regression', label: 'Regression' },
  { value: 'Clustering', label: 'Clustering' },
  { value: 'Recommendation', label: 'Recommendation' },
  { value: 'Forecasting', label: 'Forecasting' }
];

// Framework options
const frameworkOptions = [
  { value: 'PyTorch', label: 'PyTorch' },
  { value: 'TensorFlow', label: 'TensorFlow' },
  { value: 'scikit-learn', label: 'scikit-learn' },
  { value: 'Keras', label: 'Keras' },
  { value: 'MXNet', label: 'MXNet' },
  { value: 'ONNX', label: 'ONNX' }
];

// Model details modal
const showDetailsModal = ref(false);
const selectedModel = ref<any>(null);

// Filtered models
const filteredModels = computed(() => {
  let filtered = [...models.value];
  
  // Apply search filter
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase();
    filtered = filtered.filter(model => 
      model.name.toLowerCase().includes(search) || 
      model.description.toLowerCase().includes(search) ||
      model.type.toLowerCase().includes(search) ||
      (model.tags && model.tags.some((tag: string) => tag.toLowerCase().includes(search)))
    );
  }
  
  // Apply status filter
  if (statusFilter.value) {
    filtered = filtered.filter(model => model.status === statusFilter.value);
  }
  
  // Apply type filter
  if (typeFilter.value) {
    filtered = filtered.filter(model => model.type === typeFilter.value);
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    let aValue, bValue;
    
    // Special handling for the accuracy column
    if (sortKey.value === 'accuracy') {
      aValue = parseFloat(a.metrics.accuracy.replace('%', ''));
      bValue = parseFloat(b.metrics.accuracy.replace('%', ''));
    } else {
      aValue = a[sortKey.value];
      bValue = b[sortKey.value];
    }
    
    if (sortOrder.value === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });
  
  return filtered;
});

// Utility functions
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Deployed': return 'success';
    case 'Training': return 'info';
    case 'Testing': return 'warning';
    default: return 'default';
  }
};

const getModelTypeIcon = (type: string) => {
  switch (type) {
    case 'NLP': return 'chat';
    case 'Computer Vision': return 'visibility';
    case 'Classification': return 'category';
    case 'Recommendation': return 'thumb_up';
    case 'Forecasting': return 'trending_up';
    default: return 'model_training';
  }
};

// Event handlers
const handlePageChange = (page: number) => {
  currentPage.value = page;
};

const handleSort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const handleModelClick = (model: any) => {
  selectedModel.value = model;
  showDetailsModal.value = true;
};

const handleFileUploadClick = () => {
  // Simulate file selection
  newModel.value.file = 'model_' + Date.now() + '.bin';
};

const handleCreateModel = () => {
  // Reset form errors
  formErrors.value = {
    name: '',
    type: '',
    version: '',
    framework: '',
    description: '',
    accuracy: '',
    f1Score: '',
    tags: '',
    file: ''
  };
  
  // Validate form
  let isValid = true;
  if (!newModel.value.name) {
    formErrors.value.name = 'Model name is required';
    isValid = false;
  }
  if (!newModel.value.type) {
    formErrors.value.type = 'Model type is required';
    isValid = false;
  }
  if (!newModel.value.version) {
    formErrors.value.version = 'Version is required';
    isValid = false;
  }
  if (!newModel.value.framework) {
    formErrors.value.framework = 'Framework is required';
    isValid = false;
  }
  if (!newModel.value.description) {
    formErrors.value.description = 'Description is required';
    isValid = false;
  }
  
  if (!isValid) return;
  
  // Create model
  isCreating.value = true;
  
  // Process tags
  const tags = newModel.value.tagsInput
    ? newModel.value.tagsInput.split(',').map(tag => tag.trim())
    : [];
  
  // Simulate API call
  setTimeout(() => {
    const newId = Math.max(...models.value.map(m => m.id)) + 1;
    models.value.push({
      id: newId,
      name: newModel.value.name,
      type: newModel.value.type,
      status: newModel.value.deployImmediately ? 'Training' : 'Testing',
      version: newModel.value.version,
      framework: newModel.value.framework,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      size: Math.floor(Math.random() * 1000) + 100 + 'MB',
      description: newModel.value.description,
      tags,
      metrics: {
        accuracy: newModel.value.metrics.accuracy || '85.0%',
        f1Score: newModel.value.metrics.f1Score || '0.85'
      }
    });
    
    // Update tab count
    tabs[0].count = models.value.length;
    
    isCreating.value = false;
    showNewModelModal.value = false;
    
    // Reset form
    newModel.value = {
      name: '',
      type: '',
      version: '1.0.0',
      framework: '',
      description: '',
      metrics: {
        accuracy: '',
        f1Score: ''
      },
      tagsInput: '',
      file: '',
      deployImmediately: false
    };
  }, 1500);
};

const handleDeployModel = (model: any) => {
  // Simulate deployment
  const modelIndex = models.value.findIndex(m => m.id === model.id);
  if (modelIndex !== -1) {
    // Change status to Training temporarily to simulate deployment process
    models.value[modelIndex].status = 'Training';
    
    // After a delay, update to Deployed
    setTimeout(() => {
      models.value[modelIndex].status = 'Deployed';
      
      // Add deployment record
      if (!models.value[modelIndex].deploymentHistory) {
        models.value[modelIndex].deploymentHistory = [];
      }
      
      models.value[modelIndex].deploymentHistory.push({
        version: models.value[modelIndex].version,
        date: new Date().toISOString().split('T')[0],
        environment: 'Production',
        status: 'Success',
        duration: Math.floor(Math.random() * 60) + 10 + 'm'
      });
      
      // If details modal is open, refresh selected model
      if (showDetailsModal.value && selectedModel.value && selectedModel.value.id === model.id) {
        selectedModel.value = { ...models.value[modelIndex] };
      }
    }, 3000);
  }
};

const handleViewDetails = (model: any) => {
  selectedModel.value = model;
  showDetailsModal.value = true;
};

const handleViewVersionHistory = (model: any) => {
  // This would navigate to a version history view
  console.log('Viewing version history for model:', model.id);
};

const handleViewMonitoring = (model: any) => {
  // This would navigate to a monitoring view
  console.log('Viewing monitoring for model:', model.id);
};

const handleDeleteModel = (model: any) => {
  // This would show a confirmation dialog
  if (confirm(`Are you sure you want to delete model "${model.name}"?`)) {
    const modelIndex = models.value.findIndex(m => m.id === model.id);
    if (modelIndex !== -1) {
      models.value.splice(modelIndex, 1);
      
      // Update tab count
      tabs[0].count = models.value.length;
      
      // Close the details modal
      showDetailsModal.value = false;
      selectedModel.value = null;
    }
  }
};

const handleActionsClick = (model: any) => {
  // Show context menu or action dialog
  selectedModel.value = model;
  showDetailsModal.value = true;
};
</script>

<style scoped>
.view-models {
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.view-title {
  font-size: 1.8rem;
  color: var(--bl-text-primary);
  margin-bottom: 1.5rem;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.view-tabs {
  display: flex;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--bl-border);
}

.view-tab {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  color: var(--bl-text-secondary);
  font-weight: var(--bl-font-weight-medium);
  border-bottom: 2px solid transparent;
  margin-right: 0.5rem;
}

.view-tab.active {
  color: var(--bl-primary);
  border-bottom-color: var(--bl-primary);
}

.view-tab:hover:not(.active) {
  color: var(--bl-text-primary);
  background-color: var(--bl-background-hover);
}

.tab-icon {
  margin-right: 0.5rem;
  font-size: 1.25rem;
}

.tab-count {
  background-color: var(--bl-background-secondary);
  border-radius: 10px;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  margin-left: 0.5rem;
}

.model-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.filter-group {
  display: flex;
  gap: 0.5rem;
}

/* Gallery Layout */
.model-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.model-card {
  cursor: pointer;
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}

.model-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.model-card-header {
  padding: 1rem;
  border-bottom: 1px solid var(--bl-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.model-card-title-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.model-card-title {
  font-size: 1.1rem;
  font-weight: var(--bl-font-weight-semibold);
  color: var(--bl-text-primary);
  margin: 0;
}

.model-type-icon {
  font-size: 2rem;
  color: var(--bl-primary);
}

.model-card-body {
  padding: 1rem;
}

.model-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 1rem;
}

.model-metric {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metric-label {
  font-size: 0.75rem;
  color: var(--bl-text-secondary);
}

.metric-value {
  font-weight: var(--bl-font-weight-semibold);
  color: var(--bl-text-primary);
}

.model-description {
  color: var(--bl-text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.model-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.model-card-footer {
  padding: 1rem;
  border-top: 1px solid var(--bl-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.model-info {
  display: flex;
  flex-direction: column;
  font-size: 0.75rem;
  color: var(--bl-text-secondary);
}

.model-version {
  font-weight: var(--bl-font-weight-medium);
}

.model-actions {
  display: flex;
  gap: 0.5rem;
}

/* Table specifics */
.accuracy-display {
  position: relative;
  background-color: var(--bl-background-secondary);
  border-radius: 4px;
  height: 8px;
  width: 100%;
  max-width: 100px;
  overflow: hidden;
}

.accuracy-bar {
  background-color: var(--bl-success);
  height: 100%;
  transition: width 0.3s ease-in-out;
}

.accuracy-text {
  position: absolute;
  right: 0;
  top: -16px;
  font-size: 0.75rem;
  line-height: 1;
}

.row-actions {
  display: flex;
  gap: 0.25rem;
}

/* Model details */
.model-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.model-detail-section {
  border-bottom: 1px solid var(--bl-border);
  padding-bottom: 1rem;
}

.model-detail-section:last-child {
  border-bottom: none;
}

.model-detail-section h3 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: var(--bl-text-primary);
}

.model-detail-section h4 {
  font-size: 0.875rem;
  margin: 0.75rem 0 0.5rem;
  color: var(--bl-text-secondary);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 0.75rem;
  color: var(--bl-text-secondary);
  margin-bottom: 0.25rem;
}

.detail-value {
  font-size: 0.875rem;
  color: var(--bl-text-primary);
}

.model-description-full {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--bl-text-primary);
  white-space: pre-line;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.metric-card {
  padding: 1rem;
  background-color: var(--bl-background-secondary);
  border-radius: 8px;
}

.metric-card-title {
  font-size: 0.875rem;
  color: var(--bl-text-secondary);
  margin-bottom: 0.5rem;
}

.metric-card-value {
  font-size: 1.25rem;
  font-weight: var(--bl-font-weight-semibold);
  color: var(--bl-text-primary);
  margin-bottom: 0.75rem;
}

.metric-card-gauge {
  background-color: var(--bl-background);
  border-radius: 4px;
  height: 8px;
  width: 100%;
  overflow: hidden;
}

.metric-gauge-bar {
  background-color: var(--bl-primary);
  height: 100%;
  transition: width 0.3s ease-in-out;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.history-table th,
.history-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--bl-border);
}

.history-table th {
  color: var(--bl-text-secondary);
  font-weight: var(--bl-font-weight-medium);
}

.no-data {
  text-align: center;
  color: var(--bl-text-secondary);
  padding: 1rem;
}

.model-detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

/* Form styling */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.file-upload {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.file-name {
  font-size: 0.875rem;
  color: var(--bl-text-primary);
}
</style>
