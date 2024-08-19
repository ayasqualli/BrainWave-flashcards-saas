"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "/app/firebase-config";
import { useRouter } from "next/navigation";
import {
  Container,
  Card,
  Grid,
  Box,
  Button,
  TextField,
  Typography,
  CardActionArea,
  CardContent,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useAuth, useUser, SignOutButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

export default function Flashcards() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [flashcards, setFlashcards] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [newCollection, setNewCollection] = useState("");
  const [fullName, setFullName] = useState("");
  const router = useRouter();
  const [newFlashcard, setNewFlashcard] = useState({
    front: "",
    back: "",
    collection: "",
  });
  const [prompt, setPrompt] = useState("");
  const [flippedCards, setFlippedCards] = useState({});
  const [editingFlashcard, setEditingFlashcard] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

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
    async function getData() {
      if (!user) return;
      const docRef = doc(db, 'users', user.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFlashcards(data.flashcards || []);
        setCollections(data.collections || []);
      } else {
        await setDoc(docRef, { flashcards: [], collections: [] });
      }
    }
    if (user) {
      getData();
    }
  }, [user]);

  const goHome = () => {
    router.push('/');
  };

  const handleCardClick = (index) => {
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleFlashcardSubmit = async (e) => {
    e.preventDefault();
    if (!newFlashcard.front || !newFlashcard.back) return;

    let updatedFlashcards;
    if (editingFlashcard) {
      updatedFlashcards = flashcards.map((card) =>
        card.id === editingFlashcard.id
          ? { ...newFlashcard, id: card.id }
          : card
      );
    } else {
      const newFlashcardWithId = {
        ...newFlashcard,
        id: Date.now().toString(),
        collection: selectedCollection,
      };
      updatedFlashcards = [...flashcards, newFlashcardWithId];
    }

    setFlashcards(updatedFlashcards);
    setNewFlashcard({ front: "", back: "", collection: "" });
    setEditingFlashcard(null);

    // Update Firestore
    const docRef = doc(db, "users", user.id);
    await setDoc(docRef, { flashcards: updatedFlashcards }, { merge: true });
  };

  const handleAddCollection = async () => {
    if (!newCollection.trim()) return;
    const newCollectionWithId = {
      id: Date.now().toString(),
      name: newCollection.trim(),
    };
    const updatedCollections = [...collections, newCollectionWithId];
    setCollections(updatedCollections);
    setNewCollection("");

    // Update Firestore
    const docRef = doc(db, "users", user.id);
    await setDoc(docRef, { collections: updatedCollections }, { merge: true });
  };

  const handleSelectCollection = (collectionId) => {
    setSelectedCollection(collectionId);
  };

  const handleDeleteCollection = async (collectionId) => {
    const updatedCollections = collections.filter(
      (collection) => collection.id !== collectionId
    );
    setCollections(updatedCollections);
    if (selectedCollection === collectionId) {
      setSelectedCollection(null);
    }

    // Remove collection from flashcards
    const updatedFlashcards = flashcards.map((card) =>
      card.collection === collectionId ? { ...card, collection: null } : card
    );
    setFlashcards(updatedFlashcards);

    // Update Firestore
    const docRef = doc(db, "users", user.id);
    await setDoc(
      docRef,
      {
        collections: updatedCollections,
        flashcards: updatedFlashcards,
      },
      { merge: true }
    );
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
      return;
    }

    try {
      const data = await response.json();
      if (data.flashcards) {
        const newFlashcardsWithIds = data.flashcards.map(card => ({
          ...card,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          collection: selectedCollection
        }));
        const updatedFlashcards = [...flashcards, ...newFlashcardsWithIds];
        setFlashcards(updatedFlashcards);
        
        // Update Firestore
        const docRef = doc(db, 'users', user.id);
        await setDoc(docRef, { flashcards: updatedFlashcards }, { merge: true });
      } else {
        console.error('No flashcards found in response:', data);
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  };

  const handleEditFlashcard = (flashcard) => {
    setEditingFlashcard(flashcard);
    setNewFlashcard({
      front: flashcard.front,
      back: flashcard.back,
      collection: flashcard.collection,
    });
  };

  const handleDeleteFlashcard = async (flashcardId) => {
    const updatedFlashcards = flashcards.filter(
      (card) => card.id !== flashcardId
    );
    setFlashcards(updatedFlashcards);

    // Update Firestore
    const docRef = doc(db, "users", user.id);
    await setDoc(docRef, { flashcards: updatedFlashcards }, { merge: true });
  };

  const handleOpenDeleteDialog = (target) => {
    setDeleteTarget(target);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeleteTarget(null);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget.type === "flashcard") {
      handleDeleteFlashcard(deleteTarget.id);
    } else if (deleteTarget.type === "collection") {
      handleDeleteCollection(deleteTarget.id);
    }
    handleCloseDeleteDialog();
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
            border-top: 3px solid #fff;
            border-right: 3px solid transparent;
            box-sizing: border-box;
            animation: rotation 1s linear infinite;
          }
          @keyframes rotation {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
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
        backgroundImage: 'url("/bg-purple-white.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#fff",
        minHeight: "100vh",
        paddingBottom: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={2}
        sx={{
          borderBottom: "1px solid #333",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
        }}
      >
        <Button
          onClick={goHome}
          sx={{
            textTransform: "none",
            backgroundColor: "transparent",
            "&:hover": { backgroundColor: "#eaeaea" },
          }}
        >
          <img src="/images/logo.png" alt="Logo" style={{ height: "120px" }} />
        </Button>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body1" fontWeight="bold">
            {fullName}
          </Typography>
          <SignOutButton
            signOutCallback={() => {
              router.push("/signin");
            }}
          >
            <Button
              variant="outlined"
              sx={{
                color: "#0070f3",
                borderColor: "#0070f3",
                "&:hover": { borderColor: "#005bb5", color: "#005bb5" },
              }}
            >
              Sign Out
            </Button>
          </SignOutButton>
        </Box>
      </Box>

      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="#000000" sx={{ mb: 2 }}>
            Collections
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <TextField
                label="New Collection"
                variant="outlined"
                value={newCollection}
                onChange={(e) => setNewCollection(e.target.value)}
                size="small"
                sx={{
                  backgroundColor: "#ffffff",
                  borderRadius: "5px",
                  input: { color: "#000" },
                }}
                InputLabelProps={{ style: { color: "#000" } }}
              />
              <Button
                onClick={handleAddCollection}
                variant="contained"
                sx={{
                  background: "linear-gradient(to right, #0070f3, #9b59b6)",
                  "&:hover": {
                    background: "linear-gradient(to right, #005bb5, #8e44ad)",
                  },
                  color: "white",
                }}
              >
                Add Collection
              </Button>
            </Box>
            <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
              <Button
                onClick={() => handleSelectCollection(null)}
                variant={selectedCollection === null ? "contained" : "outlined"}
                sx={{ m: 0.5 }}
              >
                All
              </Button>
              {collections.map((collection) => (
                <Box
                  key={collection.id}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <Button
                    onClick={() => handleSelectCollection(collection.id)}
                    variant={
                      selectedCollection === collection.id
                        ? "contained"
                        : "outlined"
                    }
                    sx={{ m: 0.5 }}
                  >
                    {collection.name}
                  </Button>
                  <Button
                    onClick={() =>
                      handleOpenDeleteDialog({
                        type: "collection",
                        id: collection.id,
                      })
                    }
                    sx={{ color: "red", minWidth: "auto" }}
                  >
                    <DeleteIcon />
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <form onSubmit={handleFlashcardSubmit} style={{ marginBottom: "40px" }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Front"
              variant="outlined"
              value={newFlashcard.front}
              onChange={(e) =>
                setNewFlashcard({ ...newFlashcard, front: e.target.value })
              }
              required
              sx={{
                backgroundColor: "#ffffff",
                borderRadius: "5px",
                input: { color: "#000" },
              }}
              InputLabelProps={{ style: { color: "#000" } }}
            />
            <TextField
              label="Back"
              variant="outlined"
              value={newFlashcard.back}
              onChange={(e) =>
                setNewFlashcard({ ...newFlashcard, back: e.target.value })
              }
              required
              sx={{
                backgroundColor: "#ffffff",
                borderRadius: "5px",
                input: { color: "#000" },
              }}
              InputLabelProps={{ style: { color: "#000" } }}
            />
            <TextField
              select
              label="Collection"
              value={newFlashcard.collection || ""}
              onChange={(e) =>
                setNewFlashcard({ ...newFlashcard, collection: e.target.value })
              }
              sx={{
                backgroundColor: "#ffffff",
                borderRadius: "5px",
                ".MuiSelect-select": { color: "#000" },
              }}
              InputLabelProps={{ style: { color: "#000" } }}
            >
              <MenuItem value="">No Collection</MenuItem>
              {collections.map((collection) => (
                <MenuItem key={collection.id} value={collection.id}>
                  {collection.name}
                </MenuItem>
              ))}
            </TextField>
            <Button
              type="submit"
              variant="contained"
              sx={{
                background: "linear-gradient(to right, #0070f3, #9b59b6)",
                "&:hover": {
                  background: "linear-gradient(to right, #005bb5, #8e44ad)",
                },
                color: "white",
                fontWeight: "bold",
                borderRadius: "20px",
                padding: "8px 16px",
              }}
            >
              {editingFlashcard ? "Update Flashcard" : "Add Flashcard"}
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
              backgroundColor: "#ffffff",
              borderRadius: "5px",
              input: { color: "#000" },
              "& .MuiInputBase-input::placeholder": { color: "#aaa" },
            }}
            InputLabelProps={{ style: { color: "#000" } }}
          />
          <Button
            onClick={handleGenerateFlashcards}
            variant="outlined"
            sx={{
              background: "linear-gradient(to right, #0070f3, #9b59b6)",
              color: "white",
              borderColor: "transparent",
              "&:hover": {
                background: "linear-gradient(to right, #005bb5, #8e44ad)",
              },
              mt: 2,
              borderRadius: "20px",
              padding: "8px 16px",
            }}
          >
            Generate Flashcards
          </Button>
        </Box>

        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <Grid container spacing={2} sx={{ mt: 4 }}>
            {flashcards
              .filter((flashcard) =>
                selectedCollection
                  ? flashcard.collection === selectedCollection
                  : true
              )
              .map((flashcard, index) => (
                <Grid item key={flashcard.id} xs={12} sm={6} md={4}>
                  <motion.div variants={slideUp}>
                    <Card
                      sx={{
                        backgroundColor: "transparent",
                        perspective: "1000px",
                        height: "200px",
                      }}
                    >
                      <CardActionArea
                        component="div"
                        onClick={() => handleCardClick(index)}
                        sx={{
                          height: "100%",
                          transformStyle: "preserve-3d",
                          transition: "transform 0.6s",
                          transform: flippedCards[index]
                            ? "rotateY(180deg)"
                            : "rotateY(0deg)",
                        }}
                      >
                        <CardContent
                          sx={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            backfaceVisibility: "hidden",
                            backgroundColor: "#ffffff",
                            color: "#000",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography variant="h5" component="div">
                            {flashcard.front}
                          </Typography>
                          <Typography variant="caption" color="gray" sx={{ mt: 1 }}>
                            {flashcard.collection 
                              ? `Collection: ${collections.find(c => c.id === flashcard.collection)?.name || "Unknown"}` 
                              : "No Collection"}
                          </Typography>
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: "10px",
                              right: "10px",
                            }}
                          >
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditFlashcard(flashcard);
                              }}
                              sx={{ minWidth: "auto", color: "#0070f3" }}
                            >
                              <EditIcon />
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDeleteDialog({
                                  type: "flashcard",
                                  id: flashcard.id,
                                });
                              }}
                              sx={{ minWidth: "auto", color: "#ff0000" }}
                            >
                              <DeleteIcon />
                            </Button>
                          </Box>
                        </CardContent>
                        <CardContent
                          sx={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            backfaceVisibility: "hidden",
                            backgroundColor: "#f0f0f0",
                            color: "#000",
                            transform: "rotateY(180deg)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography variant="h5" component="div">
                            {flashcard.back}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
          </Grid>
        </motion.div>
      </Container>

      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this {deleteTarget?.type}? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
