import React, { useEffect, useRef, useState } from 'react';
import { AccountTile, DateCalendar, DateField, Icon, MobileHero, Progress, TrendChart, chartPalette, dottedDate, formatIsoDate, screenHref } from './ui.jsx';

const INITIAL = ['USD', 'EUR', 'GEL', 'RUB', 'KRW', 'VND', 'MYR', 'AMD', 'TRY', 'KZT', 'UAH', 'PLN', 'THB', 'CNY'];
const SYMBOL = { USD: '$', EUR: '€', GEL: '₾', RUB: '₽', GBP: '£', VND: '₫', KRW: '₩', MYR: 'RM', AMD: '֏', TRY: '₺', KZT: '₸', UAH: '₴', PLN: 'zł', THB: '฿', CNY: '¥' };
export const currencySymbol = code => SYMBOL[code] || code;
const DEMO_USD = { USD: 1, EUR: 1.1, GEL: 0.37, RUB: 0.011, GBP: 1.3, KRW: 0.00072, VND: 0.000039, MYR: 0.23, AMD: 0.0026, TRY: 0.029, KZT: 0.0021, UAH: 0.024, PLN: 0.26, THB: 0.03, CNY: 0.14 };
export const CATEGORY_TREE = {
  Расход: [
    { name: 'Продукты', icon: 'basket', children: [['Супермаркет', 'cart'], ['Кафе', 'cup'], ['Доставка', 'bag']] },
    { name: 'Жильё', icon: 'house', children: [['Аренда', 'house'], ['Коммунальные', 'bolt'], ['Ремонт', 'house']] },
    { name: 'Транспорт', icon: 'car', children: [['Такси', 'car'], ['Общественный', 'bus'], ['Топливо', 'car']] },
    { name: 'Связь', icon: 'phone', children: [['Мобильная связь', 'phone'], ['Интернет', 'bolt']] },
    { name: 'Здоровье', icon: 'heart', children: [['Аптека', 'heart'], ['Врач', 'heart']] },
    { name: 'Образование', icon: 'book', children: [['Курсы', 'book'], ['Книги', 'book']] },
    { name: 'Подписки', icon: 'clock', children: [['Сервисы', 'star'], ['Музыка', 'note']] },
    { name: 'Одежда', icon: 'bag', children: [['Одежда', 'bag'], ['Обувь', 'bag']] },
    { name: 'Питомцы', icon: 'heart', children: [['Корм', 'heart'], ['Ветеринар', 'heart']] },
    { name: 'Прочее', icon: 'star', children: [['Покупки', 'bag'], ['Здоровье', 'heart'], ['Другое', 'star']] }
  ],
  Доход: [
    { name: 'Работа', icon: 'briefcase', children: [['Зарплата', 'briefcase'], ['Подработка', 'star'], ['Премия', 'gift']] },
    { name: 'Проценты и кэшбэк', icon: 'bank', children: [['Проценты', 'bank'], ['Кэшбэк', 'gift']] },
    { name: 'Инвестиции', icon: 'chart', children: [['Дивиденды', 'chart'], ['Продажа', 'transfer']] },
    { name: 'Другие доходы', icon: 'gift', children: [['Подарок', 'gift'], ['Возврат', 'wallet'], ['Другое', 'star']] }
  ]
};
const storageKey = 'finance-design-currency-v2';
const firstAccountKey = 'finance-design-first-account-v1';
const multiAccountKey = 'finance-design-multi-account-v1';
const payersKey = 'finance-design-payers-v1';
const directoryKey = 'finance-design-directory-v1';
const sharedDebtsKey = 'finance-design-shared-debts-v1';
const debtRepaymentsKey = 'finance-design-debt-repayments-v1';
export function readDirectory() {
  try {
    const data = JSON.parse(localStorage.getItem(directoryKey) || '{}');
    return { accounts: Array.isArray(data.accounts) ? data.accounts : [], categories: Array.isArray(data.categories) ? data.categories : [] };
  } catch { return { accounts: [], categories: [] }; }
}
function writeDirectory(data) {
  try { localStorage.setItem(directoryKey, JSON.stringify(data)); } catch { /* Preview remains usable. */ }
}
const adjustmentsKey = 'finance-design-account-adjustments';
export function readAccountAdjustments() {
  try {
    const saved = JSON.parse(localStorage.getItem(adjustmentsKey) || '{}');
    return saved && typeof saved === 'object' ? saved : {};
  } catch { return {}; }
}
export function applyAccountAdjustment(name, delta) {
  const current = readAccountAdjustments();
  const next = { ...current, [name]: Math.round(((Number(current[name]) || 0) + delta) * 100) / 100 };
  try { localStorage.setItem(adjustmentsKey, JSON.stringify(next)); } catch { /* Preview remains usable. */ }
  return next;
}
export function getAccountRows(first = getFirstAccount(), multi = getMultiAccount()) {
  const basics = [
    ...(first ? [{ name: first.name, type: 'Личный счёт', icon: 'wallet', balance: Number(first.opening) || 0, currency: first.currency }] : []),
    { name: 'Наличные', type: 'Наличные', icon: 'wallet', balance: 8500, currency: 'RUB' },
    { name: 'Банковский счёт', type: 'Банковская карта', icon: 'bank', balance: 3000, currency: 'RUB' },
    { name: `${multi.name} · мультивалютный`, type: 'Мультивалютная карта', icon: 'bank', balance: 0, currency: multi.currencies[0], multi: true, currencies: multi.currencies }
  ].filter((item, index, all) => all.findIndex(other => other.name === item.name) === index);
  const custom = readDirectory().accounts;
  const adjustments = readAccountAdjustments();
  return [...basics.filter(item => !custom.some(extra => extra.originalName === item.name)), ...custom].map(item => {
    const extra = Number(adjustments[item.name]) || 0;
    return extra ? { ...item, balance: Math.round(((Number(item.balance) || 0) + extra) * 100) / 100 } : item;
  });
}
export function readPayers() {
  try { return JSON.parse(localStorage.getItem(payersKey) || '[]').filter(value => typeof value === 'string'); }
  catch { return []; }
}
export function readSharedDebts() {
  try { const rows = JSON.parse(localStorage.getItem(sharedDebtsKey) || '[]'); return Array.isArray(rows) ? rows : []; }
  catch { return []; }
}
function readDebtRepayments() {
  try { const rows = JSON.parse(localStorage.getItem(debtRepaymentsKey) || '[]'); return Array.isArray(rows) ? rows : []; }
  catch { return []; }
}
function saveDebtRepayment(item) {
  try { localStorage.setItem(debtRepaymentsKey, JSON.stringify([...readDebtRepayments(), item])); } catch { /* Preview remains usable. */ }
}
function saveSharedExpenseDebts(shares, currency, date, note) {
  const added = shares.filter(item => item.name !== 'Я' && item.name.trim() && (numeric(item.amount) || 0) > 0)
    .map((item, index) => ({ id: `${Date.now()}-${index}`, person: item.name, amount: numeric(item.amount), currency, date: dottedDate(date), note: note || 'Доля общего расхода' }));
  addSharedDebts(added);
}
export function addSharedDebts(rows) {
  const added = (rows || []).filter(item => item?.person && item.person !== 'Я' && Number(item.amount) > 0);
  if (!added.length) return;
  try { localStorage.setItem(sharedDebtsKey, JSON.stringify([...readSharedDebts(), ...added])); } catch { /* Preview remains usable. */ }
}
export function getFirstAccount() {
  try { return JSON.parse(localStorage.getItem(firstAccountKey) || 'null'); } catch { return null; }
}
function getMultiAccount() {
  try { return JSON.parse(localStorage.getItem(multiAccountKey) || 'null') || { name: 'TBC', currencies: ['GEL', 'USD', 'EUR'] }; }
  catch { return { name: 'TBC', currencies: ['GEL', 'USD', 'EUR'] }; }
}
export function readSettings() {
  try { return { base: 'USD', currencies: INITIAL, rates: DEMO_USD, ...JSON.parse(localStorage.getItem(storageKey) || '{}') }; }
  catch { return { base: 'USD', currencies: INITIAL, rates: DEMO_USD }; }
}
function useCurrencySettings() {
  const [settings, setSettings] = useState(readSettings);
  const update = change => setSettings(previous => {
    const next = { ...previous, ...change };
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Preview still works without storage. */ }
    return next;
  });
  return [settings, update];
}
const money = (value, code) => {
  const amount = Number(value) || 0;
  const digits = amount !== 0 && Math.abs(amount) < 0.01 ? 6 : 2;
  return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: digits }).format(amount)}\u00a0${SYMBOL[code] || code}`;
};
const numeric = value => Number(String(value).replace(/\s/g, '').replace(',', '.'));
function convert(amount, from, to, rates) {
  const fromRate = rates[from], toRate = rates[to];
  return Number.isFinite(amount * fromRate / toRate) ? amount * fromRate / toRate : null;
}
function SelectField({ label, value, onClick, detail, icon }) {
  return <button type="button" className="flow-row" onClick={onClick}><span>{label}</span><strong className={icon ? 'flow-row-icon-value' : ''}>{icon && <span className="category-icon mini"><Icon name={icon} size={16} /></span>}{value}</strong>{detail && <small>{detail}</small>}</button>;
}
function SearchInput({ value, onChange, placeholder }) {
  return <label className="picker-search"><Icon name="search" size={18} /><input type="search" value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} /></label>;
}
function EntrySwitch({ kind, setKind }) {
  return <div className="entry-tabs" role="tablist" aria-label="Тип операции">{['Расход', 'Доход', 'Перевод'].map(item => <button type="button" role="tab" aria-selected={kind === item} className={kind === item ? 'active' : ''} key={item} onClick={() => setKind(item)}>{item}</button>)}</div>;
}
function evaluate(expression, decimals = 2) {
  const compact = expression.replace(/\s/g, '').replace(/,/g, '.');
  if (!/^\d+(?:\.\d+)?(?:[+−×÷-]\d+(?:\.\d+)?)*$/.test(compact)) return null;
  const parts = compact.match(/\d+(?:\.\d+)?|[+−×÷-]/g);
  let result = Number(parts[0]);
  for (let i = 1; i < parts.length; i += 2) {
    const number = Number(parts[i + 1]);
    if (parts[i] === '+') result += number;
    if (parts[i] === '−' || parts[i] === '-') result -= number;
    if (parts[i] === '×') result *= number;
    if (parts[i] === '÷') result /= number;
  }
  const factor = 10 ** decimals;
  return Number.isFinite(result) && result >= 0 ? Math.round(result * factor) / factor : null;
}
export function Calculator({ value, onApply, onClose, decimals = 2 }) {
  const field = useRef(null);
  const [expression, setExpression] = useState(value || '0');
  const [pasteError, setPasteError] = useState('');
  const result = evaluate(expression, decimals);
  const paste = async () => {
    try {
      const clipboard = (await navigator.clipboard.readText()).trim();
      const clean = clipboard.replace(/\s*[A-Z]{3,5}\s*$/i, '').replace(/[\s\u00a0\u202f]/g, '').replace(/[₽$€₾£₫₩]/g, '').replace(',', '.');
      if (!/^\d+(?:\.\d+)?$/.test(clean)) throw new Error('В буфере нет суммы');
      setExpression(clean.replace('.', ','));
      setPasteError('');
    } catch { setPasteError('Не удалось вставить сумму из буфера'); }
  };
  const press = key => {
    if (key === 'C') setExpression('0');
    else if (key === '⌫') setExpression(old => old.slice(0, -1) || '0');
    else if (key === '=') { if (result !== null) setExpression(String(result)); }
    else if (['+','−','×','÷'].includes(key)) setExpression(old => /[+−×÷]$/.test(old) ? old.slice(0, -1) + key : old + key);
    else if (key === ',') setExpression(old => /[.,]/.test(old.split(/[+−×÷]/).at(-1)) ? old : old + ',');
    else setExpression(old => old === '0' && (key === '00' || key === '000') ? '0' : old === '0' ? key : old + key);
  };
  useEffect(() => { field.current?.focus(); }, []);
  useEffect(() => {
    const onKey = event => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key;
      const typing = event.target?.classList?.contains('calc-expression');
      if (key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (typing) {
        if (key === 'Enter') { event.preventDefault(); if (result !== null) onApply(String(result)); }
        return;
      }
      if (key === 'Enter' || key === '=') { event.preventDefault(); if (key === '=' && result !== null) setExpression(String(result)); else if (result !== null) onApply(String(result)); return; }
      if (key === 'Backspace') { event.preventDefault(); press('⌫'); return; }
      if (key === 'Delete') { event.preventDefault(); press('C'); return; }
      if (/^[0-9]$/.test(key)) { event.preventDefault(); press(key); return; }
      if (key === ',' || key === '.') { event.preventDefault(); press(','); return; }
      const operators = { '+': '+', '-': '−', '*': '×', '/': '÷', x: '×', X: '×' };
      if (operators[key]) { event.preventDefault(); press(operators[key]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  return <div className="flow-overlay" role="dialog" aria-label="Калькулятор суммы"><div className="flow-sheet calc-sheet"><div className="sheet-head"><strong>Калькулятор суммы</strong><button type="button" onClick={onClose} aria-label="Закрыть">×</button></div><div className="calc-display"><input ref={field} className="calc-expression" inputMode="decimal" aria-label="Выражение" value={expression === '0' ? '' : expression} placeholder="0" onChange={event => { const clean = event.target.value.replace(/\./g, ',').replace(/-/g, '−').replace(/\*/g, '×').replace(/\//g, '÷').replace(/[^0-9,+−×÷]/g, ''); setExpression(clean || '0'); }} /><strong>{result === null ? 'Проверьте выражение' : `= ${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: decimals }).format(result)}`}</strong></div><button type="button" className="calc-paste" onClick={paste}><Icon name="paste" size={17} /> Вставить из буфера</button>{pasteError && <p className="calc-error" role="alert">{pasteError}</p>}<div className="calc-grid">{['C','⌫','00','÷','7','8','9','×','4','5','6','−','1','2','3','+','000','0',',','='].map(key => <button type="button" key={key} onMouseDown={event => event.preventDefault()} onClick={() => press(key)} className={['÷','×','−','+','='].includes(key) ? 'operator' : ''}>{key}</button>)}</div><button type="button" className="flow-primary calc-apply" disabled={result === null} onClick={() => onApply(String(result))}>Применить</button></div></div>;
}
export function CurrencyPicker({ settings, onSelect, onClose, onEdit, onAdd }) {
  const timer = useRef(null), longPressed = useRef(false);
  const [query, setQuery] = useState('');
  const start = code => { longPressed.current = false; timer.current = setTimeout(() => { longPressed.current = true; onEdit(code); }, 550); };
  const stop = () => clearTimeout(timer.current);
  return <div className="flow-overlay" role="dialog" aria-label="Выбрать валюту"><div className="flow-sheet"><div className="sheet-head"><strong>Валюта</strong><button type="button" onClick={onClose} aria-label="Закрыть">×</button></div><SearchInput value={query} onChange={setQuery} placeholder="Найти валюту" /><div className="currency-list">{settings.currencies.filter(code => `${code} ${SYMBOL[code] || ''}`.toLowerCase().includes(query.toLowerCase())).map(code => <div className="currency-choice" key={code}><button type="button" onPointerDown={() => start(code)} onPointerUp={stop} onPointerLeave={stop} onContextMenu={event => { event.preventDefault(); stop(); onEdit(code); }} onClick={() => { if (!longPressed.current) onSelect(code); }}><strong><span className="currency-choice-symbol">{currencySymbol(code)}</span>{code}</strong><small>{code === settings.base ? 'Базовая валюта' : settings.rates[code] ? `1 ${code} ≈ ${money(convert(1, code, settings.base, settings.rates), settings.base)}` : 'Курс не задан'}</small></button><button type="button" className="currency-edit" onClick={() => onEdit(code)} aria-label={`Изменить курс ${code}`}>⋯</button></div>)}</div><button type="button" className="flow-secondary picker-manage" onClick={onAdd}>+ Добавить валюту</button></div></div>;
}
function AccountCurrencyPicker({ settings, multi, selected, onSelect, onClose, onAdd }) {
  const [query, setQuery] = useState('');
  return <div className="flow-overlay" role="dialog" aria-label="Валюты счёта"><div className="flow-sheet"><div className="sheet-head"><strong>{multi ? 'Валютные карманы' : 'Валюта счёта'}</strong><button type="button" onClick={onClose} aria-label="Закрыть">×</button></div><SearchInput value={query} onChange={setQuery} placeholder="Найти валюту" /><div className="currency-list">{settings.currencies.filter(code => code.toLowerCase().includes(query.toLowerCase())).map(code => <button type="button" className={`account-currency-choice ${selected.includes(code) ? 'selected' : ''}`} key={code} onClick={() => onSelect(code)}><span className="currency-choice-symbol">{currencySymbol(code)}</span><span><strong>{code}</strong><small>{code === settings.base ? 'Базовая валюта' : 'Валютный карман'}</small></span><span className="payer-picker-mark">{selected.includes(code) ? '✓' : '›'}</span></button>)}</div><button type="button" className="flow-link picker-manage" onClick={onAdd}>+ Добавить валюту</button>{multi && <button type="button" className="flow-primary directory-save" onClick={onClose}>Готово</button>}</div></div>;
}
export function AccountPicker({ first, multi, role, exclude, onSelect, onClose, onManage, allowAll = false }) {
  const [query, setQuery] = useState('');
  const accounts = getAccountRows(first, multi);
  return <div className="flow-overlay" role="dialog" aria-label={role === 'destination' ? 'Выбрать счёт зачисления' : 'Выбрать счёт списания'}><div className="flow-sheet"><div className="sheet-head"><strong>{allowAll ? 'Счёт отчёта' : role === 'destination' ? 'На какой счёт' : 'С какого счёта'}</strong><button type="button" onClick={onClose} aria-label="Закрыть">×</button></div><SearchInput value={query} onChange={setQuery} placeholder="Найти счёт" /><div className="account-picker-list">{allowAll && <button type="button" className="account-picker-row" onClick={() => onSelect({ name: 'Все счета' })}><span className="account-picker-icon"><Icon name="wallet" size={21} /></span><span className="account-picker-copy"><strong>Все счета</strong><small>Без фильтра</small></span><Icon name="chevron" size={17} /></button>}{accounts.filter(item => item.name !== exclude && item.name.toLowerCase().includes(query.toLowerCase())).map(item => <button type="button" key={item.name} className="account-picker-row" onClick={() => onSelect(item)}><span className="account-picker-icon"><Icon name={item.icon} size={21} /></span><span className="account-picker-copy"><strong>{item.name}</strong><small>{item.type}</small><em>{item.multi ? item.currencies.map(code => `${code} ${({ GEL: '1 000', USD: '500', EUR: '300' })[code] || '0'}`).join(' · ') : money(item.balance, item.currency)}</em></span><Icon name="chevron" size={17} /></button>)}</div>{onManage && <button type="button" className="flow-link picker-manage" onClick={onManage}>+ Настроить счета</button>}</div></div>;
}
export function PocketPicker({ multi, currency, selected, onSelect, onClose }) {
  const balances = { GEL: 1000, USD: 500, EUR: 300 };
  const ordered = [...multi.currencies].sort((a, b) => Number(b === currency) - Number(a === currency));
  return <div className="flow-overlay" role="dialog" aria-label="Выбрать валюту списания"><div className="flow-sheet"><div className="sheet-head"><strong>Валюта списания</strong><button type="button" onClick={onClose} aria-label="Закрыть">×</button></div><p className="flow-caption">{multi.name} · выберите карман, из которого спишутся деньги</p><div className="account-picker-list">{ordered.map(code => <button type="button" key={code} className={`pocket-picker-row ${selected === code ? 'selected' : ''}`} onClick={() => onSelect(code)}><span className="pocket-symbol">{SYMBOL[code] || '¤'}</span><span><strong>{code}</strong><small>{money(balances[code] || 0, code)} осталось{code === currency ? ' · совпадает с валютой операции' : ''}</small></span><Icon name="chevron" size={17} /></button>)}</div></div></div>;
}
export function CategoryPicker({ kind, selected, onSelect, onClose, onManage }) {
  const [query, setQuery] = useState('');
  const custom = readDirectory().categories.filter(item => item.kind === kind);
  const parents = CATEGORY_TREE[kind].map(item => ({ ...item, children: [...item.children.filter(([name]) => !custom.some(extra => extra.parent === item.name && extra.originalName === name)), ...custom.filter(extra => extra.parent === item.name).map(extra => [extra.name, extra.icon || 'star'])] }));
  const [parent, setParent] = useState(parents.find(item => selected.startsWith(item.name))?.name || parents[0].name);
  const active = parents.find(item => item.name === parent);
  const matches = item => `${item.name} ${item.children.map(child => child[0]).join(' ')}`.toLowerCase().includes(query.toLowerCase());
  const shown = query ? parents.filter(matches) : parents;
  const visible = query && !shown.some(item => item.name === parent) ? shown[0] : active;
  return <div className="flow-overlay" role="dialog" aria-label="Выбрать категорию и подкатегорию"><div className="flow-sheet category-sheet"><div className="sheet-head"><strong>Категория {kind === 'Доход' ? 'дохода' : 'расхода'}</strong><button type="button" onClick={onClose} aria-label="Закрыть">×</button></div><SearchInput value={query} onChange={setQuery} placeholder="Найти категорию" /><div className="category-columns"><div className="category-parents">{shown.map(item => <button type="button" key={item.name} className={item.name === visible?.name ? 'selected' : ''} onClick={() => setParent(item.name)}><span className="category-icon"><Icon name={item.icon} size={20} /></span><span>{item.name}</span></button>)}</div><div className="category-children">{visible && <><strong className="category-parent-title">{visible.name}</strong>{visible.children.filter(([name]) => !query || name.toLowerCase().includes(query.toLowerCase()) || visible.name.toLowerCase().includes(query.toLowerCase())).map(([name, icon]) => <button type="button" key={name} onClick={() => onSelect(`${visible.name} · ${name}`, icon)}><span className="category-icon"><Icon name={icon} size={19} /></span><span>{name}</span></button>)}</>}</div></div>{onManage && <button type="button" className="flow-link picker-manage" onClick={onManage}>+ Настроить категории</button>}</div></div>;
}
export function PayerPicker({ selected, onSelect, onClose, onManage, excludeSelf = false, title = 'Плательщик', suggestions = [] }) {
  const [custom, setCustom] = useState('');
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState(readPayers);
  const choices = [...new Set([...suggestions, ...(excludeSelf ? [] : ['Я']), ...saved.filter(value => !excludeSelf || value !== 'Я')])];
  const name = custom.trim();
  const chooseCustom = () => {
    if (!name) return;
    if (!choices.includes(name)) {
      const next = [...new Set([...saved, name])];
      setSaved(next);
      try { localStorage.setItem(payersKey, JSON.stringify(next)); } catch { /* Preview remains usable. */ }
    }
    onSelect(name);
  };
  return <div className="flow-overlay" role="dialog" aria-label="Выбрать плательщика"><div className="flow-sheet"><div className="sheet-head"><strong>{title}</strong><button type="button" onClick={onClose} aria-label="Закрыть">×</button></div><SearchInput value={query} onChange={setQuery} placeholder="Найти человека" /><div className="account-picker-list">{choices.filter(value => value.toLowerCase().includes(query.toLowerCase())).map(value => <button type="button" key={value} className={`payer-picker-row ${selected === value ? 'selected' : ''}`} onClick={() => onSelect(value)}><span className="account-picker-icon"><Icon name="person" size={20} /></span><span>{value}</span><span className="payer-picker-mark">{selected === value ? '✓' : '›'}</span></button>)}</div><label className="flow-input payer-custom">Другой плательщик<input value={custom} maxLength={40} onChange={event => setCustom(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') chooseCustom(); }} placeholder="Введите имя" /></label><button type="button" className="flow-primary payer-add" disabled={!name} onClick={chooseCustom}>Выбрать</button>{onManage && <button type="button" className="flow-link picker-manage" onClick={onManage}>Настроить плательщиков</button>}</div></div>;
}
const tagCatalogKey = 'finance-design-tags';
const operationTagsKey = 'finance-design-operation-tags';
const createdOperationsKey = 'finance-design-created-operations';
const defaultTagRecords = [{ name: 'Дом', color: '#225C46' }, { name: 'Работа', color: '#C56A1A' }, { name: 'Командировка', color: '#1C6E86' }, { name: 'Семья', color: '#AD3D38' }];
export function readTagRecords() {
  try {
    const saved = JSON.parse(localStorage.getItem(tagCatalogKey));
    if (Array.isArray(saved)) return saved.map(item => typeof item === 'string' ? { name: item.trim(), color: '#225C46' } : { name: String(item?.name || '').trim(), color: item?.color || '#225C46' }).filter(item => item.name);
  } catch { /* Preview remains usable. */ }
  return defaultTagRecords;
}
export function writeTagRecords(records) {
  try { localStorage.setItem(tagCatalogKey, JSON.stringify(records)); } catch { /* Preview remains usable. */ }
  window.dispatchEvent(new Event(tagCatalogKey));
}
export function readTagCatalog() {
  return readTagRecords().map(item => item.name);
}
function saveTagCatalog(tags) {
  const colors = Object.fromEntries(readTagRecords().map(item => [item.name, item.color]));
  writeTagRecords(tags.map(name => ({ name, color: colors[name] || '#225C46' })));
}
export function readOperationTags() {
  try {
    const saved = JSON.parse(localStorage.getItem(operationTagsKey));
    return saved && typeof saved === 'object' ? saved : {};
  } catch { return {}; }
}
export function writeOperationTags(id, tags) {
  const next = { ...readOperationTags(), [id]: tags };
  try { localStorage.setItem(operationTagsKey, JSON.stringify(next)); } catch { /* Preview remains usable. */ }
  return next;
}
export function readCreatedOperations() {
  try {
    const saved = JSON.parse(localStorage.getItem(createdOperationsKey));
    return Array.isArray(saved) ? saved : [];
  } catch { return []; }
}
function currentBook() {
  try { return JSON.parse(localStorage.getItem('finance-design-books') || 'null')?.active || 'personal'; }
  catch { return 'personal'; }
}
export function rememberOperation(operation) {
  const stamped = { ...operation, book: operation.book || currentBook() };
  try { localStorage.setItem(createdOperationsKey, JSON.stringify([stamped, ...readCreatedOperations()].slice(0, 20))); } catch { /* Preview remains usable. */ }
}
export function TagPicker({ selected = [], onApply, onClose }) {
  const [catalog, setCatalog] = useState(readTagCatalog);
  const [draft, setDraft] = useState(selected);
  const [query, setQuery] = useState('');
  const [custom, setCustom] = useState('');
  const toggle = name => setDraft(values => values.includes(name) ? values.filter(value => value !== name) : [...values, name]);
  const add = () => {
    const name = custom.trim();
    if (!name) return;
    const next = [...new Set([...catalog, name])];
    setCatalog(next);
    setDraft(values => values.includes(name) ? values : [...values, name]);
    setCustom('');
    saveTagCatalog(next);
  };
  const shown = catalog.filter(name => name.toLowerCase().includes(query.toLowerCase()));
  return <div className="flow-overlay" role="dialog" aria-label="Выбрать теги"><div className="flow-sheet"><div className="sheet-head"><strong>Теги операции</strong><button type="button" onClick={onClose} aria-label="Закрыть">×</button></div><p className="flow-caption">Отметьте одну или несколько меток. Тег не меняет сумму, счёт и курс.</p><SearchInput value={query} onChange={setQuery} placeholder="Найти тег" /><div className="account-picker-list">{shown.map(name => { const color = readTagRecords().find(item => item.name === name)?.color || '#225C46'; return <button type="button" key={name} className={`payer-picker-row ${draft.includes(name) ? 'selected' : ''}`} aria-pressed={draft.includes(name)} onClick={() => toggle(name)}><span className="tag-dot" style={{ background: color }} /><span>{name}</span><span className="payer-picker-mark">{draft.includes(name) ? '✓' : '○'}</span></button>; })}{!shown.length && <p className="search-empty">Такого тега нет. Добавьте его ниже.</p>}</div><label className="flow-input payer-custom">Новый тег<input value={custom} maxLength={40} onChange={event => setCustom(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); add(); } }} placeholder="Например, Отпуск" /></label><button type="button" className="flow-secondary payer-add" disabled={!custom.trim()} onClick={add}>Добавить и выбрать</button><button type="button" className="flow-link picker-manage" onClick={() => setDraft([])}>Без тега</button><button type="button" className="flow-primary payer-add" onClick={() => onApply(draft)}>Готово{draft.length ? ` · ${draft.join(', ')}` : ''}</button></div></div>;
}
export function PayerMultiPicker({ selected = [], onApply, onClose }) {
  const [saved,setSaved]=useState(readPayers), [draft,setDraft]=useState(selected), [query,setQuery]=useState(''), [custom,setCustom]=useState('');
  const choices=[...new Set(['Я',...saved])].filter(name=>name.toLowerCase().includes(query.toLowerCase()));
  const toggle=name=>setDraft(values=>values.includes(name)?values.filter(value=>value!==name):[...values,name]);
  const add=()=>{
    const name=custom.trim(); if(!name)return;
    const next=[...new Set([...saved,name])];
    setSaved(next);setDraft(values=>values.includes(name)?values:[...values,name]);setCustom('');
    try{localStorage.setItem(payersKey,JSON.stringify(next));}catch{/* Keep this preview usable without storage. */}
  };
  return <div className="flow-overlay" role="dialog" aria-label="Выбрать участников из плательщиков"><div className="flow-sheet"><div className="sheet-head"><strong>Участники расхода</strong><button type="button" onClick={onClose} aria-label="Закрыть">×</button></div><p className="flow-caption">Выберите людей из общего справочника плательщиков.</p><SearchInput value={query} onChange={setQuery} placeholder="Найти плательщика" /><div className="account-picker-list">{choices.map(name=><button type="button" key={name} className={`payer-picker-row ${draft.includes(name)?'selected':''}`} aria-pressed={draft.includes(name)} onClick={()=>toggle(name)}><span className="account-picker-icon"><Icon name="person" size={20} /></span><span>{name}</span><span className="payer-picker-mark">{draft.includes(name)?'✓':'○'}</span></button>)}</div><label className="flow-input payer-custom">Добавить в справочник<input value={custom} maxLength={40} onChange={event=>setCustom(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();add();}}} placeholder="Имя участника" /></label><button type="button" className="flow-secondary payer-add" disabled={!custom.trim()} onClick={add}>Добавить и выбрать</button><button type="button" className="flow-primary payer-add" disabled={!draft.length} onClick={()=>onApply(draft)}>Выбрать · {draft.length}</button></div></div>;
}
export function DirectoryEditor({ type, onClose }) {
  const [settings, updateSettings] = useCurrencySettings();
  const [directory, setDirectory] = useState(readDirectory);
  const [savedPayers, setSavedPayers] = useState(readPayers);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState('Личный счёт');
  const [balance, setBalance] = useState('0');
  const [currency, setCurrency] = useState(settings.base);
  const [accountMulti, setAccountMulti] = useState(false);
  const [accountCurrencies, setAccountCurrencies] = useState([settings.base]);
  const [kind, setKind] = useState('Расход');
  const [parent, setParent] = useState(CATEGORY_TREE.Расход[0].name);
  const [icon, setIcon] = useState('star');
  const [submodal, setSubmodal] = useState(null);
  const title = { account: 'Счета', category: 'Категории', payer: 'Плательщики' }[type];
  const categoryRows = ['Расход', 'Доход'].flatMap(group => CATEGORY_TREE[group].flatMap(section => [...section.children.filter(([child]) => !directory.categories.some(item => item.kind === group && item.parent === section.name && item.originalName === child)).map(([child, picture]) => ({ kind: group, parent: section.name, name: child, icon: picture, originalName: child })), ...directory.categories.filter(item => item.kind === group && item.parent === section.name)]));
  const accountRows = getAccountRows();
  const rows = type === 'account' ? accountRows : type === 'category' ? categoryRows : [...new Set(['Я', ...savedPayers])].map(value => ({ name: value }));
  const filtered = rows.filter(item => `${item.name} ${item.parent || ''} ${item.type || ''}`.toLowerCase().includes(query.toLowerCase()));
  const edit = item => {
    setEditing(item);
    setName(item.name);
    if (type === 'account') { setAccountType(item.type || 'Личный счёт'); setBalance(String(item.balance || 0)); setCurrency(item.currency || settings.base); setAccountMulti(Boolean(item.multi)); setAccountCurrencies(item.currencies?.length ? item.currencies : [item.currency || settings.base]); }
    if (type === 'category') { setKind(item.kind); setParent(item.parent); setIcon(item.icon || 'star'); }
  };
  const create = () => { setEditing(null); setName(''); setBalance('0'); setCurrency(settings.base); setAccountMulti(false); setAccountCurrencies([settings.base]); setKind('Расход'); setParent(CATEGORY_TREE.Расход[0].name); setIcon('star'); };
  const save = () => {
    const clean = name.trim();
    if (!clean) return;
    if (type === 'payer') {
      if (editing?.name === 'Я') return;
      const next = [...new Set(editing ? savedPayers.map(value => value === editing.name ? clean : value) : [...savedPayers, clean])];
      setSavedPayers(next);
      try { localStorage.setItem(payersKey, JSON.stringify(next)); } catch { /* Preview remains usable. */ }
    } else if (type === 'account') {
      const originalName = editing?.originalName || editing?.name;
      const record = { name: clean, type: accountType.trim() || 'Личный счёт', currency: accountMulti ? accountCurrencies[0] : currency, balance: numeric(balance) || 0, icon: accountType.toLowerCase().includes('карт') ? 'bank' : 'wallet', ...(accountMulti ? { multi: true, currencies: accountCurrencies } : {}), ...(originalName ? { originalName } : {}) };
      const next = { ...directory, accounts: [...directory.accounts.filter(item => item.originalName !== originalName && item.name !== editing?.name), record] };
      setDirectory(next); writeDirectory(next);
    } else {
      const originalName = editing?.originalName || editing?.name;
      const record = { kind, parent, name: clean, icon, ...(originalName ? { originalName } : {}) };
      const next = { ...directory, categories: [...directory.categories.filter(item => !(item.kind === editing?.kind && item.parent === editing?.parent && (item.originalName || item.name) === originalName)), record] };
      setDirectory(next); writeDirectory(next);
    }
    setEditing(null); setName('');
  };
  const remove = () => {
    if (!editing) return;
    if (type === 'payer') {
      const next = savedPayers.filter(value => value !== editing.name);
      setSavedPayers(next);
      try { localStorage.setItem(payersKey, JSON.stringify(next)); } catch { /* Preview remains usable. */ }
    } else {
      const key = type === 'account' ? 'accounts' : 'categories';
      const next = { ...directory, [key]: directory[key].filter(item => item.name !== editing.name) };
      setDirectory(next); writeDirectory(next);
    }
    create();
  };
  if (submodal?.type === 'calc') return <Calculator value={balance} onApply={value => { setBalance(value); setSubmodal(null); }} onClose={() => setSubmodal(null)} />;
  if (submodal?.type === 'account-currencies') return <AccountCurrencyPicker settings={settings} multi={accountMulti} selected={accountCurrencies} onSelect={code => { if (accountMulti) setAccountCurrencies(old => old.includes(code) ? old.length > 1 ? old.filter(item => item !== code) : old : [...old, code]); else { setCurrency(code); setAccountCurrencies([code]); setSubmodal(null); } }} onClose={() => setSubmodal(null)} onAdd={() => setSubmodal({ type: 'add' })} />;
  if (submodal) return <CurrencyModals modal={submodal} setModal={setSubmodal} settings={settings} update={updateSettings} onCurrency={code => { setCurrency(code); if (accountMulti) setAccountCurrencies(old => [...new Set([...old, code])]); }} />;
  const canRemove = editing && (type === 'payer' ? savedPayers.includes(editing.name) : directory[type === 'account' ? 'accounts' : 'categories'].some(item => item.name === editing.name));
  return <div className="flow-overlay" role="dialog" aria-label={`Настроить ${title.toLowerCase()}`}><div className="flow-sheet directory-sheet"><div className="sheet-head"><strong>{title}</strong><button type="button" onClick={onClose} aria-label="Закрыть">×</button></div><SearchInput value={query} onChange={setQuery} placeholder={`Найти: ${title.toLowerCase()}`} /><div className="directory-list">{filtered.map((item, index) => <button type="button" key={`${item.kind || ''}-${item.parent || ''}-${item.name}-${index}`} className={editing?.name === item.name ? 'selected' : ''} onClick={() => edit(item)}><span className="category-icon"><Icon name={type === 'account' ? item.icon || 'wallet' : type === 'payer' ? 'person' : item.icon || 'star'} size={18} /></span><span><strong>{item.name}</strong><small>{type === 'account' ? item.multi ? item.type : `${item.type} · ${currencySymbol(item.currency)}` : type === 'category' ? `${item.kind} · ${item.parent}` : 'Плательщик'}</small></span><Icon name="chevron" size={16} /></button>)}</div><button type="button" className="flow-link" onClick={create}>+ Добавить {type === 'account' ? 'счёт' : type === 'category' ? 'подкатегорию' : 'плательщика'}</button><div className="directory-form"><strong>{editing ? 'Изменить' : 'Добавить'}</strong><label className="flow-input">Название<input value={name} maxLength={50} onChange={event => setName(event.target.value)} placeholder={type === 'category' ? 'Например, Кофе' : 'Введите название'} /></label>{type === 'account' && <><label className="flow-input">Тип счёта<input value={accountType} onChange={event => setAccountType(event.target.value)} /></label><label className="flow-check"><input type="checkbox" checked={accountMulti} onChange={event => { setAccountMulti(event.target.checked); if (event.target.checked) setAccountCurrencies([currency]); }} /> Мультивалютный счёт</label><SelectField label={accountMulti ? "Валютные карманы" : "Валюта"} value={accountMulti ? accountCurrencies.map(currencySymbol).join(" · ") : `${currencySymbol(currency)} ${currency}`} onClick={() => setSubmodal({ type: 'account-currencies' })} /><SelectField label="Остаток" value={money(numeric(balance) || 0, currency)} onClick={() => setSubmodal({ type: 'calc' })} /></>}{type === 'category' && <><div className="entry-tabs" role="tablist" aria-label="Тип категории">{['Расход','Доход'].map(value => <button type="button" role="tab" aria-selected={kind === value} className={kind === value ? 'active' : ''} key={value} onClick={() => { setKind(value); setParent(CATEGORY_TREE[value][0].name); }}>{value}</button>)}</div><label className="flow-inline"><span>Раздел</span><select value={parent} onChange={event => setParent(event.target.value)}>{CATEGORY_TREE[kind].map(item => <option key={item.name}>{item.name}</option>)}</select></label><div className="directory-icons" aria-label="Иконка категории">{['star','cart','cup','house','car','bus','bag','gift','heart','briefcase'].map(value => <button type="button" key={value} className={icon === value ? 'selected' : ''} onClick={() => setIcon(value)} aria-label={`Иконка ${value}`}><Icon name={value} size={19} /></button>)}</div></>}<button type="button" className="flow-primary directory-save" disabled={!name.trim()} onClick={save}>Сохранить</button>{canRemove && <button type="button" className="flow-link" onClick={remove}>Удалить пользовательскую запись</button>}</div></div></div>;
}
function RateEditor({ code, settings, update, onClose }) {
  const [value, setValue] = useState(String(settings.rates[code] || ''));
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const rate = numeric(value);
  if (calculatorOpen) return <Calculator value={value} decimals={8} onApply={next => { setValue(next); setCalculatorOpen(false); }} onClose={() => setCalculatorOpen(false)} />;
  if (code === 'USD') return <div className="flow-overlay"><div className="flow-sheet"><div className="sheet-head"><strong>Курс USD</strong><button type="button" onClick={onClose} aria-label="Закрыть">×</button></div><p className="flow-caption">USD — опорная валюта курсов. Её курс равен 1.</p><button type="button" className="flow-primary" onClick={onClose}>Готово</button></div></div>;
  return <div className="flow-overlay"><div className="flow-sheet"><div className="sheet-head"><strong>Курс {code}</strong><button type="button" onClick={onClose} aria-label="Закрыть">×</button></div><SelectField label={`1 ${code} в USD`} value={value || 'Указать курс'} onClick={() => setCalculatorOpen(true)} /><p className="flow-caption">Ручной курс влияет на новые предварительные суммы. Проведённые операции не меняются.</p><button type="button" className="flow-primary" disabled={!Number.isFinite(rate) || rate <= 0} onClick={() => { update({ rates: { ...settings.rates, [code]: rate } }); onClose(); }}>Сохранить курс</button></div></div>;
}
function AddCurrency({ settings, update, onClose, onAdded }) {
  const [code, setCode] = useState('');
  const normalized = code.trim().toUpperCase();
  const valid = /^[A-Z]{3,5}$/.test(normalized) && !settings.currencies.includes(normalized);
  return <div className="flow-overlay"><div className="flow-sheet"><div className="sheet-head"><strong>Добавить валюту</strong><button type="button" onClick={onClose} aria-label="Закрыть">×</button></div><label className="flow-input">Код валюты<input autoFocus value={code} maxLength={5} onChange={event => setCode(event.target.value)} placeholder="Например, GBP" /></label><p className="flow-caption">Для новой валюты задайте курс вручную или обновите его через API.</p><button type="button" className="flow-primary" disabled={!valid} onClick={() => { update({ currencies: [...settings.currencies, normalized] }); onAdded(normalized); }}>Добавить</button></div></div>;
}
function CurrencyModals({ modal, setModal, settings, update, onCurrency }) {
  if (!modal) return null;
  if (modal.type === 'picker') return <CurrencyPicker settings={settings} onSelect={code => { onCurrency(code); setModal(null); }} onClose={() => setModal(null)} onEdit={code => setModal({ type: 'rate', code })} onAdd={() => setModal({ type: 'add' })} />;
  if (modal.type === 'rate') return <RateEditor code={modal.code} settings={settings} update={update} onClose={() => setModal(null)} />;
  if (modal.type === 'add') return <AddCurrency settings={settings} update={update} onClose={() => setModal(null)} onAdded={code => { onCurrency(code); setModal({ type: 'rate', code }); }} />;
  return null;
}
export function WelcomeFlow() {
  const [settings, update] = useCurrencySettings();
  const [name, setName] = useState('Наличные');
  const [currency, setCurrency] = useState('USD');
  const [opening, setOpening] = useState('10000');
  const [modal, setModal] = useState(null);
  const save = () => { try { localStorage.setItem(firstAccountKey, JSON.stringify({ name: name.trim() || 'Мой счёт', currency, opening: numeric(opening) || 0 })); } catch { /* Design preview remains usable. */ } };
  return <><p className="mobile-eyebrow">SO1 MONEY</p><div className="welcome-illustration"><img className="welcome-logo" src="/logo-mark.png" alt="So1 Money" width="148" height="148" /></div><h2 className="welcome-title">Начните<br />с одного счёта.</h2><p className="welcome-description">Записывайте покупки и следите за остатками. Регистрация не нужна.</p><div className="flow-card"><label className="flow-input">Название счёта<input value={name} onChange={event => setName(event.target.value)} /></label><SelectField label="Валюта счёта" value={`${currencySymbol(currency)} ${currency}`} onClick={() => setModal({ type: 'picker' })} /><SelectField label="Начальный остаток" value={money(numeric(opening) || 0, currency)} onClick={() => setModal({ type: 'calc' })} /></div><a className="flow-primary" href={screenHref('base-accounts')} onClick={save}>Начать вести учёт</a><p className="flow-caption center">По умолчанию доллар США. Валюту можно выбрать сейчас.</p>{modal?.type === 'calc' ? <Calculator value={opening} onApply={value => { setOpening(value); setModal(null); }} onClose={() => setModal(null)} /> : <CurrencyModals modal={modal} setModal={setModal} settings={settings} update={update} onCurrency={setCurrency} />}</>;
}
export function EntryFlow({ initialKind = 'Расход', href = screenHref }) {
  const [settings, update] = useCurrencySettings();
  const first = getFirstAccount();
  const multi = getMultiAccount(), multiLabel = `${multi.name} · мультивалютный`;
  const [kind, setKind] = useState(initialKind), [amount, setAmount] = useState(initialKind === 'Перевод' ? '3000' : '500');
  const [currency, setCurrency] = useState(first?.currency || settings.base), [account, setAccount] = useState(first?.name || 'Наличные'), [destination, setDestination] = useState('Банковский счёт');
  const [fromPocket, setFromPocket] = useState(first?.currency || settings.base), [modal, setModal] = useState(null);
  const [category, setCategory] = useState('Продукты · Супермаркет'), [categoryIcon, setCategoryIcon] = useState('cart'), [payer, setPayer] = useState('Я'), [recipient, setRecipient] = useState('Анна');
  const [splitEnabled, setSplitEnabled] = useState(false), [shares, setShares] = useState([{ name: 'Я', amount: '500' }]);
  const [repeat, setRepeat] = useState('Не повторять'), [note, setNote] = useState(''), [date, setDate] = useState('2026-10-09'), [tags, setTags] = useState([]);
  const [includeTotal, setIncludeTotal] = useState(true), [includeBudget, setIncludeBudget] = useState(true);
  const amountNumber = numeric(amount), baseAmount = convert(amountNumber, currency, settings.base, settings.rates);
  const shareTotal = shares.reduce((sum, item) => sum + (numeric(item.amount) || 0), 0);
  const amountCents = Math.round((amountNumber || 0) * 100);
  const shareCents = shares.reduce((sum, item) => sum + Math.round((numeric(item.amount) || 0) * 100), 0);
  const validShares = kind === 'Перевод' || !splitEnabled || (shares.length > 0 && shares.some(item => item.name === 'Я') && shares.every(item => item.name.trim() && Number.isFinite(numeric(item.amount)) && numeric(item.amount) >= 0) && shareCents === amountCents);
  const canPreview = Number.isFinite(amountNumber) && amountNumber > 0 && validShares;
  const selectParticipants = names => {
    const cents=Math.round((amountNumber||0)*100), base=Math.floor(cents/Math.max(1,names.length));
    setShares(names.map((name,index)=>({name,amount:String(((index===names.length-1?cents-base*(names.length-1):base)/100))})));
    setModal(null);
  };
  const activeMulti = getAccountRows(first, multi).find(item => item.name === account && item.multi) || (account === multiLabel ? multi : null);
  const pockets = activeMulti ? activeMulti.currencies : [account === first?.name ? first.currency : settings.base];
  const pocketAmount = convert(amountNumber, currency, fromPocket, settings.rates);
  const selectAccount = (item, role) => {
    if (role === 'destination') { setDestination(item.name); setModal(null); return; }
    setAccount(item.name);
    if (item.multi) {
      setFromPocket(item.currencies.includes(currency) ? currency : item.currencies[0]);
      setModal({ type: 'pocket' });
    } else {
      setFromPocket(item.currency || settings.base);
      setModal(null);
    }
  };
  return <><div className="entry-head"><h2>Новая операция</h2></div><EntrySwitch kind={kind} setKind={value => { setKind(value); if (value === 'Доход') { setCategory('Работа · Зарплата'); setCategoryIcon('briefcase'); setPayer('Работодатель'); setSplitEnabled(false); } else if (value === 'Расход') { setCategory('Продукты · Супермаркет'); setCategoryIcon('cart'); setPayer('Я'); } }} />{kind === 'Расход' && <div className="entry-capture-actions"><a href={href('receipt')}><Icon name="camera" size={17} />Фото чека</a><a href={href('qr-receipt')}><Icon name="qr" size={17} />QR чека</a></div>}<div className="entry-amount"><button type="button" className="entry-amount-value" onClick={() => setModal({ type: 'calc' })} aria-label="Открыть калькулятор суммы">{money(Number.isFinite(amountNumber) ? amountNumber : 0, '')}</button><button type="button" className="entry-currency" onClick={() => setModal({ type: 'picker' })} aria-label={`Выбрать валюту, ${currency}`}>{SYMBOL[currency] || currency} <Icon name="chevron" size={16} /></button><small>Нажмите на сумму для калькулятора</small></div>{currency !== settings.base && <p className="entry-conversion">{baseAmount === null ? 'Курс к базовой валюте не задан' : `≈ ${money(baseAmount, settings.base)} в базовой валюте · ${settings.rates[currency] === DEMO_USD[currency] ? 'курс по умолчанию' : 'выбранный курс'}`}</p>}
  <div className="flow-card compact"><SelectField label={kind === 'Перевод' ? 'Списать со счёта' : 'Счёт'} value={account} onClick={() => setModal({ type: 'account', role: 'source' })} />{activeMulti && <SelectField label="Списать из кармана" value={fromPocket} detail={fromPocket !== currency ? `≈ ${pocketAmount === null ? 'курс не задан' : money(pocketAmount, fromPocket)}` : 'Совпадает с валютой операции'} onClick={() => setModal({ type: 'pocket' })} />}{kind === 'Перевод' ? <><SelectField label="На счёт" value={destination} onClick={() => setModal({ type: 'account', role: 'destination' })} /><SelectField label="Кому перевели" value={recipient} icon="person" onClick={() => setModal({ type: 'recipient' })} /></> : <><SelectField label="Категория" value={category} icon={categoryIcon} onClick={() => setModal({ type: 'category' })} /><SelectField label={kind === 'Доход' ? 'От кого' : 'Кто оплатил'} value={payer} icon="person" onClick={() => setModal({ type: 'payer' })} /></>}<SelectField label="Теги" value={tags.length ? tags.join(' · ') : 'Не выбраны'} icon="tag" onClick={() => setModal({ type: 'tags' })} /><SelectField label="Периодичность" value={repeat} onClick={() => setModal({ type: 'repeat' })} /><DateField label="Дата" value={date} onChange={setDate} /><label className="flow-inline"><span>Заметка</span><input value={note} onChange={event => setNote(event.target.value)} placeholder="Необязательно" /></label></div>
  {kind === 'Расход' && <button type="button" className={`split-toggle ${splitEnabled ? 'on' : ''}`} aria-pressed={splitEnabled} onClick={() => setSplitEnabled(value => !value)}><span className="split-toggle-mark">{splitEnabled ? '✓' : ''}</span><span><strong>Разделить между людьми</strong><small>{splitEnabled ? 'Доли из справочника плательщиков' : 'Вся сумма остаётся на вас'}</small></span></button>}
  {splitEnabled && kind === 'Расход' && <div className="split-card"><div className="split-card-head"><strong>Доли</strong><button type="button" onClick={() => setModal({ type: 'payer-multi' })}>Люди</button></div>{shares.map((item, index) => <div className="split-person" key={`${item.name}-${index}`}><span className="split-avatar">{item.name.slice(0, 1)}</span><span>{item.name}</span><button type="button" className="share-amount-button" onClick={() => setModal({ type: 'share-calc', index })}>{money(numeric(item.amount) || 0, currency)}</button></div>)}<div className="split-meter" aria-hidden="true"><span style={{ width: `${Math.max(0, Math.min(100, amountNumber ? shareTotal / amountNumber * 100 : 0))}%` }} /></div><div className="share-entry-total"><span>Собрано</span><strong>{money(shareTotal, currency)} из {money(amountNumber || 0, currency)}</strong></div>{!validShares && <small className="share-entry-warning" role="alert">{shareCents > amountCents ? `Превышение: ${money((shareCents - amountCents) / 100, currency)}` : `Осталось ${money((amountCents - shareCents) / 100, currency)}`}. Сумма долей должна совпасть с покупкой, доля «Я» обязательна.</small>}</div>}
  {kind !== 'Перевод' && <div className="entry-flags"><label><input type="checkbox" checked={includeTotal} onChange={event => setIncludeTotal(event.target.checked)} /> В общий итог</label><label><input type="checkbox" checked={includeBudget} onChange={event => setIncludeBudget(event.target.checked)} /> В бюджет</label></div>}
  <div className="entry-foot"><span>Остаток счёта обновится после сохранения</span><button type="button" className="flow-primary" disabled={!canPreview} onClick={() => { if (kind === 'Расход' && splitEnabled) saveSharedExpenseDebts(shares, currency, date, note); const [year, month, day] = date.split('-'); const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']; rememberOperation({ id: `op-new-${Date.now()}`, day: `${Number(day)} ${months[Number(month) - 1]}`, date: dottedDate(date), title: kind === 'Перевод' ? 'Перевод' : (category.split(' · ').at(-1) || category), detail: kind === 'Перевод' ? `${account} → ${destination}` : `${note || 'Без заметки'} · ${account}`, amount: `${kind === 'Доход' ? '+' : kind === 'Перевод' ? '' : '−'}${new Intl.NumberFormat('ru-RU').format(amountNumber)} ${SYMBOL[currency] || currency}`, tone: kind === 'Доход' ? 'positive' : kind === 'Перевод' ? '' : 'negative', kind: kind === 'Перевод' ? 'transfer' : kind === 'Доход' ? 'briefcase' : categoryIcon, group: kind, account, category: kind === 'Перевод' ? '' : category.split(' · ')[0], tags, period: 'Октябрь 2026' }); window.location.hash = href('base-journal'); }}>Сохранить</button></div>
  {modal?.type === 'calc' ? <Calculator value={amount} onApply={value => { setAmount(value); setModal(null); }} onClose={() => setModal(null)} /> : modal?.type === 'share-calc' ? <Calculator value={shares[modal.index]?.amount || '0'} onApply={value => { setShares(items => items.map((item, index) => index === modal.index ? { ...item, amount: value } : item)); setModal(null); }} onClose={() => setModal(null)} /> : <CurrencyModals modal={modal} setModal={setModal} settings={settings} update={update} onCurrency={code => { setCurrency(code); if (activeMulti && pockets.includes(code)) setFromPocket(code); }} />}
  {modal?.type === 'account' && <AccountPicker first={first} multi={multi} role={modal.role} exclude={modal.role === 'destination' ? account : undefined} onSelect={item => selectAccount(item, modal.role)} onClose={() => setModal(null)} onManage={() => setModal({ type: 'directory', directory: 'account', returnTo: modal })} />}
  {modal?.type === 'pocket' && <PocketPicker multi={activeMulti || multi} currency={currency} selected={fromPocket} onSelect={code => { setFromPocket(code); setModal(null); }} onClose={() => setModal(null)} />}
  {modal?.type === 'category' && <CategoryPicker kind={kind === 'Доход' ? 'Доход' : 'Расход'} selected={category} onSelect={(value, icon) => { setCategory(value); setCategoryIcon(icon); setModal(null); }} onClose={() => setModal(null)} onManage={() => setModal({ type: 'directory', directory: 'category', returnTo: modal })} />}
  {modal?.type === 'payer' && <PayerPicker title={kind === 'Доход' ? 'От кого' : 'Кто оплатил'} suggestions={kind === 'Доход' ? ['Работодатель'] : []} selected={payer} onSelect={value => { setPayer(value); setModal(null); }} onClose={() => setModal(null)} onManage={() => setModal({ type: 'directory', directory: 'payer', returnTo: modal })} />}
  {modal?.type === 'recipient' && <PayerPicker title="Кому перевели" suggestions={['Анна', 'Тимур']} selected={recipient} onSelect={value => { setRecipient(value); setModal(null); }} onClose={() => setModal(null)} onManage={() => setModal({ type: 'directory', directory: 'payer', returnTo: modal })} />}
  {modal?.type === 'payer-multi' && <PayerMultiPicker selected={shares.map(item=>item.name)} onApply={selectParticipants} onClose={()=>setModal(null)} />}
  {modal?.type === 'tags' && <TagPicker selected={tags} onApply={value => { setTags(value); setModal(null); }} onClose={() => setModal(null)} />}
  {modal?.type === 'directory' && <DirectoryEditor type={modal.directory} onClose={() => setModal(modal.returnTo)} />}
  {modal?.type === 'repeat' && <div className="flow-overlay" role="dialog" aria-label="Периодичность"><div className="flow-sheet"><div className="sheet-head"><strong>Периодичность</strong><button type="button" onClick={() => setModal(null)} aria-label="Закрыть">×</button></div><div className="account-picker-list">{['Не повторять','Каждую неделю','Каждый месяц','Каждый год'].map(value => <button type="button" className={`payer-picker-row ${repeat === value ? 'selected' : ''}`} key={value} onClick={() => { setRepeat(value); setModal(null); }}><Icon name="clock" size={19} />{value}<span className="payer-picker-mark">{repeat === value ? '✓' : '›'}</span></button>)}</div></div></div>}</>;
}
export function CurrenciesFlow() {
  const [settings, update] = useCurrencySettings(), [modal, setModal] = useState(null), [status, setStatus] = useState('Курсы можно обновить вручную или из источника'), [query, setQuery] = useState('');
  const refresh = async () => {
    setStatus('Обновляем курсы…');
    const next = { ...settings.rates }, results = [];
    for (const code of settings.currencies.filter(item => item !== 'USD')) {
      try {
        const response = await fetch(`https://api.frankfurter.dev/v2/rate/${code.toLowerCase()}/usd`);
        if (!response.ok) throw new Error(String(response.status));
        const data = await response.json();
        const rate = Number(Array.isArray(data) ? data[0]?.rate : data.rate);
        if (!Number.isFinite(rate) || rate <= 0) throw new Error('Курс отсутствует');
        next[code] = rate; results.push(`${code} ${data.date || ''}`.trim());
      } catch { /* Show which currencies could not be refreshed. */ }
    }
    if (results.length) update({ rates: next });
    setStatus(results.length ? `Frankfurter · ${results.join(', ')}${results.length < settings.currencies.length - 1 ? ' · часть курсов недоступна' : ''}` : 'Не удалось загрузить курсы. Можно ввести их вручную.');
  };
  return <><div className="entry-head"><h2>Валюты и курсы</h2></div><div className="currency-base-card"><span>Базовая валюта</span><button type="button" onClick={() => setModal({ type: 'picker', mode: 'base' })}><strong>{currencySymbol(settings.base)}</strong><span>{settings.base}<small>Все итоги сравниваются в этой валюте</small></span><Icon name="chevron" size={17} /></button></div><div className="directory-section-head"><strong>Мои валюты</strong><button type="button" onClick={() => setModal({ type: 'add' })}>+ Добавить</button></div><SearchInput value={query} onChange={setQuery} placeholder="Найти валюту" /><div className="currency-settings-list">{settings.currencies.filter(code => `${code} ${currencySymbol(code)}`.toLowerCase().includes(query.toLowerCase())).map(code => <button type="button" key={code} onClick={() => setModal({ type: 'rate', code })}><span className="currency-choice-symbol">{currencySymbol(code)}</span><strong>{code}</strong><small>{code === settings.base ? 'база' : settings.rates[code] ? `≈ ${money(convert(1, code, settings.base, settings.rates), settings.base)}` : 'нет курса'}</small><Icon name="chevron" size={15} /></button>)}</div><button type="button" className="flow-primary currency-refresh" onClick={refresh}>Обновить курсы по API</button><p className="flow-caption">{status}</p><p className="flow-caption">Нажмите валюту, чтобы ввести свой курс. Сохранённые операции не пересчитываются.</p><CurrencyModals modal={modal} setModal={setModal} settings={settings} update={update} onCurrency={code => { if (modal?.mode === 'base') update({ base: code }); }} /></>;
}
export function AccountCreateFlow() {
  const [settings, update] = useCurrencySettings();
  const [name, setName] = useState('TBC'), [multi, setMulti] = useState(true), [currencies, setCurrencies] = useState(['GEL','USD','EUR']);
  const [modal, setModal] = useState(null);
  const toggle = code => setCurrencies(old => old.includes(code) ? old.length > 1 ? old.filter(item => item !== code) : old : [...old, code]);
  return <><div className="entry-head"><h2>Новый счёт</h2><small>Одна карта, несколько валютных карманов</small></div><div className="flow-card"><label className="flow-input">Название<input value={name} onChange={event => setName(event.target.value)} /></label><label className="flow-check"><input type="checkbox" checked={multi} onChange={event => setMulti(event.target.checked)} /> Мультивалютный счёт</label></div><div className="flow-card"><SelectField label={multi ? 'Валютные карманы' : 'Валюта счёта'} value={currencies.map(code => currencySymbol(code)).join(' · ')} detail={currencies.join(' · ')} onClick={() => setModal({ type: 'account-currencies' })} /></div><p className="flow-caption">Остаток каждого кармана ведётся отдельно. Общий итог показывается в базовой валюте {currencySymbol(settings.base)}.</p><a className="flow-primary" href={screenHref('pockets')} onClick={() => { try { localStorage.setItem(multiAccountKey, JSON.stringify({ name: name.trim() || 'Мультивалютный счёт', currencies: multi ? currencies : [currencies[0]] })); } catch { /* Preview remains usable. */ } }}>Создать счёт</a>{modal?.type === 'account-currencies' ? <AccountCurrencyPicker settings={settings} multi={multi} selected={currencies} onSelect={code => multi ? toggle(code) : (setCurrencies([code]), setModal(null))} onClose={() => setModal(null)} onAdd={() => setModal({ type: 'add' })} /> : <CurrencyModals modal={modal} setModal={setModal} settings={settings} update={update} onCurrency={code => setCurrencies(old => multi ? [...new Set([...old, code])] : [code])} />}</>;
}
export function PocketsFlow() {
  const [settings] = useCurrencySettings();
  const account = getMultiAccount();
  const demoAmounts = { GEL: 1000, USD: 500, EUR: 300 };
  const format = value => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(value);
  const pockets = account.currencies.map(code => {
    const amount = demoAmounts[code] || 0;
    const base = code === settings.base ? amount : convert(amount, code, settings.base, settings.rates);
    return { code, amount, base };
  });
  const total = pockets.reduce((sum, item) => sum + (Number.isFinite(item.base) ? item.base : 0), 0);
  const count = account.currencies.length;
  const currencyWord = count % 10 === 1 && count % 100 !== 11 ? 'валюта' : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20) ? 'валюты' : 'валют';
  return <><div className="mobile-topline small"><a className="circle-button" href={screenHref('base-accounts')} aria-label="Назад"><Icon name="back" /></a><h2>{account.name}</h2><span className="topline-spacer" /></div><MobileHero label="Остаток по учёту" amount={format(total)} currency={currencySymbol(settings.base)} meta={`${count} ${currencyWord} · в ${currencySymbol(settings.base)}`} /><div className="mobile-tabs"><a href={screenHref('base-expense')}>− Расход</a><a href={screenHref('base-expense')}>+ Доход</a><a href={screenHref('base-transfer')}>Перевод</a></div><div className="mobile-section-heading"><h3>Валюты счёта</h3></div>{pockets.map(item => <AccountTile key={item.code} mark={currencySymbol(item.code)} title={item.code} subtitle={item.code === settings.base ? 'Базовая валюта' : Number.isFinite(item.base) ? `≈ ${format(item.base)} ${currencySymbol(settings.base)}` : 'Курс не задан'} amount={`${format(item.amount)} ${currencySymbol(item.code)}`} />)}<a className="flow-secondary" href={screenHref('createaccount')}>Настроить валюты счёта</a></>;
}
function formatRange(from, to) {
  if (!from) return 'Период';
  if (!to || from === to) return formatIsoDate(from);
  const start = from < to ? from : to;
  const end = from < to ? to : from;
  return `${formatIsoDate(start)} – ${formatIsoDate(end)}`;
}
const DEMO_REPORT_OPS = [
  { date: '2026-10-13', account: 'Наличные', amount: -1240, group: 'Расход', category: 'Продукты' },
  { date: '2026-10-13', account: 'Наличные', amount: 3000, group: 'Перевод', category: 'Перевод' },
  { date: '2026-10-13', account: 'Наличные', amount: 200, group: 'Долг', category: 'Долг' },
  { date: '2026-10-12', account: 'Банковский счёт', amount: 70000, group: 'Доход', category: 'Зарплата' },
  { date: '2026-10-12', account: 'Наличные', amount: -450, group: 'Расход', category: 'Кафе' },
  { date: '2026-10-11', account: 'Наличные', amount: -320, group: 'Расход', category: 'Такси' },
  { date: '2026-10-11', account: 'Банковский счёт', amount: 5000, group: 'Перевод', category: 'Перевод' },
  { date: '2026-10-10', account: 'Банковский счёт', amount: -30000, group: 'Расход', category: 'Аренда' },
  { date: '2026-10-10', account: 'Наличные', amount: -1500, group: 'Долг', category: 'Долг' },
  { date: '2026-10-09', account: 'Наличные', amount: -500, group: 'Расход', category: 'Продукты' },
  { date: '2026-10-09', account: 'Наличные', amount: 2000, group: 'Доход', category: 'Подработка' },
  { date: '2026-10-08', account: 'Наличные', amount: -800, group: 'Долг', category: 'Долг' },
  { date: '2026-10-08', account: 'Банковский счёт', amount: -1850, group: 'Расход', category: 'Коммунальные' }
];
function reportIso(date) {
  const match = String(date || '').match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  return /^\d{4}-\d{2}-\d{2}/.test(String(date)) ? String(date).slice(0, 10) : '';
}
function reportAmount(value) {
  if (typeof value === 'number') return value;
  const raw = String(value || '');
  const negative = /−|-/.test(raw);
  const number = Number(raw.replace(/[^\d,.]/g, '').replace(',', '.')) || 0;
  return negative ? -number : number;
}
function currencyFromText(raw) {
  const text = String(raw || '');
  const found = Object.entries(SYMBOL).find(([, symbol]) => symbol && text.includes(symbol));
  return found ? found[0] : 'RUB';
}
function reportOperations() {
  const created = readCreatedOperations().map(item => ({
    date: reportIso(item.date),
    account: item.account || 'Наличные',
    amount: reportAmount(item.amount),
    currency: item.currency || currencyFromText(item.amount),
    group: item.group || 'Расход',
    category: item.category || item.group || 'Прочее',
    title: item.title || item.category || 'Операция'
  })).filter(item => item.date);
  return [...DEMO_REPORT_OPS.map(item => ({ ...item, currency: 'RUB', title: item.category })), ...created];
}
function isoFromParts(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function parseIso(iso) {
  const [year, month, day] = String(iso || '').split('-').map(Number);
  return new Date(year || 2026, (month || 1) - 1, day || 1);
}
function shiftIso(iso, days) {
  const date = parseIso(iso);
  date.setDate(date.getDate() + days);
  return isoFromParts(date);
}
function dayCount(from, to) {
  return Math.round((parseIso(to) - parseIso(from)) / 86400000) + 1;
}
const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
function periodFor(scale, anchor) {
  const date = parseIso(anchor);
  if (scale === 'week') {
    const monday = (date.getDay() + 6) % 7;
    const start = new Date(date);
    start.setDate(date.getDate() - monday);
    return { from: isoFromParts(start), to: shiftIso(isoFromParts(start), 6) };
  }
  if (scale === 'year') return { from: `${date.getFullYear()}-01-01`, to: `${date.getFullYear()}-12-31` };
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { from: isoFromParts(start), to: isoFromParts(end) };
}
function dayBuckets(from, to) {
  const buckets = [];
  let cursor = parseIso(from);
  const end = parseIso(to);
  while (cursor <= end && buckets.length < 16) {
    const iso = isoFromParts(cursor);
    buckets.push({ from: iso, to: iso, label: `${String(cursor.getDate()).padStart(2, '0')}.${String(cursor.getMonth() + 1).padStart(2, '0')}` });
    cursor.setDate(cursor.getDate() + 1);
  }
  return buckets;
}
function weekBuckets(from, to) {
  const buckets = [];
  let cursor = parseIso(from);
  const end = parseIso(to);
  while (cursor <= end && buckets.length < 12) {
    const startIso = isoFromParts(cursor);
    const monday = (cursor.getDay() + 6) % 7;
    const weekEnd = new Date(cursor);
    weekEnd.setDate(cursor.getDate() + (6 - monday));
    if (weekEnd > end) weekEnd.setTime(end.getTime());
    const startDay = cursor.getDate();
    const endDay = weekEnd.getDate();
    buckets.push({ from: startIso, to: isoFromParts(weekEnd), label: startDay === endDay ? String(startDay) : `${startDay}–${endDay}` });
    cursor = new Date(weekEnd);
    cursor.setDate(weekEnd.getDate() + 1);
  }
  return buckets;
}
function monthBuckets(from, to) {
  const buckets = [];
  const end = parseIso(to);
  let cursor = parseIso(from);
  cursor.setDate(1);
  while (cursor <= end && buckets.length < 18) {
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const start = new Date(Math.max(cursor.getTime(), parseIso(from).getTime()));
    const stop = monthEnd < end ? monthEnd : end;
    buckets.push({ from: isoFromParts(start), to: isoFromParts(stop), label: MONTHS_SHORT[cursor.getMonth()] });
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }
  return buckets;
}
function bucketsFor(scale, from, to) {
  const days = dayCount(from, to);
  if (scale === 'week' || days <= 14) return dayBuckets(from, to);
  if (scale === 'year' || days > 62) return monthBuckets(from, to);
  return weekBuckets(from, to);
}
function categoryIcon(name) {
  for (const groups of Object.values(CATEGORY_TREE)) {
    for (const parent of groups) {
      if (parent.name === name) return parent.icon;
      const child = parent.children.find(([childName]) => childName === name);
      if (child) return child[1];
    }
  }
  return 'star';
}
function axisMoney(value) {
  const abs = Math.abs(Math.round(value));
  if (abs >= 1000000) return `${new Intl.NumberFormat('ru-RU').format(Math.round(abs / 1000))} тыс`;
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(abs);
}
function niceStep(rough) {
  if (!(rough > 0)) return 1;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const n = rough / pow;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return nice * pow;
}
function niceCeil(value) {
  if (!(value > 0)) return 1;
  const step = niceStep(value / 2);
  return Math.max(step, Math.ceil((value * 1.12) / step) * step);
}
function SpendBars({ buckets, activeKey, onSelect }) {
  const width = 360, height = 196, left = 6, right = 76, top = 14, bottom = 28;
  const plotW = width - left - right, plotH = height - top - bottom;
  const peak = Math.max(0, ...buckets.map(item => item.value));
  const topValue = niceCeil(peak);
  const active = buckets.find(item => item.key === activeKey) || buckets[0];
  const yOf = value => top + plotH - (value / topValue) * plotH;
  const guide = active && active.value > 0 ? active.value : null;
  const showTop = guide == null || Math.abs(yOf(topValue) - yOf(guide)) > 18;
  const slot = plotW / Math.max(1, buckets.length);
  const barW = Math.max(8, Math.min(28, slot * 0.62));
  return <svg className="analytics-bars" viewBox={`0 0 ${width} ${height}`} role="group" aria-label="Сумма по периодам. Ось справа — сумма, выбранный столбец подписан своим значением.">
    <line className="analytics-grid" x1={left} x2={width - right} y1={yOf(0)} y2={yOf(0)} />
    <text x={width - right + 8} y={yOf(0) + 4} textAnchor="start">0</text>
    {showTop && <g><line className="analytics-grid" x1={left} x2={width - right} y1={yOf(topValue)} y2={yOf(topValue)} /><text x={width - right + 8} y={yOf(topValue) + 4} textAnchor="start">{axisMoney(topValue)}</text></g>}
    {guide != null && <g><line className="analytics-guide" x1={left} x2={width - right} y1={yOf(guide)} y2={yOf(guide)} /><text className="analytics-axis-value" x={width - right + 8} y={yOf(guide) + 4} textAnchor="start">{axisMoney(guide)}</text></g>}
    {buckets.map((item, index) => {
      const x = left + index * slot + (slot - barW) / 2;
      const barH = item.value > 0 ? Math.max(4, (item.value / topValue) * plotH) : 0;
      const y = top + plotH - barH;
      const radius = Math.min(6, barW / 2, barH / 2);
      const path = barH <= 0 ? '' : `M ${x} ${y + barH} L ${x} ${y + radius} Q ${x} ${y} ${x + radius} ${y} L ${x + barW - radius} ${y} Q ${x + barW} ${y} ${x + barW} ${y + radius} L ${x + barW} ${y + barH} Z`;
      const chosen = item.key === active?.key;
      return <g key={item.key} className={chosen ? 'is-selected' : ''} role="button" tabIndex={0} aria-pressed={chosen} aria-label={`${item.label}: ${axisMoney(item.value)}`} onClick={() => onSelect(item.key)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(item.key); } }}>
        <rect x={left + index * slot} y={top} width={slot} height={plotH} fill="transparent" />
        {path && <path d={path} />}
        <text x={left + index * slot + slot / 2} y={height - 8} textAnchor="middle">{item.label}</text>
      </g>;
    })}
  </svg>;
}
function AnalyticsDonut({ segments, selected }) {
  const total = segments.reduce((sum, item) => sum + item.value, 0) || 1;
  let cursor = 0;
  const stops = segments.map(item => {
    const start = cursor;
    cursor += item.value / total;
    return { ...item, start, end: cursor };
  });
  const gradient = stops.map(item => `${selected && selected !== item.label ? `${item.color}66` : item.color} ${item.start * 100}% ${item.end * 100}%`).join(',');
  return <div className="analytics-donut-wrap">{segments.length ? <div className="analytics-donut" style={{ background: `conic-gradient(${gradient})` }}><div className="analytics-donut-hole" /></div> : <p className="search-empty">В этом периоде нет таких операций.</p>}{stops.filter(item => item.end - item.start >= 0.03).map((item, index, all) => {
    const mid = (item.start + item.end) / 2 * Math.PI * 2 - Math.PI / 2;
    const previous = index > 0 ? (all[index - 1].start + all[index - 1].end) / 2 * Math.PI * 2 - Math.PI / 2 : -99;
    const radius = Math.abs(mid - previous) < 0.7 ? 47 : 36;
    return <span key={item.label} className="analytics-donut-label" style={{ left: `${50 + Math.cos(mid) * radius}%`, top: `${50 + Math.sin(mid) * radius}%` }}>{Math.round((item.end - item.start) * 100)}%</span>;
  })}</div>;
}
export function ReportsFlow({ href = screenHref } = {}) {
  const settings = readSettings();
  const today = isoFromParts(new Date());
  const [kind, setKind] = useState('Расход');
  const [account, setAccount] = useState('Все счета');
  const [currency, setCurrency] = useState(settings.base || 'RUB');
  const [selected, setSelected] = useState(null);
  const [scale, setScale] = useState('month');
  const [view, setView] = useState('bars');
  const [barKey, setBarKey] = useState(null);
  const [range, setRange] = useState({ from: '2026-10-01', to: '2026-10-31' });
  const [draft, setDraft] = useState({ from: '2026-10-01', to: '2026-10-31' });
  const [modal, setModal] = useState(null);
  const [currencyQuery, setCurrencyQuery] = useState('');
  const from = range.from <= (range.to || range.from) ? range.from : range.to;
  const to = range.from <= (range.to || range.from) ? (range.to || range.from) : range.from;
  const period = formatRange(from, to);
  const rates = { ...DEMO_USD, ...settings.rates };
  const asCurrency = (amount, source) => {
    const value = (source || 'RUB') === currency ? Math.abs(amount) : convert(Math.abs(amount), source || 'RUB', currency, rates);
    return Number.isFinite(value) ? value : 0;
  };
  const ops = reportOperations();
  const counts = item => item.group !== 'Перевод' && ((kind === 'Расход' && item.amount < 0) || (kind === 'Доход' && item.amount > 0));
  const inSpan = (item, start, end) => item.date >= start && item.date <= end && (account === 'Все счета' || item.account === account) && counts(item);
  const scoped = ops.filter(item => inSpan(item, from, to));
  const total = scoped.reduce((sum, item) => sum + asCurrency(item.amount, item.currency), 0);
  const span = dayCount(from, to);
  const previousEnd = shiftIso(from, -1);
  const previous = ops.filter(item => inSpan(item, shiftIso(previousEnd, -(span - 1)), previousEnd)).reduce((sum, item) => sum + asCurrency(item.amount, item.currency), 0);
  const delta = total - previous;
  const favorable = kind === 'Расход' ? delta < 0 : delta > 0;
  const data = [...scoped.reduce((map, item) => map.set(item.category || 'Прочее', (map.get(item.category || 'Прочее') || 0) + asCurrency(item.amount, item.currency)), new Map()).entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], index) => ({ label, value, color: chartPalette[index % chartPalette.length].hex }));
  const shown = selected ? scoped.filter(item => item.category === selected) : scoped;
  const buckets = bucketsFor(scale, from, to).map(bucket => ({
    ...bucket,
    key: `${bucket.from}:${bucket.to}`,
    value: shown.filter(item => item.date >= bucket.from && item.date <= bucket.to).reduce((sum, item) => sum + asCurrency(item.amount, item.currency), 0)
  }));
  const active = buckets.find(item => item.key === barKey) || [...buckets].sort((a, b) => b.value - a.value)[0] || null;
  const listed = shown.filter(item => active && item.date >= active.from && item.date <= active.to);
  const days = [...listed.reduce((map, item) => map.set(item.date, [...(map.get(item.date) || []), item]), new Map())].sort((a, b) => b[0].localeCompare(a[0]));
  const applyScale = next => {
    const anchor = today >= from && today <= to ? today : from;
    const nextRange = periodFor(next, anchor);
    setScale(next);
    setRange(nextRange);
    setDraft(nextRange);
    setBarKey(null);
    setSelected(null);
  };
  const currencyChoices = [settings.base, ...settings.currencies.filter(code => code !== settings.base)].filter((code, index, all) => code && all.indexOf(code) === index);
  const currencyLabel = currency === settings.base ? `Базовая ${currencySymbol(currency)}` : `${currencySymbol(currency)} ${currency}`;
  const journalHref = `${href('base-journal')}${href('base-journal').includes('?') ? '&' : '?'}${new URLSearchParams({ category: selected || '', account, kind, from: active?.from || from, to: active?.to || to }).toString()}`;
  return <>
    <div className="entry-head"><h2>Отчёты</h2><small>Движение средств · {period}</small></div>
    <div className="analytics-filters">
      <div className="filter-chip active analytics-period"><button type="button" onClick={() => { setDraft(range); setModal({ type: 'period' }); }}>{period}</button><button type="button" className="analytics-period-x" aria-label="Сбросить период" onClick={() => { const nextRange = periodFor('month', today); setScale('month'); setRange(nextRange); setDraft(nextRange); setBarKey(null); }}>×</button></div>
      <button type="button" className="filter-chip" onClick={() => setModal({ type: 'account' })}>{account}<Icon name="chevron" size={14} /></button>
      <button type="button" className="filter-chip" onClick={() => { setCurrencyQuery(''); setModal({ type: 'currency' }); }}>{currencyLabel}</button>
    </div>
    <div className="entry-tabs" role="tablist" aria-label="Тип отчёта">{['Расход', 'Доход'].map(value => <button type="button" role="tab" aria-selected={kind === value} className={kind === value ? 'active' : ''} key={value} onClick={() => { setKind(value); setSelected(null); setBarKey(null); }}>{value}</button>)}</div>
    <div className="report-stage analytics-stage"><section className="report-panel analytics-card">
      <div className="analytics-hero"><strong className="analytics-total">{money(total, currency)}</strong>{previous !== 0 && delta !== 0 && <span className={`analytics-delta ${favorable ? 'up' : 'down'}`}>{delta > 0 ? '↑' : '↓'} {money(Math.abs(delta), currency)}</span>}<small>{kind === 'Расход' ? 'Расходы' : 'Доходы'}</small></div>
      {view === 'bars' ? <SpendBars buckets={buckets} activeKey={active?.key} onSelect={setBarKey} /> : <AnalyticsDonut segments={data} selected={selected} />}
      <div className="analytics-toolbar">
        <div className="entry-tabs" role="tablist" aria-label="Масштаб">{[['week', 'Неделя'], ['month', 'Месяц'], ['year', 'Год']].map(([id, label]) => <button type="button" role="tab" key={id} aria-selected={scale === id} className={scale === id ? 'active' : ''} onClick={() => applyScale(id)}>{label}</button>)}</div>
        <div className="analytics-view" role="group" aria-label="Вид графика"><button type="button" className={view === 'donut' ? 'active' : ''} aria-pressed={view === 'donut'} aria-label="Кольцо" onClick={() => setView('donut')}><Icon name="target" size={18} /></button><button type="button" className={view === 'bars' ? 'active' : ''} aria-pressed={view === 'bars'} aria-label="Столбцы" onClick={() => setView('bars')}><Icon name="chart" size={18} /></button></div>
      </div>
      {!!data.length && <div className="analytics-pills">{data.map(item => <button type="button" key={item.label} className={`analytics-pill${selected === item.label ? ' active' : ''}`} aria-pressed={selected === item.label} onClick={() => { setSelected(selected === item.label ? null : item.label); setBarKey(null); }}><i style={{ background: item.color }}><Icon name={categoryIcon(item.label)} size={14} /></i><span>{item.label}</span><strong>{money(item.value, currency)}</strong></button>)}</div>}
      <div className="analytics-ops">{days.length ? days.map(([date, rows]) => <section key={date}><div className="analytics-day"><strong>{formatIsoDate(date)}</strong><span>{kind === 'Расход' ? '−' : '+'}{money(rows.reduce((sum, item) => sum + asCurrency(item.amount, item.currency), 0), currency)}</span></div>{rows.map((item, index) => <div className="analytics-op" key={`${item.date}-${item.title}-${index}`}><i style={{ background: data.find(row => row.label === item.category)?.color || chartPalette[0].hex }}><Icon name={categoryIcon(item.category)} size={16} /></i><span><strong>{item.title}</strong><small>{item.category} · {item.account}</small></span><em>{kind === 'Расход' ? '−' : '+'}{money(asCurrency(item.amount, item.currency), currency)}</em></div>)}</section>) : <p className="search-empty">В выбранном столбце нет операций.</p>}<a href={journalHref}>Открыть в журнале →</a></div>
    </section></div>
    <p className="flow-caption">Суммы пересчитаны в {currency === settings.base ? 'базовую валюту' : currencySymbol(currency)}. Переводы между своими счетами в доходы и расходы не входят. Столбец можно выбрать: пунктир и число справа — сумма этого столбца.</p>
    {modal?.type === 'account' && <AccountPicker first={getFirstAccount()} multi={getMultiAccount()} allowAll onSelect={item => { setAccount(item.name); setBarKey(null); setModal(null); }} onClose={() => setModal(null)} />}
    {modal?.type === 'currency' && <div className="flow-overlay" role="dialog" aria-label="Валюта отчёта"><div className="flow-sheet"><div className="sheet-head"><strong>Валюта отчёта</strong><button type="button" onClick={() => setModal(null)} aria-label="Закрыть">×</button></div><SearchInput value={currencyQuery} onChange={setCurrencyQuery} placeholder="Найти валюту" /><div className="account-picker-list">{currencyChoices.filter(code => `${code} ${currencySymbol(code)} базовая`.toLowerCase().includes(currencyQuery.toLowerCase())).map(code => <button type="button" key={code} className="account-picker-row" onClick={() => { setCurrency(code); setModal(null); }}><span className="account-picker-icon">{currencySymbol(code)}</span><span className="account-picker-copy"><strong>{code}</strong><small>{code === settings.base ? 'Базовая валюта' : `1 ${code} ≈ ${money(convert(1, code, settings.base, rates) || 0, settings.base)}`}</small></span><span className="payer-picker-mark">{currency === code ? '✓' : '›'}</span></button>)}</div></div></div>}
    {modal?.type === 'period' && <div className="flow-overlay" role="dialog" aria-label="Период отчёта"><div className="flow-sheet"><div className="sheet-head"><strong>Период отчёта</strong><button type="button" onClick={() => setModal(null)} aria-label="Закрыть">×</button></div><DateCalendar mode="range" from={draft.from} to={draft.to && draft.to !== draft.from ? draft.to : ''} onPick={iso => { if (!draft.from || (draft.to && draft.to !== draft.from)) { setDraft({ from: iso, to: iso }); return; } if (iso === draft.from) return; setDraft({ from: draft.from, to: iso }); }} onRangeChange={(start, end) => setDraft({ from: start || '', to: end || start || '' })} /><button type="button" className="flow-primary" disabled={!draft.from} onClick={() => { let start = draft.from; let end = draft.to || draft.from; if (start > end) [start, end] = [end, start]; setRange({ from: start, to: end }); setBarKey(null); setModal(null); }}>{draft.to && draft.to !== draft.from ? 'Показать период' : 'Показать день'}</button></div></div>}
  </>;
}
function ProductTrend({ title, points, labels, valueLabel, tone = 'green' }) {
  const width = 320, height = 142, padX = 14, padY = 18;
  const values = points.map(point => Number(point) || 0), min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
  const coords = values.map((value, index) => [padX + index * (width - 2 * padX) / Math.max(1, values.length - 1), height - padY - (value - min) / span * (height - 2 * padY)]);
  const line = coords.map(([x, y]) => `${x},${y}`).join(' ');
  const fill = `${padX},${height - padY} ${line} ${width - padX},${height - padY}`;
  return <section className="product-chart-card"><div className="product-chart-head"><strong>{title}</strong><span>{valueLabel}</span></div><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${title}: ${values.join(', ')}`} className={`product-trend ${tone}`}><line x1={padX} y1={height*.28} x2={width-padX} y2={height*.28} /><line x1={padX} y1={height*.62} x2={width-padX} y2={height*.62} /><polygon points={fill} /><polyline points={line} />{coords.map(([x,y],i)=><circle key={i} cx={x} cy={y} r="3" />)}</svg><div className="product-chart-labels">{labels.map(label=><small key={label}>{label}</small>)}</div></section>;
}

function ProductTable({ caption, columns, rows, onRowClick }) {
  return <div className="product-table-wrap"><div className="product-table-caption">{caption}</div><table className="product-table"><thead><tr>{columns.map((column,index)=><th key={`${column}-${index}`}>{column}</th>)}</tr></thead><tbody>{rows.map((row,index)=><tr key={index} className={onRowClick?'clickable-row':''} role={onRowClick?'link':undefined} tabIndex={onRowClick?0:undefined} onClick={onRowClick?()=>onRowClick(index):undefined} onKeyDown={onRowClick?event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onRowClick(index);}}:undefined}>{row.map((cell,cellIndex)=><td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

function ScheduleList({ rows }) {
  return <div className="ledger-card">{rows.map((row, index) => <div className="operation-row" key={`${row.title}-${index}`}><span className="operation-copy"><strong>{row.title}</strong>{row.subtitle && <small>{row.subtitle}</small>}</span><strong className={`operation-amount${row.tone ? ` ${row.tone}` : ''}`}>{row.amount}</strong></div>)}</div>;
}

const DEPOSIT_DATA = [
  { id:'deposit-detail', name:'Накопительный · TBC', account:'TBC · USD карман', currency:'USD', principal:10000, current:10145, accrued:145, rate:5.2, due:'31 окт', payout:43.15, end:'31.10.2027', type:'С ежемесячной выплатой' },
  { id:'deposit-detail', name:'Гибкий · TBC', account:'TBC · GEL карман', currency:'GEL', principal:3500, current:3586, accrued:86, rate:8.0, due:'5 ноя', payout:23.01, end:'05.05.2027', type:'Капитализация процентов' }
];
const LOAN_DATA = [
  { id:'loan-detail', name:'Ипотека · TBC', account:'TBC · USD карман', currency:'USD', original:52000, balance:48000, rate:6.5, payment:820, principal:560, interest:260, due:'1 ноя', end:'01.10.2034' },
  { id:'loan-detail', name:'Автокредит · Bank of Georgia', account:'TBC · GEL карман', currency:'GEL', original:10000, balance:7500, rate:9.8, payment:410, principal:320, interest:90, due:'8 ноя', end:'08.03.2028' }
];

export function DepositFlow({ screen }) {
  const requestedDeposit = Number(new URLSearchParams(window.location.hash.split('?')[1] || '').get('item'));
  const [selected, setSelected] = useState(Number.isInteger(requestedDeposit) && DEPOSIT_DATA[requestedDeposit] ? requestedDeposit : 0), [principal, setPrincipal] = useState('10000'), [rate, setRate] = useState('5.2'), [term, setTerm] = useState(12), [calcField,setCalcField]=useState(null);
  const [fundingAccount,setFundingAccount]=useState('TBC'), [fundingCurrency,setFundingCurrency]=useState('USD'), [modal,setModal]=useState(null);
  const first=getFirstAccount(), multi=getMultiAccount();
  const item = DEPOSIT_DATA[selected], months = ['Май','Июн','Июл','Авг','Сен','Окт'];
  const monthly = item.principal * item.rate / 100 / 12;
  const balance = Array.from({length:6},(_,i)=>Math.round(item.principal + monthly * (i+1)));
  const schedule = Array.from({length:6},(_,i)=>({date:['31 окт','30 ноя','31 дек','31 янв','28 фев','31 мар'][i],amount:item.payout,cumulative:item.accrued + item.payout*(i+1)}));
  if (screen?.id === 'deposit-new') {
    const p = numeric(principal) || 0, r = numeric(rate) || 0, earned = p * ((1 + r/100/12) ** term - 1);
    return <><div className="entry-head"><h2>Новый вклад</h2><small>Связь со счётом</small></div><div className="flow-card compact"><label className="flow-inline"><span>Название</span><input defaultValue="Накопительный TBC" /></label><SelectField label="Счёт и валюта вклада" value={`${fundingAccount} · ${currencySymbol(fundingCurrency)} карман`} onClick={()=>setModal({type:'account'})} /><SelectField label="Сумма вклада" value={money(p,fundingCurrency)} onClick={()=>setCalcField('principal')} /><SelectField label="Ставка годовых" value={`${r}%`} onClick={()=>setCalcField('rate')} /><label className="flow-inline"><span>Срок</span><select value={term} onChange={event=>setTerm(Number(event.target.value))}>{[6,12,18,24,36].map(value=><option key={value} value={value}>{value} месяцев</option>)}</select></label><label className="flow-inline"><span>Выплата процентов</span><select defaultValue="monthly"><option value="monthly">Ежемесячно на счёт</option><option value="capital">Капитализация</option></select></label></div><div className="product-summary-grid"><div><small>Ожидаемый доход</small><strong>{money(earned,fundingCurrency)}</strong></div><div><small>Сумма к окончанию</small><strong>{money(p+earned,fundingCurrency)}</strong></div></div><ProductTrend title="Рост суммы вклада" points={Array.from({length:6},(_,i)=>p + earned * (i+1)/6)} labels={['Старт','3 мес','6 мес','9 мес','12 мес']} valueLabel={`${money(p+earned,fundingCurrency)} через ${term} мес`} />{calcField&&<Calculator value={calcField==='principal'?principal:rate} decimals={2} onApply={value=>{calcField==='principal'?setPrincipal(value):setRate(value);setCalcField(null);}} onClose={()=>setCalcField(null)} />}{modal?.type==='account'&&<AccountPicker first={first} multi={multi} onSelect={item=>{setFundingAccount(item.name);if(item.multi){setModal({type:'pocket',account:item});}else{setFundingCurrency(item.currency||'USD');setModal(null);}}} onClose={()=>setModal(null)} onManage={()=>setModal(null)} />}{modal?.type==='pocket'&&<PocketPicker multi={modal.account} currency={fundingCurrency} selected={fundingCurrency} onSelect={code=>{setFundingCurrency(code);setModal(null);}} onClose={()=>setModal(null)} />}<a className="flow-primary" href={screenHref('deposit-payout')}>Проверить график</a><a className="flow-secondary" href={screenHref('deposits')}>Сохранить вклад</a></>;
  }
  if (screen?.id === 'deposit-payout') return <><div className="entry-head"><h2>График начислений</h2><small>{item.name}</small></div><div className="product-summary-grid"><div><small>Начислено</small><strong>{money(item.accrued,item.currency)}</strong></div><div><small>Следующее</small><strong>{money(item.payout,item.currency)}</strong></div></div><ProductTrend title="Проценты по месяцам" points={balance} labels={months} valueLabel={`${money(monthly,item.currency)} / мес`} /><ScheduleList rows={schedule.map(row=>({title:row.date,subtitle:`Накоплено ${money(row.cumulative,item.currency)}`,amount:money(row.amount,item.currency),tone:'positive'}))} /><p className="flow-caption">Расчёт по условиям вклада. Фактическое начисление подтвердите по выписке банка.</p><a className="flow-primary" href={`${screenHref(`deposit-detail?item=${selected}`)}`}>Карточка вклада</a></>;
  if (screen?.id === 'deposit-detail') return <><div className="entry-head"><h2>{item.name.split(' · ')[0]}</h2><small>{item.account}</small></div><div className="desktop-overview"><div><small>Начислено</small><strong>+{money(item.accrued,item.currency)}</strong></div><p>{String(item.rate).replace('.', ',')}% · следующая выплата {money(item.payout,item.currency)} · {item.due}</p></div><ProductTrend title="Баланс и начисления" points={balance} labels={months} valueLabel={item.end} /><div className="flow-card compact"><SelectField label="Связанный счёт" value={item.account} onClick={()=>{}} /><SelectField label="Тип начисления" value={item.type} onClick={()=>{}} /><SelectField label="Срок окончания" value={item.end} onClick={()=>{}} /></div><ScheduleList rows={schedule.slice(0,4).map(row=>({title:row.date,subtitle:`После выплаты ${money(item.current+row.amount,item.currency)}`,amount:`+${money(row.amount,item.currency)}`,tone:'positive'}))} /><a className="flow-secondary" href={`${screenHref(`deposit-payout?item=${selected}`)}`}>Полный график</a><a className="flow-secondary" href={screenHref('base-journal')}>Операции по счёту</a><p className="flow-caption">Плановые проценты показываются отдельно от денег на счёте и не включаются в остаток до фактической выплаты.</p></>;
  return <><div className="entry-head"><h2>Вклады</h2><small>Ставки, начисления и ближайшие выплаты</small></div><div className="desktop-overview"><div><small>Начислено</small><strong><span>$145</span><span>₾86</span></strong></div><p>Валюты не складываются без курса. Начисления и выплаты показаны отдельно.</p></div>{DEPOSIT_DATA.map((deposit,index)=><a className="account-tile" href={`${screenHref(`${deposit.id}?item=${index}`)}`} key={deposit.name} onClick={()=>setSelected(index)}><span className="account-tile-icon"><Icon name="deposit" /></span><span className="account-tile-copy"><strong>{deposit.name.split(' · ')[0]}</strong><small>{String(deposit.rate).replace('.', ',')}% · выплата {deposit.due}</small></span><strong className="account-tile-amount positive">+{money(deposit.accrued,deposit.currency)}</strong></a>)}<a className="flow-secondary" href={screenHref('deposit-new')}>Новый вклад</a><a className="flow-secondary" href={screenHref('deposit-payout')}>График выплат</a><a className="flow-secondary" href={screenHref('deposit-compare')}>Сравнение</a></>;
}

export function LoanFlow({ screen }) {
  const requestedLoan = Number(new URLSearchParams(window.location.hash.split('?')[1] || '').get('item'));
  const [selected,setSelected]=useState(Number.isInteger(requestedLoan) && LOAN_DATA[requestedLoan] ? requestedLoan : 0), [extra,setExtra]=useState(0);
  const [calcField,setCalcField]=useState(null), [scenarioAmount,setScenarioAmount]=useState('50000'), [scenarioRate,setScenarioRate]=useState('7'), [scenarioYears,setScenarioYears]=useState('15');
  const [modal,setModal]=useState(null), [paymentAccount,setPaymentAccount]=useState('TBC · USD карман'), [paymentDate,setPaymentDate]=useState('2026-11-01');
  const first=getFirstAccount(), multi=getMultiAccount();
  const item=LOAN_DATA[selected], ratePerMonth=item.rate/100/12;
  const schedule=Array.from({length:6},(_,i)=>{ const interest=Math.round((item.balance - i*item.principal)*ratePerMonth); const principal=Math.max(0,item.payment-interest); return {date:['01 ноя','01 дек','01 янв','01 фев','01 мар','01 апр'][i],payment:item.payment,principal,interest,balance:Math.max(0,item.balance-(i+1)*principal)}; });
  const remaining=Array.from({length:7},(_,i)=>Math.max(0,item.balance-i*item.principal));
  if (screen?.id === 'loan-calc') {
    const amount=numeric(scenarioAmount)||0, annual=numeric(scenarioRate)||0, count=(numeric(scenarioYears)||1)*12, monthlyRate=annual/1200;
    const payment=monthlyRate ? amount*monthlyRate*(1+monthlyRate)**count/((1+monthlyRate)**count-1) : amount/count;
    const totalInterest=Math.max(0,payment*count-amount), chart=Array.from({length:6},(_,i)=>Math.max(0,amount-(amount*0.28*(i+1)/6)));
    return <><div className="entry-head"><h2>Расчёт кредита</h2><small>Сценарий · без записи в счёт</small></div><div className="flow-card compact"><SelectField label="Сумма кредита" value={money(amount,'USD')} onClick={()=>setCalcField('amount')} /><SelectField label="Ставка годовых" value={`${annual}%`} onClick={()=>setCalcField('rate')} /><SelectField label="Срок" value={`${count} месяцев`} onClick={()=>setCalcField('years')} /><SelectField label="Тип платежа" value="Аннуитетный" onClick={()=>{}} /></div><div className="product-summary-grid"><div><small>Платёж в месяц</small><strong>{money(payment,'USD')}</strong></div><div><small>Всего процентов</small><strong>{money(totalInterest,'USD')}</strong></div></div><ProductTrend title="Остаток долга по сценарию" points={chart} labels={['Старт','3 года','6 лет','9 лет','12 лет']} tone="red" valueLabel={`${money(amount+totalInterest,'USD')} всего выплат`} /><ScheduleList rows={Array.from({length:5},(_,i)=>({title:`Месяц ${i+1}`,subtitle:`Проценты ${money(amount*monthlyRate*(1-monthlyRate)**i,'USD')} · остаток ${money(amount-(payment-amount*monthlyRate)*(i+1),'USD')}`,amount:money(payment,'USD')}))} />{calcField&&<Calculator value={calcField==='amount'?scenarioAmount:calcField==='rate'?scenarioRate:scenarioYears} decimals={calcField==='years'?0:2} onApply={value=>{calcField==='amount'?setScenarioAmount(value):calcField==='rate'?setScenarioRate(value):setScenarioYears(value);setCalcField(null);}} onClose={()=>setCalcField(null)} />}<a className="flow-primary" href={screenHref('loan-detail')}>Сохранить сценарий</a><p className="flow-caption">Предварительная оценка по аннуитетной формуле. Комиссии, плавающая ставка и условия банка могут изменить сумму.</p></>;
  }
  if (screen?.id === 'loan-schedule') return <><div className="entry-head"><h2>График платежей</h2><small>{item.name}</small></div><div className="product-summary-grid"><div><small>Остаток долга</small><strong>{money(item.balance,item.currency)}</strong></div><div><small>Ежемесячно</small><strong>{money(item.payment,item.currency)}</strong></div></div><ProductTrend title="Как уменьшается основной долг" points={remaining} labels={['Сейчас','6 мес','1 год','2 года','3 года']} tone="red" valueLabel={`${item.rate}% годовых`} /><ScheduleList rows={schedule.map(row=>({title:row.date,subtitle:`Долг ${money(row.principal,item.currency)} · проценты ${money(row.interest,item.currency)}`,amount:money(row.payment,item.currency)}))} /><a className="flow-primary" href={`${screenHref(`loan-pay?item=${selected}`)}`}>Записать фактический платёж</a><p className="flow-caption">План графика сам по себе не списывает деньги. После платежа сверьте сумму по банковской выписке.</p></>;
  if (screen?.id === 'loan-pay' || screen?.id === 'loan-pay-preview') return <><div className="entry-head"><h2>{screen.id==='loan-pay'?'Записать платёж':'Проверка платежа'}</h2><small>{item.name}</small></div><div className="product-summary-grid"><div><small>Сумма списания</small><strong>{money(item.payment+extra,item.currency)}</strong></div><div><small>Остаток долга после</small><strong>{money(item.balance-item.principal-extra,item.currency)}</strong></div></div><div className="flow-card compact"><SelectField label="Счёт списания" value={paymentAccount} onClick={()=>setModal({type:'account'})} /><SelectField label="Основной долг" value={money(item.principal+extra,item.currency)} onClick={()=>setCalcField('extra')} /><SelectField label="Проценты · расход" value={money(item.interest,item.currency)} onClick={()=>{}} /><DateField label="Дата фактического платежа" value={paymentDate} onChange={setPaymentDate} /></div><p className="flow-caption">Счёт уменьшается на всю сумму платежа. Остаток кредита — только на погашенную часть основного долга. Проценты идут в расходы.</p>{modal?.type==='account'&&<AccountPicker first={first} multi={multi} onSelect={account=>{setPaymentAccount(account.name);if(account.multi)setModal({type:'pocket',account});else setModal(null);}} onClose={()=>setModal(null)} onManage={()=>setModal(null)} />}{modal?.type==='pocket'&&<PocketPicker multi={modal.account} currency={item.currency} selected={item.currency} onSelect={code=>{setPaymentAccount(`${modal.account.name} · ${currencySymbol(code)} карман`);setModal(null);}} onClose={()=>setModal(null)} />}{calcField==='extra'&&<Calculator value={String(item.principal+extra)} onApply={value=>{setExtra(Math.max(0,(numeric(value)||0)-item.principal));setCalcField(null);}} onClose={()=>setCalcField(null)} />}<a className="flow-primary" href={`${screenHref(`loan-detail?item=${selected}`)}`}>Сохранить платёж в журнале</a><a className="flow-secondary" href={`${screenHref(`loan-schedule?item=${selected}`)}`}>Вернуться к графику</a></>;
  if (screen?.id === 'loan-detail') return <><div className="entry-head"><h2>{item.name.split(' · ')[0]}</h2><small>{item.account}</small></div><div className="desktop-overview"><div><small>Остаток долга</small><strong>{money(item.balance,item.currency)}</strong></div><p>Платёж {money(item.payment,item.currency)} · {item.due}. Долг {money(item.principal,item.currency)}, проценты {money(item.interest,item.currency)}.</p></div><ProductTrend title="Остаток основного долга" points={remaining} labels={['Сейчас','6 мес','1 год','2 года','3 года']} tone="red" valueLabel={item.end} /><div className="flow-card compact"><SelectField label="Счёт платежа" value={item.account} onClick={()=>{}} /><SelectField label="Платёж по графику" value={`${money(item.principal,item.currency)} долг + ${money(item.interest,item.currency)} проценты`} onClick={()=>{}} /><SelectField label="Дата окончания" value={item.end} onClick={()=>{}} /></div><ScheduleList rows={schedule.slice(0,4).map(row=>({title:row.date,subtitle:`Долг ${money(row.principal,item.currency)} · проценты ${money(row.interest,item.currency)}`,amount:money(row.payment,item.currency)}))} /><a className="flow-primary" href={`${screenHref(`loan-pay?item=${selected}`)}`}>Записать платёж</a><a className="flow-secondary" href={`${screenHref(`loan-schedule?item=${selected}`)}`}>Весь график</a><p className="flow-caption">Платёж списывается со счёта, но кредит не является деньгами на счёте. В общий остаток он попадает как обязательство. Основной долг и проценты учитываются отдельно.</p></>;
  return <><div className="entry-head"><h2>Кредиты</h2><small>Платежи и остаток основного долга</small></div><div className="desktop-overview"><div><small>Остаток долга</small><strong><span>$48 000</span><span>₾7 500</span></strong></div><p>Платёж списывается со счёта. Основной долг и проценты показаны отдельно.</p></div>{LOAN_DATA.map((loan,index)=><a className="account-tile" href={`${screenHref(`${loan.id}?item=${index}`)}`} key={loan.name} onClick={()=>setSelected(index)}><span className="account-tile-icon loan"><Icon name="loan" /></span><span className="account-tile-copy"><strong>{loan.name.split(' · ')[0]}</strong><small>Платёж {loan.due} · долг {money(loan.balance,loan.currency)}</small></span><strong className="account-tile-amount">{money(loan.payment,loan.currency)}</strong></a>)}<a className="flow-secondary" href={screenHref('loan-calc')}>Калькулятор</a><a className="flow-secondary" href={screenHref('loan-schedule')}>График</a><a className="flow-secondary" href={screenHref('loan-extra')}>Досрочное погашение</a></>;
}

export function DebtFlow({ screen }) {
  const [direction,setDirection]=useState('Мне должны'), [person,setPerson]=useState(null), [selectedEvent,setSelectedEvent]=useState(null);
  const [debtor,setDebtor]=useState(''), [debtAmount,setDebtAmount]=useState('1200'), [debtCurrency,setDebtCurrency]=useState('USD'), [debtAccount,setDebtAccount]=useState('Наличные');
  const [debtDate,setDebtDate]=useState('2026-10-13'), [dueDate,setDueDate]=useState('2026-11-13'), [debtNote,setDebtNote]=useState(''), [interestEnabled,setInterestEnabled]=useState(false), [interestRate,setInterestRate]=useState('0'), [formModal,setFormModal]=useState(null), [created,setCreated]=useState(false);
  const [sharedDebts,setSharedDebts]=useState(readSharedDebts), [debtRepayments,setDebtRepayments]=useState(readDebtRepayments), [repayAmount,setRepayAmount]=useState(''), [repayCurrency,setRepayCurrency]=useState(null), [repayDate,setRepayDate]=useState('2026-10-13'), [repayModal,setRepayModal]=useState(null), [repayRecorded,setRepayRecorded]=useState(false);
  const [currencySettings,updateCurrencySettings]=useCurrencySettings();
  const firstAccount=getFirstAccount(), multiAccount=getMultiAccount();
  const history={
    'Алексей':{currency:'USD',balance:1200,given:2000,returned:800,due:'20 октября',account:'Наличные',trend:[1000,800,1300,1800,1200],labels:['12 авг','05 сен','15 сен','01 окт','12 окт'],events:[['12 авг','Выдал','+$1 000','$1 000'],['05 сен','Получил возврат','−$200','$800'],['15 сен','Выдал','+$500','$1 300'],['01 окт','Выдал','+$500','$1 800'],['12 окт','Получил возврат','−$600','$1 200']]},
    'Анна':{currency:'GEL',balance:240,given:300,returned:60,due:'5 ноября',account:'TBC · GEL',trend:[300,240],labels:['22 сен','02 окт'],events:[['22 сен','Выдал','+₾300','₾300'],['02 окт','Получил возврат','−₾60','₾240']]},
    'Сергей':{currency:'USD',balance:4800,given:5200,returned:400,due:'1 ноября',account:'Наличные',trend:[5200,5100,5000,4900,4800],labels:['18 июл','01 авг','01 сен','01 окт','12 окт'],events:[['18 июл','Получил в долг','+$5 200','$5 200'],['01 авг','Вернул','−$100','$5 100'],['01 сен','Вернул','−$100','$5 000'],['01 окт','Вернул','−$100','$4 900'],['12 окт','Вернул','−$100','$4 800']]}
  };
  const active=person||'Алексей', activeShared=sharedDebts.filter(item=>item.person===active), baseDetail=history[active], detailCurrency=baseDetail?.currency||activeShared[0]?.currency||'USD', sharedBalance=activeShared.filter(item=>item.currency===detailCurrency).reduce((sum,item)=>sum+(Number(item.amount)||0),0), activeRepayments=debtRepayments.filter(item=>item.person===active), repaymentTotal=activeRepayments.reduce((sum,item)=>sum+(convert(Number(item.amount)||0,item.currency,detailCurrency,currencySettings.rates)||0),0), repaymentEvents=activeRepayments.map(item=>[formatIsoDate(item.date),'Возврат',`−${money(item.amount,item.currency)}`,money(Math.max(0,(baseDetail?.balance||sharedBalance)-repaymentTotal),detailCurrency)]), detail=baseDetail ? {...baseDetail,given:baseDetail.given+sharedBalance,returned:baseDetail.returned+repaymentTotal,balance:Math.max(0,baseDetail.balance+sharedBalance-repaymentTotal),events:[...baseDetail.events,...activeShared.filter(item=>item.currency===detailCurrency).map(item=>[formatIsoDate(item.date),'Доля общего расхода',`+${money(item.amount,item.currency)}`,money(item.amount,item.currency)]),...repaymentEvents]} : (activeShared.length ? {currency:detailCurrency,balance:Math.max(0,sharedBalance-repaymentTotal),given:sharedBalance,returned:repaymentTotal,due:'по расходам',account:'Общие расходы',trend:[sharedBalance],labels:[formatIsoDate(activeShared.at(-1).date)],events:[...activeShared.map(item=>[formatIsoDate(item.date),'Доля общего расхода',`+${money(item.amount,item.currency)}`,money(item.amount,item.currency)]),...repaymentEvents]} : history.Алексей);
  const repaymentValue=repayAmount||String(Math.min(500,detail.balance));
  if(screen?.id==='debt-new'){
    const value=numeric(debtAmount)||0, days=Math.max(0,Math.round((new Date(dueDate+'T00:00:00')-new Date(debtDate+'T00:00:00'))/86400000)), estimate=interestEnabled?value*(numeric(interestRate)||0)/100*days/365:0;
    if(created)return <><div className="entry-head"><h2>Долг создан</h2><small>Обязательство без движения денег</small></div><div className="product-hero"><small>{debtor} · {direction==='Мне должны'?'мне вернёт':'я верну'}</small><strong>{money(value,debtCurrency)}</strong><span>Ожидаемый возврат · {formatIsoDate(dueDate)}</span></div><div className="flow-card compact">{[["Счёт",debtAccount],["Проценты по условиям",interestEnabled?`${interestRate}% годовых · оценка ${money(estimate,debtCurrency)}`:'Без процентов'],["Заметка",debtNote||'Нет']].map(([label,content])=><div className="mobile-data-line" key={label}><span>{label}</span><strong>{content}</strong></div>)}</div><p className="flow-caption">Создание долга не меняет остаток счёта. Движение денег появится при выдаче или возврате.</p><button type="button" className="flow-primary" onClick={()=>{window.location.hash=screenHref('debts');}}>К списку долгов</button></>;
    return <><div className="entry-head"><h2>Новый долг</h2><small>{direction==='Мне должны'?'Я выдаю деньги':'Я беру деньги'}</small></div><div className="entry-tabs" role="tablist" aria-label="Направление долга">{['Мне должны','Я должен'].map(value=><button type="button" role="tab" aria-selected={direction===value} className={direction===value?'active':''} key={value} onClick={()=>setDirection(value)}>{value}</button>)}</div><div className="entry-amount"><button type="button" className="entry-amount-value" onClick={()=>setFormModal({type:'calc'})} aria-label="Изменить сумму долга">{money(value,'')}</button><button type="button" className="entry-currency" onClick={()=>setFormModal({type:'picker'})}>{currencySymbol(debtCurrency)} <Icon name="chevron" size={16}/></button><small>Сумма займа · откройте калькулятор по нажатию</small></div><div className="flow-card compact"><SelectField label={direction==='Мне должны'?'Кто должен вернуть':'У кого беру в долг'} value={debtor||'Выбрать из плательщиков'} icon="person" onClick={()=>setFormModal({type:'payer'})} /><SelectField label={direction==='Мне должны'?'Счёт выдачи':'Счёт получения'} value={debtAccount} onClick={()=>setFormModal({type:'account'})} /><DateField label="Дата выдачи / получения" value={debtDate} onChange={setDebtDate} /><DateField label="Ожидаемая дата возврата" value={dueDate} onChange={setDueDate} /><label className="flow-inline"><span>Условия</span><span className="debt-interest-toggle"><input type="checkbox" checked={interestEnabled} onChange={event=>setInterestEnabled(event.target.checked)}/> Проценты</span></label>{interestEnabled&&<SelectField label="Ставка годовых" value={`${interestRate}%`} onClick={()=>setFormModal({type:'interest-calc'})} />}<label className="flow-inline"><span>Заметка</span><input value={debtNote} maxLength={120} onChange={event=>setDebtNote(event.target.value)} placeholder="Например, ремонт машины" /></label></div><div className="product-summary-grid"><div><small>Сумма долга</small><strong>{money(value,debtCurrency)}</strong></div><div><small>{interestEnabled?'Оценка процентов':'Начисления'}</small><strong>{interestEnabled?money(estimate,debtCurrency):'0'}</strong></div></div>{interestEnabled&&<p className="flow-caption">Простой расчёт за {days} дней по ставке {interestRate}% годовых. Условия фиксируются в карточке долга.</p>}<button type="button" className="flow-primary" disabled={!debtor||value<=0||dueDate<debtDate} onClick={()=>setCreated(true)}>Сохранить долг</button><p className="flow-caption">Запись долга не меняет остаток счёта. Денежная операция появится при фактической выдаче или получении.</p>{formModal?.type==='calc'&&<Calculator value={debtAmount} onApply={next=>{setDebtAmount(next);setFormModal(null);}} onClose={()=>setFormModal(null)} />}{formModal?.type==='interest-calc'&&<Calculator value={interestRate} decimals={2} onApply={next=>{setInterestRate(next);setFormModal(null);}} onClose={()=>setFormModal(null)} />}{formModal?.type==='payer'&&<PayerPicker selected={debtor} excludeSelf onSelect={name=>{setDebtor(name);setFormModal(null);}} onClose={()=>setFormModal(null)} onManage={()=>setFormModal({type:'payer-directory'})} />}{formModal?.type==='payer-directory'&&<DirectoryEditor type="payer" onClose={()=>setFormModal(null)} />}{formModal?.type==='picker'&&<CurrencyModals modal={formModal} setModal={setFormModal} settings={currencySettings} update={updateCurrencySettings} onCurrency={code=>setDebtCurrency(code)} />}{formModal?.type==='account'&&<AccountPicker first={firstAccount} multi={multiAccount} onSelect={item=>{setDebtAccount(item.name);if(item.multi)setFormModal({type:'pocket',account:item});else{setDebtCurrency(item.currency||debtCurrency);setFormModal(null);}}} onClose={()=>setFormModal(null)} onManage={()=>setFormModal({type:'account-directory'})} />}{formModal?.type==='account-directory'&&<DirectoryEditor type="account" onClose={()=>setFormModal(null)} />}{formModal?.type==='pocket'&&<PocketPicker multi={formModal.account} currency={debtCurrency} selected={debtCurrency} onSelect={code=>{setDebtCurrency(code);setDebtAccount(`${formModal.account.name} · ${currencySymbol(code)} карман`);setFormModal(null);}} onClose={()=>setFormModal(null)} />}</>;
  }
  if (person || screen?.id === 'debt-detail' || screen?.id === 'debt-repay' || screen?.id === 'debt-repay-preview') return <><button type="button" className="flow-link debt-back" onClick={()=>{if(screen?.id==='debts')setPerson(null);else window.location.hash=screenHref('debts');}}>← Все долги</button><div className="entry-head"><h2>{active}</h2><small>{active==='Сергей'?'Я должен':'Мне должны'}</small></div><section className="mobile-portfolio-card"><div className="desktop-debt-list"><div className="desktop-debt-row"><span className={`desktop-debt-direction${active==='Сергей'?' outgoing':''}`}><Icon name={active==='Сергей'?'arrow':'down'} size={18} /></span><span><strong>{active}</strong><small>Открыт · {detail.account}</small></span><span className="desktop-debt-end"><strong>{money(detail.balance,detail.currency)}</strong><small>До {detail.due}</small></span></div></div></section><div className="product-summary-grid"><div><small>{active==='Сергей'?'Получено в долг':'Всего выдано'}</small><strong>{money(detail.given,detail.currency)}</strong></div><div><small>{active==='Сергей'?'Возвращено':'Возвраты получены'}</small><strong>{money(detail.returned,detail.currency)}</strong></div></div><div className="debt-interest-note"><strong>Начисления процентов</strong><span>0 · без процентов по текущим условиям</span></div><ProductTrend title="Остаток долга по датам" points={detail.trend} labels={detail.labels} tone="red" valueLabel={money(detail.balance,detail.currency)} /><ProductTable caption="Все операции по долгу · нажмите строку для подробностей" columns={['Дата','Операция','Сумма','Остаток']} rows={detail.events} onRowClick={index=>setSelectedEvent(detail.events[index])} /><a className="flow-primary" href={screenHref('debt-repay')}>Записать возврат</a><a className="flow-secondary" href={screenHref('base-journal')}>Показать в журнале</a><p className="flow-caption">Выдачи увеличивают сумму долга, возвраты уменьшают её. В журнале остаются отдельные денежные операции.</p>{selectedEvent&&<div className="flow-overlay" role="dialog" aria-label="Операция по долгу"><div className="flow-sheet"><div className="sheet-head"><strong>{selectedEvent[1]}</strong><button type="button" onClick={()=>setSelectedEvent(null)} aria-label="Закрыть">×</button></div><div className="product-summary-grid"><div><small>Дата</small><strong>{selectedEvent[0]}</strong></div><div><small>Изменение долга</small><strong>{selectedEvent[2]}</strong></div></div><div className="flow-card compact">{[["Остаток после операции",selectedEvent[3]],["Человек",active],["Связанный счёт",detail.account]].map(([label,value])=><div className="mobile-data-line" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><a className="flow-primary" href={screenHref('base-detail')}>Открыть операцию</a></div></div>}{screen?.id==='debt-repay'&&<div className="flow-overlay" role="dialog" aria-modal="true" aria-label="Записать возврат"><div className="flow-sheet repayment-sheet"><div className="sheet-head"><strong>{repayRecorded?'Возврат записан':'Записать возврат'}</strong><button type="button" onClick={()=>{setRepayRecorded(false);window.location.hash=screenHref('debt-detail');}} aria-label="Закрыть">×</button></div>{repayRecorded?<><div className="product-hero"><small>{active} вернул</small><strong>{money(numeric(repaymentValue)||0,repayCurrency||detail.currency)}</strong><span>Долг будет уменьшен с учётом выбранной валюты</span></div><button type="button" className="flow-primary" onClick={()=>{setRepayRecorded(false);window.location.hash=screenHref('debt-detail');}}>К истории долга</button></>:<><p className="flow-caption">Укажите сумму, которую {active} возвращает сейчас.</p><div className="entry-amount repayment-amount"><button type="button" className="entry-amount-value" onClick={()=>setRepayModal({type:'calc'})} aria-label="Открыть калькулятор суммы возврата">{money(numeric(repaymentValue)||0,'')}</button><button type="button" className="entry-currency" onClick={()=>setRepayModal({type:'picker'})} aria-label="Выбрать валюту возврата">{currencySymbol(repayCurrency||detail.currency)} <Icon name="chevron" size={16}/></button><small>Сумма возврата · нажмите для калькулятора</small></div><DateField label="Дата возврата" value={repayDate} onChange={setRepayDate} /><button type="button" className="flow-primary" disabled={(numeric(repaymentValue)||0)<=0} onClick={()=>{const item={id:String(Date.now()),person:active,amount:numeric(repaymentValue)||0,currency:repayCurrency||detail.currency,date:dottedDate(repayDate),account:detail.account};saveDebtRepayment(item);setDebtRepayments(rows=>[...rows,item]);setRepayRecorded(true);}}>Подтвердить возврат</button></>}{repayModal?.type==='calc'&&<Calculator value={repaymentValue} onApply={next=>{setRepayAmount(next);setRepayModal(null);}} onClose={()=>setRepayModal(null)}/>}{repayModal?.type==='picker'&&<CurrencyModals modal={repayModal} setModal={setRepayModal} settings={currencySettings} update={updateCurrencySettings} onCurrency={code=>{setRepayCurrency(code);setRepayModal(null);}}/>}</div></div>}</>;
  const sharedPeople=sharedDebts.reduce((groups,item)=>{const found=groups.find(row=>row.name===item.person);if(found)found.parts.push(money(item.amount,item.currency));else groups.push({name:item.person,direction:'Мне должны',parts:[money(item.amount,item.currency)],date:'по операциям',status:'Открыт'});return groups;},[]).map(item=>({name:item.name,direction:item.direction,balance:item.parts.join(' · '),date:item.date,status:item.status}));
  const people=[{name:'Алексей',direction:'Мне должны',balance:'$1 200',date:'20 окт',status:'Открыт'},{name:'Анна',direction:'Мне должны',balance:'₾240',date:'5 ноя',status:'Открыт'},...sharedPeople,{name:'Сергей',direction:'Я должен',balance:'$4 800',date:'1 ноя',status:'Открыт'}];
  return <><div className="entry-head"><h2>Долги</h2><small>Кто кому должен и когда вернуть</small></div><div className="desktop-overview desktop-overview--debts"><div><small>Мне должны</small><strong><span>$1 200</span><span>₾240</span></strong></div><p>Возвраты и частичные платежи сохраняются в истории. Валюты не складываются без курса.</p></div>{people.map((item,index)=><button type="button" className="account-tile" key={`${item.direction}-${item.name}-${index}`} onClick={()=>setPerson(item.name)}><span className={`account-tile-icon${item.direction==='Я должен'?' bank':''}`}><Icon name={item.direction==='Я должен'?'arrow':'down'} /></span><span className="account-tile-copy"><strong>{item.name}</strong><small>{item.direction} · до {item.date}</small></span><strong className="account-tile-amount">{item.balance}</strong></button>)}<a className="flow-secondary" href={screenHref('debt-new')}>Новый долг</a></>;
}

export function BudgetFlow() {
  const [settings, update] = useCurrencySettings();
  const [limit, setLimit] = useState('50000'), [currency, setCurrency] = useState('RUB'), [monthDay, setMonthDay] = useState('1');
  const [modal, setModal] = useState(null);
  const spent = convert(45000, 'RUB', currency, settings.rates) || 0, remaining = Math.max(0, numeric(limit) - spent), percentage = Math.min(100, spent / (numeric(limit) || 1) * 100);
  return <><div className="entry-head"><h2>Бюджет</h2><small>Месячный лимит · октябрь 2026</small></div><div className="budget-hero"><span>Осталось на месяц</span><strong>{money(remaining, currency)}</strong><small>Потрачено {money(spent, currency)} из {money(numeric(limit) || 0, currency)}</small><Progress value={Math.round(percentage)} label="Использовано бюджета" /></div><div className="flow-card compact"><SelectField label="Месячный лимит" value={money(numeric(limit) || 0, currency)} onClick={() => setModal({ type: 'calc' })} /><SelectField label="Валюта" value={`${currencySymbol(currency)} ${currency}`} onClick={() => setModal({ type: 'picker' })} /><label className="flow-inline"><span>Начало месяца</span><select value={monthDay} onChange={event => setMonthDay(event.target.value)}>{Array.from({ length: 28 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} число</option>)}</select></label></div><div className="flow-card compact"><strong className="flow-card-title">По категориям</strong>{[['Продукты',22500],['Жильё',15000],['Прочее',7500]].map(([label, value]) => <div className="budget-category" key={label}><span>{label}</span><strong>{money(convert(value, 'RUB', currency, settings.rates) || 0, currency)}</strong></div>)}</div><p className="flow-caption">Учитываются только операции с признаком «В бюджет». Валюты приводятся к валюте лимита по выбранным курсам.</p><a className="flow-secondary" href={screenHref('reports')}>Отчёт по категориям</a>{modal?.type === 'calc' ? <Calculator value={limit} onApply={value => { setLimit(value); setModal(null); }} onClose={() => setModal(null)} /> : <CurrencyModals modal={modal} setModal={setModal} settings={settings} update={update} onCurrency={next => { const converted = convert(numeric(limit), currency, next, settings.rates); if (converted !== null) setLimit(String(Math.round(converted * 100) / 100)); setCurrency(next); }} />}</>;
}
function usesCalculator(label, value) {
  const text = String(value ?? '').trim();
  const lower = String(label || '').toLowerCase();
  if (!/^[+\-−]?\d[\d\s\u00a0]*(?:[,.]\d+)?(?:\s*(?:%|[₽$€₾£₫₩]|[A-Za-zа-яё]{2,12}))?$/i.test(text)) return false;
  if (/\d{1,2}[./]\d{1,2}/.test(text) || /\d{1,2}:\d{2}/.test(text)) return false;
  if (/дата|время|период|назван|цвет|язык|формат|идентификатор/.test(lower)) return false;
  return true;
}
const screenDraftKey = 'finance-design-screen-drafts';

export function readScreenDraft(screenId, label, fallback = '') {
  try {
    const all = JSON.parse(sessionStorage.getItem(screenDraftKey) || '{}');
    const next = all?.[screenId]?.[label];
    return next == null ? fallback : next;
  } catch {
    return fallback;
  }
}

function writeScreenDraft(screenId, label, next) {
  try {
    const all = JSON.parse(sessionStorage.getItem(screenDraftKey) || '{}');
    all[screenId] = { ...(all[screenId] || {}), [label]: next };
    sessionStorage.setItem(screenDraftKey, JSON.stringify(all));
  } catch { /* поле остаётся на экране, предпросмотр берёт исходное значение */ }
  window.dispatchEvent(new Event(screenDraftKey));
}

export function useScreenDrafts() {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const refresh = () => setVersion(item => item + 1);
    window.addEventListener(screenDraftKey, refresh);
    return () => window.removeEventListener(screenDraftKey, refresh);
  }, []);
  return version;
}

export function PrototypeField({ label, value, icon = 'note', screenId = '' }) {
  const [settings, update] = useCurrencySettings();
  const stored = screenId ? readScreenDraft(screenId, label, value) : value;
  const [current, setCurrent] = useState(stored);
  const [modal, setModal] = useState(null);
  const commit = next => {
    setCurrent(next);
    if (screenId) writeScreenDraft(screenId, label, next);
  };
  const first = getFirstAccount(), multi = getMultiAccount();
  const lower = label.toLowerCase();
  const numberMatch = String(stored).match(/\d[\d\s\u00a0]*(?:[,.]\d+)?/);
  const isNumber = usesCalculator(label, value);
  const precise = /[,.]\d{3,}/.test(String(value)) || /количеств|курс|btc|eth/i.test(`${label} ${value}`);
  const type = isNumber ? 'calc' : /категор|category/.test(lower) ? 'category' : /платель|payer/.test(lower) ? 'payer' : /валют|currency|актив/.test(lower) && !/код валюты/.test(lower) ? 'picker' : /сч[её]т|account|откуда|куда/.test(lower) ? 'account' : /частот|периодич|окончан|если дня нет/.test(lower) ? 'choice' : null;
  const [amount, setAmount] = useState(numberMatch ? numberMatch[0].replace(/[\s\u00a0]/g, '').replace(',', '.') : '0');
  const symbolCodes = { '₽': 'RUB', '$': 'USD', '€': 'EUR', '₾': 'GEL', '£': 'GBP', '₫': 'VND', '₩': 'KRW', '֏': 'AMD', '₺': 'TRY', '₸': 'KZT', '₴': 'UAH', '฿': 'THB', '¥': 'CNY' };
  const [currency, setCurrency] = useState((String(stored).match(/\b(?:USD|EUR|GEL|RUB|GBP|VND|KRW|MYR|AMD|TRY|KZT|UAH|PLN|THB|CNY)\b/) || [symbolCodes[String(stored).match(/[₽$€₾£₫₩֏₺₸₴฿¥]/)?.[0]] || settings.base])[0]);
  const choices = /частот|периодич/.test(lower) ? ['Не повторять','Каждую неделю','Каждый месяц','Каждый год'] : /окончан/.test(lower) ? ['Без окончания','После 12 раз','По дате'] : ['Последний день месяца','Пропустить'];
  if (!type) return <label className="fact-row"><span className="fact-icon"><Icon name={icon} size={16} /></span><span className="fact-copy"><small>{label}</small><input value={current} onChange={event => commit(event.target.value)} placeholder="Укажите" /></span></label>;
  return <><button type="button" className="fact-row" onClick={() => setModal({ type })}><span className="fact-icon"><Icon name={icon} size={16} /></span><span className="fact-copy"><small>{label}</small><strong>{current || 'Не задано'}</strong></span><Icon name="chevron" size={16} /></button>
    {modal?.type === 'calc' && <Calculator value={amount} decimals={precise ? 8 : 2} onApply={next => { const formatted = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: precise ? 8 : 2 }).format(Number(next)); const suffix = String(value).trim().match(/(\s*(?:%|[₽$€₾£₫₩]|[A-Za-zа-яё]{2,12}))\s*$/i); const shown = suffix ? `${formatted} ${suffix[1].trim()}` : formatted; setAmount(next); commit(shown); setModal(null); }} onClose={() => setModal(null)} />}
    {['picker','rate','add'].includes(modal?.type) && <CurrencyModals modal={modal} setModal={setModal} settings={settings} update={update} onCurrency={code => { setCurrency(code); commit(`${currencySymbol(code)} ${code}`); }} />}
    {modal?.type === 'account' && <AccountPicker first={first} multi={multi} onSelect={item => { commit(item.name); setModal(item.multi ? { type: 'pocket' } : null); }} onClose={() => setModal(null)} onManage={() => setModal({ type: 'directory', directory: 'account', returnTo: { type: 'account' } })} />}
    {modal?.type === 'pocket' && <PocketPicker multi={multi} currency={currency} onSelect={code => { commit(`${multi.name} · ${code}`); setModal(null); }} onClose={() => setModal(null)} />}
    {modal?.type === 'category' && <CategoryPicker kind="Расход" selected={current} onSelect={next => { commit(next); setModal(null); }} onClose={() => setModal(null)} onManage={() => setModal({ type: 'directory', directory: 'category', returnTo: { type: 'category' } })} />}
    {modal?.type === 'payer' && <PayerPicker selected={current} onSelect={next => { commit(next); setModal(null); }} onClose={() => setModal(null)} onManage={() => setModal({ type: 'directory', directory: 'payer', returnTo: { type: 'payer' } })} />}
    {modal?.type === 'choice' && <div className="flow-overlay" role="dialog" aria-label={label}><div className="flow-sheet"><div className="sheet-head"><strong>{label}</strong><button type="button" onClick={() => setModal(null)} aria-label="Закрыть">×</button></div><div className="account-picker-list">{choices.map(item => <button type="button" className="payer-picker-row" key={item} onClick={() => { commit(item); setModal(null); }}>{item}</button>)}</div></div></div>}
    {modal?.type === 'directory' && <DirectoryEditor type={modal.directory} onClose={() => setModal(modal.returnTo)} />}</>;
}
