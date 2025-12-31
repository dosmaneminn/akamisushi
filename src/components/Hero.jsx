function Hero() {
    return (
        <section id="hero" className="hero">
            {/* Background Image */}
            <div className="hero__background">
                <img src="/images/hero-bg.png" alt="Akami Sushi" className="hero__bg-image" />
                <div className="hero__overlay"></div>
            </div>

            {/* Content */}
            <div className="hero__content">
                <img src="/images/logo-yazısız.png" alt="Akami Sushi Logo" className="hero__center-logo fade-in-up" />
                <p className="hero__slogan fade-in-up">
                    Uzak Doğu'nun sanatı, Muğla'nın kalbinde.
                </p>
                <div className="hero__buttons fade-in-up">
                    <a href="#gallery" className="btn btn-primary">Galeriyi Keşfet</a>
                    <a href="#contact" className="btn btn-outline btn-outline--light">Rezervasyon</a>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="hero__scroll-indicator">
                <span>Kaydır</span>
                <div className="hero__scroll-line"></div>
            </div>
        </section>
    );
}

export default Hero;
