<script setup>
import { io } from 'socket.io-client'
import { mapState } from 'vuex'
import { jwtDecode } from 'jwt-decode'
import Popup from './components/askForCallComponent.vue'
</script>

<template>
  <router-view v-if="$route.name === 'login'" @authenticated="connectSocket()"></router-view>
  <router-view v-else></router-view>

  <Popup
    :showPopup="showPopup"
    :roomId="roomId"
    :callId="callId"
    @acceptCall="acceptCall"
    @declineCall="declineCall"
  ></Popup>

  <div class="position-fixed bottom-0 end-0 p-3 toast-stack" aria-live="polite" aria-atomic="true">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast-notification bg-white border rounded-3 shadow-sm mb-2"
      role="status"
      @click="openChatFromToast(toast)"
    >
      <div class="d-flex align-items-start p-3">
        <div class="me-2">
          <i class="bi bi-chat-dots-fill text-primary"></i>
        </div>
        <div class="flex-grow-1">
          <strong class="d-block">{{ toast.title }}</strong>
          <small class="text-muted">{{ toast.body }}</small>
        </div>
        <button
          type="button"
          class="btn-close btn-sm ms-2"
          aria-label="Close"
          @click.stop="removeToast(toast.id)"
        ></button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showPopup: false,
      roomId: null,
      callId: null,
      socket: null,
      isConnecting: false,
      onSocketConnect: null,
      onSocketNotification: null,
      onSocketDisconnect: null,
      onSocketConnectError: null,
      onSocketStartCall: null,
      toasts: [],
      currentUserId: null,
    }
  },
  computed: {
    ...mapState(['isChattingView']),
  },
  methods: {
    acceptCall() {
      this.showPopup = false
    },
    declineCall() {
      this.showPopup = false
      if (this.socket) {
        this.socket.emit('decline call', this.roomId, this.callId)
      }
    },
    resolveCurrentUserId() {
      const token = localStorage.getItem('token')
      if (!token) {
        return null
      }

      try {
        const decoded = jwtDecode(token)
        return decoded?.id || null
      } catch (error) {
        return null
      }
    },
    showMessageToast(msg, roomId) {
      const senderName = msg?.senderId?.username || 'Someone'
      const content = (msg?.content || 'sent you a message').trim()
      const preview = content.length > 80 ? `${content.slice(0, 80)}...` : content
      const toastId = `${Date.now()}-${Math.random().toString(36).slice(2)}`

      const timeoutId = setTimeout(() => {
        this.removeToast(toastId, false)
      }, 4500)

      this.toasts.push({
        id: toastId,
        title: `New message from ${senderName}`,
        body: preview,
        senderName,
        roomId,
        timeoutId,
      })
    },
    removeToast(toastId, clearTimer = true) {
      const toast = this.toasts.find((item) => item.id === toastId)

      if (toast?.timeoutId && clearTimer) {
        clearTimeout(toast.timeoutId)
      }

      this.toasts = this.toasts.filter((item) => item.id !== toastId)
    },
    clearAllToastTimers() {
      this.toasts.forEach((toast) => {
        if (toast.timeoutId) {
          clearTimeout(toast.timeoutId)
        }
      })
    },
    openChatFromToast(toast) {
      this.removeToast(toast.id)

      if (!toast.roomId) {
        return
      }

      this.$router.push(`/chatting/room/${encodeURIComponent(toast.senderName)}/${toast.roomId}`)
    },
    handleNotification(msg, roomId) {
      if (!msg?.senderId?._id) {
        return
      }

      if (!this.currentUserId) {
        this.currentUserId = this.resolveCurrentUserId()
      }

      if (msg.senderId._id === this.currentUserId) {
        return
      }

      const viewingRoomId = this.$route?.params?.id
      const isViewingSameRoom = this.isChattingView && viewingRoomId && viewingRoomId === roomId

      if (isViewingSameRoom && document.visibilityState === 'visible') {
        return
      }

      if (document.visibilityState === 'hidden' && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('New message', {
          body: `${msg.senderId.username} sent you a message`,
          icon: '/favicon.ico',
          tag: 'new message',
        })

        return
      }

      this.showMessageToast(msg, roomId)
    },
    cleanupSocket() {
      if (!this.socket) {
        return
      }

      if (this.onSocketConnect) this.socket.off('connect', this.onSocketConnect)
      if (this.onSocketNotification) this.socket.off('notification', this.onSocketNotification)
      if (this.onSocketDisconnect) this.socket.off('disconnect', this.onSocketDisconnect)
      if (this.onSocketConnectError) this.socket.off('connect_error', this.onSocketConnectError)
      if (this.onSocketStartCall) this.socket.off('start call', this.onSocketStartCall)

      this.socket.disconnect()
      this.socket = null
      this.$store.commit('setSocket', null)
    },
    connectSocket() {
      const token = localStorage.getItem('token')

      if (!token) {
        return
      }

      if (this.socket && this.socket.connected) {
        return
      }

      if (this.isConnecting) {
        return
      }

      this.currentUserId = this.resolveCurrentUserId()
      this.isConnecting = true
      this.cleanupSocket()

      const newSocket = io({
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1500,
      })

      this.socket = newSocket
      this.$store.commit('setSocket', newSocket)

      this.onSocketConnect = () => {
        this.isConnecting = false
        this.socket.emit('join room')
      }

      this.onSocketNotification = (msg, roomId) => {
        this.handleNotification(msg, roomId)
      }

      this.onSocketDisconnect = () => {
        this.isConnecting = false
      }

      this.onSocketConnectError = (err) => {
        this.isConnecting = false
        console.error('Connection error:', err.message)
      }

      this.onSocketStartCall = (callId, roomId) => {
        this.showPopup = true
        this.roomId = roomId
        this.callId = callId
      }

      newSocket.on('connect', this.onSocketConnect)
      newSocket.on('notification', this.onSocketNotification)
      newSocket.on('disconnect', this.onSocketDisconnect)
      newSocket.on('connect_error', this.onSocketConnectError)
      newSocket.on('start call', this.onSocketStartCall)
    },
  },
  mounted() {
    if (localStorage.getItem('token') !== null) {
      this.connectSocket()
    }
  },
  unmounted() {
    this.clearAllToastTimers()
    this.cleanupSocket()
  },
}
</script>

<style scoped>
.toast-stack {
  z-index: 1100;
  max-width: min(92vw, 360px);
}

.toast-notification {
  cursor: pointer;
}
</style>



