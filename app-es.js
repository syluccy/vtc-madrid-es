import { RULES, questionBank } from './questions.js';

const app = document.getElementById('app');
const DEFAULT_LANGUAGE = 'es';
const APP_VERSION = 'v2026.05.11';
const AUTHOR_LINK = 'https://www.linkedin.com/in/743bab17/?locale=es-ES';

const QUESTION_TRANSLATIONS = {};

const QUESTION_TRANSLATION_LOADERS = {
  hu: () => import('./translations/hu.js'),
};

const LANGUAGES = {
  es: {
    code: 'es',
    label: 'Español',
    shortLabel: 'ES',
  },
  hu: {
    code: 'hu',
    label: 'Magyar',
    shortLabel: 'HU',
  },
};

const TEXT = {
  es: {
    pageTitle: 'Simulador examen VTC Madrid',
    homeSubtitle: 'Practica por módulos o inicia un test completo.',
    homeTitle: '¿Cómo quieres practicar?',
    homeIntro: 'Puedes empezar un examen completo o practicar un único módulo por separado.',
    languageTitle: 'Idioma',
    languageHint: 'Puedes cambiar el idioma en la esquina superior derecha.',
    languageHelpTitle: 'Ayuda de idioma',
    languageHelpBody: 'Las traducciones están pensadas como apoyo al aprendizaje, no como sustituto del español del examen. En los tests verás primero el contenido original en español y, si eliges otro idioma, podrás abrir la traducción como ayuda.',
    startFullExam: 'Iniciar examen completo',
    startPracticeMode: 'Práctica por módulos',
    practiceByModules: 'Práctica por módulos',
    practiceByModulesIntro: 'Elige un módulo para practicar de forma específica.',
    back: 'Volver',
    questions: 'preguntas',
    passLabel: 'Para aprobar',
    practiceModule: 'Practicar módulo',
    correctSoFar: 'Respuestas correctas hasta ahora',
    fullExam: 'Examen completo',
    practice: 'Práctica',
    newStart: 'Nuevo inicio',
    previous: 'Anterior',
    next: 'Siguiente',
    finishTest: 'Finalizar test',
    pendingAlert: 'Todavía hay preguntas sin responder. He saltado a la primera pregunta pendiente',
    correct: 'Correcta',
    incorrect: 'Incorrecta',
    chosenAnswer: 'Tu respuesta',
    correctAnswer: 'Respuesta correcta',
    translationLabel: 'Ver traducción',
    moduleResult: 'Resultado del módulo',
    results: 'Resultados',
    passed: 'Has aprobado',
    failed: 'No has aprobado',
    finalPassed: 'Resultado final: Has aprobado',
    finalFailed: 'Resultado final: No has aprobado',
    onlyWrong: 'Solo incorrectas',
    allAnswers: 'Todas las respuestas',
    newPractice: 'Nueva práctica',
    newTest: 'Nuevo test',
    reviewTest: 'Volver al test',
    noResults: 'Sin resultados',
    noWrongInModule: 'No hay respuestas incorrectas en este módulo.',
    noQuestionsToShow: 'No hay preguntas para mostrar.',
    unknownModule: 'Módulo desconocido.',
    notEnoughQuestionsPrefix: 'El banco de preguntas de',
    notEnoughQuestionsMiddle: 'no contiene suficientes preguntas. Hay',
    notEnoughQuestionsSuffix: 'se necesitan',
    notEnoughInFullPrefix: 'No hay suficientes preguntas en',
    thereAre: 'Hay',
    needed: 'se necesitan',
    error: 'Error',
  },
  hu: {
    pageTitle: 'VTC Madrid vizsgagyakorló',
    homeSubtitle: 'Gyakorolj modulonként, vagy indíts teljes tesztet.',
    homeTitle: 'Hogyan szeretnél gyakorolni?',
    homeIntro: 'Elkezdhetsz egy teljes tesztet, vagy külön is gyakorolhatod az egyes modulokat.',
    languageTitle: 'Nyelv',
    languageHint: 'A nyelvet a jobb felső sarokban tudod módosítani.',
    languageHelpTitle: 'Nyelvi segítség',
    languageHelpBody: 'A fordítások célja a tanulás támogatása, nem a spanyol vizsgaszöveg kiváltása. A tesztekben először az eredeti spanyol tartalom látszik, más nyelvet választva pedig lenyitható segítségként nézheted meg a fordítást.',
    startFullExam: 'Teljes teszt indítása',
    startPracticeMode: 'Modulok gyakorlása',
    practiceByModules: 'Modulok gyakorlása',
    practiceByModulesIntro: 'Válassz modult, ha célzottan szeretnél gyakorolni.',
    back: 'Vissza',
    questions: 'kérdés',
    passLabel: 'Sikeres teljesítéshez',
    practiceModule: 'Modul gyakorlása',
    correctSoFar: 'Eddigi helyes válaszok',
    fullExam: 'Teljes teszt',
    practice: 'Gyakorlás',
    newStart: 'Új kezdés',
    previous: 'Előző',
    next: 'Következő',
    finishTest: 'Teszt befejezése',
    pendingAlert: 'Még vannak megválaszolatlan kérdések. Az első hiányzó kérdésre ugrottam',
    correct: 'Helyes',
    incorrect: 'Helytelen',
    chosenAnswer: 'A válaszod',
    correctAnswer: 'Helyes válasz',
    translationLabel: 'Fordítás megtekintése',
    moduleResult: 'Modul eredménye',
    results: 'Eredmények',
    passed: 'Sikerült',
    failed: 'Nem sikerült',
    finalPassed: 'Végeredmény: sikerült',
    finalFailed: 'Végeredmény: nem sikerült',
    onlyWrong: 'Csak a hibásak',
    allAnswers: 'Összes válasz',
    newPractice: 'Új gyakorlás',
    newTest: 'Új teszt',
    reviewTest: 'Vissza a teszthez',
    noResults: 'Nincs találat',
    noWrongInModule: 'Ebben a modulban nincs hibás válasz.',
    noQuestionsToShow: 'Nincs megjeleníthető kérdés.',
    unknownModule: 'Ismeretlen modul.',
    notEnoughQuestionsPrefix: 'A kérdésbank ebben a modulban:',
    notEnoughQuestionsMiddle: 'nem tartalmaz elég kérdést. Van',
    notEnoughQuestionsSuffix: 'szükséges',
    notEnoughInFullPrefix: 'Nincs elég kérdés ebben a modulban:',
    thereAre: 'Van',
    needed: 'szükséges',
    error: 'Hiba',
  },
};

