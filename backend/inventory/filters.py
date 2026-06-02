import django_filters
from django.db import models

from .models import Product, ProductVariant


class ProductFilter(django_filters.FilterSet):
    category = django_filters.NumberFilter(field_name="category_id")
    size = django_filters.CharFilter(
        field_name="variants__size",
        lookup_expr="iexact",
    )
    color = django_filters.CharFilter(
        field_name="variants__color",
        lookup_expr="icontains",
    )
    min_stock = django_filters.NumberFilter(
        field_name="variants__current_stock",
        lookup_expr="gte",
    )
    max_stock = django_filters.NumberFilter(
        field_name="variants__current_stock",
        lookup_expr="lte",
    )
    is_active = django_filters.BooleanFilter(field_name="is_active")

    class Meta:
        model = Product
        fields = [
            "category",
            "size",
            "color",
            "min_stock",
            "max_stock",
            "is_active",
        ]


class ProductVariantFilter(django_filters.FilterSet):
    product = django_filters.NumberFilter(field_name="product_id")
    category = django_filters.NumberFilter(field_name="product__category_id")
    size = django_filters.CharFilter(field_name="size", lookup_expr="iexact")
    color = django_filters.CharFilter(field_name="color", lookup_expr="icontains")
    low_stock = django_filters.BooleanFilter(method="filter_low_stock")

    class Meta:
        model = ProductVariant
        fields = [
            "product",
            "category",
            "size",
            "color",
            "low_stock",
        ]

    def filter_low_stock(self, queryset, name, value):
        if value:
            return queryset.filter(current_stock__lte=models.F("low_stock_threshold"))

        return queryset