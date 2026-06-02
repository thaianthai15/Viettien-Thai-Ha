from django.core.management.base import BaseCommand

from inventory.models import Category, Product, ProductVariant


class Command(BaseCommand):
    help = "Seed dữ liệu mẫu Việt Tiến"

    def handle(self, *args, **options):
        categories = [
            "Áo sơ mi",
            "Quần âu",
            "Áo polo",
            "Áo vest",
            "Phụ kiện",
        ]

        category_objects = {}

        for category_name in categories:
            category, _ = Category.objects.get_or_create(
                name=category_name,
                defaults={
                    "description": f"Danh mục {category_name} Việt Tiến",
                    "is_active": True,
                },
            )
            category_objects[category_name] = category

        sample_products = [
            {
                "category": "Áo sơ mi",
                "code": "VT-SM-001",
                "name": "Sơ mi trắng dài tay",
                "description": "Sơ mi công sở nam Việt Tiến màu trắng",
                "variants": [
                    {
                        "size": "M",
                        "color": "Trắng",
                        "barcode": "VT-SM-001-M-WHITE",
                        "import_price": 220000,
                        "sale_price": 350000,
                        "current_stock": 10,
                    },
                    {
                        "size": "L",
                        "color": "Trắng",
                        "barcode": "VT-SM-001-L-WHITE",
                        "import_price": 220000,
                        "sale_price": 350000,
                        "current_stock": 8,
                    },
                ],
            },
            {
                "category": "Áo sơ mi",
                "code": "VT-SM-002",
                "name": "Sơ mi xanh ngắn tay",
                "description": "Sơ mi công sở nam Việt Tiến màu xanh",
                "variants": [
                    {
                        "size": "M",
                        "color": "Xanh",
                        "barcode": "VT-SM-002-M-BLUE",
                        "import_price": 210000,
                        "sale_price": 330000,
                        "current_stock": 12,
                    },
                    {
                        "size": "XL",
                        "color": "Xanh",
                        "barcode": "VT-SM-002-XL-BLUE",
                        "import_price": 210000,
                        "sale_price": 330000,
                        "current_stock": 6,
                    },
                ],
            },
            {
                "category": "Quần âu",
                "code": "VT-QA-001",
                "name": "Quần âu đen công sở",
                "description": "Quần âu nam Việt Tiến màu đen",
                "variants": [
                    {
                        "size": "30",
                        "color": "Đen",
                        "barcode": "VT-QA-001-30-BLACK",
                        "import_price": 260000,
                        "sale_price": 420000,
                        "current_stock": 7,
                    },
                    {
                        "size": "32",
                        "color": "Đen",
                        "barcode": "VT-QA-001-32-BLACK",
                        "import_price": 260000,
                        "sale_price": 420000,
                        "current_stock": 5,
                    },
                ],
            },
            {
                "category": "Áo polo",
                "code": "VT-PL-001",
                "name": "Áo polo xanh navy",
                "description": "Áo polo nam Việt Tiến xanh navy",
                "variants": [
                    {
                        "size": "L",
                        "color": "Navy",
                        "barcode": "VT-PL-001-L-NAVY",
                        "import_price": 180000,
                        "sale_price": 290000,
                        "current_stock": 15,
                    },
                    {
                        "size": "XL",
                        "color": "Navy",
                        "barcode": "VT-PL-001-XL-NAVY",
                        "import_price": 180000,
                        "sale_price": 290000,
                        "current_stock": 9,
                    },
                ],
            },
        ]

        for item in sample_products:
            product, created = Product.objects.get_or_create(
                code=item["code"],
                defaults={
                    "category": category_objects[item["category"]],
                    "name": item["name"],
                    "description": item["description"],
                    "is_active": True,
                },
            )

            for variant_data in item["variants"]:
                ProductVariant.objects.get_or_create(
                    product=product,
                    size=variant_data["size"],
                    color=variant_data["color"],
                    defaults={
                        "barcode": variant_data["barcode"],
                        "import_price": variant_data["import_price"],
                        "sale_price": variant_data["sale_price"],
                        "current_stock": variant_data["current_stock"],
                        "low_stock_threshold": 5,
                        "is_active": True,
                    },
                )

        self.stdout.write(self.style.SUCCESS("Seed dữ liệu Việt Tiến thành công."))