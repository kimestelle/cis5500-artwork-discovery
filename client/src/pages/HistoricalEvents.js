import { useState } from 'react';
import {
  Container,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Paper,
  Box,
  TextField,
} from '@mui/material';
import backgroundImage from '../assets/background.jpg';

const config = require('../config.json');

export default function HistoricalEvents() {
  const [artistEvents, setArtistEvents] = useState([]);
  const [successors, setSuccessors] = useState([]);
  const [eventArtworks, setEventArtworks] = useState([]);

  const [historicalEventQuery, setHistoricalEventQuery] = useState('');
  const [historyArtworks, setHistoryArtworks] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [artistEventsLoading, setArtistEventsLoading] = useState(false);
  const [successorsLoading, setSuccessorsLoading] = useState(false);
  const [eventArtworksLoading, setEventArtworksLoading] = useState(false);

  const [error, setError] = useState(null);

  const baseUrl = `http://${config.server_host}:${config.server_port}`;

  const handleLoadArtistEvents = () => {
    setError(null);
    setArtistEventsLoading(true);

    fetch(`${baseUrl}/artist_events`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((resJson) => setArtistEvents(Array.isArray(resJson) ? resJson : []))
      .catch((err) => {
        console.error('artist_events error:', err);
        setError('Failed to load artist–event connections.');
        setArtistEvents([]);
      })
      .finally(() => setArtistEventsLoading(false));
  };

  const handleLoadSuccessors = () => {
    setError(null);
    setSuccessorsLoading(true);

    fetch(`${baseUrl}/artist_successors`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((resJson) => setSuccessors(Array.isArray(resJson) ? resJson : []))
      .catch((err) => {
        console.error('artist_successors error:', err);
        setError('Failed to load artistic successors.');
        setSuccessors([]);
      })
      .finally(() => setSuccessorsLoading(false));
  };

  const handleLoadEventArtworks = () => {
    setError(null);
    setEventArtworksLoading(true);

    fetch(`${baseUrl}/event_artworks`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((resJson) => setEventArtworks(Array.isArray(resJson) ? resJson : []))
      .catch((err) => {
        console.error('event_artworks error:', err);
        setError('Failed to load event–artwork overlaps.');
        setEventArtworks([]);
      })
      .finally(() => setEventArtworksLoading(false));
  };

  // NEW: load artist_history results
  const handleLoadArtistHistory = () => {
    setError(null);

    const q = historicalEventQuery.trim();
    if (!q) {
      setError('Please enter a historical event title.');
      setHistoryArtworks([]);
      return;
    }

    setHistoryLoading(true);

    fetch(`${baseUrl}/artist_history/${encodeURIComponent(q)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((resJson) => setHistoryArtworks(Array.isArray(resJson) ? resJson : []))
      .catch((err) => {
        console.error('artist_history error:', err);
        setError('Failed to load artworks for that historical event.');
        setHistoryArtworks([]);
      })
      .finally(() => setHistoryLoading(false));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: '40px 20px',
      }}
    >
      <Container sx={{ mt: 12, mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            mb: 3,
            color: 'white',
            fontFamily: 'Georgia, serif',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          Historical Events & Artworks
        </Typography>

        {error && (
          <Typography
            sx={{
              mb: 2,
              color: 'white',
              backgroundColor: 'rgba(211, 47, 47, 0.8)',
              p: 2,
              borderRadius: 1,
            }}
          >
            {error}
          </Typography>
        )}

        {/* NEW SECTION: Artist history lookup */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 2,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Typography
              variant="h5"
              sx={{ fontFamily: 'Georgia, serif', fontWeight: 'medium' }}
            >
              Artworks by Artists Alive During a Historical Event
            </Typography>

            <TextField
              size="small"
              label="Historical Event Title"
              value={historicalEventQuery}
              onChange={(e) => setHistoricalEventQuery(e.target.value)}
              sx={{ minWidth: 320 }}
            />

            <Button
              variant="contained"
              onClick={handleLoadArtistHistory}
              sx={{ backgroundColor: 'black', '&:hover': { backgroundColor: '#333' } }}
            >
              Search
            </Button>
          </Stack>

          {historyLoading && (
            <Typography sx={{ fontStyle: 'italic' }}>
              Loading artworks for that historical event...
            </Typography>
          )}

          {!historyLoading && historyArtworks.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Artist</TableCell>
                    <TableCell>Artwork Title</TableCell>
                    <TableCell>Medium</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historyArtworks.map((row, idx) => (
                    <TableRow key={`${row.artist ?? 'artist'}-${row.artworktitle ?? 'art'}-${idx}`}>
                      <TableCell>{row.artist ?? 'N/A'}</TableCell>
                      <TableCell>{row.artworktitle ?? 'N/A'}</TableCell>
                      <TableCell>{row.artworkmedium ?? 'N/A'}</TableCell>
                      <TableCell>{row.artworkdescription ?? ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!historyLoading && historyArtworks.length === 0 && (
            <Typography sx={{ fontStyle: 'italic' }}>
              Enter an event title and click Search.
            </Typography>
          )}
        </Paper>

        {/* Existing: artist_events */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 2,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Typography variant="h5" sx={{ fontFamily: 'Georgia, serif', fontWeight: 'medium' }}>
              Artists & Historical Events (Shared Keywords)
            </Typography>
            <Button
              variant="contained"
              onClick={handleLoadArtistEvents}
              sx={{ backgroundColor: 'black', '&:hover': { backgroundColor: '#333' } }}
            >
              5 Random Artist–Event Connections
            </Button>
          </Stack>

          {artistEventsLoading && (
            <Typography sx={{ fontStyle: 'italic' }}>
              Loading artist–event connections...
            </Typography>
          )}

          {!artistEventsLoading && artistEvents.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Artist ID</TableCell>
                    <TableCell>Artist Name</TableCell>
                    <TableCell>Event ID</TableCell>
                    <TableCell>Event Title</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Shared Keywords</TableCell>
                    <TableCell>Matching Keywords</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {artistEvents.map((row, idx) => (
                    <TableRow
                      key={`${row.artistid ?? 'artist'}-${row.eventid ?? 'event'}-${idx}`}
                    >
                      <TableCell>{row.artistid ?? 'N/A'}</TableCell>
                      <TableCell>{row.artistname ?? 'N/A'}</TableCell>
                      <TableCell>{row.eventid ?? 'N/A'}</TableCell>
                      <TableCell>{row.eventtitle ?? 'N/A'}</TableCell>
                      <TableCell>{row.location ?? 'N/A'}</TableCell>
                      <TableCell>{row.startdate ?? 'N/A'}</TableCell>
                      <TableCell>{row.enddate ?? 'N/A'}</TableCell>
                      <TableCell>{row.sharedkeywords ?? 0}</TableCell>
                      <TableCell>{row.matchingkeywords ?? ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!artistEventsLoading && artistEvents.length === 0 && (
            <Typography sx={{ fontStyle: 'italic' }}>
              No artist–event connections loaded yet.
            </Typography>
          )}
        </Paper>

        {/* Existing: successors */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 2,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Typography variant="h5" sx={{ fontFamily: 'Georgia, serif', fontWeight: 'medium' }}>
              Artistic Successors (Later Artists with Shared Keywords)
            </Typography>
            <Button
              variant="contained"
              onClick={handleLoadSuccessors}
              sx={{ backgroundColor: 'black', '&:hover': { backgroundColor: '#333' } }}
            >
              5 Random Successors
            </Button>
          </Stack>

          {successorsLoading && (
            <Typography sx={{ fontStyle: 'italic' }}>
              Loading artistic successors...
            </Typography>
          )}

          {!successorsLoading && successors.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Base Artist</TableCell>
                    <TableCell>Successor ID</TableCell>
                    <TableCell>Successor Name</TableCell>
                    <TableCell>Successor Nationality</TableCell>
                    <TableCell>Shared Keywords</TableCell>
                    <TableCell>Matching Keywords</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {successors.map((row, idx) => (
                    <TableRow key={`${row.successorartistid ?? 'successor'}-${idx}`}>
                      <TableCell>{row.baseartistname ?? 'N/A'}</TableCell>
                      <TableCell>{row.successorartistid ?? 'N/A'}</TableCell>
                      <TableCell>{row.successorartistname ?? 'N/A'}</TableCell>
                      <TableCell>{row.successornationality ?? 'N/A'}</TableCell>
                      <TableCell>{row.sharedkeywords ?? 0}</TableCell>
                      <TableCell>{row.matchingkeywords ?? ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!successorsLoading && successors.length === 0 && (
            <Typography sx={{ fontStyle: 'italic' }}>
              No successors loaded yet.
            </Typography>
          )}
        </Paper>

        {/* Existing: event_artworks */}
        <Paper
          sx={{
            p: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 2,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Typography variant="h5" sx={{ fontFamily: 'Georgia, serif', fontWeight: 'medium' }}>
              Events & Overlapping Artworks (Shared Keywords & Years)
            </Typography>
            <Button
              variant="contained"
              onClick={handleLoadEventArtworks}
              sx={{ backgroundColor: 'black', '&:hover': { backgroundColor: '#333' } }}
            >
              5 Random Event–Artwork Overlaps
            </Button>
          </Stack>

          {eventArtworksLoading && (
            <Typography sx={{ fontStyle: 'italic' }}>
              Loading event–artwork overlaps...
            </Typography>
          )}

          {!eventArtworksLoading && eventArtworks.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Event ID</TableCell>
                    <TableCell>Event Title</TableCell>
                    <TableCell>Artist ID</TableCell>
                    <TableCell>Artist Name</TableCell>
                    <TableCell># Overlapping Artworks</TableCell>
                    <TableCell># Shared Keywords</TableCell>
                    <TableCell>Matching Keywords</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {eventArtworks.map((row, idx) => (
                    <TableRow
                      key={`${row.eventid ?? 'event'}-${row.artistid ?? 'artist'}-${idx}`}
                    >
                      <TableCell>{row.eventid ?? 'N/A'}</TableCell>
                      <TableCell>{row.eventtitle ?? 'N/A'}</TableCell>
                      <TableCell>{row.artistid ?? 'N/A'}</TableCell>
                      <TableCell>{row.artistname ?? 'N/A'}</TableCell>
                      <TableCell>{row.numartworksoverlapping ?? 0}</TableCell>
                      <TableCell>{row.numsharedkeywords ?? 0}</TableCell>
                      <TableCell>{row.matchingkeywords ?? ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!eventArtworksLoading && eventArtworks.length === 0 && (
            <Typography sx={{ fontStyle: 'italic' }}>
              No event–artwork overlaps loaded yet.
            </Typography>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
