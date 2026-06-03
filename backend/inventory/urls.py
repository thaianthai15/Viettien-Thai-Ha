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
    path("", include(router.urls)),
]