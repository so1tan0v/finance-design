import { readFileSync } from 'node:fs';
import { screens, screenMap, groups, scenarios } from '../src/data/screens.js';

const assert = (condition, message) => { if (!condition) throw new Error(message); };
assert(screens.length === 55, `Ожидалось 55 экранов, получено ${screens.length}`);
assert(screenMap.size === screens.length, 'Повторяющиеся ID экранов');
assert(screens.filter(screen => screen.figmaNode).length === 45, 'Потеряна связь с 45 кадрами Figma');
for (const screen of screens) for (const item of screen.elements) if (item.type === 'action') assert(screenMap.has(item.target), `${screen.id} → ${item.target}: целевой экран отсутствует`);
for (const group of groups) for (const id of group.ids) assert(screenMap.has(id), `Нет экрана ${id} в группе`);
for (const scenario of scenarios) for (const id of scenario.ids) assert(screenMap.has(id), `Нет экрана ${id} в сценарии`);
const allGrouped = groups.flatMap(group => group.ids);
assert(new Set(allGrouped).size === screens.length && allGrouped.length === screens.length, 'Список экранов неполон или содержит повторы');
const dockerfile = readFileSync(new URL('../Dockerfile', import.meta.url), 'utf8');
assert(dockerfile.includes('npm ci') && dockerfile.includes('npm run build'), 'Dockerfile должен собирать приложение');
console.log(JSON.stringify({ screens: screens.length, figmaScreens: 45, actions: screens.flatMap(screen => screen.elements).filter(item => item.type === 'action').length, scenarios: scenarios.length, groups: groups.length, status: 'passed' }));
