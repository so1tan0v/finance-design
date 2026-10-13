import React from 'react';
import { EntryFlow, ReportsFlow } from '../components/FinanceFlows.jsx';
import { Icon } from '../components/ui.jsx';
import './desktop-shared-flows.css';

const desktopHref = id => id === 'base-journal' ? '#desktop/journal' : `#desktop/screen/${id}`;

export function DesktopEntry({ initialKind = 'Расход' }) {
  return <div className={`desktop-entry-layout desktop-flow ${initialKind === 'Перевод' ? 'desktop-entry-layout--transfer' : ''}`}><section className="desktop-entry-card"><EntryFlow initialKind={initialKind} href={desktopHref} /></section><aside className="desktop-flow-aside"><small>НОВАЯ ЗАПИСЬ</small><h3>Всё в одной форме</h3><p>Расход, доход и перевод используют те же поля и проверки, что и в мобильной версии.</p><div className="desktop-flow-aside-links"><a href="#desktop/screen/receipt"><Icon name="camera" size={17} />Фото чека</a><a href="#desktop/screen/qr-receipt"><Icon name="qr" size={17} />QR чека</a><a href="#desktop/journal"><Icon name="list" size={17} />К журналу</a></div><div className="desktop-flow-tip"><Icon name="plus" size={17} /><span>Нажмите на сумму, чтобы открыть калькулятор. В нём доступны арифметика и клавиша «000».</span></div></aside></div>;
}

export function DesktopReports() {
  return <div className="desktop-report-layout desktop-flow"><section className="desktop-reports-card"><ReportsFlow href={desktopHref} /></section><aside className="desktop-flow-aside"><small>ОТЧЁТЫ</small><h3>Из диаграммы в журнал</h3><p>Выберите категорию на круговой диаграмме или в списке, чтобы открыть её операции.</p><div className="desktop-flow-aside-links"><a href="#desktop/journal"><Icon name="list" size={17} />Журнал</a><a href="#desktop/budget"><Icon name="budget" size={17} />Бюджет</a><a href="#desktop/screen/export-data"><Icon name="down" size={17} />Экспорт</a></div></aside></div>;
}
