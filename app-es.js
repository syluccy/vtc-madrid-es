import { RULES, questionBank } from './questions.js';

const app = document.getElementById('app');
const STORAGE_KEY = 'vtc_exam_state_es';

const MODULE_META = {
  I: {
    key: 'I',
    title: 'Módulo I',
    description: 'Conocimiento de la lengua castellana; gramática y léxico.',
    take: 12,
    pass: 6,
  },
  II: {
    key: 'II',
    title: 'Módulo II',
    description: 'Conocimiento del medio físico; como sistemas de navegación, itinerarios y destinos de interés, etc.',
    take: 18,
    pass: 9,
  },
  III: {
    key: 'III',
    title: 'Módulo III',
    description: 'Conocimiento de la accesibilidad y servicio público; atención al cliente, usuarios con discapacidad, menores de edad y animales domésticos, etc.',
    take: 18,
    pass: 9,
  },
  IV: {
    key: 'IV',
    title: 'Módulo IV',
    description: 'Conocimiento del marco jurídico aplicable a la actividad de transporte de viajeros.',
    take: 12,
    pass: 6,
  },
};

const moduleOrder = ['I', 'II', 'III', 'IV'];

const moduleTitles = {
  I: 'Módulo I',
  II: 'Módulo II',
  III: 'Módulo III',
  IV: 'Módulo IV',
};

