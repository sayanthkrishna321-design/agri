from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    ROLE_CHOICES = [
        ("FARMER", "Farmer"),
        ("RETAILER", "Retailer"),
        ("ADMIN", "Admin"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"


class Farm(models.Model):
    farmer = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="farms",
    )
    location = models.CharField(max_length=255)
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
    )
    area = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Farm area in acres",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.farmer.user.username} - {self.location}"


class Crop(models.Model):
    STATUS_CHOICES = [
        ("GROWING", "Growing"),
        ("HARVESTED", "Harvested"),
        ("DAMAGED", "Damaged"),
    ]

    farm = models.ForeignKey(
        Farm,
        on_delete=models.CASCADE,
        related_name="crops",
    )
    crop_name = models.CharField(max_length=100)
    variety = models.CharField(max_length=100, blank=True)
    planting_date = models.DateField(null=True, blank=True)
    expected_harvest_date = models.DateField(null=True, blank=True)
    expected_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Expected quantity in kg",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="GROWING",
    )

    def __str__(self):
        return f"{self.crop_name} - {self.farm}"


class InsuranceCase(models.Model):
    STATUS_CHOICES = [
        ("OPEN", "Open"),
        ("UNDER_REVIEW", "Under Review"),
        ("RESOLVED", "Resolved"),
    ]

    ELIGIBILITY_CHOICES = [
        ("UNKNOWN", "Unknown"),
        ("ELIGIBLE", "Eligible"),
        ("NOT_ELIGIBLE", "Not Eligible"),
        ("INSUFFICIENT_INFO", "Insufficient Information"),
    ]

    farmer = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="insurance_cases",
    )
    crop = models.ForeignKey(
        Crop,
        on_delete=models.CASCADE,
        related_name="insurance_cases",
    )
    scheme = models.CharField(max_length=255)
    damage_description = models.TextField()
    eligibility_status = models.CharField(
        max_length=30,
        choices=ELIGIBILITY_CHOICES,
        default="UNKNOWN",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="OPEN",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Insurance Case #{self.id}"


class ChatSession(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="chat_sessions",
    )
    session_id = models.CharField(
        max_length=100,
        unique=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.session_id


class ChatMessage(models.Model):
    ROLE_CHOICES = [
        ("USER", "User"),
        ("ASSISTANT", "Assistant"),
        ("SYSTEM", "System"),
        ("TOOL", "Tool"),
    ]

    session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    message = models.TextField()

    tool_used = models.CharField(
        max_length=100,
        blank=True,
    )

    input_tokens = models.IntegerField(
        null=True,
        blank=True,
    )
    output_tokens = models.IntegerField(
        null=True,
        blank=True,
    )
    total_tokens = models.IntegerField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.session.session_id} - {self.role}"


class RetailerRequirement(models.Model):
    STATUS_CHOICES = [
        ("OPEN", "Open"),
        ("MATCHED", "Matched"),
        ("CLOSED", "Closed"),
    ]

    retailer = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="requirements",
    )
    crop = models.CharField(max_length=100)
    quantity_required = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Required quantity in kg",
    )
    target_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    required_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="OPEN",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.crop} - {self.quantity_required} kg"


class Offer(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("ACCEPTED", "Accepted"),
        ("REJECTED", "Rejected"),
    ]

    farmer = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="offers",
    )
    retailer_requirement = models.ForeignKey(
        RetailerRequirement,
        on_delete=models.CASCADE,
        related_name="offers",
    )
    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Offer #{self.id}"


class Order(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("CONFIRMED", "Confirmed"),
        ("IN_TRANSIT", "In Transit"),
        ("DELIVERED", "Delivered"),
        ("CANCELLED", "Cancelled"),
    ]

    farmer = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="orders_as_farmer",
    )
    retailer = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="orders_as_retailer",
    )
    crop = models.ForeignKey(
        Crop,
        on_delete=models.CASCADE,
        related_name="orders",
    )
    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )
    agreed_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    delivery_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id}"