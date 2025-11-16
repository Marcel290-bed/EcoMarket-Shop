// Utilidades comunes para EcoMarket
const Utils = {
    // Formatear precio en pesos colombianos
    formatPrice: function(price) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    },

    // Alias para compatibilidad
    formatCurrency: function(amount) {
        return this.formatPrice(amount);
    },

    // Formatear fecha
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    },

    // Normalizar texto (remover acentos y convertir a minúsculas)
    normalizeText: function(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    },

    // Sanitizar HTML para prevenir XSS
    sanitizeHTML: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Alias para compatibilidad
    sanitizeInput: function(input) {
        return this.sanitizeHTML(input);
    },

    // Validar email
    validateEmail: function(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    // Validar teléfono (formato internacional simple)
    validatePhone: function(phone) {
        const regex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
        return phone === '' || regex.test(phone);
    },

    // Debounce para búsquedas en tiempo real
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Mostrar notificación toast
    showToast: function(message, type = 'success') {
        const toastContainer = document.getElementById('toastContainer') || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${this.sanitizeHTML(message)}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    },

    // Alias para compatibilidad
    showNotification: function(message, type = 'info') {
        this.showToast(message, type);
    },

    // Crear contenedor de toasts
    createToastContainer: function() {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }
        return container;
    },

    // Mostrar alerta de confirmación
    confirm: function(message, onConfirm, onCancel) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Confirmación</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>${this.sanitizeHTML(message)}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="cancelBtn">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="confirmBtn">Confirmar</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        
        modal.querySelector('#confirmBtn').addEventListener('click', () => {
            bsModal.hide();
            if (onConfirm) onConfirm();
        });
        
        modal.querySelector('#cancelBtn').addEventListener('click', () => {
            bsModal.hide();
            if (onCancel) onCancel();
        });
        
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
        
        bsModal.show();
    },

    // Generar badges de etiquetas ecológicas
    generateEcoLabels: function(labels) {
        const badges = {
            'orgánico': '<span class="badge bg-success me-1">🌱 Orgánico</span>',
            'biodegradable': '<span class="badge bg-info me-1">♻️ Biodegradable</span>',
            'vegano': '<span class="badge bg-warning text-dark me-1">🌿 Vegano</span>'
        };
        
        return labels.map(label => badges[label] || '').join('');
    },

    // Calcular ganancia
    calculateProfit: function(price, cost, quantity = 1) {
        return (price - cost) * quantity;
    },

    // Validar que precio sea mayor que costo
    validatePricing: function(price, cost) {
        return parseFloat(price) > parseFloat(cost);
    },

    // Generar slug desde nombre
    generateSlug: function(text) {
        return this.normalizeText(text)
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    // Generar ID único
    generateUniqueId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Scroll suave a elemento
    scrollToElement: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    // Cargar imagen con lazy loading
    lazyLoadImage: function(imgElement, src) {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        imgElement.src = src;
                        observer.unobserve(imgElement);
                    }
                });
            });
            observer.observe(imgElement);
        } else {
            imgElement.src = src;
        }
    },

    // Obtener nombre de mes
    getMonthName: function(monthNumber) {
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return months[monthNumber - 1] || '';
    },

    // Obtener año actual
    getCurrentYear: function() {
        return new Date().getFullYear();
    },

    // Validar formulario
    validateForm: function(formElement) {
        if (!formElement.checkValidity()) {
            formElement.classList.add('was-validated');
            return false;
        }
        return true;
    },

    // Resetear validación de formulario
    resetFormValidation: function(formElement) {
        formElement.classList.remove('was-validated');
        formElement.reset();
    },

    // Generar colores para gráficos
    generateChartColors: function(count) {
        const colors = [
            '#28a745', '#20c997', '#17a2b8', '#007bff', '#6610f2',
            '#6f42c1', '#e83e8c', '#dc3545', '#fd7e14', '#ffc107'
        ];
        return colors.slice(0, count);
    },

    // Exportar a CSV
    exportToCSV: function(data, filename) {
        if (!data || !data.length) return;
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    },

    // Verificar permisos de rol
    checkPermission: function(requiredRole) {
        const currentUser = sessionStorage.getItem('currentUser');
        if (!currentUser) return false;
        
        const user = JSON.parse(currentUser);
        const rolePermissions = {
            'Administrador': ['RF1', 'RF2', 'RF3', 'RF4', 'RF5', 'RF6', 'RF7', 'RF8'],
            'Vendedor': ['RF1', 'RF2', 'RF6', 'RF7'],
            'Usuario Final': ['RF3', 'RF4', 'RF7']
        };
        
        return rolePermissions[user.role]?.includes(requiredRole) || false;
    }
};
