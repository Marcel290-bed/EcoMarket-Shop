// Gestión de Productos - RF2
const ProductManager = {
    products: [],

    init: function() {
        this.loadProducts();
    },

    loadProducts: function() {
        this.products = StorageManager.readAll('products') || [];
        return this.products;
    },

    renderProductsGrid: function(products = null, containerId = 'productsGrid') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const displayProducts = products || this.loadProducts();

        if (displayProducts.length === 0) {
            container.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">No hay productos disponibles</p></div>';
            return;
        }

        container.innerHTML = displayProducts.map(product => this.createProductCard(product)).join('');
    },

    createProductCard: function(product) {
        const categories = StorageManager.readAll('categories');
        const category = categories.find(c => c.id === product.categoryId);
        const categoryName = category ? category.name : 'Sin categoría';

        return `
            <div class="col-md-6 col-lg-4 col-xl-3">
                <div class="card product-card h-100">
                    <img src="${product.image}" class="card-img-top" alt="${Utils.sanitizeHTML(product.name)}" style="height: 200px; object-fit: cover;" loading="lazy">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${Utils.sanitizeHTML(product.name)}</h5>
                        <p class="card-text text-muted small">${Utils.sanitizeHTML(categoryName)}</p>
                        <p class="card-text flex-grow-1">${Utils.sanitizeHTML(product.description.substring(0, 100))}...</p>
                        <div class="mb-2">
                            ${Utils.generateEcoLabels(product.ecoLabels)}
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h4 class="text-success mb-0">${Utils.formatPrice(product.price)}</h4>
                        </div>
                        <a href="views/detalle.html?id=${product.id}" class="btn btn-success w-100">
                            <i class="bi bi-eye"></i> Ver Detalle
                        </a>
                    </div>
                </div>
            </div>
        `;
    },

    renderProductsTable: function(containerId = 'productsTableBody') {
        const tbody = document.getElementById(containerId);
        if (!tbody) return;

        this.loadProducts();
        
        const currentUser = AuthManager.getCurrentUser();
        let displayProducts = this.products;
        
        // Los usuarios ven solo sus productos, los admins ven todos
        if (currentUser && currentUser.role === 'Usuario') {
            displayProducts = this.products.filter(p => p.createdBy === currentUser.id);
        }

        if (displayProducts.length === 0) {
            const message = currentUser?.role === 'Usuario' 
                ? 'No has publicado productos aún. Crea tu primer producto usando el botón "Nuevo Producto".' 
                : 'No hay productos registrados';
            tbody.innerHTML = `<tr><td colspan="9" class="text-center">${message}</td></tr>`;
            return;
        }

        tbody.innerHTML = displayProducts.map(product => {
            const categories = StorageManager.readAll('categories');
            const category = categories.find(c => c.id === product.categoryId);
            const categoryName = category ? category.name : 'Sin categoría';

            return `
                <tr>
                    <td>${product.id}</td>
                    <td><img src="${product.image}" alt="${Utils.sanitizeHTML(product.name)}" style="width: 50px; height: 50px; object-fit: cover;"></td>
                    <td>${Utils.sanitizeHTML(product.name)}</td>
                    <td>${categoryName}</td>
                    <td>${Utils.formatPrice(product.cost)}</td>
                    <td>${Utils.formatPrice(product.price)}</td>
                    <td>${Utils.generateEcoLabels(product.ecoLabels)}</td>

                    <td>
                        <button class="btn btn-sm btn-warning" onclick="ProductManager.editProduct(${product.id})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="ProductManager.deleteProduct(${product.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    showProductForm: function(productId = null) {
        const modalTitle = document.getElementById('productModalLabel');
        const form = document.getElementById('productForm');

        CategoryManager.loadCategories();
        CategoryManager.renderCategoriesSelect('productCategory');

        if (productId) {
            const product = StorageManager.readById('products', productId);
            if (!product) {
                Utils.showToast('Producto no encontrado', 'danger');
                return;
            }

            modalTitle.textContent = 'Editar Producto';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productCategory').value = product.categoryId;
            document.getElementById('productCost').value = product.cost;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productImage').value = product.image;
            
            ['organico', 'biodegradable', 'vegano'].forEach(label => {
                const checkbox = document.getElementById(`eco_${label}`);
                if (checkbox) {
                    checkbox.checked = product.ecoLabels.includes(label === 'organico' ? 'orgánico' : label);
                }
            });
        } else {
            modalTitle.textContent = 'Nuevo Producto';
            form.reset();
            document.getElementById('productId').value = '';
        }

        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
    },

    saveProduct: function(event) {
        event.preventDefault();
        const form = event.target;
        if (!Utils.validateForm(form)) return;

        const productId = document.getElementById('productId').value;
        const cost = parseFloat(document.getElementById('productCost').value);
        const price = parseFloat(document.getElementById('productPrice').value);

        if (!Utils.validatePricing(price, cost)) {
            Utils.showToast('El precio debe ser mayor que el costo', 'danger');
            return;
        }

        const ecoLabels = [];
        if (document.getElementById('eco_organico')?.checked) ecoLabels.push('orgánico');
        if (document.getElementById('eco_biodegradable')?.checked) ecoLabels.push('biodegradable');
        if (document.getElementById('eco_vegano')?.checked) ecoLabels.push('vegano');

        const currentUser = AuthManager.getCurrentUser();
        
        const productData = {
            name: document.getElementById('productName').value.trim(),
            description: document.getElementById('productDescription').value.trim(),
            categoryId: parseInt(document.getElementById('productCategory').value),
            cost,
            price,
            ecoLabels,
            image: document.getElementById('productImage').value.trim() || 'https://via.placeholder.com/400x300?text=Producto',
            createdBy: currentUser ? currentUser.id : 1
        };

        if (productId) {
            const existing = StorageManager.readById('products', productId);
            productData.registrationDate = existing.registrationDate;
            productData.createdBy = existing.createdBy; // Mantener el creador original
            StorageManager.update('products', productId, productData);
            Utils.showToast('Producto actualizado exitosamente', 'success');
        } else {
            productData.registrationDate = new Date().toISOString().split('T')[0];
            StorageManager.create('products', productData);
            Utils.showToast('Producto creado exitosamente', 'success');
        }

        bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
        this.renderProductsTable();
        this.renderProductsGrid();
        form.reset();
    },

    editProduct: function(productId) {
        // Verificar si el usuario puede editar este producto
        const currentUser = AuthManager.getCurrentUser();
        const product = StorageManager.readById('products', productId);
        
        if (!product) {
            Utils.showToast('Producto no encontrado', 'danger');
            return;
        }
        
        if (currentUser && currentUser.role === 'Usuario' && product.createdBy !== currentUser.id) {
            Utils.showToast('No tienes permiso para editar este producto', 'danger');
            return;
        }
        
        this.showProductForm(productId);
    },

    deleteProduct: function(productId) {
        const product = StorageManager.readById('products', productId);
        if (!product) {
            Utils.showToast('Producto no encontrado', 'danger');
            return;
        }
        
        // Verificar si el usuario puede eliminar este producto
        const currentUser = AuthManager.getCurrentUser();
        if (currentUser && currentUser.role === 'Usuario' && product.createdBy !== currentUser.id) {
            Utils.showToast('No tienes permiso para eliminar este producto', 'danger');
            return;
        }

        Utils.confirm(`¿Está seguro de eliminar el producto "${product.name}"?`, () => {
            if (StorageManager.delete('products', productId)) {
                Utils.showToast('Producto eliminado exitosamente', 'success');
                this.renderProductsTable();
                this.renderProductsGrid();
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', function() {
    ProductManager.init();
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', (e) => ProductManager.saveProduct(e));
    }
    
    // Cargar productos en la página principal
    if (document.getElementById('productsGrid')) {
        ProductManager.renderProductsGrid();
    }
});
