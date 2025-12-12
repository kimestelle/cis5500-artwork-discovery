import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Slider,
  TextField,
  Button,
  Grid,
} from '@mui/material';
import metBgImage from '../assets/met2.png';
import SimilarArtistsGraph from './SimilarArtistsGraph';
import config from '../config.json';

export default function SimilarArtistsPage() {
  const navigate = useNavigate();

  const [minKeywords, setMinKeywords] = useState(20);
  const [limit, setLimit] = useState(30);
  const [data, setData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);

  const fetchGraph = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('minKeywords', String(minKeywords));
    params.append('limit', String(limit));

    const url = `${config.server_url}/similar_artists?${params.toString()}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        setData(json || { nodes: [], links: [] });
      })
      .catch((err) => {
        console.error('Error fetching similar artists:', err);
        alert('Error fetching similar artists. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGraph();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleArtistClick = (artist) => {
    if (!artist || !artist.name) return;
    navigate(`/artists-detail?name=${encodeURIComponent(artist.name)}&id=${artist.id}`);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${metBgImage})`,
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
            mb: 2,
            color: 'white',
            fontFamily: 'Georgia, serif',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          Similar Artists Graph
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: 4,
            color: 'white',
            fontFamily: 'Georgia, serif',
            maxWidth: 700,
          }}
        >
          Each node is an artist. Edges connect artists who share descriptive
          keywords. Adjust the controls to change how dense the cluster is.
        </Typography>

        <Paper
          sx={{
            p: 3,
            mb: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              fontFamily: 'Georgia, serif',
              fontWeight: 'medium',
            }}
          >
            Graph Controls
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>
                Minimum shared keywords (similarity threshold)
              </Typography>
              <Slider
                value={minKeywords}
                min={3}
                max={50}
                step={1}
                valueLabelDisplay="auto"
                onChange={(_, value) => setMinKeywords(value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Max # of edges</Typography>
              <TextField
                type="number"
                value={limit}
                size="small"
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!Number.isNaN(val)) {
                    setLimit(val);
                  }
                }}
                inputProps={{ min: 20, max: 100 }}
              />
            </Grid>
          </Grid>

          <Button
            variant="contained"
            sx={{
              mt: 3,
              backgroundColor: 'black',
              '&:hover': { backgroundColor: '#333' },
            }}
            onClick={fetchGraph}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh Graph'}
          </Button>

          <Box sx={{ mt: 4 }}>
            <SimilarArtistsGraph data={data} onArtistClick={handleArtistClick} />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
