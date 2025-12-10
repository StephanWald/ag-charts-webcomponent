# AG Charts Web Components

Self-contained HTML5 web components for all AG Charts Community (free) chart types.

## Features

- ✅ **8 Chart Types**: All free AG Charts Community charts
- ✅ **Self-contained**: No external dependencies when bundled
- ✅ **Web Components**: Standard HTML5 custom elements
- ✅ **Auto-healing Data**: Accepts objects or JSON strings (auto-parsed)
- ✅ **Event System**: Chart lifecycle events
- ✅ **Export Functions**: PNG and SVG export
- ✅ **Configurable**: Full AG Charts API access
- ✅ **GWT Compatible**: Works in GWT and regular browser environments
- ✅ **On-premise Ready**: Configurable library URL

## Available Chart Types

| Component | Type | Description |
|-----------|------|-------------|
| `<ag-donut-chart>` | Donut | Proportional data with inner radius |
| `<ag-pie-chart>` | Pie | Classic pie chart |
| `<ag-line-chart>` | Line | Time series and trends |
| `<ag-bar-chart>` | Bar | Horizontal bars |
| `<ag-column-chart>` | Column | Vertical columns |
| `<ag-area-chart>` | Area | Filled area charts |
| `<ag-scatter-chart>` | Scatter | XY scatter plots |
| `<ag-bubble-chart>` | Bubble | Three-dimensional bubble plots |

## Quick Start

### Option 1: Use Individual Components (External Library)

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Chart</title>
</head>
<body>
    <!-- Include the components -->
    <script src="ag-charts-components.js"></script>
    
    <!-- Use the chart -->
    <ag-donut-chart id="myChart" title="Sales Data"></ag-donut-chart>
    
    <script>
        const chart = document.getElementById('myChart');
        chart.data = [
            { label: 'Desktop', value: 45 },
            { label: 'Mobile', value: 30 },
            { label: 'Tablet', value: 25 }
        ];
    </script>
</body>
</html>
```

### Option 2: Use Bundled Version (Self-contained)

First, build the bundle:

```bash
npm install
npm run build
```

Then use the bundled version:

```html
<!-- Include the self-contained bundle -->
<script src="dist/ag-charts-components.bundle.js"></script>

<!-- No need to specify library-url - it's bundled! -->
<ag-donut-chart id="myChart" title="Sales Data"></ag-donut-chart>
```

## Build Process

The build process creates three files:

1. **`ag-charts-components.bundle.js`** - Full bundle with AG Charts library (~2MB)
2. **`ag-charts-components.bundle.min.js`** - Minified version (~1.5MB)
3. **`ag-charts-components.standalone.js`** - Components only (~20KB)

### Build Commands

```bash
# Install dependencies
npm install

# Build all versions
npm run build

# Serve the gallery locally
npm run serve

# Build and serve
npm run dev
```

## Usage Examples

### Basic Usage

```html
<ag-line-chart 
    id="trend" 
    title="Revenue Trend"
    width="600px" 
    height="400px">
</ag-line-chart>

<script>
const chart = document.getElementById('trend');

// Option 1: Set data as object array
chart.data = [
    { x: new Date('2024-01'), y: 1000 },
    { x: new Date('2024-02'), y: 1200 },
    { x: new Date('2024-03'), y: 1100 }
];

// Option 2: Set data as JSON string (auto-parsed)
chart.data = '[{"x":"2024-01-01","y":1000},{"x":"2024-02-01","y":1200}]';

// Configure chart
chart.config = {
    series: [{
        type: 'line',
        xKey: 'x',
        yKey: 'y',
        stroke: '#667eea',
        strokeWidth: 3
    }],
    axes: [{
        type: 'time',
        position: 'bottom'
    }, {
        type: 'number',
        position: 'left'
    }]
};
</script>
```

### Event Handling

```javascript
chart.addEventListener('chart-created', (e) => {
    console.log('Chart ready:', e.detail.chart);
});

chart.addEventListener('chart-updated', (e) => {
    console.log('Chart updated:', e.detail.chart);
});

chart.addEventListener('chart-error', (e) => {
    console.error('Chart error:', e.detail.error);
});
```

### Export Charts

```javascript
// Export as PNG
chart.exportToPNG('my-chart.png');

// Export as SVG
chart.exportToSVG('my-chart.svg');
```

### On-premise Usage

For environments without internet access, set a local library URL:

```html
<ag-donut-chart 
    library-url="./path/to/ag-charts-community.js"
    title="Local Chart">
</ag-donut-chart>
```

Or better yet, use the bundled version which includes everything.

## API Reference

### Attributes

| Attribute | Description | Example |
|-----------|-------------|---------|
| `title` | Chart title | `title="Sales Report"` |
| `width` | Chart width | `width="500px"` |
| `height` | Chart height | `height="300px"` |
| `library-url` | Custom library URL | `library-url="./ag-charts.js"` |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `data` | Array | Chart data |
| `config` | Object | AG Charts configuration |
| `libraryUrl` | String | Library URL |

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `exportToPNG(filename)` | Export chart as PNG | Boolean |
| `exportToSVG(filename)` | Export chart as SVG | Boolean |
| `updateData(newData)` | Update chart data | Void |
| `getChartData()` | Get current data | Array |

### Events

| Event | Description | Detail |
|-------|-------------|--------|
| `chart-created` | Chart initialized | `{ chart }` |
| `chart-updated` | Chart data updated | `{ chart }` |
| `chart-error` | Chart error occurred | `{ error }` |

## Data Formats

### Pie/Donut Charts
```javascript
[
    { label: 'Category A', value: 30 },
    { label: 'Category B', value: 70 }
]
```

### Line/Area Charts
```javascript
[
    { x: new Date('2024-01'), y: 100 },
    { x: new Date('2024-02'), y: 150 }
]
```

### Bar/Column Charts
```javascript
[
    { category: 'Product A', value: 100 },
    { category: 'Product B', value: 150 }
]
```

### Scatter Charts
```javascript
[
    { x: 10, y: 20 },
    { x: 30, y: 40 }
]
```

### Bubble Charts
```javascript
[
    { x: 10, y: 20, size: 5 },
    { x: 30, y: 40, size: 10 }
]
```

## Browser Support

- Chrome 54+
- Firefox 63+
- Safari 10.1+
- Edge 79+

## License

MIT License - Components are free to use
AG Charts Community is also MIT licensed

## Gallery

View `full-gallery.html` for a complete showcase of all chart types with interactive examples.