import { users, games, logs, customLogTypes, type User, type Game, type Log, type InsertUser, type InsertGame, type InsertLog } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, isNotNull } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Games
  getGames(userId: number): Promise<Game[]>;
  createGame(game: InsertGame & { userId: number }): Promise<Game>;

  // Logs
  getLogs(userId: number, gameId?: number): Promise<Log[]>;
  getLogsByDate(userId: number, date: Date): Promise<Log[]>;
  createLog(log: InsertLog & { userId: number }): Promise<Log>;
  getLatestImageByNameAndType(name: string, type: string, userId: number): Promise<{ imageUrl: string | null } | undefined>;

  // Custom log types
  getCustomLogTypes(userId: number, gameId: number): Promise<any[]>;
  createCustomLogType(userId: number, gameId: number, name: string, fields: string): Promise<any>;

  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getGames(userId: number): Promise<Game[]> {
    return db.select().from(games).where(eq(games.userId, userId));
  }

  async createGame(game: InsertGame & { userId: number }): Promise<Game> {
    const [newGame] = await db.insert(games).values(game).returning();
    return newGame;
  }

  async getLogs(userId: number, gameId?: number): Promise<Log[]> {
    const query = gameId
      ? and(eq(logs.userId, userId), eq(logs.gameId, gameId))
      : eq(logs.userId, userId);

    return db
      .select()
      .from(logs)
      .where(query)
      .orderBy(logs.timestamp);
  }

  async getLogsByDate(userId: number, date: Date): Promise<Log[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return db
      .select()
      .from(logs)
      .where(
        and(
          eq(logs.userId, userId),
          gte(logs.timestamp, startOfDay),
          lte(logs.timestamp, endOfDay)
        )
      )
      .orderBy(logs.timestamp);
  }

  async createLog(log: InsertLog & { userId: number }): Promise<Log> {
    if (!log.imageUrl) {
      const lastImage = await this.getLatestImageByNameAndType(log.name, log.type, log.userId);
      if (lastImage) {
        log.imageUrl = lastImage.imageUrl;
      }
    }
    const [newLog] = await db
      .insert(logs)
      .values({ ...log, timestamp: new Date() })
      .returning();
    return newLog;
  }

  async getLatestImageByNameAndType(name: string, type: string, userId: number) {
    return db.select({ imageUrl: logs.imageUrl })
      .from(logs)
      .where(and(
        eq(logs.name, name),
        eq(logs.type, type),
        eq(logs.userId, userId),
        isNotNull(logs.imageUrl)
      ))
      .orderBy(desc(logs.timestamp))
      .limit(1)
      .get();
  }
  async getCustomLogTypes(userId: number, gameId: number) {
    return db
      .select()
      .from(customLogTypes)
      .where(
        and(
          eq(customLogTypes.userId, userId),
          eq(customLogTypes.gameId, gameId)
        )
      );
  }

  async createCustomLogType(userId: number, gameId: number, name: string, fields: string) {
    const [type] = await db
      .insert(customLogTypes)
      .values({
        userId,
        gameId,
        name,
        fields,
      })
      .returning();
    return type;
  }
}

export const storage = new DatabaseStorage();