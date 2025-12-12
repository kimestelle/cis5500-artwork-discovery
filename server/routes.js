const { Pool, types } = require("pg");

types.setTypeParser(20, (val) => parseInt(val, 10));

const connection = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE,
  ssl: { rejectUnauthorized: false },
});

connection.connect((err) => err && console.log(err));

/******************
* BASIC ROUTES *
******************/
// GET /artwork/:id
const artwork_detail = async function (req, res) {
	const artworkId = req.params.id;

	connection.query(`
SELECT
  a.artworkid AS artwork_id,
  a.title,
  ar.artistid,
  ar.name AS artist,
  COALESCE(a.yearstart, a.yearend) AS year,
  a.medium,
  a.museum,
  COALESCE(ar.nationality, a.nationality) AS artist_nationality
FROM Artwork a
LEFT JOIN Artist ar ON a.artistid = ar.artistid
WHERE a.artworkid = $1;
`, [artworkId], (err, data) => {
		if (err) {
			console.log(err);
			res.json(null);
		} else {
			if (data.rows.length === 0) {
				res.json(null);
			} else {
				res.json(data.rows[0]);
			}
		}
	});
};

// GET /artist/:id
const artist_detail = async function (req, res) {
	const artistId = req.params.id;
	connection.query(`
SELECT 
  artistid,
  name,
  nationality,
  birthyear,
  deathyear
FROM Artist
WHERE artistid = $1;
`, [artistId], (err, data) => {
		if (err) {
			console.log(err);
			res.json(null);
		} else {
			if (data.rows.length === 0) {
				res.json(null);
			} else {
				res.json(data.rows[0]);
			}
		}
	});
};

// GET /artwork/:id/similar
const artwork_similar = async function (req, res) {
  const artworkId = req.params.id;
  connection.query(
    `
    WITH base AS (
      SELECT artistid
      FROM Artwork
      WHERE artworkid = $1
    )
    SELECT
      a.artworkid AS artwork_id,
      a.title,
      ar.artistid,
      ar.name AS artist,
      COALESCE(a.yearstart, a.yearend) AS year,
      a.medium,
      a.museum,
      COALESCE(ar.nationality, a.nationality) AS artist_nationality
    FROM Artwork a
    JOIN base b ON a.artistid = b.artistid
    LEFT JOIN Artist ar ON a.artistid = ar.artistid
    WHERE a.artworkid <> $1
    ORDER BY year
    LIMIT 20;
    `,
    [artworkId],
    (err, data) => {
      if (err) {
        console.log('artwork_similar error:', err);
        res.json([]);
      } else {
        res.json(data.rows);
      }
    }
  );
};


//GET /artist/:id/similar
const artist_similar = async function (req, res) {
	const artistId = req.params.id;
	
	connection.query(`
WITH base AS (
   SELECT keywordid FROM ArtistKeywords WHERE artistid = $1
),
matches AS (
   SELECT 
     ak.artistid,
     COUNT(*) AS shared
   FROM ArtistKeywords ak
   JOIN base b ON ak.keywordid = b.keywordid
   WHERE ak.artistid != $1
   GROUP BY ak.artistid
   HAVING COUNT(*) >= 10
)
SELECT m.artistid, a.name, a.nationality, m.shared
FROM matches m
JOIN Artist a ON a.artistid = m.artistid
ORDER BY m.shared DESC
LIMIT 20;
`, [artistId], (err, data) => {
		if (err) {
			console.log(err);
			res.json([]);
		} else {
			res.json(data.rows);
		}
	});	
};

//GET artist/:id/artworks
const artist_artworks = async function (req, res) {
	const artistId = req.params.id;
	connection.query(`
SELECT 
  artworkid AS artwork_id,
  title,
  COALESCE(yearstart, yearend) AS year,
  museum,
  medium
FROM Artwork
WHERE artistid = $1
ORDER BY year;
`, [artistId], (err, data) => {	
		if (err) {
			console.log(err);
			res.json([]);
		} else {
			res.json(data.rows);
		}
	});
};

