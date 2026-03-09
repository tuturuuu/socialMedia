<template>
  <div class="card-body text-center">
    <img
      :src="profileImage || getDefaultProfileImageByGender(gender)"
      class="rounded-circle mb-3"
      alt="User Profile"
      width="100"
      height="100"
      style="object-fit: cover"
    />
    <h5 class="card-title">{{ username }}</h5>

    <p v-if="bio == null" class="card-text">Bio goes here...</p>
    <p v-if="bio !== null" class="card-text">{{ bio }}</p>

    <router-link to="/profile" class="btn btn-primary">Edit Profile</router-link>
  </div>
</template>

<script>
const maleProfileImage = new URL('../assets/img/profile_male.png', import.meta.url).href
const femaleProfileImage = new URL('../assets/img/profile_female.png', import.meta.url).href
const otherProfileImage = new URL('../assets/img/profile_other.png', import.meta.url).href

export default {
  data() {
    return {
      username: '',
      bio: '',
      gender: '',
      profileImage: '',
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
      this.profileImage = data.profileImage || ''
    } catch (error) {
      console.log(error)
    }
  },
}
</script>
