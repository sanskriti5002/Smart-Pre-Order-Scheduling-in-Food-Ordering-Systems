// Auth Check
if (!localStorage.getItem('CraveAuth')) {
    window.location.href = 'login.html';
}

// State Management
let orders = JSON.parse(localStorage.getItem('CraveOrders')) || [];
let currentCart = []; 
let currentRestaurant = null;
let currentDeliveryOrder = null;
let selectedMenuCategory = 'Recommended';
let currentOffer = null;

// Mock Reviews Generator (Flipkart Style)
const mockGoodReviews = ["Absolutely delicious! Real authentic taste.", "Loved it! Will order again soon.", "Perfectly spiced and served hot.", "Best I have had in a long time.", "Great packaging and amazing flavor.", "Highly recommended for lunch!"];
const mockBadReviews = ["Portion size was a bit small.", "Too oily for my liking.", "Arrived a bit cold.", "Not exactly what I expected.", "Too spicy for me.", "Could be better packaged."];
const fakeUsers = ["Rohit K.", "Sneha P.", "Amit S.", "Priya M.", "Vikram D.", "Neha R.", "Karan B.", "Rahul T.", "Anjali V."];

function getRandomDriver() {
    const drivers = [
        { name: 'Rahul Sharma', phone: '+91 98765 12345', vehicle: 'Royal Enfield Classic', eta: '8 mins' },
        { name: 'Neha Joshi', phone: '+91 91234 56789', vehicle: 'Hero Splendor', eta: '10 mins' },
        { name: 'Arjun Patel', phone: '+91 99887 66554', vehicle: 'Bajaj Pulsar', eta: '12 mins' },
        { name: 'Priya Kapoor', phone: '+91 90123 45678', vehicle: 'TVS Jupiter', eta: '9 mins' }
    ];
    return drivers[Math.floor(Math.random() * drivers.length)];
}

function generateReviews() {
    let revs = [];
    let numGood = Math.floor(Math.random() * 2) + 1;
    for(let i=0; i<numGood; i++) {
        revs.push({ 
            user: fakeUsers[Math.floor(Math.random()*fakeUsers.length)], 
            rating: Math.floor(Math.random() * 2) + 4,
            text: mockGoodReviews[Math.floor(Math.random()*mockGoodReviews.length)], 
            type: 'good' 
        });
    }
    if(Math.random() > 0.4) {
        revs.push({ 
            user: fakeUsers[Math.floor(Math.random()*fakeUsers.length)], 
            rating: Math.floor(Math.random() * 2) + 1,
            text: mockBadReviews[Math.floor(Math.random()*mockBadReviews.length)], 
            type: 'bad' 
        });
    }
    return revs;
}

function getAverageRating(revs) {
    if(revs.length === 0) return "0.0";
    let sum = revs.reduce((a,b)=>a+b.rating, 0);
    return (sum / revs.length).toFixed(1);
}

// Fixed Images (Guaranteed not to 404)
const IMG_THALI = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe';
const IMG_CURRY = 'https://images.unsplash.com/photo-1565557623262-b51c2513a641';
const IMG_ROTI = 'https://images.unsplash.com/photo-1601050690597-df0568f70950';
const IMG_BIRYANI = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8';
const IMG_HEALTHY = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd';
const IMG_PIZZA = 'https://images.unsplash.com/photo-1513104890138-7c749659a591';
const IMG_BURGER = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd';
const IMG_SUSHI = 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c';
const IMG_STREET = 'https://images.unsplash.com/photo-1606491956689-2ea866880c84';

// Mock Data
const categories = [
    { name: 'Thali', img: IMG_THALI + '?w=150&fit=crop' },
    { name: 'Dal & Rice', img: IMG_ROTI + '?w=150&fit=crop' },
    { name: 'Roti/Paratha', img: IMG_BIRYANI + '?w=150&fit=crop' },
    { name: 'Biryani', img: IMG_BIRYANI + '?w=150&fit=crop' },
    { name: 'Healthy', img: IMG_HEALTHY + '?w=150&fit=crop' },
    { name: 'Pizza', img: IMG_PIZZA + '?w=150&fit=crop' },
    { name: 'Burger', img: IMG_BURGER + '?w=150&fit=crop' },
    { name: 'Sushi', img: IMG_SUSHI + '?w=150&fit=crop' },
];

const offers = [
    {
        id: 'breakfast',
        title: 'Pre-order Breakfast',
        subtitle: 'Save on early morning meals when you schedule ahead.',
        dishes: [
            { name: 'Masala Dosa', desc: 'Crispy rice crepe filled with spiced potato', price: 120, img: IMG_THALI + '?w=400&fit=crop', restaurant: 'South Indian Delights' },
            { name: 'Idli Sambar', desc: 'Steamed rice cakes with lentil soup', price: 80, img: IMG_STREET + '?w=400&fit=crop', restaurant: 'South Indian Delights' },
            { name: 'Greek Salad Bowl', desc: 'Fresh greens with feta, olives, and lemon dressing', price: 220, img: IMG_HEALTHY + '?w=400&fit=crop', restaurant: 'Mediterranean Magic' }
        ]
    },
    {
        id: 'freeDelivery',
        title: 'Free Delivery',
        subtitle: 'Enjoy free delivery on select orders above ₹499.',
        dishes: [
            { name: 'Chicken Dum Biryani', desc: 'Slow cooked aromatic rice and spiced chicken', price: 320, img: IMG_BIRYANI + '?w=400&fit=crop', restaurant: 'Biryani Central' },
            { name: 'Teriyaki Salmon Bowl', desc: 'Salmon glazed in teriyaki sauce with rice', price: 380, img: IMG_HEALTHY + '?w=400&fit=crop', restaurant: 'Sushi Street' },
            { name: 'Grilled Chicken Shawarma', desc: 'Marinated chicken wrap with garlic sauce', price: 320, img: IMG_CURRY + '?w=400&fit=crop', restaurant: 'Mediterranean Magic' }
        ]
    },
    {
        id: 'familyMeal',
        title: 'Family Meal Pack',
        subtitle: 'Special pricing for larger orders and family-friendly combos.',
        dishes: [
            { name: 'Special Veg Thali', desc: 'Dal, 2 Sabzis, Rice, 3 Rotis, Salad, and Gulab Jamun', price: 250, img: IMG_THALI + '?w=400&fit=crop', restaurant: 'Maa Ki Rasoi (Daily Lunch)' },
            { name: 'Falafel Platter', desc: 'Crispy falafel with hummus, pita, and salad', price: 290, img: IMG_STREET + '?w=400&fit=crop', restaurant: 'Mediterranean Magic' },
            { name: 'Churros', desc: 'Cinnamon sugar fried dough with chocolate dip', price: 140, img: IMG_STREET + '?w=400&fit=crop', restaurant: 'Street Taco Co.' }
        ]
    }
];

