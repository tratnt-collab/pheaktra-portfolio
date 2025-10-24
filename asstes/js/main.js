
//preloader//
const preloaderEl = document.getElementById('preloader');

// Force page to load at the top
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', function() {
    // On initial load, ensure the page is at the very top.
    // The browser's default behavior will handle scrolling to a hash if present.
    window.scrollTo(0, 0);

    if (preloaderEl) {
        function loadData() {
            return new Promise((resolve, reject) => {
                setTimeout(resolve, 1000);
            })
        }

        loadData().then(() => {
            preloaderEl.classList.add('preloaderH');
            preloaderEl.classList.remove('visible');
        });
    }

    //========== Dynamic Project Card Generation =========/
    const projectGrid = document.querySelector('.project-grid');

    function generateProjectCards() {
        if (!projectGrid || typeof projectsData === 'undefined') {
            return;
        }

        projectGrid.innerHTML = ''; // Clear existing content

        projectsData.forEach(project => {
            const projectCard = `
                <a href="project-detail.html?id=${project.id}" class="project-card">
                    <img src="${project.imageUrls[0]}" alt="${project.title}">
                    <div class="project-card-info">
                        <h3>${project.title}</h3>
                        <p>${project.category}</p>
                    </div>
                </a>
            `;
            projectGrid.innerHTML += projectCard;
        });
    }
    generateProjectCards();


//=========-- Header --=========//

const header = document.querySelector(".header"); // For sticky header
const headerTrigger = document.querySelector('.header-trigger'); // For observers
const backToTopBtn = document.querySelector('.back-to-top-btn'); // For back-to-top button

// Observer for the sticky header
if (header && headerTrigger) {
    const stickyHeaderObserver = new IntersectionObserver(
        ([entry]) => {
            header.classList.toggle("sticky", !entry.isIntersecting);
        },
        { rootMargin: "-150px 0px 0px 0px" }
    );
    stickyHeaderObserver.observe(headerTrigger);
}

// Observer for the "Back to Top" button
if (backToTopBtn && headerTrigger) {
    const backToTopObserver = new IntersectionObserver(
        ([entry]) => {
            // When the trigger is NOT intersecting (i.e., scrolled down), show the button.
            backToTopBtn.classList.toggle("visible", !entry.isIntersecting);
        },
        {
            // A small threshold to ensure it's hidden right at the top.
            threshold: 0.9
        }
    );
    backToTopObserver.observe(headerTrigger);
}


// =========== Modular Text Animation ============//
class TextAnimator {
    constructor(slideSelector, interval = 3000) {
        this.slides = document.querySelectorAll(slideSelector);
        this.interval = interval;
        this.currentSlide = 0;
        this.intervalId = null;
    }

    _showSlide(index) {
        this.slides.forEach((slide, i) => {
            slide.classList.remove('visible', 'hidden');
            if (i === index) {
                slide.classList.add('visible');
            } else {
                slide.classList.add('hidden');
            }
        });
    }

    next() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this._showSlide(this.currentSlide);
    }

    start() {
        if (!this.intervalId && this.slides.length > 0) {
            this.intervalId = setInterval(() => this.next(), this.interval);
        }
    }

    stop() {
        clearInterval(this.intervalId);
        this.intervalId = null;
    }
}

