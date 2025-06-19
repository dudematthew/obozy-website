<script>
import GalleryCarousel from '@/components/about-us/GalleryCarousel.vue'

export default {
  name: "HomeView",
  components: {
    GalleryCarousel
  },
  data() {
    return {
      googleAlbums: [
        {
          link: "https://photos.app.goo.gl/B4p4S8MRT2253Jfu9",
          image: "obozy-8.png"
        },
        {
          link: "https://photos.app.goo.gl/ui2GPk5REdbqEvrB7",
          image: "obozy-7.png"
        },
        {
          link: "https://photos.app.goo.gl/vSDwqxgKufh1es1JA",
          image: "obozy-6.png"
        },
        {
          link: "https://photos.app.goo.gl/cpVnRNrYRCok6BJeA",
          image: "obozy-5.png"
        },
      ]
    }
  },
  computed: {
    yearsFromStart() {
      return new Date().getFullYear() - 2016;
    },
    imagesPaths() {
      let fileNames = require.context(
        '@/assets/images/gallery',
        false,
        /^.*\.jpg$/
      ).keys();

      fileNames.forEach((fileName, index) => {
        console.log(fileNames[index]);
        fileNames[index] = fileNames[index].slice(2);
      });

      console.log(fileNames);

      return fileNames;
    },
    groupedAlbums() {
      let groups = [];
      for (let i = 0; i < this.googleAlbums.length; i += 2) {
        groups.push(this.googleAlbums.slice(i, i + 2));
      }
      return groups;
    }
  },
  mounted() {
    let parallaxElems = document.querySelectorAll(".parallax");
    let materialboxedElems = document.querySelectorAll(".materialboxed");
    M.Parallax.init(parallaxElems);
    M.Materialbox.init(materialboxedElems, {
      inDuration: 0,
      outDuration: 0
    })
  },
}
</script>

