// ------ imports ------
import { createRouter, createWebHistory } from 'vue-router';

// ------ pages ------
import Home from '../pages/home.vue';
import Messages from '../pages/messages.vue';
import Register from '../pages/register.vue';
import Login from '../pages/login.vue';
import Trips from '../pages/trips.vue';  
import TripDetails from '../pages/TripDetails.vue';

// ------ routes ------
const routes = [
    {
        path:  '/',
        name:  'Home',
        component: Home,
    },
    {
        path:  '/login',
        name:  'Login',
        component: Login,
    },
    {
        path:  '/messages',
        name:  'Messages',
        component: Messages,
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
    },
    {
        path : '/trips',
        name : 'trips',
        component : Trips,    
    },
    {
        path : '/trips/:id',
        name : 'TripDetails',
        component : TripDetails,    
    }
];

// ------ export ------
export const router = createRouter({
    history: createWebHistory(),
    routes,
});



