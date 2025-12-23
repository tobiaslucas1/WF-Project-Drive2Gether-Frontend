<script setup>
    //------ imports ------
    import { ref, onMounted } from 'vue';
    import { useRouter } from 'vue-router'; 

    // ------ activeer de router ------
    const router = useRouter();

    //------- data -------
    const trips = ref([]);
    const loading = ref(true);
    const error = ref('');

    //------ lifecycles ------
    onMounted(async () => {
        
        // alle ritten die scheduled zijn
        const response = await fetch('http://localhost:3000/trips/search');
        
        if (!response.ok) {
            throw new Error('Server reageerde niet goed');
        }
        trips.value = await response.json();
    
    });

    //------ methods ------
    const formatDate = (dateString) => { 
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('nl-NL', { 
            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
        });
    }; 

    const goToTrip = (tripId) => {
        router.push(`/trips/${tripId}`);
    };
    
</script>

<template>
    <div class="container">
        <h1>Alle Beschikbare Ritten</h1>

        <!-- Lege lijst melding -->
        <div v-if="trips.length === 0" class="status-msg">
            Er zijn momenteel geen ritten gepland.
        </div>

        <!-- De Lijst met Ritten -->
        <div class="trips-grid">
            <div v-for="trip in trips" :key="trip.TripID" class="trip-card" @click="goToTrip(trip.TripID)">
                
                <div class="card-header">
                    <span class="date">📅 {{ formatDate(trip.DepartureTime) }}</span>
                    <span class="price">€ {{ trip.Price }}</span>
                </div>

                <div class="route">
                    <div class="city from">{{ trip.StartLocation }}</div>
                    <div class="arrow">↓</div>
                    <div class="city to">{{ trip.EndLocation }}</div>
                </div>

                <hr>

                <div class="details">
                    <div class="driver" v-if="trip.user">
                        👤 {{ trip.user.FirstName }} {{ trip.user.LastName }}
                    </div>
                    <div class="car" v-if="trip.car">
                        🚗 {{ trip.car.Brand }} {{ trip.car.Model }}
                    </div>
                    <div class="seats">
                        💺 {{ trip.SeatsOffered - trip.SeatsBooked }} plekken vrij
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        font-family: 'Segoe UI', sans-serif;
    }

    h1 {
        text-align: center;
        color: #333;
        margin-bottom: 30px;
    }

    .status-msg {
        text-align: center;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
        color: #666;
    }

    .status-msg.error {
        background: #fee2e2;
        color: #b91c1c;
    }

    .trips-grid {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .trip-card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        transition: transform 0.2s;
    }

    .trip-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        border-color: #cbd5e0;
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        margin-bottom: 15px;
        font-size: 1.1rem;
    }

    .price {
        color: #2b6cb0;
        background-color: #ebf8ff;
        padding: 4px 10px;
        border-radius: 20px;
    }

    .route {
        text-align: center;
        margin: 15px 0;
    }

    .city {
        font-size: 1.2rem;
        font-weight: 600;
        color: #2d3748;
    }

    .arrow {
        color: #a0aec0;
        margin: 5px 0;
    }

    hr {
        border: 0;
        border-top: 1px solid #eee;
        margin: 15px 0;
    }

    .details {
        display: flex;
        justify-content: space-between;
        font-size: 0.9rem;
        color: #718096;
        flex-wrap: wrap;
        gap: 10px;
    }
</style>