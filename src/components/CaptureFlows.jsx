import React, { useEffect, useState } from 'react';
import { Button, Icon, Notice, screenHref } from './ui.jsx';

function ImagePicker({ onSelect }) {
  return <label className="capture-picker"><Icon name="camera" size={25} /><strong>Открыть камеру или выбрать изображение</strong><span>На телефоне можно сделать снимок. В браузере откроется выбор файла.</span><input type="file" accept="image/*" capture="environment" onChange={event => onSelect(event.target.files?.[0] || null)} /></label>;
}
function Preview({ file }) {
  const [url,setUrl] = useState('');
  useEffect(() => {
    if (!file) { setUrl(''); return undefined; }
    const next=URL.createObjectURL(file); setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url ? <div className="capture-preview"><img src={url} alt="Выбранное изображение чека" /><small>{file.name}</small></div> : null;
}
function Head({ title, subtitle }) { return <div className="coverage-head"><a href={screenHref('base-expense')} aria-label="Вернуться к операции">←</a><div><small>{subtitle}</small><h2>{title}</h2></div></div>; }
export function ReceiptCaptureFlow() {
  const [file,setFile] = useState(null);
  return <><Head title="Фото чека" subtitle="Перед сохранением" /><p className="mobile-hint">Сделайте снимок чека или выберите готовое изображение, затем проверьте сумму и позиции.</p><ImagePicker onSelect={setFile} /><Preview file={file} /><Notice tone={file?'success':'warning'}>{file?'Изображение выбрано. Проверьте сумму и позиции перед сохранением.':'Фото пока не выбрано. Можно продолжить ручной ввод.'}</Notice><p className="flow-caption">Распознанные поля нужно подтвердить. Если сумма неверная, введите операцию вручную.</p><div className="mobile-actions"><Button href={screenHref('receipt-items')} className="mobile-action" disabled={!file}>Проверить позиции</Button><Button href={screenHref('qr-receipt')} variant="secondary" className="mobile-action">Есть QR на чеке</Button><Button href={screenHref('base-expense')} variant="secondary" className="mobile-action">Ввести вручную</Button></div></>;
}
export function QrCaptureFlow() {
  const [file,setFile] = useState(null),[code,setCode] = useState('');
  return <><Head title="QR чека" subtitle="Фискальный чек" /><p className="mobile-hint">Выберите снимок QR или вставьте код. Получение фискального чека из источника — отдельный шаг.</p><ImagePicker onSelect={setFile} /><Preview file={file} /><label className="capture-code">Код QR<input value={code} onChange={event=>setCode(event.target.value)} placeholder="Вставить текст QR" /></label><div className="mobile-form-card"><div className="mobile-data-line"><span>QR</span><strong>{code || file ? 'Прочитан' : 'Не выбран'}</strong></div><div className="mobile-data-line"><span>Фискальный чек</span><strong>{code || file ? 'Ожидает получения' : 'Не запрашивался'}</strong></div></div><Notice tone="warning">Если источник чека недоступен, операцию можно ввести вручную.</Notice><div className="mobile-actions"><Button href={screenHref('receipt-items')} className="mobile-action" disabled={!(code || file)}>Показать чек</Button><Button href={screenHref('base-expense')} variant="secondary" className="mobile-action">Ввести вручную</Button></div></>;
}
export const captureViews = {receipt:ReceiptCaptureFlow,'qr-receipt':QrCaptureFlow};
