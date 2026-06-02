import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import {
  createProduct,
  createProductVariant,
  getCategories,
  type Category,
} from "../features/inventory/inventoryApi";

export default function ProductFormPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const [productForm, setProductForm] = useState({
    category: "",
    code: "",
    name: "",
    description: "",
  });

  const [variantForm, setVariantForm] = useState({
    size: "",
    color: "",
    barcode: "",
    import_price: "",
    sale_price: "",
    current_stock: "",
    low_stock_threshold: "5",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("Không thể tải danh mục.");
      }
    };

    fetchCategories();
  }, []);

  const handleProductChange = (field: string, value: string) => {
    setProductForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVariantChange = (field: string, value: string) => {
    setVariantForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setErrorMessage("");

      if (!productForm.category) {
        setErrorMessage("Vui lòng chọn danh mục.");
        return;
      }

      if (!productForm.code || !productForm.name) {
        setErrorMessage("Vui lòng nhập mã hàng và tên sản phẩm.");
        return;
      }

      if (!variantForm.size || !variantForm.color) {
        setErrorMessage("Vui lòng nhập size và màu.");
        return;
      }

      const product = await createProduct({
        category: Number(productForm.category),
        code: productForm.code,
        name: productForm.name,
        description: productForm.description,
        is_active: true,
      });

      await createProductVariant({
        product: product.id,
        size: variantForm.size,
        color: variantForm.color,
        barcode: variantForm.barcode,
        import_price: Number(variantForm.import_price || 0),
        sale_price: Number(variantForm.sale_price || 0),
        current_stock: Number(variantForm.current_stock || 0),
        low_stock_threshold: Number(variantForm.low_stock_threshold || 5),
        is_active: true,
      });

      navigate("/products");
    } catch (error) {
      console.error(error);
      setErrorMessage("Tạo sản phẩm thất bại. Vui lòng kiểm tra lại dữ liệu.");
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ padding: 4, marginTop: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Thêm sản phẩm
        </Typography>

        <Typography color="text.secondary" marginBottom={3}>
          Tạo sản phẩm Việt Tiến kèm một biến thể đầu tiên theo size và màu.
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="h6">Thông tin sản phẩm</Typography>

          <FormControl fullWidth>
            <InputLabel>Danh mục</InputLabel>
            <Select
              label="Danh mục"
              value={productForm.category}
              onChange={(event) =>
                handleProductChange("category", event.target.value)
              }
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={String(category.id)}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Mã hàng"
            value={productForm.code}
            onChange={(event) =>
              handleProductChange("code", event.target.value)
            }
            fullWidth
          />

          <TextField
            label="Tên sản phẩm"
            value={productForm.name}
            onChange={(event) =>
              handleProductChange("name", event.target.value)
            }
            fullWidth
          />

          <TextField
            label="Mô tả"
            value={productForm.description}
            onChange={(event) =>
              handleProductChange("description", event.target.value)
            }
            fullWidth
            multiline
            rows={3}
          />

          <Typography variant="h6" marginTop={2}>
            Biến thể đầu tiên
          </Typography>

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <TextField
              label="Size"
              placeholder="M, L, XL..."
              value={variantForm.size}
              onChange={(event) =>
                handleVariantChange("size", event.target.value)
              }
              fullWidth
            />

            <TextField
              label="Màu"
              placeholder="Trắng, Xanh, Đen..."
              value={variantForm.color}
              onChange={(event) =>
                handleVariantChange("color", event.target.value)
              }
              fullWidth
            />

            <TextField
              label="Barcode"
              value={variantForm.barcode}
              onChange={(event) =>
                handleVariantChange("barcode", event.target.value)
              }
              fullWidth
            />

            <TextField
              label="Tồn kho ban đầu"
              type="number"
              value={variantForm.current_stock}
              onChange={(event) =>
                handleVariantChange("current_stock", event.target.value)
              }
              fullWidth
            />

            <TextField
              label="Giá nhập"
              type="number"
              value={variantForm.import_price}
              onChange={(event) =>
                handleVariantChange("import_price", event.target.value)
              }
              fullWidth
            />

            <TextField
              label="Giá bán"
              type="number"
              value={variantForm.sale_price}
              onChange={(event) =>
                handleVariantChange("sale_price", event.target.value)
              }
              fullWidth
            />

            <TextField
              label="Ngưỡng cảnh báo tồn thấp"
              type="number"
              value={variantForm.low_stock_threshold}
              onChange={(event) =>
                handleVariantChange("low_stock_threshold", event.target.value)
              }
              fullWidth
            />
          </Box>

          {errorMessage && (
            <Typography color="error">{errorMessage}</Typography>
          )}

          <Box display="flex" gap={2} marginTop={2}>
            <Button variant="contained" onClick={handleSubmit}>
              Lưu sản phẩm
            </Button>

            <Button variant="outlined" onClick={() => navigate("/products")}>
              Hủy
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}