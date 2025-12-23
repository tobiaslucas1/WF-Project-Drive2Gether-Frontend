<!--
    settings van de pagina
-->

<script setup>
    // imports
    import { ref} from 'vue';

    // lifecycles

    //data

    //methods


</script>


<template>
    <h1>Login Page</h1>
    <div class="login-container">
        <form class="login-form">
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" v-model="email" required />  
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" v-model="password" required />
            </div>
            <button type="submit">Login</button>
        </form>
    </div>
    
</template>