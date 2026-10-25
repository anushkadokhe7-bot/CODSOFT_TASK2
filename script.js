/* ==========================================================
   QUIZORA — ONLINE QUIZ MAKER (VANILLA JAVASCRIPT)
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Application State
    const state = {
        currentUser: null,
        quizzes: [],
        attempts: [],
        theme: 'light',
        activeView: 'dashboard',
        activeQuiz: null,
        currentQuestionIndex: 0,
        userAnswers: {},
        timerInterval: null,
        timeRemaining: 0,
        quizStartTime: null,
        isRetryIncorrectMode: false,
        retryQuestionIds: []
    };

    // Built-in Sample Quizzes
    const sampleQuizzes = [
        {
            id: 'sample-js-basics',
            title: 'JavaScript Fundamentals',
            description: 'Test your knowledge of core JavaScript concepts including variables, scope, closures, and arrays.',
            category: 'Programming',
            difficulty: 'Easy',
            creatorId: 'system',
            creatorName: 'Quizora Team',
            createdAt: new Date().toISOString(),
            questions: [
                {
                    id: 'q1-1',
                    text: 'Which keyword is used to declare a block-scoped variable in modern JavaScript?',
                    options: ['var', 'let', 'define', 'variable'],
                    correctIndex: 1,
                    explanation: 'The `let` keyword (along with `const`) introduces block-scoped variables in modern ECMAScript.'
                },
                {
                    id: 'q1-2',
                    text: 'What is the output of `typeof null` in JavaScript?',
                    options: ['null', 'undefined', 'object', 'number'],
                    correctIndex: 2,
                    explanation: 'Due to a historical bug in the initial implementation of JavaScript, `typeof null` returns "object".'
                },
                {
                    id: 'q1-3',
                    text: 'Which method is used to add an element to the end of an array?',
                    options: ['shift()', 'unshift()', 'push()', 'pop()'],
                    correctIndex: 2,
                    explanation: 'The `push()` method adds one or more elements to the end of an array and returns the new length.'
                },
                {
                    id: 'q1-4',
                    text: 'What does JSON stand for?',
                    options: ['JavaScript Object Notation', 'Java Syntax Online Network', 'Jumbo Script Object Name', 'JavaScript Operational Node'],
                    correctIndex: 0,
                    explanation: 'JSON stands for JavaScript Object Notation, a lightweight data-interchange format.'
                }
            ]
        },
        {
            id: 'sample-science-1',
            title: 'Solar System & Astronomy',
            description: 'Explore planets, stars, galaxies, and celestial mechanics in this engaging astronomy quiz.',
            category: 'Science',
            difficulty: 'Medium',
            creatorId: 'system',
            creatorName: 'Quizora Team',
            createdAt: new Date().toISOString(),
            questions: [
                {
                    id: 'q2-1',
                    text: 'Which planet in our solar system is known as the Red Planet?',
                    options: ['Venus', 'Saturn', 'Mars', 'Jupiter'],
                    correctIndex: 2,
                    explanation: 'Mars is called the Red Planet because of iron oxide (rust) prevalent on its surface.'
                },
                {
                    id: 'q2-2',
                    text: 'What is the hottest planet in our solar system?',
                    options: ['Mercury', 'Venus', 'Earth', 'Neptune'],
                    correctIndex: 1,
                    explanation: 'Venus is the hottest planet due to a dense carbon dioxide atmosphere causing a runaway greenhouse effect.'
                },
                {
                    id: 'q2-3',
                    text: 'Approximately how long does it take light from the Sun to reach Earth?',
                    options: ['8 seconds', '8 minutes', '1 hour', '1 day'],
                    correctIndex: 1,
                    explanation: 'Sunlight takes approximately 8 minutes and 20 seconds to travel the 93 million miles to Earth.'
                }
            ]
        },
        {
            id: 'sample-math-1',
            title: 'Algebra & Calculus Essentials',
            description: 'Test your mathematical problem-solving skills with equations, functions, and derivatives.',
            category: 'Mathematics',
            difficulty: 'Hard',
            creatorId: 'system',
            creatorName: 'Quizora Team',
            createdAt: new Date().toISOString(),
            questions: [
                {
                    id: 'q3-1',
                    text: 'What is the derivative of f(x) = x^2 using polynomial power rules?',
                    options: ['2x', 'x^2', 'x', '2'],
                    correctIndex: 0,
                    explanation: 'Using the power rule for differentiation, the derivative of x^n is n*x^(n-1), so d/dx(x^2) = 2x.'
                },
                {
                    id: 'q3-2',
                    text: 'What is the value of Pi (π) rounded to two decimal places?',
                    options: ['3.12', '3.14', '3.16', '3.18'],
                    correctIndex: 1,
                    explanation: 'Pi is mathematically approximately 3.14159..., which rounds to 3.14.'
                }
            ]
        },
        {
            id: 'sample-gk-1',
            title: 'World Geography & Capitals',
            description: 'How well do you know countries, continents, flags, and capital cities around the globe?',
            category: 'General Knowledge',
            difficulty: 'Easy',
            creatorId: 'system',
            creatorName: 'Quizora Team',
            createdAt: new Date().toISOString(),
            questions: [
                {
                    id: 'q4-1',
                    text: 'What is the capital city of Australia?',
                    options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'],
                    correctIndex: 2,
                    explanation: 'Canberra is the federal capital city of Australia, chosen as a compromise between Sydney and Melbourne.'
                },
                {
                    id: 'q4-2',
                    text: 'Which ocean is the largest by surface area?',
                    options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
                    correctIndex: 3,
                    explanation: 'The Pacific Ocean is the largest and deepest of Earths oceanic divisions.'
                }
            ]
        }
    ];

    // Initialize LocalStorage & Data
    function initStorage() {
        const savedTheme = localStorage.getItem('quizora-theme') || 'light';
        state.theme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeToggleUI();

        const storedQuizzes = localStorage.getItem('quizora-quizzes');
        if (storedQuizzes) {
            try {
                state.quizzes = JSON.parse(storedQuizzes);
                if (!Array.isArray(state.quizzes) || state.quizzes.length === 0) {
                    state.quizzes = sampleQuizzes;
                }
            } catch (e) {
                state.quizzes = sampleQuizzes;
            }
        } else {
            state.quizzes = sampleQuizzes;
            localStorage.setItem('quizora-quizzes', JSON.stringify(sampleQuizzes));
        }

        const storedAttempts = localStorage.getItem('quizora-attempts');
        if (storedAttempts) {
            try {
                state.attempts = JSON.parse(storedAttempts) || [];
            } catch (e) {
                state.attempts = [];
            }
        }

        const storedUser = localStorage.getItem('quizora-current-user');
        if (storedUser) {
            try {
                state.currentUser = JSON.parse(storedUser);
            } catch (e) {
                state.currentUser = null;
            }
        } else {
            state.currentUser = {
                name: 'Demo User',
                email: 'demo@quizora.com'
            };
            localStorage.setItem('quizora-current-user', JSON.stringify(state.currentUser));
        }
    }

    // Toast Notification System
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;
        
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // Navigation & View Switching
    function switchView(viewName) {
        if (state.activeView === 'take-quiz' && viewName !== 'take-quiz') {
            clearInterval(state.timerInterval);
        }

        state.activeView = viewName;
        document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => item.classList.remove('active'));

        const targetView = document.getElementById(`${viewName}-view`);
        if (targetView) targetView.classList.add('active');

        const navBtn = document.querySelector(`.sidebar-nav [data-view="${viewName}"]`);
        if (navBtn) navBtn.classList.add('active');

        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.remove('open');

        const titles = {
            dashboard: { title: 'Dashboard', subtitle: 'Welcome back, check your latest activity and quizzes.' },
            explore: { title: 'Explore Quizzes', subtitle: 'Discover, search, and take interactive quizzes.' },
            create: { title: 'Create Quiz', subtitle: 'Design your own custom quiz and publish it instantly.' },
            'take-quiz': { title: 'Take Quiz', subtitle: 'Answer questions one by one and test your mastery.' },
            results: { title: 'Quiz Results & Review', subtitle: 'Analyze your score, correct answers, and explanations.' },
            progress: { title: 'My Progress & Analytics', subtitle: 'Track your XP, practice streak, badges, and history.' }
        };

        if (titles[viewName]) {
            const pageTitleEl = document.getElementById('page-title');
            const pageSubtitleEl = document.getElementById('page-subtitle');
            if (pageTitleEl) pageTitleEl.textContent = titles[viewName].title;
            if (pageSubtitleEl) pageSubtitleEl.textContent = titles[viewName].subtitle;
        }

        if (viewName === 'dashboard') renderDashboard();
        if (viewName === 'explore') renderExploreQuizzes();
        if (viewName === 'progress') renderProgressView();

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Dashboard Rendering
    function renderDashboard() {
        const totalQuizzes = state.quizzes.length;
        const userAttempts = state.attempts;
        const completedCount = userAttempts.length;

        let avgScore = 0;
        if (completedCount > 0) {
            const sumScores = userAttempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
            avgScore = Math.round(sumScores / completedCount);
        }

        const streak = calculateStreak();

        const stTotal = document.getElementById('stat-total-quizzes');
        const stComp = document.getElementById('stat-completed-quizzes');
        const stAvg = document.getElementById('stat-avg-score');
        const stStreak = document.getElementById('stat-streak');
        const headerStreak = document.getElementById('header-streak-count');

        if (stTotal) stTotal.textContent = totalQuizzes;
        if (stComp) stComp.textContent = completedCount;
        if (stAvg) stAvg.textContent = `${avgScore}%`;
        if (stStreak) stStreak.textContent = `${streak} Days`;
        if (headerStreak) headerStreak.textContent = streak;

        const featuredContainer = document.getElementById('featured-quizzes-grid');
        if (!featuredContainer) return;
        featuredContainer.innerHTML = '';
        const featured = state.quizzes.slice(0, 3);

        if (featured.length === 0) {
            featuredContainer.innerHTML = '<p>No quizzes available yet.</p>';
            return;
        }

        featured.forEach(quiz => {
            featuredContainer.appendChild(createQuizCardElement(quiz));
        });
    }

    // Create Quiz Card Element
    function createQuizCardElement(quiz) {
        const card = document.createElement('div');
        card.className = 'quiz-card';

        const qCount = quiz.questions ? quiz.questions.length : 0;
        const estTime = Math.max(2, qCount * 1);

        card.innerHTML = `
            <div>
                <div class="quiz-card-top">
                    <span class="badge-category">${escapeHtml(quiz.category)}</span>
                    <span class="badge-difficulty">${escapeHtml(quiz.difficulty)}</span>
                </div>
                <h4>${escapeHtml(quiz.title)}</h4>
                <p>${escapeHtml(quiz.description)}</p>
            </div>
            <div>
                <div class="quiz-card-meta">
                    <span><i class="fa-solid fa-clipboard-question"></i> ${qCount} Questions</span>
                    <span><i class="fa-solid fa-clock"></i> ~${estTime} mins</span>
                </div>
                <button class="btn btn-primary btn-block start-quiz-btn" data-id="${escapeHtml(quiz.id)}">
                    <i class="fa-solid fa-play"></i> Start Quiz
                </button>
            </div>
        `;

        card.querySelector('.start-quiz-btn').addEventListener('click', () => {
            startQuiz(quiz.id);
        });

        return card;
    }

    // Explore Quizzes Filtering
    let currentCategoryFilter = 'All';
    let currentDifficultyFilter = 'all';
    let currentSearchQuery = '';

    function renderExploreQuizzes() {
        const grid = document.getElementById('explore-quizzes-grid');
        const emptyState = document.getElementById('explore-empty-state');
        if (!grid) return;
        grid.innerHTML = '';

        let filtered = state.quizzes.filter(quiz => {
            const matchesCategory = currentCategoryFilter === 'All' || quiz.category === currentCategoryFilter;
            const matchesDifficulty = currentDifficultyFilter === 'all' || quiz.difficulty === currentDifficultyFilter;
            const matchesSearch = (quiz.title && quiz.title.toLowerCase().includes(currentSearchQuery.toLowerCase())) ||
                                  (quiz.description && quiz.description.toLowerCase().includes(currentSearchQuery.toLowerCase()));
            return matchesCategory && matchesDifficulty && matchesSearch;
        });

        if (filtered.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
        } else {
            if (emptyState) emptyState.classList.add('hidden');
            filtered.forEach(quiz => {
                grid.appendChild(createQuizCardElement(quiz));
            });
        }
    }

    // Quiz Builder Initialization
    function initQuizBuilder() {
        const container = document.getElementById('questions-builder-container');
        if (!container) return;
        container.innerHTML = '';
        addQuestionCard(1);
        addQuestionCard(2);
    }

    function addQuestionCard(defaultNum = null) {
        const container = document.getElementById('questions-builder-container');
        if (!container) return;
        const qNum = (defaultNum !== null && defaultNum !== undefined) ? defaultNum : container.children.length + 1;
        const qId = 'q-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);

        const card = document.createElement('div');
        card.className = 'question-builder-card';
        card.dataset.questionId = qId;

        card.innerHTML = `
            <div class="question-builder-card-top">
                <h4>Question #${qNum}</h4>
                <button type="button" class="icon-btn remove-question-btn" title="Remove Question"><i class="fa-solid fa-trash"></i></button>
            </div>
            <div class="form-group">
                <label>Question Text *</label>
                <input type="text" class="form-control q-text-input" placeholder="e.g. What does HTML stand for?" required>
            </div>
            <div class="form-group">
                <label>Four Answer Options (Select the radio button next to the correct answer) *</label>
                <div class="options-grid">
                    <div class="option-input-group">
                        <input type="radio" name="correct-${qId}" value="0" checked required>
                        <input type="text" class="form-control q-opt-input" placeholder="Option A" required>
                    </div>
                    <div class="option-input-group">
                        <input type="radio" name="correct-${qId}" value="1">
                        <input type="text" class="form-control q-opt-input" placeholder="Option B" required>
                    </div>
                    <div class="option-input-group">
                        <input type="radio" name="correct-${qId}" value="2">
                        <input type="text" class="form-control q-opt-input" placeholder="Option C" required>
                    </div>
                    <div class="option-input-group">
                        <input type="radio" name="correct-${qId}" value="3">
                        <input type="text" class="form-control q-opt-input" placeholder="Option D" required>
                    </div>
                </div>
            </div>
            <div class="form-group" style="margin-bottom:0;">
                <label>Explanation for Correct Answer (Optional)</label>
                <input type="text" class="form-control q-exp-input" placeholder="e.g. HTML stands for HyperText Markup Language.">
            </div>
        `;

        card.querySelector('.remove-question-btn').addEventListener('click', () => {
            if (container.children.length <= 1) {
                showToast('A quiz must have at least one question.', 'error');
                return;
            }
            card.remove();
            reindexQuestionCards();
        });

        container.appendChild(card);
    }

    function reindexQuestionCards() {
        const cards = document.querySelectorAll('.question-builder-card');
        cards.forEach((card, index) => {
            const h4 = card.querySelector('h4');
            if (h4) h4.textContent = `Question #${index + 1}`;
        });
    }

    // Quiz Creation Form Handler
    const createForm = document.getElementById('create-quiz-form');
    if (createForm) {
        createForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const titleInput = document.getElementById('quiz-title-input');
            const descInput = document.getElementById('quiz-desc-input');
            const catInput = document.getElementById('quiz-category-input');
            const diffInput = document.getElementById('quiz-difficulty-input');

            if (!titleInput || !descInput) return;

            const title = titleInput.value.trim();
            const description = descInput.value.trim();
            const category = catInput ? catInput.value : 'Programming';
            const difficulty = diffInput ? diffInput.value : 'Easy';

            if (!title || !description) {
                showToast('Please fill in all quiz basic information fields.', 'error');
                return;
            }

            const questionCards = document.querySelectorAll('.question-builder-card');
            const questions = [];

            try {
                for (let card of questionCards) {
                    const qTextField = card.querySelector('.q-text-input');
                    const expField = card.querySelector('.q-exp-input');
                    const optInputs = card.querySelectorAll('.q-opt-input');
                    const radioInputs = card.querySelectorAll('input[type="radio"]');

                    if (!qTextField || !qTextField.value.trim()) {
                        showToast('Every question must have question text.', 'error');
                        return;
                    }

                    const options = [];
                    let correctIndex = 0;

                    optInputs.forEach((optInput, idx) => {
                        const val = optInput.value.trim();
                        if (!val) {
                            showToast('All four answer options must be filled out.', 'error');
                            throw new Error('Missing option');
                        }
                        options.push(val);
                        if (radioInputs[idx] && radioInputs[idx].checked) {
                            correctIndex = idx;
                        }
                    });

                    questions.push({
                        id: 'q-' + Math.random().toString(36).substr(2, 9),
                        text: qTextField.value.trim(),
                        options: options,
                        correctIndex: correctIndex,
                        explanation: (expField && expField.value.trim()) ? expField.value.trim() : 'Correct answer verified.'
                    });
                }
            } catch (err) {
                return; // Stop submission if error thrown
            }

            const newQuiz = {
                id: 'quiz-' + Date.now(),
                title: title,
                description: description,
                category: category,
                difficulty: difficulty,
                creatorId: state.currentUser ? state.currentUser.email : 'guest',
                creatorName: state.currentUser ? state.currentUser.name : 'Demo User',
                createdAt: new Date().toISOString(),
                questions: questions
            };

            state.quizzes.unshift(newQuiz);
            localStorage.setItem('quizora-quizzes', JSON.stringify(state.quizzes));

            showToast('Quiz published successfully! Available in Explore Quizzes.', 'success');
            createForm.reset();
            initQuizBuilder();
            switchView('explore');
        });
    }

    // Take Quiz Logic
    function startQuiz(quizId, customQuestionIds = null) {
        const quiz = state.quizzes.find(q => q.id === quizId);
        if (!quiz) {
            showToast('Quiz not found.', 'error');
            return;
        }

        state.activeQuiz = JSON.parse(JSON.stringify(quiz));
        
        if (customQuestionIds && customQuestionIds.length > 0) {
            state.activeQuiz.questions = state.activeQuiz.questions.filter(q => customQuestionIds.includes(q.id));
        }

        state.currentQuestionIndex = 0;
        state.userAnswers = {};
        state.quizStartTime = new Date();
        state.isRetryIncorrectMode = (customQuestionIds !== null);

        const totalSecs = state.activeQuiz.questions.length * 90;
        state.timeRemaining = totalSecs;

        switchView('take-quiz');
        renderCurrentQuestion();
        startQuizTimer();
    }

    function startQuizTimer() {
        clearInterval(state.timerInterval);
        const display = document.getElementById('timer-display');
        const timerBox = document.getElementById('quiz-timer-box');

        if (timerBox) timerBox.style.animation = 'none';

        state.timerInterval = setInterval(() => {
            state.timeRemaining--;
            const mins = Math.floor(state.timeRemaining / 60);
            const secs = state.timeRemaining % 60;
            if (display) {
                display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            }

            if (state.timeRemaining <= 30 && timerBox) {
                timerBox.style.animation = 'pulse 1s infinite';
            }

            if (state.timeRemaining <= 0) {
                clearInterval(state.timerInterval);
                showToast('Time expired! Submitting quiz automatically.', 'error');
                submitQuiz();
            }
        }, 1000);
    }

    function renderCurrentQuestion() {
        const quiz = state.activeQuiz;
        if (!quiz || !quiz.questions) return;
        const qIdx = state.currentQuestionIndex;
        const question = quiz.questions[qIdx];
        if (!question) return;

        const catEl = document.getElementById('player-quiz-category');
        const titleEl = document.getElementById('player-quiz-title');
        const counterEl = document.getElementById('question-counter-text');
        const pctEl = document.getElementById('progress-percentage');
        const fillEl = document.getElementById('quiz-progress-fill');
        const textEl = document.getElementById('current-question-text');

        if (catEl) catEl.textContent = quiz.category;
        if (titleEl) titleEl.textContent = quiz.title;
        if (counterEl) counterEl.textContent = `Question ${qIdx + 1} of ${quiz.questions.length}`;
        
        const pct = Math.round(((qIdx + 1) / quiz.questions.length) * 100);
        if (pctEl) pctEl.textContent = `${pct}%`;
        if (fillEl) fillEl.style.width = `${pct}%`;
        if (textEl) textEl.textContent = question.text;

        const optionsList = document.getElementById('current-options-list');
        if (!optionsList) return;
        optionsList.innerHTML = '';

        question.options.forEach((optText, optIdx) => {
            const item = document.createElement('div');
            item.className = 'option-item';
            if (state.userAnswers[qIdx] === optIdx) {
                item.classList.add('selected');
            }

            item.innerHTML = `
                <div class="option-radio-dot"></div>
                <span>${escapeHtml(optText)}</span>
            `;

            item.addEventListener('click', () => {
                state.userAnswers[qIdx] = optIdx;
                optionsList.querySelectorAll('.option-item').forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');
            });

            optionsList.appendChild(item);
        });

        const prevBtn = document.getElementById('prev-question-btn');
        const nextBtn = document.getElementById('next-question-btn');

        if (prevBtn) {
            prevBtn.disabled = qIdx === 0;
            prevBtn.style.opacity = qIdx === 0 ? '0.5' : '1';
        }

        if (nextBtn) {
            if (qIdx === quiz.questions.length - 1) {
                nextBtn.innerHTML = 'Finish Quiz <i class="fa-solid fa-check"></i>';
            } else {
                nextBtn.innerHTML = 'Next <i class="fa-solid fa-arrow-right"></i>';
            }
        }
    }

    // Question Navigation Listeners
    const prevQBtn = document.getElementById('prev-question-btn');
    if (prevQBtn) {
        prevQBtn.addEventListener('click', () => {
            if (state.currentQuestionIndex > 0) {
                state.currentQuestionIndex--;
                renderCurrentQuestion();
            }
        });
    }

    const nextQBtn = document.getElementById('next-question-btn');
    if (nextQBtn) {
        nextQBtn.addEventListener('click', () => {
            const quiz = state.activeQuiz;
            if (!quiz) return;
            if (state.currentQuestionIndex < quiz.questions.length - 1) {
                state.currentQuestionIndex++;
                renderCurrentQuestion();
            } else {
                let unanswered = 0;
                for (let i = 0; i < quiz.questions.length; i++) {
                    if (state.userAnswers[i] === undefined) unanswered++;
                }

                if (unanswered > 0) {
                    if (!confirm(`You have ${unanswered} unanswered question(s). Do you still want to submit?`)) {
                        return;
                    }
                }
                submitQuiz();
            }
        });
    }

    // Submit Quiz & Calculate Results
    function submitQuiz() {
        clearInterval(state.timerInterval);
        const quiz = state.activeQuiz;
        if (!quiz) return;
        const timeElapsedSecs = Math.round((new Date() - state.quizStartTime) / 1000);

        let correctCount = 0;
        let incorrectCount = 0;
        let unansweredCount = 0;
        const reviewDetails = [];

        quiz.questions.forEach((q, idx) => {
            const userAns = state.userAnswers[idx];
            let status = 'unanswered';

            if (userAns !== undefined) {
                if (userAns === q.correctIndex) {
                    correctCount++;
                    status = 'correct';
                } else {
                    incorrectCount++;
                    status = 'incorrect';
                }
            } else {
                unansweredCount++;
            }

            reviewDetails.push({
                questionText: q.text,
                options: q.options,
                correctIndex: q.correctIndex,
                userAnswerIndex: userAns !== undefined ? userAns : null,
                status: status,
                explanation: q.explanation || 'Correct answer verified.',
                questionId: q.id
            });
        });

        const totalQ = quiz.questions.length;
        const percentage = Math.round((correctCount / totalQ) * 100);

        let xpEarned = 50 + (correctCount * 10);
        if (percentage >= 90) xpEarned += 50;

        const attemptRecord = {
            id: 'att-' + Date.now(),
            quizId: quiz.id,
            quizTitle: quiz.title,
            category: quiz.category,
            totalQuestions: totalQ,
            correctCount: correctCount,
            incorrectCount: incorrectCount,
            unansweredCount: unansweredCount,
            percentage: percentage,
            timeElapsed: timeElapsedSecs,
            xpEarned: xpEarned,
            date: new Date().toISOString(),
            reviewDetails: reviewDetails
        };

        state.attempts.unshift(attemptRecord);
        localStorage.setItem('quizora-attempts', JSON.stringify(state.attempts));

        renderResultsView(attemptRecord);
        switchView('results');
        showToast(`Quiz completed! You earned +${xpEarned} XP.`, 'success');
    }

    // Render Results View
    function renderResultsView(attempt) {
        const scorePercentEl = document.getElementById('results-score-percent');
        const correctEl = document.getElementById('res-correct-count');
        const incorrectEl = document.getElementById('res-incorrect-count');
        const unansweredEl = document.getElementById('res-unanswered-count');
        const timeEl = document.getElementById('res-time-taken');
        const xpEl = document.getElementById('res-xp-earned');
        const msgEl = document.getElementById('results-completion-msg');
        const subMsgEl = document.getElementById('results-performance-msg');

        if (scorePercentEl) scorePercentEl.textContent = `${attempt.percentage}%`;
        if (correctEl) correctEl.textContent = attempt.correctCount;
        if (incorrectEl) incorrectEl.textContent = attempt.incorrectCount;
        if (unansweredEl) unansweredEl.textContent = attempt.unansweredCount;
        
        const mins = Math.floor(attempt.timeElapsed / 60);
        const secs = attempt.timeElapsed % 60;
        if (timeEl) timeEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        if (xpEl) xpEl.textContent = `+${attempt.xpEarned}`;

        if (msgEl && subMsgEl) {
            if (attempt.percentage === 100) {
                msgEl.textContent = 'Flawless Victory! 🎉';
                subMsgEl.textContent = 'Absolute perfection! You mastered every single question.';
            } else if (attempt.percentage >= 80) {
                msgEl.textContent = 'Outstanding Performance! 🌟';
                subMsgEl.textContent = 'You have a thorough understanding of this topic.';
            } else if (attempt.percentage >= 50) {
                msgEl.textContent = 'Good Effort! 👍';
                subMsgEl.textContent = 'You passed, but review the explanations below to seal the gaps.';
            } else {
                msgEl.textContent = 'Keep Practicing! 💪';
                subMsgEl.textContent = 'Learning is a journey. Review the correct answers below and try again!';
            }
        }

        const incorrectList = attempt.reviewDetails.filter(d => d.status === 'incorrect' || d.status === 'unanswered');
        const retryIncorrectBtn = document.getElementById('retry-incorrect-btn');
        if (retryIncorrectBtn) {
            if (incorrectList.length > 0) {
                retryIncorrectBtn.classList.remove('hidden');
                retryIncorrectBtn.onclick = () => {
                    startQuiz(attempt.quizId, incorrectList.map(d => d.questionId));
                };
            } else {
                retryIncorrectBtn.classList.add('hidden');
            }
        }

        const retryQuizBtn = document.getElementById('retry-quiz-btn');
        if (retryQuizBtn) {
            retryQuizBtn.onclick = () => {
                startQuiz(attempt.quizId);
            };
        }

        const reviewListContainer = document.getElementById('answer-review-list');
        if (!reviewListContainer) return;
        reviewListContainer.innerHTML = '';

        attempt.reviewDetails.forEach((item, idx) => {
            const card = document.createElement('div');
            card.className = 'review-card';

            let statusLabel = 'Correct';
            let badgeClass = 'correct';
            if (item.status === 'incorrect') {
                statusLabel = 'Incorrect';
                badgeClass = 'incorrect';
            } else if (item.status === 'unanswered') {
                statusLabel = 'Unanswered';
                badgeClass = 'unanswered';
            }

            let optionsHtml = '';
            item.options.forEach((optText, optIdx) => {
                let optClass = 'review-opt';
                if (optIdx === item.correctIndex) {
                    optClass += ' is-correct';
                } else if (optIdx === item.userAnswerIndex && item.status === 'incorrect') {
                    optClass += ' is-user-wrong';
                }
                optionsHtml += `<div class="${optClass}">${escapeHtml(optText)} ${optIdx === item.correctIndex ? '✓ (Correct)' : ''} ${optIdx === item.userAnswerIndex && optIdx !== item.correctIndex ? '✗ (Your Answer)' : ''}</div>`;
            });

            card.innerHTML = `
                <div class="review-card-top">
                    <h4>Question ${idx + 1}: ${escapeHtml(item.questionText)}</h4>
                    <span class="review-status ${badgeClass}">${statusLabel}</span>
                </div>
                <div class="review-options">
                    ${optionsHtml}
                </div>
                <div class="explanation-box">
                    <i class="fa-solid fa-lightbulb"></i> <strong>Explanation:</strong> ${escapeHtml(item.explanation)}
                </div>
            `;
            reviewListContainer.appendChild(card);
        });
    }

    // My Progress View & Gamification
    function renderProgressView() {
        const attempts = state.attempts;
        const totalCompleted = attempts.length;

        let totalXP = attempts.reduce((acc, curr) => acc + (curr.xpEarned || 50), 0);
        let avgScore = 0;
        if (totalCompleted > 0) {
            avgScore = Math.round(attempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / totalCompleted);
        }

        const streak = calculateStreak();

        const progXp = document.getElementById('prog-total-xp');
        const progStreak = document.getElementById('prog-streak-days');
        const progAvg = document.getElementById('prog-avg-score-val');
        const progRank = document.getElementById('prog-user-level');

        if (progXp) progXp.textContent = `${totalXP} XP`;
        if (progStreak) progStreak.textContent = `${streak} Days`;
        if (progAvg) progAvg.textContent = `${avgScore}%`;

        let rank = 'Novice Learner 🌱';
        if (totalXP >= 500) rank = 'Quiz Scholar 🎓';
        if (totalXP >= 1500) rank = 'Master Quizzer 👑';
        if (totalXP >= 3000) rank = 'Legendary Polymath ⚡';
        if (progRank) progRank.textContent = `Rank: ${rank}`;

        const achievements = [
            { id: 'first_quiz', title: 'First Steps', desc: 'Complete your very first quiz', unlocked: totalCompleted >= 1, icon: 'fa-shoe-prints' },
            { id: 'high_score', title: 'Sharpshooter', desc: 'Score 100% on any quiz', unlocked: attempts.some(a => a.percentage === 100), icon: 'fa-bullseye' },
            { id: 'streak_3', title: 'On Fire', desc: 'Reach a 3-day practice streak', unlocked: streak >= 3, icon: 'fa-fire' },
            { id: 'creator', title: 'Curriculum Builder', desc: 'Create and publish a custom quiz', unlocked: state.quizzes.some(q => q.creatorId !== 'system'), icon: 'fa-pen-nib' }
        ];

        const achGrid = document.getElementById('achievements-grid');
        if (achGrid) {
            achGrid.innerHTML = '';
            achievements.forEach(ach => {
                const card = document.createElement('div');
                card.className = `achievement-card ${ach.unlocked ? 'unlocked' : ''}`;
                card.innerHTML = `
                    <div class="achievement-icon"><i class="fa-solid ${ach.icon}"></i></div>
                    <div class="achievement-info">
                        <h4>${ach.title}</h4>
                        <p>${ach.desc}</p>
                    </div>
                `;
                achGrid.appendChild(card);
            });
        }

        const tbody = document.getElementById('attempts-table-body');
        const emptyState = document.getElementById('attempts-empty-state');
        const tableWrapper = document.getElementById('attempts-table')?.parentElement;
        if (!tbody) return;
        tbody.innerHTML = '';

        if (totalCompleted === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
            if (tableWrapper) tableWrapper.classList.add('hidden');
        } else {
            if (emptyState) emptyState.classList.add('hidden');
            if (tableWrapper) tableWrapper.classList.remove('hidden');

            attempts.forEach(att => {
                const tr = document.createElement('tr');
                const dateStr = att.date ? new Date(att.date).toLocaleDateString() : 'Recent';
                tr.innerHTML = `
                    <td><strong>${escapeHtml(att.quizTitle)}</strong></td>
                    <td><span class="badge-category">${escapeHtml(att.category)}</span></td>
                    <td><strong>${att.percentage}%</strong></td>
                    <td>${att.correctCount} / ${att.totalQuestions}</td>
                    <td>${dateStr}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    // Streak Calculator
    function calculateStreak() {
        const attempts = state.attempts;
        if (!attempts || attempts.length === 0) return 0;

        const datesSet = new Set();
        attempts.forEach(att => {
            if (!att.date) return;
            const d = new Date(att.date);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            datesSet.add(dateStr);
        });

        if (datesSet.size === 0) return 0;

        let today = new Date();
        let todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        let yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        let yestStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

        let checkDateStr = todayStr;
        if (!datesSet.has(todayStr) && datesSet.has(yestStr)) {
            checkDateStr = yestStr;
        }

        let streak = 0;
        let curr = new Date(checkDateStr);
        while (true) {
            let cStr = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
            if (datesSet.has(cStr)) {
                streak++;
                curr.setDate(curr.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    }

    // Authentication Modal Demo
    const authModal = document.getElementById('auth-modal');
    let isLoginTab = true;

    function openAuthModal(loginMode = true) {
        isLoginTab = loginMode;
        updateAuthModalTabs();
        if (authModal) authModal.classList.remove('hidden');
    }

    function closeAuthModal() {
        if (authModal) authModal.classList.add('hidden');
        const authForm = document.getElementById('auth-form');
        const errMsg = document.getElementById('auth-error-msg');
        if (authForm) authForm.reset();
        if (errMsg) errMsg.classList.add('hidden');
    }

    function updateAuthModalTabs() {
        const nameGroup = document.getElementById('name-field-group');
        const submitBtn = document.getElementById('auth-submit-btn');
        const tabs = document.querySelectorAll('.auth-tab');

        tabs.forEach(t => {
            if (t.dataset.tab === (isLoginTab ? 'login' : 'signup')) {
                t.classList.add('active');
            } else {
                t.classList.remove('active');
            }
        });

        if (nameGroup) nameGroup.style.display = isLoginTab ? 'none' : 'block';
        if (submitBtn) submitBtn.textContent = isLoginTab ? 'Login' : 'Create Account';
    }

    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            isLoginTab = (tab.dataset.tab === 'login');
            updateAuthModalTabs();
        });
    });

    const closeAuthBtn = document.getElementById('close-auth-modal');
    if (closeAuthBtn) closeAuthBtn.addEventListener('click', closeAuthModal);

    const topAuthBtn = document.getElementById('topbar-auth-btn');
    if (topAuthBtn) topAuthBtn.addEventListener('click', () => openAuthModal(true));

    const authActionBtn = document.getElementById('auth-action-btn');
    if (authActionBtn) {
        authActionBtn.addEventListener('click', () => {
            if (state.currentUser) {
                state.currentUser = null;
                localStorage.removeItem('quizora-current-user');
                updateUserUI();
                showToast('Logged out successfully.', 'success');
            } else {
                openAuthModal(true);
            }
        });
    }

    const authFormEl = document.getElementById('auth-form');
    if (authFormEl) {
        authFormEl.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('auth-email');
            const passInput = document.getElementById('auth-password');
            const nameInput = document.getElementById('auth-name');
            const errorDiv = document.getElementById('auth-error-msg');

            if (!emailInput || !passInput) return;

            const email = emailInput.value.trim();
            const password = passInput.value.trim();
            const nameVal = nameInput ? nameInput.value.trim() : '';

            if (!email || !password || (!isLoginTab && !nameVal)) {
                if (errorDiv) {
                    errorDiv.textContent = 'Please fill in all required fields.';
                    errorDiv.classList.remove('hidden');
                }
                return;
            }

            if (isLoginTab) {
                state.currentUser = {
                    name: email.split('@')[0],
                    email: email
                };
            } else {
                state.currentUser = {
                    name: nameVal,
                    email: email
                };
            }

            localStorage.setItem('quizora-current-user', JSON.stringify(state.currentUser));
            updateUserUI();
            closeAuthModal();
            showToast(isLoginTab ? `Welcome back, ${state.currentUser.name}!` : 'Account created successfully!', 'success');
        });
    }

    function updateUserUI() {
        const user = state.currentUser;
        const nameEl = document.getElementById('user-display-name');
        const emailEl = document.getElementById('user-display-email');
        const avatarEl = document.getElementById('user-avatar');
        const authBtn = document.getElementById('topbar-auth-btn');
        const logoutIconBtn = document.getElementById('auth-action-btn');

        if (user) {
            if (nameEl) nameEl.textContent = user.name;
            if (emailEl) emailEl.textContent = user.email;
            if (avatarEl) avatarEl.textContent = user.name.substring(0, 2).toUpperCase();
            if (authBtn) authBtn.innerHTML = `<i class="fa-solid fa-user-check"></i> ${escapeHtml(user.name)}`;
            if (logoutIconBtn) {
                logoutIconBtn.title = 'Logout';
                logoutIconBtn.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i>';
            }
        } else {
            if (nameEl) nameEl.textContent = 'Guest User';
            if (emailEl) emailEl.textContent = 'Not logged in';
            if (avatarEl) avatarEl.textContent = 'GU';
            if (authBtn) authBtn.innerHTML = '<i class="fa-solid fa-user"></i> Login / Register';
            if (logoutIconBtn) {
                logoutIconBtn.title = 'Login';
                logoutIconBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i>';
            }
        }
    }

    // Theme Toggle
    function toggleTheme() {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', state.theme);
        localStorage.setItem('quizora-theme', state.theme);
        updateThemeToggleUI();
    }

    function updateThemeToggleUI() {
        const isDark = state.theme === 'dark';
        const btnText = document.querySelector('#theme-toggle-btn span');
        const btnIcon = document.querySelector('#theme-toggle-btn i');
        const mobileIcon = document.querySelector('#mobile-theme-toggle i');

        if (isDark) {
            if (btnText) btnText.textContent = 'Light Theme';
            if (btnIcon) btnIcon.className = 'fa-solid fa-sun';
            if (mobileIcon) mobileIcon.className = 'fa-solid fa-sun';
        } else {
            if (btnText) btnText.textContent = 'Dark Theme';
            if (btnIcon) btnIcon.className = 'fa-solid fa-moon';
            if (mobileIcon) mobileIcon.className = 'fa-solid fa-moon';
        }
    }

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);

    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    if (mobileThemeToggle) mobileThemeToggle.addEventListener('click', toggleTheme);

    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.classList.toggle('open');
        });
    }

    // Global Event Delegation
    document.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('[data-action]');
        if (actionBtn) {
            const action = actionBtn.dataset.action;
            if (action === 'go-explore') switchView('explore');
            if (action === 'go-create') switchView('create');
            if (action === 'go-dashboard') switchView('dashboard');
        }

        const navItem = e.target.closest('.sidebar-nav [data-view]');
        if (navItem) {
            switchView(navItem.dataset.view);
        }
    });

    // Explore Filters Listeners
    const searchInput = document.getElementById('quiz-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value;
            renderExploreQuizzes();
        });
    }

    const diffFilter = document.getElementById('difficulty-filter');
    if (diffFilter) {
        diffFilter.addEventListener('change', (e) => {
            currentDifficultyFilter = e.target.value;
            renderExploreQuizzes();
        });
    }

    document.querySelectorAll('.category-chips .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.category-chips .chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentCategoryFilter = chip.dataset.category || 'All';
            renderExploreQuizzes();
        });
    });

    const addQuestionBtn = document.getElementById('add-question-btn');
    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', () => {
            addQuestionCard();
        });
    }

    // HTML Escape Helper
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Boot Application
    initStorage();
    updateUserUI();
    initQuizBuilder();
    switchView('dashboard');
});