function setupTextAnimationControls(animator) {
    const container = document.querySelector('.title_animation');
    const visibilityToggler = document.querySelector('.Ecnt01');
    const cssClassToggler = document.querySelector('.Ecnt02');
    const pauseToggler = document.querySelector('.EImg02');
    const animatedSpans = document.querySelectorAll('.title_animation span');

    if (!container || !visibilityToggler || !cssClassToggler || !pauseToggler) return;

    // --- Visibility Toggle ---
    visibilityToggler.style.cursor = 'pointer';
    visibilityToggler.addEventListener('click', () => {
        container.classList.toggle('is-hidden');
        const isHidden = container.classList.contains('is-hidden');
        visibilityToggler.classList.toggle('is-off', isHidden);

        // Hide/show other controls
        cssClassToggler.style.display = isHidden ? 'none' : 'block';
        pauseToggler.style.display = isHidden ? 'none' : 'block';
    });

    // --- CSS Class Toggle ---
    cssClassToggler.style.cursor = 'pointer';
    cssClassToggler.addEventListener('click', () => {
        cssClassToggler.classList.toggle('is-off');
        const isOff = cssClassToggler.classList.contains('is-off');
        animatedSpans.forEach(span => {
            span.classList.toggle('css-on', !isOff);
            span.classList.toggle('css-off', isOff);
        });
    });

    // --- Pause/Resume Toggle ---
    pauseToggler.style.cursor = 'pointer';
    pauseToggler.addEventListener('click', () => {
        pauseToggler.classList.toggle('is-off');
        const isOff = pauseToggler.classList.contains('is-off');
        if (isOff) {
            animator.stop();
        } else {
            animator.start();
        }
    });
}

// Initialize and start the text animation
const textAnimator = new TextAnimator('.title_animation p');
textAnimator.start();
setupTextAnimationControls(textAnimator);

//========== Plexus Network Animation =========/
const plexusCanvas = document.getElementById('plexus-canvas');
let reinitPlexusParticles = () => {}; // Placeholder function
if (plexusCanvas) {
    const ctx = plexusCanvas.getContext('2d');
    let particles = [];
    let animationFrameId;
    let particleCount;
    let maxDistance;

    const mouse = {
        x: null,
        y: null,
        radius: 150
    };

    // Throttling function to limit how often a function can be called.
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    plexusCanvas.addEventListener('mousemove', throttle((event) => {
        const rect = plexusCanvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    }, 16)); // Limit to roughly 60fps (1000ms / 60 = ~16ms)

    plexusCanvas.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = plexusCanvas.getBoundingClientRect();
        plexusCanvas.width = rect.width * dpr;
        plexusCanvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        initParticles();
    }

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.baseSize = size; // Store original size for pulsing
            // Random start angle for a desynchronized pulse effect
            this.pulseAngle = Math.random() * Math.PI * 2;
            this.opacity = 0; // Initial opacity for fade-in
            this.fadeSpeed = Math.random() * 0.02 + 0.01; // Varying fade-in speed
            this.color = color;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        }
        update() {
            const canvasWidth = plexusCanvas.width / (window.devicePixelRatio || 1);
            const canvasHeight = plexusCanvas.height / (window.devicePixelRatio || 1);

            // Move particle
            this.x += this.directionX;
            this.y += this.directionY;

            // Wrap around screen edges
            if (this.x > canvasWidth) this.x = 0;
            if (this.x < 0) this.x = canvasWidth;
            if (this.y > canvasHeight) this.y = 0;
            if (this.y < 0) this.y = canvasHeight;

            // Mouse interaction - attraction effect
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;

                if (distance < mouse.radius) {
                    // The closer the particle, the stronger the attraction
                    const force = (mouse.radius - distance) / mouse.radius;
                    this.x -= forceDirectionX * force * 1.5; // The '1.5' is a pull strength multiplier
                    this.y -= forceDirectionY * force * 1.5;
                }
            }

            // Pulsing effect
            this.pulseAngle += 0.05; // Speed of the pulse
            // Oscillate size using sine wave. The '0.5' is the pulse amplitude.
            this.size = this.baseSize + Math.sin(this.pulseAngle) * 0.5;

            // Fade-in effect
            if (this.opacity < 1) {
                this.opacity += this.fadeSpeed;
            }

            this.draw();
        }
    }

    function initParticles() {
        particles = [];
        const style = getComputedStyle(document.documentElement);
        const main01 = style.getPropertyValue('--Main01').trim();
        const main02 = style.getPropertyValue('--Main02').trim();

        // Set particle count and distance based on screen size
        if (window.innerWidth <= 768) { // Phone screen size
            particleCount = 20;
            maxDistance = 90;
        } else { // Large screen size
            particleCount = 30;
            maxDistance = 120;
        }

        for (let i = 0; i < particleCount; i++) {
            let size = Math.random() * 2 + 1;
            const canvasWidth = plexusCanvas.width / (window.devicePixelRatio || 1);
            const canvasHeight = plexusCanvas.height / (window.devicePixelRatio || 1);

            // Confine initial particle positions to the new taller/narrower area
            let x = (Math.random() * (canvasWidth * 0.8)) + (canvasWidth * 0.1);
            let y = Math.random() * (canvasHeight - size * 2) + size;
            let directionX = (Math.random() * .4) - .2;
            let directionY = (Math.random() * .4) - .2;
            let color = Math.random() > 0.5 ? main01 : main02;
            particles.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    function connect() {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x)) + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
                if (distance < (maxDistance * maxDistance)) {
                    const opacity = 1 - (distance / (maxDistance * maxDistance));
                    
                    // Create a gradient that transitions between the two particle colors
                    const gradient = ctx.createLinearGradient(particles[a].x, particles[a].y, particles[b].x, particles[b].y);
                    gradient.addColorStop(0, particles[a].color);
                    gradient.addColorStop(1, particles[b].color);

                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 1;
                    ctx.globalAlpha = opacity; // Apply distance-based opacity
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1; // Reset global alpha
    }

    function animate() {
        ctx.clearRect(0, 0, plexusCanvas.width, plexusCanvas.height);
        particles.forEach(p => p.update());
        connect();
        animationFrameId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();
}
if (typeof initParticles === 'function') {
    reinitPlexusParticles = initParticles;
}

//======- Mobile Menu Toggle -=========/
const mobileMenu = document.querySelector('.mobile_menu');
const openBtn = document.querySelector('.OC_btn');
const closeBtn = document.querySelector('.closebtn');
const mobileNavLinks = document.querySelectorAll('.mobile_bar a');

if (mobileMenu && openBtn && closeBtn && mobileNavLinks.length > 0) {
    // Function to open the menu
    const openMenu = () => mobileMenu.classList.add('open_mobilemenu');
    // Function to close the menu
    const closeMenu = () => mobileMenu.classList.remove('open_mobilemenu');

    openBtn.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);
    // Add event listener to each mobile navigation link to close the menu on click
    mobileNavLinks.forEach(link => link.addEventListener('click', closeMenu));
}

