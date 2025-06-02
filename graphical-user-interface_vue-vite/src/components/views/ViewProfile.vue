<template>
  <div class="view-profile">
    <h1 class="view-title">Profile</h1>
    
    <div class="profile-container">
      <div class="profile-header">
        <div class="profile-avatar">
          <div class="avatar-placeholder">
            {{ userInitials }}
          </div>
          <button class="avatar-edit-button">
            <span class="material-symbols-outlined">edit</span>
          </button>
        </div>
        
        <div class="profile-info">
          <h2>{{ userName }}</h2>
          <p class="user-title">{{ userRole }}</p>
          <p class="user-email">{{ userEmail }}</p>
          <div class="user-badges">
            <span class="user-badge admin">Admin</span>
            <span class="user-badge active">Active</span>
          </div>
        </div>
      </div>

      <div class="profile-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id" 
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <span class="material-symbols-outlined">{{ tab.icon }}</span>
          {{ tab.name }}
        </button>
      </div>

      <div class="profile-content">
        <!-- Personal Information Tab -->
        <div v-if="activeTab === 'personal'" class="profile-section">
          <h3 class="section-title">Personal Information</h3>
          
          <form @submit.prevent="updateProfile" class="profile-form">
            <div class="form-row">
              <ElementInput
                label="First Name"
                v-model="profileForm.firstName"
                required
              />
              <ElementInput
                label="Last Name"
                v-model="profileForm.lastName"
                required
              />
            </div>

            <div class="form-row">
              <ElementInput
                label="Email Address"
                type="email"
                v-model="profileForm.email"
                required
                disabled
              />
              <ElementInput
                label="Phone Number"
                type="tel"
                v-model="profileForm.phone"
              />
            </div>

            <div class="form-row">
              <ElementInput
                label="Position"
                v-model="profileForm.position"
              />
              <ElementInput
                label="Department"
                v-model="profileForm.department"
              />
            </div>

            <div class="form-row">
              <ElementInput
                label="Bio"
                type="textarea"
                v-model="profileForm.bio"
                placeholder="Tell us about yourself"
              />
            </div>

            <div class="form-actions">
              <ElementButton 
                variant="secondary"
                @click="resetForm"
              >
                Reset
              </ElementButton>
              <ElementButton 
                variant="primary"
                type="submit"
              >
                Save Changes
              </ElementButton>
            </div>
          </form>
        </div>

        <!-- Security Tab -->
        <div v-if="activeTab === 'security'" class="profile-section">
          <h3 class="section-title">Security Settings</h3>
          
          <form @submit.prevent="updatePassword" class="profile-form">
            <div class="form-row">
              <ElementInput
                label="Current Password"
                type="password"
                v-model="securityForm.currentPassword"
                required
              />
            </div>

            <div class="form-row">
              <ElementInput
                label="New Password"
                type="password"
                v-model="securityForm.newPassword"
                required
              />
            </div>

            <div class="form-row">
              <ElementInput
                label="Confirm New Password"
                type="password"
                v-model="securityForm.confirmPassword"
                required
              />
            </div>

            <div class="form-divider"></div>
            
            <h4 class="subsection-title">Two-Factor Authentication</h4>
            
            <div class="toggle-option">
              <div class="toggle-content">
                <h5>Enable Two-Factor Authentication</h5>
                <p>Secure your account with an additional layer of security</p>
              </div>
              <ElementToggle v-model="securityForm.twoFactorEnabled" />
            </div>

            <div class="form-actions">
              <ElementButton 
                variant="primary"
                type="submit"
              >
                Update Security Settings
              </ElementButton>
            </div>
          </form>
        </div>

        <!-- Preferences Tab -->
        <div v-if="activeTab === 'preferences'" class="profile-section">
          <h3 class="section-title">Preferences</h3>
          
          <div class="preference-group">
            <h4 class="subsection-title">Interface</h4>
            
            <div class="toggle-option">
              <div class="toggle-content">
                <h5>Dark Mode</h5>
                <p>Switch between light and dark theme</p>
              </div>
              <ElementToggle v-model="preferencesForm.darkMode" />
            </div>

            <div class="toggle-option">
              <div class="toggle-content">
                <h5>Compact View</h5>
                <p>Display more content with reduced spacing</p>
              </div>
              <ElementToggle v-model="preferencesForm.compactView" />
            </div>

            <div class="form-row">
              <ElementSelect
                label="Default Dashboard View"
                v-model="preferencesForm.defaultView"
                :options="dashboardOptions"
              />
            </div>
          </div>

          <div class="preference-group">
            <h4 class="subsection-title">Notifications</h4>
            
            <div class="toggle-option">
              <div class="toggle-content">
                <h5>Email Notifications</h5>
                <p>Receive updates and alerts via email</p>
              </div>
              <ElementToggle v-model="preferencesForm.emailNotifications" />
            </div>

            <div class="toggle-option">
              <div class="toggle-content">
                <h5>Browser Notifications</h5>
                <p>Receive push notifications in your browser</p>
              </div>
              <ElementToggle v-model="preferencesForm.browserNotifications" />
            </div>
          </div>

          <div class="form-actions">
            <ElementButton 
              variant="primary"
              @click="savePreferences"
            >
              Save Preferences
            </ElementButton>
          </div>
        </div>

        <!-- Activity Tab -->
        <div v-if="activeTab === 'activity'" class="profile-section">
          <h3 class="section-title">Recent Activity</h3>
          
          <div class="activity-timeline">
            <div v-for="(activity, index) in recentActivity" :key="index" class="activity-item">
              <div class="activity-icon">
                <span class="material-symbols-outlined" :style="{ color: activity.iconColor }">{{ activity.icon }}</span>
              </div>
              <div class="activity-content">
                <p class="activity-description">{{ activity.description }}</p>
                <p class="activity-timestamp">{{ activity.timestamp }}</p>
              </div>
            </div>
          </div>

          <div class="activity-load-more">
            <ElementButton 
              variant="secondary"
              @click="loadMoreActivity"
            >
              Load More
            </ElementButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import ElementInput from '../elements/ElementInput.vue';
