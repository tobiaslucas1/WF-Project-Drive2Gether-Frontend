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
            window.location.href = '/trips';
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


<style scoped>
    .login-container {
        max-width: 400px;
        margin: 50px auto;
        padding: 30px;
        border: 1px solid #e1e4e8;
        border-radius: 12px;
        background-color: white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        font-family: 'Segoe UI', sans-serif;
    }
    h1 {
        text-align: center;
        color: #333;
        margin-bottom: 30px;
    }
    .field {
        margin-bottom: 20px;
    }
    label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #4a5568;
    }
    input {
        width: 100%;
        padding: 12px;
        box-sizing: border-box;
        border: 1px solid #cbd5e0;
        border-radius: 6px;
        font-size: 16px;
    }
    .login-btn {
        width: 100%;
        padding: 12px;
        background-color: #3182ce;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    .login-btn:hover {
        background-color: #2b6cb0;
    }
    .login-btn:disabled {
        background-color: #a0aec0;
        cursor: not-allowed;
    }
    .message-box {
        padding: 12px;
        margin-bottom: 20px;
        border-radius: 6px;
        text-align: center;
        font-size: 14px;
    }
    .message-box.success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    .message-box.error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
    .register-link {
        text-align: center;
        margin-top: 20px;
        font-size: 14px;
        color: #666;
    }
    .register-link a {
        color: #3182ce;
        text-decoration: none;
        font-weight: bold;
    }
</style>