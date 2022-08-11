const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    console.log("######This has been found");
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://localhost:8080',
            changeOrigin: true,
        })
    );
};