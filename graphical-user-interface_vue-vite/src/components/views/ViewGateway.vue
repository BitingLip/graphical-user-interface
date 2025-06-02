<template>
  <div class="view-gateway">
    <h1 class="view-title">API Gateway</h1>
    
    <div class="stats-row">
      <StatsCard
        icon="public"
        value="28"
        label="Total Endpoints"
        change="4"
        changePeriod="vs last month"
      />
      <StatsCard
        icon="bolt"
        iconBackground="var(--bl-success)"
        value="3.2M"
        label="API Calls (24h)"
        change="12%"
      />
      <StatsCard
        icon="timer"
        iconBackground="var(--bl-info)"
        value="86ms"
        label="Avg Response Time"
        change="-5"
      />
      <StatsCard
        icon="error"
        iconBackground="var(--bl-danger)"
        value="0.4%"
        label="Error Rate"
        change="-0.2"
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
    
    <!-- Endpoints Tab -->
    <div v-if="activeTab === 'endpoints'" class="gateway-content">
      <div class="gateway-actions">
        <ElementButton 
          icon="add"
          variant="primary"
          @click="showNewEndpointModal = true"
        >
          Create Endpoint
        </ElementButton>
        
        <div class="filter-group">
          <ElementSelect
            v-model="statusFilter"
            :options="statusOptions"
            placeholder="Status"
            size="sm"
          />
          
          <ElementSelect
            v-model="serviceFilter"
            :options="serviceOptions"
            placeholder="Service"
            size="sm"
          />
          
          <ElementInput
            placeholder="Search endpoints..."
            prefixIcon="search"
            v-model="searchQuery"
            size="sm"
          />
        </div>
      </div>
      
      <DataTable
        :columns="endpointColumns"
        :items="filteredEndpoints"
        :isLoading="isLoading"
        :totalItems="endpoints.length"
        :currentPage="currentPage"
        :totalPages="totalPages"
        :perPage="perPage"
        :sortKey="sortKey"
        :sortOrder="sortOrder"
        @row-click="handleEndpointClick"
        @page-change="handlePageChange"
        @sort="handleSort"
        rowClickEnabled
        emptyMessage="No endpoints match your filters"
      >
        <template #column-status="{ item }">
          <ElementBadge
            :variant="getStatusVariant(item.status)"
          >
            {{ item.status }}
          </ElementBadge>
        </template>
        
        <template #column-method="{ item }">
          <span :class="['method-badge', `method-${item.method.toLowerCase()}`]">
            {{ item.method }}
          </span>
        </template>
        
        <template #column-path="{ item }">
          <div class="path-cell">
            <code>{{ item.path }}</code>
          </div>
        </template>
        
        <template #rowActions="{ item }">
          <div class="row-actions">
            <ElementButton
              v-if="item.status === 'Disabled'"
              variant="ghost"
              icon="play_arrow"
              iconOnly
              title="Enable Endpoint"
              @click.stop="toggleEndpointStatus(item)"
            />
            <ElementButton
              v-else
              variant="ghost"
              icon="pause"
              iconOnly
              title="Disable Endpoint"
              @click.stop="toggleEndpointStatus(item)"
            />
            <ElementButton
              variant="ghost"
              icon="edit"
              iconOnly
              title="Edit Endpoint"
              @click.stop="handleEditEndpoint(item)"
            />
            <ElementButton
              variant="ghost"
              icon="delete"
              iconOnly
              title="Delete Endpoint"
              @click.stop="handleDeleteEndpoint(item)"
            />
          </div>
        </template>
      </DataTable>
    </div>
    
    <!-- Services Tab -->
    <div v-if="activeTab === 'services'" class="gateway-content">
      <div class="gateway-actions">
        <ElementButton 
          icon="add"
          variant="primary"
          @click="showNewServiceModal = true"
        >
          Register Service
        </ElementButton>
        
        <ElementInput
          placeholder="Search services..."
          prefixIcon="search"
          v-model="serviceSearchQuery"
          size="sm"
        />
      </div>
      
      <div class="services-grid">
        <ElementCard
          v-for="service in filteredServices"
          :key="service.id"
          class="service-card"
        >
          <div class="service-card-header">
            <div class="service-title-area">
              <h3 class="service-title">{{ service.name }}</h3>
              <ElementBadge :variant="service.health === 'Healthy' ? 'success' : 'danger'">
                {{ service.health }}
              </ElementBadge>
            </div>
            <ElementToggle
              v-model="service.enabled"
              @change="toggleService(service)"
            />
          </div>
          
          <div class="service-card-body">
            <div class="service-info">
              <div class="service-info-row">
                <span class="info-label">URL:</span>
                <code class="info-value">{{ service.url }}</code>
              </div>
              <div class="service-info-row">
                <span class="info-label">Version:</span>
                <span class="info-value">{{ service.version }}</span>
              </div>
              <div class="service-info-row">
                <span class="info-label">Endpoints:</span>
                <span class="info-value">{{ service.endpoints }}</span>
              </div>
              <div class="service-info-row">
                <span class="info-label">Last Check:</span>
                <span class="info-value">{{ service.lastHealthCheck }}</span>
              </div>
            </div>
            
            <div class="service-stats">
              <div class="service-stat">
                <span class="stat-value">{{ service.traffic }}</span>
                <span class="stat-label">24h Traffic</span>
              </div>
              <div class="service-stat">
                <span class="stat-value">{{ service.latency }}</span>
                <span class="stat-label">Avg Latency</span>
              </div>
              <div class="service-stat">
                <span class="stat-value">{{ service.errorRate }}</span>
                <span class="stat-label">Error Rate</span>
              </div>
            </div>
            
            <div class="service-actions">
              <ElementButton
                size="sm"
                variant="secondary"
                icon="api"
                @click="showServiceEndpoints(service)"
              >
                View Endpoints
              </ElementButton>
              <ElementButton
                size="sm"
                variant="secondary"
                icon="monitoring"
                @click="showServiceMetrics(service)"
              >
                Metrics
              </ElementButton>
            </div>
          </div>
        </ElementCard>
      </div>
    </div>
    
    <!-- Monitoring Tab -->
    <div v-if="activeTab === 'monitoring'" class="gateway-content">
      <div class="monitoring-header">
        <div class="monitoring-title">
          <h2>Traffic Monitoring</h2>
          <p class="monitoring-subtitle">Real-time API traffic metrics and analytics</p>
        </div>
        
        <div class="monitoring-filters">
          <ElementSelect
            v-model="timeRange"
            :options="timeRangeOptions"
            placeholder="Time Range"
            size="sm"
          />
          
          <ElementSelect
            v-model="metricType"
            :options="metricTypeOptions"
            placeholder="Metric"
            size="sm"
          />
        </div>
      </div>
      
      <div class="monitoring-chart">
        <div class="chart-placeholder">
          <!-- In a real application, this would be a chart component -->
          <div class="chart-area">
            <div class="chart-lines">
              <div class="chart-line"></div>
              <div class="chart-line"></div>
              <div class="chart-line"></div>
              <div class="chart-line"></div>
              <div class="chart-line"></div>
            </div>
            <div class="chart-data">
              <div 
                v-for="(point, index) in mockChartData" 
                :key="index" 
                class="chart-point"
                :style="{ height: point + '%', left: (index / (mockChartData.length - 1) * 100) + '%' }"
              ></div>
            </div>
          </div>
          <div class="chart-legend">
            <div class="legend-item">
              <div class="legend-color" style="background-color: var(--bl-primary)"></div>
              <div class="legend-label">{{ metricTypeOptions.find(m => m.value === metricType)?.label || 'Requests' }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="monitoring-metrics">
        <div class="metric-box">
          <div class="metric-box-value">3,245,621</div>
          <div class="metric-box-label">Total Requests</div>
        </div>
        <div class="metric-box">
          <div class="metric-box-value">42,183</div>
          <div class="metric-box-label">Current RPM</div>
        </div>
        <div class="metric-box">
          <div class="metric-box-value">86ms</div>
          <div class="metric-box-label">Avg Response Time</div>
        </div>
        <div class="metric-box">
          <div class="metric-box-value">13,651</div>
          <div class="metric-box-label">Error Count</div>
        </div>
      </div>
      
      <div class="top-endpoints">
        <h3 class="section-title">Top Endpoints</h3>
        <table class="top-table">
          <thead>
            <tr>
              <th>Endpoint</th>
              <th>Method</th>
              <th>Service</th>
              <th>Calls</th>
              <th>Avg Response Time</th>
              <th>Error Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="endpoint in topEndpoints" :key="endpoint.id">
              <td><code>{{ endpoint.path }}</code></td>
              <td>
                <span :class="['method-badge', `method-${endpoint.method.toLowerCase()}`]">
                  {{ endpoint.method }}
                </span>
              </td>
              <td>{{ endpoint.service }}</td>
              <td>{{ endpoint.calls }}</td>
              <td>{{ endpoint.avgResponseTime }}</td>
              <td>
                <span :class="['error-rate', { 'high': parseFloat(endpoint.errorRate) > 1 }]">
                  {{ endpoint.errorRate }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Settings Tab -->
    <div v-if="activeTab === 'settings'" class="gateway-content">
      <div class="settings-grid">
        <div class="settings-section">
          <h3 class="settings-title">Global Settings</h3>
          
          <Form>
            <FormFieldGroup
              label="Default Rate Limiting"
              description="Maximum number of requests per minute per IP address"
            >
              <ElementInput
                v-model="settings.rateLimit"
                type="number"
                min="0"
                step="10"
              />
            </FormFieldGroup>
            
            <FormFieldGroup
              label="Timeout"
              description="Global timeout for all API requests (milliseconds)"
            >
              <ElementInput
                v-model="settings.timeout"
                type="number"
                min="100"
                step="100"
              />
            </FormFieldGroup>
            
            <FormFieldGroup
              label="CORS Settings"
            >
              <ElementSelect
                v-model="settings.corsPolicy"
                :options="corsPolicyOptions"
              />
            </FormFieldGroup>
            
            <FormFieldGroup
              label="Allowed Origins"
              description="List of domains allowed to access the API (one per line)"
            >
              <ElementInput
                v-model="settings.allowedOrigins"
                type="textarea"
                rows="3"
                placeholder="https://example.com"
              />
            </FormFieldGroup>
            
            <ElementButton
              variant="primary"
              @click="saveSettings"
            >
              Save Settings
            </ElementButton>
          </Form>
        </div>
        
        <div class="settings-section">
          <h3 class="settings-title">Security</h3>
          
          <Form>
            <FormFieldGroup
              label="Authentication"
              description="Default authentication method for all endpoints"
            >
              <ElementSelect
                v-model="settings.authentication"
                :options="authOptions"
              />
            </FormFieldGroup>
            
            <FormFieldGroup
              label="API Key Expiration"
              description="Number of days before API keys expire"
            >
              <ElementInput
                v-model="settings.apiKeyExpiration"
                type="number"
                min="1"
              />
            </FormFieldGroup>
            
            <FormFieldGroup
              label="JWT Secret"
              description="Secret key used to sign JWTs"
            >
              <ElementInput
                v-model="settings.jwtSecret"
                type="password"
              />
            </FormFieldGroup>
            
            <FormFieldGroup
              label="SSL/TLS"
            >
              <ElementToggle
                v-model="settings.sslEnabled"
                label="Require HTTPS for all endpoints"
              />
            </FormFieldGroup>
            
            <ElementButton
              variant="primary"
              @click="saveSecuritySettings"
            >
              Save Security Settings
            </ElementButton>
          </Form>
        </div>
      </div>
    </div>
    
    <!-- New Endpoint Modal -->
    <Modal
      v-model="showNewEndpointModal"
      :title="isEditing ? 'Edit Endpoint' : 'Create New Endpoint'"
      :loading="isSubmitting"
      @confirm="handleSaveEndpoint"
      size="lg"
    >
      <Form @submit="handleSaveEndpoint">
        <div class="form-row">
          <FormFieldGroup
            class="form-column"
            label="Path"
            required
            :error="formErrors.path"
          >
            <ElementInput
              v-model="newEndpoint.path"
              placeholder="/api/v1/resource"
            />
          </FormFieldGroup>
          
          <FormFieldGroup
            class="form-column"
            label="Method"
            required
            :error="formErrors.method"
          >
            <ElementSelect
              v-model="newEndpoint.method"
              :options="methodOptions"
              placeholder="Select method"
            />
          </FormFieldGroup>
        </div>
        
        <div class="form-row">
          <FormFieldGroup
            class="form-column"
            label="Target Service"
            required
            :error="formErrors.service"
          >
            <ElementSelect
              v-model="newEndpoint.service"
              :options="serviceSelectOptions"
              placeholder="Select service"
            />
          </FormFieldGroup>
          
          <FormFieldGroup
            class="form-column"
            label="Target Path"
            required
            :error="formErrors.targetPath"
          >
            <ElementInput
              v-model="newEndpoint.targetPath"
              placeholder="/resource"
            />
          </FormFieldGroup>
        </div>
        
        <FormFieldGroup
          label="Description"
        >
          <ElementInput
            v-model="newEndpoint.description"
            type="textarea"
            rows="2"
            placeholder="Describe this endpoint's purpose"
          />
        </FormFieldGroup>
        
        <div class="form-section">
          <h4 class="form-section-title">Advanced Settings</h4>
          
          <div class="form-row">
            <FormFieldGroup
              class="form-column"
              label="Rate Limit"
              description="Requests per minute (0 for no limit)"
            >
              <ElementInput
                v-model="newEndpoint.rateLimit"
                type="number"
                min="0"
              />
            </FormFieldGroup>
            
            <FormFieldGroup
              class="form-column"
              label="Timeout (ms)"
            >
              <ElementInput
                v-model="newEndpoint.timeout"
                type="number"
                min="100"
                step="100"
              />
            </FormFieldGroup>
          </div>
          
          <FormFieldGroup
            label="Authentication"
          >
            <ElementSelect
              v-model="newEndpoint.authentication"
              :options="authMethodOptions"
            />
          </FormFieldGroup>
          
          <FormFieldGroup
            label="Cache TTL"
            description="Time in seconds to cache responses (0 for no caching)"
          >
            <ElementInput
              v-model="newEndpoint.cacheTtl"
              type="number"
              min="0"
            />
          </FormFieldGroup>
        </div>
        
        <FormFieldGroup
          label="Status"
        >
          <ElementToggle
            v-model="newEndpoint.enabled"
            :label="newEndpoint.enabled ? 'Enabled' : 'Disabled'"
          />
        </FormFieldGroup>
      </Form>
    </Modal>
    
    <!-- New Service Modal -->
    <Modal
      v-model="showNewServiceModal"
      title="Register New Service"
      :loading="isSubmitting"
      @confirm="handleSaveService"
    >
      <Form @submit="handleSaveService">
        <FormFieldGroup
          label="Service Name"
          required
          :error="formErrors.serviceName"
        >
          <ElementInput
            v-model="newService.name"
            placeholder="Enter service name"
          />
        </FormFieldGroup>
        
        <FormFieldGroup
          label="Base URL"
          required
          :error="formErrors.serviceUrl"
        >
          <ElementInput
            v-model="newService.url"
            placeholder="https://api.service.com"
          />
        </FormFieldGroup>
        
        <FormFieldGroup
          label="Version"
          required
          :error="formErrors.serviceVersion"
        >
          <ElementInput
            v-model="newService.version"
            placeholder="1.0.0"
          />
        </FormFieldGroup>
        
        <FormFieldGroup
          label="Health Check Path"
          description="Endpoint path used to verify service health"
        >
          <ElementInput
            v-model="newService.healthCheckPath"
            placeholder="/health"
          />
        </FormFieldGroup>
        
        <FormFieldGroup
          label="Description"
        >
          <ElementInput
            v-model="newService.description"
            type="textarea"
            rows="3"
            placeholder="Describe this service"
          />
        </FormFieldGroup>
        
        <FormFieldGroup
          label="Status"
        >
          <ElementToggle
            v-model="newService.enabled"
            :label="newService.enabled ? 'Enabled' : 'Disabled'"
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
import ElementCard from '../elements/ElementCard.vue';
import Modal from '../composites/modals/Modal.vue';
import Form from '../composites/forms/Form.vue';
import FormFieldGroup from '../composites/forms/FormFieldGroup.vue';

// Tabs configuration
const tabs = [
  { id: 'endpoints', name: 'Endpoints', icon: 'api', count: 28 },
  { id: 'services', name: 'Services', icon: 'dns', count: 6 },
  { id: 'monitoring', name: 'Monitoring', icon: 'monitoring' },
  { id: 'settings', name: 'Settings', icon: 'settings' }
];
const activeTab = ref('endpoints');

// Endpoints data
const isLoading = ref(false);
const endpoints = ref([
  {
    id: 1,
    path: '/api/v1/users',
    method: 'GET',
    service: 'User Service',
    targetPath: '/users',
    status: 'Active',
    description: 'Get all users',
    rateLimit: 100,
    authentication: 'JWT',
    cacheTtl: 60,
    timeout: 3000,
    enabled: true,
    createdAt: '2025-04-15',
    updatedAt: '2025-05-20'
  },
  {
    id: 2,
    path: '/api/v1/users/{id}',
    method: 'GET',
    service: 'User Service',
    targetPath: '/users/{id}',
    status: 'Active',
    description: 'Get user by ID',
    rateLimit: 200,
    authentication: 'JWT',
    cacheTtl: 60,
    timeout: 2000,
    enabled: true,
    createdAt: '2025-04-15',
    updatedAt: '2025-05-10'
  },
  {
    id: 3,
    path: '/api/v1/users',
    method: 'POST',
    service: 'User Service',
    targetPath: '/users',
    status: 'Active',
    description: 'Create a new user',
    rateLimit: 20,
    authentication: 'JWT',
    cacheTtl: 0,
    timeout: 5000,
    enabled: true,
    createdAt: '2025-04-16',
    updatedAt: '2025-04-16'
  },
  {
    id: 4,
    path: '/api/v1/products',
    method: 'GET',
    service: 'Product Service',
    targetPath: '/products',
    status: 'Active',
    description: 'Get all products',
    rateLimit: 1000,
    authentication: 'API Key',
    cacheTtl: 300,
    timeout: 2500,
    enabled: true,
    createdAt: '2025-04-20',
    updatedAt: '2025-05-18'
  },
  {
    id: 5,
    path: '/api/v1/orders',
    method: 'POST',
    service: 'Order Service',
    targetPath: '/orders',
    status: 'Active',
    description: 'Create a new order',
    rateLimit: 50,
    authentication: 'JWT',
    cacheTtl: 0,
    timeout: 8000,
    enabled: true,
    createdAt: '2025-05-01',
    updatedAt: '2025-05-22'
  },
  {
    id: 6,
    path: '/api/v2/analytics/dashboard',
    method: 'GET',
    service: 'Analytics Service',
    targetPath: '/dashboard',
    status: 'Disabled',
    description: 'Get analytics dashboard data',
    rateLimit: 10,
    authentication: 'OAuth2',
    cacheTtl: 600,
    timeout: 10000,
    enabled: false,
    createdAt: '2025-05-10',
    updatedAt: '2025-05-25'
  }
]);

// Table configuration
const currentPage = ref(1);
const perPage = ref(10);
const totalPages = computed(() => Math.ceil(endpoints.value.length / perPage.value));
const sortKey = ref('id');
const sortOrder = ref<'asc' | 'desc'>('desc');

// Column definitions for endpoints
const endpointColumns = [
  { key: 'path', label: 'Path', sortable: true },
  { key: 'method', label: 'Method', sortable: true, width: '100px' },
  { key: 'service', label: 'Service', sortable: true },
  { key: 'status', label: 'Status', sortable: true, width: '120px' },
  { key: 'authentication', label: 'Auth', sortable: true },
  { key: 'updatedAt', label: 'Updated', sortable: true }
];

// Filters
const searchQuery = ref('');
const statusFilter = ref('');
const serviceFilter = ref('');

// Filter options
const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Disabled', label: 'Disabled' }
];

// Services data
const services = ref([
  {
    id: 1,
    name: 'User Service',
    url: 'https://api.users.bitinglip.com',
    version: '2.1.0',
    health: 'Healthy',
    lastHealthCheck: '2025-06-02 09:45:12',
    endpoints: 6,
    traffic: '845K',
    latency: '72ms',
    errorRate: '0.1%',
    enabled: true,
    description: 'Manages user accounts, authentication, and profiles'
  },
  {
    id: 2,
    name: 'Product Service',
    url: 'https://api.products.bitinglip.com',
    version: '1.5.2',
    health: 'Healthy',
    lastHealthCheck: '2025-06-02 09:47:33',
    endpoints: 8,
    traffic: '1.2M',
    latency: '95ms',
    errorRate: '0.3%',
    enabled: true,
    description: 'Product catalog and inventory management'
  },
  {
    id: 3,
    name: 'Order Service',
    url: 'https://api.orders.bitinglip.com',
    version: '1.2.0',
    health: 'Healthy',
    lastHealthCheck: '2025-06-02 09:46:18',
    endpoints: 5,
    traffic: '450K',
    latency: '124ms',
    errorRate: '0.5%',
    enabled: true,
    description: 'Order processing and management'
  },
  {
    id: 4,
    name: 'Payment Service',
    url: 'https://api.payments.bitinglip.com',
    version: '1.0.8',
    health: 'Healthy',
    lastHealthCheck: '2025-06-02 09:44:55',
    endpoints: 4,
    traffic: '320K',
    latency: '110ms',
    errorRate: '0.2%',
    enabled: true,
    description: 'Payment processing integrations'
  },
  {
    id: 5,
    name: 'Analytics Service',
    url: 'https://api.analytics.bitinglip.com',
    version: '0.9.5',
    health: 'Degraded',
    lastHealthCheck: '2025-06-02 09:40:02',
    endpoints: 3,
    traffic: '180K',
    latency: '185ms',
    errorRate: '2.1%',
    enabled: true,
    description: 'Business intelligence and analytics'
  },
  {
    id: 6,
    name: 'Notification Service',
    url: 'https://api.notifications.bitinglip.com',
    version: '1.1.0',
    health: 'Healthy',
    lastHealthCheck: '2025-06-02 09:47:10',
    endpoints: 2,
    traffic: '210K',
    latency: '68ms',
    errorRate: '0.4%',
    enabled: true,
    description: 'Email, SMS, and push notification delivery'
  }
]);

// Service options for dropdown
const serviceOptions = computed(() => {
  const options = [{ value: '', label: 'All Services' }];
  services.value.forEach(service => {
    options.push({ value: service.name, label: service.name });
  });
  return options;
});

// Service options for select in forms
const serviceSelectOptions = computed(() => {
  return services.value
    .filter(service => service.enabled)
    .map(service => ({ 
      value: service.name, 
      label: service.name 
    }));
});

// Method options
const methodOptions = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'PATCH', label: 'PATCH' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'OPTIONS', label: 'OPTIONS' },
  { value: 'HEAD', label: 'HEAD' }
];