const state = {
  mode: 'menu', // menu | exam | practice
  practiceModule: null,
  examQuestions: [],
  answers: {},
  lockedAnswers: {},
  submitted: false,
  currentIndex: 0,
  resultsFilter: 'wrong',
};

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function trackEvent(eventName, params = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

function buildAnalyticsPayload(extra = {}) {
  return {
    mode: state.mode === 'practice' ? 'practice' : 'exam',
    module: state.mode === 'practice' && state.practiceModule ? state.practiceModule : 'all',
    ...extra,
  };
}

function getPracticePassed() {
  if (!(state.mode === 'practice' && state.practiceModule)) return false;
  return countCorrectOverall() >= MODULE_META[state.practiceModule].pass;
}

function getFullExamPassed() {
  return moduleOrder.every((moduleKey) => {
    const correct = countCorrectForModule(moduleKey);
    return correct >= RULES[moduleKey].pass;
  });
}

function saveState() {
  const snapshot = {
    mode: state.mode,
    practiceModule: state.practiceModule,
    examQuestions: state.examQuestions,
    answers: state.answers,
    lockedAnswers: state.lockedAnswers,
    submitted: state.submitted,
    currentIndex: state.currentIndex,
    resultsFilter: state.resultsFilter,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;

  try {
    const parsed = JSON.parse(raw);

    state.mode = parsed.mode ?? 'menu';
    state.practiceModule = parsed.practiceModule ?? null;
    state.examQuestions = Array.isArray(parsed.examQuestions) ? parsed.examQuestions : [];
    state.answers = parsed.answers ?? {};
    state.lockedAnswers = parsed.lockedAnswers ?? {};
    state.submitted = Boolean(parsed.submitted);
    state.currentIndex = Number.isInteger(parsed.currentIndex) ? parsed.currentIndex : 0;
    state.resultsFilter = parsed.resultsFilter === 'all' ? 'all' : 'wrong';

    if (state.examQuestions.length > 0) {
      if (state.currentIndex < 0) state.currentIndex = 0;
      if (state.currentIndex >= state.examQuestions.length) {
        state.currentIndex = state.examQuestions.length - 1;
      }
    } else {
      state.currentIndex = 0;
    }

    return true;
  } catch {
    return false;
  }
}

function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

function getQuestionsByModule(moduleKey) {
  return questionBank.filter((q) => q.module === moduleKey);
}

function getCurrentModeMeta() {
  if (state.mode === 'practice' && state.practiceModule) {
    return MODULE_META[state.practiceModule];
  }
  return null;
}

function buildExam() {
  const selected = [];

  for (const moduleKey of moduleOrder) {
    const pool = getQuestionsByModule(moduleKey);
    const needed = RULES[moduleKey]?.take ?? 0;

    if (pool.length < needed) {
      throw new Error(
        `No hay suficientes preguntas en ${moduleTitles[moduleKey]}. Hay ${pool.length}, se necesitan ${needed}.`
      );
    }

    selected.push(...shuffle(pool).slice(0, needed));
  }

  state.mode = 'exam';
  state.practiceModule = null;
  state.examQuestions = shuffle(selected);
  state.answers = {};
  state.lockedAnswers = {};
  state.submitted = false;
  state.currentIndex = 0;
  state.resultsFilter = 'wrong';
  saveState();
}

function buildPracticeExam(moduleKey) {
  const config = MODULE_META[moduleKey];
  const pool = getQuestionsByModule(moduleKey);

  if (!config) {
    throw new Error('Módulo desconocido.');
  }

  if (pool.length < config.take) {
    throw new Error(
      `El banco de preguntas de ${config.title} no contiene suficientes preguntas. Hay ${pool.length}, se necesitan ${config.take}.`
    );
  }

  state.mode = 'practice';
  state.practiceModule = moduleKey;
  state.examQuestions = shuffle(pool).slice(0, config.take);
  state.answers = {};
  state.lockedAnswers = {};
  state.submitted = false;
  state.currentIndex = 0;
  state.resultsFilter = 'wrong';
  saveState();
}

function isExamComplete() {
  return state.examQuestions.every((q) => Number.isInteger(state.answers[q.id]));
}

function getFirstUnansweredIndex() {
  return state.examQuestions.findIndex((q) => !Number.isInteger(state.answers[q.id]));
}

function countCorrectForQuestionSet(questions) {
  let correct = 0;
  for (const q of questions) {
    if (state.lockedAnswers[q.id] === q.correctIndex) {
      correct += 1;
    }
  }
  return correct;
}

function countCorrectOverall() {
  return countCorrectForQuestionSet(state.examQuestions);
}

function countCorrectForModule(moduleKey) {
  return countCorrectForQuestionSet(
    state.examQuestions.filter((q) => q.module === moduleKey)
  );
}

function groupExamByModule() {
  return {
    I: state.examQuestions.filter((q) => q.module === 'I'),
    II: state.examQuestions.filter((q) => q.module === 'II'),
    III: state.examQuestions.filter((q) => q.module === 'III'),
    IV: state.examQuestions.filter((q) => q.module === 'IV'),
  };
}

function isQuestionCorrect(question) {
  return state.lockedAnswers[question.id] === question.correctIndex;
}

function getFilteredQuestions(questions) {
  if (state.resultsFilter === 'all') return questions;
  return questions.filter((q) => !isQuestionCorrect(q));
}

function lockCurrentAnswer() {
  const question = state.examQuestions[state.currentIndex];
  if (!question) return;

  const selected = state.answers[question.id];
  if (Number.isInteger(selected)) {
    state.lockedAnswers[question.id] = selected;
    saveState();
  }
}

function renderLiveStats() {
  if (state.mode === 'practice' && state.practiceModule) {
    const mod = MODULE_META[state.practiceModule];
    const totalCorrect = countCorrectOverall();

    return `
      <section class="live-stats">
        <div class="live-stats-modules">
          <div class="module-mini-card">
            <div class="module-mini-title">${escapeHtml(mod.title)}</div>
            <div class="module-mini-value">${totalCorrect} / ${mod.take}</div>
            <div class="module-mini-pass">Para aprobar: ${mod.pass}</div>
          </div>
        </div>
      </section>
    `;
  }

  const totalCorrect = countCorrectOverall();

  return `
    <section class="live-stats">
      <div class="live-stats-main">
        <div class="live-stat-card">
          <div class="live-stat-label">Respuestas correctas hasta ahora</div>
          <div class="live-stat-value">${totalCorrect} / ${state.examQuestions.length}</div>
        </div>
      </div>

      <div class="live-stats-modules">
        ${moduleOrder.map((moduleKey) => {
          const correct = countCorrectForModule(moduleKey);
          const rule = RULES[moduleKey];
          return `
            <div class="module-mini-card">
              <div class="module-mini-title">${escapeHtml(moduleTitles[moduleKey])}</div>
              <div class="module-mini-value">${correct} / ${rule.take}</div>
              <div class="module-mini-pass">Para aprobar: ${rule.pass}</div>
            </div>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

function renderHome() {
  app.innerHTML = `
    <div class="page home-page">
      <header class="topbar">
        <div>
          <h1>Simulador examen VTC Madrid V3</h1>
          <p>Elige cómo quieres practicar.</p>
        </div>
      </header>

      <section class="welcome-card">
        <h2>Inicio</h2>
        <p>Puedes iniciar el examen completo o practicar un único módulo por separado.</p>

        <div class="mode-select">
          <button id="start-full-exam" class="primary-btn">Iniciar examen</button>
          <button id="start-practice-mode" class="secondary-btn">Práctica por módulos</button>
        </div>
      </section>
    </div>
  `;

  document.getElementById('start-full-exam')?.addEventListener('click', () => {
    buildExam();
    trackEvent('quiz_start', {
      ...buildAnalyticsPayload({
        total_questions: state.examQuestions.length,
      }),
    });
    renderExamView();
  });

  document.getElementById('start-practice-mode')?.addEventListener('click', () => {
    renderPracticeModuleSelect();
  });
}

function renderPracticeModuleSelect() {
  app.innerHTML = `
    <div class="page">
      <header class="topbar">
        <div>
          <h1>Práctica por módulos</h1>
          <p>Elige un módulo para practicar de forma específica.</p>
        </div>

        <div class="topbar-actions">
          <button id="back-home-btn" class="secondary-btn">Volver</button>
        </div>
      </header>

      <section class="module-grid">
        ${moduleOrder.map((moduleKey) => {
          const mod = MODULE_META[moduleKey];
          return `
            <article class="module-card" data-module="${mod.key}">
              <div class="module-card-head">
                <span class="module-badge">${escapeHtml(mod.title)}</span>
                <span class="question-number">${mod.take} preguntas</span>
              </div>

              <h2>${escapeHtml(mod.title)}</h2>
              <p class="module-desc-es">${escapeHtml(mod.description)}</p>

              <div class="module-card-footer">
                <span>Para aprobar: ${mod.pass} respuestas correctas</span>
                <button class="primary-btn module-start-btn" data-module="${mod.key}">Practicar módulo</button>
              </div>
            </article>
          `;
        }).join('')}
      </section>
    </div>
  `;

  document.getElementById('back-home-btn')?.addEventListener('click', () => {
    renderHome();
  });

  document.querySelectorAll('.module-start-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const moduleKey = btn.dataset.module;

      trackEvent('module_selected', {
        mode: 'practice',
        module: moduleKey,
      });

      buildPracticeExam(moduleKey);

      trackEvent('practice_start', {
        ...buildAnalyticsPayload({
          total_questions: state.examQuestions.length,
        }),
      });

      renderExamView();
    });
  });
}

