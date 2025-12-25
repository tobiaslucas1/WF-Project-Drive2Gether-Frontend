<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const currentUser = ref(null);
const myTrips = ref([]);
const activeTrip = ref(null);
const messages = ref([]);
const newMessage = ref('');
const loading = ref(true);
const chatBoxRef = ref(null);

let pollingInterval = null;

onMounted(async () => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) { router.push('/login'); return; }
    currentUser.value = JSON.parse(userStr);

    await fetchMyTrips();
    loading.value = false;
});

onUnmounted(() => {
    if (pollingInterval) clearInterval(pollingInterval);
});

const fetchMyTrips = async () => {
    try {
        // Haal alle trips op en toon ze (in een echte app filter je hier op trips waar jij bij hoort)
        const res = await fetch('http://localhost:3000/trips');
        if (res.ok) {
            myTrips.value = await res.json();
        }
    } catch (e) {
        console.error("Fout bij laden ritten", e);
    }
};

const selectTrip = async (trip) => {
    activeTrip.value = trip;
    await fetchMessages(trip.TripID);
    
    // Start live updates (elke 3 seconden checken op nieuwe berichten)
    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(() => fetchMessages(trip.TripID), 3000);
};

const fetchMessages = async (tripId) => {
    try {
        const res = await fetch(`http://localhost:3000/messages/trip/${tripId}`);
        if (res.ok) {
            const newMsgs = await res.json();
            // Scroll alleen naar beneden als er nieuwe berichten bij zijn gekomen
            if (newMsgs.length !== messages.value.length) {
                messages.value = newMsgs;
                scrollToBottom();
            }
        }
    } catch (e) { console.error(e); }
};

const sendMessage = async () => {
    if (!newMessage.value.trim()) return;

    const payload = {
        SenderID: currentUser.value.UserID,
        // Als ik de chauffeur ben, stuur ik naar niemand specifiek (of kies hier een ID), 
        // voor nu sturen we het naar de Trip zodat iedereen het ziet.
        ReceiverID: activeTrip.value.DriverID === currentUser.value.UserID ? 0 : activeTrip.value.DriverID, 
        TripID: activeTrip.value.TripID,
        Content: newMessage.value
    };

    try {
        const res = await fetch('http://localhost:3000/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            newMessage.value = '';
            await fetchMessages(activeTrip.value.TripID);
        }
    } catch (e) { console.error("Kon bericht niet versturen", e); }
};

const scrollToBottom = async () => {
    await nextTick();
    if (chatBoxRef.value) {
        chatBoxRef.value.scrollTop = chatBoxRef.value.scrollHeight;
    }
};

const getSenderName = (msg) => {
    return msg.SenderID === currentUser.value.UserID ? 'Ik' : `Gebruiker ${msg.SenderID}`;
};
</script>

<template>
    <div class="chat-layout">
        <!-- Lijst met ritten links -->
        <div class="trip-list">
            <h2>💬 Berichten</h2>
            <div v-if="loading" class="loading">Laden...</div>
            <div v-else class="list-container">
                <div 
                    v-for="trip in myTrips" 
                    :key="trip.TripID" 
                    class="trip-item"
                    :class="{ active: activeTrip?.TripID === trip.TripID }"
                    @click="selectTrip(trip)"
                >
                    <div class="trip-route">{{ trip.StartLocation }} ➝ {{ trip.EndLocation }}</div>
                    <div class="trip-date">Vertrek: {{ new Date(trip.DepartureTime).toLocaleDateString() }}</div>
                </div>
            </div>
        </div>

        <!-- Chatvenster rechts -->
        <div class="chat-area">
            <div v-if="!activeTrip" class="empty-state">
                <p>Selecteer een rit links om te chatten.</p>
            </div>
            
            <div v-else class="chat-interface">
                <div class="chat-header">
                    <h3>Chat voor rit naar {{ activeTrip.EndLocation }}</h3>
                </div>

                <div class="messages-box" ref="chatBoxRef">
                    <div v-if="messages.length === 0" class="no-msg">Nog geen berichten. Zeg hallo! 👋</div>
                    
                    <div 
                        v-for="msg in messages" 
                        :key="msg.MessageID" 
                        class="message-bubble"
                        :class="{ 'my-message': msg.SenderID === currentUser.UserID }"
                    >
                        <div class="bubble-content">{{ msg.Content }}</div>
                        <div class="bubble-meta">{{ getSenderName(msg) }}</div>
                    </div>
                </div>

                <div class="input-area">
                    <input 
                        v-model="newMessage" 
                        @keyup.enter="sendMessage" 
                        placeholder="Typ een bericht..." 
                    />
                    <button @click="sendMessage">➤</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.chat-layout { display: flex; height: calc(100vh - 80px); max-width: 1200px; margin: 0 auto; background: white; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border-radius: 12px; overflow: hidden; font-family: 'Segoe UI', sans-serif; }

.trip-list { width: 300px; border-right: 1px solid #e2e8f0; background: #f7fafc; display: flex; flex-direction: column; }
.trip-list h2 { padding: 20px; margin: 0; color: #2d3748; font-size: 1.2rem; border-bottom: 1px solid #e2e8f0; }
.list-container { overflow-y: auto; flex: 1; }

.trip-item { padding: 15px 20px; border-bottom: 1px solid #edf2f7; cursor: pointer; transition: background 0.2s; }
.trip-item:hover { background: #edf2f7; }
.trip-item.active { background: #e6fffa; border-left: 4px solid #38b2ac; }
.trip-route { font-weight: bold; color: #2d3748; margin-bottom: 4px; }
.trip-date { font-size: 0.85rem; color: #718096; }

.chat-area { flex: 1; display: flex; flex-direction: column; background-color: #fff; }
.empty-state { flex: 1; display: flex; align-items: center; justify-content: center; color: #a0aec0; font-size: 1.2rem; }

.chat-interface { display: flex; flex-direction: column; height: 100%; }
.chat-header { padding: 15px 20px; border-bottom: 1px solid #e2e8f0; background: #fff; }
.chat-header h3 { margin: 0; font-size: 1.1rem; color: #2d3748; }

.messages-box { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; background-color: #fcfcfc; }
.no-msg { text-align: center; color: #cbd5e0; margin-top: 20px; }

.message-bubble { max-width: 70%; padding: 10px 15px; border-radius: 12px; font-size: 0.95rem; align-self: flex-start; background: #edf2f7; color: #2d3748; position: relative; }
.message-bubble.my-message { align-self: flex-end; background: #3182ce; color: white; }

.bubble-meta { font-size: 0.7rem; margin-top: 4px; opacity: 0.7; text-align: right; }

.input-area { padding: 15px; border-top: 1px solid #e2e8f0; display: flex; gap: 10px; background: #fff; }
.input-area input { flex: 1; padding: 12px; border: 1px solid #cbd5e0; border-radius: 20px; outline: none; }
.input-area input:focus { border-color: #3182ce; }
.input-area button { background: #3182ce; color: white; border: none; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; }
.input-area button:hover { background: #2b6cb0; }

@media (max-width: 768px) {
    .chat-layout { flex-direction: column; height: auto; }
    .trip-list { width: 100%; height: 200px; border-right: none; border-bottom: 1px solid #e2e8f0; }
    .chat-area { height: 500px; }
}
</style>
```
