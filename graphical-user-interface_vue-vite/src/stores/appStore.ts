import { defineStore } from 'pinia';

export interface AppState {
  currentView: string;
  user: {
    name: string;
    email: string;
    role: string;
  } | null;
  isAuthenticated: boolean;
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    currentView: 'clusters',
    user: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'admin'
    },
    isAuthenticated: true
  }),
  
  actions: {
    setCurrentView(view: string) {
      this.currentView = view;
    },
    
    login(email: string, password: string) {
      // Simulate login
      this.user = {
        name: 'John Doe',
        email: email,
        role: 'admin'
      };
      this.isAuthenticated = true;
    },
    
    logout() {
      this.user = null;
      this.isAuthenticated = false;
      this.currentView = 'clusters';
    }
  },
  
  getters: {
    userName(): string {
      return this.user?.name || 'Guest';
    },
    
    userRole(): string {
      return this.user?.role || 'guest';
    }
  }
});
