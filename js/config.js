window.configModule = {
    activeTab: 'vehicles', // default tab
    
    // Datos de configuración
    data: {
        vehicles: [],
        staff: [],
        wasteTypes: [
            {id: 1, name: 'Papel y Cartón', category: 'Reciclable', pricePerKg: 0.5, color: '#4CAF50'},
            {id: 2, name: 'Plástico PET', category: 'Reciclable', pricePerKg: 1.2, color: '#2196F3'},
            {id: 3, name: 'Vidrio', category: 'Reciclable', pricePerKg: 0.3, color: '#FF9800'},
            {id: 4, name: 'Metales', category: 'Reciclable', pricePerKg: 3.5, color: '#9C27B0'},
            {id: 5, name: 'Orgánicos', category: 'Compostable', pricePerKg: 0.2, color: '#795548'},
            {id: 6, name: 'Residuos Peligrosos', category: 'Especial', pricePerKg: 15.0, color: '#F44336'}
        ],
        rates: {
            transportBase: 25000,
            pricePerKm: 1500,
            urgentSurcharge: 0.3,
            bulkDiscount: 0.15,
            minimumWeight: 10
        },
        settings: {
            companyName: 'EcoGestión S.A.S',
            nit: '900.123.456-7',
            address: 'Calle 123 #45-67, Bogotá D.C.',
            phone: '+57 1 234 5678',
            email: 'contacto@ecogestion.com',
            maxDailyRoutes: 8,
            maxVehicleCapacity: 15000,
            workingHours: '6:00 AM - 6:00 PM',
            emergencyContact: '+57 300 123 4567'
        }
    },

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
                    ${this.renderTab('waste-types', 'Tipos de Residuos', 'fa-recycle')}
                    ${this.renderTab('rates', 'Tarifas', 'fa-dollar-sign')}
                    ${this.renderTab('settings', 'Parámetros', 'fa-cogs')}
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
            case 'staff':
                this.renderStaffTab(container);
                break;
            case 'waste-types':
                this.renderWasteTypesTab(container);
                break;
            case 'rates':
                this.renderRatesTab(container);
                break;
            case 'settings':
                this.renderSettingsTab(container);
                break;
            default:
                container.innerHTML = `<div class="p-6 bg-white rounded-lg shadow"><p>Esta sección se implementará a continuación.</p></div>`;
        }
    },

    // --- VEHICLES CRUD ---
    renderVehiclesTab(container) {
        // Usar vehículos de routesModule si existe, sino usar los propios
        const vehicles = window.routesModule?.vehicles || this.data.vehicles;
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
        const vehicles = window.routesModule?.vehicles || this.data.vehicles;
        const vehicle = isEdit ? vehicles.find(v => v.id === id) : {};
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

        // Usar routesModule si existe, sino usar almacenamiento propio
        const vehicles = window.routesModule?.vehicles || this.data.vehicles;

        if (id) { // Update
            const index = vehicles.findIndex(v => v.id == id);
            if (index !== -1) {
                vehicles[index] = { ...vehicles[index], ...vehicleData };
                authSystem.showNotification('Vehículo actualizado', 'success');
            }
        } else { // Create
            const newId = (vehicles.length > 0) ? Math.max(...vehicles.map(v => v.id)) + 1 : 1;
            vehicles.push({ id: newId, ...vehicleData });
            authSystem.showNotification('Vehículo creado', 'success');
        }
        
        // Guardar en configuración si no usamos routesModule
        if (!window.routesModule) {
            this.saveConfigData();
        }
        
        this.loadTabContent();
    },

    deleteVehicle(id) {
        if (confirm('¿Está seguro de que desea eliminar este vehículo?')) {
            const vehicles = window.routesModule?.vehicles || this.data.vehicles;
            const index = vehicles.findIndex(v => v.id === id);
            if (index !== -1) {
                vehicles.splice(index, 1);
                authSystem.showNotification('Vehículo eliminado', 'success');
                
                // Guardar en configuración si no usamos routesModule
                if (!window.routesModule) {
                    this.saveConfigData();
                }
                
                this.loadTabContent();
            }
        }
    },

    getVehicleStatusClass(status) {
        const classes = { 'Disponible': 'bg-green-100 text-green-800', 'En Ruta': 'bg-blue-100 text-blue-800', 'Mantenimiento': 'bg-red-100 text-red-800' };
        return classes[status] || 'bg-gray-100 text-gray-800';
    },

    // --- STAFF MANAGEMENT ---
    renderStaffTab(container) {
        const operators = authSystem.getAllUsers().filter(u => u.type === 'operator');
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b">
                    <h3 class="text-lg font-semibold">Personal Operativo</h3>
                    <p class="text-gray-600">Gestión del personal de recolección y operaciones</p>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50"><tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permisos</th>
                        </tr></thead>
                        <tbody class="divide-y divide-gray-200">
                            ${operators.map(op => `
                                <tr>
                                    <td class="px-6 py-4">${op.name}</td>
                                    <td class="px-6 py-4">${op.email}</td>
                                    <td class="px-6 py-4"><span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Activo</span></td>
                                    <td class="px-6 py-4">${op.permissions?.join(', ') || 'N/A'}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No hay personal operativo registrado</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // --- WASTE TYPES ---
    renderWasteTypesTab(container) {
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b flex justify-between items-center">
                    <div>
                        <h3 class="text-lg font-semibold">Tipos de Residuos</h3>
                        <p class="text-gray-600">Configuración de categorías y precios por kilogramo</p>
                    </div>
                    <button onclick="configModule.showWasteTypeModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        <i class="fas fa-plus mr-2"></i>Nuevo Tipo
                    </button>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50"><tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio/Kg</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr></thead>
                        <tbody class="divide-y divide-gray-200">
                            ${this.data.wasteTypes.map(wt => `
                                <tr>
                                    <td class="px-6 py-4">${wt.name}</td>
                                    <td class="px-6 py-4"><span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">${wt.category}</span></td>
                                    <td class="px-6 py-4">$${wt.pricePerKg.toFixed(2)}</td>
                                    <td class="px-6 py-4"><div class="w-6 h-6 rounded" style="background-color: ${wt.color}"></div></td>
                                    <td class="px-6 py-4">
                                        <button onclick="configModule.showWasteTypeModal(${wt.id})" class="text-yellow-600 hover:text-yellow-900 mr-3" title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button onclick="configModule.deleteWasteType(${wt.id})" class="text-red-600 hover:text-red-900" title="Eliminar">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // --- RATES ---
    renderRatesTab(container) {
        const rates = this.data.rates;
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b">
                    <h3 class="text-lg font-semibold">Configuración de Tarifas</h3>
                    <p class="text-gray-600">Parámetros para el cálculo de costos de servicios</p>
                </div>
                <div class="p-6">
                    <form id="rates-form" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Tarifa Base de Transporte</label>
                            <div class="relative">
                                <span class="absolute left-3 top-2 text-gray-500">$</span>
                                <input type="number" id="transportBase" value="${rates.transportBase}" 
                                       class="w-full pl-8 pr-3 py-2 border rounded-lg" min="0" step="1000">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Precio por Kilómetro</label>
                            <div class="relative">
                                <span class="absolute left-3 top-2 text-gray-500">$</span>
                                <input type="number" id="pricePerKm" value="${rates.pricePerKm}" 
                                       class="w-full pl-8 pr-3 py-2 border rounded-lg" min="0" step="100">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Recargo por Urgencia (%)</label>
                            <div class="relative">
                                <input type="number" id="urgentSurcharge" value="${rates.urgentSurcharge * 100}" 
                                       class="w-full pr-8 pl-3 py-2 border rounded-lg" min="0" max="100" step="5">
                                <span class="absolute right-3 top-2 text-gray-500">%</span>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Descuento por Volumen (%)</label>
                            <div class="relative">
                                <input type="number" id="bulkDiscount" value="${rates.bulkDiscount * 100}" 
                                       class="w-full pr-8 pl-3 py-2 border rounded-lg" min="0" max="50" step="5">
                                <span class="absolute right-3 top-2 text-gray-500">%</span>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Peso Mínimo (Kg)</label>
                            <input type="number" id="minimumWeight" value="${rates.minimumWeight}" 
                                   class="w-full px-3 py-2 border rounded-lg" min="1" step="1">
                        </div>
                        
                        <div class="flex items-end">
                            <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                                <i class="fas fa-save mr-2"></i>Guardar Tarifas
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('rates-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRates();
        });
    },

    // --- SETTINGS ---
    renderSettingsTab(container) {
        const settings = this.data.settings;
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b">
                    <h3 class="text-lg font-semibold">Parámetros del Sistema</h3>
                    <p class="text-gray-600">Configuración general de la empresa y operaciones</p>
                </div>
                <div class="p-6">
                    <form id="settings-form" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre de la Empresa</label>
                            <input type="text" id="companyName" value="${settings.companyName}" 
                                   class="w-full px-3 py-2 border rounded-lg" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">NIT</label>
                            <input type="text" id="nit" value="${settings.nit}" 
                                   class="w-full px-3 py-2 border rounded-lg" required>
                        </div>
                        
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                            <input type="text" id="address" value="${settings.address}" 
                                   class="w-full px-3 py-2 border rounded-lg" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                            <input type="tel" id="phone" value="${settings.phone}" 
                                   class="w-full px-3 py-2 border rounded-lg" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" id="email" value="${settings.email}" 
                                   class="w-full px-3 py-2 border rounded-lg" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Rutas Máximas por Día</label>
                            <input type="number" id="maxDailyRoutes" value="${settings.maxDailyRoutes}" 
                                   class="w-full px-3 py-2 border rounded-lg" min="1" max="20">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Capacidad Máxima Vehículo (Kg)</label>
                            <input type="number" id="maxVehicleCapacity" value="${settings.maxVehicleCapacity}" 
                                   class="w-full px-3 py-2 border rounded-lg" min="1000" step="1000">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Horario de Trabajo</label>
                            <input type="text" id="workingHours" value="${settings.workingHours}" 
                                   class="w-full px-3 py-2 border rounded-lg" placeholder="9:00 AM - 5:00 PM">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Contacto de Emergencia</label>
                            <input type="tel" id="emergencyContact" value="${settings.emergencyContact}" 
                                   class="w-full px-3 py-2 border rounded-lg" required>
                        </div>
                        
                        <div class="md:col-span-2 flex justify-end space-x-4">
                            <button type="button" onclick="configModule.resetSettings()" 
                                    class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                                <i class="fas fa-undo mr-2"></i>Restablecer
                            </button>
                            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                <i class="fas fa-save mr-2"></i>Guardar Configuración
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('settings-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettings();
        });
    },

    // --- UTILITY METHODS ---
    showWasteTypeModal(id = null) {
        const isEdit = id !== null;
        const wasteType = isEdit ? this.data.wasteTypes.find(wt => wt.id === id) : {};
        
        const modalHtml = `
            <div id="waste-type-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-lg">
                    <h3 class="text-lg font-semibold mb-4">${isEdit ? 'Editar Tipo de Residuo' : 'Nuevo Tipo de Residuo'}</h3>
                    <form id="waste-type-form" class="space-y-4">
                        <input type="hidden" id="waste-type-id" value="${wasteType?.id || ''}">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                            <input type="text" id="waste-type-name" value="${wasteType?.name || ''}" 
                                   class="w-full px-3 py-2 border rounded-lg" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                            <select id="waste-type-category" class="w-full px-3 py-2 border rounded-lg">
                                <option value="Reciclable" ${wasteType?.category === 'Reciclable' ? 'selected' : ''}>Reciclable</option>
                                <option value="Compostable" ${wasteType?.category === 'Compostable' ? 'selected' : ''}>Compostable</option>
                                <option value="Especial" ${wasteType?.category === 'Especial' ? 'selected' : ''}>Especial</option>
                                <option value="No Reciclable" ${wasteType?.category === 'No Reciclable' ? 'selected' : ''}>No Reciclable</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Precio por Kg</label>
                            <input type="number" id="waste-type-price" value="${wasteType?.pricePerKg || 0}" 
                                   class="w-full px-3 py-2 border rounded-lg" min="0" step="0.1" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Color</label>
                            <input type="color" id="waste-type-color" value="${wasteType?.color || '#4CAF50'}" 
                                   class="w-full px-3 py-2 border rounded-lg h-12">
                        </div>
                        <div class="flex justify-end space-x-4 pt-4">
                            <button type="button" onclick="document.getElementById('waste-type-modal').remove()" 
                                    class="px-4 py-2 border rounded-lg">Cancelar</button>
                            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        document.getElementById('waste-type-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveWasteType();
            document.getElementById('waste-type-modal').remove();
        });
    },

    saveWasteType() {
        const id = document.getElementById('waste-type-id').value;
        const wasteTypeData = {
            name: document.getElementById('waste-type-name').value,
            category: document.getElementById('waste-type-category').value,
            pricePerKg: parseFloat(document.getElementById('waste-type-price').value),
            color: document.getElementById('waste-type-color').value
        };

        if (id) {
            const index = this.data.wasteTypes.findIndex(wt => wt.id == id);
            if (index !== -1) {
                this.data.wasteTypes[index] = { ...this.data.wasteTypes[index], ...wasteTypeData };
                authSystem.showNotification('Tipo de residuo actualizado', 'success');
            }
        } else {
            const newId = Math.max(...this.data.wasteTypes.map(wt => wt.id)) + 1;
            this.data.wasteTypes.push({ id: newId, ...wasteTypeData });
            authSystem.showNotification('Tipo de residuo creado', 'success');
        }
        
        this.loadTabContent();
        this.saveConfigData();
    },

    deleteWasteType(id) {
        if (confirm('¿Está seguro de que desea eliminar este tipo de residuo?')) {
            const index = this.data.wasteTypes.findIndex(wt => wt.id === id);
            if (index !== -1) {
                this.data.wasteTypes.splice(index, 1);
                authSystem.showNotification('Tipo de residuo eliminado', 'success');
                this.loadTabContent();
                this.saveConfigData();
            }
        }
    },

    saveRates() {
        this.data.rates = {
            transportBase: parseInt(document.getElementById('transportBase').value),
            pricePerKm: parseInt(document.getElementById('pricePerKm').value),
            urgentSurcharge: parseFloat(document.getElementById('urgentSurcharge').value) / 100,
            bulkDiscount: parseFloat(document.getElementById('bulkDiscount').value) / 100,
            minimumWeight: parseInt(document.getElementById('minimumWeight').value)
        };
        
        this.saveConfigData();
        authSystem.showNotification('Tarifas actualizadas correctamente', 'success');
    },

    saveSettings() {
        this.data.settings = {
            companyName: document.getElementById('companyName').value,
            nit: document.getElementById('nit').value,
            address: document.getElementById('address').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            maxDailyRoutes: parseInt(document.getElementById('maxDailyRoutes').value),
            maxVehicleCapacity: parseInt(document.getElementById('maxVehicleCapacity').value),
            workingHours: document.getElementById('workingHours').value,
            emergencyContact: document.getElementById('emergencyContact').value
        };
        
        this.saveConfigData();
        authSystem.showNotification('Configuración guardada correctamente', 'success');
    },

    resetSettings() {
        if (confirm('¿Está seguro de que desea restablecer la configuración a los valores por defecto?')) {
            this.loadTabContent();
        }
    },

    // Persistencia de datos
    saveConfigData() {
        try {
            localStorage.setItem('ecogestion_config', JSON.stringify(this.data));
        } catch (e) {
            console.error('Error guardando configuración:', e);
        }
    },

    loadConfigData() {
        try {
            const saved = localStorage.getItem('ecogestion_config');
            if (saved) {
                const savedData = JSON.parse(saved);
                // Combinar datos guardados con valores por defecto
                this.data = { ...this.data, ...savedData };
            }
        } catch (e) {
            console.warn('Error cargando configuración:', e);
        }
    },

    // Inicialización
    init() {
        this.loadConfigData();
    },

    // Métodos públicos para acceso a datos de configuración
    getWasteTypes() {
        return this.data.wasteTypes;
    },

    getRates() {
        return this.data.rates;
    },

    getSettings() {
        return this.data.settings;
    },

    getVehicles() {
        return window.routesModule?.vehicles || this.data.vehicles;
    },

    // Método para obtener precio de un tipo de residuo
    getWasteTypePrice(wasteTypeId) {
        const wasteType = this.data.wasteTypes.find(wt => wt.id === wasteTypeId);
        return wasteType ? wasteType.pricePerKg : 0;
    },

    // Método para calcular costo de servicio
    calculateServiceCost(distance, weight, isUrgent = false, wasteTypeId = null) {
        const rates = this.data.rates;
        let cost = rates.transportBase + (distance * rates.pricePerKm);
        
        // Agregar costo por peso si hay tipo de residuo específico
        if (wasteTypeId) {
            cost += weight * this.getWasteTypePrice(wasteTypeId);
        }
        
        // Aplicar recargo por urgencia
        if (isUrgent) {
            cost *= (1 + rates.urgentSurcharge);
        }
        
        // Aplicar descuento por volumen si el peso es alto
        if (weight > 100) {
            cost *= (1 - rates.bulkDiscount);
        }
        
        return Math.round(cost);
    }
};

// Inicializar el módulo al cargar
configModule.init();