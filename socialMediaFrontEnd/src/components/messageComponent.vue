<script setup>
import { jwtDecode } from 'jwt-decode'
</script>

<template>
  <div
    class="col-12 col-md-8 col-lg-9 d-flex flex-column chat-shell"
    ref="chatView"
    id="chatView"
  >
    <div class="border-bottom p-3 d-flex align-items-center position-sticky top-0 bg-white" style="z-index: 1">
      <img
        src="../assets/img/profile_other.png"
        class="rounded-circle me-3"
        alt="Chatting with"
        width="40"
        height="40"
        style="object-fit: cover"
      />
      <h5 class="mb-0">{{ $route.params.name }}</h5>

      <button class="ms-auto btn-lg btn text-primary hover-btn rounded-circle" @click="startVideoCall()">
        <i class="bi bi-camera-video-fill"></i>
      </button>
    </div>

    <div class="flex-grow-1 p-3 chat-area" id="chatArea" ref="chatArea">
      <div v-if="isLoadingMessages" class="h-100 d-flex flex-column justify-content-center align-items-center">
        <div class="spinner-border text-primary" role="status" aria-label="Loading messages">
          <span class="visually-hidden">Loading...</span>
        </div>
        <small class="text-muted mt-2">Loading messages...</small>
      </div>

      <template v-else>
        <template v-for="message in messages" :key="message._id || `${message.createdAt}-${message.content}`">
          <div class="d-flex align-items-start mb-2" v-if="message.senderId?._id !== id">
            <img
              :src="getUserAvatar(message.senderId)"
              class="rounded-circle me-3"
              alt="User Profile"
              width="40"
              height="40"
              style="object-fit: cover"
            />
            <div class="p-3 bg-body-secondary rounded-3">
              <p class="mb-0">
                <strong>{{ message.senderId?.username || 'Unknown user' }}</strong
                >: {{ message.content }}
              </p>
              <small class="text-muted">{{
                new Date(message.createdAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }}</small>
            </div>
          </div>

          <div class="d-flex align-items-end flex-row-reverse mb-2" v-else>
            <img
              :src="getUserAvatar(message.senderId)"
              class="rounded-circle me-3"
              alt="User Profile"
              width="40"
              height="40"
              style="object-fit: cover"
            />
            <div class="p-3 bg-primary text-white rounded-3">
              <p class="mb-0"><strong>Me</strong>: {{ message.content }}</p>
              <small class="text-white-50">{{
                new Date(message.createdAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }}</small>
            </div>
          </div>
        </template>
      </template>
    </div>

    <div class="border-top p-3 mt-auto bg-white">
      <form class="d-flex" @submit="emitMessage">
        <input
          type="text"
          class="form-control me-2"
          placeholder="Type a message"
          v-model="inputMessage"
        />
        <button type="submit" class="btn btn-primary">Send</button>
      </form>
    </div>
  </div>
</template>

<script>
const maleProfileImage = new URL('../assets/img/profile_male.png', import.meta.url).href
const femaleProfileImage = new URL('../assets/img/profile_female.png', import.meta.url).href
const otherProfileImage = new URL('../assets/img/profile_other.png', import.meta.url).href

export default {
  data() {
    return {
      inputMessage: '',
      messages: [],
      socket: null,
      id: jwtDecode(localStorage.getItem('token')).id,
      socketRetryTimer: null,
      chatMessageHandler: null,
      chatInitHandler: null,
      socketConnectHandler: null,
      listenersBound: false,
      isLoadingMessages: true,
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
    getUserAvatar(user) {
      if (user?.profileImage) {
        return user.profileImage
      }

      return this.getDefaultProfileImageByGender(user?.gender)
    },
    readCurrentRoom() {
      if (this.socket && this.$route.params.id) {
        this.isLoadingMessages = true
        this.socket.emit('read room', this.$route.params.id)
      }
    },
    bindSocketListeners() {
      if (!this.socket || this.listenersBound) {
        return
      }

      this.chatMessageHandler = (msg, roomId) => {
        if (roomId === this.$route.params.id) {
          this.messages.push(msg)
        }
      }

      this.chatInitHandler = (msg) => {
        this.messages = msg
        this.isLoadingMessages = false
      }

      this.socketConnectHandler = () => {
        this.readCurrentRoom()
      }

      this.socket.on('chat message', this.chatMessageHandler)
      this.socket.on('chat init', this.chatInitHandler)
      this.socket.on('connect', this.socketConnectHandler)
      this.listenersBound = true
    },
    unbindSocketListeners() {
      if (!this.socket || !this.listenersBound) {
        return
      }

      if (this.chatMessageHandler) this.socket.off('chat message', this.chatMessageHandler)
      if (this.chatInitHandler) this.socket.off('chat init', this.chatInitHandler)
      if (this.socketConnectHandler) this.socket.off('connect', this.socketConnectHandler)

      this.listenersBound = false
    },
    initChatSocket() {
      this.socket = this.$store.getters.getSocket

      if (!this.socket) {
        this.socketRetryTimer = setTimeout(() => {
          this.initChatSocket()
        }, 200)
        return
      }

      this.bindSocketListeners()
      this.readCurrentRoom()
    },
    emitMessage(e) {
      e.preventDefault()
      if (this.inputMessage && this.socket) {
        this.socket.emit('chat message', this.inputMessage, this.id, this.$route.params.id)
        this.inputMessage = ''
      }
    },
    async startVideoCall() {
      const response = await fetch(`/api/room/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
      })
      const data = await response.json()

      if (this.socket) {
        this.socket.emit('start call', data.roomId, this.$route.params.id)
      }

      this.$router.push(`/call/${this.$route.params.id}/${data.roomId}`)
    },
  },
  async mounted() {
    this.initChatSocket()
  },
  unmounted() {
    if (this.socketRetryTimer) {
      clearTimeout(this.socketRetryTimer)
    }

    this.unbindSocketListeners()
  },
  updated() {
    const chatArea = this.$refs.chatArea
    if (chatArea && chatArea.scrollHeight > chatArea.offsetHeight) {
      chatArea.scrollTop = chatArea.scrollHeight
    }
  },
}
</script>

<style scoped>
.chat-shell {
  height: 80vh;
  min-height: 0;
}

.chat-area {
  overflow-y: auto;
  min-height: 0;
}
</style>


