// ------ imports ------
import { createRouter, createWebHistory } from 'vue-router';

// ------ pages ------
import Home from '../pages/home.vue';
import Messages from '../pages/messages.vue';
import Register from '../pages/register.vue';
import Login from '../pages/login.vue';


// ------ routes ------
const routes = [
    {
        path:  '/',
        name:  'Home',
        component: Home,
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
    }
];

// ------ export ------
export const router = createRouter({
    history: createWebHistory(),
    routes,
});



