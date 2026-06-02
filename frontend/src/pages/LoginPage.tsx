import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import { login } from "../features/auth/authApi";

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    try {
      setErrorMessage("");

      const data = await login({
        username,
        password,
      });

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      navigate("/");
    } catch (error) {
      console.error(error);
      setErrorMessage("Đăng nhập thất bại. Vui lòng kiểm tra tài khoản hoặc mật khẩu.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ padding: 4, marginTop: 10 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Đăng nhập
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Tên đăng nhập"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            fullWidth
          />

          <TextField
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            fullWidth
          />

          {errorMessage && (
            <Typography color="error">{errorMessage}</Typography>
          )}

          <Button variant="contained" onClick={handleLogin}>
            Đăng nhập
          </Button>

          <Typography>
            Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}