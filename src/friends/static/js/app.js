$(document).ready(function () {
    var friendForm = $("#friend-form");
    var friendFields = friendForm.find('input, select').addClass('ui-widget-content ui-corner-all');
    friendForm.find('input[type="text"], input[type="number"]').addClass('text');
    friendForm.find('select').addClass('select');
    var addEditFriend = function(save, data) {
        friendForm.dialog({
            autoOpen: false,
            width: 350,
            modal: true,
            title: 'Add/edit friend',
            buttons: {
                "Save": save,
                Cancel: function () {
                    friendForm.dialog("close");
                }
            },
            close: function () {
                friendForm[0].reset();
                friendForm.find('.error-list').remove();
                friendFields.removeClass("ui-state-error");
            }
        });
        if (data) {
            $.each(data, function (k, v) {
                friendForm.find('#id_'+k).val(v);
            });
        }
        friendForm.dialog('open');
    };


    var meetingForm = $('#meeting-form');
    var meetingFields = meetingForm.find('input, select').addClass('ui-widget-content ui-corner-all');
    meetingForm.find('input[type="text"], input[type="number"]').addClass('text');
    var addMeeting = function (save) {
        meetingForm.dialog({
            autoOpen: false,
            width: 350,
            modal: true,
            title: 'Add/edit meeting',
            buttons: {
                "Save": save,
                Cancel: function () {
                    meetingForm.dialog("close");
                }
            },
            close: function () {
                meetingForm[0].reset();
                meetingForm.find('.error-list').remove();
                meetingFields.removeClass("ui-state-error");
            }
        });
        meetingForm.dialog('open');
    };

    var loadTable = function () {
        var content = $('#content').empty().isLoading();
        $.ajax('/api/friends/').done(function (friends) {
            $.each(friends, function (i, friend) {
                var friendRow = $('<div>').appendTo(content).addClass('friend')
                    .append(
                        $('<button>').addClass('btn btn-small btn-danger btn-friend pull-right')
                            .append($('<span>').addClass('fa fa-remove'))
                            .append(' Delete')
                            .click(function () {
                                var dialog = $('<p>').attr('title', 'Confirm delete').text('Really delete ' + friend.name).dialog({
                                    resizable: false,
                                    height: "auto",
                                    width: 400,
                                    modal: true,
                                    buttons: {
                                        "Delete": function() {
                                            $.ajax('/api/friends/' + friend.id + '/', {
                                                method: 'DELETE'
                                            }).done(function () {
                                                dialog.dialog("close");
                                                loadTable();
                                            })
                                        },
                                        Cancel: function() {
                                            dialog.dialog("close");
                                        }
                                    }
                                });
                            })
                    )
                    .append(
                        $('<button>').addClass('btn btn-small btn-friend pull-right')
                            .append($('<span>').addClass('fa fa-edit'))
                            .append(' Edit')
                            .click(function () {
                                addEditFriend(function () {
                                    $.ajax('/api/friends/' + friend.id + '/', {
                                        method: 'PUT',
                                        data: {
                                            'name': friendForm.find('#id_name').val(),
                                            'interval': friendForm.find('#id_interval').val(),
                                            'interval_type': friendForm.find('#id_interval_type').val()
                                        }
                                    }).done(function () {
                                        loadTable();
                                        friendForm.dialog("close");
                                        friendForm.isLoading('hide');
                                    }).fail(function (errors) {
                                        friendForm.find('.error-list').remove();
                                        $.each(errors.responseJSON, function (fieldName, fieldErrors) {
                                            var field = $('#id_' + fieldName).addClass("ui-state-error");
                                            var errorList = $('<ul>').addClass('error-list').insertAfter(field);
                                            $.each(fieldErrors, function (i, error){
                                                errorList.append($('<li>').text(error));
                                            });
                                        });
                                        friendForm.isLoading('hide');
                                    });
                                }, friend);
                            })
                    )
                    .append(
                        $('<button>').addClass('btn btn-small btn-friend pull-right')
                            .append($('<span>').addClass('fa fa-calendar-plus-o'))
                            .append(' Add meeting')
                            .click(function () {
                                addMeeting(function () {
                                    meetingForm.isLoading();
                                    $.post('/api/meetings/', {
                                        'friend': friend.id,
                                        'date': meetingForm.find('#id_date').val()
                                    }).done(function () {
                                        loadTable();
                                        meetingForm.dialog("close");
                                        meetingForm.isLoading('hide');
                                    }).fail(function (errors) {
                                        meetingForm.find('.error-list').remove();
                                        $.each(errors.responseJSON, function (fieldName, fieldErrors) {
                                            var field = $('#id_' + fieldName).addClass("ui-state-error");
                                            var errorList = $('<ul>').addClass('error-list').insertAfter(field);
                                            $.each(fieldErrors, function (i, error){
                                                errorList.append($('<li>').text(error));
                                            });
                                        });
                                        meetingForm.isLoading('hide');
                                    });
                                });
                            })
                    )
                    .append(
                        $('<span>').addClass('notes pull-right').text('Deadline: ' + friend.days_till_deadline + ' days').attr('title', friend.deadline).tooltip()
                    )
                    .append(
                        function () {
                            if (friend.next_meeting) {
                                return $('<span>').addClass('notes pull-right').text('Next meeting: ' + friend.days_till_next_meeting + ' days').attr('title', friend.next_meeting).tooltip();
                            }
                        }
                    )
                    .append(
                        function () {
                            if (friend.last_meeting) {
                                return $('<span>').addClass('notes pull-right').text('Last meeting: ' + friend.days_since_last_meeting + ' days ago').attr('title', friend.last_meeting).tooltip();
                            }
                        }
                    )
                    .append(
                        $('<span>').addClass('notes pull-right').text('Every ' + friend.interval + ' ' + friend.interval_type).attr('title', friend.interval_in_days + " days").tooltip()
                    )
                    .append($('<div>')
                        .append($('<span>').addClass('fa fa-user'))
                        .append($('<span>').addClass('name').text(friend.name))
                        .click(function () {
                            friendRow.find('table').toggle();
                        })
                    )
                    .append($('<div>').addClass('progress').append(function () {
                        var bar = $('<div>').addClass('progress-bar');
                        var pcnt = 0;
                        if (friend.days_till_next_meeting !== null) {
                            bar.addClass('progress-bar-striped');
                            pcnt = 100;
                            if (friend.days_till_next_meeting > friend.interval_in_days) {
                                bar.addClass('progress-bar-warning');
                                bar.attr('title', 'Next meeting too far in the future!').tooltip();
                            } else {
                                bar.addClass('progress-bar-success');
                                bar.attr('title', 'Next meeting within deadline!').tooltip();
                            }
                        } else if (friend.days_since_last_meeting && friend.days_since_last_meeting < friend.interval_in_days) {
                            pcnt = (friend.days_since_last_meeting/friend.interval_in_days)*100;
                            if (pcnt < 33) {
                                bar.addClass('progress-bar-success');
                            } else if (pcnt < 66) {
                                bar.addClass('progress-bar-warning');
                            } else {
                                bar.addClass('progress-bar-danger');
                            }
                        } else {
                            pcnt = 100;
                            bar.addClass('progress-bar-danger');
                            bar.attr('title', 'No meetings planned!').tooltip();
                        }
                        bar.css({
                            width: pcnt + "%"
                        });
                        return bar;
                    }))
                    .append($('<table>').addClass('table table-striped').css({'display': 'none'})
                        .append($('<thead>')
                            .append($('<tr>').append($('<th>').text('Date')).append($('<th>').css({'width': 100, 'text-align': 'right'}).text('Actions')))
                        )
                        .append($('<tbody>')
                            .append(function () {
                            var rows = [];
                            $.each(friend.meetings, function (i, meeting) {
                                var row = $('<tr>')
                                    .append($('<td>').text(meeting.date))
                                    .append($('<button>').addClass('btn btn-xs btn-danger pull-right').css({'margin-right': '0.5em', 'margin-top': '0.5em'})
                                        .append($('<span>').addClass('fa fa-remove'))
                                        .append(' Delete')
                                        .click(function () {
                                            var dialog = $('<p>').attr('title', 'Confirm delete').text('Really delete ' + friend.name).dialog({
                                                resizable: false,
                                                height: "auto",
                                                width: 400,
                                                modal: true,
                                                buttons: {
                                                    "Delete": function() {
                                                        $.ajax('/api/meetings/' + meeting.id + '/', {
                                                            method: 'DELETE'
                                                        }).done(function () {
                                                            loadTable();
                                                            dialog.dialog("close");
                                                        });
                                                    },
                                                    Cancel: function() {
                                                        dialog.dialog("close");
                                                    }
                                                }
                                            });
                                        })
                                    );
                                rows.push(row);
                            });
                            return rows;
                        }))
                    );
                content.isLoading('hide');
            });
        });
    };
    loadTable();

    $('#add-friend').click(function (){
        addEditFriend(function () {
            friendForm.isLoading();
            $.post('/api/friends/', {
                'name': friendForm.find('#id_name').val(),
                'interval': friendForm.find('#id_interval').val(),
                'interval_type': friendForm.find('#id_interval_type').val()
            }).done(function () {
                loadTable();
                friendForm.dialog("close");
                friendForm.isLoading('hide');
            }).fail(function (errors) {
                friendForm.find('.error-list').remove();
                $.each(errors.responseJSON, function (fieldName, fieldErrors) {
                    var field = $('#id_' + fieldName).addClass("ui-state-error");
                    var errorList = $('<ul>').addClass('error-list').insertAfter(field);
                    $.each(fieldErrors, function (i, error){
                        errorList.append($('<li>').text(error));
                    });
                });
                friendForm.isLoading('hide');
            });
        });
    });

    $('#id_date').datepicker({
        dateFormat: "yy-mm-dd"
    });
});
