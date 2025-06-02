<template>
  <div class="view-documentation">
    <h1 class="view-title">Documentation</h1>
    
    <div class="doc-layout">
      <div class="doc-sidebar">
        <div class="doc-nav">
          <h2 class="doc-nav-title">Contents</h2>
          <ul class="doc-nav-items">
            <li v-for="section in sections" :key="section.id">
              <a 
                :href="`#${section.id}`" 
                :class="{ active: activeSection === section.id }"
                @click="scrollToSection(section.id)"
              >
                {{ section.title }}
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="doc-content">
        <!-- Introduction Section -->
        <section id="introduction" class="doc-section">
          <h2 class="doc-section-title">Introduction</h2>
          <p>Welcome to the Biting Lip UI component library documentation. This guide provides examples and usage instructions for all the available components in the system.</p>
          <p>The component system is organized into three main categories:</p>
          <ul>
            <li><strong>Elements</strong>: Basic UI building blocks (buttons, inputs, etc.)</li>
            <li><strong>Composites</strong>: Combinations of elements that form more complex components</li>
            <li><strong>Layout</strong>: Components that define the structure of the application</li>
          </ul>
        </section>
        
        <!-- Elements Section -->
        <section id="elements" class="doc-section">
          <h2 class="doc-section-title">Elements</h2>
          <p>Elements are the fundamental building blocks of our UI system.</p>
          
          <!-- Button Component -->
          <div class="component-doc">
            <h3 id="element-button" class="component-title">ElementButton</h3>
            <p>A versatile button component with various styles and states.</p>
            
            <h4>Basic Usage</h4>
            <div class="component-demo">
              <ElementButton>Default Button</ElementButton>
              <ElementButton variant="secondary">Secondary</ElementButton>
              <ElementButton variant="danger">Danger</ElementButton>
              <ElementButton variant="success">Success</ElementButton>
              <ElementButton variant="ghost">Ghost</ElementButton>
            </div>
            
            <h4>With Icons</h4>
            <div class="component-demo">
              <ElementButton icon="add">Create New</ElementButton>
              <ElementButton variant="secondary" icon="edit">Edit</ElementButton>
              <ElementButton variant="danger" icon="delete">Delete</ElementButton>
              <ElementButton icon="search" iconOnly></ElementButton>
              <ElementButton variant="secondary" icon="settings" iconOnly></ElementButton>
            </div>
            
            <h4>Sizes</h4>
            <div class="component-demo">
              <ElementButton size="sm">Small</ElementButton>
              <ElementButton>Medium</ElementButton>
              <ElementButton size="lg">Large</ElementButton>
            </div>
            
            <h4>States</h4>
            <div class="component-demo">
              <ElementButton>Normal</ElementButton>
              <ElementButton disabled>Disabled</ElementButton>
              <ElementButton loading>Loading</ElementButton>
            </div>
            
            <h4>Props</h4>
            <table class="props-table">
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>variant</td>
                  <td>string</td>
                  <td>'primary'</td>
                  <td>Button style variant: 'primary', 'secondary', 'danger', 'success', 'ghost'</td>
                </tr>
                <tr>
                  <td>size</td>
                  <td>string</td>
                  <td>'md'</td>
                  <td>Button size: 'sm', 'md', 'lg'</td>
                </tr>
                <tr>
                  <td>icon</td>
                  <td>string</td>
                  <td>-</td>
                  <td>Material icon name to display on the button</td>
                </tr>
                <tr>
                  <td>text</td>
                  <td>string</td>
                  <td>-</td>
                  <td>Button text (alternative to using slot)</td>
                </tr>
                <tr>
                  <td>disabled</td>
                  <td>boolean</td>
                  <td>false</td>
                  <td>Whether the button is disabled</td>
                </tr>
                <tr>
                  <td>loading</td>
                  <td>boolean</td>
                  <td>false</td>
                  <td>Whether the button is in loading state</td>
                </tr>
                <tr>
                  <td>iconOnly</td>
                  <td>boolean</td>
                  <td>false</td>
                  <td>Whether to only show icon without text</td>
                </tr>
              </tbody>
            </table>

            <h4>Events</h4>
            <table class="props-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Payload</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>click</td>
                  <td>MouseEvent</td>
                  <td>Emitted when the button is clicked</td>
                </tr>
              </tbody>
            </table>
            
            <h4>Example Code</h4>
            <pre class="code-block"><code>&lt;ElementButton
  variant="primary"
  icon="save"
  @click="saveData"
