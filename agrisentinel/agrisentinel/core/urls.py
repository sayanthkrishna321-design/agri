from django.urls import path
from .views import (
    health_check,
    profile_list,
    crop_list,
    requirement_list,
    offer_list,
    offer_update_status,
    order_list,
    order_update_status,
    insurance_case_list,
    eligibility_check,
    agent_query,
    rag_ask,
    weather_fetch,
    login_user,
)

urlpatterns = [
    # System
    path("health/", health_check, name="health"),
    # Core Data
    path("profiles/", profile_list, name="profile-list"),
    path("crops/", crop_list, name="crop-list"),
    path("requirements/", requirement_list, name="requirement-list"),
    path("offers/", offer_list, name="offer-list"),
    path("offers/<int:pk>/", offer_update_status, name="offer-update-status"),
    path("orders/", order_list, name="order-list"),
    path("orders/<int:pk>/", order_update_status, name="order-update-status"),
    path("insurance-cases/", insurance_case_list, name="insurance-case-list"),
    # AI & Tools
    path("eligibility-check/", eligibility_check, name="eligibility-check"),
    path("agent/query/", agent_query, name="agent-query"),
    path("rag/ask/", rag_ask, name="rag-ask"),
    path("weather/", weather_fetch, name="weather-fetch"),
    path("login/", login_user, name="login-user"),
]