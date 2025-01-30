import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AboutUsView from '../views/AboutUsView.vue';
import JoinUsView from '../views/JoinUsView.vue';
import QuizView from '../views/QuizView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/o-nas',
    name: 'about-us',
    component: AboutUsView
  },
  {
    path: '/dolacz-do-nas',
    name: 'join-us',
    component: JoinUsView
  },
  {
    path: '/quiz',
    name: 'quiz',
    component: QuizView
  },
  // {
  //   path: '/game-master-panel',
  //   name: 'game master panel',
  //   component: () => import('../views/GameMasterPanelView.vue')
  // },

];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior() {
    document.getElementById('app').scrollIntoView({ behavior: 'auto' });
  }
});

export default router;
