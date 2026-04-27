import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AboutUsView from '../views/AboutUsView.vue';
import JoinUsView from '../views/JoinUsView.vue';
import QuizView from '../views/QuizView.vue';
import NotificationsView from '../views/NotificationsView.vue';
import { updateMetaTags, getMetaForRoute } from '../lib/metaUtils.js';

// Remember to also set proper og tags in ./netlify/edge-functions/og-inject.js
const routes = [
  {
    path: '/instrukcja',
    name: 'manual-index',
    component: () => import('../views/ManualIndexView.vue'),
    meta: {
      title: 'Instrukcje | Obozy - Gra Terenowa',
      description: 'Lista interaktywnych instrukcji do gier Obozy.'
    }
  },
  {
    path: '/instrukcja/:manualId/:tileSlug?',
    name: 'manual',
    component: () => import('../views/ManualView.vue'),
    meta: {
      title: 'Instrukcja | Obozy - Gra Terenowa',
      description: 'Interaktywna instrukcja gry terenowej Obozy.',
      hideChrome: true
    }
  },
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Obozy - Gra Terenowa | Prawdziwa przygoda w lesie',
      description: 'Spędź dwa dni na łonie natury tocząc wspólnie zaciekły bój o flagę. Odkryj intensywną grę terenową pełną strategii, pracy zespołowej i prawdziwej adrenaliny.'
    }
  },
  {
    path: '/o-nas',
    name: 'about-us',
    component: AboutUsView,
    meta: {
      title: 'O nas - Historia i Pasja | Obozy - Gra Terenowa',
      description: 'Poznaj historię Obozów - od prostej gry w berka do złożonego systemu pełnego strategii. Dowiedz się, dlaczego od lat wracamy na coroczne wydarzenie w lesie.'
    }
  },
  {
    path: '/dolacz-do-nas',
    name: 'join-us',
    component: JoinUsView,
    meta: {
      title: 'Dołącz do nas - Instrukcje i Kontakt | Obozy - Gra Terenowa',
      description: 'Chcesz dołączyć do Obozów? Poznaj naszą ekipę i dowiedz się, jak możesz zostać uczestnikiem najbardziej intensywnej gry terenowej w okolicach Opola.'
    }
  },
  {
    path: '/powiadomienia',
    name: 'powiadomienia',
    component: NotificationsView,
    meta: {
      title: 'Bądź na bieżąco - Powiadomienia | Obozy - Gra Terenowa',
      description: 'Zostaw swój adres e-mail i dowiedz się pierwszy o terminie, lokalizacji i wolnych miejscach na kolejnej edycji Obozów.'
    }
  },
  {
    path: '/quiz',
    name: 'quiz',
    component: QuizView,
    meta: {
      title: 'Quiz o Zamrożeniu | Obozy - Gra Terenowa',
      description: 'Sprawdź, jak dobrze znasz zasady Stanu Zamrożenia! Rozwiąż quiz i dowiedz się, czy jesteś gotowy na pole bitwy.'
    }
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to) {
    if (to.name === 'manual' || to.name === 'manual-index') {
      return { left: 0, top: 0 }
    }
    const app = document.getElementById('app')
    if (app) app.scrollIntoView({ behavior: 'auto' })
  }
});

// Global navigation guard to update meta tags
router.beforeEach((to) => {
  // Update meta tags based on the route
  const metaData = getMetaForRoute(to.name);

  // Use nextTick to ensure DOM is ready
  setTimeout(() => {
    updateMetaTags(metaData);
  }, 0);
});

// Update meta tags on initial load
router.onReady = () => {
  const currentRoute = router.currentRoute.value;
  const metaData = getMetaForRoute(currentRoute.name);
  updateMetaTags(metaData);
};

export default router;
