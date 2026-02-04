# Quant Sourcer

**Democratizing Institutional-Grade Market Intelligence**

Quant Sourcer is a high-velocity trading intelligence engine designed to bring complex market insights to every trader through an intuitive, real-time interface.

## Core Vision
Modern markets are flooded with data, but institutional-grade analysis remains locked behind complex terminals and paywalls. Quant Sourcer bridges this gap by:
- **Simplifying Complexity**: Transforming raw data into actionable bias and expected ranges.
- **Adaptive Intelligence**: Dynamically selecting the best strategy for over 2,000+ assets.
- **Real-Time Execution**: Low-latency polling and historical sync for high-precision tracking.

## Features
- **Live Price Monitoring**: Real-time price polling for a massive universe of tickers.
- **Multi-Strategy Selector**: Built-in strategies for Trend (EMA), Volatility (Bollinger), and Volume.
- **Penny Stock Specialization**: Dedicated logic for assets under $5.00.
- **Visual Terminal**: A beautiful, interactive dashboard with integrated technical layers.
- **Automated Universe Growth**: Incrementally expands its coverage to find high-potential assets.

## Project Structure
```text
/src
  /api             # FastAPI routes and models
  /core            # Configuration, logging, market hours logic
  /data            # Historical and live data management
  /strategies      # Individual strategy implementations
  /engine          # Backtesting, selection, and forecasting logic
  /models          # Data schemas
/config            # YAML configuration files
/data_cache        # Local storage for historical data
main.py            # Entry point
requirements.txt   # Dependencies
```

## Setup & Running

### Backend
1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
2. **Configure Tickers**:
   Edit `config/tickers.yaml`.
3. **Run Server**:
   ```bash
   python main.py
   ```

### Frontend
1. **Navigate to directory**:
   ```bash
   cd frontend
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

### Docker (Recommended)
To run the entire system with a single command:
```bash
docker-compose up --build
```
- **Frontend**: `http://localhost`
- **Backend API**: `http://localhost:8000`

## Deployment

### Deploy to Render
This project is configured for easy deployment on **Render** using the included `render.yaml` blueprint.

1. **Push to GitHub**: Ensure your code is in a GitHub repository.
2. **Connect to Render**: 
   - Go to the [Render Dashboard](https://dashboard.render.com/).
   - Click **New +** and select **Blueprint**.
   - Connect your GitHub repository.
3. **Deploy**: Render will automatically detect the `render.yaml` and set up both the backend (Web Service with Persistent Disk) and frontend (Static Site).

> [!NOTE]
> The backend uses a persistent disk at `/app/data_cache` to store historical data. This ensures fast restarts and reduces API calls to Yahoo Finance.

## API Endpoints
- `GET /tickers`: List of tracked tickers.
- `GET /live-price/{ticker}`: Current live price and timestamp.
- `GET /best-strategy/{ticker}`: The strategy currently performing best for this ticker.
- `GET /current-signal/{ticker}`: Current signal (bullish/bearish/neutral) and confidence.
- `GET /expected-move/{ticker}`: Expected price range and bias.
- `GET /historical/{ticker}`: Recent historical data with indicators.
- `GET /health`: System health status (useful for Render health checks).
