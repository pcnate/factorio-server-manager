require('dotenv').config();
const http = require('http');
const express = require('express');
const { readFile } = require('fs').promises;
const path = require('path');
const reload = require('reload');
const morgan = require('morgan');
const os = require('os');
const fs = require('fs');
const child_process = require('child_process');
const socketIO = require('socket.io');
const { Rcon } = require('rcon-client');
const { v4: uuid } = require( 'uuid' );
const jwt = require('jsonwebtoken');
const { EventEmitter } = require( 'stream' );

const secretSharedKey = process.env.secretSharedKey || uuid();

const RCON_HOST = '127.0.0.1';
const RCON_PORT = '25575';
const RCON_PASS = uuid();

console.info( gt(), 'starting' );
const port = 3000;

var rcon = null;
var app = express();
var server = http.Server( app );
var io = null;
var serverProcess = null;
var serverRunning = false;
var rconConnected = false;
var rconConnectAttempts = 0;
var rconCleanMessages = false;



// logging
// app.use( morgan( 'tiny', {
//   skip: ( request, response ) => response.statusCode >= 400,
//   stream: process.stdout,
// } ) );
// app.use( morgan( 'tiny', {
//   skip: ( request, response ) => response.statusCode < 400,
//   stream: process.stderr,
// } ) );

// let output = reload( app, { port: 8000 } );
// console.info( `reloadjs listening on port: '${ output?.wss?.options?.port }'` );

// app.get( '/reload/reload-custom.js', async ( request, response ) => {
//   // get reloadjs contents
//   let contents = await readFile( path.join( process.cwd(), 'node_modules', 'reload', 'lib', 'reload-client.js' ) );

//   // replace socketUrl path
//   contents2 = contents.toString().split( os.EOL );

//   for( let line in contents2 ) {
//     if( contents2[line] === '  var verboseLogging = false' ) {
//       contents2[line] = '  var verboseLogging = false';
//     }
//     if( contents2[line] === '  socketUrl = socketUrl.replace() // This is dynamically populated by the reload.js file before it is sent to the browser' ) {
//       contents2[line] = '  socketUrl = `ws${ window.location.protocol === "https:" ? "s" : "" }://${ window.location.hostname }/reload/wss` // this is dynamically populated by host'
//     }
//   }

//   let contents3 = contents2.join( os.EOL );

//   // send contents
//   response.contentType = 'text/javascript; charset=utf-8';
//   response.send( contents3 );
// });

let status = {
  running: true,
  time: '',
  evolution: '',
};
let users = [
  // { user: 'pcnate', joined: ( new Date() ).getTime(), admin: true },
]
let gameData = [
  // { data: '', date: ( new Date() ).getTime(), type: 'data' },
];

let chats = [];


/**
 * current timestamp in ISO format
 * 
 * @returns {string}
 */
function gt() {
  return ( new Date() ).toISOString();
}


/**
 * handle a new chat message
 * 
 * @param {string} user
 * @param {string} message
 * @param {string} type
 */
async function newChat( user, message, type = 'chat' ) {
  let newChat = {
    user,
    date: ( new Date() ).getTime(),
    type,
    message,
  }
  chats.push( newChat );
  emit( 'newChat', newChat );
  chats = chats.slice( -1000 );
}

/**
 * process that a user join
 * 
 * @param {string} _user
 * @param {boolean} admin
 */
async function userJoin( _user ) {
  console.log( gt(), `${ _user } joined` )
  let user = { user: _user, joined: ( new Date() ).getTime(), admin: false, banlisted: false, whitelisted: false };
  emit( 'userJoin', { user } );
  newChat( _user, 'joined', 'join' );
  await checkPeriodically();
  emit( 'onlineUserCount', users.filter( x => !!x?.online ).length );
}

/**
 * process that a user left
 * 
 * @param {string} _user
 * @param {boolean} admin
 */