import ElementButton from '../elements/ElementButton.vue';
import ElementToggle from '../elements/ElementToggle.vue';
import ElementSelect from '../elements/ElementSelect.vue';
import { useAppStore } from '../../stores/appStore';

export default defineComponent({
  name: 'ViewProfile',
  components: {
    ElementInput,
    ElementButton,
    ElementToggle,
    ElementSelect
  },
  setup() {
    const appStore = useAppStore();
    const activeTab = ref('personal');
    
    // User information computed from store
    const userName = computed(() => appStore.user?.name || 'Guest User');
    const userEmail = computed(() => appStore.user?.email || '');
    const userRole = computed(() => appStore.user?.role || 'User');
    const userInitials = computed(() => {
      const name = userName.value;
      return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase();
    });
    
    // Profile form data
    const profileForm = ref({
      firstName: 'John',
      lastName: 'Doe',
      email: userEmail.value,
      phone: '+1 (555) 123-4567',
      position: 'Software Engineer',
      department: 'Engineering',
      bio: 'Experienced software engineer with a focus on machine learning and AI applications.'
    });
    
    // Security form data
    const securityForm = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactorEnabled: false
    });
    
    // Preferences form data
    const preferencesForm = ref({
      darkMode: false,
      compactView: false,
      defaultView: 'clusters',
      emailNotifications: true,
      browserNotifications: false
    });
    
    // Options for dropdown select
    const dashboardOptions = [
      { value: 'clusters', label: 'Clusters' },
      { value: 'models', label: 'Models' },
      { value: 'tasks', label: 'Tasks' },
      { value: 'gateway', label: 'API Gateway' },
      { value: 'issues', label: 'Issues' }
    ];
    
    // Tabs configuration
    const tabs = [
      { id: 'personal', name: 'Personal Info', icon: 'person' },
      { id: 'security', name: 'Security', icon: 'shield' },
      { id: 'preferences', name: 'Preferences', icon: 'settings' },
      { id: 'activity', name: 'Activity', icon: 'history' }
    ];
    
    // Recent activity data
    const recentActivity = ref([
      {
        description: 'Changed password',
        timestamp: 'Today at 10:45 AM',
        icon: 'lock',
        iconColor: 'var(--bl-primary)'
      },
      {
        description: 'Created new task: "Implement authentication service"',
        timestamp: 'Yesterday at 3:22 PM',
        icon: 'task',
        iconColor: 'var(--bl-success)'
      },
      {
        description: 'Updated profile information',
        timestamp: 'Jun 1, 2025 at 9:15 AM',
        icon: 'edit',
        iconColor: 'var(--bl-info)'
      },
      {
        description: 'Deployed model: "Sentiment Analysis v2.1"',
        timestamp: 'May 29, 2025 at 2:30 PM',
        icon: 'model_training',
        iconColor: 'var(--bl-warning)'
      },
      {
        description: 'Created new cluster: "Production ML Pipeline"',
        timestamp: 'May 28, 2025 at 11:00 AM',
        icon: 'device_hub',
        iconColor: 'var(--bl-primary)'
      }
    ]);
    
    // Form handling methods
    const updateProfile = () => {
      // Simulate updating profile
      setTimeout(() => {
        alert('Profile updated successfully!');
      }, 800);
    };
    
    const resetForm = () => {
      profileForm.value = {
        firstName: 'John',
        lastName: 'Doe',
        email: userEmail.value,
        phone: '+1 (555) 123-4567',
        position: 'Software Engineer',
        department: 'Engineering',
        bio: 'Experienced software engineer with a focus on machine learning and AI applications.'
      };
    };
    
    const updatePassword = () => {
      if (securityForm.value.newPassword !== securityForm.value.confirmPassword) {
        alert('New passwords do not match!');
        return;
      }
      
      // Simulate password update
      setTimeout(() => {
        securityForm.value.currentPassword = '';
        securityForm.value.newPassword = '';
        securityForm.value.confirmPassword = '';
        alert('Password updated successfully!');
      }, 800);
    };
    
    const savePreferences = () => {
      // Simulate saving preferences
      setTimeout(() => {
        alert('Preferences saved successfully!');
      }, 800);
    };
    
    const loadMoreActivity = () => {
      // Simulate loading more activity
      const moreActivity = [
        {
          description: 'Submitted issue report: "API Gateway latency"',
          timestamp: 'May 25, 2025 at 4:15 PM',
          icon: 'bug_report',
          iconColor: 'var(--bl-danger)'
        },
        {
          description: 'Commented on task: "Data pipeline optimization"',
          timestamp: 'May 24, 2025 at 10:30 AM',
          icon: 'comment',
          iconColor: 'var(--bl-info)'
        }
      ];
      
      recentActivity.value = [...recentActivity.value, ...moreActivity];
    };
    
    return {
      activeTab,
      userName,
      userEmail,
      userRole,
      userInitials,
      profileForm,
      securityForm,
      preferencesForm,
      dashboardOptions,
      tabs,
      recentActivity,
      updateProfile,
      resetForm,
      updatePassword,
      savePreferences,
      loadMoreActivity
    };
  }
});
</script>

