<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// --- STATE ---
const loading = ref(true);
const activeTab = ref('driver'); 
const drivenTrips = ref([]);   
const bookedTrips = ref([]);   
const error = ref('');
const currentUser = ref(null);

// --- LIFECYCLE ---
onMounted(async () => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) { router.push('/login'); return; }
    currentUser.value = JSON.parse(userStr);
    
    await fetchMyTrips(currentUser.value.UserID);
    loading.value = false;
});

// --- DATA OPHALEN ---
const fetchMyTrips = async (userId) => {
    try {
        const tripsResponse = await fetch('http://localhost:3000/trips');
        const bookingsResponse = await fetch('http://localhost:3000/bookings').catch(() => null);

        if (tripsResponse.ok) {
            const allTrips = await tripsResponse.json();

            drivenTrips.value = allTrips.filter(t => t.DriverID == userId);
            
            if (bookingsResponse && bookingsResponse.ok) {
                const allBookings = await bookingsResponse.json();
                const myBookings = allBookings.filter(b => b.PassengerID == userId);
                
                bookedTrips.value = myBookings.map(booking => {
                    const tripDetails = allTrips.find(t => t.TripID == booking.TripID);
                    if (tripDetails) {
                        return { 
                            ...tripDetails, 
                            MyBookingStatus: booking.BookingStatus 
                        };
                    }
                    return null;
                }).filter(t => t !== null);
            }
        }
    } catch (err) {
        console.error("Error:", err);
        error.value = "Kon ritten niet laden.";
    }
};

const getTripPhase = (trip) => {
    if (trip.TripStatus === 'Cancelled') return 'CANCELLED';

    if (trip.TripStatus === 'Completed') return 'COMPLETED';

    const now = new Date();
    const departure = new Date(trip.DepartureTime);

    if (now >= departure) return 'LIVE';

    return 'FUTURE';
};

