<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '../api/request'

const router = useRouter()
const route = useRoute()

const posts = ref([])
const boards = ref([])
const loading = ref(false)
const jumpPage = ref(1)  // 快速跳转页码

// 分页相关
const totalCount = ref(0)
const pageSize = ref(10)

// 搜索参数
const params = ref({
  page: parseInt(route.query.page) || 1,
  board: route.query.board || '',
  search: route.query.search || '',
  searchType: route.query.searchType || 'title',
  ordering: route.query.ordering || '-created_at'
})

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(totalCount.value / pageSize.value) || 1
})

// ✅ 新增：计算要显示的页码列表（当前页前后5页）
const displayPages = computed(() => {
  const current = params.value.page
  const total = totalPages.value
  const delta = 2  // 前后各显示2页（共5页：前2+当前+后2）
  
  let start = Math.max(1, current - delta)
  let end = Math.min(total, current + delta)
  
  const pages = []
  
  // 如果起始页大于1，先显示第1页
  if (start > 1) {
    pages.push(1)
    if (start > 2) {
      pages.push('...')
    }
  }
  
  // 中间页码
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  // 如果结束页小于总数，显示最后一页
  if (end < total) {
    if (end < total - 1) {
      pages.push('...')
    }
    pages.push(total)
  }
  
  return pages
})

// 获取帖子列表
async function fetchPosts() {
  loading.value = true
  try {
    const queryParams = {}
    if (params.value.page > 1) queryParams.page = params.value.page
    if (params.value.board) queryParams.board = params.value.board
    if (params.value.ordering) queryParams.ordering = params.value.ordering
    
    if (params.value.search) {
      if (params.value.searchType === 'author') {
        queryParams.author_username = params.value.search
      } else {
        queryParams.search = params.value.search
      }
    }
    
    const res = await request.get('/posts/', { params: queryParams })
    
    posts.value = res.results || []
    totalCount.value = res.count || 0
    
    // 更新跳转输入框的当前页
    jumpPage.value = params.value.page
  } catch (err) {
    console.error('获取帖子失败:', err)
    posts.value = []
    totalCount.value = 0
  } finally {
    loading.value = false
  }
}

// 跳转到指定页
function goToPage(page) {
  const targetPage = parseInt(page)
  if (isNaN(targetPage) || targetPage < 1 || targetPage > totalPages.value) {
    alert(`请输入1-${totalPages.value}之间的页码`)
    return
  }
  if (targetPage === params.value.page) return
  
  params.value.page = targetPage
  router.push({ query: { ...params.value } })
  fetchPosts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function fetchBoards() {
  try {
    const res = await request.get('/boards/')
    boards.value = res.results || res || []
  } catch (err) {
    console.error('获取分区失败:', err)
  }
}

function handleSearch() {
  params.value.page = 1
  router.push({ query: { ...params.value } })
  fetchPosts()
}

function setSearchType(type) {
  params.value.searchType = type
  if (params.value.search) {
    handleSearch()
  }
}

function setOrdering(field) {
  const current = params.value.ordering
  if (current === field) {
    params.value.ordering = `-${field}`
  } else if (current === `-${field}`) {
    params.value.ordering = field
  } else {
    params.value.ordering = `-${field}`
  }
  fetchPosts()
}

watch(() => route.query, (newQuery) => {
  params.value.page = parseInt(newQuery.page) || 1
  params.value.board = newQuery.board || ''
  params.value.search = newQuery.search || ''
  params.value.searchType = newQuery.searchType || 'title'
  params.value.ordering = newQuery.ordering || '-created_at'
  fetchPosts()
}, { immediate: true })

onMounted(() => {
  fetchBoards()
})
</script>

<template>
  <div class="home">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-type">
        <button 
          :class="{ active: params.searchType === 'title' }"
          @click="setSearchType('title')"
          class="type-btn"
        >
          标题
        </button>
        <button 
          :class="{ active: params.searchType === 'author' }"
          @click="setSearchType('author')"
          class="type-btn"
        >
          作者
        </button>
      </div>
      
      <input 
        v-model="params.search" 
        @keyup.enter="handleSearch"
        :placeholder="params.searchType === 'author' ? '输入作者用户名...' : '搜索帖子标题...'"
        class="search-input"
      >
      
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
        :class="{ active: params.ordering.includes('content_len') }"
        @click="setOrdering('content_len')"
        class="sort-btn"
      >
        长度 {{ params.ordering === '-content_len' ? '↓' : '↑' }}
      </button>
      <button 
        :class="{ active: params.ordering.includes('views') }"
        @click="setOrdering('views')"
        class="sort-btn"
      >
        浏览量 {{ params.ordering === '-views' ? '↓' : '↑' }}
      </button>
    </div>
    
    <!-- 统计信息 -->
    <div class="stats-bar">
      共 {{ totalCount }} 条帖子，第 {{ params.page }} / {{ totalPages }} 页
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
          <span class="post-author">👤 {{ post.author?.username }}</span>
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
    
    <!-- ✅ 优化后的分页组件 -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        @click="goToPage(params.page - 1)" 
        :disabled="params.page <= 1"
        class="page-btn"
      >
        上一页
      </button>
      
      <!-- 页码列表 -->
      <span class="page-numbers">
        <template v-for="(page, index) in displayPages" :key="index">
          <span v-if="page === '...'" class="ellipsis">...</span>
          <button 
            v-else
            @click="goToPage(page)"
            :class="{ active: page === params.page }"
            class="page-num"
          >
            {{ page }}
          </button>
        </template>
      </span>
      
      <button 
        @click="goToPage(params.page + 1)" 
        :disabled="params.page >= totalPages"
        class="page-btn"
      >
        下一页
      </button>
      
      <!-- 快速跳转 -->
      <span class="page-jump">
        跳至 <input 
          type="number" 
          v-model.number="jumpPage" 
          @keyup.enter="goToPage(jumpPage)"
          min="1" 
          :max="totalPages"
          class="jump-input"
        > 页
        <button @click="goToPage(jumpPage)" class="jump-btn">GO</button>
      </span>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  align-items: center;
  flex-wrap: wrap;
}

.search-type {
  display: flex;
  gap: 5px;
}

.type-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.type-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 200px;
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

.stats-bar {
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  color: #666;
  font-size: 14px;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
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

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  flex-wrap: wrap;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.page-btn:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.page-btn:hover:not(:disabled) {
  background: #f0f0f0;
}

.page-numbers {
  display: flex;
  gap: 5px;
  align-items: center;
}

.page-num {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  min-width: 36px;
  text-align: center;
}

.page-num.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.page-num:hover:not(.active) {
  background: #f0f0f0;
}

/* 省略号样式 */
.ellipsis {
  padding: 8px 4px;
  color: #999;
  cursor: default;
  user-select: none;
}

.page-jump {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
  font-size: 14px;
  margin-left: 10px;
}

.jump-input {
  width: 50px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.jump-btn {
  padding: 5px 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.jump-btn:hover {
  background: #0056b3;
}
</style>