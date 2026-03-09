<script>
import { io } from 'socket.io-client'

export default {
  data() {
    return {
      video: null,
      peerVideo: null,
      peer: null,
      socket: null,
      peers: {},
      localStream: null,
      isMuted: false,
      isCameraOff: false,
      hasEnded: false,
      onUserConnected: null,
      onUserDisconnected: null,
      onInvalidCall: null,
      onDeclineCall: null,
      onCallPeers: null,
    }
  },
  methods: {
    addVideoStream(stream, videoElement) {
      if (!videoElement) return
      videoElement.srcObject = stream
      videoElement.onloadedmetadata = () => {
        const playPromise = videoElement.play()
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {})
        }
      }
    },
    clearPeerVideo() {
      if (this.peerVideo) {
        this.peerVideo.srcObject = null
      }
    },
    placeCallToPeer(userId, stream) {
      if (!userId || this.peers[userId]) return

      const call = this.peer.call(userId, stream)
      this.peers[userId] = call

      call.on('stream', (userVideoStream) => {
        this.addVideoStream(userVideoStream, this.peerVideo)
      })

      call.on('close', () => {
        this.clearPeerVideo()
        delete this.peers[userId]
      })
    },
    toggleMute() {
      if (!this.localStream) return
      this.isMuted = !this.isMuted
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !this.isMuted
      })
    },
    toggleCamera() {
      if (!this.localStream) return
      this.isCameraOff = !this.isCameraOff
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = !this.isCameraOff
      })
    },
    endCall(showAlert = false, shouldNavigate = true) {
      if (this.hasEnded) return
      this.hasEnded = true

      Object.values(this.peers).forEach((peerCall) => {
        if (peerCall) peerCall.close()
      })
      this.peers = {}

      if (this.socket) {
        this.socket.emit('leave call')
      }

      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop())
      }

      if (this.peer) {
        this.peer.destroy()
      }

      this.clearPeerVideo()

      if (showAlert) {
        alert('Call ended')
      }

      if (shouldNavigate) {
        this.$router.back()
      }
    },
    bindSocketEvents(stream) {
      this.onUserConnected = (userId) => {
        this.placeCallToPeer(userId, stream)
      }

      this.onCallPeers = (peerIds) => {
        if (!Array.isArray(peerIds)) return
        peerIds.forEach((peerId) => this.placeCallToPeer(peerId, stream))
      }

      this.onUserDisconnected = (userId) => {
        if (this.peers[userId]) {
          this.peers[userId].close()
          delete this.peers[userId]
        }
        this.endCall(true, true)
      }

      this.onInvalidCall = (message) => {
        console.error(message)
        this.endCall(false, true)
      }

      this.socket.on('user-connected', this.onUserConnected)
      this.socket.on('call-peers', this.onCallPeers)
      this.socket.on('user-disconnected', this.onUserDisconnected)
      this.socket.on('Invalid', this.onInvalidCall)
    },
    async initializeCall() {
      this.socket = io({
        auth: {
          token: localStorage.getItem('token'),
        },
      })

      this.peer = new Peer()
      const peerIdPromise = new Promise((resolve, reject) => {
        this.peer.on('open', resolve)
        this.peer.on('error', reject)
      })

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })

        this.localStream = stream
        this.video.muted = true
        this.addVideoStream(stream, this.video)

        this.peer.on('call', (call) => {
          call.answer(stream)
          this.peers[call.peer] = call

          call.on('stream', (userVideoStream) => {
            this.addVideoStream(userVideoStream, this.peerVideo)
          })

          call.on('close', () => {
            this.clearPeerVideo()
            delete this.peers[call.peer]
          })
        })

        this.bindSocketEvents(stream)

        const peerId = await peerIdPromise
        this.socket.emit('join-call', this.$route.params.callId, this.$route.params.roomId, peerId)
      } catch (error) {
        console.error(error)
        alert('Could not access camera or microphone.')
        this.endCall(false, true)
      }
    },
    cleanupListeners() {
      if (!this.socket) return
      if (this.onUserConnected) this.socket.off('user-connected', this.onUserConnected)
      if (this.onCallPeers) this.socket.off('call-peers', this.onCallPeers)
      if (this.onUserDisconnected) this.socket.off('user-disconnected', this.onUserDisconnected)
      if (this.onInvalidCall) this.socket.off('Invalid', this.onInvalidCall)
    },
  },
  unmounted() {
    this.cleanupListeners()
    this.endCall(false, false)
    const appSocket = this.$store.getters.getSocket
    if (appSocket && this.onDeclineCall) {
      appSocket.off('decline call', this.onDeclineCall)
    }
  },
  mounted() {
    const appSocket = this.$store.getters.getSocket
    if (appSocket) {
      this.onDeclineCall = () => {
        alert('Call declined')
        this.endCall(false, true)
      }
      appSocket.off('decline call')
      appSocket.on('decline call', this.onDeclineCall)
    }

    this.video = this.$refs.localVideo
    this.peerVideo = this.$refs.peerVideo
    this.initializeCall()
  },
}
</script>

<template>
  <div id="video-grid">
    <video ref="localVideo" playsinline autoplay muted></video>
    <video ref="peerVideo" class="peerVideo" playsinline autoplay></video>

    <div class="call-controls">
      <button class="btn btn-light btn-lg" @click="toggleMute">
        <i class="bi" :class="isMuted ? 'bi-mic-mute-fill' : 'bi-mic-fill'"></i>
      </button>

      <button class="btn btn-light btn-lg" @click="toggleCamera">
        <i class="bi" :class="isCameraOff ? 'bi-camera-video-off-fill' : 'bi-camera-video-fill'"></i>
      </button>

      <button class="btn btn-danger btn-lg" @click="endCall">
        <i class="bi bi-telephone-x-fill"></i>
      </button>
    </div>
  </div>
</template>

<style>
#video-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

.peerVideo {
  position: absolute;
  bottom: 24px;
  right: 24px;
  width: min(34vw, 360px);
  height: min(24vw, 220px);
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background: #111;
}

.call-controls {
  position: absolute;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 5;
}
</style>


