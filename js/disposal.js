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
        },
        {
            id: 2,
            batchNumber: 'D-2024-002',
            date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
            wasteType: 'Peligroso',
            weight: 5.8,
            disposalMethod: 'Incineración',
            facility: 'Planta de Incineración Industrial',
            transportVehicle: 'T-HAZ-002',
            status: 'Completado',
            operator: 'Ana García',
            environmentalPermit: 'ENV-2024-INC-003',
            cost: 2340.00,
            notes: 'Residuos químicos de laboratorio - seguimiento especial realizado'
        },
        {
            id: 3,
            batchNumber: 'D-2024-003',
            date: new Date(Date.now() - 172800000).toISOString().slice(0, 10),
            wasteType: 'Orgánico',
            weight: 18.2,
            disposalMethod: 'Compostaje',
            facility: 'Centro de Compostaje Municipal',
            transportVehicle: 'T-ORG-001',
            status: 'Completado',
            operator: 'Carlos Ruiz',
            environmentalPermit: 'ENV-2024-COMP-002',
            cost: 450.00,
            notes: 'Residuos de mercados y restaurantes - proceso de valorización exitoso'
        },
        {
            id: 4,
            batchNumber: 'D-2024-004',
            date: new Date(Date.now() - 259200000).toISOString().slice(0, 10),
            wasteType: 'Peligroso',
            weight: 3.1,
            disposalMethod: 'Encapsulamiento',
            facility: 'Centro de Tratamiento de Residuos Peligrosos',
            transportVehicle: 'T-HAZ-003',
            status: 'Completado',
            operator: 'María López',
            environmentalPermit: 'ENV-2024-ENC-001',
            cost: 1850.00,
            notes: 'Residuos con metales pesados - encapsulamiento en matriz cementizia'
        },
        {
            id: 5,
            batchNumber: 'D-2024-005',
            date: new Date(Date.now() - 345600000).toISOString().slice(0, 10),
            wasteType: 'Reciclable',
            weight: 12.7,
            disposalMethod: 'Reciclaje',
            facility: 'Planta de Reciclaje Industrial',
            transportVehicle: 'T-REC-001',
            status: 'Completado',
            operator: 'Pedro Morales',
            environmentalPermit: 'ENV-2024-REC-004',
            cost: 380.00,
            notes: 'Materiales plásticos y metálicos - 98% de aprovechamiento logrado'
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
                                        <div><strong>Técnico:</strong> ${d.operator}</div>
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
        
        const disposalDetails = this.getDisposalDetails(d.wasteType, d.disposalMethod);
        const certificateHtml = this.generateCertificateHtml(d, disposalDetails);
        
        const win = window.open('', '_blank');
        win.document.write(certificateHtml);
        win.document.close();
        win.focus();
        win.print();
    },

    // Obtener detalles específicos del método de disposición según el tipo de residuo
    getDisposalDetails(wasteType, disposalMethod) {
        const disposalMatrix = {
            'No Reciclable': {
                'Relleno Sanitario': {
                    process: 'Disposición en Relleno Sanitario Controlado',
                    description: 'Los residuos no reciclables fueron dispuestos en relleno sanitario autorizado, siguiendo protocolos de compactación, cobertura diaria y control de lixiviados.',
                    environmentalControls: [
                        'Control de lixiviados mediante sistema de drenaje',
                        'Cobertura diaria con material inerte',
                        'Compactación mecánica para optimización del espacio',
                        'Monitoreo de gases de descomposición'
                    ],
                    regulations: ['Decreto 2981 de 2013', 'Resolución 0754 de 2014'],
                    validityYears: 30
                },
                'Incineración': {
                    process: 'Incineración Controlada con Recuperación Energética',
                    description: 'Los residuos fueron sometidos a proceso de incineración a alta temperatura con sistemas de control de emisiones y recuperación energética.',
                    environmentalControls: [
                        'Tratamiento de gases con filtros de mangas',
                        'Control de dioxinas y furanos',
                        'Recuperación energética mediante calderas',
                        'Monitoreo continuo de emisiones'
                    ],
                    regulations: ['Resolución 0909 de 2008', 'Decreto 4741 de 2005'],
                    validityYears: 'Indefinido'
                }
            },
            'Peligroso': {
                'Incineración': {
                    process: 'Incineración de Residuos Peligrosos en Horno Especializado',
                    description: 'Los residuos peligrosos fueron tratados mediante incineración a alta temperatura (>1100°C) en horno rotatorio especializado con sistemas avanzados de control de emisiones.',
                    environmentalControls: [
                        'Incineración a temperatura >1100°C',
                        'Sistema de lavado de gases ácidos',
                        'Filtración con carbón activado',
                        'Neutralización de cenizas resultantes',
                        'Monitoreo continuo de metales pesados'
                    ],
                    regulations: ['Decreto 4741 de 2005', 'Resolución 1402 de 2006'],
                    validityYears: 'Indefinido'
                },
                'Tratamiento Fisicoquímico': {
                    process: 'Tratamiento Fisicoquímico Especializado',
                    description: 'Los residuos peligrosos fueron sometidos a procesos de neutralización, precipitación y estabilización química para reducir su peligrosidad.',
                    environmentalControls: [
                        'Neutralización de pH mediante reactivos químicos',
                        'Precipitación de metales pesados',
                        'Estabilización química de contaminantes',
                        'Análisis de lixiviación TCLP',
                        'Disposición final de lodos estabilizados'
                    ],
                    regulations: ['Decreto 4741 de 2005', 'Resolución 1402 de 2006'],
                    validityYears: 'Indefinido'
                },
                'Encapsulamiento': {
                    process: 'Encapsulamiento en Matriz Cementizia',
                    description: 'Los residuos peligrosos fueron inmovilizados mediante encapsulamiento en matriz cementizia, creando una barrera física que impide la migración de contaminantes.',
                    environmentalControls: [
                        'Mezcla con cemento Portland tipo I',
                        'Pruebas de integridad estructural',
                        'Análisis de lixiviación post-encapsulamiento',
                        'Disposición en celda de seguridad',
                        'Monitoreo a largo plazo'
                    ],
                    regulations: ['Decreto 4741 de 2005', 'Resolución 1402 de 2006'],
                    validityYears: 'Indefinido'
                }
            },
            'Orgánico': {
                'Compostaje': {
                    process: 'Compostaje Aeróbico Controlado',
                    description: 'Los residuos orgánicos fueron procesados mediante compostaje aeróbico, transformándolos en abono orgánico aprovechable.',
                    environmentalControls: [
                        'Control de temperatura (55-65°C)',
                        'Volteo periódico para aireación',
                        'Control de humedad (50-60%)',
                        'Monitoreo de pH y nutrientes',
                        'Cribado y maduración del compost'
                    ],
                    regulations: ['Decreto 2981 de 2013', 'NTC 5167'],
                    validityYears: 'N/A - Valorización'
                },
                'Biodigestión': {
                    process: 'Digestión Anaeróbica con Recuperación de Biogás',
                    description: 'Los residuos orgánicos fueron procesados mediante digestión anaeróbica, generando biogás aprovechable y digestato estabilizado.',
                    environmentalControls: [
                        'Control de temperatura mesofílica (35-40°C)',
                        'Monitoreo de pH y alcalinidad',
                        'Captura y aprovechamiento de biogás',
                        'Tratamiento del digestato líquido',
                        'Control de olores'
                    ],
                    regulations: ['Decreto 2981 de 2013', 'Resolución 0754 de 2014'],
                    validityYears: 'N/A - Valorización'
                }
            },
            'Reciclable': {
                'Reciclaje': {
                    process: 'Procesamiento para Reciclaje',
                    description: 'Los materiales reciclables fueron clasificados, procesados y reintegrados a la cadena productiva como materia prima secundaria.',
                    environmentalControls: [
                        'Clasificación por tipo de material',
                        'Limpieza y acondicionamiento',
                        'Trituración o compactación según material',
                        'Control de calidad del material recuperado',
                        'Trazabilidad del material reciclado'
                    ],
                    regulations: ['Decreto 2981 de 2013', 'Resolución 2184 de 2019'],
                    validityYears: 'N/A - Valorización'
                }
            }
        };

        return disposalMatrix[wasteType]?.[disposalMethod] || {
            process: 'Proceso de Disposición Especializado',
            description: 'El residuo fue tratado mediante proceso especializado según su clasificación y características.',
            environmentalControls: ['Cumplimiento de normativa ambiental vigente'],
            regulations: ['Decreto 2981 de 2013'],
            validityYears: 'Según normativa'
        };
    },

    // Generar HTML completo del certificado
    generateCertificateHtml(disposal, details) {
        const currentDate = new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const certNumber = `CERT-${disposal.batchNumber}-${new Date().getFullYear()}`;
        
        return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Certificado de Disposición Final - ${disposal.batchNumber}</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 20px;
                    background-color: #f8f9fa;
                }
                .certificate {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border: 3px solid #2563eb;
                }
                .header {
                    text-align: center;
                    border-bottom: 3px solid #2563eb;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    color: #2563eb;
                    margin-bottom: 10px;
                }
                .cert-title {
                    font-size: 28px;
                    font-weight: bold;
                    color: #1f2937;
                    margin: 10px 0;
                }
                .cert-number {
                    background: #f3f4f6;
                    padding: 8px 16px;
                    border-radius: 20px;
                    display: inline-block;
                    font-weight: bold;
                    color: #6b7280;
                    margin-top: 10px;
                }
                .main-content {
                    margin: 30px 0;
                }
                .disposal-info {
                    background: #f8fafc;
                    padding: 20px;
                    border-radius: 8px;
                    border-left: 4px solid #10b981;
                    margin: 20px 0;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin: 20px 0;
                }
                .info-item {
                    display: flex;
                    flex-direction: column;
                }
                .info-label {
                    font-weight: bold;
                    color: #374151;
                    font-size: 14px;
                    margin-bottom: 4px;
                }
                .info-value {
                    color: #1f2937;
                    font-size: 16px;
                }
                .process-section {
                    background: #fef3c7;
                    padding: 20px;
                    border-radius: 8px;
                    border-left: 4px solid #f59e0b;
                    margin: 20px 0;
                }
                .controls-section {
                    background: #ecfdf5;
                    padding: 20px;
                    border-radius: 8px;
                    border-left: 4px solid #059669;
                    margin: 20px 0;
                }
                .controls-list {
                    list-style: none;
                    padding: 0;
                }
                .controls-list li {
                    padding: 5px 0;
                    position: relative;
                    padding-left: 20px;
                }
                .controls-list li:before {
                    content: "✓";
                    color: #059669;
                    font-weight: bold;
                    position: absolute;
                    left: 0;
                }
                .regulations {
                    background: #ede9fe;
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 4px solid #7c3aed;
                    margin: 20px 0;
                }
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 2px solid #e5e7eb;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                }
                .signature-box {
                    text-align: center;
                    padding: 20px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                }
                .validity {
                    background: #fef2f2;
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 4px solid #ef4444;
                    margin: 20px 0;
                    text-align: center;
                }
                .qr-placeholder {
                    width: 80px;
                    height: 80px;
                    background: #f3f4f6;
                    border: 2px dashed #9ca3af;
                    margin: 10px auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    color: #6b7280;
                }
                @media print {
                    body { background-color: white; }
                    .certificate { box-shadow: none; }
                }
            </style>
        </head>
        <body>
            <div class="certificate">
                <div class="header">
                    <div class="logo">🌱 EcoGestión - Sistema de Gestión de Residuos Sólidos</div>
                    <div class="cert-title">CERTIFICADO DE DISPOSICIÓN FINAL</div>
                    <div class="cert-number">Certificado N° ${certNumber}</div>
                </div>

                <div class="main-content">
                    <p style="text-align: justify; font-size: 16px; margin-bottom: 25px;">
                        Por medio del presente documento, <strong>EcoGestión S.A.S.</strong>, empresa debidamente 
                        autorizada para el manejo integral de residuos sólidos, <strong>CERTIFICA</strong> que se ha 
                        realizado la disposición final de los residuos descritos a continuación, cumpliendo con la 
                        normatividad ambiental vigente y las mejores prácticas del sector.
                    </p>

                    <div class="disposal-info">
                        <h3 style="margin-top: 0; color: #059669;">📋 Información de la Disposición</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Número de Lote:</span>
                                <span class="info-value">${disposal.batchNumber}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Fecha de Disposición:</span>
                                <span class="info-value">${this.formatDate(disposal.date)}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Tipo de Residuo:</span>
                                <span class="info-value">${disposal.wasteType}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Peso Total:</span>
                                <span class="info-value">${disposal.weight} Toneladas</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Instalación de Tratamiento:</span>
                                <span class="info-value">${disposal.facility}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Vehículo de Transporte:</span>
                                <span class="info-value">${disposal.transportVehicle}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Permiso Ambiental:</span>
                                <span class="info-value">${disposal.environmentalPermit}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Técnico Responsable:</span>
                                <span class="info-value">${disposal.operator}</span>
                            </div>
                        </div>
                    </div>

                    <div class="process-section">
                        <h3 style="margin-top: 0; color: #d97706;">⚙️ ${details.process}</h3>
                        <p style="text-align: justify;">${details.description}</p>
                    </div>

                    <div class="controls-section">
                        <h3 style="margin-top: 0; color: #059669;">🛡️ Controles Ambientales Aplicados</h3>
                        <ul class="controls-list">
                            ${details.environmentalControls.map(control => `<li>${control}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="regulations">
                        <h3 style="margin-top: 0; color: #7c3aed;">📋 Marco Normativo</h3>
                        <p><strong>Normativas aplicadas:</strong> ${details.regulations.join(', ')}</p>
                    </div>

                    <div class="validity">
                        <h3 style="margin-top: 0; color: #dc2626;">⏰ Validez del Certificado</h3>
                        <p><strong>Validez:</strong> ${details.validityYears === 'Indefinido' ? 'Indefinida - Disposición Permanente' : 
                           details.validityYears === 'N/A - Valorización' ? 'No Aplica - Proceso de Valorización' : 
                           `${details.validityYears} años desde la fecha de disposición`}</p>
                    </div>

                    ${disposal.notes ? `
                    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="margin-top: 0; color: #374151;">📝 Observaciones Adicionales</h4>
                        <p>${disposal.notes}</p>
                    </div>
                    ` : ''}
                </div>

                <div class="footer">
                    <div class="signature-box">
                        <div class="qr-placeholder">Código QR<br>Verificación</div>
                        <p style="margin: 15px 0 5px 0; font-weight: bold;">Ing. ${disposal.operator}</p>
                        <p style="margin: 0; font-size: 14px; color: #6b7280;">Especialista en Disposición Final</p>
                        <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">Registro Profesional: ENV-${disposal.id.toString().padStart(4, '0')}</p>
                    </div>
                    <div class="signature-box">
                        <div class="qr-placeholder">Sello<br>Empresa</div>
                        <p style="margin: 15px 0 5px 0; font-weight: bold;">EcoGestión S.A.S.</p>
                        <p style="margin: 0; font-size: 14px; color: #6b7280;">Gestión Integral de Residuos</p>
                        <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">NIT: 900.123.456-7</p>
                        <p style="margin: 0; font-size: 12px; color: #6b7280;">Licencia Ambiental: LA-2024-001</p>
                    </div>
                </div>

                <div style="margin-top: 30px; padding: 15px; background: #f9fafb; border-radius: 8px; text-align: center; font-size: 12px; color: #6b7280;">
                    <p style="margin: 0;"><strong>Fecha de Emisión:</strong> ${currentDate}</p>
                    <p style="margin: 5px 0 0 0;">Este certificado puede ser verificado en: www.ecogestion.com/verificar con el código ${certNumber}</p>
                </div>
            </div>

            <script>
                window.onload = function() {
                    // Auto-print after a brief delay
                    setTimeout(function() {
                        if (confirm('¿Desea imprimir el certificado ahora?')) {
                            window.print();
                        }
                    }, 1000);
                };
            </script>
        </body>
        </html>
        `;
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