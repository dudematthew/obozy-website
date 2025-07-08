<script>
/* global M */
import { loadScript } from "vue-plugin-load-script";
loadScript("https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY")
	.then(() => {
		// Script is loaded, do something
	})
	.catch(() => {
		// Failed to fetch script
	});

export default {
	name: "HomeView",
	data() {
		return {
			event: {
				date: '2025-08-29',
				time: '15:00',
				place: 'Turawa',
				description: 'W tym roku wprowadzamy uproszczenie zasad, zbicie ich i zadbanie o komfortową grę. Miast zrzutów będziecie szukać skarbów.\nOczywiście jak zawsze obecne będą bardzo drobne poprawki w mechanice na podstawie poprzedniej edycji.',
				bannerLink: 'https://i.imgur.com/nJAHasU.png',
				eventLink: 'https://www.facebook.com/events/1203318538195199',
				name: 'Obozy IX Edycja'
			},
		};
	},
	mounted() {
		M.AutoInit();

		document.addEventListener("DOMContentLoaded", function () {
			let parallaxElems = document.querySelectorAll(".parallax");
			M.Parallax.init(parallaxElems);
		});

		loadScript(
			"https://connect.facebook.net/pl_PL/sdk.js#xfbml=1&version=v14.0&appId=1757113121299063&autoLogAppEvents=1"
		)
			.then(() => {
				this.$nextTick(() => {
					window.FB.XFBML.parse();
				});
			})
			.catch(() => {
				console.error("Can't load Facebook script.");
			});
	},
	computed: {
		yearsFromStart() {
			return new Date().getFullYear() - 2016;
		},
		eventPassed() {
			let eventDate = new Date(this.event.date + " " + this.event.time);
			let now = new Date();
			return eventDate < now;
		},
	},
};
</script>

