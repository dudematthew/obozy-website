<script>
/* global M */
export default {
  name: "HomeView",
  data() {
    return {
      staffData: [{
        name: "Mateusz M.",
        description: "Zajmuje się mechaniką gry, tworzy mapy i grafiki. Stworzył tę stronę internetową i od lat organizuje z chłopakami coroczne Obozy. Preferuje granie klasą Chochlika.",
        imageName: "mateusz"
      },
      {
        name: "Miłosz M.",
        description: "Wpadł na pomysł by stworzyć Obozy. Co rok zajmuje się organizacją i załatwia trudne elementy przedsięwzięcia. Preferuje granie klasą Tanka.",
        imageName: "milosz"
      },
      {
        name: "Janek B.",
        description: "Pomógł uregulować dużą część instrukcji. Razem z bratem każdego roku wnosi niesamowitą pomoc podczas organizacji. Preferuje granie klasą Tanka.",
        imageName: "janek"
      },
      {
        name: "Karol B.",
        description: "Wyjątkowo usprawnia porządkowanie informacji. Od wielu lat pomaga we wszystkim zarówno fizycznie i mentalnie. Preferuje granie klasą Skauta.",
        imageName: "karol"
      },
      ],
      joinStepsData: [
        {
          title: "Napisz do nas",
          content: '<a href="https://www.messenger.com/t/105317307701584?fbclid=IwAR1kWyWl0I83qIfKwfy-p1Ca21bb6g9JvODzkiZq5016idUDqEcSipvmWm4" target="_blank">Daj znać</a>, że chcesz dołączyć. Odpowiemy na pytania i upewnimy się że wszystko jest w należytym porządku. Nie ma również problemu jeśli zapragniesz zaprosić towarzystwo.',
          color: "pink"
        },
        {
          title: "Zajrzyj na Facebooka",
          content: 'Kilka miesięcy przed Obozami, na <a href="https://www.facebook.com/ObozyGraTerenowa" target="_blank">stronie Obozów</a> na Facebooku pojawi się wydarzenie. Wyraź zainteresowanie lub zadeklaruj udział, żeby otrzymywać wszystkie niezbędne aktualizacje.',
          color: "blue"
        },
        {
          title: "Przygotuj się",
          content: 'Tuż przed wydarzeniem udostępniamy listę rzeczy, które należy sobie przygotować na grę. Nie jest ona bardziej złożona od listy rzeczy na biwak. Jeśli chcesz możesz <router-link to="/o-nas">przejrzeć </router-link> na czym polega wydarzenie.',
          color: "grey"
        },
        {
          title: "Przyjedź na miejsce",
          content: 'Obozy organizowane są zazwyczaj w okolicach miasta <a href="https://goo.gl/maps/iFRiGYe8CB5s8Tbm6" target="_blank">Opole</a>. Niekiedy w danym roku zmieniamy lokalizację, która będzie udostępniana na wydarzeniu. Zabierz się swoim bolidem lub poproś innych o podwózkę.',
          color: "green"
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
      <div class="container center">
        <br><br>
        <h3 class="center title" style="margin-bottom: 0">Chciałbyś się przyłączyć?</h3>
        <div class="row center">
          <h4 class="header col s12 light subtitle">Nie myśl - działaj</h4>
        </div>
        <div class="row center">
          <a href="https://www.messenger.com/t/105317307701584?fbclid=IwAR1kWyWl0I83qIfKwfy-p1Ca21bb6g9JvODzkiZq5016idUDqEcSipvmWm4"
            target="_blank" class="btn-large waves-effect waves-light green">Skontaktuj się z nami</a>
        </div>
        <br><br>

      </div>
    </div>
    <div class="parallax"><img src="@/assets/images/backgrounds/background30.jpg" alt="Tło 1"
        style="filter: brightness(60%)"></div>
  </div>

  <div class="container">
    <div class="section">
      <div class="row">
        <div class="col s12 center" style="margin-bottom: -10px;">
          <h4 class="subtitle">Poznaj ekipę</h4>
        </div>
      </div>
      <div class="row">
        <div class="col s12 center">
          <div class="col s12 m6" v-for="(staff, index) in staffData" :key="index">
            <div class="z-depth-1 card-panel staff-panel grey lighten-5" style="height: auto">
              <div class="row">
                <div class="col s12 m12 l4">
                  <img :src="require('@/assets/images/profile-pictures/'+ staff.imageName + '.png')" :alt="staff.name"
                    class="circle responsive-img">
                </div>
                <div class="left-align col s12 m12 l8">
                  <h4>{{staff.name}}</h4>
                  <span class="black-text">
                    {{staff.description}}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="col s12">
            <div class="z-depth-1 card-panel grey lighten-5" style="height: auto">
              <div class="row">
                <div class="col s12 m12 l4 xl3">
                  <img src="@/assets/images/profile-pictures/all.png" class="circle responsive-img">
                </div>
                <div class="left-align col s12 m12 l7 xl9">
                  <h4>Uczestnicy</h4>
                  <span class="black-text flow-text light">
                    Najważniejszy składnik Obozów, bez którego nie stworzylibyśmy tego wydarzenia.
                    Niesamowici ludzie którzy raz za razem pokazują co to znaczy dobra zabawa.
                    Dołącz do nich i sam daj się przekonać.
                    <br>
                    Preferują wszystkie klasy!
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <div class="index-banner parallax-container">
    <div class="section no-pad-bot">
      <div class="container">
        <br><br>
        <h3 class="center title">Czekamy właśnie na Ciebie</h3>
        <div class="row center">
          <h5 class="header col s12 light subtitle">Im więcej osób na Obozach tym lepiej - przekonaj się sam</h5>
        </div>
        <br><br>

      </div>
    </div>
    <div class="parallax"><img src="@/assets/images/backgrounds/background31.jpg" alt="Tło 1"
        style="filter: brightness(60%)"></div>
  </div>

  <div class="container">
    <div class="section">
      <div class="row">
        <div class="col s12 center">
          <h4 class="subtitle" style="margin-bottom: 20px">Nie trzeba wiele żeby zagrać</h4>
        </div>
      </div>
      <div class="row" style="display: flex; flex-wrap: wrap; justify-content: space-between;">
        <div class="col m12 l6" v-for="(step, index) in joinStepsData" :key="index" style="margin-bottom: 20px;">
          <div class="z-depth-1 card-panel grey lighten-5" style="height: 100%;">
            <div class="row step-row">
              <div class="col s12 m4 l5 xl4 step-circle-container">
                <span class="circle-number" :class="step.color">{{++index}}</span>
              </div>
              <div class="left-align col s12 m8 l7 xl8 step-content">
                <h4>{{step.title}}</h4>
                <span class="black-text" v-html="step.content"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <div class="container">
    <div class="section">
      <div class="row">
        <div class="col s12 center">
          <h4 class="subtitle" style="color: #ef5350;">Przerażony wydarzeniem?</h4>
          <p class="black-text light" style="font-size: 1.1rem;">
            Jeśli proces dołączania wydaje się skomplikowany lub masz obawy, możesz skorzystać z tego formularza
            kontaktowego. </p>
        </div>
      </div>

      <div class="row">
        <div class="col s12 m10 offset-m1 l8 offset-l2">
          <a href="https://forms.gle/1RYrA1i8g1Satbwc7" target="_blank" class="card-link">
            <div class="z-depth-2 card hoverable">
              <div class="card-content center-align">
                <i class="material-icons green-text" style="font-size: 4rem; margin-bottom: 1rem;">assignment</i>
                <span class="card-title">Formularz zgłoszeniowy</span>
                <p class="text-darken-1 grey-text" style="margin-top: 1rem;">
                  Kliknij tutaj, aby wypełnić formularz zgłoszeniowy dla nowych osób
                </p>
                <p class="green-text" style="margin-top: 1.5rem; font-weight: 500;">
                  <i class="material-icons" style="vertical-align: middle; margin-right: 0.5rem;">open_in_new</i>
                  Przejdź do formularza
                </p>
              </div>
            </div>
          </a>
        </div>
      </div>

      <div class="row">
        <div class="col s12 center">
          <p class="black-text light">
            <i class="inline-icon material-icons" style="margin-bottom: 0.3rem;">info</i>
            Możesz również skorzystać z tradycyjnej metody kontaktu przez Messengera <a
              href="https://www.messenger.com/t/105317307701584?fbclid=IwAR1kWyWl0I83qIfKwfy-p1Ca21bb6g9JvODzkiZq5016idUDqEcSipvmWm4"
              target="_blank">tutaj</a>.
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="index-banner parallax-container" style="margin-bottom: 7em; margin-top: 2em;">
    <div class="section no-pad-bot">
      <div class="container center">
        <h3 class="center title">Chcesz wiedzieć więcej?</h3>
        <h5 class="header col s12 light subtitle">Poznaj zasady gry i historię Obozów</h5>
        <div class="row center">
          <router-link to="/o-nas" class="btn-large waves-effect waves-light green" style="margin: 10px;">
            Dowiedz się więcej o grze
          </router-link>
        </div>
      </div>
    </div>
    <div class="parallax"><img src="@/assets/images/backgrounds/background6.jpg" alt="Tło"
        style="filter: brightness(50%)"></div>
  </div>


</template>

<style lang="scss" scoped>
.circle-number {
  --circle-size: 7rem;
  --font-size: calc(var(--circle-size) * 0.55);

  border-radius: 50%;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: var(--font-size);
  width: var(--circle-size);
  height: var(--circle-size);
  flex-shrink: 0;
  margin: 0;
  vertical-align: middle;
}

.circle-number.red {
  background: red;
}

.circle.grey {
  background: #cccccc;
  color: #fff;
}

.circle.green {
  background: #5EA226;
  color: #ffffff;
}

.circle.blue {
  background: #5178D0;
  color: #ffffff;
}

.circle.pink {
  background: #EF0BD8;
  color: #ffffff;
}

@media (min-width : 1250px) {
  .card-panel.staff-panel {
    min-height: 250px !important;
  }
}

@media (max-width: 1250px) {
  .card-panel.staff-panel {
    min-height: 300px
  }
}

@media (max-width: 991px) {
  .card-panel.staff-panel {
    min-height: 600px;
  }
}

@media (max-width: 850px) {
  .card-panel.staff-panel {
    min-height: 530px;
  }
}

/* Step layout styles */
.step-row {
  display: flex;
  align-items: center;
  margin-bottom: 0;
}

.step-circle-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.step-content {
  h4 {
    margin-top: 0;
  }
}

/* Responsive layout */
@media (max-width: 768px) {
  .step-row {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .step-circle-container {
    margin-bottom: 1rem;
  }

  .step-content {
    text-align: center;
  }

  /* Responsive circle sizing */
  .circle-number {
    --circle-size: 3rem;
  }
}

@media (max-width: 480px) {
  .circle-number {
    --circle-size: 5rem;
  }
}

/* Card link styling */
.card-link {
  text-decoration: none;
  color: inherit;
  display: block;

  &:hover {
    text-decoration: none;
    color: inherit;
  }

  .card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 17px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.15);
    }
  }
}
</style>