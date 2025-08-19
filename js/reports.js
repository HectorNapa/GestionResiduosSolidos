window.reportsModule = {
    recentReports: [],

    load() {
        const currentUser = app?.currentUser;
        
        // Detectar si el usuario actual es operador
        if (currentUser && currentUser.type === 'operator') {
            this.loadOperatorView();
            return;
        }
        
        // Vista administrativa (original)
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

    // Vista específica para operadores
    loadOperatorView() {
        const contentArea = document.getElementById('content-area');
        const currentUser = app?.currentUser;
        
        contentArea.innerHTML = `
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-800">Reportes de Campo</h1>
                <p class="text-gray-600">Genera informes de recolección y actividades de campo</p>
            </div>

            <!-- Estado del operador y estadísticas rápidas -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                            <i class="fas fa-clipboard-list text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">Servicios Hoy</h3>
                            <p class="text-2xl font-bold text-gray-900">${this.getOperatorTodayServices(currentUser)}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-green-100 text-green-600">
                            <i class="fas fa-check-circle text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">Completados</h3>
                            <p class="text-2xl font-bold text-gray-900">${this.getOperatorCompletedServices(currentUser)}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-orange-100 text-orange-600">
                            <i class="fas fa-truck text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">En Proceso</h3>
                            <p class="text-2xl font-bold text-gray-900">${this.getOperatorActiveServices(currentUser)}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-purple-100 text-purple-600">
                            <i class="fas fa-weight-hanging text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">Volumen Hoy</h3>
                            <p class="text-2xl font-bold text-gray-900">${this.getOperatorTodayVolume(currentUser)} m³</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Filtros de fecha para operador -->
            <div class="bg-white rounded-lg shadow p-6 mb-6">
                <h3 class="text-lg font-semibold mb-4">Período de Reporte</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label for="operator-date-from" class="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                        <input type="date" id="operator-date-from" class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label for="operator-date-to" class="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                        <input type="date" id="operator-date-to" class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div class="flex items-end">
                        <button onclick="reportsModule.updateOperatorStats()" class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-sync mr-2"></i>Actualizar
                        </button>
                    </div>
                </div>
            </div>

            <!-- Reportes disponibles para operador -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Reportes de Recolección</h3>
                    <div class="space-y-3">
                        <button onclick="reportsModule.generateOperatorReport('daily-summary')" 
                                class="w-full text-left py-3 px-4 hover:bg-gray-50 rounded border flex items-center">
                            <i class="fas fa-calendar-day mr-3 text-blue-600"></i>
                            <div>
                                <div class="font-medium">Resumen Diario</div>
                                <div class="text-sm text-gray-500">Servicios completados hoy</div>
                            </div>
                        </button>
                        <button onclick="reportsModule.generateOperatorReport('collection-detail')" 
                                class="w-full text-left py-3 px-4 hover:bg-gray-50 rounded border flex items-center">
                            <i class="fas fa-list-ul mr-3 text-green-600"></i>
                            <div>
                                <div class="font-medium">Detalle de Recolecciones</div>
                                <div class="text-sm text-gray-500">Listado completo con ubicaciones</div>
                            </div>
                        </button>
                        <button onclick="reportsModule.generateOperatorReport('route-efficiency')" 
                                class="w-full text-left py-3 px-4 hover:bg-gray-50 rounded border flex items-center">
                            <i class="fas fa-route mr-3 text-purple-600"></i>
                            <div>
                                <div class="font-medium">Eficiencia de Ruta</div>
                                <div class="text-sm text-gray-500">Tiempos y rendimiento</div>
                            </div>
                        </button>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Reportes de Control</h3>
                    <div class="space-y-3">
                        <button onclick="reportsModule.generateOperatorReport('waste-types')" 
                                class="w-full text-left py-3 px-4 hover:bg-gray-50 rounded border flex items-center">
                            <i class="fas fa-recycle mr-3 text-orange-600"></i>
                            <div>
                                <div class="font-medium">Tipos de Residuos</div>
                                <div class="text-sm text-gray-500">Clasificación recolectada</div>
                            </div>
                        </button>
                        <button onclick="reportsModule.generateOperatorReport('incidents')" 
                                class="w-full text-left py-3 px-4 hover:bg-gray-50 rounded border flex items-center">
                            <i class="fas fa-exclamation-triangle mr-3 text-red-600"></i>
                            <div>
                                <div class="font-medium">Incidentes Reportados</div>
                                <div class="text-sm text-gray-500">Problemas y observaciones</div>
                            </div>
                        </button>
                        <button onclick="reportsModule.generateOperatorReport('performance')" 
                                class="w-full text-left py-3 px-4 hover:bg-gray-50 rounded border flex items-center">
                            <i class="fas fa-chart-bar mr-3 text-indigo-600"></i>
                            <div>
                                <div class="font-medium">Rendimiento Personal</div>
                                <div class="text-sm text-gray-500">Estadísticas del operador</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Área de resultados del reporte -->
            <div id="operator-report-output" class="mb-6"></div>

            <!-- Reportes recientes del operador -->
            <div id="operator-recent-reports" class="bg-white rounded-lg shadow">
                ${this.renderOperatorRecentReports(currentUser)}
            </div>
        `;
        
        this.initOperatorDateFilters();
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

    // ========== FUNCIONES ESPECÍFICAS PARA OPERADORES ==========
    
    initOperatorDateFilters() {
        const dateFrom = document.getElementById('operator-date-from');
        const dateTo = document.getElementById('operator-date-to');
        const today = new Date();
        const yesterdayStr = new Date(today - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const todayStr = today.toISOString().slice(0, 10);
        
        dateFrom.value = yesterdayStr;
        dateTo.value = todayStr;
    },

    // Estadísticas para el operador
    getOperatorTodayServices(currentUser) {
        const today = new Date().toISOString().split('T')[0];
        const services = window.servicesModule?.services || [];
        
        return services.filter(service => 
            this.isOperatorService(service, currentUser) &&
            service.schedule?.collectionDate === today
        ).length;
    },

    getOperatorCompletedServices(currentUser) {
        const today = new Date().toISOString().split('T')[0];
        const services = window.servicesModule?.services || [];
        
        return services.filter(service => 
            this.isOperatorService(service, currentUser) &&
            service.schedule?.collectionDate === today &&
            service.status === 'Completado'
        ).length;
    },

    getOperatorActiveServices(currentUser) {
        const services = window.servicesModule?.services || [];
        const activeStatuses = ['En Ruta', 'En Proceso', 'Recolectado', 'En Tránsito'];
        
        return services.filter(service => 
            this.isOperatorService(service, currentUser) &&
            activeStatuses.includes(service.status)
        ).length;
    },

    getOperatorTodayVolume(currentUser) {
        const today = new Date().toISOString().split('T')[0];
        const services = window.servicesModule?.services || [];
        
        const todayServices = services.filter(service => 
            this.isOperatorService(service, currentUser) &&
            service.schedule?.collectionDate === today &&
            ['Completado', 'Recolectado', 'En Tránsito'].includes(service.status)
        );
        
        return todayServices.reduce((total, service) => {
            return total + parseFloat(service.estimatedVolume || 0);
        }, 0).toFixed(1);
    },

    isOperatorService(service, currentUser) {
        return service.assignedOperator === currentUser?.name ||
               service.operatorId === currentUser?.id ||
               service.createdBy === currentUser?.id;
    },

    updateOperatorStats() {
        const currentUser = app?.currentUser;
        if (currentUser && currentUser.type === 'operator') {
            this.loadOperatorView();
        }
    },

    // Generación de reportes para operadores
    generateOperatorReport(reportType) {
        const dateFrom = document.getElementById('operator-date-from')?.value || new Date().toISOString().split('T')[0];
        const dateTo = document.getElementById('operator-date-to')?.value || new Date().toISOString().split('T')[0];
        const config = { dateFrom, dateTo };
        const currentUser = app?.currentUser;

        let reportData;
        switch (reportType) {
            case 'daily-summary':
                reportData = this.getOperatorReport_DailySummary(config, currentUser);
                break;
            case 'collection-detail':
                reportData = this.getOperatorReport_CollectionDetail(config, currentUser);
                break;
            case 'route-efficiency':
                reportData = this.getOperatorReport_RouteEfficiency(config, currentUser);
                break;
            case 'waste-types':
                reportData = this.getOperatorReport_WasteTypes(config, currentUser);
                break;
            case 'incidents':
                reportData = this.getOperatorReport_Incidents(config, currentUser);
                break;
            case 'performance':
                reportData = this.getOperatorReport_Performance(config, currentUser);
                break;
            default:
                authSystem?.showNotification?.('Tipo de reporte no reconocido.', 'error');
                return;
        }

        this.renderOperatorReport(reportData, config);
        this.addOperatorRecentReport(reportData, currentUser);
    },

    // Renderizado de reportes de operador
    renderOperatorReport(reportData, config) {
        const outputContainer = document.getElementById('operator-report-output');
        outputContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b flex justify-between items-center">
                    <div>
                        <h3 class="text-xl font-semibold">${reportData.name}</h3>
                        <p class="text-sm text-gray-600">Período: ${this.formatDate(config.dateFrom)} - ${this.formatDate(config.dateTo)}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="reportsModule.printOperatorReport()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-print mr-2"></i>Imprimir
                        </button>
                        <button onclick="reportsModule.shareOperatorReport()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                            <i class="fas fa-share mr-2"></i>Compartir
                        </button>
                    </div>
                </div>
                <div class="p-6" id="operator-report-content">
                    ${reportData.content}
                </div>
            </div>
        `;
    },

    printOperatorReport() {
        const reportContent = document.getElementById('operator-report-content').innerHTML;
        const reportTitle = document.querySelector('#operator-report-output h3').textContent;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${reportTitle}</title>
                    <style>
                        body { font-family: sans-serif; margin: 20px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                        .summary-card { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
                        .text-center { text-align: center; }
                        .font-bold { font-weight: bold; }
                        .text-green-600 { color: #059669; }
                        .text-blue-600 { color: #2563eb; }
                        .text-red-600 { color: #dc2626; }
                        .text-orange-600 { color: #ea580c; }
                    </style>
                </head>
                <body>
                    <h1>${reportTitle}</h1>
                    <p><strong>Fecha de generación:</strong> ${new Date().toLocaleString('es-ES')}</p>
                    ${reportContent}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    },

    shareOperatorReport() {
        const reportTitle = document.querySelector('#operator-report-output h3').textContent;
        const reportUrl = window.location.href;
        
        if (navigator.share) {
            navigator.share({
                title: reportTitle,
                text: `Reporte generado en EcoGestión: ${reportTitle}`,
                url: reportUrl
            });
        } else {
            // Fallback para navegadores que no soportan Web Share API
            const shareText = `Reporte: ${reportTitle}\nGenerado: ${new Date().toLocaleString('es-ES')}\nEcoGestión - Sistema de Gestión de Residuos`;
            navigator.clipboard.writeText(shareText).then(() => {
                authSystem?.showNotification?.('Información del reporte copiada al portapapeles', 'success');
            });
        }
    },

    // Funciones de generación de reportes específicos
    getOperatorReport_DailySummary(config, currentUser) {
        const services = window.servicesModule?.services || [];
        const filteredServices = services.filter(service => 
            this.isOperatorService(service, currentUser) &&
            this.isServiceInDateRange(service, config.dateFrom, config.dateTo)
        );

        const completed = filteredServices.filter(s => s.status === 'Completado').length;
        const inProgress = filteredServices.filter(s => ['En Ruta', 'En Proceso', 'Recolectado', 'En Tránsito'].includes(s.status)).length;
        const totalVolume = filteredServices.reduce((sum, s) => sum + parseFloat(s.estimatedVolume || 0), 0);

        const content = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="summary-card text-center">
                    <h4 class="text-lg font-bold text-green-600">${completed}</h4>
                    <p class="text-gray-600">Servicios Completados</p>
                </div>
                <div class="summary-card text-center">
                    <h4 class="text-lg font-bold text-orange-600">${inProgress}</h4>
                    <p class="text-gray-600">En Proceso</p>
                </div>
                <div class="summary-card text-center">
                    <h4 class="text-lg font-bold text-blue-600">${totalVolume.toFixed(1)} m³</h4>
                    <p class="text-gray-600">Volumen Total</p>
                </div>
            </div>
            
            <h4 class="text-lg font-semibold mb-3">Detalle por Estado</h4>
            <table class="min-w-full text-sm">
                <thead>
                    <tr><th>ID</th><th>Cliente</th><th>Tipo Residuo</th><th>Volumen</th><th>Estado</th><th>Hora</th></tr>
                </thead>
                <tbody>
                    ${filteredServices.map(service => `
                        <tr>
                            <td>#${String(service.id).padStart(3, '0')}</td>
                            <td>${service.clientName}</td>
                            <td>${service.wasteType}</td>
                            <td>${service.estimatedVolume} ${service.volumeUnit}</td>
                            <td><span class="px-2 py-1 rounded text-xs ${this.getStatusBadgeClass(service.status)}">${service.status}</span></td>
                            <td>${service.schedule?.collectionTime || 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        return { name: 'Resumen Diario de Actividades', content, config };
    },

    getOperatorReport_CollectionDetail(config, currentUser) {
        const services = window.servicesModule?.services || [];
        const filteredServices = services.filter(service => 
            this.isOperatorService(service, currentUser) &&
            this.isServiceInDateRange(service, config.dateFrom, config.dateTo) &&
            ['Completado', 'Recolectado', 'En Tránsito'].includes(service.status)
        );

        const content = `
            <p class="mb-4 text-gray-600">Total de recolecciones: <strong>${filteredServices.length}</strong></p>
            
            <table class="min-w-full text-sm">
                <thead>
                    <tr>
                        <th>ID</th><th>Cliente</th><th>Dirección</th><th>Tipo</th><th>Volumen</th><th>Fecha</th><th>Estado</th><th>Observaciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredServices.map(service => `
                        <tr>
                            <td>#${String(service.id).padStart(3, '0')}</td>
                            <td>${service.clientName}</td>
                            <td>${service.address}</td>
                            <td>${service.wasteType}</td>
                            <td>${service.estimatedVolume} ${service.volumeUnit}</td>
                            <td>${this.formatDate(service.schedule?.collectionDate)}</td>
                            <td><span class="px-2 py-1 rounded text-xs ${this.getStatusBadgeClass(service.status)}">${service.status}</span></td>
                            <td>${service.accessNotes || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        return { name: 'Detalle de Recolecciones', content, config };
    },

    getOperatorReport_RouteEfficiency(config, currentUser) {
        const routes = window.routesModule?.routes || [];
        const operatorRoutes = routes.filter(route => 
            route.assignedOperator === currentUser?.name &&
            this.isDateInRange(route.date, config.dateFrom, config.dateTo)
        );

        const totalRoutes = operatorRoutes.length;
        const completedRoutes = operatorRoutes.filter(r => r.status === 'Completada').length;
        const efficiency = totalRoutes > 0 ? ((completedRoutes / totalRoutes) * 100).toFixed(1) : 0;

        const content = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="summary-card text-center">
                    <h4 class="text-lg font-bold text-blue-600">${totalRoutes}</h4>
                    <p class="text-gray-600">Rutas Asignadas</p>
                </div>
                <div class="summary-card text-center">
                    <h4 class="text-lg font-bold text-green-600">${completedRoutes}</h4>
                    <p class="text-gray-600">Rutas Completadas</p>
                </div>
                <div class="summary-card text-center">
                    <h4 class="text-lg font-bold text-purple-600">${efficiency}%</h4>
                    <p class="text-gray-600">Eficiencia</p>
                </div>
            </div>
            
            <h4 class="text-lg font-semibold mb-3">Detalle de Rutas</h4>
            <table class="min-w-full text-sm">
                <thead>
                    <tr><th>Ruta</th><th>Fecha</th><th>Puntos</th><th>Estado</th><th>Inicio</th><th>Fin</th><th>Duración</th></tr>
                </thead>
                <tbody>
                    ${operatorRoutes.map(route => `
                        <tr>
                            <td>${route.name}</td>
                            <td>${this.formatDate(route.date)}</td>
                            <td>${route.collectionPoints?.length || 0}</td>
                            <td><span class="px-2 py-1 rounded text-xs ${this.getRouteBadgeClass(route.status)}">${route.status}</span></td>
                            <td>${route.startTime || '-'}</td>
                            <td>${route.endTime || '-'}</td>
                            <td>${this.calculateRouteDuration(route.startTime, route.endTime)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        return { name: 'Eficiencia de Rutas', content, config };
    },

    getOperatorReport_WasteTypes(config, currentUser) {
        const services = window.servicesModule?.services || [];
        const filteredServices = services.filter(service => 
            this.isOperatorService(service, currentUser) &&
            this.isServiceInDateRange(service, config.dateFrom, config.dateTo) &&
            ['Completado', 'Recolectado', 'En Tránsito'].includes(service.status)
        );

        const wasteTypeSummary = {};
        filteredServices.forEach(service => {
            const type = service.wasteType;
            if (!wasteTypeSummary[type]) {
                wasteTypeSummary[type] = { count: 0, volume: 0 };
            }
            wasteTypeSummary[type].count++;
            wasteTypeSummary[type].volume += parseFloat(service.estimatedVolume || 0);
        });

        const content = `
            <p class="mb-4 text-gray-600">Clasificación de residuos recolectados en el período</p>
            
            <table class="min-w-full text-sm">
                <thead>
                    <tr><th>Tipo de Residuo</th><th>Cantidad de Servicios</th><th>Volumen Total (m³)</th><th>Porcentaje</th></tr>
                </thead>
                <tbody>
                    ${Object.entries(wasteTypeSummary).map(([type, data]) => {
                        const percentage = ((data.count / filteredServices.length) * 100).toFixed(1);
                        return `
                            <tr>
                                <td><span class="px-2 py-1 rounded text-xs ${this.getWasteTypeBadgeClass(type)}">${type}</span></td>
                                <td>${data.count}</td>
                                <td>${data.volume.toFixed(2)}</td>
                                <td>${percentage}%</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;

        return { name: 'Clasificación de Tipos de Residuos', content, config };
    },

    getOperatorReport_Incidents(config, currentUser) {
        // Mock data - en implementación real se obtendría de una base de datos de incidentes
        const incidents = [
            {
                id: 1,
                date: config.dateFrom,
                type: 'Acceso Denegado',
                location: 'Av. Siempreviva 742',
                description: 'Cliente no disponible para recolección',
                severity: 'Media',
                resolution: 'Reprogramado para día siguiente'
            },
            {
                id: 2,
                date: config.dateTo,
                type: 'Volumen Excedido',
                location: 'Calle 26 #47-15',
                description: 'Volumen real mayor al estimado',
                severity: 'Baja',
                resolution: 'Cobro adicional aplicado'
            }
        ];

        const content = `
            <p class="mb-4 text-gray-600">Total de incidentes reportados: <strong>${incidents.length}</strong></p>
            
            <table class="min-w-full text-sm">
                <thead>
                    <tr><th>ID</th><th>Fecha</th><th>Tipo</th><th>Ubicación</th><th>Descripción</th><th>Severidad</th><th>Resolución</th></tr>
                </thead>
                <tbody>
                    ${incidents.map(incident => `
                        <tr>
                            <td>#${String(incident.id).padStart(3, '0')}</td>
                            <td>${this.formatDate(incident.date)}</td>
                            <td>${incident.type}</td>
                            <td>${incident.location}</td>
                            <td>${incident.description}</td>
                            <td><span class="px-2 py-1 rounded text-xs ${this.getSeverityBadgeClass(incident.severity)}">${incident.severity}</span></td>
                            <td>${incident.resolution}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        return { name: 'Reporte de Incidentes', content, config };
    },

    getOperatorReport_Performance(config, currentUser) {
        const services = window.servicesModule?.services || [];
        const operatorServices = services.filter(service => this.isOperatorService(service, currentUser));
        
        const totalServices = operatorServices.length;
        const completedServices = operatorServices.filter(s => s.status === 'Completado').length;
        const completionRate = totalServices > 0 ? ((completedServices / totalServices) * 100).toFixed(1) : 0;
        const totalVolume = operatorServices.reduce((sum, s) => sum + parseFloat(s.estimatedVolume || 0), 0);

        const content = `
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div class="summary-card text-center">
                    <h4 class="text-lg font-bold text-blue-600">${totalServices}</h4>
                    <p class="text-gray-600">Servicios Totales</p>
                </div>
                <div class="summary-card text-center">
                    <h4 class="text-lg font-bold text-green-600">${completedServices}</h4>
                    <p class="text-gray-600">Completados</p>
                </div>
                <div class="summary-card text-center">
                    <h4 class="text-lg font-bold text-purple-600">${completionRate}%</h4>
                    <p class="text-gray-600">Tasa de Completado</p>
                </div>
                <div class="summary-card text-center">
                    <h4 class="text-lg font-bold text-orange-600">${totalVolume.toFixed(1)} m³</h4>
                    <p class="text-gray-600">Volumen Total</p>
                </div>
            </div>
            
            <h4 class="text-lg font-semibold mb-3">Análisis de Rendimiento</h4>
            <div class="space-y-4">
                <div class="bg-gray-50 p-4 rounded">
                    <h5 class="font-medium mb-2">Eficiencia por Tipo de Residuo</h5>
                    <p class="text-sm text-gray-600">Análisis detallado de rendimiento por categoría de residuos</p>
                </div>
                <div class="bg-gray-50 p-4 rounded">
                    <h5 class="font-medium mb-2">Tendencia Temporal</h5>
                    <p class="text-sm text-gray-600">Evolución del rendimiento en el período seleccionado</p>
                </div>
                <div class="bg-gray-50 p-4 rounded">
                    <h5 class="font-medium mb-2">Recomendaciones</h5>
                    <ul class="text-sm text-gray-600 list-disc list-inside">
                        <li>Mantener la alta tasa de completado actual</li>
                        <li>Optimizar rutas para reducir tiempos de traslado</li>
                        <li>Continuar registrando incidentes para mejora continua</li>
                    </ul>
                </div>
            </div>
        `;

        return { name: 'Análisis de Rendimiento Personal', content, config };
    },

    // Funciones de utilidad para operadores
    renderOperatorRecentReports(currentUser) {
        const operatorReports = this.recentReports.filter(report => 
            report.operatorId === currentUser?.id
        );
        
        let content = '<div class="p-6 border-b"><h3 class="text-lg font-semibold">Mis Reportes Recientes</h3></div>';
        
        if (operatorReports.length === 0) {
            content += '<div class="p-6 text-center text-gray-500">No tienes reportes generados recientemente.</div>';
        } else {
            content += `<div class="overflow-x-auto"><table class="min-w-full">
                <thead class="bg-gray-50"><tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reporte</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr></thead>
                <tbody class="divide-y divide-gray-200">
                ${operatorReports.map((report, index) => `
                    <tr>
                        <td class="px-6 py-4">${report.name}</td>
                        <td class="px-6 py-4">${new Date(report.generatedAt).toLocaleString('es-ES')}</td>
                        <td class="px-6 py-4">
                            <button onclick="reportsModule.viewRecentReport(${index})" class="text-blue-600 hover:text-blue-900 mr-3">Ver</button>
                            <button onclick="reportsModule.printOperatorReport()" class="text-green-600 hover:text-green-900">Imprimir</button>
                        </td>
                    </tr>
                `).join('')}
                </tbody></table></div>`;
        }
        return content;
    },

    addOperatorRecentReport(reportData, currentUser) {
        const operatorReport = {
            ...reportData,
            operatorId: currentUser?.id,
            operatorName: currentUser?.name,
            generatedAt: new Date().toISOString()
        };
        
        this.recentReports.unshift(operatorReport);
        if (this.recentReports.length > 10) this.recentReports.pop();
        
        // Actualizar la vista de reportes recientes si existe
        const recentContainer = document.getElementById('operator-recent-reports');
        if (recentContainer) {
            recentContainer.innerHTML = this.renderOperatorRecentReports(currentUser);
        }
    },

    // Funciones de utilidad para badges y estilos
    getStatusBadgeClass(status) {
        const classes = {
            'Programado': 'bg-blue-100 text-blue-800',
            'En Ruta': 'bg-cyan-100 text-cyan-800',
            'En Proceso': 'bg-orange-100 text-orange-800',
            'Recolectado': 'bg-purple-100 text-purple-800',
            'En Tránsito': 'bg-indigo-100 text-indigo-800',
            'Completado': 'bg-green-100 text-green-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    },

    getRouteBadgeClass(status) {
        const classes = {
            'Pendiente': 'bg-yellow-100 text-yellow-800',
            'En Curso': 'bg-blue-100 text-blue-800',
            'Completada': 'bg-green-100 text-green-800',
            'Pausada': 'bg-orange-100 text-orange-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    },

    getWasteTypeBadgeClass(type) {
        const classes = {
            'Orgánico': 'bg-green-100 text-green-800',
            'Reciclable': 'bg-blue-100 text-blue-800',
            'Peligroso': 'bg-red-100 text-red-800',
            'Industrial': 'bg-purple-100 text-purple-800'
        };
        return classes[type] || 'bg-gray-100 text-gray-800';
    },

    getSeverityBadgeClass(severity) {
        const classes = {
            'Baja': 'bg-green-100 text-green-800',
            'Media': 'bg-yellow-100 text-yellow-800',
            'Alta': 'bg-red-100 text-red-800'
        };
        return classes[severity] || 'bg-gray-100 text-gray-800';
    },

    isServiceInDateRange(service, dateFrom, dateTo) {
        const serviceDate = service.schedule?.collectionDate || service.createdDate;
        return serviceDate >= dateFrom && serviceDate <= dateTo;
    },

    isDateInRange(date, dateFrom, dateTo) {
        return date >= dateFrom && date <= dateTo;
    },

    calculateRouteDuration(startTime, endTime) {
        if (!startTime || !endTime) return '-';
        
        const start = new Date(`2000-01-01 ${startTime}`);
        const end = new Date(`2000-01-01 ${endTime}`);
        const diffMs = end - start;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${diffHours}h ${diffMinutes}m`;
    },

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString);
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        return date.toLocaleDateString('es-ES', options);
    }
};