<template>

  <div class="index-banner parallax-container">
    <div class="section no-pad-bot">
      <div class="container">
        <br><br>
        <h3 class="center title">Coroczne wydarzenie w lesie?</h3>
        <div class="row center">
          <h5 class="header col s12 light subtitle">Dowiedz się o nas i naszej pasji </h5>
        </div>
        <br><br>

      </div>
    </div>
    <div class="parallax"><img src="@/assets/images/backgrounds/background20.jpg" alt="Tło 1"
        style="filter: brightness(60%)"></div>
  </div>

  <div class="index-banner container">
    <div class="section">
      <div class="row">
        <div class="left-align col s12">
          <h4>Wydarzenie w którym dołączasz do dwudniowej bitwy</h4>
          <blockquote class="left-align flow-text">
            <i>
              Miłosz, mój brat wpadł na pomysł, że zaprosi kolegów na grę w którą graliśmy kiedyś na obozie konnym
              - Flagi.
              <br><br>
              Prosta gra w której dwie drużyny walczą przeciwko sobie aby zdobyć flagę przeciwnika a jedynym sposobem
              walki było zrywanie przeciwnikowi bibuły umieszczonej na jego ręce.
              Poszło im świetnie - nie mogliśmy się doczekać żeby rozbudować rozgrywkę - mieliśmy wiele pomysłów.
            </i>
          </blockquote>

          <img class="materialboxed responsive-img center" src="@/assets/images/photo1.jpg"
            style="margin: 60px auto; width: 450px" data-caption="Jedno z pierwszych zdjęć na Obozach.">

          <p class="left-align flow-text">
            Tak powstały Obozy - gra którą dwaj bracia zaczęli pieczołowicie rozwijać by grało się coraz lepiej i
            ciekawiej a także by zachęcić więcej osób do zabawy.
            <br><br>
            Dodano magiczne zwoje, zrzuty, przerwy na jedzenie, śpiewanie i granie przy ogniskach i mnóstwo innych
            rzeczy które sprawiły, że rozgrywka nabrała zupełnie innego wymiaru.
          </p>

          <h4>Prosta gra na urodziny stała się czymś więcej</h4>

          <p class="left-align flow-text">
            Impreza została zorganizowana w nasze urodziny i ku naszemu zaskoczeniu została bardzo pozytywnie odebrana.
            Kontynuowaliśmy ją rok w rok i nie mieliśmy dość.
            <br><br>
            Na III edycji Obozów rozgrywka w pełni rozłożyła skrzydła, pełna niesamowitości które nasze umysły ożywiły a
            także coraz większej ilości asortymentu i pracy.

            <br><br>

            Teraz pojawia się coraz więcej i więcej osób a my wymyślamy sposoby żeby rozgrywka zbiegła się z
            wizualizowanym przez nas ideałem.
            uczestnicy spędzają około 36 godzin rozgrywki w namiotach i lesie, ale to właśnie ten fakt sprawia że gra
            jest tak dobrze odbierana. Rozgrywka nabiera życia na łonie natury a roślinność umila pobyt i przywraca
            energię. Uczestnicy mogą doświadczyć unikatowego połączenia obozu survivalowego, zdrowego wysiłku, zabawy,
            kooperacji i jednocześnie rywalizacji.
          </p>

          <img class="materialboxed responsive-img" src="@/assets/images/photo2.jpg"
            style="margin: 60px auto; width: 450px" />

          <h4>Możesz do nas dołączyć</h4>

          <p class="left-align flow-text">


            Teraz Obozy to już coroczny zwyczaj i trudno sobie niektórym wyobrazić wakacje bez nich.
            <br>
            Szukamy coraz większej grupy ludzi którzy mieliby ochotę spróbować przeżyć z nami tę przygodę.
            <br><br>
            Jeśli Ty również masz ochotę spróbować, a mieszkasz niedaleko <a
              href="https://goo.gl/maps/iFRiGYe8CB5s8Tbm6" target="_blank">Opola</a> - <a
              href="http://www.messenger.com/obozygraterenowa" target="_blank" rel="noopener noreferrer">napisz do
              nas</a> - a my wytłumaczymy co i jak.
            <br><br>
            Następny termin Obozów powinien znajdować się w wydarzeniu na <a
              href="https://www.facebook.com/pg/ObozyGraTerenowa" target="_blank" rel="noopener noreferrer">stronie</a>
            na Facebooku.
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="index-banner parallax-container">
    <div class="section no-pad-bot">
      <div class="container">
        <br><br>
        <h3 class="center title">Stworzyliśmy grę...</h3>
        <div class="row center">
          <h5 class="header col s12 light subtitle">...która przyciąga ludzi głodnych wrażeń</h5>
        </div>
        <br><br>

      </div>
    </div>
    <div class="parallax"><img src="@/assets/images/backgrounds/background21.jpg" alt="Tło 1"
        style="filter: brightness(60%)"></div>
  </div>

  <div class="index-banner container carousel-container center m12 s12">
    <div class="section">
      <div class="row">
        <div class="col s12 center" style="margin-bottom: -30px;">
          <h4 class="subtitle">Zobacz urywki z wydarzenia</h4>
        </div>
      </div>
      <div class="row">
        <div class="col s12 center">
          <br><br>
          <GalleryCarousel />
          <br><br>
        </div>
      </div>
    </div>
  </div>

  <div class="container" id="zasady-gry">
    <div class="section">
      <div class="row">
        <div class="col s12 center">
          <h4 class="subtitle">Więcej zdjęć?</h4>
          <h5 class="header col s12 light">Zobacz albumy poprzednich Edycji Obozów!</h5>
        </div>
        <div class="col s12">
          <div class="row" v-for="(albumGroup, index) in groupedAlbums" :key="index">
            <div class="col s12 m6" v-for="album, key in albumGroup" :key="key"
              :class="{ 'offset-m3': albumGroup.length === 1 }">
              <div class="card hoverable">
                <a :href="album.link" target="_blank" class="card-image">
                  <img class="activator" :src="require('@/assets/images/backgrounds/' + album.image)">
                </a>
                <div class="card-action center">
                  <a :href="album.link" target="_blank" class="light-green-text" style="margin: 0;">Zobacz Album
                    Google</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="container" id="zasady-gry">
    <div class="section">
      <div class="row">
        <div class="col s12 center" style="margin-bottom: -30px;">
          <h4 class="subtitle">Zasady gry i załączniki</h4>
          <h5 class="header col s12 light">Poznaj udoskonalaną od {{yearsFromStart}} lat grę Obozy</h5>
          <h6 class="header col s12 light" style="font-style: italic;">Zalecamy uproszczoną wersję</h6>
        </div>
      </div>
      <div class="row">
        <div class="col s12 center">
          <br><br>
          <iframe src="https://drive.google.com/embeddedfolderview?id=13csMsz_7qZmU8rTouc3kgGcIshRWUNCw#list"
            style="width:100%; height:500px; border:0; overflow: hidden;" title="Zasady Gry"></iframe>
        </div>
      </div>

    </div>
  </div>

  <div class="container">
    <div class="section">
      <div class="row">
        <div class="row center">
          <router-link to="/dolacz-do-nas" class="btn-large waves-effect waves-light green">Dołącz do nas</router-link>
        </div>
      </div>
    </div>
  </div>

</template>

<style lang="scss" scoped>
h4 {
  margin-top: 70px;
}

@media only screen and (max-width : 1200px) {
  .carousel-container {
    width: 100%;
    margin-right: 0;
    margin-left: 0;
    padding-left: 0;
    padding-right: 0;
  }

  .col {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>