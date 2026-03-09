<script setup>
import NavBar from '../components/navBarComponent.vue'
import Footer from '../components/footerComponent.vue'
</script>

<template>
  <div class="row">
    <NavBar></NavBar>

    <div class="col-md-4 col-lg-3 border-end d-md-flex flex-column">
      <h4 class="text-center py-3">Contacts</h4>

      <button class="btn btn-primary d-md-none d-block mx-auto mb-3" @click="showContacts = !showContacts">
        <i class="bi" :class="{ 'bi-arrow-bar-up': showContacts, 'bi-arrow-bar-down': !showContacts }"></i>
      </button>

      <div v-if="rooms.length === 0" class="alert alert-warning text-center" role="alert">
        You haven't followed any users yet. Go to the posts page and follow users to start chatting.
      </div>
      <div class="list-group overflow-auto" v-for="room in rooms" v-if="showContacts && rooms.length > 0" :key="room._id">
        <router-link
          :to="`/chatting/room/${getContactName(room)}/${room._id}`"
          class="list-group-item list-group-item-action d-flex align-items-center"
        >
          <img
            :src="getRoomAvatar(room)"
            width="40"
            height="40"
            class="rounded-circle me-3"
            alt="User"
            style="object-fit: cover"
          />
          <div>
            <h6 class="mb-0">{{ getContactName(room) }}</h6>
            <small class="text-muted">{{ getLastMessageSnippet(room) }}</small>
          </div>
        </router-link>
      </div>
    </div>

    <router-view :key="$route.fullPath"></router-view>
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
      showContacts: true,
      rooms: [],
      socket: null,
      socketRetryTimer: null,
      chatMessageHandler: null,
      socketConnectHandler: null,
      listenersBound: false,
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
    getContactName(room) {
      return room?.otherUser?.username || room?.name || 'Chat'
    },
    getRoomAvatar(room) {
      const user = room?.otherUser

      if (user?.profileImage) {
        return user.profileImage
      }

      return this.getDefaultProfileImageByGender(user?.gender)
    },
    getLastMessageSnippet(room) {
      if (!room?.lastMessage?.content) {
        return 'No messages yet'
      }

      const content = room.lastMessage.content.trim()
      return content.length > 45 ? `${content.slice(0, 45)}...` : content
    },
    async fetchRooms() {
      try {
        const response = await fetch('/api/room/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
        })
        const data = await response.json()
        this.rooms = data
      } catch (error) {
        console.log(error)
      }
    },
    updateRoomLastMessage(roomId, message) {
      const roomIndex = this.rooms.findIndex((room) => room._id === roomId)
      if (roomIndex === -1) {
        return
      }

      const updatedRoom = {
        ...this.rooms[roomIndex],
        lastMessage: message,
      }

      this.rooms = [updatedRoom, ...this.rooms.filter((room) => room._id !== roomId)]
    },
    bindSocketListeners() {
      if (!this.socket || this.listenersBound) {
        return
      }

      this.chatMessageHandler = (msg, roomId) => {
        this.updateRoomLastMessage(roomId, msg)
      }

      this.socketConnectHandler = () => {
        this.fetchRooms()
      }

      this.socket.on('chat message', this.chatMessageHandler)
      this.socket.on('connect', this.socketConnectHandler)
      this.listenersBound = true
    },
    unbindSocketListeners() {
      if (!this.socket || !this.listenersBound) {
        return
      }

      if (this.chatMessageHandler) this.socket.off('chat message', this.chatMessageHandler)
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
    },
  },
  unmounted() {
    if (this.socketRetryTimer) {
      clearTimeout(this.socketRetryTimer)
    }

    this.unbindSocketListeners()
    this.$store.commit('setIsChattingView', false)
  },
  async mounted() {
    this.$store.commit('setIsChattingView', true)
    this.initChatSocket()
    await this.fetchRooms()

    if (this.rooms.length > 0 && !this.$route.params.id) {
      this.$router.push(`/chatting/room/${this.getContactName(this.rooms[0])}/${this.rooms[0]._id}`)
    }
  },
}
</script>
