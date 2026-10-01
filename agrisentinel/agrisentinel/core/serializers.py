from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Profile,
    Farm,
    Crop,
    InsuranceCase,
    ChatSession,
    ChatMessage,
    RetailerRequirement,
    Offer,
    Order,
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = Profile
        fields = ["id", "user", "username", "role", "phone", "location"]


class FarmSerializer(serializers.ModelSerializer):
    farmer_name = serializers.ReadOnlyField(source="farmer.user.username")

    class Meta:
        model = Farm
        fields = ["id", "farmer", "farmer_name", "location", "latitude", "longitude", "area", "created_at"]


class CropSerializer(serializers.ModelSerializer):
    farm_location = serializers.ReadOnlyField(source="farm.location")
    farmer_name = serializers.ReadOnlyField(source="farm.farmer.user.username")

    class Meta:
        model = Crop
        fields = [
            "id",
            "farm",
            "farm_location",
            "farmer_name",
            "crop_name",
            "variety",
            "planting_date",
            "expected_harvest_date",
            "expected_quantity",
            "status",
        ]


class InsuranceCaseSerializer(serializers.ModelSerializer):
    farmer_name = serializers.ReadOnlyField(source="farmer.user.username")
    crop_name = serializers.ReadOnlyField(source="crop.crop_name")

    class Meta:
        model = InsuranceCase
        fields = [
            "id",
            "farmer",
            "farmer_name",
            "crop",
            "crop_name",
            "scheme",
            "damage_description",
            "eligibility_status",
            "status",
            "created_at",
        ]


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = "__all__"


class ChatSessionSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatSession
        fields = ["id", "user", "session_id", "created_at", "updated_at", "messages"]


class RetailerRequirementSerializer(serializers.ModelSerializer):
    retailer_name = serializers.ReadOnlyField(source="retailer.user.username")

    class Meta:
        model = RetailerRequirement
        fields = [
            "id",
            "retailer",
            "retailer_name",
            "crop",
            "quantity_required",
            "target_price",
            "required_date",
            "status",
            "created_at",
        ]


class OfferSerializer(serializers.ModelSerializer):
    farmer_name = serializers.ReadOnlyField(source="farmer.user.username")
    crop_name = serializers.ReadOnlyField(source="retailer_requirement.crop")

    class Meta:
        model = Offer
        fields = [
            "id",
            "farmer",
            "farmer_name",
            "retailer_requirement",
            "crop_name",
            "quantity",
            "price",
            "status",
            "created_at",
        ]


class OrderSerializer(serializers.ModelSerializer):
    farmer_name = serializers.ReadOnlyField(source="farmer.user.username")
    retailer_name = serializers.ReadOnlyField(source="retailer.user.username")
    crop_name = serializers.ReadOnlyField(source="crop.crop_name")

    class Meta:
        model = Order
        fields = [
            "id",
            "farmer",
            "farmer_name",
            "retailer",
            "retailer_name",
            "crop",
            "crop_name",
            "quantity",
            "agreed_price",
            "delivery_date",
            "status",
            "created_at",
        ]