import React, { useState } from 'react';
import { groups, screenMap, screens } from '../data/screens.js';
import { Icon } from '../components/ui.jsx';

export default function DesktopCatalog() {
  const [query, setQuery] = useState('');
  const needle = query.trim().toLocaleLowerCase('ru');
  const visible = groups.map(group => ({ ...group, ids: group.ids.filter(id => {
    const screen = screenMap.get(id);
    return screen && (!needle || `${screen.title} ${screen.subtitle} ${id}`.toLocaleLowerCase('ru').includes(needle));
  }) })).filter(group => group.ids.length);
  const count = visible.reduce((sum, group) => sum + group.ids.length, 0);
  return <section className="desktop-catalog"><div className="desktop-catalog-head"><span className="desktop-catalog-icon"><Icon name="list" size={24} /></span><div><small>ЛИЧНАЯ КНИГА / ВСЕ ФУНКЦИИ</small><h2>Все функции</h2><p>Разделы и состояния мобильного концепта в настольном окне.</p></div></div><label className="desktop-catalog-search"><Icon name="search" size={17} /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Найти функцию или экран" aria-label="Найти функцию или экран" /><span>{count} из {screens.length}</span></label><div className="desktop-catalog-groups">{visible.map((group, index) => <details key={`${group.title}-${needle ? 'search' : 'all'}`} open={Boolean(needle) || index === 0}><summary><span>{group.title}</span><small>{group.ids.length}</small><Icon name="chevron" size={16} /></summary><div>{group.ids.map(id => <a key={id} href={`#desktop/screen/${id}`}><span>{screenMap.get(id).title}</span><Icon name="chevron" size={15} /></a>)}</div></details>)}{!visible.length && <p className="desktop-catalog-empty">По запросу ничего не найдено.</p>}</div></section>;
}
