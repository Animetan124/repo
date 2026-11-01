
export const navigation = [
  { label: 'Обзор', short: 'Обзор', icon: 'dashboard', to: '/', primary: true },

  { header: 'Управление' },
  { label: 'Подключение', short: 'SSH', icon: 'lan', to: '/Connection', primary: true },
  { label: 'Устройства', short: 'Устройства', icon: 'devices', to: '/Devices', primary: true },
  { label: 'ИИ и API', short: 'ИИ', icon: 'psychology', to: '/AI', primary: true },
  { label: 'Алиса', short: 'Алиса', icon: 'smart_toy', to: '/alice', primary: true },

  { header: 'Настройки' },
  { label: 'Конфигурация', icon: 'settings', to: '/Configuration' },
  { label: 'Журнал событий', short: 'Логи', icon: 'receipt_long', to: '/Logs' },

  { header: 'Система' },
  { label: 'Состояние служб', icon: 'monitor_heart', to: '/Services' },
  { label: 'О системе', icon: 'info', to: '/System' }
]

export const primaryDestinations = navigation.filter(
  item => item.primary === true
)
