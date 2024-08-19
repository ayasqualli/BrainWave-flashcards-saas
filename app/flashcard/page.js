'use client'; // Client Component

import { useEffect, useState } from 'react';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '/app/firebase-config';
import { useRouter } from 'next/navigation';
import { Container, Card, Grid, Box, Button, Typography, CardActionArea, CardContent } from '@mui/material';
import { useAuth, useUser, SignOutButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import DeleteIcon from '@mui/icons-material/Delete'; // Importing Delete icon

export default function Flashcard() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [flashcards, setFlashcards] = useState([]);
  const [fullName, setFullName] = useState('');
  const router = useRouter();
  const { id } = router.query || {}; // Provide a default empty object to avoid destructuring error
  const [flippedCards, setFlippedCards] = useState({}); // Track flipped state
  const [flashcard, setFlashcard] = useState(null); // State to hold the fetched flashcard details

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
      if (!user || !id) return; // Ensure both user and id are defined
      const docRef = doc(db, 'users', user.id, 'flashcards', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const collections = docSnap.data().flashcards || [];
        setFlashcards(collections);
      } else {
        await setDoc(docRef, { flashcards: [] }); // Create flashcards collection if it doesn't exist
      }
    }
    if (user) {
      getFlashcards();
    }
  }, [user, id]); // Add id to the dependency array

  useEffect(() => {
    const fetchFlashcard = async () => {
      const docRef = doc(db, 'users', user.id, 'flashcards', id); // Fetch flashcard by ID
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setFlashcard(docSnap.data());
      } else {
        console.error('Flashcard not found');
        // Handle error, e.g., redirect to flashcards page
      }
    };

    if (id) {
      fetchFlashcard();
    }
  }, [id]);

  const goHome = () => {
    router.push('/');
  };

  const handleCardClick = (index) => {
    setFlippedCards((prev) => ({ ...prev, [index]: !prev[index] })); // Toggle flip state
    setTimeout(() => {
      router.push(`/flashcard?id=${flashcards[index].id}`); // Ensure this ID matches the document ID in Firestore
    }, 600); // Delay matches the flip animation duration
  };

  const handleDeleteFlashcard = (index) => {
    const updatedFlashcards = flashcards.filter((_, i) => i !== index);
    setFlashcards(updatedFlashcards);
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
        display: 'flex', // Center content
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start', // Align items to the top
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

      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Button
          onClick={() => router.push('/flashcards')}
          variant="contained"
          sx={{
            background: 'linear-gradient(to right, #0070f3, #9b59b6)', // Blue-purple gradient
            '&:hover': { background: 'linear-gradient(to right, #005bb5, #8e44ad)' }, // Darker gradient on hover
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '20px', // Rounded corners
            padding: '8px 16px', // Adjusted padding for less width
            mb: 4,
          }}
        >
          Go to Flashcards
        </Button>

        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <Grid container spacing={2} sx={{ mt: 4 }}>
            {flashcards.map((flashcard, index) => (
              <Grid item key={index} xs={12} sm={6} md={4}>
                <motion.div variants={slideUp}>
                  <Card
                    sx={{
                      position: 'relative',
                      perspective: '1000px', // Add perspective for 3D effect
                    }}
                    onClick={() => handleCardClick(index)}
                  >
                    <div
                      className={`card-inner ${flippedCards[index] ? 'flipped' : ''}`} // Apply flip class
                      style={{
                        transition: 'transform 0.6s',
                        transform: flippedCards[index] ? 'rotateY(180deg)' : 'rotateY(0deg)', // Flip effect
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                      }}
                    >
                      <div className="card-front" style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden' }}>
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
                              <DeleteIcon />
                            </Button>
                          </CardContent>
                        </CardActionArea>
                      </div>
                      <div className="card-back" style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                        <CardActionArea component="div">
                          <CardContent>
                            <Typography variant="h5" component="div">
                              {flashcard.back}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </div>
                    </div>
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