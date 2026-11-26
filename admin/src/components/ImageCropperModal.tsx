import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Crop, Check, X, RotateCcw, Sparkles, Move, Maximize2, Loader2, Scissors } from 'lucide-react';
import { adminApi } from '../api';

export interface CropRect {
  x: number;      // percentage (0 - 100)
  y: number;      // percentage (0 - 100)
  width: number;  // percentage (0 - 100)
  height: number; // percentage (0 - 100)
}

interface ImageCropperModalProps {
  imageUrl: string;
  title?: string;
  onClose: () => void;
  onCropComplete: (croppedUrl: string) => void;
}

type AspectRatioMode = 'free' | '1:1' | '4:3' | '16:9';

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  imageUrl,
  title = 'Crop Product Image',
  onClose,
  onCropComplete
}) => {
  const [aspectMode, setAspectMode] = useState<AspectRatioMode>('free');
  const [crop, setCrop] = useState<CropRect>({ x: 5, y: 5, width: 90, height: 90 });
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Drag interaction state
  const dragRef = useRef<{
    isDragging: boolean;
    dragType: 'move' | 'create' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e' | null;
    startX: number;
    startY: number;
    initialCrop: CropRect;
  }>({
    isDragging: false,
    dragType: null,
    startX: 0,
    startY: 0,
    initialCrop: { x: 5, y: 5, width: 90, height: 90 }
  });

  // Load natural dimensions of the image
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const w = img.naturalWidth || 800;
    const h = img.naturalHeight || 800;
    setNaturalSize({ width: w, height: h });
  };

  // Clamp helper
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  // Quick preset: Select 1:1 square
  const applySquarePreset = () => {
    setAspectMode('1:1');
    if (naturalSize.width && naturalSize.height) {
      // 1:1 in natural aspect ratio
      const imgRatio = naturalSize.width / naturalSize.height;
      if (imgRatio >= 1) {
        // Image is wider than tall
        const targetWidthPercent = 100 / imgRatio;
        const xOffset = (100 - targetWidthPercent) / 2;
        setCrop({ x: clamp(xOffset, 0, 100), y: 0, width: clamp(targetWidthPercent, 10, 100), height: 100 });
      } else {
        // Image is taller than wide
        const targetHeightPercent = 100 * imgRatio;
        const yOffset = (100 - targetHeightPercent) / 2;
        setCrop({ x: 0, y: clamp(yOffset, 0, 100), width: 100, height: clamp(targetHeightPercent, 10, 100) });
      }
    } else {
      setCrop({ x: 10, y: 10, width: 80, height: 80 });
    }
  };

  // Quick preset: Cut Bottom Strip (e.g. 15% footer watermark)
  const applyCutBottomPreset = (percentToKeep: number) => {
    setAspectMode('free');
    setCrop({
      x: 0,
      y: 0,
      width: 100,
      height: percentToKeep
    });
  };

  // Reset to full image
  const handleReset = () => {
    setAspectMode('free');
    setCrop({ x: 0, y: 0, width: 100, height: 100 });
  };

  // Update live preview canvas
  const updatePreview = useCallback(() => {
    const canvas = previewCanvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !naturalSize.width || !naturalSize.height) return;

    try {
      const srcX = (crop.x / 100) * naturalSize.width;
      const srcY = (crop.y / 100) * naturalSize.height;
      const srcW = (crop.width / 100) * naturalSize.width;
      const srcH = (crop.height / 100) * naturalSize.height;

      const targetSize = 160;
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, targetSize, targetSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetSize, targetSize);

      // Fit cropped area within square preview canvas (contain)
      const cropRatio = srcW / (srcH || 1);
      let renderW = targetSize;
      let renderH = targetSize;
      let renderX = 0;
      let renderY = 0;

      if (cropRatio >= 1) {
        renderH = targetSize / cropRatio;
        renderY = (targetSize - renderH) / 2;
      } else {
        renderW = targetSize * cropRatio;
        renderX = (targetSize - renderW) / 2;
      }

      ctx.drawImage(img, srcX, srcY, srcW, srcH, renderX, renderY, renderW, renderH);
    } catch {
      // Cross-origin image might taint canvas for preview, which is ok - preview is non-critical
    }
  }, [crop, naturalSize]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  // Handle Drag / Resize events
  const startDrag = (
    e: React.MouseEvent | React.TouchEvent,
    dragType: 'move' | 'create' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e'
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragRef.current = {
      isDragging: true,
      dragType,
      startX: clientX,
      startY: clientY,
      initialCrop: { ...crop }
    };

    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
    window.addEventListener('touchmove', onDragMove);
    window.addEventListener('touchend', onDragEnd);
  };

  const onDragMove = (e: MouseEvent | TouchEvent) => {
    if (!dragRef.current.isDragging || !containerRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaXPercent = ((clientX - dragRef.current.startX) / rect.width) * 100;
    const deltaYPercent = ((clientY - dragRef.current.startY) / rect.height) * 100;

    const { dragType, initialCrop } = dragRef.current;
    let nextCrop = { ...initialCrop };

    if (dragType === 'move') {
      nextCrop.x = clamp(initialCrop.x + deltaXPercent, 0, 100 - initialCrop.width);
      nextCrop.y = clamp(initialCrop.y + deltaYPercent, 0, 100 - initialCrop.height);
    } else if (dragType === 'create') {
      const startXPercent = ((dragRef.current.startX - rect.left) / rect.width) * 100;
      const startYPercent = ((dragRef.current.startY - rect.top) / rect.height) * 100;
      const currentXPercent = ((clientX - rect.left) / rect.width) * 100;
      const currentYPercent = ((clientY - rect.top) / rect.height) * 100;

      const left = Math.min(startXPercent, currentXPercent);
      const top = Math.min(startYPercent, currentYPercent);
      const width = Math.abs(currentXPercent - startXPercent);
      const height = Math.abs(currentYPercent - startYPercent);

      nextCrop = {
        x: clamp(left, 0, 100),
        y: clamp(top, 0, 100),
        width: clamp(width, 5, 100 - left),
        height: clamp(height, 5, 100 - top)
      };
    } else {
      // Handles resize
      let left = initialCrop.x;
      let top = initialCrop.y;
      let width = initialCrop.width;
      let height = initialCrop.height;

      // Handle West / East
      if (dragType?.includes('w')) {
        const proposedX = initialCrop.x + deltaXPercent;
        const proposedW = initialCrop.width - deltaXPercent;
        if (proposedW >= 5 && proposedX >= 0) {
          left = proposedX;
          width = proposedW;
        }
      } else if (dragType?.includes('e')) {
        const proposedW = initialCrop.width + deltaXPercent;
        if (proposedW >= 5 && left + proposedW <= 100) {
          width = proposedW;
        }
      }

      // Handle North / South
      if (dragType?.includes('n')) {
        const proposedY = initialCrop.y + deltaYPercent;
        const proposedH = initialCrop.height - deltaYPercent;
        if (proposedH >= 5 && proposedY >= 0) {
          top = proposedY;
          height = proposedH;
        }
      } else if (dragType?.includes('s')) {
        const proposedH = initialCrop.height + deltaYPercent;
        if (proposedH >= 5 && top + proposedH <= 100) {
          height = proposedH;
        }
      }

      // Check aspect ratio constraint if 1:1
      if (aspectMode === '1:1' && naturalSize.width && naturalSize.height) {
        const ratio = naturalSize.width / naturalSize.height;
        // pixel width / pixel height = (width * origW) / (height * origH) = 1
        // height = width * ratio
        height = clamp(width * ratio, 5, 100 - top);
      }

      nextCrop = {
        x: clamp(left, 0, 95),
        y: clamp(top, 0, 95),
        width: clamp(width, 5, 100 - left),
        height: clamp(height, 5, 100 - top)
      };
    }

    setCrop(nextCrop);
  };

  const onDragEnd = () => {
    dragRef.current.isDragging = false;
    dragRef.current.dragType = null;
    window.removeEventListener('mousemove', onDragMove);
    window.removeEventListener('mouseup', onDragEnd);
    window.removeEventListener('touchmove', onDragMove);
    window.removeEventListener('touchend', onDragEnd);
  };

  // Submit Crop Request
  const handleApplyCrop = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate crop box
      if (crop.width < 1 || crop.height < 1) {
        throw new Error('Selection is too small. Please select a larger area to crop.');
      }

      const res = await adminApi.cropImageManual(imageUrl, {
        x: crop.x,
        y: crop.y,
        width: crop.width,
        height: crop.height,
        unit: 'percent'
      });

      if (!res.url) {
        throw new Error('Server returned an empty image URL.');
      }

      onCropComplete(res.url);
      onClose();
    } catch (err: any) {
      console.error('Manual crop error:', err);
      setError(err.message || 'Failed to apply crop.');
    } finally {
      setSaving(false);
    }
  };

  // Calculate live pixel dimensions
  const pixelWidth = naturalSize.width ? Math.round((crop.width / 100) * naturalSize.width) : 0;
  const pixelHeight = naturalSize.height ? Math.round((crop.height / 100) * naturalSize.height) : 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out'
      }}
      onClick={e => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1080px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#fff7ed',
                color: '#ff6600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Scissors size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {title}
              </h2>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                Drag the handles or select any custom area to keep only the clean product part.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Toolbar: Aspect Ratio & Quick Crop Presets */}
        <div
          style={{
            padding: '12px 24px',
            borderBottom: '1px solid #e2e8f0',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          {/* Quick Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginRight: '4px' }}>
              Mode / Ratio:
            </span>

            <button
              type="button"
              onClick={() => setAspectMode('free')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: aspectMode === 'free' ? '2px solid #ff6600' : '1px solid #cbd5e1',
                background: aspectMode === 'free' ? '#fff7ed' : '#ffffff',
                color: aspectMode === 'free' ? '#ea580c' : '#334155',
                cursor: 'pointer'
              }}
            >
              Freeform (Any Size)
            </button>

            <button
              type="button"
              onClick={applySquarePreset}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: aspectMode === '1:1' ? '2px solid #ff6600' : '1px solid #cbd5e1',
                background: aspectMode === '1:1' ? '#fff7ed' : '#ffffff',
                color: aspectMode === '1:1' ? '#ea580c' : '#334155',
                cursor: 'pointer'
              }}
            >
              1:1 Square
            </button>

            <div style={{ height: '20px', width: '1px', background: '#e2e8f0', margin: '0 4px' }} />

            <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginRight: '4px' }}>
              ⚡ Quick Banner Trim:
            </span>

            <button
              type="button"
              onClick={() => applyCutBottomPreset(85)}
              title="Cuts bottom 15% banner strip while keeping full width"
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: '1px solid #fed7aa',
                background: '#fffaf5',
                color: '#c2410c',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Scissors size={13} />
              <span>Trim Bottom 15%</span>
            </button>

            <button
              type="button"
              onClick={() => applyCutBottomPreset(80)}
              title="Cuts bottom 20% banner strip"
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: '1px solid #fed7aa',
                background: '#fffaf5',
                color: '#c2410c',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Scissors size={13} />
              <span>Trim Bottom 20%</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Reset selection to entire image"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>

          {/* Dimension indicator badge */}
          {naturalSize.width > 0 && (
            <div
              style={{
                fontSize: '12px',
                color: '#334155',
                background: '#f1f5f9',
                padding: '4px 10px',
                borderRadius: '6px',
                fontWeight: 600
              }}
            >
              Selection: <strong style={{ color: '#ea580c' }}>{pixelWidth} × {pixelHeight} px</strong>
              <span style={{ color: '#94a3b8', margin: '0 6px' }}>|</span>
              Original: {naturalSize.width} × {naturalSize.height} px
            </div>
          )}
        </div>

        {/* Workspace Body */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            overflow: 'hidden',
            background: '#0f172a',
            position: 'relative'
          }}
        >
          {/* Main Cropping Canvas Stage */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              userSelect: 'none',
              overflow: 'auto',
              minHeight: '380px'
            }}
          >
            <div
              ref={containerRef}
              style={{
                position: 'relative',
                display: 'inline-block',
                maxWidth: '100%',
                maxHeight: '62vh',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                cursor: 'crosshair'
              }}
              onMouseDown={e => {
                if (e.target === containerRef.current || e.target === imageRef.current) {
                  startDrag(e, 'create');
                }
              }}
              onTouchStart={e => {
                if (e.target === containerRef.current || e.target === imageRef.current) {
                  startDrag(e, 'create');
                }
              }}
            >
              {/* Source Image */}
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Crop Target"
                crossOrigin="anonymous"
                onLoad={handleImageLoad}
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: '62vh',
                  objectFit: 'contain',
                  pointerEvents: 'none'
                }}
              />

              {/* Shaded Outside Overlays */}
              {/* Top Mask */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: `${crop.y}%`,
                  background: 'rgba(0, 0, 0, 0.65)',
                  pointerEvents: 'none'
                }}
              />
              {/* Bottom Mask */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: `${100 - (crop.y + crop.height)}%`,
                  background: 'rgba(0, 0, 0, 0.65)',
                  pointerEvents: 'none'
                }}
              />
              {/* Left Mask */}
              <div
                style={{
                  position: 'absolute',
                  top: `${crop.y}%`,
                  left: 0,
                  width: `${crop.x}%`,
                  height: `${crop.height}%`,
                  background: 'rgba(0, 0, 0, 0.65)',
                  pointerEvents: 'none'
                }}
              />
              {/* Right Mask */}
              <div
                style={{
                  position: 'absolute',
                  top: `${crop.y}%`,
                  right: 0,
                  width: `${100 - (crop.x + crop.width)}%`,
                  height: `${crop.height}%`,
                  background: 'rgba(0, 0, 0, 0.65)',
                  pointerEvents: 'none'
                }}
              />

              {/* The Active Crop Selection Box */}
              <div
                style={{
                  position: 'absolute',
                  top: `${crop.y}%`,
                  left: `${crop.x}%`,
                  width: `${crop.width}%`,
                  height: `${crop.height}%`,
                  border: '2px solid #ff6600',
                  boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.7), inset 0 0 10px rgba(255, 102, 0, 0.2)',
                  cursor: 'move',
                  boxSizing: 'border-box'
                }}
                onMouseDown={e => startDrag(e, 'move')}
                onTouchStart={e => startDrag(e, 'move')}
              >
                {/* 3x3 Grid Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gridTemplateRows: '1fr 1fr 1fr',
                    opacity: 0.4
                  }}
                >
                  <div style={{ borderRight: '1px dashed #ffffff', borderBottom: '1px dashed #ffffff' }} />
                  <div style={{ borderRight: '1px dashed #ffffff', borderBottom: '1px dashed #ffffff' }} />
                  <div style={{ borderBottom: '1px dashed #ffffff' }} />
                  <div style={{ borderRight: '1px dashed #ffffff', borderBottom: '1px dashed #ffffff' }} />
                  <div style={{ borderRight: '1px dashed #ffffff', borderBottom: '1px dashed #ffffff' }} />
                  <div style={{ borderBottom: '1px dashed #ffffff' }} />
                  <div style={{ borderRight: '1px dashed #ffffff' }} />
                  <div style={{ borderRight: '1px dashed #ffffff' }} />
                  <div />
                </div>

                {/* Move Center Icon Helper */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(15, 23, 42, 0.6)',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    opacity: 0.85
                  }}
                >
                  <Move size={14} />
                </div>

                {/* Corner Resize Handles */}
                {/* Top-Left */}
                <div
                  onMouseDown={e => startDrag(e, 'nw')}
                  onTouchStart={e => startDrag(e, 'nw')}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    left: '-6px',
                    width: '12px',
                    height: '12px',
                    background: '#ff6600',
                    border: '2px solid #ffffff',
                    borderRadius: '2px',
                    cursor: 'nwse-resize'
                  }}
                />
                {/* Top-Right */}
                <div
                  onMouseDown={e => startDrag(e, 'ne')}
                  onTouchStart={e => startDrag(e, 'ne')}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    width: '12px',
                    height: '12px',
                    background: '#ff6600',
                    border: '2px solid #ffffff',
                    borderRadius: '2px',
                    cursor: 'nesw-resize'
                  }}
                />
                {/* Bottom-Left */}
                <div
                  onMouseDown={e => startDrag(e, 'sw')}
                  onTouchStart={e => startDrag(e, 'sw')}
                  style={{
                    position: 'absolute',
                    bottom: '-6px',
                    left: '-6px',
                    width: '12px',
                    height: '12px',
                    background: '#ff6600',
                    border: '2px solid #ffffff',
                    borderRadius: '2px',
                    cursor: 'nesw-resize'
                  }}
                />
                {/* Bottom-Right */}
                <div
                  onMouseDown={e => startDrag(e, 'se')}
                  onTouchStart={e => startDrag(e, 'se')}
                  style={{
                    position: 'absolute',
                    bottom: '-6px',
                    right: '-6px',
                    width: '12px',
                    height: '12px',
                    background: '#ff6600',
                    border: '2px solid #ffffff',
                    borderRadius: '2px',
                    cursor: 'nwse-resize'
                  }}
                />

                {/* Edge Handles */}
                {/* Top Edge */}
                <div
                  onMouseDown={e => startDrag(e, 'n')}
                  onTouchStart={e => startDrag(e, 'n')}
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '20px',
                    height: '8px',
                    background: '#ff6600',
                    border: '1px solid #ffffff',
                    borderRadius: '2px',
                    cursor: 'ns-resize'
                  }}
                />
                {/* Bottom Edge */}
                <div
                  onMouseDown={e => startDrag(e, 's')}
                  onTouchStart={e => startDrag(e, 's')}
                  style={{
                    position: 'absolute',
                    bottom: '-5px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '20px',
                    height: '8px',
                    background: '#ff6600',
                    border: '1px solid #ffffff',
                    borderRadius: '2px',
                    cursor: 'ns-resize'
                  }}
                />
                {/* Left Edge */}
                <div
                  onMouseDown={e => startDrag(e, 'w')}
                  onTouchStart={e => startDrag(e, 'w')}
                  style={{
                    position: 'absolute',
                    left: '-5px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '8px',
                    height: '20px',
                    background: '#ff6600',
                    border: '1px solid #ffffff',
                    borderRadius: '2px',
                    cursor: 'ew-resize'
                  }}
                />
                {/* Right Edge */}
                <div
                  onMouseDown={e => startDrag(e, 'e')}
                  onTouchStart={e => startDrag(e, 'e')}
                  style={{
                    position: 'absolute',
                    right: '-5px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '8px',
                    height: '20px',
                    background: '#ff6600',
                    border: '1px solid #ffffff',
                    borderRadius: '2px',
                    cursor: 'ew-resize'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar: Live Preview & Instructions */}
          <div
            style={{
              width: '240px',
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
              background: '#1e293b',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', margin: '0 0 4px 0' }}>
                Live Result Preview
              </h3>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                This is how the cropped image will appear on the storefront.
              </p>
            </div>

            {/* Preview Box */}
            <div
              style={{
                width: '160px',
                height: '160px',
                background: '#0f172a',
                borderRadius: '10px',
                border: '2px solid #334155',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              <canvas
                ref={previewCanvasRef}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            {/* Tips / Instructions */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '11px',
                color: '#cbd5e1',
                lineHeight: '1.5'
              }}
            >
              <div style={{ fontWeight: 700, color: '#ff6600', marginBottom: '4px' }}>
                💡 Pro Tips:
              </div>
              <ul style={{ margin: 0, paddingLeft: '16px' }}>
                <li>Drag from center to reposition</li>
                <li>Drag corner/edge handles to resize</li>
                <li>Use &quot;Trim Bottom&quot; to cut unwanted phone banners</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Error notification if any */}
        {error && (
          <div
            style={{
              padding: '10px 24px',
              background: '#fef2f2',
              color: '#b91c1c',
              fontSize: '13px',
              fontWeight: 600,
              borderTop: '1px solid #fecaca'
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Modal Footer / Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Retains high original resolution with 95% image quality.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={saving}
              style={{ padding: '8px 18px', fontSize: '13px' }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApplyCrop}
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 24px',
                borderRadius: '8px',
                border: 'none',
                background: '#ff6600',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 4px rgba(255, 102, 0, 0.25)',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving & Cropping...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Apply & Save Crop</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
