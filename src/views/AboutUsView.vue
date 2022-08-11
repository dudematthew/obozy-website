<script>
  import GalleryCarousel from '@/components/about-us/GalleryCarousel.vue'

export default {
  name: "HomeView",
  props: [
      "GalleryCarousel",
  ],
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
  methods: {
      resizeSelf(e) {
          console.log("resizing");
          e.target.style.paddingBottom = "-50px";
          // iframeResize({}, e.target);
      }
  },
  mounted() {
      document.addEventListener("DOMContentLoaded", function () {
          let parallaxElems = document.querySelectorAll(".parallax");
          M.Parallax.init(parallaxElems);
      });
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
    <div class="parallax"><img src="@/assets/images/background20.jpg" alt="Tło 1" style="filter: brightness(60%)"></div>
  </div>


  <div class="index-banner container center" style="margin: 0; width: 100%; max-width: 100%;">
    <div class="section">
      <div class="row">
        <div class="col s12 center" style="margin-bottom: -30px;">
          <h4 class="subtitle">Galeria</h4>
        </div>
      </div>
      <div class="row">
        <div class="col s12 center">
          <br><br>
            <GalleryCarousel></GalleryCarousel>
          <br><br>
        </div>
      </div>

    </div>
  </div>

  <div class="container">
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
            <iframe src="https://drive.google.com/embeddedfolderview?id=13csMsz_7qZmU8rTouc3kgGcIshRWUNCw#list" style="width:100%; height:600px; border:0;" title="PDFs of SUBSTITUTE YOUR OWN FOLDER TOPIC HERE on Google Drive"></iframe>
            <br><br>
        </div>
      </div>

    </div>
  </div>

</template>