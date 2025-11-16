// Sistema de Autenticación - RF7
const AuthManager = {
    currentUser: null,

    init: function() {
        this.checkSession();
        this.redirectIfLoggedIn();
        this.setupLoginForm();
    },

    // Verificar sesión activa
    checkSession: function() {
        const userData = sessionStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            return true;
        }
        return false;
    },

    // Redirigir si ya hay sesión activa (para página de login)
    redirectIfLoggedIn: function() {
        // Solo aplicar en la página de login
        if (window.location.pathname.includes('views/login.html') && this.checkSession()) {
            Utils.showToast('Ya tienes una sesión activa', 'info');
            setTimeout(() => {
                if (this.currentUser.role === 'Usuario Final') {
                    window.location.href = '../index.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 1000);
        }
    },

    // Configurar formulario de login
    setupLoginForm: function() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }
    },

    // Iniciar sesión
    login: function() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Validaciones básicas
        if (!email || !password) {
            Utils.showToast('Por favor complete todos los campos', 'danger');
            return;
        }

        if (!Utils.validateEmail(email)) {
            Utils.showToast('Por favor ingrese un email válido', 'danger');
            return;
        }

        // Buscar usuario en el sistema
        const users = StorageManager.get('users') || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Login exitoso
            const userData = {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            };

            // Guardar en sessionStorage
            sessionStorage.setItem('currentUser', JSON.stringify(userData));
            this.currentUser = userData;

            Utils.showToast(`¡Bienvenido ${user.fullName}!`, 'success');

            // Redirigir según el rol
            setTimeout(() => {
                if (user.role === 'Usuario Final') {
                    window.location.href = '../index.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 1000);
        } else {
            Utils.showToast('Email o contraseña incorrectos', 'danger');
        }
    },

    // Cerrar sesión
    logout: function() {
        Utils.confirm('¿Está seguro que desea cerrar sesión?', () => {
            sessionStorage.removeItem('currentUser');
            sessionStorage.removeItem('cart');
            this.currentUser = null;
            Utils.showToast('Sesión cerrada exitosamente', 'success');
            setTimeout(() => {
                // Detectar si estamos en la carpeta views o en raíz
                const isInViews = window.location.pathname.includes('/views/');
                window.location.href = isInViews ? '../index.html' : 'index.html';
            }, 1000);
        });
    },

    // Obtener usuario actual
    getCurrentUser: function() {
        if (!this.currentUser) {
            this.checkSession();
        }
        return this.currentUser;
    },

    // Verificar si está autenticado
    isAuthenticated: function() {
        return this.checkSession();
    },

    // Verificar rol del usuario
    hasRole: function(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    },

    // Verificar si tiene alguno de los roles especificados
    hasAnyRole: function(roles) {
        const user = this.getCurrentUser();
        return user && roles.includes(user.role);
    },

    // Proteger ruta - redirigir si no está autenticado
    protectRoute: function(allowedRoles = null) {
        if (!this.isAuthenticated()) {
            Utils.showToast('Debe iniciar sesión para acceder', 'warning');
            setTimeout(() => {
                // Detectar si estamos en la carpeta views o en raíz
                const isInViews = window.location.pathname.includes('/views/');
                window.location.href = isInViews ? 'login.html' : 'views/login.html';
            }, 1500);
            return false;
        }

        if (allowedRoles && !this.hasAnyRole(allowedRoles)) {
            Utils.showToast('No tiene permisos para acceder a esta sección', 'danger');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            return false;
        }

        return true;
    },

    // Registrar nuevo usuario
    register: function(userData) {
        // Validar datos
        if (!userData.username || !userData.password || !userData.email || !userData.fullName) {
            Utils.showToast('Por favor complete todos los campos obligatorios', 'danger');
            return false;
        }

        if (!Utils.validateEmail(userData.email)) {
            Utils.showToast('Por favor ingrese un email válido', 'danger');
            return false;
        }

        if (userData.phone && !Utils.validatePhone(userData.phone)) {
            Utils.showToast('Por favor ingrese un teléfono válido', 'danger');
            return false;
        }

        // Verificar que el email no exista
        const users = StorageManager.get('users') || [];
        if (users.some(u => u.email === userData.email)) {
            Utils.showToast('El email ya está registrado', 'danger');
            return false;
        }

        // Verificar que el username no exista
        if (users.some(u => u.username === userData.username)) {
            Utils.showToast('El nombre de usuario ya está en uso', 'danger');
            return false;
        }

        // Crear nuevo usuario
        const newUser = {
            id: StorageManager.generateId('users'),
            username: userData.username,
            password: userData.password,
            fullName: userData.fullName,
            email: userData.email,
            phone: userData.phone || '',
            role: userData.role || 'Usuario Final',
            registrationDate: new Date().toISOString().split('T')[0]
        };

        // Guardar usuario
        users.push(newUser);
        StorageManager.save('users', users);

        Utils.showToast('Usuario registrado exitosamente', 'success');
        return newUser;
    },

    // Cambiar contraseña
    changePassword: function(userId, oldPassword, newPassword) {
        const users = StorageManager.get('users') || [];
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            Utils.showToast('Usuario no encontrado', 'danger');
            return false;
        }

        if (users[userIndex].password !== oldPassword) {
            Utils.showToast('La contraseña actual es incorrecta', 'danger');
            return false;
        }

        users[userIndex].password = newPassword;
        StorageManager.save('users', users);

        Utils.showToast('Contraseña actualizada exitosamente', 'success');
        return true;
    }
};

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    AuthManager.init();
});
