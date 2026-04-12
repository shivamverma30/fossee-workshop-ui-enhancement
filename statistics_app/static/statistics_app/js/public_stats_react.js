(function (window, document) {
    'use strict';

    var chartInstance = null;
    var fallbackBound = false;
    var reactMounted = false;
    var resizeBound = false;
    var resizeHandle = null;

    function getViewportWidth() {
        return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    }

    function getStatsData() {
        var rawData = window.PUBLIC_STATS_DATA || {};
        return {
            stateLabels: rawData.stateLabels || [],
            stateData: rawData.stateData || [],
            typeLabels: rawData.typeLabels || [],
            typeData: rawData.typeData || []
        };
    }

    function getResponsiveDialogSize() {
        var viewportWidth = getViewportWidth();
        var viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        var smallScreen = viewportWidth < 768;
        var horizontalPadding = smallScreen ? 20 : 56;
        var dialogWidth = Math.min(900, Math.max(280, viewportWidth - horizontalPadding));
        var dialogHeight = Math.min(500, Math.max(300, viewportHeight - (smallScreen ? 92 : 150)));
        var chartHeight = Math.max(230, dialogHeight - (smallScreen ? 116 : 132));

        return {
            width: dialogWidth,
            height: dialogHeight,
            chartHeight: chartHeight
        };
    }

    function openDialog() {
        var dialogElement = document.getElementById('dialog');
        var dialogSize = getResponsiveDialogSize();

        if (window.jQuery && window.jQuery.fn && typeof window.jQuery.fn.dialog === 'function' && window.jQuery('#dialog').length) {
            window.jQuery('#dialog').dialog({
                width: dialogSize.width,
                height: dialogSize.height,
                modal: true,
                resizable: false,
                draggable: true,
                position: {
                    my: 'center',
                    at: 'center',
                    of: window
                }
            });
            return dialogSize;
        }

        if (dialogElement) {
            dialogElement.style.display = 'block';
        }

        return dialogSize;
    }

    function drawChart(labels, values, title) {
        var canvas = document.getElementById('myChart');
        if (!canvas) {
            return;
        }

        if (!window.Chart) {
            if (window.toastr && typeof window.toastr.warning === 'function') {
                window.toastr.warning('Chart library is not available right now. Please refresh and try again.');
            }
            return;
        }

        var dialogSize = openDialog();
        canvas.style.width = '100%';
        canvas.style.height = dialogSize.chartHeight + 'px';

        var ctx = canvas.getContext('2d');
        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new window.Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    label: title,
                    backgroundColor: 'rgb(255, 99, 132)',
                    borderColor: 'rgb(255, 99, 132)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        if (typeof chartInstance.resize === 'function') {
            chartInstance.resize();
        }
    }

    function showPublicStatsGraph(graphType) {
        var statsData = getStatsData();

        if (graphType === 'state') {
            drawChart(statsData.stateLabels, statsData.stateData, 'State wise workshops');
            return;
        }

        if (graphType === 'type') {
            drawChart(statsData.typeLabels, statsData.typeData, 'Type wise workshops');
        }
    }

    window.showPublicStatsGraph = showPublicStatsGraph;

    function syncFiltersPanel() {
        var filtersPanel = document.querySelector('.public-stats-filters');
        if (!filtersPanel) {
            return;
        }

        if (getViewportWidth() < 768) {
            if (!filtersPanel.hasAttribute('data-mobile-initialized')) {
                filtersPanel.removeAttribute('open');
                filtersPanel.setAttribute('data-mobile-initialized', 'true');
            }
            return;
        }

        filtersPanel.setAttribute('open', 'open');
    }

    function bindResizeHandler() {
        if (resizeBound) {
            return;
        }

        window.addEventListener('resize', function () {
            if (resizeHandle) {
                window.cancelAnimationFrame(resizeHandle);
            }

            resizeHandle = window.requestAnimationFrame(function () {
                syncFiltersPanel();

                if (chartInstance && typeof chartInstance.resize === 'function') {
                    chartInstance.resize();
                }
            });
        });

        resizeBound = true;
    }

    function bindFallbackButtons() {
        if (fallbackBound) {
            return;
        }

        var fallbackButtons = document.querySelectorAll('#stats-chart-actions-fallback [data-graph-type]');
        for (var i = 0; i < fallbackButtons.length; i++) {
            fallbackButtons[i].addEventListener('click', function () {
                var graphType = this.getAttribute('data-graph-type');
                if (graphType) {
                    showPublicStatsGraph(graphType);
                }
            });
        }

        fallbackBound = true;
    }

    function createChartButton(type, iconName, textLabel, elementFactory) {
        return elementFactory(
            'button',
            {
                key: type,
                type: 'button',
                className: 'btn btn-info stats-btn stats-btn-chart',
                'aria-label': type === 'state' ? 'Open state chart' : 'Open workshops chart',
                'aria-controls': 'dialog',
                'data-graph-type': type,
                onClick: function () {
                    showPublicStatsGraph(type);
                }
            },
            elementFactory('span', { className: 'material-icons', 'aria-hidden': 'true', key: type + '-icon' }, iconName),
            elementFactory('span', { key: type + '-text' }, textLabel)
        );
    }

    function ChartActions() {
        var createElement = window.React.createElement;

        return createElement(
            'div',
            {
                className: 'public-stats-chart-actions',
                role: 'group',
                'aria-label': 'Chart actions'
            },
            [
                createChartButton('state', 'bar_chart', 'State Chart', createElement),
                createChartButton('type', 'equalizer', 'Workshops Chart', createElement)
            ]
        );
    }

    function mountReactActions() {
        if (reactMounted) {
            return true;
        }

        if (!window.React || !window.ReactDOM) {
            return false;
        }

        var rootElement = document.getElementById('stats-chart-react-root');
        if (!rootElement) {
            return false;
        }

        window.ReactDOM.render(window.React.createElement(ChartActions), rootElement);

        var fallbackContainer = document.getElementById('stats-chart-actions-fallback');
        if (fallbackContainer) {
            fallbackContainer.style.display = 'none';
        }

        reactMounted = true;
        return true;
    }

    function initPublicStatsReactCharts() {
        bindFallbackButtons();
        syncFiltersPanel();
        bindResizeHandler();
        mountReactActions();
    }

    window.initPublicStatsReactCharts = initPublicStatsReactCharts;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPublicStatsReactCharts);
    } else {
        initPublicStatsReactCharts();
    }
})(window, document);
