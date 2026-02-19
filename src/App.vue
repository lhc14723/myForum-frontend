<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useUserStore } from './stores/user'

const userStore = useUserStore()
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/" class="logo">论坛</RouterLink>
      
      <div class="nav-links">
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/sections">分区管理</RouterLink>
        <template v-if="userStore.isLoggedIn">
          <span>欢迎，{{ userStore.userInfo?.username || '用户' }}</span>
          <RouterLink to="/post/create">发布帖子</RouterLink>
          <a href="#" @click.prevent="userStore.logout">退出</a>
        </template>
        
        <template v-else>
          <RouterLink to="/login">登录</RouterLink>
          <RouterLink to="/register">注册</RouterLink>
        </template>
      </div>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background: #f5f5f5;
}

header {
  background: white;
  border-bottom: 1px solid #ddd;
  padding: 0 20px;
}

nav {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-links a {
  color: #666;
  text-decoration: none;
}

.nav-links a:hover {
  color: #007bff;
}

main {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}
</style>