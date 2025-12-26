<script setup>
// --- Imports ---
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const currentUser = ref(null);

// --- Data ---
const myTrips = ref([]);       
const activeTrip = ref(null);  
const messages = ref([]);      
const newMessage = ref('');    
const loading = ref(true);

let pollingInterval = null;    

// --- LIFECYCLE ---
onMounted(async () => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) { router.push('/login'); return; }
    currentUser.value = JSON.parse(userStr);

    await fetchMyConversations();
    loading.value = false;
});

onUnmounted(() => {
    if (pollingInterval) clearInterval(pollingInterval);
});

// --- METHODS ---

const fetchMyConversations = async () => {
    const res = await fetch('http://localhost:3000/trips');
    const bookingsRes = await fetch('http://localhost:3000/bookings');
    
    if (res.ok && bookingsRes.ok) {
        const allTrips = await res.json();
        const allBookings = await bookingsRes.json();
        const userId = currentUser.value.UserID;
        const driving = allTrips.filter(t => t.DriverID === userId);
        
        const myBookingIds = allBookings
            .filter(b => b.PassengerID === userId)
            .map(b => b.TripID);
        
        const riding = allTrips.filter(t => myBookingIds.includes(t.TripID));
        const combined = [...driving, ...riding];
        // Unieke ritten filteren
        myTrips.value = [...new Map(combined.map(item => [item.TripID, item])).values()];
    }
};

const selectTrip = async (trip) => {
    activeTrip.value = trip;
    messages.value = [];
    await fetchMessages(trip.TripID);
    
    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(() => fetchMessages(trip.TripID), 3000);
};

const fetchMessages = async (tripId) => {
    const res = await fetch(`http://localhost:3000/messages/trip/${tripId}`);
    if (res.ok) {
        const newMsgs = await res.json();
        
        if (newMsgs.length !== messages.value.length) {
            messages.value = newMsgs;
            scrollToBottom();
        }
    }
};

const sendMessage = async () => {
    if (!newMessage.value.trim()) return;

    let receiverId = activeTrip.value.DriverID;
    if (currentUser.value.UserID === activeTrip.value.DriverID) {
        receiverId = currentUser.value.UserID; 
    }

    const payload = {
        SenderID: currentUser.value.UserID,
        ReceiverID: receiverId, 
        TripID: activeTrip.value.TripID,
        Content: newMessage.value
    };

   
    const res = await fetch('http://localhost:3000/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (res.ok) {
        newMessage.value = ''; 
        await fetchMessages(activeTrip.value.TripID); 
        scrollToBottom();
    }
};

const scrollToBottom = async () => {
    await nextTick();
    const container = document.getElementById('chat-container');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
};

const getSenderName = (msg) => {
    if (msg.user_message_SenderIDTouser) {
        return msg.user_message_SenderIDTouser.FirstName;
    }
    return 'Onbekend';
};
</script>

<template>
    <div class="chat-page">
        
        <div class="sidebar">
            <div class="sidebar-header">
                <h2>💬 Berichten</h2>
            </div>
            
            <div v-if="loading" class="loading">Laden...</div>
            
            <div v-else class="trip-list">
                <div v-if="myTrips.length === 0" class="empty-list">
                    Je hebt nog geen ritten gepland.
                </div>

                <div 
                    v-for="trip in myTrips" 
                    :key="trip.TripID" 
                    class="trip-item"
                    :class="{ active: activeTrip?.TripID === trip.TripID }"
                    @click="selectTrip(trip)"
                >
                    <div class="trip-icon">🚗</div>
                    <div class="trip-info">
                        <strong>{{ trip.StartLocation }} -> {{ trip.EndLocation }}</strong>
                        <span class="trip-date">
                            <strong>{{ formatDate(trip.DepartureTime) }}</strong>
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div class="chat-area">
            
            <div v-if="!activeTrip" class="no-selection-state">
                <div class="icon">👋</div>
                <h3>Selecteer een rit om te chatten</h3>
                <p>Overleg met je chauffeur of passagiers.</p>
            </div>

            <div v-else class="chat-wrapper">
                <div class="chat-header">
                    <h3>Rit naar {{ activeTrip.EndLocation }}</h3>
                    <span class="status-badge">🟢 Live</span>
                </div>

                <div id="chat-container" class="messages-container">
                    <div v-if="messages.length === 0" class="start-conversation">
                        Nog geen berichten. Begin het gesprek!
                    </div>

                    <div 
                        v-for="msg in messages" 
                        :key="msg.MessageID" 
                        class="message-bubble"
                        :class="{ 'mine': msg.SenderID === currentUser.UserID }"
                    >
                        <div class="bubble-text">{{ msg.Content }}</div>
                        
                        <div v-if="msg.SenderID !== currentUser.UserID" class="bubble-info">
                            {{ getSenderName(msg) }}
                        </div>
                    </div>
                </div>

                <div class="input-area">
                    <input 
                        v-model="newMessage" 
                        @keyup.enter="sendMessage"
                        type="text" 
                        placeholder="Typ een bericht..."
                    >
                    <button @click="sendMessage" class="btn-send">➤</button>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
