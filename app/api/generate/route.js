import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "/app/firebase-config";
import { collection, writeBatch, doc } from "firebase/firestore";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro-latest",
  generationConfig: { temperature: 0.9, topK: 1, topP: 1, maxOutputTokens: 2048 },
});

export async function POST(req) {
  try {
    const body = await req.json(); // Read and parse the JSON body
    console.log("Request body:", body); // Log the received body
    const { prompt } = body; // Destructure the prompt

    console.log("Sending prompt to API:", prompt);

    // Define a system prompt to guide the response
    const systemPrompt = `Generate concise and effective flashcards based on the following topic: ${prompt}. Format the response as a list of flashcards with 'front' and 'back' properties. Each flashcard should have a 
clear question on one side and a concise answer on the other. Focus on key concepts, 
definitions, and important facts. Ensure that the information is accurate and 
presented in a way that facilitates learning and retention. Avoid creating overly complex or ambiguous flashcards. 
If appropriate, include examples or mnemonics to aid memory. Aim to create a balanced set of flashcards 
that covers the main points of the subject matter.
Only generate 10 flashcards.`;


    const result = await model.generateContent(systemPrompt);
    const response = await result.response.text(); // Get the response as text

    console.log("Raw API response:", response);

    // Format the response into flashcards
    const flashcards = formatResponseToFlashcards(response);

    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      console.error("Unexpected response format or no flashcards generated.");
      return new NextResponse("Unexpected response format from API", {
        status: 500,
      });
    }

    // Save flashcards to Firestore
    const batch = writeBatch(db);
    const flashcardsRef = collection(db, "flashcards");

    flashcards.forEach((flashcard) => {
      const newDocRef = doc(flashcardsRef);
      batch.set(newDocRef, {
        front: flashcard.front,
        back: flashcard.back,
        createdAt: new Date(),
      });
    });

    await batch.commit();
    return NextResponse.json({ flashcards });
  } catch (error) {
    console.error("Error generating or saving flashcards:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Function to format the raw response into flashcards
function formatResponseToFlashcards(response) {
    // Parse the response and create flashcards
    const flashcards = [];
    
    const sections = response.split('\n\n'); // Assuming each flashcard is separated by double newlines
    sections.forEach(section => {
        const [front, back] = section.split('\n'); // Assuming the first line is the front and the second line is the back
        if (front && back) {
            // Remove "Front: " and "Back: " labels
            flashcards.push({ front: front.replace(/^\*\s\*\*Front:\*\*\s*/, '').trim(), back: back.replace(/^\*\s\*\*Back:\*\*\s*/, '').trim() });
        }
    });

    return flashcards;
}