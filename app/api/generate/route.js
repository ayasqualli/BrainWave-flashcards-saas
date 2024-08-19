import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "/app/firebase-config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: { responseMimeType: "application/json" },
});


// Add the system prompt
const systemPrompt = `You are a flashcard creator. Your task is to generate concise and effective flashcards based on the given topic or content. Each flashcard should have a 
clear question on one side and a concise answer on the other. Focus on key concepts, 
definitions, and important facts. Ensure that the information is accurate and 
presented in a way that facilitates learning and retention. Avoid creating overly complex or ambiguous flashcards. 
If appropriate, include examples or mnemonics to aid memory. Aim to create a balanced set of flashcards 
that covers the main points of the subject matter.
Only generate 10 flashcards.

Return in the following JSON format:
{
  "flashcards": [{"front": str, "back": str}]
}
Ensure that your entire response is a valid JSON object.
Please do not include any extra newlines or words. Only return all flashcards as shown above.`;

export async function POST(req) {
  try {
    const { text } = await req.json();
    const prompt = `${systemPrompt}\n${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    let flashcards;
    try {
      flashcards = JSON.parse(response).flashcards;
    } catch (jsonError) {
      console.error("Error parsing JSON response:", jsonError);
      return new NextResponse("Error parsing response from API", {
        status: 500,
      });
    }

    if (!Array.isArray(flashcards) || flashcards.length !== 10) {
      console.error("Unexpected response format or number of flashcards.");
      return new NextResponse("Unexpected response format from API", {
        status: 500,
      });
    }

    // Save each flashcard to Firestore
    const batch = db.batch();
    flashcards.forEach(async (flashcard) => {
      const flashcardRef = collection(db, "flashcards");
      batch.set(flashcardRef, {
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
