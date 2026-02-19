<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import request from '../api/request'

const router = useRouter()
const userStore = useUserStore()

const boards = ref([])
const showForm = ref(false)
const form = ref({ name: '', description: '' })
const error = ref('')

onMounted(async () => {
  try {
    const res = await request.get('/boards/')
    boards.value = res.results || res || []
  } catch (err) {
    console.error('获取分区失败:', err)
  }
})

async function createBoard() {
  if (!form.value.name.trim()) {
    error.value = '请输入分区名称'
    return
  }
  
  try {
    await request.post('/boards/', {
      name: form.value.name,
      description: form.value.description
    })
    
    // 清空表单
    form.value = { name: '', description: '' }
    showForm.value = false
    error.value = ''
    
    // 刷新列表
    const res = await request.get('/boards/')
    boards.value = res.results || res || []
    
    alert('分区创建成功！')
  } catch (err) {
    error.value = err.response?.data?.name?.[0] || '创建失败'
  }
}
</script>

<template>
  <div class="sections">
    <div class="header">
      <h1>分区管理</h1>
      <button v-if="userStore.isLoggedIn" @click="showForm = true" class="create-btn">
        + 创建分区
      </button>
    </div>
    
    <!-- 创建表单 -->
    <div v-if="showForm" class="form-panel">
      <h3>创建新分区</h3>
      <input v-model="form.name" placeholder="分区名称（必填）" maxlength="50">
      <textarea v-model="form.description" placeholder="分区描述（可选）" rows="3"></textarea>
      <p v-if="error" class="error">{{ error }}</p>
      <div class="form-actions">
        <button @click="createBoard" class="submit-btn">确认创建</button>
        <button @click="showForm = false" class="cancel-btn">取消</button>
      </div>
    </div>
    
    <!-- 分区列表 -->
    <div class="board-list">
      <div v-for="board in boards" :key="board.id" class="board-card">
        <div class="board-info">
          <h3>{{ board.name }}</h3>
          <p>{{ board.description || '暂无描述' }}</p>
          <small>帖子数：{{ board.post_count || 0 }}</small>
        </div>
        <button @click="router.push(`/?board=${board.id}`)" class="view-btn">
          查看帖子
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sections {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.create-btn {
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-panel {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-panel input,
.form-panel textarea {
  width: 100%;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.error {
  color: red;
  margin-bottom: 10px;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.submit-btn {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.board-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.board-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.board-info h3 {
  margin: 0 0 5px 0;
}

.board-info p {
  color: #666;
  margin: 0;
}

.view-btn {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>