&gt;
  Save Changes
&lt;/ElementButton&gt;</code></pre>
          </div>
          
          <!-- Input Component -->
          <div class="component-doc">
            <h3 id="element-input" class="component-title">ElementInput</h3>
            <p>Input component for collecting user text input.</p>
            
            <h4>Basic Usage</h4>
            <div class="component-demo">
              <ElementInput
                v-model="inputValue"
                label="Username"
                placeholder="Enter your username"
              />
            </div>
            
            <h4>Types</h4>
            <div class="component-demo">
              <ElementInput
                label="Text"
                placeholder="Text input"
                type="text"
              />
              <ElementInput
                label="Password"
                placeholder="Password input"
                type="password"
              />
              <ElementInput
                label="Number"
                placeholder="Number input"
                type="number"
              />
              <ElementInput
                label="Date"
                type="date"
              />
            </div>
            
            <h4>With Icons</h4>
            <div class="component-demo">
              <ElementInput
                label="Search"
                placeholder="Search..."
                prefixIcon="search"
              />
              <ElementInput
                label="Email"
                placeholder="Enter your email"
                prefixIcon="mail"
                type="email"
              />
              <ElementInput
                label="Password"
                placeholder="Enter your password"
                type="password"
                suffixIcon="visibility"
              />
            </div>
            
            <h4>Textarea</h4>
            <div class="component-demo">
              <ElementInput
                v-model="textareaValue"
                label="Description"
                placeholder="Enter description"
                type="textarea"
                rows="3"
              />
            </div>
            
            <h4>Validation</h4>
            <div class="component-demo">
              <ElementInput
                label="With Error"
                placeholder="Invalid input"
                errorMessage="This field is required"
              />
              <ElementInput
                label="With Helper Text"
                placeholder="Enter your username"
                helperText="Username must be at least 4 characters"
              />
            </div>
            
            <h4>States</h4>
            <div class="component-demo">
              <ElementInput
                label="Normal"
                placeholder="Normal input"
              />
              <ElementInput
                label="Disabled"
                placeholder="Disabled input"
                disabled
              />
              <ElementInput
                label="Readonly"
                placeholder="Readonly input"
                readonly
                value="Read only value"
              />
            </div>
            
            <h4>Props</h4>
            <table class="props-table">
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>modelValue</td>
                  <td>string | number</td>
                  <td>-</td>
                  <td>Value bound to v-model</td>
                </tr>
                <tr>
                  <td>type</td>
                  <td>string</td>
                  <td>'text'</td>
                  <td>Input type: 'text', 'email', 'password', 'number', 'textarea', etc.</td>
                </tr>
                <tr>
                  <td>size</td>
                  <td>string</td>
                  <td>'md'</td>
                  <td>Input size: 'sm', 'md', 'lg'</td>
                </tr>
                <tr>
                  <td>label</td>
                  <td>string</td>
                  <td>-</td>
                  <td>Input label text</td>
                </tr>
                <tr>
                  <td>placeholder</td>
                  <td>string</td>
                  <td>-</td>
                  <td>Input placeholder text</td>
                </tr>
                <tr>
                  <td>helperText</td>
                  <td>string</td>
                  <td>-</td>
                  <td>Helper text to display below input</td>
                </tr>
                <tr>
                  <td>errorMessage</td>
                  <td>string</td>
                  <td>-</td>
                  <td>Error message to display on invalid input</td>
                </tr>
                <tr>
                  <td>prefixIcon</td>
                  <td>string</td>
                  <td>-</td>
                  <td>Material icon name to display at the start</td>
                </tr>
                <tr>
                  <td>suffixIcon</td>
                  <td>string</td>
                  <td>-</td>
                  <td>Material icon name to display at the end</td>
                </tr>
              </tbody>
            </table>
            
            <h4>Example Code</h4>
            <pre class="code-block"><code>&lt;ElementInput
  v-model="username"
  label="Username"
  placeholder="Enter your username"
  prefixIcon="person"
  helperText="Username must be at least 4 characters"
