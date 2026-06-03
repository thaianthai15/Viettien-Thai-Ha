from rest_framework import serializers
from django.db import transaction
from .models import Category, Product, ProductVariant, Supplier, ImportReceipt, ImportReceiptItem, StockTransaction, Customer, SaleInvoice, SaleInvoiceItem

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]


class ProductVariantSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_code = serializers.CharField(source="product.code", read_only=True)

    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "product",
            "product_name",
            "product_code",
            "size",
            "color",
            "barcode",
            "import_price",
            "sale_price",
            "current_stock",
            "low_stock_threshold",
            "is_active",
            "created_at",
            "updated_at",
        ]


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "category",
            "category_name",
            "code",
            "name",
            "description",
            "image",
            "is_active",
            "created_by",
            "variants",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_by"]

    def create(self, validated_data):
        request = self.context.get("request")

        if request and request.user.is_authenticated:
            validated_data["created_by"] = request.user

        return super().create(validated_data)
    
class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = [
            "id",
            "name",
            "phone",
            "email",
            "address",
            "note",
            "is_active",
            "created_at",
            "updated_at",
        ]


class ImportReceiptItemReadSerializer(serializers.ModelSerializer):
    product_variant_name = serializers.CharField(
        source="product_variant.__str__",
        read_only=True,
    )
    product_code = serializers.CharField(
        source="product_variant.product.code",
        read_only=True,
    )
    product_name = serializers.CharField(
        source="product_variant.product.name",
        read_only=True,
    )
    size = serializers.CharField(
        source="product_variant.size",
        read_only=True,
    )
    color = serializers.CharField(
        source="product_variant.color",
        read_only=True,
    )

    class Meta:
        model = ImportReceiptItem
        fields = [
            "id",
            "product_variant",
            "product_variant_name",
            "product_code",
            "product_name",
            "size",
            "color",
            "quantity",
            "import_price",
            "subtotal",
            "created_at",
        ]


class ImportReceiptItemWriteSerializer(serializers.Serializer):
    product_variant = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.all()
    )
    quantity = serializers.IntegerField(min_value=1)
    import_price = serializers.DecimalField(max_digits=12, decimal_places=2)


class ImportReceiptSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)
    items = ImportReceiptItemReadSerializer(many=True, read_only=True)

    class Meta:
        model = ImportReceipt
        fields = [
            "id",
            "receipt_code",
            "supplier",
            "supplier_name",
            "import_date",
            "note",
            "total_amount",
            "created_by",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["total_amount", "created_by"]


class ImportReceiptCreateSerializer(serializers.ModelSerializer):
    items = ImportReceiptItemWriteSerializer(many=True)

    class Meta:
        model = ImportReceipt
        fields = [
            "id",
            "receipt_code",
            "supplier",
            "import_date",
            "note",
            "items",
        ]

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Phiếu nhập phải có ít nhất một sản phẩm.")

        return value

    @transaction.atomic
    def create(self, validated_data):
        request = self.context.get("request")
        items_data = validated_data.pop("items")

        if request and request.user.is_authenticated:
            validated_data["created_by"] = request.user

        receipt = ImportReceipt.objects.create(**validated_data)

        total_amount = 0

        for item_data in items_data:
            product_variant = item_data["product_variant"]
            quantity = item_data["quantity"]
            import_price = item_data["import_price"]
            subtotal = quantity * import_price

            before_stock = product_variant.current_stock
            after_stock = before_stock + quantity

            ImportReceiptItem.objects.create(
                receipt=receipt,
                product_variant=product_variant,
                quantity=quantity,
                import_price=import_price,
                subtotal=subtotal,
            )

            product_variant.current_stock = after_stock
            product_variant.import_price = import_price
            product_variant.save(update_fields=["current_stock", "import_price", "updated_at"])

            StockTransaction.objects.create(
                product_variant=product_variant,
                transaction_type=StockTransaction.TransactionType.IMPORT,
                quantity=quantity,
                before_stock=before_stock,
                after_stock=after_stock,
                reference_code=receipt.receipt_code,
                note=f"Nhập hàng từ phiếu {receipt.receipt_code}",
                created_by=validated_data.get("created_by"),
            )

            total_amount += subtotal

        receipt.total_amount = total_amount
        receipt.save(update_fields=["total_amount", "updated_at"])

        return receipt


class StockTransactionSerializer(serializers.ModelSerializer):
    product_code = serializers.CharField(
        source="product_variant.product.code",
        read_only=True,
    )
    product_name = serializers.CharField(
        source="product_variant.product.name",
        read_only=True,
    )
    size = serializers.CharField(
        source="product_variant.size",
        read_only=True,
    )
    color = serializers.CharField(
        source="product_variant.color",
        read_only=True,
    )

    class Meta:
        model = StockTransaction
        fields = [
            "id",
            "product_variant",
            "product_code",
            "product_name",
            "size",
            "color",
            "transaction_type",
            "quantity",
            "before_stock",
            "after_stock",
            "reference_code",
            "note",
            "created_by",
            "created_at",
        ]

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            "id",
            "name",
            "phone",
            "email",
            "address",
            "note",
            "created_at",
            "updated_at",
        ]


