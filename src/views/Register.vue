<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  username: '',
  password: '',
  password2: ''
})

const error = ref('')
const loading = ref(false)

async function handleRegister() {
  if (form.value.password !== form.value.password2) {
    error.value = '两次密码不一致'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    console.log('发送注册请求:', {
      username: form.value.username,
      password: form.value.password
    })
    
    const res = await userStore.register({
      username: form.value.username,
      password: form.value.password
    })
    
    console.log('注册成功响应:', res)
    alert('注册成功，请登录')
    router.push('/login')
  } catch (err) {
    console.error('===== 注册错误 =====')
    console.error('错误对象:', err)
    console.error('错误响应:', err.response)
    console.error('错误数据:', err.response?.data)
    console.error('状态码:', err.response?.status)
    console.error('====================')
    
    const data = err.response?.data
    if (typeof data === 'string') {
      error.value = data
    } else {
      error.value = data?.message || 
                   data?.username?.[0] || 
                   data?.password?.[0] || 
                   JSON.stringify(data) || 
                   '注册失败'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register">
    <h1>用户注册</h1>
    
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label>用户名</label>
        <input v-model="form.username" required placeholder="请输入用户名">
      </div>
      
      <div class="form-group">
        <label>密码</label>
        <input v-model="form.password" type="password" required placeholder="请输入密码">
      </div>
      
      <div class="form-group">
        <label>确认密码</label>
        <input v-model="form.password2" type="password" required placeholder="再次输入密码">
      </div>
      
      <p v-if="error" class="error">{{ error }}</p>
      
      <button type="submit" :disabled="loading">
        {{ loading ? '注册中...' : '注册' }}
      </button>
    </form>
    
    <p class="login-link">
      已有账号？<router-link to="/login">立即登录</router-link>
    </p>
  </div>
</template>

<style scoped>
.register {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.error {
  color: red;
  margin-bottom: 10px;
}

button {
  width: 100%;
  padding: 10px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
}

.login-link {
  text-align: center;
  margin-top: 15px;
}
</style>