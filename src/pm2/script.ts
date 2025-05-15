import pm2 from 'pm2'

const connectPM2AndReload = async (): Promise<void> => {
  // Connect to PM2 with master process
  if (process.env.NODE_APP_INSTANCE === '0') {
    pm2.connect(true, (err) => {
      if (err) {
        console.error(err)
        process.exit(2)
      }

      setTimeout(() => {
        pm2.reload('napricot-api', (err) => {
          if (err) {
            console.error(err)
            process.exit(2)
          }

          pm2.disconnect()
        })
      }, 3600 * 1000 * 3) // 3 hours
    })
  }
}

export default connectPM2AndReload
