<template>
  <div class="settings-view p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
      <p class="text-gray-600">Configure your BitingLip AI platform preferences</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Settings Navigation -->
      <div class="lg:col-span-1">
        <Card class="p-0">
          <template #content>
            <div class="p-4">
              <h3 class="font-semibold text-lg mb-4">Settings Categories</h3>
              <Menu :model="settingsCategories" class="w-full border-0">                <template #item="{ item }">
                  <a 
                    @click="() => activeCategory = item.key || 'general'"
                    :class="['flex items-center p-3 cursor-pointer rounded-md transition-colors', 
                             activeCategory === item.key ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50']"
                  >
                    <i :class="item.icon" class="mr-3"></i>
                    <span>{{ item.label }}</span>
                  </a>
                </template>
              </Menu>
            </div>
          </template>
        </Card>
      </div>

      <!-- Settings Content -->
      <div class="lg:col-span-2">
        <!-- General Settings -->
        <Card v-if="activeCategory === 'general'" class="mb-6">
          <template #title>General Settings</template>
          <template #content>
            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col">
                  <label class="font-medium mb-2">Platform Name</label>
                  <InputText v-model="settings.general.platformName" placeholder="BitingLip AI" />
                </div>
                <div class="flex flex-col">
                  <label class="font-medium mb-2">Default Language</label>
                  <Dropdown 
                    v-model="settings.general.language" 
                    :options="languageOptions" 
                    optionLabel="name" 
                    optionValue="code"
                    placeholder="Select Language"
                  />
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col">
                  <label class="font-medium mb-2">Timezone</label>
                  <Dropdown 
                    v-model="settings.general.timezone" 
                    :options="timezoneOptions" 
                    optionLabel="label" 
                    optionValue="value"
                    placeholder="Select Timezone"
                    filter
                  />
                </div>
                <div class="flex flex-col">
                  <label class="font-medium mb-2">Theme</label>
                  <Dropdown 
                    v-model="settings.general.theme" 
                    :options="themeOptions" 
                    optionLabel="name" 
                    optionValue="value"
                    placeholder="Select Theme"
                  />
                </div>
              </div>

              <div class="flex items-center space-x-3">
                <Checkbox v-model="settings.general.enableNotifications" binary />
                <label class="font-medium">Enable System Notifications</label>
              </div>

              <div class="flex items-center space-x-3">
                <Checkbox v-model="settings.general.autoRefresh" binary />
                <label class="font-medium">Auto-refresh Dashboard Data</label>
              </div>
            </div>
          </template>
        </Card>

        <!-- Performance Settings -->
        <Card v-if="activeCategory === 'performance'" class="mb-6">
          <template #title>Performance Settings</template>
          <template #content>
            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col">
                  <label class="font-medium mb-2">Refresh Interval (seconds)</label>
                  <InputNumber 
                    v-model="settings.performance.refreshInterval" 
                    :min="1" 
                    :max="300"
                    suffix=" sec"
                  />
                </div>
                <div class="flex flex-col">
                  <label class="font-medium mb-2">Max Concurrent Tasks</label>
                  <InputNumber 
                    v-model="settings.performance.maxConcurrentTasks" 
                    :min="1" 
                    :max="100"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col">
                  <label class="font-medium mb-2">Memory Limit (GB)</label>
                  <InputNumber 
                    v-model="settings.performance.memoryLimit" 
                    :min="1" 
                    :max="128"
                    suffix=" GB"
                  />
                </div>
                <div class="flex flex-col">
                  <label class="font-medium mb-2">GPU Memory Threshold (%)</label>
                  <InputNumber 
                    v-model="settings.performance.gpuMemoryThreshold" 
                    :min="50" 
                    :max="95"
                    suffix="%"
                  />
                </div>
              </div>

              <div class="flex items-center space-x-3">
                <Checkbox v-model="settings.performance.enableCaching" binary />
                <label class="font-medium">Enable Model Caching</label>
              </div>

              <div class="flex items-center space-x-3">
                <Checkbox v-model="settings.performance.enableLoadBalancing" binary />
                <label class="font-medium">Enable Automatic Load Balancing</label>
              </div>
            </div>
          </template>
        </Card>

        <!-- Security Settings -->
        <Card v-if="activeCategory === 'security'" class="mb-6">
          <template #title>Security Settings</template>
          <template #content>
            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col">
                  <label class="font-medium mb-2">Session Timeout (minutes)</label>
                  <InputNumber 
                    v-model="settings.security.sessionTimeout" 
                    :min="5" 
                    :max="480"
                    suffix=" min"
                  />
                </div>
                <div class="flex flex-col">
                  <label class="font-medium mb-2">Max Login Attempts</label>
                  <InputNumber 
                    v-model="settings.security.maxLoginAttempts" 
                    :min="3" 
                    :max="10"
                  />
                </div>
              </div>

              <div class="flex items-center space-x-3">
                <Checkbox v-model="settings.security.enableTwoFactor" binary />
                <label class="font-medium">Enable Two-Factor Authentication</label>
              </div>

              <div class="flex items-center space-x-3">
                <Checkbox v-model="settings.security.enableApiRateLimit" binary />
                <label class="font-medium">Enable API Rate Limiting</label>
              </div>

              <div class="flex items-center space-x-3">
                <Checkbox v-model="settings.security.enableAuditLog" binary />
                <label class="font-medium">Enable Audit Logging</label>
              </div>

              <div class="flex items-center space-x-3">
                <Checkbox v-model="settings.security.requireHttps" binary />
                <label class="font-medium">Require HTTPS for All Connections</label>
              </div>
            </div>
          </template>
        </Card>

        <!-- Monitoring Settings -->
        <Card v-if="activeCategory === 'monitoring'" class="mb-6">
          <template #title>Monitoring Settings</template>
          <template #content>
            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col">
                  <label class="font-medium mb-2">Metrics Retention (days)</label>
                  <InputNumber 
                    v-model="settings.monitoring.metricsRetention" 
                    :min="1" 
                    :max="365"
                    suffix=" days"
                  />
                </div>
                <div class="flex flex-col">
                  <label class="font-medium mb-2">Alert Check Interval (seconds)</label>
                  <InputNumber 
                    v-model="settings.monitoring.alertInterval" 
                    :min="10" 
                    :max="300"
                    suffix=" sec"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col">
                  <label class="font-medium mb-2">CPU Alert Threshold (%)</label>
                  <InputNumber 
                    v-model="settings.monitoring.cpuThreshold" 
                    :min="50" 
                    :max="95"
                    suffix="%"
                  />
                </div>
                <div class="flex flex-col">
                  <label class="font-medium mb-2">Memory Alert Threshold (%)</label>
                  <InputNumber 
                    v-model="settings.monitoring.memoryThreshold" 
                    :min="50" 
                    :max="95"
                    suffix="%"
                  />
                </div>
              </div>

              <div class="flex items-center space-x-3">
                <Checkbox v-model="settings.monitoring.enableEmailAlerts" binary />
                <label class="font-medium">Enable Email Alerts</label>
              </div>

              <div class="flex items-center space-x-3">
                <Checkbox v-model="settings.monitoring.enableSlackIntegration" binary />
                <label class="font-medium">Enable Slack Integration</label>
              </div>

              <div class="flex items-center space-x-3">
                <Checkbox v-model="settings.monitoring.enableDetailedLogging" binary />
                <label class="font-medium">Enable Detailed Performance Logging</label>
              </div>
            </div>
          </template>
        </Card>

        <!-- API Settings -->
        <Card v-if="activeCategory === 'api'" class="mb-6">
          <template #title>API Settings</template>
          <template #content>
            <div class="space-y-6">
              <div class="grid grid-cols-1 gap-4">
                <div class="flex flex-col">
                  <label class="font-medium mb-2">API Base URL</label>
                  <InputText v-model="settings.api.baseUrl" placeholder="http://localhost:8000" />
                </div>
                <div class="flex flex-col">
                  <label class="font-medium mb-2">WebSocket URL</label>
                  <InputText v-model="settings.api.websocketUrl" placeholder="ws://localhost:8001" />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col">
                  <label class="font-medium mb-2">Request Timeout (seconds)</label>
                  <InputNumber 
                    v-model="settings.api.timeout" 
                    :min="5" 
                    :max="300"
                    suffix=" sec"
                  />
                </div>
                <div class="flex flex-col">
                  <label class="font-medium mb-2">Retry Attempts</label>
                  <InputNumber 
                    v-model="settings.api.retryAttempts" 
                    :min="0" 
                    :max="5"
                  />
                </div>
              </div>

              <div class="flex items-center space-x-3">
                <Checkbox v-model="settings.api.enableRequestLogging" binary />
                <label class="font-medium">Enable API Request Logging</label>
              </div>

              <div class="flex items-center space-x-3">
                <Checkbox v-model="settings.api.enableCors" binary />
                <label class="font-medium">Enable CORS</label>
              </div>
            </div>
          </template>
        </Card>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3 mt-6">
          <Button 
            label="Reset to Defaults" 
            severity="secondary" 
            outlined 
            @click="resetToDefaults"
          />
          <Button 
            label="Save Settings" 
            @click="saveSettings"
            :loading="isSaving"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Menu from 'primevue/menu'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'

