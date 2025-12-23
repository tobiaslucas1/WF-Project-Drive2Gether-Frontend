// ------ imports ------
import { createRouter, createWebHistory } from 'vue-router';

// ------ pages ------
import Home from '../pages/home.vue';
import Messages from '../pages/messages.vue';
import Register from '../pages/register.vue';
import Login from '../pages/login.vue';
import Trips from '../pages/trips.vue';  

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
    }
];

// ------ export ------
export const router = createRouter({
    history: createWebHistory(),
    routes,
});



