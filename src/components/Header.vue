<script>
export default {
  name: 'Header',
  mounted() {
    document.addEventListener('DOMContentLoaded', function () {
      let sidenavElems = document.querySelectorAll('.sidenav');
      M.Sidenav.init(sidenavElems);
    });
  }
}
</script>


<template>
  <nav class="white site-nav" role="navigation">
    <div class="nav-wrapper container">
      <router-link to="/" id="logo-container" href="#" class="brand-logo">OBOZY</router-link>

      <ul class="right hide-on-med-and-down site-nav__desktop">
        <li>
          <router-link to="/o-nas"><span class="valign-wrapper black-text"><i
                class="text-darken-2 green-text material-icons">lightbulb_circle</i> O Obozach</span></router-link>
        </li>
        <li>
          <router-link to="/powiadomienia"><span class="valign-wrapper black-text"><i
                class="text-darken-2 green-text material-icons">circle_notifications</i> Bądź na bieżąco</span></router-link>
        </li>
        <li>
          <a href="https://www.facebook.com/ObozyGraTerenowa" target="_blank" rel="noopener noreferrer"><span
              class="valign-wrapper black-text"><i class="text-darken-2 green-text material-icons">public</i> Nasz Facebook</span></a>
        </li>
        <li>
          <router-link to="/instrukcja"><span class="valign-wrapper black-text"><i
                class="text-darken-2 green-text material-icons">menu_book</i> Instrukcje</span></router-link>
        </li>
        <li>
          <a href="https://patronite.pl/obozy" target="_blank" rel="noopener noreferrer"><span class="valign-wrapper black-text"><i
                class="text-darken-2 green-text material-icons">local_fire_department</i> Zostań naszym Patronem</span></a>
        </li>
      </ul>


      <ul id="nav-mobile" class="sidenav">
        <li><router-link to="/" class="sidenav-close">OBOZY</router-link></li>
        <li><router-link to="/o-nas" class="sidenav-close">O Obozach</router-link></li>
        <li><router-link to="/instrukcja" class="sidenav-close">Instrukcje</router-link></li>
        <li><router-link to="/dolacz-do-nas" class="sidenav-close">Dołącz do nas</router-link></li>
        <li><router-link to="/powiadomienia" class="sidenav-close">Bądź na bieżąco</router-link></li>
        <li><a href="https://www.facebook.com/ObozyGraTerenowa" target="_blank">Nasz Facebook</a></li>
        <li><a href="https://www.instagram.com/obozy_gra_terenowa" target="_blank">Nasz Instagram</a></li>
        <li><a href="https://patronite.pl/obozy" target="_blank">Zostań naszym Patronem</a></li>
      </ul>
      <a href="#" data-target="nav-mobile" class="sidenav-trigger"><i class="material-icons">menu</i></a>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
/* Desktop only: slightly tighter nav links so they don't crowd the logo */
@media only screen and (min-width: 993px) {
  nav.site-nav ul.site-nav__desktop > li > a {
    padding: 0 10px;
    font-size: 0.9rem;
  }

  nav.site-nav ul.site-nav__desktop > li > a .valign-wrapper {
    gap: 5px;
  }

  nav.site-nav ul.site-nav__desktop > li > a .material-icons {
    font-size: 1.2rem;
  }
}
</style>