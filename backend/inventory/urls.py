from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    ProductViewSet,
    ProductVariantViewSet,
    SupplierViewSet,
    ImportReceiptViewSet,
    StockTransactionViewSet,
    CustomerViewSet,
    SaleInvoiceViewSet,
    dashboard_summary,
    export_sales_excel,
    export_imports_excel,
    export_inventory_excel,
    export_monthly_word,
)

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("products", ProductViewSet, basename="product")
router.register("product-variants", ProductVariantViewSet, basename="product-variant")
router.register("suppliers", SupplierViewSet, basename="supplier")
router.register("import-receipts", ImportReceiptViewSet, basename="import-receipt")
router.register("stock-transactions", StockTransactionViewSet, basename="stock-transaction")
router.register("customers", CustomerViewSet, basename="customer")
router.register("sale-invoices", SaleInvoiceViewSet, basename="sale-invoice")

urlpatterns = [
    path("dashboard/summary/", dashboard_summary, name="dashboard-summary"),

    path("exports/sales/", export_sales_excel, name="export-sales-excel"),
    path("exports/imports/", export_imports_excel, name="export-imports-excel"),
    path("exports/inventory/", export_inventory_excel, name="export-inventory-excel"),

    path("exports/monthly-word/", export_monthly_word, name="export-monthly-word"),

    path("", include(router.urls)),
]