<script setup>
import NavBar from '../components/navBarComponent.vue'
import Footer from '../components/footerComponent.vue'
</script>

<template>
  <NavBar></NavBar>

  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <h2 class="text-center mb-4">Edit Profile</h2>
        <div class="card">
          <div class="card-body">
            <div class="text-center mb-4">
              <img
                :src="profileImageSrc"
                class="rounded-circle mb-2"
                alt="User Profile"
                width="150"
                height="150"
                style="object-fit: cover"
              />

              <div class="mt-2">
                <input
                  class="form-control"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  @change="handleImageSelected"
                />
                <small class="text-muted d-block mt-1">
                  Image is auto center-cropped to a square profile photo.
                </small>
                <button @click="uploadProfileImage" type="button" class="btn btn-outline-primary mt-2">
                  Upload New Image
                </button>
                <p class="text-danger mb-0 mt-2" v-if="imageError">{{ imageError }}</p>
              </div>
            </div>

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
const maleProfileImage = new URL('../assets/img/profile_male.png', import.meta.url).href
const femaleProfileImage = new URL('../assets/img/profile_female.png', import.meta.url).href
const otherProfileImage = new URL('../assets/img/profile_other.png', import.meta.url).href

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
      profileImage: '',
      selectedImageData: '',
      selectedImagePreview: '',
      imageError: '',
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
  computed: {
    profileImageSrc() {
      if (this.selectedImagePreview) {
        return this.selectedImagePreview
      }

      if (this.profileImage) {
        return this.profileImage
      }

      return this.getDefaultProfileImageByGender()
    },
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

      if (this.bio && this.bio.length > 200) {
        this.errors.bio = 'Bio must be less than 200 characters.'
      }
    },

    getDefaultProfileImageByGender() {
      if (this.gender === 'male') {
        return maleProfileImage
      }

      if (this.gender === 'female') {
        return femaleProfileImage
      }

      return otherProfileImage
    },

    async cropImageToSquare(file) {
      const imageUrl = URL.createObjectURL(file)

      try {
        const loadedImage = await new Promise((resolve, reject) => {
          const image = new Image()
          image.onload = () => resolve(image)
          image.onerror = () => reject(new Error('Could not load image.'))
          image.src = imageUrl
        })

        const sourceSize = Math.min(loadedImage.width, loadedImage.height)
        const sourceX = Math.floor((loadedImage.width - sourceSize) / 2)
        const sourceY = Math.floor((loadedImage.height - sourceSize) / 2)

        const canvas = document.createElement('canvas')
        canvas.width = 512
        canvas.height = 512

        const context = canvas.getContext('2d')
        context.drawImage(
          loadedImage,
          sourceX,
          sourceY,
          sourceSize,
          sourceSize,
          0,
          0,
          canvas.width,
          canvas.height,
        )

        return canvas.toDataURL('image/jpeg', 0.92)
      } finally {
        URL.revokeObjectURL(imageUrl)
      }
    },

    async handleImageSelected(event) {
      this.imageError = ''
      const selectedFile = event.target.files?.[0]

      if (!selectedFile) {
        return
      }

      if (selectedFile.size > 8 * 1024 * 1024) {
        this.imageError = 'Image must be 8MB or smaller.'
        this.selectedImageData = ''
        this.selectedImagePreview = ''
        return
      }

      try {
        const croppedImage = await this.cropImageToSquare(selectedFile)
        this.selectedImageData = croppedImage
        this.selectedImagePreview = croppedImage
      } catch (error) {
        this.imageError = 'Could not process this image file.'
        this.selectedImageData = ''
        this.selectedImagePreview = ''
      }
    },

    async uploadProfileImage() {
      this.imageError = ''

      if (!this.selectedImageData) {
        this.imageError = 'Please choose an image first.'
        return
      }

      try {
        const response = await fetch('/api/user/profile/image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            imageData: this.selectedImageData,
          }),
        })

        const data = await response.json()
        if (!response.ok) {
          this.imageError = data.message || 'Failed to upload image.'
          return
        }

        this.profileImage = data.profileImage
        this.selectedImageData = ''
        this.selectedImagePreview = ''
      } catch (error) {
        this.imageError = 'Upload failed. Please try again.'
        console.log(error)
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
      this.birthday = data.birthday ? new Date(data.birthday).toISOString().split('T')[0] : ''
      this.bio = data.bio
      this.profileImage = data.profileImage || ''
    } catch (error) {
      console.log(error)
    }
  },
}
</script>
