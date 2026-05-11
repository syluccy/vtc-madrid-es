# VTC Madrid exam practice app

The app is a simple quiz designed to help users practice for the Madrid VTC exam.
Users can start a full simulated exam or practice one module at a time.
Once the exam is finished, it shows whether the user would have passed the real exam in a live situation.
After completing the exam, there is also an option to review either only the incorrectly answered questions or both the incorrect and correct ones.

Resources: https://www.comunidad.madrid/servicios/transporte/pruebas-conductor-vtc

Published to: https://vtc-mad.es/

Default language: Castellano (ES)

Legacy entrypoints `/index-es.html` and `/index-es` redirect to `/`.

## Language support

The canonical question bank is Spanish and lives in `questions.js`.
Translations are stored separately by question ID, starting with `translations/hu.js`.

Available UI languages:

- ES: default Spanish experience
- HU: Hungarian UI and Hungarian question translations

The selected language can be controlled with the URL parameter:

- `?lang=es`
- `?lang=hu`

Translations are intended as a learning aid, not as a replacement for understanding the Spanish exam content.
When a non-Spanish language is selected, tests keep the original Spanish content visible first.
The selected language translation appears in expandable helper sections, with Spanish as the fallback whenever a translation is missing.
During active practice, answer options remain in Spanish; on result/review screens, both questions and answers can show their translations.

## Analytics

Google Analytics is configured with measurement ID `G-2VTX1KQ8LM`.

Tracked quiz events include:

- `quiz_start`
- `quiz_complete`
- `practice_menu_open`
- `module_selected`
- `practice_start`
- `practice_complete`
- `language_change`
- `results_filter_change`
- `review_test`
- `retry_same_questions`
- `new_start`
- `home_return`

Every tracked event includes the current `language`, `language_label`, and `app_version` event parameters.

## Question bank

Current total: 765 canonical Spanish questions.

- Module I: 297 questions
- Module II: 328 questions
- Module III: 69 questions
- Module IV: 71 questions

Full simulated exam composition:

- Module I: 12 questions, pass mark 6
- Module II: 18 questions, pass mark 9
- Module III: 18 questions, pass mark 9
- Module IV: 12 questions, pass mark 6

Total full exam length: 60 questions.
