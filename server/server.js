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

app.get("/search_artworks", routes.search_artworks);
app.get("/topartists/:museum", routes.topartists);
app.get("/learnartists/:minimum", routes.learnartists);
app.get("/numkeywords/:keywords", routes.numkeywords);
app.get("/popularity/:name", routes.popularity);
app.get("/bios/:museum", routes.bios);
app.get("/artist_events", routes.artist_events);
app.get("/artist_successors", routes.artist_successors);
app.get("/event_artworks", routes.event_artworks);

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
