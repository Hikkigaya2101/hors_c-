<template>
  <div class="dashboard-layout">
    <AppSidebar />
    <div class="main-content">
      <component :is="currentComponent" />
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '../components/Layout/AppSidebar.vue'
import PersonalTasks from '../components/Tasks/PersonalTasks.vue'
import ProjectList from '../components/Projects/ProjectList.vue'
import TeamList from '../components/Team/TeamList.vue'

const route = useRoute()
const currentComponent = shallowRef(PersonalTasks)

watch(() => route.query.section, (section) => {
  if (section === 'tasks') currentComponent.value = PersonalTasks
  else if (section === 'projects') currentComponent.value = ProjectList
  else if (section === 'team') currentComponent.value = TeamList
}, { immediate: true })
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  height: 100vh;
  width: 100%;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: var(--bg-primary);
}
</style>