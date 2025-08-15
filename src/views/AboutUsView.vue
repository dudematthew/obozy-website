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
          <h4>Obozy to kompleksowa gra terenowa na łonie natury</h4>

          <p class="left-align flow-text">
            Wyobraź sobie weekend, gdzie dwie drużyny budują prawdziwe obozy na krańcach lasu i przez cały czas próbują
            zdobyć flagę przeciwnika. Jedynym sposobem walki jest zerwanie kolorowej bibuły z nadgarstka wroga - bez
            bibuły jesteś <i>martwy</i> i idziesz do cmentarza w swoim obozie, żeby po
            kilkunastu minutach wrócić do walki.
          </p>

          <blockquote class="left-align flow-text">
            <i>
              Miłosz, mój brat wpadł na pomysł, że zaprosi kolegów na grę w którą graliśmy kiedyś na obozie konnym -
              Flagi. Prosta gra w której dwie drużyny walczą przeciwko sobie aby zdobyć flagę przeciwnika a jedynym
              sposobem walki było zrywanie przeciwnikowi bibuły umieszczonej na jego ręce. Poszło im świetnie - nie
              mogliśmy się doczekać żeby rozbudować rozgrywkę.
            </i>
          </blockquote>

          <p class="left-align flow-text">
            To nie jest zwykła gra w berka. Budujesz szałas, planujesz nocne wypady, organizujesz obronę. Możesz być
            zwykłym szturmowcem, tankiem który przedziera się przez pokonanych wrogów, czy chochlikiem z magiczną laską.
            Kradniesz przeciwnikowi zasoby, bierzesz jeńców i handlujesz nimi w strefie neutralnej.
          </p>

          <img class="materialboxed responsive-img center" src="@/assets/images/photo3.jpg"
            style="margin: 60px auto; width: 450px" data-caption="Walka dwóch Chochlików.">

          <h4>Jak wygląda typowy dzień na Obozach?</h4>

          <p class="left-align flow-text">
            Budzisz się w namiocie, jesz śniadanie przy ognisku z drużyną. Dowódca rozdaje zadania - ktoś zostaje bronić
            obozu, ktoś idzie na zwiad, ktoś poluje na zrzuty zasobów oznaczone na mapie. Przez cały dzień trwają
            potyczki, pojmanie jeńców, próby kradzieży flagi.
            <br><br>
            Wieczorem czy na obiad przerwa na kolację, śpiewanie przy ognisku, opowiadanie o wypadkach dnia. Nocą -
            tajne wypady,
            zasadzki, próby sabotażu. Znajdujesz ukryte paczki z magicznymi zwojami - od "zamrożenia" po
            klątwy.
          </p>

          <h4>Dlaczego to działa?</h4>

          <p class="left-align flow-text">
            Bo nie ma wczytywania gry jak w grach komputerowych. Każda śmierć, każdy pojmany jeniec, każdy zdobyty zwój
            ma
            prawdziwe konsekwencje. Drużyna musi ze sobą współpracować, planować, reagować na zmieniającą się sytuację.
            A jednocześnie bawiąc się w lesie, budując obozy i siedząc przy ognisku spędzając niezapomniane chwile.
          </p>

          <h4>Historia - od prostej gry do 27-stronicowej instrukcji</h4>

          <p class="left-align flow-text">
            Mateusz i Miłosz zaczęli od prostej gry w Flagi na swoich urodzinach. Rok po roku dodawali nowe
            elementy. Klasy postaci z różnymi umiejętnościami. System pojmowania więźniów. Magiczne zwoje. Rytuały
            poświęcenia jeńców. Handel między obozami. Arena do pojedynków. Zrzuty zasobów. Ukryte skarby.
            <br><br>
            Prosta gra w berka stała się złożonym systemem, gdzie każdy element ma znaczenie. Na III edycji Obozów
            rozgrywka w pełni rozłożyła skrzydła - pełna niesamowitości które nasze umysły ożywiły a także coraz
            większej ilości asortymentu i pracy - koszulki, zaopatrzenie, zasoby, zwoje, itp.
          </p>

          <img class="materialboxed responsive-img" src="@/assets/images/photo1.jpg"
            style="margin: 60px auto; width: 450px" data-caption="Jedno z pierwszych zdjęć na Obozach." />

          <h4>Nie dla każdego, ale dla wielu</h4>

          <p class="left-align flow-text">
            Obozy to nie relaks nad jeziorem. To intensywny weekend, gdzie możesz spać 5 godzin, bo o świcie planowana
            jest akcja. Gdzie twoja drużyna liczy na ciebie, a powodzenie może oznaczać jej zwycięstwo. Gdzie będziesz
            brudny,
            zmęczony, ale w pozytywny sposób i jednocześnie pełen adrenaliny.
            <br><br>
            Ale to właśnie dlatego uczestnicy wracają rok po roku. Bo niewiele rzeczy daje takie poczucie przygody jak
            prawdziwa bitwa w lesie z prawdziwymi konsekwencjami. Połączenie survivalu, strategii, pracy zespołowej i
            czystej zabawy.
            <br><br>
            Uczestnicy spędzają około 36 godzin rozgrywki w namiotach i lesie, ale to właśnie ten fakt sprawia że gra
            jest tak dobrze odbierana. Rozgrywka nabiera życia na łonie natury a roślinność umila pobyt i przywraca
            energię.
          </p>

          <img class="materialboxed responsive-img" src="@/assets/images/photo2.jpg"
            style="margin: 60px auto; width: 450px" />

          <h4>Dołącz do nas</h4>

          <p class="left-align flow-text">
            Teraz Obozy to już coroczny zwyczaj i trudno sobie niektórym wyobrazić wakacje bez nich. Wiele osób
            zaczynało z ciekawości i zostało z nami na dłużej. Ty też możesz!
            <br>
            Szukamy ludzi, którzy mają ochotę spróbować wymyślonej przez nas zabawy. Jeśli brzmi to
            interesująco i mieszkasz niedaleko <a href="https://goo.gl/maps/iFRiGYe8CB5s8Tbm6" target="_blank">Opola</a>
            - <a href="http://www.messenger.com/obozygraterenowa" target="_blank" rel="noopener noreferrer">napisz do
              nas</a> - a my wytłumaczymy co i jak.
            <br><br>
            Następna edycja może być już niedługo. Następny termin Obozów powinien znajdować
            się w
            wydarzeniu na <a href="https://www.facebook.com/pg/ObozyGraTerenowa" target="_blank"
              rel="noopener noreferrer">stronie</a> na Facebooku.
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

  <!-- CLOSED BETA - Quiz section temporarily hidden from navigation -->
  <!--
  <div class="container">
    <div class="section">
      <div class="row">
        <div class="col s12 center">
          <h4 class="subtitle">A Ty jak znasz zasady Chochlika?</h4>
          <h5 class="header col s12 light">Sprawdź swoją wiedzę o grze Obozy!</h5>
          <p class="flow-text">Przetestuj swoją znajomość zasad, historii i ciekawostek związanych z naszą grą terenową.
          </p>
          <br>
          <router-link to="/quiz" class="btn-large waves-effect waves-light green darken-2">
            <i class="left material-icons">quiz</i>
            Sprawdź się
          </router-link>
        </div>
      </div>
    </div>
  </div>
  -->

  <div class="container">
    <div class="section">
      <div class="row">
        <div class="row center">
          <router-link to="/dolacz-do-nas" class="btn-large waves-effect waves-light green">Dołącz do nas</router-link>
        </div>
      </div>
    </div>
  </div>

  <div class="index-banner parallax-container" style="margin-bottom: 7em;">
    <div class="section no-pad-bot">
      <div class="container center">
        <h3 class="center title">Gotowy na przygodę?</h3>
        <h5 class="header col s12 light subtitle">Dołącz do nas - nie martw się, pasujesz!</h5>
        <div class="row center">
          <router-link to="/dolacz-do-nas" class="btn-large waves-effect waves-light green" style="margin: 10px;">
            Dołącz do nas
          </router-link>
          <a href="https://www.messenger.com/obozygraterenowa" target="_blank" rel="noopener noreferrer"
            class="btn-large waves-effect waves-light white green-text" style="margin: 10px;">
            Kontakt
          </a>
        </div>
      </div>
    </div>
    <div class="parallax"><img src="@/assets/images/backgrounds/background6.jpg" alt="Tło"
        style="filter: brightness(50%)"></div>
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