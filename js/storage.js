// Gestión del almacenamiento local para EcoMarket
const StorageManager = {
    // Inicializar datos por defecto
    init: function() {
        if (!localStorage.getItem('categories')) {
            const defaultCategories = [
                { id: 1, name: 'Alimentos Orgánicos' },
                { id: 2, name: 'Productos de Limpieza' },
                { id: 3, name: 'Cosméticos Naturales' },
                { id: 4, name: 'Textiles Sostenibles' },
                { id: 5, name: 'Cuidado Personal' }
            ];
            this.save('categories', defaultCategories);
        }

        if (!localStorage.getItem('products')) {
            this.save('products', []);
        }

        if (!localStorage.getItem('users')) {
            const defaultUsers = [
                {
                    id: 1,
                    username: 'admin',
                    password: 'admin123',
                    fullName: 'Administrador del Sistema',
                    email: 'admin@ecomarket.com',
                    phone: '+1234567890',
                    role: 'Administrador',
                    registrationDate: new Date().toISOString().split('T')[0]
                }
            ];
            this.save('users', defaultUsers);
        }

        if (!localStorage.getItem('sales')) {
            this.save('sales', []);
        }

        if (!localStorage.getItem('wishlist')) {
            this.save('wishlist', []);
        }
    },

    // Guardar datos en localStorage
    save: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    },

    // Obtener datos de localStorage
    get: function(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    },

    // Guardar en sessionStorage
    saveSession: function(key, data) {
        try {
            sessionStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error saving to sessionStorage:', e);
            return false;
        }
    },

    // Obtener de sessionStorage
    getSession: function(key) {
        try {
            const data = sessionStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error reading from sessionStorage:', e);
            return null;
        }
    },

    // Generar ID único para una colección
    generateId: function(key) {
        const items = this.get(key) || [];
        return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    },

    // CRUD Operations
    // Crear un nuevo elemento
    create: function(key, item) {
        const items = this.get(key) || [];
        item.id = this.generateId(key);
        items.push(item);
        this.save(key, items);
        return item;
    },

    // Leer todos los elementos
    readAll: function(key) {
        return this.get(key) || [];
    },

    // Leer un elemento por ID
    readById: function(key, id) {
        const items = this.get(key) || [];
        return items.find(item => item.id === parseInt(id));
    },

    // Actualizar un elemento
    update: function(key, id, updatedItem) {
        const items = this.get(key) || [];
        const index = items.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
            items[index] = { ...items[index], ...updatedItem, id: parseInt(id) };
            this.save(key, items);
            return items[index];
        }
        return null;
    },

    // Eliminar un elemento
    delete: function(key, id) {
        const items = this.get(key) || [];
        const filteredItems = items.filter(item => item.id !== parseInt(id));
        this.save(key, filteredItems);
        return filteredItems.length < items.length;
    },

    // Buscar elementos con filtros
    search: function(key, filterFn) {
        const items = this.get(key) || [];
        return items.filter(filterFn);
    },

    // Limpiar almacenamiento (para testing)
    clear: function() {
        localStorage.clear();
        sessionStorage.clear();
        this.init();
    },

    // Exportar datos (para backup)
    export: function() {
        return {
            categories: this.get('categories'),
            products: this.get('products'),
            users: this.get('users'),
            sales: this.get('sales')
        };
    },

    // Importar datos (para restore)
    import: function(data) {
        if (data.categories) this.save('categories', data.categories);
        if (data.products) this.save('products', data.products);
        if (data.users) this.save('users', data.users);
        if (data.sales) this.save('sales', data.sales);
    }
};

// Inicializar al cargar
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        StorageManager.init();
    });
}