/******************
* ARTWORKS ROUTES *
******************/
// Route: GET /search_artworks
const search_artworks = async function (req, res) {
  const q = req.query.q ?? '';
  const medium = req.query.medium ?? '';
  const nationality = req.query.nationality ?? '';

  const searchPattern = q === '' ? '%' : `%${q}%`;

  const rawMuseum = req.query.museum ?? '';

  let museum = '';
  if (rawMuseum) {
    const lower = rawMuseum.toLowerCase();
    if (lower === 'met' || lower === 'metropolitan') {
      museum = 'The Metropolitan Museum of Art';
    } else if (lower === 'moma' || lower.includes('modern')) {
      museum = 'Museum of Modern Art';
    } else {
      museum = rawMuseum;
    }
  }

  const rawYearLow = req.query.year_low;
  const rawYearHigh = req.query.year_high;

  let yearLow = parseInt(rawYearLow, 10);
  let yearHigh = parseInt(rawYearHigh, 10);

  if (Number.isNaN(yearLow)) yearLow = 0;
  if (Number.isNaN(yearHigh)) yearHigh = 3000;

  connection.query(
    `
    SELECT
      a.artworkid AS artwork_id,
      a.title,
      ar.name AS artist,
	  ar.artistid AS artist_id,
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
  const minimumRaw = req.params.minimum;
  const minimum = parseInt(minimumRaw, 10);

  if (Number.isNaN(minimum) || minimum < 1) {
    return res.status(400).json({ error: 'minimum must be a positive integer' });
  }

  connection.query(
    `
    SELECT
      a.Name AS Artist,
      COUNT(*) AS TotalArtCount,
      AVG(aw.YearEnd - aw.YearStart) AS AvgTime
    FROM Artist a
    JOIN Artwork aw
      ON a.ArtistID = aw.ArtistId
    GROUP BY a.ArtistID, a.Name
    HAVING COUNT(*) >= $1
    ORDER BY TotalArtCount DESC, a.Name ASC;
    `,
    [minimum],
    (err, data) => {
      if (err) {
        console.log('learnartists error:', err);
        res.json([]);
      } else {
        res.json(data.rows);
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

// Route 6: GET /numkeywords/:keywords
const numkeywords = async function (req, res) {
  const keywords = parseInt(req.params.keywords, 10);

  if (Number.isNaN(keywords)) {
    return res.status(400).json({ error: 'keywords must be a number' });
  }

  connection.query(
    `
    WITH pair_counts AS (
      SELECT
        ak1.ArtistId AS ArtistID1,
        ak2.ArtistId AS ArtistID2,
        COUNT(DISTINCT ak1.KeywordId) AS SharedKeywords
      FROM ArtistKeywords ak1
      JOIN ArtistKeywords ak2
        ON ak1.KeywordId = ak2.KeywordId
        AND ak1.ArtistId < ak2.ArtistId
      GROUP BY
        ak1.ArtistId,
        ak2.ArtistId
      HAVING
        COUNT(DISTINCT ak1.KeywordId) >= $1
    )
    SELECT
      a1.Name AS ArtistName1,
      a2.Name AS ArtistName2,
      pc.SharedKeywords
    FROM pair_counts pc
    JOIN Artist a1 ON pc.ArtistID1 = a1.ArtistID
    JOIN Artist a2 ON pc.ArtistID2 = a2.ArtistID
    ORDER BY
      pc.SharedKeywords DESC;
    `,
    [keywords],
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

// Route 6: GET /popularity/:name
const popularity = async function (req, res) {
  const name = req.params.name;
  connection.query(
    `
    SELECT
      a.ArtistID,
      a.Name as ArtistName,
      COALESCE(ap.ArtworkCount, 0) AS ArtworkCount,
      COALESCE(ap.MuseumCount, 0)  AS MuseumCount,
      (
        COALESCE(ap.ArtworkCount, 0) * 3
      + COALESCE(ap.MuseumCount, 0) * 5
      ) AS Score
    FROM Artist a
    LEFT JOIN (
      SELECT
        ArtistId,
        COUNT(DISTINCT ArtworkID) AS ArtworkCount,
        COUNT(DISTINCT Museum)    AS MuseumCount
      FROM Artwork
      GROUP BY ArtistId
    ) ap ON a.ArtistID = ap.ArtistId
    WHERE a.Name = $1
    ORDER BY Score DESC;
    `,
    [name],
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

// Route: GET /bios/:museum
const bios = async function (req, res) {
  const rawMuseum = (req.params.museum || '').trim();

  let museum = '';
  const lower = rawMuseum.toLowerCase();

  if (lower === 'met' || lower === 'metropolitan') {
    museum = 'The Metropolitan Museum of Art';
  } else if (lower === 'moma' || lower.includes('modern')) {
    museum = 'Museum of Modern Art';
  } else {
    museum = rawMuseum;
  }

  const limit = 100;

  console.log('bios rawMuseum:', rawMuseum, 'normalized museum:', museum);

  connection.query(
    `
    WITH WikiLinkedArtists AS (
        SELECT
            a.ArtistId,
            a.Name,
            a.Nationality,
            w.text
        FROM Artist a
        JOIN Bios4 w
            ON LOWER(a.Name) = LOWER(w.name)
    ),
    ArtworksPerMuseum AS (
        SELECT
            m.MuseumId AS MuseumId,
            ar.Name    AS ArtistName,
            COUNT(aw.ArtworkId) AS ArtworkCount
        FROM Artwork aw
        JOIN Artist ar
            ON aw.ArtistId = ar.ArtistId
        JOIN Museum m
            ON aw.Museum = m.Name
        GROUP BY m.MuseumId, ar.Name
    ),
    RankedPerMuseum AS (
        SELECT
            MuseumId,
            ArtistName,
            ArtworkCount,
            ROW_NUMBER() OVER (
                PARTITION BY MuseumId
                ORDER BY ArtworkCount DESC, LOWER(ArtistName) ASC
            ) AS rn
        FROM ArtworksPerMuseum
    )
    SELECT
        m.Name AS MuseumName,
        COALESCE(wla.Name, rpm.ArtistName) AS ArtistName,
        wla.Nationality,
        wla.text AS Text,
        rpm.ArtworkCount AS NumArtworksInMuseum,
        rpm.rn AS RankInMuseum
    FROM RankedPerMuseum rpm
    JOIN Museum m
        ON rpm.MuseumId = m.MuseumId
    LEFT JOIN WikiLinkedArtists wla
        ON LOWER(rpm.ArtistName) = LOWER(wla.Name)
    WHERE rpm.rn <= $2
      AND m.Name = $1
	  AND wla.text IS NOT NULL
    ORDER BY m.Name, rpm.rn;
    `,
    [museum, limit],
    (err, data) => {
      if (err) {
        console.log('bios query error:', err);
        res.json([]);
      } else {
        console.log('bios rows length:', data.rows.length);
        res.json(data.rows);
      }
    }
  );
};

// Route: GET /artist_events
const artist_events = async function (req, res) {
  connection.query(
    `
    WITH artist_event_data AS (
      SELECT
          a.ArtistId,
          a.Name AS ArtistName,
          h.EventId,
          h.Title AS EventTitle,
          h.Location,
          h.StartDate,
          h.EndDate,
          h.Description AS EventDescription,
          COUNT(DISTINCT hkey.KeywordId) AS SharedKeywords,
          STRING_AGG(DISTINCT key.Term, ', ' ORDER BY key.Term) AS MatchingKeywords
      FROM Artist a
      JOIN ArtistKeywords artkey ON artkey.ArtistId = a.ArtistId
      JOIN HistoricalEventKeywords hkey ON hkey.KeywordId = artkey.KeywordId
      JOIN HistoricalEvents h ON h.EventId = hkey.EventId
      JOIN Keyword key ON key.KeywordId = hkey.KeywordId
      WHERE
          a.BirthYear <= EXTRACT(YEAR FROM h.EndDate)
          AND (a.DeathYear IS NULL OR a.DeathYear >= EXTRACT(YEAR FROM h.StartDate))
      GROUP BY
          a.ArtistId,
          a.Name,
          h.EventId,
          h.Title,
          h.Location,
          h.StartDate,
          h.EndDate,
          h.Description
    )
    SELECT *
    FROM artist_event_data
	WHERE SharedKeywords >= 10
    ORDER BY RANDOM()
    LIMIT 5;
    `,
    [],
    (err, data) => {
      if (err) {
        console.log('artist_events error:', err);
        res.json([]);
      } else {
        res.json(data.rows);
      }
    }
  );
};

// Route: GET /artist_successors
const artist_successors = async function (req, res) {
  connection.query(
    `
    WITH successor_data AS (
      SELECT
          ba.Name AS BaseArtistName,
          successor.ArtistId AS SuccessorArtistId,
          successor.Name AS SuccessorArtistName,
          successor.Nationality AS SuccessorNationality,
          COUNT(DISTINCT ak_successor.KeywordId) AS SharedKeywords,
          STRING_AGG(DISTINCT k.Term, ', ' ORDER BY k.Term) AS MatchingKeywords
      FROM Artist ba
      CROSS JOIN LATERAL (
          SELECT
              a.ArtistId,
              a.Name,
              a.Nationality
          FROM Artist a
          WHERE
              a.ArtistId != ba.ArtistId
              AND a.BirthYear > COALESCE(ba.DeathYear, ba.BirthYear + 20)
      ) AS successor
      JOIN ArtistKeywords ak_base 
        ON ak_base.ArtistId = ba.ArtistId
      JOIN ArtistKeywords ak_successor
        ON ak_successor.ArtistId = successor.ArtistId
       AND ak_successor.KeywordId = ak_base.KeywordId
      JOIN Keyword k
        ON k.KeywordId = ak_successor.KeywordId
      GROUP BY
          ba.ArtistId,
          ba.Name,
          successor.ArtistId,
          successor.Name,
          successor.Nationality
      HAVING COUNT(DISTINCT ak_successor.KeywordId) >= 10
    )
    SELECT *
    FROM successor_data
    ORDER BY RANDOM()
    LIMIT 5;
    `,
    [],
    (err, data) => {
      if (err) {
        console.log('artist_successors error:', err);
        res.json([]);
      } else {
        res.json(data.rows);
      }
    }
  );
};

// Route: GET /event_artworks
const event_artworks = async function (req, res) {
  connection.query(
    `
    WITH event_artwork_data AS (
      SELECT
          h.EventId,
          h.Title AS EventTitle,
          artist.ArtistId,
          artist.Name AS ArtistName,
          COUNT(DISTINCT a.ArtworkId) AS NumArtworksOverlapping,
          COUNT(DISTINCT hekey.KeywordId) AS NumSharedKeywords,
          STRING_AGG(DISTINCT key.Term, ', ' ORDER BY key.Term) AS MatchingKeywords
      FROM HistoricalEvents h
      JOIN HistoricalEventKeywords hekey ON hekey.EventId = h.EventId
      JOIN ArtworkKeywords ak ON ak.KeywordId = hekey.KeywordId
      JOIN Artwork a
          ON a.ArtworkId = ak.ArtworkId
          AND a.YearStart IS NOT NULL
          AND a.YearStart <= EXTRACT(YEAR FROM h.EndDate)
          AND COALESCE(a.YearEnd, a.YearStart) >= EXTRACT(YEAR FROM h.StartDate)
      JOIN Artist artist ON artist.ArtistId = a.ArtistId
      JOIN Keyword key ON key.KeywordId = hekey.KeywordId
      GROUP BY
          h.EventId,
          h.Title,
          artist.ArtistId,
          artist.Name
    )
    SELECT *
    FROM event_artwork_data
	WHERE NumArtworksOverlapping >= 1 AND NumSharedKeywords >= 10
    ORDER BY RANDOM()
    LIMIT 5;
    `,
    [],
    (err, data) => {
      if (err) {
        console.log('event_artworks error:', err);
        res.json([]);
      } else {
        res.json(data.rows);
      }
    }
  );
};


// Route: GET /similar_artists?minKeywords=10&limit=200
const similar_artists = async function (req, res) {
  const minKeywordsRaw = req.query.minKeywords;
  const limitRaw = req.query.limit;

  const MIN_KEYWORDS_DEFAULT = 5;
  const LIMIT_DEFAULT = 150;
  const LIMIT_MAX = 400;

  const minKeywords = parseInt(minKeywordsRaw, 10);
  const limit = parseInt(limitRaw, 10);

  const minK = Number.isNaN(minKeywords) ? MIN_KEYWORDS_DEFAULT : minKeywords;
  let lim = Number.isNaN(limit) ? LIMIT_DEFAULT : limit;
  if (lim > LIMIT_MAX) lim = LIMIT_MAX;

  connection.query(
    `
    WITH pair_counts AS (
      SELECT
        ak1.ArtistId AS ArtistID1,
        ak2.ArtistId AS ArtistID2,
        COUNT(DISTINCT ak1.KeywordId) AS SharedKeywords
      FROM ArtistKeywords ak1
      JOIN ArtistKeywords ak2
        ON ak1.KeywordId = ak2.KeywordId
        AND ak1.ArtistId < ak2.ArtistId
      GROUP BY
        ak1.ArtistId,
        ak2.ArtistId
      HAVING
        COUNT(DISTINCT ak1.KeywordId) >= $1
    ),
    sampled_pairs AS (
      SELECT
        pc.ArtistID1,
        pc.ArtistID2,
        pc.SharedKeywords,
        a1.Name AS ArtistName1,
        a2.Name AS ArtistName2
      FROM pair_counts pc
      JOIN Artist a1 ON pc.ArtistID1 = a1.ArtistID
      JOIN Artist a2 ON pc.ArtistID2 = a2.ArtistID
      ORDER BY RANDOM()
      LIMIT $2
    )
    SELECT * FROM sampled_pairs;
    `,
    [minK, lim],
    (err, data) => {
      if (err) {
        console.log('similar_artists error:', err);
        return res.json({ nodes: [], links: [] });
      }

      const rows = data.rows || [];
      const nodeMap = new Map();

      const links = rows.map((row) => {
        const id1 = row.artistid1;
        const id2 = row.artistid2;

        if (!nodeMap.has(id1)) {
          nodeMap.set(id1, {
            id: id1,
            name: row.artistname1,
          });
        }
        if (!nodeMap.has(id2)) {
          nodeMap.set(id2, {
            id: id2,
            name: row.artistname2,
          });
        }

        return {
          source: id1,
          target: id2,
          weight: row.sharedkeywords,
        };
      });

      const nodes = Array.from(nodeMap.values());

      res.json({ nodes, links });
    }
  );
};

// Route: GET /artist_history/:historical_event
const artist_during_history = async function (req, res) {
  const historical_event = (req.params.historical_event || '').trim();

  if (!historical_event) {
    return res.status(400).json({ error: 'historical_event is required' });
  }

  connection.query(
    `
    SELECT
      aw.Title       AS ArtworkTitle,
      aw.Medium      AS ArtworkMedium,
      aw.Description AS ArtworkDescription,
      ar.Name        AS Artist
    FROM Artwork aw
    JOIN Artist ar ON aw.ArtistId = ar.ArtistId
    WHERE EXISTS (
      SELECT 1
      FROM HistoricalEvents h
      WHERE h.Title = $1
        AND ar.BirthYear <= EXTRACT(YEAR FROM h.EndDate)
        AND (
          ar.DeathYear IS NULL
          OR ar.DeathYear >= EXTRACT(YEAR FROM h.StartDate)
        )
    )
    ORDER BY ar.Name ASC, aw.Title ASC
	LIMIT 5;
    `,
    [historical_event],
    (err, data) => {
      if (err) {
        console.log('artist_during_history error:', err);
        return res.json([]);
      }
      return res.json(data.rows);
    }
  );
};


module.exports = {
	search_artworks,
	learnartists,
	topartists,
	numkeywords,
	popularity,
	bios,
	artist_events,
	artist_successors,
	event_artworks,
	similar_artists,
	artwork_detail,
	artist_detail,
	artwork_similar,
	artist_similar,
	artist_artworks,
	artist_during_history,
};
