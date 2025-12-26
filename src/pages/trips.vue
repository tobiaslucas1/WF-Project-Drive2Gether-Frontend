<script setup>
    //------ imports ------
    import { ref, onMounted } from 'vue';
    import { useRouter } from 'vue-router'; 

    const router = useRouter();

    //------- data -------
    const trips = ref([]);
    const loading = ref(true);
    const error = ref('');

    const searchStart = ref('');
    const searchEnd = ref('');
    const searchDate = ref('');
    const searchTime = ref(''); 

    //------ lifecycles ------
    onMounted(async () => {
        await performSearch();
    });

    //------ methods ------
    const performSearch = async () => {
        loading.value = true;
        try {
            let url = new URL('http://localhost:3000/trips/search');
            
            if (searchStart.value) url.searchParams.append('start', searchStart.value);
            if (searchEnd.value) url.searchParams.append('end', searchEnd.value);
            if (searchDate.value) url.searchParams.append('date', searchDate.value);
            if (searchTime.value) url.searchParams.append('time', searchTime.value);

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Server reageerde niet goed');
            }
            trips.value = await response.json();
        } catch (err) {
            console.error(err);
            error.value = "Kon ritten niet laden.";
        } finally {
            loading.value = false;
        }
    };

    const resetFilters = () => {
        searchStart.value = '';
        searchEnd.value = '';
        searchDate.value = '';
        searchTime.value = '';
        performSearch();
    };

    const formatDate = (dateString) => { 
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('nl-NL', { 
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
        });
    }; 

    const goToTrip = (tripId) => {
        router.push(`/trips/${tripId}`);
    };
    
</script>

<template>
    <div class="container">
        <h1>Beschikbare Ritten</h1>

        <div class="search-panel">
            <div class="input-group">
                <input v-model="searchStart" type="text" placeholder="📍 Startlocatie" @keyup.enter="performSearch">
                <input v-model="searchEnd" type="text" placeholder="🏁 Bestemming" @keyup.enter="performSearch">
            </div>
            <div class="input-group">
                <input v-model="searchDate" type="date" placeholder="Datum">
                <input v-model="searchTime" type="time" placeholder="Tijd">
            </div>
            <div class="btn-group">
                <button class="btn-search" @click="performSearch">🔍 Zoeken</button>
                <button class="btn-reset" @click="resetFilters">✖ Reset</button>
            </div>
        </div>

        <div v-if="loading" class="loading">Ritten laden...</div>

        <div v-else-if="trips.length === 0" class="status-msg">
            Geen ritten gevonden met deze zoekfilters.
        </div>

        <div v-else class="trips-grid">
            <div v-for="trip in trips" :key="trip.TripID" class="trip-card" @click="goToTrip(trip.TripID)">
                
                <div class="card-header">
                    <span class="date">📅 {{ formatDate(trip.DepartureTime) }}</span>
                    <span class="price">€ {{ trip.Price }} pp</span>
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

    .search-panel {
        background: white;
        padding: 20px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        margin-bottom: 30px;
    }

    .input-group {
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
    }

    .input-group input {
        flex: 1;
        padding: 10px;
        border: 1px solid #cbd5e0;
        border-radius: 6px;
        font-size: 1rem;
    }

    input[type="date"], input[type="time"] {
        color: #4a5568;
    }

    .btn-group {
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }

    .btn-search {
        flex: 3;
        background-color: #3182ce;
        color: white;
        border: none;
        padding: 10px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
    }
    .btn-search:hover { background-color: #2b6cb0; }

    .btn-reset {
        flex: 1;
        background-color: #edf2f7;
        color: #4a5568;
        border: 1px solid #cbd5e0;
        padding: 10px;
        border-radius: 6px;
        cursor: pointer;
    }
    .btn-reset:hover { background-color: #e2e8f0; }

    .status-msg {
        text-align: center;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
        color: #666;
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
        cursor: pointer;
    }

    .trip-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        border-color: #3182ce;
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

    .loading { text-align: center; color: #a0aec0; padding: 20px; }

    @media (max-width: 600px) {
        .input-group { flex-direction: column; }
    }
</style>

