from django.conf import settings
from django.db import models
from django.utils import timezone

class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Danh mục"
        verbose_name_plural = "Danh mục"

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
    )
    code = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="products/", blank=True, null=True)
    is_active = models.BooleanField(default=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_products",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Sản phẩm"
        verbose_name_plural = "Sản phẩm"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.code} - {self.name}"


class ProductVariant(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="variants",
    )

    size = models.CharField(max_length=50)
    color = models.CharField(max_length=100)

    barcode = models.CharField(max_length=100, blank=True)
    import_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    sale_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    current_stock = models.IntegerField(default=0)
    low_stock_threshold = models.IntegerField(default=5)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Biến thể sản phẩm"
        verbose_name_plural = "Biến thể sản phẩm"
        unique_together = ("product", "size", "color")

    def __str__(self):
        return f"{self.product.code} - {self.size} - {self.color}"
    
from django.utils import timezone


class Supplier(models.Model):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    note = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Nhà cung cấp"
        verbose_name_plural = "Nhà cung cấp"
        ordering = ["name"]

    def __str__(self):
        return self.name


class ImportReceipt(models.Model):
    receipt_code = models.CharField(max_length=100, unique=True)
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.PROTECT,
        related_name="import_receipts",
    )
    import_date = models.DateField(default=timezone.now)
    note = models.TextField(blank=True)

    total_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_import_receipts",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Phiếu nhập"
        verbose_name_plural = "Phiếu nhập"
        ordering = ["-created_at"]

    def __str__(self):
        return self.receipt_code


class ImportReceiptItem(models.Model):
    receipt = models.ForeignKey(
        ImportReceipt,
        on_delete=models.CASCADE,
        related_name="items",
    )
    product_variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.PROTECT,
        related_name="import_items",
    )
    quantity = models.PositiveIntegerField()
    import_price = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Dòng phiếu nhập"
        verbose_name_plural = "Dòng phiếu nhập"

    def __str__(self):
        return f"{self.receipt.receipt_code} - {self.product_variant}"


class StockTransaction(models.Model):
    class TransactionType(models.TextChoices):
        IMPORT = "IMPORT", "Nhập hàng"
        SALE = "SALE", "Bán hàng"
        ADJUSTMENT = "ADJUSTMENT", "Điều chỉnh"
        RETURN = "RETURN", "Trả hàng"

    product_variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.PROTECT,
        related_name="stock_transactions",
    )

    transaction_type = models.CharField(
        max_length=20,
        choices=TransactionType.choices,
    )

    quantity = models.IntegerField()
    before_stock = models.IntegerField()
    after_stock = models.IntegerField()

    reference_code = models.CharField(max_length=100, blank=True)
    note = models.TextField(blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="stock_transactions",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Lịch sử kho"
        verbose_name_plural = "Lịch sử kho"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.transaction_type} - {self.product_variant} - {self.quantity}"