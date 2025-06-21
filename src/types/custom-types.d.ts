// Type definitions for modules without available @types
declare module 'express-query-boolean' {
  import { RequestHandler } from 'express'
  const booleanParser: () => RequestHandler
  export default booleanParser
}
