const { Pool, types } = require('pg');
const config = require('./config.json');

// Override the default parsing for BIGINT (PostgreSQL type ID 20)
types.setTypeParser(20, (val) => parseInt(val, 10)); //DO NOT DELETE THIS

// Create PostgreSQL connection using database credentials provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = new Pool({
	host: config.rds_host,
	user: config.rds_user,
	password: config.rds_password,
	port: config.rds_port,
	database: config.rds_db,
	ssl: {
		rejectUnauthorized: false,
	},
});
connection.connect((err) => err && console.log(err));


/******************
* ARTWORKS ROUTES *
******************/
// Route: GET /search_artworks
const search_artworks = async function (req, res) {
  const q = req.query.q ?? '';
  const museum = req.query.museum ?? '';
  const yearLow = req.query.year_low ?? 0;
  const yearHigh = req.query.year_high ?? 3000;
  const medium = req.query.medium ?? '';
  const nationality = req.query.nationality ?? '';

  const searchPattern = q === '' ? '%' : `%${q}%`;

  connection.query(
    `
    SELECT
      a.artworkid AS artwork_id,
      a.title,
      ar.name AS artist,
      COALESCE(a.yearstart, a.yearend) AS year,
      a.medium,
      a.museum,
      COALESCE(ar.nationality, a.nationality) AS artist_nationality
    FROM Artwork a
    LEFT JOIN Artist ar ON a.artistid = ar.artistid
    WHERE (a.title ILIKE $1 OR ar.name ILIKE $1)
      AND ($2 = '' OR a.museum = $2)
      AND ($3 = '' OR a.medium = $3)
      AND ($4 = '' OR ar.nationality = $4)
      AND COALESCE(a.yearstart, a.yearend) BETWEEN $5 AND $6
    ORDER BY year ASC, a.title ASC
    `,
    [searchPattern, museum, medium, nationality, yearLow, yearHigh],
    (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data.rows);
      }
    }
  );
};

// Route 4: GET /learnartists/:minimum
const learnartists = async function (req, res) {
    // here we implement a route that gives you the avg time and num pieces of each artist
    const minimum = req.params.minimum;
    connection.query(
    `
    SELECT
        Artist.Name AS Artist,
        COUNT(*) AS TotalArtCount,
        AVG(Artwork.YearEnd - Artwork.YearStart) AS AvgTime
    FROM Artist
    JOIN Artwork ON Artist.ArtistID = Artwork.ArtistId
    GROUP BY Artist.ArtistID
    HAVING 
        COUNT(*) >= '${minimum}'
        AND AVG(Artwork.YearEnd - Artwork.YearStart) >= ALL (
            SELECT AVG(aw.YearEnd - aw.YearStart)
            FROM Artist a2
            JOIN Artwork aw ON a2.ArtistID = aw.ArtistId
            GROUP BY a2.ArtistID
        )
    ORDER BY AvgTime DESC;
    `,
        [minimum],
        (err, data) => {
            if (err) {
                console.log(err);
                res.json({});
            } else {
                res.json(data.rows[0]);
            }
        }
    );
};


// Route 6: GET /topartists/:museum
const topartists = async function (req, res) {
  const museum = req.params.museum || '';

  connection.query(
    `
    SELECT
      a.artistid,
      a.name AS artistname,
      aw.museum,
      COUNT(aw.artworkid) AS artworkcount
    FROM artwork aw
    JOIN artist a ON aw.artistid = a.artistid
    WHERE ($1 = '' OR aw.museum = $1)
    GROUP BY a.artistid, a.name, aw.museum
    ORDER BY artworkcount DESC, a.name ASC
    LIMIT 10;
    `,
    [museum],
    (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data.rows);
      }
    }
  );
};


module.exports = {
	search_artworks,
	learnartists,
	topartists,
};

// /******************
//  * WARM UP ROUTES *
//  ******************/

