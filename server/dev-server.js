const { createProxyMiddleware } = require( 'http-proxy-middleware' );
const WebSocket = require('ws');
const SocketIO_Client = require('socket.io');

module.exports = ( expressApp, httpServer ) => {
  // forward web requests to angular server
  expressApp.use( '*', createProxyMiddleware({ target: 'http://localhost:4200', changeOrigin: true, ws: true }) );
}