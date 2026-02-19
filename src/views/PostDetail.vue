<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '../api/request'

const route = useRoute()
const router = useRouter()

const post = ref(null)
const loading = ref(true)
const error = ref('')

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

onMounted(fetchPost)
</script>

<template>
  <div class="post-detail">
    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else-if="error" class="error">
      {{ error }}
      <button @click="router.push('/')">返回首页</button>
    </div>
    
    <div v-else class="post-content">
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
      
      <button @click="router.push('/')" class="back-btn">← 返回列表</button>
    </div>
  </div>
</template>

<style scoped>
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
</style>