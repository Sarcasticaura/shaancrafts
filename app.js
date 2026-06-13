document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================
       1. Mobile Menu Toggle
       ========================================== */
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const menuIcon = document.getElementById('menu-icon');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            const isOpen = navMenu.classList.contains('open');
            
            // Toggle icon structure
            if (isOpen) {
                menuIcon.setAttribute('data-lucide', 'x');
            } else {
                menuIcon.setAttribute('data-lucide', 'menu');
            }
            // Re-render Lucide icons
            lucide.createIcons();
        });
        
        // Close menu when link is clicked
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                menuIcon.setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            });
        });
    }

    /* ==========================================
       2. Sticky Navigation & Active Section Highlight
       ========================================== */
    const header = document.getElementById('header');
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        // Sticky Header scroll styling
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Highlight active navigation link
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 120; // offset for header height
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    /* ==========================================
       3. Event Cost Estimator Logic
       ========================================== */
    const eventTypeSelect = document.getElementById('event-type');
    const guestCountSlider = document.getElementById('guest-count');
    const guestCountVal = document.getElementById('guest-count-val');
    const decorTierSelect = document.getElementById('decor-tier');
    
    // Add-on checkboxes
    const addFloral = document.getElementById('add-floral');
    const addLighting = document.getElementById('add-lighting');
    const addTablescape = document.getElementById('add-tablescape');
    const addCoordination = document.getElementById('add-coordination');
    
    // Output DOM elements
    const totalPriceDisplay = document.getElementById('total-price');
    const priceRangeLow = document.getElementById('price-range-low');
    const priceRangeHigh = document.getElementById('price-range-high');
    const breakdownList = document.getElementById('breakdown-list');

    // Cost Configurations (Indian Event Scale)
    const baseRates = {
        wedding: 3000,
        birthday: 1500,
        corporate: 4000
    };

    const tierMultipliers = {
        minimalist: 1.0,
        premium: 1.5,
        royal: 2.2
    };

    const guestRates = 3.00; // Price per guest added to base

    const addOnRates = {
        floral: 800,
        lighting: 600,
        tablescape: 500,
        coordination: 1200
    };

    function calculateEstimate() {
        const eventType = eventTypeSelect.value;
        const guests = parseInt(guestCountSlider.value);
        const decorTier = decorTierSelect.value;
        
        // Update guest label
        guestCountVal.textContent = `${guests} Guests`;
        
        // Calculation
        const basePrice = baseRates[eventType];
        const guestFee = guests * guestRates;
        const multiplier = tierMultipliers[decorTier];
        
        const decorSubtotal = (basePrice + guestFee) * multiplier;
        
        let addonsTotal = 0;
        const activeAddons = [];
        
        if (addFloral.checked) {
            addonsTotal += addOnRates.floral;
            activeAddons.push({ name: 'Saffron Marigold & Jasmine Florals', price: addOnRates.floral });
        }
        if (addLighting.checked) {
            addonsTotal += addOnRates.lighting;
            activeAddons.push({ name: 'Brass Diyas & Ambient Drapes', price: addOnRates.lighting });
        }
        if (addTablescape.checked) {
            addonsTotal += addOnRates.tablescape;
            activeAddons.push({ name: 'Designer Tablescapes & Royal Gaddi Seating', price: addOnRates.tablescape });
        }
        if (addCoordination.checked) {
            addonsTotal += addOnRates.coordination;
            activeAddons.push({ name: 'Sangeet & Wedding Coordination', price: addOnRates.coordination });
        }
        
        const finalPrice = Math.round(decorSubtotal + addonsTotal);
        
        // Dynamic Range (Low: -10%, High: +10%)
        const lowPrice = Math.round(finalPrice * 0.9);
        const highPrice = Math.round(finalPrice * 1.1);
        
        // Format Currency
        totalPriceDisplay.textContent = finalPrice.toLocaleString();
        priceRangeLow.textContent = `$${lowPrice.toLocaleString()}`;
        priceRangeHigh.textContent = `$${highPrice.toLocaleString()}`;
        
        // Render Inclusions Breakdown
        let breakdownHTML = '';
        const eventTypeLabel = eventTypeSelect.options[eventTypeSelect.selectedIndex].text;
        const decorTierLabel = decorTierSelect.options[decorTierSelect.selectedIndex].text.split('(')[0].trim();
        
        breakdownHTML += `<li><i data-lucide="check-circle-2"></i> Base ${eventTypeLabel} Setup: $${basePrice.toLocaleString()}</li>`;
        breakdownHTML += `<li><i data-lucide="check-circle-2"></i> Scale Fee (${guests} guests): $${guestFee.toLocaleString()}</li>`;
        breakdownHTML += `<li><i data-lucide="check-circle-2"></i> Design Tier: ${decorTierLabel} (${multiplier}x multiplier)</li>`;
        
        activeAddons.forEach(addon => {
            breakdownHTML += `<li><i data-lucide="check-circle-2"></i> Add-on: ${addon.name} (+$${addon.price.toLocaleString()})</li>`;
        });
        
        breakdownList.innerHTML = breakdownHTML;
        lucide.createIcons(); // Re-render checkmarks in breakdown
    }

    if (eventTypeSelect) {
        // Event Listeners for Estimator Inputs
        eventTypeSelect.addEventListener('change', calculateEstimate);
        guestCountSlider.addEventListener('input', calculateEstimate);
        decorTierSelect.addEventListener('change', calculateEstimate);
        addFloral.addEventListener('change', calculateEstimate);
        addLighting.addEventListener('change', calculateEstimate);
        addTablescape.addEventListener('change', calculateEstimate);
        addCoordination.addEventListener('change', calculateEstimate);
        
        // Initial run
        calculateEstimate();
    }

    /* ==========================================
       4. Apply Estimate to Booking Form
       ========================================== */
    const secureRateBtn = document.getElementById('secure-rate-btn');
    const formEventType = document.getElementById('form-event-type');
    const formGuestCount = document.getElementById('form-guest-count');
    const formBudget = document.getElementById('form-budget');
    
    if (secureRateBtn) {
        secureRateBtn.addEventListener('click', () => {
            const calculatedPrice = totalPriceDisplay.textContent;
            const guests = guestCountSlider.value;
            const eventType = eventTypeSelect.value;
            
            // Set Form Values
            if (formEventType) formEventType.value = eventType;
            if (formGuestCount) formGuestCount.value = guests;
            if (formBudget) formBudget.value = `$${calculatedPrice}`;
            
            // Smooth Scroll to Contact
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
                showToast(
                    'Estimate Details Applied!', 
                    `Your $${calculatedPrice} estimate has been applied to the inquiry form below. Please submit details to book.`,
                    6000
                );
            }
        });
    }

    /* ==========================================
       5. Portfolio Filtering
       ========================================== */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const filterValue = button.getAttribute('data-filter');
            
            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    item.classList.add('show');
                } else {
                    item.classList.remove('show');
                }
            });
        });
    });

    /* ==========================================
       6. Testimonials Carousel
       ========================================== */
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    let currentSlide = 0;
    let autoRotateInterval;
    
    function showSlide(index) {
        if (slides.length === 0) return;
        
        // Loop back boundary check
        if (index >= slides.length) currentSlide = 0;
        else if (index < 0) currentSlide = slides.length - 1;
        else currentSlide = index;
        
        // Toggle Active Classes
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }
    
    function nextSlide() {
        showSlide(currentSlide + 1);
    }
    
    function prevSlide() {
        showSlide(currentSlide - 1);
    }
    
    function startAutoRotate() {
        autoRotateInterval = setInterval(nextSlide, 6000); // 6s duration
    }
    
    function stopAutoRotate() {
        clearInterval(autoRotateInterval);
    }
    
    if (slides.length > 0) {
        if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); stopAutoRotate(); startAutoRotate(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); stopAutoRotate(); startAutoRotate(); });
        
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const targetSlide = parseInt(e.target.getAttribute('data-slide'));
                showSlide(targetSlide);
                stopAutoRotate();
                startAutoRotate();
            });
        });
        
        // Start Carousel
        startAutoRotate();
        
        // Pause auto-rotation when hovering testimonial container
        const container = document.querySelector('.carousel-container');
        if (container) {
            container.addEventListener('mouseenter', stopAutoRotate);
            container.addEventListener('mouseleave', startAutoRotate);
        }
    }

    /* ==========================================
       7. Form Submission & Toast System
       ========================================== */
    const inquiryForm = document.getElementById('inquiry-form');
    const toastContainer = document.getElementById('toast-container');
    
    function showToast(title, message, duration = 5000) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i data-lucide="check-circle"></i>
            </div>
            <div class="toast-body">
                <h5>${title}</h5>
                <p>${message}</p>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        lucide.createIcons(); // Render check-circle inside toast
        
        // Auto-remove toast
        setTimeout(() => {
            toast.classList.add('removing');
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, duration);
    }
    
    if (inquiryForm) {
        inquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Read inputs
            const name = document.getElementById('client-name').value;
            const email = document.getElementById('client-email').value;
            const date = document.getElementById('event-date').value;
            
            // Trigger beautiful simulated success toast
            showToast(
                'Inquiry Received Successfully!',
                `Thank you ${name}. Our styling specialists are checking availability for ${date} and will contact you at ${email} shortly!`,
                6500
            );
            
            // Reset form details
            inquiryForm.reset();
        });
    }
});
