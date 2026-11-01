export const mockProcesses = [
  {
    id: 'p1',
    name: 'Голосовой движок',
    type: 'system',
    status: 'active',
    description: 'Основной модуль распознавания и синтеза речи',
    cpu: 12,
    memory: 245,
    uptime: '3ч 42мин',
    permissions: ['Микрофон', 'Сеть', 'Аудиовыход'],
    lastAction: 'Распознавание команды',
    errors: 0,
    logs: [
      { timestamp: '14:32:01', level: 'info', message: 'Команда распознана: "включи свет"' },
      { timestamp: '14:31:58', level: 'info', message: 'Начало записи аудио' },
      { timestamp: '14:30:00', level: 'info', message: 'Движок инициализирован' },
    ],
  },
];

export const mockIntegrations = [
  {
    id: 'i1',
    name: 'SimpMusic',
    version: '1.4.2',
    description: 'Музыкальный стриминговый сервис с открытым исходным кодом.',
    author: 'SimpMusic Team',
    source: 'github',
    sourceUrl: 'github.com/SimpMusic/app',
    status: 'running',
    icon: 'music_note',
    permissions: [
      { id: 'perm1', name: 'Доступ к сети', description: 'Для стриминга музыки', granted: true, category: 'network' },
    ],
    commands: [
      { id: 'c1', name: 'Играть', description: 'Начать воспроизведение', phrase: 'Алиса, играй музыку в SimpMusic' },
    ],
    history: [
      { timestamp: '14:30', command: 'Играть плейлист', result: 'success', details: 'Воспроизведение: Chill Vibes' },
    ],
    installedAt: '2024-12-01',
  },
];

export const mockSounds = [
  { id: 's1', name: 'Приветствие', category: 'Системные', format: 'OGG', duration: '0:02', size: '24 КБ', enabled: true, volume: 80, isCustom: false },
  { id: 's2', name: 'Распознавание', category: 'Системные', format: 'OGG', duration: '0:01', size: '12 КБ', enabled: true, volume: 70, isCustom: false },
];
