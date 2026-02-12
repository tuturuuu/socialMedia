<script setup>
import { jwtDecode } from 'jwt-decode'
</script>

<template>
  <!-- Suggestions Sidebar -->

  <div class="input-group">
    <input
      type="text"
      class="form-control"
      placeholder="Search for people"
      aria-label="Search"
      v-model="search"
    />
    <button class="btn btn-outline-primary" type="button" id="button-addon2" @click="searchUsers">
      <i class="bi bi-search"></i>
    </button>
  </div>

  <button
    class="navbar-toggler"
    type="button"
    data-mdb-toggle="collapse"
    data-mdb-target="#navbarSupportedContent"
    aria-controls="navbarSupportedContent"
    aria-expanded="false"
    aria-label="Toggle navigation"
    @click="searchPosts()"
  ></button>

  <div class="card">
    <div class="card-body">
      <h5 class="card-title">Suggestions</h5>
      <ul class="list-unstyled">
        <li
          v-for="suggestion in suggestions"
          :key="suggestion._id"
          class="d-flex align-items-center mb-2"
        >
          <img
            v-if="suggestion.gender == 'male'"
            src="../assets/img/profile_male.png"
            class="rounded-circle me-3 d-none d-xl-block"
            alt="User Profile"
            width="50"
            height="50"
          />
          <img
            v-if="suggestion.gender == 'female'"
            src="../assets/img/profile_female.png"
            class="rounded-circle me-3 d-none d-xl-block"
            alt="User Profile"
            width="50"
            height="50"
          />
          <img
            v-if="suggestion.gender == 'other' || suggestion.gender == undefined"
            src="../assets/img/profile_other.png"
            class="rounded-circle me-3 d-none d-xl-block"
            alt="User Profile"
            width="50"
            height="50"
          />

          <div>
            <router-link
              class="mb-0 text-decoration-none"
              :to="'/detailedUser/' + suggestion._id"
              >{{ suggestion.username }}</router-link
            >
            <br />
            <small class="text-muted">@{{ suggestion.username }}</small>
          </div>

          <button
            v-if="suggestion.isFriend"
            class="btn btn-primary btn-sm ms-auto d-xl-block"
            @click="unfollow(suggestion._id)"
          >
            Unfollow
          </button>
          <button
            v-else
            class="btn btn-primary btn-sm ms-auto d-xl-block"
            @click="follow(suggestion._id)"
          >
            Follow
          </button>
        </li>
        <!-- More suggestions here -->
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      suggestions: [],
      search: '',
      id: jwtDecode(localStorage.getItem('token')).id,
    }
  },
  async mounted() {
    try {
      const response = await fetch('/api/user/suggestions/3', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
      })
      const data = await response.json()
      if (response.ok) {
        this.suggestions = data.filter((user) => user._id !== this.id)
      }
    } catch (error) {
      console.log(error)
    }
  },
  methods: {
    async searchUsers() {
      try {
        const response = await fetch(`/api/user/${this.search}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
        })
        const data = await response.json()
        if (response.ok) {
          this.suggestions = data.filter((user) => user._id !== this.id)
        }
      } catch (error) {
        console.log(error)
      }
    },
    async follow(id) {
      try {
        const socket = this.$store.getters.getSocket
        const response = await fetch(`/api/user/follow/${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
        })
        const data = await response.json()
        if (response.ok) {
          this.suggestions = this.suggestions.map((suggestion) => {
            if (suggestion._id === id) {
              suggestion.isFriend = true
            }
            return suggestion
          })
        }
      } catch (error) {
        console.log(error)
      }
    },

    async unfollow(id) {
      try {
        const response = await fetch(`/api/user/unfollow/${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
        })
        const data = await response.json()
        if (response.ok) {
          this.suggestions = this.suggestions.map((suggestion) => {
            if (suggestion._id === id) {
              suggestion.isFriend = false
            }
            return suggestion
          })
        }
        console.log(data.message)
      } catch (error) {
        console.log(error)
      }
    },
  },
}
</script>
