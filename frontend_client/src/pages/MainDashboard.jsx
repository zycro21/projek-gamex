import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { FaPlus, FaEye, FaTrash, FaEdit } from "react-icons/fa";
import Sidebar from "../components/sidebar";
import { Bar, Line, Pie } from "react-chartjs-2";
import "chart.js/auto";
import "../styles/maindashboard.css"

const MainDashboard = () => {
  const [orderStats, setOrderStats] = useState(null);
  // const [reviewStats, setReviewStats] = useState(null);
  const [ratingDistribution, setRatingDistribution] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchRatingDistribution();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch Data Orders
      const orderResponse = await axios.get("http://localhost:5000/order", {
        params: {
          page: 1,
          order_date_sort: "DESC",
        },
        withCredentials: true,
      });

      setOrderStats({
        totalOrders: orderResponse.data.pagination.totalRecords,
        months: orderResponse.data.data.map((order) => new Date(order.order_date).toLocaleString("default", {
          month: "short",
        })),
        orders: orderResponse.data.data.map((order) => order.total_price),
      });
    } catch (error) {
      console.error("Error Fetching Order Stats:", error);
    }
  };

  const fetchRatingDistribution = async () => {
    try {
      const ratingResponse = await axios.get("http://localhost:5000/review/ratings-distribution", { withCredentials: true });
      setRatingDistribution(ratingResponse.data.data);
    } catch (error) {
      console.error("Error Fetching Rating Distribution:", error);
    }
  }

  const renderOrderChart = () => {
    if (!orderStats) return <p>Loading Order Statistics...</p>;

    return (
      <Line
        data={{
          labels: orderStats.month,
          datasets: [
            {
              label: "Order Value",
              data: orderStats.order,
              borderColor: "rgba(75,192,192,1)",
              backgroundColor: "rgba(75,192,192,0.2)",
            },
          ],
        }}
        options={{
          plugins: {
            title: {
              display: true,
              text: "Orders Overview",
            },
          },
          responsive: true,
          maintainAspectRatio: false,
        }}
        style={{ height: "300px", width: "500px"}}
      />
    );
  };

  const renderRatingChart = () => {
    if (!ratingDistribution) return <p>Loading Rating Distribution...</p>;

    const games = Object.keys(ratingDistribution);
    const datasets = Array.from({ length: 10 }, (_, i) => ({
      label: `${i + 1}.0`,
      backgroundColor: `rgba(${50 + i * 20}, ${100 - i * 10}, ${150 + i * 15
        }, 0.6)`,
      data: games.map((game) => ratingDistribution[game][i] || 0),
    }));

    return (
      <Bar
        data={{
          labels: games,
          datasets,
        }}
        options={{
          indexAxis: "y",
          plugins: {
            title: { display: true, text: "Rating Distribution Per Game" },
            legend: { display: true, position: "top" },
          },
          responsive: true,
          maintainAspectRatio: false,
        }}
        style={{ height: "300px", width: "500px"}}
      />
    );
  };

  return (
    <div className="maindashboard-content-1">
      <Sidebar />
      <ToastContainer />
      <div className="dashboard-header-container">
        <h1 className="dashboard-title">DASHBOARD</h1>
      </div>
      <div className="maindashboard-content-2">
        <div className="dashboard-charts">
          <div className="chart-container">
            <h2 className="chart-title">Orders Overview</h2>
            {renderOrderChart()}
          </div>
          <div className="chart-container">
            <h2 className="chart-title">Rating Distribution</h2>
            {renderRatingChart()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