const restaurants = [
    {
        id: 'r1',
        name: 'The Spice Symphony',
        rating: '4.8',
        meta: 'North Indian, Mughlai &bull; &#8377;&#8377;',
        time: '35 min',
        heroImg: IMG_CURRY + '?w=1200&fit=crop',
        cardImg: IMG_CURRY + '?w=400&fit=crop',
        menu: [
            { id: 'm1_1', name: 'Butter Chicken', desc: 'Creamy tomato gravy with tender chicken', price: 350, img: IMG_CURRY + '?w=400&fit=crop', category: 'Recommended', reviews: generateReviews() },
            { id: 'm1_2', name: 'Paneer Tikka Masala', desc: 'Grilled cottage cheese in spiced gravy', price: 280, img: IMG_ROTI + '?w=400&fit=crop', category: 'Recommended', reviews: generateReviews() },
            { id: 'm1_3', name: 'Garlic Naan', desc: 'Fresh oven-baked flatbread with garlic', price: 60, img: IMG_THALI + '?w=400&fit=crop', category: 'Specials', reviews: generateReviews() },
            { id: 'm1_4', name: 'Lamb Biryani', desc: 'Aromatic basmati rice cooked with spiced lamb', price: 450, img: IMG_BIRYANI + '?w=400&fit=crop', category: 'Specials', reviews: generateReviews() }
        ]
    },
    {
        id: 'r5',
        name: 'Maa Ki Rasoi (Daily Lunch)',
        rating: '4.9',
        meta: 'Indian, Homestyle &bull; &#8377;',
        time: '30 min',
        heroImg: IMG_THALI + '?w=1200&fit=crop',
        cardImg: IMG_THALI + '?w=400&fit=crop',
        menu: [
            { id: 'm5_1', name: 'Dal Fry & Jeera Rice Combo', desc: 'Yellow dal tempered with ghee and cumin, served with rice', price: 180, img: IMG_THALI + '?w=400&fit=crop', category: 'Recommended', reviews: generateReviews() },
            { id: 'm5_2', name: 'Aloo Gobi Sabzi', desc: 'Dry potato and cauliflower curry, perfect for lunch', price: 140, img: IMG_STREET + '?w=400&fit=crop', category: 'Recommended', reviews: generateReviews() },
            { id: 'm5_3', name: 'Phulka (Tawa Roti)', desc: 'Soft whole wheat flatbread (2 pcs)', price: 30, img: IMG_ROTI + '?w=400&fit=crop', category: 'Specials', reviews: generateReviews() },
            { id: 'm5_4', name: 'Rajma Chawal', desc: 'Kidney beans cooked in thick gravy served with basmati rice', price: 160, img: IMG_CURRY + '?w=400&fit=crop', category: 'Recommended', reviews: generateReviews() },
            { id: 'm5_5', name: 'Special Veg Thali', desc: 'Dal, 2 Sabzis, Rice, 3 Rotis, Salad, and Gulab Jamun', price: 250, img: IMG_THALI + '?w=400&fit=crop', category: 'Specials', reviews: generateReviews() }
        ]
    },
    {
        id: 'r6',
        name: 'The Lunchbox Co.',
        rating: '4.6',
        meta: 'North Indian, Office Meals &bull; &#8377;&#8377;',
        time: '40 min',
        heroImg: IMG_BIRYANI + '?w=1200&fit=crop',
        cardImg: IMG_BIRYANI + '?w=400&fit=crop',
        menu: [
            { id: 'm6_1', name: 'Paneer Bhurji with Paratha', desc: 'Scrambled paneer spices served with 2 flaky parathas', price: 220, img: IMG_CURRY + '?w=400&fit=crop', category: 'Recommended', reviews: generateReviews() },
            { id: 'm6_2', name: 'Bhindi Masala', desc: 'Okra stir-fried with onions and spices', price: 150, img: IMG_THALI + '?w=400&fit=crop', category: 'Recommended', reviews: generateReviews() },
            { id: 'm6_3', name: 'Kadhi Pakora & Rice', desc: 'Yogurt based curry with gram flour fritters', price: 180, img: IMG_STREET + '?w=400&fit=crop', category: 'Specials', reviews: generateReviews() },
            { id: 'm6_4', name: 'Lacchha Paratha', desc: 'Multi-layered crispy flatbread', price: 40, img: IMG_ROTI + '?w=400&fit=crop', category: 'Specials', reviews: generateReviews() }
        ]
    },
    {
        id: 'r7',
        name: 'Curry & Rice Express',
        rating: '4.7',
        meta: 'Indian, Healthy &bull; &#8377;',
        time: '25 min',
        heroImg: IMG_STREET + '?w=1200&fit=crop',
        cardImg: IMG_STREET + '?w=400&fit=crop',
        menu: [
            { id: 'm7_1', name: 'Dal Makhani Meal', desc: 'Slow-cooked black lentils with 2 parathas', price: 210, img: IMG_CURRY + '?w=400&fit=crop', category: 'Recommended', reviews: generateReviews() },
            { id: 'm7_2', name: 'Palak Paneer', desc: 'Cottage cheese in creamy spinach gravy', price: 240, img: IMG_THALI + '?w=400&fit=crop', category: 'Specials', reviews: generateReviews() },
            { id: 'm7_3', name: 'Jeera Rice Full Portion', desc: 'Aromatic basmati rice with cumin', price: 110, img: IMG_ROTI + '?w=400&fit=crop', category: 'Recommended', reviews: generateReviews() },
            { id: 'm7_4', name: 'Baingan Bharta', desc: 'Roasted mashed eggplant with spices', price: 160, img: IMG_BIRYANI + '?w=400&fit=crop', category: 'Specials', reviews: generateReviews() }
        ]
    },
    {
        id: 'r8',
        name: 'South Indian Delights',
        rating: '4.9',
        meta: 'South Indian, Street Food &bull; &#8377;&#8377;',
        time: '35 min',
        heroImg: IMG_HEALTHY + '?w=1200&fit=crop',
        cardImg: IMG_HEALTHY + '?w=400&fit=crop',
        menu: [
            { id: 'm8_1', name: 'Masala Dosa', desc: 'Crispy rice crepe filled with spiced potato', price: 120, img: IMG_THALI + '?w=400&fit=crop', category: 'Recommended', reviews: generateReviews() },
            { id: 'm8_2', name: 'Idli Sambar', desc: 'Steamed rice cakes with lentil soup', price: 80, img: IMG_STREET + '?w=400&fit=crop', category: 'Recommended', reviews: generateReviews() },
            { id: 'm8_3', name: 'Vada Pav', desc: 'Spiced potato dumpling in bread bun', price: 50, img: IMG_CURRY + '?w=400&fit=crop', category: 'Specials', reviews: generateReviews() }
        ]
    },
    {
        id: 'r11',
        name: 'Gujarati Rasoi',
        rating: '4.5',
        meta: 'Gujarati, Vegetarian &bull; &#8377;',
        time: '35 min',
        heroImg: IMG_THALI + '?w=1200&fit=crop',
        cardImg: IMG_THALI + '?w=400&fit=crop',
        menu: [
            { id: 'm11_1', name: 'Dhokla (6 pcs)', desc: 'Steamed savory gram flour cake', price: 90, img: IMG_STREET + '?w=400&fit=crop', category: 'Desserts', reviews: generateReviews() },
            { id: 'm11_2', name: 'Khaman & Thepla', desc: 'Soft khaman with 3 pieces of fenugreek thepla', price: 140, img: IMG_ROTI + '?w=400&fit=crop', category: 'Recommended', reviews: generateReviews() },
            { id: 'm11_3', name: 'Gujarati Thali', desc: 'Dal, Kadhi, 2 Shaak, Roti, Rice, Farsan, Sweet', price: 280, img: IMG_CURRY + '?w=400&fit=crop', category: 'Specials', reviews: generateReviews() }
        ]
    },
    {
        id: 'r13',
        name: 'Beijing Bites',
        rating: '4.4',
        meta: 'Chinese, Asian &bull; &#8377;&#8377;',
        time: '40 min',
        heroImg: IMG_HEALTHY + '?w=1200&fit=crop',
        cardImg: IMG_HEALTHY + '?w=400&fit=crop',
        menu: [
            { id: 'm13_1', name: 'Hakka Noodles', desc: 'Wok tossed noodles with veggies', price: 190, img: IMG_THALI + '?w=400&fit=crop', category: 'Recommended', reviews: generateReviews() },
            { id: 'm13_2', name: 'Chilli Chicken', desc: 'Crispy chicken chunks in spicy soy sauce', price: 260, img: IMG_CURRY + '?w=400&fit=crop', category: 'Specials', reviews: generateReviews() },
            { id: 'm13_3', name: 'Manchow Soup', desc: 'Thick spicy brown soup with fried noodles', price: 120, img: IMG_STREET + '?w=400&fit=crop', category: 'Recommended', reviews: generateReviews() }
        ]
    },
    {
        id: 'r15',
        name: 'Biryani Central',
        rating: '4.8',
        meta: 'Indian, Mughlai &bull; &#8377;&#8377;',
        time: '45 min',
        heroImg: IMG_BIRYANI + '?w=1200&fit=crop',
        cardImg: IMG_BIRYANI + '?w=400&fit=crop',
        menu: [
            { id: 'm15_1', name: 'Chicken Dum Biryani', desc: 'Slow cooked aromatic rice and spiced chicken', price: 320, img: IMG_BIRYANI + '?w=400&fit=crop', category: 'Recommended', reviews: generateReviews() },
            { id: 'm15_2', name: 'Mutton Biryani', desc: 'Rich lamb chunks slow cooked with rice', price: 450, img: IMG_BIRYANI + '?w=400&fit=crop', category: 'Specials', reviews: generateReviews() }
        ]
    },
    {
        id: 'r16',
        name: 'Mediterranean Magic',
        rating: '4.7',
        meta: 'Mediterranean, Healthy &bull; &#8377;&#8377;',
        time: '30 min',
        heroImg: IMG_HEALTHY + '?w=1200&fit=crop',
        cardImg: IMG_HEALTHY + '?w=400&fit=crop',
        menu: [
            { id: 'm16_1', name: 'Falafel Platter', desc: 'Crispy falafel with hummus, pita, and salad', price: 290, img: IMG_STREET + '?w=400&fit=crop', category: 'Specials', reviews: generateReviews() },
            { id: 'm16_2', name: 'Grilled Chicken Shawarma', desc: 'Marinated chicken wrap with garlic sauce', price: 320, img: IMG_CURRY + '?w=400&fit=crop', category: 'Recommended', reviews: generateReviews() },
            { id: 'm16_3', name: 'Greek Salad Bowl', desc: 'Fresh greens with feta, olives, and lemon dressing', price: 220, img: IMG_HEALTHY + '?w=400&fit=crop', category: 'Recommended', reviews: generateReviews() }
        ]
    },
    {
        id: 'r17',
        name: 'Sushi Street',
        rating: '4.6',
        meta: 'Japanese, Seafood &bull; &#8377;&#8377;',
        time: '40 min',
        heroImg: IMG_SUSHI + '?w=1200&fit=crop',
        cardImg: IMG_SUSHI + '?w=400&fit=crop',
        menu: [
            { id: 'm17_1', name: 'California Roll', desc: 'Crab, avocado and cucumber sushi roll', price: 270, img: IMG_SUSHI + '?w=400&fit=crop', category: 'Recommended', reviews: generateReviews() },
            { id: 'm17_2', name: 'Teriyaki Salmon Bowl', desc: 'Salmon glazed in teriyaki sauce with rice', price: 380, img: IMG_HEALTHY + '?w=400&fit=crop', category: 'Specials', reviews: generateReviews() },
            { id: 'm17_3', name: 'Miso Soup', desc: 'Traditional savory miso broth with tofu', price: 90, img: IMG_CURRY + '?w=400&fit=crop', category: 'Recommended', reviews: generateReviews() }
        ]
    },
    {
        id: 'r18',
        name: 'Street Taco Co.',
        rating: '4.5',
        meta: 'Mexican, Street Food &bull; &#8377;&#8377;',
        time: '30 min',
        heroImg: IMG_BURGER + '?w=1200&fit=crop',
        cardImg: IMG_BURGER + '?w=400&fit=crop',
        menu: [
            { id: 'm18_1', name: 'Chicken Tacos', desc: 'Soft tacos with spiced chicken, salsa and cheese', price: 240, img: IMG_BURGER + '?w=400&fit=crop', category: 'Recommended', reviews: generateReviews() },
            { id: 'm18_2', name: 'Veggie Burrito', desc: 'Loaded burrito with beans, rice, veggies, and guacamole', price: 260, img: IMG_THALI + '?w=400&fit=crop', category: 'Specials', reviews: generateReviews() },
            { id: 'm18_3', name: 'Churros', desc: 'Cinnamon sugar fried dough with chocolate dip', price: 140, img: IMG_STREET + '?w=400&fit=crop', category: 'Desserts', reviews: generateReviews() }
        ]
    },
    {
        id: 'r19',
        name: 'Vegan Vibes Cafe',
        rating: '4.8',
        meta: 'Vegan, Healthy &bull; &#8377;&#8377;',
        time: '35 min',
        heroImg: IMG_HEALTHY + '?w=1200&fit=crop',
        cardImg: IMG_HEALTHY + '?w=400&fit=crop',
        menu: [
            { id: 'm19_1', name: 'Quinoa Power Bowl', desc: 'Quinoa with roasted veggies, hummus and seeds', price: 310, img: IMG_HEALTHY + '?w=400&fit=crop', category: 'Recommended', reviews: generateReviews() },
            { id: 'm19_2', name: 'Vegan Burger', desc: 'Plant-based patty with avocado, lettuce and vegan mayo', price: 280, img: IMG_BURGER + '?w=400&fit=crop', category: 'Specials', reviews: generateReviews() },
            { id: 'm19_3', name: 'Coconut Chia Pudding', desc: 'Creamy chia pudding topped with fresh berries', price: 180, img: IMG_STREET + '?w=400&fit=crop', category: 'Desserts', reviews: generateReviews() }
        ]
    }
];

