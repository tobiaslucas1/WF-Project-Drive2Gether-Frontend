<script setup>
// --- Imports
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// --- Data ---
// Persoonlijke info
const FirstName = ref('');
const LastName = ref('');
const Email = ref('');
const Password = ref('');
const PhoneNumber = ref('');
const DateOfBirth = ref('');
const Address = ref('');

// Auto info
const hasCar = ref(false);
const Brand = ref('');
const Model = ref('');
const LicensePlate = ref('');
const Seats = ref(4);
const Color = ref('');

const isSubmitting = ref(false);
const statusMessage = ref('');
const statusType = ref(''); 

// --- COMPUTED ---
const maxDate = computed(() => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return today.toISOString().split('T')[0];
});

// --- METHODS ---
const handleRegister = async () => {
    statusMessage.value = '';
    isSubmitting.value = true;

    if (!FirstName.value || !LastName.value || !Email.value || !Password.value) {
        statusMessage.value = "Vul alle verplichte velden in.";
        statusType.value = 'error';
        isSubmitting.value = false;
        return;
    }

    const payload = {
        FirstName: FirstName.value,
        LastName: LastName.value,
        Email: Email.value,
        PasswordHash: Password.value,
        PhoneNumber: PhoneNumber.value,
        DateOfBirth: DateOfBirth.value,
        Address: Address.value,
        
        Car: hasCar.value ? {
            Brand: Brand.value,
            Model: Model.value,
            LicensePlate: LicensePlate.value,
            Seats: parseInt(Seats.value),
            Color: Color.value
        } : null
    };

    try {
        const response = await fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            statusMessage.value = 'Account succesvol aangemaakt! Je wordt doorgestuurd naar de login pagina...';
            statusType.value = 'success';
            
            setTimeout(() => {
                router.push('/login'); 
            }, 1000);
        } else {
            statusMessage.value = data.status || data.message || 'Registratie mislukt.';
            statusType.value = 'error';
        }
    } catch (error) {
        console.error(error);
        statusMessage.value = 'Kan geen verbinding maken met de server.';
        statusType.value = 'error';
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <div class="register-container">
        <div class="card">
            <h1>Account Aanmaken</h1>
            
            <form @submit.prevent="handleRegister">
                
                <div class="section-title">👤 Persoonlijke Gegevens</div>
                
                <div class="row">
                    <div class="field">
                        <label>Voornaam *</label>
                        <input v-model="FirstName" type="text" placeholder="Jan" required>
                    </div>
                    <div class="field">
                        <label>Achternaam *</label>
                        <input v-model="LastName" type="text" placeholder="Jansen" required>
                    </div>
                </div>

                <div class="field">
                    <label>E-mailadres *</label>
                    <input v-model="Email" type="email" placeholder="jan@voorbeeld.nl" required>
                </div>

                <div class="field">
                    <label>Wachtwoord *</label>
                    <input v-model="Password" type="password" placeholder="Kies een sterk wachtwoord" required>
                </div>

                <div class="row">
                    <div class="field">
                        <label>Geboortedatum (18+)</label>
                        <input v-model="DateOfBirth" type="date" :max="maxDate" required>
                    </div>
                    <div class="field">
                        <label>Telefoonnummer</label>
                        <input v-model="PhoneNumber" type="tel" placeholder="0612345678">
                    </div>
                </div>

                <div class="field">
                    <label>Adres</label>
                    <input v-model="Address" type="text" placeholder="Straatnaam 1, Stad">
                </div>

                <hr class="divider">

                <div class="car-toggle">
                    <input type="checkbox" id="carCheck" v-model="hasCar">
                    <label for="carCheck">Ik heb een auto en wil ritten aanbieden 🚗</label>
                </div>

                <div v-if="hasCar" class="car-section animate-slide">
                    <div class="section-title">🚘 Auto Gegevens</div>
                    
                    <div class="row">
                        <div class="field">
                            <label>Merk</label>
                            <input v-model="Brand" placeholder="bv. Volkswagen">
                        </div>
                        <div class="field">
                            <label>Model</label>
                            <input v-model="Model" placeholder="bv. Golf">
                        </div>
                    </div>

                    <div class="row">
                        <div class="field">
                            <label>Kenteken</label>
                            <input v-model="LicensePlate" placeholder="1-ABC-123">
                        </div>
                        <div class="field">
                            <label>Kleur</label>
                            <input v-model="Color" placeholder="Zwart">
                        </div>
                        <div class="field small">
                            <label>Stoelen</label>
                            <input v-model="Seats" type="number" min="1" max="9">
                        </div>
                    </div>
                </div>

                <div v-if="statusMessage" :class="['message-box', statusType]">
                    {{ statusMessage }}
                </div>

                <button type="submit" class="save-btn" :disabled="isSubmitting">
                    {{ isSubmitting ? 'Even geduld...' : 'Registreren' }}
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
    font-family: 'Segoe UI', sans-serif; min-height: 100vh;
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

.save-btn { width: 100%; padding: 12px; background-color: #3182ce; color: white; border: none; border-radius: 6px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: background 0.2s; margin-top: 10px; }
.save-btn:hover { background-color: #2b6cb0; }
.save-btn:disabled { background-color: #a0aec0; cursor: not-allowed; }

.message-box { padding: 15px; margin-bottom: 20px; border-radius: 6px; text-align: center; }
.message-box.success { background-color: #c6f6d5; color: #22543d; border: 1px solid #9ae6b4; }
.message-box.error { background-color: #fed7d7; color: #822727; border: 1px solid #feb2b2; }

.login-link { text-align: center; margin-top: 20px; font-size: 0.9rem; color: #718096; }
.login-link a { color: #3182ce; font-weight: bold; text-decoration: none; }

.animate-slide { animation: slideDown 0.3s ease-out; }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
</style>