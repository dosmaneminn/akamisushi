function About() {
    return (
        <section id="about" className="about">
            <div className="container">
                <div className="about__grid">
                    {/* Image Side */}
                    <div className="about__image-wrapper">
                        <div className="about__image">
                            <img src="/images/about-bg.jpg" alt="Akami Sushi Hakkımızda" className="about__image-img" />
                        </div>
                        <div className="about__image-accent"></div>
                    </div>

                    {/* Content Side */}
                    <div className="about__content">
                        <span className="about__label">Hakkımızda</span>
                        <h2 className="about__title">
                            Sanatın<br />
                            <span className="accent-text">Lezzete Dönüşü</span>
                        </h2>
                        <p className="about__text">
                            Akami Sushi, geleneksel Japon sushi sanatını modern ve yaratıcı
                            bir yaklaşımla sunan, Muğla'nın kalbinde yer alan benzersiz bir
                            gastronomi deneyimidir.
                        </p>
                        <p className="about__text">
                            Her tabağımız, sadece bir yemek değil, aynı zamanda görsel bir
                            şölendir. Minyatür sanat eserleriyle süslenen sunumlarımız,
                            yemek yeme deneyiminizi unutulmaz kılar.
                        </p>
                        <div className="about__features">
                            <div className="about__feature">
                                <span className="about__feature-number">01</span>
                                <div>
                                    <h4>Taze Malzemeler</h4>
                                    <p>Her gün taze tedarik edilen premium kalite balıklar</p>
                                </div>
                            </div>
                            <div className="about__feature">
                                <span className="about__feature-number">02</span>
                                <div>
                                    <h4>Sanatsal Sunum</h4>
                                    <p>Minyatür figürlerle zenginleştirilmiş özgün tasarımlar</p>
                                </div>
                            </div>
                            <div className="about__feature">
                                <span className="about__feature-number">03</span>
                                <div>
                                    <h4>Premium Deneyim</h4>
                                    <p>Rahat atmosfer ve özenli servis anlayışı</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default About;