const MODULE_META_BY_LANGUAGE = {
  es: {
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
  },
  hu: {
    I: {
      key: 'I',
      title: 'I. modul',
      description: 'A spanyol nyelv ismerete; nyelvtan és szókincs.',
      take: 12,
      pass: 6,
    },
    II: {
      key: 'II',
      title: 'II. modul',
      description: 'Földrajzi és tájékozódási ismeretek; navigációs rendszerek, útvonalak és fontos célpontok.',
      take: 18,
      pass: 9,
    },
    III: {
      key: 'III',
      title: 'III. modul',
      description: 'Akadálymentesség és közszolgáltatás; ügyfélkezelés, fogyatékkal élő utasok, kiskorúak és háziállatok.',
      take: 18,
      pass: 9,
    },
    IV: {
      key: 'IV',
      title: 'IV. modul',
      description: 'A személyszállítási tevékenységre vonatkozó jogi keretek ismerete.',
      take: 12,
      pass: 6,
    },
  },
};

const moduleOrder = ['I', 'II', 'III', 'IV'];

let currentLanguage = resolveLanguage();
let MODULE_META = MODULE_META_BY_LANGUAGE[currentLanguage] ?? MODULE_META_BY_LANGUAGE[DEFAULT_LANGUAGE];
let moduleTitles = getModuleTitles(MODULE_META);

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

function resolveLanguage() {
  const params = new URLSearchParams(window.location.search);
  const lang = params.get('lang')?.toLowerCase();
  return LANGUAGES[lang] ? lang : DEFAULT_LANGUAGE;
}

function getModuleTitles(moduleMeta) {
  return Object.fromEntries(
    Object.entries(moduleMeta).map(([key, value]) => [key, value.title])
  );
}

function t(key) {
  return TEXT[currentLanguage]?.[key] ?? TEXT[DEFAULT_LANGUAGE]?.[key] ?? key;
}

function getStorageKey() {
  return `vtc_exam_state_${currentLanguage}`;
}

function getQuestionText(question) {
  if (currentLanguage === DEFAULT_LANGUAGE) return question.q;
  return QUESTION_TRANSLATIONS[currentLanguage]?.[question.id]?.q ?? question[currentLanguage] ?? question.q;
}

function hasActiveTranslation() {
  return currentLanguage !== DEFAULT_LANGUAGE;
}

