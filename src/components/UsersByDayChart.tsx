"use client"

import { formatNumber } from "@/lib/formatters"
import { CartesianGrid, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const OrdersByDayChart = ({ data }: {
    data: {
        date: string
        totalUsers: number
    }[]
}) => {
    return (
        <ResponsiveContainer width="100%" minHeight={300}>   
            <BarChart data={data}>
                <CartesianGrid stroke="hsl(var(--muted))" />
                <XAxis dataKey="date" stroke="hsl(var(--primary))" />
                <YAxis
                    tickFormatter={tick => formatNumber(tick)}
                    stroke="hsl(var(--primary))"
                />
                <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    formatter={value => formatNumber(value as number)}
                />
                <Bar
                    dataKey="totalUsers"
                    name="New Customers"
                    stroke="hsl(var(--primary))"
                />
            </BarChart>
        </ResponsiveContainer>
    )
}

export default OrdersByDayChart;