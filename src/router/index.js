// ------ imports ------
import { createRouter, createWebHistory } from 'vue-router';

// ------ pages ------
import Home from '../pages/home.vue';
import Messages from '../pages/messages.vue';
import Login from '../pages/login.vue';
import Register from '../pages/register.vue';
import Trips from '../pages/trips.vue';  
import TripDetails from '../pages/TripDetails.vue';
import BookingSuccess from '../pages/BookingSuccess.vue';
import Settings from '../pages/settings.vue';
import CreateRide from '../pages/CreateRide.vue';
import MyTrips from '../pages/MyTrips.vue';

// ------ routes ------
const routes = [
    {
        path : '/booking-success',
        name : 'BookingSuccess',
        component : BookingSuccess,
    },
    {
        path : '/create-ride',
        name : 'CreateRide',
        component : CreateRide,
    },
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
        path : '/my-trips',
        name : 'MyTrips',
        component : MyTrips,
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
    },
    {
        path : '/settings',
        name : 'Settings',
        component : Settings,
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



