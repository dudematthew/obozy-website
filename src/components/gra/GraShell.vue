<script>
import { getActiveAccount } from '@/lib/graAccounts'
import { getHostToken } from '@/lib/graHostSession'
import '@/assets/gra/gra-shell.scss'

export default {
  name: 'GraShell',
  props: {
    pageTitle: { type: String, default: 'Gra tajna' },
    showHostLink: { type: Boolean, default: false }
  },
  data() {
    return {
      account: null,
      hostLoggedIn: false
    }
  },
  computed: {
    showHost() {
      return this.showHostLink ||
        this.hostLoggedIn ||
        String(this.$route.name || '').startsWith('gra-host')
    }
  },
  mounted() {
    this.refresh()
  },
  watch: {
    $route() {
      this.refresh()
    }
  },
  methods: {
    refresh() {
      this.account = getActiveAccount()
      this.hostLoggedIn = Boolean(getHostToken())
    }
  }
}
</script>

<template>
  <div class="gra-app">
    <header class="gra-nav" role="banner">
      <div class="gra-nav__left">
        <router-link :to="{ name: 'gra-intro' }" class="gra-nav__brand" aria-label="OBOZY Festiwal">
          <img
            class="gra-nav__stamp"
            src="@/assets/images/festival-stamp.png"
            alt=""
            width="36"
            height="36"
          >
          <span class="gra-nav__brand-text">OBOZY Festiwal</span>
        </router-link>
      </div>
      <div class="gra-nav__center" aria-hidden="true">
        <span class="gra-nav__badge" role="img" aria-label="">🎉</span>
        <div class="gra-nav__meta">
          <span class="gra-nav__eyebrow">Festiwal</span>
          <span class="gra-nav__title">{{ pageTitle }}</span>
        </div>
      </div>
      <div class="gra-nav__right" role="navigation" aria-label="Gra">
        <router-link class="gra-nav__link" :to="{ name: 'gra-intro' }">Zasady</router-link>
        <router-link class="gra-nav__link" :to="{ name: 'gra-gracze' }">Gracze</router-link>
        <router-link class="gra-nav__link" :to="{ name: 'gra-gracz' }">Twój postęp</router-link>
        <router-link v-if="showHost" class="gra-nav__link" :to="{ name: 'gra-host' }">Host</router-link>
      </div>
    </header>
    <slot />
  </div>
</template>
