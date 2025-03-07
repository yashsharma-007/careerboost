// Wait for the DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize GSAP animations
    initGSAPAnimations();
    
    // Initialize Three.js
    initThreeJS();
    
    // Add animated icons to features
    addAnimatedIcons();
    
    // Initialize parallax scrolling
    initParallaxScrolling();
    
    // Animate features on scroll
    animateFeaturesOnScroll();
  });
  
  // Function to initialize GSAP animations
  function initGSAPAnimations() {
    // Page load animations
    gsap.from('header', {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });
    
    // Logo animation
    gsap.to('.logo', {
        duration: 2,
        textShadow: '0 0 10px rgba(66, 133, 244, 0.7)',
        repeat: -1,
        yoyo: true
    });
    
    // Button hover animations
    const buttons = document.querySelectorAll('.signin-btn, .signup-btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            gsap.to(button, {
                scale: 1.05,
                duration: 0.3
            });
        });
        
        button.addEventListener('mouseleave', () => {
            gsap.to(button, {
                scale: 1,
                duration: 0.3
            });
        });
    });
  }
  
  // Function to initialize Three.js
  function initThreeJS() {
    const canvas = document.getElementById('3dCanvas');
    
    // Create scene
    const scene = new THREE.Scene();
    canvas.__scene = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Create material
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        color: 0x4285f4
    });
    
    // Create mesh
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        particlesMesh.rotation.x += 0.001;
        particlesMesh.rotation.y += 0.001;
        
        // Respond to mouse movement
        document.addEventListener('mousemove', (event) => {
            const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
            
            particlesMesh.rotation.x += mouseY * 0.0003;
            particlesMesh.rotation.y += mouseX * 0.0003;
        });
        
        renderer.render(scene, camera);
    }
    
    animate();
  }
  
  // Function to add animated icons to features
  function addAnimatedIcons() {
    const icons = ['💼', '🎓', '📝', '🤖', '🌐', '💬'];
    const features = document.querySelectorAll('.feature');
    
    features.forEach((feature, index) => {
        const iconSpan = document.createElement('span');
        iconSpan.className = 'animated-icon';
        iconSpan.textContent = icons[index % icons.length] + ' ';
        
        // Insert the icon at the beginning of the feature text
        feature.insertBefore(iconSpan, feature.firstChild);
        
        // Add hover animation
        feature.addEventListener('mouseenter', () => {
            iconSpan.classList.add('rotate-icon');
        });
        
        feature.addEventListener('mouseleave', () => {
            iconSpan.classList.remove('rotate-icon');
        });
    });
  }
  
  // Function to initialize parallax scrolling
  function initParallaxScrolling() {
    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;
        
        // Parallax effect for hero section
        const hero = document.querySelector('.hero');
        hero.style.backgroundPositionY = scrollPosition * 0.5 + 'px';
        
        // Rotate 3D particles based on scroll
        if (typeof scene !== 'undefined' && scene.children.length > 0) {
            const particlesMesh = scene.children[0];
            particlesMesh.rotation.y = scrollPosition * 0.001;
        }
    });
  }
  
  // Function to animate features on scroll
  function animateFeaturesOnScroll() {
    const features = document.querySelectorAll('.feature');
    
    // Create an Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                gsap.to(entry.target, {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.2
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    // Observe each feature
    features.forEach(feature => {
        observer.observe(feature);
    });
  }