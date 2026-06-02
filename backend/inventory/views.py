from rest_framework import filters, permissions, viewsets

from .models import Category, Product, ProductVariant
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    ProductVariantSerializer,
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
    )
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
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

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
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