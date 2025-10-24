/**
 * Starfield Animation Class
 * Creates a multi-layered, interactive starfield background.
 */
class Starfield {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Starfield container with id "${containerId}" not found.`);
            return;
        }

        // --- CONFIGURATION ---
        this.layerConfigs = [
            { starCount: 50, minSize: 1, maxSize: 1.5, depth: 20, color: 'white' },
            { starCount: 35, minSize: 1.5, maxSize: 2.5, depth: 40, color: 'theme' },
            { starCount: 25, minSize: 2, maxSize: 3, depth: 80, color: 'theme' },
        ];

        // --- STATE VARIABLES ---
        this.mouseX = 0;
        this.mouseY = 0;
        this.isIdle = true;
        this.idleTimer = null;
        this.layers = [];
        this.twinklingStars = [];

        this._initialize();
    }

    _initialize() {
        this.container.style.zIndex = -10;
        this.container.style.position = 'fixed';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100vw';
        this.container.style.height = '100vh';
        this.container.style.overflow = 'hidden';
        this.container.style.pointerEvents = 'none';

        this._createLayers();
        this._setupEventListeners();
        requestAnimationFrame((time) => this._animate(time));
    }

    _createLayers() {
        this.layerConfigs.forEach(layerConfig => {
            const starContainer = document.createElement('div');
            starContainer.className = 'stars-container';
            this.container.appendChild(starContainer);

            const layer = {
                element: starContainer,
                depth: layerConfig.depth,
                currentX: 0,
                currentY: 0
            };
            this.layers.push(layer);

            for (let i = 0; i < layerConfig.starCount; i++) {
                const star = document.createElement('span');
                star.className = 'star';

                if (layerConfig.color === 'theme' && Math.random() > 0.5) {
                    star.classList.add(Math.random() > 0.5 ? 'star-colored-1' : 'star-colored-2');
                }

                star.style.left = `${Math.random() * 100}vw`;
                star.style.top = `${Math.random() * 100}vh`;

                const size = Math.random() * (layerConfig.maxSize - layerConfig.minSize) + layerConfig.minSize;
                star.style.width = `${size}px`;
                star.style.height = `${size}px`;

                if (Math.random() > 0.5) {
                    this.twinklingStars.push({
                        element: star,
                        speed: Math.random() * 0.0005 + 0.0001,
                        offset: Math.random() * 10000
                    });
                } else {
                    star.style.opacity = Math.random() * 0.5 + 0.5;
                }

                starContainer.appendChild(star);
            }
        });
    }

    _animate(time) {
        const scrollY = window.scrollY;
        const idleDriftX = Math.cos(time / 15000) * 50;
        const idleDriftY = Math.sin(time / 20000) * 50;

        this.twinklingStars.forEach(star => {
            const opacity = (Math.sin((star.offset + time) * star.speed) + 1) / 2 * 0.7 + 0.3;
            star.element.style.opacity = opacity;
        });

        this.layers.forEach(layer => {
            let targetX = this.isIdle ? idleDriftX * (layer.depth / 50) : this.mouseX * layer.depth;
            let targetY = this.isIdle ? idleDriftY * (layer.depth / 50) : this.mouseY * layer.depth;
            layer.currentX += (targetX - layer.currentX) * 0.05;
            layer.currentY += (targetY - layer.currentY) * 0.05;
            const scrollOffsetY = -scrollY * (layer.depth / 150);
            layer.element.style.transform = `translate(${layer.currentX}px, ${layer.currentY + scrollOffsetY}px)`;
        });

        requestAnimationFrame((t) => this._animate(t));
    }

    _setupEventListeners() {
        window.addEventListener('mousemove', (e) => {
            this.isIdle = false;
            clearTimeout(this.idleTimer);
            this.mouseX = (e.clientX / window.innerWidth - 0.5) * -1;
            this.mouseY = (e.clientY / window.innerHeight - 0.5) * -1;
            this.idleTimer = setTimeout(() => { this.isIdle = true; }, 2000);
        });
    }
}