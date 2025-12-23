 <!--
    settings van de pagina
-->

<script setup>
    // imports

    // lifecycles

    //data

    //methods


</script>


<template>
    <div class="home-container">
        
        <section class="hero">
            <div class="hero-content">
                <h1>Samen rijden, <br>Samen besparen.</h1>
                <p class="subtitle">Het makkelijkste platform om ritten te delen in de buurt.</p>
                
                <div class="hero-buttons">
                    <RouterLink to="/trips" class="btn btn-primary">Zoek een rit</RouterLink>
                    <RouterLink to="/login" class="btn btn-secondary">Rit aanbieden</RouterLink>
                </div>
            </div>
            <div class="hero-image">
                🚗💨
            </div>
        </section>

        <section class="features">
            <div class="feature-card">
                <div class="icon">💰</div>
                <h3>Bespaar Geld</h3>
                <p>Deel de benzinekosten en parkeerkosten. Reizen wordt een stuk goedkoper.</p>
            </div>
            <div class="feature-card">
                <div class="icon">🌱</div>
                <h3>Beter voor 't Milieu</h3>
                <p>Samen in één auto betekent minder uitstoot en minder files.</p>
            </div>
            <div class="feature-card">
                <div class="icon">🛡️</div>
                <h3>Veilig & Betrouwbaar</h3>
                <p>Geverifieerde profielen en reviews zorgen voor een veilige reis.</p>
            </div>
        </section>

        <section class="how-it-works">
            <h2>Hoe werkt het?</h2>
            <div class="steps">
                <div class="step">
                    <span class="step-number">1</span>
                    <h4>Zoek</h4>
                    <p>Vind een rit die bij jouw vertrektijd en bestemming past.</p>
                </div>
                <div class="step">
                    <span class="step-number">2</span>
                    <h4>Boek</h4>
                    <p>Reserveer je stoel direct online en ontvang contactgegevens.</p>
                </div>
                <div class="step">
                    <span class="step-number">3</span>
                    <h4>Rij</h4>
                    <p>Ontmoet de chauffeur op de afgesproken plek en ga op pad!</p>
                </div>
            </div>
        </section>

        <section class="cta">
            <h2>Klaar om te vertrekken?</h2>
            <p>Maak binnen 1 minuut een account aan.</p>
            <RouterLink to="/register" class="btn btn-large">Nu Registreren</RouterLink>
        </section>

    </div>
</template>

<style scoped>
    .home-container {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #2d3748;
    }

    .hero {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 60px 20px;
        max-width: 1000px;
        margin: 0 auto;
    }

    .hero-content {
        flex: 1;
    }

    h1 {
        font-size: 3rem;
        line-height: 1.2;
        color: #2b6cb0;
        margin-bottom: 20px;
    }

    .subtitle {
        font-size: 1.2rem;
        color: #718096;
        margin-bottom: 30px;
    }

    .hero-buttons {
        display: flex;
        gap: 15px;
    }

    .hero-image {
        flex: 1;
        font-size: 10rem;
        text-align: center;
        animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
        100% { transform: translateY(0px); }
    }

    .btn {
        display: inline-block;
        padding: 12px 25px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: bold;
        transition: transform 0.2s;
    }

    .btn:hover { transform: translateY(-2px); }

    .btn-primary {
        background-color: #3182ce;
        color: white;
    }

    .btn-secondary {
        background-color: white;
        color: #3182ce;
        border: 2px solid #3182ce;
    }
    
    .btn-large {
        background-color: #48bb78;
        color: white;
        padding: 15px 40px;
        font-size: 1.2rem;
    }

    .features {
        display: flex;
        gap: 30px;
        padding: 60px 20px;
        background-color: white;
        justify-content: center;
        flex-wrap: wrap;
    }

    .feature-card {
        background: #f7fafc;
        padding: 30px;
        border-radius: 12px;
        width: 250px;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }

    .feature-card .icon { font-size: 3rem; margin-bottom: 15px; }
    .feature-card h3 { color: #2d3748; margin-bottom: 10px; }
    .feature-card p { color: #718096; font-size: 0.9rem; }

    .how-it-works {
        padding: 60px 20px;
        text-align: center;
        max-width: 800px;
        margin: 0 auto;
    }

    .how-it-works h2 { margin-bottom: 40px; color: #2d3748; }

    .steps {
        display: flex;
        justify-content: space-around;
        gap: 20px;
        flex-wrap: wrap;
    }

    .step {
        flex: 1;
        min-width: 200px;
        position: relative;
    }

    .step-number {
        display: inline-block;
        width: 40px;
        height: 40px;
        background-color: #3182ce;
        color: white;
        border-radius: 50%;
        line-height: 40px;
        font-weight: bold;
        margin-bottom: 15px;
    }

    .step h4 { margin-bottom: 10px; font-size: 1.2rem; }
    .step p { color: #718096; }

    .cta {
        background-color: #2c5282;
        color: white;
        text-align: center;
        padding: 60px 20px;
        border-radius: 20px;
        margin: 40px 20px;
    }

    .cta h2 { margin-bottom: 10px; color: white; }
    .cta p { margin-bottom: 30px; color: #bee3f8; }
</style>