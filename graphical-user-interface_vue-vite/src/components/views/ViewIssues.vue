<template>
  <div class="view-issues">
    <h1 class="view-title">Issues</h1>
    
    <div class="stats-row">
      <StatsCard
        icon="bug_report"
        value="42"
        label="Total Issues"
        change="8"
        changePeriod="vs last month"
      />
      <StatsCard
        icon="priority_high"
        iconBackground="var(--bl-danger)"
        value="7"
        label="High Priority"
      />
      <StatsCard
        icon="check_circle"
        iconBackground="var(--bl-success)"
        value="31"
        label="Resolved Issues"
        change="5"
      />
      <StatsCard
        icon="schedule"
        iconBackground="var(--bl-info)"
        value="3.2d"
        label="Avg Resolution Time"
        change="-0.8"
      />
    </div>
    
    <div class="filter-bar">
      <ElementButton 
        icon="add"
        variant="primary"
        @click="showNewIssueModal = true"
      >
        New Issue
      </ElementButton>
      
      <div class="filter-group">
        <ElementInput
          placeholder="Search issues..."
          prefixIcon="search"
          v-model="filters.search"
        />
        
        <ElementSelect
          v-model="filters.status"
          placeholder="Status"
          :options="statusOptions"
          clearable
        />
        
        <ElementSelect
          v-model="filters.priority"
          placeholder="Priority"
          :options="priorityOptions"
          clearable
        />
        
        <ElementSelect
          v-model="filters.assignee"
          placeholder="Assignee"
          :options="userOptions"
          clearable
        />
      </div>
    </div>
    
    <div class="issue-container">
      <div class="issue-tabs">
        <button 
          v-for="tab in issueTabs" 
          :key="tab.id" 
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <span class="material-symbols-outlined">{{ tab.icon }}</span>
          {{ tab.name }}
          <span class="tab-count">{{ tab.count }}</span>
        </button>
      </div>
      
      <div class="issue-list-container">
        <table class="issue-table">
          <thead>
            <tr>
              <th class="issue-id-col">ID</th>
              <th class="issue-title-col">Title</th>
              <th class="issue-status-col">Status</th>
              <th class="issue-priority-col">Priority</th>
              <th class="issue-assignee-col">Assignee</th>
              <th class="issue-updated-col">Updated</th>
              <th class="issue-actions-col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="issue in filteredIssues" :key="issue.id" @click="openIssueDetails(issue)">
              <td class="issue-id-col">
                <div class="issue-id">{{ issue.id }}</div>
              </td>
              <td class="issue-title-col">
                <div class="issue-title">{{ issue.title }}</div>
                <div class="issue-labels">
                  <span 
                    v-for="(label, index) in issue.labels" 
                    :key="index" 
                    class="issue-label"
                    :style="{ backgroundColor: getLabelColor(label) }"
                  >
                    {{ label }}
                  </span>
                </div>
              </td>
              <td class="issue-status-col">
                <div :class="['status-badge', issue.status.toLowerCase()]">
                  {{ issue.status }}
                </div>
              </td>
              <td class="issue-priority-col">
                <div class="priority-indicator" :class="issue.priority.toLowerCase()">
                  <span class="material-symbols-outlined">
                    {{ getPriorityIcon(issue.priority) }}
                  </span>
                  {{ issue.priority }}
                </div>
              </td>
              <td class="issue-assignee-col">
                <div class="assignee-info" v-if="issue.assignee">
                  <div class="assignee-avatar">
                    {{ getInitials(issue.assignee) }}
                  </div>
                  <span class="assignee-name">{{ issue.assignee }}</span>
                </div>
                <div class="unassigned" v-else>
                  Unassigned
                </div>
              </td>
              <td class="issue-updated-col">
                {{ formatDate(issue.lastUpdated) }}
              </td>
              <td class="issue-actions-col">
                <div class="issue-actions">
                  <button class="action-button" @click.stop="showEditIssueModal(issue)">
                    <span class="material-symbols-outlined">edit</span>
                  </button>
                  <button class="action-button" @click.stop="resolveIssue(issue)">
                    <span class="material-symbols-outlined">check_circle</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div class="no-issues" v-if="filteredIssues.length === 0">
          <span class="material-symbols-outlined">search_off</span>
          <p>No issues found matching your filters.</p>
        </div>
      </div>
      
      <div class="pagination">
        <button class="pagination-button" :disabled="currentPage === 1" @click="currentPage--">
          <span class="material-symbols-outlined">navigate_before</span>
        </button>
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button class="pagination-button" :disabled="currentPage === totalPages" @click="currentPage++">
          <span class="material-symbols-outlined">navigate_next</span>
        </button>
      </div>
    </div>
    
    <!-- New Issue Modal -->
    <div class="modal" v-if="showNewIssueModal">
      <div class="modal-backdrop" @click="showNewIssueModal = false"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>Create New Issue</h3>
          <button class="modal-close" @click="showNewIssueModal = false">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createIssue">
            <div class="form-group">
              <ElementInput
                label="Title"
                v-model="newIssue.title"
                required
              />
            </div>
            <div class="form-group">
              <ElementInput
                label="Description"
                type="textarea"
                v-model="newIssue.description"
                required
              />
            </div>
            <div class="form-row">
              <ElementSelect
                label="Status"
                v-model="newIssue.status"
                :options="statusOptions"
                required
              />
              <ElementSelect
                label="Priority"
                v-model="newIssue.priority"
                :options="priorityOptions"
                required
              />
            </div>
            <div class="form-row">
              <ElementSelect
                label="Assignee"
                v-model="newIssue.assignee"
                :options="userOptions"
                clearable
              />
              <ElementInput
                label="Labels (comma separated)"
                v-model="newIssue.labelsInput"
              />
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <ElementButton variant="secondary" @click="showNewIssueModal = false">
            Cancel
          </ElementButton>
          <ElementButton variant="primary" @click="createIssue">
            Create Issue
          </ElementButton>
        </div>
      </div>
    </div>
    
    <!-- Issue Details Modal -->
    <div class="modal" v-if="selectedIssue">
      <div class="modal-backdrop" @click="selectedIssue = null"></div>
      <div class="modal-content issue-details-modal">
        <div class="modal-header">
          <h3>Issue #{{ selectedIssue.id }}</h3>
          <button class="modal-close" @click="selectedIssue = null">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="issue-details-header">
            <h2 class="issue-details-title">{{ selectedIssue.title }}</h2>
            <div class="issue-meta">
              <div :class="['status-badge', selectedIssue.status.toLowerCase()]">
                {{ selectedIssue.status }}
              </div>
              <div class="issue-created">
                Created by <span class="user-name">{{ selectedIssue.reporter }}</span> on {{ formatDate(selectedIssue.createdAt) }}
              </div>
            </div>
          </div>
          
          <div class="issue-details-content">
            <div class="issue-details-main">
              <div class="issue-description">
                <h4>Description</h4>
                <p>{{ selectedIssue.description }}</p>
              </div>
              
              <div class="issue-activities">
                <h4>Activity</h4>
                <div class="activity-feed">
                  <div v-for="(activity, index) in issueActivities" :key="index" class="activity-item">
                    <div class="activity-avatar">
                      {{ getInitials(activity.user) }}
                    </div>
                    <div class="activity-content">
                      <div class="activity-header">
                        <span class="activity-user">{{ activity.user }}</span>
                        <span class="activity-time">{{ formatDate(activity.timestamp) }}</span>
                      </div>
                      <div class="activity-text">
                        {{ activity.text }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="add-comment">
                <ElementInput
                  type="textarea"
                  placeholder="Add a comment..."
                  v-model="newComment"
                />
                <ElementButton variant="primary" :disabled="!newComment" @click="addComment">
                  Comment
                </ElementButton>
              </div>
            </div>
            
            <div class="issue-details-sidebar">
              <div class="sidebar-section">
                <h5>Priority</h5>
                <div class="priority-indicator" :class="selectedIssue.priority.toLowerCase()">
                  <span class="material-symbols-outlined">
                    {{ getPriorityIcon(selectedIssue.priority) }}
                  </span>
                  {{ selectedIssue.priority }}
                </div>
              </div>
              
              <div class="sidebar-section">
                <h5>Assignee</h5>
                <div class="assignee-info" v-if="selectedIssue.assignee">
                  <div class="assignee-avatar large">
                    {{ getInitials(selectedIssue.assignee) }}
                  </div>
                  <span class="assignee-name">{{ selectedIssue.assignee }}</span>
                </div>
                <div class="unassigned" v-else>
                  Unassigned
                </div>
                <ElementButton variant="small" @click="showAssignModal = true">
                  Change
                </ElementButton>
              </div>
              
              <div class="sidebar-section">
                <h5>Labels</h5>
                <div class="issue-labels">
                  <span 
                    v-for="(label, index) in selectedIssue.labels" 
                    :key="index" 
                    class="issue-label"
                    :style="{ backgroundColor: getLabelColor(label) }"
                  >
                    {{ label }}
                  </span>
                </div>
                <ElementButton variant="small" @click="showEditLabelsModal = true">
                  Edit
                </ElementButton>
              </div>
              
              <div class="sidebar-section">
                <h5>Related Issues</h5>
                <div class="related-issues">
                  <div v-for="(issue, index) in relatedIssues" :key="index" class="related-issue">
                    <span class="related-issue-id">#{{ issue.id }}</span>
                    <span class="related-issue-title">{{ issue.title }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import StatsCard from '../elements/StatsCard.vue';
import ElementButton from '../elements/ElementButton.vue';
import ElementInput from '../elements/ElementInput.vue';
import ElementSelect from '../elements/ElementSelect.vue';

interface Issue {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  reporter: string;
  assignee: string | null;
  createdAt: Date;
  lastUpdated: Date;
  labels: string[];
  labelsInput?: string;
}

interface Activity {
  user: string;
  timestamp: Date;
  text: string;
}

export default defineComponent({
  name: 'ViewIssues',
  components: {
    StatsCard,
    ElementButton,
    ElementInput,
    ElementSelect
  },
  setup() {
    // Filter state
    const filters = ref({
      search: '',
      status: '',
      priority: '',
      assignee: ''
    });
    
    // Pagination
    const currentPage = ref(1);
    const itemsPerPage = 10;
    
    // Tab state
    const activeTab = ref('all');
    
    // Modal states
    const showNewIssueModal = ref(false);
    const selectedIssue = ref<Issue | null>(null);
    const showAssignModal = ref(false);
    const showEditLabelsModal = ref(false);
    
    // Form states
    const newIssue = ref({
      title: '',
      description: '',
      status: 'Open',
      priority: 'Medium',
      assignee: '',
      labelsInput: ''
    });
    
    const newComment = ref('');
    
    // Mock data
    const issues = ref<Issue[]>([
      {
        id: 1001,
        title: 'API Gateway fails to authenticate with high traffic',
        description: 'When the traffic exceeds 1000 requests per second, the API gateway starts returning 401 errors for valid tokens.',
        status: 'Open',
        priority: 'High',
        reporter: 'John Doe',
        assignee: 'Sarah Wilson',
        createdAt: new Date('2025-05-28T14:32:00'),
        lastUpdated: new Date('2025-06-01T09:45:00'),
        labels: ['bug', 'api', 'authentication']
      },
      {
        id: 1002,
        title: 'Add support for multi-factor authentication',
        description: 'Implement MFA support using TOTP authenticator apps like Google Authenticator.',
        status: 'In Progress',
        priority: 'Medium',
        reporter: 'Jane Smith',
        assignee: 'Michael Johnson',
        createdAt: new Date('2025-05-25T10:15:00'),
        lastUpdated: new Date('2025-05-30T16:22:00'),
        labels: ['feature', 'security', 'auth']
      },
      {
        id: 1003,
        title: 'Dashboard charts not rendering on Firefox',
        description: 'The performance metrics charts on the dashboard view are not rendering correctly in Firefox 120.0.',
        status: 'Open',
        priority: 'Medium',
        reporter: 'Alice Cooper',
        assignee: 'John Doe',
        createdAt: new Date('2025-05-29T11:20:00'),
        lastUpdated: new Date('2025-05-29T11:20:00'),
        labels: ['bug', 'ui', 'browser-specific']
      },
      {
        id: 1004,
        title: 'Optimize cluster deployment for AWS',
        description: 'Current AWS deployment is not using instance types efficiently. Optimize for cost and performance.',
        status: 'Open',
        priority: 'Low',
        reporter: 'Michael Johnson',
        assignee: null,
        createdAt: new Date('2025-05-30T15:45:00'),
        lastUpdated: new Date('2025-05-30T15:45:00'),
        labels: ['enhancement', 'aws', 'deployment']
      },
      {
        id: 1005,
        title: 'Model training fails with OOM error on large datasets',
        description: 'When training models with datasets larger than 10GB, we get out of memory errors even on instances with 64GB RAM.',
        status: 'In Progress',
        priority: 'High',
        reporter: 'Emily Davis',
        assignee: 'Alice Cooper',
        createdAt: new Date('2025-05-27T09:30:00'),
        lastUpdated: new Date('2025-06-01T14:12:00'),
        labels: ['bug', 'training', 'performance']
      },
      {
        id: 1006,
        title: 'Create documentation for REST API endpoints',
        description: 'We need comprehensive documentation for all API endpoints with examples and authentication instructions.',
        status: 'Open',
        priority: 'Medium',
        reporter: 'John Doe',
        assignee: 'Jane Smith',
        createdAt: new Date('2025-05-31T16:20:00'),
        lastUpdated: new Date('2025-05-31T16:20:00'),
        labels: ['documentation', 'api']
      },
      {
        id: 1007,
        title: 'Implement dark mode support',
        description: 'Add dark mode theme support across all views with user preference persistence.',
        status: 'Open',
        priority: 'Low',
        reporter: 'Sarah Wilson',
        assignee: null,
        createdAt: new Date('2025-06-01T10:55:00'),
        lastUpdated: new Date('2025-06-01T10:55:00'),
        labels: ['enhancement', 'ui']
      },
      {
        id: 1008,
        title: 'Broken image links in documentation',
        description: 'Several images in the documentation are broken due to path changes.',
        status: 'Resolved',
        priority: 'Low',
        reporter: 'Michael Johnson',
        assignee: 'Emily Davis',
        createdAt: new Date('2025-05-29T14:25:00'),
        lastUpdated: new Date('2025-05-31T11:30:00'),
        labels: ['bug', 'documentation']
      },
      {
        id: 1009,
        title: 'Metrics endpoint returning stale data',
        description: 'The /api/metrics endpoint is returning cached data that is up to 30 minutes old.',
        status: 'Resolved',
        priority: 'Medium',
        reporter: 'Jane Smith',
        assignee: 'John Doe',
        createdAt: new Date('2025-05-28T09:15:00'),
        lastUpdated: new Date('2025-05-30T15:40:00'),
        labels: ['bug', 'api', 'monitoring']
      },
      {
        id: 1010,
        title: 'Add support for custom model training configurations',
        description: 'Allow users to define and save custom training configurations for different model types.',
        status: 'In Progress',
        priority: 'Medium',
        reporter: 'Alice Cooper',
        assignee: 'Sarah Wilson',
        createdAt: new Date('2025-05-26T13:10:00'),
        lastUpdated: new Date('2025-05-29T16:55:00'),
        labels: ['feature', 'training', 'customization']
      }
    ]);
    
    const issueActivities = ref<Activity[]>([
      {
        user: 'Sarah Wilson',
        timestamp: new Date('2025-06-01T09:45:00'),
        text: 'I\'ve investigated this issue further and found that the authentication service is failing to scale horizontally. We need to implement a better caching strategy.'
      },
      {
        user: 'Michael Johnson',
        timestamp: new Date('2025-05-30T14:20:00'),
        text: 'I\'ve been able to reproduce this issue consistently when the traffic exceeds 1000 requests per second.'
      },
      {
        user: 'John Doe',
        timestamp: new Date('2025-05-28T14:32:00'),
        text: 'Created issue and assigned to Sarah Wilson for investigation.'
      }
    ]);
    
    const relatedIssues = [
      {
        id: 995,
        title: 'Authentication service slow response time'
      },
      {
        id: 872,
        title: 'Implement token refresh mechanism'
      }
    ];
    
    // Select options
    const statusOptions = [
      { value: 'Open', label: 'Open' },
      { value: 'In Progress', label: 'In Progress' },
      { value: 'Resolved', label: 'Resolved' },
      { value: 'Closed', label: 'Closed' }
    ];
    
    const priorityOptions = [
      { value: 'High', label: 'High' },
      { value: 'Medium', label: 'Medium' },
      { value: 'Low', label: 'Low' }
    ];
    
    const userOptions = [
      { value: 'John Doe', label: 'John Doe' },
      { value: 'Jane Smith', label: 'Jane Smith' },
      { value: 'Michael Johnson', label: 'Michael Johnson' },
      { value: 'Sarah Wilson', label: 'Sarah Wilson' },
      { value: 'Alice Cooper', label: 'Alice Cooper' },
      { value: 'Emily Davis', label: 'Emily Davis' }
    ];
    
    // Tab definitions
    const issueTabs = [
      { id: 'all', name: 'All Issues', icon: 'list', count: issues.value.length },
      { id: 'open', name: 'Open', icon: 'error_outline', count: issues.value.filter(i => i.status === 'Open').length },
      { id: 'inProgress', name: 'In Progress', icon: 'pending', count: issues.value.filter(i => i.status === 'In Progress').length },
      { id: 'resolved', name: 'Resolved', icon: 'check_circle', count: issues.value.filter(i => i.status === 'Resolved').length }
    ];
    
    // Computed properties
    const filteredIssues = computed(() => {
      let result = issues.value;
      
      // Filter by tab
      if (activeTab.value === 'open') {
        result = result.filter(i => i.status === 'Open');
      } else if (activeTab.value === 'inProgress') {
        result = result.filter(i => i.status === 'In Progress');
      } else if (activeTab.value === 'resolved') {
        result = result.filter(i => i.status === 'Resolved');
      }
      
      // Apply search filters
      if (filters.value.search) {
        const searchLower = filters.value.search.toLowerCase();
        result = result.filter(i => 
          i.title.toLowerCase().includes(searchLower) ||
          i.description.toLowerCase().includes(searchLower) ||
          i.id.toString().includes(searchLower)
        );
      }
      
      if (filters.value.status) {
        result = result.filter(i => i.status === filters.value.status);
      }
      
      if (filters.value.priority) {
        result = result.filter(i => i.priority === filters.value.priority);
      }
      
      if (filters.value.assignee) {
        result = result.filter(i => i.assignee === filters.value.assignee);
      }
      
      // Apply pagination
      const start = (currentPage.value - 1) * itemsPerPage;
      return result.slice(start, start + itemsPerPage);
    });
    
    const totalPages = computed(() => {
      return Math.ceil(issues.value.length / itemsPerPage);
    });
    
    // Methods
    const formatDate = (date: Date) => {
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
    
    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase();
    };
    
    const getLabelColor = (label: string) => {
      // Map labels to specific colors or generate consistent colors based on label name
      const labelColors: Record<string, string> = {
        'bug': '#F87171',
        'feature': '#60A5FA',
        'enhancement': '#34D399',
        'documentation': '#A78BFA',
        'security': '#F59E0B',
        'api': '#8B5CF6',
        'ui': '#EC4899'
      };
      
      return labelColors[label.toLowerCase()] || '#6B7280';
    };
    
    const getPriorityIcon = (priority: string) => {
      switch (priority) {
        case 'High':
          return 'priority_high';
        case 'Medium': 
          return 'drag_handle';
        case 'Low':
          return 'low_priority';
        default:
          return 'drag_handle';
      }
    };
    
    const openIssueDetails = (issue: Issue) => {
      selectedIssue.value = { ...issue };
    };
    
    const createIssue = () => {
      const newId = Math.max(...issues.value.map(i => i.id)) + 1;
      const labels = newIssue.value.labelsInput
        ? newIssue.value.labelsInput.split(',').map(l => l.trim()).filter(l => l)
        : [];
      
      const issue: Issue = {
        id: newId,
        title: newIssue.value.title,
        description: newIssue.value.description,
        status: newIssue.value.status,
        priority: newIssue.value.priority,
        reporter: 'John Doe', // Current user
        assignee: newIssue.value.assignee || null,
        createdAt: new Date(),
        lastUpdated: new Date(),
        labels: labels
      };
      
      issues.value.unshift(issue);
      
      // Update tab counts
      issueTabs.forEach(tab => {
        if (tab.id === 'all') {
          tab.count = issues.value.length;
        } else if (tab.id === 'open' && issue.status === 'Open') {
          tab.count++;
        }
      });
      
      // Reset form and close modal
      newIssue.value = {
        title: '',
        description: '',
        status: 'Open',
        priority: 'Medium',
        assignee: '',
        labelsInput: ''
      };
      
      showNewIssueModal.value = false;
    };
    
    const showEditIssueModal = (issue: Issue) => {
      // Implementation for edit modal
      console.log('Edit issue', issue.id);
    };
    
    const resolveIssue = (issue: Issue) => {
      const index = issues.value.findIndex(i => i.id === issue.id);
      if (index !== -1) {
        issues.value[index].status = 'Resolved';
        issues.value[index].lastUpdated = new Date();
      }
    };
    
    const addComment = () => {
      if (!newComment.value || !selectedIssue.value) return;
      
      issueActivities.value.unshift({
        user: 'John Doe', // Current user
        timestamp: new Date(),
        text: newComment.value
      });
      
      newComment.value = '';
    };
    
    return {
      filters,
      issues,
      filteredIssues,
      currentPage,
      totalPages,
      activeTab,
      issueTabs,
      showNewIssueModal,
      selectedIssue,
      showAssignModal,
      showEditLabelsModal,
      newIssue,
      newComment,
      statusOptions,
      priorityOptions,
      userOptions,
      issueActivities,
      relatedIssues,
      formatDate,
      getInitials,
      getLabelColor,
      getPriorityIcon,
      openIssueDetails,
      createIssue,
      showEditIssueModal,
      resolveIssue,
      addComment
    };
  }
});
</script>

<style scoped>
.view-issues {
  padding: 2rem;
}

.view-title {
  margin-bottom: 2rem;
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--bl-text-primary);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filter-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.issue-container {
  background-color: var(--bl-card-background);
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.issue-tabs {
  display: flex;
  overflow-x: auto;
  border-bottom: 1px solid var(--bl-border-color);
  background-color: var(--bl-background-secondary);
}

.tab-button {
  padding: 1rem 1.5rem;
  border: none;
  background: none;
  font-size: 0.95rem;
  color: var(--bl-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-button span.material-symbols-outlined {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.tab-count {
  margin-left: 0.5rem;
  background-color: var(--bl-background);
  color: var(--bl-text-secondary);
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
}

.tab-button:hover {
  color: var(--bl-primary);
}

.tab-button.active {
  color: var(--bl-primary);
  border-bottom-color: var(--bl-primary);
}

.tab-button.active .tab-count {
  background-color: var(--bl-primary-light);
  color: var(--bl-primary);
}

.issue-list-container {
  min-height: 400px;
}

.issue-table {
  width: 100%;
  border-collapse: collapse;
}

.issue-table thead {
  background-color: var(--bl-background-secondary);
}

.issue-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 500;
  color: var(--bl-text-secondary);
  border-bottom: 1px solid var(--bl-border-color);
}

.issue-table tbody tr {
  border-bottom: 1px solid var(--bl-border-color);
  cursor: pointer;
  transition: background-color 0.2s;
}

.issue-table tbody tr:hover {
  background-color: var(--bl-background-hover);
}

.issue-table td {
  padding: 1rem;
  vertical-align: middle;
}

.issue-id-col {
  width: 80px;
}

.issue-id {
  font-weight: 600;
  color: var(--bl-text-secondary);
}

.issue-title {
  font-weight: 500;
  margin-bottom: 0.4rem;
}

.issue-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.issue-label {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  color: white;
  white-space: nowrap;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.7rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
}

.status-badge.open {
  background-color: var(--bl-info-light);
  color: var(--bl-info);
}

.status-badge.in.progress {
  background-color: var(--bl-warning-light);
  color: var(--bl-warning);
}

.status-badge.resolved {
  background-color: var(--bl-success-light);
  color: var(--bl-success);
}

.status-badge.closed {
  background-color: var(--bl-text-tertiary);
  color: var(--bl-text-secondary);
}

.priority-indicator {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 500;
}

.priority-indicator span {
  margin-right: 0.3rem;
  font-size: 1.1rem;
}

.priority-indicator.high {
  color: var(--bl-danger);
}

.priority-indicator.medium {
  color: var(--bl-warning);
}

.priority-indicator.low {
  color: var(--bl-info);
}

.assignee-info {
  display: flex;
  align-items: center;
}

.assignee-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: var(--bl-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 500;
  margin-right: 0.5rem;
}

.assignee-avatar.large {
  width: 40px;
  height: 40px;
  font-size: 1rem;
}

.assignee-name {
  font-size: 0.85rem;
  color: var(--bl-text-primary);
}

.unassigned {
  font-size: 0.85rem;
  color: var(--bl-text-tertiary);
  font-style: italic;
}

.issue-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.issue-table tr:hover .issue-actions {
  opacity: 1;
}

.action-button {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: var(--bl-background);
  border: 1px solid var(--bl-border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button:hover {
  background-color: var(--bl-background-hover);
  border-color: var(--bl-border-color-hover);
}

.action-button span {
  font-size: 16px;
  color: var(--bl-text-secondary);
}

.no-issues {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--bl-text-tertiary);
}

.no-issues span {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  border-top: 1px solid var(--bl-border-color);
}

.pagination-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--bl-background);
  border: 1px solid var(--bl-border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-button:not(:disabled):hover {
  background-color: var(--bl-background-hover);
}

.page-info {
  margin: 0 1rem;
  color: var(--bl-text-secondary);
  font-size: 0.9rem;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  background-color: var(--bl-card-background);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  animation: modalEnter 0.3s;
}

.issue-details-modal {
  max-width: 900px;
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--bl-border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--bl-text-primary);
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.modal-close:hover {
  background-color: var(--bl-background-hover);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--bl-border-color);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

/* Issue Details Styles */
.issue-details-header {
  margin-bottom: 2rem;
}

.issue-details-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.issue-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}

.issue-created {
  font-size: 0.9rem;
  color: var(--bl-text-secondary);
}

.user-name {
  font-weight: 500;
  color: var(--bl-text-primary);
}

.issue-details-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .issue-details-content {
    grid-template-columns: 1fr;
  }
}

.issue-description h4,
.issue-activities h4,
.sidebar-section h5 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--bl-text-primary);
}

.issue-description {
  margin-bottom: 2rem;
}

.issue-description p {
  margin: 0;
  line-height: 1.6;
}

.activity-feed {
  margin-bottom: 2rem;
}

.activity-item {
  display: flex;
  margin-bottom: 1.5rem;
}

.activity-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--bl-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 500;
  margin-right: 1rem;
  flex-shrink: 0;
}

.activity-content {
  flex-grow: 1;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.activity-user {
  font-weight: 500;
  color: var(--bl-text-primary);
}

.activity-time {
  font-size: 0.8rem;
  color: var(--bl-text-tertiary);
}

.activity-text {
  line-height: 1.5;
}

.add-comment {
  display: flex;
  flex-direction: column;
}

.add-comment button {
  align-self: flex-end;
  margin-top: 1rem;
}

.issue-details-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.sidebar-section {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--bl-border-color);
}

.sidebar-section h5 {
  font-size: 1rem;
}

.related-issues {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.related-issue {
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.related-issue-id {
  font-weight: 500;
  color: var(--bl-primary);
  margin-right: 0.5rem;
}

.related-issue-title {
  color: var(--bl-text-primary);
}
</style>
