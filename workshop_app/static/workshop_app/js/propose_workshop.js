(function (window, document) {
    'use strict';

    function initDatePicker() {
        if (!(window.jQuery && window.jQuery.fn && typeof window.jQuery.fn.datepicker === 'function')) {
            return;
        }

        var minDate = new Date();
        var maxDate = new Date();
        minDate.setDate(minDate.getDate() + 3);
        maxDate.setFullYear(minDate.getFullYear() + 1);

        window.jQuery('.datepicker').datepicker({
            changeMonth: true,
            changeYear: true,
            minDate: minDate,
            maxDate: maxDate,
            beforeShowDay: window.jQuery.datepicker.noWeekends,
            dateFormat: 'yy-mm-dd'
        });
    }

    function bindTermsAndConditionsModal() {
        var form = document.querySelector('form[data-tnc-base-url]');
        var trigger = document.getElementById('disp_tnc');
        var workshopType = document.getElementById('id_workshop_type');
        var modalBody = document.querySelector('.modal-body');

        if (!form || !trigger || !workshopType || !modalBody || !(window.jQuery && window.jQuery.ajax)) {
            return;
        }

        var baseUrl = form.getAttribute('data-tnc-base-url') || '/workshop/type_tnc/';

        trigger.addEventListener('click', function (event) {
            event.preventDefault();

            if (!workshopType.value) {
                modalBody.innerHTML = "<p class='text-danger'>Please select a workshop type</p>";
                return;
            }

            window.jQuery.ajax({
                url: baseUrl + workshopType.value,
                success: function (data) {
                    modalBody.innerHTML = data.tnc;
                },
                error: function () {
                    modalBody.innerHTML = "<p class='text-danger'>Unable to load terms right now. Please try again.</p>";
                }
            });
        });
    }

    function initProposeWorkshopPage() {
        initDatePicker();
        bindTermsAndConditionsModal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProposeWorkshopPage);
    } else {
        initProposeWorkshopPage();
    }
})(window, document);
