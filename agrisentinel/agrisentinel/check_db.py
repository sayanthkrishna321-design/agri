import os, sys, django
os.environ['DB_ENGINE'] = 'sqlite3'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from core.models import Crop
from core.serializers import CropSerializer
print("SERIALIZED CROPS:", CropSerializer(Crop.objects.all(), many=True).data)
