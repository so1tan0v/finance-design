import React, { useEffect, useState } from 'react';
import { DateCalendar, DateField, Icon, Progress, formatIsoDate, screenHref } from './ui.jsx';
import { addSharedDebts, currencySymbol, getAccountRows, readCreatedOperations, readPayers, readSharedDebts, readTagRecords, rememberOperation, writeTagRecords } from './FinanceFlows.jsx';

const go = screenHref;
const booksKey = 'finance-design-books';
const themeKey = 'finance-design-theme';
const localeKey = 'finance-design-locale';
const goalsKey = 'finance-design-goals';
const subsKey = 'finance-design-subscriptions';
const projectsKey = 'finance-design-projects';
const togetherKey = 'finance-design-together';
const syncKey = 'finance-design-sync';
const notesKey = 'finance-design-notifications';
const accessKey = 'finance-design-access';
const backupKey = 'finance-design-backups';

const copy = {
  en: {
    'Журнал': 'Journal', 'Счета': 'Accounts', 'Перевод': 'Transfer', 'Бюджет': 'Budget', 'Цели и резервы': 'Goals', 'Подписки': 'Subscriptions', 'Совместные расходы': 'Shared expenses', 'Долги': 'Debts', 'Вклады': 'Deposits', 'Кредиты': 'Loans', 'Отчёты': 'Reports', 'Валюты и курсы': 'Currencies', 'Проекты': 'Projects', 'Книги учёта': 'Ledgers', 'Резервная копия': 'Backup', 'Синхронизация': 'Sync', 'Уведомления': 'Notifications', 'Приватность и доступ': 'Privacy', 'Язык и отображение': 'Language', 'Все настройки': 'All settings', 'Главная': 'Home', 'Ещё': 'More', 'Учёт': 'Records', 'Планирование': 'Planning', 'Совместно': 'Shared', 'Продукты': 'Products', 'Анализ': 'Analysis', 'Справочники': 'Directories', 'Ввод и данные': 'Capture', 'Настройки': 'Settings', 'Как в системе': 'System', 'Светлая': 'Light', 'Тёмная': 'Dark', 'Фильтры': 'Filters', 'Тема': 'Theme', 'Новая цель': 'New goal', 'Сохранить': 'Save', 'Новая подписка': 'New subscription', 'Провести платёж': 'Post payment', 'Новый расход': 'New expense', 'Новый проект': 'New project', 'Новая книга': 'New ledger', 'Создать копию': 'Create backup', 'Добавить устройство': 'Add device', 'Русский': 'Russian', 'Фото чека': 'Receipt photo', 'QR чека': 'Receipt QR', 'Импорт': 'Import', 'Экспорт': 'Export', 'Счета и обязательства': 'Accounts', 'Модули': 'Modules', 'Данные и доступ': 'Data and access'
  },
  ka: {
    'Журнал': 'ჟურნალი', 'Счета': 'ანგარიშები', 'Перевод': 'გადარიცხვა', 'Бюджет': 'ბიუჯეტი', 'Цели и резервы': 'მიზნები', 'Подписки': 'გამოწერები', 'Совместные расходы': 'საერთო ხარჯები', 'Долги': 'ვალები', 'Вклады': 'ანაბრები', 'Кредиты': 'სესხები', 'Отчёты': 'ანგარიშგება', 'Валюты и курсы': 'ვალუტები', 'Проекты': 'პროექტები', 'Книги учёта': 'წიგნები', 'Резервная копия': 'სარეზერვო ასლი', 'Синхронизация': 'სინქრონიზაცია', 'Уведомления': 'შეტყობინებები', 'Приватность и доступ': 'კონფიდენციალურობა', 'Язык и отображение': 'ენა', 'Все настройки': 'პარამეტრები', 'Главная': 'მთავარი', 'Ещё': 'კიდევ', 'Учёт': 'აღრიცხვა', 'Планирование': 'გეგმა', 'Совместно': 'საერთო', 'Продукты': 'პროდუქტები', 'Анализ': 'ანალიზი', 'Справочники': 'ცნობარები', 'Ввод и данные': 'შეტანა', 'Настройки': 'პარამეტრები', 'Как в системе': 'სისტემის', 'Светлая': 'ნათელი', 'Тёмная': 'მუქი', 'Фильтры': 'ფილტრები', 'Тема': 'თემა', 'Новая цель': 'ახალი მიზანი', 'Сохранить': 'შენახვა', 'Новая подписка': 'ახალი გამოწერა', 'Провести платёж': 'გატარება', 'Новый расход': 'ახალი ხარჯი', 'Новый проект': 'ახალი პროექტი', 'Новая книга': 'ახალი წიგნი', 'Создать копию': 'ასლის შექმნა', 'Добавить устройство': 'მოწყობილობა', 'Русский': 'რუსული', 'Фото чека': 'ჩეკის ფოტო', 'QR чека': 'ჩეკის QR', 'Импорт': 'იმპორტი', 'Экспорт': 'ექსპორტი', 'Счета и обязательства': 'ანგარიშები', 'Модули': 'მოდულები', 'Данные и доступ': 'მონაცემები'
  }
};

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return value ?? fallback;
  } catch { return fallback; }
}
function writeJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Preview remains usable. */ }
  window.dispatchEvent(new Event(key));
}
function useStored(key, fallback) {
  const [value, setValue] = useState(() => readJson(key, fallback));
  useEffect(() => {
    const refresh = () => setValue(readJson(key, fallback));
    window.addEventListener(key, refresh);
    return () => window.removeEventListener(key, refresh);
  }, [key]);
  const save = next => {
    const resolved = typeof next === 'function' ? next(readJson(key, fallback)) : next;
    writeJson(key, resolved);
    setValue(resolved);
  };
  return [value, save];
}

export function readTheme() {
  const mode = readJson(themeKey, 'system');
  return mode === 'light' || mode === 'dark' || mode === 'system' ? mode : 'system';
}
export function applyTheme(mode = readTheme()) {
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const resolved = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themeChoice = mode;
}
export function setTheme(mode) {
  writeJson(themeKey, mode);
  applyTheme(mode);
}
export function readLocale() {
  return { lang: 'ru', week: 'mon', density: 'compact', ...readJson(localeKey, {}) };
}
export function applyLocale(locale = readLocale()) {
  document.documentElement.lang = locale.lang || 'ru';
  document.documentElement.dataset.density = 'compact';
  window.dispatchEvent(new Event('finance-locale'));
}
export function setLocale(patch) {
  const next = { ...readLocale(), ...patch };
  writeJson(localeKey, next);
  applyLocale(next);
}
export function readAccess() {
  return { pinOn: false, pin: '', lock: '1', hide: false, ...readJson(accessKey, {}) };
}
export function applyPrivacy(access = readAccess()) {
  document.documentElement.dataset.privacy = access.hide ? 'on' : 'off';
}
export function bootChrome() {
  applyTheme();
  applyLocale();
  applyPrivacy();
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', () => { if (readTheme() === 'system') applyTheme('system'); });
}
export function t(text) {
  const lang = readLocale().lang;
  if (!text || lang === 'ru') return text;
  return copy[lang]?.[text] || text;
}
export function useLocale() {
  const [locale, setValue] = useState(readLocale);
  useEffect(() => {
    const refresh = () => setValue(readLocale());
    window.addEventListener(localeKey, refresh);
    window.addEventListener('finance-locale', refresh);
    return () => {
      window.removeEventListener(localeKey, refresh);
      window.removeEventListener('finance-locale', refresh);
    };
  }, []);
  return locale;
}

const defaultBooks = { active: 'personal', items: [{ id: 'personal', name: 'Личные финансы', owner: 'Я' }, { id: 'family', name: 'Семейный бюджет', owner: 'Я' }, { id: 'workshop', name: 'Мастерская', owner: 'Я' }] };
export function readBooks() {
  const saved = readJson(booksKey, null);
  if (!saved?.items?.length) return defaultBooks;
  return { active: saved.items.some(item => item.id === saved.active) ? saved.active : saved.items[0].id, items: saved.items };
}
export function activeBookId() { return readBooks().active; }
function saveBooks(next) { writeJson(booksKey, next); }

