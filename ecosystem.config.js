module.exports = {
  apps: [
    {
      name: 'napricot-api',
      script: 'index.js',
      // Specify delay between watch interval
      watch_delay: 1000,
      watch: false,
      // Specify which folder to ignore
      ignore_watch: ['node_modules'],
      instances: '4',
      exec_mode: 'cluster',
      env: {
        // NODE_TLS_REJECT_UNAUTHORIZED: '0',
        NODE_ENV: 'production'
      }
    }
  ]
}
