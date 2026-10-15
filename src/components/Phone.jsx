import React, { useState } from 'react';
import { AccountTile, Button, DateCalendar, Icon, MobileFormField, MobileHero, Notice, Progress, chartPalette, formatIsoDate, screenHref } from './ui.jsx';
import { WelcomeFlow, EntryFlow, CurrenciesFlow, AccountCreateFlow, PocketsFlow, BudgetFlow, DepositFlow, LoanFlow, DebtFlow, DirectoryEditor, PrototypeField, TagPicker, Calculator, CATEGORY_TREE, applyAccountAdjustment, currencySymbol, getAccountRows, getFirstAccount, readCreatedOperations, readDirectory, readOperationTags, readPayers, readScreenDraft, readSettings, readTagRecords, rememberOperation, useScreenDrafts, writeOperationTags } from './FinanceFlows.jsx';
import { JournalFilterButton, JournalFilterChips, ThemeChoice, activeBookId, emptyJournalFilters, operationInProject, readBooks, t, useLocale, workViews } from './WorkModules.jsx';
import { screens } from '../data/screens.js';
import { coverageViews } from './CoverageFlows.jsx';
import { captureViews } from './CaptureFlows.jsx';

const go = screenHref;
function StatusBar() { return <><span className="camera" /><div className="phone-status"><span>9:41</span><span className="status-icons"><svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor"><path d="M2 13h2V9H2zm4 0h2V6H6zm4 0h2V3h-2z" /></svg><svg viewBox="0 0 20 12" width="19" height="12" fill="none"><rect x="1" y="1" width="15" height="10" rx="2" stroke="currentColor" /><path d="M3 3h11v6H3zM18 4v4" fill="currentColor" stroke="currentColor" /></svg></span></div></>; }
function WindowBar() { return <div className="window-bar"><span className="window-dots" aria-hidden="true"><i /><i /><i /></span><strong>So1 Money</strong><span /></div>; }
const wideNavGroups = [
  { label: 'Учёт', items: [['base-journal', 'Журнал', 'list', ['base-journal', 'base-detail', 'journal-filters', 'saved-search', 'trip-detail', 'trip-expense', 'trip-settle', 'share-link']], ['base-accounts', 'Счета', 'house', ['base-accounts', 'base-account', 'accounts', 'pockets', 'account-review', 'reconcile', 'createaccount']], ['base-transfer', 'Перевод', 'transfer', ['base-transfer']]] },
  { label: 'Планирование', items: [['budget', 'Бюджет', 'budget', ['budget', 'budgetedit', 'thresholds', 'alert']], ['goals', 'Цели и резервы', 'target', ['goals']], ['subscriptions', 'Подписки', 'clock', ['subscriptions']]] },
  { label: 'Совместно', items: [['together', 'Совместные расходы', 'person', ['together']], ['debts', 'Долги', 'transfer', ['debts', 'debt-new', 'debt-detail', 'debt-repay', 'debt-repay-preview']]] },
  { label: 'Продукты', items: [['deposits', 'Вклады', 'deposit', ['deposits', 'deposit-new', 'deposit-detail', 'deposit-payout', 'deposit-compare']], ['loans', 'Кредиты', 'loan', ['loans', 'loan-detail', 'loan-calc', 'loan-schedule', 'loan-pay', 'loan-pay-preview', 'loan-extra']]] },
  { label: 'Справочники', items: [['currencies', 'Валюты и курсы', 'wallet', ['currencies', 'available', 'rates']], ['projects', 'Проекты', 'briefcase', ['projects']]] },
  { label: 'Ввод и данные', items: [['receipt', 'Фото чека', 'camera', ['receipt']], ['qr-receipt', 'QR чека', 'qr', ['qr-receipt']], ['import-file', 'Импорт', 'down', ['import-file', 'import-preview', 'duplicate-review']], ['export-data', 'Экспорт', 'arrow', ['export-data']]] },
  { label: 'Настройки', items: [['books', 'Книги учёта', 'wallet', ['books']], ['tags', 'Теги и правила', 'tag', ['tags']], ['backup', 'Резервная копия', 'shield', ['backup']], ['sync', 'Синхронизация', 'transfer', ['sync']], ['notifications', 'Уведомления', 'clock', ['notifications']], ['access-settings', 'Приватность и доступ', 'shield', ['access-settings']], ['locale-settings', 'Язык и отображение', 'settings', ['locale-settings', 'language']], ['base-settings', 'Все настройки', 'settings', ['base-settings']]] },
];
const navRules = [
  ['receipt', /^(receipt|receipt-items)$/],
  ['qr-receipt', /^qr-receipt$/],
  ['import-file', /^(import-|duplicate-review|review-)/],
  ['export-data', /^export-data$/],
  ['op-fee', /^op-fee/],
  ['base-journal', /^(op-split|op-refund|split-|journal-|saved-search|change-history|history-undo)/],
  ['base-accounts', /^(account-|reconcile|net-worth)/],
  ['budget', /^budget/],
  ['goals', /^goal/],
  ['subscriptions', /^(subscriptions|repeat)$/],
  ['together', /^(together|trip-|share-|repayment-|contact-ledger)/],
  ['debts', /^debt/],
  ['deposits', /^deposit/],
  ['loans', /^loan/],
  ['projects', /^project/],
  ['currencies', /^(currencies|available|rates)$/],
  ['books', /^book/],
  ['tags', /^(tags|rules|rule-|bulk-preview)/],
  ['backup', /^(backup|restore|recovery)/],
  ['sync', /^(sync|device-link|conflict)/],
  ['notifications', /^notification/],
  ['access-settings', /^access-settings$/],
  ['locale-settings', /^(locale-settings|language)$/],
  ['base-settings', /^(api-|bot-|widget-|security-|landing|cloud-|directories|sms-|quick-input|template-edit)/]
];
function activeNav(id) {
  for (const group of wideNavGroups) for (const [route, , , ids] of group.items) if (id === route || ids.includes(id)) return route;
  const matched = navRules.find(([, pattern]) => pattern.test(id));
  if (!matched) return '';
  return matched[0] === 'op-fee' ? 'base-transfer' : matched[0];
}
function MobileNav({ id, wide = false }) {
  useLocale();
  if (id === 'base-welcome') return null;
  const current = activeNav(id);
  const add = <a className="add" href={go('base-expense')} aria-label="Новая операция"><Icon name="plus" size={22} /></a>;
  if (wide) return <nav className="phone-nav" aria-label="Навигация приложения">{add}{wideNavGroups.map(group => <div className="nav-group" key={group.label}><span className="nav-group-label">{t(group.label)}</span>{group.items.map(([route, title, icon]) => <a key={route} className={current === route ? 'selected' : ''} href={go(route)} aria-current={current === route ? 'page' : undefined}><Icon name={icon} /><span>{t(title)}</span></a>)}</div>)}</nav>;
  const onJournal = ['base-journal', 'receipt', 'qr-receipt', 'import-file', 'export-data'].includes(current);
  const onHome = current === 'base-accounts';
  const onMore = Boolean(current) && !onJournal && !onHome && current !== 'base-transfer';
  return <nav className="phone-nav" aria-label="Навигация приложения"><a className={onJournal ? 'selected' : ''} href={go('base-journal')} aria-current={onJournal ? 'page' : undefined}><Icon name="list" />{t('Журнал')}</a><a className={onHome ? 'selected' : ''} href={go('base-accounts')} aria-current={onHome ? 'page' : undefined}><Icon name="house" />{t('Главная')}</a>{add}<a className={onMore ? 'selected' : ''} href={go('base-settings')} aria-current={onMore ? 'page' : undefined}><Icon name="more" />{t('Ещё')}</a></nav>;
}
function Topline({ title, back, subtitle, accessory }) { return <div className={`mobile-topline ${back ? 'small' : ''}`}>{back ? <a className="circle-button" href={go(back)} aria-label="Назад"><Icon name="back" /></a> : <div><small>{subtitle}</small><h2>{title}</h2></div>}{back && <h2>{title}</h2>}{accessory || <span className="topline-spacer" />}</div>; }
function SectionHeading({ title, action, to }) { return <div className="mobile-section-heading"><h3>{title}</h3>{action && <a href={go(to)}>{action} <Icon name="chevron" size={17} /></a>}</div>; }
function OperationRow({ title, detail, amount, tone = '', kind = 'food', to = 'base-detail', href, tags = [] }) {
  const colors = Object.fromEntries(readTagRecords().map(item => [item.name, item.color]));
  return <a className="operation-row" href={href || go(to)}><span className={`operation-icon ${kind === 'food' ? 'food' : ''}`}><Icon name={kind} /></span><span className="operation-copy"><strong>{title}</strong><small>{detail}</small>{tags.length > 0 && <span className="operation-tags">{tags.map(tag => <em key={tag} style={colors[tag] ? { color: colors[tag], background: `${colors[tag]}22` } : undefined}>{tag}</em>)}</span>}</span><strong className={`operation-amount ${tone}`}>{amount}</strong></a>;
}
function Action({ children, to, secondary = false, danger = false }) { return <Button href={go(to)} variant={danger ? 'danger' : secondary ? 'secondary' : 'primary'} className="mobile-action" icon={!secondary && !danger ? <Icon name="arrow" size={18} /> : undefined}>{children}</Button>; }
function MoneyRows({ rows }) { return <div className="mobile-form-card">{rows.map(([label, value]) => <div className="mobile-data-line" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>; }

function Welcome() { return <WelcomeFlow />; }
function Accounts() {
  const first = getFirstAccount();
  const rows = getAccountRows();
  const primary = first && (rows.find(item => item.originalName === first.name || item.name === first.name) || first);
  return <><Topline title="Мои счета" subtitle="Личная история" accessory={<div className="topline-actions"><a className="circle-button" href={go('search')} aria-label="Поиск"><Icon name="search" /></a><a className="circle-button" href={go('base-settings')} aria-label="Настройки"><Icon name="settings" /></a></div>} /><div className="wide-split"><div className="wide-main"><MobileHero label={primary ? "Остаток основного счёта" : "Общий остаток"} amount={new Intl.NumberFormat('ru-RU').format(primary ? primary.balance : 11500)} currency={currencySymbol(primary ? primary.currency : 'RUB')} meta={primary ? 'Валюта счёта · ' + currencySymbol(primary.currency) : 'Все счета'} /><SectionHeading title="Счета" action="+ Добавить" to="createaccount" /><div className="account-grid">{rows.map(item => <AccountTile key={item.name} title={item.name} subtitle={item.multi ? item.type : item.type + ' · ' + currencySymbol(item.currency)} amount={item.multi ? item.currencies.map(currencySymbol).join(' · ') : new Intl.NumberFormat('ru-RU').format(item.balance) + ' ' + currencySymbol(item.currency)} href={`${go(`${item.multi ? 'pockets' : 'base-account'}?account=${encodeURIComponent(item.name)}`)}`} kind={item.icon || 'wallet'} />)}</div></div><aside className="wide-side"><div className="home-shortcuts"><a href={go('base-journal')}><Icon name="list" />Журнал</a><a href={go('budget')}><Icon name="budget" />Бюджет</a></div><SectionHeading title="Долги и накопления" /><div className="home-shortcuts"><a href={go('debts')}><Icon name="person" />Долги</a><a href={go('deposits')}><Icon name="deposit" />Вклады</a><a href={go('loans')}><Icon name="loan" />Кредиты</a></div><SectionHeading title="Последние операции" action="Все" to="base-journal" /><OperationRow title="Между своими счетами" detail="Наличные → Банковский счёт" amount="3 000 ₽" kind="transfer" /><OperationRow title="Продукты" detail="Пятёрочка" amount="−500 ₽" tone="negative" /></aside></div></>;
}
function Expense() { return <EntryFlow />; }
const demoOperations = [
  { id: 'op-13-products', day: '13 октября', date: '13.10.2026', title: 'Продукты', detail: 'Пятёрочка · Наличные', amount: '−1 240 ₽', tone: 'negative', kind: 'cart', group: 'Расход', account: 'Наличные', category: 'Продукты', tags: ['Дом'], period: 'Октябрь 2026' },
  { id: 'op-13-transfer', day: '13 октября', date: '13.10.2026', title: 'Между своими счетами', detail: 'Наличные → Банковский счёт', amount: '3 000 ₽', kind: 'transfer', group: 'Перевод', account: 'Наличные', category: '', tags: [], period: 'Октябрь 2026' },
  { id: 'op-13-debt', day: '13 октября', date: '13.10.2026', title: 'Возврат долга', detail: 'Анна вернула · Наличные', amount: '+200 ₽', tone: 'positive', kind: 'person', group: 'Долг', account: 'Наличные', category: 'Долг', tags: ['Семья'], period: 'Октябрь 2026', payer: 'Анна' },
  { id: 'op-12-salary', day: '12 октября', date: '12.10.2026', title: 'Зарплата', detail: 'Работа · Банковский счёт', amount: '+70 000 ₽', tone: 'positive', kind: 'briefcase', group: 'Доход', account: 'Банковский счёт', category: 'Зарплата', tags: ['Работа'], period: 'Октябрь 2026', payer: 'Работодатель' },
  { id: 'op-12-cafe', day: '12 октября', date: '12.10.2026', title: 'Кафе', detail: 'Завтрак · Наличные', amount: '−450 ₽', tone: 'negative', kind: 'cup', group: 'Расход', account: 'Наличные', category: 'Кафе', tags: ['Командировка'], period: 'Октябрь 2026' },
  { id: 'op-11-taxi', day: '11 октября', date: '11.10.2026', title: 'Такси', detail: 'Наличные', amount: '−320 ₽', tone: 'negative', kind: 'car', group: 'Расход', account: 'Наличные', category: 'Такси', tags: ['Командировка'], period: 'Октябрь 2026' },
  { id: 'op-11-transfer', day: '11 октября', date: '11.10.2026', title: 'На карту', detail: 'Банковский счёт → Наличные', amount: '5 000 ₽', kind: 'transfer', group: 'Перевод', account: 'Банковский счёт', category: '', tags: [], period: 'Октябрь 2026' },
  { id: 'op-10-rent', day: '10 октября', date: '10.10.2026', title: 'Аренда', detail: 'Жильё · Банковский счёт', amount: '−30 000 ₽', tone: 'negative', kind: 'house', group: 'Расход', account: 'Банковский счёт', category: 'Аренда', tags: ['Дом'], period: 'Октябрь 2026' },
  { id: 'op-10-timur', day: '10 октября', date: '10.10.2026', title: 'Возврат Тимуру', detail: 'Я вернул долг · Наличные', amount: '−1 500 ₽', tone: 'negative', kind: 'person', group: 'Долг', account: 'Наличные', category: 'Долг', tags: ['Семья'], period: 'Октябрь 2026' },
  { id: 'op-9-products', day: '9 октября', date: '09.10.2026', title: 'Продукты', detail: 'Пятёрочка · Наличные', amount: '−500 ₽', tone: 'negative', kind: 'cart', group: 'Расход', account: 'Наличные', category: 'Продукты', tags: ['Дом'], period: 'Октябрь 2026' },
  { id: 'op-9-side', day: '9 октября', date: '09.10.2026', title: 'Подработка', detail: 'Наличные', amount: '+2 000 ₽', tone: 'positive', kind: 'down', group: 'Доход', account: 'Наличные', category: 'Подработка', tags: ['Работа'], period: 'Октябрь 2026' },
  { id: 'op-8-anna', day: '8 октября', date: '08.10.2026', title: 'Долг Анне', detail: 'Выдал в долг · Наличные', amount: '−800 ₽', tone: 'negative', kind: 'person', group: 'Долг', account: 'Наличные', category: 'Долг', tags: ['Семья'], period: 'Октябрь 2026' },
  { id: 'op-8-utils', day: '8 октября', date: '08.10.2026', title: 'Коммунальные', detail: 'Жильё · Банковский счёт', amount: '−1 850 ₽', tone: 'negative', kind: 'bolt', group: 'Расход', account: 'Банковский счёт', category: 'Коммунальные', tags: ['Дом'], period: 'Октябрь 2026' }
];
export function operationsWithTags() {
  const saved = readOperationTags();
  return [...readCreatedOperations(), ...demoOperations].map(item => Object.prototype.hasOwnProperty.call(saved, item.id) ? { ...item, tags: saved[item.id] } : item);
}
function signedAmount(item) {
  if (item.group === 'Перевод') return 0;
  if (item.currency && item.currency !== 'RUB') return 0;
  if (item.amount && !String(item.amount).includes('₽')) return 0;
  const raw = String(item.amount || '').replace(/[\s\u00a0\u202f]/g, '').replace('−', '-').replace(/[^\d.+-]/g, '');
  const value = Number(raw);
  if (!Number.isFinite(value) || value === 0) return 0;
  if (item.tone === 'negative' || item.group === 'Расход' || item.group === 'Долг' && String(item.amount).includes('−')) return -Math.abs(value);
  if (item.tone === 'positive' || item.group === 'Доход' || String(item.amount).includes('+')) return Math.abs(value);
  return 0;
}
export function DayHeading({ day, rows }) {
  let spent = 0, received = 0;
  rows.forEach(item => { const value = signedAmount(item); if (value < 0) spent += -value; else if (value > 0) received += value; });
  const money = (value, sign) => `${sign}${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value)} ₽`;
  return <div className="mobile-group-title"><span className="day-label">{day}<small>{rows.length} {operationWord(rows.length)}</small></span>{(spent > 0 || received > 0) && <span className="day-totals">{spent > 0 && <b className="negative">{money(spent, '−')}</b>}{received > 0 && <b className="positive">{money(received, '+')}</b>}</span>}</div>;
}
export function operationWord(count) {
  const mod = count % 100, digit = count % 10;
  if (mod > 10 && mod < 20) return 'операций';
  if (digit === 1) return 'операция';
  if (digit > 1 && digit < 5) return 'операции';
  return 'операций';
}
export function operationDate(item) {
  const match = String(item.date || '').match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!match) return null;
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
}
export function matchesDateFilter(item, filter) {
  if (!filter?.from && !filter?.to) return true;
  const date = operationDate(item);
  if (!date) return false;
  const from = filter.from ? new Date(`${filter.from}T00:00:00`) : null;
  const to = filter.to ? new Date(`${filter.to}T00:00:00`) : null;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}
function formatFilterLabel(filter) {
  if (!filter?.from && !filter?.to) return '';
  const from = filter.from || filter.to;
  const to = filter.to || filter.from;
  return from === to ? formatIsoDate(from) : `${formatIsoDate(from)} – ${formatIsoDate(to)}`;
}
export function JournalDateFilter({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const label = formatFilterLabel(value);
  const openSheet = () => {
    setFrom(value?.from || '');
    setTo(value?.to && value.to !== value.from ? value.to : '');
    setOpen(true);
  };
  const pick = iso => {
    if (!from || to) { setFrom(iso); setTo(''); return; }
    if (iso === from) return;
    setTo(iso);
  };
  const apply = () => {
    let start = from;
    let end = to || from;
    if (start && end && start > end) [start, end] = [end, start];
    onChange(start ? { from: start, to: end } : null);
    setOpen(false);
  };
  return <><button type="button" className={`journal-date-filter${label ? ' active' : ''}`} onClick={openSheet}><Icon name="calendar" size={16} />{label || 'Даты'}</button>{open && <div className="flow-overlay journal-date-overlay" role="dialog" aria-label="Фильтр по датам"><div className="flow-sheet"><div className="sheet-head"><strong>Даты</strong><button type="button" onClick={() => setOpen(false)} aria-label="Закрыть">×</button></div><DateCalendar mode="range" from={from} to={to} onPick={pick} onRangeChange={(start, end) => { setFrom(start || ''); setTo(end && end !== start ? end : ''); }} /><button type="button" className="flow-primary date-calendar-apply" onClick={apply} disabled={!from}>{to ? 'Показать период' : 'Показать день'}</button>{(from || label) && <button type="button" className="flow-secondary" onClick={() => { onChange(null); setFrom(''); setTo(''); setOpen(false); }}>Сбросить</button>}</div></div>}</>;
}
const JOURNAL_MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
function rub(value) {
  return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(value))} ₽`;
}
function journalBuckets(scale, items) {
  const dated = items.map(item => ({ item, date: operationDate(item) })).filter(row => row.date);
  if (!dated.length) return [];
  const latest = dated.reduce((max, row) => row.date > max ? row.date : max, dated[0].date);
  const buckets = [];
  if (scale === 'week') {
    const start = new Date(latest);
    start.setDate(latest.getDate() - ((latest.getDay() + 6) % 7));
    for (let index = 0; index < 7; index += 1) {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      buckets.push({ key: String(index), label: `${String(day.getDate()).padStart(2, '0')}.${String(day.getMonth() + 1).padStart(2, '0')}`, from: day, to: day });
    }
  } else if (scale === 'year') {
    for (let month = 0; month < 12; month += 1) buckets.push({ key: String(month), label: JOURNAL_MONTHS[month], from: new Date(latest.getFullYear(), month, 1), to: new Date(latest.getFullYear(), month + 1, 0) });
  } else {
    const end = new Date(latest.getFullYear(), latest.getMonth() + 1, 0);
    let cursor = new Date(latest.getFullYear(), latest.getMonth(), 1);
    while (cursor <= end && buckets.length < 6) {
      const from = new Date(cursor);
      const to = new Date(cursor);
      to.setDate(cursor.getDate() + (6 - ((cursor.getDay() + 6) % 7)));
      if (to > end) to.setTime(end.getTime());
      buckets.push({ key: `${from.getDate()}`, label: from.getDate() === to.getDate() ? String(from.getDate()) : `${from.getDate()}–${to.getDate()}`, from, to });
      cursor = new Date(to);
      cursor.setDate(to.getDate() + 1);
    }
  }
  return buckets.map(bucket => ({ ...bucket, value: dated.filter(row => row.date >= bucket.from && row.date <= bucket.to).reduce((sum, row) => sum + Math.abs(signedAmount(row.item)), 0) }));
}
function categoryIconFor(item) {
  const known = new Set();
  Object.values(CATEGORY_TREE).forEach(groups => groups.forEach(parent => {
    known.add(parent.icon);
    parent.children.forEach(([, icon]) => known.add(icon));
  }));
  if (item.kind && known.has(item.kind)) return item.kind;
  for (const groups of Object.values(CATEGORY_TREE)) {
    for (const parent of groups) {
      if (parent.name === item.category) return parent.icon;
      const child = parent.children.find(([name]) => name === item.category);
      if (child) return child[1];
    }
  }
  return item.kind || 'wallet';
}
function categoryShares(items) {
  const grouped = new Map();
  items.forEach(item => {
    const value = Math.abs(signedAmount(item));
    if (!value) return;
    const label = item.category || item.title || 'Прочее';
    const current = grouped.get(label) || { label, value: 0, icon: categoryIconFor(item) };
    current.value += value;
    grouped.set(label, current);
  });
  return [...grouped.values()].sort((a, b) => b.value - a.value).map((item, index) => ({ ...item, color: chartPalette[index % chartPalette.length].hex }));
}
function JournalDonut({ segments }) {
  const total = segments.reduce((sum, item) => sum + item.value, 0) || 1;
  const radius = 72;
  const length = 2 * Math.PI * radius;
  let cursor = 0;
  const marks = [];
  return <div className="journal-donut"><svg viewBox="0 0 220 220" role="img" aria-label="Доли категорий">{segments.map(item => {
    const portion = item.value / total * length;
    const gap = portion > 8 ? 3 : 0;
    const dash = `${Math.max(portion - gap, 0)} ${length}`;
    const mid = cursor + portion / 2;
    const angle = -Math.PI / 2 + mid / length * Math.PI * 2;
    if (item.value / total >= 0.08) marks.push({ label: item.label, text: `${Math.round(item.value / total * 100)}%`, x: 110 + Math.cos(angle) * radius, y: 110 + Math.sin(angle) * radius });
    const node = <circle key={item.label} cx="110" cy="110" r={radius} fill="none" stroke={item.color} strokeWidth="34" strokeDasharray={dash} strokeDashoffset={-cursor} transform="rotate(-90 110 110)" />;
    cursor += portion;
    return node;
  })}{marks.map(mark => <text key={mark.label} x={mark.x} y={mark.y} textAnchor="middle" dominantBaseline="middle">{mark.text}</text>)}</svg></div>;
}
function JournalBars({ buckets, activeKey, onSelect }) {
  const width = 320, height = 168, left = 4, right = 58, top = 12, bottom = 24;
  const plotW = width - left - right, plotH = height - top - bottom;
  const peak = Math.max(1, ...buckets.map(item => item.value));
  const topValue = Math.ceil(peak * 1.15 / 1000) * 1000 || Math.ceil(peak * 1.15);
  const yOf = value => top + plotH - value / topValue * plotH;
  const active = buckets.find(item => item.key === activeKey) || [...buckets].sort((a, b) => b.value - a.value)[0];
  const slot = plotW / Math.max(1, buckets.length);
  const barW = Math.max(8, Math.min(26, slot * 0.62));
  const guide = active?.value > 0 ? active.value : null;
  return <svg className="journal-bars" viewBox={`0 0 ${width} ${height}`} role="group" aria-label="Сумма по периодам">
    <line className="journal-bars-grid" x1={left} x2={width - right} y1={yOf(0)} y2={yOf(0)} />
    <text x={width - right + 6} y={yOf(0) + 4}>0</text>
    <text x={width - right + 6} y={yOf(topValue) + 4}>{new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(topValue)}</text>
    {guide != null && <g><line className="journal-bars-guide" x1={left} x2={width - right} y1={yOf(guide)} y2={yOf(guide)} /><text className="journal-bars-value" x={width - right + 6} y={yOf(guide) + 4}>{new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(guide)}</text></g>}
    {buckets.map((item, index) => {
      const x = left + index * slot + (slot - barW) / 2;
      const barH = item.value > 0 ? Math.max(4, item.value / topValue * plotH) : 0;
      const y = top + plotH - barH;
      const radius = Math.min(5, barW / 2, barH / 2);
      const path = barH ? `M ${x} ${y + barH} L ${x} ${y + radius} Q ${x} ${y} ${x + radius} ${y} L ${x + barW - radius} ${y} Q ${x + barW} ${y} ${x + barW} ${y + radius} L ${x + barW} ${y + barH} Z` : '';
      return <g key={item.key} className={item.key === active?.key ? 'is-selected' : ''} role="button" tabIndex={0} onClick={() => onSelect(item.key)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(item.key); } }}><rect x={left + index * slot} y={top} width={slot} height={plotH} fill="transparent" />{path && <path d={path} />}<text x={left + index * slot + slot / 2} y={height - 6} textAnchor="middle">{item.label}</text></g>;
    })}
  </svg>;
}
function JournalChart({ kind, items, category, onCategory }) {
  const [view, setView] = useState('donut');
  const [scale, setScale] = useState('month');
  const [barKey, setBarKey] = useState(null);
  const shares = categoryShares(items);
  const buckets = journalBuckets(scale, items);
  if (!shares.length) return <section className="journal-chart"><p className="search-empty">В этом периоде нет таких операций.</p></section>;
  return <section className="journal-chart">
    <div className="journal-chart-head"><div className="journal-chart-switch" role="group" aria-label="Вид графика"><button type="button" className={view === 'donut' ? 'active' : ''} aria-pressed={view === 'donut'} onClick={() => setView('donut')}>Кольцо</button><button type="button" className={view === 'bars' ? 'active' : ''} aria-pressed={view === 'bars'} onClick={() => setView('bars')}>Столбцы</button></div></div>
    {view === 'donut' ? <JournalDonut segments={category ? shares.map(item => ({ ...item, color: item.label === category ? item.color : `${item.color}55` })) : shares} /> : <JournalBars buckets={buckets} activeKey={barKey} onSelect={setBarKey} />}
    {view === 'bars' && <div className="search-scopes journal-scale" role="group" aria-label="Масштаб">{[['week', 'Неделя'], ['month', 'Месяц'], ['year', 'Год']].map(([id, label]) => <button type="button" key={id} className={scale === id ? 'active' : ''} onClick={() => { setScale(id); setBarKey(null); }}>{label}</button>)}</div>}
    <div className="journal-shares">{shares.map(item => <button type="button" key={item.label} className={`journal-share${category === item.label ? ' active' : ''}`} aria-pressed={category === item.label} onClick={() => onCategory(category === item.label ? '' : item.label)}><i style={{ background: item.color }}><Icon name={item.icon} size={12} /></i><span>{item.label}</span><strong>{rub(item.value)}</strong></button>)}</div>
  </section>;
}
function Journal() {
  useLocale();
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const reportCategory = params.get('category') || '';
  const reportPeriod = params.get('period') || '';
  const reportAccount = params.get('account') || '';
  const reportKind = params.get('kind') || '';
  const reportFrom = params.get('from') || '';
  const reportTo = params.get('to') || '';
  const hasReportFilter = Boolean(reportCategory || reportPeriod || reportAccount || reportKind || reportFrom);
  const book = readBooks();
  const bookName = book.items.find(item => item.id === book.active)?.name || 'Личные финансы';
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState(['Расход', 'Доход', 'Перевод', 'Долг'].includes(reportKind) ? reportKind : 'Все');
  const [dates, setDates] = useState(reportFrom ? { from: reportFrom, to: reportTo || reportFrom } : null);
  const [facet, setFacet] = useState({ ...emptyJournalFilters, category: reportCategory, account: reportAccount && reportAccount !== 'Все счета' ? reportAccount : '' });
  const [openKind, setOpenKind] = useState(null);
  const operations = operationsWithTags();
  const matches = item =>
    (item.book || 'personal') === (book.active || activeBookId()) &&
    matchesDateFilter(item, dates) &&
    (!facet.account || item.account === facet.account) &&
    (!facet.payer || (item.payer || 'Я') === facet.payer) &&
    operationInProject(facet.project, item.id) &&
    (!(facet.tags || []).length || (facet.tags || []).every(tag => (item.tags || []).includes(tag))) &&
    (dates || !reportPeriod || item.period === reportPeriod) &&
    `${item.title} ${item.detail} ${item.amount} ${item.day} ${(item.tags || []).join(' ')} ${item.payer || ''}`.toLowerCase().includes(query.toLowerCase());
  const pool = operations.filter(matches);
  const shown = pool.filter(item => {
    if (facet.category && item.category !== facet.category) return false;
    if (openKind) {
      const amount = signedAmount(item);
      return amount !== 0 && (openKind === 'Расход' ? amount < 0 : amount > 0);
    }
    return group === 'Все' || item.group === group;
  });
  const moneyItems = kind => pool.filter(item => signedAmount(item) !== 0 && (kind === 'Расход' ? signedAmount(item) < 0 : signedAmount(item) > 0));
  const expense = moneyItems('Расход').reduce((sum, item) => sum + Math.abs(signedAmount(item)), 0);
  const income = moneyItems('Доход').reduce((sum, item) => sum + signedAmount(item), 0);
  const meter = Math.max(expense, income, 1);
  const days = [...new Set(shown.map(item => item.day))];
  return <><Topline title={t('Журнал')} subtitle={bookName} accessory={<a className="circle-button" href={go('base-expense')} aria-label="Новая операция"><Icon name="plus" /></a>} />{hasReportFilter && <div className="journal-filter-note"><span>Из отчёта: {[reportCategory, formatFilterLabel(dates), reportAccount !== 'Все счета' ? reportAccount : '', reportKind].filter(Boolean).join(' · ')}</span><a href={go('base-journal')}>Сбросить</a></div>}<div className="journal-search-row"><label className="app-search"><Icon name="search" size={18} /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Поиск по операциям" aria-label="Поиск по операциям" /></label><JournalDateFilter value={dates} onChange={setDates} /><JournalFilterButton value={facet} onChange={setFacet} /></div><JournalFilterChips value={facet} onChange={setFacet} /><div className="search-scopes" role="group" aria-label="Тип операции">{['Все','Расход','Доход','Перевод','Долг'].map(value => <button type="button" key={value} className={group === value ? 'active' : ''} onClick={() => { setGroup(value); setOpenKind(value === 'Расход' || value === 'Доход' ? value : null); }}>{value}</button>)}</div><div className="journal-totals">{[['Расход', expense], ['Доход', income]].map(([kind, value]) => <button type="button" key={kind} className={`journal-total${openKind === kind ? ' active' : ''}`} aria-pressed={openKind === kind} onClick={() => { const next = openKind === kind ? null : kind; setOpenKind(next); setGroup(next || 'Все'); }}><strong>{rub(value)}</strong><small>{kind === 'Расход' ? 'Расходы' : 'Доходы'}</small><span className="journal-total-bar"><i style={{ width: `${value / meter * 100}%` }} /></span></button>)}</div>{openKind && <JournalChart kind={openKind} items={moneyItems(openKind)} category={facet.category} onCategory={value => setFacet({ ...facet, category: value })} />}{days.length ? days.map(day => { const rows = shown.filter(item => item.day === day); return <div className="journal-day" key={day}><DayHeading day={day} rows={rows} /><div className="ledger-card journal-ledger">{rows.map(item => <OperationRow key={item.id} {...item} href={`${go(`base-detail?op=${item.id}`)}`} />)}</div></div>; }) : <p className="search-empty">В книге «{bookName}» нет операций по этому фильтру</p>}<p className="mobile-hint">В журнале все факты открытой книги: расход, доход, перевод и долг.</p></>;
}
function Transfer() { return <EntryFlow initialKind="Перевод" />; }
function Detail() {
  const id = new URLSearchParams(window.location.hash.split('?')[1] || '').get('op') || 'op-9-products';
  const item = operationsWithTags().find(operation => operation.id === id) || demoOperations.find(operation => operation.id === 'op-9-products');
  const [tags, setTags] = useState(item.tags || []);
  const [picking, setPicking] = useState(false);
  return <><Topline title="Операция" back="base-journal" /><div className="detail-hero"><span className="detail-icon"><Icon name={item.kind} size={29} /></span><h3>{item.title}</h3><strong className={item.tone === 'negative' ? 'detail-amount--expense' : ''}>{item.amount}</strong></div><div className="mobile-form-card"><div className="mobile-data-line"><span>Счёт</span><strong>{item.account}</strong></div><div className="mobile-data-line"><span>Категория</span><strong>{item.category || 'Перевод'}</strong></div><button type="button" className="mobile-data-line tag-edit" onClick={() => setPicking(true)}><span>Теги</span><strong>{tags.length ? tags.join(' · ') : 'Выбрать'}</strong></button><div className="mobile-data-line"><span>Дата</span><strong>{item.date}</strong></div><div className="mobile-data-line"><span>Заметка</span><strong>{item.detail.split(' · ')[0]}</strong></div></div>{item.id === 'op-9-products' && <><SectionHeading title="Доли участников" /><div className="mobile-info-card"><p>Анна должна 200 ₽ · Тимур должен 150 ₽ · Я оплатил 150 ₽</p><a href={go('share-link')}>Получить ссылку для участников →</a></div></>}<SectionHeading title="История операции" /><div className="timeline"><p>Создана операция</p><small>{item.date} · на этом устройстве</small></div><Action to="base-expense">Изменить</Action><Action to="share-link" secondary>Поделиться расчётом</Action><Action to="base-cancel" danger>Отменить операцию</Action>{picking && <TagPicker selected={tags} onApply={next => { writeOperationTags(item.id, next); setTags(next); setPicking(false); }} onClose={() => setPicking(false)} />}</>;
}
function formatSigned(value, currency) {
  const sign = value > 0 ? '+' : '−';
  return `${sign}${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(Math.abs(value))} ${currencySymbol(currency)}`;
}
function AccountActualize({ account, onClose }) {
  const [mode, setMode] = useState('final');
  const [direction, setDirection] = useState('income');
  const [value, setValue] = useState('');
  const [calc, setCalc] = useState(false);
  const entered = Number(String(value).replace(/\s/g, '').replace(',', '.'));
  const ready = Number.isFinite(entered) && value !== '';
  const delta = !ready ? null : mode === 'final' ? Math.round((entered - account.balance) * 100) / 100 : Math.round((direction === 'expense' ? -entered : entered) * 100) / 100;
  const nextBalance = delta === null ? account.balance : Math.round((account.balance + delta) * 100) / 100;
  const save = () => {
    if (!delta) return;
    applyAccountAdjustment(account.name, delta);
    const now = new Date();
    const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
    rememberOperation({
      id: `op-adjust-${Date.now()}`,
      day: `${now.getDate()} ${months[now.getMonth()]}`,
      date: `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`,
      title: 'Актуализация счёта',
      detail: `${account.name} · стало ${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(nextBalance)} ${currencySymbol(account.currency)}`,
      amount: formatSigned(delta, account.currency),
      tone: delta > 0 ? 'positive' : 'negative',
      kind: 'check',
      group: delta > 0 ? 'Доход' : 'Расход',
      account: account.name,
      category: delta > 0 ? 'Другие доходы' : 'Прочее',
      tags: [],
      period: 'Октябрь 2026',
      currency: account.currency
    });
    window.location.hash = go('base-journal');
  };
  return <div className="flow-overlay" role="dialog" aria-label="Актуализировать счёт"><div className="flow-sheet"><div className="sheet-head"><strong>Актуализировать счёт</strong><button type="button" onClick={onClose} aria-label="Закрыть">×</button></div><p className="flow-caption">Укажите, сколько денег сейчас на «{account.name}». Если в журнале чего-то не хватает, разница сохранится отдельной операцией и не перепишет старые записи.</p><div className="mobile-data-line"><span>Сейчас по учёту</span><strong>{new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(account.balance)} {currencySymbol(account.currency)}</strong></div><div className="entry-tabs" role="tablist" aria-label="Способ актуализации"><button type="button" className={mode === 'final' ? 'active' : ''} onClick={() => setMode('final')}>Сколько сейчас</button><button type="button" className={mode === 'delta' ? 'active' : ''} onClick={() => setMode('delta')}>Добавить сумму</button></div>{mode === 'delta' && <div className="entry-tabs" role="tablist" aria-label="Куда отнести сумму"><button type="button" className={direction === 'income' ? 'active' : ''} onClick={() => setDirection('income')}>Приход</button><button type="button" className={direction === 'expense' ? 'active' : ''} onClick={() => setDirection('expense')}>Расход</button></div>}<button type="button" className="flow-row" onClick={() => setCalc(true)}><span>{mode === 'final' ? 'Итог на счёте' : 'Сумма'}</span><strong>{ready ? `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(entered)} ${currencySymbol(account.currency)}` : 'Открыть калькулятор'}</strong></button>{delta === 0 && <p className="flow-caption">Остаток уже совпадает. Операция не нужна.</p>}{delta ? <p className="flow-caption">В журнале появится {delta > 0 ? 'доход' : 'расход'} «Актуализация счёта» на {formatSigned(delta, account.currency)}. Новый остаток {new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(nextBalance)} {currencySymbol(account.currency)}.</p> : null}<button type="button" className="flow-primary" disabled={!delta} onClick={save}>Сохранить актуализацию</button></div>{calc && <Calculator value={value || '0'} onApply={next => { setValue(next); setCalc(false); }} onClose={() => setCalc(false)} />}</div>;
}
function Account() {
  const requested = new URLSearchParams(window.location.hash.split('?')[1] || '').get('account');
  const first = getFirstAccount();
  const rows = getAccountRows();
  const account = rows.find(item => item.name === requested) || (!requested && first ? rows.find(item => item.name === first.name) : null) || rows.find(item => item.name === 'Наличные') || rows[0];
  const [open, setOpen] = useState(false);
  if (!account) return <><Topline title="Счёт" back="base-accounts" /><p className="mobile-hint">Счетов пока нет.</p></>;
  const operations = operationsWithTags().filter(item => item.account === account.name);
  return <><Topline title={account.name} back="base-accounts" /><MobileHero label="Остаток по учёту" amount={new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(account.balance)} currency={currencySymbol(account.currency)} meta={`Валюта счёта · ${currencySymbol(account.currency)}`} /><div className="mobile-tabs"><a href={go('base-expense')}>− Расход</a><a href={go('base-expense')}>+ Доход</a><a href={go('base-transfer')}>Перевод</a></div><Button variant="secondary" className="mobile-action" onClick={() => setOpen(true)}>Актуализировать счёт</Button>{operations.length > 0 && <><SectionHeading title="Операции по счёту" /><div className="ledger-card">{operations.slice(0, 6).map(item => <OperationRow key={item.id} {...item} href={`${go(`base-detail?op=${item.id}`)}`} />)}</div></>}<SectionHeading title="Связанные продукты" /><AccountTile title="Вклад TBC · USD" subtitle="Начислено +145 $" amount="10 145 $" href={go('deposit-detail')} kind="deposit" /><AccountTile title="Ипотека TBC" subtitle="Платёж 820 $ со счёта" amount="48 000 $" href={go('loan-detail')} kind="loan" /><p className="mobile-hint">Вклад не входит в доступный остаток до выплаты. Кредит показан как отдельное обязательство.</p>{open && <AccountActualize account={account} onClose={() => setOpen(false)} />}</>;
}
function Cancel() { return <><Topline title="Отмена операции" back="base-detail" /><div className="detail-hero"><span className="detail-icon"><Icon name="clock" size={30} /></span><h3>Убрать из расчёта?</h3><strong>500 ₽</strong></div><p className="mobile-hint">Запись останется в истории. Её сумма перестанет влиять на остатки и итоги.</p><MoneyRows rows={[["Счёт", "Наличные"],["Сейчас", "8 500 ₽"],["После отмены", "9 000 ₽"]]} /><Action to="base-detail">Отменить операцию</Action><Action to="base-detail" secondary>Оставить как есть</Action></>; }
function Settings() {
  useLocale();
  const [editor, setEditor] = useState(null);
  const modules = [
    ['Долги', 'debts', 'person', 'Мне должны и я должен'], ['Вклады', 'deposits', 'deposit', 'Ставки, начисления и сроки'], ['Кредиты', 'loans', 'loan', 'Платежи и остаток долга'],
    ['Подписки', 'subscriptions', 'clock', 'Регулярные платежи'], ['Совместные расходы', 'together', 'person', 'Доли и долги участников'],
    ['Импорт и экспорт', 'import-file', 'list', 'Файлы, столбцы и дубли'],
    ['Резервная копия', 'backup', 'shield', 'Зашифрованная копия книги'], ['Синхронизация устройств', 'sync', 'transfer', 'Доверенные устройства'],
    ['Книги учёта', 'books', 'wallet', 'Несколько независимых книг'],
    ['Цели и резервы', 'goals', 'target', 'Накопления без лишнего расхода'], ['Уведомления', 'notifications', 'clock', 'Пороги бюджета и платежи'],
    ['Интеграции и боты', 'bot-setup', 'person', 'Команды с подтверждением']
  ];
  const products = ['Долги', 'Вклады', 'Кредиты'];
  return <><Topline title={t('Настройки')} accessory={<a className="circle-button" href={go('search')} aria-label="Поиск"><Icon name="search" /></a>} /><div className="settings-block settings-theme"><SectionHeading title={t('Тема')} /><ThemeChoice /></div><div className="settings-block"><SectionHeading title={t('Справочники')} /><div className="settings-group"><a href={go('currencies')}><Icon name="wallet" /><span><strong>Валюты и курсы</strong><small>Базовая валюта и ручные курсы</small></span><Icon name="chevron" size={17} /></a><button type="button" onClick={() => setEditor('account')}><Icon name="bank" /><span><strong>Счета</strong><small>Названия, валюты и остатки</small></span><Icon name="chevron" size={17} /></button><button type="button" onClick={() => setEditor('category')}><Icon name="tag" /><span><strong>Категории</strong><small>Доходы, расходы и иконки</small></span><Icon name="chevron" size={17} /></button><button type="button" onClick={() => setEditor('payer')}><Icon name="person" /><span><strong>Плательщики</strong><small>Люди и участники</small></span><Icon name="chevron" size={17} /></button><a href={go('projects')}><Icon name="briefcase" /><span><strong>Проекты</strong><small>Операции и итоги по проекту</small></span><Icon name="chevron" size={17} /></a><a href={go('tags')}><Icon name="tag" /><span><strong>Теги и правила</strong><small>Метки и цвета</small></span><Icon name="chevron" size={17} /></a></div></div><div className="settings-block"><SectionHeading title={t('Счета и обязательства')} /><div className="settings-group">{modules.filter(([title]) => products.includes(title)).map(([title, route, icon, hint]) => <a href={go(route)} key={route}><Icon name={icon} /><span><strong>{t(title)}</strong><small>{hint}</small></span><Icon name="chevron" size={17} /></a>)}</div></div><div className="settings-block"><SectionHeading title={t('Модули')} /><div className="settings-group">{modules.filter(([title]) => !products.includes(title)).map(([title, route, icon, hint]) => <a href={go(route)} key={route}><Icon name={icon} /><span><strong>{t(title)}</strong><small>{hint}</small></span><Icon name="chevron" size={17} /></a>)}</div></div><div className="settings-block"><SectionHeading title={t('Данные и доступ')} /><div className="settings-group"><a href={go('access-settings')}><Icon name="shield" /><span><strong>{t('Приватность и доступ')}</strong><small>Код и скрытие сумм</small></span><Icon name="chevron" size={17} /></a><a href={go('locale-settings')}><Icon name="settings" /><span><strong>{t('Язык и отображение')}</strong><small>Язык, дата и плотность списков</small></span><Icon name="chevron" size={17} /></a></div></div>{editor && <DirectoryEditor type={editor} onClose={() => setEditor(null)} />}</>;
}
function GlobalSearch() {
  const [query, setQuery] = useState(''), [scope, setScope] = useState('Всё');
  const index = [
    ...operationsWithTags().map(item => ({ title: item.title, detail: `${item.detail} · ${item.amount}${(item.tags || []).length ? ` · ${item.tags.join(', ')}` : ''}`, group: 'Операции', to: `base-detail?op=${item.id}`, icon: item.kind || 'food' })),
    ...getAccountRows().map(item => ({ title: item.name, detail: item.type, group: 'Счета', to: item.multi ? 'pockets' : 'base-account', icon: item.icon || 'wallet' })),
    ...['Расход', 'Доход'].flatMap(kind => CATEGORY_TREE[kind].flatMap(parent => parent.children.map(([name, icon]) => ({ title: name, detail: kind + ' · ' + parent.name, group: 'Справочники', to: 'base-settings', icon })))),
    ...readDirectory().categories.map(item => ({ title: item.name, detail: item.kind + ' · ' + item.parent, group: 'Справочники', to: 'base-settings', icon: item.icon || 'star' })),
    ...readPayers().map(name => ({ title: name, detail: 'Плательщик', group: 'Справочники', to: 'base-settings', icon: 'person' })),
    ...readSettings().currencies.map(code => ({ title: code, detail: 'Валюта · ' + currencySymbol(code), group: 'Справочники', to: 'currencies', icon: 'wallet' })),
    ...screens.filter(item => !item.id.startsWith('base-')).map(item => ({ title: item.title, detail: item.subtitle, group: 'Экраны', to: item.id, icon: 'search' })),
    { title: 'Настройки', detail: 'Справочники и параметры', group: 'Экраны', to: 'base-settings', icon: 'settings' }
  ];
  const shown = index.filter(item => (scope === 'Всё' || item.group === scope) && `${item.title} ${item.detail}`.toLowerCase().includes(query.toLowerCase())).slice(0, 20);
  return <><Topline title="Поиск" back="base-accounts" /><label className="app-search"><Icon name="search" size={18} /><input autoFocus type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Операции, счета, разделы" aria-label="Поиск по приложению" /></label><div className="search-scopes" role="group" aria-label="Искать в">{['Всё','Операции','Счета','Справочники','Экраны'].map(value => <button type="button" key={value} className={scope === value ? 'active' : ''} onClick={() => setScope(value)}>{value}</button>)}</div><div className="search-results">{shown.map((item, index) => <a href={go(item.to)} key={`${item.group}-${item.title}-${index}`}><span className="category-icon"><Icon name={item.icon} size={18} /></span><span><strong>{item.title}</strong><small>{item.detail}</small></span><Icon name="chevron" size={16} /></a>)}{!shown.length && <p className="search-empty">Ничего не найдено</p>}</div></>;
}
const coreViews = { ...workViews, currencies:CurrenciesFlow,available:CurrenciesFlow,rates:CurrenciesFlow,createaccount:AccountCreateFlow,pockets:PocketsFlow,reports:Journal,pie:Journal,enreports:Journal,budget:BudgetFlow,budgetedit:BudgetFlow,deposits:DepositFlow,'deposit-new':DepositFlow,'deposit-detail':DepositFlow,'deposit-payout':DepositFlow,loans:LoanFlow,'loan-calc':LoanFlow,'loan-detail':LoanFlow,'loan-schedule':LoanFlow,'loan-pay':LoanFlow,'loan-pay-preview':LoanFlow,debts:DebtFlow,'debt-new':DebtFlow,'debt-detail':DebtFlow,'debt-repay':DebtFlow,'debt-repay-preview':DebtFlow,search:GlobalSearch,'base-welcome':Welcome,'base-accounts':Accounts,'base-expense':Expense,'base-journal':Journal,'journal-filters':Journal,'base-transfer':Transfer,'base-detail':Detail,'base-account':Account,'base-cancel':Cancel,'base-settings':Settings};
function fieldIcon(label) {
  const lower = label.toLowerCase();
  if (/дата|срок|время|период|календар/.test(lower)) return 'calendar';
  if (/сч[её]т|кошел|книг/.test(lower)) return 'wallet';
  if (/категор|тег/.test(lower)) return 'tag';
  if (/человек|участ|платель|владел|контакт/.test(lower)) return 'person';
  if (/сумм|лимит|остаток|плат|цена|доход|расход|оценк/.test(lower)) return 'chart';
  if (/валют|курс/.test(lower)) return 'transfer';
  if (/файл|импорт|экспорт|копи/.test(lower)) return 'list';
  return 'note';
}
function progressPair(value) {
  const match = String(value || '').match(/^(.+?)\s+из\s+(.+)$/);
  if (!match) return null;
  const read = part => Number(String(part).replace(/[^\d,.]/g, '').replace(',', '.')) || 0;
  const total = read(match[2]);
  if (!total) return null;
  return { current: match[1].trim(), total: match[2].trim(), ratio: Math.max(0, Math.min(100, Math.round(read(match[1]) / total * 100))) };
}
function overviewClass(id) {
  if (/loan|budget|forecast|calendar|subscription/.test(id)) return ' desktop-overview--loans';
  if (/debt|goal|notif/.test(id)) return ' desktop-overview--debts';
  if (/import|sync|backup|report|review|export/.test(id)) return ' desktop-overview--reports';
  return '';
}
function isBackAction(value) { return /^(назад|вернуться)(?:\s|$)/i.test(String(value || '').trim()); }
function isResultScreen(id) { return /preview$|result$|-diff$|explain$|undo$|revoke$|^conflict$|share-conflict$/.test(id); }
function isFactField(screen, field) {
  if (isResultScreen(screen.id)) return true;
  return /поступит|чистый расход|бюджет периода|не найдено|ожидает проведения|не совпала|будет изменено|найдено записей|пропущено|новые записи|совпадения|вложения|последстви|моя версия|другая версия|итого|нераспредел|остаток по уч[её]ту|остаток по плану|прогноз|начислен|экономия|подтвержд[её]нн|новое предложение|затронуто|долг до|долг после|полученн|новый остаток/i.test(field.value);
}
const trailKey = 'finance-design-screen-trail';
function readTrail() {
  try {
    const value = JSON.parse(sessionStorage.getItem(trailKey) || '[]');
    return Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
  } catch {
    return [];
  }
}
function noteVisit(id) {
  if (!id) return;
  const trail = readTrail();
  if (trail[trail.length - 1] === id) return;
  trail.push(id);
  try { sessionStorage.setItem(trailKey, JSON.stringify(trail.slice(-40))); } catch { /* возврат останется по подписи экрана */ }
}
function visitedBefore(id) {
  const trail = readTrail();
  const index = trail.lastIndexOf(id);
  return index > 0 ? trail[index - 1] : '';
}
function contextBack(screen, actions) {
  const visited = visitedBefore(screen.id);
  if (visited && screens.some(item => item.id === visited)) return visited;
  const explicit = actions.find(item => isBackAction(item.value) && item.target);
  return explicit ? explicit.target : '';
}
function moneyParts(text) {
  const source = String(text ?? '');
  const match = source.match(/([+\-−])?\s*(\d[\d\s\u00a0]*(?:[,.]\d+)?)/);
  if (!match) return null;
  const amount = Number(match[2].replace(/[\s\u00a0]/g, '').replace(',', '.'));
  if (!Number.isFinite(amount)) return null;
  const sign = match[1] === '-' || match[1] === '−' ? -1 : 1;
  const suffix = source.slice((match.index || 0) + match[0].length).match(/^\s*(%|[₽$€₾£₫₩]|[A-Z]{3})/);
  return { abs: amount, suffix: suffix ? suffix[1] : '', negative: sign < 0 };
}
function formatMoney(value, suffix) {
  const formatted = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(Math.abs(value));
  const body = suffix ? `${formatted} ${suffix}` : formatted;
  return value < 0 ? `−${body}` : body;
}
function sourceAmount(screenId, label) {
  const source = screens.find(item => item.id === screenId);
  const field = source?.elements.find(item => item.type === 'input' && item.value === label);
  return moneyParts(readScreenDraft(screenId, label, field?.target ?? ''));
}
function presentScreen(screen) {
  const fields = screen.elements.filter(item => item.type === 'input').map(field => ({ ...field, target: readScreenDraft(screen.id, field.value, field.target) }));
  if (screen.id === 'op-refund-preview') {
    const purchase = sourceAmount('op-refund', 'Исходная покупка');
    const refund = sourceAmount('op-refund', 'Сумма возврата');
    if (!purchase || !refund) return { fields, saveBlocked: false, extraNote: '' };
    const suffix = refund.suffix || purchase.suffix || '₽';
    const net = Math.round((purchase.abs - refund.abs) * 100) / 100;
    const incoming = formatMoney(refund.abs, suffix);
    const map = { 'Поступит на счёт': incoming, 'Чистый расход покупки': formatMoney(net, suffix), 'Бюджет периода': formatMoney(-refund.abs, suffix) };
    const blocked = refund.abs > purchase.abs;
    return {
      fields: fields.map(field => (map[field.value] ? { ...field, target: map[field.value] } : field)),
      saveBlocked: blocked,
      extraNote: blocked ? 'Сумма возврата больше исходной покупки. Подтверждение недоступно, пока возврат не станет меньше или равен покупке.' : `На счёт поступит ${incoming}. Чистый расход покупки — ${formatMoney(net, suffix)}.`
    };
  }
  if (screen.id === 'reconcile-diff') {
    const statement = sourceAmount('reconcile', 'Остаток по выписке');
    const book = sourceAmount('reconcile', 'Остаток по учёту');
    if (!statement || !book) return { fields, saveBlocked: false, extraNote: '' };
    const gap = Math.round((statement.abs - book.abs) * 100) / 100;
    const shown = formatMoney(gap, statement.suffix || book.suffix || '$');
    return {
      fields: fields.map(field => (/не найдено/i.test(field.value) ? { ...field, target: shown } : field)),
      saveBlocked: false,
      extraNote: `Не найдено в журнале: ${shown}.`
    };
  }
  if (screen.id === 'op-split') {
    const originalTotal = moneyParts(screen.elements.find(item => item.type === 'input' && item.value === 'Итог покупки')?.target);
    const originalGap = moneyParts(screen.elements.find(item => item.type === 'input' && item.value === 'Нераспределено')?.target);
    const currentTotal = moneyParts(fields.find(field => field.value === 'Итог покупки')?.target);
    if (!originalTotal || !originalGap || !currentTotal) return { fields, saveBlocked: true, extraNote: '' };
    const allocated = Math.round((originalTotal.abs - originalGap.abs) * 100) / 100;
    const remainder = Math.round((currentTotal.abs - allocated) * 100) / 100;
    const shown = formatMoney(remainder, currentTotal.suffix || originalGap.suffix || '₽');
    return {
      fields: fields.map(field => (field.value === 'Нераспределено' ? { ...field, target: shown } : field)),
      saveBlocked: remainder !== 0,
      extraNote: remainder === 0 ? 'Сумма частей сходится с итогом. Разделение можно сохранить.' : ''
    };
  }
  return { fields, saveBlocked: false, extraNote: '' };
}
function actionClass(value, primary) {
  if (/^(отозвать|удалить)(?:\s|$)/i.test(value)) return 'flow-danger';
  if (!primary.used && /^(подтвердить|сохранить|применить|создать|импортировать|записать|добавить корректировку|выбрать мою версию)(?:\s|$)/i.test(value)) {
    primary.used = true;
    return 'flow-primary';
  }
  return 'flow-secondary';
}
function FactLine({ label, value, icon }) {
  return <div className="fact-row fact-static"><span className="fact-icon"><Icon name={icon} size={16} /></span><span className="fact-copy"><small>{label}</small><strong>{value || '—'}</strong></span></div>;
}
function Extended({ screen }) {
  useScreenDrafts();
  const preview = presentScreen(screen);
  const fields = preview.fields;
  const notes = screen.elements.filter(item => item.type === 'text').filter(note => preview.saveBlocked || !/сохранен\p{L}*\s+недоступн/iu.test(note.value));
  const actions = screen.elements.filter(item => item.type === 'action');
  const back = contextBack(screen, actions);
  const shown = actions.filter(item => !(back && isBackAction(item.value) && item.target === back));
  const headline = fields.find(field => /^[+\-−]?\d[\d\s\u00a0]*(?:[,.]\d+)?\s*(?:%|[₽$€₾£₫₩]|[A-Z]{3})?$/.test(String(field.target || '').trim()) && !/дата|сумм|лимит|ставк|количеств|порог|комисс|плат|цена|процент|остаток по выписке|остаток по уч|итог покупки/i.test(field.value));
  const body = fields.filter(field => field !== headline);
  const facts = body.filter(field => !progressPair(field.target) && isFactField(screen, field));
  const inputs = body.filter(field => !facts.includes(field));
  const checkTitle = isResultScreen(screen.id) ? 'Проверка' : 'Что произойдёт';
  const primary = { used: false };
  const cardTitle = body.length && body.every(field => progressPair(field.target)) ? 'Прогресс' : facts.length && !inputs.length ? 'Итог' : 'Состав';
  const blockCommit = item => preview.saveBlocked && /^(подтвердить|сохранить)(?:\s|$)/i.test(item.value);
  return <>
    <Topline title={screen.title} back={back || undefined} />
    {headline && <div className={`desktop-overview${overviewClass(screen.id)}`}><div><small>{headline.value}</small><strong>{headline.target}</strong></div></div>}
    {screen.subtitle ? <p className="flow-caption">{screen.subtitle}</p> : null}
    <div className={`scenario-layout${body.length ? ' has-fields' : ''}`}>
      {body.length > 0 && <section className="mobile-portfolio-card scenario-fields"><div className="desktop-card-head"><div><span className="desktop-card-kicker">{facts.length && !inputs.length ? 'Рассчитано' : 'Личная книга'}</span><h3>{cardTitle}</h3></div><span>{body.length}</span></div><div className="module-body">{facts.length > 0 && inputs.length > 0 && <p className="scenario-kicker">Уже рассчитано</p>}{facts.map((field, index) => <FactLine key={`fact-${field.value}-${index}`} label={field.value} value={field.target} icon={fieldIcon(field.value)} />)}{inputs.length > 0 && facts.length > 0 && <p className="scenario-kicker">Можно изменить</p>}{inputs.map((field, index) => {
        const progress = progressPair(field.target);
        if (progress) return <article className="goal-card" key={`${field.value}-${index}`}><header><strong>{field.value.replace(/^Цель [«"]|[»"]$/g, '')}</strong><b>{progress.ratio}%</b></header><small>{progress.current} из {progress.total}</small><div className="desktop-loan-track"><span style={{ width: `${progress.ratio}%` }} /></div></article>;
        return <PrototypeField key={`${field.value}-${index}`} screenId={screen.id} label={field.value} value={field.target || ''} icon={fieldIcon(field.value)} />;
      })}</div></section>}
      {(notes.length > 0 || preview.extraNote || shown.length > 0 || screen.id === 'op-split') && <aside className="scenario-side">{(notes.length > 0 || preview.extraNote) && <section className="scenario-check"><h3>{checkTitle}</h3>{notes.map(note => <p key={note.value}>{note.value}</p>)}{preview.extraNote && <p>{preview.extraNote}</p>}</section>}{(shown.length > 0 || screen.id === 'op-split') && <div className="scenario-actions">{screen.id === 'op-split' && (preview.saveBlocked ? <button type="button" className="flow-primary" disabled>Сохранить</button> : <a className="flow-primary" href={go('base-journal')}>Сохранить</a>)}{shown.map(item => blockCommit(item) ? <button type="button" key={item.value} className={actionClass(item.value, primary)} disabled>{item.value}</button> : <a key={item.value} className={actionClass(item.value, primary)} href={go(item.target)}>{item.value}</a>)}</div>}</aside>}
    </div>
  </>;
}
export default function Phone({ screen, form = 'phone' }) {
  noteVisit(screen.id);
  const wide = form === 'tablet' || form === 'desktop';
  const View = coreViews[screen.id] || coverageViews[screen.id] || captureViews[screen.id];
  return <article className={`phone${wide ? ' phone-wide' : ''} phone-form-${form}`} data-screen={screen.id} data-form={form}>{form === 'desktop' ? <WindowBar /> : <StatusBar />}<div className="phone-workspace">{wide && <MobileNav id={screen.id} wide />}<div className="phone-scroll" key={screen.id}>{View ? <View screen={screen} /> : <Extended screen={screen} />}</div></div>{!wide && <MobileNav id={screen.id} />}{form === 'phone' && <div className="home-indicator" />}</article>;
}
