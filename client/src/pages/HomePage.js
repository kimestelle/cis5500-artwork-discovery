import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import metImage from '../assets/met.jpg';
import momaImage from '../assets/moma.jpg';
import backgroundImage from '../assets/background.jpg';

export default function HomePage() {
	const navigate = useNavigate();

	const handleMuseumClick = (museum) => {
		navigate(`/artworks?museum=${museum}`);
	};

	const museumBoxStyle = {
		width: '45%',
		height: '400px',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: '20px',
		cursor: 'pointer',
		transition: 'all 0.3s ease',
		boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
		border: '3px solid white',
		'&:hover': {
			transform: 'translateY(-10px)',
			boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
		},
	};

	return (
		<Box
			sx={{
				minHeight: '100vh',
				backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${backgroundImage})`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundAttachment: 'fixed',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '40px',
			}}
		>
			<Typography
				variant='h2'
				sx={{
					color: 'white',
					marginBottom: '60px',
					fontWeight: 'medium',
					textAlign: 'center',
					textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
					fontFamily: 'Georgia, serif',
				}}
			>
				Explore Museum Collections
			</Typography>

			<Box
				sx={{
					display: 'flex',
					gap: '40px',
					width: '100%',
					maxWidth: '1200px',
					justifyContent: 'center',
				}}
			>
				{/* MET Museum Box */}
				<Box
					onClick={() => handleMuseumClick('met')}
					sx={{
						...museumBoxStyle,
						backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${metImage})`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
					}}
				>
					<Typography
						variant='h3'
						sx={{
							color: 'white',
							fontWeight: 'medium',
							textAlign: 'center',
							textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
							fontFamily: 'Georgia, serif',
						}}
					>
						MET
					</Typography>
					<Typography
						variant='h6'
						sx={{
							color: 'white',
							marginTop: '20px',
							textAlign: 'center',
							opacity: 0.9,
							fontFamily: 'Georgia, serif',
						}}
					>
						Metropolitan Museum of Art
					</Typography>
				</Box>

				{/* MoMA Museum Box */}
				<Box
					onClick={() => handleMuseumClick('moma')}
					sx={{
						...museumBoxStyle,
						backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${momaImage})`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
					}}
				>
					<Typography
						variant='h3'
						sx={{
							color: 'white',
							fontWeight: 'medium',
							textAlign: 'center',
							textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
							fontFamily: 'Georgia, serif',
						}}
					>
						MoMA
					</Typography>
					<Typography
						variant='h6'
						sx={{
							color: 'white',
							marginTop: '20px',
							textAlign: 'center',
							opacity: 0.9,
							fontFamily: 'Georgia, serif',
						}}
					>
						Museum of Modern Art
					</Typography>
				</Box>
			</Box>
		</Box>
	);
}
