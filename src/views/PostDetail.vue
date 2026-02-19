<script setup>
import { ref, onMounted, computed } from 'vue'  // 添加 computed
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'  // 添加用户状态
import request from '../api/request'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()  // 添加

const post = ref(null)
const loading = ref(true)
const error = ref('')

// ===== 新增：编辑功能 =====
const isEditing = ref(false)  // 是否处于编辑模式
const editForm = ref({        // 编辑表单
  title: '',
  content: ''
})

// 检查是否是作者（新增）
const isAuthor = computed(() => {
  return userStore.isLoggedIn && 
         userStore.userInfo?.id === post.value?.author?.id
})

// 进入编辑模式（新增）
function startEdit() {
  editForm.value.title = post.value.title
  editForm.value.content = post.value.content
  isEditing.value = true
}

// 取消编辑（新增）
function cancelEdit() {
  isEditing.value = false
}

// 保存编辑（新增）
async function saveEdit() {
  if (!editForm.value.title.trim() || !editForm.value.content.trim()) {
    alert('标题和内容不能为空')
    return
  }
  
  try {
    const res = await request.patch(`/posts/${route.params.id}/`, {
      title: editForm.value.title,
      content: editForm.value.content
    })
    
    post.value = res  // 更新显示
    isEditing.value = false
    alert('修改成功！')
  } catch (err) {
    alert('修改失败：' + (err.response?.data?.message || '未知错误'))
  }
}

// 删除帖子（新增）
async function deletePost() {
  if (!confirm('确定要删除这个帖子吗？此操作不可恢复！')) {
    return
  }
  
  try {
    await request.delete(`/posts/${route.params.id}/`)
    alert('删除成功')
    router.push('/')  // 返回首页
  } catch (err) {
    alert('删除失败：' + (err.response?.data?.message || '未知错误'))
  }
}
// ===== 新增结束 =====

async function fetchPost() {
  try {
    const res = await request.get(`/posts/${route.params.id}/`)
    post.value = res
  } catch (err) {
    error.value = '帖子不存在或已被删除'
  } finally {
    loading.value = false
  }
}

// 增加浏览量
async function incrementViews() {
  try {
    await request.post(`/posts/${route.params.id}/increment_views/`)
  } catch (err) {
    console.error('增加浏览量失败:', err)
  }
}

onMounted(() => {
  fetchPost()
  incrementViews()
})
</script>

<template>
  <div class="post-detail">
    <!-- 加载和错误状态（原来就有） -->
    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else-if="error" class="error">
      {{ error }}
      <button @click="router.push('/')">返回首页</button>
    </div>
    
    <!-- ===== 新增：编辑模式 ===== -->
    <div v-else-if="isEditing" class="edit-mode">
      <h2>编辑帖子</h2>
      
      <div class="form-group">
        <label>标题</label>
        <input v-model="editForm.title" maxlength="100">
      </div>
      
      <div class="form-group">
        <label>内容</label>
        <textarea v-model="editForm.content" rows="15"></textarea>
      </div>
      
      <div class="edit-actions">
        <button @click="saveEdit" class="save-btn">保存修改</button>
        <button @click="cancelEdit" class="cancel-btn">取消</button>
      </div>
    </div>
    
    <!-- 查看模式（原来就有，只加了作者按钮） -->
    <div v-else class="view-mode">
      <div class="post-header">
        <span class="section">{{ post.board_name }}</span>
        <span class="author">👤 {{ post.author?.username }}</span>
        <span class="time">🕐 {{ new Date(post.created_at).toLocaleString() }}</span>
      </div>
      
      <h1 class="post-title">{{ post.title }}</h1>
      
      <div class="post-body">
        {{ post.content }}
      </div>
      
      <div class="post-stats">
        <span>👁 {{ post.views || 0 }} 浏览</span>
        <span>📝 {{ post.content_length || 0 }} 字</span>
      </div>
      
      <!-- ===== 新增：作者操作按钮 ===== -->
      <div v-if="isAuthor" class="author-actions">
        <button @click="startEdit" class="edit-btn">✏️ 编辑</button>
        <button @click="deletePost" class="delete-btn">🗑️ 删除</button>
      </div>
      
      <button @click="router.push('/')" class="back-btn">← 返回列表</button>
    </div>
  </div>
</template>

<style scoped>
/* 原来的样式 */
.post-detail {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 30px;
  border-radius: 8px;
  min-height: 500px;
}

.loading, .error {
  text-align: center;
  padding: 50px;
}

.post-header {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
}

.section {
  color: #007bff;
  font-weight: bold;
}

.post-title {
  font-size: 24px;
  margin-bottom: 20px;
  line-height: 1.4;
}

.post-body {
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
  margin-bottom: 30px;
}

.post-stats {
  display: flex;
  gap: 20px;
  padding: 15px 0;
  border-top: 1px solid #eee;
  color: #999;
  font-size: 14px;
}

.back-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.back-btn:hover {
  background: #e0e0e0;
}

/* ===== 新增：编辑和删除按钮样式 ===== */
.author-actions {
  margin: 20px 0;
  padding: 15px 0;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
}

.edit-btn {
  padding: 8px 16px;
  background: #ffc107;
  color: #333;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn {
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 新增：编辑模式样式 */
.edit-mode {
  padding: 20px;
}

.edit-mode h2 {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
  min-height: 300px;
}

.edit-actions {
  display: flex;
  gap: 10px;
}

.save-btn {
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>