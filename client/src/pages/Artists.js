import { Box, Typography, TextField } from '@mui/material';
import backgroundImage from '../assets/background.jpg';
import { useState } from 'react';

const config = require('../config.json');

export default function Artists() {
	const [answers, setAnswers] = useState({});
	const [results, setResults] = useState({});

	const funFacts = [
		{
			question:
				'Learn who the top 10 artists are at the MET or MOMA! Choose one below.',
			id: 'topartists',
		},
		{
			question:
				"What's the average amount of time it takes an artist to finish a piece of a specific medium?",
			id: 'timebymedium',
		},
	];

	const boxStyle = {
		width: '45%',
		minHeight: '300px',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: '20px',
		cursor: 'pointer',
		transition: 'all 0.3s ease',
		boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
		border: '3px solid white',
		padding: '30px',
		textAlign: 'center',
		backgroundColor: 'rgba(0,0,0,0.4)',
		'&:hover': {
			transform: 'translateY(-10px)',
			boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
		},
	};

	const handleSubmit = async (id) => {
	const value = answers[id];
	if (!value) return;

	let endpoint = '';

	if (id === 'topartists') {
		endpoint = `http://${config.server_host}:${config.server_port}/topartists/${encodeURIComponent(
		value
		)}`;
	} else if (id === 'timebymedium') {
		endpoint = `http://${config.server_host}:${config.server_port}/timebymedium/${encodeURIComponent(
		value
		)}`;
	}

	console.log('Fetching from endpoint:', endpoint);

	try {
		const res = await fetch(endpoint);

		if (!res.ok) {
		throw new Error(`HTTP ${res.status}`);
		}

		const data = await res.json();
		setResults((prev) => ({ ...prev, [id]: data }));
	} catch (err) {
		console.error(err);
		setResults((prev) => ({ ...prev, [id]: 'Error fetching data' }));
	}
	};


	return (
		<Box
			sx={{
				minHeight: '100vh',
				backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${backgroundImage})`,
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
				Artist Fun Facts
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
				{funFacts.map((fact) => (
					<Box key={fact.id} sx={boxStyle}>
						<Typography
							variant='h5'
							sx={{
								color: 'white',
								fontWeight: 'medium',
								marginBottom: '20px',
								fontFamily: 'Georgia, serif',
								textShadow: '1px 1px 3px rgba(0,0,0,0.2)',
							}}
						>
							{fact.question}
						</Typography>

						<TextField
							variant='outlined'
							placeholder='Type your answer...'
							value={answers[fact.id] || ''}
							onChange={(e) =>
								setAnswers((prev) => ({
									...prev,
									[fact.id]: e.target.value,
								}))
							}
							onKeyDown={(e) => {
								if (e.key === 'Enter') handleSubmit(fact.id);
							}}
							size='small'
							sx={{
								width: '80%',
								backgroundColor: 'white',
								borderRadius: '4px',
								'& .MuiOutlinedInput-root': {
									backgroundColor: 'white',
								},
							}}
						/>
						{results[fact.id] && (
							<Box
								sx={{
									width: '80%',
									minHeight: '100px',
									backgroundColor: 'white',
									borderRadius: '10px',
									padding: '20px',
									marginTop: '20px',
									textAlign: 'center',
								}}
							>
								{JSON.stringify(results[fact.id])}
							</Box>
						)}
					</Box>
				))}
			</Box>
		</Box>
	);
}
