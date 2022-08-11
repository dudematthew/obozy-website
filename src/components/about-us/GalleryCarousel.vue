<script>
    import 'swiper/css'
    import 'swiper/css/bundle'
    import Swiper from 'swiper/bundle';

    export default {
        name: 'GalleryCarousel',
        computed: {
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
        methods: {},
        mounted() {
            // let materialboxedElems = document.querySelectorAll('.materialboxed');
            // M.Materialbox.init(materialboxedElems, {
            //     inDuration: 0,
            //     outDuration: 0
            // });

            this.swiper = new Swiper('.swiper', {
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev'
                },
                scrollbar: {
                    el: '.swiper-scrollbar',
                    draggable: true,
                },
            });
        }
    }
</script>

<template>
    <div class="swiper-container">
        <div class="swiper">
            <!-- Additional required wrapper -->
            <div class="swiper-wrapper">
                <!-- Slides -->
                <div class="swiper-slide" v-for="(imagePath, index) in imagesPaths" :key="index">
                    <img :src="require('@/assets/images/gallery/' + imagePath)">
                </div>
            </div>
            <!-- Pagination -->
            <div class="swiper-pagination"></div>
    
            <!-- Navigation buttons -->
            <div class="swiper-button-prev"></div>
            <div class="swiper-button-next"></div>
    
            <!-- Scrollbar -->
            <div class="swiper-scrollbar"></div>
        </div>
    </div>
</template>

<style lang="scss" scoped>

    .swiper-container {
      background: #eee;
      font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
      font-size: 14px;
      color: #000;
      margin: 0;
      padding: 0;
    }

    .swiper {
      width: 100%;
      height: 100%;
    }

    .swiper-slide {
      background-position: center;
      background-size: cover;
    }

    .swiper-slide img {
      display: block;
      width: 100%;
    }

</style>