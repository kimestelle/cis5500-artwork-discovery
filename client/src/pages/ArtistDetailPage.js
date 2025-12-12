import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import metBgImage from '../assets/met2.png';
import config from '../config.json';

export default function ArtistDetailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const artistNameParam = searchParams.get('name') || '';
  const artistId = searchParams.get('id') || '';

  const [artist, setArtist] = useState(null);
  const [stats, setStats] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [similarArtists, setSimilarArtists] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingArtworks, setLoadingArtworks] = useState(false);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (!artistId) return;

    const base = `http://${config.server_host}:${config.server_port}`;

    setLoadingStats(true);
    setLoadingArtworks(true);
    setLoadingSimilar(true);

    Promise.all([
      fetch(`${base}/artist/${artistId}`).then((r) => r.json()),
      fetch(`${base}/artist/${artistId}/artworks`).then((r) => r.json()),
      fetch(`${base}/artist/${artistId}/similar`).then((r) => r.json()),
    ])
      .then(([artistData, artworksData, similarData]) => {
        if (artistData) {
          setArtist(artistData);
          setStats(artistData);
        } else {
          setArtist(null);
          setStats(null);
        }

        const mappedArtworks = (artworksData || []).map((a) => ({
          id: a.artwork_id ?? a.id,
          ...a,
        }));
        setArtworks(mappedArtworks);

        setSimilarArtists(similarData || []);
      })
      .catch((err) => {
        console.error('Error fetching artist detail:', err);
        setArtist(null);
        setStats(null);
        setArtworks([]);
        setSimilarArtists([]);
      })
      .finally(() => {
        setLoadingStats(false);
        setLoadingArtworks(false);
        setLoadingSimilar(false);
      });
  }, [artistId]);

  const artworkColumns = [
    { field: 'title', headerName: 'Title', flex: 2, minWidth: 200 },
    { field: 'year', headerName: 'Year', width: 100 },
    { field: 'medium', headerName: 'Medium', flex: 1.5, minWidth: 140 },
    { field: 'museum', headerName: 'Museum', flex: 2, minWidth: 200 },
  ];

  const similarColumns = [
    {
      field: 'name',
      headerName: 'Artist',
      flex: 2,
      minWidth: 200,
    },
    {
      field: 'nationality',
      headerName: 'Nationality',
      width: 140,
    },
    {
      field: 'shared',
      headerName: 'Shared keywords',
      width: 160,
    },
  ];

  const handleArtworkRowClick = (params) => {
    const id = params.row.id;
    if (!id) return;
    navigate(`/artwork-detail?id=${id}`);
  };

  const handleSimilarArtistClick = (params) => {
    const row = params.row;
    const id = row.artistid ?? row.artist_id ?? '';
    const name = row.name;
    if (!id) return;

    navigate(
      `/artists-detail?name=${encodeURIComponent(
        name || ''
      )}&id=${encodeURIComponent(id)}`
    );
  };

  const displayName = artist?.name || artistNameParam || 'Artist';
  const bgImage = metBgImage;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(
          0,
          0,
          0,
          0.5
        )), url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: '40px 20px',
      }}
    >
      <Container sx={{ mt: 12, mb: 6 }}>
        <Button
          variant="outlined"
          sx={{ mb: 2, borderColor: 'white', color: 'white' }}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>

        <Typography
          variant="h3"
          sx={{
            mb: 1,
            color: 'white',
            fontFamily: 'Georgia, serif',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          {displayName}
        </Typography>
        {artistId && (
          <Typography
            variant="body2"
            sx={{
              mb: 3,
              color: 'white',
              fontFamily: 'Georgia, serif',
              opacity: 0.8,
            }}
          >
            Artist ID: {artistId}
          </Typography>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 2.5,
                mb: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 1.5,
                  fontFamily: 'Georgia, serif',
                  fontWeight: 'medium',
                }}
              >
                Overview
              </Typography>
              {loadingStats && <Typography>Loading artist info...</Typography>}
              {!loadingStats && !artist && (
                <Typography>No info available for this artist.</Typography>
              )}
              {!loadingStats && artist && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {artist.nationality && (
                    <Typography variant="body2">
                      Nationality: <strong>{artist.nationality}</strong>
                    </Typography>
                  )}
                  {(artist.birthyear || artist.deathyear) && (
                    <Typography variant="body2">
                      Years:{' '}
                      <strong>
                        {artist.birthyear || '—'} – {artist.deathyear || ''}
                      </strong>
                    </Typography>
                  )}
                  {stats && stats.artworkcount != null && (
                    <Typography variant="body2">
                      Artworks in dataset:{' '}
                      <strong>{stats.artworkcount}</strong>
                    </Typography>
                  )}
                  {stats && stats.museumcount != null && (
                    <Typography variant="body2">
                      Museums represented:{' '}
                      <strong>{stats.museumcount}</strong>
                    </Typography>
                  )}
                  {stats && stats.score != null && (
                    <Typography variant="body2">
                      Popularity score: <strong>{stats.score}</strong>
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>

            <Paper
              sx={{
                p: 2.5,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontFamily: 'Georgia, serif',
                  fontWeight: 'medium',
                }}
              >
                Similar artists
              </Typography>
              {loadingSimilar && <Typography>Loading similar artists...</Typography>}
              {!loadingSimilar && similarArtists.length === 0 && (
                <Typography>No similar artists found.</Typography>
              )}
              {!loadingSimilar && similarArtists.length > 0 && (
                <div
                  style={{
                    width: '100%',
                    backgroundColor: 'white',
                  }}
                >
                  <DataGrid
                    rows={similarArtists.map((a, idx) => ({
                      id: a.artistid ?? a.artist_id ?? idx,
                      ...a,
                    }))}
                    columns={similarColumns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    autoHeight
                    onRowClick={handleSimilarArtistClick}
                    sx={{
                      cursor: 'pointer',
                      '& .MuiDataGrid-row:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  />
                </div>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 2.5,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontFamily: 'Georgia, serif',
                  fontWeight: 'medium',
                }}
              >
                Artworks by {displayName}
              </Typography>
              {loadingArtworks && <Typography>Loading artworks...</Typography>}
              {!loadingArtworks && artworks.length === 0 && (
                <Typography>No artworks found for this artist.</Typography>
              )}
              {!loadingArtworks && artworks.length > 0 && (
                <div style={{ width: '100%', backgroundColor: 'white' }}>
                  <DataGrid
                    rows={artworks}
                    columns={artworkColumns}
                    pageSize={pageSize}
                    rowsPerPageOptions={[5, 10, 25]}
                    onPageSizeChange={(newPageSize) =>
                      setPageSize(newPageSize)
                    }
                    autoHeight
                    onRowClick={handleArtworkRowClick}
                    sx={{
                      cursor: 'pointer',
                      '& .MuiDataGrid-row:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  />
                </div>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
