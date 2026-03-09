import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenAI, Type } from "@google/genai";

admin.initializeApp();

const db = admin.firestore();

export const generatePuzzle = functions.https.onCall(async (data, context) => {
  // A1. Restringir apenas para administradores
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
  }

  const isAdmin = context.auth.token.admin === true;
  if (!isAdmin) {
    throw new functions.https.HttpsError("permission-denied", "User must be an admin.");
  }

  const { difficulty, language } = data;
  if (!difficulty || !language) {
    throw new functions.https.HttpsError("invalid-argument", "Difficulty and language are required.");
  }

  const uid = context.auth.uid;

  // A3. Rate limiting básico: 1 geração por minuto por UID
  const rateLimitRef = db.collection("rate_limits").doc(uid);
  const rateLimitDoc = await rateLimitRef.get();
  const now = Date.now();

  if (rateLimitDoc.exists) {
    const lastGenerated = rateLimitDoc.data()?.lastGenerated || 0;
    if (now - lastGenerated < 60000) {
      throw new functions.https.HttpsError("resource-exhausted", "Rate limit exceeded. Please wait a minute.");
    }
  }

  // A2. Migrar geração para backend (não expor API key)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new functions.https.HttpsError("internal", "Gemini API key not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  let size = 7;
  if (difficulty === "medium") size = 9;
  if (difficulty === "hard") size = 11;

  const prompt = `Create a new, unique crossword puzzle.
  Language: ${language === "en" ? "English" : "Portuguese"}
  Difficulty: ${difficulty}
  Grid Size: ${size}x${size}
  
  Requirements:
  1. The grid must be exactly ${size}x${size}.
  2. Use '#' for blocked (black) cells.
  3. Use uppercase letters for the solution cells.
  4. The grid must be a valid crossword (words must intersect, no 1-letter words, symmetrical if possible).
  5. Provide clues for all words (Across and Down).
  6. Return the data exactly matching the requested JSON schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            gridStr: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            acrossClues: { type: Type.OBJECT },
            downClues: { type: Type.OBJECT }
          },
          required: ["title", "gridStr", "acrossClues", "downClues"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from Gemini");
    }

    const generatedData = JSON.parse(response.text);

    // A4. Validar o puzzle no backend
    const gridStr = generatedData.gridStr;
    if (!Array.isArray(gridStr) || gridStr.length !== size) {
      throw new Error(`Invalid grid size: expected ${size} rows.`);
    }

    for (const row of gridStr) {
      if (typeof row !== "string" || row.length !== size) {
        throw new Error(`Invalid row length: expected ${size} characters.`);
      }
      if (!/^[A-Z#]+$/.test(row)) {
        throw new Error("Invalid characters in grid. Only A-Z and # are allowed.");
      }
    }

    // A4. Reconstruir a numeração de pistas
    const height = size;
    const width = size;
    const acrossClues: Record<number, string> = {};
    const downClues: Record<number, string> = {};
    const cellNumbers: number[][] = Array(height).fill(0).map(() => Array(width).fill(0));
    let currentNumber = 1;

    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        if (gridStr[r][c] === "#") continue;

        const isAcrossStart = c === 0 || gridStr[r][c - 1] === "#";
        const isDownStart = r === 0 || gridStr[r - 1][c] === "#";

        const hasAcrossWord = isAcrossStart && c + 1 < width && gridStr[r][c + 1] !== "#";
        const hasDownWord = isDownStart && r + 1 < height && gridStr[r + 1][c] !== "#";

        if (hasAcrossWord || hasDownWord) {
          cellNumbers[r][c] = currentNumber;
          
          if (hasAcrossWord) {
            acrossClues[currentNumber] = generatedData.acrossClues[currentNumber] || 
                                        generatedData.acrossClues[String(currentNumber)] || 
                                        `Across ${currentNumber}`;
          }
          
          if (hasDownWord) {
            downClues[currentNumber] = generatedData.downClues[currentNumber] || 
                                      generatedData.downClues[String(currentNumber)] || 
                                      `Down ${currentNumber}`;
          }
          
          currentNumber++;
        }
      }
    }

    const newId = `gen-${Date.now()}`;
    const newPuzzleData = {
      id: newId,
      title: generatedData.title,
      language,
      difficulty,
      size: `${size}x${size}`,
      gridStr,
      acrossClues,
      downClues,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: uid
    };

    // A5. Escrita em /puzzles/{id}
    await db.collection("puzzles").doc(newId).set(newPuzzleData);
    
    // Atualizar rate limit
    await rateLimitRef.set({ lastGenerated: now });

    return { id: newId };
  } catch (error) {
    console.error("Error generating puzzle:", error);
    throw new functions.https.HttpsError("internal", "Failed to generate puzzle.");
  }
});