// DOM Elements
const viewHome = document.getElementById('view-home');
const viewRestaurant = document.getElementById('view-restaurant');
const viewOffer = document.getElementById('view-offer');
const viewDashboard = document.getElementById('view-dashboard');
const viewDelivery = document.getElementById('view-delivery');
const viewHelp = document.getElementById('view-help');
const viewAccount = document.getElementById('view-account');

const categoriesContainer = document.getElementById('categories-container');
const restaurantsGrid = document.getElementById('restaurants-grid');

const restHeaderContainer = document.getElementById('restaurant-header');
const menuItemsContainer = document.getElementById('menu-items');
const stickyCart = document.getElementById('sticky-cart');

const cartOverlay = document.getElementById('cart-overlay');
const cartSidebar = document.getElementById('cart-sidebar');
const cartItemsContainer = document.getElementById('cart-items-container');
const scheduleForm = document.getElementById('schedule-form');

// Intialization
function init() {
    renderHome();
    updateCartUI();
}

function renderHome() {
    
    categoriesContainer.innerHTML = `
        <div class="category-item" onclick="filterRestaurants('All')" style="min-width: 120px;">
            <div class="category-img" style="background:#f0f0f5; display:flex; align-items:center; justify-content:center; font-size:24px;">↺</div>
            <span>View All</span>
        </div>
    `;
    categories.forEach(cat => {
        categoriesContainer.innerHTML += `
            <div class="category-item" onclick="filterRestaurants('${cat.name}')" style="min-width: 120px;">
                <img src="${cat.img}" alt="${cat.name}" class="category-img">
                <span>${cat.name}</span>
            </div>
        `;
    });


    restaurantsGrid.innerHTML = '';
    restaurants.forEach(rest => {
        restaurantsGrid.innerHTML += `
            <div class="restaurant-card" onclick="openRestaurant('${rest.id}')">
                <img src="${rest.cardImg}" alt="${rest.name}" class="card-img" onerror="this.src='${IMG_PIZZA}?w=400&fit=crop'">
                <div class="card-info">
                    <div class="card-header">
                        <div class="card-name">${rest.name}</div>
                        <div class="card-rating">&#9733; ${rest.rating}</div>
                    </div>
                    <div class="card-meta">
                        <span>${rest.meta}</span>
                        <span>${rest.time}</span>
                    </div>
                </div>
            </div>
        `;
    });
}

