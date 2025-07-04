import React from "react";
import { ResponsiveLine } from "@nivo/line";

type MoodPoint = {
  date: string;
  moodScore: number; // should be 1 to 5
};

type Props = {
  data: MoodPoint[];
};

const moodMap: Record<number, string> = {
  1: "😞",
  2: "😕",
  3: "😐",
  4: "😊",
  5: "😄",
};

export default function LiveMoodLineChart({ data }: Props) {
  const chartData = [
    {
      id: "Mood",
      color: "hsl(265, 70%, 50%)",
      data: data.map((item) => ({
        x: item.date,
        y: item.moodScore,
      })),
    },
  ];

  return (
    <div style={{ height: "230px", width: "100%" }}>
      <ResponsiveLine
        data={chartData}
        margin={{ top: 10, right: 30, bottom: 50, left: 50 }} // Increased left margin
        xScale={{ type: "point" }}
        yScale={{ type: "linear", min: 1, max: 5 }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Date",
          legendOffset: 36,
          legendPosition: "middle",
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 10,
          tickRotation: 0,
          legend: "Mood",
          legendOffset: -40,
          legendPosition: "middle",
          format: (value) => moodMap[Number(value)] || "", // ✅ cast to number
        }}
        pointSize={10}
        pointColor="white"
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        enableGridY={true}
        enableGridX={true}
        enableArea={true}
        areaOpacity={0.1}
        colors={{ datum: "color" }}
        lineWidth={3}
        tooltip={({ point }) => {
          const mood = point.data.y as number;
          const emoji = moodMap[mood];
          return (
            <div className="bg-white px-3 py-1 rounded shadow text-sm text-black">
              <strong>{point.data.xFormatted}</strong>
              <br />
              Mood: {emoji} ({mood})
            </div>
          );
        }}
        useMesh={true}
        theme={{
          axis: {
            ticks: {
              text: {
                fill: "#6B7280",
              },
            },
          },
          grid: {
            line: {
              stroke: "#E5E7EB",
              strokeWidth: 1,
              strokeDasharray: "4 4", // dashed lines
            },
          },
        }}
      />
    </div>
  );
}
