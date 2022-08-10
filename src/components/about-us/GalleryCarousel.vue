<script>
    import 'swiper/css'
    import 'swiper/css/bundle'
    import 'swiper/bundle';

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
            let materialboxedElems = document.querySelectorAll('.materialboxed');
            M.Materialbox.init(materialboxedElems);

            this.swiper = new Swiper('.swiper', {});

            console.log(this.imagesPaths);
        }
    }
</script>

<template>
dupa
    <div class="carousel" style="width: 100%">
        <!-- <a v-for="(imagePath, index) in imagesPaths" :key="index" class="carousel-item" :href="'#' + index"><img class="materialboxed responsive-img"
                :src="require('@/assets/images/gallery/' + imagePath)"></a> -->
        <a class="carousel-item" href="#"><img :src="require('@/assets/images/gallery/Obozy-84.jpg')" /></a>
    </div>

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
</template>