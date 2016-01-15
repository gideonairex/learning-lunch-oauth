'use strict';

// Load third-party modules
var redis = require( 'redis' );

module.exports = function () {

	// Call redis
	redis.client = redis.createClient( 6379, 'localhost' );

	redis.client
		.on( 'connect', function () {
			redis.client.unref();
			console.log( 'REDIS connected' );
		} )
		.on( 'error', function ( error ) {
			console.log( error.message );
		} );

};
