from datetime import date
from rest_framework import serializers

from friends.models import Friend, Meeting
from dateutil.relativedelta import relativedelta


class MeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = '__all__'


class FriendSerializer(serializers.ModelSerializer):
    interval_in_days = serializers.SerializerMethodField()
    deadline = serializers.SerializerMethodField()
    days_till_deadline = serializers.SerializerMethodField()
    last_meeting = serializers.SerializerMethodField()
    days_since_last_meeting = serializers.SerializerMethodField()
    next_meeting = serializers.SerializerMethodField()
    days_till_next_meeting = serializers.SerializerMethodField()
    meetings = MeetingSerializer(many=True, read_only=True)

    def get_days_till_next_meeting(self, friend):
        next_meeting = self.get_next_meeting(friend)
        if next_meeting:
            return (next_meeting-date.today()).days

    def get_days_since_last_meeting(self, friend):
        last_meeting = self.get_last_meeting(friend)
        if last_meeting:
            return (date.today()-last_meeting).days

    def get_interval_in_days(self, friend):
        if friend.interval_type == Friend.DAYS:
            return friend.interval
        if friend.interval_type == Friend.WEEKS:
            return friend.interval * 7
        if friend.interval_type == Friend.MONTHS:
            return int(round(friend.interval * (365/12.0)))

    def get_deadline(self, friend):
        last = self.get_last_meeting(friend)
        if last:
            return last + relativedelta(days=self.get_interval_in_days(friend))
        return date.today()

    def get_days_till_deadline(self, friend):
        return (self.get_deadline(friend)-date.today()).days

    def get_last_meeting(self, friend):
        try:
            return friend.meetings.filter(date__lt=date.today()).latest('date').date
        except Meeting.DoesNotExist:
            return None

    def get_next_meeting(self, friend):
        try:
            return friend.meetings.filter(date__gte=date.today()).earliest('date').date
        except Meeting.DoesNotExist:
            return None

    class Meta:
        model = Friend
        fields = '__all__'
