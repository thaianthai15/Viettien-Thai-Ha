import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";

import { getMe } from "../features/auth/authApi";
import type { UserMe } from "../features/auth/authApi";

export default function HomePage() {
  const [user, setUser] = useState<UserMe | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
  };

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const data = await getMe();
        setUser(data);
      } catch (error) {
        console.error(error);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    };

    fetchMe();
  }, []);

  return (
    <Container maxWidth="md">
      <Paper sx={{ padding: 4, marginTop: 5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" fontWeight="bold">
            Viettien Agency Manager
          </Typography>

          <Button variant="outlined" color="error" onClick={handleLogout}>
            Đăng xuất
          </Button>
        </Box>

        <Box marginTop={3}>
          {user ? (
            <>
              <Typography>
                Xin chào: <strong>{user.first_name || user.username}</strong>
              </Typography>

              <Typography>
                Vai trò: <strong>{user.role}</strong>
              </Typography>

              <Typography>
                Đại lý: <strong>{user.agency_name || "Chưa cập nhật"}</strong>
              </Typography>

              <Box marginTop={3} display="flex" gap={2}>
                <Button component={Link} to="/products" variant="contained">
                  Quản lý sản phẩm
                </Button>
              </Box>
            </>
          ) : (
            <Typography>Đang tải thông tin người dùng...</Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
}