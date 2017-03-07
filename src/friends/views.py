from django.views.generic import TemplateView
from rest_framework import viewsets
from rest_framework.routers import DefaultRouter

from friends.forms import FriendForm, MeetingForm
from friends.models import Friend, Meeting
from friends.serializers import FriendSerializer, MeetingSerializer


class HomeView(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super(HomeView, self).get_context_data(**kwargs)
        context['friend_form'] = FriendForm()
        context['meeting_form'] = MeetingForm()
        return context


class FriendViewSet(viewsets.ModelViewSet):
    queryset = Friend.objects.prefetch_related('meetings')
    serializer_class = FriendSerializer



class MeetingViewSet(viewsets.ModelViewSet):
    queryset = Meeting.objects.all()
    serializer_class = MeetingSerializer


router = DefaultRouter()
router.register(r'friends', FriendViewSet)
router.register(r'meetings', MeetingViewSet)