class SaleInvoiceItemReadSerializer(serializers.ModelSerializer):
    product_code = serializers.CharField(
        source="product_variant.product.code",
        read_only=True,
    )
    product_name = serializers.CharField(
        source="product_variant.product.name",
        read_only=True,
    )
    size = serializers.CharField(
        source="product_variant.size",
        read_only=True,
    )
    color = serializers.CharField(
        source="product_variant.color",
        read_only=True,
    )

    class Meta:
        model = SaleInvoiceItem
        fields = [
            "id",
            "product_variant",
            "product_code",
            "product_name",
            "size",
            "color",
            "quantity",
            "sale_price",
            "subtotal",
            "created_at",
        ]


class SaleInvoiceItemWriteSerializer(serializers.Serializer):
    product_variant = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.all()
    )
    quantity = serializers.IntegerField(min_value=1)
    sale_price = serializers.DecimalField(max_digits=12, decimal_places=2)


class SaleInvoiceSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    customer_phone = serializers.CharField(source="customer.phone", read_only=True)
    items = SaleInvoiceItemReadSerializer(many=True, read_only=True)

    class Meta:
        model = SaleInvoice
        fields = [
            "id",
            "invoice_code",
            "customer",
            "customer_name",
            "customer_phone",
            "sale_date",
            "note",
            "total_amount",
            "discount_amount",
            "final_amount",
            "payment_method",
            "created_by",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "total_amount",
            "final_amount",
            "created_by",
        ]


class SaleInvoiceCreateSerializer(serializers.ModelSerializer):
    items = SaleInvoiceItemWriteSerializer(many=True)

    class Meta:
        model = SaleInvoice
        fields = [
            "id",
            "invoice_code",
            "customer",
            "sale_date",
            "note",
            "discount_amount",
            "payment_method",
            "items",
        ]

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Hóa đơn phải có ít nhất một sản phẩm.")

        for item in value:
            product_variant = item["product_variant"]
            quantity = item["quantity"]

            if quantity > product_variant.current_stock:
                raise serializers.ValidationError(
                    f"Sản phẩm {product_variant} chỉ còn {product_variant.current_stock}, không đủ để bán {quantity}."
                )

        return value

    @transaction.atomic
    def create(self, validated_data):
        request = self.context.get("request")
        items_data = validated_data.pop("items")
        discount_amount = validated_data.get("discount_amount", 0)

        if request and request.user.is_authenticated:
            validated_data["created_by"] = request.user

        invoice = SaleInvoice.objects.create(**validated_data)

        total_amount = 0

        for item_data in items_data:
            product_variant = item_data["product_variant"]
            quantity = item_data["quantity"]
            sale_price = item_data["sale_price"]
            subtotal = quantity * sale_price

            before_stock = product_variant.current_stock
            after_stock = before_stock - quantity

            if after_stock < 0:
                raise serializers.ValidationError(
                    f"Sản phẩm {product_variant} không đủ tồn kho."
                )

            SaleInvoiceItem.objects.create(
                invoice=invoice,
                product_variant=product_variant,
                quantity=quantity,
                sale_price=sale_price,
                subtotal=subtotal,
            )

            product_variant.current_stock = after_stock
            product_variant.sale_price = sale_price
            product_variant.save(update_fields=["current_stock", "sale_price", "updated_at"])

            StockTransaction.objects.create(
                product_variant=product_variant,
                transaction_type=StockTransaction.TransactionType.SALE,
                quantity=-quantity,
                before_stock=before_stock,
                after_stock=after_stock,
                reference_code=invoice.invoice_code,
                note=f"Bán hàng từ hóa đơn {invoice.invoice_code}",
                created_by=validated_data.get("created_by"),
            )

            total_amount += subtotal

        invoice.total_amount = total_amount
        invoice.final_amount = total_amount - discount_amount
        invoice.save(update_fields=["total_amount", "final_amount", "updated_at"])

        return invoice