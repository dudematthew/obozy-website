<script>
  import GalleryCarousel from '@/components/about-us/GalleryCarousel.vue'

  export default {
    name: "HomeView",
    components: {
      GalleryCarousel
    },
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
    <div class="parallax"><img src="@/assets/images/backgrounds/background30.jpg" alt="Tło 1" style="filter: brightness(60%)"></div>
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
            <div class="card-panel staff-panel grey lighten-5 z-depth-1" style="height: auto">
              <div class="row">
                <div class="col s12 m12 l4">
                  <img :src="require('@/assets/images/profile-pictures/'+ staff.imageName + '.png')" :alt="staff.name"
                    class="circle responsive-img">
                </div>
                <div class="col s12 m12 l8 left-align">
                  <h4>{{staff.name}}</h4>
                  <span class="black-text">
                    {{staff.description}}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="col s12">
            <div class="card-panel grey lighten-5 z-depth-1" style="height: auto">
              <div class="row">
                <div class="col s12 m12 l4 xl3">
                  <img src="@/assets/images/profile-pictures/all.png" class="circle responsive-img">
                </div>
                <div class="col s12 m12 l7 xl9 left-align">
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
    <div class="parallax"><img src="@/assets/images/backgrounds/background31.jpg" alt="Tło 1" style="filter: brightness(60%)"></div>
  </div>

  <div class="container">
    <div class="section">
      <div class="row">
        <div class="col s12 center">
          <h4 class="subtitle" style="margin-bottom: 20px">Nie trzeba wiele żeby zagrać</h4>
        </div>
      </div>
      <div class="row">
        <div class="col m12 l6" v-for="(step, index) in joinStepsData" :key="index">
          <div class="card-panel grey lighten-5 z-depth-1">
            <div class="row center">
              <div class="col s12 m4 l5 xl4">
                <h1 style="margin: 0 0 10px 0;"><span class="circle-number" :class="step.color">{{++index}}</span></h1>
              </div>
              <div class="col s12 m8 l7 xl8 left-align">
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
        <div class="row center">
          <router-link to="/o-nas" class="btn-large waves-effect waves-light green">Dowiedz się więcej</router-link>
        </div>
      </div>
    </div>
  </div>


</template>

<style lang="scss" scoped>
  .circle-number {
    border-radius: 0.8em;
    -moz-border-radius: 0.8em;
    -webkit-border-radius: 0.8em;
    color: #ffffff;
    display: inline-block;
    font-weight: bold;
    line-height: 1.6em;
    margin-right: 15px;
    text-align: center;
    width: 1.6em;
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
</style>