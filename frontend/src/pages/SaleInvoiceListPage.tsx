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
  getSaleInvoices,
  type SaleInvoice,
} from "../features/inventory/inventoryApi";

export default function SaleInvoiceListPage() {
  const [invoices, setInvoices] = useState<SaleInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const formatCurrency = (value: string | number) => {
    return Number(value).toLocaleString("vi-VN") + "đ";
  };

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await getSaleInvoices();
      setInvoices(data);
    } catch (error: any) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      setErrorMessage("Không thể tải danh sách hóa đơn bán.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <Container maxWidth="lg">
      <Paper sx={{ padding: 3, marginTop: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Hóa đơn bán hàng
            </Typography>
            <Typography color="text.secondary">
              Theo dõi hóa đơn bán hàng và doanh thu.
            </Typography>
          </Box>

          <Button component={Link} to="/sales/new" variant="contained">
            Tạo hóa đơn bán
          </Button>
        </Box>

        <Box marginTop={3}>
          {isLoading && (
            <Box display="flex" justifyContent="center" padding={4}>
              <CircularProgress />
            </Box>
          )}

          {errorMessage && <Typography color="error">{errorMessage}</Typography>}

          {!isLoading && !errorMessage && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã hóa đơn</TableCell>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Ngày bán</TableCell>
                  <TableCell>Số dòng</TableCell>
                  <TableCell>Giảm giá</TableCell>
                  <TableCell>Thanh toán</TableCell>
                  <TableCell>Tổng cuối</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoice_code}</TableCell>
                    <TableCell>{invoice.customer_name || "Khách lẻ"}</TableCell>
                    <TableCell>{invoice.sale_date}</TableCell>
                    <TableCell>{invoice.items.length}</TableCell>
                    <TableCell>{formatCurrency(invoice.discount_amount)}</TableCell>
                    <TableCell>{invoice.payment_method}</TableCell>
                    <TableCell>{formatCurrency(invoice.final_amount)}</TableCell>
                  </TableRow>
                ))}

                {invoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Chưa có hóa đơn bán nào.
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