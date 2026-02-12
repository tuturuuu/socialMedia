<script setup>
  import NavBar from '../components/navBarComponent.vue'
  import Footer from '../components/footerComponent.vue'
</script>

<template>
  <!-- Chat Section -->
  <div class="row">
    <!-- Sidebar - Contacts List -->
    <NavBar></NavBar>

    <div class="col-md-4 col-lg-3 border-end d-md-flex flex-column" >
      <h4 class="text-center py-3">Contacts</h4>

      <!-- Add a toggle button -->
      <button class="btn btn-primary d-md-none d-block mx-auto mb-3" @click="showContacts = !showContacts">
        <i class="bi" :class="{'bi-arrow-bar-up': showContacts, 'bi-arrow-bar-down': !showContacts}"></i>
      </button>
      
      <div v-if="rooms.length === 0" class="alert alert-warning text-center" role="alert">
        You haven't followed any users yet. Go to the posts page and follow users to start chatting.
      </div>
      <div class="list-group overflow-auto" v-for="room in rooms" v-if="showContacts && rooms.length > 0">
        <router-link :to="`/chatting/room/${room.name}/${room._id}`" class="list-group-item list-group-item-action d-flex align-items-center">
          <img
            src="../assets/img/profile_other.png"
            width="40"
            height="40"
            class="rounded-circle me-3"
            alt="User"
          />
          <div>
            <h6 class="mb-0">{{ room.name }} </h6>
            <small class="text-muted">Last message snippet...</small>
          </div>
        </router-link>
        <!-- Add more contacts here in the same format -->

      </div>
      
    </div>

      <router-view :key="$route.fullPath" ></router-view>

    </div>

    <Footer></Footer>
</template>

<script>

export default {
  data() {
    return{
      showContacts: true,
      rooms: [],
    } 
  },
  unmounted() {
    this.$store.commit('setIsChattingView', false)
  },
  async mounted() {
    
    Notification.requestPermission()

    this.$store.commit('setIsChattingView', true)

    try{
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
    if (this.rooms.length > 0) {
      this.$router.push(`/chatting/room/${this.rooms[0].name}/${this.rooms[0]._id}`)
    }

  }


}
</script>
