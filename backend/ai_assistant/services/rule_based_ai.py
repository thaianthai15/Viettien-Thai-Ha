from datetime import timedelta

from django.db.models import Sum, F
from django.utils import timezone

from inventory.models import (
    ProductVariant,
    SaleInvoice,
    SaleInvoiceItem,
    ImportReceipt,
)


def format_currency(value):
    return f"{int(value):,}đ".replace(",", ".")


def answer_revenue_question(message):
    today = timezone.localdate()
    message_lower = message.lower()

    if "hôm nay" in message_lower:
        invoices = SaleInvoice.objects.filter(sale_date=today)
        label = "hôm nay"
    elif "tháng này" in message_lower:
        invoices = SaleInvoice.objects.filter(
            sale_date__year=today.year,
            sale_date__month=today.month,
        )
        label = f"tháng {today.month}/{today.year}"
    elif "7 ngày" in message_lower or "tuần" in message_lower:
        start_date = today - timedelta(days=6)
        invoices = SaleInvoice.objects.filter(
            sale_date__gte=start_date,
            sale_date__lte=today,
        )
        label = "7 ngày gần nhất"
    else:
        invoices = SaleInvoice.objects.all()
        label = "toàn bộ thời gian"

    total_revenue = invoices.aggregate(total=Sum("final_amount"))["total"] or 0
    invoice_count = invoices.count()

    sold_quantity = SaleInvoiceItem.objects.filter(
        invoice__in=invoices
    ).aggregate(total=Sum("quantity"))["total"] or 0

    return (
        f"Doanh thu {label} là {format_currency(total_revenue)}. "
        f"Hệ thống ghi nhận {invoice_count} hóa đơn và {sold_quantity} sản phẩm đã bán."
    )


def answer_low_stock_question():
    variants = (
        ProductVariant.objects
        .filter(
            current_stock__lte=F("low_stock_threshold"),
            is_active=True,
            product__is_active=True,
        )
        .select_related("product", "product__category")
        .order_by("current_stock")[:10]
    )

    if not variants:
        return "Hiện tại không có mặt hàng nào dưới ngưỡng cảnh báo tồn kho."

    lines = ["Các mặt hàng sắp hết là:"]

    for variant in variants:
        lines.append(
            f"- {variant.product.code} - {variant.product.name}, "
            f"size {variant.size}, màu {variant.color}: "
            f"còn {variant.current_stock}/{variant.low_stock_threshold}."
        )

    lines.append("Bạn nên cân nhắc nhập bổ sung các mặt hàng này.")

    return "\n".join(lines)


def answer_top_products_question(message):
    today = timezone.localdate()
    message_lower = message.lower()

    if "hôm nay" in message_lower:
        items = SaleInvoiceItem.objects.filter(invoice__sale_date=today)
        label = "hôm nay"
    elif "tháng này" in message_lower:
        items = SaleInvoiceItem.objects.filter(
            invoice__sale_date__year=today.year,
            invoice__sale_date__month=today.month,
        )
        label = f"tháng {today.month}/{today.year}"
    else:
        start_date = today - timedelta(days=6)
        items = SaleInvoiceItem.objects.filter(
            invoice__sale_date__gte=start_date,
            invoice__sale_date__lte=today,
        )
        label = "7 ngày gần nhất"

    top_products = (
        items
        .values(
            "product_variant__product__code",
            "product_variant__product__name",
        )
        .annotate(
            total_quantity=Sum("quantity"),
            total_revenue=Sum("subtotal"),
        )
        .order_by("-total_quantity")[:5]
    )

    if not top_products:
        return f"Chưa có dữ liệu sản phẩm bán chạy trong {label}."

    lines = [f"Top sản phẩm bán chạy trong {label}:"]

    for index, item in enumerate(top_products, start=1):
        lines.append(
            f"{index}. {item['product_variant__product__code']} - "
            f"{item['product_variant__product__name']}: "
            f"bán {item['total_quantity']} sản phẩm, "
            f"doanh thu {format_currency(item['total_revenue'] or 0)}."
        )

    return "\n".join(lines)


