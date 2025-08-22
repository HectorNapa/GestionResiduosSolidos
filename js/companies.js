// Sistema de gestión de empresas para EcoGestión
class CompanyManager {
    constructor() {
        this.companies = [
            {
                id: 1,
                name: 'Industrias Metalúrgicas del Norte',
                code: 'IMN-001',
                type: 'industrial',
                address: 'Av. Industrial 1234, Zona Norte',
                city: 'Ciudad Industrial',
                phone: '+54 11 4567-8901',
                email: 'contacto@imn.com.ar',
                contactPerson: 'Ing. Carlos Mendoza',
                description: 'Empresa dedicada a la fabricación de componentes metálicos',
                wasteTypes: ['Metales', 'Residuos Industriales', 'Aceites Usados'],
                serviceLevel: 'Premium',
                active: true
            },
            {
                id: 2,
                name: 'Comercial MegaCenter',
                code: 'CMC-002',
                type: 'comercial',
                address: 'Centro Comercial Plaza Mayor, Local 45',
                city: 'Centro Comercial',
                phone: '+54 11 2345-6789',
                email: 'info@megacenter.com.ar',
                contactPerson: 'Lic. Ana García',
                description: 'Centro comercial con múltiples tiendas y restaurantes',
                wasteTypes: ['Orgánicos', 'Cartón y Papel', 'Plásticos', 'Vidrio'],
                serviceLevel: 'Estándar',
                active: true
            },
            {
                id: 3,
                name: 'Hospital San Martín',
                code: 'HSM-003',
                type: 'salud',
                address: 'Calle Salud 567, Barrio San Martín',
                city: 'Zona Hospitalaria',
                phone: '+54 11 3456-7890',
                email: 'administracion@hospitalsanmartin.com.ar',
                contactPerson: 'Dr. Roberto Silva',
                description: 'Hospital público con servicios de emergencia y especialidades',
                wasteTypes: ['Residuos Patogénicos', 'Orgánicos', 'Papel', 'Plásticos'],
                serviceLevel: 'Premium',
                active: true
            },
            {
                id: 4,
                name: 'Universidad Tecnológica Nacional',
                code: 'UTN-004',
                type: 'educativo',
                address: 'Av. Universidad 890, Campus Central',
                city: 'Distrito Universitario',
                phone: '+54 11 4567-8901',
                email: 'sustentabilidad@utn.edu.ar',
                contactPerson: 'Prof. María López',
                description: 'Universidad pública con múltiples facultades y laboratorios',
                wasteTypes: ['Electrónicos', 'Papel', 'Orgánicos', 'Químicos'],
                serviceLevel: 'Estándar',
                active: true
            },
            {
                id: 5,
                name: 'Restaurante El Gourmet',
                code: 'REG-005',
                type: 'gastronomía',
                address: 'Calle Gastronómica 234, Zona Gourmet',
                city: 'Distrito Gastronómico',
                phone: '+54 11 5678-9012',
                email: 'reservas@elgourmet.com.ar',
                contactPerson: 'Chef Alejandro Torres',
                description: 'Restaurante de alta cocina con certificación orgánica',
                wasteTypes: ['Orgánicos', 'Aceites Usados', 'Vidrio', 'Cartón'],
                serviceLevel: 'Básico',
                active: true
            },
            {
                id: 6,
                name: 'Farmacia Central',
                code: 'FAC-006',
                type: 'farmacéutico',
                address: 'Av. Principal 456, Centro',
                city: 'Centro Comercial',
                phone: '+54 11 6789-0123',
                email: 'ventas@farmaciacentral.com.ar',
                contactPerson: 'Lic. Patricia Ruiz',
                description: 'Farmacia con amplia variedad de productos y servicios',
                wasteTypes: ['Farmacéuticos', 'Papel', 'Plásticos', 'Vidrio'],
                serviceLevel: 'Estándar',
                active: true
            },
            {
                id: 7,
                name: 'Hotel Plaza Mayor',
                code: 'HPM-007',
                type: 'hotelería',
                address: 'Plaza Mayor 789, Centro Histórico',
                city: 'Centro Turístico',
                phone: '+54 11 7890-1234',
                email: 'reservas@hotelplazamayor.com.ar',
                contactPerson: 'Lic. Diego Fernández',
                description: 'Hotel 4 estrellas con servicios de conferencias y eventos',
                wasteTypes: ['Orgánicos', 'Papel', 'Plásticos', 'Textiles'],
                serviceLevel: 'Premium',
                active: true
            },
            {
                id: 8,
                name: 'Supermercado Familia',
                code: 'SUF-008',
                type: 'retail',
                address: 'Av. Comercial 321, Barrio Residencial',
                city: 'Zona Residencial',
                phone: '+54 11 8901-2345',
                email: 'atencion@supermercadofamilia.com.ar',
                contactPerson: 'Sr. Luis Martínez',
                description: 'Supermercado de barrio con productos frescos y de primera necesidad',
                wasteTypes: ['Orgánicos', 'Cartón', 'Plásticos', 'Vidrio'],
                serviceLevel: 'Básico',
                active: true
            }
        ];
        
        this.selectedCompany = null;
        this.init();
    }
    
