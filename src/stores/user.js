import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '../api/request'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  const credentials = ref(JSON.parse(localStorage.getItem('credentials') || 'null'))
  
  const isLoggedIn = computed(() => !!userInfo.value)
  
  async function login({ username, password }) {
    const creds = { username, password }
    localStorage.setItem('credentials', JSON.stringify(creds))
    credentials.value = creds
    
    const res = await request.post('/auth/login/', { username, password })
    
    if (res.success) {
      userInfo.value = res.user
      localStorage.setItem('userInfo', JSON.stringify(res.user))
      return res
    } else {
      throw new Error(res.message || '登录失败')
    }
  }
  
  // ✅ 修复：去掉 email，只传 username 和 password
  async function register({ username, password }) {
    const res = await request.post('/auth/register/', { 
      username, 
      password
    })
    return res
  }
  
  async function logout() {
    try {
      await request.post('/auth/logout/')
    } catch (e) {}
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