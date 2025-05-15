export interface Pm2ProcessConfig {
  name: string
  script: string
  watch_delay?: number
  watch?: boolean | string[]
  ignore_watch?: string[]
  restart_delay?: number
  cron_restart?: string
  instances?: number | string
  exec_mode?: 'cluster' | 'fork'
  wait_ready?: boolean
  autorestart?: boolean
  env?: {
    [key: string]: string
  }
}