<style scoped>
.view-profile {
  padding: 2rem;
}

.view-title {
  margin-bottom: 2rem;
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--bl-text-primary);
}

.profile-container {
  background-color: var(--bl-card-background);
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 2rem;
  background-color: var(--bl-background-secondary);
  border-bottom: 1px solid var(--bl-border-color);
}

.profile-avatar {
  position: relative;
  margin-right: 2rem;
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bl-primary);
  color: white;
  font-size: 2.5rem;
  font-weight: 600;
  border-radius: 50%;
}

.avatar-edit-button {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  background-color: var(--bl-background);
  border: 2px solid var(--bl-border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.avatar-edit-button:hover {
  background-color: var(--bl-background-hover);
}

.profile-info h2 {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--bl-text-primary);
}

.user-title {
  font-size: 1rem;
  color: var(--bl-text-secondary);
  margin-bottom: 0.5rem;
}

.user-email {
  font-size: 0.95rem;
  color: var(--bl-text-secondary);
  margin-bottom: 1rem;
}

.user-badges {
  display: flex;
  gap: 0.8rem;
}

.user-badge {
  display: inline-block;
  padding: 0.25rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.user-badge.admin {
  background-color: var(--bl-primary-light);
  color: var(--bl-primary);
}

.user-badge.active {
  background-color: var(--bl-success-light);
  color: var(--bl-success);
}

.profile-tabs {
  display: flex;
  overflow-x: auto;
  border-bottom: 1px solid var(--bl-border-color);
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

.tab-button span {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.tab-button:hover {
  color: var(--bl-primary);
}

.tab-button.active {
  color: var(--bl-primary);
  border-bottom-color: var(--bl-primary);
}

.profile-content {
  padding: 2rem;
}

.profile-section {
  animation: fadeIn 0.3s ease;
}

.section-title {
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  font-weight: 500;
  color: var(--bl-text-primary);
}

.subsection-title {
  margin: 1.5rem 0 1rem;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--bl-text-primary);
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.form-divider {
  height: 1px;
  background-color: var(--bl-border-color);
  margin: 2rem 0;
}

.toggle-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
}

.toggle-content h5 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--bl-text-primary);
}

.toggle-content p {
  margin: 0.2rem 0 0;
  font-size: 0.85rem;
  color: var(--bl-text-secondary);
}

.preference-group {
  margin-bottom: 2.5rem;
}

.activity-timeline {
  margin-bottom: 2rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 1.2rem 0;
  border-bottom: 1px solid var(--bl-border-color);
}

.activity-icon {
  margin-right: 1rem;
  width: 36px;
  height: 36px;
  background-color: var(--bl-background-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-icon span {
  font-size: 1.2rem;
}

.activity-content {
  flex-grow: 1;
}

.activity-description {
  margin: 0;
  font-size: 0.95rem;
  color: var(--bl-text-primary);
}

.activity-timestamp {
  margin: 0.2rem 0 0;
  font-size: 0.8rem;
  color: var(--bl-text-secondary);
}

.activity-load-more {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
