from rest_framework import permissions, status
from rest_framework.response import Response

from .models import AIConversation, AIMessage
from .serializers import AIChatRequestSerializer
from .services.rule_based_ai import generate_ai_answer

from rest_framework.views import APIView
from .services.ai_insights import get_import_suggestions, get_anomalies

class AIChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AIChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = serializer.validated_data["message"]

        conversation = AIConversation.objects.create(
            user=request.user,
            title=message[:80],
        )

        AIMessage.objects.create(
            conversation=conversation,
            role=AIMessage.Role.USER,
            content=message,
        )

        answer = generate_ai_answer(message)

        AIMessage.objects.create(
            conversation=conversation,
            role=AIMessage.Role.ASSISTANT,
            content=answer,
        )

        return Response(
            {
                "answer": answer,
                "conversation_id": conversation.id,
            },
            status=status.HTTP_200_OK,
        )

class AIImportSuggestionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        suggestions = get_import_suggestions()

        return Response({
            "count": len(suggestions),
            "suggestions": suggestions,
        })


class AIAnomalyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        anomalies = get_anomalies()

        return Response({
            "count": len(anomalies),
            "anomalies": anomalies,
        })