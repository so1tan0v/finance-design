import React, { useId, useState } from 'react';

export const screenHref = id => `#screens/${id}`;

const iconPaths = {
  camera:'M3 7h4l2-3h6l2 3h4v13H3zM12 10a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  qr:'M3 3h7v7H3zM5.5 5.5h2v2h-2zM14 3h7v7h-7zM16.5 5.5h2v2h-2zM3 14h7v7H3zM5.5 16.5h2v2h-2zM14 14h2v2h-2zM19 14h2v2h-2zM14 19h2v2h-2zM17 17h2v2h-2zM20 19h1v2h-1z',
  wallet:'M4 7h14a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h13v2M16 11h6v5h-6zM18 13.5h.1',
  bank:'M3 9h18M5 9v10M10 9v10M15 9v10M20 9v10M2 20h20M12 3l10 5H2z',
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
export function Icon({ name, size = 22, className = '' }) { return <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={iconPaths[name] || iconPaths.wallet} /></svg>; }

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

export function AccountTile({ title, subtitle, amount, href, kind = 'wallet' }) {
  return <a className="account-tile" href={href}><span className={`account-tile-icon ${kind === 'bank' ? 'bank' : ''}`}><Icon name={kind} /></span><span className="account-tile-copy"><strong>{title}</strong><small>{subtitle}</small></span><strong className="account-tile-amount">{amount}</strong></a>;
}

export function MobileFormField({ label, value, icon = 'note', type = 'text' }) {
  const id = useId(); const [current, setCurrent] = useState(value);
  return <div className="mobile-form-field"><Icon name={icon} size={20} /><div><label htmlFor={id}>{label}</label><input id={id} type={type} value={current} onChange={event => setCurrent(event.target.value)} /></div><Icon name="chevron" size={17} /></div>;
}