async function userLeft( _user ) {
  console.log( gt(), `${ _user } left` )
  let user = { user: _user, left: ( new Date() ).getTime() }
  emit( 'userLeft', { user } );
  newChat( _user, 'left', 'left' );
  await checkPeriodically();
  emit( 'onlineUserCount', users.filter( x => !!x?.online ).length );
}


/**
 * get landing page content
 * 
 * @param {string} type
 * @param {socket} socket
 * @param {object} data
 */
async function getLanding( type, socket, data ) {
  emit(`${ type } not implemented`, data, socket );
  console.log(`${ type } not implemented`, data );
}


/**
 * get all chats
 * 
 * @param {string} type
 * @param {socket} socket
 * @param {object} data
 */
async function getChats( type, socket, data ) {
  emit( 'chatsList', chats, socket );
}


/**
 * get all users
 * 
 * @param {string} type
 * @param {socket} socket
 * @param {object} data
 */
async function getUsers( type, socket, data ) {
  emit( 'usersList', users, socket );
}


/**
 * get account data
 * 
 * @param {string} type
 * @param {socket} socket
 * @param {object} data
 */
async function getAccount( type, socket, data ) {
  emit(`${ type } not implemented`, data, socket );
  console.log(`${ type } not implemented`, data );
}


/**
 * get server settings
 * 
 * @param {string} type
 * @param {socket} socket
 * @param {object} data
 */
async function getSettings( type, socket, data ) {
  emit( 'updateSettings', {
    serverRunning,
    onlineUserCount: users.filter( x => !!x.online ).length,
  });
}


/**
 * load all the game data
 * 
 * @param {string} type
 * @param {socket} socket
 * @param {object} data
 */
async function loadGameData( type, socket, data ) {
  emit( 'listGameData', gameData, socket );
}


/**
 * get online user count
 * 
 * @param {string} type
 * @param {socket} socket
 * @param {object} data
 */
async function getOnlineUserCount( type, socket, data ) {
  emit( 'onlineUserCount', users.filter( x => !!x?.online ).length, socket )
}


/**
 * check user credentials
 * 
 * @param {string} type
 * @param {socket} socket
 * @param {object} data
 * @returns {void}
 */
async function checkLogin( type, socket, data ) {
  let responseMessage = data?.responseMessage;

  let validUsername = !!data?.username && process?.env?.adminUser     === data?.username;
  let validPassword = !!data?.password && process?.env?.adminPassword === data?.password;

  if( !validUsername ) {
    console.error( gt(), `[${ getRemoteAddress( socket ) }] - invalid username '${ data?.username }'` )
    emit( responseMessage, { error: 'invalid username' }, socket );
    return;
  }
  if ( !validPassword ) {
    console.error( gt(), `[${ getRemoteAddress( socket ) }] - invalid password` )
    emit( responseMessage, { error: 'invalid password' }, socket );
    return;
  }

  let token = await generateToken({ username: data?.username });
  if( validUsername && validPassword && token ) {
    console.error( gt(), `[${ getRemoteAddress( socket ) }] - '${ data?.username }' signed in` )
    emit( responseMessage, { error: false, token })
    return;
  }
  
  emit( responseMessage, { error: 'error logging in' }, socket );
}


/**
 * get the ip address of the user
 * 
 * @param {socket} socket socket.io object
 * @returns {string} clients ip address
 */
function getRemoteAddress( socket ) {
  return socket?.handshake?.headers?.['x-forwarded-for'] || socket?.conn?.remoteAddress;
}


/**
 * generate a JWT token
 * 
 * @param {object} payload payload to be encoded
 * @returns {string} JWT token
 */
async function generateToken( payload ) {
  let token = false;

  await new Promise( resolve => {
    jwt.sign( payload, secretSharedKey, { expiresIn: '32d' }, ( error, _token ) => {
      if ( error ) {
        console.error( 'error generating JWT token', error );
        resolve();
      }
      token = _token;
      resolve();
    });
  })

  return token;
}


/**
 * starts the factorio server process
 * 
 * @param {string} type
 * @param {*} socket
 * @param {*} data
 */
