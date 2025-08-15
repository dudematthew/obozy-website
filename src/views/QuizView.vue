<script>
import MarkdownIt from 'markdown-it';
const md = new MarkdownIt();

/* global M */

export default {
    name: "QuizView",
    data() {
        return {
            // CONFIGURABLE PERFORMANCE MESSAGES SYSTEM
            // Modify these thresholds and messages to customize the feedback
            performanceConfig: {
                thresholds: [
                    { min: 100, max: 100, level: 'perfect', title: 'Bóg Chochlików? 🧙‍♂️', message: 'NIEMOŻLIWE! Znasz każdą zasadę na pamięć! Czy ty przypadkiem nie pomagałeś pisać instrukcji? Dowódcy będą błagać żebyś dołączył do ich obozu!' },
                    { min: 90, max: 99, level: 'god', title: 'Król Chochlików? 👑', message: 'Niepojęte... Twoja znajomość Magicznej Laski graniczy z cudem. Arbitrzy będą płakać ze szczęścia widząc cię w akcji!' },
                    { min: 80, max: 89, level: 'master', title: 'Władca Zamrożenia ❄️', message: 'Imponujące! Znasz każdy sekret Stanu Zamrożenia. Przeciwnicy będą się zastanawiać czy jesteś nietykalny...' },
                    { min: 70, max: 79, level: 'expert', title: 'Arcychochlik 🎭', message: 'Świetnie! Twoja laska będzie siać postrach w szeregach wroga. Możesz śmiało iść na pole bitwy!' },
                    { min: 60, max: 69, level: 'advanced', title: 'Doświadczony ⚔️', message: 'Solidnie! Znasz większość zasad, ale jeszcze trochę nauki nie zaszkodzi.' },
                    { min: 50, max: 59, level: 'good', title: 'Możesz grać 😐', message: 'Hmm... Podstawy znasz, ale to naprawdę minimum żeby nie zawstydzić swojego obozu. Lepiej się jeszcze pouczaj!' },
                    { min: 40, max: 49, level: 'basic', title: 'Wstyd Obozu 😬', message: 'Auć... To już jest wstyd. Twój Dowódca będzie miał łzy w oczach. Koniecznie przeczytaj instrukcję jeszcze raz!' },
                    { min: 25, max: 39, level: 'beginner', title: 'Kompromitacja! 🤦‍♂️', message: 'To jest po prostu żenujące... Jak możesz myśleć o graniu w Obozy z taką wiedzą? Wracaj do podstaw i nie pokazuj się na polu bitwy!' },
                    { min: 0, max: 24, level: 'disaster', title: 'Katastrofa! 💀', message: 'DRAMAT! Czy ty w ogóle czytałeś instrukcję? Lepiej idź grać w klasy - tam przynajmniej nie zaszkodzisz nikomu poza sobą 😡' }
                ]
            },

            originalQuestions: [], // Store original questions
            questions: [], // Store shuffled questions
            currentQuestionIndex: 0,
            selectedAnswerIndex: null,
            score: 0,
            quizStarted: false,
            quizFinished: false,
            enablePreload: true,
            preloadedImage: null,
            expandedQuestions: new Set(), // Track which questions are expanded
            userAnswers: [], // Store user's answers
            localStorageKey: 'obozy-quiz-progress', // Key for localStorage
        };
    },
    computed: {
        currentQuestion() {
            return this.questions[this.currentQuestionIndex] || null;
        },
        progress() {
            return this.questions.length ? ((this.currentQuestionIndex + 1) / this.questions.length) * 100 : 0;
        },
        nextQuestion() {
            return this.questions[this.currentQuestionIndex + 1] || null;
        },
        totalPossibleScore() {
            return this.questions.reduce((acc, q) => acc + (q.weight || 1), 0);
        },
        scorePercentage() {
            return this.totalPossibleScore ? Math.round((this.score / this.totalPossibleScore) * 100) : 0;
        },
        performanceMessage() {
            return this.getPerformanceMessage(this.scorePercentage);
        }
    },
    methods: {
        renderMarkdown(text) {
            return md.render(text);
        },
        getOptimizedImageUrl(url, size = 'l') {
            // For Imgur images, add size suffix for optimization
            // s = small (90x90), m = medium (320x320), l = large (640x640), h = huge (1024x1024)
            if (url && url.includes('i.imgur.com')) {
                const lastDotIndex = url.lastIndexOf('.');
                if (lastDotIndex !== -1) {
                    return url.slice(0, lastDotIndex) + size + url.slice(lastDotIndex);
                }
            }
            return url;
        },
        getImageSrcSet(url) {
            // Create srcset for responsive images with different Imgur sizes
            if (url && url.includes('i.imgur.com')) {
                const medium = this.getOptimizedImageUrl(url, 'm');
                const large = this.getOptimizedImageUrl(url, 'l');
                const huge = this.getOptimizedImageUrl(url, 'h');
                return `${medium} 320w, ${large} 640w, ${huge} 1024w`;
            }
            return '';
        },
        shuffleArray(array) {
            const newArray = [...array];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
            }
            return newArray;
        },
        async loadQuestions() {
            try {
                const response = await fetch('/data/quiz-questions.json');
                this.originalQuestions = await response.json();
                this.shuffleQuestions();
                if (this.enablePreload && this.questions.length > 0) {
                    this.preloadNextImage();
                }
                this.initMaterialbox();
            } catch (error) {
                console.error('Failed to load quiz questions:', error);
            }
        },
        shuffleQuestions() {
            // Create deep copy and shuffle questions
            this.questions = this.shuffleArray(JSON.parse(JSON.stringify(this.originalQuestions)));
            // Shuffle answers for each question
            this.questions.forEach(question => {
                question.answers = this.shuffleArray(question.answers);
            });
        },
        preloadNextImage() {
            if (!this.enablePreload || !this.nextQuestion?.imageUrl) return;
            this.preloadedImage = new Image();
            this.preloadedImage.src = this.getOptimizedImageUrl(this.nextQuestion.imageUrl, 'l');
        },
        scrollToElement(elementId, offset = 0) {
            this.$nextTick(() => {
                const element = document.getElementById(elementId);
                if (element) {
                    const y = element.getBoundingClientRect().top + window.pageYOffset + offset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            });
        },
        startQuiz() {
            this.shuffleQuestions();
            this.quizStarted = true;
            this.currentQuestionIndex = 0;
            this.score = 0;
            this.selectedAnswerIndex = null;
            this.quizFinished = false;
            this.userAnswers = [];
            this.saveProgress();
            if (this.enablePreload) {
                this.preloadNextImage();
            }
            this.scrollToElement('current-question', -20);
        },
        selectAnswer(index) {
            this.selectedAnswerIndex = index;
        },
        submitAnswer() {
            if (this.selectedAnswerIndex === null) return;

            const currentQuestion = this.currentQuestion;
            const selectedAnswer = currentQuestion.answers[this.selectedAnswerIndex];

            this.userAnswers[this.currentQuestionIndex] = selectedAnswer;

            if (selectedAnswer?.isCorrect) {
                this.score += currentQuestion.weight || 1;
            }

            this.selectedAnswerIndex = null;

            if (this.currentQuestionIndex < this.questions.length - 1) {
                this.currentQuestionIndex++;
                this.saveProgress();
                if (this.enablePreload) {
                    this.preloadNextImage();
                }
                this.reinitMaterialbox();
                this.scrollToElement('current-question', -20);
            } else {
                this.quizFinished = true;
                this.saveProgress();
                this.reinitMaterialbox();
                this.scrollToElement('quiz-results', -20);
            }
        },
        toggleQuestion(questionId) {
            const wasExpanded = this.expandedQuestions.has(questionId);
            this.expandedQuestions.clear();
            if (!wasExpanded) {
                this.expandedQuestions.add(questionId);
                this.reinitMaterialbox();
                this.scrollToElement(`question-${questionId}`, -20);
            }
        },
        isQuestionExpanded(questionId) {
            return this.expandedQuestions.has(questionId);
        },
        initMaterialbox() {
            document.addEventListener('DOMContentLoaded', () => {
                const elems = document.querySelectorAll('.materialboxed');
                M.Materialbox.init(elems, {
                    inDuration: 0,
                    outDuration: 0
                });
            });
        },
        saveProgress() {
            const progressData = {
                questions: this.questions,
                currentQuestionIndex: this.currentQuestionIndex,
                score: this.score,
                quizStarted: this.quizStarted,
                quizFinished: this.quizFinished,
                userAnswers: this.userAnswers,
                timestamp: Date.now()
            };

            localStorage.setItem(this.localStorageKey, JSON.stringify(progressData));
        },
        loadProgress() {
            try {
                const saved = localStorage.getItem(this.localStorageKey);
                if (saved) {
                    const progressData = JSON.parse(saved);
                    // Check if saved data is not too old (optional - 24 hours)
                    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
                    if (Date.now() - progressData.timestamp < maxAge) {
                        this.questions = progressData.questions || [];
                        this.currentQuestionIndex = progressData.currentQuestionIndex || 0;
                        this.score = progressData.score || 0;
                        this.quizStarted = progressData.quizStarted || false;
                        this.quizFinished = progressData.quizFinished || false;
                        this.userAnswers = progressData.userAnswers || [];
                        return true;
                    } else {
                        localStorage.removeItem(this.localStorageKey);
                    }
                }
            } catch (error) {
                console.error('Failed to load quiz progress:', error);
            }
            return false;
        },
        resetQuiz() {
            // Clear localStorage
            localStorage.removeItem(this.localStorageKey);
            // Reset all quiz state
            this.questions = [];
            this.currentQuestionIndex = 0;
            this.selectedAnswerIndex = null;
            this.score = 0;
            this.quizStarted = false;
            this.quizFinished = false;
            this.userAnswers = [];
            this.expandedQuestions.clear();
            // Reload questions and shuffle them
            this.shuffleQuestions();
        },
        reinitMaterialbox() {
            this.$nextTick(() => {
                const elems = document.querySelectorAll('.materialboxed');
                M.Materialbox.init(elems, {
                    inDuration: 0,
                    outDuration: 0
                });
            });
        },
        getPerformanceMessage(percentage) {
            // Find the appropriate threshold for the given percentage
            const threshold = this.performanceConfig.thresholds.find(
                t => percentage >= t.min && percentage <= t.max
            );

            return threshold || {
                level: 'unknown',
                title: 'Nieznany wynik',
                message: 'Coś poszło nie tak z obliczeniem wyniku.'
            };
        }
    },
    async mounted() {
        M.AutoInit();
        await this.loadQuestions();
        this.initMaterialbox();
        // Load saved progress after questions are loaded
        this.loadProgress();
    },
    updated() {
        this.reinitMaterialbox();
    }
};
</script>

