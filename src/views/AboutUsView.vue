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

  <div class="container">
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

  <div class="container carousel-container center">
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
              <div class="card hoverable" style="margin-inline-end: 10px;">
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
          <h5 class="header col s12 light">Poznaj udoskonalaną od {{ yearsFromStart }} lat grę Obozy</h5>
        </div>
      </div>
      <div class="row">
        <div class="col s12 center">
          <br><br>
          <iframe src="https://drive.google.com/embeddedfolderview?id=13csMsz_7qZmU8rTouc3kgGcIshRWUNCw#list"
            style="width:100%; height:400px; border:0; overflow: hidden;" title="Zasady Gry"></iframe>
        </div>
      </div>
      <div class="row learn-section" style="margin-top: 4em; margin-bottom: 10em;">
        <div class="col s12 center learn-section__header">
          <h4 class="subtitle">A Ty jak znasz zasady gry?</h4>
          <h5 class="header light">Sprawdź się w quizie lub przeczytaj na specjalnym czytniku</h5>
        </div>
        <div class="col s12">
          <div class="learn-options">
            <router-link to="/instrukcja" class="learn-option learn-option--manual">
              <div class="learn-option__icon" aria-hidden="true">
                <i class="material-icons">menu_book</i>
              </div>
              <div class="learn-option__body">
                <span class="learn-option__title">Interaktywne instrukcje</span>
                <p class="learn-option__desc">
                  Czytaj szybciej - pomijaj nieistotne fragmenty i wracaj do sekcji, które Cię interesują.
                </p>
                <span class="learn-option__link">
                  Zobacz
                  <i class="material-icons" aria-hidden="true">chevron_right</i>
                </span>
              </div>
            </router-link>

            <router-link to="/quiz" class="learn-option learn-option--quiz">
              <div class="learn-option__icon" aria-hidden="true">
                <i class="material-icons">quiz</i>
              </div>
              <div class="learn-option__body">
                <span class="learn-option__title">Quiz o zamrożeniu</span>
                <p class="learn-option__desc">
                  Sprawdź, czy dobrze znasz zasady zamrożenia i Chochlika - test wiedzy dla zaawansowanych.
                </p>
                <span class="learn-option__link">
                  Sprawdź
                  <i class="material-icons" aria-hidden="true">chevron_right</i>
                </span>
              </div>
            </router-link>
          </div>
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
          <a href="https://www.messenger.com/t/105317307701584" target="_blank" rel="noopener noreferrer"
            class="btn-large waves-effect waves-light white green-text" style="margin: 10px;">
            Kontakt
          </a>
        </div>
      </div>
    </div>
    <div class="parallax"><img src="@/assets/images/backgrounds/background30.jpg" alt="Tło"
        style="filter: brightness(50%)"></div>
  </div>

</template>

<style lang="scss" scoped>
h4 {
  margin-top: 70px;
}

.learn-section {
  margin-top: 1.5rem;
  margin-bottom: 4rem;
}

.learn-section__header {
  margin-bottom: 0.5rem;

  .subtitle {
    margin-top: 0;
  }

  .header {
    margin-top: 0.35rem;
    margin-bottom: 0;
  }
}

.learn-options {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;

  @media only screen and (min-width: 601px) {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
}

.learn-option {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1rem 1rem 1.1rem;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-left-width: 4px;
  color: inherit;
  text-align: left;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}

.learn-option--manual {
  border-left-color: #4caf50;
}

.learn-option--quiz {
  border-left-color: #5c6bc0;
}

.learn-option__icon {
  flex: 0 0 auto;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  .material-icons {
    font-size: 1.35rem;
  }
}

.learn-option--manual .learn-option__icon {
  background: rgba(76, 175, 80, 0.12);
  color: #388e3c;
}

.learn-option--quiz .learn-option__icon {
  background: rgba(92, 107, 192, 0.12);
  color: #3949ab;
}

.learn-option__body {
  flex: 1;
  min-width: 0;
}

.learn-option__title {
  display: block;
  font-size: 1.05rem;
  font-weight: 600;
  color: #263238;
  line-height: 1.25;
}

.learn-option__desc {
  margin: 0.35rem 0 0.65rem;
  font-size: 0.92rem;
  line-height: 1.45;
  color: #546e7a;
}

.learn-option__link {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  font-size: 0.9rem;
  font-weight: 500;

  .material-icons {
    font-size: 1.1rem;
  }
}

.learn-option--manual .learn-option__link {
  color: #388e3c;
}

.learn-option--quiz .learn-option__link {
  color: #3949ab;
}

@media only screen and (max-width : 1200px) {
  .carousel-container {
    width: 100%;
    margin-right: 0;
    margin-left: 0;
    padding-left: 0;
    padding-right: 0;
  }

  .carousel-container .col {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>