/**
 * AG Charts Web Components - Community Edition
 * Self-contained web components for all free AG Charts types
 */

// Base class for all AG Chart components
class AgChartBase extends HTMLElement {
    constructor(chartType) {
        super();
        this.attachShadow({ mode: 'open' });
        this.chartType = chartType;
        this.chart = null;
        this.agChartsLoaded = false;
        this._data = [];
        this._config = {};
        
        this._libraryUrl = 'https://cdn.jsdelivr.net/npm/ag-charts-community/dist/umd/ag-charts-community.js';
        
        this.render();
    }

    static get observedAttributes() {
        return ['library-url', 'title', 'width', 'height'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            switch (name) {
                case 'library-url':
                    this._libraryUrl = newValue;
                    break;
                case 'title':
                    this.updateChart();
                    break;
                case 'width':
                case 'height':
                    this.updateDimensions();
                    break;
            }
        }
    }

    connectedCallback() {
        this.loadAgCharts().then(() => {
            this.createChart();
        }).catch((error) => {
            console.error('AG Charts: Failed to load library:', error);
        });
    }

    disconnectedCallback() {
        if (this.chart) {
            this.chart.destroy();
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 350px;
                    border-radius: 8px;
                    overflow: hidden;
                }
                
                #chart-container {
                    width: 100%;
                    height: 100%;
                }
                
