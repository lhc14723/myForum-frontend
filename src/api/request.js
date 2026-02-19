import axios from 'axios'

const request = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',  // Django 地址
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true  // ✅ 关键：允许携带 Cookie（sessionid）
})

// 请求拦截器：添加 Basic Auth 头（如果有用户名密码）
request.interceptors.request.use(config => {
  const credentials = localStorage.getItem('credentials')
  if (credentials) {
    const { username, password } = JSON.parse(credentials)
    // Basic Auth: base64(username:password)
    const token = btoa(`${username}:${password}`)
    config.headers.Authorization = `Basic ${token}`
  }
  return config
})

// 响应拦截器：处理 401 未授权
request.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('credentials')
      localStorage.removeItem('userInfo')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default request