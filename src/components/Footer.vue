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
            <li><a href="http://obozy.dudematthew.smallhost.pl/" target="_blank" class="white-text">Narzędzia dla
                arbitrów</a></li>
            <!-- CLOSED BETA - Quiz temporarily hidden from navigation -->
            <!-- <li><router-link to="/quiz" class="white-text">Quiz - Sprawdź się</router-link></li> -->
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
</template>

<script>
export default {
  name: 'Footer'
}
</script>