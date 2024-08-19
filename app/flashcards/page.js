'use client'; // Client Component

import { useEffect, useState } from 'react';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '/app/firebase-config';
import { useRouter } from 'next/navigation';
import { Container, Card, Grid, Box, Button, TextField, Typography, CardActionArea, CardContent } from '@mui/material';
import { useAuth, useUser, SignOutButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';

export default function Flashcards() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [flashcards, setFlashcards] = useState([]);
  const [fullName, setFullName] = useState('');
  const router = useRouter();
  const [newFlashcard, setNewFlashcard] = useState({ front: '', back: '' });
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/signin');
      return;
    }

    setFullName(user?.fullName || 'User');
    setLoading(false);
  }, [isLoaded, isSignedIn, user, router]);

  useEffect(() => {
    async function getFlashcards() {
      if (!user) return;
      const docRef = doc(db, 'users', user.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const collections = docSnap.data().flashcards || [];
        setFlashcards(collections);
      } else {
        await setDoc(docRef, { flashcards: [] });
      }
    }
    if (user) {
      getFlashcards();
    }
  }, [user]);

  const goHome = () => {
    router.push('/');
  };

  const handleCardClick = (flashcard) => {
    router.push(`/flashcard?id=${flashcard.id}`);
  };

  const handleFlashcardSubmit = async (e) => {
    e.preventDefault();
    if (!newFlashcard.front || !newFlashcard.back) return;

    const docRef = doc(db, 'users', user.id);
    await setDoc(docRef, { flashcards: [...flashcards, newFlashcard] }, { merge: true });
    setFlashcards([...flashcards, newFlashcard]);
    setNewFlashcard({ front: '', back: '' });
  };

  const handleGenerateFlashcards = async () => {
    if (!prompt) return;
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      console.error('Error fetching flashcards:', response.statusText);
      return; // Handle the error appropriately
    }

    try {
      const data = await response.json();
      if (data.flashcards) {
        setFlashcards((prev) => [...prev, ...data.flashcards]);
      } else {
        console.error('No flashcards found in response:', data);
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  };

  const handleDeleteFlashcard = (index) => {
    const updatedFlashcards = flashcards.filter((_, i) => i !== index);
    setFlashcards(updatedFlashcards);
    // Optionally, update Firestore with the new flashcards array
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1 } },
  };

  const slideUp = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.8 } },
  };

  if (loading) {
    return (
      <div className="loader-wrapper">
        <span className="loader"></span>
        <style jsx>{`
          .loader-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #121212;
          }

          .loader {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: inline-block;
            border-top: 3px solid #FFF;
            border-right: 3px solid transparent;
            box-sizing: border-box;
            animation: rotation 1s linear infinite;
          }

          @keyframes rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        backgroundImage: 'url("/bg-purple-white.jpg")', // Set your background image here
        backgroundSize: 'cover', // Cover the entire container
        backgroundPosition: 'center', // Center the background image
        color: '#fff', // Change text color to white for contrast
        minHeight: '100vh',
        paddingBottom: '20px',
        display: 'flex', // Center content
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={2}
        sx={{ borderBottom: '1px solid #333', position: 'absolute', top: 0, left: 0, right: 0 }} // Adjusted position to top and full width
      >
        <Button onClick={goHome} sx={{ textTransform: 'none', backgroundColor: 'transparent', '&:hover': { backgroundColor: '#eaeaea' } }}>
          <img src="/images/logo.png" alt="Logo" style={{ height: '120px' }} />
        </Button>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body1" fontWeight="bold">
            {fullName}
          </Typography>
          <SignOutButton
            signOutCallback={() => {
              router.push('/signin');
            }}
          >
            <Button
              variant="outlined"
              sx={{
                color: '#0070f3',
                borderColor: '#0070f3',
                '&:hover': { borderColor: '#005bb5', color: '#005bb5' },
              }}
            >
              Sign Out
            </Button>
          </SignOutButton>
        </Box>
      </Box>

      <Container maxWidth="md" sx={{ mt: 8 }}>
        <form onSubmit={handleFlashcardSubmit} style={{ marginBottom: '40px' }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Front"
              variant="outlined"
              value={newFlashcard.front}
              onChange={(e) => setNewFlashcard({ ...newFlashcard, front: e.target.value })}
              required
              sx={{
                backgroundColor: '#ffffff', // Set background to white
                borderRadius: '5px',
                input: { color: '#000' }, // Set input text color to black
                '& .MuiInputBase-input::placeholder': { color: '#aaa' }, // Set placeholder text color to grey
              }}
              InputLabelProps={{ style: { color: '#000' } }} // Change label color to black
            />
            <TextField
              label="Back"
              variant="outlined"
              value={newFlashcard.back}
              onChange={(e) => setNewFlashcard({ ...newFlashcard, back: e.target.value })}
              required
              sx={{
                backgroundColor: '#ffffff', // Set background to white
                borderRadius: '5px',
                input: { color: '#000' }, // Set input text color to black
                '& .MuiInputBase-input::placeholder': { color: '#aaa' }, // Set placeholder text color to grey
              }}
              InputLabelProps={{ style: { color: '#000' } }} // Change label color to black
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                background: 'linear-gradient(to right, #0070f3, #9b59b6)', // Blue-purple gradient
                '&:hover': { background: 'linear-gradient(to right, #005bb5, #8e44ad)' }, // Darker gradient on hover
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '20px', // Rounded corners
                padding: '8px 16px', // Adjusted padding for less width
              }}
            >
              Add Flashcard
            </Button>
          </Box>
        </form>

        <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 4 }}>
          <TextField
            label="Enter Prompt"
            variant="outlined"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
            sx={{
              backgroundColor: '#ffffff', // Set background to white
              borderRadius: '5px',
              input: { color: '#000' }, // Set input text color to black
              '& .MuiInputBase-input::placeholder': { color: '#aaa' }, // Set placeholder text color to grey
            }}
            InputLabelProps={{ style: { color: '#000' } }} // Change label color to black
          />
          <Button
            onClick={handleGenerateFlashcards}
            variant="outlined"
            sx={{
              background: 'linear-gradient(to right, #0070f3, #9b59b6)', // Blue-purple gradient
              color: 'white',
              borderColor: 'transparent', // Remove border color
              '&:hover': { background: 'linear-gradient(to right, #005bb5, #8e44ad)' }, // Darker gradient on hover
              mt: 2,
              borderRadius: '20px', // Rounded corners
              padding: '8px 16px', // Adjusted padding for less width
            }}
          >
            Generate Flashcards
          </Button>
        </Box>

        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <Grid container spacing={2} sx={{ mt: 4 }}>
            {flashcards.map((flashcard, index) => (
              <Grid item key={index} xs={12} sm={6} md={4}>
                <motion.div variants={slideUp}>
                  <Card
                    sx={{
                      backgroundColor: '#ffffff', // Changed to white background
                      color: '#000', // Changed text color to black
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#f0f0f0', // Light grey on hover
                      },
                    }}
                    onClick={() => handleCardClick(index)}
                  >
                    <CardActionArea component="div">
                      <CardContent>
                        <Typography variant="h5" component="div">
                          {flashcard.front}
                        </Typography>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            handleDeleteFlashcard(index);
                          }}
                          variant="outlined"
                          sx={{
                            marginTop: 1,
                            color: '#ff0000', // Red color for delete button
                            borderColor: '#ff0000',
                            '&:hover': { borderColor: '#cc0000', color: '#cc0000' },
                          }}
                        >
                          Delete
                        </Button>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Container>
  );
}