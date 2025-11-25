export const sendOrderToWhatsApp = (cartItems, total, location = null, customerData = null) => {
    const phoneNumber = "5493884970701";

    if (cartItems.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    let message = "Hola NACOS, quiero realizar el siguiente pedido:\n\n";

    if (customerData) {
        message += `*Cliente:* ${customerData.name}\n`;
        message += `*Entrega:* ${customerData.deliveryType}\n`;
        message += `*Dirección:* ${customerData.address}`;
        if (customerData.description) {
            message += ` (${customerData.description})`;
        }
        message += `\n*Pago:* ${customerData.paymentMethod}\n\n`;
        message += `*Pedido:*\n`;
    }

    cartItems.forEach(item => {
        message += `- ${item.quantity}x ${item.name} ($${item.price * item.quantity})\n`;
    });

    message += `\n*Total: $${total}*`;

    if (location) {
        message += `\n\n📍 Ubicación GPS:\nhttps://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    }

    message += "\n\nEspero confirmación. ¡Gracias!";

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(url, '_blank');
};
