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
  return <><Head title="Фото чека" subtitle="INPUT-03/04 · FISC-01/04" /><p className="mobile-hint">Сделайте снимок чека или выберите готовое изображение, затем проверьте сумму и позиции.</p><ImagePicker onSelect={setFile} /><Preview file={file} /><Notice tone={file?'success':'warning'}>{file?'Изображение выбрано. Ниже можно открыть демонстрационный предпросмотр распознанных полей.':'Фото пока не выбрано. Можно продолжить ручной ввод.'}</Notice><p className="flow-caption">В этом UI-концепте OCR не подключён: следующий экран содержит пример распознанного чека, а не данные выбранного файла.</p><div className="mobile-actions"><Button href={screenHref('receipt-items')} className="mobile-action" disabled={!file}>Проверить пример позиций</Button><Button href={screenHref('qr-receipt')} variant="secondary" className="mobile-action">Есть QR на чеке</Button><Button href={screenHref('base-expense')} variant="secondary" className="mobile-action">Ввести вручную</Button></div></>;
}
export function QrCaptureFlow() {
  const [file,setFile] = useState(null),[code,setCode] = useState(''),[demo,setDemo] = useState(false);
  return <><Head title="QR чека" subtitle="REG-01 · FISC-01/04" /><p className="mobile-hint">Выберите снимок QR или вставьте код. Получение фискального чека из источника — отдельный шаг.</p><ImagePicker onSelect={setFile} /><Preview file={file} /><label className="capture-code">Код QR<input value={code} onChange={event=>{setCode(event.target.value);setDemo(false);}} placeholder="Вставить текст QR" /></label><button type="button" className="flow-secondary capture-demo" onClick={()=>setDemo(true)}>Показать демонстрационный результат</button><div className="mobile-form-card"><div className="mobile-data-line"><span>QR</span><strong>{demo?'Прочитан · пример':code?'Введён вручную':file?'Изображение выбрано':'Не выбран'}</strong></div><div className="mobile-data-line"><span>Фискальный чек</span><strong>{demo?'Ожидает получения':'Не запрашивался'}</strong></div></div><Notice tone="warning">Камера и декодирование QR, как и получение чека из источника, не подключены в этом концепте. Недоступный чек не блокирует ручной ввод.</Notice><div className="mobile-actions"><Button href={screenHref('receipt-items')} className="mobile-action" disabled={!demo}>Проверить пример чека</Button><Button href={screenHref('base-expense')} variant="secondary" className="mobile-action">Ввести вручную</Button></div></>;
}
export const captureViews = {receipt:ReceiptCaptureFlow,'qr-receipt':QrCaptureFlow};