async function startServer( type, socket, data ) {
  console.log( gt(), `starting game server` );
  let binary = '/opt/factorio/bin/x64/factorio';

  let args = [
    '--start-server',    '/opt/factorio/saves/20220110.zip',
    '--server-settings', '/opt/factorio/data/server-settings.json',
    '--rcon-bind', `${ RCON_HOST }:${ RCON_PORT }`,
    '--rcon-password', RCON_PASS,
  ];
  console.log( [ binary, ...args ].join(' ') )
  emit( 'serverStarted', {} );
  serverProcess = child_process.spawn( binary, args, {} )
  serverRunning = !!serverProcess;

  // attempt a connection to the rcon port
  setTimeout( rconConnect, 10000 );

  let interval;
  setTimeout(() => {
    interval = setInterval( checkPeriodically, 20000 );
    checkOnServerStart()
  }, 20000 );

  serverProcess.stdout.on('data', async output => {
    output = await parseGameStdOutAndErr( output );

    for( let data of output ) {
      let dataObject = { data, date: ( new Date() ).getTime(), type: 'stdout' }
      gameData.push( dataObject )
      emit( 'gameData', dataObject );
      checkDataForEvents( data );
    }
  })
  serverProcess.stderr.on('data', async output => {
    output = await parseGameStdOutAndErr( output );

    for( let data of output ) {
      let dataObject = { data, date: ( new Date() ).getTime(), type: 'stderr' }
      gameData.push( dataObject )
      console.log( 'error', data );
      emit( 'gameData', dataObject );
    }
  })

  serverProcess.on( 'close', async ( signal ) => {
    clearInterval( interval );
    try { await rcon.end(); } catch(___) {}
    serverRunning = false;
    emit( 'serverStopped', { signal } );
    rcon = null;
  })
}


/**
 * parses server console logs to individual lines
 * 
 * @param {string} data
 * @returns {string|string[]}
 */
async function parseGameStdOutAndErr( data = '' ) {
  return data.toString()
    .split( '\n' ).map( x => x.trim().replace( /^((\d+\.\d+)|(\d{4}-\d{2}-\d{2}\s+\d{2}\:\d{2}\:\d{2})\s+)/gmi, '' ) )
    .filter( x => !!x && x !== '' );
}

async function checkPeriodically() {
  if( rconConnected ) {
    status.time      = ( await rconCommand('time')       || '' ).trim();
    status.evolution = ( await rconCommand('evolution')  || '' ).trim();
    let whitelist = ( await rconCommand('whitelist get') || '' ).trim().replace('The whitelist is empty.', '' ).replace('Whitelisted players: ', '').split(' ');
    let banlist   = ( await rconCommand('banlist get')   || '' ).trim().replace('The banlist is empty.',   '' ).replace('Banned players: ', '').split(' ');
    let admins    = ( await rconCommand('admins')        || '' ).trim().replace('No length',               '' ).split('\n').map( x => x.trim() );
    let players   = ( await rconCommand('players')       || '' ).trim()
      .replace(/^Players\s+\(\d+\)\:\n/gmi, '')
      .split('\n').map( x => x.trim() )
      .map( y => y.replace(')','').split('(') )
      .map( x => ({
        user: x[0],
        online: !!x[1],
        banlisted:     banlist.indexOf( x[0] ) > -1,
        whitelisted: whitelist.indexOf( x[0] ) > -1,
        admin:          admins.indexOf( x[0] ) > -1,
        ignored: false,
        muted: false,
      }) );

    users = players;
    emit( 'usersList', users );
  }
}


async function checkOnServerStart() {
  if( rconConnected ) {
    await checkPeriodically();
    status.version = ( await rconCommand('version') || '' ).trim();
    status.seed    = ( await rconCommand('seed')    || '' ).trim();
  }
}


/**
 * stop the factorio server process
 * 
 * @param {string} type
 * @param {*} socket
 * @param {*} data
 */
async function stopServer( type, socket, data ) {
  if ( serverProcess ) {
    serverRunning = false;
    await rconCommand('/quit');

    await serverProcess.kill('SIGKILL');
    serverProcess = null;
    emit( 'serverStopped', { signal: 'SIGKILL' } );
    rcon = null;
  }
}


