<script setup>
    //------ imports ------
    import { ref, onMounted } from 'vue';
    import { useRoute, useRouter } from 'vue-router';

    // ------ activeer de router ------
    const router = useRouter();
    const route = useRoute();
    //------- data -------
    
    const trip = ref(null);

    //------ lifecycles ------
    onMounted(async () => {
        const tripId = route.params.id;
        try {
            const response = await fetch(`http://localhost:3000/trips/${tripId}`);
            if (!response.ok) throw new Error('Rit niet gevonden');
            trip.value = await response.json();
        } catch (err) {
            console.error(err);
            error.value = 'Kan rit details niet laden.';
        } finally {
            loading.value = false;
        }
    });
    
    // ------- methods -------
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const datePart = new Date(dateString).toLocaleDateString('nl-NL', { 
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
        const timePart = new Date(dateString).toLocaleTimeString('nl-NL', {
            hour: '2-digit', minute: '2-digit'
        });
        return { date: datePart, time: timePart }; 
    };

    const bookTrip = async () => {
        const currentUserStr = localStorage.getItem('currentUser');

        if (!currentUserStr) {
            alert("Je moet ingelogd zijn om te boeken!");
            router.push('/login'); 
            return;
        }

        const currentUser = JSON.parse(currentUserStr);
        
        const response = await fetch('http://localhost:3000/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                TripID: trip.value.TripID,
                PassengerID: currentUser.UserID
            })
        });
        const result = await response.json();
        if (response.ok) {
            router.push('/BookingSuccess');
        } 
        else {
            alert("Boeking mislukt: " + result.message);
        }
    };

    
</script>

