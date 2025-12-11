import {
	Box,
	Typography,
	TextField,
	Dialog,
	DialogContent,
	DialogTitle,
	Button,
} from '@mui/material';
// import CloseIcon from '@mui/icons-material/Close';
import backgroundImage from '../assets/background.jpg';
import { useState } from 'react';

const config = require('../config.json');

export default function Artists() {
	const [answers, setAnswers] = useState({});
	const [results, setResults] = useState({});
	const [openModal, setOpenModal] = useState(false);
	const [modalContent, setModalContent] = useState('');

	const funFacts = [
		{
			question:
				'Learn who the top 10 artists are at the MET or MOMA! Choose one below.',
			id: 'topartists',
		},
		{
			question:
				'Find artists by the number of artworks they have made! More than 3? More than 4? Take your pick',
			id: 'timebymedium',
		},
		{
			question:
				'Looking for artists that share a lot in common? Find artists with a specific number of keywords in common!',
			id: 'numkeywords',
		},
		{
			question:
				"Want to find the popularity of an artists? Type their name and we'll give you a score!",
			id: 'popularity',
		},
		{
			question:
				'Read about the artists that truly dominate the MET and MOMA!',
			id: 'bios',
		},
	];

	const boxStyle = {
		width: '100%',
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
			endpoint = `http://${config.server_host}:${
				config.server_port
			}/topartists/${encodeURIComponent(value)}`;
		} else if (id === 'timebymedium') {
			endpoint = `http://${config.server_host}:${
				config.server_port
			}/learnartists/${encodeURIComponent(value)}`;
		} else if (id === 'numkeywords') {
			endpoint = `http://${config.server_host}:${
				config.server_port
			}/numkeywords/${encodeURIComponent(value)}`;
		} else if (id === 'popularity') {
			endpoint = `http://${config.server_host}:${
				config.server_port
			}/popularity/${encodeURIComponent(value)}`;
		} else if (id === 'bios') {
			endpoint = `http://${config.server_host}:${
				config.server_port
			}/bios/${encodeURIComponent(value)}`;
		}

		try {
			const res = await fetch(endpoint);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			setResults((prev) => ({ ...prev, [id]: data }));
			setModalContent(JSON.stringify(data, null, 2)); // nicely formatted JSON
			setOpenModal(true); // open modal popup
		} catch (err) {
			console.error(err);
			setResults((prev) => ({ ...prev, [id]: 'Error fetching data' }));
			setModalContent('Error fetching data');
			setOpenModal(true);
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
				paddingTop: '120px',
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

			{/* Grid layout with 2 columns */}
			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: 'repeat(2, 1fr)',
					gap: '40px',
					width: '100%',
					maxWidth: '1200px',
					justifyItems: 'center',
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
					</Box>
				))}
			</Box>

			{/* Modal Popup for results */}
			{/* <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Result
          <IconButton
            aria-label="close"
            onClick={() => setOpenModal(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
            {modalContent}
          </Box>
        </DialogContent>
      </Dialog> */}
			<Dialog
				open={openModal}
				onClose={() => setOpenModal(false)}
				maxWidth='md'
				fullWidth
			>
				<DialogTitle
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					Result
					<Button
						onClick={() => setOpenModal(false)}
						sx={{ minWidth: 'auto', fontWeight: 'bold' }}
					>
						X
					</Button>
				</DialogTitle>
				<DialogContent>
					<Box component='pre' sx={{ whiteSpace: 'pre-wrap' }}>
						{modalContent}
					</Box>
				</DialogContent>
			</Dialog>
		</Box>
	);
}

// import { Box, Typography, TextField } from '@mui/material';
// import backgroundImage from '../assets/background.jpg';
// import { useState } from 'react';

// const config = require('../config.json');

// export default function Artists() {
// 	const [answers, setAnswers] = useState({});
// 	const [results, setResults] = useState({});

// 	const funFacts = [
// 		{
// 			question:
// 				'Learn who the top 10 artists are at the MET or MOMA! Choose one below.',
// 			id: 'topartists',
// 		},
// 		{
// 			question:
// 				"Find artists by the number of artworks they have made! More than 3? More than 4? Take your pick",
// 			id: 'timebymedium',
// 		},
// 		{
// 			question:
// 				"Looking for artists that share a lot in common? Find artists with a specific number of keywords in common!",
// 			id: 'numkeywords',
// 		},
// 		{
// 			question:
// 				"Want to find the popularity of an artists? Type their name and we'll give you a score!",
// 			id: 'popularity',
// 		},
// 		{
// 			question:
// 				"Read about the artists that truly dominate the MET and MOMA!",
// 			id: 'bios',
// 		},
// 	];

