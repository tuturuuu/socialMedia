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
      @keyup.enter="searchUsers"
    />
    <button class="btn btn-outline-primary" type="button" id="button-addon2" @click="searchUsers">
      <i class="bi bi-search"></i>
    </button>
  </div>
  <small v-if="searchNotice" class="text-muted d-block mt-1">{{ searchNotice }}</small>

  <div class="card mt-3">
    <div class="card-body">
      <h5 class="card-title">Suggestions</h5>
      <ul class="list-unstyled mb-0">
        <li
          v-for="suggestion in suggestions"
          :key="suggestion._id"
          class="suggestion-item"
        >
          <img
            v-if="suggestion.gender == 'male'"
            src="../assets/img/profile_male.png"
            class="rounded-circle suggestion-avatar"
            alt="User Profile"
            width="44"
            height="44"
          />
          <img
            v-if="suggestion.gender == 'female'"
            src="../assets/img/profile_female.png"
            class="rounded-circle suggestion-avatar"
            alt="User Profile"
            width="44"
            height="44"
          />
          <img
            v-if="suggestion.gender == 'other' || suggestion.gender == undefined"
            src="../assets/img/profile_other.png"
            class="rounded-circle suggestion-avatar"
            alt="User Profile"
            width="44"
            height="44"
          />

          <div class="suggestion-user">
            <router-link
              class="text-decoration-none d-block suggestion-name"
              :to="'/detailedUser/' + suggestion._id"
              :title="suggestion.username"
            >{{ suggestion.username }}</router-link>
            <small class="text-muted d-block suggestion-handle" :title="`@${suggestion.username}`"
              >@{{ suggestion.username }}</small
            >
          </div>

          <button
            v-if="suggestion.isFriend"
            class="btn btn-primary btn-sm suggestion-action"
            @click="unfollow(suggestion._id)"
          >
            Unfollow
          </button>
          <button
            v-else
            class="btn btn-primary btn-sm suggestion-action"
            @click="follow(suggestion._id)"
          >
            Follow
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      suggestions: [],
      defaultSuggestions: [],
      search: '',
      searchNotice: '',
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
        this.defaultSuggestions = data.filter((user) => user._id !== this.id)
        this.suggestions = this.defaultSuggestions
      }
    } catch (error) {
      console.log(error)
    }
  },
  methods: {
    async searchUsers() {
      const keyword = this.search.trim()
      if (!keyword) {
        this.searchNotice = ''
        this.suggestions = this.defaultSuggestions
        return
      }

      if (keyword.length < 2) {
        this.searchNotice = 'Type at least 2 characters to search users.'
        this.suggestions = []
        return
      }

      try {
        const response = await fetch(`/api/user/${encodeURIComponent(keyword)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
        })
        const data = await response.json()
        if (response.ok) {
          this.searchNotice = ''
          this.suggestions = data.filter((user) => user._id !== this.id)
        }
      } catch (error) {
        console.log(error)
      }
    },
    async follow(id) {
      try {
        const response = await fetch(`/api/user/follow/${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
        })
        await response.json()
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

<style scoped>
.suggestion-item {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 0.6rem;
  margin-bottom: 0.75rem;
  min-width: 0;
}

.suggestion-avatar {
  flex-shrink: 0;
}

.suggestion-user {
  min-width: 0;
}

.suggestion-name,
.suggestion-handle {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.suggestion-action {
  min-width: 76px;
  justify-self: end;
}

@media (max-width: 1199.98px) {
  .suggestion-handle {
    display: none !important;
  }
}

@media (max-width: 991.98px) {
  .suggestion-item {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .suggestion-avatar {
    display: none;
  }

  .suggestion-action {
    min-width: 70px;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}
</style>
