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
            
            <RouterLink to="/trips" class="menu-item">Alle Ritten</RouterLink>
            
            <template v-if="isLoggedIn">
                <RouterLink to="/create-ride" class="menu-item">Rit Aanbieden</RouterLink>
                <RouterLink to="/my-trips" class="menu-item highlight">Mijn Ritten</RouterLink>
            </template>
            
            <div v-if="!isLoggedIn" class="auth-links">
                <RouterLink to="/login" class="menu-item">Inloggen</RouterLink>
                <RouterLink to="/register" class="btn-register">Registreren</RouterLink>
            </div>

            <div v-else class="user-area">
                <span class="welcome-text">{{ userName }}</span>

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
        transition: color 0.2s;
    }
    .menu-item:hover { color: #3182ce; }

    .router-link-active {
        color: #3182ce;
        font-weight: 700;
    }

    .highlight {
        color: #2b6cb0;
        border-bottom: 2px solid #ebf8ff;
    }

    .auth-links, .user-area {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-left: 10px; 
        padding-left: 20px;
        border-left: 1px solid #edf2f7;
    }

    .welcome-text {
        text-transform: uppercase;
        color: #2d3748;
        font-weight: bold;
    }

    .settings-link {
        text-decoration: none;
        font-size: 1.2rem;
        transition: transform 0.2s;
    }
    .settings-link:hover { transform: rotate(45deg); }

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

    @media (max-width: 768px) {
        .navbar { flex-direction: column; gap: 15px; }
        .menu { flex-direction: column; gap: 15px; }
        .auth-links, .user-area { border-left: none; padding-left: 0; }
    }
</style>