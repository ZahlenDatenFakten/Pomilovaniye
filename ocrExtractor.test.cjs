/**
 * ═══════════════════════════════════════════════════════════════════════
 *  ТЕСТЫ ДЛЯ ocrExtractor.js / ocrExtractor.cjs
 *  Покрывают реальные кейсы из GTA 5 RP + edge cases OCR
 * ═══════════════════════════════════════════════════════════════════════
 */

const { extractData } = require('./ocrExtractor.cjs');

function runTest(description, input, expected) {
  const result = extractData(input);
  const pass = result.name === expected.name && result.passport === expected.passport;

  const status = pass ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} — ${description}`);

  if (!pass) {
    console.log(`   Input:    "${(input || '').slice(0, 80)}..."`);
    console.log(`   Expected: { name: ${JSON.stringify(expected.name)}, passport: ${JSON.stringify(expected.passport)} }`);
    console.log(`   Got:      { name: ${JSON.stringify(result.name)}, passport: ${JSON.stringify(result.passport)} }`);
  }

  return pass;
}

function runAllTests() {
  let passed = 0;
  let total = 0;

  console.log('───────────────────────────────────────────────────────────────');
  console.log(' Запуск тестов OCR Extractor');
  console.log('───────────────────────────────────────────────────────────────\n');

  /* РЕАЛЬНЫЕ КЕЙСЫ ИЗ СКРИНШОТА (Misha_Navarov, паспорт 590831) */
  total++; passed += runTest(
    'Реальный скриншот: идеальный OCR',
    'DATABASE.GOV  Misha_Navarov  Паспорт #590831  История розыска',
    { name: 'Misha_Navarov', passport: '590831' }
  );

  total++; passed += runTest(
    'Реальный скриншот: имя приклеилось к Паспорту',
    'DATABASE.GOV  Misha_NavarovПаспорт #590831  Список судимостей',
    { name: 'Misha_Navarov', passport: '590831' }
  );

  total++; passed += runTest(
    'Реальный скриншот: OCR опечатка 0→O (Navar0v)',
    'DATABASE.GOV  Misha_Navar0v  Паспорт #590831',
    { name: 'Misha_Navarov', passport: '590831' }
  );

  total++; passed += runTest(
    'Реальный скриншот: OCR опечатка 1→I (M1sha)',
    'DATABASE.GOV  M1sha_Navarov  Паспорт #590831',
    { name: 'Misha_Navarov', passport: '590831' }
  );

  total++; passed += runTest(
    'Реальный скриншот: имя с маленькой буквы + прилипшая статья',
    '17:21 18.08.2026  misha_navarov12.8  Miron Galantes  Паспорт 590831',
    { name: 'Misha_Navarov', passport: '590831' }
  );

  total++; passed += runTest(
    'Реальный скриншот: имя между датой и статьёй в таблице',
    '09:22 18.08.2026  12.7  Marlboro Fallen  misha_navarov  Следственный изолятор  Паспорт 590831',
    { name: 'Misha_Navarov', passport: '590831' }
  );

  /* КИРИЛЛИЧЕСКИЕ ИМЕНА */
  total++; passed += runTest(
    'Кириллица: Иван_Иванов',
    'База правонарушителей  Иван_Иванов  Паспорт #123456',
    { name: 'Иван_Иванов', passport: '123456' }
  );

  total++; passed += runTest(
    'Кириллица: имя с маленькой буквы (анна_петрова)',
    'анна_петрова Паспорт 654321',
    { name: 'Анна_Петрова', passport: '654321' }
  );

  total++; passed += runTest(
    'Кириллица: OCR путает Е и 3 (Ив3н_Иванов)',
    'Ив3н_Иванов Паспорт #111111',
    { name: 'Ивен_Иванов', passport: '111111' }
  );

  /* EDGE CASES: СКЛЕИВАНИЯ, АРТЕФАКТЫ, МУСОР */
  total++; passed += runTest(
    'Имя приклеилось к "ФИО:" (ФИО:Mishan_Osnovnoi)',
    'ФИО:Mishan_Osnovnoi Паспорт #999999',
    { name: 'Mishan_Osnovnoi', passport: '999999' }
  );

  total++; passed += runTest(
    'Имя + прилипшая дата (Mishan_Osnovnoi18.08.2026)',
    'Mishan_Osnovnoi18.08.2026 Паспорт #888888',
    { name: 'Mishan_Osnovnoi', passport: '888888' }
  );

  total++; passed += runTest(
    'Имя + прилипшее время (Kazil_Navalny17:21)',
    '17:21 Kazil_Navalny17:21 Паспорт #777777',
    { name: 'Kazil_Navalny', passport: '777777' }
  );

  total++; passed += runTest(
    'Множественные опечатки: M1sh4n_0snovn0i',
    'M1sh4n_0snovn0i Паспорт #666666',
    { name: 'Mishan_Osnovnoi', passport: '666666' }
  );

  total++; passed += runTest(
    'Имя без явного маркера "Паспорт", только 6 цифр в тексте',
    'База данных  Morphy_Vance  555555  Следственный изолятор',
    { name: 'Morphy_Vance', passport: '555555' }
  );

  total++; passed += runTest(
    'Пустой / null вход',
    '',
    { name: null, passport: null }
  );

  total++; passed += runTest(
    'Текст без имени и паспорта',
    'Следственный изолятор  12.8  17:21  18.08.2026',
    { name: null, passport: null }
  );

  total++; passed += runTest(
    'Только паспорт, без имени',
    'Паспорт #444444  Следственный изолятор',
    { name: null, passport: '444444' }
  );

  total++; passed += runTest(
    'Имя с тремя частями (должно взять первые две) — редкий кейс',
    'Ivan_Petrov_Sidorov Паспорт #333333',
    { name: 'Ivan_Petrov', passport: '333333' }
  );

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  РЕЗУЛЬТАТ: ${passed}/${total} тестов пройдено`);
  console.log('═══════════════════════════════════════════════════════════════');

  return { passed, total };
}

runAllTests();

module.exports = { runAllTests };