function renderMenuCategories() {
    const categoriesEl = document.getElementById('menu-categories');
    categoriesEl.innerHTML = '';
    const MENU_CATEGORIES = ['Recommended', 'Specials', 'Desserts'];
    MENU_CATEGORIES.forEach(cat => {
        categoriesEl.innerHTML += `
            <li class="${selectedMenuCategory === cat ? 'active' : ''}" onclick="setMenuCategory('${cat}')">${cat}</li>
        `;
    });
}

function renderMenuItems(rest) {
    const filteredItems = rest.menu.filter(item => {
        const category = item.category || 'Recommended';
        if (selectedMenuCategory === 'Recommended') return true;
        return category === selectedMenuCategory;
    });

    menuItemsContainer.innerHTML = '';
    if (filteredItems.length === 0) {
        menuItemsContainer.innerHTML = `<p style="color:var(--text-muted);">No ${selectedMenuCategory.toLowerCase()} available for this restaurant yet.</p>`;
        return;
    }

    filteredItems.forEach(item => {
        let reviewsHtml = '';
        if(item.reviews && item.reviews.length > 0) {
            let avgRating = getAverageRating(item.reviews);
            reviewsHtml = `
            <div class="fk-reviews-container">
                <div class="fk-reviews-header" onclick="document.getElementById('revs-${item.id}').classList.toggle('open')">
                    Customer Reviews (&#9733; ${avgRating}) <span>View All &#9660;</span>
                </div>
                <div class="fk-details" id="revs-${item.id}">
                    ${item.reviews.map(r => `
                        <div class="fk-review">
                            <span class="fk-badge ${r.type === 'good' ? 'fk-good' : 'fk-bad'}">${r.rating} &#9733;</span>
                            <div class="fk-text">"${r.text}"</div>
                            <div class="fk-user">- ${r.user}</div>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        }

        menuItemsContainer.innerHTML += `
            <div class="menu-item-card">
                <div class="menu-item-info">
                    <div class="menu-item-name">${item.name}</div>
                    <div class="menu-item-price">&#8377;${item.price.toFixed(2)}</div>
                    <div class="menu-item-desc">${item.desc}</div>
                    ${reviewsHtml}
                </div>
                <div class="menu-item-image-container">
                    <img src="${item.img}" class="menu-item-img" alt="${item.name}" onerror="this.src='${IMG_ROTI}?w=400&fit=crop'">
                    <button class="add-btn" onclick="addToCart('${rest.id}', '${item.id}')">ADD</button>
                </div>
            </div>
        `;
    });
}