                .loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    font-family: Arial, sans-serif;
                    color: #666;
                }
                
                .error {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    font-family: Arial, sans-serif;
                    color: #d32f2f;
                    text-align: center;
                    padding: 20px;
                }
            </style>
            <div id="chart-container">
                <div class="loading">Loading chart...</div>
            </div>
        `;
    }

    async loadAgCharts() {
        return new Promise((resolve, reject) => {
            // Detect global object (supports GWT $wnd and regular window)
            const globalObj = (function() {
                if (typeof $wnd !== 'undefined') return $wnd; // GWT environment
                if (typeof window !== 'undefined') return window; // Browser environment
                if (typeof global !== 'undefined') return global; // Node.js environment
                return this; // Fallback
            })();

            if (globalObj.agCharts) {
                this.agChartsLoaded = true;
                resolve();
                return;
            }

            // Check if library is already bundled
            if (this._libraryUrl === null) {
                this.agChartsLoaded = true;
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = this._libraryUrl;
            script.onload = () => {
                this.agChartsLoaded = true;
                resolve();
            };
            script.onerror = () => {
                this.showError('Failed to load AG Charts library');
                reject(new Error('Failed to load AG Charts library'));
            };
            document.head.appendChild(script);
        });
    }

    createChart() {
        // Detect global object (supports GWT $wnd and regular window)
        const globalObj = (function() {
            if (typeof $wnd !== 'undefined') return $wnd; // GWT environment
            if (typeof window !== 'undefined') return window; // Browser environment
            if (typeof global !== 'undefined') return global; // Node.js environment
            return this; // Fallback
        })();

        if (!this.agChartsLoaded || !globalObj.agCharts) {
            this.showError('AG Charts library not loaded');
            return;
        }

        const container = this.shadowRoot.getElementById('chart-container');
        container.innerHTML = '';

        const defaultSeries = this.getDefaultSeries();
        const options = {
            container: container,
            data: this._data,
            series: defaultSeries,
            title: {
                text: this.getAttribute('title') || ''
            },
            background: {
                fill: 'transparent'
            },
            ...this._config
        };

        try {
            this.chart = globalObj.agCharts.AgCharts.create(options);
            this.dispatchEvent(new CustomEvent('chart-created', { 
                detail: { chart: this.chart }
            }));
        } catch (error) {
            console.error('AG Charts: Error creating chart:', error.message);
            this.showError('Error creating chart: ' + error.message);
        }
    }

    getDefaultSeries() {
        // Override in child classes
        return [];
    }

    updateChart() {
        if (!this.chart) return;

        try {
            // Destroy existing chart and recreate with new data
            this.chart.destroy();
            this.createChart();
        } catch (error) {
            this.showError('Error updating chart: ' + error.message);
        }
    }

    updateDimensions() {
        const width = this.getAttribute('width');
        const height = this.getAttribute('height');
        
        if (width) this.style.width = width.includes('px') ? width : width + 'px';
        if (height) this.style.height = height.includes('px') ? height : height + 'px';
    }

    showError(message) {
        const container = this.shadowRoot.getElementById('chart-container');
        container.innerHTML = `<div class="error">${message}</div>`;
        this.dispatchEvent(new CustomEvent('chart-error', {
            detail: { error: message }
        }));
    }

    // Public API
    set data(value) {
        // Auto-heal: detect and parse JSON string data
        let parsedData = value;
        
        if (typeof value === 'string') {
            try {
                // First try standard JSON parsing
                parsedData = JSON.parse(value);
            } catch (error) {
                try {
                    // Auto-heal JavaScript object notation to valid JSON
                    let fixedValue = value
                        // Fix unquoted property names
                        .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
                        // Fix single quotes to double quotes
                        .replace(/'/g, '"')
                        // Fix trailing commas (optional)
                        .replace(/,(\s*[}\]])/g, '$1');
                    
                    parsedData = JSON.parse(fixedValue);
                } catch (healError) {
                    console.error('AG Charts: Failed to parse data:', error.message);
                    return;
                }
            }
        }
        
        if (!Array.isArray(parsedData)) {
            console.warn('AG Charts: Data must be an array, got:', typeof parsedData);
            return;
        }
        
        this._data = parsedData;
        
        if (this.chart) {
            this.updateChart();
        } else if (this.agChartsLoaded) {
            this.createChart();
        }
    }

    get data() {
        return this._data;
    }

    set config(value) {
        this._config = value || {};
        if (this.chart) {
            this.updateChart();
        } else if (this.agChartsLoaded) {
            this.createChart();
        }
    }

    get config() {
        return this._config;
    }

    set libraryUrl(url) {
        this._libraryUrl = url;
    }

    get libraryUrl() {
        return this._libraryUrl;
    }

    exportToPNG(fileName = `${this.chartType}-chart.png`) {
        if (this.chart && this.chart.downloadChart) {
            this.chart.downloadChart('png', fileName);
            return true;
        }
        return false;
    }

    exportToSVG(fileName = `${this.chartType}-chart.svg`) {
        if (this.chart && this.chart.downloadChart) {
            this.chart.downloadChart('svg', fileName);
            return true;
        }
        return false;
    }

    getChartData() {
        return this._data;
    }

    updateData(newData) {
        this.data = newData; // Uses the auto-healing setter
    }
}

// Donut Chart Component
class AgDonutChart extends AgChartBase {
    constructor() {
        super('donut');
    }

    getDefaultSeries() {
        return [{
            type: 'donut',
            angleKey: 'value',
            sectorLabelKey: 'label',
            legendItemKey: 'label',
            innerRadiusRatio: 0.6
        }];
    }
}

// Pie Chart Component
class AgPieChart extends AgChartBase {
    constructor() {
        super('pie');
    }

    getDefaultSeries() {
        return [{
            type: 'pie',
            angleKey: 'value',
            sectorLabelKey: 'label',
            legendItemKey: 'label'
        }];
    }
}

// Line Chart Component
class AgLineChart extends AgChartBase {
    constructor() {
        super('line');
    }

    getDefaultSeries() {
        return [{
            type: 'line',
            xKey: 'x',
            yKey: 'y'
        }];
    }
}

// Bar Chart Component (horizontal bars)
class AgBarChart extends AgChartBase {
    constructor() {
        super('bar');
    }

    getDefaultSeries() {
        return [{
            type: 'bar',
            xKey: 'category',
            yKey: 'value',
            direction: 'horizontal'
        }];
    }
}

// Column Chart Component (uses bar type with direction)
class AgColumnChart extends AgChartBase {
    constructor() {
        super('column');
    }

    getDefaultSeries() {
        return [{
            type: 'bar',
            xKey: 'category',
            yKey: 'value'
        }];
    }
}

// Area Chart Component
class AgAreaChart extends AgChartBase {
    constructor() {
        super('area');
    }

    getDefaultSeries() {
        return [{
            type: 'area',
            xKey: 'x',
            yKey: 'y'
        }];
    }
}

// Scatter Chart Component
class AgScatterChart extends AgChartBase {
    constructor() {
        super('scatter');
    }

    getDefaultSeries() {
        return [{
            type: 'scatter',
            xKey: 'x',
            yKey: 'y'
        }];
    }
}

// Bubble Chart Component
class AgBubbleChart extends AgChartBase {
    constructor() {
        super('bubble');
    }

    getDefaultSeries() {
        return [{
            type: 'bubble',
            xKey: 'x',
            yKey: 'y',
            sizeKey: 'size'
        }];
    }
}

// Register all components
customElements.define('ag-donut-chart', AgDonutChart);
customElements.define('ag-pie-chart', AgPieChart);
customElements.define('ag-line-chart', AgLineChart);
customElements.define('ag-bar-chart', AgBarChart);
customElements.define('ag-column-chart', AgColumnChart);
customElements.define('ag-area-chart', AgAreaChart);
customElements.define('ag-scatter-chart', AgScatterChart);
customElements.define('ag-bubble-chart', AgBubbleChart);