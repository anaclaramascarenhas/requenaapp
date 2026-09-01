import type { CSSProperties } from 'react';
import { ImageSquare } from '@phosphor-icons/react';
import './ImagePlaceholder.css';

// Product photography is intentionally left as a placeholder for now —
// swap this for a real <img> once product photos are provided.
type Props = { label?: string; height?: number | string; radius?: number; style?: CSSProperties };

export function ImagePlaceholder({ label, height, radius = 0, style }: Props) {
  return (
    <div className="image-placeholder" style={{ height, borderRadius: radius, ...style }}>
      <ImageSquare size={20} />
      {label && <span>{label}</span>}
    </div>
  );
}
