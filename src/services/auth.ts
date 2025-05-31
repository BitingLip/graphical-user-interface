import { apiClient } from './api'
import type { AuthToken, LoginCredentials, User } from '@/types'

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    const response = await apiClient.post<AuthToken>('/auth/login', credentials)
    return response.data
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
    localStorage.removeItem('auth_token')
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/auth/profile')
    return response.data
  },

  async refreshToken(): Promise<AuthToken> {
    const response = await apiClient.post<AuthToken>('/auth/refresh')
    return response.data
  }
}