const defaultGoals = [
  { id: 'cushion', name: 'Подушка', target: 100000, saved: 35000, currency: 'RUB', due: '2027-06-01', accounts: ['Наличные'], deposits: ['Накопительный · TBC'] },
  { id: 'trip', name: 'Отпуск', target: 45000, saved: 18000, currency: 'RUB', due: '2027-07-15', accounts: ['Банковский счёт'], deposits: [] }
];
const defaultSubs = [
  { id: 'music', name: 'Музыка', amount: 399, currency: 'RUB', account: 'Банковский счёт', category: 'Подписки', next: '2026-10-20', every: 'Месяц', paused: false },
  { id: 'cloud', name: 'Облако', amount: 199, currency: 'RUB', account: 'Банковский счёт', category: 'Подписки', next: '2026-10-24', every: 'Месяц', paused: false },
  { id: 'rent', name: 'Аренда', amount: 30000, currency: 'RUB', account: 'Банковский счёт', category: 'Жильё', next: '2026-11-01', every: 'Месяц', paused: false }
];
const journalChoices = [
  ['op-13-products', 'Продукты', -1240], ['op-12-cafe', 'Кафе', -450], ['op-11-taxi', 'Такси', -320], ['op-10-rent', 'Аренда', -30000], ['op-8-utils', 'Коммунальные', -1850], ['op-12-salary', 'Зарплата', 70000]
];
const defaultProjects = [{ id: 'repair', name: 'Ремонт', note: 'Квартира', from: '2026-10-01', to: '', currency: 'RUB', operationIds: ['op-10-rent', 'op-8-utils'] }];
const depositChoices = ['Накопительный · TBC', 'Гибкий · TBC'];
const tagColors = ['#225C46', '#C56A1A', '#1C6E86', '#AD3D38', '#2F8F5B', '#5C4A86', '#386DCB', '#926A36'];