<template>
    <div class="index-banner parallax-container" style="width: 100vw">
        <div class="no-pad-bot section">
            <div class="container">
                <br /><br />
                <h2 class="center main-title title" style="margin-bottom: 0px; padding-bottom: 0">
                    Quiz o Zamrożeniu
                </h2>
                <div class="center row">
                    <h4 class="col header light s12 subtitle">
                        Jak dobrze znasz zasady gry?
                    </h4>
                </div>
                <br /><br />
            </div>
        </div>
        <div class="parallax">
            <img src="@/assets/images/backgrounds/background32.jpg" alt="Tło Quiz" style="filter: brightness(60%)" />
        </div>
    </div>

    <div class="container">
        <div class="section">
            <div class="row">
                <div class="col m10 offset-m1 s12">
                    <!-- Quiz Start Screen -->
                    <div v-if="!quizStarted && !quizFinished" class="center-align">
                        <h4>Gotowy na test?</h4>
                        <p class="flow-text">
                            Organizatorzy zadadzą Ci szereg pytań dotyczących zasad Stanu Zamrożenia. Różne pytania mają
                            różną ilość punktów, które możesz zdobyć. Powodzenia!
                        </p>
                        <!-- Show saved progress indicator if exists -->
                        <div v-if="currentQuestionIndex > 0 && !quizFinished" class="card-panel orange lighten-4"
                            style="margin: 20px 0;">
                            <i class="left material-icons">restore</i>
                            <span>Masz zapisany postęp: pytanie {{ currentQuestionIndex + 1 }} z {{ questions.length
                                }}</span>
                        </div>
                        <button @click="startQuiz" class="btn-large green waves-effect waves-light">
                            {{ currentQuestionIndex > 0 ? 'Kontynuuj Quiz' : 'Rozpocznij Quiz' }}
                        </button>
                        <!-- Reset button if there's saved progress -->
                        <div v-if="currentQuestionIndex > 0 || quizFinished" style="margin-top: 15px;">
                            <button @click="resetQuiz" class="btn grey waves-effect waves-light">
                                <i class="left material-icons">refresh</i>
                                Od nowa
                            </button>
                        </div>
                    </div>

                    <!-- Quiz Questions -->
                    <div v-if="quizStarted && !quizFinished && currentQuestion" class="quiz-container"
                        id="current-question">
                        <div class="progress">
                            <div class="determinate" :style="{ width: progress + '%' }"></div>
                        </div>

                        <div class="quiz-card card">
                            <div class="quiz-content-wrapper">
                                <div class="quiz-image card-image" v-if="currentQuestion.imageUrl">
                                    <img :src="getOptimizedImageUrl(currentQuestion.imageUrl, 'l')"
                                        :srcset="getImageSrcSet(currentQuestion.imageUrl)"
                                        sizes="(max-width: 600px) 320px, (max-width: 1200px) 640px, 1024px"
                                        :alt="'Pytanie ' + (currentQuestionIndex + 1)"
                                        class="materialboxed responsive-img"
                                        :data-caption="'Pytanie ' + (currentQuestionIndex + 1) + '/' + questions.length"
                                        loading="lazy">
                                </div>
                                <div class="quiz-text card-content">
                                    <div class="question-header">
                                        <span class="question-number">Pytanie {{ currentQuestionIndex + 1 }}/{{
                                            questions.length }}</span>
                                        <div class="question-points-container"
                                            style="display: flex; align-items: center; ">
                                            <span class="question-points grey" style="cursor: pointer;"
                                                @click="resetQuiz">
                                                <i class="material-icons"
                                                    style="font-size: 16px; transform: translateY(2px);">refresh</i>
                                            </span>
                                            <span class="question-points" style="margin-left: 8px;">{{
                                                currentQuestion.weight || 1 }}
                                                pkt</span>
                                        </div>
                                    </div>
                                    <h5 v-html="renderMarkdown(currentQuestion.question)"></h5>
                                    <div class="answers">
                                        <p v-for="(answer, index) in currentQuestion.answers" :key="index">
                                            <label>
                                                <input name="quiz-answer" type="radio" class="with-gap"
                                                    :checked="selectedAnswerIndex === index"
                                                    @change="selectAnswer(index)" />
                                                <span v-html="renderMarkdown(answer.text)"></span>
                                            </label>
                                        </p>
                                    </div>
                                    <div class="card-action">
                                        <button @click="submitAnswer" class="btn green waves-effect waves-light"
                                            :disabled="selectedAnswerIndex === null">
                                            Następne pytanie
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Quiz Results -->
                    <div v-if="quizFinished" class="center-align" id="quiz-results">
                        <div class="score-overview">
                            <h4>{{ performanceMessage.title }}</h4>
                            <div class="score-big">
                                <span class="score-number">{{ score }}</span>
                                <span class="score-divider">/</span>
                                <span class="score-total">{{ totalPossibleScore }}</span>
                                <span class="score-percentage">
                                    ({{ scorePercentage }}%)
                                </span>
                            </div>
                            <div class="performance-message">
                                <p>{{ performanceMessage.message }}</p>
                            </div>
                            <div class="questions-overview">
                                <div v-for="(question, index) in questions" :key="question.id" class="question-result"
                                    :class="{ 'correct': question.answers.find(a => a.isCorrect)?.text === userAnswers[index]?.text }">
                                    <span class="question-number">{{ index + 1 }}</span>
                                    <span class="question-points">{{ question.weight || 1 }}pkt</span>
                                </div>
                            </div>
                        </div>

                        <h5 class="details-header">Szczegółowe odpowiedzi</h5>
                        <div class="answers-review">
                            <div v-for="question in questions" :key="question.id" class="card question-review"
                                :id="'question-' + question.id">
                                <div class="question-review-header" @click="toggleQuestion(question.id)"
                                    :class="{ 'correct': question.answers.find(a => a.isCorrect)?.text === userAnswers[questions.indexOf(question)]?.text }">
                                    <div class="question-text">
                                        <i class="material-icons">{{ isQuestionExpanded(question.id) ? 'expand_less' :
                                            'expand_more' }}</i>
                                        <span v-html="renderMarkdown(question.question)"></span>
                                    </div>
                                    <div class="question-status">
                                        <i class="material-icons">{{ question.answers.find(a => a.isCorrect)?.text ===
                                            userAnswers[questions.indexOf(question)]?.text ? 'check_circle' : 'cancel'
                                            }}</i>
                                        <span class="points">{{ question.weight || 1 }}pkt</span>
                                    </div>
                                </div>
                                <div v-show="isQuestionExpanded(question.id)" class="question-review-content">
                                    <div class="question-image" v-if="question.imageUrl">
                                        <img :src="getOptimizedImageUrl(question.imageUrl, 'm')"
                                            :srcset="getImageSrcSet(question.imageUrl)"
                                            sizes="(max-width: 600px) 320px, (max-width: 1200px) 640px, 1024px"
                                            :alt="question.question" class="materialboxed responsive-img"
                                            :data-caption="'Pytanie ' + (questions.indexOf(question) + 1) + '/' + questions.length"
                                            loading="lazy">
                                    </div>
                                    <div class="answers-list">
                                        <div class="answer-review" v-for="answer in question.answers" :key="answer.text"
                                            :class="{
                                                'correct': answer.isCorrect,
                                                'selected': answer.text === userAnswers[questions.indexOf(question)]?.text,
                                                'wrong-selected': !answer.isCorrect && answer.text === userAnswers[questions.indexOf(question)]?.text
                                            }">
                                            <div class="answer-text">
                                                <i class="material-icons">
                                                    {{ answer.isCorrect ? 'check_circle' :
                                                    (answer.text === userAnswers[questions.indexOf(question)]?.text ?
                                                    'cancel' : 'radio_button_unchecked') }}
                                                </i>
                                                <span v-html="renderMarkdown(answer.text)"></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="explanation">
                                        <i class="material-icons">lightbulb</i>
                                        <p v-html="renderMarkdown(question.explanation)"></p>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div class="col s12">
                            <button @click="startQuiz" class="btn-large green waves-effect waves-light">
                                Spróbuj ponownie
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.quiz-container {
    margin: 20px auto;
    max-width: 90vw;
    min-height: calc(100vh - 400px);
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.quiz-card {
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .quiz-content-wrapper {
        display: flex;
        flex-direction: column;
    }
}

.question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    color: #666;
    font-size: 0.9rem;

    .question-points {
        background: #4CAF50;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: 500;
    }
}

