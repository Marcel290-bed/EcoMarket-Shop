// Búsqueda y Filtros en Tiempo Real - RF4
const SearchManager = {
    allProducts: [],
    filteredProducts: [],

    init: function() {
        this.allProducts = StorageManager.readAll('products') || [];
        this.setupSearchInput();
        this.setupFilters();
        this.loadCategoryFilter();
    },

    // Cargar solo productos destacados para el landing page (sin filtros)
    loadFeaturedProducts: function() {
        const products = StorageManager.readAll('products') || [];
        // Solo mostrar productos disponibles, máximo 4
        const featuredProducts = products.filter(p => p.status === 'disponible').slice(0, 4);
        ProductManager.renderProductsGrid(featuredProducts, 'productsGrid');
    },

    setupSearchInput: function() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        const debouncedSearch = Utils.debounce(() => this.performSearch(), 300);
        searchInput.addEventListener('input', debouncedSearch);
    },

    setupFilters: function() {
        const categoryFilter = document.getElementById('categoryFilter');
        const ecoLabelFilter = document.getElementById('ecoLabelFilter');
        const statusFilter = document.getElementById('statusFilter');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.performSearch());
        }

        if (ecoLabelFilter) {
            ecoLabelFilter.addEventListener('change', () => this.performSearch());
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.performSearch());
        }
    },

    loadCategoryFilter: function() {
        const categoryFilter = document.getElementById('categoryFilter');
        if (!categoryFilter) return;

        const categories = StorageManager.readAll('categories') || [];
        categoryFilter.innerHTML = '<option value="">Todas las categorías</option>' +
            categories.map(cat => `<option value="${cat.id}">${Utils.sanitizeHTML(cat.name)}</option>`).join('');
    },

    performSearch: function() {
        this.allProducts = StorageManager.readAll('products') || [];
        
        const searchTerm = document.getElementById('searchInput')?.value.trim() || '';
        const categoryId = document.getElementById('categoryFilter')?.value || '';
        const ecoLabel = document.getElementById('ecoLabelFilter')?.value || '';
        const status = document.getElementById('statusFilter')?.value || '';

        this.filteredProducts = this.allProducts.filter(product => {
            // Filtro por palabra clave (insensible a mayúsculas y acentos)
            const searchMatch = !searchTerm || this.matchesSearch(product, searchTerm);
            
            // Filtro por categoría
            const categoryMatch = !categoryId || product.categoryId === parseInt(categoryId);
            
            // Filtro por etiqueta ecológica
            const ecoLabelMatch = !ecoLabel || product.ecoLabels.includes(ecoLabel);

            return searchMatch && categoryMatch && ecoLabelMatch;
        });

        this.displayResults();
    },

    matchesSearch: function(product, searchTerm) {
        const normalizedTerm = Utils.normalizeText(searchTerm);
        
        const categories = StorageManager.readAll('categories');
        const category = categories.find(c => c.id === product.categoryId);
        const categoryName = category ? category.name : '';
        
        const searchableText = Utils.normalizeText(
            `${product.name} ${product.description} ${categoryName} ${product.ecoLabels.join(' ')}`
        );

        return searchableText.includes(normalizedTerm);
    },

    displayResults: function() {
        const resultsCount = document.getElementById('searchResultsCount');
        if (resultsCount) {
            resultsCount.textContent = `${this.filteredProducts.length} producto(s) encontrado(s)`;
        }

        ProductManager.renderProductsGrid(this.filteredProducts, 'productsGrid');
    },

    clearFilters: function() {
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const ecoLabelFilter = document.getElementById('ecoLabelFilter');
        const statusFilter = document.getElementById('statusFilter');

        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = '';
        if (ecoLabelFilter) ecoLabelFilter.value = '';
        if (statusFilter) statusFilter.value = '';

        this.performSearch();
    }
};

document.addEventListener('DOMContentLoaded', function() {
    SearchManager.init();
});