/**
 * connect to the RCON port of factorio
 */
async function rconConnect() {
  rcon = new Rcon({ host: RCON_HOST, port: RCON_PORT, password: RCON_PASS });

  rcon.connect().catch( error => {
    console.error( error );

    // try again with a max of 10 tries in a cooldown of 5 seconds per try
    if ( rconConnectAttempts <= 10 ) {
      console.log( `Reconnect attempt ${ rconConnectAttempts }/10..` )
      setTimeout( function () { rconConnect(); rconConnectAttempts++ }, 5000 )
    }
  } );

  // Connected, which means the connection is successful
  rcon.on( "connect", () => {
    rconConnected = true;
    console.log( gt(), 'RCON connected' );
  });

  // Authenticated, which means the authentication is successful and the system is online
  rcon.on( "authenticated", () => {
    console.log( gt(), 'RCON Authenticated!' )
    rcon.send( 'factorio server manager connected' );
  } );

  // In case any errors occour, log them to console and terminate the connection
  rcon.on( "error", ( err ) => {
    console.error( gt(), `Error: ${ err }` );
    try{ rcon.end(); } catch(___) {}
  } );

  // In case the connection was ended, terminated or whatever else happened. Log a message and reconnect
  rcon.on( "end", () => {
    rconConnected = false;
    if ( serverRunning ) {
      console.log( gt(), `Socket connection ended! Reconnecting..` )
      rconConnect();
    }
  } );
}


/**
 * rconCommand function
 *	Returns an array of 2, first being the command response, second being the error (if there is one, otherwise it's empty)
 */
async function rconCommand( command ) {
  if ( !command.startsWith( "/" ) ) command = `/${command}`;
  try {
    let resp = await rcon.send( command );
    if ( typeof resp == "string" && resp.length )
      return resp;
    else
      return "No length";
  } catch ( error ) {
    return `RCON Error --- Details --- \nNAME: ${ error.name } \nDESC: ${ error.description }`;
  }
}


/**
 * send a command to rcon
 * 
 * @param {string} type
 * @param {*} socket
 * @param {*} data
 */
async function sendRconCommand( type, socket, data ) {
  if ( data?.command && data?.command.toString() !== '' ) {
    if ( !rconConnected ) {
      console.log( gt(), 'RCON is not connected' )
      return;
    }
    let response = await rconCommand( data?.command );
    let payload = {
      time: ( new Date() ).getTime(),
      response: ( response || 'undefined response' ).toString().trim(),
      id: data?.id,
      command: data?.command
    }
    emit( 'receivedRconCommand', payload, socket );
  }
}


/**
 * parse game stdout data for important things
 * 
 * @param {string} data stdout string from game
 */
function checkDataForEvents( data ) {
  // 2022-01-10 04:19:32 [JOIN] pcnate joined the game
  let userJoinRegEx = /\[JOIN\]\s+(.*)\sjoined\sthe\sgame/gmi;
  // 2022-01-10 04:20:53 [CHAT] pcnate: test
  let chatRegEx = /\[CHAT\]\s+(.*?)\:\s(.*)/gmi;
  // 2022-01-10 04:24:30 [LEAVE] pcnate left the game
  let userLeftRegEx = /\[LEAVE\]\s+(.*)\sleft\sthe\sgame/gmi;

  let userJoinResults = userJoinRegEx.exec( data );
  if( userJoinResults ) {
    userJoin( userJoinResults[ 1 ] )
  }
  let chatResults = chatRegEx.exec( data );
  if( chatResults     ) {
    newChat( chatResults[ 1 ], chatResults[ 2 ] );
  }
  let userLeftResults = userLeftRegEx.exec( data );
  if( userLeftResults ) {
    userLeft( userLeftResults[ 1 ] );
  }
}


/**
 * check io connection and send an event
 * 
 * @param {string} message message type to be sent
 * @param {object} data payload to send
 * @param {object} socket optional client socket
 */
