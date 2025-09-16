import React, { useState, useContext, useEffect } from "react";
import Card from "./Card";
import ThemeContext from "../context/ThemeContext";
import {
    convertDateToUnixTimeStamp,
    convertUnixTimeStampToDate,
    createDate,
} from "../helpers/date-helper";
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { chartConfig } from "../constants/config";
import ChartFilter from "./ChartFilter";
import StockContext from "../context/StockContext";
import { fetchHistoricalData } from "../api/stock-api";

const Chart = () => {
    const [data, setData] = useState([]);
    const [filter, setFilter] = useState("1W");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { darkMode } = useContext(ThemeContext);
    const { stockSymbol } = useContext(StockContext);

    const formData = (data) => {
        return data.c.map((item, index) => {
            return {
                value: item.toFixed(2),
                date: convertUnixTimeStampToDate(data.t[index]),
            };
        });
    };

    useEffect(() => {
        let cancelled = false;

        async function updateChartData() {
            setLoading(true);
            setError(null);

            const cfg = chartConfig[filter] ||
                chartConfig["1M"] || { days: 30, resolution: "D" };

            const endDate = new Date();
            const startDate = createDate(endDate, -cfg.days, 0, 0, 0);
            const from = convertDateToUnixTimeStamp(startDate);
            const to = convertDateToUnixTimeStamp(endDate);

            try {
                const raw = await fetchHistoricalData(
                    stockSymbol,
                    cfg.resolution,
                    from,
                    to
                );
                if (cancelled) return;
                const formatted = formData(raw);
                setData(formatted);
            } catch (err) {
                if (cancelled) return;
                console.error("Error loading chart data:", err);
                setError(err?.message || "Failed to load chart data");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        if (stockSymbol) updateChartData();

        return () => {
            cancelled = true;
        };
    }, [stockSymbol, filter]);

    return (
        <Card>
            <ul className="flex absolute top-2 right-2 z-40">
                {Object.keys(chartConfig).map((item) => {
                    return (
                        <li key={item}>
                            <ChartFilter
                                text={item}
                                active={filter === item}
                                onClick={() => {
                                    setFilter(item);
                                }}
                            />
                        </li>
                    );
                })}
            </ul>
            {loading && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/60">
                    <div className="text-sm">Loading chart…</div>
                </div>
            )}
            {error && (
                <div className="absolute top-10 right-2 z-50 text-xs text-red-600">
                    {error}
                </div>
            )}
            <ResponsiveContainer>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient
                            id="chartColor"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="5%"
                                stopColor={
                                    darkMode ? "#312e81" : "rgb(199 210 254)"
                                }
                                stopOpacity={0.8}
                            />
                            <stop
                                offset="95%"
                                stopColor={
                                    darkMode ? "#312e81" : "rgb(199 210 254)"
                                }
                                stopOpacity={0}
                            />
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#312e81"
                        fillOpacity={1}
                        strokeWidth={0.5}
                        fill="url(#chartColor)"
                    />
                    <Tooltip
                        contentStyle={
                            darkMode ? { backgroundColor: "#111827" } : null
                        }
                        itemStyle={darkMode ? { color: "#818cf8" } : null}
                    />
                    <XAxis dataKey={"date"} />
                    <YAxis domain={["dataMin", "dataMax"]} />
                </AreaChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default Chart;