const toast = useToast()

const activeCategory = ref<string>('general')
const isSaving = ref(false)

const settingsCategories = [
  { key: 'general', label: 'General', icon: 'pi pi-cog' },
  { key: 'performance', label: 'Performance', icon: 'pi pi-chart-line' },
  { key: 'security', label: 'Security', icon: 'pi pi-shield' },
  { key: 'monitoring', label: 'Monitoring', icon: 'pi pi-eye' },
  { key: 'api', label: 'API Configuration', icon: 'pi pi-server' }
]

const languageOptions = [
  { name: 'English', code: 'en' },
  { name: 'Spanish', code: 'es' },
  { name: 'French', code: 'fr' },
  { name: 'German', code: 'de' },
  { name: 'Chinese', code: 'zh' },
  { name: 'Japanese', code: 'ja' }
]

const timezoneOptions = [
  { label: 'UTC', value: 'UTC' },
  { label: 'Eastern Time (ET)', value: 'America/New_York' },
  { label: 'Central Time (CT)', value: 'America/Chicago' },
  { label: 'Mountain Time (MT)', value: 'America/Denver' },
  { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
  { label: 'London (GMT)', value: 'Europe/London' },
  { label: 'Paris (CET)', value: 'Europe/Paris' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'Sydney (AEST)', value: 'Australia/Sydney' }
]

const themeOptions = [
  { name: 'Light', value: 'light' },
  { name: 'Dark', value: 'dark' },
  { name: 'Auto (System)', value: 'auto' }
]

const settings = reactive({
  general: {
    platformName: 'BitingLip AI',
    language: 'en',
    timezone: 'UTC',
    theme: 'light',
    enableNotifications: true,
    autoRefresh: true
  },
  performance: {
    refreshInterval: 30,
    maxConcurrentTasks: 10,
    memoryLimit: 8,
    gpuMemoryThreshold: 85,
    enableCaching: true,
    enableLoadBalancing: true
  },
  security: {
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    enableTwoFactor: false,
    enableApiRateLimit: true,
    enableAuditLog: true,
    requireHttps: false
  },
  monitoring: {
    metricsRetention: 30,
    alertInterval: 60,
    cpuThreshold: 80,
    memoryThreshold: 85,
    enableEmailAlerts: false,
    enableSlackIntegration: false,
    enableDetailedLogging: true
  },
  api: {
    baseUrl: 'http://localhost:8000',
    websocketUrl: 'ws://localhost:8001',
    timeout: 30,
    retryAttempts: 3,
    enableRequestLogging: false,
    enableCors: true
  }
})

const defaultSettings = JSON.parse(JSON.stringify(settings))

const loadSettings = () => {
  const savedSettings = localStorage.getItem('bitinglip-settings')
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings)
      Object.assign(settings, parsed)
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast.add({
        severity: 'warn',
        summary: 'Settings Load Warning',
        detail: 'Failed to load saved settings, using defaults',
        life: 3000
      })
    }
  }
}

const saveSettings = async () => {
  isSaving.value = true
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    localStorage.setItem('bitinglip-settings', JSON.stringify(settings))
    
    toast.add({
      severity: 'success',
      summary: 'Settings Saved',
      detail: 'Your settings have been saved successfully',
      life: 3000
    })
  } catch (error) {
    console.error('Failed to save settings:', error)
    toast.add({
      severity: 'error',
      summary: 'Save Failed',
      detail: 'Failed to save settings. Please try again.',
      life: 3000
    })
  } finally {
    isSaving.value = false
  }
}

const resetToDefaults = () => {
  Object.assign(settings, JSON.parse(JSON.stringify(defaultSettings)))
  toast.add({
    severity: 'info',
    summary: 'Settings Reset',
    detail: 'Settings have been reset to default values',
    life: 3000
  })
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.settings-view {
  min-height: calc(100vh - 120px);
}
</style>
