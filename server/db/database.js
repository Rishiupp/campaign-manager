import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'campaign_manager.db');
const schemaPath = path.join(__dirname, 'schema.sql');

let db;

try {
  db = new Database(dbPath, { verbose: console.log });
  console.log('Connected to SQLite database.');

  // Auto-migrate schema on startup
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
  console.log('Database schema applied successfully.');
} catch (err) {
  console.error('Failed to initialize database:', err);
  process.exit(1);
}

export default db;
