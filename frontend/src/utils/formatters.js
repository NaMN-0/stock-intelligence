
/**
 * Detects currency symbol based on ticker suffix.
 * US stocks (no suffix) -> $
 * Indian stocks (.NS) -> ₹
 * Crypto (-USD) -> $
 */
export const getCurrencySymbol = (ticker = '') => {
    if (ticker.endsWith('.NS')) return '₹';
    return '$';
};

/**
 * Formats a price value with the appropriate currency symbol.
 */
export const formatPrice = (ticker, value) => {
    if (value === null || value === undefined) return '---';
    const symbol = getCurrencySymbol(ticker);
    const formattedValue = typeof value === 'number'
        ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : value;
    return `${symbol}${formattedValue}`;
};

/**
 * Formats a timestamp into a localized string.
 * Uses device timezone if available, otherwise defaults to IST.
 */
export const formatTime = (dateInput) => {
    if (!dateInput) return '---';
    const date = new Date(dateInput);

    try {
        // Intl.DateTimeFormat will use device location by default.
        // If we want to be explicit about IST fallback, we can check.
        return new Intl.DateTimeFormat('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            // timeZone: 'Asia/Kolkata' // Uncomment to force IST
        }).format(date);
    } catch (e) {
        // Fallback to basic string if Intl fails
        return date.toLocaleTimeString();
    }
};

/**
 * Formats full date and time.
 */
export const formatFullDateTime = (dateInput) => {
    if (!dateInput) return '---';
    const date = new Date(dateInput);
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(date);
};
