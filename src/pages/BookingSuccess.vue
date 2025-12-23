<template>
    <div class="success-container">
        <div class="card">
            <h1>✅ Gelukt!</h1>
            <p>Je stoel is gereserveerd.</p>
            <RouterLink to="/trips" class="btn">Terug naar Ritten</RouterLink>
        </div>
    </div>
</template>

<style scoped>
    .success-container {
        display: flex; justify-content: center; padding-top: 50px; font-family: sans-serif;
    }
    .card {
        text-align: center; background: white; padding: 40px; border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1); border: 1px solid #ddd;
    }
    h1 { color: #38a169; margin-bottom: 20px; }
    .btn {
        display: inline-block; margin-top: 20px; padding: 10px 20px;
        background: #3182ce; color: white; text-decoration: none; border-radius: 5px;
    }
</style>