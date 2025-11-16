// Gestión de Usuarios - RF6
const UserManager = {
    users: [],
    currentEditId: null,

    init: function() {
        this.loadUsers();
    },

    // Cargar usuarios desde el storage
    loadUsers: function() {
        this.users = StorageManager.readAll('users') || [];
        return this.users;
    },

    // Renderizar lista de usuarios
    renderUsersList: function(containerId = 'usersTableBody') {
        const tbody = document.getElementById(containerId);
        if (!tbody) return;

        this.loadUsers();

        if (this.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay usuarios registrados</td></tr>';
            return;
        }

        tbody.innerHTML = this.users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${Utils.sanitizeHTML(user.username)}</td>
                <td>${Utils.sanitizeHTML(user.fullName)}</td>
                <td>${Utils.sanitizeHTML(user.email)}</td>
                <td>${Utils.sanitizeHTML(user.phone || 'N/A')}</td>
                <td><span class="badge bg-primary">${user.role}</span></td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="UserManager.editUser(${user.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="UserManager.deleteUser(${user.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    // Mostrar formulario de usuario
    showUserForm: function(userId = null) {
        this.currentEditId = userId;
        const modalTitle = document.getElementById('userModalLabel');
        const form = document.getElementById('userForm');

        if (userId) {
            // Editar usuario existente
            const user = StorageManager.readById('users', userId);
            if (!user) {
                Utils.showToast('Usuario no encontrado', 'danger');
                return;
            }

            modalTitle.textContent = 'Editar Usuario';
            document.getElementById('userId').value = user.id;
            document.getElementById('username').value = user.username;
            document.getElementById('userFullName').value = user.fullName;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userPhone').value = user.phone;
            document.getElementById('userRole').value = user.role;
            
            // Hacer el password opcional al editar
            document.getElementById('userPassword').required = false;
            document.getElementById('userPassword').placeholder = 'Dejar en blanco para mantener la contraseña actual';
        } else {
            // Nuevo usuario
            modalTitle.textContent = 'Nuevo Usuario';
            form.reset();
            document.getElementById('userId').value = '';
            document.getElementById('userPassword').required = true;
            document.getElementById('userPassword').placeholder = '';
        }

        const modal = new bootstrap.Modal(document.getElementById('userModal'));
        modal.show();
    },

    // Guardar usuario (crear o actualizar)
    saveUser: function(event) {
        event.preventDefault();

        const form = event.target;
        if (!Utils.validateForm(form)) {
            return;
        }

        const userId = document.getElementById('userId').value;
        const username = document.getElementById('username').value.trim();
        const fullName = document.getElementById('userFullName').value.trim();
        const email = document.getElementById('userEmail').value.trim();
        const phone = document.getElementById('userPhone').value.trim();
        const password = document.getElementById('userPassword').value;
        const role = document.getElementById('userRole').value;

        // Validaciones adicionales
        if (!Utils.validateEmail(email)) {
            Utils.showToast('Email inválido', 'danger');
            return;
        }

        if (phone && !Utils.validatePhone(phone)) {
            Utils.showToast('Teléfono inválido', 'danger');
            return;
        }

        // Verificar email duplicado
        const users = StorageManager.readAll('users');
        const emailExists = users.some(u => 
            u.email === email && u.id !== parseInt(userId || 0)
        );

        if (emailExists) {
            Utils.showToast('El email ya está registrado', 'danger');
            return;
        }

        // Verificar username duplicado
        const usernameExists = users.some(u => 
            u.username === username && u.id !== parseInt(userId || 0)
        );

        if (usernameExists) {
            Utils.showToast('El nombre de usuario ya está en uso', 'danger');
            return;
        }

        const userData = {
            username,
            fullName,
            email,
            phone,
            role
        };

        if (userId) {
            // Actualizar usuario existente
            const existingUser = StorageManager.readById('users', userId);
            userData.password = password || existingUser.password; // Mantener contraseña si no se proporciona nueva
            userData.registrationDate = existingUser.registrationDate;

            StorageManager.update('users', userId, userData);
            Utils.showToast('Usuario actualizado exitosamente', 'success');
        } else {
            // Crear nuevo usuario
            if (!password) {
                Utils.showToast('La contraseña es obligatoria', 'danger');
                return;
            }

            userData.password = password;
            userData.registrationDate = new Date().toISOString().split('T')[0];

            StorageManager.create('users', userData);
            Utils.showToast('Usuario creado exitosamente', 'success');
        }

        // Cerrar modal y actualizar lista
        bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
        this.renderUsersList();
        form.reset();
    },

    // Editar usuario
    editUser: function(userId) {
        this.showUserForm(userId);
    },

    // Eliminar usuario
    deleteUser: function(userId) {
        const user = StorageManager.readById('users', userId);
        if (!user) {
            Utils.showToast('Usuario no encontrado', 'danger');
            return;
        }

        // No permitir eliminar el usuario actual
        const currentUser = AuthManager.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            Utils.showToast('No puede eliminar su propio usuario', 'warning');
            return;
        }

        Utils.confirm(`¿Está seguro de eliminar al usuario "${user.fullName}"?`, () => {
            if (StorageManager.delete('users', userId)) {
                Utils.showToast('Usuario eliminado exitosamente', 'success');
                this.renderUsersList();
            } else {
                Utils.showToast('Error al eliminar el usuario', 'danger');
            }
        });
    },

    // Buscar usuarios
    searchUsers: function(searchTerm) {
        const normalizedTerm = Utils.normalizeText(searchTerm);
        
        return this.users.filter(user => {
            const searchableText = Utils.normalizeText(
                `${user.username} ${user.fullName} ${user.email} ${user.role}`
            );
            return searchableText.includes(normalizedTerm);
        });
    },

    // Filtrar por rol
    filterByRole: function(role) {
        if (!role) return this.users;
        return this.users.filter(user => user.role === role);
    },

    // Obtener estadísticas de usuarios
    getUserStats: function() {
        const stats = {
            total: this.users.length,
            byRole: {}
        };

        this.users.forEach(user => {
            if (!stats.byRole[user.role]) {
                stats.byRole[user.role] = 0;
            }
            stats.byRole[user.role]++;
        });

        return stats;
    },

    // Exportar usuarios a CSV
    exportUsers: function() {
        const exportData = this.users.map(user => ({
            ID: user.id,
            'Nombre de Usuario': user.username,
            'Nombre Completo': user.fullName,
            Email: user.email,
            Teléfono: user.phone,
            Rol: user.role,
            'Fecha de Registro': user.registrationDate
        }));

        Utils.exportToCSV(exportData, 'usuarios_ecomarket.csv');
        Utils.showToast('Usuarios exportados exitosamente', 'success');
    }
};

// Configurar formulario cuando esté disponible
document.addEventListener('DOMContentLoaded', function() {
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', (e) => UserManager.saveUser(e));
    }
});