// // Route 1: GET /author/:type
// const author = async function (req, res) {
// 	// TODO (TASK 1): replace the values of name and pennkey with your own
// 	const name = 'Sophia Tang';
// 	const pennkey = 'sophtang';

// 	// checks the value of type in the request parameters
// 	// note that parameters are required and are specified in server.js in the endpoint by a colon (e.g. /author/:type)
// 	if (req.params.type === 'name') {
// 		// res.json returns data back to the requester via an HTTP response
// 		res.json({ data: name });
// 	} else if (req.params.type === 'pennkey') {
// 		// TODO (TASK 2): edit the else if condition to check if the request parameter is 'pennkey' and if so, send back a JSON response with the pennkey
// 		res.json({ data: pennkey });
// 	} else {
// 		res.status(400).json({});
// 	}
// };

// // Route 2: GET /random
// const random = async function (req, res) {
// 	// you can use a ternary operator to check the value of request query values
// 	// which can be particularly useful for setting the default value of queries
// 	// note if users do not provide a value for the query it will be undefined, which is falsey
// 	const explicit = req.query.explicit === 'true' ? 1 : 0;

// 	// Here is a complete example of how to query the database in JavaScript.
// 	// Only a small change (unrelated to querying) is required for TASK 3 in this route.
// 	connection.query(
// 		`
//     SELECT *
//     FROM Songs
//     WHERE explicit <= ${explicit}
//     ORDER BY RANDOM()
//     LIMIT 1
//   `,
// 		(err, data) => {
// 			if (err) {
// 				// If there is an error for some reason, print the error message and
// 				// return an empty object instead
// 				console.log(err);
// 				// Be cognizant of the fact we return an empty object {}. For future routes, depending on the
// 				// return type you may need to return an empty array [] instead.
// 				res.json({});
// 			} else {
// 				// Here, we return results of the query as an object, keeping only relevant data
// 				// being song_id and title which you will add. In this case, there is only one song
// 				// so we just directly access the first element of the query results array (data.rows[0])
// 				// TODO (TASK 3): also return the song title in the response
// 				res.json({
// 					song_id: data.rows[0].song_id,
// 					title: data.rows[0].title,
// 				});
// 			}
// 		}
// 	);
// };

// /********************************
//  * BASIC SONG/ALBUM INFO ROUTES *
//  ********************************/

// // Route 3: GET /song/:song_id
// const song = async function (req, res) {
// 	// TODO (TASK 4): implement a route that given a song_id, returns all information about the song
// 	// Hint: unlike route 2, you can directly SELECT * and just return data.rows[0]
// 	// Most of the code is already written for you, you just need to fill in the query
// 	const songId = req.params.song_id;
// 	connection.query(
// 		`
//     SELECT * 
//     FROM Songs
//     WHERE song_id = $1;
//     `,
// 		[songId],
// 		(err, data) => {
// 			if (err) {
// 				console.log(err);
// 				res.json({});
// 			} else {
// 				res.json(data.rows[0]);
// 			}
// 		}
// 	);
// };

// // Route 4: GET /album/:album_id
// const album = async function (req, res) {
// 	// TODO (TASK 5): implement a route that given a album_id, returns all information about the album
// 	const albumId = req.params.album_id;
// 	connection.query(
// 		`
//     SELECT * 
//     FROM Albums
//     WHERE album_id = $1;
//     `,
// 		[albumId],
// 		(err, data) => {
// 			if (err) {
// 				console.log(err);
// 				res.json({});
// 			} else {
// 				res.json(data.rows[0]);
// 			}
// 		}
// 	);
// };

// // Route 5: GET /albums
// const albums = async function (req, res) {
// 	// TODO (TASK 6): implement a route that returns all albums ordered by release date (descending)
// 	// Note that in this case you will need to return multiple albums, so you will need to return an array of objects
// 	connection.query(
// 		`
//     SELECT * 
//     FROM Albums
//     ORDER BY release_date DESC;
//     `,
// 		(err, data) => {
// 			if (err) {
// 				console.log(err);
// 				res.json([]);
// 			} else {
// 				res.json(data.rows);
// 			}
// 		}
// 	);
// };

