<script setup>
  import NavBar from '../components/navBarComponent.vue'
  import Footer from '../components/footerComponent.vue'
</script>

<template>
  <!-- Edit Profile Section -->
  <NavBar></NavBar>

  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <h2 class="text-center mb-4">Edit Profile</h2>
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
                v-if="gender == 'other'"
                src="../assets/img/profile_other.png"
                class="rounded-circle mb-2"
                alt="User Profile"
                width="150"
                height="150"
              />
            </div>

            <!-- Profile Form -->
            <form @submit="submitUpdate">
              <div class="mb-3">
                <label for="email" class="form-label">Email Address</label>
                <input
                  v-model="email"
                  type="email"
                  class="form-control"
                  id="email"
                  placeholder="Enter your email"
                  disabled
                />
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  v-model="password"
                  type="password"
                  class="form-control"
                  id="password"
                  placeholder="Enter your password"
                  required
                />
                <p class="text-danger" v-if="errors.password">{{ errors.password }}</p>
              </div>

              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input
                  v-model="username"
                  type="text"
                  class="form-control"
                  id="username"
                  placeholder="Enter your username"
                  required
                />
                <p class="text-danger" v-if="errors.username">{{ errors.username }}</p>
              </div>

              <div class="mb-3">
                <label for="age" class="form-label">Age</label>
                <input
                  v-model="age"
                  type="number"
                  class="form-control"
                  id="age"
                  placeholder="Enter your age"
                  required
                />
                <p class="text-danger" v-if="errors.age">{{ errors.age }}</p>
              </div>

              <div class="mb-3">
                <label for="gender" class="form-label">Gender</label>
                <select v-model="gender" class="form-select" id="gender">
                  <option selected value="">Select your gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <p class="text-danger" v-if="errors.gender">{{ errors.gender }}</p>
              </div>

              <div class="mb-3">
                <label for="birthday" class="form-label">Birthday</label>
                <input v-model="birthday" type="date" class="form-control" id="birthday" />
                <p class="text-danger" v-if="errors.birthday">{{ errors.birthday }}</p>
              </div>

              <div class="mb-3">
                <label for="bio" class="form-label">Bio</label>
                <textarea
                  v-model="bio"
                  class="form-control"
                  id="bio"
                  rows="3"
                  placeholder="Write something about yourself..."
                ></textarea>
                <p class="text-danger" v-if="errors.bio">{{ errors.bio }}</p>
              </div>

              <button type="submit" class="btn btn-primary w-100 mb-1">Save Changes</button>
            </form>
            <button @click="deleteAccount()" class="btn btn-danger w-100">Delete account</button>
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
      email: '',
      password: '',
      username: '',
      age: '',
      gender: '',
      birthday: '',
      bio: '',
      errors: {
        password: '',
        username: '',
        age: '',
        gender: '',
        birthday: '',
        bio: '',
        general: '',
      },
    }
  },
  methods: {
    async submitUpdate(e) {
      e.preventDefault()

      this.validate()
      if (Object.keys(this.errors).length === 0) {
        this.sendRequest()
      }
    },

    validate() {
      this.errors = {}

      if (!this.password) {
        this.errors.password = 'Password is required.'
      }
      if (this.password.length < 8) {
        this.errors.password = 'The password must be at least 8 characters.'
      }

      if (!this.username) {
        this.errors.username = 'Username is required.'
      } else if (this.username.length < 5) {
        this.errors.username = 'Username must be at least 5 characters.'
      }

      if (!this.age) {
        this.errors.age = 'Age is required.'
      } else if (this.age < 18) {
        this.errors.age = 'You must be at least 18 years old.'
      } else if (this.age > 200) {
        this.errors.age = 'You must be less than 200 years old.'
      }

      if (bio.length > 200) {
        this.errors.bio = 'Bio must be less than 200 characters.'
      }
    },

    async sendRequest() {
      try {
        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            password: this.password,
            username: this.username,
            age: this.age,
            gender: this.gender,
            birthday: this.birthday,
            bio: this.bio,
          }),
        })
        const data = await response.json()
        alert(data.message)
      } catch (error) {
        console.log(error)
      }
    },

    async deleteAccount() {
      try {
        const response = await fetch('/api/user/profile', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${localStorage.getItem('token')}`,
          },
        })
        const data = await response.json()
        alert(data.message)
        this.$router.push('/login')
      } catch (error) {
        console.log(error)
      }
    },
  },

  async mounted() {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${localStorage.getItem('token')}`,
        },
      })
      const data = await response.json()
      this.email = data.email
      this.password = data.password
      this.username = data.username
      this.age = data.age
      this.gender = data.gender
      this.birthday = new Date(data.birthday).toISOString().split('T')[0]
      this.bio = data.bio
    } catch (error) {
      console.log(error)
    }
  },
}
</script>
