module.exports = {
  apps: [
    {
      name: 'napricot-api',
      script: './dist/index.js',
      // Specify delay between watch interval
      watch_delay: 1000,
      watch: false,
      // Specify which folder to ignore
      ignore_watch: ['node_modules'],
      restart_delay: 3000,
      // cron_restart: '0 */3 * * *',
      instances: process.env.INSTANCES || 3,
      exec_mode: 'cluster',
      wait_ready: true,
      autorestart: true
    }
  ]
}
