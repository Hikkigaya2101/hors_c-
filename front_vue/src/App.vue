<template>
  <div class="app">
    <router-view />
    <ChatSidebar />
  </div>
</template>

<script setup>
import ChatSidebar from '../src/components/Chat/ChatSidebar.vue'
</script>

<style>
.app {
  position: relative;
}
</style>