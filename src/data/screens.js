import { figmaScreens } from './figma-screens.js';
import { fullScopeScreens, fullScopeGroups, fullScopeScenarios } from './full-scope.js';

// Основной поток дополняют состояния Figma и экраны полного объёма требований.
const base = [
  {id:'base-welcome',title:'Первый запуск',subtitle:'Начните с одного счёта. Регистрация для локального учёта не нужна.',elements:[{type:'input',value:'Название счёта',target:'Наличные'},{type:'input',value:'Валюта счёта',target:'USD'},{type:'input',value:'Начальный остаток',target:'10 000 $'},{type:'action',value:'Начать вести учёт',target:'base-accounts'}]},
  {id:'base-accounts',title:'Мои счета',subtitle:'Личная история',elements:[{type:'text',value:'Общий остаток: 11 500 ₽\nДоходы октября: +2 000 ₽\nРасходы октября: −500 ₽'},{type:'action',value:'Открыть счёт «Наличные»',target:'base-account'},{type:'action',value:'Новая операция',target:'base-expense'},{type:'action',value:'Перевод',target:'base-transfer'},{type:'action',value:'Журнал',target:'base-journal'}]},
  {id:'base-expense',title:'Новая операция',subtitle:'Расход · доход · перевод',elements:[{type:'input',value:'Сумма',target:'500 ₽'},{type:'input',value:'Счёт',target:'Наличные'},{type:'input',value:'Категория',target:'Продукты'},{type:'input',value:'Дата',target:'09.10.2026'},{type:'input',value:'Заметка',target:'Пятёрочка'},{type:'text',value:'Остаток после операции: 8 500 ₽'},{type:'input',value:'Валюта',target:'USD'},{type:'input',value:'Плательщик',target:'Я'},{type:'input',value:'Периодичность',target:'Не повторять'},{type:'input',value:'Распределить доли',target:'Выбрать людей из справочника и указать сумму каждого'},{type:'text',value:'Доли других участников автоматически создают записи в разделе «Долги».'},{type:'input',value:'В общий итог',target:'Да'},{type:'input',value:'В бюджет',target:'Да'},{type:'action',value:'Сохранить операцию',target:'base-journal'}]},
  {id:'base-journal',title:'Журнал',subtitle:'8–13 октября · все типы операций',elements:[{type:'text',value:'13 окт · Продукты −1 240 ₽, перевод 3 000 ₽, возврат долга +200 ₽\n12 окт · Зарплата +70 000 ₽, кафе −450 ₽\n11 окт · Такси −320 ₽, перевод 5 000 ₽\n10 окт · Аренда −30 000 ₽, возврат долга −1 500 ₽\n9 окт · Продукты −500 ₽, подработка +2 000 ₽\n8 окт · Выдача долга −800 ₽, коммунальные −1 850 ₽'},{type:'action',value:'Открыть операцию',target:'base-detail'},{type:'action',value:'Добавить расход',target:'base-expense'},{type:'action',value:'Счета',target:'base-accounts'},{type:'action',value:'Совместные расходы',target:'together'}]},
  {id:'base-transfer',title:'Перевод между счетами',subtitle:'Перевод не становится доходом или расходом',elements:[{type:'input',value:'Сумма',target:'3 000 ₽'},{type:'input',value:'Откуда',target:'Наличные'},{type:'input',value:'Куда',target:'Банковский счёт'},{type:'input',value:'Дата',target:'09.10.2026'},{type:'text',value:'Общий остаток не изменится: 11 500 ₽'},{type:'action',value:'Перевести',target:'base-detail'}]},
  {id:'base-detail',title:'Операция',subtitle:'Продукты · 09.10.2026',elements:[{type:'text',value:'Сумма: −500 ₽\nСчёт: Наличные\nДата: 09.10.2026\nЗаметка: Пятёрочка'},{type:'action',value:'Изменить',target:'base-expense'},{type:'action',value:'Отменить',target:'base-cancel'},{type:'action',value:'Журнал',target:'base-journal'}]},
  {id:'base-account',title:'Наличные',subtitle:'Остаток по учёту · RUB',elements:[{type:'text',value:'Фактический остаток: 8 500 ₽\nНачальный остаток: 10 000 ₽'},{type:'action',value:'Добавить расход',target:'base-expense'},{type:'action',value:'Перевести',target:'base-transfer'},{type:'action',value:'Счета',target:'base-accounts'}]},
  {id:'base-cancel',title:'Отмена операции',subtitle:'Запись останется в истории',elements:[{type:'text',value:'Сейчас на счёте: 8 500 ₽\nПосле отмены: 9 000 ₽\nИстория изменений сохранится.'},{type:'action',value:'Подтвердить отмену',target:'base-detail'},{type:'action',value:'Оставить как есть',target:'base-detail'}]},
  {id:'base-settings',title:'Настройки',subtitle:'Личная история и сохранность данных',elements:[{type:'action',value:'Валюты и курсы',target:'currencies'},{type:'action',value:'Категории',target:'category'},{type:'action',value:'Язык / Language',target:'language'},{type:'action',value:'Счета',target:'base-accounts'},{type:'action',value:'Совместные расходы',target:'together'},{type:'action',value:'Сайт приложения',target:'landing'}]},
  {id:'search',title:'Поиск',subtitle:'Операции, счета и разделы в одном месте',elements:[]}
];

export const retiredIds = ['calendar', 'forecast-day', 'forecast', 'merchants', 'merchant-edit'];
export const screens = [...base, ...figmaScreens, ...fullScopeScreens];
export const screenMap = new Map(screens.map(screen => [screen.id, screen]));
export const groups = [
  {title:'Основной поток', ids:base.map(x=>x.id)},
  {title:'Операции и повторение', ids:['options','repeat','automatic','schedule','paused','excluded','outside','both','saved']},
  {title:'Валюты и счета', ids:['currencies','base','baseusd','baseeur','available','addcurrency','gbp','rates','editrate','accounts','createaccount','pockets','crypto','cash','fx','fxdone']},
  {title:'Категории и ввод', ids:['category','leaves','food','calc','calcexpr','calcresult','paste']},
  {title:'Отчёты и бюджет', ids:['reports','pie','budget','thresholds','budgetedit','alert']},
  {title:'English preview', ids:['language','english','enrepeat','enexcluded','enoutside','enreports','enbudget']},
  ...fullScopeGroups
];
export const scenarios = [
  {title:'Базовый учёт',description:'Первый запуск, счета, операция, журнал и просмотр результата.',ids:['base-welcome','base-accounts','base-expense','base-journal','base-detail']},
  {title:'Отмена с последствиями',description:'Проверить баланс до и после отмены, затем вернуться к записи.',ids:['base-journal','base-detail','base-cancel','base-detail']},
  {title:'Повторяющийся расход',description:'Настроить серию, посмотреть даты и приостановить её.',ids:['options','repeat','automatic','schedule','paused']},
  {title:'Независимые признаки учёта',description:'Сравнить четыре комбинации включения в общий итог и бюджет.',ids:['options','excluded','outside','both','saved']},
  {title:'Валюты и карманы',description:'Выбор валюты, ручной курс, мультивалютный счёт и перевод EUR → USD.',ids:['currencies','rates','editrate','accounts','pockets','fx','fxdone']},
  {title:'Бюджет и отчёт',description:'Период, категории, лимит, пороги и состояние 90%.',ids:['reports','pie','budget','thresholds','alert']},
  {title:'Английский поток',description:'Варианты ключевых состояний из текущего макета Figma.',ids:['language','english','enrepeat','enreports','enbudget']},
  ...fullScopeScenarios
];