@media (min-width: 993px) {
    .quiz-content-wrapper {
        flex-direction: row !important;
        align-items: stretch !important;
        min-height: 500px;
    }

    .quiz-image {
        flex: 0 0 auto;
        width: 60%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-right: 1px solid rgba(0, 0, 0, 0.1);
        padding: 0;

        img {
            max-width: 100%;
            max-height: 600px;
            width: auto;
            height: auto;
            object-fit: contain;
        }
    }

    .quiz-text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        padding: 32px;
        background: white;
    }
}

.card-image {
    background-color: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;

    img {
        max-width: 100%;
        max-height: 70vh;
        width: auto;
        height: auto;
        object-fit: contain;
    }
}

.answers {
    margin: 24px 0;

    p {
        margin: 0;
    }

    label {
        color: rgba(0, 0, 0, 0.87);
        display: block;
        padding: 12px 16px;
        border-radius: 4px;
        transition: background-color 0.2s ease;
        cursor: pointer;

        &:hover {
            background-color: #f5f5f5;
        }
    }

    [type="radio"]:not(:checked)+span,
    [type="radio"]:checked+span {
        height: auto;
        line-height: 1.4;
    }
}

.progress {
    margin-bottom: 24px;
    height: 6px;
    border-radius: 3px;
    background-color: rgba(76, 175, 80, 0.1);

    .determinate {
        border-radius: 3px;
        transition: width 0.3s ease;
    }
}

