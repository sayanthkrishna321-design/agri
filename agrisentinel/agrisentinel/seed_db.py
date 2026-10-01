"""Create a local AgriSentinel account without storing demo credentials in source."""
import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

import django
django.setup()

from getpass import getpass
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from core.models import Profile

User = get_user_model()
username = input("Account username: ").strip()
if not username:
    raise SystemExit("A username is required.")

role = input("Role (FARMER, RETAILER, ADMIN): ").strip().upper()
if role not in {"FARMER", "RETAILER", "ADMIN"}:
    raise SystemExit("Choose FARMER, RETAILER, or ADMIN.")

password = getpass("New password: ")
confirmation = getpass("Confirm password: ")
if not password or password != confirmation:
    raise SystemExit("Passwords must be non-empty and match.")

user, _ = User.objects.get_or_create(username=username)
try:
    validate_password(password, user=user)
except ValidationError as exc:
    raise SystemExit("Password does not meet Django's configured requirements.") from exc

user.set_password(password)
user.is_staff = role == "ADMIN"
user.is_superuser = role == "ADMIN"
user.save()
Profile.objects.update_or_create(
    user=user,
    defaults={"role": role, "phone": "", "location": ""},
)
print("Account created or updated. Contact details were left blank.")
