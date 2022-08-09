<script>
  import iframeResize from 'iframe-resizer/js/iframeResizer'

  export default {
    name: 'HomeView',
    computed: {
      yearsFromStart () {
        return new Date().getFullYear() - 2016;
      }
    },
    methods: {
      resizeSelf (e) {
        console.log('resizing');
        e.target.style.paddingBottom = "-50px";
        // iframeResize({}, e.target);
      }
    }
  }
</script>

<template>

  <div class="index-banner parallax-container">
    <div class="section no-pad-bot">
      <div class="container">
        <br><br>
        <h1 class="center title main-title" style="margin-bottom: 0px; padding-bottom: 0;">OBOZY</h1>
        <h3 class="center title">Gra Terenowa</h3>
        <div class="row center">
          <h5 class="header col s12 light subtitle">Spędź dwa dni na łonie natury tocząc wspólnie zaciekły bój o flagę</h5>
        </div>
        <div class="row center">
          <a href="#" class="btn-large waves-effect waves-light green lighten-1">Dołącz do nas</a>
        </div>
        <br><br>

      </div>
    </div>
    <div class="parallax"><img src="@/assets/images/background1.png" alt="Tło 1" style="filter: brightness(60%)"></div>
  </div>


  <div class="container">
    <div class="section">

      <!--   Icon Section   -->
      <div class="row">
        <div class="col s12 m4">
          <div class="icon-block">
            <h2 class="center brown-text"><i class="material-icons">sports_kabaddi</i></h2>
            <h5 class="center">Walcz tak jak potrafisz</h5>

            <p class="light justified">Czy to rekonesans albo walka podjazdowa, czy to manewrowanie liczebnością przeciwnika używając sprytu, czy to miażdżenie oponentów czystą siłą. Stworzyliśmy zasady, które umożliwiają Ci stanięcie do prawdziwej walki w której pokażesz swoje wewnętrzne zwierzę nie robiąc nikomu krzywdy. </p>
          </div>
        </div>

        <div class="col s12 m4">
          <div class="icon-block">
            <h2 class="center brown-text"><i class="material-icons">construction</i></h2>
            <h5 class="center">Zbuduj  i obroń swój obóz</h5>

            <p class="light justified">Jak sobie pościelesz, tak się wyśpisz. Korzystaj z przygotowanych materiałów by pomóc stworzyć mur, który pozwoli Wam bronić się przed wrogimi najazdami. Pracujcie razem, by odeprzeć ataki najeźdźców żądnych waszej flagi.</p>
          </div>
        </div>

        <div class="col s12 m4">
          <div class="icon-block">
            <h2 class="center brown-text"><i class="material-icons">flag</i></h2>
            <h5 class="center">Zdobądź flagę i zwyciężaj</h5>

            <p class="light justified">Dostań się do wrogiego obozu, złap flagę i nie puszczaj gdy będą Cię ścigać. Poczuj buzującą adrenalinę i świętuj z wszystkimi udaną operację.</p>
          </div>
        </div>
      </div>

    </div>
  </div>

  <div class="index-banner parallax-container">
    <div class="section no-pad-bot">
      <div class="container">
        <br><br>
        <h3 class="center title">Jak to wygląda?</h3>
        <div class="row center">
          <h5 class="header col s12 light subtitle">Zobacz, dlaczego od {{yearsFromStart}} lat wciąż wracamy do gry</h5>
        </div>
        <div class="row center">
          <a href="#" class="btn-large waves-effect waves-light green lighten-1">Dowiedz się więcej</a>
        </div>
        <br><br>

      </div>
    </div>
    <div class="parallax"><img src="@/assets/images/background2.png" alt="Tło 1" style="filter: brightness(60%)"></div>
  </div>

  <div class="container">
    <div class="section">
      <div class="row">
        <div class="col s12 center" style="margin-bottom: -30px;">
          <h4 class="subtitle">Dowiedz się kiedy zaczną się następne Obozy</h4>
        </div>
      </div>
      <div class="row">
        <div class="col s12 center">
            <br><br>
            <iframe id="live-preview" src="https://widgets.sociablekit.com/facebook-page-events/iframe/88019" frameborder="0" width="100%" height="440" style="height: 440px" allowfullscreen></iframe>
            <br><br>
        </div>
      </div>

    </div>
  </div>


  <div class="index-banner parallax-container">
    <div class="section no-pad-bot">
      <div class="container">
        <br><br>
        <h3 class="center title">Masz pytania?</h3>
        <div class="row center">
          <h5 class="header col s12 light subtitle">Odpowiemy na każde!</h5>
        </div>
        <div class="row center">
          <a href="https://www.messenger.com/t/105317307701584?fbclid=IwAR1kWyWl0I83qIfKwfy-p1Ca21bb6g9JvODzkiZq5016idUDqEcSipvmWm4" target="_blank" class="btn-large waves-effect waves-light green lighten-1">Skontaktuj się z nami</a>
        </div>
        <br><br>

      </div>
    </div>
    <div class="parallax"><img src="@/assets/images/background3.jpg" alt="Tło 3" style="filter: brightness(60%)"></div>
  </div>

  <div class="container">
    <div class="section">
      <div class="row">
        <div class="col s12 center">
          <h4 class="subtitle" style="margin-bottom: 20px">Zaobserwuj nas na Facebooku</h4>
        </div>
      </div>
      <div class="row">
        <div class="col s12">
          <div class='sk-ww-facebook-page-posts' data-embed-id='88023'></div>
        </div>
      </div>

    </div>
  </div>


</template>