function moneyText(amount, currency = 'RUB') {
  return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(Number(amount) || 0)}\u00a0${currencySymbol(currency)}`;
}
function Sheet({ title, onClose, children }) {
  return <div className="flow-overlay" role="dialog" aria-label={title}><div className="flow-sheet"><div className="sheet-head"><strong>{title}</strong><button type="button" onClick={onClose} aria-label="Закрыть">×</button></div>{children}</div></div>;
}
function Head({ title, subtitle }) {
  return <div className="entry-head"><h2>{t(title)}</h2>{subtitle && <small>{subtitle}</small>}</div>;
}
function Toggle({ pressed, onClick, children }) {
  return <button type="button" className={`filter-chip${pressed ? ' active' : ''}`} aria-pressed={pressed} onClick={onClick}>{children}</button>;
}

export function ThemeChoice() {
  const mode = useStored(themeKey, 'system')[0];
  useLocale();
  return <div className="theme-choice" role="radiogroup" aria-label={t('Тема')}>{[['system', 'Как в системе'], ['light', 'Светлая'], ['dark', 'Тёмная']].map(([id, label]) => <button type="button" key={id} className={mode === id ? 'active' : ''} aria-pressed={mode === id} onClick={() => setTheme(id)}>{t(label)}</button>)}</div>;
}

function GoalsFlow() {
  const [goals, setGoals] = useStored(goalsKey, defaultGoals);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const accounts = getAccountRows();
  const start = () => { setDraft({ name: '', target: '10000', saved: '0', currency: 'RUB', due: '2027-06-01', accounts: [], deposits: [] }); setOpen(true); };
  const toggleList = (key, name) => setDraft(value => ({ ...value, [key]: value[key].includes(name) ? value[key].filter(item => item !== name) : [...value[key], name] }));
  const save = () => {
    const name = draft.name.trim();
    const target = Number(String(draft.target).replace(',', '.'));
    if (!name || !(target > 0)) return;
    setGoals([...goals, { id: `goal-${Date.now()}`, name, target, saved: Number(draft.saved) || 0, currency: draft.currency, due: draft.due, accounts: draft.accounts, deposits: draft.deposits }]);
    setOpen(false);
  };
  const addSaved = (id, amount) => setGoals(goals.map(goal => goal.id === id ? { ...goal, saved: Math.min(goal.target, goal.saved + amount) } : goal));
  return <><Head title="Цели и резервы" subtitle="Резерв не является расходом" /><p className="flow-caption">Цель копит сумму отдельно от остатка. К ней прикрепляются счета и вклады, из которых вы откладываете. Деньги на счёте при этом не списываются.</p>{goals.map(goal => {
    const ratio = Math.max(0, Math.min(100, Math.round(goal.saved / (goal.target || 1) * 100)));
    return <article className="goal-card" key={goal.id}><header><strong>{goal.name}</strong><b>{ratio}%</b></header><small>{moneyText(goal.saved, goal.currency)} из {moneyText(goal.target, goal.currency)} · до {formatIsoDate(goal.due)}</small><Progress value={ratio} label={`${goal.name}: ${ratio}%`} /><p className="flow-caption">{[...goal.accounts, ...goal.deposits].join(' · ') || 'Счета не прикреплены'}</p>{goal.saved < goal.target && <button type="button" className="flow-secondary" onClick={() => addSaved(goal.id, Math.min(1000, goal.target - goal.saved))}>Отложить {moneyText(Math.min(1000, goal.target - goal.saved), goal.currency)}</button>}</article>;
  })}<button type="button" className="flow-primary" onClick={start}>{t('Новая цель')}</button>{open && <Sheet title={t('Новая цель')} onClose={() => setOpen(false)}><label className="flow-inline"><span>Название</span><input value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} placeholder="Например, Подушка" /></label><label className="flow-inline"><span>Сумма</span><input inputMode="decimal" value={draft.target} onChange={event => setDraft({ ...draft, target: event.target.value })} /></label><label className="flow-inline"><span>Уже отложено</span><input inputMode="decimal" value={draft.saved} onChange={event => setDraft({ ...draft, saved: event.target.value })} /></label><label className="flow-inline"><span>Валюта</span><select value={draft.currency} onChange={event => setDraft({ ...draft, currency: event.target.value })}>{['RUB', 'USD', 'EUR', 'GEL'].map(code => <option key={code}>{code}</option>)}</select></label><DateField label="Срок" value={draft.due} onChange={due => setDraft({ ...draft, due })} /><p className="flow-caption">Счета</p><div className="filter-chips">{accounts.map(account => <Toggle key={account.name} pressed={draft.accounts.includes(account.name)} onClick={() => toggleList('accounts', account.name)}>{account.name}</Toggle>)}</div><p className="flow-caption">Вклады</p><div className="filter-chips">{depositChoices.map(name => <Toggle key={name} pressed={draft.deposits.includes(name)} onClick={() => toggleList('deposits', name)}>{name}</Toggle>)}</div><button type="button" className="flow-primary" disabled={!draft.name.trim()} onClick={save}>{t('Сохранить')}</button></Sheet>}</>;
}

function SubscriptionsFlow() {
  const [rows, setRows] = useStored(subsKey, defaultSubs);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const accounts = getAccountRows();
  const post = item => {
    rememberOperation({ id: `op-sub-${Date.now()}`, day: '14 октября', date: '14.10.2026', title: item.name, detail: `Подписка · ${item.account}`, amount: `−${new Intl.NumberFormat('ru-RU').format(item.amount)} ${currencySymbol(item.currency)}`, tone: 'negative', kind: 'clock', group: 'Расход', account: item.account, category: item.category, tags: [], period: 'Октябрь 2026', payer: 'Я' });
    const next = new Date(`${item.next}T00:00:00`);
    if (item.every === 'Неделя') next.setDate(next.getDate() + 7);
    else next.setMonth(next.getMonth() + (item.every === 'Год' ? 12 : 1));
    const iso = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
    setRows(rows.map(row => row.id === item.id ? { ...row, next: iso } : row));
  };
  const save = () => {
    const name = draft.name.trim();
    const amount = Number(String(draft.amount).replace(',', '.'));
    if (!name || !(amount > 0)) return;
    setRows([...rows, { id: `sub-${Date.now()}`, name, amount, currency: 'RUB', account: draft.account, category: draft.category, next: draft.next, every: draft.every, paused: false }]);
    setOpen(false);
  };
  return <><Head title="Подписки" subtitle="Регулярный платёж по счёту" /><p className="flow-caption">Подписка сама не списывает деньги. «Провести платёж» создаёт расход в журнале и сдвигает следующую дату. Пауза оставляет историю и останавливает будущие проведения.</p>{rows.map(item => <article className="goal-card" key={item.id}><header><strong>{item.name}</strong><b>{moneyText(item.amount, item.currency)}</b></header><small>{item.every} · {item.account} · {formatIsoDate(item.next)}{item.paused ? ' · пауза' : ''}</small><div className="module-actions"><button type="button" className="flow-secondary" disabled={item.paused} onClick={() => post(item)}>{t('Провести платёж')}</button><button type="button" className="flow-secondary" onClick={() => setRows(rows.map(row => row.id === item.id ? { ...row, paused: !row.paused } : row))}>{item.paused ? 'Возобновить' : 'Пауза'}</button></div></article>)}<button type="button" className="flow-primary" onClick={() => { setDraft({ name: '', amount: '399', account: accounts[0]?.name || 'Наличные', category: 'Подписки', next: '2026-11-01', every: 'Месяц' }); setOpen(true); }}>{t('Новая подписка')}</button>{open && <Sheet title={t('Новая подписка')} onClose={() => setOpen(false)}><label className="flow-inline"><span>Название</span><input value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} placeholder="Например, Музыка" /></label><label className="flow-inline"><span>Сумма, ₽</span><input inputMode="decimal" value={draft.amount} onChange={event => setDraft({ ...draft, amount: event.target.value })} /></label><label className="flow-inline"><span>Счёт</span><select value={draft.account} onChange={event => setDraft({ ...draft, account: event.target.value })}>{accounts.map(account => <option key={account.name}>{account.name}</option>)}</select></label><label className="flow-inline"><span>Категория</span><select value={draft.category} onChange={event => setDraft({ ...draft, category: event.target.value })}>{['Подписки', 'Жильё', 'Связь', 'Прочее'].map(name => <option key={name}>{name}</option>)}</select></label><label className="flow-inline"><span>Повтор</span><select value={draft.every} onChange={event => setDraft({ ...draft, every: event.target.value })}>{['Неделя', 'Месяц', 'Год'].map(name => <option key={name}>{name}</option>)}</select></label><DateField label="Следующий платёж" value={draft.next} onChange={next => setDraft({ ...draft, next })} /><button type="button" className="flow-primary" disabled={!draft.name.trim()} onClick={save}>{t('Сохранить')}</button></Sheet>}</>;
}

function TogetherFlow() {
  const [rows, setRows] = useStored(togetherKey, [{ id: 'cafe', title: 'Завтрак', payer: 'Я', people: ['Я', 'Анна'], amount: 450, currency: 'RUB', account: 'Наличные', date: '2026-10-12', note: 'Кафе' }]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const people = [...new Set(['Я', 'Анна', 'Тимур', ...readPayers()])];
  const share = (amount, count) => Math.round((amount / Math.max(1, count)) * 100) / 100;
  const save = () => {
    const amount = Number(String(draft.amount).replace(',', '.'));
    if (!(amount > 0) || draft.people.length < 2) return;
    const part = share(amount, draft.people.length);
    const item = { id: `share-${Date.now()}`, title: draft.note.trim() || 'Общий расход', payer: draft.payer, people: draft.people, amount, currency: 'RUB', account: draft.account, date: draft.date, note: draft.note.trim() };
    setRows([item, ...rows]);
    rememberOperation({ id: `op-share-${Date.now()}`, day: '14 октября', date: dottedDate(draft.date), title: item.title, detail: `Общий расход · ${draft.account}`, amount: `−${new Intl.NumberFormat('ru-RU').format(amount)} ₽`, tone: 'negative', kind: 'person', group: 'Расход', account: draft.account, category: 'Прочее', tags: [], period: 'Октябрь 2026', payer: draft.payer });
    addSharedDebts(draft.people.filter(name => name !== draft.payer).map((name, index) => ({ id: `${Date.now()}-${index}`, person: name, amount: part, currency: 'RUB', date: dottedDate(draft.date), note: item.title })));
    setOpen(false);
  };
  return <><Head title="Совместные расходы" subtitle="Обычная операция плюс доли" /><p className="flow-caption">Общий расход живёт в журнале. Доля каждого человека, кроме плательщика, сразу попадает в «Долги». То же самое делает переключатель «Разделить между людьми» в расходе.</p>{rows.map(item => <article className="goal-card" key={item.id}><header><strong>{item.title}</strong><b>{moneyText(item.amount, item.currency)}</b></header><small>Заплатил {item.payer} · {item.account} · {formatIsoDate(item.date)}</small><small>{item.people.map(name => `${name} ${moneyText(share(item.amount, item.people.length), item.currency)}`).join(' · ')}</small></article>)}<p className="flow-caption">Уже в долгах из общих расходов: {readSharedDebts().length ? readSharedDebts().map(item => `${item.person} ${moneyText(item.amount, item.currency)}`).join(' · ') : 'пока нет. Сохраните расход ниже или разделите его в журнале.'}</p><div className="module-actions module-span"><button type="button" className="flow-primary" onClick={() => { setDraft({ amount: '900', payer: 'Я', people: ['Я', 'Анна'], account: 'Наличные', date: '2026-10-14', note: '' }); setOpen(true); }}>{t('Новый расход')}</button><a className="flow-secondary" href={go('debts')}>Открыть долги</a></div>{open && <Sheet title="Общий расход" onClose={() => setOpen(false)}><label className="flow-inline"><span>Сумма, ₽</span><input inputMode="decimal" value={draft.amount} onChange={event => setDraft({ ...draft, amount: event.target.value })} /></label><label className="flow-inline"><span>Заметка</span><input value={draft.note} onChange={event => setDraft({ ...draft, note: event.target.value })} placeholder="Например, ужин" /></label><label className="flow-inline"><span>Кто заплатил</span><select value={draft.payer} onChange={event => setDraft({ ...draft, payer: event.target.value })}>{people.map(name => <option key={name}>{name}</option>)}</select></label><DateField label="Дата" value={draft.date} onChange={date => setDraft({ ...draft, date })} /><p className="flow-caption">Участники, сумма делится поровну</p><div className="filter-chips">{people.map(name => <Toggle key={name} pressed={draft.people.includes(name)} onClick={() => setDraft({ ...draft, people: draft.people.includes(name) ? draft.people.filter(item => item !== name) : [...draft.people, name] })}>{name}</Toggle>)}</div><button type="button" className="flow-primary" disabled={draft.people.length < 2} onClick={save}>{t('Сохранить')}</button></Sheet>}</>;
}

function ProjectsFlow({ screen }) {
  const [projects, setProjects] = useStored(projectsKey, defaultProjects);
  const [open, setOpen] = useState(screen?.id === 'project-create');
  const [current, setCurrent] = useState(screen?.id === 'project-report' ? 'repair' : '');
  const [draft, setDraft] = useState({ name: '', note: '', from: '2026-10-01', to: '', operationIds: [] });
  const created = readCreatedOperations().map(item => [item.id, item.title, 0]);
  const choices = [...journalChoices, ...created];
  const spentOf = ids => choices.filter(item => ids.includes(item[0])).reduce((sum, item) => sum + Math.abs(item[2]), 0);
  const save = () => {
    const name = draft.name.trim();
    if (!name) return;
    const id = `project-${Date.now()}`;
    setProjects([...projects, { id, ...draft, name }]);
    setOpen(false);
    setCurrent(id);
  };
  const project = projects.find(item => item.id === current);
  const inProject = choices.filter(item => project?.operationIds?.includes(item[0]));
  return <><Head title="Проекты" subtitle="Срез журнала, без своего остатка" /><p className="flow-caption">Проект собирает уже существующие операции. Он не заводит отдельный счёт и не меняет остатки. Один расход относится к одному проекту.</p>{!project && projects.map(item => <button type="button" className="account-tile" key={item.id} onClick={() => setCurrent(item.id)}><span className="account-tile-icon"><Icon name="briefcase" /></span><span className="account-tile-copy"><strong>{item.name}</strong><small>{item.note || 'Без описания'} · {item.operationIds.length} операций</small></span><strong className="account-tile-amount">{moneyText(spentOf(item.operationIds))}</strong></button>)}{project && <><button type="button" className="flow-link debt-back" onClick={() => setCurrent('')}>← Все проекты</button><article className="goal-card module-span"><header><strong>{project.name}</strong><b>{moneyText(spentOf(project.operationIds))}</b></header><small>{project.note} · {formatIsoDate(project.from)}</small></article><div className="ledger-card"><p className="flow-caption">В проекте</p>{inProject.map(item => <div className="operation-row" key={item[0]}><span className="operation-copy"><strong>{item[1]}</strong></span><strong className="operation-amount">{item[2] ? moneyText(Math.abs(item[2])) : 'в журнале'}</strong></div>)}{!inProject.length && <p className="search-empty">Операций в проекте нет.</p>}</div><div className="ledger-card project-checks"><p className="flow-caption">Добавить из журнала</p>{choices.map(item => { const on = project.operationIds.includes(item[0]); return <button type="button" key={item[0]} className={`project-check${on ? ' active' : ''}`} aria-pressed={on} onClick={() => setProjects(projects.map(row => row.id === project.id ? { ...row, operationIds: on ? row.operationIds.filter(id => id !== item[0]) : [...row.operationIds, item[0]] } : row))}><span>{item[1]}</span><strong>{on ? 'В проекте' : 'Добавить'}</strong></button>; })}</div></>}{!project && <div className="module-actions module-span"><button type="button" className="flow-primary" onClick={() => setOpen(true)}>{t('Новый проект')}</button></div>}{open && <Sheet title={t('Новый проект')} onClose={() => setOpen(false)}><label className="flow-inline"><span>Название</span><input value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} placeholder="Например, Ремонт" /></label><label className="flow-inline"><span>Описание</span><input value={draft.note} onChange={event => setDraft({ ...draft, note: event.target.value })} /></label><DateField label="Начало" value={draft.from} onChange={from => setDraft({ ...draft, from })} /><button type="button" className="flow-primary" disabled={!draft.name.trim()} onClick={save}>{t('Сохранить')}</button></Sheet>}</>;
}

function BooksFlow({ screen }) {
  const [books, setBooks] = useState(readBooks);
  const [open, setOpen] = useState(screen?.id === 'book-create');
  const [name, setName] = useState('');
  const active = books.items.find(item => item.id === books.active) || books.items[0];
  const save = next => { saveBooks(next); setBooks(next); };
  const create = () => {
    const title = name.trim();
    if (!title) return;
    const id = `book-${Date.now()}`;
    save({ ...books, items: [...books.items, { id, name: title, owner: 'Я' }] });
    setName('');
    setOpen(false);
  };
  return <><Head title="Книги учёта" subtitle={active ? `Сейчас открыта «${active.name}»` : ''} /><p className="flow-caption">Книга — отдельная история: свои операции, счета и итоги. Переключение не смешивает записи. Демонстрационные операции лежат в «Личных финансах». Новая операция попадает в открытую книгу.</p>{books.items.map(item => <button type="button" className="account-tile" key={item.id} onClick={() => save({ ...books, active: item.id })}><span className="account-tile-icon"><Icon name="wallet" /></span><span className="account-tile-copy"><strong>{item.name}</strong><small>{item.owner} · {item.id === books.active ? 'открыта' : 'нажмите, чтобы открыть'}</small></span><strong className="account-tile-amount">{item.id === books.active ? 'Активна' : ''}</strong></button>)}<div className="module-actions module-span"><button type="button" className="flow-primary" onClick={() => setOpen(true)}>{t('Новая книга')}</button><a className="flow-secondary" href={go('base-journal')}>Журнал этой книги</a></div>{open && <Sheet title={t('Новая книга')} onClose={() => setOpen(false)}><label className="flow-inline"><span>Название</span><input value={name} onChange={event => setName(event.target.value)} placeholder="Например, Мастерская" /></label><button type="button" className="flow-primary" disabled={!name.trim()} onClick={create}>{t('Сохранить')}</button></Sheet>}</>;
}

function sqliteBytes(tables) {
  const utf8 = value => [...new TextEncoder().encode(String(value))];
  const varint = number => {
    if (number <= 0x7f) return [number];
    const parts = [];
    let value = number;
    while (value) { parts.push(value & 0x7f); value = Math.floor(value / 128); }
    parts.reverse();
    return parts.map((part, index) => index === parts.length - 1 ? part : part | 0x80);
  };
  const bytesOf = (number, length) => Array.from({ length }, (_, index) => (number >> ((length - 1 - index) * 8)) & 0xff);
  const serial = value => {
    if (value == null) return [0, []];
    if (typeof value === 'number') {
      if (value === 0) return [8, []];
      if (value === 1) return [9, []];
      if (value >= 0 && value <= 0xff) return [1, [value]];
      if (value <= 0xffff) return [2, bytesOf(value, 2)];
      if (value <= 0xffffff) return [3, bytesOf(value, 3)];
      return [4, bytesOf(value >>> 0, 4)];
    }
    const bytes = utf8(value);
    return [bytes.length * 2 + 13, bytes];
  };
  const record = values => {
    const types = [], body = [];
    values.forEach(value => { const [type, bytes] = serial(value); types.push(...varint(type)); body.push(...bytes); });
    const sizeLength = types.length + 1 >= 128 ? 2 : 1;
    return [...varint(types.length + sizeLength), ...types, ...body];
  };
  const cell = (rowid, values) => { const payload = record(values); return [...varint(payload.length), ...varint(rowid), ...payload]; };
  const write16 = (page, at, number) => { page[at] = (number >> 8) & 0xff; page[at + 1] = number & 0xff; };
  const write32 = (page, at, number) => { page[at] = (number >> 24) & 0xff; page[at + 1] = (number >> 16) & 0xff; page[at + 2] = (number >> 8) & 0xff; page[at + 3] = number & 0xff; };
  const leaf = (cells, first = false) => {
    const page = new Uint8Array(4096);
    const start = first ? 100 : 0;
    let cursor = 4096;
    const pointers = cells.map(item => { cursor -= item.length; page.set(item, cursor); return cursor; });
    if (cursor < start + 8 + cells.length * 2) return null;
    page[start] = 0x0d;
    write16(page, start + 3, cells.length);
    write16(page, start + 5, cursor);
    pointers.forEach((pointer, index) => write16(page, start + 8 + index * 2, pointer));
    return page;
  };
  const interior = chunks => {
    const page = new Uint8Array(4096);
    const right = chunks[chunks.length - 1];
    const cells = chunks.slice(0, -1).map(chunk => [...bytesOf(chunk.page, 4), ...varint(chunk.maxRow)]);
    let cursor = 4096;
    const pointers = cells.map(item => { cursor -= item.length; page.set(item, cursor); return cursor; });
    page[0] = 0x05;
    write16(page, 3, cells.length);
    write16(page, 5, cursor);
    write32(page, 8, right.page);
    pointers.forEach((pointer, index) => write16(page, 12 + index * 2, pointer));
    return page;
  };
  const chunksOf = rows => {
    const cells = rows.map((row, index) => ({ rowid: index + 1, bytes: cell(index + 1, row) }));
    const chunks = [];
    let current = [];
    cells.forEach(item => {
      current.push(item);
      if (!leaf(current.map(entry => entry.bytes))) { current.pop(); if (current.length) chunks.push(current); current = [item]; }
    });
    if (current.length) chunks.push(current);
    return chunks;
  };
  const planned = tables.map(table => ({ ...table, chunks: chunksOf(table.rows) }));
  const pages = [new Uint8Array(4096)];
  const roots = planned.map(table => {
    if (!table.chunks.length) { pages.push(leaf([])); return pages.length; }
    const placed = table.chunks.map(chunk => { pages.push(leaf(chunk.map(entry => entry.bytes))); return { page: pages.length, maxRow: chunk[chunk.length - 1].rowid }; });
    if (placed.length === 1) return placed[0].page;
    pages.push(interior(placed));
    return pages.length;
  });
  const master = leaf(tables.map((table, index) => cell(index + 1, ['table', table.name, table.name, roots[index], table.sql])), true);
  const header = new Uint8Array(100);
  header.set(new TextEncoder().encode('SQLite format 3'));
  header[16] = 0x10; header[18] = 1; header[19] = 1; header[21] = 64; header[22] = 32; header[23] = 32;
  header[27] = 1; header[31] = pages.length; header[43] = tables.length; header[47] = 4; header[59] = 1;
  header.set(bytesOf(3045001, 4), 96);
  master.set(header);
  pages[0] = master;
  const out = new Uint8Array(pages.length * 4096);
  pages.forEach((page, index) => out.set(page, index * 4096));
  return out;
}
function BackupFlow({ screen }) {
  const [copies, setCopies] = useStored(backupKey, []);
  const [preview, setPreview] = useState(screen?.id === 'restore' ? copies[0] || null : null);
  const [done, setDone] = useState(false);
  const create = () => {
    const now = new Date();
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const name = `finance-${stamp}.sqlite`;
    const books = readBooks();
    const operations = [
      ...exportLedger.map(item => [item.date, item.title, String(item.amount), item.account, 'personal']),
      ...readCreatedOperations().map(item => [item.date || '', item.title || '', String(item.amount || ''), item.account || '', item.book || 'personal'])
    ].map((row, index) => [`op-${index + 1}`, ...row]);
    const bytes = sqliteBytes([
      { name: 'books', sql: 'CREATE TABLE books (id TEXT, name TEXT, owner TEXT)', rows: books.items.map(item => [item.id, item.name, item.owner || '']) },
      { name: 'operations', sql: 'CREATE TABLE operations (id TEXT, date TEXT, title TEXT, amount TEXT, account TEXT, book TEXT)', rows: operations }
    ]);
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/x-sqlite3' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
    setCopies([{ id: `bak-${Date.now()}`, name, at: now.toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }), books: books.items.length, operations: operations.length }, ...copies]);
  };
  return <><Head title="Резервная копия" subtitle="Файл SQLite, не синхронизация" /><p className="flow-caption">Копия — обычная база SQLite: таблицы books и operations. Её можно открыть в SQLite и проверить до замены истории. Это не зашифрованный файл и не облако.</p>{copies.map(item => <button type="button" className="account-tile" key={item.id} onClick={() => { setPreview(item); setDone(false); }}><span className="account-tile-icon"><Icon name="shield" /></span><span className="account-tile-copy"><strong>{item.name}</strong><small>{item.at} · книг: {item.books}{item.operations ? ` · операций: ${item.operations}` : ''}</small></span></button>)}{!copies.length && <p className="search-empty">Копий ещё нет.</p>}<div className="module-actions module-span"><button type="button" className="flow-primary" onClick={create}>{t('Создать копию')}</button></div>{preview && <Sheet title={done ? 'История на месте' : 'Проверка копии'} onClose={() => setPreview(null)}>{done ? <p className="flow-caption">Текущие записи не заменены. Для замены нужно отдельное подтверждение, здесь показан только просмотр.</p> : <><p className="flow-caption">{preview.name} · книг {preview.books}. Просмотр не стирает журнал.</p><button type="button" className="flow-primary" onClick={() => setDone(true)}>Оставить текущую историю</button></>}</Sheet>}</>;
}

function SyncFlow() {
  const [state, setState] = useStored(syncKey, { auto: true, devices: [{ id: 'this', name: 'Этот компьютер', self: true, seen: 'только что' }, { id: 'phone', name: 'Телефон', seen: 'сегодня, 13:41' }] });
  const [name, setName] = useState('');
  const add = () => {
    const title = name.trim();
    if (!title) return;
    setState({ ...state, devices: [...state.devices, { id: `dev-${Date.now()}`, name: title, seen: 'ожидает подтверждения' }] });
    setName('');
  };
  return <><Head title="Синхронизация" subtitle="Доверенные устройства" /><p className="flow-caption">Запись сначала сохраняется на этом устройстве. Синхронизация только разносит уже сохранённые факты. Ошибка одного устройства не удаляет локальный журнал.</p><label className="switch-row"><span><strong>Автосинхронизация</strong><small>Когда устройство в сети</small></span><input type="checkbox" checked={state.auto} onChange={event => setState({ ...state, auto: event.target.checked })} /><span className="switch-track" /></label>{state.devices.map(item => <div className="account-tile" key={item.id}><span className="account-tile-icon"><Icon name="transfer" /></span><span className="account-tile-copy"><strong>{item.name}</strong><small>{item.seen}</small></span>{!item.self && <button type="button" className="flow-link" onClick={() => setState({ ...state, devices: state.devices.filter(row => row.id !== item.id) })}>Убрать</button>}</div>)}<label className="flow-inline"><span>Имя</span><input value={name} onChange={event => setName(event.target.value)} placeholder="Например, Планшет" /></label><button type="button" className="flow-primary" disabled={!name.trim()} onClick={add}>{t('Добавить устройство')}</button></>;
}

function NotificationsFlow() {
  const [state, setState] = useStored(notesKey, { lead: '3', time: '08:00', budget: true, payments: true, subs: true });
  const items = [
    state.budget && ['Бюджет достиг 80%', 'Сегодня · просмотрено'],
    state.payments && [`Платёж через ${state.lead} дн.`, 'Аренда · 30 000 ₽'],
    state.subs && ['Повторный платёж', `Музыка · напоминание в ${state.time}`]
  ].filter(Boolean);
  return <><Head title="Уведомления" subtitle="Напоминания на устройстве" /><p className="flow-caption">Напоминание не проводит платёж. Оно только сообщает о сроке. Проведение остаётся в подписке или в журнале.</p><label className="switch-row"><span><strong>Порог бюджета</strong><small>Когда израсходовано 80%</small></span><input type="checkbox" checked={state.budget} onChange={event => setState({ ...state, budget: event.target.checked })} /><span className="switch-track" /></label><label className="switch-row"><span><strong>Платежи</strong><small>Аренда и другие сроки</small></span><input type="checkbox" checked={state.payments} onChange={event => setState({ ...state, payments: event.target.checked })} /><span className="switch-track" /></label><label className="switch-row"><span><strong>Подписки</strong><small>Перед следующим списанием</small></span><input type="checkbox" checked={state.subs} onChange={event => setState({ ...state, subs: event.target.checked })} /><span className="switch-track" /></label><label className="flow-inline"><span>За сколько дней</span><select value={state.lead} onChange={event => setState({ ...state, lead: event.target.value })}>{['1', '3', '7'].map(value => <option key={value} value={value}>{value}</option>)}</select></label><label className="flow-inline"><span>Время</span><input type="time" value={state.time} onChange={event => setState({ ...state, time: event.target.value })} /></label>{items.map(([title, detail]) => <div className="mobile-data-line" key={title}><span>{title}</span><strong>{detail}</strong></div>)}{!items.length && <p className="search-empty">Напоминания выключены.</p>}</>;
}

function AccessFlow() {
  const [state, setState] = useStored(accessKey, { pinOn: false, pin: '', lock: '1', hide: false });
  const update = patch => {
    const next = { ...state, ...patch };
    setState(next);
    applyPrivacy(next);
  };
  return <><Head title="Приватность и доступ" subtitle="Код и скрытие сумм" /><p className="flow-caption">Код блокирует открытие приложения на этом устройстве. Скрытие сумм размывает числа в списках, история при этом остаётся.</p><label className="switch-row"><span><strong>Код приложения</strong><small>4 цифры</small></span><input type="checkbox" checked={state.pinOn} onChange={event => update({ pinOn: event.target.checked })} /><span className="switch-track" /></label>{state.pinOn && <label className="flow-inline"><span>Код</span><input inputMode="numeric" maxLength={4} value={state.pin} onChange={event => update({ pin: event.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="0000" /></label>}<label className="flow-inline"><span>Автоблокировка</span><select value={state.lock} onChange={event => update({ lock: event.target.value })}><option value="0">Сразу</option><option value="1">Через 1 минуту</option><option value="5">Через 5 минут</option></select></label><label className="switch-row"><span><strong>Скрыть суммы</strong><small>В журнале, на счетах и в героях</small></span><input type="checkbox" checked={state.hide} onChange={event => update({ hide: event.target.checked })} /><span className="switch-track" /></label></>;
}

const appLanguages = [['ru', 'Русский'], ['en', 'English'], ['ka', 'ქართული'], ['uk', 'Українська'], ['be', 'Беларуская'], ['de', 'Deutsch'], ['fr', 'Français'], ['es', 'Español'], ['it', 'Italiano'], ['pt', 'Português'], ['pl', 'Polski'], ['cs', 'Čeština'], ['tr', 'Türkçe'], ['hy', 'Հայերեն'], ['az', 'Azərbaycan'], ['kk', 'Қазақша'], ['uz', 'Oʻzbekcha'], ['zh', '中文'], ['ja', '日本語'], ['ko', '한국어'], ['ar', 'العربية']];
function LocaleFlow() {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const current = appLanguages.find(item => item[0] === locale.lang)?.[1] || locale.lang;
  const shown = appLanguages.filter(item => `${item[0]} ${item[1]}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <><Head title="Язык и отображение" subtitle="Интерфейс, не названия операций" /><p className="flow-caption">Язык меняет меню, заголовки разделов и календарь. Названия счетов, категорий и заметок остаются как вы их написали.</p><button type="button" className="flow-inline" onClick={() => { setQuery(''); setOpen(true); }}><span>Язык</span><strong>{current}</strong></button><p className="flow-caption">{t('Тема')}</p><ThemeChoice /><label className="flow-inline"><span>Начало недели</span><select value={locale.week} onChange={event => setLocale({ week: event.target.value })}><option value="mon">Понедельник</option><option value="sun">Воскресенье</option></select></label>{open && <Sheet title="Язык" onClose={() => setOpen(false)}><label className="flow-inline"><span>Поиск</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Название языка" /></label><div className="language-list">{shown.map(([id, label]) => <button type="button" key={id} aria-pressed={locale.lang === id} onClick={() => { setLocale({ lang: id }); setOpen(false); }}>{label}</button>)}{!shown.length && <p className="search-empty">Такого языка нет в списке.</p>}</div></Sheet>}</>;
}

