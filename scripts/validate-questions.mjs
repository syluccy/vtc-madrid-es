import { questionBank } from '../questions.js';
import { questionTranslations as huTranslations } from '../translations/hu.js';

const VALID_MODULES = new Set(['I', 'II', 'III', 'IV']);

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateQuestion(question, index, seenIds) {
  const label = question?.id ? `${question.id}` : `question at index ${index}`;
  const errors = [];

  if (!isNonEmptyString(question?.id)) {
    errors.push(`${label}: missing id`);
  } else if (seenIds.has(question.id)) {
    errors.push(`${label}: duplicate id`);
  } else {
    seenIds.add(question.id);
  }

  if (!isNonEmptyString(question?.source)) {
    errors.push(`${label}: missing source`);
  }

  if (!VALID_MODULES.has(question?.module)) {
    errors.push(`${label}: module must be one of I, II, III, IV`);
  }

  if (!isNonEmptyString(question?.q)) {
    errors.push(`${label}: missing Spanish question text in q`);
  }

  if (!Array.isArray(question?.answers) || question.answers.length !== 4) {
    errors.push(`${label}: answers must contain exactly 4 options`);
    return errors;
  }

  question.answers.forEach((answer, answerIndex) => {
    if (!isNonEmptyString(answer)) {
      errors.push(`${label}: answer ${answerIndex} must be a non-empty string`);
    }
  });

  if (
    !Number.isInteger(question?.correctIndex) ||
    question.correctIndex < 0 ||
    question.correctIndex >= question.answers.length
  ) {
    errors.push(`${label}: correctIndex must point to one of the 4 answers`);
  }

  return errors;
}

function validateTranslation(question, translations, language) {
  const translation = translations[question.id];
  const errors = [];

  if (!translation) {
    errors.push(`${question.id}: missing ${language} translation`);
    return errors;
  }

  if (!isNonEmptyString(translation.q)) {
    errors.push(`${question.id}: missing ${language} question translation`);
  }

  if (!Array.isArray(translation.answers) || translation.answers.length !== question.answers.length) {
    errors.push(`${question.id}: ${language} answers must match the canonical answer count`);
    return errors;
  }

  translation.answers.forEach((answer, answerIndex) => {
    if (!isNonEmptyString(answer)) {
      errors.push(`${question.id}: ${language} answer ${answerIndex} must be a non-empty string`);
    }
  });

  return errors;
}

const seenIds = new Set();
const errors = [];

for (let index = 0; index < questionBank.length; index += 1) {
  if (!(index in questionBank)) {
    errors.push(`questionBank: empty slot at index ${index}`);
    continue;
  }

  errors.push(...validateQuestion(questionBank[index], index, seenIds));
  errors.push(...validateTranslation(questionBank[index], huTranslations, 'hu'));
}

for (const id of Object.keys(huTranslations)) {
  if (!seenIds.has(id)) {
    errors.push(`${id}: hu translation has no canonical question`);
  }
}

const moduleCounts = questionBank.reduce((counts, question) => {
  counts[question.module] = (counts[question.module] ?? 0) + 1;
  return counts;
}, {});

console.log(
  JSON.stringify(
    {
      total: questionBank.length,
      modules: moduleCounts,
      errors: errors.length,
    },
    null,
    2
  )
);

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}
