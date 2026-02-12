<script setup>
import { jwtDecode } from 'jwt-decode'
import Paginate from 'vuejs-paginate-next'
</script>

<template>
  <!-- Button -->
  <div class="card mb-3">
    <div class="card-body">
      <form class="d-flex" @submit.prevent>
        <select class="form-select me-2" v-model="sortBy">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="byMe">By me</option>
        </select>
        <input
          v-model="search"
          class="form-control me-2"
          type="search"
          placeholder="Search"
          aria-label="Search"
        />
      </form>
    </div>
  </div>

  <!-- Create Post -->
  <div class="card mb-3">
    <div class="card-body">
      <form @submit.prevent="createPost">
        <textarea
          class="form-control"
          rows="3"
          placeholder="What's on your mind?"
          v-model="content"
        ></textarea>
        <button class="btn btn-primary mt-3"><i class="bi bi-send-fill"></i></button>
      </form>
    </div>
  </div>

  <div>
    <!-- Post -->
    <div class="card post-card" v-for="post in paginatedItems()" :key="post._id">
      <div class="card-body">
        <div class="d-flex">
          <img
            v-if="post.userId.gender == 'male'"
            src="../assets/img/profile_male.png"
            class="rounded-circle me-3"
            alt="User Profile"
            width="50"
            height="50"
          />
          <img
            v-if="post.userId.gender == 'female'"
            src="../assets/img/profile_female.png"
            class="rounded-circle me-3"
            alt="User Profile"
            width="50"
            height="50"
          />
          <img
            v-if="post.userId.gender == 'other' || post.userId.gender == undefined"
            src="../assets/img/profile_other.png"
            class="rounded-circle me-3"
            alt="User Profile"
            width="50"
            height="50"
          />

          <div>
            <h6 class="card-title mb-0">{{ post.userId.username }}</h6>
            <small class="text-muted">{{ new Date(post.createdAt).toLocaleString() }}</small>
          </div>
          <div class="ms-auto" v-if="post.userId._id === id">
            <button class="btn btn-outline-primary btn-sm" @click="post.editing = true">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-primary btn-sm m-1" @click="deletePost(post)">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
        </div>
        <div v-if="post.editing" class="mt-3 mb-2">
          <input
            v-model="post.content"
            @blur="updatePost(post)"
            @keydown.enter="updatePost(post)"
            type="text"
            class="form-control"
          />
        </div>
        <p v-if="!post.editing" class="mt-3">{{ post.content }}</p>
        <div class="d-flex justify-content-between">
          <button class="btn btn-outline-primary btn-sm"><i class="bi bi-cup-hot"></i></button>
          <button class="btn btn-outline-primary btn-sm">Comment</button>
          <button class="btn btn-outline-primary btn-sm"><i class="bi bi-share"></i></button>
        </div>
      </div>
    </div>
  </div>

  <paginate
    v-model="page"
    :page-count="getPageCount()"
    :page-range="3"
    :margin-pages="1"
    :prev-text="'Previous'"
    :next-text="'Next'"
    :container-class="'pagination'"
    :page-class="'page-item'"
    :active-class="'active'"
    class="mt-2"
  >
  </paginate>
</template>

<script>
export default {
  components: {
    paginate: Paginate,
  },
  data() {
    return {
      errors: {
        content: '',
      },
      sortBy: 'newest',
      content: '',
      search: '',
      posts: [],
      perPage: 3,
      page: 1,
      id: jwtDecode(localStorage.getItem('token')).id,
      debouncedSearch: '', // Holds the debounced search term
      debounceTimeout: null, // Timeout ID for debouncing
      errors: {
        content: '',
      },
    }
  },
  methods: {
    validate() {
      this.errors = {}
      if (!this.content) {
        this.errors.content = 'Content is required'
      }
      if (this.content.length > 2000) {
        this.errors.content = 'Content must be less than 2000 characters'
      }
    },
    async createPost() {
      this.validate()

      try {
        const response = await fetch('/api/post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
          body: JSON.stringify({
            content: this.content,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          this.posts.push(data.post)
          this.content = ''
        }
      } catch (error) {
        console.log(error)
      }
    },
    async updatePost(post) {
      post.editing = false
      this.errors = {}

      if (!post.content) {
        this.errors.content = 'Content is required'
      }
      if (post.content.length > 2000) {
        this.errors.content = 'Content must be less than 2000 characters'
      }

      if (Object.keys(this.errors).length > 0) {
        alert(this.errors.content)
        return
      }
      try {
        const response = await fetch('/api/post', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
          body: JSON.stringify({
            content: post.content,
            post_id: post._id,
          }),
        })
        if (response.ok) {
          const data = await response.json()
          this.content = ''
        }
      } catch (error) {
        console.log(error)
      }
    },

    async deletePost(post) {
      try {
        const response = await fetch('/api/post', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
          body: JSON.stringify({
            post_id: post._id,
          }),
        })
        if (response.ok) {
          const data = await response.json()
          const index = this.posts.findIndex((p) => p._id === post._id)
          if (index !== -1) {
            this.posts.splice(index, 1)
          }
        }
      } catch (error) {
        console.log(error)
      }
    },
    debounceSearch() {
      clearTimeout(this.debounceTimeout) // Clear existing timeout

      // Set new timeout to update `debouncedSearch` after delay
      this.debounceTimeout = setTimeout(() => {
        this.debouncedSearch = this.search // Update with the debounced search term
      }, 300) // Delay in milliseconds
    },
    getPageCount() {
      return Math.ceil(this.filteredPosts.length / this.perPage)
    },
    paginatedItems() {
      const start = (this.page - 1) * this.perPage
      const end = start + this.perPage

      return this.filteredPosts.slice(start, end)
    },
  },
  computed: {
    filteredPosts() {
      let temp = []
      switch (this.sortBy) {
        case 'newest':
          this.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          temp = this.posts
          break
        case 'oldest':
          this.posts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          temp = this.posts
          break
        case 'byMe':
          temp = this.posts.filter((post) => post.userId._id === this.id)
          break
        default:
          break
      }

      // Use the debounced search term for filtering
      if (this.debouncedSearch) {
        temp = temp.filter((post) =>
          post.content.toLowerCase().includes(this.debouncedSearch.toLowerCase()),
        )
      }

      return temp
    },
  },
  watch: {
    search() {
      this.debounceSearch() // Trigger debounce function when `search` changes
    },
  },
  beforeDestroy() {
    clearTimeout(this.debounceTimeout) // Clean up timeout when component is destroyed
  },

  async mounted() {
    try {
      const response = await fetch('/api/post/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
      })
      const data = await response.json()
      this.posts = data
    } catch (error) {
      console.log(error)
    }
  },
}
</script>
