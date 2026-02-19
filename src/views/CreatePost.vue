<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '../api/request'

const router = useRouter()

const form = ref({
  title: '',
  content: '',
  board: ''
})

const boards = ref([])  // 从后端获取
const loading = ref(false)
const error = ref('')

// 获取分区列表
async function fetchBoards() {
  try {
    const res = await request.get('/boards/')
    boards.value = res.results || res || []
  } catch (err) {
    console.error('获取分区失败:', err)
    error.value = '无法加载分区列表'
  }
}

async function handleSubmit() {
  if (!form.value.title.trim() || !form.value.content.trim() || !form.value.board) {
    error.value = '请填写完整信息'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const res = await request.post('/posts/', {
      title: form.value.title,
      content: form.value.content,
      board: parseInt(form.value.board)
    })
    router.push(`/post/${res.id}`)
  } catch (err) {
    error.value = err.response?.data?.message || '发布失败'
  } finally {
    loading.value = false
  }
}

onMounted(fetchBoards)  // 页面加载时获取分区
</script>

<template>
  <div class="create-post">
    <h1>发布新帖子</h1>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>标题</label>
        <input 
          v-model="form.title" 
          maxlength="100" 
          required
          placeholder="请输入标题"
        >
      </div>
      
      <div class="form-group">
        <label>分区</label>
        <select v-model="form.board" required>
          <option value="">请选择分区</option>
          <option 
            v-for="b in boards" 
            :key="b.id" 
            :value="b.id"
          >
            {{ b.name }}
          </option>
        </select>
        <p v-if="boards.length === 0" class="hint">正在加载分区...</p>
      </div>
      
      <div class="form-group">
        <label>内容</label>
        <textarea 
          v-model="form.content" 
          rows="15" 
          required
          placeholder="请输入帖子内容..."
        ></textarea>
        <span class="hint">当前长度：{{ form.content.length }} 字</span>
      </div>
      
      <p v-if="error" class="error">{{ error }}</p>
      
      <button type="submit" :disabled="loading || boards.length === 0">
        {{ loading ? '发布中...' : '发布帖子' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.create-post {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 30px;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

input, select, textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

textarea {
  resize: vertical;
  min-height: 200px;
}

.hint {
  display: block;
  margin-top: 5px;
  color: #999;
  font-size: 12px;
}

.error {
  color: red;
  margin-bottom: 15px;
}

button {
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
}
</style>