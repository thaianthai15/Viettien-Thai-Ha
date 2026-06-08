from django.urls import path

from .views import AIChatView, AIImportSuggestionView, AIAnomalyView

urlpatterns = [
    path("chat/", AIChatView.as_view(), name="ai-chat"),
    path("import-suggestions/", AIImportSuggestionView.as_view(), name="ai-import-suggestions"),
    path("anomalies/", AIAnomalyView.as_view(), name="ai-anomalies"),
]