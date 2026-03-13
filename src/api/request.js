import axios from 'axios'

const request = axios.create({
  baseURL: '/api',  
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true  
})


request.interceptors.request.use(config => {
  const credentials = localStorage.getItem('credentials')
  if (credentials) {
    const { username, password } = JSON.parse(credentials)
   
    const token = btoa(`${username}:${password}`)
    config.headers.Authorization = `Basic ${token}`
  }
  return config
})


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