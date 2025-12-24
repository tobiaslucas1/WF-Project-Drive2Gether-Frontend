<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// --- STATE ---
const user = ref(null);
const loading = ref(true);
const activeTab = ref('driver'); // 'driver' of 'passenger'

// De lijsten met ritten
const drivenTrips = ref([]);   // Ritten waar ik rijd
const bookedTrips = ref([]);   // Ritten waar ik mee rijd
const error = ref('');

// --- LIFECYCLE ---
onMounted(async () => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        router.push('/login');
        return;
    }
    const localUser = JSON.parse(userStr);
    user.value = localUser;

    await fetchMyTrips(localUser.UserID);
    loading.value = false;
});

// --- METHODS ---

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
                    return {
                        ...tripDetails, 
                        MyBookingStatus: booking.BookingStatus 
                    };
                }).filter(t => t && t.TripID);
            }
        }
    } catch (err) {
        console.error("Fout bij ophalen ritten:", err);
        error.value = "Kon ritten niet laden. Check of je backend draait.";
    }
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('nl-NL', { 
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }).format(date);
};

const getStatusClass = (status) => {
    switch(status) {
        case 'Scheduled': return 'badge-blue';
        case 'Completed': return 'badge-green';
        case 'Cancelled': return 'badge-red';
        case 'Confirmed': return 'badge-green'; 
        case 'Pending': return 'badge-orange'; 
        default: return 'badge-gray';
    }
};
</script>

<template>
    <div class="page-container">
        <div class="header-section">
            <h1>Mijn Ritten</h1>
            
            <div class="tabs">
                <button 
                    :class="['tab-btn', activeTab === 'driver' ? 'active' : '']"
                    @click="activeTab = 'driver'"
                >
                    🚗 Ik ben Chauffeur
                </button>
                <button 
                    :class="['tab-btn', activeTab === 'passenger' ? 'active' : '']"
                    @click="activeTab = 'passenger'"
                >
                    🙋‍♂️ Ik ben Passagier
                </button>
            </div>
        </div>

        <div v-if="loading" class="loading">Ritten laden...</div>
        <div v-if="error" class="error-box">{{ error }}</div>

        <div v-else-if="activeTab === 'driver'" class="trip-list animate-fade">
            <div v-if="drivenTrips.length === 0" class="empty-state">
                <p>Je hebt nog geen ritten aangeboden.</p>
                <button @click="router.push('/create-ride')" class="btn-action">Rit Aanbieden</button>
            </div>

            <div v-for="trip in drivenTrips" :key="trip.TripID" class="trip-card">
                <div class="trip-header">
                    <span class="trip-date">{{ formatDate(trip.DepartureTime) }}</span>
                    <span :class="['badge', getStatusClass(trip.TripStatus)]">{{ trip.TripStatus }}</span>
                </div>
                
                <div class="route-display">
                    <div class="location">
                        <span class="dot start"></span>
                        <strong>{{ trip.StartLocation }}</strong>
                    </div>
                    <div class="line"></div>
                    <div class="location">
                        <span class="dot end"></span>
                        <strong>{{ trip.EndLocation }}</strong>
                    </div>
                </div>

                <div class="trip-footer">
                    <div class="info">
                        <span>💺 {{ trip.SeatsBooked }} / {{ trip.SeatsOffered }} geboekt</span>
                        <span>💰 €{{ trip.Price }}</span>
                    </div>
                    <button class="btn-details">Details</button>
                </div>
            </div>
        </div>

        <div v-else class="trip-list animate-fade">
            <div v-if="bookedTrips.length === 0" class="empty-state">
                <p>Je hebt nog geen ritten geboekt.</p>
                <button @click="router.push('/')" class="btn-action">Zoek een rit</button>
            </div>

            <div v-for="trip in bookedTrips" :key="'booking-'+trip.TripID" class="trip-card">
                <div class="trip-header">
                    <span class="trip-date">{{ formatDate(trip.DepartureTime) }}</span>
                    <span :class="['badge', getStatusClass(trip.MyBookingStatus)]">
                        Boeking: {{ trip.MyBookingStatus || 'Unknown' }}
                    </span>
                </div>
                
                <div class="route-display">
                    <div class="location">
                        <span class="dot start"></span>
                        <strong>{{ trip.StartLocation }}</strong>
                    </div>
                    <div class="line"></div>
                    <div class="location">
                        <span class="dot end"></span>
                        <strong>{{ trip.EndLocation }}</strong>
                    </div>
                </div>

                <div class="trip-footer">
                    <div class="info">
                        <span>Prijs: <strong>€{{ trip.Price }}</strong></span>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped>
.page-container { max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: 'Segoe UI', sans-serif; }
.header-section { margin-bottom: 30px; text-align: center; }
h1 { color: #2d3748; margin-bottom: 20px; }

/* Tabs */
.tabs { display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; }
.tab-btn {
    padding: 10px 20px; border: none; background: #e2e8f0; border-radius: 20px;
    cursor: pointer; font-weight: 600; color: #4a5568; transition: all 0.2s;
}
.tab-btn.active { background: #3182ce; color: white; transform: scale(1.05); }

/* Cards */
.trip-list { display: flex; flex-direction: column; gap: 20px; }
.trip-card {
    background: white; border: 1px solid #e2e8f0; border-radius: 12px;
    padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: transform 0.2s;
}
.trip-card:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.08); }

.trip-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.trip-date { color: #718096; font-size: 0.9rem; font-weight: 500; }

/* Route visualisatie */
.route-display { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
.location { display: flex; align-items: center; gap: 8px; color: #2d3748; }
.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.dot.start { background: #3182ce; }
.dot.end { background: #38a169; }
.line { flex: 1; height: 2px; background: #cbd5e0; min-width: 20px; }

.trip-footer { 
    display: flex; justify-content: space-between; align-items: center; 
    border-top: 1px solid #edf2f7; padding-top: 15px;
}
.info { display: flex; gap: 15px; color: #4a5568; font-size: 0.9rem; }

/* Badges */
.badge { padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: bold; }
.badge-blue { background: #ebf8ff; color: #3182ce; }
.badge-green { background: #f0fff4; color: #38a169; }
.badge-red { background: #fff5f5; color: #e53e3e; }
.badge-orange { background: #fffaf0; color: #dd6b20; }
.badge-gray { background: #edf2f7; color: #718096; }

/* Empty state */
.empty-state { text-align: center; padding: 40px; color: #a0aec0; background: #f7fafc; border-radius: 12px; }
.btn-action { margin-top: 15px; background: #3182ce; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; }
.btn-details { background: white; border: 1px solid #cbd5e0; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
.btn-details:hover { background: #f7fafc; }
.error-box { background: #fed7d7; color: #c53030; padding: 15px; border-radius: 8px; text-align: center; }

/* Animation */
.animate-fade { animation: fadeIn 0.3s ease-in; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>