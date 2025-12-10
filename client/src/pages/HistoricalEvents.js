import { useState } from 'react';
import { Container, Link, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Typography, Paper} from '@mui/material';

const config = require('../config.json');

export default function HistoricalEvents() {

  const [artistId, setArtistId] = useState(null);
  const [artworkId, setArtworkId] = useState(null);
  const[eventsNearArtwork, setEventsNearArtwork] = useState([])
  const[overlapEvents, setOverlapEvents] = useState([])
  const[eventTitle, setEventTitle] = useState(null)
  const[artistEvent, setArtistEvent] = useState([])
  const[artworkEvent, setArtworkEvent] = useState([])
  const[artistEventsDisplay, setArtistEventDisplay] = useState(false)
  const[eventToArtworkDisplay, setEventToArtworkDisplay] = useState(false)
  const[artworkToEventDisplay, setArtworkToEventDisplay] = useState(false)
  const[overlapDisplay, setOverlapDisplay] = useState(false)
  const[error, setError] = useState(null)

  const handleArtistEvents = () => {
    setError(null);
    setArtworkEvent([]);
    setEventTitle(null);
    if (!artistId) return null;
    setArtistEventDisplay(true);
    fetch(`http://${config.server_host}:${config.server_port}/historical/${artworkId}`)
      .then(res => res.json())
      .then(resJson => setArtistEvent(resJson))
      .catch((err) => {console.error('Backend Error:', err)})
      .finally(() => setArtistEventDisplay(false));

  }

  const handleSelectEvent = (historicalTitle) => {
    setError(null);
    setEventToArtworkDisplay(true);
    setEventTitle(historicalTitle);
    const titleEncode = encodeURIComponent(historicalTitle)
    fetch(`http://${config.server_host}:${config.server_port}/artist_history/${titleEncode}`)
      .then(res => res.json())
      .then(resJson => setArtworkEvent(resJson))
      .catch((err) => {console.error('Backend Error:', err)})
      .finally(() => setEventToArtworkDisplay(false));
  }

  const handleArtworkEvents = () => {
    setError(null);
    if(!artworkId) return null;
    setArtworkToEventDisplay(true)
    fetch(`http://${config.server_host}:${config.server_port}/artworks/${artworkId}`)
      .then(res => res.json())
      .then(resJson => setEventsNearArtwork(resJson))
      .catch((err) => {console.error('Backend Error:', err)})
      .finally(() => setArtworkToEventDisplay(false));
  }

  const handleOverlaps = () => {
    setError(null);
    setOverlapDisplay(true);
    fetch(`http://${config.server_host}:${config.server_port}/events/artwork_overlaps`)
      .then(res => res.json())
      .then(resJson => setArtistEvent(resJson))
      .catch((err) => {console.error('Backend Error:', err)})
      .finally(() => setOverlapDisplay(false));
  }

  return (
    <Container sx={{ mt: 12, mb: 6 }}>
      <Typography variant="h3" sx={{ mb: 3 }}>
        Historical Events & Artworks
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Section 1: Events during an artist's lifespan in their nationality */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Events During an Artist&apos;s Lifespan (by Nationality)
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Artist ID"
            variant="outlined"
            value={artistId}
            onChange={(e) => setArtistId(e.target.value)}
            size="small"
          />
          <Button variant="contained" onClick={handleArtistEvents}>
            Search Events
          </Button>
        </Stack>

        {artistEventsDisplay && <Typography>Loading events for artist...</Typography>}

        {!artistEventsDisplay && artistEvent.length > 0 && (
          <>
            <Typography sx={{ mb: 1 }}>
              Click an event title to see artworks by artists who lived through that event.
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {artistEvent.map((row, idx) => (
                    <TableRow key={`${row.eventtitle || row.Title || idx}-${idx}`}>
                      <TableCell>
                        <Link
                          component="button"
                          onClick={() => handleSelectEvent(row.EventTitle || row.Title)}
                        >
                          {row.EventTitle || row.Title}
                        </Link>
                      </TableCell>
                      <TableCell>{row.Location}</TableCell>
                      <TableCell>{row.StartDate}</TableCell>
                      <TableCell>{row.EndDate}</TableCell>
                      <TableCell>{row.EventDescription || row.Description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* Artworks for selected event */}
        {eventTitle && (
          <Stack sx={{ mt: 3 }} spacing={1}>
            <Typography variant="h6">
              Artworks by Artists Who Lived Through: {eventTitle}
            </Typography>
            {eventToArtworkDisplay && <Typography>Loading artworks for event...</Typography>}
            {!eventToArtworkDisplay && artworkEvent.length === 0 && (
              <Typography>No artworks found for this event.</Typography>
            )}
            {!eventToArtworkDisplay && artworkEvent.length > 0 && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Artwork Title</TableCell>
                      <TableCell>Medium</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Artist</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {artworkEvent.map((row, idx) => (
                      <TableRow key={`${row.ArtworkTitle || idx}-${idx}`}>
                        <TableCell>{row.ArtworkTitle}</TableCell>
                        <TableCell>{row.ArtworkMedium}</TableCell>
                        <TableCell>{row.ArtworkDescription}</TableCell>
                        <TableCell>{row.Artist}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Stack>
        )}
      </Paper>

      {/* Section 2: Events near an artwork's year */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Events Near an Artwork&apos;s Creation Year (±2 Years)
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Artwork ID"
            variant="outlined"
            value={artworkId}
            onChange={(e) => setArtworkId(e.target.value)}
            size="small"
          />
          <Button variant="contained" onClick={handleArtworkEvents}>
            Search Events
          </Button>
        </Stack>

        {artistEventsDisplay && <Typography>Loading events near artwork year...</Typography>}

        {!artistEventsDisplay && eventsNearArtwork.length > 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Artwork ID</TableCell>
                  <TableCell>Artwork Title</TableCell>
                  <TableCell>Artwork Year</TableCell>
                  <TableCell>Event Title</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {eventsNearArtwork.map((row, idx) => (
                  <TableRow key={`${row.EventId || idx}-${idx}`}>
                    <TableCell>{row.ArtworkId}</TableCell>
                    <TableCell>{row.ArtworkTitle}</TableCell>
                    <TableCell>{row.ArtworkYear}</TableCell>
                    <TableCell>{row.EventTitle}</TableCell>
                    <TableCell>{row.Location}</TableCell>
                    <TableCell>{row.StartDate}</TableCell>
                    <TableCell>{row.EndDate}</TableCell>
                    <TableCell>{row.Description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Section 3: All events with overlapping artworks */}
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Typography variant="h5">Events and Overlapping Artworks</Typography>
          <Button variant="outlined" onClick={handleOverlaps}>
            Load All Overlaps
          </Button>
        </Stack>

        {overlapDisplay && <Typography>Loading overlaps...</Typography>}

        {!overlapDisplay && overlapEvents.length > 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Event ID</TableCell>
                  <TableCell>Event Title</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Artwork ID</TableCell>
                  <TableCell>Artwork Title</TableCell>
                  <TableCell>Year Start</TableCell>
                  <TableCell>Year End</TableCell>
                  <TableCell>Artist Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {overlapEvents.map((row, idx) => (
                  <TableRow key={`${row.EventId}-${row.ArtworkId || 'none'}-${idx}`}>
                    <TableCell>{row.EventId}</TableCell>
                    <TableCell>{row.EventTitle}</TableCell>
                    <TableCell>{row.StartDate}</TableCell>
                    <TableCell>{row.EndDate}</TableCell>
                    <TableCell>{row.ArtworkId}</TableCell>
                    <TableCell>{row.ArtworkTitle}</TableCell>
                    <TableCell>{row.YearStart}</TableCell>
                    <TableCell>{row.YearEnd}</TableCell>
                    <TableCell>{row.ArtistName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
}
