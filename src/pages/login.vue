<!--
    settings van de pagina
-->

<script setup>
    //------ imports ------
    import { ref} from 'vue';

    //------ lifecycles ------

    //------- data -------

    const email = ref('');
    const password = ref('');

    const statusMessage = ref('');
    const isSubmitting = ref(false);

    //------ methods ------
    const handleLogin = async () => {
        statusMessage.value = '';
        isSubmitting.value = true;

        const response = await fetch('http://localhost:3000/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                Email: email.value, 
                Password: password.value 
            })
        });

        const result = await response.json();
        isSubmitting.value = false;

        if (response.ok) {
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            window.location.href = '/';
        } else {
            statusMessage.value = result.status || 'Login mislukt';

        }



        
    };

</script>


<template>
    <div class="login-container">
        <h1>Inloggen</h1>
        
        <div class="field">
            <label>E-mail</label>
            <input v-model="email" type="email" placeholder="jouw@email.com" required @keyup.enter="handleLogin">
        </div>

        <div class="field">
            <label>Wachtwoord</label>
            <input v-model="password" type="password" placeholder="••••••••" required @keyup.enter="handleLogin">
        </div>

        <div v-if="statusMessage" :class="['message-box', statusType]">
            {{ statusMessage }}
        </div>

        <button class="login-btn" @click="handleLogin" :disabled="isSubmitting">
            {{ isSubmitting ? 'Bezig met laden...' : 'Inloggen' }}
        </button>

        <p class="register-link">
            Nog geen account? <a href="/register">Registreer hier</a>
        </p>
    </div>
</template>