const http = require('http')
const express = require( 'express' )
const app = express()
const port = 3000

const server = http.Server( app );

app.get( '/', ( req, res ) => {
  res.send( 'Hello World!' )
} );

server.listen( port, '127.0.0.1', async () => {
  let address = server.address();
  console.log( `Example app via ${ address?.family } at http://${ address?.address }:${ address?.port }` )
} );