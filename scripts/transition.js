document.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", function(e) {
        const href = this.getAttribute("href");

        if (href && 
            !href.startsWith("#") && 
            !href.startsWith("mailto:") && 
            !href.startsWith("https://mail.google.com")) {

            e.preventDefault();
            document.body.classList.add("fade-out");

            setTimeout(() => {
                window.location = href;
            }, 400);
        }
    });
});

const faders = document.querySelectorAll('.fade-in');
window.addEventListener('scroll', () => {
  faders.forEach(fader => {
    const top = fader.getBoundingClientRect().top;
    const trigger = window.innerHeight - 100;
    if(top < trigger) fader.classList.add('show');
  });
});