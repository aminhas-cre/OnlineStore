"use client";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function RevenueChart({ data }: { data: { day: string; online: number; pos: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="day" fontSize={12} />
        <YAxis fontSize={12} tickFormatter={(v) => `$${v}`} />
        <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
        <Bar dataKey="online" stackId="a" fill="#b5586b" name="Online" />
        <Bar dataKey="pos" stackId="a" fill="#e0a9b4" name="POS" />
      </BarChart>
    </ResponsiveContainer>
  );
}
