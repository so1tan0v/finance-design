import React, { useState } from 'react';
import { AccountTile, Badge, Button, Icon, MobileFormField, MobileHero, Notice, Progress, screenHref } from './ui.jsx';
import { WelcomeFlow, EntryFlow, CurrenciesFlow, AccountCreateFlow, PocketsFlow, ReportsFlow, BudgetFlow, DepositFlow, LoanFlow, DebtFlow, DirectoryEditor, PrototypeField, TagPicker, CATEGORY_TREE, currencySymbol, getAccountRows, getFirstAccount, readCreatedOperations, readDirectory, readOperationTags, readPayers, readSettings, writeOperationTags } from './FinanceFlows.jsx';
import { screens } from '../data/screens.js';
import { coverageViews } from './CoverageFlows.jsx';
import { captureViews } from './CaptureFlows.jsx';

const go = screenHref;
function StatusBar() { return <><span className="camera" /><div className="phone-status"><span>9:41</span><span className="status-icons"><svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor"><path d="M2 13h2V9H2zm4 0h2V6H6zm4 0h2V3h-2z" /></svg><svg viewBox="0 0 20 12" width="19" height="12" fill="none"><rect x="1" y="1" width="15" height="10" rx="2" stroke="currentColor" /><path d="M3 3h11v6H3zM18 4v4" fill="currentColor" stroke="currentColor" /></svg></span></div></>; }
function MobileNav({ id }) { if (id === 'base-welcome') return null; return <nav className="phone-nav" aria-label="Навигация приложения"><a className={['base-journal','base-detail','journal-filters','saved-search','trip-detail','trip-expense','trip-settle','share-link'].includes(id) ? 'selected' : ''} href={go('base-journal')}><Icon name="list" />Журнал</a><a className={['base-accounts','base-account','accounts','pockets','account-review','reconcile'].includes(id) ? 'selected' : ''} href={go('base-accounts')}><Icon name="wallet" />Счета</a><a className="add" href={go('base-expense')} aria-label="Добавить операцию"><Icon name="plus" size={25} /></a><a className={['reports','pie','enreports'].includes(id) ? 'selected' : ''} href={go('reports')}><Icon name="chart" />Отчёты</a><a className={['base-settings','debts','debt-new','debt-detail','debt-repay','deposits','deposit-new','deposit-detail','loans','loan-detail','loan-calc'].includes(id) ? 'selected' : ''} href={go('base-settings')}><Icon name="more" />Ещё</a></nav>; }
function Topline({ title, back, subtitle, accessory }) { return <div className={`mobile-topline ${back ? 'small' : ''}`}>{back ? <a className="circle-button" href={go(back)} aria-label="Назад"><Icon name="back" /></a> : <div><small>{subtitle}</small><h2>{title}</h2></div>}{back && <h2>{title}</h2>}{accessory || <span className="topline-spacer" />}</div>; }
function SectionHeading({ title, action, to }) { return <div className="mobile-section-heading"><h3>{title}</h3>{action && <a href={go(to)}>{action} <Icon name="chevron" size={17} /></a>}</div>; }
function OperationRow({ title, detail, amount, tone = '', kind = 'food', to = 'base-detail', href, tags = [] }) {
  return <a className="operation-row" href={href || go(to)}><span className={`operation-icon ${kind === 'food' ? 'food' : ''}`}><Icon name={kind} /></span><span className="operation-copy"><strong>{title}</strong><small>{detail}</small>{tags.length > 0 && <span className="operation-tags">{tags.map(tag => <em key={tag}>{tag}</em>)}</span>}</span><strong className={`operation-amount ${tone}`}>{amount}</strong></a>;
}
function Action({ children, to, secondary = false, danger = false }) { return <Button href={go(to)} variant={danger ? 'danger' : secondary ? 'secondary' : 'primary'} className="mobile-action" icon={!secondary && !danger ? <Icon name="arrow" size={18} /> : undefined}>{children}</Button>; }
function MoneyRows({ rows }) { return <div className="mobile-form-card">{rows.map(([label, value]) => <div className="mobile-data-line" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>; }

function Welcome() { return <WelcomeFlow />; }
function Accounts() {
  const first = getFirstAccount();
  const rows = getAccountRows();
  const primary = first && (rows.find(item => item.originalName === first.name || item.name === first.name) || first);
  return <><Topline title="Мои счета" subtitle="Личная история" accessory={<div className="topline-actions"><a className="circle-button" href={go('search')} aria-label="Поиск"><Icon name="search" /></a><a className="circle-button" href={go('base-settings')} aria-label="Настройки"><Icon name="settings" /></a></div>} /><MobileHero label={primary ? "Остаток основного счёта" : "Общий остаток"} amount={new Intl.NumberFormat('ru-RU').format(primary ? primary.balance : 11500)} currency={currencySymbol(primary ? primary.currency : 'RUB')} meta={primary ? 'Валюта счёта · ' + currencySymbol(primary.currency) : 'На устройстве'} /><p className="device-note"><Icon name="shield" size={17} />История на устройстве</p><SectionHeading title="Счета" action="+ Добавить" to="createaccount" />{rows.map(item => <AccountTile key={item.name} title={item.name} subtitle={item.multi ? item.type : item.type + ' · ' + currencySymbol(item.currency)} amount={item.multi ? item.currencies.map(currencySymbol).join(' · ') : new Intl.NumberFormat('ru-RU').format(item.balance) + ' ' + currencySymbol(item.currency)} href={go(item.multi ? 'pockets' : 'base-account')} kind={item.icon || 'wallet'} />)}<div className="home-shortcuts"><a href={go('reports')}><Icon name="chart" />Отчёты</a><a href={go('budget')}><Icon name="budget" />Бюджет</a></div><SectionHeading title="Долги и накопления" /><div className="home-shortcuts"><a href={go('debts')}><Icon name="person" />Долги</a><a href={go('deposits')}><Icon name="bank" />Вклады</a><a href={go('loans')}><Icon name="bank" />Кредиты</a></div><SectionHeading title="Последние операции" action="Все" to="base-journal" /><OperationRow title="Между своими счетами" detail="Наличные → Банковский счёт" amount="3 000 ₽" kind="transfer" /><OperationRow title="Продукты" detail="Пятёрочка" amount="− 500 ₽" tone="negative" /></>;
}
function Expense() { return <EntryFlow />; }
const demoOperations = [
  { id: 'op-13-products', day: '13 октября', date: '13.10.2026', title: 'Продукты', detail: 'Пятёрочка · Наличные', amount: '− 1 240 ₽', tone: 'negative', kind: 'cart', group: 'Расход', account: 'Наличные', category: 'Продукты', tags: ['Дом'], period: 'Октябрь 2026' },
  { id: 'op-13-transfer', day: '13 октября', date: '13.10.2026', title: 'Между своими счетами', detail: 'Наличные → Банковский счёт', amount: '3 000 ₽', kind: 'transfer', group: 'Перевод', account: 'Наличные', category: '', tags: [], period: 'Октябрь 2026' },
  { id: 'op-13-debt', day: '13 октября', date: '13.10.2026', title: 'Возврат долга', detail: 'Анна вернула · Наличные', amount: '+ 200 ₽', tone: 'positive', kind: 'person', group: 'Долг', account: 'Наличные', category: 'Долг', tags: ['Семья'], period: 'Октябрь 2026' },
  { id: 'op-12-salary', day: '12 октября', date: '12.10.2026', title: 'Зарплата', detail: 'Работа · Банковский счёт', amount: '+ 70 000 ₽', tone: 'positive', kind: 'briefcase', group: 'Доход', account: 'Банковский счёт', category: 'Зарплата', tags: ['Работа'], period: 'Октябрь 2026' },
  { id: 'op-12-cafe', day: '12 октября', date: '12.10.2026', title: 'Кафе', detail: 'Завтрак · Наличные', amount: '− 450 ₽', tone: 'negative', kind: 'cup', group: 'Расход', account: 'Наличные', category: 'Кафе', tags: ['Командировка'], period: 'Октябрь 2026' },
  { id: 'op-11-taxi', day: '11 октября', date: '11.10.2026', title: 'Такси', detail: 'Наличные', amount: '− 320 ₽', tone: 'negative', kind: 'car', group: 'Расход', account: 'Наличные', category: 'Такси', tags: ['Командировка'], period: 'Октябрь 2026' },
  { id: 'op-11-transfer', day: '11 октября', date: '11.10.2026', title: 'На карту', detail: 'Банковский счёт → Наличные', amount: '5 000 ₽', kind: 'transfer', group: 'Перевод', account: 'Банковский счёт', category: '', tags: [], period: 'Октябрь 2026' },
  { id: 'op-10-rent', day: '10 октября', date: '10.10.2026', title: 'Аренда', detail: 'Жильё · Банковский счёт', amount: '− 30 000 ₽', tone: 'negative', kind: 'house', group: 'Расход', account: 'Банковский счёт', category: 'Аренда', tags: ['Дом'], period: 'Октябрь 2026' },
  { id: 'op-10-timur', day: '10 октября', date: '10.10.2026', title: 'Возврат Тимуру', detail: 'Я вернул долг · Наличные', amount: '− 1 500 ₽', tone: 'negative', kind: 'person', group: 'Долг', account: 'Наличные', category: 'Долг', tags: ['Семья'], period: 'Октябрь 2026' },
  { id: 'op-9-products', day: '9 октября', date: '09.10.2026', title: 'Продукты', detail: 'Пятёрочка · Наличные', amount: '− 500 ₽', tone: 'negative', kind: 'cart', group: 'Расход', account: 'Наличные', category: 'Продукты', tags: ['Дом'], period: 'Октябрь 2026' },
  { id: 'op-9-side', day: '9 октября', date: '09.10.2026', title: 'Подработка', detail: 'Наличные', amount: '+ 2 000 ₽', tone: 'positive', kind: 'down', group: 'Доход', account: 'Наличные', category: 'Подработка', tags: ['Работа'], period: 'Октябрь 2026' },
  { id: 'op-8-anna', day: '8 октября', date: '08.10.2026', title: 'Долг Анне', detail: 'Выдал в долг · Наличные', amount: '− 800 ₽', tone: 'negative', kind: 'person', group: 'Долг', account: 'Наличные', category: 'Долг', tags: ['Семья'], period: 'Октябрь 2026' },
  { id: 'op-8-utils', day: '8 октября', date: '08.10.2026', title: 'Коммунальные', detail: 'Жильё · Банковский счёт', amount: '− 1 850 ₽', tone: 'negative', kind: 'bolt', group: 'Расход', account: 'Банковский счёт', category: 'Коммунальные', tags: ['Дом'], period: 'Октябрь 2026' }
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
  const money = (value, sign) => `${sign} ${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value)} ₽`;
  return <div className="mobile-group-title"><span className="day-label">{day}<small>{rows.length} {operationWord(rows.length)}</small></span>{(spent > 0 || received > 0) && <span className="day-totals">{spent > 0 && <b className="negative">{money(spent, '−')}</b>}{received > 0 && <b className="positive">{money(received, '+')}</b>}</span>}</div>;
}
export function operationWord(count) {
  const mod = count % 100, digit = count % 10;
  if (mod > 10 && mod < 20) return 'операций';
  if (digit === 1) return 'операция';
  if (digit > 1 && digit < 5) return 'операции';
  return 'операций';
}
function Journal() {
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const reportCategory = params.get('category') || '';
  const reportPeriod = params.get('period') || '';
  const reportAccount = params.get('account') || '';
  const reportKind = params.get('kind') || '';
  const hasReportFilter = Boolean(reportCategory || reportPeriod || reportAccount || reportKind);
  const [query, setQuery] = useState(''), [group, setGroup] = useState('Все');
  const operations = operationsWithTags();
  const shown = operations.filter(item =>
    (group === 'Все' || item.group === group) &&
    (!reportCategory || item.category === reportCategory) &&
    (!reportPeriod || item.period === reportPeriod) &&
    (!reportAccount || reportAccount === 'Все счета' || item.account === reportAccount) &&
    (!reportKind || item.group === reportKind) &&
    `${item.title} ${item.detail} ${item.amount} ${item.day} ${(item.tags || []).join(' ')}`.toLowerCase().includes(query.toLowerCase())
  );
  const days = [...new Set(shown.map(item => item.day))];
  return <><Topline title="Журнал" subtitle={reportPeriod || '8–13 октября'} accessory={<a className="circle-button" href={go('base-expense')} aria-label="Новая операция"><Icon name="plus" /></a>} />{hasReportFilter && <div className="journal-filter-note"><span>Из отчёта: {[reportCategory, reportPeriod, reportAccount !== 'Все счета' ? reportAccount : '', reportKind].filter(Boolean).join(' · ')}</span><a href={go('base-journal')}>Сбросить</a></div>}<label className="app-search"><Icon name="search" size={18} /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Поиск по операциям" aria-label="Поиск по операциям" /></label><div className="search-scopes" role="group" aria-label="Тип операции">{['Все','Расход','Доход','Перевод','Долг'].map(value => <button type="button" key={value} className={group === value ? 'active' : ''} onClick={() => setGroup(value)}>{value}</button>)}</div>{days.length ? days.map(day => { const rows = shown.filter(item => item.day === day); return <div className="journal-day" key={day}><DayHeading day={day} rows={rows} /><div className="ledger-card journal-ledger">{rows.map(item => <OperationRow key={item.id} {...item} href={`${go('base-detail')}?op=${item.id}`} />)}</div></div>; }) : <p className="search-empty">Нет операций по этому фильтру</p>}<p className="mobile-hint">В журнале все факты: расход, доход, перевод и долг.</p></>;
}
function Transfer() { return <EntryFlow initialKind="Перевод" />; }
function Detail() {
  const id = new URLSearchParams(window.location.hash.split('?')[1] || '').get('op') || 'op-9-products';
  const item = operationsWithTags().find(operation => operation.id === id) || demoOperations.find(operation => operation.id === 'op-9-products');
  const [tags, setTags] = useState(item.tags || []);
  const [picking, setPicking] = useState(false);
  return <><Topline title="Операция" back="base-journal" /><div className="detail-hero"><span className="detail-icon"><Icon name={item.kind} size={29} /></span><h3>{item.title}</h3><strong className={item.tone === 'negative' ? 'detail-amount--expense' : ''}>{item.amount}</strong><Badge tone="neutral">Сохранено на устройстве</Badge></div><div className="mobile-form-card"><div className="mobile-data-line"><span>Счёт</span><strong>{item.account}</strong></div><div className="mobile-data-line"><span>Категория</span><strong>{item.category || 'Перевод'}</strong></div><button type="button" className="mobile-data-line tag-edit" onClick={() => setPicking(true)}><span>Теги</span><strong>{tags.length ? tags.join(' · ') : 'Выбрать'}</strong></button><div className="mobile-data-line"><span>Дата</span><strong>{item.date}</strong></div><div className="mobile-data-line"><span>Заметка</span><strong>{item.detail.split(' · ')[0]}</strong></div></div>{item.id === 'op-9-products' && <><SectionHeading title="Доли участников" /><div className="mobile-info-card"><p>Анна должна 200 ₽ · Тимур должен 150 ₽ · Я оплатил 150 ₽</p><a href={go('share-link')}>Получить ссылку для участников →</a></div></>}<SectionHeading title="История операции" /><div className="timeline"><p>Создана операция</p><small>{item.date} · на этом устройстве</small></div><Action to="base-expense">Изменить</Action><Action to="share-link" secondary>Поделиться расчётом</Action><Action to="base-cancel" danger>Отменить операцию</Action>{picking && <TagPicker selected={tags} onApply={next => { writeOperationTags(item.id, next); setTags(next); setPicking(false); }} onClose={() => setPicking(false)} />}</>;
}
function Account() { const first = getFirstAccount(); if (first) return <><Topline title={first.name} back="base-accounts" /><MobileHero label="Остаток по учёту" amount={new Intl.NumberFormat('ru-RU').format(first.opening)} currency={currencySymbol(first.currency)} meta={`Валюта счёта · ${currencySymbol(first.currency)}`} /><div className="mobile-tabs"><a href={go('base-expense')}>− Расход</a><a href={go('base-expense')}>+ Доход</a><a href={go('base-transfer')}>Перевод</a></div><SectionHeading title="Связанные продукты" /><div className="mobile-info-card"><a href={go('deposit-detail')}><strong>Вклад TBC · USD</strong><p>10 145 $ · начислено +145 $</p></a><a href={go('loan-detail')}><strong>Ипотека TBC</strong><p>Остаток 48 000 $ · платёж 820 $ со счёта</p></a></div><p className="mobile-hint">Вклад не входит в доступный остаток кармана до выплаты. Кредит показан как отдельное обязательство.</p></>; return <><Topline title="Счёт" back="base-accounts" /><MobileHero label="Наличные" amount="8 500" meta="Остаток по учёту · ₽" /><div className="mobile-tabs"><a href={go('base-expense')}>− Расход</a><a href={go('base-expense')}>+ Доход</a><a href={go('base-transfer')}>Перевести</a></div><SectionHeading title="Операции по счёту" /><div className="ledger-card"><OperationRow title="Продукты" detail="Пятёрочка" amount="− 500 ₽" tone="negative" /><OperationRow title="Подработка" detail="Наличные" amount="+ 2 000 ₽" tone="positive" kind="down" /></div><SectionHeading title="Связанные продукты" /><div className="mobile-info-card"><a href={go('deposit-detail')}><strong>Вклад TBC · USD</strong><p>10 145 $ · доход +145 $</p></a><a href={go('loan-detail')}><strong>Платёж по ипотеке</strong><p>820 $ · списание с TBC · USD кармана</p></a></div><div className="mobile-data-line standalone"><span>Начальный остаток</span><strong>10 000 ₽</strong></div><p className="mobile-hint">Если фактическая сумма отличается, сверку выполним отдельным действием.</p></>; }
function Cancel() { return <><Topline title="Отмена операции" back="base-detail" /><div className="detail-hero"><span className="detail-icon"><Icon name="clock" size={30} /></span><h3>Убрать из расчёта?</h3><strong>500 ₽</strong></div><p className="mobile-hint">Запись останется в истории. Её сумма перестанет влиять на остатки и итоги.</p><MoneyRows rows={[["Счёт", "Наличные"],["Сейчас", "8 500 ₽"],["После отмены", "9 000 ₽"]]} /><Action to="base-detail">Отменить операцию</Action><Action to="base-detail" secondary>Оставить как есть</Action></>; }
function Settings() {
  const [editor, setEditor] = useState(null);
  const modules = [
    ['Отчёты', 'reports', 'chart', 'Категории и период'], ['Сверка счетов', 'reconcile', 'check', 'Выписка и расхождения'], ['Требует проверки', 'review-queue', 'check', 'Черновики и неуверенные суммы'],
    ['Долги', 'debts', 'person', 'Мне должны и я должен'], ['Вклады', 'deposits', 'bank', 'Ставки, начисления и сроки'], ['Кредиты', 'loans', 'bank', 'Платежи и остаток долга'],
    ['Криптоактивы и металлы', 'assets', 'chart', 'Количество отдельно от оценки'], ['Импорт и экспорт', 'import-file', 'list', 'Файлы, столбцы и дубли'],
    ['Резервная копия', 'backup', 'shield', 'Зашифрованная копия книги'], ['Синхронизация устройств', 'sync', 'transfer', 'Доверенные устройства'],
    ['Книги учёта', 'books', 'wallet', 'Несколько независимых книг'], ['Календарь и прогноз', 'calendar', 'calendar', 'Планы и будущий остаток'],
    ['Цели и резервы', 'goals', 'target', 'Накопления без лишнего расхода'], ['Уведомления', 'notifications', 'clock', 'Пороги бюджета и платежи'],
    ['Шаблоны и быстрые действия', 'quick-input', 'plus', 'Повтор частых операций'], ['Интеграции и боты', 'bot-setup', 'person', 'Команды с подтверждением']
  ];
  return <><Topline title="Настройки" accessory={<a className="circle-button" href={go('search')} aria-label="Поиск"><Icon name="search" /></a>} /><SectionHeading title="Справочники" /><div className="settings-group"><a href={go('currencies')}><Icon name="wallet" /><span><strong>Валюты и курсы</strong><small>Базовая валюта и ручные курсы</small></span><Icon name="chevron" size={17} /></a><button type="button" onClick={() => setEditor('account')}><Icon name="bank" /><span><strong>Счета</strong><small>Названия, валюты и остатки</small></span><Icon name="chevron" size={17} /></button><button type="button" onClick={() => setEditor('category')}><Icon name="tag" /><span><strong>Категории</strong><small>Доходы, расходы и иконки</small></span><Icon name="chevron" size={17} /></button><button type="button" onClick={() => setEditor('payer')}><Icon name="person" /><span><strong>Плательщики</strong><small>Люди и участники</small></span><Icon name="chevron" size={17} /></button><a href={go('projects')}><Icon name="briefcase" /><span><strong>Проекты</strong><small>Операции и итоги по проекту</small></span><Icon name="chevron" size={17} /></a><a href={go('merchants')}><Icon name="cart" /><span><strong>Магазины и компании</strong><small>Контрагенты и правила</small></span><Icon name="chevron" size={17} /></a><a href={go('tags')}><Icon name="tag" /><span><strong>Теги и правила</strong><small>Категоризация и массовые действия</small></span><Icon name="chevron" size={17} /></a></div><SectionHeading title="Счета и обязательства" /><div className="settings-group">{modules.filter(([title]) => ['Долги','Вклады','Кредиты'].includes(title)).map(([title, route, icon, hint]) => <a href={go(route)} key={route}><Icon name={icon} /><span><strong>{title}</strong><small>{hint}</small></span><Icon name="chevron" size={17} /></a>)}</div><SectionHeading title="Модули" /><div className="settings-group">{modules.filter(([title]) => !['Долги','Вклады','Кредиты'].includes(title)).map(([title, route, icon, hint]) => <a href={go(route)} key={route}><Icon name={icon} /><span><strong>{title}</strong><small>{hint}</small></span><Icon name="chevron" size={17} /></a>)}</div><SectionHeading title="Данные и доступ" /><div className="settings-group"><a href={go('access-settings')}><Icon name="shield" /><span><strong>Приватность и доступ</strong><small>PIN, устройства и разрешения</small></span><Icon name="chevron" size={17} /></a><a href={go('locale-settings')}><Icon name="settings" /><span><strong>Язык и отображение</strong><small>Локаль, дата и плотность списков</small></span><Icon name="chevron" size={17} /></a></div><div className="offline-card"><strong><Icon name="shield" size={18} />История на устройстве</strong><p>Записи хранятся на этом устройстве.</p></div>{editor && <DirectoryEditor type={editor} onClose={() => setEditor(null)} />}</>;
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
const coreViews = {currencies:CurrenciesFlow,available:CurrenciesFlow,rates:CurrenciesFlow,createaccount:AccountCreateFlow,pockets:PocketsFlow,reports:ReportsFlow,pie:ReportsFlow,budget:BudgetFlow,budgetedit:BudgetFlow,deposits:DepositFlow,'deposit-new':DepositFlow,'deposit-detail':DepositFlow,'deposit-payout':DepositFlow,loans:LoanFlow,'loan-calc':LoanFlow,'loan-detail':LoanFlow,'loan-schedule':LoanFlow,'loan-pay':LoanFlow,'loan-pay-preview':LoanFlow,debts:DebtFlow,'debt-new':DebtFlow,'debt-detail':DebtFlow,'debt-repay':DebtFlow,'debt-repay-preview':DebtFlow,search:GlobalSearch,'base-welcome':Welcome,'base-accounts':Accounts,'base-expense':Expense,'base-journal':Journal,'base-transfer':Transfer,'base-detail':Detail,'base-account':Account,'base-cancel':Cancel,'base-settings':Settings};
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
function Extended({ screen }) {
  const fields = screen.elements.filter(item => item.type === 'input');
  const notes = screen.elements.filter(item => item.type === 'text');
  const headline = fields.find(field => /^[+\-−]?\d[\d\s\u00a0]*(?:[,.]\d+)?\s*(?:%|[₽$€₾£₫₩]|[A-Z]{3})?$/.test(String(field.target || '').trim()) && !/дата|сумм|лимит|ставк|количеств|порог|комисс|плат|цена|процент/i.test(field.value));
  const body = fields.filter(field => field !== headline);
  const lead = notes[0]?.value;
  return <>
    <Topline title={screen.title} back="base-settings" />
    {(headline || lead) && <div className={`desktop-overview${overviewClass(screen.id)}`}>{headline && <div><small>{headline.value}</small><strong>{headline.target}</strong></div>}{lead && <p>{lead}</p>}</div>}
    {screen.subtitle ? <p className="flow-caption">{screen.subtitle}</p> : null}
    {body.length > 0 && <section className="mobile-portfolio-card"><div className="desktop-card-head"><div><span className="desktop-card-kicker">ЛИЧНАЯ КНИГА</span><h3>{body.length && body.every(field => progressPair(field.target)) ? 'Прогресс' : 'Состав'}</h3></div><span>{body.length}</span></div><div className="module-body">{body.map((field, index) => {
      const progress = progressPair(field.target);
      if (progress) return <article className="goal-card" key={`${field.value}-${index}`}><header><strong>{field.value.replace(/^Цель [«"]|[»"]$/g, '')}</strong><b>{progress.ratio}%</b></header><small>{progress.current} из {progress.total}</small><div className="desktop-loan-track"><span style={{ width: `${progress.ratio}%` }} /></div></article>;
      return <PrototypeField key={`${field.value}-${index}`} label={field.value} value={field.target || ''} icon={fieldIcon(field.value)} />;
    })}</div></section>}
  </>;
}
export default function Phone({ screen }) { const View=coreViews[screen.id] || coverageViews[screen.id] || captureViews[screen.id]; return <article className="phone" data-screen={screen.id}><StatusBar /><div className="phone-scroll" key={screen.id}>{View?<View screen={screen}/>:<Extended screen={screen}/>}</div><MobileNav id={screen.id}/><div className="home-indicator"/></article>; }