function renderExamView() {
  const question = state.examQuestions[state.currentIndex];
  const chosenIndex = state.answers[question.id];
  const isLastQuestion = state.currentIndex === state.examQuestions.length - 1;
  const progressPercent = Math.round(((state.currentIndex + 1) / state.examQuestions.length) * 100);
  const practiceMeta = getCurrentModeMeta();

  const answersHtml = question.answers
    .map((answer, index) => {
      const checked = chosenIndex === index ? 'checked' : '';
      const inputId = `${question.id}-${index}`;

      return `
        <label class="answer-option" for="${inputId}">
          <input
            type="radio"
            id="${inputId}"
            name="${escapeHtml(question.id)}"
            value="${index}"
            ${checked}
          />
          <span>
            <strong>${String.fromCharCode(65 + index)}.</strong>
            ${escapeHtml(answer.original)}
          </span>
        </label>
      `;
    })
    .join('');

  app.innerHTML = `
    <div class="page">
      <header class="topbar">
        <div>
          <h1>Simulador examen VTC Madrid V3</h1>
          <p>
            ${
              state.mode === 'practice' && practiceMeta
                ? `Práctica • ${escapeHtml(practiceMeta.title)} • ${state.currentIndex + 1} / ${state.examQuestions.length}`
                : `Examen completo • ${state.currentIndex + 1} / ${state.examQuestions.length}`
            }
          </p>
        </div>

        <div class="topbar-actions">
          <button id="new-exam-btn" class="secondary-btn">Nuevo inicio</button>
        </div>
      </header>

      <div class="progress-wrap">
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width:${progressPercent}%"></div>
        </div>
      </div>

      ${
        state.mode === 'practice' && practiceMeta
          ? `
            <section class="practice-info-box">
              <div class="practice-info-head">
                <span class="module-badge">${escapeHtml(practiceMeta.title)}</span>
                <span class="question-number">${practiceMeta.take} preguntas</span>
              </div>
              <div class="practice-info-es">${escapeHtml(practiceMeta.description)}</div>
              <div class="practice-info-pass">Para aprobar: ${practiceMeta.pass} respuestas correctas</div>
            </section>
          `
          : ''
      }

      <article class="question-card single-question">
        <div class="question-meta">
          <span class="module-badge">${escapeHtml(moduleTitles[question.module])}</span>
          <span class="question-number">#${state.currentIndex + 1}</span>
        </div>

        <h2 class="question-title">${escapeHtml(question.q)}</h2>

        <div class="answers-list">
          ${answersHtml}
        </div>
      </article>

      <div class="nav-actions">
        <button id="prev-btn" class="secondary-btn" ${state.currentIndex === 0 ? 'disabled' : ''}>
          Anterior
        </button>

        ${
          isLastQuestion
            ? `<button id="finish-btn" class="primary-btn">Finalizar test</button>`
            : `<button id="next-btn" class="primary-btn">Siguiente</button>`
        }
      </div>

      ${renderLiveStats()}
    </div>
  `;

  document.querySelectorAll(`input[name="${CSS.escape(question.id)}"]`).forEach((input) => {
    input.addEventListener('change', (event) => {
      state.answers[question.id] = Number(event.target.value);
      saveState();
      renderExamView();
    });
  });

  document.getElementById('prev-btn')?.addEventListener('click', () => {
    if (state.currentIndex > 0) {
      state.currentIndex -= 1;
      saveState();
      renderExamView();
    }
  });

  document.getElementById('next-btn')?.addEventListener('click', () => {
    lockCurrentAnswer();

    if (state.currentIndex < state.examQuestions.length - 1) {
      state.currentIndex += 1;
      saveState();
      renderExamView();
    }
  });

  document.getElementById('finish-btn')?.addEventListener('click', () => {
    lockCurrentAnswer();

    const firstUnanswered = getFirstUnansweredIndex();

    if (firstUnanswered !== -1) {
      state.currentIndex = firstUnanswered;
      saveState();
      alert(`Todavía hay preguntas sin responder. He saltado a la primera pregunta pendiente (#${firstUnanswered + 1}).`);
      renderExamView();
      return;
    }

    state.submitted = true;
    state.resultsFilter = 'wrong';
    saveState();

    if (state.mode === 'practice' && state.practiceModule) {
      const passed = getPracticePassed();
      trackEvent('practice_complete', {
        ...buildAnalyticsPayload({
          score: countCorrectOverall(),
          total_questions: state.examQuestions.length,
          passed: passed ? 'true' : 'false',
        }),
      });
    } else {
      const passed = getFullExamPassed();
      trackEvent('quiz_complete', {
        ...buildAnalyticsPayload({
          score: countCorrectOverall(),
          total_questions: state.examQuestions.length,
          passed: passed ? 'true' : 'false',
        }),
      });
    }

    renderResultsView();
  });

  document.getElementById('new-exam-btn')?.addEventListener('click', () => {
    clearState();
    renderHome();
  });
}

