import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import metBgImage from '../assets/met2.png';
import momaBgImage from '../assets/moma2.png';
import config from '../config.json';

export default function ArtworkDetailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const artworkIdParam = searchParams.get('id');
  const artworkId = artworkIdParam ? parseInt(artworkIdParam, 10) : null;

  const [artwork, setArtwork] = useState(null);
  const [similarArtworks, setSimilarArtworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    if (!artworkId) return;

    setLoading(true);
    const base = `http://${config.server_host}:${config.server_port}`;

    Promise.all([
      fetch(`${base}/artwork/${artworkId}`).then((r) => r.json()),
      fetch(`${base}/artwork/${artworkId}/similar`).then((r) => r.json()),
    ])
      .then(([artworkData, similarData]) => {
        setArtwork(artworkData || null);

        const mappedSimilar = (similarData || []).map((a) => ({
          id: a.artwork_id ?? a.id,
          ...a,
        }));
        setSimilarArtworks(mappedSimilar);
      })
      .catch((err) => {
        console.error('Error fetching artwork details:', err);
        setArtwork(null);
        setSimilarArtworks([]);
      })
      .finally(() => setLoading(false));
  }, [artworkId]);

  const similarColumns = [
    { field: 'title', headerName: 'Title', flex: 2, minWidth: 200 },
    { field: 'year', headerName: 'Year', width: 100 },
    { field: 'museum', headerName: 'Museum', flex: 1.5, minWidth: 160 },
  ];

  const handleSimilarArtworkClick = (params) => {
    const id = params.row.id;
    if (!id) return;
    // 🔧 use the same route you use elsewhere
    navigate(`/artwork?id=${id}`);
  };

  const handleArtistClick = () => {
    if (!artwork || !artwork.artist) return;
    const artistId = artwork.artist_id ?? artwork.artistid ?? '';
    navigate(
      `/artists-detail?name=${encodeURIComponent(
        artwork.artist
      )}${artistId ? `&id=${encodeURIComponent(artistId)}` : ''}`
    );
  };

  const bgImage =
    artwork && artwork.museum && artwork.museum.toLowerCase().includes('modern')
      ? momaBgImage
      : metBgImage;

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

        {loading && (
          <Typography sx={{ color: 'white' }}>Loading artwork...</Typography>
        )}

        {!loading && !artwork && (
          <Typography sx={{ color: 'white' }}>
            Artwork not found in the dataset.
          </Typography>
        )}

        {!loading && artwork && (
          <>
            <Typography
              variant="h3"
              sx={{
                mb: 1,
                color: 'white',
                fontFamily: 'Georgia, serif',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              {artwork.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mb: 3,
                color: 'white',
                fontFamily: 'Georgia, serif',
                opacity: 0.85,
              }}
            >
              Artwork ID: {artworkId}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
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
                      mb: 2,
                      fontFamily: 'Georgia, serif',
                      fontWeight: 'medium',
                    }}
                  >
                    Details
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {artwork.artist && (
                      <Box>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          Artist
                        </Typography>
                        <Chip
                          label={artwork.artist}
                          variant="outlined"
                          onClick={handleArtistClick}
                          sx={{ cursor: 'pointer' }}
                        />
                      </Box>
                    )}
                    {artwork.year && (
                      <Typography variant="body2">
                        Year: <strong>{artwork.year}</strong>
                      </Typography>
                    )}
                    {artwork.medium && (
                      <Typography variant="body2">
                        Medium: <strong>{artwork.medium}</strong>
                      </Typography>
                    )}
                    {artwork.museum && (
                      <Typography variant="body2">
                        Museum: <strong>{artwork.museum}</strong>
                      </Typography>
                    )}
                    {artwork.artist_nationality && (
                      <Typography variant="body2">
                        Artist nationality:{' '}
                        <strong>{artwork.artist_nationality}</strong>
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={7}>
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
                    Similar artworks
                  </Typography>
                  {similarArtworks.length === 0 && (
                    <Typography>No similar artworks found.</Typography>
                  )}
                  {similarArtworks.length > 0 && (
                    <div
                      style={{
                        width: '100%',
                        backgroundColor: 'white',
                      }}
                    >
                      <DataGrid
                        rows={similarArtworks}
                        columns={similarColumns}
                        pageSize={pageSize}
                        rowsPerPageOptions={[5, 10]}
                        onPageSizeChange={(newPageSize) =>
                          setPageSize(newPageSize)
                        }
                        autoHeight
                        onRowClick={handleSimilarArtworkClick}
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
          </>
        )}
      </Container>
    </Box>
  );
}
