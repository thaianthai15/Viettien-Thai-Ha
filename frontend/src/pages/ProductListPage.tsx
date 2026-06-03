import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";

import {
  getCategories,
  getProducts,
  type Category,
  type Product,
} from "../features/inventory/inventoryApi";

export default function ProductListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    size: "",
    color: "",
  });

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchProducts = async (customFilters = filters) => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await getProducts(customFilters);
      setProducts(data);
    } catch (error) {
      console.error(error);
      setErrorMessage("Không thể tải danh sách sản phẩm.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    fetchProducts(filters);
  };

  const handleResetFilter = () => {
    const emptyFilters = {
      search: "",
      category: "",
      size: "",
      color: "",
    };

    setFilters(emptyFilters);
    fetchProducts(emptyFilters);
  };

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
                    0,
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
                          <Chip
                            label="Ngừng bán"
                            color="default"
                            size="small"
                          />
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

        <Box
          marginTop={3}
          display="grid"
          gridTemplateColumns="2fr 1fr 1fr 1fr auto auto"
          gap={2}
        >
          <TextField
            label="Tìm mã hàng / tên hàng"
            value={filters.search}
            onChange={(event) =>
              handleFilterChange("search", event.target.value)
            }
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Danh mục</InputLabel>
            <Select
              label="Danh mục"
              value={filters.category}
              onChange={(event) =>
                handleFilterChange("category", event.target.value)
              }
            >
              <MenuItem value="">Tất cả</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={String(category.id)}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Size"
            placeholder="M, L, XL"
            value={filters.size}
            onChange={(event) => handleFilterChange("size", event.target.value)}
            fullWidth
          />

          <TextField
            label="Màu"
            placeholder="Trắng, Đen..."
            value={filters.color}
            onChange={(event) =>
              handleFilterChange("color", event.target.value)
            }
            fullWidth
          />

          <Button variant="contained" onClick={handleSearch}>
            Lọc
          </Button>

          <Button variant="outlined" onClick={handleResetFilter}>
            Reset
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
