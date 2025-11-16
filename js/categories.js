// Gestión de Categorías - RF1
const CategoryManager = {
    categories: [],
    currentEditId: null,

    init: function() {
        this.loadCategories();
    },

    // Cargar categorías
    loadCategories: function() {
        this.categories = StorageManager.readAll('categories') || [];
        return this.categories;
    },

    // Renderizar lista de categorías
    renderCategoriesList: function(containerId = 'categoriesTableBody') {
        const tbody = document.getElementById(containerId);
        if (!tbody) return;

        this.loadCategories();

        if (this.categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">No hay categorías registradas</td></tr>';
            return;
        }

        tbody.innerHTML = this.categories.map(category => `
            <tr>
                <td>${category.id}</td>
                <td>${Utils.sanitizeHTML(category.name)}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="CategoryManager.editCategory(${category.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="CategoryManager.deleteCategory(${category.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    // Renderizar select de categorías
    renderCategoriesSelect: function(selectId, selectedId = null) {
        const select = document.getElementById(selectId);
        if (!select) return;

        this.loadCategories();

        select.innerHTML = '<option value="">Seleccione una categoría</option>' +
            this.categories.map(category => `
                <option value="${category.id}" ${selectedId == category.id ? 'selected' : ''}>
                    ${Utils.sanitizeHTML(category.name)}
                </option>
            `).join('');
    },

    // Mostrar formulario de categoría
    showCategoryForm: function(categoryId = null) {
        this.currentEditId = categoryId;
        const modalTitle = document.getElementById('categoryModalLabel');
        const form = document.getElementById('categoryForm');

        if (categoryId) {
            const category = StorageManager.readById('categories', categoryId);
            if (!category) {
                Utils.showToast('Categoría no encontrada', 'danger');
                return;
            }

            modalTitle.textContent = 'Editar Categoría';
            document.getElementById('categoryId').value = category.id;
            document.getElementById('categoryName').value = category.name;
        } else {
            modalTitle.textContent = 'Nueva Categoría';
            form.reset();
            document.getElementById('categoryId').value = '';
        }

        const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
        modal.show();
    },

    // Guardar categoría
    saveCategory: function(event) {
        event.preventDefault();

        const form = event.target;
        if (!Utils.validateForm(form)) {
            return;
        }

        const categoryId = document.getElementById('categoryId').value;
        const name = document.getElementById('categoryName').value.trim();

        // Validar nombre único
        const categories = StorageManager.readAll('categories');
        const nameExists = categories.some(c => 
            c.name.toLowerCase() === name.toLowerCase() && c.id !== parseInt(categoryId || 0)
        );

        if (nameExists) {
            Utils.showToast('El nombre de la categoría ya existe', 'danger');
            return;
        }

        const categoryData = { name };

        if (categoryId) {
            StorageManager.update('categories', categoryId, categoryData);
            Utils.showToast('Categoría actualizada exitosamente', 'success');
        } else {
            StorageManager.create('categories', categoryData);
            Utils.showToast('Categoría creada exitosamente', 'success');
        }

        bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
        this.renderCategoriesList();
        form.reset();
    },

    // Editar categoría
    editCategory: function(categoryId) {
        this.showCategoryForm(categoryId);
    },

    // Eliminar categoría
    deleteCategory: function(categoryId) {
        const category = StorageManager.readById('categories', categoryId);
        if (!category) {
            Utils.showToast('Categoría no encontrada', 'danger');
            return;
        }

        // Verificar si hay productos usando esta categoría
        const products = StorageManager.readAll('products') || [];
        const hasProducts = products.some(p => p.categoryId === categoryId);

        if (hasProducts) {
            Utils.showToast('No se puede eliminar. Hay productos asociados a esta categoría', 'warning');
            return;
        }

        Utils.confirm(`¿Está seguro de eliminar la categoría "${category.name}"?`, () => {
            if (StorageManager.delete('categories', categoryId)) {
                Utils.showToast('Categoría eliminada exitosamente', 'success');
                this.renderCategoriesList();
            } else {
                Utils.showToast('Error al eliminar la categoría', 'danger');
            }
        });
    },

    // Obtener nombre de categoría por ID
    getCategoryName: function(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.name : 'Sin categoría';
    }
};

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', (e) => CategoryManager.saveCategory(e));
    }
});
