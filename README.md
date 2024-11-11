# napricot-api

## SSL on local development
Create private and public key in `.ssl` in the project root

```sh
# create `.ssl` dir in project root
$ mkdir .ssl

# create a private key
$ sudo openssl genrsa -out .ssl/localhost.key 2048

# create a public key
$ sudo openssl req -new -x509 -key .ssl/localhost.key -out .ssl/localhost.crt -days 3650 -subj /CN=localhost

# add public key to Keychains
$ sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain .ssl/localhost.crt
```

## Local development

1. Uncomment these line `index.js`

```js
// const https = require('https')
// const fs = require('fs')
// const privateKey = fs.readFileSync('.ssl/server.key', 'utf8')
// const certificate = fs.readFileSync('.ssl/server.crt', 'utf8')
// const credentials = { key: privateKey, cert: certificate }
```
```js
// const server = https.createServer(credentials, app)
// server.listen(port, () => {
//   console.log(`Server started listening on ${port}`)
//   process.send('ready')
// })
```
2. Comment out these line `index.js`

```js
const server = app.listen(port, () => {
  console.log(`Server started listening on ${port}`)
  process.send('ready')
})
```

3. Comment out this line in `ecosystem.config.js`

```js
NODE_TLS_REJECT_UNAUTHORIZED: '0',
```

4. Install package

```bash
$ yarn install
```

5. Set `.env`.

```bash
$ cp .env.sample .env
```
`.env` is ignored by git. So, you can edit it freely.

6. Run project

```bash
$ yarn start
```

## migrate DB
Look at the [migrate-mongoose](https://www.npmjs.com/package/migrate-mongoose) to learn more.
```bash
# create migration file
./node_modules/.bin/migrate create <migration-name>
```
```js
/**
 * Make any changes you need to make to the database here
 */
async function up() {
  // Write migration here
  await connectDB()
  await Product.updateMany({}, { isDeleted: false })
}
```