// 	const boxStyle = {
// 		width: '45%',
// 		minHeight: '300px',
// 		display: 'flex',
// 		flexDirection: 'column',
// 		alignItems: 'center',
// 		justifyContent: 'center',
// 		borderRadius: '20px',
// 		cursor: 'pointer',
// 		transition: 'all 0.3s ease',
// 		boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
// 		border: '3px solid white',
// 		padding: '30px',
// 		textAlign: 'center',
// 		backgroundColor: 'rgba(0,0,0,0.4)',
// 		'&:hover': {
// 			transform: 'translateY(-10px)',
// 			boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
// 		},
// 	};

// 	const handleSubmit = async (id) => {
// 		const value = answers[id];
// 		if (!value) return;

// 		let endpoint = '';

// 		if (id === 'topartists') {
// 			endpoint = `http://${config.server_host}:${config.server_port}/topartists/${encodeURIComponent(
// 			value
// 			)}`;
// 		} else if (id === 'timebymedium') {
// 			endpoint = `http://${config.server_host}:${config.server_port}/learnartists/${encodeURIComponent(
// 			value
// 			)}`;
// 		} else if (id === 'numkeywords') {
// 			endpoint = `http://${config.server_host}:${config.server_port}/numkeywords/${encodeURIComponent(
// 			value
// 			)}`;
// 		} else if (id === 'popularity') {
// 			endpoint = `http://${config.server_host}:${config.server_port}/popularity/${encodeURIComponent(
// 			value
// 			)}`;
// 		} else if (id === 'bios') {
// 			endpoint = `http://${config.server_host}:${config.server_port}/bios/${encodeURIComponent(
// 			value
// 			)}`;
// 		}

// 		console.log('Fetching from endpoint:', endpoint);

// 		try {
// 			const res = await fetch(endpoint);

// 			if (!res.ok) {
// 			throw new Error(`HTTP ${res.status}`);
// 			}

// 			const data = await res.json();
// 			setResults((prev) => ({ ...prev, [id]: data }));
// 		} catch (err) {
// 			console.error(err);
// 			setResults((prev) => ({ ...prev, [id]: 'Error fetching data' }));
// 		}
// 	};

// 	return (
// 		<Box
// 			sx={{
// 				minHeight: '100vh',
// 				backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${backgroundImage})`,
// 				backgroundSize: 'cover',
// 				backgroundPosition: 'center',
// 				backgroundAttachment: 'fixed',
// 				display: 'flex',
// 				flexDirection: 'column',
// 				alignItems: 'center',
// 				justifyContent: 'center',
// 				padding: '40px',
// 			}}
// 		>
// 			<Typography
// 				variant='h2'
// 				sx={{
// 					color: 'white',
// 					marginBottom: '60px',
// 					fontWeight: 'medium',
// 					textAlign: 'center',
// 					textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
// 					fontFamily: 'Georgia, serif',
// 				}}
// 			>
// 				Artist Fun Facts
// 			</Typography>

// 			<Box
// 				sx={{
// 					display: 'flex',
// 					gap: '40px',
// 					width: '100%',
// 					maxWidth: '1200px',
// 					justifyContent: 'center',
// 				}}
// 			>
// 				{funFacts.map((fact) => (
// 					<Box key={fact.id} sx={boxStyle}>
// 						<Typography
// 							variant='h5'
// 							sx={{
// 								color: 'white',
// 								fontWeight: 'medium',
// 								marginBottom: '20px',
// 								fontFamily: 'Georgia, serif',
// 								textShadow: '1px 1px 3px rgba(0,0,0,0.2)',
// 							}}
// 						>
// 							{fact.question}
// 						</Typography>

// 						<TextField
// 							variant='outlined'
// 							placeholder='Type your answer...'
// 							value={answers[fact.id] || ''}
// 							onChange={(e) =>
// 								setAnswers((prev) => ({
// 									...prev,
// 									[fact.id]: e.target.value,
// 								}))
// 							}
// 							onKeyDown={(e) => {
// 								if (e.key === 'Enter') handleSubmit(fact.id);
// 							}}
// 							size='small'
// 							sx={{
// 								width: '80%',
// 								backgroundColor: 'white',
// 								borderRadius: '4px',
// 								'& .MuiOutlinedInput-root': {
// 									backgroundColor: 'white',
// 								},
// 							}}
// 						/>
// 						{results[fact.id] && (
// 							<Box
// 								sx={{
// 									width: '80%',
// 									minHeight: '100px',
// 									backgroundColor: 'white',
// 									borderRadius: '10px',
// 									padding: '20px',
// 									marginTop: '20px',
// 									textAlign: 'center',
// 								}}
// 							>
// 								{JSON.stringify(results[fact.id])}
// 							</Box>
// 						)}
// 					</Box>
// 				))}
// 			</Box>
// 		</Box>
// 	);
// }
