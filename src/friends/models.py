from django.db import models


class Friend(models.Model):
    DAYS = 'days'
    WEEKS = 'weeks'
    MONTHS = 'months'

    INTERVAL_CHOICES = (
        (DAYS, 'Day'),
        (WEEKS, 'Week'),
        (MONTHS, 'Month'),
    )

    name = models.CharField(max_length=256)
    interval = models.IntegerField()
    interval_type = models.CharField(max_length=20, choices=INTERVAL_CHOICES)


class Meeting(models.Model):
    friend = models.ForeignKey(Friend, related_name='meetings')
    date = models.DateField()

    class Meta(object):
        ordering = ('-date',)
