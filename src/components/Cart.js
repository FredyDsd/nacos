import { sendOrderToWhatsApp } from '../utils/whatsapp.js';

export class Cart {
    constructor() {
        this.items = [];
        this.cartSidebar = document.getElementById('cart-sidebar');
        this.cartItemsContainer = document.getElementById('cart-items');
        this.cartTotalElement = document.getElementById('cart-total');
        this.cartCountElement = document.getElementById('cart-count');
        this.checkoutBtn = document.getElementById('checkout-btn');
        this.closeBtn = document.getElementById('close-cart');
        this.toggleBtn = document.getElementById('cart-toggle');
        this.locationOptionContainer = document.getElementById('cart-location-option');

        this.init();
    }

    init() {
        this.toggleBtn.addEventListener('click', () => this.toggleCart());
        this.closeBtn.addEventListener('click', () => this.toggleCart());
        this.checkoutBtn.addEventListener('click', () => this.checkout());

        // Close cart when clicking outside
        document.addEventListener('click', (e) => {
            if (this.cartSidebar.classList.contains('open') &&
                !this.cartSidebar.contains(e.target) &&
                !this.toggleBtn.contains(e.target)) {
                this.cartSidebar.classList.remove('open');
            }
        });
    }

    toggleCart() {
        this.cartSidebar.classList.toggle('open');
    }

    addItem(item) {
        const existingItem = this.items.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.items.push({ ...item, quantity: 1 });
        }
        this.render();
        this.toggleCart(); // Open cart when adding item
    }

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.render();
    }

    updateQuantity(id, change) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeItem(id);
            } else {
                this.render();
            }
        }
    }

    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    render() {
        // Update count
        const totalCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
        this.cartCountElement.textContent = totalCount;

        // Update total
        const total = this.getTotal();
        this.cartTotalElement.textContent = `$${total}`;

        // Render items
        if (this.items.length === 0) {
            this.cartItemsContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); margin-top: 2rem;">Tu carrito está vacío.</p>';
            if (this.locationOptionContainer) {
                this.locationOptionContainer.style.display = 'none';
            }
            return;
        }

        this.cartItemsContainer.innerHTML = this.items.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span>$${item.price} x ${item.quantity}</span>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn minus" data-id="${item.id}">-</button>
          <span>${item.quantity}</span>
          <button class="qty-btn plus" data-id="${item.id}">+</button>
          <button class="delete-btn" data-id="${item.id}" title="Eliminar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="pointer-events: none;">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
              <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
            </svg>
          </button>
        </div>
      </div>
    `).join('');

        // Add listeners to new buttons
        this.cartItemsContainer.querySelectorAll('.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.updateQuantity(parseInt(e.target.dataset.id), -1);
            });
        });

        this.cartItemsContainer.querySelectorAll('.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.updateQuantity(parseInt(e.target.dataset.id), 1);
            });
        });

        this.cartItemsContainer.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeItem(parseInt(e.target.dataset.id));
            });
        });

        // Inject Form
        if (this.locationOptionContainer) {
            this.locationOptionContainer.style.display = 'block';
            if (!this.locationOptionContainer.querySelector('.checkout-form')) {
                this.locationOptionContainer.innerHTML = `
                    <div class="checkout-form">
                        <div class="form-group">
                            <label>Nombre *</label>
                            <input type="text" id="customer-name" placeholder="Tu nombre" required>
                        </div>

                        <div class="form-group">
                            <label>Teléfono *</label>
                            <input type="text" id="customer-phone" placeholder="Tu número de celular" required>
                        </div>

                        <div class="form-group">
                            <label>Entrega *</label>
                            <div class="radio-group">
                                <label>
                                    <input type="radio" name="delivery-type" value="mi-direccion"> Mi dirección
                                </label>
                                <label>
                                    <input type="radio" name="delivery-type" value="otra-direccion"> Otra
                                </label>
                            </div>
                        </div>

                        <div id="delivery-details" style="display: none;">
                            <div class="form-group">
                                <label>Dirección *</label>
                                <input type="text" id="customer-address" placeholder="Calle y número" required>
                            </div>

                            <div class="form-group">
                                <label>Descripción (Opcional)</label>
                                <input type="text" id="customer-description" placeholder="Ej: Casa verde, rejas negras">
                            </div>

                            <div class="form-group" id="location-checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="include-location">
                                    Incluir mi ubicación actual
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Método de Pago *</label>
                            <div class="radio-group">
                                <label>
                                    <input type="radio" name="payment-method" value="efectivo" checked> Efectivo
                                </label>
                                <label>
                                    <input type="radio" name="payment-method" value="transferencia"> Transferencia
                                </label>
                            </div>
                        </div>
                    </div>
                `;

                // Add listener for delivery type change
                const deliveryRadios = this.locationOptionContainer.querySelectorAll('input[name="delivery-type"]');
                const deliveryDetails = this.locationOptionContainer.querySelector('#delivery-details');
                const locationGroup = this.locationOptionContainer.querySelector('#location-checkbox-group');

                deliveryRadios.forEach(radio => {
                    radio.addEventListener('change', (e) => {
                        deliveryDetails.style.display = 'block';
                        if (e.target.value === 'mi-direccion') {
                            locationGroup.style.display = 'block';
                        } else {
                            locationGroup.style.display = 'none';
                            // Uncheck location if hidden
                            this.locationOptionContainer.querySelector('#include-location').checked = false;
                        }
                    });
                });
            }
        }
    }

    checkout() {
        const name = document.getElementById('customer-name')?.value.trim();
        const phone = document.getElementById('customer-phone')?.value.trim();
        const address = document.getElementById('customer-address')?.value.trim();
        const description = document.getElementById('customer-description')?.value.trim();
        const deliveryType = document.querySelector('input[name="delivery-type"]:checked')?.value;
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value;
        const includeLocation = document.getElementById('include-location')?.checked;

        if (!name) {
            alert("Por favor, ingresa tu nombre.");
            return;
        }

        if (!phone) {
            alert("Por favor, ingresa tu número de teléfono.");
            return;
        }

        if (!address) {
            alert("Por favor, ingresa tu dirección.");
            return;
        }

        const customerData = {
            name,
            phone,
            address,
            description,
            deliveryType: deliveryType === 'mi-direccion' ? 'Mi dirección' : 'Otra dirección',
            paymentMethod: paymentMethod === 'efectivo' ? 'Efectivo' : 'Transferencia'
        };

        if (includeLocation && deliveryType === 'mi-direccion') {
            if ("geolocation" in navigator) {
                this.checkoutBtn.textContent = "Obteniendo ubicación...";
                this.checkoutBtn.disabled = true;

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const location = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        };
                        sendOrderToWhatsApp(this.items, this.getTotal(), location, customerData);
                        this.resetCheckoutBtn();
                    },
                    (error) => {
                        console.error("Error getting location:", error);
                        alert("No se pudo obtener la ubicación. Se enviará el pedido sin ella.");
                        sendOrderToWhatsApp(this.items, this.getTotal(), null, customerData);
                        this.resetCheckoutBtn();
                    }
                );
            } else {
                alert("Tu navegador no soporta geolocalización.");
                sendOrderToWhatsApp(this.items, this.getTotal(), null, customerData);
            }
        } else {
            sendOrderToWhatsApp(this.items, this.getTotal(), null, customerData);
        }
    }

    resetCheckoutBtn() {
        this.checkoutBtn.textContent = "Pedir por WhatsApp";
        this.checkoutBtn.disabled = false;
    }
}
