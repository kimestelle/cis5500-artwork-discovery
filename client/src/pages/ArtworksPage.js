import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Typography } from '@mui/material';

export default function ArtworksPage() {
	const [searchParams] = useSearchParams();
	const museum = searchParams.get('museum');

	return (
		<Container>
			<Typography
				variant='h2'
				style={{ marginTop: '2rem', fontFamily: 'Georgia, serif' }}
			>
				{museum === 'met'
					? 'Metropolitan Museum of Art'
					: 'Museum of Modern Art'}
			</Typography>
			<Typography variant='body1' style={{ marginTop: '1rem' }}>
				Showing artworks from {museum?.toUpperCase()}
			</Typography>
		</Container>
	);
}
