// Сценарии извлечены из сохранённого figma-extra.js; исходные node-id оставлены для сверки.
export const figmaScreens = [
  {
    "id": "options",
    "title": "Параметры операции",
    "subtitle": "Каждый переключатель действует независимо",
    "figmaNode": "13:28",
    "elements": [
      {
        "type": "input",
        "value": "Списание",
        "target": "Подписка · 20 USD ≈ 1 800 RUB"
      },
      {
        "type": "action",
        "value": "Повторение · каждый месяц",
        "target": "repeat"
      },
      {
        "type": "action",
        "value": "✓ Учитывать в общем итоге",
        "target": "excluded"
      },
      {
        "type": "action",
        "value": "✓ Учитывать в бюджете",
        "target": "outside"
      },
      {
        "type": "action",
        "value": "Валюты и курсы",
        "target": "currencies"
      },
      {
        "type": "action",
        "value": "Мультивалютные счета",
        "target": "accounts"
      },
      {
        "type": "action",
        "value": "Категория · выбрать подкатегорию",
        "target": "category"
      },
      {
        "type": "action",
        "value": "Сумма · калькулятор",
        "target": "calc"
      },
      {
        "type": "action",
        "value": "Сохранить",
        "target": "saved"
      }
    ]
  },
  {
    "id": "repeat",
    "title": "Повторяющееся списание",
    "subtitle": "Будущие события не меняют фактический остаток",
    "figmaNode": "13:51",
    "elements": [
      {
        "type": "input",
        "value": "Частота",
        "target": "Каждый месяц · 1 раз"
      },
      {
        "type": "input",
        "value": "Первая дата",
        "target": "31 января 2027 · Europe/Moscow"
      },
      {
        "type": "input",
        "value": "Окончание",
        "target": "Без окончания"
      },
      {
        "type": "input",
        "value": "Если дня нет",
        "target": "Последний день месяца"
      },
      {
        "type": "action",
        "value": "Ближайшие списания",
        "target": "schedule"
      },
      {
        "type": "action",
        "value": "Режим · напомнить и подтвердить",
        "target": "automatic"
      },
      {
        "type": "action",
        "value": "Применить повторение",
        "target": "options"
      }
    ]
  },
  {
    "id": "automatic",
    "title": "Автоматическое проведение",
    "subtitle": "Вы подтверждаете создание расходов по расписанию",
    "figmaNode": "13:73",
    "elements": [
      {
        "type": "text",
        "value": "Счёт Visa USD · 20 USD\nКатегория: Подписки → Музыка\nОбщий итог: включено\nБюджет: включено"
      },
      {
        "type": "text",
        "value": "Сумму и счёт можно изменить для будущих событий. Банковское списание сопоставляется с записью серии."
      },
      {
        "type": "action",
        "value": "Подтвердить автоматическое проведение",
        "target": "schedule"
      },
      {
        "type": "action",
        "value": "Оставить напоминание",
        "target": "repeat"
      }
    ]
  },
  {
    "id": "schedule",
    "title": "Ближайшие списания",
    "subtitle": "20 USD · ежемесячно · UTC+3",
    "figmaNode": "13:83",
    "elements": [
      {
        "type": "text",
        "value": "31 января 2027\n28 февраля 2027\n31 марта 2027"
      },
      {
        "type": "text",
        "value": "Одно событие — одна операция. Пауза остановит будущие события; проведённые сохранятся."
      },
      {
        "type": "action",
        "value": "Применить",
        "target": "options"
      },
      {
        "type": "action",
        "value": "Пауза серии",
        "target": "paused"
      }
    ]
  },
  {
    "id": "paused",
    "title": "Серия приостановлена",
    "subtitle": "Будущие списания не создаются",
    "figmaNode": "13:93",
    "elements": [
      {
        "type": "action",
        "value": "Возобновить серию",
        "target": "schedule"
      },
      {
        "type": "action",
        "value": "Параметры операции",
        "target": "options"
      }
    ]
  },
  {
    "id": "excluded",
    "title": "Исключено из общего итога",
    "subtitle": "Фактический остаток счёта учитывает списание",
    "figmaNode": "13:101",
    "elements": [
      {
        "type": "text",
        "value": "Расход: 20 USD\nФактический остаток: 480 USD\nВклад расхода в общий итог: 0 RUB\nВ бюджете: 1 800 RUB"
      },
      {
        "type": "action",
        "value": "Вернуть участие в итоге",
        "target": "options"
      },
      {
        "type": "action",
        "value": "Также исключить из бюджета",
        "target": "both"
      },
      {
        "type": "action",
        "value": "Сохранить",
        "target": "saved"
      }
    ]
  },
  {
    "id": "outside",
    "title": "Внебюджетный расход",
    "subtitle": "Расход виден в журнале и отчётах",
    "figmaNode": "13:112",
    "elements": [
      {
        "type": "text",
        "value": "Расход: 20 USD ≈ 1 800 RUB\nФактический остаток: 480 USD\nВ общем итоге: −1 800 RUB\nВ бюджете: 0 RUB"
      },
      {
        "type": "action",
        "value": "Вернуть участие в бюджете",
        "target": "options"
      },
      {
        "type": "action",
        "value": "Также исключить из общего итога",
        "target": "both"
      },
      {
        "type": "action",
        "value": "Сохранить",
        "target": "saved"
      }
    ]
  },
  {
    "id": "both",
    "title": "Оба признака выключены",
    "subtitle": "Денежное движение сохраняется",
    "figmaNode": "13:123",
    "elements": [
      {
        "type": "text",
        "value": "Фактический остаток: 480 USD\nВклад в общий итог: 0 RUB\nБюджетный расход: 0 RUB"
      },
      {
        "type": "action",
        "value": "Изменить признаки",
        "target": "options"
      },
      {
        "type": "action",
        "value": "Сохранить",
        "target": "saved"
      }
    ]
  },
  {
    "id": "saved",
    "title": "Операция сохранена",
    "subtitle": "Демонстрация состояния интерфейса",
    "figmaNode": "13:132",
    "elements": [
      {
        "type": "text",
        "value": "Подписка · 20 USD\nVisa USD · Музыка\nПовторение и признаки видны в деталях"
      },
      {
        "type": "action",
        "value": "Параметры операции",
        "target": "options"
      },
      {
        "type": "action",
        "value": "Отчёты",
        "target": "reports"
      },
      {
        "type": "action",
        "value": "Бюджет",
        "target": "budget"
      }
    ]
  },
  {
    "id": "currencies",
    "title": "Валюты и курсы",
    "subtitle": "Демонстрационные курсы, не рыночные",
    "figmaNode": "13:143",
    "elements": [
      {
        "type": "action",
        "value": "Базовая валюта · RUB",
        "target": "base"
      },
      {
        "type": "action",
        "value": "Доступны: RUB USD EUR GEL USDT",
        "target": "available"
      },
      {
        "type": "action",
        "value": "Курсы · редактировать",
        "target": "rates"
      },
      {
        "type": "action",
        "value": "Язык · Русский / English",
        "target": "language"
      },
      {
        "type": "action",
        "value": "Назад",
        "target": "options"
      }
    ]
  },
  {
    "id": "base",
    "title": "Базовая валюта",
    "subtitle": "Для сравнения и общих итогов",
    "figmaNode": "13:157",
    "elements": [
      {
        "type": "action",
        "value": "RUB · Российский рубль ✓",
        "target": "currencies"
      },
      {
        "type": "action",
        "value": "USD · US Dollar",
        "target": "baseusd"
      },
      {
        "type": "action",
        "value": "EUR · Euro",
        "target": "baseeur"
      }
    ]
  },
  {
    "id": "baseusd",
    "title": "Базовая валюта: USD",
    "subtitle": "Исходные валюты операций сохраняются",
    "figmaNode": "13:167",
    "elements": [
      {
        "type": "action",
        "value": "Настройки валют",
        "target": "currencies"
      }
    ]
  },
  {
    "id": "baseeur",
    "title": "Базовая валюта: EUR",
    "subtitle": "Исторические суммы не переписываются",
    "figmaNode": "13:173",
    "elements": [
      {
        "type": "action",
        "value": "Настройки валют",
        "target": "currencies"
      }
    ]
  },
  {
    "id": "available",
    "title": "Доступные валюты",
    "subtitle": "USDT — отдельный актив, не USD",
    "figmaNode": "13:179",
    "elements": [
      {
        "type": "text",
        "value": "✓ RUB   ✓ USD   ✓ EUR\n✓ GEL   ✓ USDT"
      },
      {
        "type": "action",
        "value": "Добавить валюту",
        "target": "addcurrency"
      },
      {
        "type": "action",
        "value": "Готово",
        "target": "currencies"
      }
    ]
  },
  {
    "id": "addcurrency",
    "title": "Добавить валюту",
    "subtitle": "Поиск по названию или коду",
    "figmaNode": "13:188",
    "elements": [
      {
        "type": "input",
        "value": "Код валюты",
        "target": "GBP"
      },
      {
        "type": "action",
        "value": "GBP · British Pound",
        "target": "gbp"
      }
    ]
  },
  {
    "id": "gbp",
    "title": "Валюта добавлена",
    "subtitle": "GBP доступна при создании счёта",
    "figmaNode": "13:197",
    "elements": [
      {
        "type": "action",
        "value": "Настроить курс",
        "target": "rates"
      },
      {
        "type": "action",
        "value": "Готово",
        "target": "currencies"
      }
    ]
  },
  {
    "id": "rates",
    "title": "Курсы валют",
    "subtitle": "Ручные · 9 октября 2026",
    "figmaNode": "13:205",
    "elements": [
      {
        "type": "input",
        "value": "1 USD",
        "target": "90 RUB"
      },
      {
        "type": "input",
        "value": "1 EUR",
        "target": "99 RUB"
      },
      {
        "type": "input",
        "value": "1 GEL",
        "target": "30 RUB"
      },
      {
        "type": "input",
        "value": "1 USDT",
        "target": "89 RUB"
      },
      {
        "type": "action",
        "value": "Изменить курс USD",
        "target": "editrate"
      },
      {
        "type": "action",
        "value": "Назад",
        "target": "currencies"
      }
    ]
  },
  {
    "id": "editrate",
    "title": "Редактировать курс",
    "subtitle": "Изменение не переписывает проведённые операции",
    "figmaNode": "13:225",
    "elements": [
      {
        "type": "input",
        "value": "Направление",
        "target": "1 USD → RUB"
      },
      {
        "type": "input",
        "value": "Курс",
        "target": "90"
      },
      {
        "type": "input",
        "value": "Дата и источник",
        "target": "09.10.2026 · вручную"
      },
      {
        "type": "action",
        "value": "Сохранить курс",
        "target": "rates"
      }
    ]
  },
  {
    "id": "accounts",
    "title": "Счета и кошельки",
    "subtitle": "Карточка объединяет валютные счета",
    "figmaNode": "13:240",
    "elements": [
      {
        "type": "text",
        "value": "Visa TBS\n300 EUR · 1 000 GEL · 500 USD\nИтого: 104 700 RUB\n\nCrypto · 200 USDT ≈ 17 800 RUB"
      },
      {
        "type": "action",
        "value": "Создать счёт",
        "target": "createaccount"
      },
      {
        "type": "action",
        "value": "Открыть Visa TBS",
        "target": "pockets"
      },
      {
        "type": "action",
        "value": "Перевести между счетами",
        "target": "fx"
      },
      {
        "type": "action",
        "value": "Назад",
        "target": "options"
      }
    ]
  },
  {
    "id": "createaccount",
    "title": "Новый счёт",
    "subtitle": "Тип, название и валюты",
    "figmaNode": "13:253",
    "elements": [
      {
        "type": "action",
        "value": "Карта · мультивалютная",
        "target": "pockets"
      },
      {
        "type": "action",
        "value": "Криптокошелёк · USDT",
        "target": "crypto"
      },
      {
        "type": "action",
        "value": "Наличные · RUB",
        "target": "cash"
      }
    ]
  },
  {
    "id": "pockets",
    "title": "Visa TBS",
    "subtitle": "Отдельный остаток каждой валюты",
    "figmaNode": "13:263",
    "elements": [
      {
        "type": "input",
        "value": "EUR",
        "target": "300 EUR ≈ 29 700 RUB"
      },
      {
        "type": "input",
        "value": "GEL",
        "target": "1 000 GEL ≈ 30 000 RUB"
      },
      {
        "type": "input",
        "value": "USD",
        "target": "500 USD ≈ 45 000 RUB"
      },
      {
        "type": "action",
        "value": "Добавить валютный счёт",
        "target": "available"
      },
      {
        "type": "action",
        "value": "Перевести",
        "target": "fx"
      },
      {
        "type": "action",
        "value": "Счета",
        "target": "accounts"
      }
    ]
  },
  {
    "id": "crypto",
    "title": "Криптокошелёк",
    "subtitle": "Приватные ключи не требуются",
    "figmaNode": "13:282",
    "elements": [
      {
        "type": "input",
        "value": "Актив",
        "target": "USDT"
      },
      {
        "type": "input",
        "value": "Сеть",
        "target": "TRON"
      },
      {
        "type": "input",
        "value": "Остаток",
        "target": "200 USDT"
      },
      {
        "type": "action",
        "value": "Создать",
        "target": "accounts"
      }
    ]
  },
  {
    "id": "cash",
    "title": "Наличные",
    "subtitle": "Одновалютный счёт",
    "figmaNode": "13:297",
    "elements": [
      {
        "type": "input",
        "value": "Валюта",
        "target": "RUB"
      },
      {
        "type": "input",
        "value": "Начальный остаток",
        "target": "10 000"
      },
      {
        "type": "action",
        "value": "Создать",
        "target": "accounts"
      }
    ]
  },
  {
    "id": "fx",
    "title": "Перевод EUR → USD",
    "subtitle": "Обе точные суммы фиксируются",
    "figmaNode": "13:309",
    "elements": [
      {
        "type": "input",
        "value": "Откуда",
        "target": "Visa TBS · EUR"
      },
      {
        "type": "input",
        "value": "Списание",
        "target": "100 EUR ≈ 9 900 RUB"
      },
      {
        "type": "input",
        "value": "Куда",
        "target": "Visa TBS · USD"
      },
      {
        "type": "input",
        "value": "Зачисление",
        "target": "110 USD ≈ 9 900 RUB"
      },
      {
        "type": "text",
        "value": "1 EUR = 1,10 USD\nКомиссия: 0 EUR\nОстатки после: 200 EUR / 610 USD"
      },
      {
        "type": "action",
        "value": "Подтвердить перевод",
        "target": "fxdone"
      },
      {
        "type": "action",
        "value": "Назад",
        "target": "accounts"
      }
    ]
  },
  {
    "id": "fxdone",
    "title": "Перевод выполнен",
    "subtitle": "100 EUR → 110 USD",
    "figmaNode": "13:330",
    "elements": [
      {
        "type": "text",
        "value": "200 EUR · 610 USD\nВнутренний перевод не расходует бюджет"
      },
      {
        "type": "action",
        "value": "Счета",
        "target": "accounts"
      }
    ]
  },
  {
    "id": "category",
    "title": "Категории",
    "subtitle": "Откройте группу и выберите подкатегорию",
    "figmaNode": "13:337",
    "elements": [
      {
        "type": "action",
        "value": "Подписки",
        "target": "leaves"
      },
      {
        "type": "action",
        "value": "Еда",
        "target": "food"
      },
      {
        "type": "action",
        "value": "Назад",
        "target": "options"
      }
    ]
  },
  {
    "id": "leaves",
    "title": "Подписки",
    "subtitle": "Выберите конечную подкатегорию",
    "figmaNode": "13:347",
    "elements": [
      {
        "type": "action",
        "value": "Музыка",
        "target": "options"
      },
      {
        "type": "action",
        "value": "Видео",
        "target": "options"
      },
      {
        "type": "action",
        "value": "Другое",
        "target": "options"
      },
      {
        "type": "action",
        "value": "Категории",
        "target": "category"
      }
    ]
  },
  {
    "id": "food",
    "title": "Еда",
    "subtitle": "Выберите конечную подкатегорию",
    "figmaNode": "13:359",
    "elements": [
      {
        "type": "action",
        "value": "Продукты",
        "target": "options"
      },
      {
        "type": "action",
        "value": "Кафе",
        "target": "options"
      },
      {
        "type": "action",
        "value": "Другое",
        "target": "options"
      }
    ]
  },
  {
    "id": "calc",
    "title": "Калькулятор",
    "subtitle": "Сценарий макета: 120 ÷ 3 = 40",
    "figmaNode": "13:369",
    "elements": [
      {
        "type": "input",
        "value": "Выражение",
        "target": "120"
      },
      {
        "type": "action",
        "value": "÷ 3",
        "target": "calcexpr"
      },
      {
        "type": "action",
        "value": "Вставить из буфера",
        "target": "paste"
      },
      {
        "type": "text",
        "value": "+    −    ×    ÷\nВ приложении: ввод произвольных чисел"
      },
      {
        "type": "action",
        "value": "Закрыть",
        "target": "options"
      }
    ]
  },
  {
    "id": "calcexpr",
    "title": "Калькулятор · выражение",
    "subtitle": "120 ÷ 3",
    "figmaNode": "13:383",
    "elements": [
      {
        "type": "input",
        "value": "Выражение",
        "target": "120 ÷ 3"
      },
      {
        "type": "action",
        "value": "=",
        "target": "calcresult"
      },
      {
        "type": "action",
        "value": "Очистить",
        "target": "calc"
      }
    ]
  },
  {
    "id": "calcresult",
    "title": "Калькулятор · результат",
    "subtitle": "120 ÷ 3 = 40",
    "figmaNode": "13:394",
    "elements": [
      {
        "type": "input",
        "value": "Сумма",
        "target": "40 USD"
      },
      {
        "type": "action",
        "value": "Применить",
        "target": "options"
      },
      {
        "type": "action",
        "value": "Очистить",
        "target": "calc"
      }
    ]
  },
  {
    "id": "paste",
    "title": "Вставка суммы",
    "subtitle": "Предпросмотр · пример буфера",
    "figmaNode": "13:405",
    "elements": [
      {
        "type": "input",
        "value": "Значение",
        "target": "20,00"
      },
      {
        "type": "text",
        "value": "В приложении буфер читается только по нажатию. Figma показывает сценарий, не читает буфер устройства."
      },
      {
        "type": "action",
        "value": "Использовать 20 USD",
        "target": "options"
      },
      {
        "type": "action",
        "value": "Отмена",
        "target": "calc"
      }
    ]
  },
  {
    "id": "reports",
    "title": "Отчёты",
    "subtitle": "Октябрь · все расходы · RUB",
    "figmaNode": "13:417",
    "elements": [
      {
        "type": "text",
        "value": "Доходы: 90 000\nРасходы: 45 000\nРазница: +45 000"
      },
      {
        "type": "text",
        "value": "Еда      █████████  22 500\nЖильё  ██████       15 000\nПрочее ███              7 500"
      },
      {
        "type": "action",
        "value": "Диаграмма категорий",
        "target": "pie"
      },
      {
        "type": "action",
        "value": "Операции отчёта",
        "target": "saved"
      },
      {
        "type": "action",
        "value": "Бюджет",
        "target": "budget"
      },
      {
        "type": "action",
        "value": "Параметры",
        "target": "options"
      }
    ]
  },
  {
    "id": "pie",
    "title": "Расходы по категориям",
    "subtitle": "45 000 RUB · октябрь",
    "figmaNode": "13:431",
    "elements": [
      {
        "type": "text",
        "value": "Еда 50% · 22 500\nЖильё 33,33% · 15 000\nПрочее 16,67% · 7 500"
      },
      {
        "type": "action",
        "value": "Отчёты",
        "target": "reports"
      }
    ]
  },
  {
    "id": "budget",
    "title": "Бюджет месяца",
    "subtitle": "Октябрь · RUB",
    "figmaNode": "13:439",
    "elements": [
      {
        "type": "input",
        "value": "Лимит",
        "target": "50 000 RUB"
      },
      {
        "type": "text",
        "value": "Потрачено: 45 000 · 90%\nОсталось: 5 000 RUB\nВнебюджетные расходы показаны отдельно"
      },
      {
        "type": "action",
        "value": "Настроить уведомления",
        "target": "thresholds"
      },
      {
        "type": "action",
        "value": "Изменить лимит",
        "target": "budgetedit"
      },
      {
        "type": "action",
        "value": "Уведомление 90%",
        "target": "alert"
      },
      {
        "type": "action",
        "value": "Отчёты",
        "target": "reports"
      }
    ]
  },
  {
    "id": "thresholds",
    "title": "Пороговые уведомления",
    "subtitle": "Один раз на порог в каждом периоде",
    "figmaNode": "13:455",
    "elements": [
      {
        "type": "text",
        "value": "✓ 50%     ✓ 80%\n✓ 90%     ✓ 100%\nПри запрете системных уведомлений — внутри приложения"
      },
      {
        "type": "action",
        "value": "Сохранить",
        "target": "budget"
      }
    ]
  },
  {
    "id": "budgetedit",
    "title": "Лимит бюджета",
    "subtitle": "Месячный · общий / по категориям",
    "figmaNode": "13:462",
    "elements": [
      {
        "type": "input",
        "value": "Общий лимит",
        "target": "50 000 RUB"
      },
      {
        "type": "input",
        "value": "Начало финансового месяца",
        "target": "1 число · Europe/Moscow"
      },
      {
        "type": "action",
        "value": "Сохранить",
        "target": "budget"
      }
    ]
  },
  {
    "id": "alert",
    "title": "Достигнуто 90% бюджета",
    "subtitle": "45 000 из 50 000 RUB",
    "figmaNode": "13:474",
    "elements": [
      {
        "type": "text",
        "value": "Осталось 5 000 RUB.\nВнебюджетные расходы не вызывают пороги."
      },
      {
        "type": "action",
        "value": "Открыть бюджет",
        "target": "budget"
      }
    ]
  },
  {
    "id": "language",
    "title": "Язык / Language",
    "subtitle": "Валюта не зависит от языка",
    "figmaNode": "13:481",
    "elements": [
      {
        "type": "action",
        "value": "Русский",
        "target": "options"
      },
      {
        "type": "action",
        "value": "English",
        "target": "english"
      }
    ]
  },
  {
    "id": "english",
    "title": "Transaction settings",
    "subtitle": "English preview",
    "figmaNode": "13:489",
    "elements": [
      {
        "type": "input",
        "value": "Expense",
        "target": "Subscription · 20 USD ≈ 1,800 RUB"
      },
      {
        "type": "action",
        "value": "Repeat · monthly",
        "target": "enrepeat"
      },
      {
        "type": "action",
        "value": "Include in account total ✓",
        "target": "enexcluded"
      },
      {
        "type": "action",
        "value": "Include in budget ✓",
        "target": "enoutside"
      },
      {
        "type": "action",
        "value": "Reports",
        "target": "enreports"
      },
      {
        "type": "action",
        "value": "Budget",
        "target": "enbudget"
      },
      {
        "type": "action",
        "value": "Language · English",
        "target": "language"
      }
    ]
  },
  {
    "id": "enrepeat",
    "title": "Recurring expense",
    "subtitle": "Future events do not change actual balances",
    "figmaNode": "13:508",
    "elements": [
      {
        "type": "text",
        "value": "Monthly · January 31\nFebruary 28 · March 31\nRemind and confirm"
      },
      {
        "type": "action",
        "value": "Apply",
        "target": "english"
      }
    ]
  },
  {
    "id": "enexcluded",
    "title": "Excluded from account total",
    "subtitle": "Actual account balance still includes the expense",
    "figmaNode": "13:515",
    "elements": [
      {
        "type": "text",
        "value": "Actual balance: 480 USD\nTotal contribution: 0 RUB\nBudget expense: 1,800 RUB"
      },
      {
        "type": "action",
        "value": "Back",
        "target": "english"
      }
    ]
  },
  {
    "id": "enoutside",
    "title": "Outside budget",
    "subtitle": "Expense remains in history and reports",
    "figmaNode": "13:522",
    "elements": [
      {
        "type": "text",
        "value": "Actual balance: 480 USD\nBudget expense: 0 RUB"
      },
      {
        "type": "action",
        "value": "Back",
        "target": "english"
      }
    ]
  },
  {
    "id": "enreports",
    "title": "Reports",
    "subtitle": "October · RUB",
    "figmaNode": "13:529",
    "elements": [
      {
        "type": "text",
        "value": "Income: 90,000\nExpenses: 45,000\nNet: +45,000"
      },
      {
        "type": "action",
        "value": "Budget",
        "target": "enbudget"
      },
      {
        "type": "action",
        "value": "Back",
        "target": "english"
      }
    ]
  },
  {
    "id": "enbudget",
    "title": "Monthly budget",
    "subtitle": "October · RUB",
    "figmaNode": "13:538",
    "elements": [
      {
        "type": "text",
        "value": "Limit: 50,000\nSpent: 45,000 · 90%\nRemaining: 5,000\nAlerts: 50 / 80 / 90 / 100%"
      },
      {
        "type": "action",
        "value": "Back",
        "target": "english"
      }
    ]
  }
];
