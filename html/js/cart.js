// Cart functionality
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.loadCart();
    }
    
    loadCart() {
        if (!document.querySelector('.cart-items')) return;
        
        this.displayCartItems();
        this.updateTotals();
    }
    
    displayCartItems() {
        const cartItems = document.querySelector('.cart-items');
        if (!cartItems) return;
        
        cartItems.innerHTML = '';
        
        if (this.items.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            return;
        }
        
        this.items.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>Quantity: ${item.quantity}</p>
                </div>
                <div class="cart-item-actions">
                    <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                    <button class="btn btn-remove" data-id="${item.id}">Remove</button>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });
        
        // Add event listeners for remove buttons
        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.removeItem(id);
            });
        });
    }
    
    updateTotals() {
        const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + tax;
        
        document.querySelector('.subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.querySelector('.tax').textContent = `$${tax.toFixed(2)}`;
        document.querySelector('.total').textContent = `$${total.toFixed(2)}`;
    }
    
    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveCart();
        this.displayCartItems();
        this.updateTotals();
        updateCartCount();
    }
    
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }
    
    checkout() {
        // In a real application, this would process payment
        // For now, just clear the cart and show confirmation
        const paymentMethod = document.querySelector('.payment-option.active')?.dataset.method;
        
        if (!paymentMethod) {
            alert('Please select a payment method');
            return;
        }
        
        // Show confirmation
        const confirmation = document.createElement('div');
        confirmation.className = 'confirmation-modal';
        confirmation.innerHTML = `
            <div class="confirmation-content">
                <h2>Order Confirmed!</h2>
                <p>Thank you for your order.</p>
                <p>Order #: ${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                <p>Payment Method: ${paymentMethod}</p>
                <p>We'll notify you when your order is ready.</p>
                <button class="btn btn-primary" id="close-confirmation">Continue Shopping</button>
            </div>
        `;
        
        // Add styles
        confirmation.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1002;
        `;
        
        const content = confirmation.querySelector('.confirmation-content');
        content.style.cssText = `
            background-color: var(--white);
            padding: 40px;
            border-radius: var(--radius);
            text-align: center;
            max-width: 500px;
            width: 90%;
        `;
        
        document.body.appendChild(confirmation);
        
        // Clear cart
        this.items = [];
        this.saveCart();
        updateCartCount();
        
        // Close modal
        document.getElementById('close-confirmation').addEventListener('click', () => {
            confirmation.remove();
            window.location.href = 'index.html';
        });
    }
}

// Initialize cart on checkout page
let cartInstance;

if (document.querySelector('.checkout-container')) {
    cartInstance = new Cart();
    
    // Payment method selection
    document.querySelectorAll('.payment-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
        });
    });
    
    // Confirm order button
    document.querySelector('.confirm-btn').addEventListener('click', () => {
        cartInstance.checkout();
    });
}

// Helper function to update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}