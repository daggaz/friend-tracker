from django import forms

from friends.models import Friend, Meeting


class FriendForm(forms.ModelForm):
    class Meta:
        model = Friend
        fields = ['name', 'interval', 'interval_type']


class MeetingForm(forms.ModelForm):
    class Meta:
        model = Meeting
        fields = ['date']
