import { useRef, useState, useEffect, useCallback } from 'react';
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

    // Responsive card sizing for mobile - 3 cards visible on mobile
    const getCardWidth = () => {
        if (typeof window !== 'undefined') {
            // Mobile: ~100px cards for 3 visible, Desktop: 360px
            return window.innerWidth < 768 ? Math.floor(window.innerWidth / 3.2) : 360;
        }
        return 360;
    };

    const [cardWidth, setCardWidth] = useState(getCardWidth());
    const cardGap = 2;
    const totalCardWidth = cardWidth + cardGap;
    const oneSetWidth = itemCount * totalCardWidth;

    // Update card width on resize
    useEffect(() => {
        const handleResize = () => {
            setCardWidth(getCardWidth());
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Starting position (middle set, centered)
    const getCenterOffset = useCallback(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth / 2 - cardWidth / 2;
        }
        return 0;
    }, [cardWidth]);

    const getStartOffset = useCallback(() => {
        return -(itemCount * totalCardWidth) + getCenterOffset();
    }, [itemCount, totalCardWidth, getCenterOffset]);

    // Initialize position
    useEffect(() => {
        const startOffset = getStartOffset();
        x.set(startOffset);
        setCurrentX(startOffset);
    }, [cardWidth]);

    // Check bounds and reset for infinite loop
    const checkBounds = useCallback(() => {
        const currentPos = x.get();
        const centerOffset = getCenterOffset();
        const oneSetWidth = itemCount * totalCardWidth;

        // Calculate current virtual index
        const currentIndex = (centerOffset - currentPos) / totalCardWidth;

        // Thresholds to jump sets (keep roughly in the middle set: index 8 to 15)
        // If we go below index 4 (too far into start), jump forward
        if (currentIndex < 4) {
            x.set(currentPos - oneSetWidth); // Move physically left (index increases)
        }
        // If we go above index 19 (too far into end), jump backward
        else if (currentIndex > itemCount * 2 + 3) {
            x.set(currentPos + oneSetWidth); // Move physically right (index decreases)
        }
    }, [x, getCenterOffset, itemCount, totalCardWidth]);

    // Update position and handle boundary reset
    useEffect(() => {
        const unsubscribe = x.on('change', (latest) => {
            setCurrentX(latest);
            if (!isDragging) {
                checkBounds();
            }
        });
        return () => unsubscribe();
    }, [x, isDragging, checkBounds]);

    // Snap to a specific index
    const snapToIndex = useCallback((targetIndex) => {
        const centerOffset = getCenterOffset();

        // Clamp target index to valid range
        const validIndex = Math.max(0, Math.min(targetIndex, itemCount * 3 - 1));
        const snapX = centerOffset - validIndex * totalCardWidth;

        animate(x, snapX, {
            type: 'spring',
            stiffness: 300,
            damping: 30,
            onComplete: checkBounds
        });
    }, [getCenterOffset, itemCount, totalCardWidth, x, checkBounds]);

    // Handle drag end - snap to nearest card with velocity/swipe support
    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        const currentXValue = x.get();
        const velocity = x.getVelocity();
        const centerOffset = getCenterOffset();

        const closestIndex = Math.round((centerOffset - currentXValue) / totalCardWidth);
        let targetIndex = closestIndex;

        const swipeThreshold = 500;
        if (velocity < -swipeThreshold) {
            targetIndex = closestIndex + 1;
        } else if (velocity > swipeThreshold) {
            targetIndex = closestIndex - 1;
        }

        snapToIndex(targetIndex);
    }, [x, getCenterOffset, totalCardWidth, snapToIndex]);

    // Handle tapping a card
    const handleCardClick = useCallback((index) => {
        if (!isDragging) {
            snapToIndex(index);
        }
    }, [isDragging, snapToIndex]);

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
                            onCardClick={() => handleCardClick(index)}
                        />
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

function GalleryCard({ item, index, currentX, totalCardWidth, cardWidth, isDragging, onCardClick }) {
    // Calculate screen center
    const screenCenter = typeof window !== 'undefined' ? window.innerWidth / 2 : 500;

    // Calculate card's current position on screen
    const cardPositionOnScreen = currentX + (index * totalCardWidth) + (cardWidth / 2);

    // Distance from screen center
    const distanceFromCenter = Math.abs(cardPositionOnScreen - screenCenter);
    const normalizedDistance = distanceFromCenter / totalCardWidth;

    // Scale based on distance from center - center card is always biggest
    // Progressive scale reduction - matching PC logic
    const scaleReduction = Math.min(normalizedDistance * 0.1, 0.22);
    const scale = 1 - scaleReduction;

    // Opacity reduction for non-center cards
    const opacityReduction = Math.min(normalizedDistance * 0.15, 0.4);
    const opacity = 1 - opacityReduction;

    // Z-index - center card on top
    const zIndex = Math.max(1, Math.round(10 - normalizedDistance));

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
            onTap={onCardClick}
            whileTap={{ scale: 0.98 }}
        >
            <div className="gallery__card-image">
                <img
                    src={`/images/gallery-${item.id}.jpg`}
                    alt={item.title}
                    className="gallery__image"
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                />
            </div>

        </motion.div>
    );
}

export default DraggableGallery;
