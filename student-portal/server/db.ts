import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../data.json');

// Database Interface
export interface Database {
  getGroups: () => Promise<Record<string, any>>;
  saveGroup: (group: any) => Promise<void>;
  getMessages: (groupId: string) => Promise<any[]>;
  saveMessage: (groupId: string, message: any) => Promise<void>;
  updatePoll: (groupId: string, messageId: string, message: any) => Promise<void>;
}

// 1. PostgreSQL Implementation
class PostgresDB implements Database {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false // Required for many cloud providers (Neon, Heroku)
      }
    });
    this.init();
  }

  async init() {
    try {
      // Create tables if they don't exist
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS groups (
          id TEXT PRIMARY KEY,
          data JSONB
        );
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          group_id TEXT,
          data JSONB,
          created_at BIGINT
        );
      `);
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Failed to initialize database:", error);
    }
  }

  async getGroups() {
    const res = await this.pool.query('SELECT * FROM groups');
    const groups: Record<string, any> = {};
    res.rows.forEach(row => {
      groups[row.id] = row.data;
    });
    return groups;
  }

  async saveGroup(group: any) {
    await this.pool.query(
      'INSERT INTO groups (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2',
      [group.id, group]
    );
  }

  async getMessages(groupId: string) {
    const res = await this.pool.query(
      'SELECT data FROM messages WHERE group_id = $1 ORDER BY created_at ASC',
      [groupId]
    );
    return res.rows.map(row => row.data);
  }

  async saveMessage(groupId: string, message: any) {
    await this.pool.query(
      'INSERT INTO messages (id, group_id, data, created_at) VALUES ($1, $2, $3, $4)',
      [message.id, groupId, message, message.createdAt]
    );
  }

  async updatePoll(groupId: string, messageId: string, message: any) {
    await this.pool.query(
      'UPDATE messages SET data = $1 WHERE id = $2',
      [message, messageId]
    );
  }
}

// 2. Local File Implementation (Fallback)
class LocalDB implements Database {
  private data: { groups: Record<string, any>; messages: Record<string, any[]> };

  constructor() {
    this.data = { groups: {}, messages: {} };
    if (fs.existsSync(DATA_FILE)) {
      try {
        const fileData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        this.data.groups = fileData.groups || {};
        this.data.messages = fileData.messages || {};
      } catch (e) {
        console.error("Failed to load local data:", e);
      }
    }
  }

  private save() {
    // Preserve existing file data structure (including 'files' key if present)
    let existingData: any = {};
    if (fs.existsSync(DATA_FILE)) {
        try {
            existingData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        } catch (e) {}
    }
    
    const newData = {
        ...existingData,
        groups: this.data.groups,
        messages: this.data.messages
    };
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2));
  }

  async getGroups() {
    return this.data.groups;
  }

  async saveGroup(group: any) {
    this.data.groups[group.id] = group;
    this.save();
  }

  async getMessages(groupId: string) {
    return this.data.messages[groupId] || [];
  }

  async saveMessage(groupId: string, message: any) {
    if (!this.data.messages[groupId]) {
      this.data.messages[groupId] = [];
    }
    this.data.messages[groupId].push(message);
    this.save();
  }

  async updatePoll(groupId: string, messageId: string, message: any) {
    if (!this.data.messages[groupId]) return;
    const index = this.data.messages[groupId].findIndex((m: any) => m.id === messageId);
    if (index !== -1) {
      this.data.messages[groupId][index] = message;
      this.save();
    }
  }
}

// Factory to choose implementation
export const getDatabase = (): Database => {
  if (process.env.DATABASE_URL) {
    console.log("Using PostgreSQL Database");
    return new PostgresDB(process.env.DATABASE_URL);
  }
  console.log("Using Local File Database (Fallback)");
  return new LocalDB();
};
