import express from 'express'

declare global {
  namespace Express {
    interface Application {
      locals: {
        dropboxAccessToken: string
        [key: string]: any
      }
    }
  }
}
