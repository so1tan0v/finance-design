import React, { useRef, useState } from 'react';
import { Icon, Progress, screenHref } from './ui.jsx';

const INITIAL = ['USD', 'EUR', 'GEL', 'RUB'];
const SYMBOL = { USD: '$', EUR: '€', GEL: '₾', RUB: '₽', GBP: '£', VND: '₫', KRW: '₩' };
export const currencySymbol = code => SYMBOL[code] || code;
const DEMO_USD = { USD: 1, EUR: 1.1, GEL: 0.37, RUB: 0.011, GBP: 1.3 };
export const CATEGORY_TREE = {
  Расход: [
    { name: 'Продукты', icon: 'basket', children: [['Супермаркет', 'cart'], ['Кафе', 'cup'], ['Доставка', 'bag']] },
    { name: 'Жильё', icon: 'house', children: [['Аренда', 'house'], ['Коммунальные', 'bolt'], ['Ремонт', 'house']] },
    { name: 'Транспорт', icon: 'car', children: [['Такси', 'car'], ['Общественный', 'bus'], ['Топливо', 'car']] },
    { name: 'Прочее', icon: 'star', children: [['Покупки', 'bag'], ['Здоровье', 'heart'], ['Другое', 'star']] }
  ],
  Доход: [
    { name: 'Работа', icon: 'briefcase', children: [['Зарплата', 'briefcase'], ['Подработка', 'star'], ['Премия', 'gift']] },
    { name: 'Другие доходы', icon: 'gift', children: [['Подарок', 'gift'], ['Возврат', 'wallet'], ['Другое', 'star']] }
  ]
};
const storageKey = 'finance-design-currency-v1';
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
export function getAccountRows(first = getFirstAccount(), multi = getMultiAccount()) {
  const basics = [
    ...(first ? [{ name: first.name, type: 'Личный счёт', icon: 'wallet', balance: Number(first.opening) || 0, currency: first.currency }] : []),
    { name: 'Наличные', type: 'Наличные', icon: 'wallet', balance: 8500, currency: 'RUB' },
    { name: 'Банковский счёт', type: 'Банковская карта', icon: 'bank', balance: 3000, currency: 'RUB' },
    { name: `${multi.name} · мультивалютный`, type: 'Мультивалютная карта', icon: 'bank', balance: 0, currency: multi.currencies[0], multi: true, currencies: multi.currencies }
  ].filter((item, index, all) => all.findIndex(other => other.name === item.name) === index);
  const custom = readDirectory().accounts;
  return [...basics.filter(item => !custom.some(extra => extra.originalName === item.name)), ...custom];
}
export function readPayers() {
  try { return JSON.parse(localStorage.getItem(payersKey) || '[]').filter(value => typeof value === 'string'); }
  catch { return []; }
}
function readSharedDebts() {
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
    .map((item, index) => ({ id: `${Date.now()}-${index}`, person: item.name, amount: numeric(item.amount), currency, date, note: note || 'Доля общего расхода' }));
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
const money = (value, code) => `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(value)} ${SYMBOL[code] || code}`;
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
  return <div className="flow-overlay" role="dialog" aria-label="Калькулятор суммы"><div className="flow-sheet calc-sheet"><div className="sheet-head"><strong>Калькулятор суммы</strong><button type="button" onClick={onClose} aria-label="Закрыть">×</button></div><div className="calc-display"><span>{expression}</span><strong>{result === null ? 'Проверьте выражение' : `= ${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: decimals }).format(result)}`}</strong></div><button type="button" className="calc-paste" onClick={paste}><Icon name="paste" size={17} /> Вставить из буфера</button>{pasteError && <p className="calc-error" role="alert">{pasteError}</p>}<div className="calc-grid">{['C','⌫','00','÷','7','8','9','×','4','5','6','−','1','2','3','+','000','0',',','='].map(key => <button type="button" key={key} onClick={() => press(key)} className={['÷','×','−','+','='].includes(key) ? 'operator' : ''}>{key}</button>)}</div><button type="button" className="flow-primary calc-apply" disabled={result === null} onClick={() => onApply(String(result))}>Применить</button></div></div>;
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
export function PayerPicker({ selected, onSelect, onClose, onManage, excludeSelf = false }) {
  const [custom, setCustom] = useState('');
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState(readPayers);
  const choices = [...new Set([...(excludeSelf ? [] : ['Я']), ...saved.filter(value => !excludeSelf || value !== 'Я')])];
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
  return <div className="flow-overlay" role="dialog" aria-label="Выбрать плательщика"><div className="flow-sheet"><div className="sheet-head"><strong>Плательщик</strong><button type="button" onClick={onClose} aria-label="Закрыть">×</button></div><SearchInput value={query} onChange={setQuery} placeholder="Найти плательщика" /><div className="account-picker-list">{choices.filter(value => value.toLowerCase().includes(query.toLowerCase())).map(value => <button type="button" key={value} className={`payer-picker-row ${selected === value ? 'selected' : ''}`} onClick={() => onSelect(value)}><span className="account-picker-icon"><Icon name="person" size={20} /></span><span>{value}</span><span className="payer-picker-mark">{selected === value ? '✓' : '›'}</span></button>)}</div><label className="flow-input payer-custom">Другой плательщик<input value={custom} maxLength={40} onChange={event => setCustom(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') chooseCustom(); }} placeholder="Введите имя" /></label><button type="button" className="flow-primary payer-add" disabled={!name} onClick={chooseCustom}>Выбрать</button>{onManage && <button type="button" className="flow-link picker-manage" onClick={onManage}>Настроить плательщиков</button>}</div></div>;
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
  return <><p className="mobile-eyebrow">ВАШИ ЛИЧНЫЕ ФИНАНСЫ</p><div className="welcome-illustration"><div className="welcome-orbit"><div className="welcome-wallet"><span className="wallet-flap" /></div></div><span className="welcome-dot" /><span className="welcome-dot second" /></div><h2 className="welcome-title">Начните<br />с одного счёта.</h2><p className="welcome-description">Записывайте покупки и следите за остатками. Регистрация не нужна.</p><div className="flow-card"><label className="flow-input">Название счёта<input value={name} onChange={event => setName(event.target.value)} /></label><SelectField label="Валюта счёта" value={`${currencySymbol(currency)} ${currency}`} onClick={() => setModal({ type: 'picker' })} /><SelectField label="Начальный остаток" value={money(numeric(opening) || 0, currency)} onClick={() => setModal({ type: 'calc' })} /></div><a className="flow-primary" href={screenHref('base-accounts')} onClick={save}>Начать вести учёт</a><p className="flow-caption center">По умолчанию доллар США. Валюту можно выбрать сейчас.</p>{modal?.type === 'calc' ? <Calculator value={opening} onApply={value => { setOpening(value); setModal(null); }} onClose={() => setModal(null)} /> : <CurrencyModals modal={modal} setModal={setModal} settings={settings} update={update} onCurrency={setCurrency} />}</>;
}
export function EntryFlow({ initialKind = 'Расход' }) {
  const [settings, update] = useCurrencySettings();
  const first = getFirstAccount();
  const multi = getMultiAccount(), multiLabel = `${multi.name} · мультивалютный`;
  const [kind, setKind] = useState(initialKind), [amount, setAmount] = useState(initialKind === 'Перевод' ? '3000' : '500');
  const [currency, setCurrency] = useState(first?.currency || settings.base), [account, setAccount] = useState(first?.name || 'Наличные'), [destination, setDestination] = useState('Банковский счёт');
  const [fromPocket, setFromPocket] = useState(first?.currency || settings.base), [modal, setModal] = useState(null);
  const [category, setCategory] = useState('Продукты · Супермаркет'), [categoryIcon, setCategoryIcon] = useState('cart'), [payer, setPayer] = useState('Я');
  const [splitEnabled, setSplitEnabled] = useState(false), [shares, setShares] = useState([{ name: 'Я', amount: '500' }]);
  const [repeat, setRepeat] = useState('Не повторять'), [note, setNote] = useState(''), [date, setDate] = useState('2026-10-09');
  const [includeTotal, setIncludeTotal] = useState(true), [includeBudget, setIncludeBudget] = useState(true);
  const amountNumber = numeric(amount), baseAmount = convert(amountNumber, currency, settings.base, settings.rates);
  const shareTotal = shares.reduce((sum, item) => sum + (numeric(item.amount) || 0), 0);
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
  return <><div className="entry-head"><h2>Новая операция</h2><small>Все параметры в одном окне</small></div><EntrySwitch kind={kind} setKind={value => { setKind(value); setCategory(value === 'Доход' ? 'Работа · Подработка' : 'Продукты · Супермаркет'); setCategoryIcon(value === 'Доход' ? 'star' : 'cart'); }} /><div className="entry-amount"><button type="button" className="entry-amount-value" onClick={() => setModal({ type: 'calc' })} aria-label="Открыть калькулятор суммы">{money(Number.isFinite(amountNumber) ? amountNumber : 0, '')}</button><button type="button" className="entry-currency" onClick={() => setModal({ type: 'picker' })} aria-label={`Выбрать валюту, ${currency}`}>{SYMBOL[currency] || currency} <Icon name="chevron" size={16} /></button><small>Нажмите на сумму для калькулятора</small></div>{currency !== settings.base && <p className="entry-conversion">{baseAmount === null ? 'Курс к базовой валюте не задан' : `≈ ${money(baseAmount, settings.base)} в базовой валюте · ${settings.rates[currency] === DEMO_USD[currency] ? 'демо-курс' : 'выбранный курс'}`}</p>}
  <div className="flow-card compact"><SelectField label={kind === 'Перевод' ? 'Списать со счёта' : 'Счёт'} value={account} onClick={() => setModal({ type: 'account', role: 'source' })} />{activeMulti && <SelectField label="Списать из кармана" value={fromPocket} detail={fromPocket !== currency ? `≈ ${pocketAmount === null ? 'курс не задан' : money(pocketAmount, fromPocket)}` : 'Совпадает с валютой операции'} onClick={() => setModal({ type: 'pocket' })} />}{kind === 'Перевод' ? <SelectField label="На счёт" value={destination} onClick={() => setModal({ type: 'account', role: 'destination' })} /> : <><SelectField label="Категория" value={category} icon={categoryIcon} onClick={() => setModal({ type: 'category' })} /><SelectField label="Кто оплатил" value={payer} icon="person" onClick={() => setModal({ type: 'payer' })} /></>}<SelectField label="Периодичность" value={repeat} onClick={() => setModal({ type: 'repeat' })} /><label className="flow-inline"><span>Дата</span><input type="date" value={date} onChange={event => setDate(event.target.value)} /></label><label className="flow-inline"><span>Заметка</span><input value={note} onChange={event => setNote(event.target.value)} placeholder="Необязательно" /></label></div>
  {kind !== 'Перевод' && <div className="entry-flags"><label><input type="checkbox" checked={splitEnabled} onChange={event => setSplitEnabled(event.target.checked)} /> Распределить сумму между участниками</label></div>}
  {splitEnabled && kind !== 'Перевод' && <div className="flow-card compact"><strong className="flow-card-title">Кто сколько должен</strong><p className="flow-caption">Участники выбираются из общего справочника плательщиков.</p><button type="button" className="share-participant-select" onClick={()=>setModal({type:'payer-multi'})}><span>Плательщики · {shares.length}</span><strong>{shares.length?shares.map(item=>item.name).join(', '):'Выбрать людей'}</strong><span className="share-participant-arrow">Из справочника ›</span></button>{shares.map((item, index) => <div className="share-entry-row" key={item.name}><span>{item.name} должен</span><button type="button" className="share-amount-button" onClick={() => setModal({ type: 'share-calc', index })}>{money(numeric(item.amount) || 0, currency)}</button></div>)}<div className="share-entry-total"><span>Распределено</span><strong>{money(shareTotal, currency)} из {money(amountNumber || 0, currency)}</strong></div>{shareTotal !== amountNumber && <small className="share-entry-warning">Осталось распределить {money((amountNumber || 0) - shareTotal, currency)}</small>}</div>}
  {kind !== 'Перевод' && <div className="entry-flags"><label><input type="checkbox" checked={includeTotal} onChange={event => setIncludeTotal(event.target.checked)} /> В общий итог</label><label><input type="checkbox" checked={includeBudget} onChange={event => setIncludeBudget(event.target.checked)} /> В бюджет</label></div>}
  <div className="entry-foot"><span>{kind === 'Перевод' ? 'Между своими счетами' : 'Без интернета'}</span><a className="flow-primary" href={screenHref(kind === 'Перевод' ? 'base-detail' : 'base-journal')} onClick={() => { if (kind === 'Расход' && splitEnabled) saveSharedExpenseDebts(shares, currency, date, note); }}>{kind === 'Перевод' ? 'Перевести' : 'Сохранить'}</a></div>
  {modal?.type === 'calc' ? <Calculator value={amount} onApply={value => { setAmount(value); setModal(null); }} onClose={() => setModal(null)} /> : modal?.type === 'share-calc' ? <Calculator value={shares[modal.index]?.amount || '0'} onApply={value => { setShares(items => items.map((item, index) => index === modal.index ? { ...item, amount: value } : item)); setModal(null); }} onClose={() => setModal(null)} /> : <CurrencyModals modal={modal} setModal={setModal} settings={settings} update={update} onCurrency={code => { setCurrency(code); if (activeMulti && pockets.includes(code)) setFromPocket(code); }} />}
  {modal?.type === 'account' && <AccountPicker first={first} multi={multi} role={modal.role} exclude={modal.role === 'destination' ? account : undefined} onSelect={item => selectAccount(item, modal.role)} onClose={() => setModal(null)} onManage={() => setModal({ type: 'directory', directory: 'account', returnTo: modal })} />}
  {modal?.type === 'pocket' && <PocketPicker multi={activeMulti || multi} currency={currency} selected={fromPocket} onSelect={code => { setFromPocket(code); setModal(null); }} onClose={() => setModal(null)} />}
  {modal?.type === 'category' && <CategoryPicker kind={kind === 'Доход' ? 'Доход' : 'Расход'} selected={category} onSelect={(value, icon) => { setCategory(value); setCategoryIcon(icon); setModal(null); }} onClose={() => setModal(null)} onManage={() => setModal({ type: 'directory', directory: 'category', returnTo: modal })} />}
  {modal?.type === 'payer' && <PayerPicker selected={payer} onSelect={value => { setPayer(value); setModal(null); }} onClose={() => setModal(null)} onManage={() => setModal({ type: 'directory', directory: 'payer', returnTo: modal })} />}
  {modal?.type === 'payer-multi' && <PayerMultiPicker selected={shares.map(item=>item.name)} onApply={selectParticipants} onClose={()=>setModal(null)} />}
  {modal?.type === 'directory' && <DirectoryEditor type={modal.directory} onClose={() => setModal(modal.returnTo)} />}
  {modal?.type === 'repeat' && <div className="flow-overlay" role="dialog" aria-label="Периодичность"><div className="flow-sheet"><div className="sheet-head"><strong>Периодичность</strong><button type="button" onClick={() => setModal(null)} aria-label="Закрыть">×</button></div><div className="account-picker-list">{['Не повторять','Каждую неделю','Каждый месяц','Каждый год'].map(value => <button type="button" className={`payer-picker-row ${repeat === value ? 'selected' : ''}`} key={value} onClick={() => { setRepeat(value); setModal(null); }}><Icon name="clock" size={19} />{value}<span className="payer-picker-mark">{repeat === value ? '✓' : '›'}</span></button>)}</div></div></div>}</>;
}
export function CurrenciesFlow() {
  const [settings, update] = useCurrencySettings(), [modal, setModal] = useState(null), [status, setStatus] = useState('Демо-курсы; обновите при подключении к сети'), [query, setQuery] = useState('');
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
  return <><div className="entry-head"><h2>Валюты и курсы</h2></div><div className="currency-base-card"><span>Базовая валюта</span><button type="button" onClick={() => setModal({ type: 'picker', mode: 'base' })}><strong>{currencySymbol(settings.base)}</strong><span>{settings.base}<small>Все итоги сравниваются в этой валюте</small></span><Icon name="chevron" size={17} /></button></div><div className="directory-section-head"><strong>Мои валюты</strong><button type="button" onClick={() => setModal({ type: 'add' })}>+ Добавить</button></div><SearchInput value={query} onChange={setQuery} placeholder="Найти валюту" /><div className="currency-settings-list">{settings.currencies.filter(code => `${code} ${currencySymbol(code)}`.toLowerCase().includes(query.toLowerCase())).map(code => <button type="button" key={code} onClick={() => setModal({ type: 'rate', code })}><span className="currency-choice-symbol">{currencySymbol(code)}</span><span><strong>{code}</strong><small>{code === settings.base ? 'Базовая валюта' : settings.rates[code] ? `1 ${code} ≈ ${money(convert(1, code, settings.base, settings.rates), settings.base)}` : 'Курс не задан'}</small></span><Icon name="chevron" size={17} /></button>)}</div><button type="button" className="flow-primary currency-refresh" onClick={refresh}>Обновить курсы по API</button><p className="flow-caption">{status}</p><p className="flow-caption">Нажмите валюту, чтобы ввести свой курс. Сохранённые операции не пересчитываются.</p><CurrencyModals modal={modal} setModal={setModal} settings={settings} update={update} onCurrency={code => { if (modal?.mode === 'base') update({ base: code }); }} /></>;
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
  return <><div className="entry-head"><h2>{account.name}</h2><small>Мультивалютный счёт · {account.currencies.length} кармана</small></div><div className="flow-card compact">{account.currencies.map(code => [code, demoAmounts[code] || 0]).map(([code, amount]) => <div className="pocket-row" key={code}><span>{currencySymbol(code)} {code}</span><strong>{money(amount, code)}</strong><small>{code === settings.base ? 'Базовая валюта' : `≈ ${money(convert(amount, code, settings.base, settings.rates), settings.base)}`}</small></div>)}</div><p className="flow-caption">Каждая операция списывается из выбранного кармана. Если валюта суммы совпадает с карманом, он предлагается первым.</p><a className="flow-primary" href={screenHref('base-expense')}>Добавить операцию</a><a className="flow-secondary" href={screenHref('createaccount')}>Настроить валюты счёта</a></>;
}
const CATEGORY_DATA = { Расход: [['Продукты', 22500, '#b89162'],['Жильё', 15000, '#6b8f78'],['Прочее', 7500, '#8a7ca4']], Доход: [['Зарплата', 70000, '#6b8f78'],['Подработка', 20000, '#8a7ca4']] };
export function ReportsFlow() {
  const [kind, setKind] = useState('Расход'), [period, setPeriod] = useState('Октябрь 2026'), [account, setAccount] = useState('Все счета'), [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null);
  const factor = (period === 'Октябрь 2026' ? 1 : 0.7) * ({ 'Все счета': 1, 'Наличные': 0.4, TBC: 0.6 }[account] || 1);
  const data = CATEGORY_DATA[kind].map(([label, value, color]) => [label, Math.round(value * factor), color]);
  const total = data.reduce((sum, item) => sum + item[1], 0);
  const income = Math.round(90000 * factor), expense = Math.round(45000 * factor);
  let previous = 0;
  const gradient = data.map(([,, color,], index) => { const start = previous; previous += data[index][1] / total * 100; return `${color} ${start}% ${previous}%`; }).join(',');
  return <><div className="entry-head"><h2>Отчёты</h2><small>Движение средств · {period}</small></div><div className="report-filters"><button type="button" onClick={() => setModal({ type: 'period' })}>{period}</button><button type="button" onClick={() => setModal({ type: 'account' })}>{account}</button></div><div className="report-summary"><div><span>Доходы</span><strong>+{money(income, 'RUB')}</strong></div><div><span>Расходы</span><strong>−{money(expense, 'RUB')}</strong></div><div><span>Разница</span><strong>+{money(income - expense, 'RUB')}</strong></div></div><div className="entry-tabs" role="tablist" aria-label="Тип отчёта">{['Расход','Доход'].map(value => <button type="button" role="tab" aria-selected={kind === value} className={kind === value ? 'active' : ''} key={value} onClick={() => { setKind(value); setSelected(null); }}>{value}</button>)}</div><div className="report-chart"><div className="donut" style={{ background: `conic-gradient(${gradient})` }}><div><small>{kind === 'Расход' ? 'Расходы' : 'Доходы'}</small><strong>{money(total, 'RUB')}</strong></div></div><div className="report-legend">{data.map(([label, value, color]) => <button type="button" key={label} onClick={() => setSelected(label)}><i style={{ background: color }} /><span>{label}</span><strong>{Math.round(value / total * 100)}%</strong></button>)}</div></div><div className="flow-card compact">{data.map(([label, value]) => <SelectField key={label} label={label} value={money(value, 'RUB')} detail="Открыть операции категории" onClick={() => setSelected(label)} />)}</div>{selected && <div className="report-drill"><strong>{selected}</strong><span>Операции категории за {period.toLowerCase()}</span><a href={screenHref('base-journal')}>Открыть журнал →</a><button type="button" onClick={() => setSelected(null)}>Закрыть</button></div>}<p className="flow-caption">Демо-данные. Суммы отчёта показаны в RUB; переводы между своими счетами не входят в доходы и расходы.</p>{modal?.type === 'account' && <AccountPicker first={getFirstAccount()} multi={getMultiAccount()} allowAll onSelect={item => { setAccount(item.name); setModal(null); }} onClose={() => setModal(null)} />}{modal?.type === 'period' && <div className="flow-overlay" role="dialog" aria-label="Период отчёта"><div className="flow-sheet"><div className="sheet-head"><strong>Период отчёта</strong><button type="button" onClick={() => setModal(null)} aria-label="Закрыть">×</button></div>{['Октябрь 2026','Сентябрь 2026'].map(value => <button type="button" className="payer-picker-row" key={value} onClick={() => { setPeriod(value); setModal(null); }}>{value}</button>)}</div></div>}</>;
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

const DEPOSIT_DATA = [
  { id:'deposit-detail', name:'Накопительный · TBC', account:'TBC · USD карман', currency:'USD', principal:10000, current:10145, accrued:145, rate:5.2, due:'31 окт', payout:43.15, end:'31.10.2027', type:'С ежемесячной выплатой' },
  { id:'deposit-detail', name:'Гибкий · TBC', account:'TBC · GEL карман', currency:'GEL', principal:3500, current:3586, accrued:86, rate:8.0, due:'5 ноя', payout:23.01, end:'05.05.2027', type:'Капитализация процентов' }
];
const LOAN_DATA = [
  { id:'loan-detail', name:'Ипотека · TBC', account:'TBC · USD карман', currency:'USD', original:52000, balance:48000, rate:6.5, payment:820, principal:560, interest:260, due:'1 ноя', end:'01.10.2034' },
  { id:'loan-detail', name:'Автокредит · Bank of Georgia', account:'TBC · GEL карман', currency:'GEL', original:10000, balance:7500, rate:9.8, payment:410, principal:320, interest:90, due:'8 ноя', end:'08.03.2028' }
];

export function DepositFlow({ screen }) {
  const [selected, setSelected] = useState(0), [principal, setPrincipal] = useState('10000'), [rate, setRate] = useState('5.2'), [term, setTerm] = useState(12), [calcField,setCalcField]=useState(null);
  const [fundingAccount,setFundingAccount]=useState('TBC'), [fundingCurrency,setFundingCurrency]=useState('USD'), [modal,setModal]=useState(null);
  const first=getFirstAccount(), multi=getMultiAccount();
  const item = DEPOSIT_DATA[selected], months = ['Май','Июн','Июл','Авг','Сен','Окт'];
  const monthly = item.principal * item.rate / 100 / 12;
  const balance = Array.from({length:6},(_,i)=>Math.round(item.principal + monthly * (i+1)));
  const schedule = Array.from({length:6},(_,i)=>({date:['31 окт','30 ноя','31 дек','31 янв','28 фев','31 мар'][i],amount:item.payout,cumulative:item.accrued + item.payout*(i+1)}));
  if (screen?.id === 'deposit-new') {
    const p = numeric(principal) || 0, r = numeric(rate) || 0, earned = p * ((1 + r/100/12) ** term - 1);
    return <><div className="entry-head"><h2>Новый вклад</h2><small>Связь со счётом</small></div><div className="flow-card compact"><label className="flow-inline"><span>Название</span><input defaultValue="Накопительный TBC" /></label><SelectField label="Счёт и валюта вклада" value={`${fundingAccount} · ${currencySymbol(fundingCurrency)} карман`} onClick={()=>setModal({type:'account'})} /><SelectField label="Сумма вклада" value={money(p,fundingCurrency)} onClick={()=>setCalcField('principal')} /><SelectField label="Ставка годовых" value={`${r}%`} onClick={()=>setCalcField('rate')} /><label className="flow-inline"><span>Срок</span><select value={term} onChange={event=>setTerm(Number(event.target.value))}>{[6,12,18,24,36].map(value=><option key={value} value={value}>{value} месяцев</option>)}</select></label><label className="flow-inline"><span>Выплата процентов</span><select defaultValue="monthly"><option value="monthly">Ежемесячно на счёт</option><option value="capital">Капитализация</option></select></label></div><div className="product-summary-grid"><div><small>Ожидаемый доход</small><strong>{money(earned,fundingCurrency)}</strong></div><div><small>Сумма к окончанию</small><strong>{money(p+earned,fundingCurrency)}</strong></div></div><ProductTrend title="Рост суммы вклада" points={Array.from({length:6},(_,i)=>p + earned * (i+1)/6)} labels={['Старт','3 мес','6 мес','9 мес','12 мес']} valueLabel={`${money(p+earned,fundingCurrency)} через ${term} мес`} />{calcField&&<Calculator value={calcField==='principal'?principal:rate} decimals={2} onApply={value=>{calcField==='principal'?setPrincipal(value):setRate(value);setCalcField(null);}} onClose={()=>setCalcField(null)} />}{modal?.type==='account'&&<AccountPicker first={first} multi={multi} onSelect={item=>{setFundingAccount(item.name);if(item.multi){setModal({type:'pocket',account:item});}else{setFundingCurrency(item.currency||'USD');setModal(null);}}} onClose={()=>setModal(null)} onManage={()=>setModal(null)} />}{modal?.type==='pocket'&&<PocketPicker multi={modal.account} currency={fundingCurrency} selected={fundingCurrency} onSelect={code=>{setFundingCurrency(code);setModal(null);}} onClose={()=>setModal(null)} />}<a className="flow-primary" href={screenHref('deposit-payout')}>Проверить график</a><a className="flow-secondary" href={screenHref('deposits')}>Сохранить демо-вклад</a></>;
  }
  if (screen?.id === 'deposit-payout') return <><div className="entry-head"><h2>График начислений</h2><small>{item.name}</small></div><div className="product-summary-grid"><div><small>Начислено</small><strong>{money(item.accrued,item.currency)}</strong></div><div><small>Следующее</small><strong>{money(item.payout,item.currency)}</strong></div></div><ProductTrend title="Проценты по месяцам" points={balance} labels={months} valueLabel={`${money(monthly,item.currency)} / мес`} /><ProductTable caption="Ожидаемые выплаты · расчёт по условиям вклада" columns={['Дата','Проценты','Накоплено']} rows={schedule.map(row=>[row.date,money(row.amount,item.currency),money(row.cumulative,item.currency)])} /><p className="flow-caption">Расчёт демонстрационный. Фактическое начисление подтвердите по выписке банка.</p><a className="flow-primary" href={screenHref('deposit-detail')}>Карточка вклада</a></>;
  if (screen?.id === 'deposit-detail') return <><div className="entry-head"><h2>{item.name}</h2><small>{item.rate}% годовых</small></div><div className="product-hero"><small>Баланс вклада</small><strong>{money(item.current,item.currency)}</strong><span>Внесено {money(item.principal,item.currency)} · доход {money(item.accrued,item.currency)}</span></div><div className="product-summary-grid"><div><small>Доходность</small><strong>+{money(item.accrued,item.currency)}</strong></div><div><small>Следующая выплата</small><strong>{money(item.payout,item.currency)}</strong></div></div><ProductTrend title="Баланс и начисления" points={balance} labels={months} valueLabel={item.end} /><div className="flow-card compact"><SelectField label="Связанный счёт" value={item.account} onClick={()=>{}} /><SelectField label="Тип начисления" value={item.type} onClick={()=>{}} /><SelectField label="Срок окончания" value={item.end} onClick={()=>{}} /></div><ProductTable caption="Ближайшие начисления" columns={['Дата','Сумма','После выплаты']} rows={schedule.slice(0,4).map(row=>[row.date,money(row.amount,item.currency),money(item.current+row.amount,item.currency)])} /><a className="flow-secondary" href={screenHref('deposit-payout')}>Полный график</a><a className="flow-secondary" href={screenHref('base-journal')}>Операции по счёту</a><p className="flow-caption">Плановые проценты показываются отдельно от денег на счёте и не включаются в остаток до фактической выплаты.</p></>;
  return <><div className="entry-head"><h2>Вклады</h2><small>Портфель · {DEPOSIT_DATA.length} вклада</small></div><div className="product-summary-grid"><div><small>Вложено</small><strong>$10 000 · ₾3 500</strong></div><div><small>Начислено всего</small><strong>$145 · ₾86</strong></div></div><div className="directory-section-head"><strong>Мои вклады</strong><a href={screenHref('deposit-new')}>+ Добавить</a></div><div className="product-list">{DEPOSIT_DATA.map((deposit,index)=><article className={`product-list-card ${selected===index?'selected':''}`} key={deposit.name}><button type="button" className="product-select" onClick={()=>setSelected(index)}><span><strong>{deposit.name}</strong><small>{deposit.account} · {deposit.rate}% годовых</small></span><b>{money(deposit.current,deposit.currency)}</b></button><small className="product-accrued">Начислено +{money(deposit.accrued,deposit.currency)} · выплата {deposit.due}</small><a href={screenHref(deposit.id)}>Карточка вклада →</a></article>)}</div><ProductTrend title={`Доход по вкладу · ${item.name.split(' · ')[0]}`} points={balance} labels={months} valueLabel={`+${money(monthly,item.currency)} / мес`} /><ProductTable caption="Ближайшие выплаты по портфелю" columns={['Вклад','Дата','Сумма']} rows={DEPOSIT_DATA.map(deposit=>[deposit.name.split(' · ')[0],deposit.due,money(deposit.payout,deposit.currency)])} /><p className="flow-caption">Валюты не складываются в одну сумму без курса. Начисления — оценка; баланс вклада и доступные деньги на счёте показываются отдельно.</p></>;
}

export function LoanFlow({ screen }) {
  const [selected,setSelected]=useState(0), [extra,setExtra]=useState(0);
  const [calcField,setCalcField]=useState(null), [scenarioAmount,setScenarioAmount]=useState('50000'), [scenarioRate,setScenarioRate]=useState('7'), [scenarioYears,setScenarioYears]=useState('15');
  const [modal,setModal]=useState(null), [paymentAccount,setPaymentAccount]=useState('TBC · USD карман');
  const first=getFirstAccount(), multi=getMultiAccount();
  const item=LOAN_DATA[selected], ratePerMonth=item.rate/100/12;
  const schedule=Array.from({length:6},(_,i)=>{ const interest=Math.round((item.balance - i*item.principal)*ratePerMonth); const principal=Math.max(0,item.payment-interest); return {date:['01 ноя','01 дек','01 янв','01 фев','01 мар','01 апр'][i],payment:item.payment,principal,interest,balance:Math.max(0,item.balance-(i+1)*principal)}; });
  const remaining=Array.from({length:7},(_,i)=>Math.max(0,item.balance-i*item.principal));
  if (screen?.id === 'loan-calc') {
    const amount=numeric(scenarioAmount)||0, annual=numeric(scenarioRate)||0, count=(numeric(scenarioYears)||1)*12, monthlyRate=annual/1200;
    const payment=monthlyRate ? amount*monthlyRate*(1+monthlyRate)**count/((1+monthlyRate)**count-1) : amount/count;
    const totalInterest=Math.max(0,payment*count-amount), chart=Array.from({length:6},(_,i)=>Math.max(0,amount-(amount*0.28*(i+1)/6)));
    return <><div className="entry-head"><h2>Расчёт кредита</h2><small>Сценарий · без записи в счёт</small></div><div className="flow-card compact"><SelectField label="Сумма кредита" value={money(amount,'USD')} onClick={()=>setCalcField('amount')} /><SelectField label="Ставка годовых" value={`${annual}%`} onClick={()=>setCalcField('rate')} /><SelectField label="Срок" value={`${count} месяцев`} onClick={()=>setCalcField('years')} /><SelectField label="Тип платежа" value="Аннуитетный" onClick={()=>{}} /></div><div className="product-summary-grid"><div><small>Платёж в месяц</small><strong>{money(payment,'USD')}</strong></div><div><small>Всего процентов</small><strong>{money(totalInterest,'USD')}</strong></div></div><ProductTrend title="Остаток долга по сценарию" points={chart} labels={['Старт','3 года','6 лет','9 лет','12 лет']} tone="red" valueLabel={`${money(amount+totalInterest,'USD')} всего выплат`} /><ProductTable caption="Первые платежи · оценка" columns={['Месяц','Платёж','Проценты','Остаток']} rows={Array.from({length:5},(_,i)=>[String(i+1),money(payment,'USD'),money(amount*monthlyRate*(1-monthlyRate)**i,'USD'),money(amount-(payment-amount*monthlyRate)*(i+1),'USD')])} />{calcField&&<Calculator value={calcField==='amount'?scenarioAmount:calcField==='rate'?scenarioRate:scenarioYears} decimals={calcField==='years'?0:2} onApply={value=>{calcField==='amount'?setScenarioAmount(value):calcField==='rate'?setScenarioRate(value):setScenarioYears(value);setCalcField(null);}} onClose={()=>setCalcField(null)} />}<a className="flow-primary" href={screenHref('loan-detail')}>Сохранить сценарий</a><p className="flow-caption">Предварительная оценка по аннуитетной формуле. Комиссии, плавающая ставка и условия банка могут изменить сумму.</p></>;
  }
  if (screen?.id === 'loan-schedule') return <><div className="entry-head"><h2>График платежей</h2><small>{item.name}</small></div><div className="product-summary-grid"><div><small>Остаток долга</small><strong>{money(item.balance,item.currency)}</strong></div><div><small>Ежемесячно</small><strong>{money(item.payment,item.currency)}</strong></div></div><ProductTrend title="Как уменьшается основной долг" points={remaining} labels={['Сейчас','6 мес','1 год','2 года','3 года']} tone="red" valueLabel={`${item.rate}% годовых`} /><ProductTable caption="План · сумма распределена на долг и проценты" columns={['Дата','Платёж','Долг','Проценты','Остаток']} rows={schedule.map(row=>[row.date,money(row.payment,item.currency),money(row.principal,item.currency),money(row.interest,item.currency),money(row.balance,item.currency)])} /><a className="flow-primary" href={screenHref('loan-pay')}>Записать фактический платёж</a><p className="flow-caption">План графика сам по себе не списывает деньги. После платежа сверьте сумму по банковской выписке.</p></>;
  if (screen?.id === 'loan-pay' || screen?.id === 'loan-pay-preview') return <><div className="entry-head"><h2>{screen.id==='loan-pay'?'Записать платёж':'Проверка платежа'}</h2><small>{item.name}</small></div><div className="product-summary-grid"><div><small>Сумма списания</small><strong>{money(item.payment+extra,item.currency)}</strong></div><div><small>Остаток долга после</small><strong>{money(item.balance-item.principal-extra,item.currency)}</strong></div></div><div className="flow-card compact"><SelectField label="Счёт списания" value={paymentAccount} onClick={()=>setModal({type:'account'})} /><SelectField label="Основной долг" value={money(item.principal+extra,item.currency)} onClick={()=>setExtra(extra?0:100)} /><SelectField label="Проценты · расход" value={money(item.interest,item.currency)} onClick={()=>{}} /><label className="flow-inline"><span>Дата фактического платежа</span><input type="date" defaultValue="2026-11-01" /></label></div><p className="flow-caption">Счёт уменьшается на всю сумму платежа. Остаток кредита — только на погашенную часть основного долга. Проценты идут в расходы.</p>{modal?.type==='account'&&<AccountPicker first={first} multi={multi} onSelect={account=>{setPaymentAccount(account.name);if(account.multi)setModal({type:'pocket',account});else setModal(null);}} onClose={()=>setModal(null)} onManage={()=>setModal(null)} />}{modal?.type==='pocket'&&<PocketPicker multi={modal.account} currency={item.currency} selected={item.currency} onSelect={code=>{setPaymentAccount(`${modal.account.name} · ${currencySymbol(code)} карман`);setModal(null);}} onClose={()=>setModal(null)} />}<a className="flow-primary" href={screenHref('loan-detail')}>Сохранить платёж в журнале</a><a className="flow-secondary" href={screenHref('loan-schedule')}>Вернуться к графику</a></>;
  if (screen?.id === 'loan-detail') return <><div className="entry-head"><h2>{item.name}</h2><small>{item.rate}% годовых</small></div><div className="product-hero liability"><small>Остаток основного долга</small><strong>{money(item.balance,item.currency)}</strong><span>Из {money(item.original,item.currency)} · погашено {money(item.original-item.balance,item.currency)}</span></div><div className="product-summary-grid"><div><small>Ближайший платёж · {item.due}</small><strong>{money(item.payment,item.currency)}</strong></div><div><small>В этом платеже проценты</small><strong>{money(item.interest,item.currency)}</strong></div></div><ProductTrend title="Остаток основного долга" points={remaining} labels={['Сейчас','6 мес','1 год','2 года','3 года']} tone="red" valueLabel={item.end} /><div className="flow-card compact"><SelectField label="Счёт платежа" value={item.account} onClick={()=>{}} /><SelectField label="Платёж по графику" value={`${money(item.principal,item.currency)} долг + ${money(item.interest,item.currency)} проценты`} onClick={()=>{}} /><SelectField label="Дата окончания" value={item.end} onClick={()=>{}} /></div><ProductTable caption="Следующие платежи" columns={['Дата','Сумма','Основной долг','Проценты']} rows={schedule.slice(0,4).map(row=>[row.date,money(row.payment,item.currency),money(row.principal,item.currency),money(row.interest,item.currency)])} /><a className="flow-primary" href={screenHref('loan-pay')}>Записать платёж</a><a className="flow-secondary" href={screenHref('loan-schedule')}>Весь график</a><p className="flow-caption">Платёж списывается со счёта, но кредит не является деньгами на счёте. В общий остаток он попадает как обязательство, principal и проценты учитываются отдельно.</p></>;
  return <><div className="entry-head"><h2>Кредиты</h2><small>Обязательства · {LOAN_DATA.length}</small></div><div className="product-summary-grid"><div><small>Остаток долга</small><strong>$48 000 · ₾7 500</strong></div><div><small>Платежи в месяц</small><strong>$820 · ₾410</strong></div></div><div className="directory-section-head"><strong>Мои кредиты</strong><a href={screenHref('loan-calc')}>+ Рассчитать</a></div><div className="product-list">{LOAN_DATA.map((loan,index)=><article className={`product-list-card ${selected===index?'selected':''}`} key={loan.name}><button type="button" className="product-select" onClick={()=>setSelected(index)}><span><strong>{loan.name}</strong><small>{loan.account} · {loan.rate}% годовых</small></span><b>{money(loan.balance,loan.currency)}</b></button><small className="product-accrued">Платёж {money(loan.payment,loan.currency)} · {loan.due}</small><a href={screenHref(loan.id)}>Открыть кредит →</a></article>)}</div><ProductTrend title={`Остаток по кредиту · ${item.name.split(' · ')[0]}`} points={remaining} labels={['Сейчас','6 мес','1 год','2 года','3 года']} tone="red" valueLabel={`${item.rate}% годовых`} /><ProductTable caption="Ближайшие платежи по кредитам" columns={['Кредит','Дата','Платёж','Из них проценты']} rows={LOAN_DATA.map(loan=>[loan.name.split(' · ')[0],loan.due,money(loan.payment,loan.currency),money(loan.interest,loan.currency)])} /><p className="flow-caption">Остатки разных валют не складываются без курса. Плановые платежи показаны отдельно от фактических списаний.</p></>;
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
  const active=person||'Алексей', activeShared=sharedDebts.filter(item=>item.person===active), baseDetail=history[active], detailCurrency=baseDetail?.currency||activeShared[0]?.currency||'USD', sharedBalance=activeShared.filter(item=>item.currency===detailCurrency).reduce((sum,item)=>sum+(Number(item.amount)||0),0), activeRepayments=debtRepayments.filter(item=>item.person===active), repaymentTotal=activeRepayments.reduce((sum,item)=>sum+(convert(Number(item.amount)||0,item.currency,detailCurrency,currencySettings.rates)||0),0), repaymentEvents=activeRepayments.map(item=>[item.date,'Возврат',`−${money(item.amount,item.currency)}`,money(Math.max(0,(baseDetail?.balance||sharedBalance)-repaymentTotal),detailCurrency)]), detail=baseDetail ? {...baseDetail,given:baseDetail.given+sharedBalance,returned:baseDetail.returned+repaymentTotal,balance:Math.max(0,baseDetail.balance+sharedBalance-repaymentTotal),events:[...baseDetail.events,...activeShared.filter(item=>item.currency===detailCurrency).map(item=>[item.date,'Доля общего расхода',`+${money(item.amount,item.currency)}`,money(item.amount,item.currency)]),...repaymentEvents]} : (activeShared.length ? {currency:detailCurrency,balance:Math.max(0,sharedBalance-repaymentTotal),given:sharedBalance,returned:repaymentTotal,due:'по расходам',account:'Общие расходы',trend:[sharedBalance],labels:[activeShared.at(-1).date],events:[...activeShared.map(item=>[item.date,'Доля общего расхода',`+${money(item.amount,item.currency)}`,money(item.amount,item.currency)]),...repaymentEvents]} : history.Алексей);
  const repaymentValue=repayAmount||String(Math.min(500,detail.balance));
  if(screen?.id==='debt-new'){
    const value=numeric(debtAmount)||0, days=Math.max(0,Math.round((new Date(dueDate+'T00:00:00')-new Date(debtDate+'T00:00:00'))/86400000)), estimate=interestEnabled?value*(numeric(interestRate)||0)/100*days/365:0;
    if(created)return <><div className="entry-head"><h2>Долг создан</h2><small>Демо-сценарий</small></div><div className="product-hero"><small>{debtor} · {direction==='Мне должны'?'мне вернёт':'я верну'}</small><strong>{money(value,debtCurrency)}</strong><span>Ожидаемый возврат · {dueDate.split('-').reverse().join('.')}</span></div><div className="flow-card compact">{[["Счёт",debtAccount],["Проценты по условиям",interestEnabled?`${interestRate}% годовых · оценка ${money(estimate,debtCurrency)}`:'Без процентов'],["Заметка",debtNote||'Нет']].map(([label,content])=><div className="mobile-data-line" key={label}><span>{label}</span><strong>{content}</strong></div>)}</div><p className="flow-caption">В рабочем приложении создание долга будет отдельной записью; движение денег отражается только при фактической выдаче или возврате.</p><button type="button" className="flow-primary" onClick={()=>{window.location.hash=screenHref('debts');}}>К списку долгов</button></>;
    return <><div className="entry-head"><h2>Новый долг</h2><small>{direction==='Мне должны'?'Я выдаю деньги':'Я беру деньги'}</small></div><div className="entry-tabs" role="tablist" aria-label="Направление долга">{['Мне должны','Я должен'].map(value=><button type="button" role="tab" aria-selected={direction===value} className={direction===value?'active':''} key={value} onClick={()=>setDirection(value)}>{value}</button>)}</div><div className="entry-amount"><button type="button" className="entry-amount-value" onClick={()=>setFormModal({type:'calc'})} aria-label="Изменить сумму долга">{money(value,'')}</button><button type="button" className="entry-currency" onClick={()=>setFormModal({type:'picker'})}>{currencySymbol(debtCurrency)} <Icon name="chevron" size={16}/></button><small>Сумма займа · откройте калькулятор по нажатию</small></div><div className="flow-card compact"><SelectField label={direction==='Мне должны'?'Кто должен вернуть':'У кого беру в долг'} value={debtor||'Выбрать из плательщиков'} icon="person" onClick={()=>setFormModal({type:'payer'})} /><SelectField label={direction==='Мне должны'?'Счёт выдачи':'Счёт получения'} value={debtAccount} onClick={()=>setFormModal({type:'account'})} /><label className="flow-inline"><span>Дата выдачи / получения</span><input type="date" value={debtDate} onChange={event=>setDebtDate(event.target.value)} /></label><label className="flow-inline"><span>Ожидаемая дата возврата</span><input type="date" value={dueDate} min={debtDate} onChange={event=>setDueDate(event.target.value)} /></label><label className="flow-inline"><span>Условия</span><span className="debt-interest-toggle"><input type="checkbox" checked={interestEnabled} onChange={event=>setInterestEnabled(event.target.checked)}/> Проценты</span></label>{interestEnabled&&<SelectField label="Ставка годовых" value={`${interestRate}%`} onClick={()=>setFormModal({type:'interest-calc'})} />}<label className="flow-inline"><span>Заметка</span><input value={debtNote} maxLength={120} onChange={event=>setDebtNote(event.target.value)} placeholder="Например, ремонт машины" /></label></div><div className="product-summary-grid"><div><small>Сумма долга</small><strong>{money(value,debtCurrency)}</strong></div><div><small>{interestEnabled?'Оценка процентов':'Начисления'}</small><strong>{interestEnabled?money(estimate,debtCurrency):'0'}</strong></div></div>{interestEnabled&&<p className="flow-caption">Простой расчёт за {days} дней по ставке {interestRate}% годовых. Условия фиксируются в карточке долга.</p>}<button type="button" className="flow-primary" disabled={!debtor||value<=0||dueDate<debtDate} onClick={()=>setCreated(true)}>Сохранить долг</button><p className="flow-caption">Запись долга не меняет остаток счёта. Денежная операция появится при фактической выдаче или получении.</p>{formModal?.type==='calc'&&<Calculator value={debtAmount} onApply={next=>{setDebtAmount(next);setFormModal(null);}} onClose={()=>setFormModal(null)} />}{formModal?.type==='interest-calc'&&<Calculator value={interestRate} decimals={2} onApply={next=>{setInterestRate(next);setFormModal(null);}} onClose={()=>setFormModal(null)} />}{formModal?.type==='payer'&&<PayerPicker selected={debtor} excludeSelf onSelect={name=>{setDebtor(name);setFormModal(null);}} onClose={()=>setFormModal(null)} onManage={()=>setFormModal({type:'payer-directory'})} />}{formModal?.type==='payer-directory'&&<DirectoryEditor type="payer" onClose={()=>setFormModal(null)} />}{formModal?.type==='picker'&&<CurrencyModals modal={formModal} setModal={setFormModal} settings={currencySettings} update={updateCurrencySettings} onCurrency={code=>setDebtCurrency(code)} />}{formModal?.type==='account'&&<AccountPicker first={firstAccount} multi={multiAccount} onSelect={item=>{setDebtAccount(item.name);if(item.multi)setFormModal({type:'pocket',account:item});else{setDebtCurrency(item.currency||debtCurrency);setFormModal(null);}}} onClose={()=>setFormModal(null)} onManage={()=>setFormModal({type:'account-directory'})} />}{formModal?.type==='account-directory'&&<DirectoryEditor type="account" onClose={()=>setFormModal(null)} />}{formModal?.type==='pocket'&&<PocketPicker multi={formModal.account} currency={debtCurrency} selected={debtCurrency} onSelect={code=>{setDebtCurrency(code);setDebtAccount(`${formModal.account.name} · ${currencySymbol(code)} карман`);setFormModal(null);}} onClose={()=>setFormModal(null)} />}</>;
  }
  if (person || screen?.id === 'debt-detail' || screen?.id === 'debt-repay' || screen?.id === 'debt-repay-preview') return <><button type="button" className="flow-link debt-back" onClick={()=>{if(screen?.id==='debts')setPerson(null);else window.location.hash=screenHref('debts');}}>← Все долги</button><div className="entry-head"><h2>{active}</h2><small>Личные расчёты · {detail.currency}</small></div><div className="product-hero"><small>Текущий остаток</small><strong>{money(detail.balance,detail.currency)}</strong><span>Срок · {detail.due} · связанный счёт {detail.account}</span></div><div className="product-summary-grid"><div><small>{active==='Сергей'?'Получено в долг':'Всего выдано'}</small><strong>{money(detail.given,detail.currency)}</strong></div><div><small>{active==='Сергей'?'Возвращено':'Возвраты получены'}</small><strong>{money(detail.returned,detail.currency)}</strong></div></div><div className="debt-interest-note"><strong>Начисления процентов</strong><span>0 · без процентов по текущим условиям</span></div><ProductTrend title="Остаток долга по датам" points={detail.trend} labels={detail.labels} tone="red" valueLabel={money(detail.balance,detail.currency)} /><ProductTable caption="Все операции по долгу · нажмите строку для подробностей" columns={['Дата','Операция','Сумма','Остаток']} rows={detail.events} onRowClick={index=>setSelectedEvent(detail.events[index])} /><a className="flow-primary" href={screenHref('debt-repay')}>Записать возврат</a><a className="flow-secondary" href={screenHref('base-journal')}>Показать в журнале</a><p className="flow-caption">Выдачи увеличивают сумму долга, возвраты уменьшают её. В журнале остаются отдельные денежные операции.</p>{selectedEvent&&<div className="flow-overlay" role="dialog" aria-label="Операция по долгу"><div className="flow-sheet"><div className="sheet-head"><strong>{selectedEvent[1]}</strong><button type="button" onClick={()=>setSelectedEvent(null)} aria-label="Закрыть">×</button></div><div className="product-summary-grid"><div><small>Дата</small><strong>{selectedEvent[0]}</strong></div><div><small>Изменение долга</small><strong>{selectedEvent[2]}</strong></div></div><div className="flow-card compact">{[["Остаток после операции",selectedEvent[3]],["Человек",active],["Связанный счёт",detail.account]].map(([label,value])=><div className="mobile-data-line" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><a className="flow-primary" href={screenHref('base-detail')}>Открыть операцию</a></div></div>}{screen?.id==='debt-repay'&&<div className="flow-overlay" role="dialog" aria-modal="true" aria-label="Записать возврат"><div className="flow-sheet repayment-sheet"><div className="sheet-head"><strong>{repayRecorded?'Возврат записан':'Записать возврат'}</strong><button type="button" onClick={()=>{setRepayRecorded(false);window.location.hash=screenHref('debt-detail');}} aria-label="Закрыть">×</button></div>{repayRecorded?<><div className="product-hero"><small>{active} вернул</small><strong>{money(numeric(repaymentValue)||0,repayCurrency||detail.currency)}</strong><span>Долг будет уменьшен с учётом выбранной валюты</span></div><button type="button" className="flow-primary" onClick={()=>{setRepayRecorded(false);window.location.hash=screenHref('debt-detail');}}>К истории долга</button></>:<><p className="flow-caption">Укажите сумму, которую {active} возвращает сейчас.</p><div className="entry-amount repayment-amount"><button type="button" className="entry-amount-value" onClick={()=>setRepayModal({type:'calc'})} aria-label="Открыть калькулятор суммы возврата">{money(numeric(repaymentValue)||0,'')}</button><button type="button" className="entry-currency" onClick={()=>setRepayModal({type:'picker'})} aria-label="Выбрать валюту возврата">{currencySymbol(repayCurrency||detail.currency)} <Icon name="chevron" size={16}/></button><small>Сумма возврата · нажмите для калькулятора</small></div><label className="flow-inline"><span>Дата возврата</span><input type="date" value={repayDate} onChange={event=>setRepayDate(event.target.value)} /></label><button type="button" className="flow-primary" disabled={(numeric(repaymentValue)||0)<=0} onClick={()=>{const item={id:String(Date.now()),person:active,amount:numeric(repaymentValue)||0,currency:repayCurrency||detail.currency,date:repayDate,account:detail.account};saveDebtRepayment(item);setDebtRepayments(rows=>[...rows,item]);setRepayRecorded(true);}}>Подтвердить возврат</button></>}{repayModal?.type==='calc'&&<Calculator value={repaymentValue} onApply={next=>{setRepayAmount(next);setRepayModal(null);}} onClose={()=>setRepayModal(null)}/>}{repayModal?.type==='picker'&&<CurrencyModals modal={repayModal} setModal={setRepayModal} settings={currencySettings} update={updateCurrencySettings} onCurrency={code=>{setRepayCurrency(code);setRepayModal(null);}}/>}</div></div>}</>;
  const sharedPeople=direction==='Мне должны'?[...new Set(sharedDebts.map(item=>item.person))].map(name=>{const rows=sharedDebts.filter(item=>item.person===name);return [name,'Общий расход','—',rows.map(item=>money(item.amount,item.currency)).join(' · '),'по операциям','›'];}):[];
  const people=direction==='Мне должны'?[['Алексей','$2 000','$800','$1 200','20 окт','›'],['Анна','₾300','₾60','₾240','5 ноя','›'],...sharedPeople]:[['Сергей','$5 200','$400','$4 800','1 ноя','›']];
  return <><div className="entry-head"><h2>Долги</h2><small>Расчёты с людьми</small></div><div className="entry-tabs" role="tablist" aria-label="Направление долга">{['Мне должны','Я должен'].map(value=><button type="button" role="tab" aria-selected={direction===value} className={direction===value?'active':''} key={value} onClick={()=>setDirection(value)}>{value}</button>)}</div><div className="product-summary-grid"><div><small>{direction}</small><strong>{direction==='Мне должны'?'$1 200 · ₾240':'$4 800'}</strong></div><div><small>Ближайший срок</small><strong>{direction==='Мне должны'?'20 окт':'1 ноя'}</strong></div></div><ProductTable caption={direction==='Мне должны'?'Остатки по людям · нажмите строку для истории':'Кому и сколько вернуть · нажмите строку для истории'} columns={['Человек',direction==='Мне должны'?'Выдано':'Получено',direction==='Мне должны'?'Возврат':'Возвращено','Остаток','Срок','']} rows={people} onRowClick={index=>setPerson(direction==='Мне должны'?people[index][0]:'Сергей')} /><a className="flow-primary" href={screenHref('debt-new')}>+ Добавить долг</a><p className="flow-caption">Доли участников из общих расходов автоматически отражаются здесь как долг. Валюты не складываются в один итог без курса.</p></>;
}

export function BudgetFlow() {
  const [settings, update] = useCurrencySettings();
  const [limit, setLimit] = useState('50000'), [currency, setCurrency] = useState('RUB'), [monthDay, setMonthDay] = useState('1');
  const [modal, setModal] = useState(null);
  const spent = convert(45000, 'RUB', currency, settings.rates) || 0, remaining = Math.max(0, numeric(limit) - spent), percentage = Math.min(100, spent / (numeric(limit) || 1) * 100);
  return <><div className="entry-head"><h2>Бюджет</h2><small>Месячный лимит · октябрь 2026</small></div><div className="budget-hero"><span>Осталось на месяц</span><strong>{money(remaining, currency)}</strong><small>Потрачено {money(spent, currency)} из {money(numeric(limit) || 0, currency)}</small><Progress value={Math.round(percentage)} label="Использовано бюджета" /></div><div className="flow-card compact"><SelectField label="Месячный лимит" value={money(numeric(limit) || 0, currency)} onClick={() => setModal({ type: 'calc' })} /><SelectField label="Валюта" value={`${currencySymbol(currency)} ${currency}`} onClick={() => setModal({ type: 'picker' })} /><label className="flow-inline"><span>Начало месяца</span><select value={monthDay} onChange={event => setMonthDay(event.target.value)}>{Array.from({ length: 28 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} число</option>)}</select></label></div><div className="flow-card compact"><strong className="flow-card-title">По категориям</strong>{[['Продукты',22500],['Жильё',15000],['Прочее',7500]].map(([label, value]) => <div className="budget-category" key={label}><span>{label}</span><strong>{money(convert(value, 'RUB', currency, settings.rates) || 0, currency)}</strong></div>)}</div><p className="flow-caption">Учитываются только операции с признаком «В бюджет». Валюты приводятся к валюте лимита по выбранным курсам.</p><a className="flow-secondary" href={screenHref('reports')}>Отчёт по категориям</a>{modal?.type === 'calc' ? <Calculator value={limit} onApply={value => { setLimit(value); setModal(null); }} onClose={() => setModal(null)} /> : <CurrencyModals modal={modal} setModal={setModal} settings={settings} update={update} onCurrency={next => { const converted = convert(numeric(limit), currency, next, settings.rates); if (converted !== null) setLimit(String(Math.round(converted * 100) / 100)); setCurrency(next); }} />}</>;
}
export function PrototypeField({ label, value, icon = 'note' }) {
  const [settings, update] = useCurrencySettings();
  const [current, setCurrent] = useState(value);
  const [modal, setModal] = useState(null);
  const first = getFirstAccount(), multi = getMultiAccount();
  const lower = label.toLowerCase();
  const numberMatch = String(value).match(/\d[\d\s\u00a0]*(?:[,.]\d+)?/);
  const isNumber = Boolean(numberMatch && (/сумм|лимит|остаток|курс|значение|выражение|начало финансового месяца|^(?:1\s+)?[a-z]{3,5}$/i.test(lower) || (/^(?:списание|зачисление)$/.test(lower) && /^\s*\d/.test(String(value)))) && !/дата|источник/.test(lower));
  const showCurrency = !/выражение|значение|число|месяца/.test(lower);
  const type = isNumber ? 'calc' : /категор|category/.test(lower) ? 'category' : /платель|payer/.test(lower) ? 'payer' : /валют|currency|актив/.test(lower) && !/код валюты/.test(lower) ? 'picker' : /сч[её]т|account|откуда|куда/.test(lower) ? 'account' : /частот|периодич|окончан|если дня нет/.test(lower) ? 'choice' : null;
  const [amount, setAmount] = useState(numberMatch ? numberMatch[0].replace(/[\s\u00a0]/g, '').replace(',', '.') : '0');
  const symbolCodes = { '₽': 'RUB', '$': 'USD', '€': 'EUR', '₾': 'GEL', '£': 'GBP', '₫': 'VND', '₩': 'KRW' };
  const [currency, setCurrency] = useState((String(value).match(/\b(?:USD|EUR|GEL|RUB|GBP|VND|KRW)\b/) || [symbolCodes[String(value).match(/[₽$€₾£₫₩]/)?.[0]] || settings.base])[0]);
  const choices = /частот|периодич/.test(lower) ? ['Не повторять','Каждую неделю','Каждый месяц','Каждый год'] : /окончан/.test(lower) ? ['Без окончания','После 12 раз','По дате'] : ['Последний день месяца','Пропустить'];
  if (!type) return <label className="mobile-form-field"><Icon name={icon} size={20} /><span><small>{label}</small><input value={current} onChange={event => setCurrent(event.target.value)} /></span></label>;
  return <><button type="button" className="mobile-form-field smart-field" onClick={() => setModal({ type })}><Icon name={icon} size={20} /><span><small>{label}</small><strong>{isNumber ? `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 8 }).format(numeric(amount) || 0)}${showCurrency ? ` ${currencySymbol(currency)}` : ''}` : current}</strong></span><Icon name="chevron" size={17} /></button>
    {modal?.type === 'calc' && <Calculator value={amount} decimals={/курс/i.test(lower) ? 8 : 2} onApply={next => { setAmount(next); setCurrent(`${next} ${currency}`); setModal(null); }} onClose={() => setModal(null)} />}
    {['picker','rate','add'].includes(modal?.type) && <CurrencyModals modal={modal} setModal={setModal} settings={settings} update={update} onCurrency={code => { setCurrency(code); setCurrent(`${currencySymbol(code)} ${code}`); }} />}
    {modal?.type === 'account' && <AccountPicker first={first} multi={multi} onSelect={item => { setCurrent(item.name); setModal(item.multi ? { type: 'pocket' } : null); }} onClose={() => setModal(null)} onManage={() => setModal({ type: 'directory', directory: 'account', returnTo: { type: 'account' } })} />}
    {modal?.type === 'pocket' && <PocketPicker multi={multi} currency={currency} onSelect={code => { setCurrent(`${multi.name} · ${code}`); setModal(null); }} onClose={() => setModal(null)} />}
    {modal?.type === 'category' && <CategoryPicker kind="Расход" selected={current} onSelect={next => { setCurrent(next); setModal(null); }} onClose={() => setModal(null)} onManage={() => setModal({ type: 'directory', directory: 'category', returnTo: { type: 'category' } })} />}
    {modal?.type === 'payer' && <PayerPicker selected={current} onSelect={next => { setCurrent(next); setModal(null); }} onClose={() => setModal(null)} onManage={() => setModal({ type: 'directory', directory: 'payer', returnTo: { type: 'payer' } })} />}
    {modal?.type === 'choice' && <div className="flow-overlay" role="dialog" aria-label={label}><div className="flow-sheet"><div className="sheet-head"><strong>{label}</strong><button type="button" onClick={() => setModal(null)} aria-label="Закрыть">×</button></div><div className="account-picker-list">{choices.map(item => <button type="button" className="payer-picker-row" key={item} onClick={() => { setCurrent(item); setModal(null); }}>{item}</button>)}</div></div></div>}
    {modal?.type === 'directory' && <DirectoryEditor type={modal.directory} onClose={() => setModal(modal.returnTo)} />}</>;
}
