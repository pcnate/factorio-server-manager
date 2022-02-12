/**
 * source: https://github.com/narc0tiq/factorio-updater/blob/master/update_factorio.py
 */

const minimist = require( 'minimist' );
const fs       = require( 'fs' );
const path     = require( 'path' );
const os       = require( 'os' );
const url      = require( 'url' );
const https    = require( 'https' );
const http     = require( 'http' );
const axios    = require( 'axios' );
const child_process = require('child_process');
const semverSort = require('semver-sort');

const SERVER_SETTINGS_FILE = '/opt/factorio/data/server-settings.json';
const TIMEOUT = 10000;

let args = {};
let glob = { verbose: false };


/**
 * turn a object payload into a query string
 * 
 * @param {object} parameters
 * @returns {string}
 */
async function build_get_query_string( parameters = {} ) {
  if ( !parameters || Object.keys( parameters ).length < 1 ) {
    return '';
  }

  return '?'+Object.keys( parameters ).map( x => [ encodeURI( x ), encodeURI( parameters[ x ] ) ].join('=') ).join('&');
}

async function get_updater_data( username, token ) {

  let payload = { username, token, 'apiVersion': 2 }
  let _request = await axios.get('https://updater.factorio.com/get-available-versions' + await build_get_query_string( payload ) )

  if ( _request.status != 200 )
    console.error( 'Could not download version list.', _request.status );
      // throw DownloadFailed('Could not download version list.', r.status )
  if ( glob?.verbose ) {
    if ( !!token ) {
      console.log( _request.config.url.replace( token, '<secret>' ) );
    } else {
      console.log( _request.config.url );
    }
  }
  return _request.data
}


async function pick_updates( updater_json, factorio_package, from_version, experimental = false ) {
  let latest = [ null, null ];
  let available_updates = {};
  let current_version = from_version;
  let updates = [];

  // Get latest stable version
  for( row of updater_json[factorio_package] ) {
    if ( typeof row?.from === 'undefined' ) {
      latest[0] = row?.stable;
      continue;
    }
  }

  // Get latest experimental version
  // if ( !experimental ) {
  //   for( row of updater_json[ factorio_package ] ) {
  //     if ( !!row?.from )
  //       latest[1] = max( latest[1], row?.to, key=version_key );
  //   }
  // }


  // Get available updates
  for( row of updater_json[ factorio_package ] ) {

    let max = semverSort.desc( [ row?.from ,current_version ].filter( x => !!x ) );
    let min = semverSort .asc( [ row?.to   ,latest?.[0]     ].filter( x => !!x ) );

    // if from_version >= current_version...
    if( !!row?.from && max?.[0] === row?.from ) {
      
      // ...and not experimental and to_version <= last_stable
      if ( !experimental && min?.[0] === row?.to ) {
        // record this update
        available_updates[ row?.from ] = row?.to;
        // ...or if experimental
      } else if ( experimental ) {
        // record this update
        available_updates[ row?.from ] = row?.to;
      }

    }
  }

  
  // Create update list
  while( current_version in available_updates ) {
    new_version = available_updates[ current_version ];

    let max = semverSort.desc( [ current_version, latest?.[0] ].filter( x => !!x ) );
    if ( !experimental && max?.[0] === current_version ) {
      break
    }
    
    updates.push({'from': current_version, 'to': new_version});
    current_version = new_version;
  }
  
  return [ updates, latest ];
}


async function get_update_link( username, token, package, update ) {
  let payload = {
    username,
    token,
    package,
    'from': update?.from,
    'to': update?.to,
    'apiVersion': 2
  }

  let _request = await axios.get('https://updater.factorio.com/get-download-link' + await build_get_query_string( payload ) );

  if ( glob?.verbose ) {
    if ( !!token ) {
      console.log( _request.config.url.replace( token, '<secret>' ) );
    } else {
      console.log( _request.config.url );
    }
  }
  if ( _request.status != 200 ) {
    console.error( 'Could not obtain download link.', _request.status, update );
  }
  // throw DownloadFailed('Could not obtain download link.', _request.status, update)
  return _request.data?.[0]
}


async function zip_valid( fpath ) {
  // with ZipFile(fpath,'r') as zf:
  //     if zf.testzip() is not None:
  //         zf.close()
  //         os.unlink(fpath)
  //         return false
  return true
}


