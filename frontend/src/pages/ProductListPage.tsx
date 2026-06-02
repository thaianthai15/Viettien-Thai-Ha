import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
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

import { getProducts, type Product } from "../features/inventory/inventoryApi";

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error(error);
      setErrorMessage("Không thể tải danh sách sản phẩm.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <Container maxWidth="lg">
      <Paper sx={{ padding: 3, marginTop: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Danh sách sản phẩm
            </Typography>
            <Typography color="text.secondary">
              Quản lý sản phẩm Việt Tiến theo mã hàng, danh mục, size và màu.
            </Typography>
          </Box>

          <Button component={Link} to="/products/new" variant="contained">
            Thêm sản phẩm
          </Button>
        </Box>

        <Box marginTop={3}>
          {isLoading && (
            <Box display="flex" justifyContent="center" padding={4}>
              <CircularProgress />
            </Box>
          )}

          {errorMessage && (
            <Typography color="error">{errorMessage}</Typography>
          )}

          {!isLoading && !errorMessage && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã hàng</TableCell>
                  <TableCell>Tên sản phẩm</TableCell>
                  <TableCell>Danh mục</TableCell>
                  <TableCell>Biến thể</TableCell>
                  <TableCell>Tổng tồn</TableCell>
                  <TableCell>Trạng thái</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {products.map((product) => {
                  const totalStock = product.variants.reduce(
                    (sum, variant) => sum + variant.current_stock,
                    0
                  );

                  return (
                    <TableRow key={product.id}>
                      <TableCell>{product.code}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category_name}</TableCell>

                      <TableCell>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          {product.variants.length > 0 ? (
                            product.variants.map((variant) => (
                              <Chip
                                key={variant.id}
                                label={`${variant.size} - ${variant.color}: ${variant.current_stock}`}
                                size="small"
                              />
                            ))
                          ) : (
                            <Typography color="text.secondary">
                              Chưa có biến thể
                            </Typography>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell>{totalStock}</TableCell>

                      <TableCell>
                        {product.is_active ? (
                          <Chip label="Đang bán" color="success" size="small" />
                        ) : (
                          <Chip label="Ngừng bán" color="default" size="small" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Chưa có sản phẩm nào.
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