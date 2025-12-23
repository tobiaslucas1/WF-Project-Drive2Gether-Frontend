<!----------
settings van de page
---------->

<script setup>
    //------ imports ------
    import { ref } from 'vue';

    //------ lifecycles ------

    //------- data -------

    const tripDate = ref('');
    const departureLocation = ref('');
    const destinationLocation = ref('');
    const availableSeats = ref(1);
    const statusMessage = ref('');
    const isSubmitting = ref(false);

    //------ methods ------
    const handleCreateTrip = async () => {
        statusMessage.value = '';
        isSubmitting.value = true;

        const tripData = {
            TripDate: tripDate.value,
            DepartureLocation: departureLocation.value,
            DestinationLocation: destinationLocation.value,
            AvailableSeats: availableSeats.value,
        };

        const response = await fetch('http://localhost:3000/trips', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tripData)
        });

        const result = await response.json();
        isSubmitting.value = false;

        if (response.ok) {
            statusMessage.value = 'Rit succesvol aangemaakt!';
        } else {
            statusMessage.value = result.status || 'Rit aanmaken mislukt';
        }
    };
</script>
