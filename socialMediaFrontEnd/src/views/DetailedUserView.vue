<script setup>
  import NavBar from '../components/navBarComponent.vue'
  import Footer from '../components/footerComponent.vue'
</script>

<template>

  <NavBar></NavBar>

  <!-- Edit Profile Section -->
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <h2 class="text-center mb-4">User Profile</h2>
        <div class="card">
          <div class="card-body">
            <!-- Profile Picture Update -->
            <div class="text-center mb-4">
              <img
                v-if="gender == 'male'"
                src="../assets/img/profile_male.png"
                class="rounded-circle mb-2"
                alt="User Profile"
                width="150"
                height="150"
              />
              <img
                v-if="gender == 'female'"
                src="../assets/img/profile_female.png"
                class="rounded-circle mb-2"
                alt="User Profile"
                width="150"
                height="150"
              />
              <img
                v-if="gender == 'other' || gender == undefined"
                src="../assets/img/profile_other.png"
                class="rounded-circle mb-2"
                alt="User Profile"
                width="150"
                height="150"
              />
            </div>

            <h4 class="text-center">{{ username }}</h4>
            <p class="text-center">Email: {{ email }}</p>
            <p class="text-center">Age: {{ age }}</p>
            <p class="text-center">{{ gender }}</p>
            <p class="text-center">{{ birthday }}</p>
            <p class="text-center">{{ bio }}</p>
            <div class="text-center">
              <button v-if="!isFriend" @click="follow(id)" class="btn btn-info w-30">
                Follow this user
              </button>
              <button v-if="isFriend" @click="unfollow(id)" class="btn btn-info w-30">
                Unfollow this user
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer></Footer>
</template>

<script>
export default {
  data() {
    return {
      id: '',
      email: '',
      password: '',
      username: '',
      age: '',
      gender: '',
      birthday: '',
      bio: '',
      isFriend: false,
    }
  },
  methods: {
    async getUser() {
      try {
        const response = await fetch(`/api/user/profile/${this.$route.params.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${localStorage.getItem('token')}`,
          },
        })
        const data = await response.json()
        this.id = data._id
        this.email = data.email
        this.username = data.username
        this.age = data.age
        this.gender = data.gender
        this.birthday = new Date(data.birthday).toISOString().split('T')[0]
        this.bio = data.bio
        this.isFriend = data.isFriend
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
        const data = await response.json()
        if (response.ok) {
          this.isFriend = true
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
          this.isFriend = false
        }
      } catch (error) {
        console.log(error)
      }
    },
  },
  async mounted() {
    await this.getUser()
  },
}
</script>
