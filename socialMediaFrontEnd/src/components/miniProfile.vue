<template>
  <!-- Sidebar - Profile & Trends -->
  <!-- Profile Section -->
  <div class="card-body text-center">
    <img
      v-if="gender == 'male'"
      src="../assets/img/profile_male.png"
      class="rounded-circle mb-3"
      alt="User Profile"
      width="100"
      height="100"
    />
    <img
      v-if="gender == 'female'"
      src="../assets/img/profile_female.png"
      class="rounded-circle mb-3"
      alt="User Profile"
      width="100"
      height="100"
    />
    <img
      v-if="gender == 'other' || gender == undefined"
      src="../assets/img/profile_other.png"
      class="rounded-circle mb-3"
      alt="User Profile"
      width="100"
      height="100"
    />
    <h5 class="card-title">{{ username }}</h5>

    <p v-if="bio == null" class="card-text">Bio goes here...</p>
    <p v-if="bio !== null" class="card-text">{{ bio }}</p>

    <router-link to="/profile" class="btn btn-primary">Edit Profile</router-link>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      bio: '',
      gender: '',
    }
  },
  async mounted() {
    const token = localStorage.getItem('token')
    if (token == null) {
      this.$router.push('/login')
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${localStorage.getItem('token')}`,
        },
      })
      const data = await response.json()
      this.username = data.username
      this.bio = data.bio
      this.gender = data.gender
    } catch (error) {
      console.log(error)
    }
  },
}
</script>
