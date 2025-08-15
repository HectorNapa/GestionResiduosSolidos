window.disposalModule = {
    disposals: [
        {
            id: 1,
            batchNumber: 'D-2024-001',
            date: '2024-01-15',
            wasteType: 'No Reciclable',
            weight: '25.4',
            disposalMethod: 'Relleno Sanitario',
            facility: 'Relleno Municipal Norte',
            transportVehicle: 'T-001',
            status: 'Completado',
            operator: 'Luis Martínez',
            environmentalPermit: 'ENV-2024-RS-001',
            cost: '1250.00',
            notes: 'Disposición conforme a normativa ambiental'
        }
    ],

    disposalMethods: [
        {
            method: 'Relleno Sanitario',
            description: 'Disposición controlada en relleno sanitario autorizado',
            applicableWaste: ['No Reciclable', 'Residuos mixtos'],
            costPerTon: 50,
            environmentalImpact: 'Medio'
        },
        {
            method: 'Incineración',
            description: 'Incineración controlada con sistema de control de emisiones',
            applicableWaste: ['Peligroso', 'Médico', 'No Reciclable'],
            costPerTon: 120,
            environmentalImpact: 'Bajo (con control)'
        },
        {
            method: 'Tratamiento Especial',
            description: 'Tratamiento especializado para residuos peligrosos',
            applicableWaste: ['Peligroso', 'Químicos', 'Electrónicos'],
            costPerTon: 200,
            environmentalImpact: 'Muy Bajo'
        }
    ],

    load() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="mb-6">
                <div class="flex justify-between items-center">
                    <h1 class="text-3xl font-bold text-gray-800">Disposición Final</h1>
                    <button onclick="disposalModule.showDisposalModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                        <i class="fas fa-plus mr-2"></i>Nueva Disposición
                    </button>
                </div>
                <p class="text-gray-600">Gestiona la disposición final de residuos no reutilizables o reciclables</p>
            </div>

            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div class="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-red-100">Disposiciones Hoy</p>
                            <p class="text-3xl font-bold">3</p>
                        </div>
                        <i class="fas fa-trash-alt text-4xl text-red-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-orange-100">Peso Total</p>
                            <p class="text-3xl font-bold">45.8 <span class="text-lg">Ton</span></p>
                        </div>
                        <i class="fas fa-weight text-4xl text-orange-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-yellow-100">Costo Total</p>
                            <p class="text-3xl font-bold">$2,290</p>
                        </div>
                        <i class="fas fa-dollar-sign text-4xl text-yellow-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100">Cumplimiento</p>
                            <p class="text-3xl font-bold">100%</p>
                        </div>
                        <i class="fas fa-check-circle text-4xl text-green-200"></i>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Disposal Form -->
                <div class="lg:col-span-2 bg-white rounded-lg shadow">
                    <div class="p-6 border-b">
                        <h3 class="text-lg font-semibold">Registro de Disposición Final</h3>
                    </div>
                    <div class="p-6">
                        <form id="disposal-form" class="space-y-4">
                            <!-- Basic Information -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Residuo *</label>
                                    <select id="waste-type" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                        <option value="">Seleccionar tipo</option>
                                        <option value="no-reciclable">No Reciclable</option>
                                        <option value="peligroso">Peligroso</option>
                                        <option value="medico">Médico/Hospitalario</option>
                                        <option value="quimico">Químico</option>
                                        <option value="electronico">Electrónico</option>
                                        <option value="organico-contaminado">Orgánico Contaminado</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Peso Total (Ton) *</label>
                                    <input type="number" id="disposal-weight" required step="0.1" min="0" 
                                           class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                </div>
                            </div>

                            <!-- Disposal Method -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Método de Disposición *</label>
                                    <select id="disposal-method" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                        <option value="">Seleccionar método</option>
                                        <option value="relleno-sanitario">Relleno Sanitario Controlado</option>
                                        <option value="incineracion">Incineración Controlada</option>
                                        <option value="tratamiento-especial">Tratamiento Especial</option>
                                        <option value="encapsulado">Encapsulado</option>
                                        <option value="inertizacion">Inertización</option>
                                        <option value="sellado-seguro">Sellado Seguro</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Instalación de Destino *</label>
                                    <select id="disposal-facility" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                        <option value="">Seleccionar instalación</option>
                                        <option value="relleno-municipal-norte">Relleno Municipal Norte</option>
                                        <option value="relleno-municipal-sur">Relleno Municipal Sur</option>
                                        <option value="incineradora-central">Incineradora Central</option>
                                        <option value="planta-tratamiento-especial">Planta de Tratamiento Especial</option>
                                        <option value="centro-residuos-peligrosos">Centro de Residuos Peligrosos</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Transport and Date -->
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Disposición *</label>
                                    <input type="date" id="disposal-date" required 
                                           class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Vehículo de Transporte *</label>
                                    <select id="transport-vehicle" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                        <option value="">Seleccionar vehículo</option>
                                        <option value="T-001">T-001 - Camión Especializado</option>
                                        <option value="T-002">T-002 - Transporte Peligrosos</option>
                                        <option value="T-003">T-003 - Camión Sellado</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Costo Estimado</label>
                                    <input type="number" id="disposal-cost" step="0.01" min="0" 
                                           class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                           placeholder="Se calculará automáticamente" readonly>
                                </div>
                            </div>

                            <!-- Environmental Permits -->
                            <div class="border-t pt-4">
                                <h4 class="font-medium mb-3">Permisos y Documentación Ambiental</h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Número de Permiso Ambiental</label>
                                        <input type="text" id="environmental-permit" 
                                               class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                               placeholder="ENV-2024-XXX-XXX">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Autoridad Emisora</label>
                                        <select id="permit-authority" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                            <option value="">Seleccionar autoridad</option>
                                            <option value="ministerio-ambiente">Ministerio de Ambiente</option>
                                            <option value="secretaria-ambiente">Secretaría de Ambiente</option>
                                            <option value="corporacion-autonoma">Corporación Autónoma Regional</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- Safety Measures -->
                            <div class="border-t pt-4">
                                <h4 class="font-medium mb-3">Medidas de Seguridad</h4>
                                <div class="space-y-2">
                                    <label class="flex items-center">
                                        <input type="checkbox" class="mr-2" id="safety-equipment">
                                        <span class="text-sm">Equipo de protección personal verificado</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" class="mr-2" id="containment-verified">
                                        <span class="text-sm">Sistema de contención verificado</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" class="mr-2" id="route-approved">
                                        <span class="text-sm">Ruta de transporte aprobada</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" class="mr-2" id="emergency-plan">
                                        <span class="text-sm">Plan de contingencia activado</span>
                                    </label>
                                </div>
                            </div>

                            <!-- Documentation Upload -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Documentación de Soporte</label>
                                <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                    <i class="fas fa-file-upload text-3xl text-gray-400 mb-2"></i>
                                    <p class="text-gray-600">Permisos, certificados, análisis de laboratorio</p>
                                    <input type="file" id="disposal-documents" multiple accept=".pdf,.doc,.docx,.jpg,.png" class="hidden">
                                </div>
                            </div>

                            <!-- Notes -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones y Notas</label>
                                <textarea id="disposal-notes" rows="3" 
                                          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                          placeholder="Detalles adicionales sobre la disposición final..."></textarea>
                            </div>

                            <!-- Form Actions -->
                            <div class="flex justify-end space-x-4 pt-4 border-t">
                                <button type="button" onclick="disposalModule.generateCertificate()" 
                                        class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                    <i class="fas fa-certificate mr-2"></i>Generar Certificado
                                </button>
                                <button type="submit" 
                                        class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                                    <i class="fas fa-save mr-2"></i>Registrar Disposición
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Sidebar -->
                <div class="space-y-6">
                    <!-- Recent Disposals -->
                    <div class="bg-white rounded-lg shadow">
                        <div class="p-4 border-b">
                            <h3 class="font-semibold">Disposiciones Recientes</h3>
                        </div>
                        <div class="p-4 space-y-3">
                            ${this.disposals.map(disposal => `
                                <div class="border rounded-lg p-3">
                                    <div class="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 class="font-medium text-sm">${disposal.batchNumber}</h4>
                                            <p class="text-xs text-gray-600">${this.formatDate(disposal.date)}</p>
                                        </div>
                                        <span class="px-2 py-1 text-xs rounded-full ${this.getStatusClass(disposal.status)}">
                                            ${disposal.status}
                                        </span>
                                    </div>
                                    <div class="text-xs text-gray-600 space-y-1">
                                        <div>Tipo: ${disposal.wasteType}</div>
                                        <div>Peso: ${disposal.weight} Ton</div>
                                        <div>Método: ${disposal.disposalMethod}</div>
                                        <div>Costo: $${disposal.cost}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Disposal Methods Info -->
                    <div class="bg-white rounded-lg shadow">
                        <div class="p-4 border-b">
                            <h3 class="font-semibold">Métodos de Disposición</h3>
                        </div>
                        <div class="p-4 space-y-3">
                            ${this.disposalMethods.map(method => `
                                <div class="border-l-4 ${this.getMethodBorderClass(method.environmentalImpact)} pl-3">
                                    <h4 class="font-medium text-sm">${method.method}</h4>
                                    <p class="text-xs text-gray-600 mb-1">${method.description}</p>
                                    <div class="text-xs text-gray-500">
                                        <div>Costo: $${method.costPerTon}/Ton</div>
                                        <div>Impacto: ${method.environmentalImpact}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Environmental Alert -->
                    <div class="bg-white rounded-lg shadow">
                        <div class="p-4 border-b">
                            <h3 class="font-semibold">Cumplimiento Ambiental</h3>
                        </div>
                        <div class="p-4">
                            <div class="bg-green-50 border-l-4 border-green-400 p-3 text-sm">
                                <p class="text-green-700">✓ Todos los permisos vigentes</p>
                                <p class="text-green-700">✓ Cumplimiento normativo al día</p>
                                <p class="text-green-700">✓ Auditorías ambientales actualizadas</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Disposals Table -->
            <div class="mt-6 bg-white rounded-lg shadow">
                <div class="p-6 border-b">
                    <h3 class="text-lg font-semibold">Historial de Disposiciones</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lote</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo Residuo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peso</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instalación</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${this.disposals.map(disposal => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap font-medium">${disposal.batchNumber}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">${this.formatDate(disposal.date)}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 py-1 text-xs rounded-full ${this.getWasteTypeClass(disposal.wasteType)}">
                                            ${disposal.wasteType}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">${disposal.weight} Ton</td>
                                    <td class="px-6 py-4 whitespace-nowrap">${disposal.disposalMethod}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">${disposal.facility}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">$${disposal.cost}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 py-1 text-xs rounded-full ${this.getStatusClass(disposal.status)}">
                                            ${disposal.status}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div class="flex space-x-2">
                                            <button onclick="disposalModule.viewDisposal(${disposal.id})" 
                                                    class="text-blue-600 hover:text-blue-900" title="Ver detalles">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button onclick="disposalModule.downloadCertificate(${disposal.id})" 
                                                    class="text-green-600 hover:text-green-900" title="Certificado">
                                                <i class="fas fa-certificate"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.initDisposalForm();
    },

    initDisposalForm() {
        const form = document.getElementById('disposal-form');
        const today = new Date().toISOString().split('T')[0];
        
        document.getElementById('disposal-date').value = today;

        // Auto-calculate cost when weight and method change
        const weightInput = document.getElementById('disposal-weight');
        const methodSelect = document.getElementById('disposal-method');
        const costInput = document.getElementById('disposal-cost');

        const calculateCost = () => {
            const weight = parseFloat(weightInput.value) || 0;
            const method = methodSelect.value;
            
            const methodCosts = {
                'relleno-sanitario': 50,
                'incineracion': 120,
                'tratamiento-especial': 200,
                'encapsulado': 180,
                'inertizacion': 150,
                'sellado-seguro': 250
            };

            const costPerTon = methodCosts[method] || 0;
            const totalCost = weight * costPerTon;
            costInput.value = totalCost.toFixed(2);
        };

        weightInput.addEventListener('input', calculateCost);
        methodSelect.addEventListener('change', calculateCost);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveDisposal();
        });
    },

    saveDisposal() {
        const formData = {
            wasteType: document.getElementById('waste-type').value,
            weight: document.getElementById('disposal-weight').value,
            disposalMethod: document.getElementById('disposal-method').value,
            facility: document.getElementById('disposal-facility').value,
            date: document.getElementById('disposal-date').value,
            transportVehicle: document.getElementById('transport-vehicle').value,
            cost: document.getElementById('disposal-cost').value,
            environmentalPermit: document.getElementById('environmental-permit').value,
            permitAuthority: document.getElementById('permit-authority').value,
            notes: document.getElementById('disposal-notes').value
        };

        // Validate required fields
        if (!formData.wasteType || !formData.weight || !formData.disposalMethod || 
            !formData.facility || !formData.date || !formData.transportVehicle) {
            authSystem.showNotification('Por favor completa todos los campos requeridos', 'error');
            return;
        }

        // Validate safety measures
        const safetyChecks = [
            document.getElementById('safety-equipment').checked,
            document.getElementById('containment-verified').checked,
            document.getElementById('route-approved').checked,
            document.getElementById('emergency-plan').checked
        ];

        if (!safetyChecks.every(check => check)) {
            authSystem.showNotification('Todas las medidas de seguridad deben estar verificadas', 'error');
            return;
        }

        // Generate batch number
        const batchNumber = this.generateBatchNumber();

        const newDisposal = {
            id: this.disposals.length + 1,
            batchNumber,
            ...formData,
            status: 'Completado',
            operator: app.currentUser.name,
            processedAt: new Date().toISOString()
        };

        this.disposals.push(newDisposal);

        authSystem.showNotification('Disposición registrada exitosamente', 'success');
        
        // Reset form
        document.getElementById('disposal-form').reset();
        
        // Reload the page
        this.load();
    },

    generateBatchNumber() {
        const year = new Date().getFullYear();
        const count = this.disposals.length + 1;
        return `D-${year}-${count.toString().padStart(3, '0')}`;
    },

    generateCertificate() {
        authSystem.showNotification('Generando certificado de disposición...', 'info');
        setTimeout(() => {
            authSystem.showNotification('Certificado de disposición generado', 'success');
        }, 2000);
    },

    viewDisposal(id) {
        const disposal = this.disposals.find(d => d.id === id);
        if (!disposal) return;

        authSystem.showNotification('Función de visualización de disposición en desarrollo', 'info');
    },

    downloadCertificate(id) {
        authSystem.showNotification('Descargando certificado de disposición...', 'info');
        setTimeout(() => {
            authSystem.showNotification('Certificado descargado exitosamente', 'success');
        }, 1500);
    },

    showDisposalModal() {
        // Scroll to form
        document.getElementById('disposal-form').scrollIntoView({ behavior: 'smooth' });
        authSystem.showNotification('Complete el formulario para registrar una nueva disposición', 'info');
    },

    getStatusClass(status) {
        const classes = {
            'Completado': 'bg-green-100 text-green-800',
            'En Proceso': 'bg-yellow-100 text-yellow-800',
            'Programado': 'bg-blue-100 text-blue-800',
            'Cancelado': 'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    },

    getWasteTypeClass(type) {
        const classes = {
            'No Reciclable': 'bg-gray-100 text-gray-800',
            'Peligroso': 'bg-red-100 text-red-800',
            'Médico': 'bg-orange-100 text-orange-800',
            'Químico': 'bg-purple-100 text-purple-800',
            'Electrónico': 'bg-blue-100 text-blue-800',
            'Orgánico Contaminado': 'bg-yellow-100 text-yellow-800'
        };
        return classes[type] || 'bg-gray-100 text-gray-800';
    },

    getMethodBorderClass(impact) {
        const classes = {
            'Muy Bajo': 'border-green-400',
            'Bajo (con control)': 'border-blue-400',
            'Medio': 'border-yellow-400',
            'Alto': 'border-red-400'
        };
        return classes[impact] || 'border-gray-400';
    },

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }
};