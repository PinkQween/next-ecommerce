"use client"

import { formatCurrency } from "@/lib/formatters"
import OrdersByDayChartProps from "@/lib/types/OrdersByDay"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const OrdersByDayChart = ({data}: OrdersByDayChartProps) => {
    return (
        <ResponsiveContainer width="100%" minHeight={300}>   
            <LineChart data={data}>
                <CartesianGrid stroke="hsl(var(--muted))" />
                <XAxis dataKey="date" stroke="hsl(var(--primary))" />
                <YAxis tickFormatter={tick => formatCurrency(tick)} stroke="hsl(var(--primary))" />
                <Tooltip formatter={value => formatCurrency(value as number) } />
                <Line dataKey="totalSales" type="monotone" name="Total sales" stroke="hsl(var(--primary))" dot={false} />
            </LineChart>
        </ResponsiveContainer>
    )
}

export default OrdersByDayChart;