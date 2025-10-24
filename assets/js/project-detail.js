document.addEventListener('DOMContentLoaded', () => {
    // Initialize the starfield background
    new Starfield('star-background');

    // Get the project ID from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    // --- Technology Logo Mapping ---
    // IMPORTANT: You might need to create these image files in 'asstes/img/tech-logos/'
    // or adjust paths to existing images. The folder name has been corrected to 'assets'.
    const techLogoMap = {

        'VBA': '/assets/img/xlsms.png',
        'Microsoft Excel': '/assets/img/xlsxs.png',
        'Adobe Photoshop': '/assets/img/adobe-pss.png',
        'Adobe Illustrator': '/assets/img/adobe-ais.png',
        'Telegram API': '/assets/img/telegrams.png',
        'HTML': '/assets/img/html5.png',
        'CSS': '/assets/img/css3.png',
        'JavaScript': '/assets/img/javascript.png',
        'Python': '/assets/img/Python.png',
        'Tailwind CSS': '/assets/img/tailwind-css.png',
        // Add more mappings for other technologies as needed
    };
    const defaultTechLogo = '/assets/img/tech-logos/default-tech.png'; // Fallback image

    // Find the project data that matches the ID
    // The 'projectsData' variable is available from the included 'projects.js' file
    const project = projectsData.find(p => p.id === projectId);

    const contentWrapper = document.getElementById('project-detail-content-wrapper');

    if (project) {
        // --- Populate Page Content ---
        // Set the page title
        const pageTitle = `Project | ${project.title}`;
        document.title = pageTitle;

        // --- Update Meta Tags for SEO and Social Sharing ---
        const pageUrl = new URL(window.location.href);
        const absoluteImageUrl = `${pageUrl.origin}${project.imageUrls[0]}`.replace(/([^:]\/)\/+/g, "$1"); // Ensure no double slashes

        document.querySelector('meta[name="description"]').setAttribute('content', project.description);
        // Open Graph Tags
        document.querySelector('meta[property="og:title"]').setAttribute('content', pageTitle);
        document.querySelector('meta[property="og:description"]').setAttribute('content', project.description);
        document.querySelector('meta[property="og:url"]').setAttribute('content', pageUrl.href);
        document.querySelector('meta[property="og:image"]').setAttribute('content', absoluteImageUrl);


        // --- Helper function to safely update element content ---
        const safeUpdate = (id, property, value) => {
            const element = document.getElementById(id);
            if (element) {
                element[property] = value;
            }
        };

        safeUpdate('project-title', 'textContent', project.title);
        safeUpdate('project-description', 'textContent', project.description);

        const detailsList = document.getElementById('project-details-list');
        if (detailsList) {
            detailsList.innerHTML = project.details.map(detail => `<li><i class="fa-solid fa-check-circle"></i> ${detail}</li>`).join('');
        }

        const techList = document.getElementById('project-tech-list');
        if (techList) {
            techList.innerHTML = project.technologies.map(tech => `<li><i class="fa-solid fa-code"></i> ${tech}</li>`).join('');
        }

        // Apply floating effect to the back button container
        const backButtonContainer = document.querySelector('.back-to-projects-container');
        if (backButtonContainer && typeof applyInteractiveFloat === 'function') {
            applyInteractiveFloat(backButtonContainer, { float: true, direction: 1 });
        }

        // Populate the client logo and name
        if (project.client) {
            safeUpdate('client-logo-image', 'src', project.client.logoUrl);
            safeUpdate('client-logo-image', 'alt', `${project.client.name} Logo`);
            safeUpdate('client-name', 'textContent', project.client.name);
        }

        // Populate floating tech logos
        const floatingTechLogosContainer = document.getElementById('floating-tech-logos');
        if (project.technologies && project.technologies.length > 0 && floatingTechLogosContainer) {
            floatingTechLogosContainer.innerHTML = ''; // Clear any placeholder

            project.technologies.slice(0, 8).forEach((tech) => { // Use up to 8 logos
                const logoUrl = techLogoMap[tech] || defaultTechLogo;
                const techLogoDiv = document.createElement('div');
                techLogoDiv.className = `floating-tech-logo`;
                techLogoDiv.innerHTML = `<img src="${logoUrl}" alt="${tech} Logo">`;
                floatingTechLogosContainer.appendChild(techLogoDiv);

                // Set a random initial position within the wrapper
                gsap.set(techLogoDiv, {
                    x: () => gsap.utils.random(0, floatingTechLogosContainer.offsetWidth),
                    y: () => gsap.utils.random(0, floatingTechLogosContainer.offsetHeight),
                    scale: () => gsap.utils.random(0.8, 1.2)
                });

                // Create a continuous, random floating animation that respects boundaries
                const tl = gsap.timeline({ repeat: -1, yoyo: true });
                
                // Dynamically get header height to make it more robust
                const headerEl = document.querySelector('.header.sticky');
                const navBarHeight = headerEl ? headerEl.offsetHeight : 80; // Fallback to 80px

                // Get container bounds once before the animation starts
                const bounds = floatingTechLogosContainer.getBoundingClientRect();

                tl.to(techLogoDiv, {
                    x: () => `+=${gsap.utils.random(-150, 150)}`,
                    y: () => `+=${gsap.utils.random(-150, 150)}`,
                    rotation: () => `+=${gsap.utils.random(-30, 30)}`,
                    duration: () => gsap.utils.random(10, 20),
                    ease: "sine.inOut",
                    modifiers: {
                        x: function(x) {
                            // Constrain x within the container's bounds
                            const logoWidth = techLogoDiv.offsetWidth;
                            return gsap.utils.clamp(0, bounds.width - logoWidth, x);
                        },
                        y: function(y) {
                            // Constrain y within the container's bounds, accounting for the nav bar
                            const logoHeight = techLogoDiv.offsetHeight;
                            // The top boundary is the navBarHeight minus the container's top offset
                            const topBound = navBarHeight - bounds.top;
                            return gsap.utils.clamp(topBound, bounds.height - logoHeight, y);
                        }
                    }
                });
            });
        }

        // Populate the project gallery
        const galleryWrapper = document.getElementById('project-gallery-wrapper');
        const galleryContainer = document.getElementById('project-gallery-images');
        if (project.imageUrls && project.imageUrls.length > 0) {
            galleryContainer.innerHTML = ''; // Clear placeholder
            project.imageUrls.forEach((url, index) => {
                const isVideo = url.endsWith('.mp4');
                const galleryItemContainer = document.createElement('div');
                galleryItemContainer.className = 'gallery-item';
 
                if (isVideo) {
                    const video = document.createElement('video');
                    video.src = url;
                    video.muted = true;
                    video.autoplay = true;
                    video.loop = true;
                    video.playsInline = true; // Important for iOS
                    video.setAttribute('alt', `${project.title} gallery video`);
                    galleryItemContainer.appendChild(video);
                } else {
                    const img = document.createElement('img');
                    img.src = url;
                    img.setAttribute('alt', `${project.title} gallery image`);
                    galleryItemContainer.appendChild(img);
                }
 
                galleryItemContainer.addEventListener('click', () => openLightbox(index));
                galleryContainer.appendChild(galleryItemContainer);
            });
            if (galleryWrapper) {
                galleryWrapper.style.display = 'block';
            }
        }

        // --- Lightbox Functionality ---
        const lightbox = document.getElementById('lightbox-modal');
        const lightboxContent = document.getElementById('lightbox-content');
        const closeBtn = document.querySelector('.lightbox-close');
        const thumbnailsContainer = document.getElementById('lightbox-thumbnails');
        const prevBtn = document.querySelector('.lightbox-prev');
        const nextBtn = document.querySelector('.lightbox-next');

        let currentLightboxIndex = 0;
 
        function showMediaAtIndex(index) {
            const mediaUrl = project.imageUrls[index];

            lightboxContent.innerHTML = ''; // Clear previous content
            if (mediaUrl.endsWith('.mp4')) {
                const video = document.createElement('video');
                video.src = mediaUrl;
                video.controls = true;
                video.autoplay = true;
                video.loop = true; // Keep it looping in the lightbox
                video.playsInline = true; // Ensure plays inline on iOS
                lightboxContent.appendChild(video);
            } else {
                const img = document.createElement('img');
                img.src = mediaUrl;
                lightboxContent.appendChild(img);
            }

            // Update active thumbnail
            const thumbnails = thumbnailsContainer.querySelectorAll('.lightbox-thumbnail-item');
            thumbnails.forEach((thumb, i) => {
                thumb.classList.toggle('active', i === index);
                // Scroll the active thumbnail into view
                if (i === index) {
                    thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            });
        }

        function openLightbox(index) {
            currentLightboxIndex = index;

            // Generate thumbnails
            thumbnailsContainer.innerHTML = '';
            project.imageUrls.forEach((url, i) => {
                const thumbItem = document.createElement('div');
                thumbItem.className = 'lightbox-thumbnail-item';
                const isVideo = url.endsWith('.mp4');
                const thumbEl = isVideo ? document.createElement('video') : document.createElement('img');
                thumbEl.src = isVideo ? `${url}#t=0.1` : url; // Get first frame for video
                if (isVideo) thumbEl.muted = true;

                thumbItem.appendChild(thumbEl);
                thumbItem.addEventListener('click', () => {
                    currentLightboxIndex = i;
                    showMediaAtIndex(i);
                });
                thumbnailsContainer.appendChild(thumbItem);
            });

            showMediaAtIndex(currentLightboxIndex);
            lightbox.style.display = 'block';
            document.addEventListener('keydown', handleKeydown); // Listen for keys when lightbox is open
        }

        function showNextMedia() {
            currentLightboxIndex = (currentLightboxIndex + 1) % project.imageUrls.length;
            showMediaAtIndex(currentLightboxIndex);
        }

        function showPrevMedia() {
            currentLightboxIndex = (currentLightboxIndex - 1 + project.imageUrls.length) % project.imageUrls.length;
            showMediaAtIndex(currentLightboxIndex);
        }

        function closeLightbox() {
            lightbox.style.display = 'none';
            thumbnailsContainer.innerHTML = ''; // Clean up thumbnails
            document.removeEventListener('keydown', handleKeydown); // Stop listening for keys
        }

        function handleKeydown(e) {
            if (e.key === 'ArrowRight') {
                showNextMedia();
            } else if (e.key === 'ArrowLeft') {
                showPrevMedia();
            } else if (e.key === 'Escape') {
                closeLightbox();
            }
        }

        // Close the lightbox when the close button or the background is clicked
        closeBtn.onclick = closeLightbox;

        // Add event listeners for navigation and closing
        prevBtn.addEventListener('click', showPrevMedia);
        nextBtn.addEventListener('click', showNextMedia);
        lightbox.addEventListener('click', (e) => {
            // Close lightbox only if the click is on the background itself, not its children
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Make the content visible after populating
        if (contentWrapper) {
            contentWrapper.style.display = 'flex';
        }

    } else {
        // If no project is found, display an error message
        const section = document.getElementById('project-detail-section');
        section.innerHTML = `
            <div class="not-found-content" style="text-align: center;">
                <h2 class="not-found-title">404</h2>
                <h2>Project Not Found</h2>
                <p>Sorry, the project you are looking for does not exist or has been moved.</p>
                <a href="index.html#projects" class="btn">Back to Projects</a>
            </div>`;
    }
});