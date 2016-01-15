'use strict';

const Hapi = require( 'hapi' );
const server = new Hapi.Server();

// Call redis
require( './redis' )();

server.connection( {
	'port' : 9090
} );

const plugins = [
	require( 'inert' )
];

server.register( plugins, ( err ) => {

	server.state( 'github', {
		'ttl'          : null,
		'encoding'     : 'base64json',
		'clearInvalid' : false, // remove invalid cookies
		'strictHeader' : true // don't allow violations of RFC 6265
	} );

	server.route( require( './routes' ) );

	if( err ) {
		return console.log( err );
	}

	server.start( () => {
		console.log( 'Server running at:', server.info.uri );
	} );

} );
