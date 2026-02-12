<template>
  <!-- Trending Topics -->
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">Trending Topics</h5>
      <ul class="list-unstyled">
        <li v-for="story in topStories" :key="story.url">
          <a :href="story.url">{{ story.subsection }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      topStories: [],
    }
  },
  async mounted() {
    try {
      const response = await fetch(
        'https://api.nytimes.com/svc/topstories/v2/home.json?api-key=HYTflXn1lFPCrF1jJACDcTrOBmUAwkMu',
      )
      const data = await response.json()
      this.topStories = data.results
    } catch (error) {
      console.log(error)
    }
  },
}
</script>
