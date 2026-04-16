# 🍔 Foodo - Premium Food Delivery 


**Foodo** is a modern, fully responsive Single Page Application (SPA) for food delivery. Built entirely with Vanilla JavaScript and Tailwind CSS, it focuses on high performance, seamless user experience, and modern web development practices without relying on heavy frameworks like React.

**[🔴 Live Demo: https://flourishing-licorice-2f7d6d.netlify.app/](#)** 
---

## ✨ Key Features

* **🚀 Single Page Application (SPA):** Seamless navigation between the Home, Menu, and Checkout views without any page reloads using DOM manipulation.
* **📡 Hybrid API Architecture:** * **Mock API:** Simulates network latency (`setTimeout`) for fetching restaurant data.
  * **Live REST APIs:** Dynamically fetches real food, dessert, and juice menus using **TheMealDB** and **TheCocktailDB** APIs based on category selection.
* **♾️ Infinite Scrolling:** Implemented using the modern `IntersectionObserver` API to lazy-load restaurants and dishes in chunks, optimizing performance and saving data.
* **🛒 Persistent Shopping Cart:** Utilizes browser `localStorage` to save cart items and user authentication status, ensuring data survives accidental page refreshes.
* **🚚 Live Order Tracking:** A simulated checkout flow that updates delivery stages in real-time using asynchronous JavaScript intervals.
* **📱 Mobile-First Design:** Fully responsive and beautifully styled using Tailwind CSS utility classes.

---

## 🛠️ Tech Stack

* **Frontend Structure:** HTML5
* **Styling:** CSS3 & Tailwind CSS (via CDN)
* **Logic & State:** Vanilla JavaScript (ES6+), Async/Await, Promises
* **Icons:** Lucide Icons
* **APIs Used:** * [TheMealDB API](https://www.themealdb.com/) (For main courses and desserts)
  * [TheCocktailDB API](https://www.thecocktaildb.com/) (For fresh non-alcoholic juices)

---
