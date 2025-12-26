<script setup>
// --- Imports ---
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// --- Data ---
const trip = ref(null);
const loading = ref(true);
const error = ref('');
const isBooking = ref(false);

const averageRating = ref(0);
const totalReviews = ref(0);

// --- Lifecycles ---
onMounted(async () => {
    const tripId = route.params.id;
    await fetchTripDetails(tripId);
});

// --- Methods ---
const fetchTripDetails = async (id) => {
    try {
        const res = await fetch(`http://localhost:3000/trips/${id}`);
        if (res.ok) {
            const data = await res.json();
            trip.value = data;
            
            if (data.DriverID) {
                await fetchDriverRating(data.DriverID);
            }
        } else {
            error.value = "Rit kon niet worden gevonden.";
        }
    } catch (e) {
        console.error(e);
        error.value = "Er is een fout opgetreden bij het laden van de details.";
    } finally {
        loading.value = false;
    }
};

const fetchDriverRating = async (driverId) => {
    const res = await fetch(`http://localhost:3000/reviews/user/${driverId}`);
    if (res.ok) {
        const reviews = await res.json();
        totalReviews.value = reviews.length;
        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, r) => acc + r.Rating, 0);
            averageRating.value = (sum / reviews.length).toFixed(1);
        }
    }
};

const bookTrip = async () => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        alert("Je moet ingelogd zijn om een rit te boeken.");
        router.push('/login');
        return;
    }
    const user = JSON.parse(userStr);

    if (user.UserID === trip.value.DriverID) {
        alert("Je kunt niet je eigen rit boeken!");
        return;
    }

    if (isBooking.value) return;
    isBooking.value = true;

    try {
        const res = await fetch('http://localhost:3000/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                TripID: trip.value.TripID,
                PassengerID: user.UserID,
                SeatsRequested: 1
            })
        });

        if (res.ok) {
            router.push('/booking-success');
        } else {
            const data = await res.json();
            alert(data.message || "Er ging iets mis bij het boeken.");
        }
    } catch (e) {
        console.error(e);
        alert("Kon geen verbinding maken met de server.");
    } finally {
        isBooking.value = false;
    }
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
    });
};

const handleImageError = (e) => {
    e.target.src = 'https://cdn-icons-png.flaticon.com/512/847/847969.png';
};
</script>

<template>
    <div class="trip-details-container">
        <button @click="router.back()" class="btn-back">← Terug naar overzicht</button>

        <div v-if="loading" class="loading">Ritgegevens laden...</div>
        <div v-else-if="error" class="error-msg">{{ error }}</div>

        <div v-else-if="trip" class="details-card">
            <div class="route-header">
                <h1>{{ trip.StartLocation }} ➝ {{ trip.EndLocation }}</h1>
                <div class="price-tag">€ {{ trip.Price }}</div>
            </div>

            <div class="time-section">
                <span class="icon">📅</span>
                <span>{{ formatDate(trip.DepartureTime) }}</span>
            </div>

            <hr class="divider">

            <div class="section">
                <h3>De Chauffeur</h3>
                <div class="driver-info">
                    <img 
                        :src="trip.user?.ProfilePicture || 'https://cdn-icons-png.flaticon.com/512/847/847969.png'" 
                        class="driver-avatar"
                        alt="Chauffeur"
                        @error="handleImageError"
                    >
                    <div class="driver-text">
                        <div class="name">{{ trip.user?.FirstName }} {{ trip.user?.LastName }}</div>
                        
                        <div class="rating-row" v-if="totalReviews > 0">
                            <span class="stars">
                                <span v-for="n in 5" :key="n" :class="['star', n <= Math.round(averageRating) ? 'filled' : '']">★</span>
                            </span>
                            <span class="rating-text"><strong>{{ averageRating }}</strong> ({{ totalReviews }} reviews)</span>
                        </div>
                        <div v-else class="no-rating-text">Nog geen reviews</div>

                        <div class="contact-info" v-if="trip.user?.Email">📧 {{ trip.user.Email }}</div>
                        <button 
                            @click="router.push(`/user-reviews/${trip.DriverID}`)" 
                            class="btn-reviews-link"
                        >
                            Alle reviews bekijken
                        </button>
                    </div>
                </div>
            </div>

            <hr class="divider">

            <div class="section" v-if="trip.car">
                <h3>De Auto</h3>
                <div class="car-info">
                    <span class="car-name">🚗 {{ trip.car.Brand }} {{ trip.car.Model }}</span>
                    <span class="car-plate" v-if="trip.car.LicensePlate">{{ trip.car.LicensePlate }}</span>
                </div>
            </div>

            <div class="footer-actions">
                <div class="seats-left">
                    💺 {{ trip.SeatsOffered - trip.SeatsBooked }} plekken beschikbaar
                </div>
                <button 
                    class="btn-book" 
                    @click="bookTrip"
                    :disabled="trip.SeatsOffered <= trip.SeatsBooked || isBooking"
                >
                    {{ isBooking ? 'Bezig...' : 'Rit Boeken' }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.trip-details-container {
    max-width: 700px;
    margin: 40px auto;
    padding: 0 20px;
    font-family: 'Segoe UI', sans-serif;
}

.btn-back {
    background: none;
    border: none;
    color: #3182ce;
    font-weight: bold;
    cursor: pointer;
    margin-bottom: 20px;
}

.details-card {
    background: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
}

.route-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
}

.route-header h1 {
    margin: 0;
    font-size: 1.8rem;
    color: #2d3748;
}

.price-tag {
    background: #ebf8ff;
    color: #2b6cb0;
    padding: 8px 16px;
    border-radius: 12px;
    font-weight: bold;
    font-size: 1.2rem;
}

.time-section {
    color: #718096;
    margin-bottom: 30px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.divider {
    border: 0;
    border-top: 1px solid #edf2f7;
    margin: 25px 0;
}

.section h3 {
    font-size: 0.9rem;
    text-transform: uppercase;
    color: #a0aec0;
    margin-bottom: 15px;
    letter-spacing: 1px;
}

.driver-info {
    display: flex;
    align-items: center;
    gap: 20px;
}

.driver-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #ebf8ff;
}

.driver-text .name {
    font-size: 1.2rem;
    font-weight: bold;
    color: #2d3748;
    margin-bottom: 2px;
}

.rating-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 5px;
}

.stars {
    color: #e2e8f0;
    font-size: 1.1rem;
}

.star.filled {
    color: #ecc94b;
}

.rating-text {
    font-size: 0.9rem;
    color: #4a5568;
}

.no-rating-text {
    font-size: 0.85rem;
    color: #a0aec0;
    margin-bottom: 5px;
    font-style: italic;
}

.contact-info {
    color: #718096;
    font-size: 0.9rem;
    margin-top: 4px;
}

.btn-reviews-link {
    background: none;
    border: none;
    color: #3182ce;
    padding: 0;
    font-size: 0.9rem;
    cursor: pointer;
    text-decoration: underline;
    margin-top: 5px;
}

.car-info {
    display: flex;
    align-items: center;
    gap: 15px;
}

.car-plate {
    background: #fefcbf;
    color: #744210;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 0.8rem;
    border: 1px solid #ecc94b;
}

.footer-actions {
    margin-top: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.seats-left {
    font-weight: 600;
    color: #48bb78;
}

.btn-book {
    background: #3182ce;
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-book:hover:not(:disabled) {
    background: #2b6cb0;
}

.btn-book:disabled {
    background: #cbd5e0;
    cursor: not-allowed;
}

.loading, .error-msg {
    text-align: center;
    padding: 40px;
    color: #718096;
}
</style>