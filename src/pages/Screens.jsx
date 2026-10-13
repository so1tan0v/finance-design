import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { groups, screenMap, screens } from '../data/screens.js';
import Phone from '../components/Phone.jsx';
import { Icon, screenHref } from '../components/ui.jsx';

const coreIds = groups[0].ids;
const navigate = id => { window.location.hash = screenHref(id); };

export default function Screens({ selectedId }) {
  const selected = screenMap.get(selectedId?.split('?')[0]) || screenMap.get('base-accounts');
  const index = screens.findIndex(screen => screen.id === selected.id);
  const [scale, setScale] = useState(1);
  const [fullscreen, setFullscreen] = useState(true);
  const [fitToViewport, setFitToViewport] = useState(false);
  const [finderOpen, setFinderOpen] = useState(false);
  const [finderQuery, setFinderQuery] = useState('');
  const stageRef = useRef(null);

  useLayoutEffect(() => {
    const update = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const headerHeight = document.querySelector('.site-header-bar')?.getBoundingClientRect().height ?? 0;
      document.documentElement.style.setProperty('--site-header-height', `${headerHeight}px`);
      const rect = stage.getBoundingClientRect();
      const width = Math.max(100, rect.width - 38);
      const chrome = [...stage.querySelectorAll('.screen-switch,.screen-stage-toolbar,.stage-help')].reduce((sum, node) => sum + node.getBoundingClientRect().height, 0) + 30;
      const offset = fullscreen ? headerHeight : Math.max(0, rect.top);
      const height = Math.max(180, window.innerHeight - offset - chrome);
      setScale(fitToViewport ? Math.min(1, width / 390, height / 844) : 1);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(stageRef.current);
    const header = document.querySelector('.site-header-bar');
    if (header) observer.observe(header);
    window.addEventListener('resize', update);
    return () => { observer.disconnect(); window.removeEventListener('resize', update); };
  }, [fullscreen, fitToViewport]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = fullscreen ? 'hidden' : previous;
    return () => { document.body.style.overflow = previous; };
  }, [fullscreen]);

  useEffect(() => {
    const keydown = event => {
      if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName) || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowLeft' && index > 0) navigate(screens[index - 1].id);
      if (event.key === 'ArrowRight' && index < screens.length - 1) navigate(screens[index + 1].id);
      if (event.key === '/' && !finderOpen) { event.preventDefault(); setFinderOpen(true); }
      if (event.key === 'Escape') { if (finderOpen) setFinderOpen(false); else setFullscreen(false); }
    };
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  }, [index, finderOpen]);

  return <div className="screens-page">
    <div className="screens-intro"><div><p className="eyebrow">SO1 MONEY</p><h1>Экраны приложения</h1><p>Мобильный кадр · светлая тема · {screens.length} состояния</p></div><a href="#scenarios">Сценарии <Icon name="arrow" size={17} /></a></div>
    <div className={`screen-stage ${fullscreen ? 'fullscreen' : ''} ${fitToViewport ? 'fit-to-viewport' : 'actual-size'}`} ref={stageRef}>
      <nav className="screen-switch" aria-label="Быстрый выбор экрана">{coreIds.map(id => <a key={id} href={screenHref(id)} className={selected.id === id ? 'active' : ''} aria-current={selected.id === id ? 'page' : undefined}>{screenMap.get(id).title}</a>)}</nav>
      <div className="screen-stage-toolbar"><div className="screen-stage-title"><small>{String(index + 1).padStart(3,'0')} / {screens.length} · {selected.figmaNode ? `Figma ${selected.figmaNode}` : groups[0].ids.includes(selected.id) ? 'Основной поток' : 'ФТ / ТЗ'}</small><strong>{selected.title}</strong></div><div className="screen-stage-controls"><button type="button" onClick={() => navigate(screens[index - 1]?.id)} disabled={index === 0} aria-label="Предыдущий экран"><Icon name="back" size={18} /></button><button type="button" onClick={() => navigate(screens[index + 1]?.id)} disabled={index === screens.length - 1} aria-label="Следующий экран"><Icon name="arrow" size={18} /></button><button type="button" onClick={() => { setFinderOpen(value => !value); setFinderQuery(''); }} aria-label="Найти экран"><Icon name="search" size={18} /></button><select aria-label="Все экраны" value={selected.id} onChange={event => navigate(event.target.value)}>{groups.map(group => <optgroup key={group.title} label={group.title}>{group.ids.map(id => <option key={id} value={id}>{screenMap.get(id).title}</option>)}</optgroup>)}</select><button type="button" onClick={() => setFitToViewport(value => !value)} aria-pressed={fitToViewport}>{fitToViewport ? 'Размер 100%' : 'Вписать телефон'}</button><a className="screen-back-to-kit" href="#kit">UI Kit</a><button type="button" className="expand-button" onClick={() => setFullscreen(value => !value)}>{fullscreen ? 'К разделам' : 'Развернуть'}</button></div></div>
      {finderOpen && <div className="screen-finder"><input autoFocus type="search" value={finderQuery} onChange={event => setFinderQuery(event.target.value)} placeholder="Название экрана или раздела" aria-label="Поиск экрана" /><div>{screens.filter(item => `${item.title} ${item.subtitle} ${item.trace || ''}`.toLowerCase().includes(finderQuery.toLowerCase())).slice(0, 12).map(item => <button type="button" key={item.id} onClick={() => { navigate(item.id); setFinderOpen(false); }}>{item.title}<small>{item.subtitle}</small></button>)}</div></div>}
      <div className="phone-frame" style={{ width: 390 * scale, height: 844 * scale }}><div style={{ width:390, height:844, transform:`scale(${scale})`, transformOrigin:'top left' }}><Phone screen={selected} /></div></div>
      <p className="stage-help">Телефон показан в размере 100%. Прокручивайте область просмотра; при необходимости нажмите «Вписать телефон».</p>
    </div>
  </div>;
}
