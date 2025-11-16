// Gestión del Carrito de Compras - RF3
const CartManager = {
    cart: [],

    init: function() {
        this.loadCart();
        this.updateCartUI();
        this.setupCheckoutButton();
    },

    getCartKey: function() {
        const currentUser = AuthManager.getCurrentUser();
        if (!currentUser) return null;
        return `cart_${currentUser.id}`;
    },

    loadCart: function() {
        const cartKey = this.getCartKey();
        if (!cartKey) {
            this.cart = [];
            return this.cart;
        }
        this.cart = StorageManager.getSession(cartKey) || [];
        return this.cart;
    },

    saveCart: function() {
        const cartKey = this.getCartKey();
        if (!cartKey) {
            this.cart = [];
            return;
        }
        StorageManager.saveSession(cartKey, this.cart);
        this.updateCartUI();
    },

    addToCart: function(productId) {
        // Verificar autenticación
        const currentUser = AuthManager.getCurrentUser();
        if (!currentUser) {
            Utils.showToast('Debes iniciar sesión para agregar productos al carrito', 'warning');
            setTimeout(() => {
                window.location.href = 'views/login.html';
            }, 1500);
            return;
        }

        const product = StorageManager.readById('products', productId);
        if (!product) {
            Utils.showToast('Producto no encontrado', 'danger');
            return;
        }

        const existingItem = this.cart.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity++;
            Utils.showToast('Cantidad actualizada en el carrito', 'success');
        } else {
            this.cart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                cost: product.cost,
                image: product.image,
                quantity: 1
            });
            Utils.showToast('Producto agregado al carrito', 'success');
        }

        this.saveCart();
    },

    updateQuantity: function(productId, quantity) {
        const item = this.cart.find(item => item.productId === productId);
        
        if (!item) return;

        if (quantity < 1) {
            this.removeFromCart(productId);
            return;
        }

        item.quantity = parseInt(quantity);
        this.saveCart();
        this.renderCartItems();
    },

    removeFromCart: function(productId) {
        this.cart = this.cart.filter(item => item.productId !== productId);
        this.saveCart();
        this.renderCartItems();
        Utils.showToast('Producto eliminado del carrito', 'info');
    },

    clearCart: function() {
        Utils.confirm('¿Está seguro de vaciar el carrito?', () => {
            this.cart = [];
            this.saveCart();
            this.renderCartItems();
            Utils.showToast('Carrito vaciado', 'info');
        });
    },

    renderCartItems: function() {
        const container = document.getElementById('cartItems');
        if (!container) return;

        this.loadCart();

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-cart-x display-1 text-muted"></i>
                    <p class="text-muted mt-3">Tu carrito está vacío</p>
                    <a href="catalogo.html" class="btn btn-success mt-2">
                        <i class="bi bi-shop"></i> Ir a comprar
                    </a>
                </div>
            `;
            return;
        }

        container.innerHTML = this.cart.map(item => `
            <div class="cart-item border-bottom py-3">
                <div class="row align-items-center">
                    <div class="col-md-2 col-3 mb-2 mb-md-0">
                        <img src="${item.image}" alt="${Utils.sanitizeHTML(item.name)}" class="img-fluid rounded" style="width: 100%; height: 80px; object-fit: cover;">
                    </div>
                    <div class="col-md-3 col-9 mb-2 mb-md-0">
                        <h6 class="mb-1">${Utils.sanitizeHTML(item.name)}</h6>
                        <small class="text-muted">${Utils.formatPrice(item.price)} c/u</small>
                    </div>
                    <div class="col-md-3 col-6 mb-2 mb-md-0">
                        <div class="input-group input-group-sm">
                            <button class="btn btn-outline-secondary" onclick="CartManager.updateQuantity(${item.productId}, ${item.quantity - 1})">
                                <i class="bi bi-dash"></i>
                            </button>
                            <input type="number" class="form-control text-center" value="${item.quantity}" min="1" 
                                onchange="CartManager.updateQuantity(${item.productId}, this.value)" style="max-width: 60px;">
                            <button class="btn btn-outline-secondary" onclick="CartManager.updateQuantity(${item.productId}, ${item.quantity + 1})">
                                <i class="bi bi-plus"></i>
                            </button>
                        </div>
                    </div>
                    <div class="col-md-3 col-4 text-md-end">
                        <strong class="text-success">${Utils.formatPrice(item.price * item.quantity)}</strong>
                    </div>
                    <div class="col-md-1 col-2 text-end">
                        <button class="btn btn-sm btn-outline-danger" onclick="CartManager.removeFromCart(${item.productId})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    calculateTotal: function() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    calculateSubtotal: function(item) {
        return item.price * item.quantity;
    },

    updateCartUI: function() {
        this.loadCart();
        
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
        }

        const cartTotal = document.getElementById('cartTotal');
        if (cartTotal) {
            cartTotal.textContent = Utils.formatPrice(this.calculateTotal());
        }

        const cartSubtotal = document.getElementById('cartSubtotal');
        if (cartSubtotal) {
            cartSubtotal.textContent = Utils.formatPrice(this.calculateTotal());
        }

        this.renderCartItems();
    },

    setupCheckoutButton: function() {
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            // Remover listeners anteriores si existen
            const newBtn = checkoutBtn.cloneNode(true);
            checkoutBtn.parentNode.replaceChild(newBtn, checkoutBtn);
            
            // Agregar nuevo listener
            newBtn.addEventListener('click', () => this.checkout());
        }
    },

    checkout: function() {
        if (this.cart.length === 0) {
            Utils.showToast('El carrito está vacío', 'warning');
            return;
        }

        const currentUser = AuthManager.getCurrentUser();
        if (!currentUser) {
            Utils.showToast('Debe iniciar sesión para finalizar la compra', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        // Mostrar modal de confirmación de compra
        this.showCheckoutModal();
    },

    showCheckoutModal: function() {
        const total = this.calculateTotal();
        const currentUser = AuthManager.getCurrentUser();
        
        const modalHTML = `
            <div class="modal fade" id="checkoutModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title"><i class="bi bi-cart-check"></i> Finalizar Compra</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <h6 class="mb-3">Resumen de Compra</h6>
                            <div class="table-responsive mb-3">
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
                                        ${this.cart.map(item => `
                                            <tr>
                                                <td>${Utils.sanitizeHTML(item.name)}</td>
                                                <td class="text-center">${item.quantity}</td>
                                                <td class="text-end">${Utils.formatPrice(item.price)}</td>
                                                <td class="text-end"><strong>${Utils.formatPrice(item.price * item.quantity)}</strong></td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                    <tfoot>
                                        <tr class="table-success">
                                            <td colspan="3" class="text-end"><strong>Total:</strong></td>
                                            <td class="text-end"><strong class="fs-5">${Utils.formatPrice(total)}</strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <h6 class="mb-3">Información de Envío</h6>
                            <form id="checkoutForm">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Nombre Completo *</label>
                                        <input type="text" class="form-control" id="shippingName" value="${currentUser.fullName}" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Teléfono *</label>
                                        <input type="tel" class="form-control" id="shippingPhone" value="${currentUser.phone || ''}" required>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Dirección de Envío *</label>
                                    <input type="text" class="form-control" id="shippingAddress" placeholder="Calle, número, piso..." required>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Ciudad *</label>
                                        <input type="text" class="form-control" id="shippingCity" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Código Postal *</label>
                                        <input type="text" class="form-control" id="shippingPostal" required>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Notas adicionales (opcional)</label>
                                    <textarea class="form-control" id="shippingNotes" rows="2" placeholder="Instrucciones especiales de entrega..."></textarea>
                                </div>
                            </form>

                            <div class="alert alert-info mb-0">
                                <i class="bi bi-info-circle"></i> <strong>Información de pago:</strong> El pago se realizará contra entrega. Recibirás un correo de confirmación con los detalles de tu pedido.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-success" onclick="CartManager.confirmPurchase()">
                                <i class="bi bi-check-circle"></i> Confirmar Compra
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remover modal anterior si existe
        const oldModal = document.getElementById('checkoutModal');
        if (oldModal) oldModal.remove();

        // Agregar modal al body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
        modal.show();
    },

    confirmPurchase: function() {
        const form = document.getElementById('checkoutForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const currentUser = AuthManager.getCurrentUser();
        const shippingInfo = {
            name: document.getElementById('shippingName').value,
            phone: document.getElementById('shippingPhone').value,
            address: document.getElementById('shippingAddress').value,
            city: document.getElementById('shippingCity').value,
            postal: document.getElementById('shippingPostal').value,
            notes: document.getElementById('shippingNotes').value
        };

        // Crear orden de compra
        const orders = StorageManager.get('orders') || [];
        const orderId = StorageManager.generateId('orders');
        const orderDate = new Date().toISOString();
        
        const newOrder = {
            id: orderId,
            userId: currentUser.id,
            userName: currentUser.fullName,
            userEmail: currentUser.email,
            items: this.cart.map(item => ({
                productId: item.productId,
                productName: item.name,
                price: item.price,
                cost: item.cost,
                quantity: item.quantity,
                subtotal: item.price * item.quantity
            })),
            total: this.calculateTotal(),
            shippingInfo: shippingInfo,
            status: 'comprado',
            date: orderDate.split('T')[0],
            timestamp: orderDate
        };

        orders.push(newOrder);
        StorageManager.save('orders', orders);

        // Registrar ventas (para los vendedores)
        const sales = StorageManager.get('sales') || [];
        this.cart.forEach(item => {
            const product = StorageManager.readById('products', item.productId);
            const newSale = {
                id: StorageManager.generateId('sales'),
                orderId: orderId,
                productId: item.productId,
                productName: item.name,
                sellerId: product ? product.createdBy : null,
                buyerId: currentUser.id,
                buyerName: currentUser.fullName,
                cost: item.cost,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity,
                profit: (item.price - item.cost) * item.quantity,
                date: orderDate.split('T')[0],
                timestamp: orderDate
            };
            sales.push(newSale);
        });
        StorageManager.save('sales', sales);

        // Limpiar carrito
        this.cart = [];
        this.saveCart();

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
        modal.hide();

        // Mostrar mensaje de éxito
        Utils.showToast('¡Compra realizada exitosamente! Pedido #' + orderId, 'success');

        // Redirigir al historial de compras
        setTimeout(() => {
            window.location.href = 'dashboard.html?view=orders';
        }, 1500);
    }
};

// No inicializar automáticamente, esperar a que app.js lo haga
// document.addEventListener('DOMContentLoaded', function() {
//     CartManager.init();
// });
