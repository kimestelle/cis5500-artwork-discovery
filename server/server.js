const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

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
