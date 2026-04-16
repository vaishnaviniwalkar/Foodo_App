document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    
    // --- Core UI Elements ---
    const heroSection = document.getElementById('heroSection');
    const restaurantView = document.getElementById('restaurantView');
    const menuView = document.getElementById('menuView');
    const trackingView = document.getElementById('trackingView');
    
    const restaurantGrid = document.getElementById('restaurantGrid');
    const foodGrid = document.getElementById('foodGrid');
    const searchInput = document.getElementById('searchInput');
    const scrollSentinel = document.getElementById('scrollSentinel');
    
    // --- Data State & Infinite Scroll Variables ---
    let allRestaurants = [];
    let currentDishes = []; 
    let cart = JSON.parse(localStorage.getItem('foodify_cart')) || [];
    
    let currentRenderList = [];  
    let currentPage = 1;
    const itemsPerPage = 6;      
    let activeGrid = restaurantGrid; 

    // ==========================================
    // 1. DATA FETCHING (MOCK & LIVE)
    // ==========================================
    
    const mockRestaurantAPI = () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { id: 'r1', name: "Mama Mia Trattoria", cuisine: "Italian", rating: 4.8, time: "25-35 min", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80" },
                    { id: 'r2', name: "Tokyo Drift Sushi", cuisine: "Japanese", rating: 4.9, time: "30-45 min", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80" },
                    { id: 'r3', name: "Taj Mahal Spice", cuisine: "Indian", rating: 4.7, time: "40-55 min", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80" },
                    { id: 'r4', name: "Luigi's Pizza Oven", cuisine: "Italian", rating: 4.5, time: "20-30 min", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80" },
                    { id: 'r5', name: "Sakura Ramen House", cuisine: "Japanese", rating: 4.6, time: "25-40 min", image: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=600&q=80" },
                    { id: 'r6', name: "Bombay Express", cuisine: "Indian", rating: 4.3, time: "35-50 min", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80" },
                    { id: 'r7', name: "The Pasta Bowl", cuisine: "Italian", rating: 4.4, time: "20-40 min", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=600&q=80" },
                    { id: 'r8', name: "Kyoto Gardens", cuisine: "Japanese", rating: 4.8, time: "30-50 min", image: "https://static-prod.dineplan.com/restaurant/restaurants/images/964/kyoto-garden44.jpg?d=1599480367" },
                    { id: 'r9', name: "Curry Crafters", cuisine: "Indian", rating: 4.2, time: "25-35 min", image: "https://s3-media0.fl.yelpcdn.com/bphoto/q_3Q67KwL2RBHz8_xwYlvw/ls.jpg" },
                    { id: 'r10', name: "Napoli Nights", cuisine: "Italian", rating: 4.9, time: "35-45 min", image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=600&q=80" },
                    { id: 'r11', name: "Oishii Bites", cuisine: "Japanese", rating: 4.5, time: "15-25 min", image: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=600&q=80" },
                    { id: 'r12', name: "Tandoori Flames", cuisine: "Indian", rating: 4.6, time: "40-60 min", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80" },
                    // DESSERT AND JUICE RESTAURANTS
                    { id: 'r13', name: "The Dessert Club", cuisine: "Desserts", rating: 4.9, time: "15-25 min", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=600&q=80" },
                    { id: 'r14', name: "Juice Junction", cuisine: "Juices", rating: 4.7, time: "10-20 min", image: "https://content.jdmagicbox.com/comp/def_content/juice_centres/default-juice-centres-12.jpg" },
                    { id: 'r15', name: "Sugar Rush Pastries", cuisine: "Desserts", rating: 4.8, time: "20-30 min", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80" },
                    { id: 'r16', name: "The Fresh Press", cuisine: "Juices", rating: 4.6, time: "15-20 min", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRklX5KXss4Sp5mDs9Ex_wiMyyhwdTsTov78Q&s" }
                ]);
            }, 600);
        });
    };

    function renderSkeletons(count) {
        return Array(count).fill(0).map(() => `
            <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 p-4 skeleton">
                <div class="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div class="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            </div>
        `).join('');
    }

    async function loadRestaurants() {
        restaurantGrid.innerHTML = renderSkeletons(6);
        allRestaurants = await mockRestaurantAPI();
        
        currentRenderList = allRestaurants;
        activeGrid = restaurantGrid;
        currentPage = 1;
        
        displayItems(true); 
    }

    async function fetchMealsByCuisine(cuisine) {
        foodGrid.innerHTML = renderSkeletons(6);
        try {
            let apiUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${cuisine}`;
            let isDrink = false;
            
            // API Router: Connect to MealDB for food, CocktailDB for juices/drinks
            if (cuisine === 'Desserts') {
                apiUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?c=Dessert`;
            } else if (cuisine === 'Juices') {
                apiUrl = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic`;
                isDrink = true; // Flag to tell the script how to read the JSON
            }

            const response = await fetch(apiUrl);
            const data = await response.json();
            
            // TheMealDB uses 'meals', TheCocktailDB uses 'drinks'
            const itemsList = isDrink ? data.drinks : data.meals;
            
            if (itemsList) {
                currentDishes = itemsList.map(item => ({
                    id: isDrink ? item.idDrink : item.idMeal,
                    name: isDrink ? item.strDrink : item.strMeal,
                    image: isDrink ? item.strDrinkThumb : item.strMealThumb,
                    price: Math.floor(Math.random() * 200) + 99, // ₹99 to ₹299
                }));
                
                currentRenderList = currentDishes;
                activeGrid = foodGrid;
                currentPage = 1;
                
                displayItems(true);
            }
        } catch (error) {
            foodGrid.innerHTML = `<div class="col-span-full text-center text-red-500 py-12">Failed to load menu.</div>`;
        }
    }

    // ==========================================
    // 2. INFINITE SCROLL LOGIC
    // ==========================================

    function displayItems(replace = false) {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const chunk = currentRenderList.slice(startIndex, endIndex);

        let htmlString = "";

        if (activeGrid === restaurantGrid) {
            if (currentRenderList.length === 0) {
                htmlString = `<p class="col-span-full text-center text-gray-500 py-12">No restaurants found.</p>`;
            } else {
                htmlString = chunk.map(res => `
                    <div onclick="openRestaurant('${res.name}', '${res.cuisine}', '${res.rating}')" class="restaurant-card bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer group">
                        <div class="relative overflow-hidden">
                            <img src="${res.image}" alt="${res.name}" class="w-full h-56 object-cover group-hover:scale-105 transition duration-500">
                            <div class="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md shadow-sm">${res.time}</div>
                        </div>
                        <div class="p-5">
                            <div class="flex justify-between items-start mb-2">
                                <h4 class="text-xl font-bold text-gray-800 truncate pr-2">${res.name}</h4>
                                <span class="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded shrink-0">${res.rating} ★</span>
                            </div>
                            <p class="text-gray-500 text-sm">${res.cuisine === 'Desserts' || res.cuisine === 'Juices' ? res.cuisine : res.cuisine + ' Cuisine'}</p>
                        </div>
                    </div>
                `).join('');
            }
        } else if (activeGrid === foodGrid) {
            htmlString = chunk.map(item => `
                <div class="flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 p-4 gap-4 restaurant-card">
                    <img src="${item.image}" alt="${item.name}" class="w-full md:w-32 h-32 object-cover rounded-xl shrink-0">
                    <div class="flex flex-col justify-between w-full">
                        <div>
                            <h4 class="text-lg font-bold text-gray-800 line-clamp-2">${item.name}</h4>
                            <p class="text-emerald-600 font-bold mt-1">₹${item.price}</p>
                        </div>
                        <button onclick="addToCart('${item.id}')" class="mt-4 md:mt-0 self-start md:self-end bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg font-bold hover:bg-emerald-600 hover:text-white transition flex items-center gap-2">
                            <i data-lucide="plus" class="w-4 h-4"></i> Add
                        </button>
                    </div>
                </div>
            `).join('');
        }

        if (replace) {
            activeGrid.innerHTML = htmlString;
        } else {
            activeGrid.insertAdjacentHTML('beforeend', htmlString);
        }

        lucide.createIcons();

        if (endIndex < currentRenderList.length) {
            scrollSentinel.classList.remove('hidden'); 
        } else {
            scrollSentinel.classList.add('hidden'); 
        }
    }

    const observer = new IntersectionObserver((entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && !scrollSentinel.classList.contains('hidden')) {
            setTimeout(() => {
                currentPage++;
                displayItems(false); 
            }, 400); 
        }
    });
    observer.observe(scrollSentinel);

    // ==========================================
    // 3. VIEW NAVIGATION & SEARCH
    // ==========================================
    
    window.openRestaurant = (name, cuisine, rating) => {
        document.getElementById('activeRestaurantName').innerText = name;
        document.getElementById('activeRestaurantCuisine').innerText = `${cuisine === 'Desserts' || cuisine === 'Juices' ? cuisine + ' Menu' : cuisine + ' Cuisine'}`;
        document.getElementById('activeRestaurantRating').innerText = `${rating} ★`;
        
        heroSection.classList.add('hidden');
        restaurantView.classList.add('hidden');
        menuView.classList.remove('hidden');
        
        fetchMealsByCuisine(cuisine);
    };

    document.getElementById('backToRestaurants').onclick = () => {
        heroSection.classList.remove('hidden');
        restaurantView.classList.remove('hidden');
        menuView.classList.add('hidden');
        searchInput.value = '';
        
        currentRenderList = allRestaurants;
        activeGrid = restaurantGrid;
        currentPage = 1;
        displayItems(true);
    };

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        currentRenderList = allRestaurants.filter(res => 
            res.name.toLowerCase().includes(term) || res.cuisine.toLowerCase().includes(term)
        );
        currentPage = 1;
        displayItems(true);
    });

    document.getElementById('restaurantFilters').addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            document.querySelectorAll('#restaurantFilters .filter-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            
            const cuisine = e.target.dataset.cuisine;
            currentRenderList = cuisine === 'all' ? allRestaurants : allRestaurants.filter(res => res.cuisine === cuisine);
            currentPage = 1;
            displayItems(true);
        }
    });

    // ==========================================
    // 4. CART LOGIC
    // ==========================================
    
    const cartCountEl = document.getElementById('cartCount');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    const cartSidebar = document.getElementById('cartSidebar');

    window.addToCart = (id) => {
        const item = currentDishes.find(d => d.id === id);
        if (item) {
            cart.push(item);
            updateCart();
            cartSidebar.classList.add('open');
        }
    };

    window.removeFromCart = (index) => {
        cart.splice(index, 1);
        updateCart();
    };

    function updateCart() {
        localStorage.setItem('foodify_cart', JSON.stringify(cart));
        cartCountEl.innerText = cart.length;
        cartCountEl.classList.toggle('hidden', cart.length === 0);

        cartItemsContainer.innerHTML = cart.map((item, index) => `
            <div class="flex items-center justify-between border-b pb-2">
                <div class="flex items-center gap-3">
                    <img src="${item.image}" class="w-12 h-12 rounded object-cover">
                    <div>
                        <p class="font-bold text-sm w-32 truncate">${item.name}</p>
                        <p class="text-emerald-600 text-xs">₹${item.price}</p>
                    </div>
                </div>
                <button onclick="removeFromCart(${index})" class="text-gray-400 hover:text-red-500 transition"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + item.price, 0);
        cartTotalEl.innerText = `₹${total}`;
        lucide.createIcons();
    }

    document.getElementById('cartBtn').onclick = () => cartSidebar.classList.add('open');
    document.getElementById('closeCart').onclick = () => cartSidebar.classList.remove('open');

    // ==========================================
    // 5. AUTHENTICATION LOGIC
    // ==========================================
    
    const authContainer = document.getElementById('authContainer');
    const authModal = document.getElementById('authModal');
    let isLogin = true;

    function updateNavbar() {
        const user = JSON.parse(localStorage.getItem('foodify_user'));
        if (user) {
            authContainer.innerHTML = `
                <div class="flex items-center gap-3 bg-gray-50 p-1 pr-3 rounded-full border border-gray-100">
                    <div class="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">${user.name.charAt(0).toUpperCase()}</div>
                    <span class="text-sm font-medium text-gray-700 hidden md:block">Hi, ${user.name.split(' ')[0]}</span>
                    <button id="logoutBtn" class="text-gray-400 hover:text-red-500 ml-2 transition"><i data-lucide="log-out" class="w-4 h-4"></i></button>
                </div>
            `;
            document.getElementById('logoutBtn').onclick = () => { localStorage.removeItem('foodify_user'); updateNavbar(); };
        } else {
            authContainer.innerHTML = `<button id="loginBtn" class="bg-emerald-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-emerald-700 transition">Login</button>`;
            document.getElementById('loginBtn').onclick = () => { authModal.classList.remove('hidden'); authModal.classList.add('flex'); };
        }
        lucide.createIcons();
    }

    document.getElementById('closeAuth').onclick = (e) => { e.preventDefault(); authModal.classList.add('hidden'); authModal.classList.remove('flex'); };
    
    document.getElementById('toggleAuth').onclick = (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        const nameField = document.getElementById('nameField');
        if (isLogin) {
            document.getElementById('authTitle').innerText = "Login";
            nameField.classList.add('hidden');
            document.getElementById('authToggleText').innerText = "New to Foodify?";
            e.target.innerText = "Create an account";
        } else {
            document.getElementById('authTitle').innerText = "Sign Up";
            nameField.classList.remove('hidden');
            document.getElementById('authToggleText').innerText = "Already have an account?";
            e.target.innerText = "Login now";
        }
    };

    document.getElementById('authForm').onsubmit = (e) => {
        e.preventDefault();
        let displayName = "Foodie";
        if (isLogin) {
            const emailInput = e.target.querySelector('input[type="email"]').value;
            if (emailInput && emailInput.includes('@')) {
                let ext = emailInput.split('@')[0];
                displayName = ext.charAt(0).toUpperCase() + ext.slice(1);
            }
        } else {
            const nameInput = e.target.querySelector('input[type="text"]').value;
            if (nameInput.trim() !== "") displayName = nameInput;
        }
        localStorage.setItem('foodify_user', JSON.stringify({ name: displayName }));
        authModal.classList.add('hidden');
        authModal.classList.remove('flex');
        updateNavbar();
    };

    // ==========================================
    // 6. CHECKOUT & TRACKING LOGIC
    // ==========================================
    
    const checkoutModal = document.getElementById('checkoutModal');
    
    document.getElementById('openCheckoutBtn').onclick = () => {
        if (cart.length === 0) return alert("Your cart is empty!");
        
        if (!JSON.parse(localStorage.getItem('foodify_user'))) {
            alert("Please login to proceed to checkout");
            authModal.classList.remove('hidden');
            authModal.classList.add('flex');
            return;
        }

        const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
        document.getElementById('sumSubtotal').innerText = `₹${subtotal}`;
        document.getElementById('sumTotal').innerText = `₹${(subtotal + 49)}`;
        
        document.getElementById('checkoutItems').innerHTML = cart.map(item => `
            <div class="flex justify-between text-sm">
                <span class="text-gray-600 truncate w-32">${item.name}</span>
                <span class="font-bold">₹${item.price}</span>
            </div>
        `).join('');

        cartSidebar.classList.remove('open');
        checkoutModal.classList.remove('hidden');
        checkoutModal.classList.add('flex');
    };

    document.getElementById('closeCheckout').onclick = () => {
        checkoutModal.classList.add('hidden');
        checkoutModal.classList.remove('flex');
    };

    document.getElementById('checkoutForm').onsubmit = (e) => {
        e.preventDefault();
        
        cart = [];
        updateCart();

        checkoutModal.classList.add('hidden');
        heroSection.classList.add('hidden');
        restaurantView.classList.add('hidden');
        menuView.classList.add('hidden');
        trackingView.classList.remove('hidden');

        startOrderTracking();
    };

    function startOrderTracking() {
        const steps = [
            document.getElementById('step1'),
            document.getElementById('step2'),
            document.getElementById('step3'),
            document.getElementById('step4')
        ];
        let currentStep = 0;

        const interval = setInterval(() => {
            if (currentStep < steps.length - 1) {
                steps[currentStep].innerHTML = `<div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center"><i data-lucide="check" class="w-4 h-4"></i></div><span>${steps[currentStep].innerText}</span>`;
                currentStep++;
                steps[currentStep].className = "flex items-center gap-4 text-emerald-600 font-bold opacity-100";
                steps[currentStep].querySelector('div').className = "w-8 h-8 rounded-full border-2 border-emerald-600 flex items-center justify-center bg-white text-emerald-600 text-xs animate-pulse";
                lucide.createIcons();
            } else {
                steps[currentStep].innerHTML = `<div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center"><i data-lucide="check" class="w-4 h-4"></i></div><span>Delivered! Enjoy your order.</span>`;
                lucide.createIcons();
                clearInterval(interval);
            }
        }, 3000); 
    }

    // --- Initialization ---
    updateNavbar();
    updateCart();
    loadRestaurants();
});