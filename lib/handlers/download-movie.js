'use strict';

let config = require('../../config');
let CouchAPI = require('../couchpotato');
let OmdbAPI = require('../omdb');

let couch = new CouchAPI(config.get('couch'));
let omdb = new OmdbAPI();

function downloadMovieHandler(message, callback) {
	let movie = message.matchResult[1];
	// Check if movie is an imdbId
	if (movie.match(/tt(.*)/, 'i')) {
		downloadFromImdbId(movie, callback);
	} else {
		downloadMovieByTitle(movie, callback);
	}
}

function downloadFromImdbId(imdbId, callback) {
	let sayMessage = null;

	couch.addMovie(imdbId, (err, result) => {
		if (err) {
			sayMessage = `This is not an IMDB id.. Don't play with me!`;
		} else {
			const movie = result.movie;
			const title = movie.title;
			const movieInfo = movie.info;
			const year = `(${(movieInfo && movieInfo.year) ? movieInfo.year : 'x'})`;
			const rating = `${(movieInfo && movieInfo.rating) ? movieInfo.rating.imdb[0] : ''}`;

			if (title) {
				sayMessage = `Added ${title} ${year} with IMDB rating: ${rating} to wanted list.`;
			} else {
				sayMessage = `Can't add this movie to wanted list. Check my console/logs..`;
			}
		}
		callback(sayMessage);
	});
}

function downloadMovieByTitle(movieTitle, callback) {
	let sayMessage = null;

	omdb.get({movieTitle}, (err, movie) => {
		if (err) {
			if (err.code === 'no_movie_found') {
				sayMessage = `I was not able to find ${movieTitle} :disappointed:`;
			} else {
				sayMessage = 'I failed :disappointed: check my console.. :';
			}
			callback(sayMessage);
		} else {
			couch.addMovie(movie.imdb.id, error /* , result) */ => {
				/* eslint-disable no-negated-condition */
				if (!error) {
					sayMessage = `Added ${movie.title} (${movie.year}) with IMDB rating: ${movie.imdb.rating} to wanted list.`;
				} else {
					sayMessage = `I was not able to add that movie to couchpotato :disappointed:, check my console for more information..`;
				}
				/* eslint-enable no-negated-condition */
				callback(sayMessage);
			});
		}
	});
}

module.exports = downloadMovieHandler;
