<template>
  <div class="view-home">
    <h1 class="view-title">Dashboard</h1>
    
    <div class="dashboard-welcome">
      <div class="welcome-content">
        <h2>Welcome back, {{ userName }}</h2>
        <p>Here's what's happening with your workspaces today</p>
      </div>
      <div class="welcome-actions">
        <ElementButton 
          variant="primary"
          icon="add"
          @click="createNewResource"
        >
          New Resource
        </ElementButton>
      </div>
    </div>
    
    <div class="stats-overview">
      <div class="stats-section">
        <h3>Platform Overview</h3>
        <div class="stats-grid">
          <StatsCard
            icon="cloud_queue"
            value="12"
            label="Active Clusters"
            change="3"
          />
          <StatsCard
            icon="model_training"
            iconBackground="var(--bl-success)"
            value="48"
            label="Deployed Models"
            change="5"
          />
          <StatsCard
            icon="api"
            iconBackground="var(--bl-info)"
            value="156"
            label="API Endpoints"
            change="12"
          />
          <StatsCard
            icon="memory"
            iconBackground="var(--bl-warning)"
            value="78%"
            label="System Utilization"
            change="-2"
          />
        </div>
      </div>
    </div>
    
    <div class="dashboard-grid">
      <div class="dashboard-card recent-activities">
        <div class="card-header">
          <h3>Recent Activities</h3>
          <button class="card-action">
            View All <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
        <div class="activity-timeline">
          <div v-for="(activity, index) in recentActivities" :key="index" class="activity-item">
            <div class="activity-icon" :style="{ backgroundColor: getActivityColor(activity.type) }">
              <span class="material-symbols-outlined">{{ getActivityIcon(activity.type) }}</span>
            </div>
            <div class="activity-content">
              <div class="activity-header">
                <span class="activity-title">{{ activity.title }}</span>
                <span class="activity-time">{{ formatTime(activity.time) }}</span>
              </div>
              <p class="activity-description">{{ activity.description }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dashboard-card system-resources">
        <div class="card-header">
          <h3>System Resources</h3>
          <div class="header-actions">
            <ElementSelect
              v-model="selectedCluster"
              :options="clusterOptions"
              size="small"
            />
            <button class="card-action">
              <span class="material-symbols-outlined">refresh</span>
            </button>
          </div>
        </div>
        <div class="resources-grid">
          <div class="resource-chart">
            <h4>CPU Usage</h4>
            <div class="chart-container">
              <div class="progress-bar">
                <div class="progress" :style="{ width: '68%', backgroundColor: 'var(--bl-warning)' }"></div>
              </div>
              <div class="chart-value">68%</div>
            </div>
          </div>
          <div class="resource-chart">
            <h4>Memory Usage</h4>
            <div class="chart-container">
              <div class="progress-bar">
                <div class="progress" :style="{ width: '75%', backgroundColor: 'var(--bl-danger)' }"></div>
              </div>
              <div class="chart-value">75%</div>
            </div>
          </div>
          <div class="resource-chart">
            <h4>Storage Usage</h4>
            <div class="chart-container">
              <div class="progress-bar">
                <div class="progress" :style="{ width: '42%', backgroundColor: 'var(--bl-success)' }"></div>
              </div>
              <div class="chart-value">42%</div>
            </div>
          </div>
          <div class="resource-chart">
            <h4>Network Traffic</h4>
            <div class="chart-container">
              <div class="progress-bar">
                <div class="progress" :style="{ width: '54%', backgroundColor: 'var(--bl-info)' }"></div>
              </div>
              <div class="chart-value">54%</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dashboard-card recent-issues">
        <div class="card-header">
          <h3>Recent Issues</h3>
          <button class="card-action" @click="navigateToView('issues')">
            View All <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
        <table class="issues-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="issue in recentIssues" :key="issue.id" @click="navigateToIssue(issue)">
              <td>#{{ issue.id }}</td>
              <td class="issue-title">{{ issue.title }}</td>
              <td>
                <div class="issue-priority" :class="issue.priority.toLowerCase()">
                  {{ issue.priority }}
                </div>
              </td>
              <td>
                <div class="issue-status" :class="issue.status.toLowerCase()">
                  {{ issue.status }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="dashboard-card quick-actions">
        <div class="card-header">
          <h3>Quick Actions</h3>
        </div>
        <div class="quick-actions-grid">
          <button class="quick-action-item" @click="navigateToView('clusters')">
            <div class="quick-action-icon">
              <span class="material-symbols-outlined">cloud_queue</span>
            </div>
            <div class="quick-action-label">Manage Clusters</div>
          </button>
          <button class="quick-action-item" @click="navigateToView('models')">
            <div class="quick-action-icon">
              <span class="material-symbols-outlined">model_training</span>
            </div>
            <div class="quick-action-label">Deploy Model</div>
          </button>
          <button class="quick-action-item" @click="navigateToView('tasks')">
            <div class="quick-action-icon">
              <span class="material-symbols-outlined">task</span>
            </div>
            <div class="quick-action-label">Create Task</div>
          </button>
          <button class="quick-action-item" @click="navigateToView('issues')">
            <div class="quick-action-icon">
              <span class="material-symbols-outlined">bug_report</span>
            </div>
            <div class="quick-action-label">Report Issue</div>
          </button>
          <button class="quick-action-item" @click="navigateToView('gateway')">
            <div class="quick-action-icon">
              <span class="material-symbols-outlined">api</span>
            </div>
            <div class="quick-action-label">API Gateway</div>
          </button>
          <button class="quick-action-item" @click="navigateToView('documentation')">
            <div class="quick-action-icon">
              <span class="material-symbols-outlined">description</span>
            </div>
            <div class="quick-action-label">Documentation</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useAppStore } from '../../stores/appStore';
import StatsCard from '../elements/StatsCard.vue';
import ElementButton from '../elements/ElementButton.vue';
import ElementSelect from '../elements/ElementSelect.vue';

interface Activity {
  title: string;
  description: string;
  type: 'deploy' | 'create' | 'update' | 'delete' | 'issue';
  time: Date;
}

interface Issue {
  id: number;
  title: string;
  priority: string;
  status: string;
}

export default defineComponent({
  name: 'ViewHome',
  components: {
    StatsCard,
    ElementButton,
    ElementSelect
  },
  setup() {
    const appStore = useAppStore();
    
    const userName = computed(() => appStore.userName);
    
    // System resources data
    const selectedCluster = ref('production');
    const clusterOptions = [
      { value: 'production', label: 'Production Cluster' },
      { value: 'staging', label: 'Staging Cluster' },
      { value: 'development', label: 'Development Cluster' }
    ];
    
    // Recent activities
    const recentActivities = ref<Activity[]>([
      {
        title: 'Model Deployment',
        description: 'Sentiment analysis model v2.1 deployed to production cluster',
        type: 'deploy',
        time: new Date('2025-06-02T09:15:00')
      },
      {
        title: 'New Task Created',
        description: 'Task #T-458 "Update authentication service" assigned to John Doe',
        type: 'create',
        time: new Date('2025-06-01T16:30:00')
      },
      {
        title: 'Cluster Update',
        description: 'Development cluster updated to Kubernetes 1.28',
        type: 'update',
        time: new Date('2025-06-01T14:45:00')
      },
      {
        title: 'Issue Reported',
        description: 'Critical issue #1045 "API gateway authentication failure" reported',
        type: 'issue',
        time: new Date('2025-06-01T10:20:00')
      },
      {
        title: 'API Endpoint Created',
        description: 'New endpoint /api/v2/predictions added to the Gateway',
        type: 'create',
        time: new Date('2025-05-31T15:10:00')
      }
    ]);
    
    // Recent issues
    const recentIssues = ref<Issue[]>([
      {
        id: 1045,
        title: 'API gateway authentication failure with high traffic',
        priority: 'High',
        status: 'Open'
      },
      {
        id: 1044,
        title: 'Dashboard performance issues in Firefox',
        priority: 'Medium',
        status: 'In Progress'
      },
      {
        id: 1043,
        title: 'Model training fails with OOM error on large datasets',
        priority: 'High',
        status: 'In Progress'
      },
      {
        id: 1042,
        title: 'Documentation links broken in API section',
        priority: 'Low',
        status: 'Resolved'
      }
    ]);
    
    // Helper methods
    const formatTime = (date: Date) => {
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 24) {
        if (diffInHours < 1) {
          const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
          return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
        }
        return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
      } else if (diffInHours < 48) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    };
    
    const getActivityIcon = (type: string) => {
      switch (type) {
        case 'deploy': return 'rocket_launch';
        case 'create': return 'add_circle';
        case 'update': return 'update';
        case 'delete': return 'delete';
        case 'issue': return 'bug_report';
        default: return 'info';
      }
    };
    
    const getActivityColor = (type: string) => {
      switch (type) {
        case 'deploy': return 'var(--bl-success)';
        case 'create': return 'var(--bl-primary)';
        case 'update': return 'var(--bl-info)';
        case 'delete': return 'var(--bl-danger)';
        case 'issue': return 'var(--bl-warning)';
        default: return 'var(--bl-text-secondary)';
      }
    };
    
    // Navigation methods
    const navigateToView = (view: string) => {
      appStore.setCurrentView(view);
    };
    
    const navigateToIssue = (issue: Issue) => {
      // In a real app, this would navigate to the specific issue
      navigateToView('issues');
    };
    
    // Action methods
    const createNewResource = () => {
      // This would open a modal with options to create different resources
      console.log('Open new resource modal');
    };
    
    return {
      userName,
      selectedCluster,
      clusterOptions,
      recentActivities,
      recentIssues,
      formatTime,
      getActivityIcon,
      getActivityColor,
      navigateToView,
      navigateToIssue,
      createNewResource
    };
  }
});
</script>

