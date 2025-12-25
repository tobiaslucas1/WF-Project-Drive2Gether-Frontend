<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const trip = ref(null);
const driver = ref(null);
const passengers = ref([]);
const currentUser = ref(null);
const loading = ref(true);
const pollingInterval = ref(null);

// --- REVIEW STATE ---
const showReviewForm = ref(false);
const reviewRating = ref(0);
const reviewComment = ref('');
const reviewSubmitted = ref(false);

// --- LIFECYCLE ---
onMounted(async () => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) { router.push('/login'); return; }
    currentUser.value = JSON.parse(userStr);

    await fetchTripData();

    // refreshed elke minuut
    pollingInterval.value = setInterval(fetchTripData, 60000);
});

onUnmounted(() => {
    if (pollingInterval.value) clearInterval(pollingInterval.value);
});

// --- METHODS ---
const fetchTripData = async () => {
    try {
        const tripId = route.params.id;
        
        const res = await fetch(`http://localhost:3000/trips/${tripId}`);
        if (res.ok) {
            trip.value = await res.json();
            
            if (trip.value.TripStatus === 'Cancelled') {
                alert("Deze rit is geannuleerd.");
                router.push('/my-trips');
                return;
            }
        }

        if (trip.value.DriverID) {
            const driverRes = await fetch(`http://localhost:3000/users/${trip.value.DriverID}`);
            if (driverRes.ok) {
                driver.value = await driverRes.json();
            } else {
                driver.value = { FirstName: 'Onbekende', LastName: 'Chauffeur' };
            }
        }

        if (isDriver.value) {
            const bookingsRes = await fetch(`http://localhost:3000/bookings?TripID=${tripId}`);
            if (bookingsRes.ok) {
                const bookings = await bookingsRes.json();
                
                const paxList = [];
                for (let b of bookings) {
                    const uRes = await fetch(`http://localhost:3000/users/${b.PassengerID}`);
                    if (uRes.ok) {
                        const u = await uRes.json();
                        paxList.push({ ...u, status: b.BookingStatus });
                    }
                }
                passengers.value = paxList;
            }
        }

    } catch (e) {
        console.error("Fout bij laden live trip", e);
    } finally {
        loading.value = false;
    }
};

