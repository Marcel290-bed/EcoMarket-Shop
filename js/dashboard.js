// Dashboard Principal - Gestión según Rol
const DashboardManager = {
    currentUser: null,
    currentView: null,

    init: function() {
        // Proteger ruta - solo usuarios autenticados
        if (!AuthManager.protectRoute(['Administrador', 'Usuario'])) {
            return;
        }

        this.currentUser = AuthManager.getCurrentUser();
        this.loadHeader();
        this.loadMenu();
        this.loadDefaultView();
    },

    loadHeader: function() {
        const header = document.getElementById('header');
        if (header) {
            header.innerHTML = `
                <nav class="navbar navbar-expand-lg navbar-dark bg-success sticky-top">
                    <div class="container-fluid">
                        <a class="navbar-brand fw-bold" href="../index.html">
                            <i class="bi bi-leaf me-2"></i>EcoMarket
                        </a>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarNav">
                            <ul class="navbar-nav ms-auto">
                                <li class="nav-item">
                                    <a class="nav-link" href="../index.html"><i class="bi bi-house"></i> Inicio</a>
                                </li>
                                <li class="nav-item dropdown">
                                    <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                        <i class="bi bi-person-circle"></i> ${this.currentUser.fullName}
                                    </a>
                                    <ul class="dropdown-menu">
                                        <li><span class="dropdown-item-text"><strong>Rol:</strong> ${this.currentUser.role}</span></li>
                                        <li><hr class="dropdown-divider"></li>
                                        <li><a class="dropdown-item" href="#" onclick="DashboardManager.logout()">
                                            <i class="bi bi-box-arrow-right"></i> Cerrar Sesión
                                        </a></li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            `;
        }
    },

    loadMenu: function() {
        const menuItems = document.getElementById('menuItems');
        if (!menuItems) return;

        const role = this.currentUser.role;
        let menu = [];

        if (role === 'Administrador') {
            menu = [
                { icon: 'speedometer2', title: 'Dashboard', action: 'showDashboard' },
                { icon: 'box-seam', title: 'Productos', action: 'showProducts' },
                { icon: 'tags', title: 'Categorías', action: 'showCategories' },
                { icon: 'people', title: 'Usuarios', action: 'showUsers' },
                { icon: 'bag-check', title: 'Pedidos', action: 'showAllOrders' },
                { icon: 'graph-up', title: 'Reportes', action: 'showReports' },
                { icon: 'person-circle', title: 'Mi Perfil', action: 'showProfile' }
            ];
        } else if (role === 'Usuario') {
            menu = [
                { icon: 'speedometer2', title: 'Dashboard', action: 'showDashboard' },
                { icon: 'box-seam', title: 'Mis Productos', action: 'showProducts' },
                { icon: 'bag-check', title: 'Mis Compras', action: 'showOrders' },
                { icon: 'cart', title: 'Mi Carrito', action: 'redirectToCart' },
                { icon: 'shop', title: 'Catalogo', action: 'redirectToIndex' },
                { icon: 'person-circle', title: 'Mi Perfil', action: 'showProfile' }
            ];
        }

        menuItems.innerHTML = menu.map(item => `
            <li class="nav-item">
                <a class="nav-link" href="#" onclick="DashboardManager.${item.action}(); return false;">
                    <i class="bi bi-${item.icon}"></i> ${item.title}
                </a>
            </li>
        `).join('');
    },

    loadDefaultView: function() {
        // Verificar si hay un parámetro de vista en la URL
        const urlParams = new URLSearchParams(window.location.search);
        const view = urlParams.get('view');
        
        if (view === 'profile') {
            this.showProfile();
        } else if (view === 'orders') {
            this.showOrders();
        } else {
            this.showDashboard();
        }
    },

    showDashboard: function() {
        this.currentView = 'dashboard';
        const content = document.getElementById('dashboardContent');
        if (!content) return;

        const isAdmin = this.currentUser.role === 'Administrador';
        
        // Verificar si el usuario tiene productos
        const allProducts = StorageManager.readAll('products') || [];
        const userProducts = isAdmin ? allProducts : allProducts.filter(p => p.createdBy === this.currentUser.id);
        const hasProducts = userProducts.length > 0;

        content.innerHTML = `
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 class="h2">Dashboard</h1>
            </div>

            ${!isAdmin && !hasProducts ? `
            <!-- Mensaje cuando no hay productos -->
            <div class="row">
                <div class="col-md-12">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body text-center py-5">
                            <i class="bi bi-box-seam display-1 text-muted mb-4"></i>
                            <h3 class="mb-3">¡Comienza a vender tus productos ecológicos!</h3>
                            <p class="text-muted mb-4">
                                Aún no tienes productos registrados. Crea tu primer producto para comenzar a vender y ver tus estadísticas de ventas.
                            </p>
                            <button class="btn btn-success btn-lg" onclick="DashboardManager.showProducts()">
                                <i class="bi bi-plus-circle"></i> Registrar mi Primer Producto
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            ` : ''}

            ${hasProducts || isAdmin ? `
            <!-- Dashboard con productos -->
            <div class="row g-4 mb-4">
                <div class="col-md-3">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body text-center">
                            <div class="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                                <i class="bi bi-box-seam text-primary fs-3"></i>
                            </div>
                            <p class="text-muted mb-1">Productos</p>
                            <h2 class="mb-0" id="totalProducts">0</h2>
                        </div>
                    </div>
                </div>
                ${isAdmin ? `
                <div class="col-md-3">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body text-center">
                            <div class="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                                <i class="bi bi-tags text-success fs-3"></i>
                            </div>
                            <p class="text-muted mb-1">Categorías</p>
                            <h2 class="mb-0" id="totalCategories">0</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body text-center">
                            <div class="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                                <i class="bi bi-people text-warning fs-3"></i>
                            </div>
                            <p class="text-muted mb-1">Usuarios</p>
                            <h2 class="mb-0" id="totalUsers">0</h2>
                        </div>
                    </div>
                </div>
                ` : ''}
                <div class="col-md-3">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body text-center">
                            <div class="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                                <i class="bi bi-cart-check text-info fs-3"></i>
                            </div>
                            <p class="text-muted mb-1">Ventas</p>
                            <h2 class="mb-0" id="totalSales">0</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body text-center">
                            <div class="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                                <i class="bi bi-cash-stack text-danger fs-3"></i>
                            </div>
                            <p class="text-muted mb-1">Ganancias</p>
                            <h2 class="mb-0" id="totalProfit">$0</h2>
                        </div>
                    </div>
                </div>
            </div>
            ` : ''}



            ${!isAdmin && hasProducts ? `
            <div class="row mb-4">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-header bg-success text-white">
                            <div class="d-flex justify-content-between align-items-center">
                                <h5 class="mb-0"><i class="bi bi-graph-up"></i> Gráfica de Ventas</h5>
                            </div>
                        </div>
                        <div class="card-body">
                            <!-- Filtros -->
                            <div class="row mb-3">
                                <div class="col-md-2">
                                    <label class="form-label fw-bold">Tipo de Vista</label>
                                    <select class="form-select" id="chartPeriodType" onchange="DashboardManager.handlePeriodTypeChange()">
                                        <option value="days">Por Días</option>
                                        <option value="months">Por Meses</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label fw-bold">Producto</label>
                                    <select class="form-select" id="chartProductFilter">
                                        <option value="all">Todos los productos</option>
                                    </select>
                                </div>
                                <div class="col-md-3" id="dateRangeContainer">
                                    <label class="form-label fw-bold">Rango de Fechas</label>
                                    <div class="row g-2">
                                        <div class="col-6">
                                            <input type="date" class="form-control form-control-sm" id="startDate">
                                        </div>
                                        <div class="col-6">
                                            <input type="date" class="form-control form-control-sm" id="endDate">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3" id="monthRangeContainer" style="display: none;">
                                    <label class="form-label fw-bold">Rango de Meses</label>
                                    <div class="row g-2">
                                        <div class="col-6">
                                            <input type="month" class="form-control form-control-sm" id="startMonth">
                                        </div>
                                        <div class="col-6">
                                            <input type="month" class="form-control form-control-sm" id="endMonth">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-1 d-flex align-items-end">
                                    <button class="btn btn-success w-100" onclick="DashboardManager.applyChartFilters()">
                                        <i class="bi bi-funnel"></i> Aplicar
                                    </button>
                                </div>
                            </div>
                            <div style="height: 300px; position: relative;">
                                <canvas id="dailySalesChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ` : ''}
        `;

        this.loadDashboardStats();
        
        // Cargar gráfica de ventas para usuarios o estadísticas de admin
        if (!isAdmin && hasProducts) {
            this.loadProductsIntoChartFilter();
            this.initializeSalesChart();
        } else if (isAdmin) {
            this.loadAdminStats();
        }
    },

    loadDashboardStats: function() {
        const isAdmin = this.currentUser.role === 'Administrador';
        const allProducts = StorageManager.readAll('products') || [];
        const allCategories = StorageManager.readAll('categories') || [];
        const allSales = StorageManager.readAll('sales') || [];
        
        let products, sales, totalProfit;
        
        if (isAdmin) {
            // Admin ve todo
            products = allProducts;
            sales = allSales;
            totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
            
            document.getElementById('totalProducts').textContent = products.length;
            document.getElementById('totalCategories').textContent = allCategories.length;
            document.getElementById('totalSales').textContent = sales.length;
            document.getElementById('totalProfit').textContent = Utils.formatPrice(totalProfit);
            
            // Agregar conteo de usuarios
            const allUsers = StorageManager.readAll('users') || [];
            const totalUsersEl = document.getElementById('totalUsers');
            if (totalUsersEl) totalUsersEl.textContent = allUsers.length;
        } else {
            // Usuario ve solo sus datos
            products = allProducts.filter(p => p.createdBy === this.currentUser.id);
            
            // Ventas de los productos del usuario
            const userProductIds = products.map(p => p.id);
            sales = allSales.filter(s => userProductIds.includes(s.productId));
            totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
            
            // Solo actualizar si los elementos existen (cuando hay productos)
            const totalProductsEl = document.getElementById('totalProducts');
            const totalSalesEl = document.getElementById('totalSales');
            const totalProfitEl = document.getElementById('totalProfit');
            
            if (totalProductsEl) totalProductsEl.textContent = products.length;
            if (totalSalesEl) totalSalesEl.textContent = sales.length;
            if (totalProfitEl) totalProfitEl.textContent = Utils.formatPrice(totalProfit);
        }
    },

    loadAdminStats: function() {
        const allProducts = StorageManager.readAll('products') || [];
        const allCategories = StorageManager.readAll('categories') || [];
        const allUsers = StorageManager.readAll('users') || [];
        const allSales = StorageManager.readAll('sales') || [];

        // Productos por categoría
        const categoryStatsEl = document.getElementById('categoryStats');
        if (categoryStatsEl) {
            const categoryCount = {};
            allCategories.forEach(cat => {
                categoryCount[cat.name] = allProducts.filter(p => p.categoryId === cat.id).length;
            });

            categoryStatsEl.innerHTML = `
                <div class="list-group">
                    ${Object.entries(categoryCount).map(([name, count]) => `
                        <div class="list-group-item d-flex justify-content-between align-items-center">
                            <span>${name}</span>
                            <span class="badge bg-success rounded-pill">${count}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Usuarios activos (últimos registrados)
        const userStatsEl = document.getElementById('userStats');
        if (userStatsEl) {
            const recentUsers = allUsers.slice(-5).reverse();
            userStatsEl.innerHTML = `
                <div class="list-group">
                    ${recentUsers.map(user => `
                        <div class="list-group-item">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <i class="bi bi-person-circle text-primary"></i>
                                    <strong>${user.fullName}</strong>
                                    <br>
                                    <small class="text-muted">${user.email}</small>
                                </div>
                                <span class="badge bg-${user.role === 'Administrador' ? 'danger' : 'primary'}">${user.role}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Ventas recientes
        const recentSalesEl = document.getElementById('recentSales');
        if (recentSalesEl) {
            const recentSales = allSales.slice(-10).reverse();
            recentSalesEl.innerHTML = `
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Comprador</th>
                                <th>Cantidad</th>
                                <th>Precio</th>
                                <th>Ganancia</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recentSales.map(sale => `
                                <tr>
                                    <td>${sale.productName}</td>
                                    <td>${sale.buyerName}</td>
                                    <td>${sale.quantity}</td>
                                    <td>${Utils.formatPrice(sale.price)}</td>
                                    <td class="text-success">${Utils.formatPrice(sale.profit)}</td>
                                    <td>${new Date(sale.date).toLocaleDateString('es-ES')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
    },

    // Cargar productos del usuario en el filtro de la gráfica
    loadProductsIntoChartFilter: function() {
        const productFilterEl = document.getElementById('chartProductFilter');
        if (!productFilterEl) return;
        
        const allProducts = StorageManager.readAll('products') || [];
        const userProducts = allProducts.filter(p => p.createdBy === this.currentUser.id);
        
        // Limpiar opciones excepto "Todos los productos"
        productFilterEl.innerHTML = '<option value="all">Todos los productos</option>';
        
        // Agregar cada producto como opción
        userProducts.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            productFilterEl.appendChild(option);
        });
    },

    // Cargar productos del usuario en el filtro de la gráfica
    loadProductsIntoChartFilter: function() {
        const productFilterEl = document.getElementById('chartProductFilter');
        if (!productFilterEl) return;
        
        const allProducts = StorageManager.readAll('products') || [];
        const userProducts = allProducts.filter(p => p.createdBy === this.currentUser.id);
        
        // Limpiar opciones excepto "Todos los productos"
        productFilterEl.innerHTML = '<option value="all">Todos los productos</option>';
        
        // Agregar cada producto como opción
        userProducts.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            productFilterEl.appendChild(option);
        });
    },

    // Inicializar gráfica con fechas por defecto (últimos 30 días)
    initializeSalesChart: function() {
        const startDateEl = document.getElementById('startDate');
        const endDateEl = document.getElementById('endDate');
        
        // Verificar que los elementos existan antes de usarlos
        if (!startDateEl || !endDateEl) return;
        
        const today = new Date();
        
        // Primer día del mes actual
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        // Último día del mes actual
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        // Establecer valores por defecto
        startDateEl.value = firstDayOfMonth.toISOString().split('T')[0];
        endDateEl.value = lastDayOfMonth.toISOString().split('T')[0];
        
        this.currentChartInstance = null;
        this.applyChartFilters();
    },

    // Manejar cambio de tipo de período
    handlePeriodTypeChange: function() {
        const periodType = document.getElementById('chartPeriodType').value;
        const dateRangeContainer = document.getElementById('dateRangeContainer');
        const monthRangeContainer = document.getElementById('monthRangeContainer');
        
        if (periodType === 'days') {
            dateRangeContainer.style.display = 'block';
            monthRangeContainer.style.display = 'none';
        } else {
            dateRangeContainer.style.display = 'none';
            monthRangeContainer.style.display = 'block';
            
            // Establecer valores por defecto para meses
            const today = new Date();
            const sixMonthsAgo = new Date(today);
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            
            const formatMonth = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                return `${year}-${month}`;
            };
            
            document.getElementById('startMonth').value = formatMonth(sixMonthsAgo);
            document.getElementById('endMonth').value = formatMonth(today);
        }
    },

    // Aplicar filtros a la gráfica
    applyChartFilters: function() {
        const periodType = document.getElementById('chartPeriodType').value;
        
        if (periodType === 'days') {
            this.loadDailySalesChart();
        } else {
            this.loadMonthlySalesChart();
        }
    },

    // Cargar gráfica por días
    loadDailySalesChart: function() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (!startDate || !endDate) {
            Utils.showToast('Por favor selecciona un rango de fechas', 'warning');
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            Utils.showToast('La fecha de inicio debe ser menor que la fecha final', 'danger');
            return;
        }
        
        const allSales = StorageManager.readAll('sales') || [];
        const allProducts = StorageManager.readAll('products') || [];
        
        // Filtrar solo productos del usuario actual
        const userProducts = allProducts.filter(p => p.createdBy === this.currentUser.id);
        const userProductIds = userProducts.map(p => p.id);
        let userSales = allSales.filter(s => userProductIds.includes(s.productId));
        
        // Aplicar filtro de producto si está seleccionado
        const selectedProductId = parseInt(document.getElementById('chartProductFilter').value);
        if (selectedProductId && selectedProductId !== 'all') {
            userSales = userSales.filter(s => s.productId === selectedProductId);
        }
        
        // Generar array de días en el rango
        const days = [];
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T00:00:00');
        end.setDate(end.getDate() + 1); // Asegurar que incluya el día final
        
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
            days.push(new Date(d).toISOString().split('T')[0]);
        }
        
        // Agrupar ventas por día
        const salesByDay = {};
        days.forEach(day => {
            salesByDay[day] = {
                count: 0,
                revenue: 0,
                profit: 0
            };
        });
        
        userSales.forEach(sale => {
            if (salesByDay[sale.date] !== undefined) {
                salesByDay[sale.date].count += sale.quantity;
                salesByDay[sale.date].revenue += sale.subtotal;
                salesByDay[sale.date].profit += sale.profit;
            }
        });
        
        // Preparar datos para el gráfico
        const labels = days.map(date => {
            const d = new Date(date + 'T00:00:00');
            return d.getDate() + '/' + (d.getMonth() + 1);
        });
        
        const salesData = days.map(date => salesByDay[date].count);
        const profitData = days.map(date => salesByDay[date].profit);
        
        this.renderSalesChart(labels, salesData, profitData, 'Días');
    },

    // Cargar gráfica por meses
    loadMonthlySalesChart: function() {
        const startMonth = document.getElementById('startMonth').value;
        const endMonth = document.getElementById('endMonth').value;
        
        if (!startMonth || !endMonth) {
            Utils.showToast('Por favor selecciona un rango de meses', 'warning');
            return;
        }
        
        if (startMonth > endMonth) {
            Utils.showToast('El mes de inicio debe ser menor que el mes final', 'danger');
            return;
        }
        
        const allSales = StorageManager.readAll('sales') || [];
        const allProducts = StorageManager.readAll('products') || [];
        
        // Filtrar solo productos del usuario actual
        const userProducts = allProducts.filter(p => p.createdBy === this.currentUser.id);
        const userProductIds = userProducts.map(p => p.id);
        let userSales = allSales.filter(s => userProductIds.includes(s.productId));
        
        // Aplicar filtro de producto si está seleccionado
        const selectedProductId = parseInt(document.getElementById('chartProductFilter').value);
        if (selectedProductId && selectedProductId !== 'all') {
            userSales = userSales.filter(s => s.productId === selectedProductId);
        }
        
        // Generar array de meses en el rango
        const months = [];
        const start = new Date(startMonth + '-01');
        const end = new Date(endMonth + '-01');
        end.setMonth(end.getMonth() + 1); // Asegurar que incluya el mes final
        
        for (let d = new Date(start); d < end; d.setMonth(d.getMonth() + 1)) {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            months.push(`${year}-${month}`);
        }
        
        // Agrupar ventas por mes
        const salesByMonth = {};
        months.forEach(month => {
            salesByMonth[month] = {
                count: 0,
                revenue: 0,
                profit: 0
            };
        });
        
        userSales.forEach(sale => {
            const saleMonth = sale.date.substring(0, 7); // YYYY-MM
            if (salesByMonth[saleMonth] !== undefined) {
                salesByMonth[saleMonth].count += sale.quantity;
                salesByMonth[saleMonth].revenue += sale.subtotal;
                salesByMonth[saleMonth].profit += sale.profit;
            }
        });
        
        // Preparar datos para el gráfico
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const labels = months.map(month => {
            const [year, m] = month.split('-');
            return `${monthNames[parseInt(m) - 1]} ${year}`;
        });
        
        const salesData = months.map(month => salesByMonth[month].count);
        const profitData = months.map(month => salesByMonth[month].profit);
        
        this.renderSalesChart(labels, salesData, profitData, 'Meses');
    },

    // Renderizar gráfica
    renderSalesChart: function(labels, salesData, profitData, periodLabel) {
        const ctx = document.getElementById('dailySalesChart');
        if (!ctx) return;
        
        // Destruir gráfica anterior si existe
        if (this.currentChartInstance) {
            this.currentChartInstance.destroy();
        }
        
        this.currentChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Unidades Vendidas',
                        data: salesData,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.1)',
                        tension: 0.3,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Ganancias ($)',
                        data: profitData,
                        borderColor: 'rgb(255, 159, 64)',
                        backgroundColor: 'rgba(255, 159, 64, 0.1)',
                        tension: 0.3,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: `Ventas por ${periodLabel}`
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    if (context.datasetIndex === 1) {
                                        label += '$' + context.parsed.y.toLocaleString('es-CO');
                                    } else {
                                        label += context.parsed.y;
                                    }
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Unidades'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Ganancias ($)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    },

    showProducts: function() {
        this.currentView = 'products';
        const content = document.getElementById('dashboardContent');
        if (!content) return;

        content.innerHTML = `
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 class="h2">Gestión de Productos</h1>
                <button class="btn btn-success" onclick="ProductManager.showProductForm()">
                    <i class="bi bi-plus-circle"></i> Nuevo Producto
                </button>
            </div>

            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Imagen</th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Costo</th>
                            <th>Precio</th>
                            <th>Etiquetas</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="productsTableBody"></tbody>
                </table>
            </div>

            ${this.getProductModal()}
        `;

        ProductManager.renderProductsTable();
        CategoryManager.init();
        
        // Conectar evento del formulario de productos
        setTimeout(() => {
            const productForm = document.getElementById('productForm');
            if (productForm) {
                productForm.addEventListener('submit', (e) => ProductManager.saveProduct(e));
            }
        }, 100);
    },

    showCategories: function() {
        this.currentView = 'categories';
        const content = document.getElementById('dashboardContent');
        if (!content) return;

        content.innerHTML = `
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 class="h2">Gestión de Categorías</h1>
                <button class="btn btn-success" onclick="CategoryManager.showCategoryForm()">
                    <i class="bi bi-plus-circle"></i> Nueva Categoría
                </button>
            </div>

            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="categoriesTableBody"></tbody>
                </table>
            </div>

            ${this.getCategoryModal()}
        `;

        CategoryManager.renderCategoriesList();
        
        // Conectar evento del formulario de categorías
        setTimeout(() => {
            const categoryForm = document.getElementById('categoryForm');
            if (categoryForm) {
                categoryForm.addEventListener('submit', (e) => CategoryManager.saveCategory(e));
            }
        }, 100);
    },

    showUsers: function() {
        this.currentView = 'users';
        const content = document.getElementById('dashboardContent');
        if (!content) return;

        content.innerHTML = `
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 class="h2">Gestión de Usuarios</h1>
                <button class="btn btn-success" onclick="UserManager.showUserForm()">
                    <i class="bi bi-plus-circle"></i> Nuevo Usuario
                </button>
            </div>

            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Usuario</th>
                            <th>Nombre Completo</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="usersTableBody"></tbody>
                </table>
            </div>

            ${this.getUserModal()}
        `;

        UserManager.renderUsersList();
        
        // Conectar evento del formulario de usuarios
        setTimeout(() => {
            const userForm = document.getElementById('userForm');
            if (userForm) {
                userForm.addEventListener('submit', (e) => UserManager.saveUser(e));
            }
        }, 100);
    },

    showReports: function() {
        this.currentView = 'reports';
        const content = document.getElementById('dashboardContent');
        if (!content) return;

        const currentYear = Utils.getCurrentYear();

        content.innerHTML = `
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 class="h2">Reportes de Ganancias</h1>
            </div>

            <ul class="nav nav-tabs mb-3" role="tablist">
                <li class="nav-item">
                    <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#monthlyReport">
                        Reporte Mensual
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#productReport">
                        Reporte por Producto
                    </button>
                </li>
            </ul>

            <div class="tab-content">
                <div class="tab-pane fade show active" id="monthlyReport">
                    <div class="card mb-4">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5>Ganancias Mensuales</h5>
                            <div>
                                <select class="form-select d-inline-block w-auto" id="monthlyReportYear" onchange="DashboardManager.updateMonthlyReport()">
                                    ${this.generateYearOptions(currentYear)}
                                </select>
                                <button class="btn btn-sm btn-success ms-2" onclick="ReportsManager.exportMonthlyReport(document.getElementById('monthlyReportYear').value)">
                                    <i class="bi bi-download"></i> Exportar
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div style="height: 400px;">
                                <canvas id="monthlyProfitChart"></canvas>
                            </div>
                            <div class="table-responsive mt-4">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Mes</th>
                                            <th class="text-end">Ventas</th>
                                            <th class="text-end">Ingresos</th>
                                            <th class="text-end">Ganancias</th>
                                        </tr>
                                    </thead>
                                    <tbody id="monthlyReportTableBody"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="tab-pane fade" id="productReport">
                    <div class="card mb-4">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5>Ganancias por Producto</h5>
                            <div>
                                <select class="form-select d-inline-block w-auto" id="productReportSelect" onchange="DashboardManager.updateProductReport()">
                                    <option value="">Seleccione un producto</option>
                                </select>
                                <button class="btn btn-sm btn-success ms-2" onclick="ReportsManager.exportProductReport(document.getElementById('productReportSelect').value)">
                                    <i class="bi bi-download"></i> Exportar
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div style="height: 400px;">
                                <canvas id="productProfitChart"></canvas>
                            </div>
                            <div class="table-responsive mt-4">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th class="text-end">Cantidad</th>
                                            <th class="text-end">Costo Total</th>
                                            <th class="text-end">Ingresos</th>
                                            <th class="text-end">Ganancia</th>
                                        </tr>
                                    </thead>
                                    <tbody id="productReportTableBody"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Cargar Chart.js si no está cargado
        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = () => this.initializeReports(currentYear);
            document.head.appendChild(script);
        } else {
            this.initializeReports(currentYear);
        }
    },

    initializeReports: function(year) {
        ReportsManager.init();
        ReportsManager.renderMonthlyReportTable(year);
        ReportsManager.renderMonthlyChart(year);
        ReportsManager.loadProductsSelect('productReportSelect');
    },

    updateMonthlyReport: function() {
        const year = document.getElementById('monthlyReportYear').value;
        ReportsManager.renderMonthlyReportTable(year);
        ReportsManager.renderMonthlyChart(year);
    },

    updateProductReport: function() {
        const productId = document.getElementById('productReportSelect').value;
        if (productId) {
            ReportsManager.renderProductReportTable(productId);
            ReportsManager.renderProductChart(productId);
        }
    },

    generateYearOptions: function(currentYear) {
        const years = [];
        for (let i = currentYear; i >= currentYear - 5; i--) {
            years.push(`<option value="${i}">${i}</option>`);
        }
        return years.join('');
    },

    // Modales
    getProductModal: function() {
        return `
            <div class="modal fade" id="productModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="productModalLabel">Producto</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form id="productForm" class="needs-validation" novalidate>
                            <div class="modal-body">
                                <input type="hidden" id="productId">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="productName" class="form-label">Nombre *</label>
                                        <input type="text" class="form-control" id="productName" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="productCategory" class="form-label">Categoría *</label>
                                        <select class="form-select" id="productCategory" required></select>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="productDescription" class="form-label">Descripción *</label>
                                    <textarea class="form-control" id="productDescription" rows="3" required></textarea>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="productCost" class="form-label">Costo *</label>
                                        <input type="number" class="form-control" id="productCost" step="0.01" min="0" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="productPrice" class="form-label">Precio *</label>
                                        <input type="number" class="form-control" id="productPrice" step="0.01" min="0" required>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="productImage" class="form-label">URL de Imagen</label>
                                    <input type="url" class="form-control" id="productImage" placeholder="https://...">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Etiquetas Ecológicas</label>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="eco_organico">
                                        <label class="form-check-label" for="eco_organico">🌱 Orgánico</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="eco_biodegradable">
                                        <label class="form-check-label" for="eco_biodegradable">♻️ Biodegradable</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="eco_vegano">
                                        <label class="form-check-label" for="eco_vegano">🌿 Vegano</label>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" class="btn btn-success">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    },

    getCategoryModal: function() {
        return `
            <div class="modal fade" id="categoryModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="categoryModalLabel">Categoría</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form id="categoryForm" class="needs-validation" novalidate>
                            <div class="modal-body">
                                <input type="hidden" id="categoryId">
                                <div class="mb-3">
                                    <label for="categoryName" class="form-label">Nombre *</label>
                                    <input type="text" class="form-control" id="categoryName" required>
                                    <div class="invalid-feedback">El nombre es obligatorio y debe ser único</div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" class="btn btn-success">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    },

    getUserModal: function() {
        return `
            <div class="modal fade" id="userModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="userModalLabel">Usuario</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form id="userForm" class="needs-validation" novalidate>
                            <div class="modal-body">
                                <input type="hidden" id="userId">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="username" class="form-label">Nombre de Usuario *</label>
                                        <input type="text" class="form-control" id="username" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="userFullName" class="form-label">Nombre Completo *</label>
                                        <input type="text" class="form-control" id="userFullName" required>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="userEmail" class="form-label">Email *</label>
                                        <input type="email" class="form-control" id="userEmail" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="userPhone" class="form-label">Teléfono</label>
                                        <input type="tel" class="form-control" id="userPhone">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="userPassword" class="form-label">Contraseña *</label>
                                        <input type="password" class="form-control" id="userPassword" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="userRole" class="form-label">Rol *</label>
                                        <select class="form-select" id="userRole" required>
                                            <option value="Usuario">Usuario</option>
                                            <option value="Administrador">Administrador</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" class="btn btn-success">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    },

    logout: function() {
        AuthManager.logout();
    },

    showProfile: function() {
        this.currentView = 'profile';
        const content = document.getElementById('dashboardContent');
        if (!content) return;

        content.innerHTML = `
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 class="h2"><i class="bi bi-person-circle"></i> Mi Perfil</h1>
            </div>

            <div class="row">
                <div class="col-md-4">
                    <div class="card shadow-sm">
                        <div class="card-body text-center">
                            <div class="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style="width: 120px; height: 120px;">
                                <i class="bi bi-person-fill text-success" style="font-size: 4rem;"></i>
                            </div>
                            <h4 class="mb-1">${this.currentUser.fullName}</h4>
                            <p class="text-muted mb-2">${this.currentUser.email}</p>
                            <span class="badge bg-success">${this.currentUser.role}</span>
                        </div>
                    </div>
                </div>

                <div class="col-md-8">
                    <!-- Formulario de Información Personal -->
                    <div class="card shadow-sm mb-4">
                        <div class="card-header bg-success text-white">
                            <h5 class="mb-0"><i class="bi bi-person-badge"></i> Información Personal</h5>
                        </div>
                        <div class="card-body">
                            <form id="profileInfoForm">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="profileFullName" class="form-label">Nombre Completo *</label>
                                        <input type="text" class="form-control" id="profileFullName" value="${this.currentUser.fullName}" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="profileEmail" class="form-label">Correo Electrónico *</label>
                                        <input type="email" class="form-control" id="profileEmail" value="${this.currentUser.email}" required>
                                    </div>
                                </div>
                                <div class="alert alert-info">
                                    <i class="bi bi-info-circle"></i> Al cambiar tu correo electrónico, deberás iniciar sesión nuevamente.
                                </div>
                                <button type="submit" class="btn btn-success">
                                    <i class="bi bi-check-circle"></i> Actualizar Información
                                </button>
                            </form>
                        </div>
                    </div>

                    <!-- Formulario de Cambio de Contraseña -->
                    <div class="card shadow-sm mb-4">
                        <div class="card-header bg-warning text-dark">
                            <h5 class="mb-0"><i class="bi bi-shield-lock"></i> Cambiar Contraseña</h5>
                        </div>
                        <div class="card-body">
                            <form id="profilePasswordForm">
                                <div class="mb-3">
                                    <label for="currentPassword" class="form-label">Contraseña Actual *</label>
                                    <input type="password" class="form-control" id="currentPassword" required>
                                </div>
                                <div class="mb-3">
                                    <label for="newPassword" class="form-label">Nueva Contraseña *</label>
                                    <input type="password" class="form-control" id="newPassword" required minlength="6">
                                    <div class="form-text">Mínimo 6 caracteres</div>
                                </div>
                                <div class="mb-3">
                                    <label for="confirmPassword" class="form-label">Confirmar Nueva Contraseña *</label>
                                    <input type="password" class="form-control" id="confirmPassword" required minlength="6">
                                </div>
                                <button type="submit" class="btn btn-warning">
                                    <i class="bi bi-key"></i> Cambiar Contraseña
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Configurar event listeners
        setTimeout(() => {
            this.setupProfileFormListeners();
        }, 100);
    },

    setupProfileFormListeners: function() {
        // Formulario de información personal
        const profileInfoForm = document.getElementById('profileInfoForm');
        if (profileInfoForm) {
            profileInfoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProfileInfo();
            });
        }

        // Formulario de cambio de contraseña
        const profilePasswordForm = document.getElementById('profilePasswordForm');
        if (profilePasswordForm) {
            profilePasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updatePassword();
            });
        }
    },

    updateProfileInfo: function() {
        const fullName = document.getElementById('profileFullName').value.trim();
        const email = document.getElementById('profileEmail').value.trim().toLowerCase();

        if (!fullName || !email) {
            Utils.showToast('Por favor completa todos los campos', 'warning');
            return;
        }

        // Validar formato de email
        if (!Utils.validateEmail(email)) {
            Utils.showToast('Por favor ingresa un correo electrónico válido', 'danger');
            return;
        }

        // Verificar si el email ya existe (excepto el actual)
        const users = StorageManager.readAll('users') || [];
        const emailExists = users.some(u => u.email === email && u.id !== this.currentUser.id);
        
        if (emailExists) {
            Utils.showToast('Este correo electrónico ya está registrado', 'danger');
            return;
        }

        // Actualizar usuario
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            const emailChanged = users[userIndex].email !== email;
            
            users[userIndex].fullName = fullName;
            users[userIndex].email = email;
            users[userIndex].updatedAt = new Date().toISOString();

            StorageManager.write('users', users);

            // Actualizar sesión actual
            this.currentUser.fullName = fullName;
            this.currentUser.email = email;
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));

            Utils.showToast('Información actualizada correctamente', 'success');

            // Si cambió el email, cerrar sesión
            if (emailChanged) {
                setTimeout(() => {
                    Utils.showToast('Por favor inicia sesión con tu nuevo correo', 'info');
                    setTimeout(() => {
                        this.logout();
                    }, 2000);
                }, 1000);
            } else {
                // Recargar perfil
                setTimeout(() => {
                    this.showProfile();
                }, 1000);
            }
        }
    },

    updatePassword: function() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            Utils.showToast('Por favor completa todos los campos', 'warning');
            return;
        }

        if (newPassword.length < 6) {
            Utils.showToast('La nueva contraseña debe tener al menos 6 caracteres', 'danger');
            return;
        }

        if (newPassword !== confirmPassword) {
            Utils.showToast('Las contraseñas no coinciden', 'danger');
            return;
        }

        // Verificar contraseña actual
        const users = StorageManager.readAll('users') || [];
        const user = users.find(u => u.id === this.currentUser.id);

        if (!user || user.password !== currentPassword) {
            Utils.showToast('La contraseña actual es incorrecta', 'danger');
            return;
        }

        // Actualizar contraseña
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            users[userIndex].updatedAt = new Date().toISOString();

            StorageManager.write('users', users);

            Utils.showToast('Contraseña actualizada correctamente', 'success');

            // Limpiar formulario
            document.getElementById('profilePasswordForm').reset();
        }
    },

    redirectToCart: function() {
        window.location.href = 'cart.html';
    },

    redirectToIndex: function() {
        window.location.href = 'catalogo.html';
    },

    showOrders: function() {
        this.currentView = 'orders';
        const content = document.getElementById('dashboardContent');
        if (!content) return;

        const allOrders = StorageManager.get('orders') || [];
        const userOrders = allOrders.filter(order => order.userId === this.currentUser.id);
        
        // Ordenar por fecha más reciente
        userOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        content.innerHTML = `
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 class="h2"><i class="bi bi-bag-check"></i> Historial de Compras</h1>
            </div>

            ${userOrders.length === 0 ? `
                <div class="card border-0 shadow-sm">
                    <div class="card-body text-center py-5">
                        <i class="bi bi-bag-x display-1 text-muted mb-4"></i>
                        <h3 class="mb-3">No tienes compras registradas</h3>
                        <p class="text-muted mb-4">
                            Explora nuestro catálogo y comienza a comprar productos ecológicos.
                        </p>
                        <a href="catalogo.html" class="btn btn-success btn-lg">
                            <i class="bi bi-shop"></i> Ir al Catálogo
                        </a>
                    </div>
                </div>
            ` : `
                <div class="row">
                    ${userOrders.map(order => {
                        return `
                            <div class="col-md-6 col-lg-4 mb-4">
                                <div class="card shadow-sm h-100">
                                    <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>Pedido #${order.id}</strong>
                                        </div>
                                        <span class="badge bg-light text-success">
                                            <i class="bi bi-bag-check-fill"></i> Comprado
                                        </span>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <small class="text-muted d-block mb-1">
                                                <i class="bi bi-calendar"></i> ${new Date(order.timestamp).toLocaleDateString('es-ES', { 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric'
                                                })}
                                            </small>
                                            <small class="text-muted d-block">
                                                <i class="bi bi-clock"></i> ${new Date(order.timestamp).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </small>
                                        </div>
                                        
                                        <div class="mb-3">
                                            <h6 class="mb-2"><i class="bi bi-box-seam"></i> Productos</h6>
                                            <div class="small">
                                                ${order.items.slice(0, 3).map(item => `
                                                    <div class="d-flex justify-content-between mb-1">
                                                        <span class="text-truncate me-2">${Utils.sanitizeHTML(item.productName)}</span>
                                                        <span class="text-nowrap">×${item.quantity}</span>
                                                    </div>
                                                `).join('')}
                                                ${order.items.length > 3 ? `
                                                    <div class="text-muted small">+ ${order.items.length - 3} producto(s) más</div>
                                                ` : ''}
                                            </div>
                                        </div>
                                        
                                        <div class="border-top pt-3">
                                            <div class="d-flex justify-content-between align-items-center mb-3">
                                                <strong>Total:</strong>
                                                <strong class="text-success fs-5">${Utils.formatPrice(order.total)}</strong>
                                            </div>
                                            <button class="btn btn-outline-success w-100" onclick="DashboardManager.viewOrderDetails(${order.id})">
                                                <i class="bi bi-eye"></i> Ver Detalles
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `}
        `;
    },

    viewOrderDetails: function(orderId) {
        const orders = StorageManager.get('orders') || [];
        const order = orders.find(o => o.id === orderId);
        
        if (!order) {
            Utils.showToast('Pedido no encontrado', 'danger');
            return;
        }

        const statusColors = {
            'pendiente': 'warning',
            'procesando': 'info',
            'enviado': 'primary',
                            'comprado': 'success',
            'comprado': 'success',
                            'entregado': 'success',
            'cancelado': 'danger'
        };
        const statusColor = statusColors[order.status] || 'secondary';

        const modalHTML = `
            <div class="modal fade" id="orderDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">
                                <i class="bi bi-bag-check"></i> Detalles del Pedido #${order.id}
                                <span class="badge bg-${statusColor} ms-2">${order.status}</span>
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <h6 class="border-bottom pb-2"><i class="bi bi-calendar"></i> Información del Pedido</h6>
                                    <p class="mb-1"><strong>Número de pedido:</strong> #${order.id}</p>
                                    <p class="mb-1"><strong>Fecha:</strong> ${new Date(order.timestamp).toLocaleString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</p>
                                    <p class="mb-1"><strong>Estado:</strong> <span class="badge bg-${statusColor}">${order.status}</span></p>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <h6 class="border-bottom pb-2"><i class="bi bi-geo-alt"></i> Dirección de Envío</h6>
                                    <p class="mb-1"><strong>${order.shippingInfo.name}</strong></p>
                                    <p class="mb-1"><i class="bi bi-telephone"></i> ${order.shippingInfo.phone}</p>
                                    <p class="mb-1"><i class="bi bi-house"></i> ${order.shippingInfo.address}</p>
                                    <p class="mb-1">${order.shippingInfo.city}, ${order.shippingInfo.postal}</p>
                                    ${order.shippingInfo.notes ? `<p class="mb-0 mt-2 text-muted small"><i class="bi bi-chat-left-text"></i> ${order.shippingInfo.notes}</p>` : ''}
                                </div>
                            </div>

                            <h6 class="border-bottom pb-2 mt-3"><i class="bi bi-box-seam"></i> Productos</h6>
                            <div class="table-responsive">
                                <table class="table table-sm table-hover">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Producto</th>
                                            <th class="text-center">Cantidad</th>
                                            <th class="text-end">Precio Unit.</th>
                                            <th class="text-end">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${order.items.map(item => `
                                            <tr>
                                                <td>${Utils.sanitizeHTML(item.productName)}</td>
                                                <td class="text-center"><span class="badge bg-secondary">${item.quantity}</span></td>
                                                <td class="text-end">${Utils.formatPrice(item.price)}</td>
                                                <td class="text-end"><strong>${Utils.formatPrice(item.subtotal)}</strong></td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                    <tfoot class="table-light">
                                        <tr>
                                            <td colspan="3" class="text-end"><strong>Total:</strong></td>
                                            <td class="text-end"><strong class="fs-5 text-success">${Utils.formatPrice(order.total)}</strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="bi bi-x-circle"></i> Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remover modal anterior si existe
        const oldModal = document.getElementById('orderDetailsModal');
        if (oldModal) oldModal.remove();

        // Agregar modal al body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
        modal.show();
    },

    showAllOrders: function() {
        this.currentView = 'allOrders';
        const content = document.getElementById('dashboardContent');
        if (!content) return;

        const allOrders = StorageManager.get('orders') || [];
        
        // Ordenar por fecha más reciente
        allOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Estadísticas rápidas
        const totalOrders = allOrders.length;
        const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        content.innerHTML = `
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 class="h2"><i class="bi bi-bag-check"></i> Gestión de Pedidos</h1>
            </div>

            <!-- Estadísticas -->
            <div class="row g-3 mb-4">
                <div class="col-md-4">
                    <div class="card text-center shadow-sm">
                        <div class="card-body">
                            <i class="bi bi-bag-check-fill text-success fs-1"></i>
                            <h3 class="mt-2">${totalOrders}</h3>
                            <p class="text-muted mb-0">Total Pedidos</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card text-center shadow-sm">
                        <div class="card-body">
                            <i class="bi bi-cash-stack text-success fs-1"></i>
                            <h3 class="mt-2">${Utils.formatPrice(totalRevenue)}</h3>
                            <p class="text-muted mb-0">Ingresos Totales</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card text-center shadow-sm">
                        <div class="card-body">
                            <i class="bi bi-graph-up text-info fs-1"></i>
                            <h3 class="mt-2">${Utils.formatPrice(avgOrderValue)}</h3>
                            <p class="text-muted mb-0">Promedio por Pedido</p>
                        </div>
                    </div>
                </div>
            </div>

            ${allOrders.length === 0 ? `
                <div class="card border-0 shadow-sm">
                    <div class="card-body text-center py-5">
                        <i class="bi bi-bag-x display-1 text-muted mb-4"></i>
                        <h3 class="mb-3">No hay pedidos registrados</h3>
                    </div>
                </div>
            ` : `
                <div class="card shadow-sm">
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Pedido #</th>
                                        <th>Cliente</th>
                                        <th>Fecha</th>
                                        <th>Productos</th>
                                        <th class="text-end">Total</th>
                                        <th class="text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${allOrders.map(order => {
                                        return `
                                            <tr>
                                                <td><strong class="text-success">#${order.id}</strong></td>
                                                <td>
                                                    <div>${order.userName}</div>
                                                    <small class="text-muted">${order.userEmail}</small>
                                                </td>
                                                <td>${new Date(order.timestamp).toLocaleDateString('es-ES')}<br>
                                                    <small class="text-muted">${new Date(order.timestamp).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}</small>
                                                </td>
                                                <td>${order.items.length} producto(s)</td>
                                                <td class="text-end"><strong class="text-success fs-6">${Utils.formatPrice(order.total)}</strong></td>
                                                <td class="text-center">
                                                    <button class="btn btn-sm btn-outline-primary" onclick="DashboardManager.viewOrderDetailsAdmin(${order.id})" title="Ver detalles">
                                                        <i class="bi bi-eye"></i> Ver Detalles
                                                    </button>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `}
        `;
    },

    viewOrderDetailsAdmin: function(orderId) {
        const orders = StorageManager.get('orders') || [];
        const order = orders.find(o => o.id === orderId);
        
        if (!order) {
            Utils.showToast('Pedido no encontrado', 'danger');
            return;
        }

        const statusColors = {
            'pendiente': 'warning',
            'procesando': 'info',
            'enviado': 'primary',
                            'comprado': 'success',
            'comprado': 'success',
                            'entregado': 'success',
            'cancelado': 'danger'
        };
        const statusColor = statusColors[order.status] || 'secondary';

        const modalHTML = `
            <div class="modal fade" id="orderDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">
                                <i class="bi bi-bag-check"></i> Detalles del Pedido #${order.id}
                                <span class="badge bg-${statusColor} ms-2">${order.status}</span>
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <h6 class="border-bottom pb-2"><i class="bi bi-person"></i> Información del Cliente</h6>
                                    <p class="mb-1"><strong>Nombre:</strong> ${order.userName}</p>
                                    <p class="mb-1"><strong>Email:</strong> ${order.userEmail}</p>
                                    <p class="mb-1"><strong>Fecha:</strong> ${new Date(order.timestamp).toLocaleString('es-ES')}</p>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <h6 class="border-bottom pb-2"><i class="bi bi-geo-alt"></i> Dirección de Envío</h6>
                                    <p class="mb-1"><strong>${order.shippingInfo.name}</strong></p>
                                    <p class="mb-1">${order.shippingInfo.phone}</p>
                                    <p class="mb-1">${order.shippingInfo.address}</p>
                                    <p class="mb-1">${order.shippingInfo.city}, ${order.shippingInfo.postal}</p>
                                    ${order.shippingInfo.notes ? `<p class="mb-0 mt-2 text-muted small"><i class="bi bi-chat-left-text"></i> ${order.shippingInfo.notes}</p>` : ''}
                                </div>
                            </div>

                            <h6 class="border-bottom pb-2"><i class="bi bi-box-seam"></i> Productos</h6>
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th class="text-center">Cantidad</th>
                                            <th class="text-end">Precio Unit.</th>
                                            <th class="text-end">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${order.items.map(item => `
                                            <tr>
                                                <td>${Utils.sanitizeHTML(item.productName)}</td>
                                                <td class="text-center">${item.quantity}</td>
                                                <td class="text-end">${Utils.formatPrice(item.price)}</td>
                                                <td class="text-end"><strong>${Utils.formatPrice(item.subtotal)}</strong></td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                    <tfoot>
                                        <tr class="table-success">
                                            <td colspan="3" class="text-end"><strong>Total:</strong></td>
                                            <td class="text-end"><strong class="fs-5 text-success">${Utils.formatPrice(order.total)}</strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-success" data-bs-dismiss="modal">
                                <i class="bi bi-x-circle"></i> Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remover modal anterior si existe
        const oldModal = document.getElementById('orderDetailsModal');
        if (oldModal) oldModal.remove();

        // Agregar modal al body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
        modal.show();
    },

};

// Inicializar dashboard
document.addEventListener('DOMContentLoaded', function() {
    DashboardManager.init();
});
