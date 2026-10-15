import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Brandbook from './pages/Brandbook.jsx';
import Kit from './pages/Kit.jsx';
import Screens from './pages/Screens.jsx';
import Scenarios from './pages/Scenarios.jsx';
import Docs from './pages/Docs.jsx';
import { retiredIds, screenMap, screens, scenarios } from './data/screens.js';
import { BrandMark, OverlayFocus } from './components/ui.jsx';

const tabs = [['brandbook', 'Brandbook'], ['kit', 'UI Kit'], ['screens', 'Экраны'], ['scenarios', 'Сценарии'], ['docs', 'Документация']];
const docAnchors = new Set(['source', 'architecture', 'rules', 'clickability', 'limits', 'docker']);
const desktopScreen = hash => {
  const id = hash === 'desktop' ? '' : hash.replace(/^desktop\//, '');
  const aliases = { journal: 'base-journal', accounts: 'base-accounts', reports: 'reports', budget: 'budget', debts: 'debts', deposits: 'deposits', loans: 'loans', catalog: 'base-accounts' };
  const target = (id.startsWith('screen/') ? id.slice(7) : aliases[id] || id || 'base-accounts').split('?')[0];
  return `screens/${screenMap.has(target) ? target : 'base-accounts'}?device=desktop`;
};
const readRoute = () => {
  const hash = decodeURIComponent(window.location.hash.slice(1) || 'brandbook');
  if (hash === 'desktop' || hash.startsWith('desktop/')) {
    const next = desktopScreen(hash);
    window.location.replace(`#${next}`);
    return next;
  }
  return docAnchors.has(hash) ? `docs/${hash}` : hash;
};

export default function App() {
  const [route, setRoute] = useState(readRoute);
  const routeRef = useRef(route);
  const headerRef = useRef(null);
  useLayoutEffect(() => {
    const bar = headerRef.current;
    if (!bar) return undefined;
    const apply = () => document.documentElement.style.setProperty('--site-header-height', `${bar.getBoundingClientRect().height}px`);
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const onHashChange = () => {
      const next = readRoute();
      if (routeRef.current.split('/')[0] !== next.split('/')[0]) window.scrollTo({ top: 0, behavior: 'instant' });
      routeRef.current = next;
      setRoute(next);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  const [section, ...routeParts] = route.split('/');
  const id = routeParts.join('/').split('?')[0];
  const active = tabs.some(([key]) => key === section) ? section : 'brandbook';
  useEffect(() => { document.title = `So1 Money — ${tabs.find(([key]) => key === active)?.[1] || 'Дизайн-система'}`; }, [active]);
  return <div className="app-shell"><OverlayFocus /><a className="skip-link" href="#main">К содержимому</a><div className="site-header-bar" ref={headerRef}><header className="site-header"><a className="brand" href="#brandbook"><BrandMark /><span>So1 Money<small>Design system</small></span></a><nav className="site-nav" aria-label="Разделы дизайна">{tabs.map(([key, label]) => <a href={`#${key}`} key={key} className={active === key ? 'active' : ''} aria-current={active === key ? 'page' : undefined}>{label}</a>)}</nav><div className="header-meta">Одно приложение на всех экранах<br />{screens.length - retiredIds.length} в приложении · {retiredIds.length} сняты · {scenarios.length} сценариев</div></header></div><main className="page" id="main" tabIndex={-1}>{active === 'brandbook' && <Brandbook />}{active === 'kit' && <Kit />}{active === 'screens' && <Screens selectedId={id} />}{active === 'scenarios' && <Scenarios />}{active === 'docs' && <Docs anchor={id} />}</main></div>;
}