const handleTripClick = (trip) => {
    const phase = getTripPhase(trip);

    if (phase === 'CANCELLED') return; 

    if (phase === 'LIVE' || phase === 'COMPLETED') {
        router.push(`/live/${trip.TripID}`);
    } else {
        router.push(`/trips/${trip.TripID}`);
    }
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('nl-NL', { 
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
};

const getStatusBadge = (trip) => {
    const phase = getTripPhase(trip);
    if (phase === 'CANCELLED') return { text: 'Geannuleerd', class: 'badge-red' };
    if (phase === 'COMPLETED') return { text: 'Afgelopen', class: 'badge-gray' };
    if (phase === 'LIVE') return { text: 'Nu Bezig', class: 'badge-live' };
    return { text: 'Gepland', class: 'badge-blue' };
};
</script>

<template>
    <div class="page-container">
        <div class="header-section">
            <h1>Mijn Ritten</h1>
            <div class="tabs">
                <button :class="['tab-btn', activeTab === 'driver' ? 'active' : '']" @click="activeTab = 'driver'">
                    🚗 Ik ben Chauffeur
                </button>
                <button :class="['tab-btn', activeTab === 'passenger' ? 'active' : '']" @click="activeTab = 'passenger'">
                    🙋‍♂️ Ik ben Passagier
                </button>
            </div>
        </div>

        <div v-if="loading" class="loading">Laden...</div>

        <div v-else class="trip-list animate-fade">
            
            <div v-if="activeTab === 'driver' && drivenTrips.length === 0" class="empty-state">
                <p>Nog geen ritten aangeboden.</p>
                <button @click="router.push('/create-ride')" class="btn-action">Rit Aanbieden</button>
            </div>
            <div v-if="activeTab === 'passenger' && bookedTrips.length === 0" class="empty-state">
                <p>Nog geen ritten geboekt.</p>
                <button @click="router.push('/trips')" class="btn-action">Rit Zoeken</button>
            </div>

            <div 
                v-for="trip in (activeTab === 'driver' ? drivenTrips : bookedTrips)" 
                :key="trip.TripID" 
                class="trip-card"
                :class="{ 'passenger-border': activeTab === 'passenger' }"
            >
                <div class="trip-header">
                    <span class="trip-date">{{ formatDate(trip.DepartureTime) }}</span>
                    <span :class="['badge', getStatusBadge(trip).class]">
                        {{ getStatusBadge(trip).text }}
                    </span>
                </div>
                
                <div class="route-display">
                    <strong>{{ trip.StartLocation }}</strong>
                    <span class="arrow">➝</span>
                    <strong>{{ trip.EndLocation }}</strong>
                </div>

                <div class="trip-footer">
                    <div class="info-text">
                        <span v-if="activeTab === 'driver'">💺 {{ trip.SeatsBooked }}/{{ trip.SeatsOffered }}</span>
                        <span v-else>💰 €{{ trip.Price }}</span>
                    </div>
                    
                    <button 
                        v-if="getTripPhase(trip) === 'FUTURE'" 
                        class="btn-base btn-details" 
                        @click="handleTripClick(trip)"
                    >
                        Details
                    </button>

                    <button 
                        v-else-if="getTripPhase(trip) === 'LIVE'" 
                        class="btn-base btn-live" 
                        @click="handleTripClick(trip)"
                    >
                        🔴 Ga naar Rit
                    </button>

                    <button 
                        v-else-if="getTripPhase(trip) === 'COMPLETED'" 
                        class="btn-base btn-completed" 
                        @click="handleTripClick(trip)"
                    >
                        🏁 Samenvatting
                    </button>

                     <button 
                        v-else-if="getTripPhase(trip) === 'CANCELLED'" 
                        class="btn-base btn-disabled" 
                        disabled
                    >
                        Geannuleerd
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page-container { max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: 'Segoe UI', sans-serif; }
.header-section { margin-bottom: 30px; text-align: center; }
h1 { color: #2d3748; margin-bottom: 20px; }

.tabs { display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; }
.tab-btn { padding: 10px 20px; border: none; background: #e2e8f0; border-radius: 20px; cursor: pointer; font-weight: 600; color: #4a5568; transition: all 0.2s; }
.tab-btn.active { background: #3182ce; color: white; transform: scale(1.05); }

.trip-list { display: flex; flex-direction: column; gap: 20px; }
.trip-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: transform 0.2s; }
.trip-card:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.08); }
.passenger-border { border-left: 4px solid #38a169; }

.trip-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.trip-date { color: #718096; font-size: 0.9rem; font-weight: 500; }
.route-display { display: flex; align-items: center; gap: 10px; font-size: 1.2rem; color: #2d3748; margin-bottom: 20px; }
.arrow { color: #cbd5e0; }
.trip-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #edf2f7; padding-top: 15px; }

.btn-base { padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; border: none; font-size: 0.9rem; transition: background 0.2s; }

.btn-details { background: white; border: 1px solid #cbd5e0; color: #4a5568; }
.btn-details:hover { background: #f7fafc; border-color: #3182ce; color: #3182ce; }

.btn-live { background: #e53e3e; color: white; animation: pulse 2s infinite; }
@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.8; } 100% { opacity: 1; } }

.btn-completed { background: #38a169; color: white; }
.btn-completed:hover { background: #2f855a; }

.btn-disabled { background: #edf2f7; color: #a0aec0; cursor: not-allowed; }

.badge { padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; }
.badge-blue { background: #ebf8ff; color: #3182ce; }
.badge-live { background: #ffe2e2; color: #e53e3e; border: 1px solid #feb2b2; }
.badge-gray { background: #edf2f7; color: #718096; }
.badge-red { background: #fff5f5; color: #c53030; }

.empty-state { text-align: center; padding: 40px; color: #a0aec0; background: #f7fafc; border-radius: 12px; }
.btn-action { margin-top: 15px; background: #3182ce; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; }
.animate-fade { animation: fadeIn 0.3s ease-in; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>