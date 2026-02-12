<script setup>
import trendingTopics from './trendingTopics.vue'
import miniProfile from './miniProfile.vue'
</script>

<template>
  <!-- Sidebar - Profile & Trends -->
  <!-- Profile Section -->
  <div class="card mb-3">
    <miniProfile></miniProfile>
  </div>

  <trendingTopics></trendingTopics>
</template>

<script>
export default {
  components: {
    trendingTopics,
    miniProfile,
  },
}
</script>
