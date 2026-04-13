import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import IDCard, { type IDCardData } from "@/components/IDCard";
import IDCardForm from "@/components/IDCardForm";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CreditCard, LayoutGrid, Download, ArrowLeft, FileImage, FileText } from "lucide-react";

const generateId = (idx: number) =>
  `US-BA-${String(idx + 1).padStart(3, "0")}`;

const emptyCard = (idx: number): IDCardData => ({
  name: "",
  designation: "",
  employeeId: generateId(idx),
  photo: null,
});

type Mode = "select" | "single" | "multiple";

const waitForImage = (img: HTMLImageElement) => {
  if (img.complete && img.naturalWidth > 0) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const done = () => resolve();
    img.onload = done;
    img.onerror = done;
  });
};

const srcToDataUrl = async (src: string) => {
  if (src.startsWith("data:")) {
    return src;
  }

  const response = await fetch(src, { mode: "cors" });
  const blob = await response.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

const createExportClone = async (element: HTMLElement) => {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.position = "fixed";
  clone.style.left = "-10000px";
  clone.style.top = "0";
  clone.style.margin = "0";
  clone.style.transform = "none";
  clone.style.pointerEvents = "none";
  clone.style.zIndex = "-1";

  document.body.appendChild(clone);

  const sourceImages = Array.from(element.querySelectorAll("img"));
  const cloneImages = Array.from(clone.querySelectorAll("img"));

  await Promise.all(
    cloneImages.map(async (cloneImage, index) => {
      const sourceImage = sourceImages[index];
      const src = sourceImage?.currentSrc || sourceImage?.src || cloneImage.src;

      if (!src) return;

      try {
        cloneImage.crossOrigin = "anonymous";
        cloneImage.referrerPolicy = "no-referrer";
        cloneImage.src = await srcToDataUrl(src);
        await waitForImage(cloneImage);
      } catch {
        await waitForImage(cloneImage);
      }
    })
  );

  return clone;
};

const exportNodeToPng = async (element: HTMLElement, pixelRatio: number) => {
  const clone = await createExportClone(element);

  try {
    return await toPng(clone, {
      pixelRatio,
      cacheBust: true,
      includeQueryParams: true,
      backgroundColor: "#ffffff",
    });
  } finally {
    clone.remove();
  }
};

const triggerDownload = (href: string, filename: string) => {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const Index: React.FC = () => {
  const [mode, setMode] = useState<Mode>("select");
  const [cards, setCards] = useState<IDCardData[]>([emptyCard(0)]);
  const [cardCount, setCardCount] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const a4Ref = useRef<HTMLDivElement>(null);

  const handleCardChange = useCallback(
    (idx: number, data: IDCardData) => {
      setCards((prev) => {
        const next = [...prev];
        next[idx] = data;
        return next;
      });
    },
    []
  );

  const handleModeSelect = (m: "single" | "multiple") => {
    setMode(m);
    if (m === "single") {
      setCards([emptyCard(0)]);
      setCardCount(1);
    } else {
      setCards(Array.from({ length: 9 }, (_, i) => emptyCard(i)));
      setCardCount(9);
    }
  };

  const updateCardCount = (count: number) => {
    const c = Math.min(9, Math.max(1, count));
    setCardCount(c);
    setCards((prev) => {
      const next = [...prev];
      while (next.length < c) next.push(emptyCard(next.length));
      return next.slice(0, c);
    });
  };

  useEffect(() => {
    cards.forEach((card) => {
      const el = document.getElementById(`barcode-${card.employeeId}`);
      if (el) {
        try {
          JsBarcode(el, card.employeeId || "US-BA-001", {
            format: "CODE128",
            displayValue: false,
            height: 40,
            margin: 0,
            background: "transparent",
            lineColor: "#ffffff",
          });
        } catch {
          // ignore invalid barcode
        }
      }
    });
  }, [cards]);

  const downloadSinglePNG = async () => {
    const el = cardRefs.current[0];
    if (!el) return;

    try {
      setIsExporting(true);
      const dataUrl = await exportNodeToPng(el, 3);
      triggerDownload(dataUrl, `id-card-${cards[0].employeeId}.png`);
      toast.success("PNG downloaded");
    } catch {
      toast.error("PNG download failed");
    } finally {
      setIsExporting(false);
    }
  };

  const downloadSinglePDF = async () => {
    const el = cardRefs.current[0];
    if (!el) return;

    try {
      setIsExporting(true);
      const dataUrl = await exportNodeToPng(el, 4);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [54, 85.6] });
      pdf.addImage(dataUrl, "PNG", 0, 0, 54, 85.6);
      pdf.save(`id-card-${cards[0].employeeId}.pdf`);
      toast.success("PDF downloaded");
    } catch {
      toast.error("PDF download failed");
    } finally {
      setIsExporting(false);
    }
  };

  const downloadA4PDF = async () => {
    try {
      setIsExporting(true);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const cardW = 54;
      const cardH = 85.6;
      const margin = 10;
      const gap = 5;

      for (let i = 0; i < cards.length; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;

        const dataUrl = await exportNodeToPng(el, 4);
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = margin + col * (cardW + gap);
        const y = margin + row * (cardH + gap);

        pdf.setDrawColor(200);
        pdf.setLineWidth(0.1);
        pdf.rect(x, y, cardW, cardH);
        pdf.addImage(dataUrl, "PNG", x, y, cardW, cardH);
      }

      pdf.save("id-cards-a4.pdf");
      toast.success("A4 PDF downloaded");
    } catch {
      toast.error("A4 PDF download failed");
    } finally {
      setIsExporting(false);
    }
  };

  if (mode === "select") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-lg w-full space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              ID Card Generator
            </h1>
            <p className="text-muted-foreground text-sm">
              Unite Solar — Professional Employee ID Cards
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleModeSelect("single")}
              className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-border bg-card p-8 transition-all hover:border-primary hover:shadow-lg"
            >
              <CreditCard className="h-10 w-10 text-primary" />
              <span className="font-semibold text-foreground">Single Card</span>
              <span className="text-xs text-muted-foreground">
                Generate one ID card
              </span>
            </button>
            <button
              onClick={() => handleModeSelect("multiple")}
              className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-border bg-card p-8 transition-all hover:border-primary hover:shadow-lg"
            >
              <LayoutGrid className="h-10 w-10 text-primary" />
              <span className="font-semibold text-foreground">
                Multiple Cards
              </span>
              <span className="text-xs text-muted-foreground">
                A4 sheet — up to 9 cards
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMode("select")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">
              {mode === "single" ? "Single Card" : "Multiple Cards (A4)"}
            </h1>
          </div>
          <div className="flex gap-2">
            {mode === "single" ? (
              <>
                <Button size="sm" variant="outline" onClick={downloadSinglePNG} disabled={isExporting}>
                  <FileImage className="h-4 w-4 mr-1" /> PNG
                </Button>
                <Button size="sm" onClick={downloadSinglePDF} disabled={isExporting}>
                  <FileText className="h-4 w-4 mr-1" /> PDF
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={downloadA4PDF} disabled={isExporting}>
                <Download className="h-4 w-4 mr-1" /> A4 PDF
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {mode === "multiple" && (
              <div className="flex items-center gap-3 mb-2">
                <label className="text-sm font-medium text-foreground">
                  Number of cards:
                </label>
                <Input
                  type="number"
                  min={1}
                  max={9}
                  value={cardCount}
                  onChange={(e) => updateCardCount(Number(e.target.value))}
                  className="w-20"
                />
              </div>
            )}
            <div className="max-h-[75vh] overflow-y-auto space-y-4 pr-2">
              {cards.map((card, i) => (
                <IDCardForm
                  key={i}
                  index={i}
                  data={card}
                  onChange={handleCardChange}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Live Preview
            </h2>
            {mode === "single" ? (
              <div className="flex justify-center">
                <IDCard
                  ref={(el) => {
                    cardRefs.current[0] = el;
                  }}
                  data={cards[0]}
                />
              </div>
            ) : (
              <div
                ref={a4Ref}
                className="bg-card border border-border rounded-xl p-4 overflow-auto"
              >
                <div className="grid grid-cols-3 gap-3 justify-items-center">
                  {cards.map((card, i) => (
                    <IDCard
                      key={i}
                      ref={(el) => {
                        cardRefs.current[i] = el;
                      }}
                      data={card}
                      scale={0.55}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

