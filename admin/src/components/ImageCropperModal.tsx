import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Scissors,
  Check,
  X,
  RotateCcw,
  Move,
  Loader2,
  MousePointer,
  Square,
  Sliders,
  Maximize2
} from 'lucide-react';
import { adminApi } from '../api';

export interface CropRect {
  x: number;      // left percentage (0 - 100)
  y: number;      // top percentage (0 - 100)
  width: number;  // width percentage (0 - 100)
  height: number; // height percentage (0 - 100)
}

interface ImageCropperModalProps {
  imageUrl: string;
  title?: string;
  onClose: () => void;
  onCropComplete: (croppedUrl: string) => void;
}

type AspectRatioMode = 'free' | '1:1' | '4:3' | '16:9';
type InteractionMode = 'adjust' | 'draw';

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  imageUrl,
  title = 'Crop Product Image',
  onClose,
  onCropComplete
}) => {
  const [aspectMode, setAspectMode] = useState<AspectRatioMode>('free');
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('adjust');
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 100, height: 100 });
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgSrc, setImgSrc] = useState(imageUrl);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Drag interaction state
  const dragRef = useRef<{
    isDragging: boolean;
    dragType: 'move' | 'draw' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e' | null;
    startX: number;
    startY: number;
    initialCrop: CropRect;
  }>({
    isDragging: false,
    dragType: null,
    startX: 0,
    startY: 0,
    initialCrop: { x: 0, y: 0, width: 100, height: 100 }
  });

  // Clamp helper
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  // Load natural dimensions of the image
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const w = img.naturalWidth || 800;
    const h = img.naturalHeight || 800;
    setNaturalSize({ width: w, height: h });
  };

  // If image fails to load directly (CORS / referrer), fallback to proxy
  const handleImageError = () => {
    if (imgSrc === imageUrl && !imageUrl.startsWith('/uploads/')) {
      const proxyUrl = adminApi.getProxyImageUrl(imageUrl);
      setImgSrc(proxyUrl);
    } else {
      setError('Failed to load image. Please verify image URL.');
    }
  };

  // 1:1 Square Preset
  const applySquarePreset = () => {
    setAspectMode('1:1');
    if (naturalSize.width && naturalSize.height) {
      const imgRatio = naturalSize.width / naturalSize.height;
      if (imgRatio >= 1) {
        const targetWidthPercent = 100 / imgRatio;
        const xOffset = (100 - targetWidthPercent) / 2;
        setCrop({ x: clamp(xOffset, 0, 100), y: 0, width: clamp(targetWidthPercent, 10, 100), height: 100 });
      } else {
        const targetHeightPercent = 100 * imgRatio;
        const yOffset = (100 - targetHeightPercent) / 2;
        setCrop({ x: 0, y: clamp(yOffset, 0, 100), width: 100, height: clamp(targetHeightPercent, 10, 100) });
      }
    } else {
      setCrop({ x: 10, y: 10, width: 80, height: 80 });
    }
  };

  // Quick Preset: Cut bottom percent (e.g. 15% banner)
  const applyCutBottom = (percentToCut: number) => {
    setAspectMode('free');
    const newHeight = clamp(100 - percentToCut, 10, 100);
    setCrop(prev => ({
      ...prev,
      y: 0,
      height: newHeight
    }));
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

      const targetSize = 180;
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, targetSize, targetSize);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, targetSize, targetSize);

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
      // Cross-origin image preview silently handled
    }
  }, [crop, naturalSize]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  // Handle Drag / Resize
  const startDrag = (
    e: React.MouseEvent | React.TouchEvent,
    dragType: 'move' | 'draw' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e'
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
    } else if (dragType === 'draw') {
      const startXPercent = clamp(((dragRef.current.startX - rect.left) / rect.width) * 100, 0, 100);
      const startYPercent = clamp(((dragRef.current.startY - rect.top) / rect.height) * 100, 0, 100);
      const currentXPercent = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
      const currentYPercent = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);

      const left = Math.min(startXPercent, currentXPercent);
      const top = Math.min(startYPercent, currentYPercent);
      let width = Math.abs(currentXPercent - startXPercent);
      let height = Math.abs(currentYPercent - startYPercent);

      if (aspectMode === '1:1' && naturalSize.width && naturalSize.height) {
        const ratio = naturalSize.width / naturalSize.height;
        height = clamp(width * ratio, 5, 100 - top);
      }

      nextCrop = {
        x: clamp(left, 0, 95),
        y: clamp(top, 0, 95),
        width: clamp(width, 5, 100 - left),
        height: clamp(height, 5, 100 - top)
      };
    } else {
      // Handles
      let left = initialCrop.x;
      let top = initialCrop.y;
      let width = initialCrop.width;
      let height = initialCrop.height;

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

      if (aspectMode === '1:1' && naturalSize.width && naturalSize.height) {
        const ratio = naturalSize.width / naturalSize.height;
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

  // Dimension computations
  const pixelWidth = naturalSize.width ? Math.round((crop.width / 100) * naturalSize.width) : 0;
  const pixelHeight = naturalSize.height ? Math.round((crop.height / 100) * naturalSize.height) : 0;
  const bottomCutPercent = Math.round(100 - (crop.y + crop.height));
  const bottomCutPx = naturalSize.height ? Math.round((bottomCutPercent / 100) * naturalSize.height) : 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px'
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
          maxWidth: '1120px',
          maxHeight: '96vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 24px',
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
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {title}
              </h2>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                Use the slider or drag the orange handles to select the clean product part.
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

        {/* Top Control Bar: Quick Bottom Trim & Aspect Ratio */}
        <div
          style={{
            padding: '12px 24px',
            borderBottom: '1px solid #e2e8f0',
            background: '#fff7ed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          {/* Quick Banner Cut Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#c2410c', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Scissors size={14} /> Quick Remove Bottom Banner:
            </span>

            <button
              type="button"
              onClick={() => applyCutBottom(0)}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                border: bottomCutPercent === 0 ? '2px solid #ff6600' : '1px solid #fed7aa',
                background: bottomCutPercent === 0 ? '#ff6600' : '#ffffff',
                color: bottomCutPercent === 0 ? '#ffffff' : '#9a3412',
                cursor: 'pointer'
              }}
            >
              Full (0%)
            </button>

            {[10, 15, 20, 25, 30].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => applyCutBottom(pct)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: bottomCutPercent === pct ? '2px solid #ea580c' : '1px solid #fed7aa',
                  background: bottomCutPercent === pct ? '#ea580c' : '#ffffff',
                  color: bottomCutPercent === pct ? '#ffffff' : '#c2410c',
                  cursor: 'pointer'
                }}
              >
                Trim -{pct}%
              </button>
            ))}
          </div>

          {/* Aspect Ratio Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
              Mode:
            </span>

            <button
              type="button"
              onClick={() => setAspectMode('free')}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                border: aspectMode === 'free' ? '2px solid #ff6600' : '1px solid #cbd5e1',
                background: aspectMode === 'free' ? '#ff6600' : '#ffffff',
                color: aspectMode === 'free' ? '#ffffff' : '#334155',
                cursor: 'pointer'
              }}
            >
              Freeform
            </button>

            <button
              type="button"
              onClick={applySquarePreset}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                border: aspectMode === '1:1' ? '2px solid #ff6600' : '1px solid #cbd5e1',
                background: aspectMode === '1:1' ? '#ff6600' : '#ffffff',
                color: aspectMode === '1:1' ? '#ffffff' : '#334155',
                cursor: 'pointer'
              }}
            >
              1:1 Square
            </button>

            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>
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
          {/* Main Visual Stage */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              userSelect: 'none',
              overflow: 'auto',
              minHeight: '400px'
            }}
          >
            <div
              ref={containerRef}
              style={{
                position: 'relative',
                display: 'inline-block',
                maxWidth: '100%',
                maxHeight: '62vh',
                boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                cursor: interactionMode === 'draw' ? 'crosshair' : 'default'
              }}
              onMouseDown={e => {
                if (interactionMode === 'draw' || e.target === containerRef.current || e.target === imageRef.current) {
                  startDrag(e, 'draw');
                }
              }}
              onTouchStart={e => {
                if (interactionMode === 'draw' || e.target === containerRef.current || e.target === imageRef.current) {
                  startDrag(e, 'draw');
                }
              }}
            >
              {/* Target Image */}
              <img
                ref={imageRef}
                src={imgSrc}
                alt="Target to Crop"
                crossOrigin="anonymous"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: '62vh',
                  objectFit: 'contain',
                  pointerEvents: 'none'
                }}
              />

              {/* Shaded Outside Overlays (Clickable to draw new selection) */}
              <div
                onMouseDown={e => startDrag(e, 'draw')}
                onTouchStart={e => startDrag(e, 'draw')}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: `${crop.y}%`,
                  background: 'rgba(0, 0, 0, 0.7)',
                  cursor: 'crosshair'
                }}
              />
              <div
                onMouseDown={e => startDrag(e, 'draw')}
                onTouchStart={e => startDrag(e, 'draw')}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: `${100 - (crop.y + crop.height)}%`,
                  background: 'rgba(0, 0, 0, 0.7)',
                  cursor: 'crosshair'
                }}
              >
                {/* Visual Banner Removal Banner Guide */}
                {bottomCutPercent > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      pointerEvents: 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    ✂️ Removing bottom {bottomCutPercent}% ({bottomCutPx}px banner)
                  </div>
                )}
              </div>
              <div
                onMouseDown={e => startDrag(e, 'draw')}
                onTouchStart={e => startDrag(e, 'draw')}
                style={{
                  position: 'absolute',
                  top: `${crop.y}%`,
                  left: 0,
                  width: `${crop.x}%`,
                  height: `${crop.height}%`,
                  background: 'rgba(0, 0, 0, 0.7)',
                  cursor: 'crosshair'
                }}
              />
              <div
                onMouseDown={e => startDrag(e, 'draw')}
                onTouchStart={e => startDrag(e, 'draw')}
                style={{
                  position: 'absolute',
                  top: `${crop.y}%`,
                  right: 0,
                  width: `${100 - (crop.x + crop.width)}%`,
                  height: `${crop.height}%`,
                  background: 'rgba(0, 0, 0, 0.7)',
                  cursor: 'crosshair'
                }}
              />

              {/* The Active Crop Box */}
              <div
                style={{
                  position: 'absolute',
                  top: `${crop.y}%`,
                  left: `${crop.x}%`,
                  width: `${crop.width}%`,
                  height: `${crop.height}%`,
                  border: '2.5px solid #ff6600',
                  boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.8), inset 0 0 12px rgba(255, 102, 0, 0.25)',
                  cursor: 'grab',
                  boxSizing: 'border-box'
                }}
                onMouseDown={e => startDrag(e, 'move')}
                onTouchStart={e => startDrag(e, 'move')}
              >
                {/* 3x3 Grid */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gridTemplateRows: '1fr 1fr 1fr',
                    opacity: 0.45
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

                {/* Center Move Pill */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(15, 23, 42, 0.75)',
                    color: '#ffffff',
                    borderRadius: '20px',
                    padding: '4px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    pointerEvents: 'none',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <Move size={12} />
                  <span>Drag to reposition</span>
                </div>

                {/* 4 Chunky Corner Handles (Easy to click and grab) */}
                {/* Top-Left */}
                <div
                  onMouseDown={e => startDrag(e, 'nw')}
                  onTouchStart={e => startDrag(e, 'nw')}
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '-12px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#ff6600',
                    border: '3px solid #ffffff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                    cursor: 'nwse-resize',
                    zIndex: 20
                  }}
                />
                {/* Top-Right */}
                <div
                  onMouseDown={e => startDrag(e, 'ne')}
                  onTouchStart={e => startDrag(e, 'ne')}
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '-12px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#ff6600',
                    border: '3px solid #ffffff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                    cursor: 'nesw-resize',
                    zIndex: 20
                  }}
                />
                {/* Bottom-Left */}
                <div
                  onMouseDown={e => startDrag(e, 'sw')}
                  onTouchStart={e => startDrag(e, 'sw')}
                  style={{
                    position: 'absolute',
                    bottom: '-12px',
                    left: '-12px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#ff6600',
                    border: '3px solid #ffffff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                    cursor: 'nesw-resize',
                    zIndex: 20
                  }}
                />
                {/* Bottom-Right */}
                <div
                  onMouseDown={e => startDrag(e, 'se')}
                  onTouchStart={e => startDrag(e, 'se')}
                  style={{
                    position: 'absolute',
                    bottom: '-12px',
                    right: '-12px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#ff6600',
                    border: '3px solid #ffffff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                    cursor: 'nwse-resize',
                    zIndex: 20
                  }}
                />

                {/* 4 Chunky Edge Handles */}
                {/* Top Edge */}
                <div
                  onMouseDown={e => startDrag(e, 'n')}
                  onTouchStart={e => startDrag(e, 'n')}
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '42px',
                    height: '14px',
                    borderRadius: '8px',
                    background: '#ff6600',
                    border: '2px solid #ffffff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                    cursor: 'ns-resize',
                    zIndex: 20
                  }}
                />
                {/* Bottom Edge (Banner Cut Handle) */}
                <div
                  onMouseDown={e => startDrag(e, 's')}
                  onTouchStart={e => startDrag(e, 's')}
                  style={{
                    position: 'absolute',
                    bottom: '-8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '42px',
                    height: '14px',
                    borderRadius: '8px',
                    background: '#ff6600',
                    border: '2px solid #ffffff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                    cursor: 'ns-resize',
                    zIndex: 20
                  }}
                />
                {/* Left Edge */}
                <div
                  onMouseDown={e => startDrag(e, 'w')}
                  onTouchStart={e => startDrag(e, 'w')}
                  style={{
                    position: 'absolute',
                    left: '-8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '14px',
                    height: '42px',
                    borderRadius: '8px',
                    background: '#ff6600',
                    border: '2px solid #ffffff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                    cursor: 'ew-resize',
                    zIndex: 20
                  }}
                />
                {/* Right Edge */}
                <div
                  onMouseDown={e => startDrag(e, 'e')}
                  onTouchStart={e => startDrag(e, 'e')}
                  style={{
                    position: 'absolute',
                    right: '-8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '14px',
                    height: '42px',
                    borderRadius: '8px',
                    background: '#ff6600',
                    border: '2px solid #ffffff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                    cursor: 'ew-resize',
                    zIndex: 20
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar: Easy Slider Controls & Live Preview */}
          <div
            style={{
              width: '280px',
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
              background: '#1e293b',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              overflowY: 'auto'
            }}
          >
            {/* Live Result Preview */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  Live Storefront Preview
                </h3>
                <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>
                  {pixelWidth} × {pixelHeight} px
                </span>
              </div>

              <div
                style={{
                  width: '180px',
                  height: '180px',
                  background: '#0f172a',
                  borderRadius: '12px',
                  border: '2px solid #334155',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.4)'
                }}
              >
                <canvas
                  ref={previewCanvasRef}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>

            {/* Slider Control: Trim Bottom Banner */}
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#ffedd5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Scissors size={14} style={{ color: '#ff6600' }} />
                  <span>Cut Bottom Banner:</span>
                </label>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#ff6600' }}>
                  {bottomCutPercent}% ({bottomCutPx}px)
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={bottomCutPercent}
                onChange={e => applyCutBottom(Number(e.target.value))}
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  accentColor: '#ff6600'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                <span>0% (Full)</span>
                <span>25% Cut</span>
                <span>50% Cut</span>
              </div>
            </div>

            {/* Selection Mode Helper */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
                How to select:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setInteractionMode('adjust')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: interactionMode === 'adjust' ? '1.5px solid #ff6600' : '1px solid #475569',
                    background: interactionMode === 'adjust' ? 'rgba(255,102,0,0.15)' : 'transparent',
                    color: interactionMode === 'adjust' ? '#ffedd5' : '#cbd5e1',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Move size={14} style={{ color: '#ff6600' }} />
                  <span>Adjust with Orange Handles</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInteractionMode('draw')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: interactionMode === 'draw' ? '1.5px solid #ff6600' : '1px solid #475569',
                    background: interactionMode === 'draw' ? 'rgba(255,102,0,0.15)' : 'transparent',
                    color: interactionMode === 'draw' ? '#ffedd5' : '#cbd5e1',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <MousePointer size={14} style={{ color: '#38bdf8' }} />
                  <span>Click & Drag to Draw New Box</span>
                </button>
              </div>
            </div>

            {/* Information stats */}
            <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.5' }}>
              <div>Original Image: <strong>{naturalSize.width} × {naturalSize.height} px</strong></div>
              <div>Quality: <strong>95% High Fidelity</strong></div>
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
            {bottomCutPercent > 0
              ? `Ready to crop: removing bottom ${bottomCutPercent}% banner strip.`
              : `Ready to crop: keeping selected ${pixelWidth} × ${pixelHeight} px area.`}
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
