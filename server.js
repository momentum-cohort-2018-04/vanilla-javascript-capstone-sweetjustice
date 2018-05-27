// var http = require('http')
require('dotenv').config()
var httpProxy = require('http-proxy')
//
// Create your proxy server and set the target in the options.
//
httpProxy.createProxyServer({
  changeOrigin: true,
  target: 'https://api.genius.com/',
  headers: {'Authorization': process.env.GENIUSTOKEN}
}).listen(8500)
console.log('listening on port 8500')