// // Route 6: GET /album_songs/:album_id
// const album_songs = async function (req, res) {
// 	// TODO (TASK 7): implement a route that given an album_id, returns all songs on that album ordered by track number (ascending)
// 	const albumId = req.params.album_id;
// 	connection.query(
// 		`
//     SELECT song_id, title, number, duration, plays
//     FROM Songs
//     WHERE album_id = $1
//     ORDER BY number ASC;
//     `,
// 		[albumId],
// 		(err, data) => {
// 			if (err) {
// 				console.log(err);
// 				res.json([]);
// 			} else {
// 				res.json(data.rows);
// 			}
// 		}
// 	);
// };

// /************************
//  * ADVANCED INFO ROUTES *
//  ************************/

// // Route 7: GET /top_songs
// const top_songs = async function (req, res) {
// 	const page = req.query.page;
// 	// TODO (TASK 8): use the ternary (or nullish) operator to set the pageSize based on the query or default to 10
// 	const pageSize = req.query.page_size ?? 10;

// 	if (!page) {
// 		// TODO (TASK 9)): query the database and return all songs ordered by number of plays (descending)
// 		// Hint: you will need to use a JOIN to get the album title as well
// 		connection.query(
// 			`
//       SELECT s.song_id, s.title, s.album_id, a.title AS album, s.plays
//       FROM Songs s
//       JOIN Albums a ON s.album_id = a.album_id
//       ORDER BY s.plays DESC
//     `,
// 			(err, data) => {
// 				if (err) {
// 					console.log(err);
// 					res.json([]);
// 				} else {
// 					res.json(data.rows);
// 				}
// 			}
// 		);
// 	} else {
// 		// TODO (TASK 10): reimplement TASK 9 with pagination
// 		// Hint: use LIMIT and OFFSET (see https://www.w3schools.com/php/php_mysql_select_limit.asp)
// 		connection.query(
// 			`
//       SELECT s.song_id, s.title, s.album_id, a.title AS album, s.plays
//       FROM Songs s
//       JOIN Albums a ON s.album_id = a.album_id
//       ORDER BY s.plays DESC
//       LIMIT $1 OFFSET $2
//     `,
// 			[pageSize, (page - 1) * pageSize],
// 			(err, data) => {
// 				if (err) {
// 					console.log(err);
// 					res.json([]);
// 				} else {
// 					res.json(data.rows);
// 				}
// 			}
// 		);
// 	}
// };

// // Route 8: GET /top_albums
// const top_albums = async function (req, res) {
// 	// TODO (TASK 11): return the top albums ordered by aggregate number of plays of all songs on the album (descending), with optional pagination (as in route 7)
// 	// Hint: you will need to use a JOIN and aggregation to get the total plays of songs in an album
// 	const page = req.query.page;
// 	const pageSize = req.query.page_size ?? 10;

// 	if (!page) {
// 		connection.query(
// 			`
//       SELECT a.album_id, a.title, SUM(s.plays) AS plays
//       FROM Albums a
//       JOIN Songs s ON a.album_id = s.album_id
//       GROUP BY a.album_id, a.title
//       ORDER BY plays DESC
//     `,
// 			(err, data) => {
// 				if (err) {
// 					console.log(err);
// 					res.json([]);
// 				} else {
// 					res.json(data.rows);
// 				}
// 			}
// 		);
// 	} else {
// 		connection.query(
// 			`
//       SELECT a.album_id, a.title, SUM(s.plays) AS plays
//       FROM Albums a
//       JOIN Songs s ON a.album_id = s.album_id
//       GROUP BY a.album_id, a.title
//       ORDER BY plays DESC
//       LIMIT $1 OFFSET $2
//     `,
// 			[pageSize, (page - 1) * pageSize],
// 			(err, data) => {
// 				if (err) {
// 					console.log(err);
// 					res.json([]);
// 				} else {
// 					res.json(data.rows);
// 				}
// 			}
// 		);
// 	}
// };

