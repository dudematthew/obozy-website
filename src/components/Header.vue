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
  <nav class="white" role="navigation">
    <div class="nav-wrapper container">
      <router-link to="/" id="logo-container" href="#" class="brand-logo">OBOZY</router-link>

      <ul class="right hide-on-med-and-down">
        <li><a href="https://patronite.pl/obozy" target="_blank"><span class="valign-wrapper black-text"><i
                class="text-darken-2 green-text material-icons">local_fire_department</i>&nbsp; Zostań naszym
              Patronem</span></a></li>
      </ul>

      <ul class="right hide-on-med-and-down">
        <li><a href="https://www.facebook.com/ObozyGraTerenowa" target="_blank"><span
              class="valign-wrapper black-text"><i class="text-darken-2 green-text material-icons">public</i>&nbsp; Nasz
              Facebook</span></a></li>
      </ul>

      <ul class="right hide-on-med-and-down">
        <li><router-link to="/powiadomienia"><span class="valign-wrapper black-text"><i
                class="text-darken-2 green-text material-icons">circle_notifications</i>&nbsp; Bądź na
              bieżąco</span></router-link>
        </li>
      </ul>

      <ul class="right hide-on-med-and-down">
        <li>
          <router-link to="/dolacz-do-nas"><span class="valign-wrapper black-text"><i
                class="text-darken-2 green-text material-icons">group_add</i>&nbsp; Dołącz do nas</span></router-link>
        </li>
      </ul>

      <ul class="right hide-on-med-and-down">
        <li>
          <router-link to="/o-nas"><span class="valign-wrapper black-text"><i
                class="text-darken-2 green-text material-icons">lightbulb_circle</i>&nbsp; O
              Obozach</span></router-link>
        </li>
      </ul>

      <ul id="nav-mobile" class="sidenav">
        <li><router-link to="/o-nas" class="sidenav-close">O Obozach</router-link></li>
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