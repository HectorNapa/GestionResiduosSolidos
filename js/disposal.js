window.disposalModule = {
    disposals: [
        {
            id: 1,
            batchNumber: 'D-2024-001',
            date: new Date().toISOString().slice(0, 10),
            wasteType: 'No Reciclable',
            weight: 25.4,
            disposalMethod: 'Relleno Sanitario',
            facility: 'Relleno Municipal Norte',
            transportVehicle: 'T-001',
            status: 'Completado',
            operator: 'Luis Martínez',
            environmentalPermit: 'ENV-2024-RS-001',
            cost: 1270.00,
            notes: 'Disposición conforme a normativa ambiental'
        }
    ],

    // --- ROLE-BASED LOADER ---
    load() {
        const user = app.currentUser;
        if (!user) {
            document.getElementById('content-area').innerHTML = '<p>Error: No se pudo identificar al usuario.</p>';
            return;
        }

        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="mb-6">
                <div class="flex flex-col items-start gap-1">
                    <h1 class="text-3xl font-bold text-gray-800">Disposición Final</h1>
                    <p class="text-gray-600">${user.type === 'admin' ? 'Supervisión de disposiciones finales' : 'Registro de nuevas disposiciones'}</p>
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
        const stats = this.calculateStats();
        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div class="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-lg text-white">
                    <p class="text-red-100">Disposiciones Hoy</p><p class="text-3xl font-bold">${stats.todayCount}</p>
                </div>
                <div class="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
                    <p class="text-orange-100">Peso Total (Hoy)</p><p class="text-3xl font-bold">${stats.todayWeight.toFixed(2)} <span class="text-lg">Ton</span></p>
                </div>
                <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white">
                    <p class="text-yellow-100">Costo Total (Hoy)</p><p class="text-3xl font-bold">$${stats.todayCost.toFixed(2)}</p>
                </div>
                <div class="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                    <p class="text-green-100">Cumplimiento</p><p class="text-3xl font-bold">100%</p>
                </div>
            </div>
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b"><h3 class="text-lg font-semibold">Historial de Disposiciones</h3></div>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lote</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peso</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${this.disposals.map(d => `
                                <tr>
                                    <td class="px-6 py-4">${d.batchNumber}</td>
                                    <td class="px-6 py-4">${this.formatDate(d.date)}</td>
                                    <td class="px-6 py-4">${d.weight} Ton</td>
                                    <td class="px-6 py-4">${d.disposalMethod}</td>
                                    <td class="px-6 py-4"><span class="px-2 py-1 text-xs rounded-full ${this.getStatusClass(d.status)}">${d.status}</span></td>
                                    <td class="px-6 py-4"><div class="flex space-x-3"><button onclick="disposalModule.viewDisposal(${d.id})" class="text-blue-600" title="Ver"><i class="fas fa-eye"></i></button><button onclick="disposalModule.downloadCertificate(${d.id})" class="text-green-600" title="Certificado"><i class="fas fa-certificate"></i></button></div></td>
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
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b"><h3 class="text-lg font-semibold">Registro de Disposición Final</h3></div>
                <div class="p-6"><form id="disposal-form" class="space-y-4"></form></div>
            </div>
        `;
        this.renderDisposalForm(document.getElementById('disposal-form'));
        this.initDisposalForm();
    },

    // --- DYNAMIC DATA & ACTIONS ---
    calculateStats() {
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayDisposals = this.disposals.filter(d => d.date === todayStr);
        return {
            todayCount: todayDisposals.length,
            todayWeight: todayDisposals.reduce((sum, d) => sum + (parseFloat(d.weight) || 0), 0),
            todayCost: todayDisposals.reduce((sum, d) => sum + (parseFloat(d.cost) || 0), 0)
        };
    },

    viewDisposal(id) {
        const d = this.disposals.find(d => d.id === id);
        if (!d) return;
        const modalHtml = `
        <div id="view-disposal-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div class="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 class="text-xl font-semibold mb-4">Detalles de Disposición: ${d.batchNumber}</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Fecha:</strong> ${this.formatDate(d.date)}</div>
                <div><strong>Tipo Residuo:</strong> ${d.wasteType}</div>
                <div><strong>Peso:</strong> ${d.weight} Ton</div>
                <div><strong>Método:</strong> ${d.disposalMethod}</div>
                <div><strong>Instalación:</strong> ${d.facility}</div>
                <div><strong>Vehículo:</strong> ${d.transportVehicle}</div>
                <div><strong>Costo:</strong> $${d.cost}</div>
                <div><strong>Permiso Amb.:</strong> ${d.environmentalPermit}</div>
                <div><strong>Operador:</strong> ${d.operator}</div>
                <div><strong>Estado:</strong> ${d.status}</div>
            </div>
            <div class="mt-4 pt-4 border-t"><p class="text-sm"><strong>Notas:</strong> ${d.notes || 'N/A'}</p></div>
            <div class="flex justify-end mt-6"><button onclick="document.getElementById(\'view-disposal-modal\').remove()" class="px-4 py-2 border rounded-lg">Cerrar</button></div>
        </div></div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    downloadCertificate(id) {
        const d = this.disposals.find(d => d.id === id);
        if (!d) return;
        const win = window.open('', '_blank');
        win.document.write(`<html><head><title>Certificado de Disposición ${d.batchNumber}</title></head><body><h1>Certificado de Disposición Final</h1><h2>${d.batchNumber}</h2><p>Se certifica que la empresa EcoGestión ha realizado la disposición final de <strong>${d.weight} Ton</strong> de residuos de tipo <strong>${d.wasteType}</strong>.</p><p><strong>Método:</strong> ${d.disposalMethod}</p><p><strong>Instalación:</strong> ${d.facility}</p><p><strong>Fecha:</strong> ${this.formatDate(d.date)}</p></body></html>`);
        win.document.close();
        win.focus();
    },

    // --- FORM & HELPERS ---
    renderDisposalForm(formEl) { 
        formEl.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Residuo *</label>
                    <select id="waste-type" required class="w-full px-3 py-2 border rounded-lg"><option value="">Seleccionar tipo</option><option value="No Reciclable">No Reciclable</option><option value="Peligroso">Peligroso</option></select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Peso Total (Ton) *</label>
                    <input type="number" id="disposal-weight" required step="0.1" min="0" class="w-full px-3 py-2 border rounded-lg">
                </div>
            </div>
            <div class="flex justify-end space-x-4 pt-4 border-t">
                <button type="submit" class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Registrar Disposición</button>
            </div>
        `;
     },
    initDisposalForm() { 
        const form = document.getElementById('disposal-form');
        if(form) form.addEventListener('submit', (e) => { e.preventDefault(); this.saveDisposal(); });
     },
    saveDisposal() { 
        const newDisposal = { id: this.disposals.length + 1, batchNumber: `D-2025-00${this.disposals.length+1}`, date: new Date().toISOString().slice(0,10), status: 'Completado' };
        this.disposals.push(newDisposal);
        this.load();
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
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        const date = new Date(dateString);
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        return date.toLocaleDateString('es-ES', options);
    }
};