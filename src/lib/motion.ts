/**
 * SENPAI.TV - Cinematic Motion System
 * Premium animation presets and utilities for Framer Motion
 */

export const MOTION = {
  // Transition presets
  transitions: {
    default: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    fast: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
    slow: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    slowSlow: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
    cinematic: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
    bounce: { duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] },
    elastic: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
  },

  // Variant presets
  variants: {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    fadeInUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    },
    fadeInDown: {
      hidden: { opacity: 0, y: -20 },
      visible: { opacity: 1, y: 0 },
    },
    fadeInLeft: {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 },
    },
    fadeInRight: {
      hidden: { opacity: 0, x: 20 },
      visible: { opacity: 1, x: 0 },
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1 },
    },
    scaleInRotate: {
      hidden: { opacity: 0, scale: 0.8, rotate: -10 },
      visible: { opacity: 1, scale: 1, rotate: 0 },
    },
    slideInLeft: {
      hidden: { opacity: 0, x: -40 },
      visible: { opacity: 1, x: 0 },
    },
    slideInRight: {
      hidden: { opacity: 0, x: 40 },
      visible: { opacity: 1, x: 0 },
    },
    blur: {
      hidden: { filter: 'blur(10px)', opacity: 0 },
      visible: { filter: 'blur(0px)', opacity: 1 },
    },
  },

  // Container animations
  containerVariants: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },

  itemVariants: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
  },

  // Hover effects
  hoverScale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { duration: 0.2 },
  },

  hoverLift: {
    whileHover: { y: -10, boxShadow: '0 20px 50px rgba(161, 107, 255, 0.3)' },
    transition: { duration: 0.3 },
  },

  hoverGlow: {
    whileHover: {
      boxShadow: '0 0 30px rgba(161, 107, 255, 0.5)',
    },
    transition: { duration: 0.3 },
  },

  // Scroll triggers
  scrollInView: {
    initial: 'hidden',
    whileInView: 'visible',
    viewport: { once: true, amount: 0.3 },
  },
};

// Stagger configuration for lists
export const staggerConfig = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
};

// Parallax effect hook configuration
export const parallaxConfig = {
  light: { initial: 0, whileInView: -30, transition: { duration: 0.8 } },
  medium: { initial: 0, whileInView: -50, transition: { duration: 0.8 } },
  heavy: { initial: 0, whileInView: -100, transition: { duration: 0.8 } },
};
