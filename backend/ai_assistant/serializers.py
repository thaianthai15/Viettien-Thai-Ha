from rest_framework import serializers

from .models import AIConversation, AIMessage


class AIMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIMessage
        fields = [
            "id",
            "role",
            "content",
            "created_at",
        ]


class AIConversationSerializer(serializers.ModelSerializer):
    messages = AIMessageSerializer(many=True, read_only=True)

    class Meta:
        model = AIConversation
        fields = [
            "id",
            "title",
            "messages",
            "created_at",
        ]


class AIChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField()


class AIChatResponseSerializer(serializers.Serializer):
    answer = serializers.CharField()
    conversation_id = serializers.IntegerField()