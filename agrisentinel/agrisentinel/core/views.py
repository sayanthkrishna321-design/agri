import logging
import sys
import uuid
import time
from pathlib import Path

# Ensure root workspace directory is in sys.path
root_dir = Path(__file__).resolve().parent.parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))
rag_dir = root_dir / "AgriSentinelX" / "AgriSentinelX"
if rag_dir.exists() and str(rag_dir) not in sys.path:
    sys.path.insert(0, str(rag_dir))

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User

from .models import (
    Profile,
    Farm,
    Crop,
    InsuranceCase,
    RetailerRequirement,
    Offer,
    Order,
    ChatSession,
    ChatMessage,
)
from .serializers import (
    ProfileSerializer,
    FarmSerializer,
    CropSerializer,
    InsuranceCaseSerializer,
    RetailerRequirementSerializer,
    OfferSerializer,
    OrderSerializer,
)
from .rules import check_insurance_eligibility

# Import AgriSentinel AI Agent and RAG modules
try:
    from agri_agent import run_agent, AgriAgentError
except ImportError:
    run_agent = None
    AgriAgentError = Exception

try:
    from rag.answer import generate_grounded_answer
except ImportError:
    generate_grounded_answer = None

logger = logging.getLogger(__name__)

try:
    from agri_agent.weather import get_weather
    from agri_agent.exceptions import WeatherError
except Exception as _e:
    logger.error("Failed to import get_weather: %s", str(_e))
    get_weather = None
    WeatherError = Exception


def _get_request_id(request) -> str:
    """Extract or generate a correlation request ID."""
    return getattr(request, "request_id", None) or request.headers.get("X-Request-ID") or str(uuid.uuid4())


def _get_or_create_chat_session(request, session_key: str) -> ChatSession:
    """Return a chat session owned by the authenticated user or a unique anonymous user."""
    user = request.user if request.user.is_authenticated else None
    if user is None:
        return None
    session, _ = ChatSession.objects.get_or_create(
        session_id=session_key,
        defaults={"user": user},
    )
    return session



