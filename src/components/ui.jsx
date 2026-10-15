import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export const screenHref = id => {
  const device = new URLSearchParams(window.location.hash.split('?')[1] || '').get('device');
  if (device !== 'tablet' && device !== 'desktop') return `#screens/${id}`;
  return `#screens/${id}${String(id).includes('?') ? '&' : '?'}device=${device}`;
};

const iconPaths = {
  camera:'M3 7h4l2-3h6l2 3h4v13H3zM12 10a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  qr:'M3 3h7v7H3zM5.5 5.5h2v2h-2zM14 3h7v7h-7zM16.5 5.5h2v2h-2zM3 14h7v7H3zM5.5 16.5h2v2h-2zM14 14h2v2h-2zM19 14h2v2h-2zM14 19h2v2h-2zM17 17h2v2h-2zM20 19h1v2h-1z',
  wallet:'M4 7h14a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h13v2M16 11h6v5h-6zM18 13.5h.1',
  bank:'M3 9h18M5 9v10M10 9v10M15 9v10M20 9v10M2 20h20M12 3l10 5H2z',
  deposit:'M4 17h8M5 14h6M6 11h4M15 18V8M12 11l3-3 3 3',
  loan:'M6 3h8l4 4v14H6zM14 3v4h4M9 13h.1M14 17h.1M15 12l-6 6',
  food:'M5 3v7M8 3v7M3 7h7M6.5 10v11M16 3v18M16 3c5 3 5 8 0 8',
  plus:'M12 5v14M5 12h14', list:'M9 6h12M9 12h12M9 18h12M3 6h1M3 12h1M3 18h1',
  settings:'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7M10 2h4l.5 2.1 1.5.6 1.9-1.2 2.8 2.8-1.2 1.9.6 1.5L22 10v4l-2.1.5-.6 1.5 1.2 1.9-2.8 2.8-1.9-1.2-1.5.6L14 22h-4l-.5-2.1-1.5-.6-1.9 1.2-2.8-2.8 1.2-1.9-.6-1.5L2 14v-4l2.1-.5.6-1.5-1.2-1.9 2.8-2.8 1.9 1.2 1.5-.6Z',
  more:'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  budget:'M4 3h16v18H4zM4 8h16M8 12h8M8 16h5',
  chart:'M3 3v18h18M7 16l4-5 3 2 5-7M7 17v-4M12 17v-7M17 17V8', target:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10M12 10v4',
  cart:'M3 4h2l2.2 10h11.6l2-7H6M9 19h.1M18 19h.1',
  house:'M3 11 12 3l9 8v10H3zM9 21v-7h6v7',
  car:'M5 11l2-5h10l2 5M4 11h16v7H4zM7 18v2M17 18v2M7 14h.1M17 14h.1',
  cup:'M4 7h14v7a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6zM18 9h2a2 2 0 0 1 0 4h-2M8 3v2M13 3v2',
  basket:'M4 10h16l-2 10H6zM8 10l4-7 4 7M8 14v3M12 14v3M16 14v3',
  bus:'M5 3h14v16H5zM5 13h14M8 19v2M16 19v2M8 9h.1M16 9h.1',
  bolt:'M13 2 5 13h6l-1 9 9-12h-6z',
  heart:'M20.5 8.5c0 5-8.5 11-8.5 11S3.5 13.5 3.5 8.5a4.5 4.5 0 0 1 8.5-2 4.5 4.5 0 0 1 8.5 2z',
  briefcase:'M4 7h16v13H4zM9 7V4h6v3M4 12h16M11 12v2h2v-2',
  person:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21v-2a8 8 0 0 1 16 0v2',
  search:'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM16 16l5 5',
  paste:'M8 5h12v16H8zM10 3h5M4 8v11M4 19h2',
  phone:'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2',
  book:'M4 4h8a4 4 0 0 1 4 4v13H8a4 4 0 0 1-4-4zM12 4h8v13h-8a4 4 0 0 0-4 4',
  gift:'M4 10h16v11H4zM3 7h18v3H3zM12 7v14M12 7C8 7 6 5 7 3c1.5-2 5 1 5 4zM12 7c4 0 6-2 5-4-1.5-2-5 1-5 4z',
  star:'m12 2 2.7 6.5L22 9l-5.5 4.8 1.7 7.2L12 17l-6.2 4 1.7-7.2L2 9l7.3-.5z',
  bag:'M4 8h16l-1 13H5zM9 8V6a3 3 0 0 1 6 0v2',
  arrow:'M5 12h14M13 6l6 6-6 6', back:'M19 12H5M11 6l-6 6 6 6',
  down:'M12 4v16M6 14l6 6 6-6', transfer:'M3 8h17M16 4l4 4-4 4M21 16H4M8 12l-4 4 4 4',
  chevron:'M9 6l6 6-6 6', calendar:'M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2M7 2v4M17 2v4M3 10h18',
  note:'M5 3h14v18H5zM8 8h8M8 12h8M8 16h5', tag:'M3 3h8l10 10-8 8L3 11zM7 7h.1',
  shield:'M12 2l8 3v6c0 6-8 11-8 11S4 17 4 11V5zM8 11l3 3 5-6',
  check:'M5 12l4 4L19 6', dots:'M5 12h.1M12 12h.1M19 12h.1', clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7v5l3 2'
};
export const iconPrinciples = [
  ['Линия', 'Контур 1,7 px, скруглённые концы. Без заливки.'],
  ['Размер', '22 px в строке, 18 px в поле, 25 px только у кнопки «плюс».'],
  ['Цвет', 'Иконка берёт цвет текста. Свой цвет — только у выбранного состояния.'],
  ['Смысл', 'Иконка стоит рядом со словом и не заменяет подпись.']
];
export const iconGroups = [
  ['Навигация', ['list', 'house', 'plus', 'chart', 'more', 'search']],
  ['Деньги', ['wallet', 'bank', 'deposit', 'loan', 'transfer', 'cart', 'budget', 'tag']],
  ['Люди и вещи', ['person', 'car', 'cup', 'briefcase', 'heart', 'gift']],
  ['Состояния', ['check', 'clock', 'shield', 'calendar', 'note', 'dots']]
];
export function Icon({ name, size = 22, className = '' }) { return <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={iconPaths[name] || iconPaths.wallet} /></svg>; }
function readCalendarLocale() {
  try {
    const data = JSON.parse(localStorage.getItem('finance-design-locale') || '{}');
    return { lang: data.lang === 'en' || data.lang === 'ka' ? data.lang : 'ru', sunday: data.week === 'sun' };
  } catch { return { lang: 'ru', sunday: false }; }
}
function dateParts(iso) {
  const [year, month, day] = String(iso || '').split('-');
  if (!day) return null;
  return { year, mm: String(Number(month)).padStart(2, '0'), dd: String(Number(day)).padStart(2, '0') };
}
export function dottedDate(iso) {
  const parts = dateParts(iso);
  return parts ? `${parts.dd}.${parts.mm}.${parts.year}` : (iso || '');
}
export function formatIsoDate(iso) {
  const parts = dateParts(iso);
  if (!parts) return iso || '';
  return readCalendarLocale().lang === 'en' ? `${parts.mm}/${parts.dd}/${parts.year}` : `${parts.dd}.${parts.mm}.${parts.year}`;
}
const CALENDAR_MONTHS = {
  ru: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
  en: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
  ka: ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი']
};
const CALENDAR_WEEKDAYS = {
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  ka: ['ორ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვ']
};
const CALENDAR_WEEKDAYS_SUN = {
  ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  ka: ['კვ', 'ორ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ']
};
function parseTypedDate(text, lang) {
  const clean = String(text || '').trim();
  const iso = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const dotted = clean.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  const slashed = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  let year, month, day;
  if (iso) { year = Number(iso[1]); month = Number(iso[2]); day = Number(iso[3]); }
  else if (lang === 'en' && slashed) { month = Number(slashed[1]); day = Number(slashed[2]); year = Number(slashed[3]); }
  else if (dotted || slashed) {
    const match = dotted || slashed;
    day = Number(match[1]); month = Number(match[2]); year = Number(match[3]);
  } else return '';
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) return '';
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return '';
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
export function DateCalendar({ from = '', to = '', onPick, onRangeChange, mode = 'range' }) {
  const [locale, setLocale] = useState(readCalendarLocale);
  const fromField = useRef(null);
  const toField = useRef(null);
  const [fromText, setFromText] = useState(() => formatIsoDate(from));
  const [toText, setToText] = useState(() => (to && to !== from ? formatIsoDate(to) : ''));
  useEffect(() => {
    const refresh = () => setLocale(readCalendarLocale());
    window.addEventListener('finance-locale', refresh);
    return () => window.removeEventListener('finance-locale', refresh);
  }, []);
  useEffect(() => {
    if (document.activeElement !== fromField.current) setFromText(formatIsoDate(from));
  }, [from, locale.lang]);
  useEffect(() => {
    if (document.activeElement !== toField.current) setToText(to && to !== from ? formatIsoDate(to) : '');
  }, [to, from, locale.lang]);
  const initial = from ? new Date(`${from}T00:00:00`) : new Date();
  const [cursor, setCursor] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1));
  const year = cursor.getFullYear(), month = cursor.getMonth();
  const lead = locale.sunday ? new Date(year, month, 1).getDay() : (new Date(year, month, 1).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const ranged = mode === 'range' && Boolean(from && to && from !== to);
  const start = ranged ? (from < to ? from : to) : from;
  const end = ranged ? (from < to ? to : from) : '';
  const cells = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, index) => index + 1)];
  const months = CALENDAR_MONTHS[locale.lang];
  const weekdays = (locale.sunday ? CALENDAR_WEEKDAYS_SUN : CALENDAR_WEEKDAYS)[locale.lang];
  const weekend = column => locale.sunday ? column === 0 || column === 6 : column > 4;
  const title = `${months[month][0].toUpperCase()}${months[month].slice(1)} ${year}`;
  const placeholder = locale.lang === 'en' ? 'MM/DD/YYYY' : 'ДД.ММ.ГГГГ';
  const commit = (text, which) => {
    const trimmed = text.trim();
    if (!trimmed) {
      if (which === 'to') setToText('');
      else setFromText(formatIsoDate(from));
      if (mode === 'range' && which === 'to' && onRangeChange) onRangeChange(from, '');
      return;
    }
    const iso = parseTypedDate(trimmed, locale.lang);
    if (!iso) {
      if (which === 'to') setToText(to && to !== from ? formatIsoDate(to) : '');
      else setFromText(formatIsoDate(from));
      return;
    }
    setCursor(new Date(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, 1));
    if (mode !== 'range') { onPick(iso); setFromText(formatIsoDate(iso)); return; }
    const end = to && to !== from ? to : '';
    let nextFrom = iso;
    let nextTo = '';
    if (which === 'to') {
      const start = from || iso;
      nextFrom = start < iso ? start : iso;
      nextTo = start === iso ? '' : (start < iso ? iso : start);
    } else if (end && iso > end) { nextFrom = end; nextTo = iso; }
    else nextTo = end;
    setFromText(formatIsoDate(nextFrom));
    setToText(nextTo ? formatIsoDate(nextTo) : '');
    if (onRangeChange) onRangeChange(nextFrom, nextTo);
    else onPick(iso);
  };
  const field = (which, label, value, setValue, ref) => <label><span>{label}</span><input ref={ref} value={value} placeholder={placeholder} aria-label={label} autoComplete="off" onChange={event => setValue(event.target.value)} onBlur={event => commit(event.target.value, which)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); commit(event.currentTarget.value, which); } }} /></label>;
  return <div className="date-calendar"><div className="date-calendar-fields">{field('from', mode === 'range' ? 'С' : 'Дата', fromText, setFromText, fromField)}{mode === 'range' && field('to', 'По', toText, setToText, toField)}</div><div className="date-calendar-head"><button type="button" aria-label="Предыдущий месяц" onClick={() => setCursor(new Date(year, month - 1, 1))}><Icon name="chevron" size={16} className="date-calendar-prev" /></button><strong>{title}</strong><button type="button" aria-label="Следующий месяц" onClick={() => setCursor(new Date(year, month + 1, 1))}><Icon name="chevron" size={16} /></button></div><div className="date-calendar-week">{weekdays.map((day, index) => <span key={day} className={weekend(index) ? 'weekend' : ''}>{day}</span>)}</div><div className="date-calendar-grid">{cells.map((day, index) => {
    if (!day) return <span key={`empty-${index}`} />;
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const column = (lead + day - 1) % 7;
    const picked = end ? iso >= start && iso <= end : iso === start;
    const roundLeft = picked && (iso === start || column === 0);
    const roundRight = picked && ((end ? iso === end : true) || column === 6);
    const classes = [picked ? 'picked' : '', roundLeft ? 'round-left' : '', roundRight ? 'round-right' : '', iso === todayIso && !picked ? 'today' : '', weekend(column) && !picked ? 'weekend' : ''].filter(Boolean).join(' ');
    return <button type="button" key={iso} className={classes} aria-pressed={picked} onClick={() => onPick(iso)}>{day}</button>;
  })}</div></div>;
}
export function DateField({ label, value, onChange }) {
  const anchor = useRef(null);
  const [host, setHost] = useState(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const inPhone = Boolean(host?.classList?.contains('phone'));
  return <>
    <button ref={anchor} type="button" className="flow-inline date-field" onClick={() => { setDraft(value || ''); setHost(anchor.current?.closest('.phone') || document.body); setOpen(true); }}><span>{label}</span><strong>{formatIsoDate(value) || 'Выбрать'}</strong></button>
    {open && host && createPortal(<div className={`flow-overlay date-field-overlay${inPhone ? '' : ' date-field-overlay--page'}`} role="dialog" aria-label={label}><div className="flow-sheet"><div className="sheet-head"><strong>{label}</strong><button type="button" onClick={() => setOpen(false)} aria-label="Закрыть">×</button></div><DateCalendar mode="single" from={draft} onPick={setDraft} /><button type="button" className="flow-primary date-calendar-apply" disabled={!draft} onClick={() => { onChange(draft); setOpen(false); }}>Выбрать</button></div></div>, host)}
  </>;
}
export const chartPalette = [
  { name: 'Лес', hex: '#225C46', role: 'Главная доля и линия баланса' },
  { name: 'Янтарь', hex: '#C56A1A', role: 'Вторая категория' },
  { name: 'Бирюза', hex: '#1C6E86', role: 'Третья категория' },
  { name: 'Киноварь', hex: '#AD3D38', role: 'Расход и снижение' },
  { name: 'Лист', hex: '#2F8F5B', role: 'Доход и рост' },
  { name: 'Слива', hex: '#5C4A86', role: 'Запасной цвет серии' }
];
export function DonutChart({ segments, centerLabel, centerValue, onSelect }) {
  const total = segments.reduce((sum, item) => sum + item.value, 0) || 1;
  let previous = 0;
  const gradient = segments.map(item => {
    const start = previous;
    previous += item.value / total * 100;
    return `${item.color} ${start}% ${previous}%`;
  }).join(',');
  return <div className="report-panel"><div className="report-chart"><div className="donut" style={{ background: `conic-gradient(${gradient})` }}><div><small>{centerLabel}</small><strong>{centerValue}</strong></div></div><div className="report-legend">{segments.map(item => <button type="button" key={item.label} onClick={onSelect ? () => onSelect(item.label) : undefined}><i style={{ background: item.color }} /><span>{item.label}</span><strong>{Math.round(item.value / total * 100)}%</strong></button>)}</div></div></div>;
}
export function TrendChart({ title, points, labels, valueLabel, tone = 'green' }) {
  const width = 320, height = 142, padX = 14, padY = 18;
  const values = points.map(point => Number(point) || 0), min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
  const coords = values.map((value, index) => [padX + index * (width - 2 * padX) / Math.max(1, values.length - 1), height - padY - (value - min) / span * (height - 2 * padY)]);
  const line = coords.map(([x, y]) => `${x},${y}`).join(' ');
  const fill = `${padX},${height - padY} ${line} ${width - padX},${height - padY}`;
  return <section className="report-panel product-chart-card"><div className="product-chart-head"><strong>{title}</strong><span>{valueLabel}</span></div><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${title}: ${values.join(', ')}`} className={`product-trend ${tone}`}><line x1={padX} y1={height * .28} x2={width - padX} y2={height * .28} /><line x1={padX} y1={height * .62} x2={width - padX} y2={height * .62} /><polygon points={fill} /><polyline points={line} />{coords.map(([x, y], index) => <circle key={index} cx={x} cy={y} r="3.5" />)}</svg><div className="product-chart-labels">{labels.map(label => <small key={label}>{label}</small>)}</div></section>;
}
export function DataTable({ caption, columns, rows }) {
  return <div className="kit-table">{caption && <div className="kit-table-caption">{caption}</div>}<table><thead><tr>{columns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

export function BrandMark({ size = 38 }) {
  return <span className="brand-mark" style={{ width: size, height: size }} aria-hidden="true"><img src="/logo-mark.png" alt="" width={size} height={size} /></span>;
}

export function EmptyState({ title, text }) {
  return <div className="empty-state"><BrandMark size={48} /><strong>{title}</strong><p>{text}</p></div>;
}

export function Button({ children, href, variant = 'primary', size = 'normal', icon, disabled = false, onClick, className = '' }) {
  const classes = `button button--${variant} button--${size} ${className}`.trim();
  const content = <>{children}{icon && <span className="button-icon" aria-hidden="true">{icon}</span>}</>;
  return href && !disabled ? <a className={classes} href={href}>{content}</a> : <button className={classes} type="button" disabled={disabled} onClick={onClick}>{content}</button>;
}

export function Card({ children, className = '' }) { return <section className={`card ${className}`.trim()}>{children}</section>; }
export function Badge({ children, tone = 'neutral' }) { return <span className={`badge badge--${tone}`}>{children}</span>; }
export function Money({ value, currency = '₽', tone = '' }) { return <span className={`money ${tone && `money--${tone}`}`}><span>{value}</span><small>{currency}</small></span>; }

export function Field({ label, value = '', hint = '', readOnly = false, type = 'text' }) {
  const id = useId();
  const [current, setCurrent] = useState(value);
  return <div className="field"><label htmlFor={id}>{label}</label><input id={id} type={type} value={current} readOnly={readOnly} onChange={event => setCurrent(event.target.value)} />{hint && <small>{hint}</small>}</div>;
}

export function Switch({ label, description, checked = false }) {
  const [enabled, setEnabled] = useState(checked);
  return <label className="switch-row"><span><strong>{label}</strong>{description && <small>{description}</small>}</span><input type="checkbox" checked={enabled} onChange={event => setEnabled(event.target.checked)} /><span className="switch-track" aria-hidden="true" /></label>;
}

export function Notice({ children, tone = 'info' }) {
  const symbol = { success:'✓', warning:'!', danger:'×', info:'i' }[tone];
  return <div className={`notice notice--${tone}`} role="status"><span className="notice-symbol" aria-hidden="true">{symbol}</span><span>{children}</span></div>;
}

export function Progress({ value, label }) { return <div className="progress" role="progressbar" aria-label={label} aria-valuemin="0" aria-valuemax="100" aria-valuenow={value}><span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>; }

export function DataRow({ label, detail, value, href, icon = '◉' }) {
  const content = <><span className="row-icon" aria-hidden="true">{icon}</span><span className="row-copy"><strong>{label}</strong>{detail && <small>{detail}</small>}</span>{value && <strong className="row-value">{value}</strong>}{href && <span aria-hidden="true">›</span>}</>;
  return href ? <a className="data-row" href={href}>{content}</a> : <div className="data-row">{content}</div>;
}

export function PageIntro({ eyebrow, title, description, action }) { return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{action && <div className="page-action">{action}</div>}</div>; }
export function Section({ title, description, children, id }) { return <section className="doc-section" id={id}><div className="section-head"><h2>{title}</h2><p>{description}</p></div>{children}</section>; }

export function MobileHero({ label, amount, currency = '₽', footer, meta }) {
  return <div className="mobile-hero"><div className="mobile-hero-label">{label}<Icon name="wallet" size={18} /></div><div className="mobile-hero-number">{amount}<span>{currency}</span></div>{footer && <div className="mobile-hero-summary">{footer.map(([caption, value]) => <div key={caption}><small>{caption}</small><strong>{value}</strong></div>)}</div>}{meta && <div className="mobile-hero-meta">{meta}</div>}</div>;
}

export function AccountTile({ title, subtitle, amount, href, kind = 'wallet', mark }) {
  const body = <><span className={`account-tile-icon${kind === 'bank' ? ' bank' : ''}${kind === 'loan' ? ' loan' : ''}`}>{mark ? <span className="account-tile-mark">{mark}</span> : <Icon name={kind} />}</span><span className="account-tile-copy"><strong>{title}</strong>{subtitle && <small>{subtitle}</small>}</span><strong className="account-tile-amount">{amount}</strong></>;
  return href ? <a className="account-tile" href={href}>{body}</a> : <div className="account-tile">{body}</div>;
}

export function MobileFormField({ label, value, icon = 'note', type = 'text' }) {
  const id = useId(); const [current, setCurrent] = useState(value);
  return <div className="mobile-form-field"><Icon name={icon} size={20} /><div><label htmlFor={id}>{label}</label><input id={id} type={type} value={current} onChange={event => setCurrent(event.target.value)} /></div><Icon name="chevron" size={17} /></div>;
}
