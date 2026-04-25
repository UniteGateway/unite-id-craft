import React, { useEffect, useRef, useState } from "react";

interface SlideStageProps {
  children: React.ReactNode;
  /** aspect width / height; default 1920x1080 */
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Responsive scaler: renders children at fixed pixel size
 * (1920x1080 by default) and scales them down to fit the parent.
 */
const SlideStage: React.FC<SlideStageProps> = ({
  children,
  width = 1920,
  height = 1080,
  className = "",
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      setScale(w / width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div
      ref={wrapRef}
      className={`relative w-full ${className}`}
      style={{ height: height * scale }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default SlideStage;