<script setup>
    import Footer from '../components/footerComponent.vue'
</script>

<template>
  <section>
    <div class="container py-5 h-100">
      <div class="row d-flex align-items-center justify-content-center h-100">
        <div class="col-md-8 col-lg-7 col-xl-6">
          <img src="../assets/img/auth-banner.png" class="img-fluid" alt="Phone image" />
        </div>
        <div class="col-md-7 col-lg-5 col-xl-5 offset-xl-1">
          <form @submit="loginSubmit">
            <!-- Email input -->
            <div data-mdb-input-init class="form-outline mb-4">
              <label class="form-label" for="emailInput">Email address:</label>
              <input
                type="email"
                id="emailInput"
                class="form-control form-control-lg"
                v-model="emailInput"
              />
              <p class="text-danger" v-if="errors.emailInput">{{ errors.emailInput }}</p>
            </div>

            <!-- Password input -->
            <div data-mdb-input-init class="form-outline mb-4">
              <label class="form-label" for="passwordInput">Password:</label>
              <input
                type="password"
                id="passwordInput"
                class="form-control form-control-lg"
                v-model="passwordInput"
              />
              <p class="text-danger" v-if="errors.passwordInput">{{ errors.passwordInput }}</p>
            </div>

            <div class="d-flex justify-content-around align-items-center mb-4">
              <!-- Checkbox -->
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  value=""
                  id="rememberMe"
                  v-model="rememberMe"
                  checked
                />
                <label class="form-check-label" for="rememberMe"> Remember me </label>
              </div>
              <a href="#!">Forgot password?</a>
            </div>

            <p class="text-danger" v-if="errors.general">{{ errors.general }}</p>
            <!-- Submit button -->
            <button
              type="submit"
              data-mdb-button-init
              data-mdb-ripple-init
              class="btn btn-primary btn-lg btn-block"
            >
              Sign in
            </button>

            <div class="divider d-flex align-items-center my-4">
              <p class="text-center fw-bold mx-3 mb-0 text-muted">OR</p>
            </div>

            <router-link to="/register" class="fs-5"> Register </router-link>
          </form>
        </div>
      </div>
    </div>
  </section>

  <Footer></Footer>
</template>

<script>
export default {
  emits: ['authenticated'],
  data() {
    return {
      emailInput: '',
      passwordInput: '',
      rememberMe: true,
      errors: {
        emailInput: '',
        passwordInput: '',
        general: '',
      },
    }
  },

  methods: {
    async loginSubmit(e) {
      e.preventDefault()
      this.validate()
      if (Object.keys(this.errors).length === 0) {
        await this.sendRequest()
      } else {
        return false
      }
    },

    validate() {
      this.errors = {}
      if (!this.emailInput) {
        this.errors.emailInput = 'Email is required'
      } else if (!/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(this.emailInput)) {
        this.errors.emailInput = 'Invalid email address'
      }

      if (!this.passwordInput) {
        this.errors.passwordInput = 'Password is required'
      } else if (this.passwordInput.length < 8) {
        this.errors.passwordInput = 'The password must be at least 8 characters'
      }
    },

    async sendRequest() {
      try {
        const response = await fetch('/api/user/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: this.emailInput,
            password: this.passwordInput,
          }),
        })
        const data = await response.json()
        if (response.ok) {
          localStorage.setItem('token', data.token)
          this.$emit('authenticated')
          this.$router.push('/')
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
