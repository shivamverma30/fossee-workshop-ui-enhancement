(function (window, document) {
    'use strict';

    var teamChart = null;
    var activeChartType = 'bar';

    function getData() {
        var rawData = window.TEAM_STATS_DATA || {};
        return {
            labels: rawData.labels || [],
            counts: rawData.counts || []
        };
    }

    function ensureChartLibrary() {
        if (window.Chart) {
            return true;
        }

        if (window.toastr && typeof window.toastr.warning === 'function') {
            window.toastr.warning('Chart library is unavailable. Please refresh the page.');
        }
        return false;
    }

    function getDatasetStyle(chartType) {
        if (chartType === 'line') {
            return {
                backgroundColor: 'rgba(37, 99, 235, 0.18)',
                borderColor: 'rgb(37, 99, 235)',
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 5,
                fill: true,
                lineTension: 0.25
            };
        }

        return {
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 1,
            barPercentage: 0.75,
            categoryPercentage: 0.62
        };
    }

    function renderChart(chartType) {
        if (!ensureChartLibrary()) {
            return;
        }

        var canvas = document.getElementById('myChart');
        if (!canvas) {
            return;
        }

        var data = getData();
        var style = getDatasetStyle(chartType);

        if (teamChart) {
            teamChart.destroy();
        }

        teamChart = new window.Chart(canvas.getContext('2d'), {
            type: chartType,
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.counts,
                    label: 'Team Members Workshops',
                    backgroundColor: style.backgroundColor,
                    borderColor: style.borderColor,
                    borderWidth: style.borderWidth,
                    pointRadius: style.pointRadius,
                    pointHoverRadius: style.pointHoverRadius,
                    fill: style.fill,
                    lineTension: style.lineTension,
                    barPercentage: style.barPercentage,
                    categoryPercentage: style.categoryPercentage
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: true
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            precision: 0
                        }
                    }]
                }
            }
        });

        activeChartType = chartType;
        updateFallbackButtons();
    }

    function updateFallbackButtons() {
        var buttons = document.querySelectorAll('#team-chart-actions-fallback [data-chart-type]');
        for (var i = 0; i < buttons.length; i++) {
            var button = buttons[i];
            var selected = button.getAttribute('data-chart-type') === activeChartType;
            button.classList.toggle('btn-info', selected);
            button.classList.toggle('btn-outline-info', !selected);
            button.setAttribute('aria-pressed', selected ? 'true' : 'false');
        }
    }

    function bindFallbackButtons() {
        var buttons = document.querySelectorAll('#team-chart-actions-fallback [data-chart-type]');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', function () {
                var chartType = this.getAttribute('data-chart-type');
                renderChart(chartType);
            });
        }
        updateFallbackButtons();
    }

    function createChartTypeButton(chartType, text, createElement) {
        var isActive = activeChartType === chartType;
        return createElement(
            'button',
            {
                key: chartType,
                type: 'button',
                className: 'btn team-chart-action-btn ' + (isActive ? 'btn-info' : 'btn-outline-info'),
                'aria-pressed': isActive ? 'true' : 'false',
                onClick: function () {
                    renderChart(chartType);
                    mountReactControls();
                }
            },
            text
        );
    }

    function TeamChartControls() {
        var createElement = window.React.createElement;
        var data = getData();
        var total = 0;
        for (var i = 0; i < data.counts.length; i++) {
            total += Number(data.counts[i]) || 0;
        }

        return createElement(
            'div',
            {
                className: 'team-chart-react-panel'
            },
            [
                createElement(
                    'div',
                    {
                        key: 'actions',
                        className: 'team-chart-actions',
                        role: 'group',
                        'aria-label': 'Chart type controls'
                    },
                    [
                        createChartTypeButton('bar', 'Bar Chart', createElement),
                        createChartTypeButton('line', 'Line Chart', createElement)
                    ]
                ),
                createElement(
                    'p',
                    {
                        key: 'summary',
                        className: 'team-chart-summary'
                    },
                    'Total workshops in this team: ' + total
                )
            ]
        );
    }

    function mountReactControls() {
        if (!window.React || !window.ReactDOM) {
            return;
        }

        var root = document.getElementById('team-chart-react-root');
        if (!root) {
            return;
        }

        window.ReactDOM.render(window.React.createElement(TeamChartControls), root);

        var fallback = document.getElementById('team-chart-actions-fallback');
        if (fallback) {
            fallback.style.display = 'none';
        }
    }

    function initTeamStatsPage() {
        bindFallbackButtons();
        renderChart('bar');
        mountReactControls();
    }

    window.initTeamStatsPage = initTeamStatsPage;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTeamStatsPage);
    } else {
        initTeamStatsPage();
    }
})(window, document);
