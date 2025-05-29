const sliderImages = document.querySelectorAll('#bg-slider img');
let currentSlide = 0;

setInterval(() => {
    sliderImages[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % sliderImages.length;
    sliderImages[currentSlide].classList.add('active');
}, 5000);

document.querySelectorAll('.category-nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        document.querySelector(targetId).scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        document.querySelectorAll('.category-nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});