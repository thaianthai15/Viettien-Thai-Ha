from django.contrib import admin

from .models import AIConversation, AIMessage


class AIMessageInline(admin.TabularInline):
    model = AIMessage
    extra = 0
    readonly_fields = ["role", "content", "created_at"]


@admin.register(AIConversation)
class AIConversationAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "title", "created_at"]
    search_fields = ["title", "user__username"]
    list_filter = ["created_at"]
    inlines = [AIMessageInline]


@admin.register(AIMessage)
class AIMessageAdmin(admin.ModelAdmin):
    list_display = ["id", "conversation", "role", "created_at"]
    search_fields = ["content", "conversation__title"]
    list_filter = ["role", "created_at"]