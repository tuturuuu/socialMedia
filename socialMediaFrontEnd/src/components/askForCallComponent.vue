<template>

<div v-if="showPopup">
  <div class="position-fixed top-50 start-50 translate-middle p-5 bg-primary text-white border rounded-3 shadow-lg d-flex flex-column justify-content-between align-items-center" style="z-index: 9999">
    <img
      src="../assets/img/profile_other.png"
      class="rounded-circle me-2 mb-4"
      alt="Caller Avatar"
      width="120"
      height="120"
    />
    <p class="m-0 me-2"><strong>Caller Username</strong></p>
    <p class="m-0">You have an incoming call!</p>
    <div class="d-flex gap-2 mt-2">
     
        <router-link :to="`/call/${roomId}/${callId}`" class="text-decoration-none text-white">
          <button class="btn btn-success me-2" @click="acceptCall()">
            Accept
        </button>

        </router-link>
      <button class="btn btn-danger" @click="declineCall()">Decline</button>
    </div>
  </div>
</div>

</template>


<script>
export default {
  props: ['showPopup','roomId','callId'],
  methods: {
    acceptCall(){
      this.$emit('acceptCall');
    },
    declineCall(){
      this.$emit('declineCall');
    }
  },
};

</script>