.card-action {
    text-align: right;
    padding-top: 24px;
    margin-top: auto;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
}

h5 {
    font-size: 1.25rem;
    margin: 0;
    line-height: 1.4;
    color: #333;
}

// Start and finish screens
.center-align {
    min-height: calc(100vh - 400px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px 20px;

    h4 {
        margin-bottom: 24px;
    }

    .flow-text {
        margin-bottom: 32px;
        max-width: 600px;
    }
}

@media (max-width: 992px) {
    .quiz-card {
        margin: 0 -12px;
        border-radius: 0;
    }

    .card-content {
        padding: 20px !important;
    }

    .quiz-text {
        padding: 16px !important;
    }

    .answers label {
        padding: 10px;
    }
}

.answers-review {
    width: 100%;
    max-width: 800px;
    margin: 0 auto 2rem;
    text-align: left;
}

.question-review {
    margin: 1rem 0;
    border-radius: 8px;
    overflow: hidden;

    .question-review-header {
        padding: 1rem;
        background-color: #f8f9fa;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        border: 1px solid transparent;
        gap: 12px;

        @media (max-width: 600px) {
            flex-direction: column;
            gap: 8px;
        }

        &:hover {
            background-color: #f0f0f0;
        }

        &.correct {
            background: rgba(76, 175, 80, 0.1);
            border-color: rgba(76, 175, 80, 0.2);

            .material-icons {
                color: #4CAF50;
            }

            .question-text span {
                color: #2E7D32;
            }
        }

        .question-text {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            font-weight: 500;
            flex: 1;

            @media (max-width: 600px) {
                width: 100%;
            }

            i {
                color: #666;
                margin-top: 2px;
            }
        }

        .question-status {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;

            @media (max-width: 600px) {
                width: 100%;
                justify-content: flex-end;
                padding-left: 32px; // Align with question text
            }

            i {
                color: #999;
            }

            .points {
                font-size: 0.9rem;
                color: #666;
                font-weight: 500;
            }
        }
    }

    .question-review-content {
        padding: 1rem;
    }
}

.answer-review {
    margin: 0.5rem 0;
    padding: 0.8rem;
    border-radius: 4px;
    background-color: #f8f9fa;
    border: 1px solid transparent;
    position: relative;

    &.correct {
        background-color: rgba(76, 175, 80, 0.1);
        border-color: rgba(76, 175, 80, 0.2);
    }

    &.wrong-selected {
        background-color: rgba(244, 67, 54, 0.1);
        border-color: rgba(244, 67, 54, 0.2);
    }

    &.selected {
        border-color: rgba(0, 0, 0, 0.2);
    }

    .answer-text {
        display: flex;
        align-items: center;
        gap: 12px;

        i {
            font-size: 1.2rem;

            &.material-icons {
                color: #999;
            }
        }

        span {
            flex: 1;
        }
    }

    &.correct .answer-text i.material-icons {
        color: #4CAF50;
    }

    &.wrong-selected .answer-text i.material-icons {
        color: #f44336;
    }
}

.explanation {
    margin-top: 1rem;
    padding: 1rem;
    background-color: #fff3e0;
    border-radius: 4px;
    display: flex;
    gap: 12px;
    align-items: flex-start;

    i {
        color: #ffa726;
        font-size: 1.2rem;
        flex-shrink: 0;
        margin-top: 3px;
    }

    p {
        margin: 0;
        font-size: 0.95rem;
        color: #555;
        line-height: 1.5;
    }
}

.score-overview {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
    width: 100%;
    max-width: 800px;

    h4 {
        margin: 0 0 1rem 0;
        color: #333;
    }
}

.score-big {
    font-size: 3rem;
    font-weight: 500;
    color: #333;
    margin: 1rem 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    .score-number {
        color: #4CAF50;
    }

    .score-divider {
        color: #999;
        margin: 0 0.2rem;
    }

    .score-percentage {
        font-size: 1.5rem;
        color: #666;
        margin-left: 1rem;
    }
}

.performance-message {
    margin: 1.5rem 0;
    padding: 1rem;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 8px;
    border-left: 4px solid #4CAF50;

    p {
        margin: 0;
        font-size: 1.1rem;
        line-height: 1.5;
        color: #495057;
        font-weight: 400;
    }
}

.questions-overview {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-top: 1.5rem;
}

.question-result {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 8px;
    background: #f5f5f5;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;

    &.correct {
        background: rgba(76, 175, 80, 0.1);
        border: 1px solid rgba(76, 175, 80, 0.2);

        .question-number {
            color: #2E7D32;
        }
    }

    .question-number {
        font-size: 1.2rem;
        font-weight: 500;
        color: #666;
    }

    .question-points {
        font-size: 0.75rem;
        color: #666;
        margin-top: 2px;
    }
}

.details-header {
    margin: 2rem 0 1rem;
    color: #666;
}

.retry-button {
    margin-top: 2rem;
}

.question-image {
    margin: -1rem -1rem 1rem -1rem;
    background-color: #f8f9fa;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;

    img {
        max-width: 100%;
        max-height: 400px;
        width: auto;
        height: auto;
        object-fit: contain;
    }
}

.materialboxed {
    cursor: zoom-in;

    &.active {
        cursor: zoom-out;
    }
}

.answers label span :deep(p) {
    margin: 0;
    line-height: inherit;
}

.question-text span :deep(p) {
    margin: 0;
    display: inline;
}

.answer-text span :deep(p) {
    margin: 0;
    display: inline;
}

.explanation p :deep(p) {
    margin: 0;
}
</style>