// Authentication method options
const authMethodOptions = [
  { value: 'None', label: 'None' },
  { value: 'API Key', label: 'API Key' },
  { value: 'JWT', label: 'JWT' },
  { value: 'OAuth2', label: 'OAuth2' },
  { value: 'Basic', label: 'Basic Auth' },
  { value: 'Custom', label: 'Custom' }
];

// Service search
const serviceSearchQuery = ref('');
const filteredServices = computed(() => {
  if (!serviceSearchQuery.value) {
    return services.value;
  }
  
  const search = serviceSearchQuery.value.toLowerCase();
  return services.value.filter(service => 
    service.name.toLowerCase().includes(search) || 
    service.description?.toLowerCase().includes(search)
  );
});

// Filtered endpoints
const filteredEndpoints = computed(() => {
  let filtered = [...endpoints.value];
  
  // Apply search filter
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase();
    filtered = filtered.filter(endpoint => 
      endpoint.path.toLowerCase().includes(search) || 
      endpoint.description?.toLowerCase().includes(search) ||
      endpoint.service.toLowerCase().includes(search)
    );
  }
  
  // Apply status filter
  if (statusFilter.value) {
    filtered = filtered.filter(endpoint => endpoint.status === statusFilter.value);
  }
  
  // Apply service filter
  if (serviceFilter.value) {
    filtered = filtered.filter(endpoint => endpoint.service === serviceFilter.value);
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    const aValue = a[sortKey.value];
    const bValue = b[sortKey.value];
    
    if (sortOrder.value === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });
  
  return filtered;
});

