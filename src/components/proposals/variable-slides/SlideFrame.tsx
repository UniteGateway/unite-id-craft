import React, { forwardRef } from "react";

interface SlideFrameProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Fixed-resolution 16:9 slide frame (1920 x 1080).
 * Use inside a parent that has `position: relative` + the
 * scaling wrapper from SlideStage for responsive previews.
 */
const SlideFrame = forwardRef<HTMLDivElement, SlideFrameProps>(
  ({ children, className = "" }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative overflow-hidden bg-[#0A1B33] text-white ${className}`}
        style={{ width: 1920, height: 1080 }}
      >
        {children}
      </div>
    );
  }
);
SlideFrame.displayName = "SlideFrame";
export default SlideFrame;