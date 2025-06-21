import axios from 'axios'
import { Request, Response, NextFunction } from 'express'
import { sendSlackMessage } from './slack'

const deploy = async (): Promise<void> => {
  try {
    // Deploy master branch
    await axios.post(
      `https://kolkrabbi.heroku.com/apps/${process.env.HEROKU_APP_ID}/github/push`,
      {
        branch: 'master'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.HEROKU_ACCESS_TOKEN || ''}`
        }
      }
    )

    await sendSlackMessage({
      channel: process.env.SLACK_WEBHOOK_WEB_BUILD as string,
      message: 'Deploying master branch to Heroku. :rocket:',
      type: 'INFO'
    })
  } catch (error) {
    console.log(error)
  }
}

const deployFromWeb = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await deploy()
  res.status(200).json({
    success: true
  })
}

export { deploy, deployFromWeb }
