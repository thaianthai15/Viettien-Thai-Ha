from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, status, viewsets

from datetime import timedelta
from io import BytesIO
from calendar import monthrange
from .services.export_word import create_monthly_report_document

from django.http import HttpResponse
from django.db import transaction
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

from .services.export_excel import (
    create_sales_report_workbook,
    create_import_report_workbook,
    create_inventory_report_workbook,
)

from .filters import ProductFilter, ProductVariantFilter
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
        Product.objects.select_related("category", "created_by")
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
    queryset = ProductVariant.objects.select_related(
        "product", "product__category"
    ).all()
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
        ImportReceipt.objects.select_related("supplier", "created_by", "cancelled_by")
        .prefetch_related(
            "items",
            "items__product_variant",
            "items__product_variant__product",
        )
        .all()
    )
    permission_classes = [permissions.IsAuthenticated]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["receipt_code", "supplier__name", "note"]
    ordering_fields = [
        "id",
        "receipt_code",
        "import_date",
        "total_amount",
        "status",
        "created_at",
    ]

    def get_serializer_class(self):
        if self.action == "create":
            return ImportReceiptCreateSerializer

        return ImportReceiptSerializer

    def update(self, request, *args, **kwargs):
        return Response(
            {
                "detail": "Không được sửa trực tiếp phiếu nhập. Nếu nhập sai, hãy hủy phiếu và tạo phiếu mới."
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def partial_update(self, request, *args, **kwargs):
        return Response(
            {
                "detail": "Không được sửa trực tiếp phiếu nhập. Nếu nhập sai, hãy hủy phiếu và tạo phiếu mới."
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def destroy(self, request, *args, **kwargs):
        return Response(
            {
                "detail": "Không được xóa phiếu nhập. Hãy dùng chức năng hủy phiếu để giữ lịch sử kho."
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def cancel(self, request, pk=None):
        receipt = (
            ImportReceipt.objects.select_for_update()
            .prefetch_related("items", "items__product_variant")
            .get(pk=pk)
        )

        if receipt.status == ImportReceipt.Status.CANCELLED:
            return Response(
                {"detail": "Phiếu nhập này đã bị hủy trước đó."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for item in receipt.items.all():
            product_variant = ProductVariant.objects.select_for_update().get(
                id=item.product_variant_id
            )

            before_stock = product_variant.current_stock
            after_stock = before_stock - item.quantity

            if after_stock < 0:
                return Response(
                    {
                        "detail": (
                            f"Không thể hủy phiếu nhập {receipt.receipt_code} vì "
                            f"sản phẩm {product_variant} hiện chỉ còn {before_stock}, "
                            f"không đủ để trừ lại {item.quantity}."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            product_variant.current_stock = after_stock
            product_variant.save(update_fields=["current_stock", "updated_at"])

            StockTransaction.objects.create(
                product_variant=product_variant,
                transaction_type=StockTransaction.TransactionType.ADJUSTMENT,
                quantity=-item.quantity,
                before_stock=before_stock,
                after_stock=after_stock,
                reference_code=receipt.receipt_code,
                note=f"Hủy phiếu nhập {receipt.receipt_code}",
                created_by=request.user,
            )

        receipt.status = ImportReceipt.Status.CANCELLED
        receipt.cancelled_at = timezone.now()
        receipt.cancelled_by = request.user
        receipt.save(
            update_fields=[
                "status",
                "cancelled_at",
                "cancelled_by",
                "updated_at",
            ]
        )

        serializer = self.get_serializer(receipt)

        return Response(
            {
                "detail": "Hủy phiếu nhập thành công.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class StockTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockTransaction.objects.select_related(
        "product_variant", "product_variant__product", "created_by"
    ).all()
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
        SaleInvoice.objects.select_related("customer", "created_by", "cancelled_by")
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
        "status",
        "created_at",
    ]

    def get_serializer_class(self):
        if self.action == "create":
            return SaleInvoiceCreateSerializer

        return SaleInvoiceSerializer

    def update(self, request, *args, **kwargs):
        return Response(
            {
                "detail": "Không được sửa trực tiếp hóa đơn. Nếu bán sai, hãy hủy hóa đơn và tạo hóa đơn mới."
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def partial_update(self, request, *args, **kwargs):
        return Response(
            {
                "detail": "Không được sửa trực tiếp hóa đơn. Nếu bán sai, hãy hủy hóa đơn và tạo hóa đơn mới."
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def destroy(self, request, *args, **kwargs):
        return Response(
            {
                "detail": "Không được xóa hóa đơn. Hãy dùng chức năng hủy hóa đơn để giữ lịch sử kho."
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def cancel(self, request, pk=None):
        invoice = (
            SaleInvoice.objects.select_for_update()
            .prefetch_related("items", "items__product_variant")
            .get(pk=pk)
        )

        if invoice.status == SaleInvoice.Status.CANCELLED:
            return Response(
                {"detail": "Hóa đơn này đã bị hủy trước đó."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for item in invoice.items.all():
            product_variant = ProductVariant.objects.select_for_update().get(
                id=item.product_variant_id
            )

            before_stock = product_variant.current_stock
            after_stock = before_stock + item.quantity

            product_variant.current_stock = after_stock
            product_variant.save(update_fields=["current_stock", "updated_at"])

            StockTransaction.objects.create(
                product_variant=product_variant,
                transaction_type=StockTransaction.TransactionType.RETURN,
                quantity=item.quantity,
                before_stock=before_stock,
                after_stock=after_stock,
                reference_code=invoice.invoice_code,
                note=f"Hủy hóa đơn bán hàng {invoice.invoice_code}",
                created_by=request.user,
            )

        invoice.status = SaleInvoice.Status.CANCELLED
        invoice.cancelled_at = timezone.now()
        invoice.cancelled_by = request.user
        invoice.save(
            update_fields=[
                "status",
                "cancelled_at",
                "cancelled_by",
                "updated_at",
            ]
        )

        serializer = self.get_serializer(invoice)

        return Response(
            {
                "detail": "Hủy hóa đơn thành công.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def dashboard_summary(request):
    today = timezone.localdate()
    seven_days_ago = today - timedelta(days=6)

    today_invoices = SaleInvoice.objects.filter(
        sale_date=today,
        status=SaleInvoice.Status.ACTIVE,
    )

    today_revenue = today_invoices.aggregate(total=Sum("final_amount"))["total"] or 0

    today_invoice_count = today_invoices.count()

    today_sold_quantity = (
        SaleInvoiceItem.objects.filter(
            invoice__sale_date=today,
            invoice__status=SaleInvoice.Status.ACTIVE,
        ).aggregate(total=Sum("quantity"))["total"]
        or 0
    )

    low_stock_variants = (
        ProductVariant.objects.filter(
            current_stock__lte=F("low_stock_threshold"),
            is_active=True,
            product__is_active=True,
        )
        .select_related("product", "product__category")
        .order_by("current_stock")[:10]
    )

    low_stock_data = [
        {
            "id": variant.id,
            "product_code": variant.product.code,
            "product_name": variant.product.name,
            "category_name": variant.product.category.name,
            "size": variant.size,
            "color": variant.color,
            "current_stock": variant.current_stock,
            "low_stock_threshold": variant.low_stock_threshold,
        }
        for variant in low_stock_variants
    ]

    top_products = (
        SaleInvoiceItem.objects.filter(
            invoice__sale_date__gte=seven_days_ago,
            invoice__sale_date__lte=today,
            invoice__status=SaleInvoice.Status.ACTIVE,
        )
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

    top_products_data = [
        {
            "product_code": item["product_variant__product__code"],
            "product_name": item["product_variant__product__name"],
            "total_quantity": item["total_quantity"] or 0,
            "total_revenue": item["total_revenue"] or 0,
        }
        for item in top_products
    ]

    revenue_by_day = (
        SaleInvoice.objects.filter(
            sale_date__gte=seven_days_ago,
            sale_date__lte=today,
            status=SaleInvoice.Status.ACTIVE,
        )
        .values("sale_date")
        .annotate(
            revenue=Sum("final_amount"),
            invoice_count=Count("id"),
        )
        .order_by("sale_date")
    )

    revenue_map = {
        item["sale_date"]: {
            "revenue": item["revenue"] or 0,
            "invoice_count": item["invoice_count"] or 0,
        }
        for item in revenue_by_day
    }

    revenue_chart = []

    for i in range(7):
        day = seven_days_ago + timedelta(days=i)
        data = revenue_map.get(day, {"revenue": 0, "invoice_count": 0})

        revenue_chart.append(
            {
                "date": day.isoformat(),
                "revenue": data["revenue"],
                "invoice_count": data["invoice_count"],
            }
        )

    total_products = Product.objects.count()

    total_variants = ProductVariant.objects.count()

    total_stock = (
        ProductVariant.objects.aggregate(total=Sum("current_stock"))["total"] or 0
    )

    return Response(
        {
            "today": {
                "revenue": today_revenue,
                "invoice_count": today_invoice_count,
                "sold_quantity": today_sold_quantity,
            },
            "inventory": {
                "total_products": total_products,
                "total_variants": total_variants,
                "total_stock": total_stock,
                "low_stock_count": len(low_stock_data),
            },
            "low_stock_variants": low_stock_data,
            "top_products": top_products_data,
            "revenue_chart": revenue_chart,
        }
    )


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def export_sales_excel(request):
    invoices = (
        SaleInvoice.objects.select_related("customer")
        .filter(status=SaleInvoice.Status.ACTIVE)
        .prefetch_related(
            "items",
            "items__product_variant",
            "items__product_variant__product",
        )
        .all()
    )

    start_date = request.query_params.get("start_date")
    end_date = request.query_params.get("end_date")

    if start_date:
        invoices = invoices.filter(sale_date__gte=start_date)

    if end_date:
        invoices = invoices.filter(sale_date__lte=end_date)

    workbook = create_sales_report_workbook(invoices)

    output = BytesIO()
    workbook.save(output)
    output.seek(0)

    response = HttpResponse(
        output,
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    response["Content-Disposition"] = 'attachment; filename="bao_cao_ban_hang.xlsx"'

    return response


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def export_imports_excel(request):
    receipts = (
        ImportReceipt.objects.select_related("supplier")
        .filter(status=ImportReceipt.Status.ACTIVE)
        .prefetch_related(
            "items",
            "items__product_variant",
            "items__product_variant__product",
        )
        .all()
    )

    start_date = request.query_params.get("start_date")
    end_date = request.query_params.get("end_date")

    if start_date:
        receipts = receipts.filter(import_date__gte=start_date)

    if end_date:
        receipts = receipts.filter(import_date__lte=end_date)

    workbook = create_import_report_workbook(receipts)

    output = BytesIO()
    workbook.save(output)
    output.seek(0)

    response = HttpResponse(
        output,
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    response["Content-Disposition"] = 'attachment; filename="bao_cao_nhap_hang.xlsx"'

    return response


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def export_inventory_excel(request):
    variants = ProductVariant.objects.select_related(
        "product", "product__category"
    ).all()

    workbook = create_inventory_report_workbook(variants)

    output = BytesIO()
    workbook.save(output)
    output.seek(0)

    response = HttpResponse(
        output,
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    response["Content-Disposition"] = 'attachment; filename="bao_cao_ton_kho.xlsx"'

    return response


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def export_monthly_word(request):
    today = timezone.localdate()

    month = int(request.query_params.get("month", today.month))
    year = int(request.query_params.get("year", today.year))

    first_day = timezone.datetime(year, month, 1).date()
    last_day = timezone.datetime(
        year,
        month,
        monthrange(year, month)[1],
    ).date()

    invoices = SaleInvoice.objects.filter(
        sale_date__gte=first_day,
        sale_date__lte=last_day,
    )

    total_revenue = invoices.aggregate(total=Sum("final_amount"))["total"] or 0

    invoice_count = invoices.count()

    sold_quantity = (
        SaleInvoiceItem.objects.filter(
            invoice__sale_date__gte=first_day,
            invoice__sale_date__lte=last_day,
        ).aggregate(total=Sum("quantity"))["total"]
        or 0
    )

    top_products = (
        SaleInvoiceItem.objects.filter(
            invoice__sale_date__gte=first_day,
            invoice__sale_date__lte=last_day,
        )
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

    low_stock_variants = (
        ProductVariant.objects.filter(
            current_stock__lte=F("low_stock_threshold"),
            is_active=True,
            product__is_active=True,
        )
        .select_related("product", "product__category")
        .order_by("current_stock")[:10]
    )

    document = create_monthly_report_document(
        month=month,
        year=year,
        total_revenue=total_revenue,
        invoice_count=invoice_count,
        sold_quantity=sold_quantity,
        top_products=top_products,
        low_stock_variants=low_stock_variants,
    )

    output = BytesIO()
    document.save(output)
    output.seek(0)

    response = HttpResponse(
        output,
        content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )
    response["Content-Disposition"] = (
        f'attachment; filename="bao_cao_thang_{month}_{year}.docx"'
    )

    return response
