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
        const getDateRange = () => {
            const { days, weeks, months, years } = chartConfig[filter];
            const endDate = new Date();
            const startDate = createDate(
                endDate,
                -days,
                -weeks,
                -months,
                -years
            );
            const startTimeStampUnix = convertDateToUnixTimeStamp(startDate);
            const endTimeStampUnix = convertDateToUnixTimeStamp(endDate);

            return {
                startTimeStampUnix,
                endTimeStampUnix,
            };
        };

        const updateChartData = async () => {
            try {
                const { startTimeStampUnix, endTimeStampUnix } = getDateRange();
                const resolution = chartConfig[filter].resolution;
                const result = await fetchHistoricalData(
                    stockSymbol,
                    resolution,
                    startTimeStampUnix,
                    endTimeStampUnix
                );
                setData(formData(result));
            } catch (err) {
                setData([]);
                console.log(err);
            }
        };
        updateChartData();
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
