<script setup>
    import { ref, onMounted } from 'vue';
    
    const isLoggedIn = ref(false);
    const userName = ref('');

    onMounted(() => {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            const user = JSON.parse(userStr);
            isLoggedIn.value = true;
            userName.value = user.FirstName;
        }
    });

    const handleLogout = () => {
        if(confirm("Weet je zeker dat je wilt uitloggen?")) {
            localStorage.removeItem('currentUser');
            
            window.location.href = '/login';
        }
    };
</script>

<template>
    <nav class="navbar">
        <div class="logo">
            <RouterLink to="/">Drive2Gether</RouterLink>
        </div>

        <div class="menu">
            
            <RouterLink to="/trips" class="menu-item">Ritten</RouterLink>
            
            <div v-if="!isLoggedIn" class="auth-links">
                <RouterLink to="/login" class="menu-item">Inloggen</RouterLink>
                <RouterLink to="/register" class="btn-register">Registreren</RouterLink>
            </div>

            <div v-else class="user-area">
                <span class="welcome-text">Hoi, {{ userName }}!</span>


                <button @click="handleLogout" class="btn-logout">Uitloggen</button>

                <RouterLink to="/settings" class="settings-link" title="Instellingen">
                    ⚙️
                </RouterLink>
            </div>
        </div>
    </nav>
</template>

<style scoped>
    .navbar {
        background-color: white;
        padding: 15px 30px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: 'Segoe UI', sans-serif;
        margin-bottom: 30px;
    }

    .logo a {
        font-size: 1.5rem;
        font-weight: bold;
        color: #3182ce;
        text-decoration: none;
    }

    .menu {
        display: flex;
        align-items: center;
        gap: 20px;
    }

    .menu-item {
        color: #4a5568;
        text-decoration: none;
        font-weight: 500;
    }
    .menu-item:hover { color: #3182ce; }

    .auth-links, .user-area {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .welcome-text {
        color: #2d3748;
        font-weight: bold;
    }

    .btn-register {
        background-color: #3182ce;
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: bold;
    }
    .btn-register:hover { background-color: #2b6cb0; }

    .btn-logout {
        background-color: #e53e3e;
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        font-weight: bold;
        font-size: 0.9rem;
    }
    .btn-logout:hover { background-color: #c53030; }
</style>