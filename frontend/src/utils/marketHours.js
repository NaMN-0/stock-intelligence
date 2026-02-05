
/**
 * Classifies a ticker into a market region.
 */
export const getMarketRegion = (ticker) => {
    if (!ticker) return 'US';
    const t = ticker.toUpperCase();
    if (t.endsWith('.NS') || t.endsWith('.BO')) return 'IN';
    if (t.includes('-USD') || t.includes('USD') || t.includes('BTC') || t.includes('ETH')) return 'CRYPTO';
    return 'US';
};

/**
 * Checks if the specified market is currently open.
 * Returns { isOpen: boolean, nextOpen: string, status: string }
 */
export const getMarketStatus = (region) => {
    const now = new Date();
    const utcDay = now.getUTCDay(); // 0 = Sun, 6 = Sat
    const utcHour = now.getUTCHours();
    const utcMin = now.getUTCMinutes();
    const currentTime = utcHour * 60 + utcMin;

    if (region === 'CRYPTO') {
        return { isOpen: true, status: 'LIVE_24/7' };
    }

    if (region === 'IN') {
        // IST = UTC + 5:30
        // Open: 09:15 IST = 03:45 UTC = 225 mins
        // Close: 15:30 IST = 10:00 UTC = 600 mins

        // Weekend check
        if (utcDay === 0 || utcDay === 6) return { isOpen: false, status: 'WEEKEND' };

        if (currentTime >= 225 && currentTime < 600) {
            return { isOpen: true, status: 'MARKET_OPEN' };
        }
        return { isOpen: false, status: 'MARKET_CLOSED' };
    }

    if (region === 'US') {
        // EST = UTC - 5 (Standard) or -4 (Daylight)
        // Let's assume Standard (UTC-5) for simplicity or approximate
        // NYSE Open: 9:30 AM ET
        // NYSE Close: 4:00 PM ET

        // UTC-5: Open 14:30 (870m), Close 21:00 (1260m)
        // UTC-4: Open 13:30 (810m), Close 20:00 (1200m)
        // We will use a broad check for now, can be refined with DST library later if needed.
        // Assuming UTC-5 (Winter) / UTC-4 (Summer).

        // Using a safe approximation for "Live Analysis" availability
        // 13:30 UTC to 21:00 UTC covers both roughly.

        if (utcDay === 0 || utcDay === 6) return { isOpen: false, status: 'WEEKEND' };

        if (currentTime >= 810 && currentTime < 1260) {
            return { isOpen: true, status: 'MARKET_OPEN' };
        }
        return { isOpen: false, status: 'MARKET_CLOSED' };
    }

    return { isOpen: false, status: 'UNKNOWN' };
};
