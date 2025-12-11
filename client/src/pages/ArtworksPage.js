import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  TextField,
  Slider,
  Button,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import LazyTable from '../components/LazyTable';
import metBgImage from '../assets/met2.png';
import momaBgImage from '../assets/moma2.png';

const config = require('../config.json');

export default function ArtworksPage() {
  const [searchParams] = useSearchParams();

  // initial museum from URL (?museum=met / moma) or 'either'
  const initialMuseum = searchParams.get('museum') || 'either';

  // ---- filters ----
  const [query, setQuery] = useState('');              // general search
  const [museumFilter, setMuseumFilter] = useState(initialMuseum); // met / moma / either
  const [yearRange, setYearRange] = useState([1800, 2025]);
  const [medium, setMedium] = useState('');
  const [nationality, setNationality] = useState('');

  // route passed into LazyTable
  const [route, setRoute] = useState('');

  // ---- table columns (match your backend fields) ----
  const artworkColumns = [
    { headerName: 'Title', field: 'title' },
    { headerName: 'Artist', field: 'artist' },
    { headerName: 'Year', field: 'year' },
    { headerName: 'Medium', field: 'medium' },
    { headerName: 'Museum', field: 'museum' },
    { headerName: 'Nationality', field: 'artist_nationality' },
  ];

  // some example options – replace with whatever is in your DB if you want
  const mediumOptions = [
    '',
    'Painting',
    'Sculpture',
    'Print',
    'Drawing',
    'Photograph',
    'Mixed Media',
  ];

  const nationalityOptions = [
    '',
    'American',
    'French',
    'Italian',
    'Dutch',
    'Spanish',
    'German',
    'British',
    'Japanese',
    'Korean',
    'Other',
  ];

  // Build the route with current filters
  const buildRoute = () => {
    const params = new URLSearchParams();

    // general query
    if (query) params.append('q', query);

    if (museumFilter !== 'either') {
      params.append('museum', museumFilter);
    }

    params.append('year_low', yearRange[0]);
    params.append('year_high', yearRange[1]);

    if (medium) params.append('medium', medium);
    if (nationality) params.append('nationality', nationality);

    return `http://${config.server_host}:${config.server_port}/search_artworks?${params.toString()}`;
  };

  useEffect(() => {
    setRoute(buildRoute());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [museumFilter]);

  const handleSearchClick = () => {
    setRoute(buildRoute());
  };

  const handleMuseumChange = (event, newValue) => {
    if (newValue !== null) {
      setMuseumFilter(newValue);
    }
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        minHeight: '100vh',
        minWidth: '100vw',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${
          museumFilter === 'moma'
            ? momaBgImage
            : museumFilter === 'met'
            ? metBgImage
            : metBgImage
        })`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: 'white',
        textAlign: 'center',
        padding: '40px',
      }}
    >
      {/* Header */}
      <Typography
        variant="h2"
        sx={{ mt: 4, mb: 1, fontFamily: 'Georgia, serif' }}
      >
        {museumFilter === 'met'
          ? 'Metropolitan Museum of Art'
          : museumFilter === 'moma'
          ? 'Museum of Modern Art'
          : 'Artworks Explorer'}
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        {museumFilter === 'either'
          ? 'Showing artworks from MET and MoMA'
          : `Showing artworks from ${museumFilter.toUpperCase()}`}
      </Typography>

      <Paper
        elevation={4}
        sx={{
          width: '100%',
          maxWidth: 1200,
          p: 3,
          textAlign: 'left',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'inherit',
        }}
      >
        <Typography variant="h5" sx={{ mb: 2 }}>
          Search Artworks
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Search (title or artist)"
              variant="outlined"
              fullWidth
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputLabelProps={{ style: { color: '#ccc' } }}
              InputProps={{ style: { color: 'white' } }}
            />
          </Grid>

          {/* Museum toggle */}
          <Grid item xs={12}>
            <Typography gutterBottom>Museum</Typography>
            <ToggleButtonGroup
              value={museumFilter}
              exclusive
              onChange={handleMuseumChange}
              size="small"
            >
              <ToggleButton value="met">MET</ToggleButton>
              <ToggleButton value="moma">MoMA</ToggleButton>
              <ToggleButton value="either">Either</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          {/* Year slider */}
          <Grid item xs={12}>
            <Typography gutterBottom>Time of Creation (Year)</Typography>
            <Slider
              value={yearRange}
              min={1200}
              max={2025}
              step={5}
              onChange={(e, newValue) => setYearRange(newValue)}
              valueLabelDisplay="auto"
            />
          </Grid>

          {/* Medium dropdown */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#ccc' }}>Medium</InputLabel>
              <Select
                value={medium}
                label="Medium"
                onChange={(e) => setMedium(e.target.value)}
                sx={{ color: 'white' }}
              >
                {mediumOptions.map((m) => (
                  <MenuItem key={m || 'all'} value={m}>
                    {m === '' ? 'All' : m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Artist nationality dropdown */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#ccc' }}>Artist Nationality</InputLabel>
              <Select
                value={nationality}
                label="Artist Nationality"
                onChange={(e) => setNationality(e.target.value)}
                sx={{ color: 'white' }}
              >
                {nationalityOptions.map((n) => (
                  <MenuItem key={n || 'all'} value={n}>
                    {n === '' ? 'All' : n}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Button
          variant="contained"
          sx={{ mt: 3 }}
          onClick={handleSearchClick}
        >
          Search
        </Button>

        <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
          Results
        </Typography>

        {route && (
          <LazyTable
            route={route}
            columns={artworkColumns}
            defaultPageSize={10}
            rowsPerPageOptions={[5, 10, 25]}
          />
        )}
      </Paper>
    </Container>
  );
}