async function emit( message, data, socket = null ) {
  let _socket = !!socket ? socket : io;
  if ( !!_socket ) {
    _socket.emit( message, data );
  }
}


/**
 * handle all the socket connection carp
 */
async function makeSocketIoBindings() {
  io.on( 'connection', socket => {
    console.log( gt(), `[${ getRemoteAddress( socket ) }] Socket ${ socket.id } has connected`);

    if ( process.env.environment === 'dev' ) {
      emit('process_id', process?.pid, socket );
    }

    socket.on('getLanding',         data =>         getLanding( 'getLanding',         socket, data ) );
    socket.on('getChats',           data =>           getChats( 'getChats',           socket, data ) );
    socket.on('getUsers',           data =>           getUsers( 'getUsers',           socket, data ) );
    socket.on('getSettings',        data =>        getSettings( 'getSettings',        socket, data ) );
    socket.on('loadGameData',       data =>       loadGameData( 'loadGameData',       socket, data ) );
    socket.on('getOnlineUserCount', data => getOnlineUserCount( 'getOnlineUserCount', socket, data ) );
    socket.on('getAccount',         data =>         getAccount( 'getAccount',         socket, data ) );
    socket.on('startServer',        data =>        startServer( 'startServer',        socket, data ) );
    socket.on('stopServer',         data =>         stopServer( 'stopServer',         socket, data ) );
    socket.on('sendRconCommand',    data =>    sendRconCommand( 'sendRconCommand',    socket, data ) );
    socket.on('getLicense',         data =>         getLicense( 'getLicense',         socket, data ) );
    
    socket.on('login',              data =>         checkLogin( 'login',              socket, data ) );
  } );
}


/**
 * reads the license file and sends it to the server
 * 
 * @param {string} type
 * @param {*} socket
 * @param {*} data
 * @returns {void}
 */
async function getLicense( type, socket, data ) {
  let responseMessage = data?.responseMessage;
  let file = path.join( process.cwd(), 'thirdPartyLicense.txt' );
  if ( !fs.existsSync( file ) ) {
    console.error('thirdPartyLicense.txt not found');
    // response.status( 404 ).send('thirdPartyLicense.txt not found');
    emit( responseMessage, { error: true, license: 'document not found' }, socket );
    return;
  }

  let contents = ( fs.readFileSync( file ) || '' ).toString();
  emit( responseMessage, { license: contents }, socket );
}

app.get('/download/saves/:saveName', async( request, response ) => {
  const fname = request?.params?.saveName || null;
  if ( !fname ) {
    response.status( 404 ).send( `save '${ fname }' not found` );
  }

  const savePath = path.sep + path.join( ...[ 'opt', 'factorio', 'saves', fname ] );
  if ( fs.existsSync( savePath ) ) {
    const fstream = fs.createReadStream( savePath );
    fstream.on('end', () => response.end() );
    fstream.pipe( response );
  } else {
    console.error( `unable to find save file '${ savePath }'`)
    response.status( 500 ).send( `error reading save '${ fname }'`);
  }
});

if ( process.env.useDistFolder === 'true' ) {
  let distFolder = path.join( path.dirname( __dirname ), 'dist', 'webapp' );
  console.log({ distFolder })
  app.use( '*', express.static( distFolder ) );
} else {
  require('./dev-server')( app, server, io );
}

server.listen( port, '127.0.0.1', async () => {
  let address = server.address();
  io = socketIO( server );
  await makeSocketIoBindings();
  console.log( gt(), `Server listening via ${ address?.family } at http://${ address?.address }:${ address?.port }` )

  if( process?.env?.autoStart === 'true' || process?.env?.autoStart === '1' ) {
    console.log( gt(), 'autostarting the game' );
    startServer();
  }

  setInterval( () => {
    emit( 'updateTick', {
      serverRunning,
      rconConnected,
      onlineUserCount: users.filter( x => !!x?.online ).length,
      time: status?.time,
      seed: status?.seed,
      version: status?.version,
      evolution: status?.evolution,
    } );
  }, 1000 );
} );