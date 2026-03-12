// DOM Elements
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navMenu = document.querySelector('.nav-menu');
const productsGrid = document.querySelector('.products-grid');
const cartCount = document.getElementById('cart-count');

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function requireAuth(actionText = 'continue') {
    if (getCurrentUser()) {
        return true;
    }

    showNotification(`Please log in or sign up to ${actionText}.`);

    setTimeout(() => {
        window.location.href = 'account.html';
    }, 1200);

    return false;
}

// Sample Products Data
const products = [
    {
        id: 1,
        name: "Artisan Sourdough",
        price: 5.99,
        description: "Traditional 24-hour fermented sourdough with crispy crust",
        category: "Sourdough",
        bestseller: true,
        image: "sourdough"
    },
    {
        id: 2,
        name: "Whole Wheat Loaf",
        price: 4.99,
        description: "Nutritious whole wheat bread packed with fiber",
        category: "Whole Wheat",
        bestseller: true,
        image: "wheat"
    },
    {
        id: 3,
        name: "Banana Bread",
        price: 6.99,
        description: "Moist homemade banana bread with walnuts",
        category: "Specialty",
        bestseller: false,
        image: "banana"
    },
    {
        id: 4,
        name: "French Baguette",
        price: 3.99,
        description: "Classic French baguette with crispy crust",
        category: "White Bread",
        bestseller: true,
        image: "baguette"
    },
    {
        id: 5,
        name: "Cinnamon Raisin",
        price: 7.99,
        description: "Sweet cinnamon and plump raisins",
        category: "Specialty",
        bestseller: false,
        image: "cinnamon"
    },
    {
        id: 6,
        name: "Multigrain Loaf",
        price: 5.49,
        description: "Hearty bread with 7 different grains",
        category: "Whole Wheat",
        bestseller: true,
        image: "multigrain"
    }
];

const productImageMap = {
    sourdough: 'Sourdough.jpg',
    wheat: 'wheat.jpg',
    banana: 'banana.jpg',
    baguette: 'baguette.jpg',
    cinnamon: 'cinnamon.jpg',
    multigrain: 'multigrain.jpg'
};

function getProductImagePath(imageKey) {
    const mappedImage = productImageMap[imageKey] || `${imageKey}.jpg`;
    return `images/${mappedImage}`;
}

// Initialize Cart
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Mobile Menu Toggle
mobileMenuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileMenuBtn.querySelector('i').classList.toggle('fa-bars');
    mobileMenuBtn.querySelector('i').classList.toggle('fa-times');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        navMenu.classList.remove('active');
        mobileMenuBtn.querySelector('i').classList.remove('fa-times');
        mobileMenuBtn.querySelector('i').classList.add('fa-bars');
    }
});

// Display Products
function displayProducts(filter = 'all') {
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    const filteredProducts = filter === 'all' 
        ? products 
        : products.filter(product => product.category === filter);
    
    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-img">
                <img src="${getProductImagePath(product.image)}" alt="${product.name}">
                ${product.bestseller ? '<span class="bestseller-badge">Bestseller</span>' : ''}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="quantity-controls">
                    <button class="quantity-btn minus" data-id="${product.id}">-</button>
                    <input type="number" class="quantity-input" value="1" min="1" max="10" data-id="${product.id}">
                    <button class="quantity-btn plus" data-id="${product.id}">+</button>
                </div>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
    
    // Add event listeners for quantity controls
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', handleQuantityChange);
    });
    
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', handleQuantityInput);
    });
    
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', addToCart);
    });
}

// Handle Quantity Changes
function handleQuantityChange(e) {
    const input = e.target.closest('.quantity-controls').querySelector('.quantity-input');
    let value = parseInt(input.value);
    
    if (e.target.classList.contains('plus')) {
        value = Math.min(10, value + 1);
    } else if (e.target.classList.contains('minus')) {
        value = Math.max(1, value - 1);
    }
    
    input.value = value;
}

function handleQuantityInput(e) {
    let value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) value = 1;
    if (value > 10) value = 10;
    e.target.value = value;
}

// Add to Cart Function
function addToCart(e) {
    if (!requireAuth('add items to your cart')) {
        return;
    }

    const productId = parseInt(e.target.dataset.id);
    const product = products.find(p => p.id === productId);
    const quantityInput = e.target.closest('.product-info').querySelector('.quantity-input');
    const quantity = parseInt(quantityInput.value);
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity
        });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    showNotification(`${product.name} added to cart!`);
    
    // Reset quantity
    quantityInput.value = 1;
}

// Update Cart Count
function updateCartCount() {
    if (!cartCount) return;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Show Notification
function showNotification(message) {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background-color: var(--primary);
        color: var(--dark);
        padding: 15px 20px;
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--dark);
    `;
    
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    
    // Display products on home page
    if (productsGrid) {
        displayProducts();
    }
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
});
