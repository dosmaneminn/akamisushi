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

    // Update position and handle boundary reset during drag
    useEffect(() => {
        const unsubscribe = x.on('change', (latest) => {
            setCurrentX(latest);

            // Real-time boundary checking during drag for seamless looping
            if (isDragging) {
                const centerOffset = getCenterOffset();
                const leftBound = centerOffset - 2.5 * oneSetWidth;
                const rightBound = centerOffset + 0.5 * oneSetWidth;

                if (latest < leftBound) {
                    x.set(latest + oneSetWidth);
                } else if (latest > rightBound) {
                    x.set(latest - oneSetWidth);
                }
            }
        });
        return () => unsubscribe();
    }, [x, isDragging, getCenterOffset, oneSetWidth]);

    // Handle drag end - snap to nearest card with velocity/swipe support
    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        const currentXValue = x.get();
        const velocity = x.getVelocity();
        const centerOffset = getCenterOffset();

        // Calculate which card we're currently closest to
        const closestIndex = Math.round((centerOffset - currentXValue) / totalCardWidth);

        // Determine target index based on swipe velocity
        let targetIndex = closestIndex;

        // Swipe threshold (pixels per second)
        const swipeThreshold = 500;

        if (velocity < -swipeThreshold) {
            // Strong swipe left -> go to next card
            targetIndex = Math.ceil((centerOffset - currentXValue) / totalCardWidth);
        } else if (velocity > swipeThreshold) {
            // Strong swipe right -> go to previous card
            targetIndex = Math.floor((centerOffset - currentXValue) / totalCardWidth);
        }

        // Clamp target index to valid range for infinite loop logic (middle set focus)
        // We allow snapping slightly outside but reset immediately after
        const validIndex = Math.max(0, Math.min(targetIndex, itemCount * 3 - 1));
        let snapX = centerOffset - validIndex * totalCardWidth;

        const transition = {
            type: 'spring',
            stiffness: 300,
            damping: 30,
            onComplete: () => {
                // Seamless infinite loop reset
                const currentPos = x.get();
                // Boundaries for the middle set
                const leftBoundary = centerOffset - (itemCount * 2 - 0.5) * totalCardWidth; // Roughly end of middle set
                const rightBoundary = centerOffset - (itemCount * 1 - 0.5) * totalCardWidth; // Roughly start of middle set

                // Check if we need to jump sets
                if (currentPos > rightBoundary) {
                    // We are in the left set (positions are more positive)
                    // Jump to the equivalent position in the middle set
                    x.set(currentPos - oneSetWidth);
                } else if (currentPos < leftBoundary) {
                    // We are in the right set (positions are more negative)
                    // Jump to the equivalent position in the middle set
                    x.set(currentPos + oneSetWidth);
                }
            }
        };

        // Animate to snap position
        animate(x, snapX, transition);
    }, [x, getCenterOffset, totalCardWidth, itemCount, oneSetWidth]);

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

    // Scale based on distance from center - center card is always biggest
    // Progressive scale reduction - more aggressive on mobile for "pop" effect
    // If distance is 0 (center), scale is 1. If distance is 1 width away, scale drops significantly.
    const scaleReduction = Math.min(normalizedDistance * 0.2, 0.3);
    const scale = 1 - scaleReduction;

    // Opacity reduction for non-center cards
    const opacityReduction = Math.min(normalizedDistance * 0.3, 0.5);
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
