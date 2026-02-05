const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const BASE_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

export const api = {
  baseUrl: BASE_URL,
  async getTickers() {
    const res = await fetch(`${BASE_URL}/tickers`);
    if (!res.ok) throw new Error('Failed to fetch tickers');
    return res.json();
  },

  async getAllStates() {
    const res = await fetch(`${BASE_URL}/states`);
    if (!res.ok) throw new Error('Failed to fetch all states');
    return res.json();
  },

  async enhanceUniverse() {
    const res = await fetch(`${BASE_URL}/tickers/enhance`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to enhance universe');
    return res.json();
  },

  async getSystemMetrics() {
    const res = await fetch(`${BASE_URL}/system-metrics`);
    if (!res.ok) throw new Error('Failed to fetch system metrics');
    return res.json();
  },

  async getLivePrice(ticker) {
    const res = await fetch(`${BASE_URL}/live-price/${ticker}`);
    if (!res.ok) throw new Error(`Failed to fetch price for ${ticker}`);
    return res.json();
  },

  async getBestStrategy(ticker) {
    const res = await fetch(`${BASE_URL}/best-strategy/${ticker}`);
    if (!res.ok) throw new Error(`Failed to fetch strategy for ${ticker}`);
    return res.json();
  },

  async getCurrentSignal(ticker) {
    const res = await fetch(`${BASE_URL}/current-signal/${ticker}`);
    if (!res.ok) throw new Error(`Failed to fetch signal for ${ticker}`);
    return res.json();
  },

  async getExpectedMove(ticker) {
    const res = await fetch(`${BASE_URL}/expected-move/${ticker}`);
    if (!res.ok) throw new Error(`Failed to fetch move for ${ticker}`);
    return res.json();
  },

  async getHistoricalData(ticker, timeframe = '1h') {
    const res = await fetch(`${BASE_URL}/historical/${ticker}?timeframe=${timeframe}`);
    if (!res.ok) throw new Error(`Failed to fetch historical for ${ticker}`);
    return res.json();
  },

  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error('Failed to fetch health');
    return res.json();
  }
};
