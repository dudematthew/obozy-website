<template>
  <footer class="page-footer green darken-2">
    <div class="container">
      <div class="row">
        <div class="col l6 s12">
          <h5 class="white-text">OBOZY - Gra Terenowa</h5>
          <p class="text-lighten-4 grey-text">Obozy to gra terenowa podczas której kilkadziesiąt uczestników staje w
            szranki broniąc swoich obozów i próbując zdobyć flagę wroga.</p>


        </div>
        <div class="col l3 s12">
          <h5 class="white-text">O nas</h5>
          <ul>
            <li><router-link to="/" class="white-text">Strona główna</router-link></li>
            <li><router-link to="/dolacz-do-nas" class="white-text">Dołącz do nas</router-link></li>
            <li><router-link to="/o-nas" class="white-text">Dowiedz się więcej</router-link></li>
            <li><router-link to="/instrukcja" class="white-text">Instrukcje gier</router-link></li>
            <li><router-link to="/powiadomienia" class="white-text">Bądź na bieżąco</router-link></li>
            <li>
              <a href="#narzedzia-organizatorow" class="white-text" @click.prevent="openToolsModal">Narzędzia dla
                organizatorów</a>
            </li>
            <li><router-link to="/quiz" class="white-text">Quiz o zamrożeniu</router-link></li>
          </ul>
        </div>
        <div class="col l3 s12">
          <h5 class="white-text">Sieci społecznościowe</h5>
          <ul>
            <li><a href="https://www.facebook.com/ObozyGraTerenowa" target="_blank" class="white-text">Facebook</a></li>
            <li><a href="https://www.instagram.com/obozy_gra_terenowa" target="_blank" class="white-text">Instagram</a>
            </li>
            <li><a href="https://patronite.pl/obozy" target="_blank" class="white-text">Patronite</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="footer-copyright">
      <div class="container">
        Stronę stworzył <a class="white-text" href="https://github.com/dudematthew" target="_blank">Mateusz
          Moczydłowski</a>
      </div>
    </div>
  </footer>

  <Teleport to="body">
    <div v-if="toolsOpen" class="footer-tools-modal" role="dialog" aria-modal="true"
      aria-labelledby="footer-tools-title" @click.self="closeToolsModal">
      <div class="footer-tools-modal__panel card">
        <div class="card-content">
          <div class="footer-tools-modal__head">
            <h2 id="footer-tools-title" class="footer-tools-modal__title">Narzędzia dla organizatorów</h2>
            <button type="button" class="btn-flat" aria-label="Zamknij" @click="closeToolsModal">
              <i class="material-icons">close</i>
            </button>
          </div>
          <p class="footer-tools-modal__lead">
            Wybierz panel, którego potrzebujesz:
          </p>
          <div class="footer-tools-modal__choices">
            <router-link class="footer-tools-modal__choice" :to="{ name: 'gra-host' }" @click="closeToolsModal">
              <span class="footer-tools-modal__choice-name">Host festiwalu</span>
              <span class="footer-tools-modal__choice-desc">
                Panel zadań i graczy na /gra/host (igrzyska festiwalowe).
              </span>
            </router-link>
            <router-link class="footer-tools-modal__choice" :to="{ name: 'mayhem-spot-generator' }"
              @click="closeToolsModal">
              <span class="footer-tools-modal__choice-name">Generator miejsc Mayhem</span>
              <span class="footer-tools-modal__choice-desc">
                Losuje każdej drużynie dwa sąsiadujące miejsca (1–12) na ołtarze startowe.
              </span>
            </router-link>
            <a class="footer-tools-modal__choice" href="http://obozy.dudematthew.smallhost.pl/" target="_blank"
              rel="noopener noreferrer" @click="closeToolsModal">
              <span class="footer-tools-modal__choice-name">Lockdown Manager</span>
              <span class="footer-tools-modal__choice-desc">
                Panel do zarządzania lockdownem na obozach.
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'Footer',
  data() {
    return {
      toolsOpen: false
    }
  },
  watch: {
    toolsOpen(open) {
      if (open) {
        window.addEventListener('keydown', this.onToolsKeydown)
      } else {
        window.removeEventListener('keydown', this.onToolsKeydown)
      }
    }
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onToolsKeydown)
  },
  methods: {
    openToolsModal() {
      this.toolsOpen = true
    },
    closeToolsModal() {
      this.toolsOpen = false
    },
    onToolsKeydown(e) {
      if (e.key === 'Escape') this.closeToolsModal()
    }
  }
}
</script>

<style scoped>
.footer-tools-modal {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1rem;
  box-sizing: border-box;
}

.footer-tools-modal__panel {
  width: 100%;
  max-width: 420px;
  margin: 0;
}

.footer-tools-modal__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.footer-tools-modal__title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #263238;
  line-height: 1.3;
}

.footer-tools-modal__lead {
  margin: 0 0.1rem 1rem 0 !important;
  color: #607d8b;
  line-height: 1.5;
}

.footer-tools-modal__choices {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.footer-tools-modal__choice {
  display: block;
  padding: 0.9rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(46, 125, 50, 0.22);
  background: #f1f8e9;
  color: #1b5e20;
  text-decoration: none;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.footer-tools-modal__choice:hover,
.footer-tools-modal__choice:focus {
  background: #dcedc8;
  border-color: #388e3c;
  color: #1b5e20;
}

.footer-tools-modal__choice-name {
  display: block;
  font-weight: 700;
  font-size: 1.02rem;
  margin-bottom: 0.25rem;
}

.footer-tools-modal__choice-desc {
  display: block;
  font-size: 0.88rem;
  line-height: 1.45;
  color: #546e7a;
  font-weight: 400;
}

@media (min-width: 600px) {
  .footer-tools-modal {
    align-items: center;
  }
}
</style>
