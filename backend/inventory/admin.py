from django.contrib import admin

from .models import Category, Product, ProductVariant


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