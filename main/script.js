// ===== VARIABLES GLOBALES =====
let currentSection = 'home';
let isMouseOverClock = false;

// Positions des sections (angles en degrés)
const sectionAngles = {
    'home': 0, 
    'about': 90, 
    'projects': 180,
    'skills': 270,
    'contact': 45
};

// DOM Elements
const clockHand = document.getElementById('clockHand');
const menuSections = document.querySelectorAll('.menu-section');
const contentSections = document.querySelectorAll('section');
const clock = document.querySelector('.interactive-clock');
const navbar = document.querySelector('.navbar');
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const contactForm = document.querySelector('.contact-form');

// ===== FONCTIONS UTILITAIRES =====

/**
 * Affiche la modale personnalisée.
 * @param {string} title - Le titre de la modale.
 * @param {string} message - Le message à afficher dans la modale.
 */
function showModal(title, message) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalOverlay.style.display = 'flex';
}

/**
 * Masque la modale personnalisée.
 */
function hideModal() {
    modalOverlay.style.display = 'none';
}

/**
 * Calcule l'angle entre un centre et un point.
 * @param {number} centerX - Coordonnée X du centre.
 * @param {number} centerY - Coordonnée Y du centre.
 * @param {number} mouseX - Coordonnée X du point.
 * @param {number} mouseY - Coordonnée Y du point.
 * @returns {number} L'angle en degrés.
 */
function calculateAngle(centerX, centerY, mouseX, mouseY) {
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;
    let angle = Math.atan2(deltaX, deltaY) * (180 / Math.PI);
    angle = (angle + 90) % 360;
    if (angle < 0) angle += 360;
    return angle;
}

/**
 * Trouve la section la plus proche d'un angle donné.
 * @param {number} angle - L'angle en degrés.
 * @returns {string} L'ID de la section la plus proche.
 */
function findNearestSection(angle) {
    let nearestSection = 'home';
    let minDistance = Infinity;

    for (const [section, sectionAngle] of Object.entries(sectionAngles)) {
        let distance = Math.abs(angle - sectionAngle);
        if (distance > 180) distance = 360 - distance;
        
        if (distance < minDistance) {
            minDistance = distance;
            nearestSection = section;
        }
    }
    return nearestSection;
}

/**
 * Met à jour la position de l'aiguille de l'horloge et l'état des sections du menu.
 * @param {string} section - L'ID de la section active.
 */
function updateClockHand(section) {
    const angle = sectionAngles[section];
    if (clockHand) {
        clockHand.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
    }
    
    if (menuSections) {
        menuSections.forEach(menuSection => {
            if (menuSection.dataset.section === section) {
                menuSection.classList.add('active');
            } else {
                menuSection.classList.remove('active');
            }
        });
    }
    currentSection = section;
}

/**
 * Fait défiler la page vers une section donnée.
 * @param {string} sectionId - L'ID de la section cible.
 */
function scrollToSection(sectionId) {
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start' 
        });
    }
}

/**
 * Détecte la section visible à l'écran et met à jour l'horloge.
 */
function updateActiveSectionOnScroll() {
    if (!contentSections) return;
    
    const scrollPosition = window.scrollY + 200;

    contentSections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            if (sectionId && sectionId !== currentSection && !isMouseOverClock) {
                currentSection = sectionId;
                updateClockHand(sectionId);
            }
        }
    });
}

/**
 * Gère les animations d'apparition au scroll.
 */
function setupScrollAnimations() {
    const observerOptions = {
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                // Optionnel: enlever la classe quand l'élément n'est plus visible
                // entry.target.classList.remove('is-visible');
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// ===== INITIALISATION ET ÉVÉNEMENTS =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialisation de l'horloge
    updateClockHand('home');
    
    // Événements pour l'horloge
    if (clock) {
        clock.addEventListener('mouseenter', () => isMouseOverClock = true);
        clock.addEventListener('mouseleave', () => {
            isMouseOverClock = false;
            updateClockHand(currentSection);
        });
        clock.addEventListener('mousemove', (e) => {
            if (!isMouseOverClock) return;
            const rect = clock.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const mouseAngle = calculateAngle(centerX, centerY, e.clientX, e.clientY);
            const nearestSection = findNearestSection(mouseAngle);
            updateClockHand(nearestSection);
        });
    }
    
    // Événements pour les sections du menu
    if (menuSections) {
        menuSections.forEach(menuSection => {
            menuSection.addEventListener('click', (e) => {
                e.preventDefault();
                const section = menuSection.dataset.section;
                updateClockHand(section);
                scrollToSection(section);
            });
            menuSection.addEventListener('mouseenter', () => {
                if (!isMouseOverClock) return;
                const section = menuSection.dataset.section;
                updateClockHand(section);
            });
        });
    }
    
    // Événements de scroll
    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
        updateActiveSectionOnScroll();
    });

    // Gérer le formulaire de contact
    if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const inputs = contactForm.querySelectorAll('input, textarea');
        const name = inputs[0].value;
        const email = inputs[1].value;
        const subject = inputs[2].value;
        const message = inputs[3].value;

        if (!name || !email || !subject || !message) {
            showModal('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        emailjs.init("uyMIXcMMk2VTF0Wcz");
        
        emailjs.send("service_txm627b", "template_0yrg3vi", {
            from_name: name,
            from_email: email,
            subject: subject,
            message: message
        }).then(() => {
            showModal('Message envoyé !', `Merci ${name}, votre message a été envoyé avec succès.`);
            contactForm.reset();
        }).catch(() => {
            showModal('Erreur', 'Erreur lors de l\'envoi. Veuillez réessayer.');
        });
    });
}
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = contactForm.querySelector('input[name="name"]').value;
        const email = contactForm.querySelector('input[name="email"]').value;
        const subject = contactForm.querySelector('input[name="subject"]').value;
        const message = contactForm.querySelector('textarea[name="message"]').value;

        console.log('Données du formulaire:', { name, email, subject, message });

        if (!name || !email || !subject || !message) {
            showModal('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        emailjs.send("service_txm627b", "template_0yrg3vi", {
            from_name: name,
            from_email: email,
            subject: subject,
            message: message
        }).then((response) => {
            console.log('SUCCESS!', response.status, response.text);
            showModal('Message envoyé !', `Merci ${name}, votre message a été envoyé avec succès.`);
            contactForm.reset();
        }).catch((error) => {
            console.log('FAILED...', error);
            showModal('Erreur', 'Erreur lors de l\'envoi. Veuillez réessayer.');
        });
    });
}
    
    // Gérer la modale
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', hideModal);
    }
    
    // Gérer les liens d'ancrage pour le smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Lancer les animations
    setupScrollAnimations();
});