window.setMenuCategory = function(category) {
    selectedMenuCategory = category;
    renderMenuCategories();
    if (currentRestaurant) {
        renderMenuItems(currentRestaurant);
    }
};

function renderOfferView() {
    if (!currentOffer) return;
    document.getElementById('offer-title').textContent = currentOffer.title;
    document.getElementById('offer-desc').textContent = currentOffer.subtitle;
    const offerItems = document.getElementById('offer-items');
    offerItems.innerHTML = '';
    currentOffer.dishes.forEach(dish => {
        offerItems.innerHTML += `
            <div class="offer-dish-card">
                <img src="${dish.img}" alt="${dish.name}" class="offer-dish-img" onerror="this.src='${IMG_THALI}?w=400&fit=crop'">
                <div class="offer-dish-info">
                    <h3>${dish.name}</h3>
                    <p>${dish.desc}</p>
                    <div class="offer-dish-footer">
                        <span>&#8377;${dish.price.toFixed(2)}</span>
                        <span>${dish.restaurant}</span>
                    </div>
                </div>
            </div>
        `;
    });
}

window.openOffer = function(offerId) {
    currentOffer = offers.find(o => o.id === offerId);
    if (!currentOffer) return;
    viewHome.classList.remove('active');
    viewRestaurant.classList.remove('active');
    viewDashboard.classList.remove('active');
    viewDelivery.classList.remove('active');
    viewHelp.classList.remove('active');
    viewAccount.classList.remove('active');
    viewOffer.classList.add('active');
    renderOfferView();
    window.scrollTo(0, 0);
};

// Navigation Functions
window.showHome = function() {
    viewHome.classList.add('active');
    viewRestaurant.classList.remove('active');
    viewOffer.classList.remove('active');
    viewDashboard.classList.remove('active');
    viewDelivery.classList.remove('active');
    viewHelp.classList.remove('active');
    viewAccount.classList.remove('active');
    currentRestaurant = null;
    currentOffer = null;
    updateStickyCart();
}

window.openDashboard = function() {
    viewHome.classList.remove('active');
    viewRestaurant.classList.remove('active');
    viewOffer.classList.remove('active');
    viewDelivery.classList.remove('active');
    viewHelp.classList.remove('active');
    viewAccount.classList.remove('active');
    viewDashboard.classList.add('active');
    renderDashboard();
    updateStickyCart();
}

window.openHelpDesk = function() {
    viewHome.classList.remove('active');
    viewRestaurant.classList.remove('active');
    viewOffer.classList.remove('active');
    viewDashboard.classList.remove('active');
    viewDelivery.classList.remove('active');
    viewAccount.classList.remove('active');
    viewHelp.classList.add('active');
    updateStickyCart();
}

window.openAccount = function() {
    viewHome.classList.remove('active');
    viewRestaurant.classList.remove('active');
    viewOffer.classList.remove('active');
    viewDashboard.classList.remove('active');
    viewDelivery.classList.remove('active');
    viewHelp.classList.remove('active');
    viewAccount.classList.add('active');
    updateStickyCart();
}

window.openRestaurant = function(id) {
    const rest = restaurants.find(r => r.id === id);
    if(!rest) return;
    currentRestaurant = rest;
    
    restHeaderContainer.innerHTML = `
        <div class="restaurant-header-hero">
            <img src="${rest.heroImg}" alt="${rest.name}" class="restaurant-header-img" onerror="this.src='${IMG_BIRYANI}?w=1200&fit=crop'">
            <div class="restaurant-header-info">
                <h1>${rest.name}</h1>
                <p class="restaurant-tags">${rest.meta} &bull; &#9733; ${rest.rating}</p>
            </div>
        </div>
    `;

    selectedMenuCategory = 'Recommended';
    renderMenuCategories();
    renderMenuItems(rest);

    viewHome.classList.remove('active');
    viewDashboard.classList.remove('active');
    viewOffer.classList.remove('active');
    viewDelivery.classList.remove('active');
    viewHelp.classList.remove('active');
    viewAccount.classList.remove('active');
    viewRestaurant.classList.add('active');
    
    window.scrollTo(0, 0);
    updateStickyCart();
}

// Cart Logic
window.addToCart = function(restaurantId, itemId) {
    if(!currentRestaurant) return;
    
    const restObj = restaurants.find(r => r.id === restaurantId);
    const item = restObj.menu.find(m => m.id === itemId);
    
    const existing = currentCart.find(c => c.id === item.id);
    if(existing) {
        existing.qty += 1;
    } else {
        currentCart.push({ ...item, restaurantName: restObj.name, qty: 1 });
    }
    
    showToast(`Added ${item.name} to cart!`);
    updateCartUI();
}

function updateCartUI() {
    let totalItems = currentCart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById('nav-cart-count').textContent = totalItems;
    updateStickyCart();
    renderCartSidebar();
}

function updateStickyCart() {
    if(currentCart.length > 0 && viewRestaurant.classList.contains('active')) {
        let totalItems = currentCart.reduce((sum, item) => sum + item.qty, 0);
        let totalPrice = currentCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        
        document.getElementById('strip-count').textContent = `${totalItems} ITEM${totalItems > 1 ? 'S' : ''}`;
        document.getElementById('strip-price').innerHTML = `&#8377;${totalPrice.toFixed(2)}`;
        stickyCart.classList.add('show');
    } else {
        stickyCart.classList.remove('show');
    }
}

