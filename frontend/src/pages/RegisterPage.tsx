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

import { register } from "../features/auth/authApi";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    agency_name: "",
    agency_address: "",
    password: "",
    password_confirm: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRegister = async () => {
    try {
      setErrorMessage("");

      await register(formData);

      navigate("/login");
    } catch (error) {
      console.error(error);
      setErrorMessage("Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ padding: 4, marginTop: 5 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Đăng ký tài khoản
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Tên đăng nhập"
            value={formData.username}
            onChange={(event) => handleChange("username", event.target.value)}
            fullWidth
          />

          <TextField
            label="Email"
            value={formData.email}
            onChange={(event) => handleChange("email", event.target.value)}
            fullWidth
          />

          <TextField
            label="Họ"
            value={formData.last_name}
            onChange={(event) => handleChange("last_name", event.target.value)}
            fullWidth
          />

          <TextField
            label="Tên"
            value={formData.first_name}
            onChange={(event) => handleChange("first_name", event.target.value)}
            fullWidth
          />

          <TextField
            label="Số điện thoại"
            value={formData.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
            fullWidth
          />

          <TextField
            label="Tên đại lý"
            value={formData.agency_name}
            onChange={(event) => handleChange("agency_name", event.target.value)}
            fullWidth
          />

          <TextField
            label="Địa chỉ đại lý"
            value={formData.agency_address}
            onChange={(event) => handleChange("agency_address", event.target.value)}
            fullWidth
            multiline
            rows={2}
          />

          <TextField
            label="Mật khẩu"
            type="password"
            value={formData.password}
            onChange={(event) => handleChange("password", event.target.value)}
            fullWidth
          />

          <TextField
            label="Xác nhận mật khẩu"
            type="password"
            value={formData.password_confirm}
            onChange={(event) => handleChange("password_confirm", event.target.value)}
            fullWidth
          />

          {errorMessage && (
            <Typography color="error">{errorMessage}</Typography>
          )}

          <Button variant="contained" onClick={handleRegister}>
            Đăng ký
          </Button>

          <Typography>
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}