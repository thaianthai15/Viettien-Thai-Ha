from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets

from .filters import ProductFilter, ProductVariantFilter
from .models import Category, Product, ProductVariant, Supplier, ImportReceipt, StockTransaction, Customer, SaleInvoice
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    ProductVariantSerializer,
    SupplierSerializer,
    ImportReceiptSerializer,
    ImportReceiptCreateSerializer,
    StockTransactionSerializer,
    CustomerSerializer,
    SaleInvoiceSerializer,
    SaleInvoiceCreateSerializer,
)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("-created_at")
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["id", "name", "created_at"]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = (
        Product.objects
        .select_related("category", "created_by")
        .prefetch_related("variants")
        .all()
        .distinct()
    )
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = ProductFilter
    search_fields = ["code", "name", "description", "category__name"]
    ordering_fields = ["id", "code", "name", "created_at"]


class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = (
        ProductVariant.objects
        .select_related("product", "product__category")
        .all()
    )
    serializer_class = ProductVariantSerializer
    permission_classes = [permissions.IsAuthenticated]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = ProductVariantFilter
    search_fields = [
        "product__code",
        "product__name",
        "size",
        "color",
        "barcode",
    ]
    ordering_fields = [
        "id",
        "size",
        "color",
        "import_price",
        "sale_price",
        "current_stock",
        "created_at",
    ]

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all().order_by("name")
    serializer_class = SupplierSerializer
    permission_classes = [permissions.IsAuthenticated]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "phone", "email", "address"]
    ordering_fields = ["id", "name", "created_at"]


class ImportReceiptViewSet(viewsets.ModelViewSet):
    queryset = (
        ImportReceipt.objects
        .select_related("supplier", "created_by")
        .prefetch_related("items", "items__product_variant", "items__product_variant__product")
        .all()
    )
    permission_classes = [permissions.IsAuthenticated]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["receipt_code", "supplier__name", "note"]
    ordering_fields = ["id", "receipt_code", "import_date", "total_amount", "created_at"]

    def get_serializer_class(self):
        if self.action == "create":
            return ImportReceiptCreateSerializer

        return ImportReceiptSerializer


class StockTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (
        StockTransaction.objects
        .select_related("product_variant", "product_variant__product", "created_by")
        .all()
    )
    serializer_class = StockTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "product_variant__product__code",
        "product_variant__product__name",
        "reference_code",
        "note",
    ]
    ordering_fields = ["id", "created_at", "transaction_type"]

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by("-created_at")
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "phone", "email", "address"]
    ordering_fields = ["id", "name", "created_at"]


class SaleInvoiceViewSet(viewsets.ModelViewSet):
    queryset = (
        SaleInvoice.objects
        .select_related("customer", "created_by")
        .prefetch_related(
            "items",
            "items__product_variant",
            "items__product_variant__product",
        )
        .all()
    )
    permission_classes = [permissions.IsAuthenticated]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["invoice_code", "customer__name", "customer__phone", "note"]
    ordering_fields = [
        "id",
        "invoice_code",
        "sale_date",
        "total_amount",
        "final_amount",
        "created_at",
    ]

    def get_serializer_class(self):
        if self.action == "create":
            return SaleInvoiceCreateSerializer

        return SaleInvoiceSerializer