def answer_inventory_question():
    total_variants = ProductVariant.objects.count()

    total_stock = ProductVariant.objects.aggregate(
        total=Sum("current_stock")
    )["total"] or 0

    low_stock_count = ProductVariant.objects.filter(
        current_stock__lte=F("low_stock_threshold"),
        is_active=True,
        product__is_active=True,
    ).count()

    return (
        f"Hiện tại hệ thống có {total_variants} biến thể sản phẩm, "
        f"tổng tồn kho là {total_stock} sản phẩm. "
        f"Trong đó có {low_stock_count} mặt hàng đang dưới ngưỡng cảnh báo."
    )


def answer_import_question(message):
    today = timezone.localdate()
    message_lower = message.lower()

    if "hôm nay" in message_lower:
        receipts = ImportReceipt.objects.filter(import_date=today)
        label = "hôm nay"
    elif "tháng này" in message_lower:
        receipts = ImportReceipt.objects.filter(
            import_date__year=today.year,
            import_date__month=today.month,
        )
        label = f"tháng {today.month}/{today.year}"
    else:
        receipts = ImportReceipt.objects.all()
        label = "toàn bộ thời gian"

    total_import = receipts.aggregate(total=Sum("total_amount"))["total"] or 0
    receipt_count = receipts.count()

    return (
        f"Tổng giá trị nhập hàng {label} là {format_currency(total_import)} "
        f"với {receipt_count} phiếu nhập."
    )


def answer_suggestion_question():
    variants = (
        ProductVariant.objects
        .filter(
            current_stock__lte=F("low_stock_threshold"),
            is_active=True,
            product__is_active=True,
        )
        .select_related("product")
        .order_by("current_stock")[:10]
    )

    if not variants:
        return (
            "Hiện tại chưa có mặt hàng nào dưới ngưỡng cảnh báo. "
            "Bạn chưa cần nhập bổ sung gấp."
        )

    lines = ["Gợi ý nhập hàng:"]

    for variant in variants:
        suggested_quantity = max(
            variant.low_stock_threshold * 2 - variant.current_stock,
            variant.low_stock_threshold,
        )

        lines.append(
            f"- {variant.product.code} - {variant.product.name}, "
            f"size {variant.size}, màu {variant.color}: "
            f"nên nhập khoảng {suggested_quantity} sản phẩm."
        )

    return "\n".join(lines)


def generate_ai_answer(message):
    message_lower = message.lower()

    if any(keyword in message_lower for keyword in ["doanh thu", "bán được bao nhiêu", "thu được"]):
        return answer_revenue_question(message)

    if any(keyword in message_lower for keyword in ["sắp hết", "tồn thấp", "cảnh báo"]):
        return answer_low_stock_question()

    if any(keyword in message_lower for keyword in ["bán chạy", "top sản phẩm", "sản phẩm nào bán tốt"]):
        return answer_top_products_question(message)

    if any(keyword in message_lower for keyword in ["tồn kho", "còn bao nhiêu hàng", "kho hiện tại"]):
        return answer_inventory_question()

    if any(keyword in message_lower for keyword in ["nhập hàng", "đã nhập", "giá trị nhập"]):
        return answer_import_question(message)

    if any(keyword in message_lower for keyword in ["nên nhập", "gợi ý nhập", "nhập thêm"]):
        return answer_suggestion_question()

    return (
        "Mình hiện có thể hỗ trợ các câu hỏi về doanh thu, tồn kho, hàng sắp hết, "
        "sản phẩm bán chạy, nhập hàng và gợi ý nhập thêm. "
        "Bạn có thể hỏi ví dụ: 'Hôm nay doanh thu bao nhiêu?' hoặc "
        "'Sản phẩm nào sắp hết hàng?'."
    )