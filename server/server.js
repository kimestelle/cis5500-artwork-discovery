const express = require("express");
const cors = require("cors");
const config = require("./config");
const routes = require("./routes");

const app = express();

// CORS
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://cis5500-artwork-discovery.vercel.app"
  ],
}));
app.options("*", cors());

app.get('/search_artworks', routes.search_artworks);
app.get('/topartists/:museum', routes.topartists);
app.get('/learnartists/:minimum', routes.learnartists);
app.get('/numkeywords/:keywords', routes.numkeywords);
app.get('/popularity/:name', routes.popularity);
app.get('/bios/:museum', routes.bios);
app.get('/artist_events', routes.artist_events);
app.get('/artist_successors', routes.artist_successors);
app.get('/event_artworks', routes.event_artworks);

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
