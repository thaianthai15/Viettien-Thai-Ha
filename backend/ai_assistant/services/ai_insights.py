from datetime import timedelta

from django.db.models import Avg, F, Sum
from django.utils import timezone
from decimal import Decimal

from inventory.models import ProductVariant, SaleInvoice, SaleInvoiceItem


def format_currency(value):
    return f"{int(value):,}đ".replace(",", ".")


def get_import_suggestions():
    variants = (
        ProductVariant.objects
        .filter(
            current_stock__lte=F("low_stock_threshold"),
            is_active=True,
            product__is_active=True,
        )
        .select_related("product", "product__category")
        .order_by("current_stock")
    )

    suggestions = []

    for variant in variants:
        suggested_quantity = max(
            variant.low_stock_threshold * 2 - variant.current_stock,
            variant.low_stock_threshold,
        )

        suggestions.append({
            "product_variant_id": variant.id,
            "product_code": variant.product.code,
            "product_name": variant.product.name,
            "category_name": variant.product.category.name,
            "size": variant.size,
            "color": variant.color,
            "current_stock": variant.current_stock,
            "low_stock_threshold": variant.low_stock_threshold,
            "suggested_quantity": suggested_quantity,
            "reason": (
                f"Tồn kho hiện tại chỉ còn {variant.current_stock}, "
                f"thấp hơn hoặc bằng ngưỡng cảnh báo {variant.low_stock_threshold}."
            ),
        })

    return suggestions


def get_anomalies():
    today = timezone.localdate()
    seven_days_ago = today - timedelta(days=7)

    anomalies = []

    zero_stock_variants = (
        ProductVariant.objects
        .filter(
            current_stock=0,
            is_active=True,
            product__is_active=True,
        )
        .select_related("product")[:10]
    )

    for variant in zero_stock_variants:
        anomalies.append({
            "type": "OUT_OF_STOCK",
            "level": "HIGH",
            "title": "Sản phẩm hết hàng",
            "message": (
                f"{variant.product.code} - {variant.product.name}, "
                f"size {variant.size}, màu {variant.color} đã hết hàng."
            ),
        })

    low_stock_variants = (
        ProductVariant.objects
        .filter(
            current_stock__lte=F("low_stock_threshold"),
            current_stock__gt=0,
            is_active=True,
            product__is_active=True,
        )
        .select_related("product")[:10]
    )

    for variant in low_stock_variants:
        anomalies.append({
            "type": "LOW_STOCK",
            "level": "MEDIUM",
            "title": "Sản phẩm sắp hết",
            "message": (
                f"{variant.product.code} - {variant.product.name}, "
                f"size {variant.size}, màu {variant.color} chỉ còn "
                f"{variant.current_stock}/{variant.low_stock_threshold}."
            ),
        })

    selling_below_cost_items = (
        SaleInvoiceItem.objects
        .filter(
            sale_price__lt=F("product_variant__import_price")
        )
        .select_related(
            "invoice",
            "product_variant",
            "product_variant__product",
        )
        .order_by("-created_at")[:10]
    )

    for item in selling_below_cost_items:
        anomalies.append({
            "type": "SELLING_BELOW_COST",
            "level": "HIGH",
            "title": "Bán dưới giá nhập",
            "message": (
                f"Hóa đơn {item.invoice.invoice_code}: "
                f"{item.product_variant.product.code} - "
                f"{item.product_variant.product.name} bán giá "
                f"{format_currency(item.sale_price)}, thấp hơn giá nhập "
                f"{format_currency(item.product_variant.import_price)}."
            ),
        })

    today_revenue = (
        SaleInvoice.objects
        .filter(sale_date=today)
        .aggregate(total=Sum("final_amount"))["total"] or 0
    )

    previous_days = (
        SaleInvoice.objects
        .filter(
            sale_date__gte=seven_days_ago,
            sale_date__lt=today,
        )
        .values("sale_date")
        .annotate(revenue=Sum("final_amount"))
    )

    revenues = [item["revenue"] for item in previous_days if item["revenue"]]

    if revenues:
        avg_revenue = sum(revenues) / Decimal(len(revenues))

        if avg_revenue > 0 and today_revenue < avg_revenue * Decimal("0.5"):
            anomalies.append({
                "type": "LOW_REVENUE",
                "level": "MEDIUM",
                "title": "Doanh thu hôm nay thấp",
                "message": (
                    f"Doanh thu hôm nay là {format_currency(today_revenue)}, "
                    f"thấp hơn nhiều so với trung bình 7 ngày gần nhất "
                    f"({format_currency(avg_revenue)})."
                ),
            })

    large_invoices = (
        SaleInvoice.objects
        .filter(sale_date=today)
        .order_by("-final_amount")[:3]
    )

    for invoice in large_invoices:
        if invoice.final_amount >= 2000000:
            anomalies.append({
                "type": "LARGE_INVOICE",
                "level": "INFO",
                "title": "Hóa đơn giá trị cao",
                "message": (
                    f"Hóa đơn {invoice.invoice_code} có giá trị "
                    f"{format_currency(invoice.final_amount)}."
                ),
            })

    return anomalies