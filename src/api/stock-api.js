import { mockHistoricalData } from "../constants/mock";

const basePath = "https://finnhub.io/api/v1";

const API_KEY = import.meta.env.VITE_STOCK_API_KEY;

export const searchSymbols = async (query) => {
    const url = `${basePath}/search?q=${query}&token=${API_KEY}`;
    return await fetchResult(url);
};

export const fetchStockDetails = async (stockSymbol) => {
    const url = `${basePath}/stock/profile2?symbol=${stockSymbol}&token=${API_KEY}`;
    return await fetchResult(url);
};

export const fetchRecentStockPrice = async (stockSymbol) => {
    const url = `${basePath}/quote?symbol=${stockSymbol}&token=${API_KEY}`;
    return await fetchResult(url);
};

// export const fetchHistoricalData = async (
//     stockSymbol,
//     resolution,
//     from,
//     to
// ) => {
//     const url = `${basePath}/stock/candle?symbol=${stockSymbol}&resolution=${resolution}&from=${from}&to=${to}&token=${API_KEY}`;

//     const data = await fetchResult(url);
//     if (data.s !== "ok") {
//         return mockHistoricalData;
//     }

//     return data;
// };

export const fetchHistoricalData = async (
    stockSymbol,
    resolution,
    from,
    to
) => {
    return mockHistoricalData;
};

const fetchResult = async (url) => {
    const res = await fetch(url);

    if (!res.ok) {
        const message = `An Error has occured: ${res.status}`;
        throw new Error(message);
    }

    return res.json();
};
