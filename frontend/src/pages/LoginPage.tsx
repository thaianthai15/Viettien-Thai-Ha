import { useState } from "react";
import { login } from "../features/auth/authApi";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const data = await login({ username, password });

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      alert("Đăng nhập thành công");
    } catch (error) {
      console.error(error);
      alert("Đăng nhập thất bại");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Đăng nhập</h1>

      <div>
        <input
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <button style={{ marginTop: 12 }} onClick={handleLogin}>
        Đăng nhập
      </button>
    </div>
  );
}