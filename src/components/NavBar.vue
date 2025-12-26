<script setup>
    // --- imports ---
    import { ref, onMounted } from 'vue';

    // --- data ---
    const isLoggedIn = ref(false);
    const userName = ref('');

    // --- Lifecycles ---
    onMounted(() => {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            const user = JSON.parse(userStr);
            isLoggedIn.value = true;
            userName.value = user.FirstName;
        }
    }); 

    // --- methods ---
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
                <RouterLink to="/my-trips" class="menu-item">Mijn Ritten</RouterLink>
                
                <RouterLink to="/messages" class="menu-item messages-link">
                    Berichten 💬
                </RouterLink>
            </template>
            
            <div v-if="!isLoggedIn" class="auth-links">
                <RouterLink to="/login" class="menu-item">Inloggen</RouterLink>
                <RouterLink to="/register" class="btn-register">Registreren</RouterLink>
            </div>

            <div v-else class="user-area">
                <span class="welcome-text">Welkom {{ userName }}</span>
                
                <RouterLink to="/settings" class="settings-link" title="Instellingen">⚙️</RouterLink>
                
                <button @click="handleLogout" class="btn-logout" title="Uitloggen">Uitloggen</button>
            </div>
        </div>
    </nav>
</template>

<style scoped>
    .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 30px;
        background-color: white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .logo a {
        font-size: 1.5rem;
        font-weight: bold;
        color: #3182ce;
        display: flex; 
    }

    .menu {
        display: flex;
        align-items: center;
        gap: 20px;
    }

    .menu-item {
        text-decoration: none;
        color: #4a5568;
        font-weight: 500;
        padding: 5px 0;
    }

    .menu-item:hover {
        color: #3182ce;
        font-weight: 700;
    }

    .router-link-active {
        color: #3182ce;
        font-weight: 700;
        border-bottom: 2px solid #3182ce;
    }

    .messages-link {
        color: #2b6cb0;
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
        font-weight: bold;
        color: #3f4a54;
    }

    .settings-link {
        text-decoration: none;
        font-size: 1.2rem;
        transition: transform 0.2s;
        border: none !important;
    }
    .settings-link:hover { transform: rotate(360deg); }

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
    text-transform: uppercase;
    background-color: #fed7d7;
    color: #e53e3e; 
    border: none;
    font-size: 0,8rem; 
    font-weight: bold;
    cursor: pointer;
    padding: 6px 16px; 
    border-radius: 6px;
}

.btn-logout:hover {
    transform: scale(1.10);
}

    @media (max-width: 768px) {
        .navbar { flex-direction: column; gap: 15px; padding: 15px; }
        .menu { flex-wrap: wrap; justify-content: center; gap: 15px; }
        .auth-links, .user-area { border-left: none; padding-left: 0; margin-left: 0; }
    }
</style>