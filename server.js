// var http = require('http')
var httpProxy = require('http-proxy')
//
// Create your proxy server and set the target in the options.
//
httpProxy.createProxyServer({
  changeOrigin: true,
  target: 'https://api.genius.com/',
  headers: {'Authorization': 'Bearer ZlLSmhS4-K3TlAOvIFbGig39rqxTIahXvisPoBLzjo0gnikXxtrFakbexl1lxRSi'}
}).listen(8500)
console.log('listening on port 8500')
