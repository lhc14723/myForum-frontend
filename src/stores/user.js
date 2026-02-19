import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '../api/request'

export const useUserStore = defineStore('user', () => {
  // State
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  const credentials = ref(JSON.parse(localStorage.getItem('credentials') || 'null'))
  
  // Getter
  const isLoggedIn = computed(() => !!userInfo.value)
  
  // Action：登录（使用 Basic Auth）
  async function login({ username, password }) {
    // 先保存 credentials，后续请求会自动加到 Header
    const creds = { username, password }
    localStorage.setItem('credentials', JSON.stringify(creds))
    credentials.value = creds
    
    // 发送登录请求（带 Basic Auth）
    const res = await request.post('/auth/login/', { username, password })
    
    if (res.success) {
      userInfo.value = res.user
      localStorage.setItem('userInfo', JSON.stringify(res.user))
      return res
    } else {
      throw new Error(res.message || '登录失败')
    }
  }
  
  // Action：注册
  async function register({ username, password }) {
    const res = await request.post('/auth/register/', { username, password })
    return res
  }
  
  // Action：登出
  async function logout() {
    try {
      await request.post('/auth/logout/')
    } catch (e) {
      // 忽略错误
    }
    userInfo.value = null
    credentials.value = null
    localStorage.removeItem('userInfo')
    localStorage.removeItem('credentials')
  }
  
  return {
    userInfo,
    isLoggedIn,
    login,
    logout,
    register
  }
})