function createResultAnswerLine(answer, index, question, userAnswer) {
  const isCorrect = index === question.correctIndex;
  const isChosen = index === userAnswer;

  let className = 'result-answer';
  if (isCorrect) className += ' correct';
  if (isChosen && !isCorrect) className += ' wrong';
  if (isChosen) className += ' chosen';

  return `
    <li class="${className}">
      <div>
        <strong>${String.fromCharCode(65 + index)}.</strong>
        ${escapeHtml(answer.original)}
      </div>
      <div class="result-flags">
        ${isChosen ? '<span class="flag chosen">Tu respuesta</span>' : ''}
        ${isCorrect ? '<span class="flag correct">Respuesta correcta</span>' : ''}
      </div>
    </li>
  `;
}

function createResultCard(question, indexInModule) {
  const userAnswer = state.lockedAnswers[question.id];
  const isCorrect = userAnswer === question.correctIndex;

  const answersHtml = question.answers
    .map((answer, idx) => createResultAnswerLine(answer, idx, question, userAnswer))
    .join('');

  return `
    <article class="result-card ${isCorrect ? 'ok' : 'bad'}">
      <div class="result-card-head">
        <span class="question-number">#${indexInModule}</span>
        <span class="result-status ${isCorrect ? 'ok' : 'bad'}">
          ${isCorrect ? 'Correcta' : 'Incorrecta'}
        </span>
      </div>

      <div class="result-question-original">${escapeHtml(question.q)}</div>

      <ol class="result-answers">
        ${answersHtml}
      </ol>
    </article>
  `;
}