/&gt;</code></pre>
          </div>
          
          <!-- Other elements would go here -->
          <div class="component-doc">
            <h3 id="element-badge" class="component-title">ElementBadge</h3>
            <p>Badge component for displaying statuses and tags.</p>
            
            <h4>Basic Usage</h4>
            <div class="component-demo">
              <ElementBadge>Default</ElementBadge>
              <ElementBadge variant="primary">Primary</ElementBadge>
              <ElementBadge variant="success">Success</ElementBadge>
              <ElementBadge variant="warning">Warning</ElementBadge>
              <ElementBadge variant="danger">Danger</ElementBadge>
              <ElementBadge variant="info">Info</ElementBadge>
              <ElementBadge variant="secondary">Secondary</ElementBadge>
            </div>
          </div>
        </section>
        
        <!-- Composites Section -->
        <section id="composites" class="doc-section">
          <h2 class="doc-section-title">Composite Components</h2>
          <p>Composite components are built by combining multiple elements into more complex UI patterns.</p>
          
          <!-- Form Component -->
          <div class="component-doc">
            <h3 id="form" class="component-title">Form</h3>
            <p>Form component for creating consistent form layouts with validation support.</p>
            
            <h4>Basic Usage</h4>
            <div class="component-demo">
              <Form @submit="handleSubmit">
                <FormFieldGroup
                  label="Username"
                  required
                >
                  <ElementInput
                    v-model="formUsername"
                    placeholder="Enter your username"
                  />
                </FormFieldGroup>
                
                <FormFieldGroup
                  label="Email"
                  required
                >
                  <ElementInput
                    v-model="formEmail"
                    type="email"
                    placeholder="Enter your email"
                  />
                </FormFieldGroup>
                
                <ElementButton type="submit">Submit</ElementButton>
              </Form>
            </div>
          </div>
          
          <!-- DataTable Component -->
          <div class="component-doc">
            <h3 id="data-table" class="component-title">DataTable</h3>
            <p>Table component for displaying and interacting with structured data.</p>
            
            <h4>Basic Usage</h4>
            <div class="component-demo">
              <DataTable
                :columns="tableColumns"
                :items="tableItems"
                :sortKey="tableSortKey"
                :sortOrder="tableSortOrder"
                @sort="handleTableSort"
              />
            </div>
          </div>
        </section>
        
        <!-- Layout Section -->
        <section id="layout" class="doc-section">
          <h2 class="doc-section-title">Layout Components</h2>
          <p>Layout components define the structure and organization of the application UI.</p>
          
          <div class="component-doc">
            <h3 id="global-bar" class="component-title">GlobalBar</h3>
            <p>The top navigation bar used across the application.</p>
            
            <h4>Example Structure</h4>
            <pre class="code-block"><code>&lt;GlobalBar @view-change="handleViewChange" /&gt;</code></pre>
          </div>
          
          <div class="component-doc">
            <h3 id="local-bar" class="component-title">LocalBar</h3>
            <p>Secondary navigation bar for context-specific actions.</p>
            
            <h4>Example Structure</h4>
            <pre class="code-block"><code>&lt;LocalBar @tab-change="handleTabChange" /&gt;</code></pre>
          </div>
        </section>
        
        <!-- Design System Section -->
        <section id="design-system" class="doc-section">
          <h2 class="doc-section-title">Design System</h2>
          <p>Our design system ensures consistency across the application through standardized colors, typography, spacing, and more.</p>
          
          <h3>Colors</h3>
          <div class="colors-grid">
            <div class="color-swatch">
              <div class="color-preview" style="background-color: var(--bl-primary)"></div>
              <div class="color-info">
                <div class="color-name">Primary</div>
                <div class="color-var">--bl-primary</div>
              </div>
            </div>
            <div class="color-swatch">
              <div class="color-preview" style="background-color: var(--bl-secondary)"></div>
              <div class="color-info">
                <div class="color-name">Secondary</div>
                <div class="color-var">--bl-secondary</div>
              </div>
            </div>
            <div class="color-swatch">
              <div class="color-preview" style="background-color: var(--bl-success)"></div>
              <div class="color-info">
                <div class="color-name">Success</div>
                <div class="color-var">--bl-success</div>
              </div>
            </div>
            <div class="color-swatch">
              <div class="color-preview" style="background-color: var(--bl-warning)"></div>
              <div class="color-info">
                <div class="color-name">Warning</div>
                <div class="color-var">--bl-warning</div>
              </div>
            </div>
            <div class="color-swatch">
              <div class="color-preview" style="background-color: var(--bl-danger)"></div>
              <div class="color-info">
                <div class="color-name">Danger</div>
                <div class="color-var">--bl-danger</div>
              </div>
            </div>
            <div class="color-swatch">
              <div class="color-preview" style="background-color: var(--bl-info)"></div>
              <div class="color-info">
                <div class="color-name">Info</div>
                <div class="color-var">--bl-info</div>
              </div>
            </div>
          </div>
          
          <h3>Typography</h3>
          <div class="typography-demo">
            <div class="type-sample">
              <h1>Heading 1</h1>
              <div class="type-info">Font size: var(--bl-font-size-xxl)</div>
            </div>
            <div class="type-sample">
              <h2>Heading 2</h2>
              <div class="type-info">Font size: var(--bl-font-size-xl)</div>
            </div>
            <div class="type-sample">
              <h3>Heading 3</h3>
              <div class="type-info">Font size: var(--bl-font-size-lg)</div>
            </div>
            <div class="type-sample">
              <p class="body-text">Body text</p>
              <div class="type-info">Font size: var(--bl-font-size-md)</div>
            </div>
            <div class="type-sample">
              <p class="small-text">Small text</p>
              <div class="type-info">Font size: var(--bl-font-size-sm)</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import ElementButton from '../elements/ElementButton.vue';
