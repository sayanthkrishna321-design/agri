from django.contrib import admin

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


admin.site.register(Profile)
admin.site.register(Farm)
admin.site.register(Crop)
admin.site.register(InsuranceCase)
admin.site.register(ChatSession)
admin.site.register(ChatMessage)
admin.site.register(RetailerRequirement)
admin.site.register(Offer)
admin.site.register(Order)