import React, { useState } from 'react';
import { Badge, Button, Notice, screenHref } from './ui.jsx';

function Head({ title, subtitle }) { return <div className="coverage-head"><a href={screenHref('base-settings')} aria-label="Назад">←</a><div><small>{subtitle}</small><h2>{title}</h2></div></div>; }
function Links({ items }) { return <div className="mobile-actions">{items.map(([label,id], index) => <Button key={id} href={screenHref(id)} variant={index ? 'secondary' : 'primary'} className="mobile-action">{label}</Button>)}</div>; }
const format = value => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;

export function SplitMethodFlow() {
  const [kind,setKind] = useState('Расход');
  const [method,setMethod] = useState('Поровну');
  const [amount,setAmount] = useState('3000');
  const numeric = Math.max(0, Math.round(Number(amount.replace(',', '.')) * 100) || 0);
  const cents = method === 'По процентам' ? [Math.round(numeric*.4),Math.round(numeric*.35)] : method === 'По долям' ? [Math.round(numeric*.5),Math.round(numeric*.25)] : method === 'По позициям' ? [Math.min(numeric,120000),Math.min(Math.max(0,numeric-120000),90000)] : [Math.floor(numeric/3),Math.floor(numeric/3)];
  const shares = [...cents,Math.max(0,numeric-cents[0]-cents[1])].map(value => value/100);
  return <><Head title="Разделить операцию" subtitle="SPLIT-01/04 · TOGETHER-03" /><div className="coverage-segment" role="group" aria-label="Тип операции">{['Расход','Доход'].map(item => <button type="button" key={item} className={kind===item?'active':''} onClick={() => setKind(item)}>{item}</button>)}</div><label className="coverage-amount">Общая сумма<input inputMode="decimal" value={amount} onChange={event => setAmount(event.target.value)} aria-label="Общая сумма" />₽</label><p className="mobile-hint">Способ распределения</p><div className="coverage-methods" role="group" aria-label="Способ распределения">{['Поровну','По процентам','По долям','По позициям'].map(item => <button type="button" key={item} className={method===item?'active':''} onClick={() => setMethod(item)}>{item}</button>)}</div><div className="mobile-form-card">{['Часть 1','Часть 2','Часть 3'].map((label,index) => <div className="mobile-data-line" key={label}><span>{method==='По позициям'?['Продукты','Быт','Остальное'][index]:label}</span><strong>{format(shares[index])}</strong></div>)}<div className="mobile-data-line"><span>Нераспределено</span><strong>0 ₽</strong></div></div><Notice tone="success">Округление остатка назначено третьей части. На счёт записывается один {kind==='Расход'?'расход':'доход'} на {format(numeric/100)}.</Notice><Links items={[[kind==='Доход'?'Показать доход по частям':'Проверить части',kind==='Доход'?'split-income':'op-split'],['К общей покупке','trip-expense']]} /></>;
}

