import {
  BorderRadiusConfig,
  ShapePreset,
  ShapeCategory,
} from './borderRadiusTypes';

export const QUICK_RADIUS_VALUES = [
  0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 100,
];

export const SHAPE_CATEGORIES: ShapeCategory[] = [
  'Standard',
  'Cards',
  'Buttons',
  'Modern',
  'Organic',
  'Blobs',
  'Asymmetric',
];

export const SHAPE_PRESETS: ShapePreset[] = [
  // Standard
  {
    id: 'sharp',
    name: 'Sharp Rectangle',
    category: 'Standard',
    description: 'No corner rounding (0px)',
    unit: 'px',
    horizontal: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
  },
  {
    id: 'subtle-rounding',
    name: 'Subtle Rounding',
    category: 'Standard',
    description: 'Very small corner bevel (4px)',
    unit: 'px',
    horizontal: { topLeft: 4, topRight: 4, bottomRight: 4, bottomLeft: 4 },
  },
  {
    id: 'standard-rounded',
    name: 'Standard Rounded',
    category: 'Standard',
    description: 'Universal balanced rounding (12px)',
    unit: 'px',
    horizontal: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 },
  },
  {
    id: 'circle-shape',
    name: 'Perfect Circle',
    category: 'Standard',
    description: 'Uniform 50% circular radius',
    unit: '%',
    horizontal: { topLeft: 50, topRight: 50, bottomRight: 50, bottomLeft: 50 },
  },
  {
    id: 'pill-capsule',
    name: 'Pill / Capsule',
    category: 'Buttons',
    description: 'Full capsule edges (9999px)',
    unit: 'px',
    horizontal: { topLeft: 9999, topRight: 9999, bottomRight: 9999, bottomLeft: 9999 },
  },

  // Cards
  {
    id: 'modern-card',
    name: 'Modern Card',
    category: 'Cards',
    description: 'Sleek contemporary card corners (16px)',
    unit: 'px',
    horizontal: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 },
  },
  {
    id: 'soft-card',
    name: 'Soft Card',
    category: 'Cards',
    description: 'Friendly tactile card surface (24px)',
    unit: 'px',
    horizontal: { topLeft: 24, topRight: 24, bottomRight: 24, bottomLeft: 24 },
  },
  {
    id: 'large-rounded',
    name: 'Large Rounded',
    category: 'Cards',
    description: 'Generously rounded container (32px)',
    unit: 'px',
    horizontal: { topLeft: 32, topRight: 32, bottomRight: 32, bottomLeft: 32 },
  },
  {
    id: 'floating-card',
    name: 'Floating Accent Card',
    category: 'Cards',
    description: 'Subtly asymmetrical container anchor',
    unit: 'px',
    horizontal: { topLeft: 24, topRight: 24, bottomRight: 24, bottomLeft: 6 },
  },

  // Buttons
  {
    id: 'interactive-button',
    name: 'UI Button',
    category: 'Buttons',
    description: 'Crisp action button radius (8px)',
    unit: 'px',
    horizontal: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 },
  },
  {
    id: 'squircle-button',
    name: 'Squircle Button',
    category: 'Buttons',
    description: 'Apple-inspired rounded button (18px)',
    unit: 'px',
    horizontal: { topLeft: 18, topRight: 18, bottomRight: 18, bottomLeft: 18 },
  },

  // Modern UI Components
  {
    id: 'chat-bubble',
    name: 'Chat Bubble',
    category: 'Modern',
    description: 'Speech bubble with tail accent',
    unit: 'px',
    horizontal: { topLeft: 20, topRight: 20, bottomRight: 4, bottomLeft: 20 },
  },
  {
    id: 'folder-tab',
    name: 'Folder Tab',
    category: 'Modern',
    description: 'Top-rounded notebook or browser tab',
    unit: 'px',
    horizontal: { topLeft: 16, topRight: 16, bottomRight: 0, bottomLeft: 0 },
  },
  {
    id: 'shield-badge',
    name: 'Shield Badge',
    category: 'Modern',
    description: 'Coat of arms or shield emblem',
    unit: 'px',
    horizontal: { topLeft: 6, topRight: 6, bottomRight: 80, bottomLeft: 80 },
  },

  // Asymmetric
  {
    id: 'asymmetric-leaf',
    name: 'Nature Leaf',
    category: 'Asymmetric',
    description: 'Diagonal leaf geometry',
    unit: 'px',
    horizontal: { topLeft: 0, topRight: 60, bottomRight: 0, bottomLeft: 60 },
  },
  {
    id: 'diagonal-cut',
    name: 'Diagonal Flow',
    category: 'Asymmetric',
    description: 'Asymmetric dynamic flow',
    unit: 'px',
    horizontal: { topLeft: 40, topRight: 10, bottomRight: 40, bottomLeft: 10 },
  },

  // Blobs & Organics (Elliptical)
  {
    id: 'organic-blob-1',
    name: 'Fluid Blob 1',
    category: 'Blobs',
    description: 'Fluid organic 8-value blob shape',
    isElliptical: true,
    unit: '%',
    horizontal: { topLeft: 60, topRight: 40, bottomRight: 30, bottomLeft: 70 },
    vertical: { topLeft: 50, topRight: 30, bottomRight: 70, bottomLeft: 50 },
  },
  {
    id: 'organic-blob-2',
    name: 'Fluid Blob 2',
    category: 'Blobs',
    description: 'Playful organic liquid blob',
    isElliptical: true,
    unit: '%',
    horizontal: { topLeft: 30, topRight: 70, bottomRight: 70, bottomLeft: 30 },
    vertical: { topLeft: 30, topRight: 30, bottomRight: 70, bottomLeft: 70 },
  },
  {
    id: 'smooth-pebble',
    name: 'Smooth Pebble',
    category: 'Organic',
    description: 'Natural asymmetric river stone',
    isElliptical: true,
    unit: '%',
    horizontal: { topLeft: 40, topRight: 60, bottomRight: 60, bottomLeft: 40 },
    vertical: { topLeft: 60, topRight: 30, bottomRight: 70, bottomLeft: 40 },
  },
  {
    id: 'organic-egg',
    name: 'Organic Egg',
    category: 'Organic',
    description: 'Tapered vertical egg silhouette',
    isElliptical: true,
    unit: '%',
    horizontal: { topLeft: 50, topRight: 50, bottomRight: 50, bottomLeft: 50 },
    vertical: { topLeft: 60, topRight: 60, bottomRight: 40, bottomLeft: 40 },
  },
];

export const DEFAULT_RADIUS_CONFIG: BorderRadiusConfig = {
  name: 'Default Clean Rounded',
  isLinked: true,
  isElliptical: false,
  unit: 'px',
  horizontal: {
    topLeft: 16,
    topRight: 16,
    bottomRight: 16,
    bottomLeft: 16,
  },
  vertical: {
    topLeft: 16,
    topRight: 16,
    bottomRight: 16,
    bottomLeft: 16,
  },
  preview: {
    object: 'card',
    sizePreset: 'medium',
    width: 260,
    height: 180,
    previewBg: '#F5F5F7',
    elementBg: '#5722AF',
    border: {
      enabled: false,
      width: 2,
      style: 'solid',
      color: '#7B45D1',
    },
    showGuides: false,
  },
};
