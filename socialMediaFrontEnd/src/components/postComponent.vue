<script setup>
import { jwtDecode } from 'jwt-decode'
import Paginate from 'vuejs-paginate-next'
</script>

<template>
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
    <div class="card post-card" v-for="post in paginatedItems()" :key="post._id">
      <div class="card-body">
        <div class="d-flex">
          <img
            :src="getUserAvatar(post.userId)"
            class="rounded-circle me-3"
            alt="User Profile"
            width="50"
            height="50"
            style="object-fit: cover"
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

        <div class="d-flex justify-content-between align-items-center">
          <button class="btn btn-outline-primary btn-sm" @click="toggleLike(post)">
            <i :class="isLikedByMe(post) ? 'bi bi-hand-thumbs-up-fill' : 'bi bi-hand-thumbs-up'"></i>
            {{ post.likes?.length || 0 }}
          </button>
          <button class="btn btn-outline-primary btn-sm" @click="toggleComments(post)">
            Comment ({{ post.comments?.length || 0 }})
          </button>
          <button class="btn btn-outline-primary btn-sm"><i class="bi bi-share"></i></button>
        </div>

        <div v-if="post.showComments" class="mt-3">
          <form @submit.prevent="addComment(post)" class="mb-3 d-flex gap-2">
            <input
              v-model="post.newComment"
              type="text"
              class="form-control"
              placeholder="Write a comment"
            />
            <button class="btn btn-primary btn-sm" type="submit">Post</button>
          </form>

          <div v-if="post.comments?.length">
            <div
              class="border rounded p-2 mb-2"
              v-for="comment in post.comments"
              :key="comment._id"
            >
              <div class="d-flex align-items-center">
                <img
                  :src="getUserAvatar(comment.userId)"
                  class="rounded-circle me-2"
                  alt="Comment User"
                  width="32"
                  height="32"
                  style="object-fit: cover"
                />
                <div class="flex-grow-1">
                  <strong>{{ comment.userId?.username }}</strong>
                  <div class="small text-muted">{{ new Date(comment.createdAt).toLocaleString() }}</div>
                </div>
                <button
                  v-if="comment.userId?._id === id || post.userId._id === id"
                  class="btn btn-outline-danger btn-sm"
                  @click="deleteComment(post, comment)"
                >
                  <i class="bi bi-trash3"></i>
                </button>
              </div>
              <div class="mt-1">{{ comment.content }}</div>
            </div>
          </div>

          <div v-else class="text-muted small">No comments yet.</div>
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
const maleProfileImage = new URL('../assets/img/profile_male.png', import.meta.url).href
const femaleProfileImage = new URL('../assets/img/profile_female.png', import.meta.url).href
const otherProfileImage = new URL('../assets/img/profile_other.png', import.meta.url).href

export default {
  components: {
    paginate: Paginate,
  },
  data() {
    return {
      sortBy: 'newest',
      content: '',
      search: '',
      posts: [],
      perPage: 3,
      page: 1,
      id: jwtDecode(localStorage.getItem('token')).id,
      debouncedSearch: '',
      debounceTimeout: null,
      errors: {
        content: '',
      },
    }
  },
  methods: {
    getDefaultProfileImageByGender(gender) {
      if (gender === 'male') {
        return maleProfileImage
      }

      if (gender === 'female') {
        return femaleProfileImage
      }

      return otherProfileImage
    },
    getUserAvatar(user) {
      if (user?.profileImage) {
        return user.profileImage
      }

      return this.getDefaultProfileImageByGender(user?.gender)
    },
    hydratePost(post, oldPost = {}) {
      return {
        ...post,
        likes: post.likes || [],
        comments: post.comments || [],
        showComments: oldPost.showComments || false,
        newComment: oldPost.newComment || '',
      }
    },
    updatePostInList(updatedPost) {
      const index = this.posts.findIndex((p) => p._id === updatedPost._id)
      if (index === -1) {
        this.posts.push(this.hydratePost(updatedPost))
        return
      }

      this.posts.splice(index, 1, this.hydratePost(updatedPost, this.posts[index]))
    },
    isLikedByMe(post) {
      return (post.likes || []).some((likeId) => String(likeId) === this.id)
    },
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
          this.posts.push(this.hydratePost(data.post))
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
          const index = this.posts.findIndex((p) => p._id === post._id)
          if (index !== -1) {
            this.posts.splice(index, 1)
          }
        }
      } catch (error) {
        console.log(error)
      }
    },
    async toggleLike(post) {
      try {
        const response = await fetch(`/api/post/${post._id}/like`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
        })

        if (response.ok) {
          const data = await response.json()
          this.updatePostInList(data.post)
        }
      } catch (error) {
        console.log(error)
      }
    },
    toggleComments(post) {
      post.showComments = !post.showComments
    },
    async addComment(post) {
      if (!post.newComment || !post.newComment.trim()) {
        return
      }

      try {
        const response = await fetch(`/api/post/${post._id}/comment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
          body: JSON.stringify({
            content: post.newComment,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          this.updatePostInList(data.post)
        }
      } catch (error) {
        console.log(error)
      }
    },
    async deleteComment(post, comment) {
      try {
        const response = await fetch(`/api/post/${post._id}/comment/${comment._id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
        })

        if (response.ok) {
          const data = await response.json()
          this.updatePostInList(data.post)
        }
      } catch (error) {
        console.log(error)
      }
    },
    debounceSearch() {
      clearTimeout(this.debounceTimeout)
      this.debounceTimeout = setTimeout(() => {
        this.debouncedSearch = this.search
      }, 300)
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
      this.debounceSearch()
    },
  },
  beforeDestroy() {
    clearTimeout(this.debounceTimeout)
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
      this.posts = data.map((post) => this.hydratePost(post))
    } catch (error) {
      console.log(error)
    }
  },
}
</script>
