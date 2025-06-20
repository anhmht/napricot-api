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
      // Use 1 instance for Heroku to avoid memory limits
      instances: process.env.INSTANCES || 1,
      exec_mode: 'fork', // Changed from cluster to fork for single instance
      wait_ready: true,
      autorestart: true
    }
  ]
}
