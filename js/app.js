// Aplicación principal de EcoMarket
const EcoMarketApp = {
    currentUser: null,
    currentPage: 'home',

    init: function() {
        this.loadComponents();
        this.checkAuthentication();
        this.setupEventListeners();
        this.loadProducts();
        this.loadCategories();
        this.updateHeroButton();
        
        // Inicializar el carrito después de cargar los componentes
        setTimeout(() => {
            if (typeof CartManager !== 'undefined') {
                CartManager.init();
            }
        }, 100);
    },

    // Cargar componentes reutilizables
    loadComponents: function() {
        this.loadHeader();
        this.loadFooter();
        this.loadCartModal();
    },

    loadHeader: function() {
        // Detectar si estamos en la carpeta views o en raíz
        const isInViews = window.location.pathname.includes('/views/');
        const viewsPrefix = isInViews ? '' : 'views/';
        const rootPrefix = isInViews ? '../' : '';
        
        const headerHTML = `
            <nav class="navbar navbar-expand-lg navbar-dark bg-success sticky-top shadow-sm">
                <div class="container">
                    <a class="navbar-brand fw-bold d-flex align-items-center" href="${rootPrefix}index.html">
                        <i class="bi bi-leaf-fill fs-4 me-2"></i>
                        <span class="fs-5">EcoMarket</span>
                        <span class="badge bg-light text-success ms-2 small">Eco-Friendly</span>
                    </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                            <li class="nav-item">
                                <a class="nav-link px-3" href="${rootPrefix}index.html">
                                    <i class="bi bi-house-door me-1"></i>Inicio
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link px-3" href="${viewsPrefix}catalogo.html">
                                    <i class="bi bi-grid-3x3-gap me-1"></i>Catálogo
                                </a>
                            </li>
                            <li class="nav-item" id="dashboardNavItem">
                                <!-- Dashboard link se cargará dinámicamente -->
                            </li>
                            <li class="nav-item">
                                <a class="nav-link position-relative px-3" href="${viewsPrefix}cart.html" id="cartLink">
                                    <i class="bi bi-cart3 me-1"></i>Carrito
                                    <span id="cartCount" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.65rem;">0</span>
                                </a>
                            </li>
                        </ul>
                        <div class="navbar-nav ms-lg-3" id="authButtons">
                            <!-- Botones de login/registro se cargan dinámicamente -->
                        </div>
                    </div>
                </div>
            </nav>
        `;
        if (document.getElementById('header')) {
            document.getElementById('header').innerHTML = headerHTML;
        }
    },

    loadFooter: function() {
        // Detectar si estamos en la carpeta views o en raíz
        const isInViews = window.location.pathname.includes('/views/');
        const viewsPrefix = isInViews ? '' : 'views/';
        const rootPrefix = isInViews ? '../' : '';
        
        const footerHTML = `
            <footer class="bg-dark text-light py-5 mt-5">
                <div class="container">
                    <div class="row">
                        <div class="col-md-4 mb-4">
                            <div class="d-flex align-items-center mb-3">
                                <i class="bi bi-leaf-fill text-success fs-3 me-2"></i>
                                <h4 class="mb-0">EcoMarket</h4>
                            </div>
                            <p class="text-light-50">Tu tienda de confianza para productos ecológicos, sostenibles y certificados. Comprando consciente para un futuro mejor.</p>
                            <div class="mt-3">
                                <a href="#" class="text-light me-3"><i class="bi bi-facebook fs-5"></i></a>
                                <a href="#" class="text-light me-3"><i class="bi bi-instagram fs-5"></i></a>
                                <a href="#" class="text-light me-3"><i class="bi bi-twitter fs-5"></i></a>
                                <a href="#" class="text-light"><i class="bi bi-linkedin fs-5"></i></a>
                            </div>
                        </div>
                        <div class="col-md-3 mb-4">
                            <h5 class="mb-3">Enlaces Rápidos</h5>
                            <ul class="list-unstyled">
                                <li class="mb-2"><a href="${rootPrefix}index.html" class="text-light text-decoration-none"><i class="bi bi-chevron-right"></i> Inicio</a></li>
                                <li class="mb-2"><a href="${viewsPrefix}catalogo.html" class="text-light text-decoration-none"><i class="bi bi-chevron-right"></i> Catálogo</a></li>
                                <li class="mb-2"><a href="${viewsPrefix}cart.html" class="text-light text-decoration-none"><i class="bi bi-chevron-right"></i> Mi Carrito</a></li>
                                <li class="mb-2"><a href="${viewsPrefix}dashboard.html" class="text-light text-decoration-none"><i class="bi bi-chevron-right"></i> Dashboard</a></li>
                            </ul>
                        </div>
                        <div class="col-md-2 mb-4">
                            <h5 class="mb-3">Información</h5>
                            <ul class="list-unstyled">
                                <li class="mb-2"><a href="#" class="text-light text-decoration-none"><i class="bi bi-chevron-right"></i> Sobre Nosotros</a></li>
                                <li class="mb-2"><a href="#" class="text-light text-decoration-none"><i class="bi bi-chevron-right"></i> Certificaciones</a></li>
                                <li class="mb-2"><a href="#" class="text-light text-decoration-none"><i class="bi bi-chevron-right"></i> Blog</a></li>
                                <li class="mb-2"><a href="#" class="text-light text-decoration-none"><i class="bi bi-chevron-right"></i> FAQ</a></li>
                            </ul>
                        </div>
                        <div class="col-md-3 mb-4">
                            <h5 class="mb-3">Contacto</h5>
                            <ul class="list-unstyled">
                                <li class="mb-2"><i class="bi bi-envelope-fill text-success me-2"></i> info@ecomarket.com</li>
                                <li class="mb-2"><i class="bi bi-telephone-fill text-success me-2"></i> +57 300 123 4567</li>
                                <li class="mb-2"><i class="bi bi-geo-alt-fill text-success me-2"></i> Sincelejo, Colombia</li>
                                <li class="mb-2"><i class="bi bi-clock-fill text-success me-2"></i> Lun - Vie: 9:00 - 18:00</li>
                            </ul>
                        </div>
                    </div>
                    <hr class="my-4">
                    <div class="row">
                        <div class="col-md-6 text-center text-md-start">
                            <p class="mb-0">&copy; 2025 EcoMarket. Todos los derechos reservados.</p>
                        </div>
                        <div class="col-md-6 text-center text-md-end">
                            <a href="#" class="text-light text-decoration-none me-3">Política de Privacidad</a>
                            <a href="#" class="text-light text-decoration-none">Términos y Condiciones</a>
                        </div>
                    </div>
                </div>
            </footer>
        `;
        if (document.getElementById('footer')) {
            document.getElementById('footer').innerHTML = footerHTML;
        }
    },

    loadCartModal: function() {
        // Ya no se usa modal, el carrito es una página separada
        // Esta función se mantiene por compatibilidad pero no hace nada
    },

    checkAuthentication: function() {
        const user = sessionStorage.getItem('currentUser');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.updateAuthUI();
        }
    },

    updateAuthUI: function() {
        const authButtons = document.getElementById('authButtons');
        if (!authButtons) return;

        // Detectar si estamos en la carpeta views o en raíz
        const isInViews = window.location.pathname.includes('/views/');
        const viewsPrefix = isInViews ? '' : 'views/';

        if (this.currentUser) {
            // Mostrar Dashboard en navbar
            const dashboardNavItem = document.getElementById('dashboardNavItem');
            if (dashboardNavItem) {
                dashboardNavItem.innerHTML = `
                    <a class="nav-link px-3" href="${viewsPrefix}dashboard.html">
                        <i class="bi bi-speedometer2 me-1"></i>Dashboard
                    </a>
                `;
            }

            authButtons.innerHTML = `
                <div class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <div class="bg-light rounded-circle d-flex align-items-center justify-content-center me-2" style="width: 32px; height: 32px;">
                            <i class="bi bi-person-fill text-success"></i>
                        </div>
                        <span class="d-none d-lg-inline">${this.currentUser.fullName}</span>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end shadow">
                        <li class="px-3 py-2 border-bottom">
                            <small class="text-muted">Hola, ${this.currentUser.fullName}</small><br>
                            <small class="text-muted">${this.currentUser.email}</small>
                        </li>
                        <li><a class="dropdown-item py-2" href="${viewsPrefix}dashboard.html?view=profile">
                            <i class="bi bi-person-circle me-2"></i>Mi Perfil
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item py-2 text-danger" href="#" onclick="EcoMarketApp.logout()">
                            <i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                        </a></li>
                    </ul>
                </div>
            `;
        } else {
            // Ocultar Dashboard en navbar
            const dashboardNavItem = document.getElementById('dashboardNavItem');
            if (dashboardNavItem) {
                dashboardNavItem.innerHTML = '';
            }

            authButtons.innerHTML = `
                <a class="nav-link px-3" href="${viewsPrefix}login.html">
                    <i class="bi bi-box-arrow-in-right me-1"></i>Iniciar Sesión
                </a>
                <a class="btn btn-light btn-sm ms-2" href="${viewsPrefix}register.html">
                    <i class="bi bi-person-plus me-1"></i>Registrarse
                </a>
            `;
        }
    },

    logout: function() {
        sessionStorage.removeItem('currentUser');
        this.currentUser = null;
        this.updateAuthUI();
        // Detectar si estamos en la carpeta views o en raíz
        const isInViews = window.location.pathname.includes('/views/');
        window.location.href = isInViews ? '../index.html' : 'index.html';
    },

    setupEventListeners: function() {
        // Event listeners globales se configurarán aquí
    },

    loadProducts: function() {
        // Verificar si estamos en la página principal
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid && window.location.pathname.includes('index.html') || 
            productsGrid && window.location.pathname === '/') {
            // En la página principal, cargar solo productos destacados sin filtros
            setTimeout(() => {
                if (typeof SearchManager !== 'undefined') {
                    SearchManager.loadFeaturedProducts();
                }
            }, 100);
        }
    },

    loadCategories: function() {
        // Implementar en categories.js
        console.log('Cargando categorías...');
    },

    updateHeroButton: function() {
        const heroButton = document.getElementById('heroAuthButton');
        if (!heroButton) return;

        // Detectar si estamos en la carpeta views o en raíz
        const isInViews = window.location.pathname.includes('/views/');
        const viewsPrefix = isInViews ? '' : 'views/';

        if (this.currentUser) {
            heroButton.innerHTML = `
                <a href="${viewsPrefix}dashboard.html" class="btn btn-outline-light btn-lg mt-3 ms-2">
                    <i class="bi bi-speedometer2"></i> Ir al Dashboard
                </a>
            `;
        } else {
            heroButton.innerHTML = `
                <a href="${viewsPrefix}login.html" class="btn btn-outline-light btn-lg mt-3 ms-2">
                    <i class="bi bi-box-arrow-in-right"></i> Iniciar Sesión
                </a>
            `;
        }

        // Actualizar también el CTA del footer
        const ctaButton = document.getElementById('ctaAuthButton');
        if (ctaButton) {
            if (this.currentUser) {
                ctaButton.innerHTML = `
                    <a href="${viewsPrefix}dashboard.html" class="btn btn-light btn-lg">
                        <i class="bi bi-speedometer2"></i> Ir al Dashboard
                    </a>
                `;
            } else {
                ctaButton.innerHTML = `
                    <a href="${viewsPrefix}register.html" class="btn btn-light btn-lg">
                        <i class="bi bi-person-plus"></i> Crear Cuenta
                    </a>
                `;
            }
        }
    }
};

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    EcoMarketApp.init();
});
