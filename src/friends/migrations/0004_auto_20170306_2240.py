# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-03-06 22:40
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('friends', '0003_auto_20170306_2230'),
    ]

    operations = [
        migrations.AlterField(
            model_name='friend',
            name='interval_type',
            field=models.CharField(choices=[(b'days', b'Day'), (b'weeks', b'Week'), (b'months', b'Month')], max_length=20),
        ),
    ]