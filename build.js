const fs = require('fs');
const path = require('path');

/**
 * Build script to create a self-contained bundle with AG Charts library
 * This bundles the ag-charts-community library with our web components
 */

async function build() {
    console.log('🔨 Building self-contained AG Charts web components...');

    // Create dist directory if it doesn't exist
    const distDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir);
    }

    try {
        // Read the AG Charts library
        const agChartsPath = path.join(__dirname, 'node_modules', 'ag-charts-community', 'dist', 'umd', 'ag-charts-community.js');
        const agChartsContent = fs.readFileSync(agChartsPath, 'utf8');

        // Read our web components
        const componentsPath = path.join(__dirname, 'ag-charts-components.js');
        const componentsContent = fs.readFileSync(componentsPath, 'utf8');

        // Create the bundled content with GWT/Window compatibility
        const bundledContent = `
/**
 * AG Charts Web Components Bundle
 * Self-contained package with AG Charts Community library and web components
 * Generated: ${new Date().toISOString()}
 */

(function() {
    'use strict';
    
    // Detect global object (supports GWT $wnd and regular window)
    const globalObj = (function() {
        if (typeof $wnd !== 'undefined') return $wnd; // GWT environment
        if (typeof window !== 'undefined') return window; // Browser environment
        if (typeof global !== 'undefined') return global; // Node.js environment
        if (typeof globalThis !== 'undefined') return globalThis; // Modern fallback
        return {}; // Safe fallback object
    })();

    // AG Charts Community Library (v${getAgChartsVersion()})
    // Execute AG Charts with our detected global object
    ${agChartsContent.replace('(function (g, f)', '(function (g, f)').replace(/\}\(this,/, '}(globalObj,')}

    // Web Components
    ${componentsContent.replace(/this\._libraryUrl = 'https:\/\/cdn\.jsdelivr\.net\/npm\/ag-charts-community\/dist\/umd\/ag-charts-community\.js';/, 
        "// Library is already bundled - no need to load externally\n        this._libraryUrl = null;")
        .replace(/window\.agCharts/g, 'globalObj.agCharts')}

})();
`;

        // Write the bundle
        const bundlePath = path.join(distDir, 'ag-charts-components.bundle.js');
        fs.writeFileSync(bundlePath, bundledContent);

        // For now, just copy the full bundle as "minified" to avoid syntax issues
        // TODO: Implement proper minification with a real tool like terser
        const compressedContent = bundledContent;

        const minifiedPath = path.join(distDir, 'ag-charts-components.bundle.min.js');
        fs.writeFileSync(minifiedPath, compressedContent);

        // Update the base class to handle bundled library
        const updatedComponentsContent = componentsContent.replace(
            'async loadAgCharts() {',
            `async loadAgCharts() {
        // Check if library is already bundled
        if (this._libraryUrl === null) {
            this.agChartsLoaded = true;
            return Promise.resolve();
        }`
        );

        // Create standalone components file with bundled library detection
        const standalonePath = path.join(distDir, 'ag-charts-components.standalone.js');
        fs.writeFileSync(standalonePath, updatedComponentsContent);

        console.log('✅ Build completed successfully!');
        console.log(`📦 Bundle: ${bundlePath} (${getFileSize(bundlePath)})`);
        console.log(`🗜️  Minified: ${minifiedPath} (${getFileSize(minifiedPath)})`);
        console.log(`📁 Standalone: ${standalonePath} (${getFileSize(standalonePath)})`);

    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

function getAgChartsVersion() {
    try {
        const packageJsonPath = path.join(__dirname, 'node_modules', 'ag-charts-community', 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        return packageJson.version;
    } catch (error) {
        return 'unknown';
    }
}

function getFileSize(filePath) {
    const stats = fs.statSync(filePath);
    const sizeInBytes = stats.size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    const sizeInMB = (sizeInKB / 1024).toFixed(2);
    
    if (sizeInMB >= 1) {
        return `${sizeInMB} MB`;
    } else {
        return `${sizeInKB} KB`;
    }
}

// Run the build
build();