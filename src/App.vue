<script>
  import Header from './components/Header.vue'
  import Footer from './components/Footer.vue'
  import 'materialize-css/dist/js/materialize.js'

  export default {
    components: {
      Header,
      Footer
    },
    mounted() {
      M.AutoInit();
    },
  }
</script>

<template>

  <Header />

  <router-view />

  <Footer />
  
</template>

<style lang="scss">
  // @import '@fortawesome/fontawesome-free/css/all.css';
  @import 'materialize-css/sass/materialize.scss';
  @import 'material-icons/iconfont/material-icons.css';
  @import 'swiper/css/bundle';


  // Customize Swiper CSS
  :root {
    --swiper-theme-color: #aa5607;
  }

  body,
  html {
    width: 100%;
  }

  .swiper-pagination-bullet-active {
    background: #aa5607 !important;
  }

  .brand-logo,
  .main-title {
    /* m-plus-rounded-1c-regular - latin */
    @font-face {
      font-family: 'M PLUS Rounded 1c' !important;
      font-style: normal;
      font-weight: 500 !important;
      src: url('@/assets/fonts/m-plus-rounded-1c-v15-latin-regular.eot'); /* IE9 Compat Modes */
      src: local(''),
          url('@/assets/fonts/m-plus-rounded-1c-v15-latin-regular.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
          url('@/assets/fonts/m-plus-rounded-1c-v15-latin-regular.woff2') format('woff2'), /* Super Modern Browsers */
          url('@/assets/fonts/m-plus-rounded-1c-v15-latin-regular.woff') format('woff'), /* Modern Browsers */
          url('@/assets/fonts/m-plus-rounded-1c-v15-latin-regular.ttf') format('truetype'), /* Safari, Android, iOS */
          url('@/assets/fonts/m-plus-rounded-1c-v15-latin-regular.svg#MPLUSRounded1c') format('svg'); /* Legacy iOS */
    }
  }

  button.is-fullwidth,
  button.is-fullwidth span
  {
    display: block !important;
    text-align: center !important;
  }

  // Fix Bulma Flex
  // .field {
  //   flex-grow: unset !important;
  //   flex-shrink: unset !important;
  //   flex: 1 1 0 !important;
  // }

  nav ul a,
  nav .brand-logo {
    color: #444;
  }

  p {
    line-height: 2rem;
  }

  .sidenav-trigger {
    color: #26a69a;
  }

  .parallax-container {
    min-height: 420px;
    line-height: 0;
    height: auto;
    color: rgba(255,255,255,.9);
    display: flex;
  }
    
  .parallax-container .section {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 0;
  }

  .parallax-container img {
    background-color: #388E3C;
  }

  // @media only screen and (max-width : 992px) {
  //   .parallax-container .section {
  //     position: absolute;
  //     top: 40%;
  //   }
  //   .index-banner .section {
  //     top: 10%;
  //   }
  // }

  // @media only screen and (max-width : 600px) {
  //   .parallax-container {
  //     height: 440px;
  //   }

  //   .index-banner .section {
  //     top: 0;
  //   }
  // }

  .inline-icon {
    display: inline-flex;
    vertical-align: bottom;
    font-size: 18px !important;
  }

  .icon-block {
    padding: 0 15px;
  }

  .icon-block .material-icons {
    font-size: inherit;
  }

  footer.page-footer {
    margin: 0;
  }

  .title,
  .subtitle {
    margin-top: 30px;
  }

  .parallax-container .title,
  .parallax-container .subtitle {
    text-shadow: 1px 1px 9px rgb(46, 46, 46);
  }

  .justified {
    text-align: justify !important;
  }


</style>