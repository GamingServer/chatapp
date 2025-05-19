import { PieChart, BarChart } from "@mui/x-charts";
import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
const Round = () => {
  const [categoryData, setCategoryData] = useState([]);
  useEffect(() => {
    fetch("http://localhost:8080/api/category/get/alldata").then(
      async (res) => {
        const data = await res.json();
        if (res.ok) {
          setCategoryData(data);
        } else {
          setCategoryData([]);
        }
      }
    );
  }, []);
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "category", headerName: "Category", width: 200 },
    { field: "totalPlayers", headerName: "Total Players", width: 130 },
    { field: "totalPoints", headerName: "Total Points", width: 130 },
    { field: "avgPoints", headerName: "Avg. Points", width: 120 },
    { field: "highest", headerName: "Highest", width: 100 },
    { field: "highestPlayerName", headerName: "Highest Player", width: 150 },
    { field: "lowest", headerName: "Lowest", width: 100 },
    { field: "lowestPlayerName", headerName: "Lowest Player", width: 150 },
  ];

  const rows = categoryData.map((item, index) => ({
    id: index + 1,
    category: item.category,
    totalPlayers: item.status.totalPlayers,
    totalPoints: item.status.totalPoints,
    avgPoints: item.status.avgPoints,
    highest: item.status.highest,
    highestPlayerName: item.status.highestPlayerName,
    lowest: item.status.lowest,
    lowestPlayerName: item.status.lowestPlayerName,
  }));

  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  const metrics =
    categoryData.length > 0
      ? Object.keys(categoryData[0].status).filter(
          (key) => !key.toLowerCase().includes("playername")
        )
      : [];

  const dataset = metrics.map((metric) => {
    const row = { metric };
    categoryData.forEach(({ category, status }) => {
      row[category] = status[metric];
    });
    return row;
  });
  const series = categoryData.map(({ category }) => ({
    dataKey: category,
    label: category,
  }));
  const chartSetting = {
    yAxis: [
      {
        label: "Values",
        width: 60,
      },
    ],
    height: 400,
  };
  const paginationModel = { page: 0, pageSize: 5 };

  return (
    <div className="flex w-full h-full overflow-y-auto flex-col">
      <div className="flex flex-row h-[100%] justify-between w-full p-5">
        <div className="border-2 flex h-[400px] flex-col items-center justify-center shadow-lg rounded-md">
          <h4>Totel Points By Category</h4>
          <PieChart
            series={[
              {
                data: categoryData.map(
                  (item) =>
                    item.status.totalPoints !== 0 && {
                      value: item.status.totalPoints,
                      label: item.category,
                      color: getRandomColor(),
                    }
                ),
              },
            ]}
            width={200}
            height={200}
          />
        </div>
        <div className="border-2 flex h-[400px] flex-col items-center justify-center shadow-lg rounded-md">
          <h4>Totel Player By Category</h4>
          <PieChart
            series={[
              {
                data: categoryData.map(
                  (item) =>
                    item.status.totalPlayers !== 0 && {
                      value: item.status.totalPlayers,
                      label: item.category,
                      color: getRandomColor(),
                    }
                ),
              },
            ]}
            width={200}
            height={200}
          />
        </div>
        <div className="border-2 flex h-[400px] flex-col items-center justify-center shadow-lg rounded-md">
          <h4>Totel AvgPoints By Category</h4>
          <PieChart
            series={[
              {
                data: categoryData.map(
                  (item) =>
                    item.status.avgPoints !== 0 && {
                      value: item.status.avgPoints,
                      label: item.category,
                      color: getRandomColor(),
                    }
                ),
              },
            ]}
            width={200}
            height={200}
          />
        </div>
        <div className="border-2 flex h-[400px] flex-col items-center justify-center shadow-lg rounded-md">
          <h4>Totel highest By Category</h4>
          <PieChart
            series={[
              {
                data: categoryData.map(
                  (item) =>
                    item.status.highest !== 0 && {
                      value: item.status.highest,
                      label: item.category,
                      color: getRandomColor(),
                    }
                ),
              },
            ]}
            width={200}
            height={200}
          />
        </div>
      </div>
      <div className="h-auto flex justify-center items-center w-full flex-col">
        <h2 className="m-3 text-3xl text-blue-500 shadow-sm p-4 rounded-lg">
          Category Stats
        </h2>
        <div className="m-3 shadow-md rounded-lg w-full p-5">
          <Paper sx={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              initialState={{ pagination: { paginationModel } }}
              pageSizeOptions={[5, 10]}
              checkboxSelection
              sx={{ border: 0 }}
            />
          </Paper>
        </div>
      </div>
      <div className="h-[500px] border-2">
        <BarChart
          dataset={dataset}
          xAxis={[{ dataKey: "metric" }]}
          series={series}
          {...chartSetting}
        />
      </div>
    </div>
  );
};

export default Round;
