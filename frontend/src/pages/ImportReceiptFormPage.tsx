import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  createImportReceipt,
  getProductVariants,
  getSuppliers,
  type ProductVariant,
  type Supplier,
} from "../features/inventory/inventoryApi";

type ImportItemForm = {
  product_variant: string;
  quantity: string;
  import_price: string;
};

export default function ImportReceiptFormPage() {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const [receiptForm, setReceiptForm] = useState({
    receipt_code: `PN-${Date.now()}`,
    supplier: "",
    import_date: today,
    note: "",
  });

  const [items, setItems] = useState<ImportItemForm[]>([
    {
      product_variant: "",
      quantity: "1",
      import_price: "0",
    },
  ]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("vi-VN") + "đ";
  };

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => {
      const quantity = Number(item.quantity || 0);
      const importPrice = Number(item.import_price || 0);

      return sum + quantity * importPrice;
    }, 0);
  }, [items]);

  const fetchInitialData = async () => {
    try {
      const [supplierData, variantData] = await Promise.all([
        getSuppliers(),
        getProductVariants(),
      ]);

      setSuppliers(supplierData);
      setVariants(variantData);
    } catch (error: any) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return;
      }

      setErrorMessage("Không thể tải dữ liệu nhà cung cấp hoặc sản phẩm.");
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleReceiptChange = (field: string, value: string) => {
    setReceiptForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    setItems((prev) => {
      const newItems = [...prev];

      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };

      if (field === "product_variant") {
        const selectedVariant = variants.find(
          (variant) => variant.id === Number(value)
        );

        if (selectedVariant) {
          newItems[index].import_price = String(
            Number(selectedVariant.import_price)
          );
        }
      }

      return newItems;
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        product_variant: "",
        quantity: "1",
        import_price: "0",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => {
      if (prev.length === 1) {
        return prev;
      }

      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const validateForm = () => {
    if (!receiptForm.receipt_code.trim()) {
      return "Vui lòng nhập mã phiếu nhập.";
    }

    if (!receiptForm.supplier) {
      return "Vui lòng chọn nhà cung cấp.";
    }

    if (!receiptForm.import_date) {
      return "Vui lòng chọn ngày nhập.";
    }

    if (items.length === 0) {
      return "Phiếu nhập phải có ít nhất một sản phẩm.";
    }

    for (const item of items) {
      if (!item.product_variant) {
        return "Vui lòng chọn sản phẩm cho tất cả các dòng.";
      }

      if (Number(item.quantity) <= 0) {
        return "Số lượng nhập phải lớn hơn 0.";
      }

      if (Number(item.import_price) < 0) {
        return "Giá nhập không được âm.";
      }
    }

    return "";
  };

  const handleSubmit = async () => {
    try {
      setErrorMessage("");

      const validationError = validateForm();

      if (validationError) {
        setErrorMessage(validationError);
        return;
      }

      await createImportReceipt({
        receipt_code: receiptForm.receipt_code,
        supplier: Number(receiptForm.supplier),
        import_date: receiptForm.import_date,
        note: receiptForm.note,
        items: items.map((item) => ({
          product_variant: Number(item.product_variant),
          quantity: Number(item.quantity),
          import_price: Number(item.import_price),
        })),
      });

      navigate("/imports");
    } catch (error: any) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return;
      }

      if (error.response?.data) {
        setErrorMessage(JSON.stringify(error.response.data));
        return;
      }

      setErrorMessage("Tạo phiếu nhập thất bại.");
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Tạo phiếu nhập hàng
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Lập phiếu nhập nhiều sản phẩm. Sau khi lưu, tồn kho sẽ tự động tăng.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h6">Thông tin phiếu nhập</Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr 1fr",
              },
              gap: 2,
            }}
          >
            <TextField
              label="Mã phiếu nhập"
              value={receiptForm.receipt_code}
              onChange={(event) =>
                handleReceiptChange("receipt_code", event.target.value)
              }
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Nhà cung cấp</InputLabel>
              <Select
                label="Nhà cung cấp"
                value={receiptForm.supplier}
                onChange={(event) =>
                  handleReceiptChange("supplier", event.target.value)
                }
              >
                {suppliers.map((supplier) => (
                  <MenuItem key={supplier.id} value={String(supplier.id)}>
                    {supplier.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Ngày nhập"
              type="date"
              value={receiptForm.import_date}
              onChange={(event) =>
                handleReceiptChange("import_date", event.target.value)
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>

          <TextField
            label="Ghi chú"
            value={receiptForm.note}
            onChange={(event) =>
              handleReceiptChange("note", event.target.value)
            }
            fullWidth
            multiline
            rows={2}
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Danh sách sản phẩm nhập</Typography>
          </Box>

          {items.map((item, index) => {
            const subtotal =
              Number(item.quantity || 0) * Number(item.import_price || 0);

            return (
              <Box
                key={index}
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "2fr 1fr 1fr 1fr auto",
                  },
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <FormControl fullWidth>
                  <InputLabel>Sản phẩm / size / màu</InputLabel>
                  <Select
                    label="Sản phẩm / size / màu"
                    value={item.product_variant}
                    onChange={(event) =>
                      handleItemChange(
                        index,
                        "product_variant",
                        event.target.value
                      )
                    }
                  >
                    {variants.map((variant) => (
                      <MenuItem key={variant.id} value={String(variant.id)}>
                        {variant.product_code} - {variant.product_name} -{" "}
                        {variant.size} - {variant.color} | Tồn:{" "}
                        {variant.current_stock}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Số lượng"
                  type="number"
                  value={item.quantity}
                  onChange={(event) =>
                    handleItemChange(index, "quantity", event.target.value)
                  }
                  fullWidth
                />

                <TextField
                  label="Giá nhập"
                  type="number"
                  value={item.import_price}
                  onChange={(event) =>
                    handleItemChange(index, "import_price", event.target.value)
                  }
                  fullWidth
                />

                <TextField
                  label="Thành tiền"
                  value={formatCurrency(subtotal)}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />

                <IconButton
                  color="error"
                  onClick={() => handleRemoveItem(index)}
                  disabled={items.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            );
          })}

          <Box>
            <Button variant="outlined" onClick={handleAddItem}>
              Thêm dòng sản phẩm
            </Button>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Typography variant="h5" fontWeight="bold">
              Tổng tiền: {formatCurrency(totalAmount)}
            </Typography>
          </Box>

          {errorMessage && (
            <Typography color="error" sx={{ whiteSpace: "pre-wrap" }}>
              {errorMessage}
            </Typography>
          )}

          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button variant="contained" onClick={handleSubmit}>
              Lưu phiếu nhập
            </Button>

            <Button variant="outlined" onClick={() => navigate("/imports")}>
              Hủy
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}