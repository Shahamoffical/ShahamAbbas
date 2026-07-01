document.addEventListener('DOMContentLoaded', () => {
    // Initialize GSAP first with careful checks
    const gsapAvailable = typeof gsap !== 'undefined';
    const scrollTriggerAvailable = typeof ScrollTrigger !== 'undefined';

    if (gsapAvailable && scrollTriggerAvailable) {
        gsap.registerPlugin(ScrollTrigger);
    }

    // Menu Toggle
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Close mobile menu when clicking on a link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }

    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const themeToggleMobile = document.getElementById('theme-toggle-mobile');
    const themeIcon = document.getElementById('theme-icon');
    const themeIconMobile = document.getElementById('theme-icon-mobile');

    function updateThemeIcons(isDark) {
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon', 'fa-sun');
            themeIcon.classList.add(isDark ? 'fa-sun' : 'fa-moon');
        }
        if (themeIconMobile) {
            themeIconMobile.classList.remove('fa-moon', 'fa-sun');
            themeIconMobile.classList.add(isDark ? 'fa-sun' : 'fa-moon');
        }
    }

    function toggleDarkMode() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcons(isDark);
    }

    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // Default to dark mode if no preference is saved
    const isDark = savedTheme === 'dark' || !savedTheme;

    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    updateThemeIcons(isDark);

    if (themeToggle) themeToggle.addEventListener('click', toggleDarkMode);
    if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleDarkMode);

    // Form Submission
    const contactForm = document.getElementById('contact-form');
    const toast = document.getElementById('toast');

    if (contactForm && toast) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btnText = document.getElementById('cf-btn-text');
            const btnIcon = document.getElementById('cf-btn-icon');
            const submitBtn = document.getElementById('cf-submit');

            // Loading state
            if (btnText) btnText.textContent = 'Sending...';
            if (btnIcon) { btnIcon.className = 'fa-solid fa-spinner animate-spin'; }
            if (submitBtn) submitBtn.disabled = true;

            const data = {
                name:    document.getElementById('cf-name')?.value    || '',
                email:   document.getElementById('cf-email')?.value   || '',
                subject: document.getElementById('cf-subject')?.value || 'Portfolio Contact',
                message: document.getElementById('cf-message')?.value || ''
            };

            try {
                const res = await fetch('/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await res.json();

                if (res.ok && result.success) {
                    // Success toast
                    toast.textContent = '✅ Message sent! I\'ll reply soon.';
                    toast.classList.remove('bg-red-500');
                    toast.classList.add('bg-emerald-500');
                } else {
                    throw new Error(result.error || 'Unknown error');
                }
            } catch (err) {
                // Error toast
                toast.textContent = '❌ Failed to send. Please try WhatsApp.';
                toast.classList.remove('bg-emerald-500');
                toast.classList.add('bg-red-500');
                console.error('Form error:', err);
            } finally {
                // Reset button
                if (btnText) btnText.textContent = 'Send Message';
                if (btnIcon) { btnIcon.className = 'fa-solid fa-paper-plane'; }
                if (submitBtn) submitBtn.disabled = false;

                // Show toast
                toast.classList.remove('translate-y-20', 'opacity-0');
                toast.classList.add('translate-y-0', 'opacity-100');
                contactForm.reset();
                setTimeout(() => {
                    toast.classList.add('translate-y-20', 'opacity-0');
                    toast.classList.remove('translate-y-0', 'opacity-100');
                }, 4000);
            }
        });
    }

    window.addEventListener('scroll', () => {
        const nav = document.querySelector('nav');
        if (nav) {
            window.scrollY > 50 ? nav.classList.add('shadow-lg') : nav.classList.remove('shadow-lg');
        }
    });

    if (gsapAvailable) {
        // Fallback: Ensure elements are visible if ScrollTrigger or GSAP has issues
        // We'll set them to opacity 1 after a short delay if they are still 0
        setTimeout(() => {
            document.querySelectorAll('.section-header, .skill-card, .pricing-card, .header-content').forEach(el => {
                if (window.getComputedStyle(el).opacity === "0") {
                    gsap.set(el, { opacity: 1, y: 0, visibility: 'visible' });
                }
            });
        }, 3000);

        // Header Entrances (Individual Triggers)
        document.querySelectorAll(".section-header").forEach(header => {
            gsap.from(header, {
                y: 50,
                opacity: 0,
                duration: 1.2,
                ease: "power4.out",
                scrollTrigger: scrollTriggerAvailable ? {
                    trigger: header,
                    start: "top 90%",
                    toggleActions: "play none none none"
                } : null
            });
        });

        // Skill Cards Entrance (Individual Triggers)
        document.querySelectorAll(".skill-card").forEach((card, index) => {
            gsap.from(card, {
                y: 100,
                opacity: 0,
                duration: 1,
                delay: index * 0.1, // Stagger effect even with individual triggers
                ease: "back.out(1.7)",
                scrollTrigger: scrollTriggerAvailable ? {
                    trigger: card,
                    start: "top 90%",
                    toggleActions: "play none none none"
                } : null,
                onComplete: () => {
                    animateCardDetails(card);
                }
            });
        });

        // Function to animate numbers and circles
        function animateCardDetails(card) {
            const percent = parseInt(card.getAttribute('data-percent')) || 0;
            const numberSpan = card.querySelector('.skill-number');
            const progressCircle = card.querySelector('.progress-ring__circle');
            const skillBar = card.querySelector('.skill-bar');

            if (numberSpan) {
                let obj = { value: 0 };
                gsap.to(obj, {
                    value: percent,
                    duration: 2,
                    ease: "power2.out",
                    onUpdate: () => {
                        numberSpan.textContent = Math.floor(obj.value);
                    }
                });
            }

            if (progressCircle) {
                const circumference = 276.46;
                const offset = circumference - (percent / 100) * circumference;
                gsap.to(progressCircle, {
                    strokeDashoffset: offset,
                    duration: 2,
                    ease: "power2.out"
                });
            }

            if (skillBar) {
                gsap.to(skillBar, {
                    height: percent + '%',
                    duration: 2,
                    ease: "power2.out"
                });
            }
        }

        // Advanced Mouse Interaction
        document.querySelectorAll('.skill-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                card.style.setProperty('--x', `${x}px`);
                card.style.setProperty('--y', `${y}px`);

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 15;
                const rotateY = (centerX - x) / 15;

                gsap.to(card, {
                    rotateX: rotateX,
                    rotateY: rotateY,
                    scale: 1.05,
                    duration: 0.5,
                    ease: "power2.out"
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotateX: 0,
                    rotateY: 0,
                    scale: 1,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        });

        // Pricing Section Header
        document.querySelectorAll(".header-content").forEach(header => {
            gsap.from(header, {
                y: 40,
                opacity: 0,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: scrollTriggerAvailable ? {
                    trigger: header,
                    start: "top 90%"
                } : null
            });
        });

        // Pricing Cards
        document.querySelectorAll(".pricing-card").forEach((card, index) => {
            gsap.from(card, {
                y: 60,
                opacity: 0,
                duration: 1,
                delay: index * 0.2,
                ease: "power3.out",
                scrollTrigger: scrollTriggerAvailable ? {
                    trigger: card,
                    start: "top 85%"
                } : null,
                onComplete: () => {
                    card.querySelectorAll('.count-price').forEach(el => {
                        const target = parseInt(el.getAttribute('data-target')) || 0;
                        let obj = { val: 0 };
                        gsap.to(obj, {
                            val: target,
                            duration: 1.5,
                            ease: "power2.out",
                            onUpdate: () => {
                                el.textContent = Math.floor(obj.val);
                            }
                        });
                    });
                }
            });
        });

        // Portfolio Filtering Logic
        const filterBtns = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');

        if (filterBtns.length > 0 && projectCards.length > 0) {
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Update active button state
                    filterBtns.forEach(b => {
                        b.classList.remove('bg-blue-600', 'text-white');
                        b.classList.add('bg-slate-200', 'dark:bg-slate-800');
                    });
                    btn.classList.add('bg-blue-600', 'text-white');
                    btn.classList.remove('bg-slate-200', 'dark:bg-slate-800');

                    const filter = btn.getAttribute('data-filter');

                    // Animation logic
                    gsap.to(projectCards, {
                        duration: 0.3,
                        opacity: 0,
                        scale: 0.8,
                        ease: "power2.in",
                        onComplete: () => {
                            projectCards.forEach(card => {
                                const category = card.getAttribute('data-category');
                                if (filter === 'all' || category === filter) {
                                    card.style.display = 'block';
                                    gsap.to(card, {
                                        duration: 0.5,
                                        opacity: 1,
                                        scale: 1,
                                        ease: "back.out(1.7)",
                                        delay: 0.1
                                    });
                                } else {
                                    card.style.display = 'none';
                                }
                            });
                            // Refresh ScrollTrigger to account for layout changes
                            if (scrollTriggerAvailable) ScrollTrigger.refresh();
                        }
                    });
                });
            });
        }

        // FAQ Accordion Logic
        const faqItems = document.querySelectorAll('.faq-item');

        faqItems.forEach(item => {
            const toggle = item.querySelector('.faq-toggle');
            const icon = item.querySelector('.faq-icon i');
            const iconContainer = item.querySelector('.faq-icon');

            if (toggle && icon && iconContainer) {
                toggle.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');

                    // Close all other items
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                            const otherIcon = otherItem.querySelector('.faq-icon i');
                            const otherContainer = otherItem.querySelector('.faq-icon');
                            if (otherIcon) {
                                otherIcon.classList.replace('fa-minus', 'fa-plus');
                            }
                            if (otherContainer) {
                                otherContainer.classList.replace('bg-slate-900', 'bg-slate-100');
                                otherContainer.classList.replace('text-white', 'text-slate-900');
                            }
                        }
                    });

                    // Toggle current item
                    item.classList.toggle('active');

                    if (!isActive) {
                        icon.classList.replace('fa-plus', 'fa-minus');
                        iconContainer.classList.replace('bg-slate-100', 'bg-slate-900');
                        iconContainer.classList.replace('text-slate-900', 'text-white');
                    } else {
                        icon.classList.replace('fa-minus', 'fa-plus');
                        iconContainer.classList.replace('bg-slate-900', 'bg-slate-100');
                        iconContainer.classList.replace('text-white', 'text-slate-900');
                    }
                });
            }
        });

        // --- NEW SLIDER LOGIC ---
        const slider = document.getElementById('cert-slider');
        const slides = document.querySelectorAll('.slide');
        const prevBtn = document.getElementById('prev-slide');
        const nextBtn = document.getElementById('next-slide');
        const dotsContainer = document.getElementById('slider-dots');

        if (slider && slides.length > 0 && prevBtn && nextBtn && dotsContainer) {
            let currentIndex = 0;
            let visibleSlides = 1;

            function updateSliderConfig() {
                if (window.innerWidth >= 1024) visibleSlides = 3;
                else if (window.innerWidth >= 768) visibleSlides = 2;
                else visibleSlides = 1;

                // Create Dots
                const dotCount = slides.length - (visibleSlides - 1);
                dotsContainer.innerHTML = '';
                for (let i = 0; i < dotCount; i++) {
                    const dot = document.createElement('button');
                    dot.className = `w-3 h-3 rounded-full transition-all ${i === currentIndex ? 'bg-blue-600 w-8' : 'bg-slate-300 dark:bg-slate-700'}`;
                    dot.onclick = () => goToSlide(i);
                    dotsContainer.appendChild(dot);
                }
                goToSlide(currentIndex);
            }

            function goToSlide(index) {
                const maxIndex = slides.length - visibleSlides;
                currentIndex = Math.max(0, Math.min(index, maxIndex));

                const offset = currentIndex * (100 / visibleSlides);
                slider.style.transform = `translateX(-${offset}%)`;

                // Update dots
                const dots = dotsContainer.querySelectorAll('button');
                dots.forEach((dot, i) => {
                    if (i === currentIndex) {
                        dot.classList.add('bg-blue-600', 'w-8');
                        dot.classList.remove('bg-slate-300', 'dark:bg-slate-700');
                    } else {
                        dot.classList.remove('bg-blue-600', 'w-8');
                        dot.classList.add('bg-slate-300', 'dark:bg-slate-700');
                    }
                });
            }

            nextBtn.addEventListener('click', () => {
                if (currentIndex < slides.length - visibleSlides) goToSlide(currentIndex + 1);
                else goToSlide(0);
            });

            prevBtn.addEventListener('click', () => {
                if (currentIndex > 0) goToSlide(currentIndex - 1);
                else goToSlide(slides.length - visibleSlides);
            });

            // Auto-play
            let autoPlay = setInterval(() => nextBtn.click(), 5000);
            slider.parentElement.addEventListener('mouseenter', () => clearInterval(autoPlay));
            slider.parentElement.addEventListener('mouseleave', () => autoPlay = setInterval(() => nextBtn.click(), 5000));

            window.addEventListener('resize', updateSliderConfig);
            updateSliderConfig();
        }
    }
});

