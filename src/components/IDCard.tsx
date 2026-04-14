import React, { useEffect, useState } from "react";
import uniteSolarLogoSrc from "@/assets/unite-solar-logo.png";

export interface IDCardData {
  name: string;
  designation: string;
  employeeId: string;
  photo: string | null;
  photoZoom?: number;
  photoOffsetX?: number;
  photoOffsetY?: number;
}

interface IDCardProps {
  data: IDCardData;
  scale?: number;
}

// Convert the bundled logo URL to a data URI once so html-to-image can capture it
let cachedLogoDataUri: string | null = null;
function useLogoDataUri() {
  const [uri, setUri] = useState(cachedLogoDataUri);
  useEffect(() => {
    if (cachedLogoDataUri) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      cachedLogoDataUri = canvas.toDataURL("image/png");
      setUri(cachedLogoDataUri);
    };
    img.src = uniteSolarLogoSrc;
  }, []);
  return uri || uniteSolarLogoSrc;
}

const IDCard = React.forwardRef<HTMLDivElement, IDCardProps>(
  ({ data, scale = 1 }, ref) => {
    const logoSrc = useLogoDataUri();
    const w = 320;
    const h = 506;

    return (
      <div
        ref={ref}
        className="relative overflow-hidden"
        style={{
          width: w * scale,
          height: h * scale,
          borderRadius: 16 * scale,
          fontFamily: "'Inter', sans-serif",
          background: "linear-gradient(180deg, #ffffff 35%, #3a3a3a 35%)",
          boxShadow: scale > 0.8 ? "0 4px 24px rgba(0,0,0,0.12)" : "none",
        }}
      >
        {/* White top section */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: h * 0.35 * scale,
            background: "#ffffff",
            zIndex: 1,
          }}
        />

        {/* Dark bottom section */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: h * 0.65 * scale,
            background: "#3a3a3a",
            zIndex: 1,
          }}
        />

        {/* Orange diagonal top-right */}
        <div
          style={{
            position: "absolute",
            top: h * 0.28 * scale,
            right: 0,
            width: w * 0.35 * scale,
            height: h * 0.12 * scale,
            background: "#f08c00",
            transform: "skewY(-15deg)",
            transformOrigin: "right",
            zIndex: 2,
          }}
        />

        {/* Orange diagonal bottom-left */}
        <div
          style={{
            position: "absolute",
            top: h * 0.28 * scale,
            left: 0,
            width: w * 0.35 * scale,
            height: h * 0.12 * scale,
            background: "#f08c00",
            transform: "skewY(15deg)",
            transformOrigin: "left",
            zIndex: 2,
          }}
        />

        {/* Logo - large and prominent */}
        <div
          style={{
            position: "absolute",
            top: 8 * scale,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 3,
          }}
        >
          <img
            src={logoSrc}
            alt="Unite Solar"
            style={{
              height: 80 * scale,
              objectFit: "contain",
            }}
          />
        </div>

        {/* Photo frame */}
        <div
          style={{
            position: "absolute",
            top: h * 0.19 * scale,
            left: "50%",
            transform: "translateX(-50%)",
            width: 170 * scale,
            height: 195 * scale,
            borderRadius: 14 * scale,
            overflow: "hidden",
            border: `3px solid #ffffff`,
            background: "#e0e0e0",
            zIndex: 5,
          }}
        >
          {data.photo ? (
            <img
              src={data.photo}
              alt={data.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
                fontSize: 14 * scale,
              }}
            >
              Photo
            </div>
          )}
        </div>

        {/* Name */}
        <div
          style={{
            position: "absolute",
            top: h * 0.6 * scale,
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 5,
            color: "#ffffff",
            fontSize: 18 * scale,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase" as const,
          }}
        >
          {data.name || "Full Name"}
        </div>

        {/* Designation */}
        <div
          style={{
            position: "absolute",
            top: h * 0.66 * scale,
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 5,
            color: "#cccccc",
            fontSize: 13 * scale,
            fontWeight: 600,
          }}
        >
          {data.designation || "Designation"}
        </div>

        {/* Divider */}
        <div
          style={{
            position: "absolute",
            top: h * 0.71 * scale,
            left: w * 0.15 * scale,
            right: w * 0.15 * scale,
            height: 1,
            background: "#f08c00",
            zIndex: 5,
          }}
        />

        {/* Employee ID */}
        <div
          style={{
            position: "absolute",
            top: h * 0.73 * scale,
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 5,
            color: "#ffffff",
            fontSize: 12 * scale,
          }}
        >
          <span style={{ fontWeight: 400 }}>Employee ID: </span>
          <span style={{ fontWeight: 700 }}>
            {data.employeeId || "US-BA-001"}
          </span>
        </div>

        {/* Barcode area */}
        <div
          style={{
            position: "absolute",
            top: h * 0.79 * scale,
            left: w * 0.1 * scale,
            right: w * 0.1 * scale,
            height: h * 0.1 * scale,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5,
          }}
        >
          <svg id={`barcode-${data.employeeId}`} style={{ width: "100%", height: "100%" }} />
        </div>

        {/* Website */}
        <div
          style={{
            position: "absolute",
            bottom: 10 * scale,
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 5,
            color: "#ffffff",
            fontSize: 11 * scale,
            fontWeight: 500,
          }}
        >
          www.unitesolar.in
        </div>
      </div>
    );
  }
);

IDCard.displayName = "IDCard";

export default IDCard;
