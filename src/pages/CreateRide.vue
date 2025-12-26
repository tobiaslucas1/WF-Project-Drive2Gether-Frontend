<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// --- Data ---
const user = ref(null);
const myCars = ref([]);
const loading = ref(true);
const message = ref('');
const messageType = ref('');

// splits to date in ISO
const minDate = ref(new Date().toISOString().split('T')[0]);


const rideForm = ref({
    StartLocation: '',
    EndLocation: '',
    Date: '',
    Time: '',
    Price: '',
    CarID: ''
});

// --- Lifecycles ---
onMounted(async () => {
    const userStr = localStorage.getItem('currentUser'); // looks for Logged in user
    if (!userStr) {
        router.push('/login');
        return;
    }
    const localUser = JSON.parse(userStr); //convert text to js-object
    user.value = localUser;

    await fetchUserCars(localUser.UserID);
    loading.value = false;
});

// --- Methods ---
const fetchUserCars = async (userId) => {
    const response = await fetch('http://localhost:3000/cars');
    if (response.ok) {
        const allCars = await response.json();
        const usersCars = allCars.filter(car => car.OwnerID == userId);
        myCars.value = usersCars;

        if (usersCars.length === 1) {
            rideForm.value.CarID = usersCars[0].CarID;
        }
    }
};

const createRide = async () => {
    if (!rideForm.value.StartLocation || !rideForm.value.EndLocation || !rideForm.value.Date || !rideForm.value.Price || !rideForm.value.CarID) {
        message.value = "Vul alle velden in en selecteer een auto.";
        messageType.value = "error";
        return;
    }
    // Date in future?
    const selectedDateTime = new Date(`${rideForm.value.Date}T${rideForm.value.Time}`); // Convert to ISO
    const now = new Date();

    if (selectedDateTime <= now) {
        message.value = "De vertrektijd moet in de toekomst liggen.";
        messageType.value = "error";
        return;
    }

    const newRide = {
        DriverID: user.value.UserID,
        CarID: rideForm.value.CarID,
        StartLocation: rideForm.value.StartLocation,
        EndLocation: rideForm.value.EndLocation,
        DepartureTime: selectedDateTime.toISOString(),
        Price: parseFloat(rideForm.value.Price),
        SeatsOffered: getSelectedCarSeats(),
        SeatsBooked: 0,
        TripStatus: 'Scheduled'
    };

    const response = await fetch('http://localhost:3000/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRide)
    });
    if (response.ok) {
        message.value = "Rit succesvol opgeslagen!";
        messageType.value = "success";
        setTimeout(() => router.push('/'), 1500);
    } else {
        const errText = await response.text();
        try {
            const errJson = JSON.parse(errText);
            message.value = errJson.message || "Fout bij opslaan";
        } catch {
            message.value = "Fout bij opslaan: " + errText;
        }
        messageType.value = "error";
    }
    
};

const getSelectedCarSeats = () => {
    const car = myCars.value.find(c => c.CarID == rideForm.value.CarID);
    return car ? parseInt(car.Seats): 1;
};
</script>

<template>
    <div class="page-container">
        <div class="card">
            <h1>Rit Aanbieden</h1>
            
            <div v-if="loading" class="loading">Gegevens controleren...</div>

            <div v-else-if="myCars.length === 0" class="no-car-warning">
                <div class="icon-warning">⚠️</div>
                <h2>Geen auto gevonden</h2>
                <p>Je hebt een auto nodig om ritten aan te kunnen bieden.</p>
                <button @click="router.push('/settings')" class="btn-secondary">Auto toevoegen</button>
            </div>

            <form v-else @submit.prevent="createRide" class="ride-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>Vertrekpunt</label>
                        <input v-model="rideForm.StartLocation" placeholder="bv. Amsterdam" required>
                    </div>
                    <div class="form-group">
                        <label>Bestemming</label>
                        <input v-model="rideForm.EndLocation" placeholder="bv. Utrecht" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Datum</label>
                        <input type="date" v-model="rideForm.Date" :min="minDate" required>
                    </div>
                    <div class="form-group">
                        <label>Tijd</label>
                        <input type="time" v-model="rideForm.Time" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Prijs p.p. (€)</label>
                        <input type="number" v-model="rideForm.Price" placeholder="5.00" min="0" step="0.50" required>
                    </div>
                    <div class="form-group">
                        <label>Auto</label>
                        <select v-model="rideForm.CarID" required>
                            <option disabled value="">Kies auto</option>
                            <option v-for="car in myCars" :key="car.CarID" :value="car.CarID">
                                {{ car.Brand }} {{ car.Model }} ({{ car.LicensePlate }})
                            </option>
                        </select>
                    </div>
                </div>

                <div v-if="message" :class="['msg-box', messageType]">{{ message }}</div>

                <div class="actions">
                    <button type="button" @click="router.push('/')" class="btn-cancel">Annuleren</button>
                    <button type="submit" class="btn-submit">Rit Aanmaken</button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>

.page-container {
    display: flex; 
    justify-content: center; 
    padding: 40px 20px;
    background-color: #f7fafc; 
    min-height: 80vh;
}

.card {
    background: white;
    width: 100%; 
    max-width: 600px;
    padding: 30px; 
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05); 
    border: 1px solid #e2e8f0;
}

h1 { 
    text-align: center; 
    color: #2d3748; 
    margin-bottom: 30px; 
}

.ride-form { display: flex; flex-direction: column; gap: 20px; }
.form-row { display: flex; gap: 20px; }
.form-group { flex: 1; display: flex; flex-direction: column; }
@media (max-width: 600px) { .form-row { flex-direction: column; gap: 15px; } }

label { font-weight: 600; color: #4a5568; margin-bottom: 5px; font-size: 0.9rem; }
input, select {
    padding: 12px; border: 1px solid #cbd5e0; border-radius: 8px;
    font-size: 1rem; background: #fff;
}
input:focus, select:focus { border-color: #3182ce; outline: none; }

.actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }

.btn-submit {
    background: #3182ce; 
    color: white; 
    border: none; 
    padding: 12px 25px;
    border-radius: 8px; 
    font-weight: bold; 
    cursor: pointer; 
}
.btn-submit:hover { background: #2b6cb0; }

.btn-cancel {
    background: transparent; 
    color: #718096; 
    border: none; 
    padding: 12px 25px;
    font-weight: 600; 
    cursor: pointer;
}
.btn-cancel:hover { color: #2d3748; }

.btn-secondary {
    background: #3182ce; color: white; border: none; padding: 12px 20px;
    border-radius: 8px; cursor: pointer; margin-top: 20px; font-weight: 600;
}

.no-car-warning {
    text-align: center; padding: 40px 20px; background: #fff5f5;
    border-radius: 8px; border: 1px solid #fed7d7;
}
.icon-warning { font-size: 3rem; margin-bottom: 10px; }
.no-car-warning h2 { margin: 0 0 10px 0; color: #c53030; }
.no-car-warning p { color: #742a2a; margin-bottom: 20px; }

.msg-box { padding: 15px; border-radius: 8px; text-align: center; font-weight: 500; }
.msg-box.success { background: #c6f6d5; color: #22543d; }
.msg-box.error { background: #fed7d7; color: #822727; }
.loading { text-align: center; color: #718096; padding: 20px; }
</style>