import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import IDCard, { type IDCardData } from "@/components/IDCard";
import IDCardForm from "@/components/IDCardForm";
import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  downloadCanvasAsPng,
  ID_CARD_EXPORT_SIZE_MM,
  renderIdCardCanvas,
} from "@/lib/id-card-export";
import { CreditCard, LayoutGrid, Download, ArrowLeft, FileImage, FileText } from "lucide-react";

const generateId = (idx: number) => `US-BA-${String(idx + 1).padStart(3, "0")}`;

const emptyCard = (idx: number): IDCardData => ({
  name: "",
  designation: "",
  employeeId: generateId(idx),
  photo: null,
});

type Mode = "select" | "single" | "multiple";

const Index: React.FC = () => {
  const [mode, setMode] = useState<Mode>("select");
  const [cards, setCards] = useState<IDCardData[]>([emptyCard(0)]);
  const [cardCount, setCardCount] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleCardChange = useCallback((idx: number, data: IDCardData) => {
    setCards((prev) => {
      const next = [...prev];
      next[idx] = data;
      return next;
    });
  }, []);

  const handleModeSelect = (nextMode: "single" | "multiple") => {
    setMode(nextMode);
    if (nextMode === "single") {
      setCards([emptyCard(0)]);
      setCardCount(1);
      return;
    }

    setCards(Array.from({ length: 9 }, (_, idx) => emptyCard(idx)));
    setCardCount(9);
  };

  const updateCardCount = (count: number) => {
    const safeCount = Math.min(9, Math.max(1, count));
    setCardCount(safeCount);
    setCards((prev) => {
      const next = [...prev];
      while (next.length < safeCount) {
        next.push(emptyCard(next.length));
      }
      return next.slice(0, safeCount);
    });
  };

  useEffect(() => {
    cards.forEach((card) => {
      const barcodeElement = document.getElementById(`barcode-${card.employeeId}`);
      if (!barcodeElement) {
        return;
      }

      try {
        JsBarcode(barcodeElement, card.employeeId || "US-BA-001", {
          format: "CODE128",
          displayValue: false,
          height: 40,
          margin: 0,
          background: "transparent",
          lineColor: "#ffffff",
        });
      } catch {
        // Ignore preview barcode errors for incomplete values.
      }
    });
  }, [cards]);

  const downloadSinglePNG = async () => {
    try {
      setIsExporting(true);
      const canvas = await renderIdCardCanvas(cards[0]);
      await downloadCanvasAsPng(canvas, `id-card-${cards[0].employeeId}.png`);
      toast.success("PNG downloaded");
    } catch (error) {
      console.error(error);
      toast.error("PNG download failed");
    } finally {
      setIsExporting(false);
    }
  };

  const downloadSinglePDF = async () => {
    try {
      setIsExporting(true);
      const canvas = await renderIdCardCanvas(cards[0]);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [ID_CARD_EXPORT_SIZE_MM.width, ID_CARD_EXPORT_SIZE_MM.height],
      });

      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        ID_CARD_EXPORT_SIZE_MM.width,
        ID_CARD_EXPORT_SIZE_MM.height,
      );
      pdf.save(`id-card-${cards[0].employeeId}.pdf`);
      toast.success("PDF downloaded");
    } catch (error) {
      console.error(error);
      toast.error("PDF download failed");
    } finally {
      setIsExporting(false);
    }
  };

  const downloadA4PDF = async () => {
    try {
      setIsExporting(true);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const margin = 10;
      const gap = 5;
      const cardWidth = ID_CARD_EXPORT_SIZE_MM.width;
      const cardHeight = ID_CARD_EXPORT_SIZE_MM.height;

      const totalSlots = 9;
      for (let index = 0; index < totalSlots; index += 1) {
        const column = index % 3;
        const row = Math.floor(index / 3);
        const x = margin + column * (cardWidth + gap);
        const y = margin + row * (cardHeight + gap);

        pdf.setDrawColor(200);
        pdf.setLineWidth(0.1);
        pdf.rect(x, y, cardWidth, cardHeight);

        if (index < cards.length) {
          const canvas = await renderIdCardCanvas(cards[index]);
          pdf.addImage(canvas.toDataURL("image/png"), "PNG", x, y, cardWidth, cardHeight);
        }
      }

      pdf.save("id-cards-a4.pdf");
      toast.success("A4 PDF downloaded");
    } catch (error) {
      console.error(error);
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
            <h1 className="text-3xl font-bold text-foreground">ID Card Generator</h1>
            <p className="text-muted-foreground text-sm">Unite Solar — Professional Employee ID Cards</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleModeSelect("single")}
              className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-border bg-card p-8 transition-all hover:border-primary hover:shadow-lg"
            >
              <CreditCard className="h-10 w-10 text-primary" />
              <span className="font-semibold text-foreground">Single Card</span>
              <span className="text-xs text-muted-foreground">Generate one ID card</span>
            </button>
            <button
              onClick={() => handleModeSelect("multiple")}
              className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-border bg-card p-8 transition-all hover:border-primary hover:shadow-lg"
            >
              <LayoutGrid className="h-10 w-10 text-primary" />
              <span className="font-semibold text-foreground">Multiple Cards</span>
              <span className="text-xs text-muted-foreground">A4 sheet — up to 9 cards</span>
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
            <Button variant="ghost" size="icon" onClick={() => setMode("select")}>
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
                <label className="text-sm font-medium text-foreground">Number of cards:</label>
                <Input
                  type="number"
                  min={1}
                  max={9}
                  value={cardCount}
                  onChange={(event) => updateCardCount(Number(event.target.value))}
                  className="w-20"
                />
              </div>
            )}

            <div className="max-h-[75vh] overflow-y-auto space-y-4 pr-2">
              {cards.map((card, index) => (
                <IDCardForm key={index} index={index} data={card} onChange={handleCardChange} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Live Preview</h2>
            {mode === "single" ? (
              <div className="flex justify-center">
                <IDCard
                  ref={(element) => {
                    cardRefs.current[0] = element;
                  }}
                  data={cards[0]}
                />
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-4 overflow-auto">
                <div className="grid grid-cols-3 gap-3 justify-items-center">
                  {cards.map((card, index) => (
                    <IDCard
                      key={index}
                      ref={(element) => {
                        cardRefs.current[index] = element;
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