<template>
    <div class="details-container">
        <div v-if="trip" class="content-wrapper">

            <header class="trip-header">
                <div class="route-display">
                    <h1 class="city">{{ trip.StartLocation }}</h1>
                    <div class="arrow-container">
                        <span class="arrow">➝</span>
                        <span class="distance-badge">Enkele rit</span>
                    </div>
                    <h1 class="city">{{ trip.EndLocation }}</h1>
                </div>
                <div class="status-pill" :class="trip.TripStatus.toLowerCase()">
                    {{ trip.TripStatus === 'Scheduled' ? 'Gepland' : trip.TripStatus }}
                </div>
            </header>

            <div class="info-grid">
                
                <div class="card trip-info">
                    <h2>📅 Rit Informatie</h2>
                    <div class="info-row">
                        <span class="label">Datum</span>
                        <span class="value">{{ formatDate(trip.DepartureTime).date }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Vertrektijd</span>
                        <span class="value time">{{ formatDate(trip.DepartureTime).time }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Prijs per stoel</span>
                        <span class="value price">€ {{ trip.Price }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Beschikbaarheid </span>
                        <span class="value seats">
                            {{ trip.SeatsOffered - trip.SeatsBooked }} van de {{ trip.SeatsOffered }} stoelen vrij
                        </span>
                    </div>
                </div>

                <div class="card driver-info">
                    <h2>👤 De Chauffeur</h2>
                    <div v-if="trip.user">
                        <div class="avatar-placeholder">
                            {{ trip.user.FirstName[0] }}{{ trip.user.LastName[0] }}
                        </div>
                        <p class="driver-name">{{ trip.user.FirstName }} {{ trip.user.LastName }}</p>
                        
                        <div class="contact-details">
                            <div class="contact-item" v-if="trip.user.PhoneNumber">
                                <span class="icon">📞</span>
                                <a :href="'tel:' + trip.user.PhoneNumber">{{ trip.user.PhoneNumber }}</a>
                            </div>
                            <div class="contact-item" v-if="trip.user.Email">
                                <span class="icon">✉️</span>
                                <a :href="'mailto:' + trip.user.Email">{{ trip.user.Email }}</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card car-info">
                    <h2>🚗 Het Voertuig</h2>
                    <div v-if="trip.car">
                        <div class="car-highlight">
                            {{ trip.car.Brand }} {{ trip.car.Model }}
                        </div>
                        <div class="car-details-list">
                            <span class="tag color" v-if="trip.car.Color">🎨 {{ trip.car.Color }}</span>
                            <span class="tag seats">💺 {{ trip.car.Seats }} zitplaatsen</span>
                            <span class="tag plate" v-if="trip.car.LicensePlate"> {{ trip.car.LicensePlate }}</span>
                            <span class="tag verified" v-if="trip.car.isVerified">✅ Geverifieerd</span>
                        </div>
                    </div>
                </div>

            </div>

            <div class="action-bar">
                <button class="book-btn" @click="bookTrip">
                    Reserveer Nu (€ {{ trip.Price }})
                </button>
                <RouterLink to="/trips" class="back-link">Terug naar overzicht</RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .details-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 40px 20px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #2d3748;
    }
    .trip-header {
        text-align: center;
        margin-bottom: 40px;
        position: relative;
    }
    .route-display {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
    }
    .city {
        font-size: 2rem;
        margin: 0;
        color: #1a202c;
    }
    .arrow-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #cbd5e0;
    }
    .arrow { font-size: 2rem; line-height: 1; }
    .distance-badge { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }
    .status-pill {
        display: inline-block;
        margin-top: 15px;
        padding: 5px 15px;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: bold;
        background: #edf2f7;
        color: #718096;
    }
    .status-pill.scheduled { background: #e6fffa; color: #38b2ac; border: 1px solid #b2f5ea; }
    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 25px;
        margin-bottom: 40px;
    }
    .card {
        background: white;
        border-radius: 12px;
        padding: 25px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 6px rgba(0,0,0,0.02);
    }
    .card h2 {
        font-size: 1.1rem;
        margin-top: 0;
        margin-bottom: 20px;
        color: #718096;
        border-bottom: 2px solid #edf2f7;
        padding-bottom: 10px;
    }
    .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px dashed #edf2f7;
    }
    .info-row:last-child { border-bottom: none; }
    .label { color: #718096; font-size: 0.95rem; }
    .value { font-weight: 600; color: #2d3748; }
    .value.price { color: #3182ce; font-size: 1.2rem; }
    .value.seats { color: #38a169; text-align: right;}
    .driver-info { text-align: center; }
    .avatar-placeholder {
        width: 60px; height: 60px;
        background: #ebf8ff; color: #3182ce;
        font-size: 1.5rem; font-weight: bold;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 15px;
    }
    .driver-name { font-weight: bold; font-size: 1.2rem; margin: 0 0 15px; }
    .contact-details { text-align: left; background: #f7fafc; padding: 15px; border-radius: 8px; }
    .contact-item { margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
    .contact-item a { color: #4a5568; text-decoration: none; }
    .contact-item a:hover { color: #3182ce; text-decoration: underline; }
    .car-highlight { font-size: 1.3rem; font-weight: bold; margin-bottom: 15px; color: #2d3748; }
    .car-details-list { display: flex; flex-wrap: wrap; gap: 10px; }
    .tag { 
        background: #edf2f7; padding: 5px 10px; 
        border-radius: 6px; font-size: 0.9rem; 
        display: inline-flex; align-items: center; gap: 5px;
    }
    .tag.verified { background: #f0fff4; color: #38a169; border: 1px solid #c6f6d5; width: 100%; justify-content: center; margin-top: 5px;}
    .action-bar {
        text-align: center;
        max-width: 500px;
        margin: 0 auto;
    }
    .book-btn {
        width: 100%;
        padding: 16px;
        background-color: #3182ce;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.2s, transform 0.1s;
        box-shadow: 0 4px 6px rgba(49, 130, 206, 0.3);
    }
    .book-btn:hover { background-color: #2b6cb0; transform: translateY(-2px); }
    .book-btn:active { transform: translateY(0); }
    .back-link {
        display: block;
        margin-top: 20px;
        color: #718096;
        text-decoration: none;
    }
    .back-link:hover { color: #3182ce; }
    .loading-state, .error-state { text-align: center; padding: 50px; font-size: 1.2rem; color: #718096; }
    .error-state { color: #e53e3e; }
</style>