import ElementInput from '../elements/ElementInput.vue';
import ElementBadge from '../elements/ElementBadge.vue';
import Form from '../composites/forms/Form.vue';
import FormFieldGroup from '../composites/forms/FormFieldGroup.vue';
import DataTable from '../composites/tables/DataTable.vue';

// Navigation sections
const sections = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'elements', title: 'Elements' },
  { id: 'composites', title: 'Composites' },
  { id: 'layout', title: 'Layout' },
  { id: 'design-system', title: 'Design System' }
];

// Active section tracking
const activeSection = ref('introduction');

// Input examples
const inputValue = ref('');
const textareaValue = ref('');

// Form examples
const formUsername = ref('');
const formEmail = ref('');

// Table examples
const tableColumns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'status', label: 'Status', sortable: true }
];

const tableItems = ref([
  { id: 1, name: 'Item One', type: 'Type A', status: 'Active' },
  { id: 2, name: 'Item Two', type: 'Type B', status: 'Inactive' },
  { id: 3, name: 'Item Three', type: 'Type A', status: 'Active' }
]);

const tableSortKey = ref('id');
const tableSortOrder = ref<'asc' | 'desc'>('asc');

// Handler functions (stubs)
const handleSubmit = () => {
  alert('Form submitted!');
};

const handleTableSort = (key: string) => {
  if (tableSortKey.value === key) {
    tableSortOrder.value = tableSortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    tableSortKey.value = key;
    tableSortOrder.value = 'asc';
  }
};

// Scroll to section function
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