function getOriginalAnswerText(answer) {
  if (typeof answer === 'string') return answer;
  return answer?.original ?? '';
}

function getAnswerText(question, index) {
  const originalAnswer = question.answers[index];
  const originalText = getOriginalAnswerText(originalAnswer);
  if (currentLanguage === DEFAULT_LANGUAGE) return originalText;
  return QUESTION_TRANSLATIONS[currentLanguage]?.[question.id]?.answers?.[index] ?? originalAnswer?.[currentLanguage] ?? originalText;
}

function renderTranslationDetails(text, originalText = '') {
  if (!hasActiveTranslation() || !text || text === originalText) return '';

  return `
    <details class="translation-details">
      <summary>${escapeHtml(t('translationLabel'))}</summary>
      <div>${escapeHtml(text)}</div>
    </details>
  `;
}

async function ensureQuestionTranslations(language) {
  if (language === DEFAULT_LANGUAGE || QUESTION_TRANSLATIONS[language]) return;

  const loader = QUESTION_TRANSLATION_LOADERS[language];
  if (!loader) return;

  const module = await loader();
  QUESTION_TRANSLATIONS[language] = module.questionTranslations ?? {};
}

function syncDocumentLanguage() {
  document.documentElement.lang = currentLanguage;
  document.title = currentLanguage === 'hu'
    ? 'VTC Madrid vizsgagyakorló'
    : 'Simulador examen VTC Madrid – Test gratis con preguntas reales';
}

function renderLanguageSwitcher() {
  return `
    <label class="language-switcher">
      <select class="language-select" aria-label="${escapeHtml(t('languageTitle'))}">
        ${Object.values(LANGUAGES).map((language) => `
          <option value="${language.code}" ${currentLanguage === language.code ? 'selected' : ''}>
            ${escapeHtml(language.shortLabel)}
          </option>
        `).join('')}
      </select>
    </label>
  `;
}

function renderAppFooter() {
  return `
    <footer class="app-footer" aria-label="App version">
      ${escapeHtml(APP_VERSION)}
      <span aria-hidden="true">·</span>
      <a href="${AUTHOR_LINK}" target="_blank" rel="noopener noreferrer">@szucskrisztian</a>
    </footer>
  `;
}

function attachLanguageSwitcher() {
  document.querySelectorAll('.language-select').forEach((select) => {
    select.addEventListener('change', async () => {
      const nextLanguage = select.value;
      if (!LANGUAGES[nextLanguage] || nextLanguage === currentLanguage) return;

      trackEvent('language_change', {
        from_language: currentLanguage,
        to_language: nextLanguage,
        mode: state.mode,
        module: state.mode === 'practice' && state.practiceModule ? state.practiceModule : 'all',
      });

      const url = new URL(window.location.href);
      url.searchParams.set('lang', nextLanguage);
      window.history.replaceState({}, '', url);

      currentLanguage = nextLanguage;
      MODULE_META = MODULE_META_BY_LANGUAGE[currentLanguage] ?? MODULE_META_BY_LANGUAGE[DEFAULT_LANGUAGE];
      moduleTitles = getModuleTitles(MODULE_META);
      await ensureQuestionTranslations(currentLanguage);
      syncDocumentLanguage();

      const restored = loadState();
      if (!restored || state.mode === 'menu' || state.examQuestions.length === 0) {
        state.mode = 'menu';
        state.practiceModule = null;
        state.examQuestions = [];
        state.answers = {};
        state.lockedAnswers = {};
        state.submitted = false;
        state.currentIndex = 0;
        state.resultsFilter = 'wrong';
        renderHome();
        return;
      }

      if (state.submitted) {
        renderResultsView();
      } else {
        renderExamView();
      }
    });
  });
}

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
    window.gtag('event', eventName, {
      language: currentLanguage,
      language_label: LANGUAGES[currentLanguage]?.label ?? currentLanguage,
      app_version: APP_VERSION,
      ...params,
    });
  }
}

function buildAnalyticsPayload(extra = {}) {
  return {
    mode: state.mode === 'practice' ? 'practice' : 'exam',
    module: state.mode === 'practice' && state.practiceModule ? state.practiceModule : 'all',
    ...extra,
  };
}

function getAnsweredCount() {
  return Object.keys(state.answers).length;
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
  localStorage.setItem(getStorageKey(), JSON.stringify(snapshot));
}

