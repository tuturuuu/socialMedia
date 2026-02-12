<script setup>
import { io } from 'socket.io-client';
import { mapState } from 'vuex';
import Popup from './components/askForCallComponent.vue';
</script>

<template>
  <router-view v-if="$route.name === 'login' " @authenticated="connectSocket()"></router-view>
  <router-view v-else></router-view>

  <Popup
    :showPopup="showPopup"
    :roomId="roomId"
    :callId="callId"
    @acceptCall="acceptCall"
    @declineCall="declineCall"
  ></Popup>
</template>

<script>
export default {
  data() {
    return {
      showPopup: false,
      roomId: null,
      callId: null,
      socket: null,
      reconnectAttempts: 0,
      token: localStorage.getItem('token'),
    };
  },
  computed: {
    ...mapState(['isChattingView']),
  },
  methods: {
    acceptCall() {
      this.showPopup = false;
    },
    declineCall() {
      this.showPopup = false;
      if (this.socket) {
        this.socket.emit('decline call', this.roomId, this.callId);
      }
    },
    handleNotification(msg) {
      if (document.visibilityState === 'hidden' || !this.isChattingView) {
        new Notification('New message', {
          body: `${msg.senderId.username} sent you a message`,
          icon: '/favicon.ico',
          tag: 'new message',
        });
        return;
      }
    },
    connectSocket() {

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token not found. Retrying in 1 second...');
        setTimeout(() => {
          this.connectSocket();
        }, 1000); // Retry after 1 second
        return;
      }

      // Initialize socket connection
      this.socket = io({
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      // Commit socket to Vuex
      this.$store.commit('setSocket', this.socket);

      // Event listeners
      this.socket.on('connect', () => {
        console.log('Connected to server!');
        this.socket.emit('join room');
      });

      this.socket.on('notification', (msg) => {
        this.handleNotification(msg);
      });

      this.socket.on('disconnect', () => {
        console.warn('Disconnected from server.');
      });

      this.socket.on('connect_error', (err) => {
        console.error('Connection error:', err.message);
        if (this.$route.name !== 'login' && this.$route.name !== 'register') {
          alert(err.message);
        }
      });

      this.socket.on('start call', (callId, roomId) => {
        this.showPopup = true;
        this.roomId = roomId;
        this.callId = callId;
      });
    },
  },
  mounted() {
    if(localStorage.getItem('token') !== null) {
      this.connectSocket();      
    }
  },


};
</script>
