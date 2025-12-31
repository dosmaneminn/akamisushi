import { useState, useEffect } from 'react';

function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { href: '#hero', label: 'Ana Sayfa' },
        { href: '#gallery', label: 'Galeri' },
        { href: '#about', label: 'Hakkımızda' },
        { href: '#contact', label: 'İletişim' },
    ];

    return (
        <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
            <div className="header__container">
                {/* Left Navigation */}
                <nav className="header__nav header__nav--left">
                    {navLinks.slice(0, 2).map((link) => (
                        <a key={link.href} href={link.href} className="header__link">
                            {link.label}
                        </a>
                    ))}
                </nav>

                {/* Logo */}
                {/* Logo */}
                <a href="#hero" className="header__logo">
                    <img src="/images/logo.png" alt="Akami Sushi" className="header__logo-img" />
                </a>

                {/* Right Navigation */}
                <nav className="header__nav header__nav--right">
                    {navLinks.slice(2).map((link) => (
                        <a key={link.href} href={link.href} className="header__link">
                            {link.label}
                        </a>
                    ))}
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className={`header__mobile-btn ${isMobileMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Menü"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`header__mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
                {navLinks.map((link) => (
                    <a
                        key={link.href}
                        href={link.href}
                        className="header__mobile-link"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {link.label}
                    </a>
                ))}
            </div>
        </header>
    );
}

export default Header;
