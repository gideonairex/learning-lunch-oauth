'use strict';

const r       = require( 'request' );
const _       = require( 'lodash' );
const Promise = require( 'bluebird' );
const redis   = require( 'redis' );
const uuid    = require( 'uuid' );

// User database for now
let users = [];

module.exports = {

	'githubRequest' : function ( options ) {

		let request = {
			'method' : options.method,
			'url' : 'https://api.github.com' + options.route,
			'json' : true,
			'headers' : {
				'User-Agent' : 'gideonairex',
				'Authorization' : 'token ' + options.access_token,
				'Accept' : 'application/vnd.github.v3+json'
			}
		};

		if( options.method === 'POST' || options.method === 'PUT' ) {
			request.body = options.body;
		}

		return new Promise( function ( resolve, reject ) {
			r( request, function ( error, response, body ) {
				if ( error ) {
					return reject( error );
				}
				return resolve( body );
			} );
		} );
	},

	'registerUser' : function ( registerUser ) {

		let user = _.find( users, function ( u ) {
			return registerUser.id === u.id;
		} );

		if( !user ) {
			users.push( registerUser );
			return true;
		}
		return false;
	},

	'createSession' : function ( user, token ) {
		let sessionToken = uuid.v4();
		let data = {
			'user' : user,
			'access_token' : token
		};

		let multi = redis.client.multi();
		multi
			.hmset( sessionToken, data )
			.expire( sessionToken, 60 )
			.exec( function () {
				console.log( arguments );
			} );
		return sessionToken;
	},

	'getUsers' : function () {
		return users;
	},

	'checkAuth' : function ( github, cb ) {
		return redis.client.hgetall( github.session, cb );
	}

};