<template>
	<div class="index-banner parallax-container">
		<div class="section no-pad-bot">
			<div class="container">
				<br /><br />
				<h1 class="center title main-title" style="margin-bottom: 0px; padding-bottom: 0">
					OBOZY
				</h1>
				<h3 class="center title">Gra Terenowa</h3>
				<div class="row center">
					<h5 class="header col s12 light subtitle">
						Spędź dwa dni na łonie natury tocząc wspólnie zaciekły
						bój o flagę
					</h5>
				</div>
				<div class="row center">
					<router-link to="/dolacz-do-nas" class="btn-large waves-effect waves-light green">Dołącz do
						nas</router-link>
				</div>
				<br /><br />
			</div>
		</div>
		<div class="parallax">
			<img src="@/assets/images/backgrounds/background1.png" alt="Tło 1" style="filter: brightness(60%)" />
		</div>
	</div>

	<div class="container">
		<div class="section">
			<!--   Icon Section   -->
			<div class="row">
				<div class="col s12 m4">
					<div class="icon-block">
						<h2 class="center brown-text">
							<i class="material-icons">sports_kabaddi</i>
						</h2>
						<h5 class="center">Walcz tak jak potrafisz</h5>

						<p class="light justified">
							Czy to rekonesans albo walka podjazdowa, czy to
							manewrowanie liczebnością przeciwnika używając
							sprytu, czy to miażdżenie oponentów czystą siłą.
							Stworzyliśmy zasady, które umożliwiają Ci stanięcie
							do prawdziwej walki w której pokażesz swoje
							wewnętrzne zwierzę nie robiąc nikomu krzywdy.
						</p>
					</div>
				</div>

				<div class="col s12 m4">
					<div class="icon-block">
						<h2 class="center brown-text">
							<i class="material-icons">construction</i>
						</h2>
						<h5 class="center">Zbuduj i obroń swój obóz</h5>

						<p class="light justified">
							Jak sobie pościelesz, tak się wyśpisz. Korzystaj z
							przygotowanych materiałów by pomóc stworzyć mur,
							który pozwoli Wam bronić się przed wrogimi
							najazdami. Pracujcie razem, by odeprzeć ataki
							najeźdźców żądnych waszej flagi.
						</p>
					</div>
				</div>

				<div class="col s12 m4">
					<div class="icon-block">
						<h2 class="center brown-text">
							<i class="material-icons">flag</i>
						</h2>
						<h5 class="center">Zdobądź flagę i zwyciężaj</h5>

						<p class="light justified">
							Dostań się do wrogiego obozu, złap flagę i nie
							puszczaj gdy będą Cię ścigać. Poczuj buzującą
							adrenalinę i świętuj z wszystkimi udaną operację.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="index-banner parallax-container">
		<div class="section no-pad-bot">
			<div class="container">
				<br /><br />
				<h3 class="center title">Jak to wygląda?</h3>
				<div class="row center">
					<h5 class="header col s12 light subtitle">
						Zobacz, dlaczego od {{ yearsFromStart }} lat wciąż
						powracamy na Obozy
					</h5>
				</div>
				<div class="row center">
					<router-link to="/o-nas" class="btn-large waves-effect waves-light green">Dowiedz się
						więcej o grze</router-link>
				</div>
				<br /><br />
			</div>
		</div>
		<div class="parallax">
			<img src="@/assets/images/backgrounds/background2.png" alt="Tło 1" style="filter: brightness(60%)" />
		</div>
	</div>

	<div class="mx-0 container is-fullwidth">
		<div class="section">
			<div class="row">
				<div class="col center" style="margin-bottom: -30px">
					<h3 class="title" v-if="!eventPassed">Najbliższe Obozy</h3>
					<h3 class="title" v-else>Ostatnie Obozy</h3>
					<div class="col m1 hide-on-small-and-down"></div>
					<div class="col m10 s12 center-align">
						<div class="card">
							<div class="card-image">
								<img :src="event.bannerLink" />
								<span class="card-title hide-on-med-and-down">{{
									event.name
									}}</span>
								<a class="btn-floating halfway-fab waves-effect waves-light green"
									:href="event.eventLink" target="_blank"><i class="material-icons">link</i></a>
							</div>
							<div class="left-align card-content">
								<p style="
										height: 33px;
										display: flex;
										align-items: center;
										gap: 5px;
									">
									<i class="material-icons green-text">explore</i>
									<span>{{ event.place }},
										{{
										new Date(
										event.date
										).toLocaleDateString()
										}}</span>
								</p>
								<br />
								<p class="flow-text">
									<i class="material-icons green-text">description</i>
									{{ event.description }}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="row">
				<div class="col s12 center"><br /><br /></div>
			</div>
		</div>
	</div>

	<div class="index-banner parallax-container">
		<div class="section no-pad-bot">
			<div class="container">
				<br /><br />
				<h3 class="center title">Masz pytania?</h3>
				<div class="row center">
					<h5 class="header col s12 light subtitle">
						Odpowiemy na każde!
					</h5>
				</div>
				<div class="row center">
					<a href="https://www.messenger.com/t/105317307701584?fbclid=IwAR1kWyWl0I83qIfKwfy-p1Ca21bb6g9JvODzkiZq5016idUDqEcSipvmWm4"
						target="_blank" class="btn-large waves-effect waves-light green">Skontaktuj się z nami</a>
				</div>
				<br /><br />
			</div>
		</div>
		<div class="parallax">
			<img src="@/assets/images/backgrounds/background3.jpg" alt="Tło 3" style="filter: brightness(60%)" />
		</div>
	</div>

	<div class="container" style="margin-bottom: 40px">
		<div class="section">
			<div class="row">
				<div class="col s12 center">
					<h4 class="subtitle" style="margin-bottom: 20px">
						Zaobserwuj nas na Facebooku
					</h4>
					<h5 class="header col s12 light" style="margin-bottom: 30px">
						Wszystko o czym chcesz wiedzieć dzieje się właśnie tam!
					</h5>
				</div>
			</div>

			<!-- On large devices -->
			<div class="row hide-on-med-and-down">
				<div class="col s12 m12 l2 xl3"></div>
				<div class="col s12 m12 l3 xl2 center">
					<a href="https://www.facebook.com/ObozyGraTerenowa" target="_blank">
						<img src="@/assets/images/logo.png" class="circle responsive-img pulse" />
					</a>
				</div>
				<div class="left-align col s12 m12 l5 xl4">
					<a href="https://www.facebook.com/ObozyGraTerenowa" target="_blank">
						<h4>Obozy - Gra terenowa</h4>
					</a>
					<p class="black-text light" style="margin-bottom: 20px; margin-top: 0; font-size: 1.2rem;">
						@ObozyGraTerenowa · Wydarzenie
						<br />
					</p>
					<span class="black-text flow-text light">
						<div class="fb-like" style="margin: 0; padding: 0"
							data-href="https://www.facebook.com/ObozyGraTerenowa/" data-width=""
							data-layout="button_count" data-action="like" data-size="large" data-share="true"></div>
					</span>
				</div>
				<div class="col s12 m12 l2 xl2"></div>
			</div>

			<!-- On medium devices -->
			<div class="row hide-on-large-only">
				<div class="col s12 m12 l4 xl3 center">
					<a href="https://www.facebook.com/ObozyGraTerenowa" target="_blank">
						<img src="@/assets/images/logo.png" class="circle responsive-img pulse" />
					</a>
				</div>

				<div class="col s12 m12 l7 xl9 light center">
					<a href="https://www.facebook.com/ObozyGraTerenowa" target="_blank">
						<h4>Obozy - Gra terenowa</h4>
					</a>
					<p class="black-text flow-text light" style="margin-bottom: 30px">
						@ObozyGraTerenowa · Wydarzenie
						<br />
					</p>

					<span class="black-text flow-text light">
						<div class="fb-like" style="margin: 0" data-href="https://www.facebook.com/ObozyGraTerenowa/"
							data-width="" data-layout="button_count" data-action="like" data-size="large"
							data-share="true"></div>
					</span>
				</div>
			</div>
		</div>
	</div>
</template>