<style scoped>
.view-home {
  padding: 2rem;
}

.view-title {
  margin-bottom: 2rem;
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--bl-text-primary);
}

.dashboard-welcome {
  background-color: var(--bl-card-background);
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-content h2 {
  font-size: 1.6rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--bl-text-primary);
}

.welcome-content p {
  margin: 0;
  color: var(--bl-text-secondary);
}

.stats-overview {
  margin-bottom: 2rem;
}

.stats-section h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 500;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-welcome {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .welcome-actions {
    margin-top: 1.5rem;
  }
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 1.5rem;
}

@media (max-width: 992px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

.dashboard-card {
  background-color: var(--bl-card-background);
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--bl-border-color);
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-action {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: var(--bl-text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: color 0.2s;
}

.card-action:hover {
  color: var(--bl-primary);
}

.card-action .material-symbols-outlined {
  font-size: 1.1rem;
}

/* Activity Timeline */
.activity-timeline {
  padding: 1rem 1.5rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem 0;
  border-bottom: 1px solid var(--bl-border-color);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
}

.activity-icon span {
  color: white;
  font-size: 1.2rem;
}

.activity-content {
  flex-grow: 1;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.activity-title {
  font-weight: 500;
  color: var(--bl-text-primary);
}

.activity-time {
  font-size: 0.85rem;
  color: var(--bl-text-tertiary);
}

.activity-description {
  margin: 0;
  font-size: 0.9rem;
  color: var(--bl-text-secondary);
  line-height: 1.4;
}

/* System Resources */
.resources-grid {
  padding: 1rem 1.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.resource-chart h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--bl-text-primary);
}

.chart-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex-grow: 1;
  height: 8px;
  background-color: var(--bl-background-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  border-radius: 4px;
}

.chart-value {
  font-weight: 600;
  color: var(--bl-text-primary);
  width: 40px;
  text-align: right;
}

/* Recent Issues */
.issues-table {
  width: 100%;
  border-collapse: collapse;
}

.issues-table th {
  padding: 0.75rem 1.5rem;
  text-align: left;
  font-weight: 500;
  color: var(--bl-text-secondary);
  font-size: 0.9rem;
  border-bottom: 1px solid var(--bl-border-color);
}

.issues-table td {
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--bl-border-color);
}

.issues-table tbody tr {
  cursor: pointer;
  transition: background-color 0.2s;
}

.issues-table tbody tr:hover {
  background-color: var(--bl-background-hover);
}

.issues-table tbody tr:last-child td {
  border-bottom: none;
}

.issue-title {
  color: var(--bl-text-primary);
}

.issue-priority, .issue-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
}

