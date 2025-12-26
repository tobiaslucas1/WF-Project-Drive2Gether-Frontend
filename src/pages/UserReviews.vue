<script setup>
// --- Imports ---
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
// --- Data ---
const reviews = ref([]);
const user = ref(null);
const loading = ref(true);
const averageRating = ref(0);

// --- Lifecycles ---
onMounted(async () => {
    const userId = route.params.id; 
    await fetchUser(userId);
    await fetchReviews(userId);
    loading.value = false;
});

// --- Methods ---
const fetchUser = async (id) => {
    try {
        const res = await fetch(`http://localhost:3000/users/${id}`);
        if (res.ok) user.value = await res.json();
    } catch (e) { console.error(e); }
};

const fetchReviews = async (id) => {
    try {
        const res = await fetch(`http://localhost:3000/reviews/user/${id}`);
        if (res.ok) {
            reviews.value = await res.json();
            calculateAverage();
        }
    } catch (e) { console.error(e); }
};

const calculateAverage = () => {
    if (reviews.value.length > 0) {
        const total = reviews.value.reduce((sum, r) => sum + r.Rating, 0);
        averageRating.value = (total / reviews.value.length).toFixed(1);
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
    <div class="page-container">
        <button @click="router.back()" class="btn-back">← Terug</button>

        <div v-if="loading" class="loading">Laden...</div>
        
        <div v-else class="content">
            <div class="profile-header" v-if="user">
                <h1>Reviews voor {{ user.FirstName }} {{ user.LastName }}</h1>
                <div class="big-score" v-if="reviews.length > 0">
                    ⭐ {{ averageRating }} <small>op basis van {{ reviews.length }} reviews</small>
                </div>
            </div>

            <div v-if="reviews.length === 0" class="empty-state">
                Deze gebruiker heeft nog geen reviews ontvangen.
            </div>

            <div v-else class="review-list">
                <div v-for="review in reviews" :key="review.ReviewID" class="review-card">
                    <div class="top-row">
                        <div class="stars">
                            <span v-for="n in 5" :key="n" :class="['star', n <= review.Rating ? 'filled' : '']">★</span>
                        </div>
                        <span class="rating-num">{{ review.Rating }}/5</span>
                    </div>

                    <p class="comment" v-if="review.Comment">"{{ review.Comment }}"</p>
                    <p class="comment italic" v-else>(Geen toelichting)</p>

                    <div class="meta">
                        <span>Door: <strong>{{ getReviewerName(review) }}</strong></span>
                        <span class="badge">{{ review.ReviewType }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page-container { max-width: 600px; margin: 0 auto; padding: 40px 20px; font-family: 'Segoe UI', sans-serif; }
.btn-back { background: none; border: none; color: #718096; cursor: pointer; font-size: 1rem; margin-bottom: 20px; }
.btn-back:hover { text-decoration: underline; color: #2d3748; }

.header { text-align: center; margin-bottom: 30px; }
.big-score { font-size: 1.2rem; font-weight: bold; color: #2d3748; margin-top: 5px; }
.big-score small { font-weight: normal; color: #718096; font-size: 0.9rem; }

.review-list { display: flex; flex-direction: column; gap: 15px; margin-top: 20px; }
.review-card { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

.top-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.stars { color: #e2e8f0; font-size: 1.2rem; }
.star.filled { color: #ecc94b; }

.comment { font-style: italic; color: #4a5568; margin-bottom: 15px; }
.meta { display: flex; justify-content: space-between; font-size: 0.85rem; color: #718096; border-top: 1px solid #edf2f7; padding-top: 10px; }
.badge { background: #ebf8ff; color: #2b6cb0; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 0.75rem; }
</style>