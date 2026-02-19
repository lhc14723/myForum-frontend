<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '../api/request'

const router = useRouter()
const route = useRoute()

// 数据
const posts = ref([])
const boards = ref([])  // ✅ 改为从后端获取
const loading = ref(false)

// 搜索参数
const params = ref({
  page: parseInt(route.query.page) || 1,
  board: route.query.board || '',
  search: route.query.search || '',
  ordering: route.query.ordering || '-created_at'
})

// 获取帖子列表
async function fetchPosts() {
  loading.value = true
  try {
    const queryParams = {}
    if (params.value.page > 1) queryParams.page = params.value.page
    if (params.value.board) queryParams.board = params.value.board
    if (params.value.search) queryParams.search = params.value.search
    if (params.value.ordering) queryParams.ordering = params.value.ordering
    
    const res = await request.get('/posts/', { params: queryParams })
    posts.value = res.results || []
  } catch (err) {
    console.error('获取帖子失败:', err)
    posts.value = []
  } finally {
    loading.value = false
  }
}

// ✅ 新增：获取分区列表
async function fetchBoards() {
  try {
    const res = await request.get('/boards/')
    boards.value = res.results || res || []
  } catch (err) {
    console.error('获取分区失败:', err)
    boards.value = []
  }
}

// 搜索
function handleSearch() {
  params.value.page = 1
  router.push({ query: { ...params.value } })
  fetchPosts()
}

// 切换排序
function setOrdering(field) {
  const current = params.value.ordering
  if (current === `-${field}`) {
    params.value.ordering = field
  } else {
    params.value.ordering = `-${field}`
  }
  fetchPosts()
}

// 监听 URL 变化
watch(() => route.query, () => {
  params.value.page = parseInt(route.query.page) || 1
  params.value.board = route.query.board || ''
  params.value.search = route.query.search || ''
  params.value.ordering = route.query.ordering || '-created_at'
  fetchPosts()
}, { immediate: true })

onMounted(() => {
  fetchBoards()  // ✅ 获取分区
})
</script>

<template>
  <div class="home">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <input 
        v-model="params.search" 
        @keyup.enter="handleSearch"
        placeholder="搜索帖子标题..."
        class="search-input"
      >
      
      <!-- ✅ 改为用 boards -->
      <select v-model="params.board" @change="handleSearch" class="section-select">
        <option value="">全部分区</option>
        <option v-for="b in boards" :key="b.id" :value="b.id">
          {{ b.name }}
        </option>
      </select>
      
      <button @click="handleSearch" class="search-btn">搜索</button>
    </div>
    
    <!-- 排序选项 -->
    <div class="sort-bar">
      <span>排序：</span>
      <button 
        :class="{ active: params.ordering.includes('created_at') }"
        @click="setOrdering('created_at')"
        class="sort-btn"
      >
        时间 {{ params.ordering === '-created_at' ? '↓' : '↑' }}
      </button>
      <button 
        :class="{ active: params.ordering.includes('content_length') }"
        @click="setOrdering('content_length')"
        class="sort-btn"
      >
        长度 {{ params.ordering === '-content_length' ? '↓' : '↑' }}
      </button>
      <button 
        :class="{ active: params.ordering.includes('views') }"
        @click="setOrdering('views')"
        class="sort-btn"
      >
        浏览量 {{ params.ordering === '-views' ? '↓' : '↑' }}
      </button>
    </div>
    
    <!-- 帖子列表 -->
    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else-if="posts.length === 0" class="empty">
      暂无帖子
    </div>
    
    <div v-else class="post-list">
      <div 
        v-for="post in posts" 
        :key="post.id" 
        class="post-card"
        @click="router.push(`/post/${post.id}`)"
      >
        <div class="post-header">
          <span class="post-section">{{ post.board_name || '默认分区' }}</span>
          <span class="post-author">{{ post.author?.username || '匿名' }}</span>
          <span class="post-time">{{ new Date(post.created_at).toLocaleString() }}</span>
        </div>
        
        <h3 class="post-title">{{ post.title }}</h3>
        
        <p class="post-content">{{ post.content?.substring(0, 100) }}...</p>
        
        <div class="post-footer">
          <span>👁 {{ post.views || 0 }}</span>
          <span>📝 {{ post.content_length || 0 }} 字</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 样式不变，和之前一样 */
.home {
  max-width: 800px;
  margin: 0 auto;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.section-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 120px;
}

.search-btn {
  padding: 8px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.sort-bar {
  margin-bottom: 15px;
  padding: 10px;
  background: white;
  border-radius: 8px;
}

.sort-btn {
  margin-left: 10px;
  padding: 5px 15px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.sort-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.post-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.post-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.post-header {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}

.post-section {
  color: #007bff;
  font-weight: bold;
}

.post-title {
  font-size: 18px;
  margin-bottom: 10px;
  color: #333;
}

.post-content {
  color: #666;
  line-height: 1.6;
  margin-bottom: 10px;
}

.post-footer {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #999;
}

.loading, .empty {
  text-align: center;
  padding: 50px;
  color: #999;
  background: white;
  border-radius: 8px;
}
</style>