function renderPracticeResultsView() {
  const mod = MODULE_META[state.practiceModule];
  const correct = countCorrectOverall();
  const passed = correct >= mod.pass;
  const filteredQuestions = getFilteredQuestions(state.examQuestions);

  const detailsHtml = filteredQuestions.length
    ? filteredQuestions.map((q, idx) => createResultCard(q, idx + 1)).join('')
    : `
      <article class="result-card ok">
        <div class="result-card-head">
          <span class="question-number">0</span>
          <span class="result-status ok">Sin resultados</span>
        </div>
        <div class="result-question-original">
          ${
            state.resultsFilter === 'wrong'
              ? 'No hay respuestas incorrectas en este módulo.'
              : 'No hay preguntas para mostrar.'
          }
        </div>
      </article>
    `;

  app.innerHTML = `
    <div class="page">
      <header class="topbar">
        <div>
          <h1>Resultado del módulo</h1>
          <p class="final-status ${passed ? 'pass' : 'fail'}">
            ${passed ? 'Has aprobado' : 'No has aprobado'}
          </p>
        </div>

        <div class="topbar-actions">
          <button id="filter-wrong-btn" class="${state.resultsFilter === 'wrong' ? 'primary-btn' : 'secondary-btn'}">Solo incorrectas</button>
          <button id="filter-all-btn" class="${state.resultsFilter === 'all' ? 'primary-btn' : 'secondary-btn'}">Todas las respuestas</button>
          <button id="retry-practice-btn" class="secondary-btn">Nueva práctica</button>
          <button id="review-btn" class="primary-btn">Volver al test</button>
        </div>
      </header>

      <section class="summary-grid">
        <div class="summary-card ${passed ? 'pass' : 'fail'}">
          <h3>${escapeHtml(mod.title)}</h3>
          <p>${correct} / ${mod.take}</p>
          <p>Para aprobar: ${mod.pass}</p>
          <strong>${passed ? 'Has aprobado' : 'No has aprobado'}</strong>
        </div>
      </section>

      <section class="module-section">
        <div class="module-header">
          <h2>${escapeHtml(mod.title)}</h2>
          <p>${escapeHtml(mod.description)}</p>
        </div>
        <div class="result-grid">
          ${detailsHtml}
        </div>
      </section>
    </div>
  `;

  document.getElementById('filter-wrong-btn')?.addEventListener('click', () => {
    state.resultsFilter = 'wrong';
    saveState();
    renderPracticeResultsView();
  });

  document.getElementById('filter-all-btn')?.addEventListener('click', () => {
    state.resultsFilter = 'all';
    saveState();
    renderPracticeResultsView();
  });

  document.getElementById('retry-practice-btn')?.addEventListener('click', () => {
    clearState();
    renderPracticeModuleSelect();
  });

  document.getElementById('review-btn')?.addEventListener('click', () => {
    state.submitted = false;
    saveState();
    renderExamView();
  });
}

