<script setup>
    import Footer from '../components/footerComponent.vue'
</script>

<template>
  <section>
    <div class="container py-5 h-100">
      <div class="row d-flex align-items-center justify-content-center h-100">
        <div class="col-md-8 col-lg-7 col-xl-6">
          <img src="../assets/img/citizen-removebg.png" class="img-fluid" alt="Phone image" />
        </div>
        <div class="col-md-7 col-lg-5 col-xl-5 offset-xl-1">
          <div class="card">
            <div class="card-body p-5">
              <h2 class="text-uppercase text-center mb-5 text-primary">Create an account</h2>

              <p class="text-danger" v-if="errors.general">{{ errors.general }}</p>

              <form @submit="registerSubmit">
                <div data-mdb-input-init class="form-outline mb-4">
                  <label class="form-label" for="usernameInput">Username:</label>
                  <input
                    type="text"
                    id="usernameInput"
                    class="form-control form-control-lg"
                    v-model="username"
                  />
                  <p class="text-danger" v-if="errors.username">{{ errors.username }}</p>
                </div>

                <div data-mdb-input-init class="form-outline mb-4">
                  <label class="form-label" for="emailInput">Email:</label>
                  <input
                    type="email"
                    id="emailInput"
                    class="form-control form-control-lg"
                    v-model="email"
                  />
                  <p class="text-danger" v-if="errors.email">{{ errors.email }}</p>
                </div>

                <div data-mdb-input-init class="form-outline mb-4">
                  <label class="form-label" for="ageInput">Age:</label>
                  <input
                    type="number"
                    id="ageInput"
                    class="form-control form-control-lg"
                    v-model="age"
                  />
                  <p class="text-danger" v-if="errors.age">{{ errors.age }}</p>
                </div>

                <div data-mdb-input-init class="form-outline mb-4">
                  <label class="form-label" for="passwordInput">Password:</label>
                  <input
                    type="password"
                    id="passwordInput"
                    class="form-control form-control-lg"
                    v-model="password"
                  />
                  <p class="text-danger" v-if="errors.password">{{ errors.password }}</p>
                </div>

                <div data-mdb-input-init class="form-outline mb-4">
                  <label class="form-label" for="repeatPasswordInput">Repeat your password:</label>
                  <input
                    type="password"
                    id="repeatPasswordInput"
                    class="form-control form-control-lg"
                    v-model="repeatPassword"
                  />
                  <p class="text-danger" v-if="errors.repeatPassword">
                    {{ errors.repeatPassword }}
                  </p>
                </div>

                <div class="form-check d-flex justify-content-center"></div>

                <div class="d-flex justify-content-center">
                  <input
                    type="submit"
                    value="Register"
                    data-mdb-button-init
                    data-mdb-ripple-init
                    class="btn btn-primary btn-lg btn-block"
                  />
                </div>

                <p class="text-center text-muted mt-5 mb-0">
                  Have already an account?

                  <router-link to="/login" class="fw-bold"> Login here </router-link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <Footer></Footer>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      email: '',
      age: '',
      password: '',
      repeatPassword: '',
      errors: {
        username: '',
        email: '',
        age: '',
        password: '',
        repeatPassword: '',
        general: '',
      },
    }
  },
  methods: {
    async registerSubmit(e) {
      e.preventDefault()

      this.validateInput(e)
      if (Object.keys(this.errors).length === 0) {
        await this.sendRequest()
      } else {
        return false
      }
    },
    validateInput() {
      this.errors = {}
      if (!this.username) {
        this.errors.username = 'Username is required'
      } else if (this.username.length < 5) {
        this.errors.username = 'Username must be at least 5 characters'
      }

      if (!this.email) {
        this.errors.email = 'Email is required'
      } else if (!/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(this.email)) {
        this.errors.email = 'Invalid email address'
      }

      if (!this.age) {
        this.errors.age = 'Age is required'
      } else if (this.age < 18) {
        this.errors.age = 'You must be at least 18 years old'
      } else if (this.age > 200) {
        this.errors.age = 'You must be at most 200'
      }

      if (!this.password) {
        this.errors.password = 'Password is required'
      } else if (this.password.length < 8) {
        this.errors.password = 'The password must be at least 8 characters'
      }

      if (!this.repeatPassword) {
        this.errors.repeatPassword = 'Repeat Password is required'
      } else if (this.password !== this.repeatPassword) {
        this.errors.repeatPassword = 'Passwords do not match'
      }
    },
    async sendRequest() {
      try {
        const response = await fetch('/api/user/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: this.username,
            email: this.email,
            age: this.age,
            password: this.password,
          }),
        })
        const data = await response.json()

        if (response.ok) {
          this.$router.push('/login')
        } else {
          this.errors.general = data.message
        }
      } catch (error) {
        console.log(error)
      }
    },
  },
}
</script>
