import { renderMenu } from './src/components/Menu.js';
import { Cart } from './src/components/Cart.js';

document.addEventListener('DOMContentLoaded', () => {
    const cart = new Cart();

    renderMenu('menu-grid', (item) => {
        cart.addItem(item);
    });
});
