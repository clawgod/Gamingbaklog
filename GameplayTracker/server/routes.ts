import express, { type Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertGameSchema, insertLogSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";

// Set up multer for image uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  })
});

// Ensure uploads directory exists
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

function ensureAuthenticated(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (req.isAuthenticated()) return next();
  res.sendStatus(401);
}

export async function registerRoutes(app: Express) {
  // Set up authentication routes
  setupAuth(app);

  // Games
  app.get("/api/games", ensureAuthenticated, async (req, res) => {
    const games = await storage.getGames(req.user!.id);
    res.json(games);
  });

  app.post("/api/games", ensureAuthenticated, async (req, res) => {
    const parsed = insertGameSchema.parse(req.body);
    const game = await storage.createGame({ ...parsed, userId: req.user!.id });
    res.json(game);
  });

  // Logs
  app.get("/api/logs", ensureAuthenticated, async (req, res) => {
    const gameId = req.query.gameId ? parseInt(req.query.gameId as string) : undefined;
    const dateStr = req.query.date as string | undefined;

    let logs;
    if (dateStr) {
      const date = new Date(dateStr);
      // Ensure the date is valid
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      logs = await storage.getLogsByDate(req.user!.id, date);
    } else {
      logs = await storage.getLogs(req.user!.id, gameId);
    }

    res.json(logs);
  });

  app.post("/api/logs", ensureAuthenticated, async (req, res) => {
    const parsed = insertLogSchema.parse(req.body);
    const log = await storage.createLog({ ...parsed, userId: req.user!.id });
    res.json(log);
  });

  // Custom log type routes
  app.get("/api/custom-log-types", ensureAuthenticated, async (req, res) => {
    const gameId = parseInt(req.query.gameId as string);
    if (!gameId) {
      return res.status(400).json({ message: "Game ID is required" });
    }
    const types = await storage.getCustomLogTypes(req.user!.id, gameId);
    res.json(types);
  });

  app.post("/api/custom-log-types", ensureAuthenticated, async (req, res) => {
    const { gameId, name, fields } = req.body;
    if (!gameId) {
      return res.status(400).json({ message: "Game ID is required" });
    }
    const type = await storage.createCustomLogType(req.user!.id, gameId, name, JSON.stringify(fields));
    res.json(type);
  });

  // Image upload endpoint
  app.post("/api/upload", ensureAuthenticated, upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  return createServer(app);
}