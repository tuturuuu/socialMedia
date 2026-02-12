<script setup>

import { io } from 'socket.io-client';

</script>

<template>
    <div id="video-grid">
        <video ref="localVideo"></video>
        <video ref="peerVideo" class="peerVideo"></video>
        <button class="btn btn-primary position-absolute bottom-0 start-50 mb-5 btn-lg" @click="mute">
            <i class="bi bi-mic-mute" v-if="!isMuted"></i>
            <i class="bi bi-mic" v-else></i>
        </button>
    </div>
</template>

<style>
#video-grid {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: grid;
    grid-template-rows: 1fr auto;
    grid-template-columns: 1fr auto;
}

video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scaleX(-1);
}

.peerVideo {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 400px;
    height: 250px;
    border-radius: 4%;
}
</style>

<script>
export default {
    data() {
        return {
            video: null,
            peerVideo: null,
            peer: null,
            socket: null,
            peers: {},
            localStream: null,
            isMuted: false
        }
    },
    methods: {
        addVideoStream(stream, videoElement) {
            videoElement.srcObject = stream;
            videoElement.addEventListener('loadedmetadata', () => {
                videoElement.play();
            });
        },
        mute() {
            if (this.localStream) {
                this.localStream.getAudioTracks().forEach((track) => {
                    track.enabled = this.isMuted; // Toggle the audio track
                });
                this.isMuted = !this.isMuted; // Update state
            }
        },
        initializeCall() {
            this.socket = io({
                auth: {
                    token: localStorage.getItem('token'),
                },
            })

            this.peer = new Peer();

            this.peer.on('open', id => {
                
                this.socket.emit('join-call', this.$route.params.callId, this.$route.params.roomId, id)
            })

            this.video.muted = true;

            navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            }).then((stream) => {
                this.localStream = stream;
                this.addVideoStream(stream, this.video);

                this.peer.on('call', (call) => {
                    call.answer(stream);

                    call.on('stream', (userVideoStream) => {
                        this.addVideoStream(userVideoStream, this.peerVideo);
                    })
                })

                this.socket.on('user-connected', (userId) => {
                    console.log("calling")

                    const call = this.peer.call(userId, stream);
                    call.on('stream', (userVideoStream) => {
                        this.addVideoStream(userVideoStream, this.peerVideo);
                    })
                    call.on('close', () => {
                        this.peerVideo.srcObject = null
                    })

                    this.peers[userId] = call;
                })

                this.socket.on('user-disconnected', (userId) => {
                    if (this.peers[userId]) {
                        this.peers[userId].close();
                        this.peerVideo.srcObject = null;
                    }

                    this.$router.back()
                    alert('Call ended')

                })

                this.socket.on('Invalid', (message) => {
                    console.error(message)
                    this.$router.back()
                })
            });
        }
    },
    unmounted() {
         // Cleanup on component unmount
         if (this.peer) {
            this.peer.destroy();
        }
        if (this.socket) {
            this.socket.emit('leave call');
        }
    },
    mounted() {
        const appSocket = this.$store.getters.getSocket
        appSocket.off('decline call')
        appSocket.on('decline call', () => {
            console.log('decline call')
            alert('Call declined')
            this.$router.back()
        })

        this.video = this.$refs.localVideo;
        this.peerVideo = this.$refs.peerVideo;

        this.initializeCall();


    }
}
</script>
