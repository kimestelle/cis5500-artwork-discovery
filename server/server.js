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

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