const reviewItems = [
  {title:'Чек · супермаркет',status:'Черновик',detail:'OCR: сумма 1 250 ₽ · уверенность 62%',to:'review-detail'},
  {title:'Кафе · 450 ₽',status:'Сохранено с пометкой',detail:'Не выбрана категория · влияет на остаток',to:'review-detail'},
  {title:'Выписка CSV',status:'Возможный дубль',detail:'Есть похожая запись от бота',to:'duplicate-review'},
  {title:'Импорт',status:'Не обработано',detail:'3 строки требуют сопоставления',to:'import-preview'}
];
export function ReviewQueueFlow() {
  const [filter,setFilter] = useState('Все');
  const shown = filter==='Все'?reviewItems:reviewItems.filter(item => item.status===filter);
  return <><Head title="Требует проверки" subtitle="REVIEW-01 · 4 источника" /><Notice>Черновики не влияют на остатки. Сохранённые записи с пометкой участвуют в расчётах.</Notice><div className="coverage-segment scroll" role="group" aria-label="Фильтр проверки">{['Все','Черновик','Сохранено с пометкой','Возможный дубль'].map(item => <button type="button" key={item} className={filter===item?'active':''} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="coverage-list">{shown.map(item => <a key={item.title} href={screenHref(item.to)}><span><strong>{item.title}</strong><small>{item.detail}</small></span><Badge tone={item.status==='Черновик'?'warning':'neutral'}>{item.status}</Badge></a>)}</div><Links items={[["Открыть импорт",'import-preview'],['К журналу','base-journal']]} /></>;
}
export function ReviewDetailFlow() {
  const [amount,setAmount] = useState('1250');
  return <><Head title="Проверить чек" subtitle="Черновик · OCR 62%" /><Notice tone="warning">Распознанная сумма не подтверждена. До сохранения остаток не меняется.</Notice><label className="coverage-amount">Сумма<input inputMode="decimal" value={amount} onChange={event=>setAmount(event.target.value)} aria-label="Проверенная сумма" />₽</label><div className="mobile-form-card"><div className="mobile-data-line"><span>Источник</span><strong>Фото чека</strong></div><div className="mobile-data-line"><span>Категория</span><strong>Продукты</strong></div><div className="mobile-data-line"><span>После подтверждения</span><strong>Расход {amount} ₽</strong></div></div><Links items={[["Проверить позиции",'receipt-items'],['Сопоставить дубль','duplicate-review'],['К списку','review-queue']]} /></>;
}
export function TripInviteFlow() {
  const [role,setRole] = useState('Участник с вводом');
  return <><Head title="Пригласить в поездку" subtitle="TRIP-02 · Тбилиси" /><div className="coverage-segment" role="group" aria-label="Роль приглашения">{['Участник с вводом','Наблюдатель'].map(item => <button type="button" key={item} className={role===item?'active':''} onClick={()=>setRole(item)}>{item}</button>)}</div><div className="mobile-form-card"><div className="mobile-data-line"><span>Доступ</span><strong>Только поездка</strong></div><div className="mobile-data-line"><span>Срок</span><strong>7 дней</strong></div><div className="mobile-data-line"><span>Роль</span><strong>{role}</strong></div></div><Notice>Ссылка приглашения позволяет {role==='Наблюдатель'?'смотреть поездку':'вносить общие траты'} после подтверждения. Личные счета остаются закрытыми.</Notice><Links items={[["Роли участников",'trip-roles'],['Ссылка только для просмотра','share-link'],['К поездке','trip-detail']]} /></>;
}
export function TripUnallocatedFlow() {
  return <><Head title="Распределить позже" subtitle="TRIP-03/06 · поездка" /><div className="mobile-form-card"><div className="mobile-data-line"><span>Покупка</span><strong>Ужин · 240 GEL</strong></div><div className="mobile-data-line"><span>Плательщик</span><strong>Я</strong></div><div className="mobile-data-line"><span>Нераспределено</span><strong>240 GEL</strong></div></div><Notice tone="warning">Списание плательщика уже видно. Итог долгов по поездке предварительный, пока эта покупка не распределена.</Notice><Links items={[["Распределить покупку",'split-method'],['Проверить завершение','trip-close'],['К поездке','trip-detail']]} /></>;
}
export function TripCloseFlow() {
  const [resolved,setResolved] = useState(false);
  const [completed,setCompleted] = useState(false);
  return <><Head title="Завершить поездку" subtitle="TRIP-05/06 · проверка" /><div className="mobile-form-card"><div className="mobile-data-line"><span>Нераспределённых покупок</span><strong>{resolved?'0':'1'}</strong></div><div className="mobile-data-line"><span>Ожидают согласования</span><strong>2 доли</strong></div><div className="mobile-data-line"><span>Я должен / мне должны</span><strong>60 / 120 GEL</strong></div></div>{resolved?<Notice tone="success">Демо-предпросмотр: незавершённые покупки разобраны. Взаимозачёт остаётся предложением.</Notice>:<Notice tone="warning">Завершение недоступно: распределите все покупки и проверьте доли.</Notice>}<button type="button" className="flow-primary coverage-full" disabled={!resolved || completed} onClick={()=>setCompleted(true)}>{completed?"Поездка завершена · демо":"Завершить в концепте"}</button><button type="button" className="flow-secondary coverage-full" onClick={()=>setResolved(!resolved)}>{resolved?'Вернуть незавершённое состояние':'Показать состояние после распределения'}</button><Links items={[["Разобрать покупку",'trip-unallocated'],['Расчёты','trip-settle']]} /></>;
}
export function RuleExplainFlow() {
  const [enabled,setEnabled] = useState(true);
  return <><Head title="Почему выбрана категория" subtitle="RULE-01/03 · порядок 2 из 5" /><div className="mobile-form-card"><div className="mobile-data-line"><span>Операция</span><strong>Супермаркет · 2 450 ₽</strong></div><div className="mobile-data-line"><span>Условие</span><strong>Название содержит «Супермаркет»</strong></div><div className="mobile-data-line"><span>Результат</span><strong>{enabled?'Продукты':'Без категории'}</strong></div></div><label className="coverage-toggle"><span><strong>Правило включено</strong><small>Ручной выбор категории имеет приоритет</small></span><input type="checkbox" checked={enabled} onChange={event=>setEnabled(event.target.checked)} /></label><Notice>Правило не меняет сумму и индивидуальный курс. Изменения старых записей требуют предпросмотра.</Notice><Links items={[["Предпросмотр истории",'bulk-preview'],['К списку правил','rules']]} /></>;
}
export const coverageViews = {'split-method':SplitMethodFlow,'review-queue':ReviewQueueFlow,'review-detail':ReviewDetailFlow,'trip-invite':TripInviteFlow,'trip-unallocated':TripUnallocatedFlow,'trip-close':TripCloseFlow,'rule-explain':RuleExplainFlow};
