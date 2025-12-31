import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

function DraggableGallery() {
    const constraintsRef = useRef(null);
    const x = useMotionValue(0);
    const [isDragging, setIsDragging] = useState(false);
    const [currentX, setCurrentX] = useState(0);

    // Original items
    const originalItems = [
        { id: 1, title: 'Sashimi Selection' },
        { id: 2, title: 'Nigiri Art' },
        { id: 3, title: 'Maki Rolls' },
        { id: 4, title: 'Chef Special' },
        { id: 5, title: 'Omakase' },
        { id: 6, title: 'Tuna Tataki' },
        { id: 7, title: 'Dragon Roll' },
        { id: 8, title: 'Sake Selection' },
    ];

    // Create infinite loop by tripling the items
    const galleryItems = [...originalItems, ...originalItems, ...originalItems];
    const itemCount = originalItems.length;

    // BIGGER cards, minimal gap
    const cardWidth = 360;
    const cardGap = 2;
    const totalCardWidth = cardWidth + cardGap;

    // Starting position (middle set, centered)
    const getStartOffset = () => {
        if (typeof window !== 'undefined') {
            return -(itemCount * totalCardWidth) + (window.innerWidth / 2 - cardWidth / 2);
        }
        return -(itemCount * totalCardWidth);
    };

    // Initialize position
    useEffect(() => {
        const startOffset = getStartOffset();
        x.set(startOffset);
        setCurrentX(startOffset);
    }, []);

    // Update position
    useEffect(() => {
        const unsubscribe = x.on('change', (latest) => {
            setCurrentX(latest);
        });
        return () => unsubscribe();
    }, [x]);

    // Handle drag end - snap and loop infinitely
    const handleDragEnd = () => {
        setIsDragging(false);
        const currentXValue = x.get();
        const centerOffset = typeof window !== 'undefined' ? window.innerWidth / 2 - cardWidth / 2 : 0;

        // Calculate which card we're closest to
        const targetIndex = Math.round((centerOffset - currentXValue) / totalCardWidth);
        let snapX = centerOffset - targetIndex * totalCardWidth;

        // Animate to snap position
        animate(x, snapX, {
            type: 'spring',
            stiffness: 300,
            damping: 30,
            onComplete: () => {
                // Reset position for infinite loop
                const currentPos = x.get();
                const oneSetWidth = itemCount * totalCardWidth;
                const centerOfMiddleSet = centerOffset - itemCount * totalCardWidth;

                if (currentPos > centerOffset) {
                    // Too far right - jump back
                    x.set(currentPos - oneSetWidth);
                } else if (currentPos < centerOffset - 2 * oneSetWidth) {
                    // Too far left - jump forward
                    x.set(currentPos + oneSetWidth);
                }
            }
        });
    };

    return (
        <section id="gallery" className="gallery">
            <div className="gallery__wrapper" ref={constraintsRef}>
                <motion.div
                    className="gallery__track"
                    style={{ x }}
                    drag="x"
                    dragConstraints={{ left: -Infinity, right: Infinity }}
                    dragElastic={0.1}
                    dragTransition={{ bounceStiffness: 400, bounceDamping: 40 }}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={handleDragEnd}
                    whileTap={{ cursor: 'grabbing' }}
                >
                    {galleryItems.map((item, index) => (
                        <GalleryCard
                            key={`${item.id}-${index}`}
                            item={item}
                            index={index}
                            currentX={currentX}
                            totalCardWidth={totalCardWidth}
                            cardWidth={cardWidth}
                            isDragging={isDragging}
                        />
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

function GalleryCard({ item, index, currentX, totalCardWidth, cardWidth, isDragging }) {
    // Calculate screen center
    const screenCenter = typeof window !== 'undefined' ? window.innerWidth / 2 : 500;

    // Calculate card's current position on screen
    const cardPositionOnScreen = currentX + (index * totalCardWidth) + (cardWidth / 2);

    // Distance from screen center
    const distanceFromCenter = Math.abs(cardPositionOnScreen - screenCenter);
    const normalizedDistance = distanceFromCenter / totalCardWidth;

    // When dragging: all cards same size
    // When not dragging: scale based on distance from center
    let scale = 1;
    let opacity = 1;
    let zIndex = 1;

    if (!isDragging) {
        // Progressive scale reduction
        const scaleReduction = Math.min(normalizedDistance * 0.1, 0.22);
        scale = 1 - scaleReduction;

        // Opacity reduction
        const opacityReduction = Math.min(normalizedDistance * 0.15, 0.4);
        opacity = 1 - opacityReduction;

        // Z-index
        zIndex = Math.max(1, Math.round(10 - normalizedDistance));
    }

    return (
        <motion.div
            className="gallery__card"
            animate={{
                scale: scale,
                opacity: opacity,
            }}
            transition={{
                duration: isDragging ? 0.1 : 0.35,
                ease: 'easeOut',
            }}
            style={{ zIndex }}
        >
            <div className="gallery__card-image">
                <img
                    src={`/images/gallery-${item.id}.jpg`}
                    alt={item.title}
                    className="gallery__image"
                    draggable={false}
                />
            </div>

        </motion.div>
    );
}

export default DraggableGallery;
