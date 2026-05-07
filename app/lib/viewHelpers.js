const SEEKER_STATUS_CLASS = {
  'Працевлаштований': 'badge-active',
  'Шукає':            'badge-info',
  'На навчанні':      'badge-pending',
  'Знятий з обліку':  'badge-inactive',
};

const APPLICATION_STATUS_CLASS = {
  'Прийнята':                'badge-active',
  'Відхилена':               'badge-inactive',
  'Запрошено на співбесіду': 'badge-pending',
  'Подана':                  'badge-info',
  'На розгляді':             'badge-info',
};

const NAV_ITEMS = [
  { key: 'home',         href: '/',             label: 'Головна' },
  { key: 'seekers',      href: '/seekers',      label: 'Шукачі' },
  { key: 'vacancies',    href: '/vacancies',    label: 'Вакансії' },
  { key: 'employers',    href: '/employers',    label: 'Роботодавці' },
  { key: 'applications', href: '/applications', label: 'Заявки' },
  { key: 'trainings',    href: '/trainings',    label: 'Навчання' },
  { key: 'analytics',    href: '/analytics',    label: 'Аналітика' },
];

const dateFmt = new Intl.DateTimeFormat('uk-UA');
const numFmt  = new Intl.NumberFormat('uk-UA');

function formatDate(d, fallback = '—') {
  if (!d) return fallback;
  return dateFmt.format(new Date(d));
}

function formatMoney(n, fallback = '—') {
  if (n === null || n === undefined || n === '') return fallback;
  return numFmt.format(Number(n)) + ' ₴';
}

function seekerStatusClass(status) {
  return SEEKER_STATUS_CLASS[status] || 'badge-info';
}

function applicationStatusClass(status) {
  return APPLICATION_STATUS_CLASS[status] || 'badge-info';
}

function matchScoreClass(score) {
  if (score >= 90) return 'score-high';
  if (score >= 60) return 'score-mid';
  return 'score-low';
}

function isActive(current, key) {
  return current === key ? 'active' : '';
}

module.exports = {
  NAV_ITEMS,
  formatDate,
  formatMoney,
  seekerStatusClass,
  applicationStatusClass,
  matchScoreClass,
  isActive,
};