.chat-page {
    display: flex;
    height: calc(100vh - 80px);
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    border-radius: 12px;
    overflow: hidden;
    font-family: 'Segoe UI', sans-serif;
    margin-top: 20px;
}

.sidebar {
    width: 300px;
    background: #f7fafc;
    border-right: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
}

.sidebar-header { padding: 20px; border-bottom: 1px solid #e2e8f0; background: white; }
.sidebar-header h2 { margin: 0; font-size: 1.2rem; color: #2d3748; }

.trip-list { flex: 1; overflow-y: auto; }
.empty-list { padding: 20px; text-align: center; color: #a0aec0; font-style: italic; }

.trip-item {
    padding: 15px 20px;
    border-bottom: 1px solid #edf2f7;
    cursor: pointer;
    display: flex; align-items: center; gap: 15px;
}
.trip-item:hover { background: #edf2f7; }
.trip-item.active { background: #e6fffa; border-left: 4px solid #3182ce; }

.trip-icon { font-size: 1.5rem; background: #fff; padding: 8px; border-radius: 50%; border: 1px solid #e2e8f0; }
.trip-info { display: flex; flex-direction: column; }
.trip-date { font-size: 0.8rem; color: #454e5a; }

.chat-area { flex: 1; display: flex; flex-direction: column; background: white; }

.no-selection-state {
    flex: 1;
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    justify-content: center; 
    color: #a0aec0;
}
.no-selection-state .icon { font-size: 4rem; margin-bottom: 10px; opacity: 0.5; }

.chat-wrapper { display: flex; flex-direction: column; height: 100%; }

.chat-header {
    padding: 15px 20px;
    border-bottom: 1px solid #e2e8f0;
    display: flex; 
    justify-content: space-between; 
    align-items: center;
    background: white;
}
.chat-header h3 { margin: 0; font-size: 1.1rem; color: #2d3748; }
.status-badge { font-size: 0.8rem; background: #f0fff4; color: #38a169; padding: 2px 8px; border-radius: 12px; border: 1px solid #c6f6d5; }

.messages-container {
    flex: 1;
    padding: 20px;
    background-color: #f8fafc;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.start-conversation { text-align: center; color: #cbd5e0; margin-top: 20px; font-style: italic; }

.message-bubble {
    max-width: 70%;
    padding: 10px 15px;
    border-radius: 12px;
    font-size: 0.95rem;
    position: relative;
    line-height: 1.4;
    align-self: flex-start;
    background: white;
    border: 1px solid #e2e8f0;
    color: #2d3748;
}

.message-bubble.mine {
    align-self: flex-end;
    background: #3182ce;
    color: white;
    border: none;
}

.bubble-info { font-size: 0.75rem; color: #a0aec0; margin-top: 4px; font-weight: bold; }
.message-bubble.mine .bubble-info { display: none; } 

.input-area {
    padding: 15px;
    border-top: 1px solid #e2e8f0;
    display: flex; 
    gap: 10px; 
    background: white;
}

.input-area input {
    flex: 1; padding: 12px; border: 1px solid #cbd5e0; border-radius: 20px; font-size: 1rem;
}
.input-area input:focus { outline: none; border-color: #3182ce; }

.btn-send {
    background: #3182ce; 
    color: white; 
    border: none;
    width: 45px; 
    height: 45px; 
    border-radius: 50%;
    font-size: 1.2rem; 
    cursor: pointer;
    display: flex; 
    align-items: center; 
    justify-content: center;
}
.btn-send:hover { background: #2b6cb0; }

@media (max-width: 768px) {
    .chat-page { flex-direction: column; height: calc(100vh - 60px); }
    .sidebar { width: 100%; height: 200px; border-right: none; border-bottom: 1px solid #e2e8f0; }
    .chat-area { height: 100%; }
}
</style>



