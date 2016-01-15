'use strict';

const r = require( 'request' );
const handlers = require( '../handlers' );

module.exports = [

	// Directory
	{
		'method' : 'GET',
		'path' : '/{param*}',
		'handler' : {
			'directory' : {
				'path' : 'public'
			}
		}
	},

	// Redirect handler
	{
		'method' : 'GET',
		'path' : '/redirect-url',
		'handler' : function ( request, reply ) {
			let code = request.query.code;
			r( {
					'method' : 'POST',
					'url' : 'https://github.com/login/oauth/access_token',
					'body' : {
						'client_id'     : '860507173b6ec574e0ba',
						'client_secret' : 'b0d6a1cb42317c85cc7c5325d041be906e4fe324',
						'code'          : code
					},
					'json' : true
				}, function ( error, response, body ) {

					handlers.githubRequest( {
						'method'       : 'GET',
						'route'        : '/user',
						'access_token' : body.access_token
					} )
					.then( function ( user ) {
						handlers.registerUser( user );
						let sessionToken = handlers.createSession( user, body.access_token );
						return reply( user )
											.state( 'github', {
												'session' : sessionToken
											} );
					} )
					.catch( function ( error ) {
						return reply( error );
					} );

			} );
		}
	},

	// Checking auth get list of users
	{
		'method' : 'GET',
		'path' : '/users',
		'handler' : function ( request, reply ) {
			return handlers.checkAuth( request.state[ 'github' ], function ( error, session ) {
				if ( error ) {
					return reply( 'No session' ).code( 403 );
				} else {
					return reply( handlers.getUsers() );
				}
			} );
		}
	},

	// Get my repos
	{
		'method' : 'GET',
		'path' : '/me/repos',
		'handler' : function ( request, reply ) {
			return handlers.checkAuth( request.state[ 'github' ], function ( error, session ) {
				if ( error ) {
					return reply( 'No session' ).code( 403 );
				} else {
					handlers.githubRequest( {
						'method'       : 'GET',
						'route'        : '/user/repos',
						'access_token' : session.access_token
					} )
					.then( function ( repos ) {
						return reply( repos );
					} )
					.catch( function ( error ) {
						return reply( error );
					} );
				}
			} );
		}
	}

];
