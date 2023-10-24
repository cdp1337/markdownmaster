let interval = null;

function startBackgroundSlides(selector) {
    selector = selector || '.page-backgrounds';

    if(interval) {
        clearInterval(interval);
    }

    let i = 0,
        container = document.querySelector(selector),
        slides, timeoutTime;

    if(!container) {
        // No container, no slides
        return;
    }
    timeoutTime = container.getAttribute('data-timeout') || 10000;
    slides = container.querySelectorAll('img');

    if(slides.length >= 1) {
        // At least one image, mark the first as active and clear any previous timeout
        slides[0].classList.add('active');
    }

    if(slides.length > 1) {
        // More than one image, start the slider
        interval = setInterval(() => {
            slides[i].classList.remove('active');
            i++;
            if(i >= slides.length) {
                i = 0;
            }
            slides[i].classList.add('active');
        }, timeoutTime);
    }
}
