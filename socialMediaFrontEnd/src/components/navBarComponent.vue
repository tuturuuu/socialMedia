<template>
  <!-- Navbar -->
  <nav class="navbar navbar-expand-lg">
    <div class="container">
      <a class="navbar-brand ms-2" href="/">
        <img
          id="MDB-logo"
          src="../assets/img/logo.png"
          alt="MDB Logo"
          draggable="false"
          height="30"
        />
      </a>

      <!-- Toggle button for mobile view -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav ms-auto align-items-center">
          <li class="nav-item">
            <router-link class="nav-link mx-2" to="/profile">
              <i class="fas fa-plus-circle pe-2">Profile</i>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link mx-2" to="/">
              <i class="fas fa-plus-circle pe-2">Post</i>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link mx-2" to="/chatting">
              <i class="fas fa-comments pe-2">Chatting</i>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link mx-2" @click="logout" to="">
              <i class="fas fa-sign-out-alt pe-2">Sign out</i>
            </router-link>
          </li>
          <li class="nav-item">
            <button v-if="theme === 'light'" class="btn btn-outline-primary" @click="changeTheme()">
              <i class="bi bi-moon-fill"></i>
            </button>
            <button v-else class="btn bg-info bg-opacity-75" @click="changeTheme()">
              <i class="bi bi-sun-fill"></i>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <!-- Navbar -->
</template>

<script>
export default {
  data() {
    return {
      theme: 'light',
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('token')
      this.$emit('authenticated', false)
      this.$router.push('/login')
    },

    changeTheme() {
      const body = document.body
      body.setAttribute(
        'data-bs-theme',
        document.body.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark',
      )
      this.theme = body.getAttribute('data-bs-theme')
    },
  },
}
</script>
