import "dotenv/config";
import express from "express";
import cors from "cors";
import { JustTCG } from "justtcg-js";

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize JustTCG client (uses JUSTTCG_API_KEY env var automatically)
const tcgClient = new JustTCG();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Search for cards by name
app.get("/api/cards/search", async (req, res) => {
  const { name, game } = req.query;

  if (!name || typeof name !== "string") {
    res.status(400).json({ error: "Missing required 'name' query parameter" });
    return;
  }

  try {
    const response = await tcgClient.v1.cards.get({
      query: name,
      game: typeof game === "string" ? game : undefined,
      limit: 20,
    });

    if (response.error) {
      res.status(400).json({ error: response.error, code: response.code });
      return;
    }

    res.json({
      cards: response.data,
      pagination: response.pagination,
      usage: response.usage,
    });
  } catch (error) {
    console.error("Error fetching cards:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch cards",
    });
  }
});

// Get a specific card by ID
app.get("/api/cards/:cardId", async (req, res) => {
  const { cardId } = req.params;

  try {
    const response = await tcgClient.v1.cards.get({
      cardId,
    });

    if (response.error) {
      res.status(400).json({ error: response.error, code: response.code });
      return;
    }

    if (response.data.length === 0) {
      res.status(404).json({ error: "Card not found" });
      return;
    }

    res.json({ card: response.data[0], usage: response.usage });
  } catch (error) {
    console.error("Error fetching card:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch card",
    });
  }
});

// List supported games
app.get("/api/games", async (_req, res) => {
  try {
    const response = await tcgClient.v1.games.list();

    if (response.error) {
      res.status(400).json({ error: response.error, code: response.code });
      return;
    }

    res.json({ games: response.data, usage: response.usage });
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch games",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