function TagsFlow() {
  const [tags, setTags] = useState(readTagRecords);
  const [name, setName] = useState('');
  const [color, setColor] = useState(tagColors[0]);
  const [menu, setMenu] = useState('');
  const persist = next => { writeTagRecords(next); setTags(next); };
  const add = () => {
    const title = name.trim();
    if (!title || tags.some(item => item.name.toLowerCase() === title.toLowerCase())) return;
    persist([...tags, { name: title, color }]);
    setName('');
  };
  return <><Head title="Теги и правила" subtitle="Метка и цвет, без влияния на сумму" /><p className="flow-caption">Тег помечает операцию для фильтра журнала. Цвет выбирается при создании. У сохранённого тега цвет и удаление спрятаны в меню.</p><div className="filter-chips">{tagColors.map(item => <button type="button" key={item} className={`tag-color${color === item ? ' active' : ''}`} style={{ background: item }} aria-label={item} aria-pressed={color === item} onClick={() => setColor(item)} />)}</div><label className="flow-inline"><span>Новый тег</span><input value={name} onChange={event => setName(event.target.value)} placeholder="Например, Отпуск" onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); add(); } }} /></label><button type="button" className="flow-primary" disabled={!name.trim()} onClick={add}>Добавить тег</button>{tags.map(item => <article className="goal-card tag-saved" key={item.name}><header><span className="tag-saved-name"><span className="tag-dot" style={{ background: item.color }} /><strong>{item.name}</strong></span><button type="button" className="tag-menu-button" aria-label={`Действия: ${item.name}`} aria-expanded={menu === item.name} onClick={() => setMenu(menu === item.name ? '' : item.name)}><Icon name="dots" size={16} /></button></header>{menu === item.name && <div className="tag-menu-panel"><p>Цвет</p><div className="filter-chips">{tagColors.map(swatch => <button type="button" key={swatch} className={`tag-color${item.color === swatch ? ' active' : ''}`} style={{ background: swatch }} aria-label={swatch} onClick={() => { persist(tags.map(row => row.name === item.name ? { ...row, color: swatch } : row)); setMenu(''); }} />)}</div><button type="button" className="flow-link" onClick={() => { persist(tags.filter(row => row.name !== item.name)); setMenu(''); }}>Удалить</button></div>}</article>)}</>;
}

