<script setup>

  import NavBar from './components/NavBar.vue';

</script>


<template>
  <div class="app-container">
    <NavBar />

    <RouterView />
  </div>
</template>

<style>
  body {
    margin: 0;
    padding: 0;
    background-color: #f7fafc; 
    font-family: 'Segoe UI', sans-serif;
  }
</style>
