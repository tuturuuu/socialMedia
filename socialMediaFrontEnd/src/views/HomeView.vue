<script setup>
import sideBarLeftComponent from '../components/sideBarLeftComponent.vue'
import sideBarRightComponent from '../components/sideBarRightComponent.vue'
import middleComponent from '../components/middleComponent.vue'

import NavBar from '../components/navBarComponent.vue'
import Footer from '../components/footerComponent.vue'

</script>

<template>
  <NavBar></NavBar>

  <!-- Main Content -->
  <div class="container mt-4">
    <div class="row">
      <div class="col-md-3 d-none md-none d-md-block">
        <sideBarLeftComponent></sideBarLeftComponent>
      </div>

      <div class="col-md-6">
        <middleComponent></middleComponent>
      </div>
      <div class="col-md-3">
        <sideBarRightComponent></sideBarRightComponent>
      </div>
    </div>
  </div>

  <Footer></Footer>

</template>

<script>
export default {
  components: {
    sideBarLeftComponent,
    middleComponent,
    sideBarRightComponent,
  },
}
</script>