.issue-priority.high {
  background-color: var(--bl-danger-light);
  color: var(--bl-danger);
}

.issue-priority.medium {
  background-color: var(--bl-warning-light);
  color: var(--bl-warning);
}

.issue-priority.low {
  background-color: var(--bl-info-light);
  color: var(--bl-info);
}

.issue-status.open {
  background-color: var(--bl-info-light);
  color: var(--bl-info);
}

.issue-status.in.progress {
  background-color: var(--bl-warning-light);
  color: var(--bl-warning);
}

.issue-status.resolved {
  background-color: var(--bl-success-light);
  color: var(--bl-success);
}

/* Quick Actions */
.quick-actions-grid {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.2rem;
}

@media (max-width: 1200px) {
  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 500px) {
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
}

.quick-action-item {
  background-color: var(--bl-background);
  border: 1px solid var(--bl-border-color);
  border-radius: 8px;
  padding: 1.2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-action-item:hover {
  background-color: var(--bl-background-hover);
  border-color: var(--bl-border-color-hover);
  transform: translateY(-2px);
}

.quick-action-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--bl-primary-light);
  color: var(--bl-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.8rem;
}

.quick-action-icon span {
  font-size: 24px;
}

.quick-action-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--bl-text-primary);
  text-align: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .resources-grid {
    grid-template-columns: 1fr;
  }
}
</style>
