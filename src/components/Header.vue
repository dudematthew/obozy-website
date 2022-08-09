<script>
export default {
  name: 'Header'
}
</script>


<template>
  <nav class="white" role="navigation">
    <div class="nav-wrapper container">
      <a id="logo-container" href="#" class="brand-logo">OBOZY</a>

      <ul class="right hide-on-med-and-down">
        <li><a href="https://patronite.pl/obozy" target="_blank"><span class="valign-wrapper black-text"><i class="grey-text material-icons">local_fire_department</i>&nbsp; Zostań naszym Patronem</span></a></li>
      </ul>

      <ul class="right hide-on-med-and-down">
        <li><a href="https://www.instagram.com/obozy_gra_terenowa" target="_blank"><span class="valign-wrapper black-text"><i class="grey-text material-icons">center_focus_strong</i>&nbsp; Nasz Instagram</span></a></li>
      </ul>

      <ul class="right hide-on-med-and-down">
        <li><a href="https://www.facebook.com/ObozyGraTerenowa" target="_blank"><span class="valign-wrapper black-text"><i class="grey-text material-icons">public</i>&nbsp; Nasz Facebook</span></a></li>
      </ul>

      <ul class="right hide-on-med-and-down">
        <li><a href="#"><span class="valign-wrapper black-text"><i class="grey-text material-icons">tips_and_updates</i>&nbsp; Dowiedz się więcej</span></a></li>
      </ul>
      
      <ul class="right hide-on-med-and-down">
        <li><a href="#"><span class="valign-wrapper black-text"><i class="grey-text material-icons">hand_gesture</i>&nbsp; Dołącz do nas</span></a></li>
      </ul>
      

      <ul id="nav-mobile" class="sidenav">
        <li><a href="#">Dołącz do nas</a></li>
        <li><a href="#">Dowiedz się więcej</a></li>
        <li><a href="https://www.facebook.com/ObozyGraTerenowa" target="_blank">Nasz Facebook</a></li>
        <li><a href="https://www.instagram.com/obozy_gra_terenowa" target="_blank">Nasz Instagram</a></li>
        <li><a href="https://patronite.pl/obozy" target="_blank">Zostań naszym Patronem</a></li>
      </ul>
      <a href="#" data-target="nav-mobile" class="sidenav-trigger"><i class="material-icons">menu</i></a>
    </div>
  </nav>
</template>


