from django.conf import settings
from django.db import models


class AIConversation(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ai_conversations",
    )
    title = models.CharField(max_length=255, default="Cuộc trò chuyện mới")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Cuộc trò chuyện AI"
        verbose_name_plural = "Cuộc trò chuyện AI"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.user}"


class AIMessage(models.Model):
    class Role(models.TextChoices):
        USER = "USER", "Người dùng"
        ASSISTANT = "ASSISTANT", "AI Assistant"

    conversation = models.ForeignKey(
        AIConversation,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    role = models.CharField(max_length=20, choices=Role.choices)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Tin nhắn AI"
        verbose_name_plural = "Tin nhắn AI"
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.role}: {self.content[:50]}"