function renderFullExamResultsView() {
  const grouped = groupExamByModule();

  const moduleSummaries = moduleOrder.map((moduleKey) => {
    const allQuestions = grouped[moduleKey];
    const filteredQuestions = getFilteredQuestions(allQuestions);
    const correct = countCorrectForModule(moduleKey);
    const take = RULES[moduleKey].take;
    const pass = RULES[moduleKey].pass;
    const passed = correct >= pass;

    return {
      moduleKey,
      correct,
      take,
      pass,
      passed,
      questions: filteredQuestions,
    };
  });

  const overallPassed = moduleSummaries.every((m) => m.passed);

  const summaryHtml = moduleSummaries
    .map(
      (m) => `
        <div class="summary-card ${m.passed ? 'pass' : 'fail'}">
          <h3>${escapeHtml(moduleTitles[m.moduleKey])}</h3>
          <p>${m.correct} / ${m.take}</p>
          <p>Para aprobar: ${m.pass}</p>
          <strong>${m.passed ? 'Has aprobado' : 'No has aprobado'}</strong>
        </div>
      `
    )
    .join('');

  const detailsHtml = moduleSummaries
    .map((moduleSummary) => {
      const resultCards = moduleSummary.questions.length
        ? moduleSummary.questions.map((q, idx) => createResultCard(q, idx + 1)).join('')
        : `
          <article class="result-card ok">
            <div class="result-card-head">
              <span class="question-number">0</span>
              <span class="result-status ok">Sin resultados</span>
            </div>
            <div class="result-question-original">
              ${
                state.resultsFilter === 'wrong'
                  ? 'No hay respuestas incorrectas en este módulo.'
                  : 'No hay preguntas para mostrar.'
              }
            </div>
          </article>
        `;

      return `
        <section class="module-section">
          <div class="module-header">
            <h2>${escapeHtml(moduleTitles[moduleSummary.moduleKey])}</h2>
            <p>
              ${moduleSummary.correct} / ${moduleSummary.take}
              • para aprobar: ${moduleSummary.pass}
              • <strong>${moduleSummary.passed ? 'Has aprobado' : 'No has aprobado'}</strong>
            </p>
          </div>
          <div class="result-grid">
            ${resultCards}
          </div>
        </section>
      `;
    })
    .join('');

  app.innerHTML = `
    <div class="page">
      <header class="topbar">
        <div>
          <h1>Resultados</h1>
          <p class="final-status ${overallPassed ? 'pass' : 'fail'}">
            ${overallPassed ? 'Resultado final: Has aprobado' : 'Resultado final: No has aprobado'}
          </p>
        </div>
        <div class="topbar-actions">
          <button id="filter-wrong-btn" class="${state.resultsFilter === 'wrong' ? 'primary-btn' : 'secondary-btn'}">Solo incorrectas</button>
          <button id="filter-all-btn" class="${state.resultsFilter === 'all' ? 'primary-btn' : 'secondary-btn'}">Todas las respuestas</button>
          <button id="retry-btn" class="secondary-btn">Nuevo test</button>
          <button id="review-btn" class="primary-btn">Volver al test</button>
        </div>
      </header>

      <section class="summary-grid">
        ${summaryHtml}
      </section>

      ${detailsHtml}
    </div>
  `;

  document.getElementById('filter-wrong-btn')?.addEventListener('click', () => {
    state.resultsFilter = 'wrong';
    saveState();
    renderFullExamResultsView();
  });

  document.getElementById('filter-all-btn')?.addEventListener('click', () => {
    state.resultsFilter = 'all';
    saveState();
    renderFullExamResultsView();
  });

  document.getElementById('retry-btn')?.addEventListener('click', () => {
    clearState();
    renderHome();
  });

  document.getElementById('review-btn')?.addEventListener('click', () => {
    state.submitted = false;
    saveState();
    renderExamView();
  });
}

function renderResultsView() {
  if (state.mode === 'practice' && state.practiceModule) {
    renderPracticeResultsView();
    return;
  }

  renderFullExamResultsView();
}

function init() {
  try {
    const restored = loadState();

    if (!restored || state.mode === 'menu' || state.examQuestions.length === 0) {
      renderHome();
      return;
    }

    if (state.submitted) {
      renderResultsView();
    } else {
      renderExamView();
    }
  } catch (error) {
    app.innerHTML = `
      <div class="page">
        <h1>Error</h1>
        <pre>${escapeHtml(error.message)}</pre>
      </div>
    `;
    console.error(error);
  }
}

init();