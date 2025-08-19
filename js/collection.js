window.collectionModule = {
    collections: [
        {
            id: 1,
            routeId: 1,
            clientName: 'Empresa ABC S.A.',
            address: 'Av. Principal 123',
            wasteType: 'Orgánico',
            estimatedVolume: '2.5',
            actualVolume: '2.8',
            collectionDate: '2024-01-15',
            collectionTime: '09:30',
            status: 'Completado',
            operator: 'Carlos Rodríguez',
            vehicle: 'C-001',
            weight: '1.2',
            photos: ['evidence1.jpg', 'evidence2.jpg'],
            clientSignature: true,
            notes: 'Recolección sin inconvenientes'
        }
    ],

    // --- Main loader based on user role ---
    load() {
        const user = app.currentUser;
        if (!user) {
            document.getElementById('content-area').innerHTML = '<p>Error: No se pudo identificar al usuario.</p>';
            return;
        }

        const contentArea = document.getElementById('content-area');
        // Render common header and stats for both roles
        contentArea.innerHTML = `
            <div class="mb-6">
                <div class="flex flex-col items-start gap-1">
                    <h1 class="text-3xl font-bold text-gray-800">Recolección y Progreso</h1>
                    <p class="text-gray-600">${user.type === 'admin' ? 'Supervisión de progreso de rutas' : 'Registro de recolecciones en campo'}</p>
                </div>
            </div>

            <!-- Quick Stats (visible for both roles) -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100">Recolecciones Hoy</p>
                            <p class="text-3xl font-bold">12</p>
                        </div>
                        <i class="fas fa-clipboard-check text-4xl text-blue-200"></i>
                    </div>
                </div>
                <div class="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100">Volumen Total</p>
                            <p class="text-3xl font-bold">45.2 <span class="text-lg">m³</span></p>
                        </div>
                        <i class="fas fa-cubes text-4xl text-green-200"></i>
                    </div>
                </div>
                <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-yellow-100">Peso Total</p>
                            <p class="text-3xl font-bold">28.4 <span class="text-lg">Ton</span></p>
                        </div>
                        <i class="fas fa-weight text-4xl text-yellow-200"></i>
                    </div>
                </div>
                <div class="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-100">Eficiencia</p>
                            <p class="text-3xl font-bold">94%</p>
                        </div>
                        <i class="fas fa-chart-line text-4xl text-purple-200"></i>
                    </div>
                </div>
            </div>

            <!-- Role-specific content will be injected here -->
            <div id="role-specific-content"></div>
        `;

        const roleSpecificContent = document.getElementById('role-specific-content');
        if (user.type === 'admin') {
            this.renderAdminView(roleSpecificContent);
        } else { // 'operator' and any other role
            this.renderOperatorView(roleSpecificContent);
        }
    },

    // --- Admin View: Route Progress Table ---
    renderAdminView(container) {
        // Check if routesModule is available
        if (typeof window.routesModule === 'undefined' || typeof window.routesModule.getFilteredRoutes === 'undefined') {
            container.innerHTML = `<div class="p-4 text-center text-red-500 bg-red-50 rounded-lg border border-red-200">Error: El módulo de rutas no está cargado.</div>`;
            return;
        }

        const routes = window.routesModule.routes || [];
        
        if (routes.length === 0) {
            container.innerHTML = `<div class="p-6 text-center text-gray-500 bg-white rounded-lg border">No hay rutas creadas en el sistema.</div>`;
            return;
        }

        container.innerHTML = `
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b">
                    <h3 class="text-lg font-semibold">Progreso de Rutas en Tiempo Real</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ruta</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehículo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conductor</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progreso</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${routes.map(route => {
                                const completedPoints = this.collections.filter(c => c.routeId === route.id && c.status === 'Completado').length;
                                const totalPoints = route.collectionPoints.length;
                                const progress = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

                                return `
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="font-medium">${route.name}</div>
                                            <div class="text-sm text-gray-500">${route.code}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${window.routesModule.getVehicleLabelByCode(route.vehicle)}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${route.driver}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="flex items-center">
                                                <div class="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                                    <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${progress}%"></div>
                                                </div>
                                                <span class="text-sm font-medium">${progress}%</span>
                                            </div>
                                            <div class="text-xs text-gray-500">${completedPoints} de ${totalPoints} puntos completados</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="px-2 py-1 text-xs rounded-full ${window.routesModule.getStatusClass(route.status)}">
                                                ${route.status}
                                            </span>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // --- Operator View: Collection Form ---
    renderOperatorView(container) {
        container.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Collection Form -->
                <div class="lg:col-span-2">
                    <div class="bg-white rounded-lg shadow">
                        <div class="p-6 border-b">
                            <h3 class="text-lg font-semibold">Registro de Nueva Recolección</h3>
                        </div>
                        <div class="p-6">
                            <form id="collection-form" class="space-y-4">
                                <!-- Form content is the same as before -->
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                                        <select id="client-select" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                            <option value="">Seleccionar cliente</option>
                                            <option value="empresa-abc">Empresa ABC S.A.</option>
                                            <option value="hotel-plaza">Hotel Plaza</option>
                                            <option value="oficinas-xyz">Oficinas XYZ</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Ruta Asignada</label>
                                        <select id="route-select" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                            <option value="">Seleccionar ruta</option>
                                            <option value="R-001">R-001 - Ruta Norte A</option>
                                            <option value="R-002">R-002 - Ruta Centro B</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Residuo *</label>
                                        <select id="waste-type" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                            <option value="">Seleccionar tipo</option>
                                            <option value="organico">Orgánico</option>
                                            <option value="reciclable">Reciclable</option>
                                            <option value="no-reciclable">No Reciclable</option>
                                            <option value="peligroso">Peligroso</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Volumen Real (m³) *</label>
                                        <input type="number" id="actual-volume" required step="0.1" min="0" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Peso (Ton) *</label>
                                        <input type="number" id="weight" required step="0.1" min="0" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Recolección *</label>
                                        <input type="date" id="collection-date" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Hora de Recolección *</label>
                                        <input type="time" id="collection-time" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Evidencia Fotográfica</label>
                                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                        <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                                        <p class="text-gray-600">Arrastra y suelta fotos aquí o <span class="text-blue-600 cursor-pointer">haz clic para seleccionar</span></p>
                                        <input type="file" id="evidence-photos" multiple accept="image/*" class="hidden">
                                    </div>
                                    <div id="photo-preview" class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 hidden"></div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                                    <textarea id="collection-notes" rows="3" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" placeholder="Observaciones adicionales sobre la recolección..."></textarea>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Firma Digital del Cliente</label>
                                    <div class="border rounded-lg p-4 bg-gray-50">
                                        <canvas id="signature-pad" width="400" height="150" class="border bg-white rounded"></canvas>
                                        <div class="mt-2 flex space-x-2">
                                            <button type="button" onclick="collectionModule.clearSignature()" class="px-3 py-1 bg-gray-600 text-white rounded text-sm">Limpiar</button>
                                            <span class="text-sm text-gray-600">El cliente debe firmar para confirmar la recolección</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex justify-end space-x-4 pt-4 border-t">
                                    <button type="button" onclick="collectionModule.saveDraft()" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Guardar Borrador</button>
                                    <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><i class="fas fa-save mr-2"></i>Completar Recolección</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Sidebar with Recent Collections -->
                <div class="space-y-6">
                    <div class="bg-white rounded-lg shadow">
                        <div class="p-4 border-b">
                            <h3 class="font-semibold">Recolecciones de Hoy</h3>
                        </div>
                        <div class="p-4 space-y-3">
                            ${this.collections.map(collection => `
                                <div class="border rounded-lg p-3">
                                    <div class="flex justify-between items-start mb-2">
                                        <div class="flex-1">
                                            <h4 class="font-medium text-sm">${collection.clientName}</h4>
                                            <p class="text-xs text-gray-600">${collection.address}</p>
                                        </div>
                                        <span class="px-2 py-1 text-xs rounded-full ${this.getStatusClass(collection.status)}">
                                            ${collection.status}
                                        </span>
                                    </div>
                                    <div class="text-xs text-gray-600">
                                        <div class="grid grid-cols-2 gap-2">
                                            <span>${collection.wasteType}</span>
                                            <span>${collection.actualVolume} m³</span>
                                            <span>${collection.weight} Ton</span>
                                            <span>${collection.collectionTime}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        // Initialize form-specific JS
        this.initCollectionForm();
    },

    // --- Form and Actions Logic (mostly unchanged) ---
    initCollectionForm() {
        const form = document.getElementById('collection-form');
        if (!form) return; // Don't run if form is not on the page

        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toTimeString().slice(0, 5);

        document.getElementById('collection-date').value = today;
        document.getElementById('collection-time').value = now;

        this.initSignaturePad();
        this.initFileUpload();

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCollection();
        });
    },

    initSignaturePad() {
        const canvas = document.getElementById('signature-pad');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let isDrawing = false;

        // (Signature pad logic remains the same)
        canvas.addEventListener('mousedown', (e) => { isDrawing = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); });
        canvas.addEventListener('mousemove', (e) => { if (isDrawing) { ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); } });
        canvas.addEventListener('mouseup', () => { isDrawing = false; });
        canvas.addEventListener('touchstart', (e) => { e.preventDefault(); const touch = e.touches[0]; const rect = canvas.getBoundingClientRect(); isDrawing = true; ctx.beginPath(); ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top); });
        canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (isDrawing) { const touch = e.touches[0]; const rect = canvas.getBoundingClientRect(); ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top); ctx.stroke(); } });
        canvas.addEventListener('touchend', (e) => { e.preventDefault(); isDrawing = false; });
    },

    clearSignature() {
        const canvas = document.getElementById('signature-pad');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    },

    initFileUpload() {
        const fileInput = document.getElementById('evidence-photos');
        const photoPreview = document.getElementById('photo-preview');
        if (!fileInput) return;

        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            photoPreview.innerHTML = '';
            photoPreview.classList.remove('hidden');

            files.forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('div');
                    img.className = 'relative';
                    img.innerHTML = `<img src="${e.target.result}" alt="Evidencia ${index + 1}" class="w-full h-24 object-cover rounded border"><button type="button" onclick="this.parentElement.remove()" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">×</button>`;
                    photoPreview.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        });
    },

    saveCollection() {
        const formData = {
            client: document.getElementById('client-select').value,
            route: document.getElementById('route-select').value,
            wasteType: document.getElementById('waste-type').value,
            actualVolume: document.getElementById('actual-volume').value,
            weight: document.getElementById('weight').value,
            collectionDate: document.getElementById('collection-date').value,
            collectionTime: document.getElementById('collection-time').value,
            notes: document.getElementById('collection-notes').value,
            status: 'Completado',
            operator: app.currentUser.name,
            timestamp: new Date().toISOString()
        };

        if (!formData.client || !formData.wasteType || !formData.actualVolume || !formData.weight) {
            authSystem.showNotification('Por favor completa todos los campos requeridos', 'error');
            return;
        }

        const canvas = document.getElementById('signature-pad');
        const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
        const hasSignature = imageData.data.some(channel => channel !== 0);

        if (!hasSignature) {
            authSystem.showNotification('Se requiere la firma del cliente', 'error');
            return;
        }

        const newCollection = {
            id: this.collections.length + 1,
            ...formData,
            signature: canvas.toDataURL(),
            photos: []
        };

        this.collections.push(newCollection);
        authSystem.showNotification('Recolección registrada exitosamente', 'success');
        
        document.getElementById('collection-form').reset();
        this.clearSignature();
        document.getElementById('photo-preview').classList.add('hidden');

        this.load(); // Reload the whole view
    },

    saveDraft() {
        authSystem.showNotification('Borrador guardado', 'info');
    },

    getStatusClass(status) {
        const classes = {
            'Completado': 'bg-green-100 text-green-800',
            'En Progreso': 'bg-yellow-100 text-yellow-800',
            'Pendiente': 'bg-blue-100 text-blue-800',
            'Cancelado': 'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }
};
