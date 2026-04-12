$(document).ready(function () {
    $('[data-toggle="popover"]').popover({
        placement: 'top',
        trigger: 'hover'
    });

    $('[data-toggle="popinfo"]').popover({
        placement: 'top',
        trigger: 'hover'
    });
});

function openRescheduleDialog(button) {
    var dialogIndex = button.getAttribute('data-dialog-index');
    if (!dialogIndex) {
        return;
    }

    var dateToday = new Date();
    var maxDate = new Date();
    maxDate.setFullYear(dateToday.getFullYear() + 1);

    $('.rDate' + dialogIndex).datepicker({
        changeMonth: true,
        changeYear: true,
        minDate: dateToday,
        maxDate: maxDate,
        dateFormat: 'yy-mm-dd'
    });

    $('.ui-dialog-content').dialog('close');
    $('.myDialogR' + dialogIndex).dialog();
}

function bindInstructorDashboardActions() {
    var rescheduleButtons = document.querySelectorAll('.js-open-reschedule-dialog');
    var acceptButtons = document.querySelectorAll('.js-confirm-accept');

    for (var i = 0; i < rescheduleButtons.length; i += 1) {
        // moved inline handler here so keyboard/mouse behavior stays consistent
        rescheduleButtons[i].addEventListener('click', function () {
            openRescheduleDialog(this);
        });
    }

    for (var j = 0; j < acceptButtons.length; j += 1) {
        acceptButtons[j].addEventListener('click', function (event) {
            var confirmMessage = this.getAttribute('data-confirm-message') || 'Accept this workshop request?';
            if (!window.confirm(confirmMessage)) {
                event.preventDefault();
            }
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindInstructorDashboardActions);
} else {
    bindInstructorDashboardActions();
}