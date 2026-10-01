from django.test import TestCase, Client
from django.urls import reverse
from rest_framework import status
from django.contrib.auth.models import User
from core.models import Profile, Farm, Crop, RetailerRequirement, Offer, Order


class AgriSentinelAPITests(TestCase):
    def setUp(self):
        self.client = Client()
        # Create test users
        self.farmer_user = User.objects.create_user(username="test_farmer", password=None)
        self.retailer_user = User.objects.create_user(username="test_retailer", password=None)

        # Create profiles
        self.farmer_profile = Profile.objects.create(user=self.farmer_user, role="FARMER", phone="", location="Test Area")
        self.retailer_profile = Profile.objects.create(user=self.retailer_user, role="RETAILER", phone="", location="Test Area")

        # Create Farm & Crop
        self.farm = Farm.objects.create(farmer=self.farmer_profile, location="Test Area", area=5.0)
        self.crop = Crop.objects.create(farm=self.farm, crop_name="Wheat", variety="Sharbati", expected_quantity=100.0, status="GROWING")

        # Create Retailer Requirement
        self.requirement = RetailerRequirement.objects.create(
            retailer=self.retailer_profile,
            crop="Wheat",
            quantity_required=50.0,
            target_price=2500.0,
            required_date="2026-05-01",
            status="OPEN"
        )

    def test_health_check(self):
        response = self.client.get(reverse("health"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["status"], "success")

    def test_profile_list_create(self):
        response = self.client.get(reverse("profile-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.json()), 2)

    def test_crop_list_create(self):
        response = self.client.get(reverse("crop-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 1)

        new_crop_data = {
            "farm": self.farm.id,
            "crop_name": "Rice",
            "variety": "Basmati",
            "expected_quantity": 200.0,
            "status": "GROWING"
        }
        post_resp = self.client.post(reverse("crop-list"), data=new_crop_data, content_type="application/json")
        self.assertEqual(post_resp.status_code, status.HTTP_201_CREATED)

    def test_requirement_list_create(self):
        response = self.client.get(reverse("requirement-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 1)

    def test_offer_lifecycle(self):
        # Create Offer
        offer_data = {
            "farmer": self.farmer_profile.id,
            "retailer_requirement": self.requirement.id,
            "quantity": 50.0,
            "price": 2450.0,
            "status": "PENDING"
        }
        post_resp = self.client.post(reverse("offer-list"), data=offer_data, content_type="application/json")
        self.assertEqual(post_resp.status_code, status.HTTP_201_CREATED)
        offer_id = post_resp.json()["id"]

        # Accept Offer
        patch_resp = self.client.patch(
            reverse("offer-update-status", kwargs={"pk": offer_id}),
            data={"status": "ACCEPTED"},
            content_type="application/json"
        )
        self.assertEqual(patch_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_resp.json()["status"], "ACCEPTED")

    def test_order_lifecycle(self):
        order_data = {
            "farmer": self.farmer_profile.id,
            "retailer": self.retailer_profile.id,
            "crop": self.crop.id,
            "quantity": 50.0,
            "agreed_price": 2450.0,
            "delivery_date": "2026-05-10",
            "status": "PENDING"
        }
        post_resp = self.client.post(reverse("order-list"), data=order_data, content_type="application/json")
        self.assertEqual(post_resp.status_code, status.HTTP_201_CREATED)
        order_id = post_resp.json()["id"]

        patch_resp = self.client.patch(
            reverse("order-update-status", kwargs={"pk": order_id}),
            data={"status": "CONFIRMED"},
            content_type="application/json"
        )
        self.assertEqual(patch_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_resp.json()["status"], "CONFIRMED")

    def test_agent_query_endpoint(self):
        payload = {
            "query": "Is my rice crop damaged by heavy rainfall eligible for PMFBY?",
            "latitude": 19.0760,
            "longitude": 72.8777,
            "crop_name": "Rice",
            "claimed_cause": "Heavy Rainfall",
            "start_date": "2026-09-01",
            "end_date": "2026-09-07"
        }
        response = self.client.post(reverse("agent-query"), data=payload, content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        res_data = response.json()
        self.assertIn("answer", res_data)
        self.assertIn("proof_of_origin", res_data)

    def test_rag_ask_endpoint(self):
        payload = {
            "question": "What is PMFBY crop insurance guideline for cotton?",
            "crop": "Cotton"
        }
        response = self.client.post(reverse("rag-ask"), data=payload, content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        res_data = response.json()
        self.assertIn("answer", res_data)
        self.assertIn("sources", res_data)

