-- ========================================
-- Database Schema
-- ========================================

-- Run At Table
CREATE TABLE IF NOT EXISTS run_at (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default run_at records
INSERT INTO run_at (title) VALUES 
  ('comA'),
  ('comB')
ON CONFLICT DO NOTHING;

-- Accounts Table
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  acc_number BIGINT UNIQUE NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  balance DECIMAL(15, 2) DEFAULT 0,
  equity DECIMAL(15, 2) DEFAULT 0,
  run_at_id INTEGER REFERENCES run_at(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_accounts_acc_number ON accounts(acc_number);
CREATE INDEX idx_accounts_run_at_id ON accounts(run_at_id);

-- History Table
CREATE TABLE IF NOT EXISTS history (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Current open positions
  current_total_trade INTEGER DEFAULT 0,
  current_profit DECIMAL(15, 2) DEFAULT 0,
  current_lot DECIMAL(10, 2) DEFAULT 0,
  current_order_buy_count INTEGER DEFAULT 0,
  current_order_sell_count INTEGER DEFAULT 0,
  
  -- Today's history (closed orders)
  history_total_trade INTEGER DEFAULT 0,
  history_profit DECIMAL(15, 2) DEFAULT 0,
  history_lot DECIMAL(10, 2) DEFAULT 0,
  history_order_buy_count INTEGER DEFAULT 0,
  history_order_sell_count INTEGER DEFAULT 0,
  history_win INTEGER DEFAULT 0,
  history_loss INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One record per account per day
  UNIQUE(account_id, date)
);

CREATE INDEX idx_history_account_date ON history(account_id, date DESC);
CREATE INDEX idx_history_date ON history(date DESC);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_run_at_updated_at BEFORE UPDATE ON run_at
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_history_updated_at BEFORE UPDATE ON history
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();