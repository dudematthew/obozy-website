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
                class="green-text material-icons text-darken-2">local_fire_department</i>&nbsp; Zostań naszym Patronem</span></a></li>
      </ul>

      <ul class="right hide-on-med-and-down">
        <li><a href="https://www.instagram.com/obozy_gra_terenowa" target="_blank"><span
              class="valign-wrapper black-text"><i class="green-text material-icons text-darken-2">center_focus_strong</i>&nbsp; Nasz
              Instagram</span></a></li>
      </ul>

      <ul class="right hide-on-med-and-down">
        <li><a href="https://www.facebook.com/ObozyGraTerenowa" target="_blank"><span
              class="valign-wrapper black-text"><i class="green-text material-icons text-darken-2">public</i>&nbsp; Nasz
              Facebook</span></a></li>
      </ul>

      <ul class="right hide-on-med-and-down">
        <li>
          <router-link to="/dolacz-do-nas"><span class="valign-wrapper black-text"><i class="green-text material-icons text-darken-2">group_add</i>&nbsp; Dołącz do nas</span></router-link>
        </li>
      </ul>

          <ul class="right hide-on-med-and-down">
            <li>
              <router-link to="/o-nas"><span class="valign-wrapper black-text"><i class="green-text material-icons text-darken-2">lightbulb_circle</i>&nbsp; O Obozach</span></router-link>
            </li>
          </ul>

      <ul id="nav-mobile" class="sidenav">
        <li><router-link to="/o-nas">O Obozach</router-link></li>
        <li><a href="#">Dowiedz się więcej</a></li>
        <li><a href="https://www.facebook.com/ObozyGraTerenowa" target="_blank">Nasz Facebook</a></li>
        <li><a href="https://www.instagram.com/obozy_gra_terenowa" target="_blank">Nasz Instagram</a></li>
        <li><a href="https://patronite.pl/obozy" target="_blank">Zostań naszym Patronem</a></li>
      </ul>
      <a href="#" data-target="nav-mobile" class="sidenav-trigger"><i class="material-icons">menu</i></a>
    </div>
  </nav>
</template>