const endTrip = async () => {
    if (!confirm("Ben je aangekomen op de bestemming? Hiermee beëindig je de rit.")) return;

    try {
        const response = await fetch(`http://localhost:3000/trips/${trip.value.TripID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ TripStatus: 'Completed' })
        });

        if (response.ok) {
            trip.value.TripStatus = 'Completed';
        }
    } catch (e) {
        alert("Kon rit niet beëindigen.");
    }
};

const submitReview = async () => {
    if (reviewRating.value === 0) {
        alert("Selecteer alsjeblieft een aantal sterren.");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                TripID: trip.value.TripID,
                ReviewerID: currentUser.value.UserID,
                ReviewedID: trip.value.DriverID,
                Rating: reviewRating.value,
                Comment: reviewComment.value,
                ReviewType: 'Driver'
            })
        });

        if (response.ok) {
            reviewSubmitted.value = true;
            showReviewForm.value = false;
        } else {
            alert("Er ging iets mis bij het opslaan van de review.");
        }
    } catch (e) {
        console.error(e);
        alert("Kon review niet versturen.");
    }
};

const goBack = () => {
    router.push('/my-trips');
};

// --- COMPUTED ---
const isDriver = computed(() => {
    return currentUser.value && trip.value && currentUser.value.UserID === trip.value.DriverID;
});

const isCompleted = computed(() => {
    return trip.value && trip.value.TripStatus === 'Completed';
});

const timeDisplay = computed(() => {
    if (!trip.value) return '';
    const date = new Date(trip.value.DepartureTime);
    return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
});
</script>

<template>
    <div class="live-container">
        
        <div v-if="loading" class="loading">Verbinding maken met voertuig...</div>

        <div v-else-if="trip" class="dashboard">
            
            <div :class="['status-bar', isCompleted ? 'completed' : 'active']">
                <div class="pulse-icon" v-if="!isCompleted">🔴 LIVE</div>
                <div class="pulse-icon" v-else>🏁 FINISH</div>
                <h2>{{ isCompleted ? 'Aangekomen!' : 'Onderweg' }}</h2>
            </div>

            <div class="card main-card">
                <div class="route-visual">
                    <div class="point">
                        <span class="dot start"></span>
                        <span class="city">{{ trip.StartLocation }}</span>
                        <span class="time">{{ timeDisplay }}</span>
                    </div>
                    <div class="path-line">
                        <span class="car-emoji" :class="{ moved: isCompleted }">🚗</span>
                    </div>
                    <div class="point">
                        <span class="dot end"></span>
                        <span class="city">{{ trip.EndLocation }}</span>
                        <span class="time">Aankomst</span>
                    </div>
                </div>
            </div>

            <!-- Driver -->
            <div v-if="isDriver" class="card info-card">
                <h3>👮‍♂️ Jouw Passagiers</h3>
                <ul class="passenger-list">
                    <li v-for="p in passengers" :key="p.UserID">
                        <span>{{ p.FirstName }} {{ p.LastName }}</span>
                        <span class="status-ok" v-if="p.status === 'Confirmed'">✅</span>
                    </li>
                    <li v-if="passengers.length === 0" class="empty">Nog geen passagiers</li>
                </ul>

                <div v-if="!isCompleted" class="actions">
                    <button class="btn-end-trip" @click="endTrip">🏁 Rit Beëindigen</button>
                </div>
                <div v-else class="actions">
                    <p class="success-msg">De rit is afgelopen. Goed gereden!</p>
                    <button class="btn-back" @click="goBack">Terug naar Dashboard</button>
                </div>
            </div>

            <!--  PASSAGIER -->
            <div v-else class="card info-card">
                <h3>🚗 Jouw Chauffeur</h3>
                <div v-if="driver" class="driver-details">
                    <div class="avatar">👤</div>
                    <div>
                        <strong>{{ driver.FirstName }}</strong>
                        <div class="car-info" v-if="trip.car">
                            {{ trip.car.Brand }} {{ trip.car.Model }} <br>
                            <span class="plate">{{ trip.car.LicensePlate }}</span>
                        </div>
                    </div>
                </div>

                <!-- EINDE RIT  -->
                <div v-if="isCompleted" class="passenger-finish">
                    <h3>We zijn er! 🎉</h3>
                    
                    <!--  Review button -->
                    <div v-if="!reviewSubmitted && !showReviewForm">
                        <p>Bedankt voor het meerijden.</p>
                        <button class="btn-review" @click="showReviewForm = true">⭐ Schrijf een Review</button>
                        <button class="btn-back" @click="goBack">Terug naar Ritten</button>
                    </div>

                    <!--  Het Review Formulier -->
                    <div v-else-if="showReviewForm" class="review-form">
                        <h4>Hoe was je rit met {{ driver.FirstName }}?</h4>
                        
                        <!-- Sterren Selectie -->
                        <div class="star-rating">
                            <span 
                                v-for="star in 5" 
                                :key="star" 
                                class="star" 
                                :class="{ filled: star <= reviewRating }"
                                @click="reviewRating = star"
                            >★</span>
                        </div>
                        <p class="rating-text" v-if="reviewRating > 0">{{ reviewRating }}/5 Sterren</p>

                        <!-- Commentaar -->
                        <textarea 
                            v-model="reviewComment" 
                            placeholder="Schrijf een opmerking (optioneel)..."
                            rows="3"
                        ></textarea>

                        <div class="review-actions">
                            <button class="btn-cancel" @click="showReviewForm = false">Annuleren</button>
                            <button class="btn-submit" @click="submitReview">Versturen</button>
                        </div>
                    </div>

                    <!-- 3. Bedankt bericht -->
                    <div v-else class="review-thanks">
                        <p>Bedankt voor je feedback! ⭐</p>
                        <button class="btn-back" @click="goBack">Terug naar Ritten</button>
                    </div>

                </div>
                <div v-else class="passenger-waiting">
                    <p>Geniet van de rit!</p>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
.live-container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', sans-serif; }

/* Status Bar */
.status-bar { text-align: center; padding: 20px; border-radius: 12px; color: white; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); transition: background 0.5s; }
.status-bar.active { background: linear-gradient(135deg, #3182ce, #2c5282); }
.status-bar.completed { background: linear-gradient(135deg, #38a169, #276749); }
.pulse-icon { font-weight: bold; letter-spacing: 2px; font-size: 0.9rem; margin-bottom: 5px; animation: pulse 2s infinite; }
@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

/* Route Visual */
.main-card { background: white; padding: 30px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
.route-visual { display: flex; justify-content: space-between; align-items: center; position: relative; }
.point { text-align: center; z-index: 1; }
.dot { display: block; width: 15px; height: 15px; border-radius: 50%; margin: 0 auto 10px; }
.dot.start { background: #3182ce; }
.dot.end { background: #38a169; }
.city { display: block; font-weight: bold; font-size: 1.1rem; }
.time { font-size: 0.9rem; color: #718096; }

.path-line { position: absolute; top: 7px; left: 40px; right: 40px; height: 3px; background: #e2e8f0; z-index: 0; }
.car-emoji { position: absolute; top: -15px; left: 0%; font-size: 1.5rem; transition: left 2s ease-in-out; }
.car-emoji.moved { left: 95%; }

/* Info Cards */
.info-card { background: white; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; }
.info-card h3 { margin-top: 0; border-bottom: 1px solid #edf2f7; padding-bottom: 10px; }

/* Driver Styles */
.passenger-list { list-style: none; padding: 0; }
.passenger-list li { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #eee; }
.btn-end-trip { width: 100%; background: #e53e3e; color: white; padding: 15px; font-size: 1.1rem; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; margin-top: 20px; }
.btn-end-trip:hover { background: #c53030; }
.success-msg { text-align: center; color: #38a169; font-weight: bold; font-size: 1.1rem; }

/* Passenger Styles */
.driver-details { display: flex; align-items: center; gap: 15px; margin-top: 15px; }
.avatar { font-size: 2rem; background: #edf2f7; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.car-info { font-size: 0.9rem; color: #4a5568; margin-top: 2px; }
.plate { background: #ffcc00; color: black; padding: 0 4px; border-radius: 3px; font-weight: bold; font-size: 0.8rem; border: 1px solid #000; }
.passenger-finish { text-align: center; margin-top: 20px; background: #f0fff4; padding: 20px; border-radius: 8px; border: 1px solid #c6f6d5; }

/* REVIEW STYLES */
.btn-review { width: 100%; background: #ecc94b; color: #744210; padding: 12px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; margin-bottom: 10px; }
.btn-review:hover { background: #d69e2e; }

.review-form { background: white; padding: 10px; border-radius: 8px; }
.star-rating { font-size: 2.5rem; color: #cbd5e0; cursor: pointer; user-select: none; }
.star { transition: color 0.2s; }
.star.filled { color: #ecc94b; } 
.star:hover { color: #f6e05e; }

.rating-text { font-weight: bold; color: #744210; margin-top: -5px; margin-bottom: 10px; }

textarea { width: 100%; padding: 10px; border: 1px solid #cbd5e0; border-radius: 6px; box-sizing: border-box; margin-bottom: 10px; }
.review-actions { display: flex; gap: 10px; }
.btn-submit { flex: 1; background: #38a169; color: white; padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-cancel { flex: 1; background: #edf2f7; color: #4a5568; padding: 10px; border: none; border-radius: 6px; cursor: pointer; }

.review-thanks { padding: 20px; font-size: 1.2rem; font-weight: bold; color: #38a169; }

.btn-back { width: 100%; background: #edf2f7; color: #2d3748; padding: 12px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
.btn-back:hover { background: #e2e8f0; }
</style>