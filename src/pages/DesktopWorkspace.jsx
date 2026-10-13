import React from 'react';
import { Icon } from '../components/ui.jsx';

const href = id => id.startsWith('@') ? `#desktop/${id.slice(1)}` : `#desktop/screen/${id}`;

function journalFilter(area) {
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const category = params.get('category') || '';
  const period = params.get('period') || '';
  const account = params.get('account') || '';
  const kind = params.get('kind') || '';
  const active = Boolean(category || period || account || kind);
  const rows = area.rows.filter(row =>
    (!category || row[3] === category) &&
    (!period || period === 'Октябрь 2026') &&
    (!account || account === 'Все счета' || row[2] === account) &&
    (!kind || (kind === 'Расход' ? row[4].startsWith('−') : kind === 'Доход' ? row[4].startsWith('+') : true))
  );
  return { active, rows, label: [category, period, account !== 'Все счета' ? account : '', kind].filter(Boolean).join(' · ') };
}
function JournalView({ area }) {
  const filter = journalFilter(area);
  return <>{filter.active && <div className="desktop-journal-filter"><span>Из отчёта: {filter.label}</span><a href="#desktop/journal">Сбросить</a></div>}<div className="desktop-table-scroll"><table><thead><tr>{area.columns.map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{filter.rows.map((row, index) => <tr key={index}>{row.map((value, cell) => <td key={cell}>{value}</td>)}</tr>)}</tbody></table>{!filter.rows.length && <p className="search-empty">Нет операций по этому фильтру</p>}</div></>;
}

function AccountsView({ area }) {
  return <div className="desktop-account-list">{area.rows.map(([name, currency, balance, pending, updated], index) => <div className="desktop-account-row" key={name}><span className={`desktop-account-icon desktop-account-icon--${index}`}><Icon name={index === 1 ? 'wallet' : 'bank'} size={20} /></span><span className="desktop-account-name"><strong>{name}</strong><small>{currency} · Сверка {updated}</small></span><span className="desktop-account-balance"><strong>{balance}</strong><small>{pending === '—' ? 'В пути нет' : `В пути ${pending}`}</small></span></div>)}</div>;
}

function PlanningView({ area }) {
  return <div className="desktop-timeline">{area.rows.map(([date, event, type, amount, status]) => <div className="desktop-timeline-row" key={event}><span className="desktop-timeline-date">{date}</span><span className="desktop-timeline-dot" /><span className="desktop-timeline-event"><strong>{event}</strong><small>{type}</small></span><span className="desktop-timeline-value"><strong>{amount}</strong><small>{status}</small></span></div>)}</div>;
}

function BudgetView({ area }) {
  return <div className="desktop-budget-list">{area.rows.map(([name, spent, limit, percent, note]) => <article className="desktop-budget-row" key={name}><div><span><strong>{name}</strong><small>{note}</small></span><b>{percent}%</b></div><div className="desktop-budget-track"><span style={{ width: `${Math.min(Number(percent), 100)}%` }} /></div><footer><span>Потрачено {spent}</span><span>Лимит {limit}</span></footer></article>)}<a className="desktop-budget-add" href={href('budget-edit-full')}><Icon name="plus" size={17} /> Настроить новый бюджет</a></div>;
}

function TogetherView({ area }) {
  return <div className="desktop-people-grid">{area.rows.map(([name, purchase, share, returned, balance], index) => <article className="desktop-person-card" key={name}><span className={`desktop-person-avatar desktop-person-avatar--${index}`}>{name.slice(0, 1)}</span><strong>{name}</strong><small>{purchase}</small><div><span>Доля</span><b>{share}</b></div><div><span>Вернули</span><b>{returned}</b></div><div className="desktop-person-total"><span>Осталось</span><b>{balance}</b></div></article>)}</div>;
}

function DebtsView({ area }) {
  return <div className="desktop-debt-list">{area.rows.map(([name, direction, balance, date, status]) => <div className="desktop-debt-row" key={name}><span className={`desktop-debt-direction ${direction === 'Мне должны' ? 'incoming' : 'outgoing'}`}><Icon name={direction === 'Мне должны' ? 'down' : 'arrow'} size={18} /></span><span><strong>{name}</strong><small>{direction} · {status}</small></span><span className="desktop-debt-end"><strong>{balance}</strong><small>До {date}</small></span></div>)}</div>;
}

function DepositsView({ area }) {
  return <div className="desktop-product-grid">{area.rows.map(([name, rate, accrued, paid, date], index) => <article className="desktop-product-card" key={name}><span className="desktop-product-symbol"><Icon name={index ? 'bank' : 'wallet'} size={22} /></span><small>ВКЛАД</small><h4>{name}</h4><strong className="desktop-product-rate">{rate}</strong><div><span>Начислено</span><b>{accrued}</b></div><div><span>Выплачено</span><b>{paid}</b></div><footer>Следующая дата · {date}</footer></article>)}</div>;
}

function LoansView({ area }) {
  return <div className="desktop-loan-list">{area.rows.map(([name, payment, principal, interest, date], index) => <article className="desktop-loan-card" key={name}><div><span className="desktop-loan-icon"><Icon name={index ? 'bank' : 'car'} size={19} /></span><span><strong>{name}</strong><small>Следующий платёж · {date}</small></span><b>{payment}</b></div><div className="desktop-loan-track"><span style={{ width: `${Math.round(Number(principal.replace(/\D/g, '')) / Number(payment.replace(/\D/g, '')) * 100)}%` }} /></div><footer><span>Основной долг {principal}</span><span>Проценты {interest}</span></footer></article>)}</div>;
}

function ReportsView({ area }) {
  return <div className="desktop-report-list">{area.rows.map(([category, count, amount, share], index) => <div className="desktop-report-row" key={category}><span className={`desktop-report-symbol desktop-report-symbol--${index}`}><Icon name={['cart', 'bus', 'cup'][index]} size={18} /></span><div><span><strong>{category}</strong><small>{count} операций · {amount}</small></span><div className="desktop-report-track"><span style={{ width: share }} /></div></div><b>{share}</b></div>)}</div>;
}

function DataView({ area }) {
  return <div className="desktop-review-list">{area.rows.map(([source, count, matches, errors, status], index) => <div className="desktop-review-row" key={source}><span className={`desktop-review-icon desktop-review-icon--${index}`}><Icon name={['paste', 'qr', 'shield'][index]} size={20} /></span><span><strong>{source}</strong><small>{count} записей · {matches === '—' ? 'совпадений нет' : `${matches} совпадения`} · {errors} ошибок</small></span><em>{status}</em></div>)}</div>;
}

const views = { journal: JournalView, accounts: AccountsView, budget: BudgetView, planning: PlanningView, together: TogetherView, debts: DebtsView, deposits: DepositsView, loans: LoansView, reports: ReportsView, data: DataView };
const captions = { journal: 'Последние операции', accounts: 'Счета книги', budget: 'Мои бюджеты', planning: 'Ближайшие события', together: 'Участники', debts: 'Открытые долги', deposits: 'Мои вклады', loans: 'Платежи по кредитам', reports: 'Категории расходов', data: 'Источники для проверки' };

export default function DesktopWorkspace({ area }) {
  const View = views[area.id];
  const visibleCount = area.id === 'journal' ? journalFilter(area).rows.length : area.rows.length;
  const recordWord = visibleCount % 10 === 1 && visibleCount % 100 !== 11 ? 'запись' : [2,3,4].includes(visibleCount % 10) && ![12,13,14].includes(visibleCount % 100) ? 'записи' : 'записей';
  return <><div className={`desktop-overview desktop-overview--${area.id}`}><div><small>{area.metricLabel}</small><strong>{area.metric}</strong></div><p>{area.lead}</p></div><div className="desktop-content"><section className="desktop-table-card"><div className="desktop-card-head"><div><span className="desktop-card-kicker">ЛИЧНАЯ КНИГА</span><h3>{captions[area.id]}</h3></div><span>{visibleCount} {area.id === 'reports' ? 'категории' : area.id === 'budget' ? 'бюджета' : recordWord}</span></div><View area={area} /></section><aside className="desktop-detail"><small>ПО ЭТОЙ ТЕМЕ</small><h3>Действия</h3><p>{area.detail}</p><div>{area.links.map(([label, id]) => <a key={id} href={href(id)}>{label}<Icon name="chevron" size={15} /></a>)}</div></aside></div></>;
}
