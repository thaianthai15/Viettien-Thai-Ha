from django.contrib import admin

from .models import (
    Category,
    Product,
    ProductVariant,
    Supplier,
    ImportReceipt,
    ImportReceiptItem,
    StockTransaction,
    Customer,
    SaleInvoice,
    SaleInvoiceItem,
)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "is_active", "created_at"]
    search_fields = ["name"]
    list_filter = ["is_active"]


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["id", "code", "name", "category", "is_active", "created_at"]
    search_fields = ["code", "name"]
    list_filter = ["category", "is_active"]
    inlines = [ProductVariantInline]


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "product",
        "size",
        "color",
        "import_price",
        "sale_price",
        "current_stock",
        "low_stock_threshold",
        "is_active",
    ]
    search_fields = ["product__code", "product__name", "barcode", "size", "color"]
    list_filter = ["size", "color", "is_active"]

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "phone", "email", "is_active", "created_at"]
    search_fields = ["name", "phone", "email"]
    list_filter = ["is_active"]


class ImportReceiptItemInline(admin.TabularInline):
    model = ImportReceiptItem
    extra = 1
    readonly_fields = ["subtotal"]


@admin.register(ImportReceipt)
class ImportReceiptAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "receipt_code",
        "supplier",
        "import_date",
        "total_amount",
        "created_by",
        "created_at",
    ]
    search_fields = ["receipt_code", "supplier__name"]
    list_filter = ["supplier", "import_date"]
    inlines = [ImportReceiptItemInline]


@admin.register(StockTransaction)
class StockTransactionAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "product_variant",
        "transaction_type",
        "quantity",
        "before_stock",
        "after_stock",
        "reference_code",
        "created_by",
        "created_at",
    ]
    search_fields = [
        "product_variant__product__code",
        "product_variant__product__name",
        "reference_code",
    ]
    list_filter = ["transaction_type", "created_at"]

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "phone", "email", "created_at"]
    search_fields = ["name", "phone", "email"]


class SaleInvoiceItemInline(admin.TabularInline):
    model = SaleInvoiceItem
    extra = 1
    readonly_fields = ["subtotal"]


@admin.register(SaleInvoice)
class SaleInvoiceAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "invoice_code",
        "customer",
        "sale_date",
        "total_amount",
        "discount_amount",
        "final_amount",
        "payment_method",
        "created_by",
        "created_at",
    ]
    search_fields = ["invoice_code", "customer__name", "customer__phone"]
    list_filter = ["sale_date", "payment_method"]
    inlines = [SaleInvoiceItemInline]