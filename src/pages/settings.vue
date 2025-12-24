<script setup>
    import { ref, onMounted } from 'vue';
    import { useRouter } from 'vue-router';

    const router = useRouter();

    // --- data ---
    const user = ref(null);
    const myCars = ref([]); 
    const loading = ref(true);
    const isAddingCar = ref(false); 
    const message = ref('');
    const messageType = ref('');

    const carForm = ref({
        Brand: '',
        Model: '',
        LicensePlate: '',
        Color: '',
        Seats: 1
    });

    // --- LIFECYCLE ---
    onMounted(async () => {
        const userStr = localStorage.getItem('currentUser');
        
        if (!userStr) {
            router.push('/login');
            return;
        }
        
        const localUser = JSON.parse(userStr);
        user.value = localUser; 

        await fetchUserData(localUser.UserID);
        await fetchUserCars(localUser.UserID);
        
        loading.value = false;
    });

    // --- METHODS ---

    const fetchUserData = async (userId) => {
        try {
            const response = await fetch(`http://localhost:3000/users/${userId}`);
            if (response.ok) {
                user.value = await response.json();
            }
        } catch (error) {
            console.error("Fout bij laden user:", error);
        }
    };

    const fetchUserCars = async (userId) => {
        try {
            const response = await fetch(`http://localhost:3000/cars`);
            
            if (response.ok) {
                const allCars = await response.json();
                
                
                myCars.value = allCars.filter(car => car.OwnerID == userId);
            }
        } catch (error) {
            console.error("Fout bij laden autos:", error);
        }
    };

    const startAdding = () => {
        carForm.value = { Brand: '', Model: '', LicensePlate: '', Color: '', Seats: 1 };
        message.value = '';
        isAddingCar.value = true;
    };

    const cancelAdding = () => {
        isAddingCar.value = false;
        message.value = '';
    };

    const addCar = async () => {
        if (!carForm.value.Brand || !carForm.value.Model) {
            message.value = "Merk en Model zijn verplicht.";
            messageType.value = "error";
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/cars', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    OwnerID: user.value.UserID, 
                    ...carForm.value
                })
            });

            if (response.ok) {
                await fetchUserCars(user.value.UserID);
                
                isAddingCar.value = false;
                message.value = ''; 
            } else {
                message.value = "Er ging iets mis bij het opslaan.";
                messageType.value = "error";
            }
        } catch (error) {
            console.error(error);
            message.value = "Server fout.";
            messageType.value = "error";
        }
    };

    const deleteCar = async (carId) => {
        if(!confirm("Weet je zeker dat je deze auto wilt verwijderen?")) return;
        
        try {
            const response = await fetch(`http://localhost:3000/cars/${carId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                myCars.value = myCars.value.filter(c => c.CarID !== carId);
            }
        } catch (error) {
            console.error(error);
        }
    };
</script>

<template>
    <div class="settings-container">
        
        <div v-if="loading" class="loading">Laden...</div>

        <div v-else-if="!isAddingCar" class="view-dashboard animate-fade">
            <h1>Mijn Account</h1>

            <div class="content-grid">
                <div class="section profile-card" v-if="user">
                    <h2>👤 Profiel</h2>
                    <div class="info-row"><strong>Naam:</strong> {{ user.FirstName }} {{ user.LastName }}</div>
                    <div class="info-row"><strong>Email:</strong> {{ user.Email }}</div>
                    <div class="info-row"><strong>Tel:</strong> {{ user.PhoneNumber }}</div>
                </div>

                <div class="section car-section">
                    <div class="section-header">
                        <h2>🚗 Mijn Garage</h2>
                        <button @click="startAdding" class="btn-small-add">+ Auto</button>
                    </div>

                    <div v-if="myCars.length > 0" class="car-list">
                        <div v-for="car in myCars" :key="car.CarID" class="car-card">
                            <div class="car-info">
                                <h3>{{ car.Brand }} {{ car.Model }}</h3>
                                <div class="badges">
                                    <span class="badge">{{ car.Color }}</span>
                                    <span class="badge plate" v-if="car.LicensePlate">{{ car.LicensePlate }}</span>
                                </div>
                            </div>
                            <button @click="deleteCar(car.CarID)" class="btn-delete-icon" title="Verwijderen">×</button>
                        </div>
                    </div>

                    <div v-else class="empty-state">
                        <p>Je garage is nog leeg.</p>
                        <button @click="startAdding" class="btn-primary">Eerste auto toevoegen</button>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="view-form animate-fade">
            <div class="form-container section">
                <button @click="cancelAdding" class="btn-back">← Terug</button>
                <h2>Nieuwe Auto</h2>
                
                <div class="form-group">
                    <label>Merk</label>
                    <input v-model="carForm.Brand" placeholder="bv. Volkswagen">
                </div>
                <div class="form-group">
                    <label>Model</label>
                    <input v-model="carForm.Model" placeholder="bv. Golf">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Kleur</label>
                        <input v-model="carForm.Color" placeholder="Zwart">
                    </div>
                    <div class="form-group">
                        <label>Zitplaatsen</label>
                        <input v-model="carForm.Seats" type="number" min="1">
                    </div>
                </div>
                <div class="form-group">
                    <label>Kenteken</label>
                    <input v-model="carForm.LicensePlate" placeholder="1-ABC-123">
                </div>

                <div v-if="message" :class="['msg-box', messageType]">{{ message }}</div>

                <button @click="addCar" class="btn-save">Auto Opslaan</button>
            </div>
        </div>

    </div>
</template>

<style scoped>
    .settings-container { max-width: 900px; margin: 0 auto; padding: 40px 20px; font-family: 'Segoe UI', sans-serif; }
    h1 { text-align: center; color: #2d3748; margin-bottom: 30px; }
    
    .animate-fade { animation: fadeIn 0.3s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

    .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
    @media (max-width: 768px) { .content-grid { grid-template-columns: 1fr; } }

    .section { background: white; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    h2 { margin-top: 0; color: #4a5568; border-bottom: 2px solid #edf2f7; padding-bottom: 10px; margin-bottom: 20px; font-size: 1.2rem; }
    
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 2px solid #edf2f7; padding-bottom: 10px; }
    .section-header h2 { border: none; padding: 0; margin: 0; }

    .info-row { margin-bottom: 12px; color: #4a5568; }

    .car-list { display: flex; flex-direction: column; gap: 10px; }
    .car-card { background: #f7fafc; padding: 15px; border-radius: 8px; border: 1px solid #edf2f7; display: flex; justify-content: space-between; align-items: center; }
    .car-info h3 { margin: 0 0 5px 0; font-size: 1rem; color: #2d3748; }
    
    .badges { display: flex; gap: 8px; }
    .badge { background: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; color: #4a5568; }
    .badge.plate { background: #ffcc00; color: black; border: 1px solid #d69e2e; font-weight: bold; }

    .btn-small-add { background: #3182ce; color: white; border: none; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
    .btn-small-add:hover { background: #2b6cb0; }
    
    .btn-primary { background: #3182ce; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; }
    .btn-save { width: 100%; background: #38a169; color: white; border: none; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 20px; }
    .btn-back { background: none; border: none; color: #718096; cursor: pointer; margin-bottom: 15px; font-size: 0.9rem; padding: 0; }
    .btn-back:hover { text-decoration: underline; color: #2d3748; }
    
    .btn-delete-icon { background: none; border: none; font-size: 1.5rem; color: #cbd5e0; cursor: pointer; padding: 0 5px; }
    .btn-delete-icon:hover { color: #e53e3e; }

    /* Form */
    .form-container { max-width: 500px; margin: 0 auto; }
    .form-group { margin-bottom: 15px; }
    .form-row { display: flex; gap: 15px; }
    .form-row .form-group { flex: 1; }
    label { display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 5px; color: #4a5568; }
    input { width: 100%; padding: 10px; border: 1px solid #cbd5e0; border-radius: 6px; box-sizing: border-box; }
    
    .msg-box { padding: 10px; border-radius: 6px; margin-top: 10px; text-align: center; background: #fed7d7; color: #c53030; }
    .empty-state { text-align: center; color: #a0aec0; padding: 20px 0; }
</style>