// -========Card animation Tilt ========-//
const tiltBoxes = document.querySelectorAll(".box");
if (tiltBoxes.length > 0) {
    VanillaTilt.init(tiltBoxes, {
        max: 15,
        speed: 200
    });;
}

    //========== Split Screen Scrolling Logic =========/
    const sections = document.querySelectorAll('main section');
    const navLinks = document.querySelectorAll('.navbar a, .mobile_bar a');

    //========== switcherArea & color =========/
    const switcherButton = document.querySelector('.stBtn');
    const switcherArea = document.querySelector('.switcher');

    if (switcherButton && switcherArea) {
        // Ensure the switcher elements are on top of other content
        switcherButton.style.zIndex = '1001';
        switcherArea.style.zIndex = '1001';


        switcherButton.addEventListener('click', () => {
            switcherArea.classList.toggle('active');
        });

        const colors = document.querySelectorAll('[id^="color"]');
        const main01 = ['#ff00ea', '#00c6ff', '#70F570', '#f9d423'];
        const main02 = ['#2600fc', '#0072ff', '#49C628', '#f83600'];

        // Function to apply a theme based on index
        function applyTheme(index) {
            if (index >= 0 && index < main01.length) {
                document.documentElement.style.setProperty('--Main01', main01[index]);
                document.documentElement.style.setProperty('--Main02', main02[index]);
                // Re-initialize the plexus particles with the new theme colors
                reinitPlexusParticles();
            }
        }

        // Loop through the color options and attach event listeners
        colors.forEach((color, i) => {
            color.addEventListener('click', () => {
                // Apply the theme
                applyTheme(i);
                // Close the switcher after selecting a color
                switcherArea.classList.remove('active');
            });
        });
    }


    //========== Project Stats Counter Animation =========/
    const statsSection = document.querySelector('.project-stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                // When the stats section is 50% visible, trigger the animation
                if (entry.isIntersecting) {
                    const counters = entry.target.querySelectorAll('.listproj h2');

                    counters.forEach(counter => {
                        const targetText = counter.innerText;
                        const suffix = targetText.replace(/[\d,.]/g, ''); // Extracts '+', 'x', etc.
                        const targetNumber = parseFloat(targetText.replace(/,/g, ''));
                        const hasDecimal = targetText.includes('.');

                        let start = { val: 0 };

                        gsap.to(start, {
                            duration: 2.5,
                            val: targetNumber,
                            ease: "power1.out",
                            onUpdate: () => {
                                if (hasDecimal) {
                                    counter.innerText = start.val.toFixed(1) + suffix;
                                } else {
                                    counter.innerText = Math.ceil(start.val).toLocaleString() + suffix;
                                }
                            }
                        });
                    });
                    // Animate only once by unobserving the element
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 }); // Trigger when 50% of the element is in view

        statsObserver.observe(statsSection);
    }

    //========== Headline Typing Effect in About Section =========/
    const aboutSection = document.getElementById('about');
    let headlineAnimationHasStarted = false; // Flag to ensure the animation only starts once

    if (aboutSection) {
        const typingEffectEl = document.getElementById('headline-typing-effect');
        const finalHeadlineEl = document.getElementById('about-headline');
        const codeToType = '<h2>The Architect of Digital <span>Solutions</span></h2>';

        const typingObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                // Start the animation if it's intersecting and hasn't started yet
                if (entry.isIntersecting && !headlineAnimationHasStarted) {
                    headlineAnimationHasStarted = true; // Set flag to true
                    // Start the typing animation
                    typeCode(typingEffectEl, finalHeadlineEl, codeToType);
                    // Stop observing to ensure it only runs once
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.4
        }); // Trigger when 40% of the section is visible

        typingObserver.observe(aboutSection);
    }

    function typeCode(typingEl, finalEl, text) {
        let index = 0;
        // Reset elements for the loop
        typingEl.innerHTML = ''; // Clear content
        typingEl.style.display = 'block'; // Make sure it's visible for the animation
        typingEl.style.opacity = '1';
        finalEl.style.display = 'none';
        finalEl.classList.remove('visible');

        function typeCharacter() {
            if (index < text.length) {
                typingEl.innerHTML += text.charAt(index);
                index++;
                // Use a random timeout for a more natural typing speed
                const randomSpeed = Math.random() * 100 + 40; // Speed between 40ms and 140ms
                setTimeout(typeCharacter, randomSpeed);
            } else {
                // Wait for a moment after typing finishes
                setTimeout(() => {
                    // Fade out the typed code (handled by CSS transition)
                    typingEl.style.opacity = '0';

                    // Wait for the fade-out transition to complete (600ms) before proceeding.
                    setTimeout(() => {
                        // Hide the typing element completely.
                        typingEl.style.display = 'none';

                        // NOW, fade in the final, styled headline.
                        finalEl.style.display = 'block'; // Make it take up space before fading in.
                        finalEl.classList.add('visible');
                    }, 600); // This duration MUST match the transition duration in css.css.

                    // After showing the final headline, wait and then loop the animation
                    setTimeout(() => {
                        typeCode(typingEl, finalEl, text); // Restart the animation
                    }, 4000); // 4-second pause before looping
                }, 800); // 800ms delay
            }
        }

        typeCharacter(); // Initial call to start typing
    }


    function setActiveLink(index) {
        navLinks.forEach(link => link.classList.remove('active'));
        if (index !== -1) {
            const activeLinks = document.querySelectorAll(`a[href="#${sections[index].id}"]`);
            activeLinks.forEach(link => link.classList.add('active'));
        }
    }

    // Handle clicks on nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // The default anchor behavior will handle the scrolling.
            // The scroll listener below will handle setting the active class.
        });
    });

    // Update active section on normal scroll
    window.addEventListener('scroll', () => {
        let currentSectionIndex = -1;
        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop - 150; // A bit of offset
            if (window.scrollY >= sectionTop) {
                currentSectionIndex = index;
            }
        });
        setActiveLink(currentSectionIndex);
    });

    //========== Parallax Effect on Background Elements =========/
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

    // Function to create and animate a trail particle
    function createTrail(x, y, progress) {
        const trailParticle = document.createElement('div');
        trailParticle.className = 'sparkle-trail';
        document.body.appendChild(trailParticle);

        // Get the current theme colors from the CSS variables
        const style = getComputedStyle(document.documentElement);
        const main01 = style.getPropertyValue('--Main01').trim();
        const main02 = style.getPropertyValue('--Main02').trim();
        // Randomly choose between the two theme colors for each particle
        const particleColor = Math.random() > 0.5 ? main01 : main02;

        // Set initial state at the sparkle's position
        gsap.set(trailParticle, {
            x: x,
            y: y,
            background: particleColor,
            boxShadow: `0 0 10px 2px ${particleColor}`, // A nice glow
            scale: Math.random() * 0.5 + 0.5, // Random initial size
        });
    
        // Animate the particle to fade out and shrink, creating a tail effect
        gsap.to(trailParticle, {
            duration: 1.5, // How long the tail particle lasts
            opacity: 0,
            scale: 0,
            // Add a slight drift to make the tail feel more organic
            x: `+=${(Math.random() - 0.5) * 20}`,
            y: `+=${(Math.random() - 0.5) * 20}`,
            ease: "power2.out",
            onComplete: () => {
                trailParticle.remove(); // Clean up the particle from the DOM
            }
        });
    }

    // --- Reusable function for a simple hover pop effect ---
    function applyHoverPop(element) {
        element.addEventListener('mouseenter', () => {
            gsap.to(element, { scale: 1.2, duration: 0.3, ease: "power1.out" });
        });

        element.addEventListener('mouseleave', () => {
            gsap.to(element, { scale: 1, duration: 0.3, ease: "power1.inOut" });
        });
    }

    // --- Reusable function to apply a floating effect ---
    function applyInteractiveFloat(element, options = {}) {
        const { float = false, direction = 1 } = options;

        // Animation properties are now focused only on floating
        const animationProps = {
            repeat: -1,
            yoyo: true,
            duration: (Math.random() * 2) + 3,
            ease: "sine.inOut",
        };

        if (float) {
            animationProps.x = (Math.random() * 20);
            animationProps.yPercent = (Math.random() * 30) * direction;
        }

        const floatAnimation = gsap.to(element, animationProps);

        element.addEventListener('mouseenter', () => {
            // Speed up the float animation slightly on hover for subtle feedback
            gsap.to(floatAnimation, { timeScale: 2, duration: 0.3, ease: "power1.inOut" });
        });

        element.addEventListener('mouseleave', () => {
            gsap.to(floatAnimation, { timeScale: 1, duration: 0.3, ease: "power1.inOut" });
        });
    }

    // --- Apply effects to social media icons in the footer ---
    const socialIcons = gsap.utils.toArray('.footersocal a');
    socialIcons.forEach(icon => applyHoverPop(icon));

    // Select all the decorative images we want to apply the effect to
    let parallaxElements = gsap.utils.toArray('.Ecnt01, .Ecnt02, .EImg01, .EImg02, .serimg02, .simg1, .simg2, .fimg, .fimg2');

    //========== Service Title Break-Apart Animation =========//
    const serviceTitle = document.querySelector('#services .services_info h2');

    function setupServiceTitleAnimation() {
        if (!serviceTitle) return;
 
        // Apply the interactive float effect
        applyInteractiveFloat(serviceTitle, { float: true, direction: -1 });
 
        // --- Character Breaking Animation on Click ---
        let isAnimating = false;
        const originalHTML = serviceTitle.innerHTML;

        // 1. Split the entire title into characters, preserving the inner span for "MINTING!"
        const textNodes = Array.from(serviceTitle.childNodes);
        serviceTitle.innerHTML = ''; // Clear the original content

        textNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                // Handle "LET'S START" and wrap its characters
                const text = node.textContent.trim();
                text.split('').forEach(char => {
                    const charSpan = document.createElement('span');
                    charSpan.className = 'char';
                    // Use non-breaking space for spaces to maintain layout
                    charSpan.textContent = char === ' ' ? '\u00A0' : char;
                    serviceTitle.appendChild(charSpan);
                });
                serviceTitle.appendChild(document.createElement('br')); // Add the line break
            } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SPAN') {
                // Handle the <span> for "MINTING!", wrap its characters, and re-append
                const innerText = node.textContent;
                node.innerHTML = ''; // Clear the original span
                innerText.split('').forEach(char => {
                    const charSpan = document.createElement('span');
                    charSpan.className = 'char';
                    charSpan.textContent = char;
                    node.appendChild(charSpan);
                });
                serviceTitle.appendChild(node);
            }
        });

        // Now, select all the individual character spans for the animation
        const chars = gsap.utils.toArray(serviceTitle.querySelectorAll('.char'));

        // 2. Add the click event listener
        serviceTitle.addEventListener('click', () => {
            if (isAnimating) return;
            isAnimating = true;

            const bounds = serviceTitle.parentElement.getBoundingClientRect();

            // Animate each character to a random position
            gsap.to(chars, {
                x: () => gsap.utils.random(-bounds.width / 2, bounds.width / 2, 5),
                y: () => gsap.utils.random(-150, 150, 5),
                rotation: () => gsap.utils.random(-360, 360),
                opacity: 0,
                scale: () => gsap.utils.random(0.5, 1.5),
                duration: 1.5,
                stagger: 0.03,
                ease: "power2.out",
                onComplete: () => {
                    // After a delay, animate them back
                    setTimeout(() => {
                        gsap.to(chars, {
                            x: 0,
                            y: 0,
                            rotation: 0,
                            opacity: 1,
                            scale: 1,
                            duration: 1,
                            stagger: 0.03,
                            ease: "power2.inOut",
                            onComplete: () => {
                                isAnimating = false;
                            }
                        });
                    }, 800); // 0.8-second pause before reforming
                }
            });
        });
    }

    // --- Special Animation for the Sparkle Guide ---
    const sparkle = document.querySelector('.EImg01');
    if (sparkle) {
        // Exclude the sparkle from the general parallax group to prevent animation conflicts.
        parallaxElements = parallaxElements.filter(el => !el.classList.contains('EImg01'));
    }
 
    // Use GSAP's matchMedia for responsive animations that refresh on resize.
    ScrollTrigger.matchMedia({
        // "all" applies this to all screen sizes
        "all": function() {
            // --- General Parallax Elements ---
            const parallaxTweens = parallaxElements.map((el) => {
                const direction = el.classList.contains('Ecnt01') ? -1 : 1;
                const movement = 110 * direction;

                gsap.to(el, {
                    y: movement,
                    ease: "none",
                    scrollTrigger: {
                        trigger: el,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1.2
                    }
                });
                applyInteractiveFloat(el, { float: true, direction: direction });
            });

            // --- Sparkle Motion Path Animation ---
            let sparkleTween;
            if (sparkle) {
                sparkleTween = gsap.to(sparkle, {
                    motionPath: {
                        path: "#sparkle-path",
                        align: "#sparkle-path",
                        alignOrigin: [0.5, 0.5],
                        autoRotate: true,
                    },
                    scrollTrigger: {
                        trigger: "body",
                        start: "top top",
                        end: "bottom bottom",
                        scrub: 1.5,
                    },
                    filter: "hue-rotate(360deg)",
                    ease: "none",
                });
            }
        }
    });

    // Initialize the service title animation
    setupServiceTitleAnimation();

    //========== Star Background Animation =========/
    new Starfield('star-background');
});

