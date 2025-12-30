-- Ensure profiles has is_online
ALTER TABLE profiles ADD COLUMN is_online BOOLEAN DEFAULT 0;
-- Ensure stories table exists
CREATE TABLE IF NOT EXISTS stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  media_url TEXT NOT NULL,
  type TEXT DEFAULT 'image',
  expires_at INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
