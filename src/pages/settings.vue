<script setup>
    import { ref, onMounted } from 'vue';
    import { useRouter } from 'vue-router';

    const router = useRouter();

    // --- DATA ---
    const user = ref({});
    const myCars = ref([]); 
    const loading = ref(true);
    
    // Review Data (Nieuw)
    const reviews = ref([]);
    const averageRating = ref(0);

    // Status berichten
    const message = ref('');
    const messageType = ref('');

    // Wachtwoord velden
    const newPassword = ref('');
    const confirmPassword = ref('');

    // Auto toevoegen toggle
    const isAddingCar = ref(false); 
    const carForm = ref({
        Brand: '', Model: '', LicensePlate: '', Color: '', Seats: 1
    });

    // --- LIFECYCLE ---
    onMounted(async () => {
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) { router.push('/login'); return; }
        
        const localUser = JSON.parse(userStr);
        await fetchUserData(localUser.UserID);
        await fetchUserCars(localUser.UserID);
        await fetchUserReviews(localUser.UserID); // Reviews ophalen bij start
        loading.value = false;
    });

    // --- METHODS: GET DATA ---
    const fetchUserData = async (userId) => {
        try {
            const response = await fetch(`http://localhost:3000/users/${userId}`);
            if (response.ok) {
                const userData = await response.json();
                if (userData.DateOfBirth) {
                    userData.DateOfBirth = userData.DateOfBirth.split('T')[0];
                }
                user.value = userData;
            }
        } catch (error) { console.error("Fout bij laden gebruiker", error); }
    };

    const fetchUserCars = async (userId) => {
        try {
            const response = await fetch('http://localhost:3000/cars');
            if (response.ok) {
                const allCars = await response.json();
                myCars.value = allCars.filter(c => c.OwnerID === userId);
            }
        } catch (error) { console.error("Fout bij laden auto's", error); }
    };

    // NIEUW: Reviews ophalen en gemiddelde berekenen
    const fetchUserReviews = async (userId) => {
        try {
            const response = await fetch(`http://localhost:3000/reviews/user/${userId}`);
            if (response.ok) {
                const data = await response.json();
                reviews.value = data;

                // Bereken gemiddelde
                if (data.length > 0) {
                    const total = data.reduce((sum, review) => sum + review.Rating, 0);
                    averageRating.value = (total / data.length).toFixed(1); // 1 decimaal (bv. 4.5)
                } else {
                    averageRating.value = 0;
                }
            }
        } catch (error) { console.error("Kon reviews niet laden", error); }
    };

    // --- METHODS: UPDATE PROFIEL ---
    const updateProfile = async () => {
        message.value = '';
        try {
            const response = await fetch(`http://localhost:3000/users/${user.value.UserID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Email: user.value.Email,
                    PhoneNumber: user.value.PhoneNumber
                })
            });

            if (response.ok) {
                const updatedUser = await response.json();
                localStorage.setItem('currentUser', JSON.stringify(updatedUser)); 
                showMessage("Contactgegevens opgeslagen!", "success");
            } else {
                showMessage("Kon gegevens niet opslaan.", "error");
            }
        } catch (error) {
            showMessage("Server fout bij opslaan.", "error");
        }
    };

    const updatePassword = async () => {
        if (newPassword.value !== confirmPassword.value) {
            showMessage("Wachtwoorden komen niet overeen.", "error");
            return;
        }
        if (!newPassword.value) {
            showMessage("Vul een wachtwoord in.", "error");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/users/${user.value.UserID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Password: newPassword.value 
                })
            });

            if (response.ok) {
                showMessage("Wachtwoord succesvol gewijzigd!", "success");
                newPassword.value = '';
                confirmPassword.value = '';
            } else {
                showMessage("Fout bij wijzigen wachtwoord.", "error");
            }
        } catch (error) {
            showMessage("Kon wachtwoord niet wijzigen.", "error");
        }
    };

    // --- METHODS: DELETE ACCOUNT ---
    const deleteAccount = async () => {
        if (!confirm("⚠️ WEET JE HET ZEKER?\n\nJe account en al je auto's worden definitief verwijderd. Dit kan niet ongedaan worden gemaakt.")) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/users/${user.value.UserID}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert("Je account is verwijderd. Tot ziens!");
                localStorage.removeItem('currentUser');
                window.location.href = '/login';
            } else {
                const err = await response.json();
                showMessage(err.message || "Kon account niet verwijderen.", "error");
            }
        } catch (error) {
            showMessage("Server fout. Probeer het later opnieuw.", "error");
        }
    };

    // --- METHODS: CARS ---
    const addCar = async () => {
        try {
            const response = await fetch('http://localhost:3000/cars', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...carForm.value, OwnerID: user.value.UserID })
            });

            if (response.ok) {
                showMessage("Auto toegevoegd!", "success");
                isAddingCar.value = false;
                carForm.value = { Brand: '', Model: '', LicensePlate: '', Color: '', Seats: 4 };
                fetchUserCars(user.value.UserID);
            } else {
                const err = await response.json();
                showMessage(err.status || "Kon auto niet toevoegen", "error");
            }
        } catch (e) { showMessage("Fout bij toevoegen auto", "error"); }
    };

    const deleteCar = async (carId) => {
        if(!confirm("Weet je zeker dat je deze auto wilt verwijderen?")) return;
        try {
            const res = await fetch(`http://localhost:3000/cars/${carId}`, { method: 'DELETE' });
            if(res.ok) {
                fetchUserCars(user.value.UserID);
                showMessage("Auto verwijderd", "success");
            }
        } catch(e) { console.error(e); }
    };

    const showMessage = (msg, type) => {
        message.value = msg;
        messageType.value = type;
        setTimeout(() => message.value = '', 4000);
    };
</script>

<template>
    <div class="settings-page">
        <div class="header-section">
            <h1>⚙️ Instellingen</h1>
            <p>Beheer je profiel en voertuigen</p>
        </div>

        <div v-if="loading" class="loading">Gegevens laden...</div>

        <div v-else class="content-grid">
            
            <!-- Linker Kolom: Profiel -->
            <div class="left-col">
                
                <div class="card profile-card">
                    <!-- Header met Rating -->
                    <div class="profile-header-row">
                        <h2>👤 Mijn Gegevens</h2>
                        
                        <!-- Klikbare rating badge -->
                        <div class="rating-badge" @click="router.push('/my-reviews')" title="Bekijk details">
                            <span v-if="reviews.length > 0">⭐ {{ averageRating }} <small>({{ reviews.length }})</small></span>
                            <span v-else class="no-rating">Nog geen reviews</span>
                        </div>
                    </div>

                    <form @submit.prevent="updateProfile">
                        <div class="form-row">
                            <div class="field">
                                <label>Voornaam</label>
                                <input v-model="user.FirstName" disabled class="input-disabled">
                            </div>
                            <div class="field">
                                <label>Achternaam</label>
                                <input v-model="user.LastName" disabled class="input-disabled">
                            </div>
                        </div>

                        <div class="field">
                            <label>Adres</label>
                            <input v-model="user.Address" disabled class="input-disabled">
                        </div>

                        <hr class="divider">
                        <p class="hint">Je kunt hieronder je contactgegevens aanpassen:</p>

                        <div class="field">
                            <label>E-mailadres</label>
                            <input v-model="user.Email" type="email" required>
                        </div>

                        <div class="field">
                            <label>Telefoonnummer</label>
                            <input v-model="user.PhoneNumber" type="tel">
                        </div>

                        <button type="submit" class="btn-save">Wijzigingen Opslaan</button>
                    </form>

                    <!-- Nieuwe knop naar reviews pagina -->
                    <button @click="router.push('/my-reviews')" class="btn-view-reviews">
                        📜 Bekijk al mijn reviews
                    </button>
                </div>
                <!-- ACCOUNT VERWIJDEREN -->
                <div class="card danger-zone">
                    <h2>⚠️ Account Verwijderen</h2>
                    <p>Wil je stoppen met Drive2Gether? Als je op onderstaande knop drukt, worden al je gegevens verwijderd.</p>
                    <button @click="deleteAccount" class="btn-danger">Account Definitief Verwijderen</button>
                </div>

                
            </div>

            <!-- Rechter Kolom: Auto's & Gevarenzone -->
            <div class="right-col">
                <div class="card car-card">
                    <div class="card-header">
                        <h2>🚘 Mijn Auto's</h2>
                        <button @click="isAddingCar = !isAddingCar" class="btn-small">{{ isAddingCar ? 'Annuleren' : '+ Toevoegen' }}</button>
                    </div>

                    <div v-if="isAddingCar" class="add-car-form animate-fade">
                        <div class="field"><label>Merk</label><input v-model="carForm.Brand"></div>
                        <div class="field"><label>Model</label><input v-model="carForm.Model"></div>
                        <div class="field"><label>Kenteken</label><input v-model="carForm.LicensePlate"></div>
                        <div class="field"><label>Kleur</label><input v-model="carForm.Color"></div>
                        <div class="field"><label>Zitplaatsen</label><input v-model="carForm.Seats" type="number"></div>
                        <button @click="addCar" class="btn-confirm">Toevoegen</button>
                    </div>

                    <div class="car-list">
                        <div v-if="myCars.length === 0" class="empty-state">Geen auto's gekoppeld.</div>
                        <div v-for="car in myCars" :key="car.CarID" class="car-item">
                            <div class="car-info">
                                <strong>{{ car.Brand }} {{ car.Model }}</strong>
                                <span class="plate">{{ car.LicensePlate }}</span>
                            </div>
                            <button @click="deleteCar(car.CarID)" class="btn-delete">🗑️</button>
                        </div>
                    </div>

                    
                </div>
                <!-- WACHTWOORD -->
                <div class="card security-card">
                    <h2>🔒 Wachtwoord</h2>
                    <div class="field">
                        <label>Nieuw Wachtwoord</label>
                        <input v-model="newPassword" type="password" placeholder="Nieuw wachtwoord">
                    </div>
                    <div class="field">
                        <label>Bevestig Wachtwoord</label>
                        <input v-model="confirmPassword" type="password" placeholder="Herhaal wachtwoord">
                    </div>
                    <button @click="updatePassword" class="btn-outline">Update Wachtwoord</button>
                </div>


                
            </div>

        </div>

        <div v-if="message" :class="['toast', messageType]">{{ message }}</div>
    </div>
</template>

<style scoped>
.settings-page { max-width: 900px; margin: 0 auto; padding: 30px 20px; font-family: 'Segoe UI', sans-serif; }
.header-section { text-align: center; margin-bottom: 30px; }
.header-section h1 { margin: 0; color: #2d3748; }

.content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media(max-width: 768px) { .content-grid { grid-template-columns: 1fr; } }

.card { background: white; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 20px; }

/* Nieuwe Profile Header Styles */
.profile-header-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #edf2f7; padding-bottom: 10px; margin-bottom: 15px; }
.profile-header-row h2 { margin: 0; font-size: 1.2rem; color: #4a5568; }

.rating-badge { background: #fefcbf; color: #744210; padding: 5px 12px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: background 0.2s; font-size: 0.9rem; }
.rating-badge:hover { background: #faf089; }
.no-rating { color: #a0aec0; font-weight: normal; font-size: 0.8rem; }

.btn-view-reviews { width: 100%; background: none; border: none; color: #3182ce; font-weight: bold; margin-top: 15px; cursor: pointer; padding: 10px; border-top: 1px dashed #e2e8f0; }
.btn-view-reviews:hover { background: #ebf8ff; text-decoration: underline; }

/* Form Styles */
.field { margin-bottom: 15px; }
.form-row { display: flex; gap: 15px; }
.form-row .field { flex: 1; }
label { display: block; margin-bottom: 5px; font-weight: 600; color: #718096; font-size: 0.9rem; }
input { width: 100%; padding: 10px; border: 1px solid #cbd5e0; border-radius: 6px; box-sizing: border-box; }
input:focus { border-color: #3182ce; outline: none; }
.input-disabled { background-color: #edf2f7; color: #718096; cursor: not-allowed; border-color: #e2e8f0; }

.hint { font-size: 0.85rem; color: #718096; margin-bottom: 15px; font-style: italic; }
.divider { border: 0; border-top: 1px solid #edf2f7; margin: 20px 0; }

/* Buttons */
.btn-save { width: 100%; background: #3182ce; color: white; padding: 10px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn-save:hover { background: #2b6cb0; }
.btn-outline { width: 100%; background: white; border: 2px solid #3182ce; color: #3182ce; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn-outline:hover { background: #ebf8ff; }

/* Danger Zone */
.danger-zone { border: 1px solid #feb2b2; background: #fff5f5; }
.danger-zone h2 { color: #c53030; margin-top:0; border-bottom: 1px solid #feb2b2; padding-bottom: 10px; }
.danger-zone p { color: #9b2c2c; font-size: 0.9rem; }
.btn-danger { width: 100%; background: #e53e3e; color: white; padding: 12px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 10px; }
.btn-danger:hover { background: #c53030; }

/* Car Styles */
.card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #edf2f7; padding-bottom: 10px; margin-bottom: 15px; }
.card-header h2 { margin: 0; font-size: 1.2rem; color: #4a5568; }
.btn-small { background: #3182ce; color: white; border: none; padding: 5px 12px; border-radius: 15px; cursor: pointer; font-size: 0.85rem; }
.btn-confirm { background: #38a169; color: white; border: none; padding: 8px; border-radius: 6px; width: 100%; cursor: pointer; margin-top: 5px; }
.car-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f7fafc; border-radius: 8px; margin-bottom: 10px; }
.plate { background: #ecc94b; color: black; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; margin-left: 10px; border: 1px solid black; }
.btn-delete { background: none; border: none; cursor: pointer; }

/* Toast */
.toast { position: fixed; bottom: 20px; right: 20px; padding: 15px 25px; border-radius: 8px; color: white; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideIn 0.3s ease-out; z-index: 100; }
.toast.success { background: #38a169; }
.toast.error { background: #e53e3e; }

@keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>