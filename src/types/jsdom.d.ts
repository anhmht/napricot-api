declare module 'jsdom' {
  export class JSDOM {
    constructor(html: string, options?: any)
    window: {
      document: Document
    }
  }

  export class VirtualConsole {
    sendTo(console: Console, options?: { omitJSDOMErrors?: boolean }): this
  }
}