window.openCart = function() {
    renderCartSidebar();
    cartOverlay.classList.add('active');
    cartSidebar.classList.add('active');
}

window.closeCart = function() {
    cartOverlay.classList.remove('active');
    cartSidebar.classList.remove('active');
}

function renderCartSidebar() {
    cartItemsContainer.innerHTML = '';
    let subtotal = 0;
    
    if (currentCart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px 0;">Your cart is empty. Explore restaurants to add dishes!</p>';
        document.getElementById('cart-subtotal').innerHTML = '&#8377;0.00';
        document.getElementById('cart-total').innerHTML = '&#8377;0.00';
        document.getElementById('btn-checkout').disabled = true;
        document.getElementById('checkout-total').innerHTML = '';
        return;
    }
    
    document.getElementById('btn-checkout').disabled = false;
    
    currentCart.forEach((item, index) => {
        subtotal += (item.price * item.qty);
        cartItemsContainer.innerHTML += `
            <div class="cart-item">
                <div style="flex-grow:1;">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">&#8377;${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="control-btn" onclick="updateQty(${index}, -1)">-</button>
                    <span style="font-weight:600; font-size:14px; width:20px; text-align:center;">${item.qty}</span>
                    <button class="control-btn" onclick="updateQty(${index}, 1)">+</button>
                </div>
            </div>
        `;
    });
    
    const deliveryFee = 40.00;
    const total = subtotal + deliveryFee;
    
    document.getElementById('cart-subtotal').innerHTML = '&#8377;' + subtotal.toFixed(2);
    document.getElementById('cart-total').innerHTML = '&#8377;' + total.toFixed(2);
    document.getElementById('checkout-total').innerHTML = ' &bull; &#8377;' + total.toFixed(2);
}

window.updateQty = function(index, delta) {
    currentCart[index].qty += delta;
    if(currentCart[index].qty <= 0) {
        currentCart.splice(index, 1);
    }
    updateCartUI();
}

// Order Type Toggle
document.addEventListener('DOMContentLoaded', () => {
    const orderTypeRadios = document.querySelectorAll('input[name="orderType"]');
    const scheduleFields = document.getElementById('schedule-fields');
    
    orderTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'scheduled') {
                scheduleFields.style.display = 'block';
                document.getElementById('schedule-date').setAttribute('required', 'required');
                document.getElementById('schedule-time').setAttribute('required', 'required');
            } else {
                scheduleFields.style.display = 'none';
                document.getElementById('schedule-date').removeAttribute('required');
                document.getElementById('schedule-time').removeAttribute('required');
            }
        });
    });
});

// Form Submission (Normal & Scheduled Checkout)
scheduleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (currentCart.length === 0) return;
    
    const orderType = document.querySelector('input[name="orderType"]:checked').value;
    const paymentMethodEl = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = paymentMethodEl ? paymentMethodEl.value : 'UPI';
    let dateVal = '';
    let timeVal = '';
    
    // Form Validation logic
    if (paymentMethod === 'UPI') {
        const upiId = document.getElementById('upi-id').value;
        if (!upiId.includes('@')) {
            document.getElementById('error-upi').textContent = 'Please enter a valid UPI ID.';
            document.getElementById('error-upi').style.display = 'block';
            return;
        }
        document.getElementById('error-upi').style.display = 'none';
    } else if (paymentMethod === 'Card') {
        const cNum = document.getElementById('card-number').value.replace(/\s+/g, '');
        if (cNum.length < 16) {
            document.getElementById('error-card-number').textContent = 'Invalid card number.';
            document.getElementById('error-card-number').style.display = 'block';
            return;
        }
        document.getElementById('error-card-number').style.display = 'none';
        const cCvv = document.getElementById('card-cvv').value;
        if (cCvv.length < 3) {
            document.getElementById('error-card-cvv').textContent = 'Invalid CVV.';
            document.getElementById('error-card-cvv').style.display = 'block';
            return;
        }
        document.getElementById('error-card-cvv').style.display = 'none';
    } else if (paymentMethod === 'NetBanking') {
        const bank = document.getElementById('bank-select').value;
        if (!bank) {
            document.getElementById('error-bank').textContent = 'Please select a bank.';
            document.getElementById('error-bank').style.display = 'block';
            return;
        }
        document.getElementById('error-bank').style.display = 'none';
    }
    
    if (orderType === 'scheduled') {
        dateVal = document.getElementById('schedule-date').value;
        timeVal = document.getElementById('schedule-time').value;
        if (!dateVal || !timeVal) {
            showToast('Please select date and time for scheduled order');
            return;
        }
    } else {
        const now = new Date();
        dateVal = now.toISOString().split('T')[0];
        timeVal = now.toTimeString().slice(0, 5);
    }
    
    const btn = document.getElementById('btn-checkout');
    const btnText = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.loader-spinner');
    
    const finalizeOrder = (paymentId = 'COD') => {
        const deliveryItems = currentCart.map(item => ({
            name: item.name,
            qty: item.qty,
            price: item.price
        }));
        const subtotal = currentCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const deliveryFee = 40.00;
        const totalAmount = subtotal + deliveryFee;
        const driver = getRandomDriver();
        const destinationAddress = 'Sector 128, Greater Noida';
        const restaurantName = currentCart[0] ? currentCart[0].restaurantName : 'Selected Restaurant';

        currentCart.forEach(item => {
            for(let i=0; i<item.qty; i++){
                orders.push({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    meal: item.name,
                    price: item.price,
                    date: dateVal,
                    time: timeVal,
                    restaurant: item.restaurantName,
                    status: orderType === 'scheduled' ? 'Confirmed' : 'Out for Delivery',
                    orderType: orderType,
                    createdAt: Date.now(),
                    paymentMethod: paymentMethod,
                    paymentId: paymentId
                });
            }
        });

        currentDeliveryOrder = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            restaurant: restaurantName,
            items: deliveryItems,
            subtotal,
            deliveryFee,
            total: totalAmount,
            address: destinationAddress,
            mapQuery: 'Greater Noida India',
            date: dateVal,
            time: timeVal,
            status: orderType === 'scheduled' ? 'Confirmed' : 'Out for Delivery',
            orderType,
            paymentMethod,
            paymentId,
            driver
        };

        localStorage.setItem('CraveOrders', JSON.stringify(orders));
        currentCart = [];
        updateCartUI();
        
        const message = orderType === 'scheduled' ? 'Order scheduled successfully!' : 'Order placed! Your delivery is on the way.';
        showToast(message);
        closeCart();
        showDeliveryDetails(currentDeliveryOrder);
        scheduleForm.reset();
        document.querySelector('input[name="orderType"][value="normal"]').checked = true;
    };
    
    if (paymentMethod === 'COD') {
        finalizeOrder();
        return;
    }
    
    // Razorpay Flow
    btnText.style.display = 'none';
    loader.style.display = 'block';
    btn.disabled = true;
    
    try {
        let subtotal = currentCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        let totalAmount = subtotal + 40; // Add delivery fee
        
        const res = await fetch('/api/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: totalAmount })
        });
        
        const orderData = await res.json();
        
        const options = {
            key: orderData.key_id, // Dynamically fetched from the backend
            amount: orderData.amount,
            currency: "INR",
            name: "Crave",
            description: "Test Transaction",
            order_id: orderData.id,
            handler: async function (response) {
                const verifyRes = await fetch('/api/verify-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    })
                });
                const verifyData = await verifyRes.json();
                if (verifyData.status === 'success') {
                    finalizeOrder(response.razorpay_payment_id);
                } else {
                    showToast('Payment verification failed.');
                }
                btnText.style.display = 'inline';
                loader.style.display = 'none';
                btn.disabled = false;
            },
            prefill: {
                name: "John Doe",
                email: "john@example.com",
                contact: "9999999999"
            },
            theme: {
                color: "#ef4f5f"
            },
            modal: {
                ondismiss: function() {
                    btnText.style.display = 'inline';
                    loader.style.display = 'none';
                    btn.disabled = false;
                }
            }
        };

        const rzp = new Razorpay(options);
        rzp.open();
    } catch (err) {
        console.error(err);
        showToast('Error initializing payment. Is the backend running?');
        btnText.style.display = 'inline';
        loader.style.display = 'none';
        btn.disabled = false;
    }
});

