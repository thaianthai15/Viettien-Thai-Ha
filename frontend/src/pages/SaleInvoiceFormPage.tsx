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
  createSaleInvoice,
  getCustomers,
  getProductVariants,
  type Customer,
  type ProductVariant,
} from "../features/inventory/inventoryApi";

type SaleItemForm = {
  product_variant: string;
  quantity: string;
  sale_price: string;
};

export default function SaleInvoiceFormPage() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const [invoiceForm, setInvoiceForm] = useState({
    invoice_code: `HD-${Date.now()}`,
    customer: "",
    sale_date: today,
    note: "",
    discount_amount: "0",
    payment_method: "CASH" as "CASH" | "BANK_TRANSFER" | "CARD" | "OTHER",
  });

  const [items, setItems] = useState<SaleItemForm[]>([
    {
      product_variant: "",
      quantity: "1",
      sale_price: "0",
    },
  ]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("vi-VN") + "đ";
  };

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + Number(item.quantity || 0) * Number(item.sale_price || 0);
    }, 0);
  }, [items]);

  const finalAmount = totalAmount - Number(invoiceForm.discount_amount || 0);

  const fetchInitialData = async () => {
    try {
      const [customerData, variantData] = await Promise.all([
        getCustomers(),
        getProductVariants(),
      ]);

      setCustomers(customerData);
      setVariants(variantData);
    } catch (error: any) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      setErrorMessage("Không thể tải dữ liệu khách hàng hoặc sản phẩm.");
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleInvoiceChange = (field: string, value: string) => {
    setInvoiceForm((prev) => ({
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
          newItems[index].sale_price = String(Number(selectedVariant.sale_price));
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
        sale_price: "0",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const validateForm = () => {
    if (!invoiceForm.invoice_code.trim()) {
      return "Vui lòng nhập mã hóa đơn.";
    }

    for (const item of items) {
      if (!item.product_variant) {
        return "Vui lòng chọn sản phẩm cho tất cả các dòng.";
      }

      const selectedVariant = variants.find(
        (variant) => variant.id === Number(item.product_variant)
      );

      if (!selectedVariant) {
        return "Sản phẩm không hợp lệ.";
      }

      if (Number(item.quantity) <= 0) {
        return "Số lượng bán phải lớn hơn 0.";
      }

      if (Number(item.quantity) > selectedVariant.current_stock) {
        return `${selectedVariant.product_code} - ${selectedVariant.product_name} chỉ còn ${selectedVariant.current_stock} sản phẩm.`;
      }

      if (Number(item.sale_price) < 0) {
        return "Giá bán không được âm.";
      }
    }

    if (Number(invoiceForm.discount_amount || 0) < 0) {
      return "Giảm giá không được âm.";
    }

    if (finalAmount < 0) {
      return "Tổng tiền sau giảm giá không được âm.";
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

      await createSaleInvoice({
        invoice_code: invoiceForm.invoice_code,
        customer: invoiceForm.customer ? Number(invoiceForm.customer) : null,
        sale_date: invoiceForm.sale_date,
        note: invoiceForm.note,
        discount_amount: Number(invoiceForm.discount_amount || 0),
        payment_method: invoiceForm.payment_method,
        items: items.map((item) => ({
          product_variant: Number(item.product_variant),
          quantity: Number(item.quantity),
          sale_price: Number(item.sale_price),
        })),
      });

      navigate("/sales");
    } catch (error: any) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      if (error.response?.data) {
        setErrorMessage(JSON.stringify(error.response.data));
        return;
      }

      setErrorMessage("Tạo hóa đơn bán thất bại.");
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ padding: 4, marginTop: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Tạo hóa đơn bán hàng
        </Typography>

        <Typography color="text.secondary" marginBottom={3}>
          Bán nhiều sản phẩm trong một hóa đơn. Sau khi lưu, tồn kho sẽ tự động giảm.
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="h6">Thông tin hóa đơn</Typography>

          <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
            <TextField
              label="Mã hóa đơn"
              value={invoiceForm.invoice_code}
              onChange={(event) =>
                handleInvoiceChange("invoice_code", event.target.value)
              }
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Khách hàng</InputLabel>
              <Select
                label="Khách hàng"
                value={invoiceForm.customer}
                onChange={(event) =>
                  handleInvoiceChange("customer", event.target.value)
                }
              >
                <MenuItem value="">Khách lẻ</MenuItem>
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={String(customer.id)}>
                    {customer.name || customer.phone || `Khách #${customer.id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Ngày bán"
              type="date"
              value={invoiceForm.sale_date}
              onChange={(event) =>
                handleInvoiceChange("sale_date", event.target.value)
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <FormControl fullWidth>
              <InputLabel>Phương thức thanh toán</InputLabel>
              <Select
                label="Phương thức thanh toán"
                value={invoiceForm.payment_method}
                onChange={(event) =>
                  handleInvoiceChange("payment_method", event.target.value)
                }
              >
                <MenuItem value="CASH">Tiền mặt</MenuItem>
                <MenuItem value="BANK_TRANSFER">Chuyển khoản</MenuItem>
                <MenuItem value="CARD">Thẻ</MenuItem>
                <MenuItem value="OTHER">Khác</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Giảm giá"
              type="number"
              value={invoiceForm.discount_amount}
              onChange={(event) =>
                handleInvoiceChange("discount_amount", event.target.value)
              }
              fullWidth
            />
          </Box>

          <TextField
            label="Ghi chú"
            value={invoiceForm.note}
            onChange={(event) => handleInvoiceChange("note", event.target.value)}
            fullWidth
            multiline
            rows={2}
          />

          <Box marginTop={2}>
            <Typography variant="h6">Danh sách sản phẩm bán</Typography>
          </Box>

          {items.map((item, index) => {
            const subtotal =
              Number(item.quantity || 0) * Number(item.sale_price || 0);

            return (
              <Box
                key={index}
                display="grid"
                gridTemplateColumns="2fr 1fr 1fr 1fr auto"
                gap={2}
                alignItems="center"
              >
                <FormControl fullWidth>
                  <InputLabel>Sản phẩm / size / màu</InputLabel>
                  <Select
                    label="Sản phẩm / size / màu"
                    value={item.product_variant}
                    onChange={(event) =>
                      handleItemChange(index, "product_variant", event.target.value)
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
                  label="Giá bán"
                  type="number"
                  value={item.sale_price}
                  onChange={(event) =>
                    handleItemChange(index, "sale_price", event.target.value)
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

          <Box display="flex" flexDirection="column" alignItems="flex-end" marginTop={2}>
            <Typography variant="h6">
              Tổng tiền: {formatCurrency(totalAmount)}
            </Typography>
            <Typography variant="h6">
              Giảm giá: {formatCurrency(Number(invoiceForm.discount_amount || 0))}
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              Cần thanh toán: {formatCurrency(finalAmount)}
            </Typography>
          </Box>

          {errorMessage && (
            <Typography color="error" whiteSpace="pre-wrap">
              {errorMessage}
            </Typography>
          )}

          <Box display="flex" gap={2} marginTop={2}>
            <Button variant="contained" onClick={handleSubmit}>
              Lưu hóa đơn
            </Button>

            <Button variant="outlined" onClick={() => navigate("/sales")}>
              Hủy
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}