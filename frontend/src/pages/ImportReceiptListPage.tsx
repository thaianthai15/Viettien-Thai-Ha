import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import {
  getImportReceipts,
  type ImportReceipt,
} from "../features/inventory/inventoryApi";

export default function ImportReceiptListPage() {
  const [receipts, setReceipts] = useState<ImportReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const formatCurrency = (value: string | number) => {
    return Number(value).toLocaleString("vi-VN") + "đ";
  };

  const fetchReceipts = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await getImportReceipts();
      setReceipts(data);
    } catch (error: any) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return;
      }

      setErrorMessage("Không thể tải danh sách phiếu nhập.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Phiếu nhập hàng
            </Typography>

            <Typography color="text.secondary">
              Theo dõi các lần nhập hàng từ nhà cung cấp.
            </Typography>
          </Box>

          <Button component={Link} to="/imports/new" variant="contained">
            Tạo phiếu nhập
          </Button>
        </Box>

        <Box sx={{ mt: 3 }}>
          {isLoading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                p: 4,
              }}
            >
              <CircularProgress />
            </Box>
          )}

          {errorMessage && <Typography color="error">{errorMessage}</Typography>}

          {!isLoading && !errorMessage && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã phiếu</TableCell>
                  <TableCell>Nhà cung cấp</TableCell>
                  <TableCell>Ngày nhập</TableCell>
                  <TableCell>Số dòng</TableCell>
                  <TableCell>Tổng tiền</TableCell>
                  <TableCell>Ghi chú</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell>{receipt.receipt_code}</TableCell>
                    <TableCell>{receipt.supplier_name}</TableCell>
                    <TableCell>{receipt.import_date}</TableCell>
                    <TableCell>{receipt.items.length}</TableCell>
                    <TableCell>
                      {formatCurrency(receipt.total_amount)}
                    </TableCell>
                    <TableCell>{receipt.note}</TableCell>
                  </TableRow>
                ))}

                {receipts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Chưa có phiếu nhập nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Box>
      </Paper>
    </Container>
  );
}