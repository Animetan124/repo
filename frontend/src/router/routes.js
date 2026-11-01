
const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('@/pages/Dashboard.vue')
      },
      {
        path: 'Connection',
        component: () => import('@/pages/Connection.vue')
      },
      {
        path: 'Devices',
        component: () => import('@/pages/StationOps.vue'),
        meta: {
          mode: 'devices',
          title: 'Устройства',
          description: 'Сеть, процессы и диски станции'
        }
      },
      {
  path: 'AI',
  component: () => import('@/pages/AiSettings.vue'),
  meta: { title: 'ИИ и API', description: 'Настройки искусственного интеллекта и API' }
},
      {
        path: 'Configuration',
        component: () => import('@/pages/StationConfig.vue'),
        meta: {
          title: 'Конфигурация',
          description: 'Настройки Quasar Bridge'
        }
      },
      {
        path: 'Logs',
        component: () => import('@/pages/StationOps.vue'),
        meta: {
          mode: 'logs',
          title: 'Журнал событий',
          description: 'Системные сообщения и логи'
        }
      },
      {
        path: 'Services',
        component: () => import('@/pages/StationOps.vue'),
        meta: {
          mode: 'services',
          title: 'Состояние служб',
          description: 'Состояние Quasar Bridge: проверка, перезапуск, откат'
        }
      },
      {
        path: 'System',
        component: () => import('@/pages/StationOps.vue'),
        meta: {
          mode: 'system',
          title: 'О системе',
          description: 'Версия и информация о системе'
        }
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/Error404.vue')
  }
]

export default routes
