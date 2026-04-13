<script>
/* global M */
import event from '@/data/event.json';
export default {
    name: "NotificationsView",
    data() {
        return {
            event,
            reasons: [
                {
                    icon: 'event',
                    title: 'Data',
                    text: 'Termin ustalamy z wyprzedzeniem - żebyś mógł zaplanować weekend i nie kolidował z innymi planami.',
                },
                {
                    icon: 'payments',
                    title: 'Zrzutka',
                    text: 'Wpłaty na wstęp otwierają się trochę ponad miesiąc przed wydarzeniem. Są różne pakiety - warto wiedzieć który wybrać zanim zamkniemy listę.',
                },
                {
                    icon: 'backpack',
                    title: 'Co ze sobą wziąć',
                    text: 'Przed każdą edycją wysyłamy listę rzeczy i wskazówki co do ekwipunku. Każdy rok może mieć jakieś dodatkowe informacje.',
                },
                {
                    icon: 'construction',
                    title: 'Pionierka i zajawki',
                    text: 'Ekipa przygotowująca teren, zdjęcia z przygotowań, niespodzianki. Będziesz wiedzieć co czeka Cię na miejscu.',
                },
            ],
        };
    },
    computed: {
        eventPassed() {
            let eventDate = new Date(this.event.date + ' ' + this.event.time);
            return eventDate < new Date();
        },
    },
    methods: {
        scrollToElement(elementId, offset = 0) {
            this.$nextTick(() => {
                const element = document.getElementById(elementId);
                if (element) {
                    const y = element.getBoundingClientRect().top + window.pageYOffset + offset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            });
        },
    },
    mounted() {
        let parallaxElems = document.querySelectorAll('.parallax');
        M.Parallax.init(parallaxElems);
    },
};
</script>

<template>
    <!-- HERO PARALLAX -->
    <div class="index-banner parallax-container">
        <div class="section no-pad-bot">
            <div class="container center">
                <br /><br />
                <h1 class="center main-title title" style="margin-bottom: 0; padding-bottom: 0">
                    Bądź na bieżąco
                </h1>
                <div class="row center">
                    <h5 class="header col s12 light subtitle">
                        Obozy organizowane są raz w roku. Śledz nas, by niczego nie
                        przegapić
                    </h5>
                </div>
                <div class="row center">
                    <a href="#formularz" class="btn-large green waves-effect waves-light"
                        @click.prevent="this.scrollToElement('formularz', -20)">Zapisz
                        się</a>
                </div>
                <br /><br />
            </div>
        </div>
        <div class="parallax">
            <img src="@/assets/images/backgrounds/background7.png" alt="Tło" style="filter: brightness(50%)" />
        </div>
    </div>

    <!-- WHY IT MATTERS -->
    <div class="container">
        <div class="section">
            <div class="row">
                <div class="col s12 center" style="margin-bottom: 14px">
                    <h4 class="subtitle">Dlaczego dobrze zadbać o kontakt?</h4>
                    <p class="flow-text light" style="max-width: 680px; margin: 0 auto 0rem;">
                        Obozy to wydarzenie przy którym zabawa rośnie proporcjonalnie do ilości osób. Jednak
                        organizowane są tylko raz w roku. Pilnuj źródeł informacji
                        by nie przegapić zabawy!
                    </p>
                </div>
            </div>
            <div class="row">
                <div class="col s12 m6" v-for="(reason, index) in reasons" :key="index" style="margin-bottom: 16px">
                    <div class="z-depth-1 card-panel grey lighten-5"
                        style="display: flex; align-items: flex-start; gap: 16px; height: 100%; margin: 0;">
                        <i class="material-icons green-text"
                            style="font-size: 2.2rem; flex-shrink: 0; margin-top: 2px">{{ reason.icon }}</i>
                        <div class="left-align">
                            <h6 style="font-weight: 700; margin: 0 0 6px">{{ reason.title }}</h6>
                            <p class="black-text light" style="margin: 0">{{ reason.text }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- NEXT EVENT CARD -->
    <div class="container">
        <div class="section">
            <div class="row">
                <div class="col s12 center" style="margin-bottom: 30px">
                    <h4 class="subtitle" v-if="!eventPassed">Najbliższa edycja</h4>
                    <h4 class="subtitle" v-else>Ostatnia edycja</h4>
                    <p class="flow-text light" style="max-width: 680px; margin: 0 auto 0rem;">
                        Na wydarzeniu zawsze będzie wszystko czego potrzebujesz - jeśli często zerkasz na Facebooka to
                        idealny wybór dla ciebie.
                    </p>
                </div>
                <div class="col hide-on-small-and-down m1"></div>
                <div class="center-align col m10 s12">
                    <div class="card">
                        <div class="card-image">
                            <img :src="event.bannerLink" />
                            <span class="card-title hide-on-med-and-down">{{ event.name }}</span>
                            <a class="btn-floating green halfway-fab waves-effect waves-light" :href="event.eventLink"
                                target="_blank">
                                <i class="material-icons">link</i>
                            </a>
                        </div>
                        <div class="left-align card-content">
                            <p style="display: flex; align-items: center; gap: 5px">
                                <i class="green-text material-icons">explore</i>
                                <span>{{ event.place }}, {{ new Date(event.date).toLocaleDateString() + " " + event.time
                                    }}</span>
                            </p>
                        </div>
                        <div class="card-action center">
                            <a :href="event.eventLink" target="_blank" class="green-text">
                                <i class="material-icons"
                                    style="vertical-align: middle; margin-right: 6px">open_in_new</i>
                                Przejdź do wydarzenia na Facebooku
                            </a>
                        </div>
                    </div>
                </div>
                <div class="col hide-on-small-and-down m1"></div>
            </div>
        </div>
    </div>

    <!-- BREVO SIGNUP FORM -->
    <div class="container" id="formularz">
        <div class="section">
            <div class="row">
                <div class="col s12 center hide-on-large-only">
                    <iframe width="600" height="930"
                        src="https://fe9045a8.sibforms.com/serve/MUIFADxtYU5XYTRKetTygpKDWYkJoJDMmJA7q_uhhnJzKPaFyMERj5QTlVB3-AXLt1q3NRohBkwmn6g1InABV1Na-HLV97Uj2Qw-zimLvCvqxKLm-97joLnQytaDIZ4rZUfOa8ZhRB_z_2owZ18TwxBvHZRZ8IFrI83jNhXOMM4f_NKKsX9nFYFG0OSJcO7e2f1NIdLrnzo0MUkK5g=="
                        frameborder="0" scrolling="auto" allowfullscreen
                        style="display: block; margin-left: auto; margin-right: auto; max-width: 100%;"></iframe>
                </div>
                <div class="col s12 center hide-on-med-and-down">
                    <iframe width="600" height="720"
                        src="https://fe9045a8.sibforms.com/serve/MUIFADxtYU5XYTRKetTygpKDWYkJoJDMmJA7q_uhhnJzKPaFyMERj5QTlVB3-AXLt1q3NRohBkwmn6g1InABV1Na-HLV97Uj2Qw-zimLvCvqxKLm-97joLnQytaDIZ4rZUfOa8ZhRB_z_2owZ18TwxBvHZRZ8IFrI83jNhXOMM4f_NKKsX9nFYFG0OSJcO7e2f1NIdLrnzo0MUkK5g=="
                        frameborder="0" scrolling="auto" allowfullscreen
                        style="display: block; margin-left: auto; margin-right: auto; max-width: 100%;"></iframe>
                </div>
            </div>
        </div>
    </div>

    <!-- MESSENGER CTA -->
    <div class="container">
        <div class="section" style="padding-bottom: 50px">
            <div class="row">
                <div class="col s12 m10 offset-m1 l8 offset-l2">
                    <div class="z-depth-2 card-panel green" style="border-radius: 8px; padding: 28px 32px;">
                        <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
                            <i class="material-icons white-text" style="font-size: 3rem; flex-shrink: 0">chat</i>
                            <div class="left-align white-text" style="flex: 1; min-width: 220px">
                                <h5 style="margin: 0 0 6px; font-weight: 700">A może grupa na
                                    Messengerze?</h5>
                                <p style="margin: 0; opacity: 0.92">
                                    Daj nam znać - dodamy Cię do grupy, gdzie na bieżąco lądują
                                    ogłoszenia, zdjęcia,
                                    czy ustalenia obozowe.
                                </p>
                            </div>
                            <a href="https://www.messenger.com/t/105317307701584" target="_blank"
                                class="btn-large white green-text waves-effect waves-green"
                                style="flex-shrink: 0; font-weight: 600">
                                Napisz do nas
                            </a>
                        </div>
                    </div>
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
        <div class="parallax"><img src="@/assets/images/backgrounds/background20.jpg" alt="Tło"
                style="filter: brightness(50%)"></div>
    </div>
</template>

<style lang="scss" scoped>
.card-panel.green p,
.card-panel.green h5 {
    color: #fff;
}
</style>