function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function renderDashboard() {
    const upcomingList = document.getElementById('upcoming-list');
    upcomingList.innerHTML = '';
    
    const sortedOrders = [...orders].sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
    
    if (sortedOrders.length === 0) {
        upcomingList.innerHTML = '<p style="color:var(--text-muted);">No orders yet. Try exploring restaurants.</p>';
        return;
    }
    
    sortedOrders.forEach(order => {
        const dateObj = new Date(`${order.date}T${order.time}`);
        const fDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const fTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        // Determine icon and badge based on order type
        let icon = '📅';
        let statusLabel = 'Scheduled';
        let statusBgColor = 'rgba(239, 79, 95, 0.1)';
        let statusColor = 'var(--brand-color)';
        
        if (order.orderType === 'normal') {
            icon = '🚚';
            statusLabel = 'Preparing';
            statusBgColor = 'rgba(58, 183, 87, 0.1)';
            statusColor = 'var(--success)';
        }
        
        upcomingList.innerHTML += `
            <div class="dash-item">
                <div class="dash-item-info">
                    <span class="dash-status" style="background: ${statusBgColor}; color: ${statusColor};">${icon} ${statusLabel}</span>
                    <div class="dash-item-name">${order.meal}</div>
                    <div class="dash-item-restaurant">From: ${order.restaurant}</div>
                    ${order.paymentMethod ? `<div style="font-size:12px; color:var(--text-muted); margin-top:4px;">Paid via: ${order.paymentMethod}</div>` : ''}
                </div>
                <div class="dash-item-datetime">
                    <div style="font-weight:600;">${fDate}</div>
                    <div style="font-size:14px;color:var(--text-muted);">${fTime}</div>
                    <button style="margin-top:8px;background:none;border:none;color:var(--brand-color);cursor:pointer;font-size:13px;font-weight:600;" onclick="cancelOrder('${order.id}')">Cancel</button>
                </div>
            </div>
        `;
    });
}

