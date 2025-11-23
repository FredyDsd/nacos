import { menuItems } from '../data/menu.js';

export const renderMenu = (containerId, addToCartCallback) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = menuItems.map(item => `
    <div class="menu-item">
      <img src="${item.image}" alt="${item.name}" loading="lazy">
      <div class="menu-details">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="menu-footer">
          <span class="price">$${item.price}</span>
          <button class="add-btn" data-id="${item.id}">Agregar</button>
        </div>
      </div>
    </div>
  `).join('');

    // Add event listeners
    container.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            const item = menuItems.find(i => i.id === id);
            if (item) {
                addToCartCallback(item);
            }
        });
    });
};