@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint confirming system status."""
    return Response(
        {
            "status": "success",
            "message": "AgriSentinel X backend is running",
            "service": "backend",
            "agent_available": run_agent is not None,
            "rag_available": generate_grounded_answer is not None,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def profile_list(request):
    """List or create user profiles."""
    if request.method == "GET":
        profiles = Profile.objects.all()
        serializer = ProfileSerializer(profiles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "POST":
        serializer = ProfileSerializer(data=request.data)
        if serializer.is_valid():
            profile = serializer.save()
            return Response(ProfileSerializer(profile).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def crop_list(request):
    """List or create crop listings."""
    if request.method == "GET":
        crops = Crop.objects.all()
        serializer = CropSerializer(crops, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "POST":
        serializer = CropSerializer(data=request.data)
        if serializer.is_valid():
            crop = serializer.save()
            return Response(CropSerializer(crop).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def requirement_list(request):
    """List or create retailer requirements."""
    if request.method == "GET":
        requirements = RetailerRequirement.objects.all()
        serializer = RetailerRequirementSerializer(requirements, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "POST":
        serializer = RetailerRequirementSerializer(data=request.data)
        if serializer.is_valid():
            req = serializer.save()
            return Response(RetailerRequirementSerializer(req).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def offer_list(request):
    """List or create marketplace offers."""
    if request.method == "GET":
        offers = Offer.objects.all()
        serializer = OfferSerializer(offers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "POST":
        serializer = OfferSerializer(data=request.data)
        if serializer.is_valid():
            offer = serializer.save()
            return Response(OfferSerializer(offer).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH", "PUT"])
@permission_classes([IsAuthenticated])
def offer_update_status(request, pk):
    """Update status of an offer (ACCEPT/REJECT)."""
    try:
        offer = Offer.objects.get(pk=pk)
    except Offer.DoesNotExist:
        return Response({"error": "Offer not found"}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get("status")
    if new_status not in ["ACCEPTED", "REJECTED", "PENDING"]:
        return Response({"error": "Invalid status value"}, status=status.HTTP_400_BAD_REQUEST)

    offer.status = new_status
    offer.save()
    return Response(OfferSerializer(offer).data, status=status.HTTP_200_OK)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def order_list(request):
    """List or create marketplace orders."""
    if request.method == "GET":
        orders = Order.objects.all()
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "POST":
        serializer = OrderSerializer(data=request.data)
        if serializer.is_valid():
            order = serializer.save()
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH", "PUT"])
@permission_classes([IsAuthenticated])
def order_update_status(request, pk):
    """Update status of an order."""
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get("status")
    if new_status not in ["PENDING", "CONFIRMED", "IN_TRANSIT", "DELIVERED", "CANCELLED"]:
        return Response({"error": "Invalid order status value"}, status=status.HTTP_400_BAD_REQUEST)

    order.status = new_status
    order.save()
    return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def insurance_case_list(request):
    """List or file insurance cases."""
    if request.method == "GET":
        cases = InsuranceCase.objects.all()
        serializer = InsuranceCaseSerializer(cases, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "POST":
        serializer = InsuranceCaseSerializer(data=request.data)
        if serializer.is_valid():
            case_obj = serializer.save()
            return Response(InsuranceCaseSerializer(case_obj).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def eligibility_check(request):
    """Deterministic basic insurance rule check endpoint."""
    result = check_insurance_eligibility(
        crop_name=request.data.get("crop_name"),
        planting_date=request.data.get("planting_date"),
        expected_harvest_date=request.data.get("expected_harvest_date"),
        damage_description=request.data.get("damage_description"),
    )
    return Response(result, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
def agent_query(request):
    """
    Main DRF Endpoint for AgriSentinel Agent.
    Invokes AgriSentinelAgent to process farmer query, weather tool, insurance rules,
    and grounded narrative.

    Structured log fields: request_id, session_id, endpoint, tools_called,
    input_tokens, output_tokens, total_tokens, estimated_cost_usd, latency_ms
    """
    request_id = _get_request_id(request)
    start_time = time.monotonic()

    query_text = request.data.get("query")
    if not query_text or not str(query_text).strip():
        return Response(
            {"error": "Field 'query' is required and cannot be empty."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if run_agent is None:
        return Response(
            {"error": "AgriSentinel agent package is unconfigured."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    # --- Session persistence in MySQL ---
    session_key = request.data.get("session_id") or str(uuid.uuid4())
    try:
        chat_session = _get_or_create_chat_session(request, session_key)
        # Persist the user message
        ChatMessage.objects.create(
            session=chat_session,
            role="USER",
            message=str(query_text),
        )
    except Exception as db_err:
        logger.warning("Could not persist user message to DB: %s", str(db_err),
                       extra={"request_id": request_id, "session_id": session_key})

    try:
        # Extract parameters safely
        lat = request.data.get("latitude")
        lon = request.data.get("longitude")
        lat_float = float(lat) if lat is not None and str(lat).strip() != "" else None
        lon_float = float(lon) if lon is not None and str(lon).strip() != "" else None
        land_ha = request.data.get("land_holding_hectares")
        land_float = float(land_ha) if land_ha is not None and str(land_ha).strip() != "" else None

        result = run_agent(
            query=str(query_text),
            latitude=lat_float,
            longitude=lon_float,
            crop_name=request.data.get("crop_name"),
            claimed_cause=request.data.get("claimed_cause"),
            start_date=request.data.get("start_date"),
            end_date=request.data.get("end_date"),
            policy_id=request.data.get("policy_id"),
            land_holding_hectares=land_float,
        )

        latency_ms = round((time.monotonic() - start_time) * 1000, 2)

        # --- Structured log record ---
        logger.info(
            "agent_query completed: tools=%s status=%s latency_ms=%.2f",
            result.tools_used,
            result.status,
            latency_ms,
            extra={"request_id": request_id, "session_id": session_key},
        )

        # --- Persist assistant message to MySQL ---
        try:
            ChatMessage.objects.create(
                session=chat_session,
                role="ASSISTANT",
                message=result.answer,
                tool_used=", ".join(result.tools_used) if result.tools_used else "",
            )
        except Exception as db_err:
            logger.warning("Could not persist assistant message to DB: %s", str(db_err),
                           extra={"request_id": request_id, "session_id": session_key})

        response_data = result.model_dump()
        response_data["request_id"] = request_id
        response_data["session_id"] = session_key
        return Response(response_data, status=status.HTTP_200_OK)

    except AgriAgentError as e:
        logger.error("AgriAgentError in agent_query: %s", str(e),
                     extra={"request_id": request_id, "session_id": session_key})
        return Response({"error": str(e), "request_id": request_id}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.exception("Unexpected error in agent_query",
                         extra={"request_id": request_id, "session_id": session_key})
        return Response(
            {"error": "Internal server error during agent execution", "details": str(e), "request_id": request_id},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )



@api_view(["POST"])
@permission_classes([AllowAny])
def rag_ask(request):
    """
    RAG Endpoint for Government Scheme Guidelines & Policy Questions.
    """
    question = request.data.get("question") or request.data.get("query")
    if not question or not str(question).strip():
        return Response({"error": "Field 'question' is required."}, status=status.HTTP_400_BAD_REQUEST)

    if generate_grounded_answer is None:
        return Response({"error": "RAG module is unconfigured."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    try:
        res = generate_grounded_answer(
            question=str(question),
            state=request.data.get("state"),
            district=request.data.get("district"),
            crop=request.data.get("crop"),
            season=request.data.get("season"),
            year=request.data.get("year"),
        )
        return Response(res.model_dump(), status=status.HTTP_200_OK)
    except Exception as e:
        logger.exception("Error in RAG endpoint")
        return Response({"error": "RAG execution failed."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([AllowAny])
def weather_fetch(request):
    """Direct Open-Meteo Weather Tool endpoint."""
    lat = request.query_params.get("latitude")
    lon = request.query_params.get("longitude")
    if not lat or not lon:
        return Response({"error": "Query parameters 'latitude' and 'longitude' are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        from agri_agent.weather import get_weather as gw_fn
        weather_res = gw_fn(
            latitude=float(lat),
            longitude=float(lon),
            start_date=request.query_params.get("start_date"),
            end_date=request.query_params.get("end_date"),
        )
        return Response(weather_res.model_dump(), status=status.HTTP_200_OK)
    except Exception as e:
        logger.warning("Weather tool request failed (%s)", type(e).__name__)
        return Response(
            {"error": "Weather service is temporarily unavailable."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )



@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    """Authenticate a user using Django's password hash and session framework."""
    from django.contrib.auth import authenticate, login

    username = request.data.get("username", "").strip()
    password = request.data.get("password", "")
    if not username or not password:
        return Response(
            {"error": "Username and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response(
            {"error": "Invalid username or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    login(request, user)
    role = "ADMIN" if user.is_staff or user.is_superuser else "USER"
    location = ""
    phone = ""
    try:
        profile = Profile.objects.get(user=user)
        role = profile.role.upper()
        location = profile.location
        phone = profile.phone
    except Profile.DoesNotExist:
        pass

    display_name = f"{user.first_name} {user.last_name}".strip() or user.username
    return Response(
        {
            "success": True,
            "username": user.username,
            "role": role,
            "name": display_name,
            "location": location,
            "phone": phone,
            "token": request.session.session_key,
            "api_token": Token.objects.get_or_create(user=user)[0].key,
        },
        status=status.HTTP_200_OK,
    )