function loadState() {
  const raw = localStorage.getItem(getStorageKey());
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
  localStorage.removeItem(getStorageKey());
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
        `${t('notEnoughInFullPrefix')} ${moduleTitles[moduleKey]}. ${t('thereAre')} ${pool.length}, ${t('needed')} ${needed}.`
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
    throw new Error(t('unknownModule'));
  }

  if (pool.length < config.take) {
    throw new Error(
      `${t('notEnoughQuestionsPrefix')} ${config.title} ${t('notEnoughQuestionsMiddle')} ${pool.length}, ${t('notEnoughQuestionsSuffix')} ${config.take}.`
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
            <div class="module-mini-pass">${escapeHtml(t('passLabel'))}: ${mod.pass}</div>
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
          <div class="live-stat-label">${escapeHtml(t('correctSoFar'))}</div>
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
              <div class="module-mini-pass">${escapeHtml(t('passLabel'))}: ${rule.pass}</div>
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
        <div class="topbar-title">
          <h1>${escapeHtml(t('pageTitle'))}</h1>
          <p>${escapeHtml(t('homeSubtitle'))}</p>
        </div>

        <div class="topbar-actions">
          ${renderLanguageSwitcher()}
        </div>
      </header>

      <section class="welcome-card">
        <h2>${escapeHtml(t('homeTitle'))}</h2>
        <p>${escapeHtml(t('homeIntro'))}</p>
        <p class="language-hint">${escapeHtml(t('languageHint'))}</p>
        <div class="language-help">
          <h3>${escapeHtml(t('languageHelpTitle'))}</h3>
          <p>${escapeHtml(t('languageHelpBody'))}</p>
        </div>

        <div class="mode-select">
          <button id="start-full-exam" class="primary-btn">${escapeHtml(t('startFullExam'))}</button>
          <button id="start-practice-mode" class="secondary-btn">${escapeHtml(t('startPracticeMode'))}</button>
        </div>
      </section>

      ${renderAppFooter()}
    </div>
  `;

  attachLanguageSwitcher();

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
    trackEvent('practice_menu_open', {
      mode: 'practice',
      module: 'all',
    });
    renderPracticeModuleSelect();
  });
}

function renderPracticeModuleSelect() {
  app.innerHTML = `
    <div class="page">
      <header class="topbar">
        <div>
          <h1>${escapeHtml(t('practiceByModules'))}</h1>
          <p>${escapeHtml(t('practiceByModulesIntro'))}</p>
        </div>

        <div class="topbar-actions">
          ${renderLanguageSwitcher()}
          <button id="back-home-btn" class="secondary-btn">${escapeHtml(t('back'))}</button>
        </div>
      </header>

      <section class="module-grid">
        ${moduleOrder.map((moduleKey) => {
          const mod = MODULE_META[moduleKey];
          return `
            <article class="module-card" data-module="${mod.key}">
              <div class="module-card-head">
                <span class="module-badge">${escapeHtml(mod.title)}</span>
                <span class="question-number">${mod.take} ${escapeHtml(t('questions'))}</span>
              </div>

              <h2>${escapeHtml(mod.title)}</h2>
              <p class="module-desc-es">${escapeHtml(mod.description)}</p>

              <div class="module-card-footer">
                <span>${escapeHtml(t('passLabel'))}: ${mod.pass}</span>
                <button class="primary-btn module-start-btn" data-module="${mod.key}">${escapeHtml(t('practiceModule'))}</button>
              </div>
            </article>
          `;
        }).join('')}
      </section>

      ${renderAppFooter()}
    </div>
  `;

  attachLanguageSwitcher();

  document.getElementById('back-home-btn')?.addEventListener('click', () => {
    trackEvent('home_return', {
      source: 'practice_menu',
      mode: 'menu',
      module: 'all',
    });
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
            ${escapeHtml(getOriginalAnswerText(answer))}
          </span>
        </label>
      `;
    })
    .join('');

  app.innerHTML = `
    <div class="page">
      <header class="topbar">
        <div>
          <h1>${escapeHtml(t('pageTitle'))}</h1>
          <p>
            ${
              state.mode === 'practice' && practiceMeta
                ? `${escapeHtml(t('practice'))} • ${escapeHtml(practiceMeta.title)} • ${state.currentIndex + 1} / ${state.examQuestions.length}`
                : `${escapeHtml(t('fullExam'))} • ${state.currentIndex + 1} / ${state.examQuestions.length}`
            }
          </p>
        </div>

        <div class="topbar-actions">
          ${renderLanguageSwitcher()}
          <button id="new-exam-btn" class="secondary-btn">${escapeHtml(t('newStart'))}</button>
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
            <section class="practice-overview">
              <div class="practice-info-box">
                <div class="practice-info-head">
                  <span class="module-badge">${escapeHtml(practiceMeta.title)}</span>
                  <span class="question-number">${practiceMeta.take} ${escapeHtml(t('questions'))}</span>
                </div>
                <div class="practice-info-es">${escapeHtml(practiceMeta.description)}</div>
                <div class="practice-info-pass">${escapeHtml(t('passLabel'))}: ${practiceMeta.pass}</div>
              </div>
              ${renderLiveStats()}
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
        ${renderTranslationDetails(getQuestionText(question), question.q)}

        <div class="answers-list">
          ${answersHtml}
        </div>
      </article>

      <div class="nav-actions">
        <button id="prev-btn" class="secondary-btn" ${state.currentIndex === 0 ? 'disabled' : ''}>
          ${escapeHtml(t('previous'))}
        </button>

        ${
          isLastQuestion
            ? `<button id="finish-btn" class="primary-btn">${escapeHtml(t('finishTest'))}</button>`
            : `<button id="next-btn" class="primary-btn">${escapeHtml(t('next'))}</button>`
        }
      </div>

      ${state.mode === 'practice' ? '' : renderLiveStats()}

      ${renderAppFooter()}
    </div>
  `;

  attachLanguageSwitcher();

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
      alert(`${t('pendingAlert')} (#${firstUnanswered + 1}).`);
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
    trackEvent('new_start', {
      ...buildAnalyticsPayload({
        source: state.mode,
        answered_questions: getAnsweredCount(),
        total_questions: state.examQuestions.length,
      }),
    });
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
        ${escapeHtml(getOriginalAnswerText(answer))}
        ${renderTranslationDetails(getAnswerText(question, index), getOriginalAnswerText(answer))}
      </div>
      <div class="result-flags">
        ${isChosen ? `<span class="flag chosen">${escapeHtml(t('chosenAnswer'))}</span>` : ''}
        ${isCorrect ? `<span class="flag correct">${escapeHtml(t('correctAnswer'))}</span>` : ''}
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
          ${isCorrect ? escapeHtml(t('correct')) : escapeHtml(t('incorrect'))}
        </span>
      </div>

      <div class="result-question-original">${escapeHtml(question.q)}</div>
      ${renderTranslationDetails(getQuestionText(question), question.q)}

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
          <span class="result-status ok">${escapeHtml(t('noResults'))}</span>
        </div>
        <div class="result-question-original">
          ${
            state.resultsFilter === 'wrong'
              ? escapeHtml(t('noWrongInModule'))
              : escapeHtml(t('noQuestionsToShow'))
          }
        </div>
      </article>
    `;

  app.innerHTML = `
    <div class="page">
      <header class="topbar">
        <div>
          <h1>${escapeHtml(t('moduleResult'))}</h1>
          <p class="final-status ${passed ? 'pass' : 'fail'}">
            ${passed ? escapeHtml(t('passed')) : escapeHtml(t('failed'))}
          </p>
        </div>

        <div class="topbar-actions">
          ${renderLanguageSwitcher()}
          <button id="filter-wrong-btn" class="${state.resultsFilter === 'wrong' ? 'primary-btn' : 'secondary-btn'}">${escapeHtml(t('onlyWrong'))}</button>
          <button id="filter-all-btn" class="${state.resultsFilter === 'all' ? 'primary-btn' : 'secondary-btn'}">${escapeHtml(t('allAnswers'))}</button>
          <button id="retry-practice-btn" class="secondary-btn">${escapeHtml(t('newPractice'))}</button>
          <button id="review-btn" class="primary-btn">${escapeHtml(t('reviewTest'))}</button>
        </div>
      </header>

      <section class="summary-grid">
        <div class="summary-card ${passed ? 'pass' : 'fail'}">
          <h3>${escapeHtml(mod.title)}</h3>
          <p>${correct} / ${mod.take}</p>
          <p>${escapeHtml(t('passLabel'))}: ${mod.pass}</p>
          <strong>${passed ? escapeHtml(t('passed')) : escapeHtml(t('failed'))}</strong>
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

      ${renderAppFooter()}
    </div>
  `;

  attachLanguageSwitcher();

  document.getElementById('filter-wrong-btn')?.addEventListener('click', () => {
    trackEvent('results_filter_change', {
      ...buildAnalyticsPayload({
        results_filter: 'wrong',
        source: 'practice_results',
      }),
    });
    state.resultsFilter = 'wrong';
    saveState();
    renderPracticeResultsView();
  });

  document.getElementById('filter-all-btn')?.addEventListener('click', () => {
    trackEvent('results_filter_change', {
      ...buildAnalyticsPayload({
        results_filter: 'all',
        source: 'practice_results',
      }),
    });
    state.resultsFilter = 'all';
    saveState();
    renderPracticeResultsView();
  });

  document.getElementById('retry-practice-btn')?.addEventListener('click', () => {
    trackEvent('new_start', {
      ...buildAnalyticsPayload({
        source: 'practice_results',
        score: countCorrectOverall(),
        total_questions: state.examQuestions.length,
      }),
    });
    clearState();
    renderPracticeModuleSelect();
  });

  document.getElementById('review-btn')?.addEventListener('click', () => {
    trackEvent('review_test', {
      ...buildAnalyticsPayload({
        source: 'practice_results',
        score: countCorrectOverall(),
        total_questions: state.examQuestions.length,
      }),
    });
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
          <p>${escapeHtml(t('passLabel'))}: ${m.pass}</p>
          <strong>${m.passed ? escapeHtml(t('passed')) : escapeHtml(t('failed'))}</strong>
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
              <span class="result-status ok">${escapeHtml(t('noResults'))}</span>
            </div>
            <div class="result-question-original">
              ${
                state.resultsFilter === 'wrong'
                  ? escapeHtml(t('noWrongInModule'))
                  : escapeHtml(t('noQuestionsToShow'))
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
              • ${escapeHtml(t('passLabel'))}: ${moduleSummary.pass}
              • <strong>${moduleSummary.passed ? escapeHtml(t('passed')) : escapeHtml(t('failed'))}</strong>
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
          <h1>${escapeHtml(t('results'))}</h1>
          <p class="final-status ${overallPassed ? 'pass' : 'fail'}">
            ${overallPassed ? escapeHtml(t('finalPassed')) : escapeHtml(t('finalFailed'))}
          </p>
        </div>
        <div class="topbar-actions">
          ${renderLanguageSwitcher()}
          <button id="filter-wrong-btn" class="${state.resultsFilter === 'wrong' ? 'primary-btn' : 'secondary-btn'}">${escapeHtml(t('onlyWrong'))}</button>
          <button id="filter-all-btn" class="${state.resultsFilter === 'all' ? 'primary-btn' : 'secondary-btn'}">${escapeHtml(t('allAnswers'))}</button>
          <button id="retry-btn" class="secondary-btn">${escapeHtml(t('newTest'))}</button>
          <button id="review-btn" class="primary-btn">${escapeHtml(t('reviewTest'))}</button>
        </div>
      </header>

      <section class="summary-grid">
        ${summaryHtml}
      </section>

      ${detailsHtml}

      ${renderAppFooter()}
    </div>
  `;

  attachLanguageSwitcher();

  document.getElementById('filter-wrong-btn')?.addEventListener('click', () => {
    trackEvent('results_filter_change', {
      ...buildAnalyticsPayload({
        results_filter: 'wrong',
        source: 'full_exam_results',
      }),
    });
    state.resultsFilter = 'wrong';
    saveState();
    renderFullExamResultsView();
  });

  document.getElementById('filter-all-btn')?.addEventListener('click', () => {
    trackEvent('results_filter_change', {
      ...buildAnalyticsPayload({
        results_filter: 'all',
        source: 'full_exam_results',
      }),
    });
    state.resultsFilter = 'all';
    saveState();
    renderFullExamResultsView();
  });

  document.getElementById('retry-btn')?.addEventListener('click', () => {
    trackEvent('new_start', {
      ...buildAnalyticsPayload({
        source: 'full_exam_results',
        score: countCorrectOverall(),
        total_questions: state.examQuestions.length,
      }),
    });
    clearState();
    renderHome();
  });

  document.getElementById('review-btn')?.addEventListener('click', () => {
    trackEvent('review_test', {
      ...buildAnalyticsPayload({
        source: 'full_exam_results',
        score: countCorrectOverall(),
        total_questions: state.examQuestions.length,
      }),
    });
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

async function init() {
  try {
    await ensureQuestionTranslations(currentLanguage);
    syncDocumentLanguage();
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
        <h1>${escapeHtml(t('error'))}</h1>
        <pre>${escapeHtml(error.message)}</pre>
      </div>
    `;
    console.error(error);
  }
}

init();