// // Route 9: GET /search_songs
// const search_songs = async function (req, res) {
// 	// TODO (TASK 12): return all songs that match the given search query with parameters defaulted to those specified in API spec ordered by title (ascending)
// 	// Some default parameters have been provided for you, but you will need to fill in the rest
// 	const title = req.query.title ?? '';
// 	const titlePattern = title === '' ? '%' : `%${title}%`;

// 	const durationLow = req.query.duration_low ?? 60;
// 	const durationHigh = req.query.duration_high ?? 660;
// 	const playsLow = req.query.plays_low ?? 0;
// 	const playsHigh = req.query.plays_high ?? 1100000000;
// 	const danceabilityLow = req.query.danceability_low ?? 0;
// 	const danceabilityHigh = req.query.danceability_high ?? 1;
// 	const energyLow = req.query.energy_low ?? 0;
// 	const energyHigh = req.query.energy_high ?? 1;
// 	const valenceLow = req.query.valence_low ?? 0;
// 	const valenceHigh = req.query.valence_high ?? 1;
// 	const explicit = req.query.explicit === 'true' ? 1 : 0;

// 	connection.query(
// 		`
//     SELECT song_id, album_id, title, number, duration, plays,
//            danceability, energy, valence, tempo, key_mode, explicit
//     FROM Songs
//     WHERE title LIKE $1
//       AND duration BETWEEN $2 AND $3
//       AND plays BETWEEN $4 AND $5
//       AND danceability BETWEEN $6 AND $7
//       AND energy BETWEEN $8 AND $9
//       AND valence BETWEEN $10 AND $11
//       AND explicit <= $12
//     ORDER BY title ASC
//   `,
// 		[
// 			titlePattern,
// 			durationLow,
// 			durationHigh,
// 			playsLow,
// 			playsHigh,
// 			danceabilityLow,
// 			danceabilityHigh,
// 			energyLow,
// 			energyHigh,
// 			valenceLow,
// 			valenceHigh,
// 			explicit,
// 		],
// 		(err, data) => {
// 			if (err) {
// 				console.log(err);
// 				res.json([]);
// 			} else {
// 				res.json(data.rows);
// 			}
// 		}
// 	);
// };

// /**
//  * Route 10: GET /playlist/entrance_songs - Wedding entrance playlist
//  *
//  * Let's celebrate the wedding of Travis and Taylor!
//  *
//  * Travis Kelce is cooking up some slow danceable songs with Taylors before the
//  * highly anticipated Wedding entrance. Travis decides that a slow danceable
//  * song is one with: maximum energy of 0.5 and a minimum danceability of at least 0.73
//  * Let's design a wedding entrance playlist for Travis to pass to the DJ
//  */
// const entrance_songs = async function (req, res) {
// 	// TODO (TASK 13): return a selection of songs that meet the criteria above
// 	// You should allow the user to specify how many songs they want (limit) with a default of 10
// 	const limit = req.query.limit || 10;
// 	const maxEnergy = req.query.max_energy || 0.5;
// 	const minDanceability = req.query.min_danceability || 0.73;

// 	connection.query(
// 		`
//     SELECT s.song_id, s.title, a.title AS album, s.danceability, s.energy, s.valence
//     FROM Songs s
//     JOIN Albums a ON a.album_id = s.album_id
//     WHERE s.energy <= $1
//       AND s.danceability >= $2
//     ORDER BY s.valence DESC, s.danceability DESC
//     LIMIT $3
//   `,
// 		[maxEnergy, minDanceability, limit],
// 		(err, data) => {
// 			if (err) {
// 				console.log(err);
// 				res.json([]);
// 			} else {
// 				res.json(data.rows);
// 			}
// 		}
// 	);
// };