async function fetch_update( output_path, _url, ignore_existing_files, verify_zip ) {

  let fname = path.basename( ( new URL( _url ) ) ?.pathname );
  let fpath = path.join( output_path, fname );

  console.log({
    output_path,
    _url,
    ignore_existing_files,
    verify_zip,
    fname,
    fpath,
  })
  // fname = posixpath.basename( url_parse.urlsplit( url ).path );
  // fpath = os.path.join( output_path, fname );

  if ( fs.existsSync( fpath ) && ignore_existing_files !== true ) {
    if ( verify_zip ) {

      if ( await zip_valid( fpath ) ) {
        if ( glob?.verbose ) {
          console.log(`File ${ fpath } already exists and is a valid zip file` );
        }
        return fpath // early out, we must've already downloaded it
      } else {
        pass // fall through to try and download it again.
      }
    } else {
      if ( glob?.verbose ) {
        console.log(`File ${ fpath } already exists, assuming it's correct...` );
      }
      return fpath // early out, we must've already downloaded it
    }
  }

  // r = requests.get(url, stream=true)
  // with open(fpath, 'wb') as fd:
  //     for chunk in r.iter_content(8192):
  //         fd.write(chunk)

  //     fd.flush()
  //     fd.seek(0, os.SEEK_SET)

  //     if ( verify_zip ) {
  //       if ( !zip_valid(fd) ) {
  //         console.error('Downloaded file %s was not a valid zip file' % fpath)
  //         // throw RuntimeError('Downloaded file %s was not a valid zip file' % fpath)
  //       }
  //     }

  await download( _url, fpath );

  return fpath;
}

function download( url, destinationFile ) {
  const uri = new URL( url );
  if ( !destinationFile ) {
    console.error('destination must be specified');
    return;
  }

  const pkg = (url+'').toLowerCase().startsWith('https') ? https : http;

  return new Promise( ( resolve, reject ) => {
    const _request = pkg.get( uri.href ).on('response', response => {

      // create the file write stream
      const file = fs.createWriteStream( destinationFile, { flags: 'wx' });

      // cleanup the connection
      response.on('end', () => {
        file.end();
        resolve();
      });

      // handle errors
      response.on('error', error => {
        file.destroy();
        fs.unlink( destinationFile, () => reject( error ) );
      });

      // pipe the response to the file
      response.pipe( file );

    });

    _request.setTimeout( TIMEOUT, () => {
      _request.destroy()
      reject( new Error(`Request timeout after ${ TIMEOUT / 1000.0 }s`) );
    } );
  });
}

async function verbose_aware_exec( exec_args, verbose=false ) {
  return new Promise( async resolve => {

    let [ binary, ...arg_array ] = exec_args;

    console.log({
      exists: fs.existsSync( arg_array?.[1] ),
      zip: arg_array?.[ 1 ],
      exec_args,
      verbose,
      binary,
      arg_array,
    });
    try {
  
      let packageNameProcess = child_process.spawn( binary, arg_array, {} )
      packageNameProcess.stdout.on( 'data', data => {
        if ( verbose ) {
          console.log( (data||'').toString() )
        }
      })
      packageNameProcess.on( 'close', code => {
        resolve();
        return;
      })
      packageNameProcess.on( 'exit', code => {
        resolve();
        return;
      })
      // captured = subprocess.check_output(exec_args, stderr=subprocess.STDOUT)
      if ( verbose ) {
        console.log(captured)
      }
    } catch( ex ) {
      // except subprocess.CalledProcessError as ex:
      console.log( ex?.output )
    }

    
  });
}


async function find_package( args ) {
  if ( !!args?.package ) {
    return args?.package
  }

  if ( !args?.package && !!args?.apply_to ) {
    return await find_package_helper( args?.apply_to );
  }
}


/**
 * use the game binary to get the version
 * 
 * @param {string} binary binary path of game
 * @returns {string}
 */
async function find_package_helper( binary ) {
  return new Promise( async resolve => {
    
    let packageNameProcess = child_process.spawn( binary, [ "--version" ], {} )
    let packageName = '';
    
    let sourceVersionRegEx = /^Version: (\d+\.\d+\.\d+)\s+\(build\s+(\d+)\,\s+(linux|mac|win)(\d{0,2})\,\s+(\w+)\)/gmi;
    
    packageNameProcess.stdout.on('data', data => {
      let sourceVersionResults = sourceVersionRegEx.exec( data );

      if ( sourceVersionResults && !!sourceVersionResults[ 1 ] ) {
        version = sourceVersionResults[ 1 ];
        let headless = sourceVersionResults[ 5 ] === 'headless' ? '_headless' : '';
        packageName = `core-${ sourceVersionResults[ 3 ] }${ headless }${ sourceVersionResults[ 4 ] }`;
      }
    });
    
    packageNameProcess.on('close', code => {
      resolve( packageName );
    });
    packageNameProcess.on('exit', code => {
      resolve( packageName );
    });

  });
}


/**
 * find the starting version of the game
 * 
 * @param {object} args
 * @returns {string}
 */
async function find_version( args ) {
  if ( !!args?.for_version ) {
    return args?.for_version;
  }

  if ( !args?.for_version && !!args?.apply_to ) {
    return await find_version_helper( args?.apply_to );
  }
}


/**
 * use the game binary to get the version
 * 
 * @param {string} binary binary path of game
 * @returns {string}
 */
async function find_version_helper( binary ) {
  return new Promise( async resolve => {
    
    let versionProcess = child_process.spawn( binary, [ "--version" ], {} )
    let version = '';
    
    let sourceVersionRegEx = /^Version: (\d+\.\d+\.\d+)/gmi;
    
    versionProcess.stdout.on('data', data => {
      let sourceVersionResults = sourceVersionRegEx.exec( data );
      if ( sourceVersionResults && !!sourceVersionResults[ 1 ] ) {
        version = sourceVersionResults[ 1 ];
      }
    });
    
    versionProcess.on('close', code => {
      resolve( version );
    });
    versionProcess.on('exit', code => {
      resolve( version );
    });

  });
}


