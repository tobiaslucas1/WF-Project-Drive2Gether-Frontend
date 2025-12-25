<!--
    Page: Register
    Description: Registreert een nieuwe gebruiker en optioneel een auto.
-->

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// --- DATA ---
// Persoonlijke info
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const phone = ref('');
const dob = ref('');
const address = ref('');

// Auto info
const hasCar = ref(false);
const carBrand = ref('');
const carModel = ref('');
const carPlate = ref('');
const carSeats = ref(4);
const carColor = ref('');

// UI state
const isLoading = ref(false);
const statusMessage = ref('');
const statusType = ref('');

// --- COMPUTED ---
// 18+ check voor datum kiezer
const maxDate = computed(() => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return today.toISOString().split('T')[0];
});

// --- METHODS ---
const handleRegister = async () => {
    statusMessage.value = '';
    isLoading.value = true;

    // 1. Data voorbereiden zoals de backend het verwacht (hoofdletters!)
    const payload = {
        FirstName: firstName.value,
        LastName: lastName.value,
        Email: email.value,
        PasswordHash: password.value,
        PhoneNumber: phone.value,
        DateOfBirth: dob.value,
        Address: address.value,
        
        // Stuur 'Car' object alleen mee als checkbox aan staat
        Car: hasCar.value ? {
            Brand: carBrand.value,
            Model: carModel.value,
            LicensePlate: carPlate.value,
            Seats: parseInt(carSeats.value),
            Color: carColor.value
        } : null
    };

    try {
        // 2. Versturen naar backend
        const response = await fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            // 3. Succes! We loggen de gebruiker direct in
            localStorage.setItem('currentUser', JSON.stringify(data));
            
            statusMessage.value = 'Account succesvol aangemaakt! Je wordt doorgestuurd...';
            statusType.value = 'success';
            
            setTimeout(() => {
                router.push('/my-trips'); 
            }, 1500);
        } else {
            statusMessage.value = data.status || data.message || 'Registratie mislukt.';
            statusType.value = 'error';
        }
    } catch (error) {
        console.error(error);
        statusMessage.value = 'Kan geen verbinding maken met de server.';
        statusType.value = 'error';
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="register-container">
        <div class="card">
            <h1>Account Aanmaken</h1>
            
            <form @submit.prevent="handleRegister">
                
                <!-- Sectie 1: Persoonlijk -->
                <div class="section-title">👤 Persoonlijke Gegevens</div>
                
                <div class="row">
                    <div class="field">
                        <label>Voornaam</label>
                        <input v-model="firstName" type="text" placeholder="Jan" required>
                    </div>
                    <div class="field">
                        <label>Achternaam</label>
                        <input v-model="lastName" type="text" placeholder="Jansen" required>
                    </div>
                </div>

                <div class="field">
                    <label>E-mailadres</label>
                    <input v-model="email" type="email" placeholder="jan@voorbeeld.nl" required>
                </div>

                <div class="field">
                    <label>Wachtwoord</label>
                    <input v-model="password" type="password" placeholder="Kies een sterk wachtwoord" required>
                </div>

                <div class="row">
                    <div class="field">
                        <label>Geboortedatum (18+)</label>
                        <input v-model="dob" type="date" :max="maxDate" required>
                    </div>
                    <div class="field">
                        <label>Telefoonnummer</label>
                        <input v-model="phone" type="tel" placeholder="0612345678">
                    </div>
                </div>

                <div class="field">
                    <label>Adres</label>
                    <input v-model="address" type="text" placeholder="Straatnaam 1, Stad">
                </div>

                <hr class="divider">

                <!-- Sectie 2: Auto Toggle -->
                <div class="car-toggle">
                    <input type="checkbox" id="carCheck" v-model="hasCar">
                    <label for="carCheck">Ik heb een auto en wil ritten aanbieden 🚗</label>
                </div>

                <!-- Sectie 3: Auto Gegevens (Alleen als checkbox aan is) -->
                <div v-if="hasCar" class="car-section animate-slide">
                    <div class="section-title">🚘 Auto Gegevens</div>
                    
                    <div class="row">
                        <div class="field">
                            <label>Merk</label>
                            <input v-model="carBrand" placeholder="bv. Volkswagen">
                        </div>
                        <div class="field">
                            <label>Model</label>
                            <input v-model="carModel" placeholder="bv. Golf">
                        </div>
                    </div>

                    <div class="row">
                        <div class="field">
                            <label>Kenteken</label>
                            <input v-model="carPlate" placeholder="1-ABC-123">
                        </div>
                        <div class="field">
                            <label>Kleur</label>
                            <input v-model="carColor" placeholder="Zwart">
                        </div>
                        <div class="field small">
                            <label>Stoelen</label>
                            <input v-model="carSeats" type="number" min="1" max="9">
                        </div>
                    </div>
                </div>

                <!-- Status Berichten -->
                <div v-if="statusMessage" :class="['message-box', statusType]">
                    {{ statusMessage }}
                </div>

                <!-- Submit Button -->
                <button type="submit" class="btn-register" :disabled="isLoading">
                    {{ isLoading ? 'Even geduld...' : 'Registreren' }}
                </button>

                <p class="login-link">
                    Heb je al een account? <RouterLink to="/login">Log hier in</RouterLink>
                </p>

            </form>
        </div>
    </div>
</template>

<style scoped>
.register-container {
    display: flex; justify-content: center; padding: 40px 20px;
    font-family: 'Segoe UI', sans-serif; background-color: #f7fafc; min-height: 100vh;
}
.card {
    background: white; width: 100%; max-width: 500px; padding: 30px;
    border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;
}
h1 { text-align: center; color: #2d3748; margin-bottom: 25px; }
.section-title { font-size: 0.9rem; text-transform: uppercase; color: #718096; font-weight: bold; margin-bottom: 10px; }
.row { display: flex; gap: 15px; }
.field { margin-bottom: 15px; flex: 1; }
.field.small { flex: 0.5; }
label { display: block; margin-bottom: 5px; font-size: 0.9rem; font-weight: 600; color: #4a5568; }
input { width: 100%; padding: 10px; border: 1px solid #cbd5e0; border-radius: 6px; box-sizing: border-box; font-size: 1rem; }
input:focus { border-color: #3182ce; outline: none; box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1); }
.divider { border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0; }
.car-toggle { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; background: #ebf8ff; padding: 15px; border-radius: 8px; cursor: pointer; }
.car-toggle label { margin: 0; cursor: pointer; color: #2b6cb0; font-weight: bold; }
.car-section { background: #f7fafc; padding: 15px; border-radius: 8px; border: 1px solid #edf2f7; margin-bottom: 20px; }
.btn-register { width: 100%; padding: 12px; background-color: #48bb78; color: white; border: none; border-radius: 6px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: background 0.2s; margin-top: 10px; }
.btn-register:hover { background-color: #38a169; }
.btn-register:disabled { background-color: #a0aec0; cursor: not-allowed; }
.message-box { padding: 15px; margin-bottom: 20px; border-radius: 6px; text-align: center; }
.message-box.success { background-color: #c6f6d5; color: #22543d; border: 1px solid #9ae6b4; }
.message-box.error { background-color: #fed7d7; color: #822727; border: 1px solid #feb2b2; }
.login-link { text-align: center; margin-top: 20px; font-size: 0.9rem; color: #718096; }
.login-link a { color: #3182ce; font-weight: bold; text-decoration: none; }
.animate-slide { animation: slideDown 0.3s ease-out; }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
</style>