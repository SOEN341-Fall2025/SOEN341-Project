const { createProxyMiddleware } = require('http-proxy-middleware');

console.log('setupProxy.js is being loaded'); // Add this log

module.exports = function(app) {
  console.log('Proxy middleware is active');
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:4000',
      changeOrigin: true
    })
  );
};
