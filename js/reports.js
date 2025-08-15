window.reportsModule = {
    load() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-800">Sistema de Reportes</h1>
                <p class="text-gray-600">Genera y consulta reportes detallados del sistema</p>
            </div>

            <!-- Report Types -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold">Reportes Operacionales</h3>
                        <i class="fas fa-truck text-2xl text-blue-600"></i>
                    </div>
                    <div class="space-y-2">
                        <button onclick="reportsModule.generateReport('daily-collection')" 
                                class="w-full text-left py-2 px-3 hover:bg-gray-50 rounded border">
                            <i class="fas fa-calendar-day mr-2"></i>Recolección Diaria
                        </button>
                        <button onclick="reportsModule.generateReport('routes-performance')" 
                                class="w-full text-left py-2 px-3 hover:bg-gray-50 rounded border">
                            <i class="fas fa-route mr-2"></i>Rendimiento de Rutas
                        </button>
                        <button onclick="reportsModule.generateReport('vehicle-usage')" 
                                class="w-full text-left py-2 px-3 hover:bg-gray-50 rounded border">
                            <i class="fas fa-truck mr-2"></i>Uso de Vehículos
                        </button>
                        <button onclick="reportsModule.generateReport('manifests-summary')" 
                                class="w-full text-left py-2 px-3 hover:bg-gray-50 rounded border">
                            <i class="fas fa-file-alt mr-2"></i>Resumen de Manifiestos
                        </button>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold">Reportes de Planta</h3>
                        <i class="fas fa-industry text-2xl text-green-600"></i>
                    </div>
                    <div class="space-y-2">
                        <button onclick="reportsModule.generateReport('plant-capacity')" 
                                class="w-full text-left py-2 px-3 hover:bg-gray-50 rounded border">
                            <i class="fas fa-tachometer-alt mr-2"></i>Capacidad de Planta
                        </button>
                        <button onclick="reportsModule.generateReport('waste-classification')" 
                                class="w-full text-left py-2 px-3 hover:bg-gray-50 rounded border">
                            <i class="fas fa-sort-amount-down mr-2"></i>Clasificación de Residuos
                        </button>
                        <button onclick="reportsModule.generateReport('processing-efficiency')" 
                                class="w-full text-left py-2 px-3 hover:bg-gray-50 rounded border">
                            <i class="fas fa-chart-line mr-2"></i>Eficiencia de Procesamiento
                        </button>
                        <button onclick="reportsModule.generateReport('disposal-tracking')" 
                                class="w-full text-left py-2 px-3 hover:bg-gray-50 rounded border">
                            <i class="fas fa-trash-alt mr-2"></i>Seguimiento de Disposición
                        </button>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold">Reportes Administrativos</h3>
                        <i class="fas fa-chart-bar text-2xl text-purple-600"></i>
                    </div>
                    <div class="space-y-2">
                        <button onclick="reportsModule.generateReport('client-services')" 
                                class="w-full text-left py-2 px-3 hover:bg-gray-50 rounded border">
                            <i class="fas fa-users mr-2"></i>Servicios por Cliente
                        </button>
                        <button onclick="reportsModule.generateReport('financial-summary')" 
                                class="w-full text-left py-2 px-3 hover:bg-gray-50 rounded border">
                            <i class="fas fa-dollar-sign mr-2"></i>Resumen Financiero
                        </button>
                        <button onclick="reportsModule.generateReport('environmental-impact')" 
                                class="w-full text-left py-2 px-3 hover:bg-gray-50 rounded border">
                            <i class="fas fa-leaf mr-2"></i>Impacto Ambiental
                        </button>
                        <button onclick="reportsModule.generateReport('compliance-report')" 
                                class="w-full text-left py-2 px-3 hover:bg-gray-50 rounded border">
                            <i class="fas fa-clipboard-check mr-2"></i>Cumplimiento Normativo
                        </button>
                    </div>
                </div>
            </div>

            <!-- Custom Report Generator -->
            <div class="bg-white rounded-lg shadow mb-6">
                <div class="p-6 border-b">
                    <h3 class="text-lg font-semibold">Generador de Reportes Personalizados</h3>
                </div>
                <div class="p-6">
                    <form id="custom-report-form" class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Reporte</label>
                                <select id="report-type" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                    <option value="">Seleccionar tipo</option>
                                    <option value="operational">Operacional</option>
                                    <option value="environmental">Ambiental</option>
                                    <option value="financial">Financiero</option>
                                    <option value="compliance">Cumplimiento</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
                                <input type="date" id="date-from" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
                                <input type="date" id="date-to" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Filtros</label>
                                <div class="space-y-2">
                                    <label class="flex items-center">
                                        <input type="checkbox" class="mr-2" value="routes">
                                        <span class="text-sm">Incluir datos de rutas</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" class="mr-2" value="clients">
                                        <span class="text-sm">Incluir información de clientes</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" class="mr-2" value="waste-types">
                                        <span class="text-sm">Desglosar por tipo de residuo</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" class="mr-2" value="weights">
                                        <span class="text-sm">Incluir pesos y volúmenes</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Formato de Salida</label>
                                <div class="space-y-2">
                                    <label class="flex items-center">
                                        <input type="radio" name="output-format" value="pdf" class="mr-2" checked>
                                        <span class="text-sm">PDF</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="radio" name="output-format" value="excel" class="mr-2">
                                        <span class="text-sm">Excel</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="radio" name="output-format" value="csv" class="mr-2">
                                        <span class="text-sm">CSV</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-end space-x-4 pt-4 border-t">
                            <button type="button" onclick="reportsModule.previewReport()" 
                                    class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                <i class="fas fa-eye mr-2"></i>Vista Previa
                            </button>
                            <button type="submit" 
                                    class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                <i class="fas fa-download mr-2"></i>Generar Reporte
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Recent Reports -->
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b">
                    <h3 class="text-lg font-semibold">Reportes Recientes</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generado</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Formato</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap font-medium">Reporte Mensual Enero 2024</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Operacional</span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">01/01/2024 - 31/01/2024</td>
                                <td class="px-6 py-4 whitespace-nowrap">15 Ene 2024, 10:30</td>
                                <td class="px-6 py-4 whitespace-nowrap">PDF</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div class="flex space-x-2">
                                        <button class="text-blue-600 hover:text-blue-900" title="Descargar">
                                            <i class="fas fa-download"></i>
                                        </button>
                                        <button class="text-green-600 hover:text-green-900" title="Ver">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="text-red-600 hover:text-red-900" title="Eliminar">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap font-medium">Impacto Ambiental Q4 2023</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Ambiental</span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">01/10/2023 - 31/12/2023</td>
                                <td class="px-6 py-4 whitespace-nowrap">10 Ene 2024, 14:15</td>
                                <td class="px-6 py-4 whitespace-nowrap">Excel</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div class="flex space-x-2">
                                        <button class="text-blue-600 hover:text-blue-900" title="Descargar">
                                            <i class="fas fa-download"></i>
                                        </button>
                                        <button class="text-green-600 hover:text-green-900" title="Ver">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="text-red-600 hover:text-red-900" title="Eliminar">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.initCustomReportForm();
    },

    initCustomReportForm() {
        const form = document.getElementById('custom-report-form');
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 0);

        // Set default date range to last month
        document.getElementById('date-from').value = lastMonth.toISOString().split('T')[0];
        document.getElementById('date-to').value = lastDayOfMonth.toISOString().split('T')[0];

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateCustomReport();
        });
    },

    generateReport(reportType) {
        authSystem.showNotification('Generando reporte...', 'info');
        
        // Simulate report generation time
        setTimeout(() => {
            const reportName = this.getReportName(reportType);
            authSystem.showNotification(`Reporte "${reportName}" generado exitosamente`, 'success');
            
            // Simulate download
            setTimeout(() => {
                authSystem.showNotification('Descarga iniciada', 'info');
            }, 500);
        }, 2000);
    },

    generateCustomReport() {
        const reportType = document.getElementById('report-type').value;
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;
        const outputFormat = document.querySelector('input[name="output-format"]:checked').value;

        if (!reportType || !dateFrom || !dateTo) {
            authSystem.showNotification('Por favor completa todos los campos requeridos', 'error');
            return;
        }

        // Get selected filters
        const filters = [];
        document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            filters.push(checkbox.value);
        });

        authSystem.showNotification(`Generando reporte personalizado en formato ${outputFormat.toUpperCase()}...`, 'info');
        
        setTimeout(() => {
            authSystem.showNotification('Reporte personalizado generado exitosamente', 'success');
            setTimeout(() => {
                authSystem.showNotification('Descarga iniciada', 'info');
            }, 500);
        }, 3000);
    },

    previewReport() {
        const reportType = document.getElementById('report-type').value;
        
        if (!reportType) {
            authSystem.showNotification('Selecciona un tipo de reporte para la vista previa', 'error');
            return;
        }

        // Create preview modal
        const modalHtml = `
            <div id="report-preview-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-screen overflow-y-auto">
                    <div class="p-6 border-b">
                        <div class="flex justify-between items-center">
                            <h2 class="text-2xl font-bold">Vista Previa del Reporte</h2>
                            <button onclick="document.getElementById('report-preview-modal').remove()" 
                                    class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold mb-2">Resumen del Reporte</h3>
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div><strong>Tipo:</strong> ${this.getReportTypeName(reportType)}</div>
                                <div><strong>Período:</strong> ${document.getElementById('date-from').value} - ${document.getElementById('date-to').value}</div>
                                <div><strong>Formato:</strong> ${document.querySelector('input[name="output-format"]:checked').value.toUpperCase()}</div>
                                <div><strong>Páginas estimadas:</strong> 15-20</div>
                            </div>
                        </div>
                        
                        <div class="bg-gray-100 p-6 rounded-lg">
                            <h4 class="font-semibold mb-4">Contenido del Reporte</h4>
                            <div class="space-y-2 text-sm">
                                <div>📊 Resumen ejecutivo</div>
                                <div>📈 Gráficos y estadísticas principales</div>
                                <div>📋 Datos detallados por período</div>
                                <div>📍 Análisis por ubicación</div>
                                <div>💡 Conclusiones y recomendaciones</div>
                                <div>📄 Anexos con datos complementarios</div>
                            </div>
                        </div>
                        
                        <div class="mt-6 flex justify-end space-x-2">
                            <button onclick="document.getElementById('report-preview-modal').remove()" 
                                    class="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
                                Cerrar
                            </button>
                            <button onclick="reportsModule.generateCustomReport(); document.getElementById('report-preview-modal').remove();" 
                                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                Generar Reporte
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    getReportName(reportType) {
        const names = {
            'daily-collection': 'Recolección Diaria',
            'routes-performance': 'Rendimiento de Rutas',
            'vehicle-usage': 'Uso de Vehículos',
            'manifests-summary': 'Resumen de Manifiestos',
            'plant-capacity': 'Capacidad de Planta',
            'waste-classification': 'Clasificación de Residuos',
            'processing-efficiency': 'Eficiencia de Procesamiento',
            'disposal-tracking': 'Seguimiento de Disposición',
            'client-services': 'Servicios por Cliente',
            'financial-summary': 'Resumen Financiero',
            'environmental-impact': 'Impacto Ambiental',
            'compliance-report': 'Cumplimiento Normativo'
        };
        return names[reportType] || 'Reporte Personalizado';
    },

    getReportTypeName(type) {
        const types = {
            'operational': 'Operacional',
            'environmental': 'Ambiental',
            'financial': 'Financiero',
            'compliance': 'Cumplimiento'
        };
        return types[type] || 'Personalizado';
    }
};