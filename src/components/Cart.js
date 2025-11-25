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

        // Show location option if cart has items
        if (this.locationOptionContainer) {
            this.locationOptionContainer.style.display = 'flex';
            // Check if checkbox already exists to avoid re-injecting
            if (!this.locationOptionContainer.querySelector('#include-location')) {
                this.locationOptionContainer.innerHTML = `
                    <input type="checkbox" id="include-location">
                    <label for="include-location" style="margin-left: 0.5rem; cursor: pointer;">Incluir mi ubicación</label>
                `;
            }
        }
    }

    checkout() {
        const includeLocation = document.getElementById('include-location')?.checked;

        if (includeLocation) {
            if ("geolocation" in navigator) {
                this.checkoutBtn.textContent = "Obteniendo ubicación...";
                this.checkoutBtn.disabled = true;

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const location = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        };
                        sendOrderToWhatsApp(this.items, this.getTotal(), location);
                        this.resetCheckoutBtn();
                    },
                    (error) => {
                        console.error("Error getting location:", error);
                        alert("No se pudo obtener la ubicación. Se enviará el pedido sin ella.");
                        sendOrderToWhatsApp(this.items, this.getTotal());
                        this.resetCheckoutBtn();
                    }
                );
            } else {
                alert("Tu navegador no soporta geolocalización.");
                sendOrderToWhatsApp(this.items, this.getTotal());
            }
        } else {
            sendOrderToWhatsApp(this.items, this.getTotal());
        }
    }

    resetCheckoutBtn() {
        this.checkoutBtn.textContent = "Pedir por WhatsApp";
        this.checkoutBtn.disabled = false;
    }
}