// Observe sections for scroll position
let observer: IntersectionObserver;

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id;
        }
      });
    },
    { threshold: 0.1 }
  );
  
  sections.forEach(section => {
    const element = document.getElementById(section.id);
    if (element) {
      observer.observe(element);
    }
  });
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style scoped>
.view-documentation {
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.view-title {
  font-size: 1.8rem;
  color: var(--bl-text-primary);
  margin-bottom: 1.5rem;
}

.doc-layout {
  display: flex;
  gap: 2rem;
}

/* Sidebar */
.doc-sidebar {
  width: 230px;
  flex-shrink: 0;
}

.doc-nav {
  position: sticky;
  top: 1rem;
  background-color: var(--bl-background-secondary);
  border-radius: 6px;
  padding: 1.25rem;
}

.doc-nav-title {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.125rem;
  color: var(--bl-text-primary);
  font-weight: var(--bl-font-weight-semibold);
}

.doc-nav-items {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.doc-nav-items li {
  margin-bottom: 0.5rem;
}

.doc-nav-items a {
  display: block;
  padding: 0.5rem;
  border-radius: 4px;
  color: var(--bl-text-secondary);
  text-decoration: none;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
}

.doc-nav-items a:hover {
  background-color: var(--bl-background-hover);
  color: var(--bl-text-primary);
}

.doc-nav-items a.active {
  background-color: var(--bl-primary);
  color: white;
}

/* Content */
.doc-content {
  flex: 1;
  min-width: 0;
}

.doc-section {
  margin-bottom: 2.5rem;
  padding-bottom: 2.5rem;
  border-bottom: 1px solid var(--bl-border);
}

.doc-section:last-child {
  border-bottom: none;
}

.doc-section-title {
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: 1.25rem;
  color: var(--bl-text-primary);
}

/* Components */
.component-doc {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--bl-border-light);
}

.component-doc:last-child {
  border-bottom: none;
}

.component-title {
  margin-top: 0;
  font-size: 1.25rem;
  color: var(--bl-text-primary);
}

.component-demo {
  margin: 1rem 0 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1.25rem;
  background-color: var(--bl-background-secondary);
  border-radius: 6px;
}

/* Tables */
.props-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.props-table th,
.props-table td {
  text-align: left;
  padding: 0.75rem;
  border-bottom: 1px solid var(--bl-border);
}

.props-table th {
  background-color: var(--bl-background-secondary);
  font-weight: var(--bl-font-weight-medium);
}

/* Code */
.code-block {
  margin: 0;
  padding: 1rem;
  background-color: var(--bl-background-secondary);
  border-radius: 4px;
  overflow: auto;
}

.code-block code {
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  color: var(--bl-text-primary);
  white-space: pre;
}

/* Design System */
.colors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.color-swatch {
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--bl-border);
}

.color-preview {
  height: 100px;
}

.color-info {
  padding: 0.75rem;
  background-color: var(--bl-background-secondary);
}

.color-name {
  font-weight: var(--bl-font-weight-medium);
}

.color-var {
  font-size: 0.75rem;
  font-family: monospace;
  color: var(--bl-text-secondary);
  margin-top: 0.25rem;
}

.typography-demo {
  margin-bottom: 2rem;
}

.type-sample {
  margin-bottom: 1.5rem;
}

.type-sample h1,
.type-sample h2,
.type-sample h3 {
  margin: 0;
}

.type-info {
  font-size: 0.75rem;
  color: var(--bl-text-secondary);
  font-family: monospace;
  margin-top: 0.25rem;
}

.body-text {
  font-size: var(--bl-font-size-md);
  margin: 0;
}

.small-text {
  font-size: var(--bl-font-size-sm);
  margin: 0;
}

@media (max-width: 768px) {
  .doc-layout {
    flex-direction: column;
  }
  
  .doc-sidebar {
    width: 100%;
    margin-bottom: 1.5rem;
  }
  
  .doc-nav {
    position: static;
  }
}
</style>
