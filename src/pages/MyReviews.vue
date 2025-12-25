<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const reviews = ref([]);
const loading = ref(true);
const user = ref(null);

onMounted(async () => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        router.push('/login');
        return;
    }
    user.value = JSON.parse(userStr);
    await fetchReviews(user.value.UserID);
});

const fetchReviews = async (userId) => {
    try {
        const response = await fetch(`http://localhost:3000/reviews/user/${userId}`);
        if (response.ok) {
            reviews.value = await response.json();
        }
    } catch (error) {
        console.error("Kon reviews niet laden", error);
    } finally {
        loading.value = false;
    }
};

const getReviewerName = (review) => {
    if (review.user_review_ReviewerIDTouser) {
        return `${review.user_review_ReviewerIDTouser.FirstName} ${review.user_review_ReviewerIDTouser.LastName}`;
    }
    return "Anonieme Gebruiker";
};
</script>

<template>
    <div class="reviews-container">
        <div class="header">
            <button @click="router.push('/settings')" class="btn-back">← Terug</button>
            <h1>Mijn Reviews</h1>
        </div>

        <div v-if="loading" class="loading">Laden...</div>

        <div v-else-if="reviews.length === 0" class="empty-state">
            <div class="icon">⭐</div>
            <p>Je hebt nog geen reviews ontvangen.</p>
        </div>

        <div v-else class="review-list animate-fade">
            <div v-for="review in reviews" :key="review.ReviewID" class="review-card">
                <div class="card-top">
                    <div class="stars">
                        <span v-for="n in 5" :key="n" :class="['star', n <= review.Rating ? 'filled' : '']">★</span>
                    </div>
                    <span class="rating-number">{{ review.Rating }}/5</span>
                </div>
                
                <p class="comment" v-if="review.Comment">"{{ review.Comment }}"</p>
                <p class="comment italic" v-else>(Geen toelichting gegeven)</p>

                <div class="meta">
                    <span class="author">Geschreven door: <strong>{{ getReviewerName(review) }}</strong></span>
                    <span class="type badge">{{ review.ReviewType === 'Driver' ? 'Als Chauffeur' : 'Als Passagier' }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.reviews-container { max-width: 600px; margin: 0 auto; padding: 40px 20px; font-family: 'Segoe UI', sans-serif; }

.header { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; }
.header h1 { margin: 0; color: #2d3748; }

.btn-back { background: none; border: none; font-size: 1rem; color: #718096; cursor: pointer; padding: 5px 10px; border-radius: 6px; }
.btn-back:hover { background: #edf2f7; color: #2d3748; }

.review-list { display: flex; flex-direction: column; gap: 15px; }

.review-card { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

.card-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.stars { color: #cbd5e0; font-size: 1.2rem; }
.star.filled { color: #ecc94b; }
.rating-number { font-weight: bold; color: #4a5568; }

.comment { color: #2d3748; line-height: 1.5; margin-bottom: 15px; font-size: 1.05rem; }
.italic { font-style: italic; color: #a0aec0; }

.meta { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #edf2f7; padding-top: 10px; font-size: 0.9rem; color: #718096; }

.badge { background: #ebf8ff; color: #3182ce; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; }

.empty-state { text-align: center; padding: 50px; color: #a0aec0; }
.empty-state .icon { font-size: 3rem; margin-bottom: 10px; opacity: 0.5; }

.animate-fade { animation: fadeIn 0.3s ease-in; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>