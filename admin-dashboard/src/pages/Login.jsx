import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:30055/api/auth/login", { username, password });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.user.role);

        console.log("✅ Token:", response.data.token);
        console.log("✅ Role:", response.data.user.role);

        if (response.data.user.role === "admin") {
          setIsAuthenticated(true);
          navigate("/users"); // ✅ เข้า Admin Dashboard
        } else {
          alert("❌ คุณไม่มีสิทธิ์เข้าถึงระบบนี้");
        }
      } else {
        alert("❌ ล็อกอินล้มเหลว");
      }
    } catch (error) {
      console.error("❌ Error logging in:", error.response?.data || error);
      alert("❌ ข้อมูลล็อกอินไม่ถูกต้อง");
    }
  };

 return (
  <div className="flex items-center justify-center h-screen bg-gray-100">
    <div className="bg-white p-6 rounded-lg shadow-md w-80">
      <h2 className="text-xl font-bold mb-4">🔑 เข้าสู่ระบบ สำหรับแอดมิน</h2>

      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 border rounded mb-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          ล็อกอิน
        </button>
      </form>

      <div className="mt-4 p-3 border-2 border-dashed relative z-50 not-sr-only">
        <h1 className="text-lg font-bold">Username: test21</h1>
        <h1 className="text-lg font-bold">Password: nnn112233</h1>
      </div>
    </div>
  </div>
);
};

export default Login;
