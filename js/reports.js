window.reportsModule = {
    recentReports: [],

    load() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-800">Sistema de Reportes</h1>
                <p class="text-gray-600">Genera y consulta reportes detallados del sistema</p>
            </div>

            <div class="bg-white rounded-lg shadow p-6 mb-6">
                <h3 class="text-lg font-semibold mb-2">Filtros Globales</h3>
                <div class="flex items-center space-x-4">
                    <div>
                        <label for="date-from" class="block text-sm font-medium text-gray-700">Desde</label>
                        <input type="date" id="date-from" class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label for="date-to" class="block text-sm font-medium text-gray-700">Hasta</label>
                        <input type="date" id="date-to" class="w-full px-3 py-2 border rounded-lg">
                    </div>
                </div>
            </div>

            <!-- Pre-defined Reports -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                ${this.renderReportCategories()}
            </div>

            <!-- Report Output Area -->
            <div id="report-output" class="mb-6"></div>

            <!-- Recent Reports -->
            <div id="recent-reports-container" class="bg-white rounded-lg shadow">
                ${this.renderRecentReports()}
            </div>
        `;
        this.initDateFilters();
    },

    initDateFilters() {
        const dateFrom = document.getElementById('date-from');
        const dateTo = document.getElementById('date-to');
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
        const todayStr = today.toISOString().slice(0, 10);
        dateFrom.value = firstDayOfMonth;
        dateTo.value = todayStr;
    },

    renderReportCategories() {
        // Simplified for brevity. In a real scenario, this could be a loop.
        return `
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-4">Operacionales</h3>
                <button onclick="reportsModule.generateReport('routes-performance')" class="w-full text-left py-2 px-3 hover:bg-gray-50 rounded border"><i class="fas fa-route mr-2"></i>Rendimiento de Rutas</button>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-4">De Planta</h3>
                <button onclick="reportsModule.generateReport('waste-classification')" class="w-full text-left py-2 px-3 hover:bg-gray-50 rounded border"><i class="fas fa-sort-amount-down mr-2"></i>Clasificación de Residuos</button>
                <button onclick="reportsModule.generateReport('disposal-tracking')" class="w-full text-left py-2 px-3 hover:bg-gray-50 rounded border mt-2"><i class="fas fa-trash-alt mr-2"></i>Seguimiento de Disposición</button>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-4">Administrativos</h3>
                <button onclick="reportsModule.generateReport('client-services')" class="w-full text-left py-2 px-3 hover:bg-gray-50 rounded border"><i class="fas fa-users mr-2"></i>Servicios por Cliente</button>
            </div>
        `;
    },

    renderRecentReports() {
        let content = '<div class="p-6 border-b"><h3 class="text-lg font-semibold">Reportes Generados Recientemente</h3></div>';
        if (this.recentReports.length === 0) {
            content += '<div class="p-6 text-center text-gray-500">No se han generado reportes recientemente.</div>';
        } else {
            content += `<div class="overflow-x-auto"><table class="min-w-full">
                <thead class="bg-gray-50"><tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre del Reporte</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Generación</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr></thead>
                <tbody class="divide-y divide-gray-200">
                ${this.recentReports.map((report, index) => `
                    <tr>
                        <td class="px-6 py-4">${report.name}</td>
                        <td class="px-6 py-4">${new Date(report.generatedAt).toLocaleString('es-ES')}</td>
                        <td class="px-6 py-4"><button onclick="reportsModule.viewRecentReport(${index})" class="text-blue-600 hover:text-blue-900">Ver</button></td>
                    </tr>
                `).join('')}
                </tbody></table></div>`;
        }
        return content;
    },

    // --- REPORT GENERATION HUB ---
    generateReport(reportType) {
        const dateFrom = document.getElementById('date-from')?.value || '2000-01-01';
        const dateTo = document.getElementById('date-to')?.value || new Date().toISOString().slice(0, 10);
        const config = { dateFrom, dateTo };

        let reportData;
        switch (reportType) {
            case 'routes-performance':
                reportData = this.getReport_RoutesPerformance(config);
                break;
            case 'waste-classification':
                reportData = this.getReport_WasteClassification(config);
                break;
            case 'client-services':
                reportData = this.getReport_ClientServices(config);
                break;
            case 'disposal-tracking':
                reportData = this.getReport_DisposalTracking(config);
                break;
            default:
                authSystem.showNotification('Tipo de reporte no reconocido.', 'error');
                return;
        }

        this.renderReport(reportData, config);
        this.addRecentReport(reportData);
    },

    addRecentReport(reportData) {
        this.recentReports.unshift({ // Add to the beginning
            ...reportData,
            generatedAt: new Date().toISOString()
        });
        if (this.recentReports.length > 5) this.recentReports.pop(); // Keep only last 5
        document.getElementById('recent-reports-container').innerHTML = this.renderRecentReports();
    },

    viewRecentReport(index) {
        const reportData = this.recentReports[index];
        this.renderReport(reportData, reportData.config);
    },

    // --- REPORT RENDERING ---
    renderReport(reportData, config) {
        const outputContainer = document.getElementById('report-output');
        outputContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b flex justify-between items-center">
                    <div>
                        <h3 class="text-xl font-semibold">${reportData.name}</h3>
                        <p class="text-sm text-gray-600">Período: ${this.formatDate(config.dateFrom)} - ${this.formatDate(config.dateTo)}</p>
                    </div>
                    <button onclick="reportsModule.printReport()" class="bg-blue-600 text-white px-4 py-2 rounded-lg"><i class="fas fa-print mr-2"></i>Imprimir/Guardar</button>
                </div>
                <div class="p-6" id="report-content">
                    ${reportData.content}
                </div>
            </div>
        `;
    },

    printReport() {
        const reportContent = document.getElementById('report-content').innerHTML;
        const reportTitle = document.querySelector('#report-output h3').textContent;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`<html><head><title>${reportTitle}</title><style>body{font-family:sans-serif} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ddd;padding:8px} th{background-color:#f2f2f2} tfoot{font-weight:bold}</style></head><body><h1>${reportTitle}</h1>${reportContent}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
    },

    // --- REPORT DATA LOGIC ---
    filterByDate(data, dateFrom, dateTo) {
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999); // Include all of the end day
        return data.filter(item => {
            const itemDate = new Date(item.date || item.arrivalDate);
            return itemDate >= from && itemDate <= to;
        });
    },

    getReport_RoutesPerformance(config) { /* ... */ return { name: 'Rendimiento de Rutas', content: '' }; },
    getReport_WasteClassification(config) { /* ... */ return { name: 'Clasificación de Residuos en Planta', content: '' }; },
    getReport_ClientServices(config) { /* ... */ return { name: 'Servicios por Cliente', content: '' }; },

    getReport_DisposalTracking(config) {
        const disposals = this.filterByDate(window.disposalModule?.disposals || [], config.dateFrom, config.dateTo);
        let content;
        if (disposals.length === 0) {
            content = '<p>No hay datos de disposición final para el período seleccionado.</p>';
        } else {
            const totalWeight = disposals.reduce((sum, d) => sum + parseFloat(d.weight || 0), 0);
            const totalCost = disposals.reduce((sum, d) => sum + parseFloat(d.cost || 0), 0);
            content = `
                <table class="min-w-full text-sm">
                    <thead><tr><th>Lote</th><th>Fecha</th><th>Peso (Ton)</th><th>Método</th><th>Instalación</th><th>Costo</th></tr></thead>
                    <tbody>${disposals.map(d => `
                        <tr>
                            <td>${d.batchNumber}</td>
                            <td>${this.formatDate(d.date)}</td>
                            <td>${(d.weight || 0).toFixed(2)}</td>
                            <td>${d.disposalMethod}</td>
                            <td>${d.facility}</td>
                            <td>$${(d.cost || 0).toFixed(2)}</td>
                        </tr>`).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="font-bold border-t-2"><td colspan="2">Totales</td><td>${totalWeight.toFixed(2)}</td><td colspan="2"></td><td>$${totalCost.toFixed(2)}</td></tr>
                    </tfoot>
                </table>
            `;
        }
        return { name: 'Seguimiento de Disposición Final', content, config };
    },

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString);
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        return date.toLocaleDateString('es-ES', options);
    }
};