import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AboutUsView from '../views/AboutUsView.vue';
import JoinUsView from '../views/JoinUsView.vue';
import QuizView from '../views/QuizView.vue';
import NotificationsView from '../views/NotificationsView.vue';
import { applyRouteMeta } from '../lib/metaUtils.js';

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
  {
    path: '/gra',
    name: 'gra-intro',
    component: () => import('../views/gra/GraIntroView.vue'),
    meta: {
      title: 'Tajna Gra | Obozy Festiwal',
      description: 'Znalazłeś zadanie. Tajna zabawa festiwalu.',
      hideChrome: true
    }
  },
  {
    path: '/gra/gracz',
    name: 'gra-gracz',
    component: () => import('../views/gra/GraGraczView.vue'),
    meta: {
      title: 'Twój postęp | Obozy Festiwal',
      description: 'Twój wynik i tożsamość w tajnej zabawie festiwalu.',
      hideChrome: true
    }
  },
  {
    path: '/gra/gracze',
    name: 'gra-gracze',
    component: () => import('../views/gra/GraGraczeView.vue'),
    meta: {
      title: 'Ranking | Obozy Festiwal',
      description: 'Ranking punktowy tajnej zabawy.',
      hideChrome: true
    }
  },
  {
    path: '/gra/konto',
    redirect: { name: 'gra-gracz' }
  },
  {
    path: '/gra/ja',
    redirect: { name: 'gra-gracz' }
  },
  {
    path: '/gra/t/:acceptToken',
    name: 'gra-play',
    component: () => import('../views/gra/GraPlayView.vue'),
    meta: {
      title: 'Zadanie | Gra tajna',
      description: 'Przyjmij i wykonaj zadanie festiwalowe.',
      hideChrome: true
    }
  },
  {
    path: '/gra/v/:verifyToken',
    name: 'gra-verify',
    component: () => import('../views/gra/GraVerifyView.vue'),
    meta: {
      title: 'Potwierdzenie | Gra tajna',
      description: 'Podgląd statusu zadania bez możliwości akceptacji.',
      hideChrome: true
    }
  },
  {
    path: '/gra/host',
    name: 'gra-host',
    component: () => import('../views/gra/GraHostView.vue'),
    meta: {
      title: 'CMR Organizatorów | Gra tajna',
      description: 'Panel organizatorów.',
      hideChrome: true
    }
  },
  {
    path: '/gra/host/zadania/nowe',
    name: 'gra-host-new',
    component: () => import('../views/gra/GraHostNewView.vue'),
    meta: {
      title: 'Nowe zadanie | Host',
      description: 'Utwórz zadanie festiwalowe.',
      hideChrome: true
    }
  },
  {
    path: '/gra/host/zadania/:id',
    name: 'gra-host-task',
    component: () => import('../views/gra/GraHostTaskView.vue'),
    meta: {
      title: 'Zadanie | Host',
      description: 'Edycja zadania i kody QR.',
      hideChrome: true
    }
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to) {
    if (
      to.name === 'manual' ||
      to.name === 'manual-index' ||
      (typeof to.name === 'string' && to.name.startsWith('gra-'))
    ) {
      return { left: 0, top: 0 }
    }
    const app = document.getElementById('app')
    if (app) app.scrollIntoView({ behavior: 'auto' })
  }
});

router.beforeEach((to) => {
  // ManualView sets per-manual title/description after IR load
  if (to.name === 'manual') return
  applyRouteMeta(to)
});

export default router;
