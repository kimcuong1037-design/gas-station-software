import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import './index.css'
import './locales/i18n'
import { router } from './router'
import fluentTheme from './theme/fluentTheme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider locale={zhCN} theme={fluentTheme}>
      <RouterProvider router={router} />
    </ConfigProvider>
  </StrictMode>,
)