window.showDeliveryDetails = function(order) {
    if (!order) return;

    viewHome.classList.remove('active');
    viewRestaurant.classList.remove('active');
    viewOffer.classList.remove('active');
    viewDashboard.classList.remove('active');
    viewHelp.classList.remove('active');
    viewAccount.classList.remove('active');
    viewDelivery.classList.add('active');

    document.getElementById('delivery-restaurant').textContent = order.restaurant;
    document.getElementById('delivery-address').textContent = order.address;
    document.getElementById('delivery-datetime').textContent = `${order.date} at ${order.time}`;
    document.getElementById('delivery-status').textContent = order.status;
    document.getElementById('delivery-status-pill').textContent = order.status;
    document.getElementById('delivery-driver-name').textContent = order.driver.name;
    document.getElementById('delivery-driver-phone').textContent = order.driver.phone;
    document.getElementById('delivery-driver-vehicle').textContent = order.driver.vehicle;
    document.getElementById('delivery-driver-eta').textContent = order.driver.eta;
    document.getElementById('delivery-driver-avatar').textContent = order.driver.name.split(' ').map(n => n[0]).join('');
    document.getElementById('delivery-total-price').textContent = `₹${order.total.toFixed(2)}`;
    renderDeliveryProgress(order.status);

    const foodList = document.getElementById('delivery-food-list');
    foodList.innerHTML = order.items.map(item => `
        <li>${item.qty} x ${item.name} <span>&#8377;${(item.price * item.qty).toFixed(2)}</span></li>
    `).join('');

    document.getElementById('delivery-map').src = `https://maps.google.com/maps?q=${encodeURIComponent(order.mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    window.scrollTo(0, 0);
}

function renderDeliveryProgress(status) {
    const steps = [
        { title: 'Order Received', desc: 'We have received your order' },
        { title: 'Preparing', desc: 'Kitchen staff is getting your meal ready' },
        { title: 'Out for Delivery', desc: 'Driver is heading to your address' },
        { title: 'Arriving Soon', desc: 'Your order is almost there'
        }
    ];

    const activeIndex = status === 'Confirmed' ? 1 : status === 'Preparing' ? 2 : status === 'Out for Delivery' ? 3 : status === 'Arriving Soon' ? 4 : 2;
    const progressContainer = document.getElementById('delivery-progress');
    progressContainer.innerHTML = steps.map((step, index) => {
        const isActive = index < activeIndex;
        return `
            <div class="progress-step ${isActive ? 'active' : ''}">
                <div class="progress-step-icon">${index + 1}</div>
                <div class="progress-step-text">
                    <strong>${step.title}</strong>
                    <span>${step.desc}</span>
                </div>
            </div>
        `;
    }).join('');
}


let orderToCancelId = null;

window.cancelOrder = function(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    
    const now = Date.now();
    let penalty = 0;
    
    // Fallback if createdAt doesn't exist (old orders)
    const createdAt = order.createdAt || now; 
    
    if (order.orderType === 'normal') {
        const diffInMinutes = (now - createdAt) / (1000 * 60);
        if (diffInMinutes <= 5) {
            penalty = 0;
        } else if (diffInMinutes > 5 && diffInMinutes <= 15) {
            penalty = 20;
        } else {
            penalty = 50;
        }
    } else {
        const scheduledTime = new Date(`${order.date}T${order.time}`).getTime();
        const timeToDeliveryInMinutes = (scheduledTime - now) / (1000 * 60);
        
        if (timeToDeliveryInMinutes >= 240) {
            penalty = 0; // >= 4 hours (Free)
        } else if (timeToDeliveryInMinutes < 240 && timeToDeliveryInMinutes >= 60) {
            penalty = 20; // 1 to 4 hours
        } else {
            penalty = 50; // < 1 hour
        }
    }
    
    orderToCancelId = id;
    
    const msgEl = document.getElementById('penalty-msg');
    if (penalty === 0) {
        msgEl.innerHTML = `Are you sure you want to cancel <strong>${order.meal}</strong>? No cancellation fee applies.`;
    } else {
        msgEl.innerHTML = `You are canceling <strong>${order.meal}</strong> past the free cancellation period. A penalty of <strong>&#8377;${penalty}</strong> will be deducted from your refund. Do you want to proceed?`;
    }
    
    document.getElementById('penalty-overlay').style.opacity = '1';
    document.getElementById('penalty-overlay').style.pointerEvents = 'auto';
    document.getElementById('penalty-modal').style.display = 'block';
}

window.closePenaltyModal = function() {
    orderToCancelId = null;
    document.getElementById('penalty-overlay').style.opacity = '0';
    document.getElementById('penalty-overlay').style.pointerEvents = 'none';
    document.getElementById('penalty-modal').style.display = 'none';
}

document.getElementById('confirm-cancel-btn').addEventListener('click', () => {
    if (orderToCancelId) {
        orders = orders.filter(order => order.id !== orderToCancelId);
        localStorage.setItem('CraveOrders', JSON.stringify(orders));
        renderDashboard();
        showToast('Order cancelled successfully.');
        closePenaltyModal();
    }
});

window.logout = function() {
    localStorage.removeItem('CraveAuth');
    window.location.href = 'login.html';
}

// Run init
init();



window.openUserMenu = function() {
    document.getElementById('cart-overlay').classList.add('active');
    document.getElementById('user-sidebar').classList.add('active');
}

window.closeUserMenu = function() {
    document.getElementById('cart-overlay').classList.remove('active');
    document.getElementById('user-sidebar').classList.remove('active');
}

window.filterRestaurants = function(category) {
    if(!category || category.toLowerCase() === 'all') {
        renderHome();
        return;
    }
    const filtered = restaurants.filter(r => 
        r.meta.toLowerCase().includes(category.toLowerCase()) || 
        r.menu.some(m => m.name.toLowerCase().includes(category.toLowerCase()))
    );

    categoriesContainer.innerHTML = '';
    
    // Explicit All option
    categoriesContainer.innerHTML += `
        <div class="category-item" onclick="filterRestaurants('All')" style="min-width: 120px;">
            <div class="category-img" style="background:#f0f0f5; display:flex; align-items:center; justify-content:center; font-size:24px;">↺</div>
            <span>View All</span>
        </div>
    `;

    categories.forEach(cat => {
        categoriesContainer.innerHTML += `
            <div class="category-item" onclick="filterRestaurants('${cat.name}')" style="min-width: 120px;">
                <img src="${cat.img}" alt="${cat.name}" class="category-img">
                <span class="${cat.name === category ? 'active-filter' : ''}" style="${cat.name === category ? 'color: var(--brand-color); font-weight: bold;' : ''}">${cat.name}</span>
            </div>
        `;
    });

    restaurantsGrid.innerHTML = '';
    if (filtered.length === 0) {
        restaurantsGrid.innerHTML = `<p style="color:var(--text-muted); grid-column: 1/-1;">No restaurants found for "${category}". <a href="#" onclick="filterRestaurants('All'); return false;" style="color:var(--brand-color);">Clear filter</a></p>`;
    } else {
        filtered.forEach(rest => {
            restaurantsGrid.innerHTML += `
                <div class="restaurant-card" onclick="openRestaurant('${rest.id}')">
                    <img src="${rest.cardImg}" alt="${rest.name}" class="card-img" onerror="this.src='${IMG_PIZZA}?w=400&fit=crop'">
                    <div class="card-info">
                        <div class="card-header">
                            <div class="card-name">${rest.name}</div>
                            <div class="card-rating">&#9733; ${rest.rating}</div>
                        </div>
                        <div class="card-meta">
                            <span>${rest.meta}</span>
                            <span>${rest.time}</span>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    showToast(`Filtered by ${category}!`);
}

window.togglePaymentDetails = function() {
    // Hide all details
    document.querySelectorAll('.payment-details').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.payment-method-card').forEach(el => el.classList.remove('active-method'));
    
    // Show selected
    const selected = document.querySelector('input[name="paymentMethod"]:checked').value;
    const detailsId = 'details-' + selected;
    const detailsEl = document.getElementById(detailsId);
    if(detailsEl) {
        detailsEl.style.display = 'block';
    }
    document.querySelector(`input[name="paymentMethod"]:checked`).closest('.payment-method-card').classList.add('active-method');
}

