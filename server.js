const https = require('https');
const { readFileSync } = require('fs');
const botConfig = require('./botconfig.json');
const express = require('express')
const cors = require('cors')
const { createProxyMiddleware } = require('http-proxy-middleware')
const port = botConfig.oauth.port;
var privateKey  = readFileSync(botConfig.oauth.privateKey, 'utf8');
var certificate = readFileSync(botConfig.oauth.publicKey, 'utf8');
var credentials = {key: privateKey, cert: certificate};

const app = express()
app.use(cors())
app.use(createProxyMiddleware({
  router: (req) => console.log (new URL(req.url.substring(1)).pathname + new URL(req.url.substring(1)).search)/*,
  pathRewrite: (path, req) => (new URL(req.url.substring(1))).pathname + new URL(req.url.substring(1)).search),
  changeOrigin: true,
  logger: console*/
}))

https.createServer(credentials, app).listen(port);