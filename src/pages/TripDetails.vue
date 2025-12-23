<script setup>
    import { ref, onMounted } from 'vue';
    import { useRoute } from 'vue-router';

    const route = useRoute();
    const trip = ref(null);
    const loading = ref(true);
    const error = ref('');

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('nl-NL', { 
            weekday: 'long', day: 'numeric', month: 'long', 
            hour: '2-digit', minute: '2-digit' 
        });
    };

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
</script>

<template>
    <div class="details-container">
        <div v-if="loading">Laden...</div>
        <div v-if="error">{{ error }}</div>

        <div v-if="trip" class="trip-content">
            <h1>Rit naar {{ trip.EndLocation }}</h1>
            
            <div class="info-card">
                <p><strong>Vertrek:</strong> {{ trip.StartLocation }}</p>
                <p><strong>Tijd:</strong> {{ formatDate(trip.DepartureTime) }}</p>
                <p><strong>Prijs:</strong> € {{ trip.Price }}</p>
            </div>

            <div class="info-card" v-if="trip.user">
                <h3>Chauffeur</h3>
                <p>👤 {{ trip.user.FirstName }} {{ trip.user.LastName }}</p>
            </div>

            <div class="info-card" v-if="trip.car">
                <h3>Auto</h3>
                <p>🚗 {{ trip.car.Brand }} {{ trip.car.Model }} ({{ trip.car.Color }})</p>
            </div>

            <RouterLink to="/trips" class="back-btn">← Terug naar overzicht</RouterLink>
        </div>
    </div>
</template>

<style scoped>
    .details-container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: sans-serif; }
    .info-card { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #ddd; }
    .back-btn { display: inline-block; margin-top: 20px; color: #3182ce; text-decoration: none; font-weight: bold; }
</style>