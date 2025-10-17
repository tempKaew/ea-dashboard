export interface RunAt {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: number;
  acc_number: number;
  name: string | null;
  email: string | null;
  balance: number;
  equity: number;
  run_at_id: number | null;
  run_at_title: string | null;
  updated_at: string;
  history_count: number;
}

export interface History {
  id: number;
  account_id: number;
  acc_number: number;
  email: string | null;
  date: string;
  balance: number;
  equity: number;

  current_total_trade: number;
  current_profit: number;
  current_lot: number;
  current_order_buy_count: number;
  current_order_sell_count: number;

  history_total_trade: number;
  history_profit: number;
  history_lot: number;
  history_order_buy_count: number;
  history_order_sell_count: number;
  history_win: number;
  history_loss: number;

  updated_at: string;
}

export interface TradeStats {
  total_accounts: number;
  total_balance: number;
  total_equity: number;
  total_open_trades: number;
  total_open_profit: number;
  total_closed_trades: number;
  total_closed_profit: number;
  total_wins: number;
  total_losses: number;
  win_rate: number;
  // Previous business day data
  before_total_open_trades: number;
  before_total_open_profit: number;
  before_total_closed_trades: number;
  before_total_closed_profit: number;
  before_total_wins: number;
  before_total_losses: number;
}