// New endpoint form
const showNewEndpointModal = ref(false);
const isSubmitting = ref(false);
const isEditing = ref(false);
const newEndpoint = ref({
  path: '',
  method: 'GET',
  service: '',
  targetPath: '',
  description: '',
  rateLimit: 100,
  authentication: 'JWT',
  cacheTtl: 60,
  timeout: 5000,
  enabled: true
});
const formErrors = ref({
  path: '',
  method: '',
  service: '',
  targetPath: '',
  serviceName: '',
  serviceUrl: '',
  serviceVersion: ''
});

// New service form
const showNewServiceModal = ref(false);
const newService = ref({
  name: '',
  url: '',
  version: '1.0.0',
  healthCheckPath: '/health',
  description: '',
  enabled: true
});

// Settings
const settings = ref({
  rateLimit: '100',
  timeout: '5000',
  corsPolicy: 'specific',
  allowedOrigins: 'https://bitinglip.com\nhttps://admin.bitinglip.com',
  authentication: 'JWT',
  apiKeyExpiration: '30',
  jwtSecret: 'YourSecureJWTSecretKey',
  sslEnabled: true
});

// CORS policy options
const corsPolicyOptions = [
  { value: 'all', label: 'Allow All Origins' },
  { value: 'specific', label: 'Allow Specific Origins' },
  { value: 'none', label: 'Disable CORS' }
];

