import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

function DraggableGallery() {
    const constraintsRef = useRef(null);
    const x = useMotionValue(0);
    const [isDragging, setIsDragging] = useState(false);
    const [currentX, setCurrentX] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

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

    // Check if mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Card dimensions - PC: 360px for 5 cards, Mobile: calculated for 3 cards
    const getCardWidth = useCallback(() => {
        if (typeof window === 'undefined') return 360;

        if (window.innerWidth < 768) {
            // Mobile: Exact 3 cards visible logic
            // To ensure 4th card doesn't show, card width must be roughly viewport / 2.9
            // viewport = 375 -> card = 129px. Center + 2 partial sides fully fill screen.
            return Math.floor(window.innerWidth / 2.9);
        }
        return 360; // PC
    }, []);

    const [cardWidth, setCardWidth] = useState(getCardWidth());
    const cardGap = isMobile ? 12 : 2; // Increased gap for better mobile separation
    const totalCardWidth = cardWidth + cardGap;
    const oneSetWidth = itemCount * totalCardWidth;

    // Update card width on resize
    useEffect(() => {
        const handleResize = () => {
            setCardWidth(getCardWidth());
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [getCardWidth]);

    // Center offset calculation - same formula for both mobile and PC
    // This positions the active card's center at the screen center
    const getCenterOffset = useCallback(() => {
        if (typeof window === 'undefined') return 0;
        return window.innerWidth / 2 - cardWidth / 2;
    }, [cardWidth]);

    // Start position (middle set, first card centered)
    const getStartOffset = useCallback(() => {
        return -(itemCount * totalCardWidth) + getCenterOffset();
    }, [itemCount, totalCardWidth, getCenterOffset]);

    // Initialize position
    useEffect(() => {
        const startOffset = getStartOffset();
        x.set(startOffset);
        setCurrentX(startOffset);
    }, [cardWidth, getStartOffset, x, cardGap]); // Added cardGap dependency

    // Infinite loop boundary check
    const checkBounds = useCallback(() => {
        const currentPos = x.get();
        const centerOffset = getCenterOffset();
        const setWidth = itemCount * totalCardWidth;

        // Calculate current index
        const currentIndex = Math.round((centerOffset - currentPos) / totalCardWidth);

        // Keep in middle set (indices 8-15)
        if (currentIndex < 4) {
            x.set(currentPos - setWidth);
        } else if (currentIndex > itemCount * 2 + 3) {
            x.set(currentPos + setWidth);
        }
    }, [x, getCenterOffset, itemCount, totalCardWidth]);

    // Track position changes
    useEffect(() => {
        const unsubscribe = x.on('change', (latest) => {
            setCurrentX(latest);
        });
        return () => unsubscribe();
    }, [x]);

    // Snap to specific index with smooth animation
    const snapToIndex = useCallback((targetIndex) => {
        const centerOffset = getCenterOffset();
        const clampedIndex = Math.max(0, Math.min(targetIndex, itemCount * 3 - 1));
        const snapX = centerOffset - clampedIndex * totalCardWidth;

        animate(x, snapX, {
            type: 'spring',
            stiffness: 400,
            damping: 35,
            onComplete: checkBounds
        });
    }, [getCenterOffset, itemCount, totalCardWidth, x, checkBounds]);

    // Handle drag end - snap to nearest card
    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        const currentXValue = x.get();
        const velocity = x.getVelocity();
        const centerOffset = getCenterOffset();

        // Find closest card index
        const closestIndex = Math.round((centerOffset - currentXValue) / totalCardWidth);
        let targetIndex = closestIndex;

        // Velocity-based swipe detection (easier on mobile)
        const swipeThreshold = isMobile ? 300 : 500;

        if (velocity < -swipeThreshold) {
            // Swipe left = next card
            targetIndex = closestIndex + 1;
        } else if (velocity > swipeThreshold) {
            // Swipe right = previous card
            targetIndex = closestIndex - 1;
        }

        snapToIndex(targetIndex);
    }, [x, getCenterOffset, totalCardWidth, isMobile, snapToIndex]);

    // Handle card tap
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
                    style={{ x, gap: `${cardGap}px` }} // Dynamic gap sync
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
                            isMobile={isMobile}
                            onCardClick={() => handleCardClick(index)}
                        />
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

function GalleryCard({ item, index, currentX, totalCardWidth, cardWidth, isDragging, isMobile, onCardClick }) {
    const screenCenter = typeof window !== 'undefined' ? window.innerWidth / 2 : 500;

    // Calculate card's current center position on screen
    const cardCenterOnScreen = currentX + (index * totalCardWidth) + (cardWidth / 2);

    // Distance from screen center (normalized by card width)
    const distanceFromCenter = Math.abs(cardCenterOnScreen - screenCenter);
    const normalizedDistance = distanceFromCenter / totalCardWidth;

    // === SCALE LOGIC (same as PC) ===
    // PC: 0.1 multiplier, max 0.22 reduction
    // Result: center=1.0, 1st neighbor=0.9, 2nd neighbor=0.8, etc.
    const scaleReduction = Math.min(normalizedDistance * 0.1, 0.22);
    const scale = 1 - scaleReduction;

    // === OPACITY LOGIC (same as PC) ===
    // PC: 0.15 multiplier, max 0.4 reduction
    const opacityReduction = Math.min(normalizedDistance * 0.15, 0.4);
    const opacity = 1 - opacityReduction;

    // Z-index - center card on top
    const zIndex = Math.max(1, Math.round(10 - normalizedDistance));

    // Card height - maintain aspect ratio
    const cardHeight = isMobile ? cardWidth * 1.4 : 480;

    return (
        <motion.div
            className="gallery__card"
            animate={{
                scale: scale,
                opacity: opacity,
            }}
            transition={{
                duration: isDragging ? 0.05 : 0.3,
                ease: 'easeOut',
            }}
            style={{
                zIndex,
                width: cardWidth,
                height: cardHeight,
            }}
            onTap={onCardClick}
            whileTap={{ scale: scale * 0.98 }}
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
