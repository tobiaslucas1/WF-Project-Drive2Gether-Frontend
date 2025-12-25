<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const reviews = ref([]);
const user = ref(null);
const loading = ref(true);

onMounted(async () => {
    const userId = route.params.id; // ID uit de URL halen
    await fetchUser(userId);
    await fetchReviews(userId);
    loading.value = false;
});

const fetchUser = async (id) => {
    try {
        const res = await fetch(`http://localhost:3000/users/${id}`);
        if (res.ok) user.value = await res.json();
    } catch (e) { console.error(e); }
};

const fetchReviews = async (id) => {
    try {
        const res = await fetch(`http://localhost:3000/reviews/user/${id}`);
        if (res.ok) reviews.value = await res.json();
    } catch (e) { console.error(e); }
};

// Helper voor naam van reviewer
const getReviewerName = (review) => {
    // Check of de backend de relatie 'user_review_ReviewerIDTouser' meestuurt
    if (review.user_review_ReviewerIDTouser) {
        return review.user_review_ReviewerIDTouser.FirstName + ' ' + review.user_review_ReviewerIDTouser.LastName;
    }
    return "Anoniem";
};
</script>

<template>
    <div class="page-container">
        <button @click="router.back()" class="btn-back">← Terug</button>

        <header v-if="user" class="header">
            <h1>Reviews voor {{ user.FirstName }}</h1>
            <p v-if="reviews.length > 0">{{ reviews.length }} beoordelingen</p>
        </header>

        <div v-if="loading" class="loading">Laden...</div>

        <div v-else-if="reviews.length === 0" class="empty">
            Geen reviews gevonden voor deze gebruiker.
        </div>

        <div v-else class="review-list">
            <div v-for="review in reviews" :key="review.ReviewID" class="review-card">
                <div class="top-row">
                    <div class="stars">
                        <span v-for="n in 5" :key="n" :class="{ filled: n <= review.Rating }">★</span>
                    </div>
                    <span class="rating">{{ review.Rating }}/5</span>
                </div>
                
                <p class="comment">"{{ review.Comment }}"</p>
                
                <div class="meta">
                    <span class="author">Door: <strong>{{ getReviewerName(review) }}</strong></span>
                    <span class="role-badge">{{ review.ReviewType === 'Driver' ? 'Als Chauffeur' : 'Als Passagier' }}</span>
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
.header h1 { margin: 0 0 5px; color: #2d3748; }
.header p { color: #718096; margin: 0; }

.review-list { display: flex; flex-direction: column; gap: 15px; }
.review-card { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

.top-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.stars { color: #e2e8f0; font-size: 1.2rem; }
.stars .filled { color: #ecc94b; }
.rating { font-weight: bold; color: #4a5568; }

.comment { font-style: italic; color: #2d3748; margin-bottom: 15px; line-height: 1.5; }

.meta { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #718096; border-top: 1px solid #edf2f7; padding-top: 10px; }
.role-badge { background: #ebf8ff; color: #3182ce; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 0.75rem; }

.empty, .loading { text-align: center; color: #a0aec0; padding: 40px; }
</style>