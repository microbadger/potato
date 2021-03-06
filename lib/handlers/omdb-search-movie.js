'use strict';

let OmdbAPI = require('../omdb');

let omdb = new OmdbAPI();

function searchMovieHandler(message, callback) {
	let movieTitle = message.matchResult[1];

	let sayMessage = null;

	omdb.search({movieTitle}, (err, movies) => {
		if (err && err.code === 'no_movies_found') {
			sayMessage = `I didn't find anything`;
			callback(sayMessage);
		} else {
			sayMessage = _composeResponseMessage(movies);
			callback(sayMessage);
		}
	});
}

function _composeResponseMessage(movies) {
	let message = `I found the following `;
	if (movies.length > 1) {
		message += `movies: \n`;
		for (const movie of movies) {
			if (movie.type === 'movie') {
				message += `• ${movie.title} (${movie.year})  :id: _<http://www.imdb.com/title/${movie.imdb}|${movie.imdb}>_\n`;
			}
		}
	} else {
		message += `movie: ${movies[0].title} (${movies[0].year})  :id: _<http://www.imdb.com/title/${movies[0].imdb}|${movies[0].imdb}>_`;
	}
	return message;
}

module.exports = searchMovieHandler;
