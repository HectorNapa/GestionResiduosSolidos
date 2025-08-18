window.configModule = {
    activeTab: 'vehicles', // default tab

    load() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-800">Configuración del Sistema</h1>
                <p class="text-gray-600">Gestión de datos maestros y parámetros de la aplicación.</p>
            </div>
            <!-- Tabs -->
            <div class="mb-6 border-b border-gray-200">
                <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                    ${this.renderTab('vehicles', 'Vehículos', 'fa-truck')}
                    ${this.renderTab('staff', 'Personal', 'fa-users')}
                    ${this.renderTab('clients', 'Clientes', 'fa-building')}
                    ${this.renderTab('facilities', 'Instalaciones', 'fa-industry')}
                </nav>
            </div>
            <!-- Tab Content -->
            <div id="config-tab-content"></div>
        `;
        this.loadTabContent();
    },

    renderTab(tabName, label, icon) {
        const isActive = this.activeTab === tabName;
        const activeClasses = 'border-blue-500 text-blue-600';
        const inactiveClasses = 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
        return `
            <button onclick="configModule.switchTab('${tabName}')" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${isActive ? activeClasses : inactiveClasses}">
                <i class="fas ${icon} mr-2"></i>${label}
            </button>
        `;
    },

    switchTab(tabName) {
        this.activeTab = tabName;
        this.load(); // Re-load the entire view to update tabs and content
    },

    loadTabContent() {
        const container = document.getElementById('config-tab-content');
        switch (this.activeTab) {
            case 'vehicles':
                this.renderVehiclesTab(container);
                break;
            default:
                container.innerHTML = `<div class="p-6 bg-white rounded-lg shadow"><p>Esta sección se implementará a continuación.</p></div>`;
        }
    },

    // --- VEHICLES CRUD ---
    renderVehiclesTab(container) {
        const vehicles = window.routesModule?.vehicles || [];
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b flex justify-between items-center">
                    <h3 class="text-lg font-semibold">Gestión de Flota de Vehículos</h3>
                    <button onclick="configModule.showVehicleModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><i class="fas fa-plus mr-2"></i>Nuevo Vehículo</button>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50"><tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacidad</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr></thead>
                        <tbody class="divide-y divide-gray-200">
                            ${vehicles.map(v => `
                                <tr>
                                    <td class="px-6 py-4">${v.code}</td>
                                    <td class="px-6 py-4">${v.brand}</td>
                                    <td class="px-6 py-4">${v.model}</td>
                                    <td class="px-6 py-4">${v.capacity}</td>
                                    <td class="px-6 py-4"><span class="px-2 py-1 text-xs rounded-full ${this.getVehicleStatusClass(v.status)}">${v.status}</span></td>
                                    <td class="px-6 py-4"><div class="flex space-x-3">
                                        <button onclick="configModule.showVehicleModal(${v.id})" class="text-yellow-600 hover:text-yellow-900" title="Editar"><i class="fas fa-edit"></i></button>
                                        <button onclick="configModule.deleteVehicle(${v.id})" class="text-red-600 hover:text-red-900" title="Eliminar"><i class="fas fa-trash"></i></button>
                                    </div></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    showVehicleModal(id = null) {
        const isEdit = id !== null;
        const vehicle = isEdit ? window.routesModule.vehicles.find(v => v.id === id) : {};
        if (isEdit && !vehicle) {
            authSystem.showNotification('Vehículo no encontrado.', 'error');
            return;
        }

        const modalHtml = `
            <div id="vehicle-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div class="bg-white rounded-lg p-6 w-full max-w-lg">
                <h3 class="text-lg font-semibold mb-4">${isEdit ? 'Editar Vehículo' : 'Nuevo Vehículo'}</h3>
                <form id="vehicle-form" class="space-y-4">
                    <input type="hidden" id="vehicle-id" value="${vehicle?.id || ''}">
                    <div><label>Código</label><input type="text" id="vehicle-code" value="${vehicle?.code || ''}" class="w-full px-3 py-2 border rounded-lg" required></div>
                    <div><label>Marca</label><input type="text" id="vehicle-brand" value="${vehicle?.brand || ''}" class="w-full px-3 py-2 border rounded-lg" required></div>
                    <div><label>Modelo</label><input type="text" id="vehicle-model" value="${vehicle?.model || ''}" class="w-full px-3 py-2 border rounded-lg" required></div>
                    <div><label>Capacidad</label><input type="text" id="vehicle-capacity" value="${vehicle?.capacity || ''}" class="w-full px-3 py-2 border rounded-lg" required></div>
                    <div><label>Estado</label><select id="vehicle-status" class="w-full px-3 py-2 border rounded-lg">
                        <option value="Disponible" ${vehicle?.status === 'Disponible' ? 'selected' : ''}>Disponible</option>
                        <option value="En Ruta" ${vehicle?.status === 'En Ruta' ? 'selected' : ''}>En Ruta</option>
                        <option value="Mantenimiento" ${vehicle?.status === 'Mantenimiento' ? 'selected' : ''}>Mantenimiento</option>
                    </select></div>
                    <div class="flex justify-end space-x-4 pt-4"><button type="button" onclick="document.getElementById('vehicle-modal').remove()" class="px-4 py-2 border rounded-lg">Cancelar</button><button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg">Guardar</button></div>
                </form>
            </div></div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        document.getElementById('vehicle-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveVehicle();
            document.getElementById('vehicle-modal').remove();
        });
    },

    saveVehicle() {
        const id = document.getElementById('vehicle-id').value;
        const vehicleData = {
            code: document.getElementById('vehicle-code').value,
            brand: document.getElementById('vehicle-brand').value,
            model: document.getElementById('vehicle-model').value,
            capacity: document.getElementById('vehicle-capacity').value,
            status: document.getElementById('vehicle-status').value
        };

        if (id) { // Update
            const index = window.routesModule.vehicles.findIndex(v => v.id == id);
            if (index !== -1) {
                window.routesModule.vehicles[index] = { ...window.routesModule.vehicles[index], ...vehicleData };
                authSystem.showNotification('Vehículo actualizado', 'success');
            }
        } else { // Create
            const newId = (window.routesModule.vehicles.length > 0) ? Math.max(...window.routesModule.vehicles.map(v => v.id)) + 1 : 1;
            window.routesModule.vehicles.push({ id: newId, ...vehicleData });
            authSystem.showNotification('Vehículo creado', 'success');
        }
        this.loadTabContent(); // Refresh tab content
    },

    deleteVehicle(id) {
        if (confirm('¿Está seguro de que desea eliminar este vehículo?')) {
            const index = window.routesModule.vehicles.findIndex(v => v.id === id);
            if (index !== -1) {
                window.routesModule.vehicles.splice(index, 1);
                authSystem.showNotification('Vehículo eliminado', 'success');
                this.loadTabContent(); // Refresh tab content
            }
        }
    },

    getVehicleStatusClass(status) {
        const classes = { 'Disponible': 'bg-green-100 text-green-800', 'En Ruta': 'bg-blue-100 text-blue-800', 'Mantenimiento': 'bg-red-100 text-red-800' };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }
};