function DirectoriesFlow() {
  return <><Head title="Справочники" subtitle="Категории, проекты, теги" /><a className="account-tile" href={go('currencies')}><span className="account-tile-icon"><Icon name="wallet" /></span><span className="account-tile-copy"><strong>Валюты и курсы</strong><small>Базовая валюта и ручные курсы</small></span></a><a className="account-tile" href={go('projects')}><span className="account-tile-icon"><Icon name="briefcase" /></span><span className="account-tile-copy"><strong>Проекты</strong><small>Срез операций</small></span></a><a className="account-tile" href={go('tags')}><span className="account-tile-icon"><Icon name="tag" /></span><span className="account-tile-copy"><strong>Теги и правила</strong><small>Метки и цвета</small></span></a><a className="account-tile" href={go('base-settings')}><span className="account-tile-icon"><Icon name="settings" /></span><span className="account-tile-copy"><strong>Категории и счета</strong><small>В настройках</small></span></a></>;
}

const importKey = 'finance-design-import-draft';
const sampleCsv = 'дата;сумма;назначение;валюта\n14.10.2026;-890;Аптека;RUB\n12.10.2026;70000;Зарплата;RUB\n13.10.2026;-210;Кофе;RUB';
const exportLedger = [
  { date: '13.10.2026', title: 'Продукты', amount: -1240, account: 'Наличные', group: 'Расход' },
  { date: '13.10.2026', title: 'Между своими счетами', amount: 3000, account: 'Наличные', group: 'Перевод' },
  { date: '13.10.2026', title: 'Возврат долга', amount: 200, account: 'Наличные', group: 'Долг' },
  { date: '12.10.2026', title: 'Зарплата', amount: 70000, account: 'Банковский счёт', group: 'Доход' },
  { date: '12.10.2026', title: 'Кафе', amount: -450, account: 'Наличные', group: 'Расход' },
  { date: '11.10.2026', title: 'Такси', amount: -320, account: 'Наличные', group: 'Расход' },
  { date: '11.10.2026', title: 'На карту', amount: 5000, account: 'Банковский счёт', group: 'Перевод' },
  { date: '10.10.2026', title: 'Аренда', amount: -30000, account: 'Банковский счёт', group: 'Расход' },
  { date: '10.10.2026', title: 'Возврат Тимуру', amount: -1500, account: 'Наличные', group: 'Долг' },
  { date: '08.10.2026', title: 'Долг Анне', amount: -800, account: 'Наличные', group: 'Долг' },
  { date: '08.10.2026', title: 'Коммунальные', amount: -1850, account: 'Банковский счёт', group: 'Расход' }
];
function parseCsv(text) {
  const lines = String(text || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (!lines.length) return { headers: [], rows: [] };
  const cells = line => line.split(/[;\t,]/).map(cell => cell.trim().replace(/^"|"$/g, ''));
  const headers = cells(lines[0]);
  const rows = lines.slice(1).map(line => {
    const values = cells(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
  });
  return { headers, rows };
}
function guessMap(headers) {
  const find = words => headers.find(header => words.some(word => header.toLowerCase().includes(word))) || headers[0] || '';
  return { date: find(['дата', 'date']), amount: find(['сумм', 'amount']), title: find(['назнач', 'опис', 'title', 'memo']) };
}
function parseAmount(text) {
  const value = Number(String(text || '').replace(/\s/g, '').replace(',', '.').replace(/[^\d.+-]/g, ''));
  return Number.isFinite(value) ? value : 0;
}
function dottedDate(text) {
  const iso = String(text || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}.${iso[2]}.${iso[1]}`;
  const match = String(text || '').match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/);
  return match ? `${match[1].padStart(2, '0')}.${match[2].padStart(2, '0')}.${match[3]}` : '';
}
function isoDate(text) {
  const dotted = dottedDate(text);
  const match = dotted.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : '';
}
function knownKeys() {
  const keys = new Set(exportLedger.map(item => `${item.date}|${item.title}`));
  readCreatedOperations().forEach(item => keys.add(`${item.date}|${item.title}`));
  return keys;
}
function importRows(draft) {
  const keys = knownKeys();
  return (draft.rows || []).map(row => {
    const dateLabel = dottedDate(row[draft.map.date]);
    const title = row[draft.map.title] || 'Импорт';
    const amount = parseAmount(row[draft.map.amount]);
    return { dateLabel, iso: isoDate(dateLabel), title, amount, duplicate: keys.has(`${dateLabel}|${title}`) };
  }).filter(row => row.dateLabel);
}
function signedMoney(amount) {
  const text = moneyText(Math.abs(amount));
  if (amount < 0) return `−${text}`;
  if (amount > 0) return `+${text}`;
  return text;
}
function bookLedger() {
  const book = activeBookId();
  const created = readCreatedOperations().filter(item => (item.book || 'personal') === book).map(item => ({
    date: item.date,
    iso: isoDate(item.date),
    title: item.title,
    amount: parseAmount(String(item.amount || '').replace('−', '-')),
    account: item.account || '',
    group: item.group || ''
  }));
  const demo = book === 'personal' ? exportLedger.map(item => ({ ...item, iso: isoDate(item.date) })) : [];
  return [...created, ...demo];
}
function downloadFile(name, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}
function ImportFlow({ screen }) {
  const step = screen?.id === 'import-map' ? 'map' : screen?.id === 'import-preview' || screen?.id === 'duplicate-review' ? 'preview' : 'file';
  const duplicatesOnly = screen?.id === 'duplicate-review';
  const [draft, setDraft] = useStored(importKey, { fileName: '', headers: [], rows: [], map: { date: '', amount: '', title: '' }, account: 'Наличные', imported: 0 });
  const accounts = getAccountRows();
  const parsed = importRows(draft);
  const visible = duplicatesOnly ? parsed.filter(row => row.duplicate) : parsed;
  const fresh = parsed.filter(row => !row.duplicate);
  const loadText = (fileName, text) => {
    const table = parseCsv(text);
    setDraft({ ...draft, fileName, headers: table.headers, rows: table.rows, map: guessMap(table.headers), imported: 0 });
  };
  const commit = () => {
    fresh.forEach((row, index) => rememberOperation({
      id: `op-import-${Date.now()}-${index}`,
      day: '14 октября',
      date: row.dateLabel,
      title: row.title,
      detail: `Импорт · ${draft.account}`,
      amount: signedMoney(row.amount),
      tone: row.amount < 0 ? 'negative' : 'positive',
      kind: 'list',
      group: row.amount < 0 ? 'Расход' : 'Доход',
      account: draft.account,
      category: row.amount < 0 ? 'Прочее' : 'Доход',
      tags: [],
      period: 'Октябрь 2026',
      payer: 'Я'
    }));
    setDraft({ ...draft, imported: fresh.length });
  };
  return <><Head title="Импорт" subtitle={duplicatesOnly ? 'Строки, которые уже есть в журнале' : 'CSV в открытую книгу'} /><div className="wide-split"><div className="wide-main"><p className="flow-caption">Формулы и макросы не выполняются. Перед записью видна таблица: совпадение по дате и назначению не пишется второй раз.</p><nav className="filter-chips" aria-label="Шаги импорта"><a className={`filter-chip${step === 'file' ? ' active' : ''}`} href={go('import-file')}>Файл</a><a className={`filter-chip${step === 'map' ? ' active' : ''}`} href={go('import-map')}>Колонки</a><a className={`filter-chip${step === 'preview' && !duplicatesOnly ? ' active' : ''}`} href={go('import-preview')}>Проверка</a><a className={`filter-chip${duplicatesOnly ? ' active' : ''}`} href={go('duplicate-review')}>Совпадения</a></nav>{step === 'file' && <><label className="flow-inline"><span>Файл CSV</span><input type="file" accept=".csv,.txt,.tsv" onChange={event => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => loadText(file.name, String(reader.result || '')); reader.readAsText(file); }} /></label><label className="flow-inline"><span>Счёт</span><select value={draft.account} onChange={event => setDraft({ ...draft, account: event.target.value })}>{accounts.map(account => <option key={account.name}>{account.name}</option>)}</select></label><button type="button" className="flow-secondary" onClick={() => loadText('пример.csv', sampleCsv)}>Подставить пример</button><p className="flow-caption">{draft.fileName ? `${draft.fileName} · ${draft.rows.length} строк · формат даты ДД.ММ.ГГГГ` : 'Файл ещё не выбран. Пример можно подставить без выписки.'}</p></>}{step === 'map' && <>{draft.headers.length ? draft.headers && <>{[['date', 'Дата'], ['amount', 'Сумма'], ['title', 'Назначение']].map(([key, label]) => <label className="flow-inline" key={key}><span>{label}</span><select value={draft.map[key]} onChange={event => setDraft({ ...draft, map: { ...draft.map, [key]: event.target.value } })}>{draft.headers.map(header => <option key={header}>{header}</option>)}</select></label>)}</> : <p className="search-empty">Сначала выберите файл.</p>}<a className="flow-secondary" href={go('import-file')}>К файлу</a></>}{step === 'preview' && <><p className="flow-caption">{duplicatesOnly ? `Совпадений: ${visible.length}. Они останутся в журнале как есть.` : `Новых строк: ${fresh.length}. Совпадений: ${parsed.length - fresh.length}.`}</p><button type="button" className="flow-primary" disabled={!fresh.length || duplicatesOnly} onClick={commit}>{draft.imported ? `Записано: ${draft.imported}` : 'Записать новые'}</button></>}</div><aside className="wide-side"><div className="ledger-card import-preview">{visible.length ? visible.map((row, index) => <div className="operation-row" key={`${row.dateLabel}-${row.title}-${index}`}><span className="operation-copy"><strong>{row.title}</strong><small>{row.dateLabel}{row.duplicate ? ' · уже в журнале' : ' · новая'}</small></span><strong className={`operation-amount ${row.amount < 0 ? 'negative' : 'positive'}`}>{signedMoney(row.amount)}</strong></div>) : <p className="search-empty">{duplicatesOnly ? 'Совпадений нет.' : 'Таблица появится после файла.'}</p>}</div></aside></div></>;
}
function ExportFlow() {
  const [scope, setScope] = useState('all');
  const [format, setFormat] = useState('CSV');
  const [from, setFrom] = useState('2026-10-01');
  const [to, setTo] = useState('2026-10-31');
  const [ready, setReady] = useState('');
  const pick = iso => {
    if (!from || (to && to !== from)) { setFrom(iso); setTo(''); return; }
    if (iso === from) return;
    setTo(iso);
  };
  const rows = bookLedger().filter(item => {
    if (scope === 'expense' && !(item.amount < 0) || scope === 'income' && !(item.amount > 0) || scope === 'transfer' && item.group !== 'Перевод') return false;
    if (!item.iso) return true;
    const end = to || from;
    const start = end && from > end ? end : from;
    const finish = end && from > end ? from : end;
    return item.iso >= start && item.iso <= finish;
  });
  const table = ['Дата;Назначение;Сумма;Счёт;Тип', ...rows.map(item => [item.date, item.title, String(item.amount).replace('.', ','), item.account, item.group].join(';'))].join('\n');
  const download = () => {
    if (format === 'HTML') downloadFile('journal.html', `<table><tr><th>Дата</th><th>Назначение</th><th>Сумма</th></tr>${rows.map(item => `<tr><td>${item.date}</td><td>${item.title}</td><td>${item.amount}</td></tr>`).join('')}</table>`, 'text/html');
    else if (format === 'QIF') downloadFile('journal.qif', `!Type:Bank\n${rows.map(item => `D${item.date}\nT${item.amount}\nP${item.title}\n^\n`).join('')}`, 'text/plain');
    else if (format === 'XLSX' || format === 'PDF') { setReady('Для XLSX и PDF здесь остаётся таблица. Файл скачивается как CSV, HTML, TXT или QIF.'); return; }
    else downloadFile(format === 'TXT' ? 'journal.txt' : 'journal.csv', `\uFEFF${table}`, 'text/csv');
    setReady('Файл сохранён на устройство. Это выгрузка, не резервная копия.');
  };
  return <><Head title="Экспорт" subtitle="Журнал открытой книги" /><div className="wide-split"><div className="wide-main"><p className="flow-caption">Выгрузка берёт текущую книгу и период. Печать отчёта сюда не входит: резервная копия живёт отдельно.</p><label className="flow-inline"><span>Что выгрузить</span><select value={scope} onChange={event => setScope(event.target.value)}><option value="all">Все операции</option><option value="expense">Только расходы</option><option value="income">Только доходы</option><option value="transfer">Только переводы</option></select></label><label className="flow-inline"><span>Формат</span><select value={format} onChange={event => setFormat(event.target.value)}>{['CSV', 'XLSX', 'PDF', 'HTML', 'TXT', 'QIF'].map(item => <option key={item}>{item}</option>)}</select></label><p className="flow-caption">Период можно набрать или выбрать в календаре.</p><DateCalendar mode="range" from={from} to={to && to !== from ? to : ''} onPick={pick} onRangeChange={(start, end) => { setFrom(start || ''); setTo(end || ''); }} /><button type="button" className="flow-primary" disabled={!rows.length} onClick={download}>Скачать {format === 'XLSX' || format === 'PDF' ? 'таблицу' : format}</button>{ready && <p className="flow-caption">{ready}</p>}</div><aside className="wide-side"><div className="ledger-card import-preview">{rows.length ? rows.map((item, index) => <div className="operation-row" key={`${item.date}-${item.title}-${index}`}><span className="operation-copy"><strong>{item.title}</strong><small>{item.date} · {item.account}</small></span><strong className={`operation-amount ${item.amount < 0 ? 'negative' : 'positive'}`}>{signedMoney(item.amount)}</strong></div>) : <p className="search-empty">За этот период операций нет.</p>}</div></aside></div></>;
}
function RemovedFlow() {
  return <><Head title="Раздел убран" subtitle="Его нет в телефоне, на планшете и на компьютере" /><p className="flow-caption">Календарь, прогноз и магазины больше не входят в приложение. Платежи ведутся в подписках, цели — в резервах, метки — в тегах.</p><a className="flow-primary" href={go('subscriptions')}>Подписки</a><a className="flow-secondary" href={go('goals')}>Цели</a><a className="flow-secondary" href={go('base-settings')}>Настройки</a></>;
}

const emptyFilters = { category: '', account: '', payer: '', project: '', tags: [] };
export function JournalFilterButton({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value || emptyFilters);
  const count = [value.category, value.account, value.payer, value.project, ...(value.tags || [])].filter(Boolean).length;
  const categories = ['Продукты', 'Кафе', 'Такси', 'Аренда', 'Коммунальные', 'Зарплата', 'Подработка', 'Долг'];
  const payers = [...new Set(['Я', 'Анна', 'Тимур', 'Работодатель', ...readPayers()])];
  const projects = readJson(projectsKey, defaultProjects);
  const openSheet = () => { setDraft(value || emptyFilters); setOpen(true); };
  const setField = (key, next) => setDraft(current => ({ ...current, [key]: current[key] === next ? '' : next }));
  return <><button type="button" className={`journal-date-filter${count ? ' active' : ''}`} onClick={openSheet}>{t('Фильтры')}{count ? ` · ${count}` : ''}</button>{open && <Sheet title={t('Фильтры')} onClose={() => setOpen(false)}><p className="flow-caption">Категория</p><div className="filter-chips">{categories.map(name => <Toggle key={name} pressed={draft.category === name} onClick={() => setField('category', name)}>{name}</Toggle>)}</div><p className="flow-caption">Счёт</p><div className="filter-chips">{getAccountRows().map(account => <Toggle key={account.name} pressed={draft.account === account.name} onClick={() => setField('account', account.name)}>{account.name}</Toggle>)}</div><p className="flow-caption">Плательщик</p><div className="filter-chips">{payers.map(name => <Toggle key={name} pressed={draft.payer === name} onClick={() => setField('payer', name)}>{name}</Toggle>)}</div><p className="flow-caption">Теги</p><div className="filter-chips">{readTagRecords().map(item => <Toggle key={item.name} pressed={draft.tags.includes(item.name)} onClick={() => setDraft(current => ({ ...current, tags: current.tags.includes(item.name) ? current.tags.filter(tag => tag !== item.name) : [...current.tags, item.name] }))}><i className="tag-dot" style={{ background: item.color }} />{item.name}</Toggle>)}</div><p className="flow-caption">Проект</p><div className="filter-chips">{projects.map(item => <Toggle key={item.id} pressed={draft.project === item.id} onClick={() => setField('project', item.id)}>{item.name}</Toggle>)}</div><button type="button" className="flow-primary" onClick={() => { onChange(draft); setOpen(false); }}>Показать</button><button type="button" className="flow-secondary" onClick={() => { onChange(emptyFilters); setDraft(emptyFilters); setOpen(false); }}>Сбросить</button></Sheet>}</>;
}
export function JournalFilterChips({ value, onChange }) {
  const projects = readJson(projectsKey, defaultProjects);
  const chips = [value.category, value.account, value.payer, ...(value.tags || []), projects.find(item => item.id === value.project)?.name].filter(Boolean);
  if (!chips.length) return null;
  return <div className="filter-chips journal-active-filters">{chips.map(name => <button type="button" key={name} className="filter-chip active" onClick={() => onChange({ ...value, category: value.category === name ? '' : value.category, account: value.account === name ? '' : value.account, payer: value.payer === name ? '' : value.payer, project: projects.find(item => item.name === name)?.id === value.project ? '' : value.project, tags: (value.tags || []).filter(tag => tag !== name) })}>{name} ×</button>)}</div>;
}
export const emptyJournalFilters = emptyFilters;
export function operationInProject(projectId, operationId) {
  if (!projectId) return true;
  const projects = readJson(projectsKey, defaultProjects);
  const project = (Array.isArray(projects) ? projects : []).find(item => item.id === projectId);
  return Boolean(project?.operationIds?.includes(operationId));
}

export const workViews = {
  goals: GoalsFlow,
  'goal-detail': GoalsFlow,
  subscriptions: SubscriptionsFlow,
  repeat: SubscriptionsFlow,
  together: TogetherFlow,
  projects: ProjectsFlow,
  'project-create': ProjectsFlow,
  'project-report': ProjectsFlow,
  books: BooksFlow,
  'book-create': BooksFlow,
  'book-transfer': BooksFlow,
  backup: BackupFlow,
  'backup-result': BackupFlow,
  restore: BackupFlow,
  sync: SyncFlow,
  'device-link': SyncFlow,
  notifications: NotificationsFlow,
  'notification-settings': NotificationsFlow,
  'access-settings': AccessFlow,
  'locale-settings': LocaleFlow,
  language: LocaleFlow,
  tags: TagsFlow,
  directories: DirectoriesFlow,
  'import-file': ImportFlow,
  'import-map': ImportFlow,
  'import-preview': ImportFlow,
  'duplicate-review': ImportFlow,
  'export-data': ExportFlow,
  calendar: RemovedFlow,
  'forecast-day': RemovedFlow,
  forecast: RemovedFlow,
  merchants: RemovedFlow,
  'merchant-edit': RemovedFlow
};