async function announce_no_updates( args, for_version, latest ) {
  message = 'No updates available for version %s' % for_version
  if ( !args?.experimental ) {
    if ( latest[0] ) {
        message += ' (latest stable is %s).' % latest[0]
    } else {
      message += '.'
    }
    message += ' Did you want `--experimental`?'
  } else {
    message += ' (latest experimental is %s).' % latest[1]
  }
  console.log( message )
}


async function apply_update( args, update ) {
  if ( args?.dry_run ) {
    console.log('Dry run: would have fetched update from %s to %s.' % (update['from'], update['to']))
    return
  }

  // let _url = 'https://dl.factorio.com/updates/core-linux_headless64-1.1.50-1.1.51-update.zip?secure=pmtlVnuoI6Pq7SA3mv2NFg,1643781186';
  let _url = await get_update_link( args?.user, args?.token, args?.package, update );
  if ( !_url ) {
    // throw RuntimeError('Failed to obtain URL for update from %s to %s.' % (update['from'], update['to']))
    console.trace('Failed to obtain URL for update from %s to %s.' % (update['from'], update['to']));
  }

  let fpath = await fetch_update( args?.output_path, _url, args?.ignore_existing_files, args?.verify_zip );
  // let fpath = '/opt/factorio/updates/core-linux_headless64-1.1.50-1.1.51-update.zip';
  
  if ( !args?.apply_to ) {
    console.log(`Wrote ${ fpath }s, apply with 'factorio --apply-update ${ fpath }s'`);
    return
  }

  update_args = [ args?.apply_to, "--apply-update", fpath ]
  console.log(`Applying update with '${ update_args.join(' ' ) }'.` );
  await verbose_aware_exec( update_args, args.verbose )

  if ( args.delete_after_apply ) {
    console.log('Update applied, deleting temporary file %s.' % fpath)
    os.unlink(fpath)
  }
}


/**
 * Get credentials from CLI arguments.
 * 
 * @param {string} credentials_file
 * @param {string} user
 * @param {string} token
 * @returns {array}
 */
async function parse_credentials( credentials_file, username, token ) {
  if ( !!credentials_file ) {
    let data = '';
    let json = {};
    try {
      data = await fs.promises.readFile( credentials_file )
    } catch( error ) {
      console.error( `Can't read file ${ credentials_file }s` );
      throw new Error( `Can't read file ${ credentials_file }s` );
    }

    try {
      json = JSON.parse( ( data || '' ).toString() )
    } catch( error ) {
      console.error( `Can't decode JSON in ${ credentials_file }s` );
      throw new Error( `Can't decode JSON in ${ credentials_file }s` );
    }

    username = json?.username;
    token    = json?.token;

    if ( !username || !token ) {
      console.log(
        "WARNING: credentials file did not contain",
        "username/token! Attempting to continue without..."
      );
    }
  }
  return [ username , token ];
}


async function main( _args = null ) {
  if ( !!_args ) {
    args = _args;
  } else {
    args = minimist( process.argv.slice( 2 ) );
  }

  glob.verbose = !!args?.verbose;

  [ args.user, args.token ] = await parse_credentials( SERVER_SETTINGS_FILE, args?.user, args?.token )
  let updater_data = await get_updater_data( args?.user, args?.token );
  // console.log( JSON.stringify( updater_data ) )

  // return;
  if ( args?.list_packages ) {
    console.log('Available packages:')
    for( package of Object.keys( updater_data ) ) {
      console.log("\t", package )
    }
    return 0;
  }

  args.package     = await find_package( args );
  args.for_version = await find_version( args );

  if ( !args?.for_version ) {
    console.log( `Unable to determine source version. Please provide either a starting version (with --for-version) or a Factorio binary (with --apply-to).` )
    return 1
  }

  let [ updates, latest ] = await pick_updates( updater_data, args?.package, args?.for_version, args?.experimental );

  if ( !updates ) {
    await announce_no_updates( args, args?.for_version, latest );
    return 2
  }

  for( u of updates ) {
    console.log({
      u,
      args,
    })
    await apply_update( args, u );
  }

  // No updates remain; if an update failed, we will have exceptioned
  // out before getting here.
  // In dry-run mode, this simply signifies that updates were found.
  return 0
}

if ( require.main === module ) {
  ( async () => {

    let _x = {
      apply_to: '/opt/factorio/bin/x64/factorio',
      verbose: true,
      // list_packages: true,
      output_path: '/opt/factorio/updates/',
      verify_zip: true,
      ignore_existing_files: false,
    }

    await main( _x );

  })();
}


module.exports = {
  get_updater_data,
  pick_updates,
  get_update_link,
  zip_valid,
  fetch_update,
  verbose_aware_exec,
  find_package,
  find_version,
  announce_no_updates,
  apply_update,
  parse_credentials,
  main
}