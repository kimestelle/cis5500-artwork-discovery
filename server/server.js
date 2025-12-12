const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const routes = require("./routes");

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: { rejectUnauthorized: false },
});

const app = express();
app.use(express.json());

// CORS
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://cis5500-artwork-discovery.vercel.app",
  ],
}));
app.options("*", cors());

app.locals.db = pool;

app.get('/search_artworks', routes.search_artworks);
app.get('/topartists/:museum', routes.topartists);
app.get('/learnartists/:minimum', routes.learnartists);
app.get('/numkeywords/:keywords', routes.numkeywords);
app.get('/popularity/:name', routes.popularity);
app.get('/bios/:museum', routes.bios);
app.get('/artist_events', routes.artist_events);
app.get('/artist_successors', routes.artist_successors);
app.get('/event_artworks', routes.event_artworks);
app.get('/similar_artists', routes.similar_artists);

app.get('/artwork/:id', routes.artwork_detail);
app.get('/artwork/:id/similar', routes.artwork_similar);

app.get('/artist/:id', routes.artist_detail);
app.get('/artist/:id/artworks', routes.artist_artworks);
app.get('/artist/:id/similar', routes.artist_similar);

app.get('/artist_history/:historical_event', routes.artist_during_history);

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