//========== Contact Form to Telegram Submission =========/
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent the default form submission

            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = 'Sending...';

            // Your Telegram Bot details
            const botToken = '8328572536:AAEXNiYDB7KT_JK1WELxswiryAVbO7zrH1s';
            const chatId = '-4933723764';

            // Get form data
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const contact = formData.get('contact');
            const message = formData.get('message');

            // Format the message for Telegram using HTML
            const text = `<b>New Portfolio Contact</b>
-------------------------
<b>Name:</b> ${name}
<b>Contact:</b> ${contact}
<b>Message:</b>
<pre>${message}</pre>`;

            const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    parse_mode: 'HTML',
                }),
            })
            .then(response => response.json())
            .then(data => {
                submitButton.innerHTML = 'Message Sent!';
                contactForm.reset(); // Clear the form
                setTimeout(() => { submitButton.innerHTML = originalButtonText; submitButton.disabled = false; }, 3000);
            })
            .catch(error => {
                console.error('Error:', error);
                submitButton.innerHTML = 'Failed to Send';
                setTimeout(() => { submitButton.innerHTML = originalButtonText; submitButton.disabled = false; }, 3000);
            });
        });
    }
});

//========== About Icon Image Swapping Logic =========/
document.addEventListener('DOMContentLoaded', function () {
    const aboutIcons = gsap.utils.toArray('.about-image-wrapper .banner_img span[class^="Abimg"]');
    let isSwapping = false;

    if (aboutIcons.length > 1) {
        const swapIconPositions = () => {
            if (isSwapping) return; // Don't start a new swap if one is in progress
            isSwapping = true;

            // 1. Pick two different random icons
            let index1 = Math.floor(Math.random() * aboutIcons.length);
            let index2;
            do {
                index2 = Math.floor(Math.random() * aboutIcons.length);
            } while (index1 === index2);

            const icon1 = aboutIcons[index1];
            const icon2 = aboutIcons[index2];

            // 2. Get their current positions and classes
            const pos1 = { x: icon1.offsetLeft, y: icon1.offsetTop };
            const pos2 = { x: icon2.offsetLeft, y: icon2.offsetTop };
            const class1 = icon1.className;
            const class2 = icon2.className;

            // 3. Animate the swap using GSAP
            gsap.timeline({
                onComplete: () => {
                    // 4. After animation, swap classes and reset transforms
                    icon1.className = class2;
                    icon2.className = class1;
                    gsap.set([icon1, icon2], { clearProps: "transform" });
                    isSwapping = false; // Allow next swap
                    scheduleNextSwap(); // Schedule the next one
                }
            })
            .to(icon1, {
                x: pos2.x - pos1.x,
                y: pos2.y - pos1.y,
                scale: 1.2, // Briefly enlarge during travel
                duration: 1.5,
                ease: "power2.inOut"
            }, 0)
            .to(icon2, {
                x: pos1.x - pos2.x,
                y: pos1.y - pos2.y,
                scale: 1.2, // Briefly enlarge during travel
                duration: 1.5,
                ease: "power2.inOut"
            }, 0)
            .to([icon1, icon2], { scale: 1, duration: 0.5, ease: "power2.inOut" }, "-=0.5"); // Shrink back to normal size
        };

        const scheduleNextSwap = () => {
            const randomInterval = Math.random() * 5000 + 4000; // Between 4 and 9 seconds
            setTimeout(swapIconPositions, randomInterval);
        };

        scheduleNextSwap(); // Start the first swap
    }
});

//========== About Me Text Switching Animation =========/
document.addEventListener('DOMContentLoaded', function () {
    const textContainers = document.querySelectorAll('.about-text-anim-container');

    textContainers.forEach(container => {
        const slides = container.querySelectorAll('.about-text-anim-slide');
        if (slides.length < 2) return; // Don't animate if there's only one option

        let currentSlide = 0;

        // Function to show the next slide
        const showNextSlide = () => {
            // Hide the current slide
            slides[currentSlide].classList.remove('visible');

            // Move to the next slide, looping back to the start
            currentSlide = (currentSlide + 1) % slides.length;

            // Show the new current slide
            slides[currentSlide].classList.add('visible');
        };

        setInterval(showNextSlide, 3000); // Switch text every 3 seconds
    });
});
