declare module 'jsonwebtoken' {
  export interface VerifyErrors {
    name: string
    message: string
    expiredAt?: Date
  }

  export interface VerifyOptions {
    algorithms?: string[]
    audience?: string | string[]
    clockTimestamp?: number
    clockTolerance?: number
    issuer?: string | string[]
    jwtid?: string
    ignoreExpiration?: boolean
    ignoreNotBefore?: boolean
    subject?: string
    maxAge?: string | number
  }

  export interface SignOptions {
    algorithm?: string
    keyid?: string
    expiresIn?: string | number
    notBefore?: string | number
    audience?: string | string[]
    subject?: string
    issuer?: string
    jwtid?: string
    mutatePayload?: boolean
    noTimestamp?: boolean
    header?: object
    encoding?: string
  }

  export function sign(
    payload: string | Buffer | object,
    secretOrPrivateKey: string | Buffer,
    options?: SignOptions
  ): string

  export function verify(
    token: string,
    secretOrPublicKey: string | Buffer,
    callback?: (err: VerifyErrors | null, decoded: any) => void
  ): any

  export function verify(
    token: string,
    secretOrPublicKey: string | Buffer,
    options: VerifyOptions,
    callback?: (err: VerifyErrors | null, decoded: any) => void
  ): any

  export function decode(
    token: string,
    options?: { complete?: boolean; json?: boolean }
  ): null | { [key: string]: any } | string
}
