import React, { useEffect } from 'react';
import { BrandMark, Button, Icon } from '../components/ui.jsx';
import { screenMap, screens } from '../data/screens.js';
import { desktopExtras } from './DesktopExtras.jsx';
import DesktopWorkspace from './DesktopWorkspace.jsx';
import DesktopCatalog from './DesktopCatalog.jsx';
import { DesktopEntry, DesktopReports } from './DesktopSharedFlows.jsx';
import './desktop-parity.css';

const areas = [
  {id:'journal',title:'Журнал',lead:'Операции за выбранный период.',metric:'−31 250 ₽',metricLabel:'Расходы октября',columns:['Дата','Операция','Счёт','Категория','Сумма'],rows:[['13.10','Продукты · Пятёрочка','Наличные','Продукты','−1 240 ₽'],['13.10','Перевод на карту','Наличные → Банк','Перевод','3 000 ₽'],['13.10','Возврат долга · Анна','Наличные','Долг','+200 ₽'],['12.10','Зарплата','Банковский счёт','Доход','+70 000 ₽'],['12.10','Кафе','Наличные','Кафе','−450 ₽'],['11.10','Такси','Наличные','Транспорт','−320 ₽'],['11.10','Перевод на наличные','Банк → Наличные','Перевод','5 000 ₽'],['10.10','Аренда','Банковский счёт','Жильё','−30 000 ₽'],['10.10','Возврат Тимуру','Наличные','Долг','−1 500 ₽'],['09.10','Продукты · Пятёрочка','Наличные','Продукты','−500 ₽'],['09.10','Подработка','Наличные','Доход','+2 000 ₽'],['08.10','Долг · Анна','Наличные','Долг','−800 ₽'],['08.10','Коммунальные','Банковский счёт','Жильё','−1 850 ₽']],detail:'Откройте фильтры, разделите покупку или посмотрите историю изменений.',links:[['Фильтры', 'journal-filters'],['Разделить покупку','op-split'],['История правок','change-history']]},
  {id:'accounts',title:'Счета и сверка',lead:'Остатки и сверка по каждому счёту.',metric:'122 500 ₽',metricLabel:'Общий итог в RUB',columns:['Счёт','Валюта','Фактически','В пути','Сверка'],rows:[['Основная карта','RUB','82 500 ₽','−1 200 ₽','12.10'],['Наличные','RUB','10 000 ₽','—','13.10'],['Visa TBS','EUR','300 €','—','10.10']],detail:'Сверьте остатки и проверьте курсы пересчёта.',links:[['Сверка','reconcile'],['Курсы','rates'],['Активы','net-worth']]},
  {id:'budget',title:'Бюджет',lead:'Лимиты, фактические расходы и пороги за октябрь.',metric:'18 750 ₽',metricLabel:'Осталось в общем бюджете',columns:[],rows:[['Общий бюджет','31 250 ₽','50 000 ₽',63,'Все категории · RUB'],['Продукты','12 400 ₽','22 500 ₽',55,'Категория · RUB'],['Поездка','5 600 ₽','15 000 ₽',37,'Проект · RUB']],detail:'Бюджеты независимы. В расход попадают только операции с признаком «В бюджет».',links:[['Настроить бюджет','budget-edit-full'],['Порог уведомления','budget-threshold'],['Категории','category'],['Отчёт','@reports']]},
  {id:'planning',title:'Планы',lead:'Ближайшие платежи и состояние бюджета.',metric:'18 750 ₽',metricLabel:'Остаток бюджета',columns:['Дата','Событие','Тип','Сумма','Статус'],rows:[['20.10','Музыка','Подписка','−399 ₽','План'],['24.10','Облако','Подписка','−199 ₽','План'],['01.11','Аренда','Обязательство','−30 000 ₽','Ожидается']],detail:'Планы и фактические операции учитываются отдельно.',links:[['Бюджет','@budget'],['Прогноз','forecast'],['Цели','goals']]},
  {id:'together',title:'Совместные расходы',lead:'Покупки и расчёты с участниками.',metric:'1 200 ₽',metricLabel:'Мне должны',columns:['Участник','Покупка','Доля','Возвращено','Остаток'],rows:[['Алексей','Продукты','750 ₽','350 ₽','400 ₽'],['Мария','Такси','500 ₽','0 ₽','500 ₽'],['Я','Продукты','1 200 ₽','—','—']],detail:'Проверьте доли и доступ участников к покупке.',links:[['Общая покупка','trip-expense'],['Роли','trip-roles'],['Ссылка','share-link']]},
  {id:'debts',title:'Долги',lead:'Кто кому должен и когда вернуть.',metric:'1 200 $',metricLabel:'Мне должны',columns:['Человек','Направление','Остаток','Следующий срок','Статус'],rows:[['Алексей','Мне должны','1 200 $','20.10','Открыт'],['Мария','Я должен','500 $','20.11','Открыт']],detail:'Возвраты и частичные платежи сохраняются в истории.',links:[['Карточка долга','debt-detail'],['График','debt-schedule'],['Возврат','debt-repay']]},
  {id:'deposits',title:'Вклады',lead:'Ставки, начисления и ближайшие выплаты.',metric:'125 600 ₽',metricLabel:'Оценка портфеля',columns:['Вклад','Ставка','Начислено','Выплачено','Следующая дата'],rows:[['Накопительный','14%','1 200 ₽','0 ₽','01.11'],['Срочный','12%','2 400 ₽','800 ₽','15.11']],detail:'Начисления и денежные выплаты показаны отдельно.',links:[['Карточка вклада','deposit-detail'],['График выплат','deposit-payout'],['Сравнение','deposit-compare']]},
  {id:'loans',title:'Кредиты',lead:'Платежи и остаток основного долга.',metric:'480 000 ₽',metricLabel:'Остаток основного долга',columns:['Кредит','Платёж','Основной долг','Проценты','Срок'],rows:[['Автокредит','24 500 ₽','18 100 ₽','6 400 ₽','20.10'],['Потребительский','9 800 ₽','7 300 ₽','2 500 ₽','05.11']],detail:'Смотрите график и расчёт досрочного погашения.',links:[['Калькулятор','loan-calc'],['График','loan-schedule'],['Досрочно','loan-extra']]},
  {id:'reports',title:'Отчёты',lead:'На что ушли деньги в октябре.',metric:'31 250 ₽',metricLabel:'Расходы по выбранному фильтру',columns:['Категория','Операций','Расход','Доля','Открыть'],rows:[['Продукты','18','12 400 ₽','40%','Строки'],['Транспорт','9','5 200 ₽','17%','Строки'],['Кафе','12','4 100 ₽','13%','Строки']],detail:'Фильтры применяются к графику и экспорту.',links:[['Фильтры','journal-filters'],['Категории','pie'],['Экспорт','export-data']]},
  {id:'data',title:'Проверка и данные',lead:'Импорт, чеки и локальная копия.',metric:'4',metricLabel:'Строки требуют проверки',columns:['Источник','Записей','Совпадений','Ошибок','Состояние'],rows:[['Выписка CSV','148','4','2','Предпросмотр'],['Чек QR','7','0','1','Уточнить'],['Локальная копия','256','—','0','Проверена']],detail:'Проверьте ошибки и совпадения перед импортом.',links:[['Импорт','import-preview'],['Дубликаты','duplicate-review'],['Восстановление','restore'],['Устройства','sync']]},
];
const map = new Map(areas.map(area => [area.id, area]));
const screenParents = new Map([
  ...['budget','budgets','budgetedit','budget-edit-full','budget-threshold','thresholds','alert'].map(id => [id, 'budget']),
  ...['calendar','forecast-day','forecast'].map(id => [id, 'planning']),
  ...['reports','pie'].map(id => [id, 'reports']),
]);
const navGroups = [
  { label: 'УЧЁТ', items: [['journal', 'Журнал', 'list'], ['accounts', 'Счета и сверка', 'wallet'], ['screen/base-transfer', 'Перевод', 'transfer']] },
  { label: 'ПЛАНИРОВАНИЕ', items: [['budget', 'Бюджет', 'budget'], ['planning', 'Календарь и прогноз', 'calendar'], ['screen/goals', 'Цели и резервы', 'star'], ['screen/subscriptions', 'Подписки', 'clock']] },
  { label: 'СОВМЕСТНО', items: [['together', 'Совместные расходы', 'person'], ['debts', 'Долги', 'transfer']] },
  { label: 'ПРОДУКТЫ', items: [['deposits', 'Вклады', 'bank'], ['loans', 'Кредиты', 'car'], ['screen/assets', 'Активы', 'chart']] },
  { label: 'АНАЛИЗ', items: [['reports', 'Отчёты', 'chart'], ['data', 'Проверка и данные', 'shield']] },
  { label: 'СПРАВОЧНИКИ', items: [['screen/directories', 'Категории и люди', 'tag'], ['screen/projects', 'Проекты', 'briefcase'], ['screen/rules', 'Правила и шаблоны', 'bolt']] },
  { label: 'ВВОД И ДАННЫЕ', items: [['screen/receipt', 'Фото чека', 'camera'], ['screen/qr-receipt', 'QR чека', 'qr'], ['screen/import-file', 'Импорт', 'down'], ['screen/export-data', 'Экспорт', 'arrow']] },
  { label: 'НАСТРОЙКИ', items: [['screen/books', 'Книги учёта', 'wallet'], ['screen/backup', 'Резервная копия', 'shield'], ['screen/sync', 'Синхронизация', 'transfer'], ['screen/base-settings', 'Все настройки', 'settings']] },
  { label: 'НА УСТРОЙСТВЕ', items: [['portable', 'Переносимая книга', 'down'], ['reminder', 'Напоминание', 'clock'], ['shortcuts', 'Горячие клавиши', 'bolt'], ['image', 'Передать изображение', 'camera']] },
];
const desktopHref = id => `#desktop/screen/${id}`;
function DesktopScreen({ screen, parent }) {
  const fields = screen.elements.filter(item => item.type === 'input');
  const notes = screen.elements.filter(item => item.type === 'text');
  const actions = screen.elements.filter(item => item.type === 'action');
  return <div className="desktop-specific"><div className="desktop-specific-head"><a href={parent ? `#desktop/${parent}` : '#desktop/catalog'}>← {parent ? 'К разделу' : 'Все функции'}</a><small>{screen.subtitle}</small></div><h3>{screen.title}</h3><div className="desktop-specific-grid"><section className="desktop-specific-fields">{fields.length ? fields.map((item,index) => <div key={index}><span>{item.value}</span><strong>{item.target || 'Выбрать'}</strong></div>) : <p>Поля для этого состояния не предусмотрены.</p>}</section><aside className="desktop-detail"><small>ПОЯСНЕНИЯ И ДЕЙСТВИЯ</small>{notes.map((item,index) => <p key={index}>{item.value}</p>)}<div>{actions.map((item,index) => <a key={index} href={desktopHref(item.target)}>{item.value}<span>↗</span></a>)}</div><a href={`#screens/${screen.id}`}>Мобильное состояние <span>↗</span></a></aside></div><p className="desktop-footnote">Суммы и статусы относятся к выбранной книге.</p></div>;
}

