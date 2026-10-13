import React from 'react';
import { scenarios, screenMap } from '../data/screens.js';
import { Button, Card, PageIntro, screenHref } from '../components/ui.jsx';

export default function Scenarios() { return <><PageIntro eyebrow="07 / Flows" title="Маршруты приложения." description={`${scenarios.length} сквозных маршрутов связывают основной поток и модули приложения. Каждый шаг открывает экран.`} /><div className="scenario-grid">{scenarios.map((scenario, index) => <Card className="scenario-card" key={scenario.title}><span className="eyebrow">Маршрут / {String(index + 1).padStart(2, '0')}</span><h2>{scenario.title}</h2><p>{scenario.description}</p><ol>{scenario.ids.map((id, step) => <li key={`${id}-${step}`}><a href={screenHref(id)}><span>{step + 1}</span>{screenMap.get(id).title}</a></li>)}</ol><Button href={screenHref(scenario.ids[0])} icon="↗">Начать сценарий</Button></Card>)}</div></>; }
