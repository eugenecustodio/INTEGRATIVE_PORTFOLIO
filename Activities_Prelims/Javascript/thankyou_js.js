
const sliderImages = document.querySelectorAll('#bg-slider img');
let currentSlide = 0;

setInterval(() => {
    sliderImages[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % sliderImages.length;
    sliderImages[currentSlide].classList.add('active');
}, 5000);
