window.plantModule = {
    receptions: [
        {
            id: 1,
            manifestNumber: 'M-2024-001',
            arrivalDate: '2024-08-17',
            arrivalTime: '14:30',
            vehicle: 'C-001',
            driver: 'Carlos Rodríguez',
            totalWeight: 15.6,
            status: 'Procesado',
            classifications: [
                { type: 'Orgánico', weight: 12.3, destination: 'Compostaje' },
                { type: 'Reciclable', weight: 3.3, destination: 'Centro de Reciclaje' }
            ],
            operator: 'María González',
            notes: 'Material en buenas condiciones'
        }
    ],

    // This object will now be populated dynamically
    processingCapacity: {
        current: 0,
        maximum: 200, // Ton
        organic: 0,
        recyclable: 0,
        nonRecyclable: 0
    },

    // --- ROLE-BASED LOADER ---
    load() {
        this.calculateInitialCapacity(); // Calculate current capacity before rendering

        const user = app.currentUser;
        if (!user) {
            document.getElementById('content-area').innerHTML = '<p>Error: No se pudo identificar al usuario.</p>';
            return;
        }

        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="mb-6">
                <div class="flex flex-col items-start gap-1">
                    <h1 class="text-3xl font-bold text-gray-800">Recepción y Manejo en Planta</h1>
                    <p class="text-gray-600">${user.type === 'admin' ? 'Supervisión de capacidad y recepciones' : 'Registro de recepción de cargas'}</p>
                </div>
            </div>
            <div id="role-specific-content"></div>
        `;

        const roleContainer = document.getElementById('role-specific-content');
        if (user.type === 'admin') {
            this.renderAdminView(roleContainer);
        } else {
            this.renderOperatorView(roleContainer);
        }
    },

    // --- ADMIN VIEW ---
    renderAdminView(container) {
        container.innerHTML = `
            <!-- Capacity Status -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100">Capacidad Ocupada</p>
                            <p class="text-3xl font-bold">${this.processingCapacity.current}%</p>
                        </div>
                        <i class="fas fa-tachometer-alt text-4xl text-blue-200"></i>
                    </div>
                    <div class="mt-2">
                        <div class="w-full bg-blue-700 rounded-full h-2">
                            <div class="bg-white h-2 rounded-full" style="width: ${this.processingCapacity.current}%"></div>
                        </div>
                    </div>
                </div>
                <div class="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                    <div><p class="text-green-100">Orgánico (Ton)</p><p class="text-3xl font-bold">${this.processingCapacity.organic.toFixed(1)}</p></div>
                </div>
                <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white">
                    <div><p class="text-yellow-100">Reciclable (Ton)</p><p class="text-3xl font-bold">${this.processingCapacity.recyclable.toFixed(1)}</p></div>
                </div>
                <div class="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-lg text-white">
                    <div><p class="text-red-100">No Reciclable (Ton)</p><p class="text-3xl font-bold">${this.processingCapacity.nonRecyclable.toFixed(1)}</p></div>
                </div>
            </div>

            <!-- Recent Receptions Table -->
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b"><h3 class="text-lg font-semibold">Historial de Recepciones</h3></div>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manifiesto</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha/Hora</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peso Total</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${this.receptions.map(reception => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap font-medium">${reception.manifestNumber}</td>
                                    <td class="px-6 py-4 whitespace-nowrap"><div class="text-sm"><div>${this.formatDate(reception.arrivalDate)}</div><div class="text-gray-500">${reception.arrivalTime}</div></div></td>
                                    <td class="px-6 py-4 whitespace-nowrap">${reception.totalWeight} Ton</td>
                                    <td class="px-6 py-4 whitespace-nowrap"><span class="px-2 py-1 text-xs rounded-full ${this.getStatusClass(reception.status)}">${reception.status}</span></td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div class="flex space-x-3">
                                            <button onclick="plantModule.viewReception(${reception.id})" class="text-blue-600 hover:text-blue-900" title="Ver detalles"><i class="fas fa-eye"></i></button>
                                            <button onclick="plantModule.generateReport(${reception.id})" class="text-green-600 hover:text-green-900" title="Generar reporte"><i class="fas fa-print"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // --- OPERATOR VIEW ---
    renderOperatorView(container) {
        // Operator view remains the same: just the form.
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b">
                    <h3 class="text-lg font-semibold">Registro de Recepción</h3>
                </div>
                <div class="p-6">
                    <form id="reception-form" class="space-y-4"></form>
                </div>
            </div>
        `;
        this.renderReceptionForm(document.getElementById('reception-form'));
        this.initReceptionForm();
    },

    // --- DYNAMIC DATA & ACTIONS ---
    calculateInitialCapacity() {
        this.processingCapacity.organic = 0;
        this.processingCapacity.recyclable = 0;
        this.processingCapacity.nonRecyclable = 0;

        this.receptions.forEach(rec => {
            rec.classifications.forEach(cl => {
                const weight = parseFloat(cl.weight) || 0;
                if (cl.type === 'Orgánico') this.processingCapacity.organic += weight;
                if (cl.type === 'Reciclable') this.processingCapacity.recyclable += weight;
                if (cl.type === 'No Reciclable') this.processingCapacity.nonRecyclable += weight;
            });
        });

        const total = this.processingCapacity.organic + this.processingCapacity.recyclable + this.processingCapacity.nonRecyclable;
        this.processingCapacity.current = this.processingCapacity.maximum > 0 ? Math.round((total / this.processingCapacity.maximum) * 100) : 0;
    },

    viewReception(id) {
        const reception = this.receptions.find(r => r.id === id);
        if (!reception) return;

        const modalHtml = `
        <div id="view-reception-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-2xl">
                <div class="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 class="text-xl font-semibold">Detalles de Recepción: ${reception.manifestNumber}</h3>
                    <button onclick="document.getElementById('view-reception-modal').remove()" class="text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Fecha/Hora:</strong> ${this.formatDate(reception.arrivalDate)} ${reception.arrivalTime}</div>
                    <div><strong>Vehículo:</strong> ${reception.vehicle}</div>
                    <div><strong>Conductor:</strong> ${reception.driver}</div>
                    <div><strong>Peso Total:</strong> ${reception.totalWeight} Ton</div>
                    <div><strong>Operador:</strong> ${reception.operator}</div>
                    <div><strong>Estado:</strong> ${reception.status}</div>
                </div>
                <div class="mt-4 border-t pt-4">
                    <h4 class="font-semibold mb-2">Clasificación</h4>
                    <table class="min-w-full text-sm"><thead><tr><th class="text-left">Tipo</th><th class="text-left">Peso</th><th class="text-left">Destino</th></tr></thead><tbody>
                    ${reception.classifications.map(c => `<tr><td>${c.type}</td><td>${c.weight} Ton</td><td>${c.destination}</td></tr>`).join('')}
                    </tbody></table>
                </div>
                 <div class="mt-4 border-t pt-4 text-sm">
                    <h4 class="font-semibold mb-2">Notas</h4>
                    <p>${reception.notes || 'Sin observaciones'}</p>
                </div>
                <div class="flex justify-end mt-6">
                    <button onclick="document.getElementById('view-reception-modal').remove()" class="px-4 py-2 border rounded-lg">Cerrar</button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    generateReport(id) {
        const reception = this.receptions.find(r => r.id === id);
        if (!reception) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Reporte de Recepción ' + reception.manifestNumber + '</title><style>body{font-family:sans-serif;padding:2em}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px}th{background-color:#f2f2f2}.header h1{margin:0}</style></head><body>');
        printWindow.document.write(`<div class="header"><h1>Reporte de Recepción</h1><h2>${reception.manifestNumber}</h2></div>`);
        printWindow.document.write(`<p><strong>Fecha y Hora de Llegada:</strong> ${this.formatDate(reception.arrivalDate)} ${reception.arrivalTime}</p>`);
        printWindow.document.write(`<p><strong>Peso Total Registrado:</strong> ${reception.totalWeight} Ton</p>`);
        printWindow.document.write('<h3>Clasificación de Materiales</h3><table><thead><tr><th>Tipo</th><th>Peso (Ton)</th><th>Destino</th></tr></thead><tbody>');
        reception.classifications.forEach(c => { printWindow.document.write(`<tr><td>${c.type}</td><td>${c.weight}</td><td>${c.destination}</td></tr>`); });
        printWindow.document.write('</tbody></table>');
        printWindow.document.write(`<p><strong>Operador de Planta:</strong> ${reception.operator}</p><p><strong>Notas:</strong> ${reception.notes || 'N/A'}</p>`);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
    },

    // --- FORM & HELPER FUNCTIONS (mostly unchanged) ---
    renderReceptionForm(formElement) { /* ... form HTML ... */ },
    initReceptionForm() { /* ... form init logic ... */ },
    saveReception() { /* ... save logic ... */ this.load(); },
    // ... other helpers ...
    getStatusClass(status) {
        const classes = {
            'Procesado': 'bg-green-100 text-green-800',
            'En Proceso': 'bg-yellow-100 text-yellow-800',
            'Recibido': 'bg-blue-100 text-blue-800',
            'Rechazado': 'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    },
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        const date = new Date(dateString);
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        return date.toLocaleDateString('es-ES', options);
    }
};