export default function Desktop({ selectedId }) {
  const screen = selectedId?.startsWith('screen/') ? screenMap.get(selectedId.slice(7)) : null;
  const Extra = desktopExtras[selectedId];
  useEffect(() => {
    const onKey = event => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(event.target?.tagName || '')) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'n') { event.preventDefault(); window.location.hash = desktopHref('base-expense'); }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); window.location.hash = desktopHref('review-queue'); }
      if (event.key === 'Escape') window.location.hash = '#desktop/journal';
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const area = map.get(selectedId) || areas[0];
  const activeNav = selectedId === 'catalog' ? 'catalog' : Extra ? selectedId : screen ? screenParents.get(screen.id) || selectedId : area.id;
  const areaIcon = navGroups.flatMap(group => group.items).find(([id]) => id === area.id)?.[2] || 'list';
  return <>
    <div className="desktop-concept-intro"><span>SO1 MONEY</span><h1>Настольное приложение</h1><p>Личная книга на большом экране.</p></div>
    <div className="desktop-frame" aria-label={`So1 Money: ${selectedId === 'catalog' ? 'Все функции' : Extra ? selectedId : screen ? screen.title : area.title}`}>
      <div className="desktop-windowbar"><div className="desktop-window-dots" aria-hidden="true"><i /><i /><i /></div><span>So1 Money <b>›</b> Личная книга</span><div className="desktop-window-tools"><Icon name="search" size={15} /><kbd>⌘ K</kbd></div></div>
      <aside className="desktop-sidebar"><div className="desktop-logo"><BrandMark size={31} /><span>So1 Money<small>Личная книга</small></span></div><div className="desktop-book"><Icon name="wallet" size={17} /><span>Личные финансы</span><Icon name="chevron" size={14} /></div><a className={`desktop-library-link ${activeNav === 'catalog' ? 'active' : ''}`} href="#desktop/catalog"><Icon name="list" size={17} /><span>Все функции</span><small>{screens.length}</small></a><nav aria-label="Разделы настольного приложения">{navGroups.map(group => <div className="desktop-nav-group" key={group.label}><span className="desktop-nav-label">{group.label}</span>{group.items.map(([id, title, icon]) => <a key={id} href={`#desktop/${id}`} className={activeNav === id ? 'active' : ''} aria-current={activeNav === id ? 'page' : undefined}><Icon name={icon} size={17} /><span>{title}</span></a>)}</div>)}</nav><div className="desktop-sync"><span className="desktop-sync-dot" /><span><strong>На устройстве</strong><small>Синхронизировано сегодня, 13:14</small></span></div></aside>
      <div className="desktop-main">{selectedId === 'catalog' ? <DesktopCatalog /> : Extra ? <Extra /> : screen && ['base-expense','base-transfer'].includes(screen.id) ? <DesktopEntry key={screen.id} initialKind={screen.id === 'base-transfer' ? 'Перевод' : 'Расход'} /> : (screen && ['reports','pie'].includes(screen.id)) || (!screen && selectedId === 'reports') ? <DesktopReports /> : screen ? <DesktopScreen screen={screen} parent={screenParents.get(screen.id)} /> : <><header className="desktop-header"><div className="desktop-title-block"><span className={`desktop-title-icon desktop-title-icon--${area.id}`}><Icon name={areaIcon} size={23} /></span><div><small>Личная книга <span>›</span> {area.title}</small><h2>{area.title}</h2></div></div><Button href={desktopHref('base-expense')}>+ Новая операция</Button></header><div className="desktop-toolbar"><span className="desktop-toolbar-scope">{area.id === 'journal' || area.id === 'reports' ? 'Октябрь 2026' : 'Обзор · октябрь 2026'}</span><span className="desktop-toolbar-separator" />{area.id === 'journal' || area.id === 'reports' ? <><span>Все счета</span><span>Все валюты</span><a href={desktopHref('journal-filters')}>Фильтры <Icon name="chevron" size={14} /></a></> : <span>{area.rows.length} {area.id === 'planning' ? 'события' : area.id === 'budget' ? 'бюджета' : 'записи'}</span>}</div><DesktopWorkspace area={area} /><p className="desktop-footnote">История хранится на этом компьютере.</p></>}</div>
    </div>
  </>;
}