    init() {
        // Cargar empresa seleccionada desde localStorage
        const savedCompany = localStorage.getItem('selected_company');
        if (savedCompany) {
            this.selectedCompany = JSON.parse(savedCompany);
        }
        
        this.setupCompanySelector();
    }
    
    setupCompanySelector() {
        const selector = document.getElementById('company-selector');
        if (selector) {
            this.populateCompanySelector(selector);
            selector.value = this.selectedCompany ? this.selectedCompany.id : '';
            selector.addEventListener('change', (e) => {
                this.selectCompany(parseInt(e.target.value));
            });
        }
    }
    
    populateCompanySelector(selector) {
        // Limpiar opciones existentes
        selector.innerHTML = '<option value="" data-translate="company-placeholder">Seleccione una empresa</option>';
        
        // Agregar empresas activas
        this.companies.filter(company => company.active).forEach(company => {
            const option = document.createElement('option');
            option.value = company.id;
            option.textContent = `${company.name} (${company.code})`;
            selector.appendChild(option);
        });
    }
    
    selectCompany(companyId) {
        if (companyId) {
            this.selectedCompany = this.companies.find(c => c.id === companyId);
            localStorage.setItem('selected_company', JSON.stringify(this.selectedCompany));
        } else {
            this.selectedCompany = null;
            localStorage.removeItem('selected_company');
        }
        
        // Aplicar traducciones después del cambio
        if (window.translationManager) {
            translationManager.applyTranslations();
        }
    }
    
    getSelectedCompany() {
        return this.selectedCompany;
    }
    
    getAllCompanies() {
        return this.companies;
    }
    
    getCompanyById(id) {
        return this.companies.find(c => c.id === id);
    }
    
    getCompaniesByType(type) {
        return this.companies.filter(c => c.type === type && c.active);
    }
    
    addCompany(companyData) {
        const newCompany = {
            id: Math.max(...this.companies.map(c => c.id)) + 1,
            ...companyData,
            active: true
        };
        this.companies.push(newCompany);
        return newCompany;
    }
    
    updateCompany(id, companyData) {
        const index = this.companies.findIndex(c => c.id === id);
        if (index !== -1) {
            this.companies[index] = { ...this.companies[index], ...companyData };
            return this.companies[index];
        }
        return null;
    }
    
    deleteCompany(id) {
        const index = this.companies.findIndex(c => c.id === id);
        if (index !== -1) {
            this.companies[index].active = false;
            return true;
        }
        return false;
    }
    
    // Métodos para obtener estadísticas de empresas
    getCompanyStats() {
        const total = this.companies.length;
        const active = this.companies.filter(c => c.active).length;
        const byType = {};
        
        this.companies.forEach(company => {
            if (!byType[company.type]) {
                byType[company.type] = 0;
            }
            byType[company.type]++;
        });
        
        return {
            total,
            active,
            byType
        };
    }
}

// Crear instancia global
const companyManager = new CompanyManager();

// Función global para obtener la empresa seleccionada
function getSelectedCompany() {
    return companyManager.getSelectedCompany();
}

// Función global para obtener todas las empresas
function getAllCompanies() {
    return companyManager.getAllCompanies();
}