// Auth options
const authOptions = [
  { value: 'None', label: 'No Authentication' },
  { value: 'API Key', label: 'API Key' },
  { value: 'JWT', label: 'JWT Token' },
  { value: 'OAuth2', label: 'OAuth 2.0' }
];

// Monitoring
const timeRange = ref('24h');
const timeRangeOptions = [
  { value: '1h', label: 'Last Hour' },
  { value: '6h', label: 'Last 6 Hours' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' }
];

const metricType = ref('requests');
const metricTypeOptions = [
  { value: 'requests', label: 'Request Count' },
  { value: 'latency', label: 'Response Time' },
  { value: 'errors', label: 'Error Rate' },
  { value: 'bandwidth', label: 'Bandwidth' }
];

// Mock chart data
const mockChartData = [25, 38, 42, 35, 48, 56, 42, 44, 38, 56, 64, 58, 46, 54, 48, 52, 60, 65, 58, 52];

// Top endpoints data
const topEndpoints = [
  { 
    id: 4, 
    path: '/api/v1/products', 
    method: 'GET',
    service: 'Product Service',
    calls: '546,234',
    avgResponseTime: '95ms',
    errorRate: '0.3%'
  },
  { 
    id: 1, 
    path: '/api/v1/users', 
    method: 'GET',
    service: 'User Service',
    calls: '412,087',
    avgResponseTime: '72ms',
    errorRate: '0.1%'
  },
  { 
    id: 5, 
    path: '/api/v1/orders', 
    method: 'POST',
    service: 'Order Service',
    calls: '284,651',
    avgResponseTime: '124ms',
    errorRate: '0.5%'
  },
  { 
    id: 2, 
    path: '/api/v1/users/{id}', 
    method: 'GET',
    service: 'User Service',
    calls: '187,923',
    avgResponseTime: '68ms',
    errorRate: '0.2%'
  },
  { 
    id: 7, 
    path: '/api/v1/payments/process', 
    method: 'POST',
    service: 'Payment Service',
    calls: '172,546',
    avgResponseTime: '110ms',
    errorRate: '0.4%'
  }
];

// Utility functions
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Active': return 'success';
    case 'Disabled': return 'warning';
    default: return 'default';
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

const handleEndpointClick = (endpoint: any) => {
  // View endpoint details
  handleEditEndpoint(endpoint);
};

const handleEditEndpoint = (endpoint: any) => {
  isEditing.value = true;
  
  // Clone the endpoint to avoid directly modifying the source object
  newEndpoint.value = {
    ...endpoint,
    enabled: endpoint.status === 'Active'
  };
  
  showNewEndpointModal.value = true;
};

const toggleEndpointStatus = (endpoint: any) => {
  const endpointIndex = endpoints.value.findIndex(e => e.id === endpoint.id);
  if (endpointIndex !== -1) {
    const newStatus = endpoint.status === 'Active' ? 'Disabled' : 'Active';
    endpoints.value[endpointIndex].status = newStatus;
    endpoints.value[endpointIndex].enabled = newStatus === 'Active';
  }
};

const handleDeleteEndpoint = (endpoint: any) => {
  if (confirm(`Are you sure you want to delete endpoint "${endpoint.path}"?`)) {
    const endpointIndex = endpoints.value.findIndex(e => e.id === endpoint.id);
    if (endpointIndex !== -1) {
      endpoints.value.splice(endpointIndex, 1);
      
      // Update tab count
      tabs[0].count = endpoints.value.length;
    }
  }
};

const handleSaveEndpoint = () => {
  // Reset form errors
  formErrors.value = {
    path: '',
    method: '',
    service: '',
    targetPath: '',
    serviceName: '',
    serviceUrl: '',
    serviceVersion: ''
  };
  
  // Validate form
  let isValid = true;
  if (!newEndpoint.value.path) {
    formErrors.value.path = 'Path is required';
    isValid = false;
  }
  if (!newEndpoint.value.method) {
    formErrors.value.method = 'Method is required';
    isValid = false;
  }
  if (!newEndpoint.value.service) {
    formErrors.value.service = 'Target service is required';
    isValid = false;
  }
  if (!newEndpoint.value.targetPath) {
    formErrors.value.targetPath = 'Target path is required';
    isValid = false;
  }
  
  if (!isValid) return;
  
  // Save endpoint
  isSubmitting.value = true;
  
  // Simulate API call
  setTimeout(() => {
    if (isEditing.value) {
      // Update existing endpoint
      const endpointIndex = endpoints.value.findIndex(e => e.id === newEndpoint.value.id);
      if (endpointIndex !== -1) {
        endpoints.value[endpointIndex] = {
          ...newEndpoint.value,
          status: newEndpoint.value.enabled ? 'Active' : 'Disabled',
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
    } else {
      // Create new endpoint
      const newId = Math.max(...endpoints.value.map(e => e.id)) + 1;
      endpoints.value.push({
        ...newEndpoint.value,
        id: newId,
        status: newEndpoint.value.enabled ? 'Active' : 'Disabled',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      });
      
      // Update tab count
      tabs[0].count = endpoints.value.length;
    }
    
    isSubmitting.value = false;
    showNewEndpointModal.value = false;
    
    // Reset form and editing state
    isEditing.value = false;
    newEndpoint.value = {
      path: '',
      method: 'GET',
      service: '',
      targetPath: '',
      description: '',
      rateLimit: 100,
      authentication: 'JWT',
      cacheTtl: 60,
      timeout: 5000,
      enabled: true
    };
  }, 800);
};

const handleSaveService = () => {
  // Reset form errors
  formErrors.value = {
    serviceName: '',
    serviceUrl: '',
    serviceVersion: '',
    path: '',
    method: '',
    service: '',
    targetPath: ''
  };
  
  // Validate form
  let isValid = true;
  if (!newService.value.name) {
    formErrors.value.serviceName = 'Service name is required';
    isValid = false;
  }
  if (!newService.value.url) {
    formErrors.value.serviceUrl = 'Base URL is required';
    isValid = false;
  }
  if (!newService.value.version) {
    formErrors.value.serviceVersion = 'Version is required';
    isValid = false;
  }
  
  if (!isValid) return;
  
  // Save service
  isSubmitting.value = true;
  
  // Simulate API call
  setTimeout(() => {
    const newId = Math.max(...services.value.map(s => s.id)) + 1;
    services.value.push({
      id: newId,
      name: newService.value.name,
      url: newService.value.url,
      version: newService.value.version,
      health: 'Healthy',
      lastHealthCheck: new Date().toISOString().replace('T', ' ').substring(0, 19),
      endpoints: 0,
      traffic: '0',
      latency: '0ms',
      errorRate: '0%',
      enabled: newService.value.enabled,
      description: newService.value.description
    });
    
    // Update tab count
    tabs[1].count = services.value.length;
    
    isSubmitting.value = false;
    showNewServiceModal.value = false;
    
    // Reset form
    newService.value = {
      name: '',
      url: '',
      version: '1.0.0',
      healthCheckPath: '/health',
      description: '',
      enabled: true
    };
  }, 800);
};

const toggleService = (service: any) => {
  // This would update the service's enabled status
  console.log('Toggled service:', service.name, 'to', service.enabled);
};

const showServiceEndpoints = (service: any) => {
  // Filter endpoints to show only those for this service
  serviceFilter.value = service.name;
  activeTab.value = 'endpoints';
};

const showServiceMetrics = (service: any) => {
  // Navigate to monitoring tab with this service's metrics
  activeTab.value = 'monitoring';
};

const saveSettings = () => {
  // Simulate saving settings
  alert('Settings saved successfully!');
};

const saveSecuritySettings = () => {
  // Simulate saving security settings
  alert('Security settings saved successfully!');
};
</script>

<style scoped>
.view-gateway {
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

.gateway-content {
  margin-top: 1.5rem;
}

.gateway-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.filter-group {
  display: flex;
  gap: 0.5rem;
}

/* Method badges */
.method-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: var(--bl-font-weight-medium);
  border-radius: 4px;
  text-align: center;
  width: 60px;
}

.method-get {
  background-color: #61affe;
  color: white;
}

.method-post {
  background-color: #49cc90;
  color: white;
}

.method-put {
  background-color: #fca130;
  color: white;
}

.method-patch {
  background-color: #50e3c2;
  color: white;
}

.method-delete {
  background-color: #f93e3e;
  color: white;
}

.method-options,
.method-head {
  background-color: #9012fe;
  color: white;
}

/* Path cell */
.path-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
}

code {
  font-family: monospace;
  font-size: 0.875rem;
  background-color: var(--bl-background-secondary);
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
}

.row-actions {
  display: flex;
  gap: 0.25rem;
}

/* Services grid */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.service-card {
  height: 100%;
}

.service-card-header {
  padding: 1rem;
  border-bottom: 1px solid var(--bl-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.service-title-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.service-title {
  font-size: 1.1rem;
  font-weight: var(--bl-font-weight-semibold);
  color: var(--bl-text-primary);
  margin: 0;
}

.service-card-body {
  padding: 1rem;
}

.service-info {
  margin-bottom: 1rem;
}

.service-info-row {
  display: flex;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.info-label {
  width: 100px;
  color: var(--bl-text-secondary);
}

.info-value {
  color: var(--bl-text-primary);
}

.service-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 1rem 0;
  padding: 0.5rem 0;
  border-top: 1px solid var(--bl-border);
  border-bottom: 1px solid var(--bl-border);
}

.service-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-weight: var(--bl-font-weight-semibold);
  color: var(--bl-text-primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--bl-text-secondary);
}

.service-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

/* Monitoring */
.monitoring-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.monitoring-title h2 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
}

.monitoring-subtitle {
  margin: 0;
  color: var(--bl-text-secondary);
  font-size: 0.875rem;
}

.monitoring-filters {
  display: flex;
  gap: 0.5rem;
}

.monitoring-chart {
  background-color: var(--bl-background-secondary);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.chart-placeholder {
  width: 100%;
  height: 300px;
  position: relative;
}

.chart-area {
  width: 100%;
  height: 250px;
  position: relative;
  border-bottom: 1px solid var(--bl-border);
}

.chart-lines {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.chart-line {
  width: 100%;
  height: 1px;
  background-color: rgba(128, 128, 128, 0.1);
}

.chart-data {
  position: absolute;
  width: 100%;
  height: 100%;
  bottom: 0;
}

.chart-point {
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: var(--bl-primary);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  bottom: 0;
}

.chart-point::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--bl-primary);
  opacity: 0.2;
  pointer-events: none;
}

.chart-legend {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 0 1rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 0.5rem;
}

.legend-label {
  font-size: 0.875rem;
  color: var(--bl-text-secondary);
}

.monitoring-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.metric-box {
  background-color: var(--bl-background-secondary);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.metric-box-value {
  font-size: 1.5rem;
  font-weight: var(--bl-font-weight-bold);
  color: var(--bl-text-primary);
  margin-bottom: 0.5rem;
}

.metric-box-label {
  font-size: 0.875rem;
  color: var(--bl-text-secondary);
}

.section-title {
  font-size: 1.125rem;
  margin: 1.5rem 0 1rem;
}

.top-table {
  width: 100%;
  border-collapse: collapse;
}

.top-table th,
.top-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--bl-border);
  font-size: 0.875rem;
}

.top-table th {
  color: var(--bl-text-secondary);
  font-weight: var(--bl-font-weight-medium);
}

.error-rate {
  color: var(--bl-text-secondary);
}

.error-rate.high {
  color: var(--bl-danger);
}

/* Settings */
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.settings-section {
  background-color: var(--bl-background-secondary);
  border-radius: 8px;
  padding: 1.5rem;
}

.settings-title {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.125rem;
}

/* Form styling */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-section {
  margin-top: 1.5rem;
  border-top: 1px solid var(--bl-border);
  padding-top: 1.5rem;
}

.form-section-title {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: var(--bl-text-secondary);
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .gateway-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .filter-group {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}
</style>
