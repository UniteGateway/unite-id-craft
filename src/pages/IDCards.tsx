import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import IDCard, { type IDCardData } from "@/components/IDCard";
import IDCardForm from "@/components/IDCardForm";
import { useUndoableState } from "@/hooks/useUndoableState";
import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  downloadCanvasAsPng,
  ID_CARD_EXPORT_SIZE_MM,
  renderIdCardCanvas,
} from "@/lib/id-card-export";
import {
  CreditCard,
  LayoutGrid,
  Download,
  ArrowLeft,
  FileImage,
  FileText,
  Upload,
  Sparkles,
} from "lucide-react";
import uniteSolarLogoSrc from "@/assets/unite-solar-logo.png";
import TemplateManager from "@/components/TemplateManager";
import AppNav from "@/components/AppNav";
import PageBanner, { BANNERS } from "@/components/PageBanner";

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
  const {
    value: cards,
    setValue: setCards,
    replaceValue: replaceCards,
  } = useUndoableState<IDCardData[]>([emptyCard(0)]);
  const [cardCount, setCardCount] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [showCardCountInput, setShowCardCountInput] = useState(false);
  const [tempCardCount, setTempCardCount] = useState("1");
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleCardChange = useCallback((idx: number, data: IDCardData) => {
    setCards((prev) => {
      const next = [...prev];
      next[idx] = data;
      return next;
    });
  }, [setCards]);

  const handleModeSelect = (nextMode: "single" | "multiple") => {
    if (nextMode === "single") {
      setMode("single");
      replaceCards([emptyCard(0)]);
      setCardCount(1);
      return;
    }
    // For multiple, show card count input first
    setShowCardCountInput(true);
    setTempCardCount("1");
  };

  const confirmMultipleCards = () => {
    const count = Math.min(100, Math.max(1, parseInt(tempCardCount) || 1));
    setCardCount(count);
    replaceCards(Array.from({ length: count }, (_, idx) => emptyCard(idx)));
    setShowCardCountInput(false);
    setMode("multiple");
  };

  const updateCardCount = (count: number) => {
    const safeCount = Math.min(100, Math.max(1, count));
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
      if (!barcodeElement) return;
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
        // Ignore
      }
    });
  }, [cards]);

  const downloadSinglePNG = async () => {
    try {
      setIsExporting(true);
      const canvas = await renderIdCardCanvas(cards[0], 4);
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
      const canvas = await renderIdCardCanvas(cards[0], 4);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [ID_CARD_EXPORT_SIZE_MM.width, ID_CARD_EXPORT_SIZE_MM.height],
      });
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0, 0,
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
      const margin = 10;
      const gap = 5;
      const cardWidth = ID_CARD_EXPORT_SIZE_MM.width;
      const cardHeight = ID_CARD_EXPORT_SIZE_MM.height;
      const cols = 3;
      const rows = 3;
      const cardsPerPage = cols * rows;
      const totalPages = Math.ceil(cards.length / cardsPerPage);
      // Total slots = full pages worth, so empty slots on last page are blank
      const totalSlots = totalPages * cardsPerPage;

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      for (let i = 0; i < totalSlots; i++) {
        const pageIndex = Math.floor(i / cardsPerPage);
        const slotOnPage = i % cardsPerPage;
        const column = slotOnPage % cols;
        const row = Math.floor(slotOnPage / cols);

        if (i > 0 && slotOnPage === 0) {
          pdf.addPage();
        }

        const x = margin + column * (cardWidth + gap);
        const y = margin + row * (cardHeight + gap);

        pdf.setDrawColor(200);
        pdf.setLineWidth(0.1);
        pdf.rect(x, y, cardWidth, cardHeight);

        if (i < cards.length) {
          const canvas = await renderIdCardCanvas(cards[i], 3);
          pdf.addImage(canvas.toDataURL("image/png"), "PNG", x, y, cardWidth, cardHeight);
        }
      }

      pdf.save("id-cards-a4.pdf");
      toast.success(`A4 PDF downloaded (${totalPages} page${totalPages > 1 ? "s" : ""})`);
    } catch (error) {
      console.error(error);
      toast.error("A4 PDF download failed");
    } finally {
      setIsExporting(false);
    }
  };

  // Card count input modal for multiple mode
  if (showCardCountInput) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-sm w-full space-y-6 text-center">
          <div className="space-y-2">
            <LayoutGrid className="h-10 w-10 text-primary mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">How many cards?</h2>
            <p className="text-muted-foreground text-sm">Enter the number of ID cards to generate (1–100)</p>
          </div>
          <Input
            type="number"
            min={1}
            max={100}
            value={tempCardCount}
            onChange={(e) => setTempCardCount(e.target.value)}
            className="text-center text-2xl font-bold h-14"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && confirmMultipleCards()}
          />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowCardCountInput(false)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button className="flex-1" onClick={confirmMultipleCards}>
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Landing / select page
  if (mode === "select") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppNav />
        <div className="mx-auto max-w-5xl w-full px-4 pt-4">
          <PageBanner
            image={BANNERS.idCards}
            eyebrow="Employee ID Cards"
            icon={<CreditCard className="h-3.5 w-3.5" />}
            title="Professional ID Card Generator"
            subtitle="Create single or bulk Unite Solar employee badges with barcodes — print-ready in 300 DPI."
            height="md"
          />
        </div>
        {/* Logo top center */}
        <div className="flex justify-center pt-6 pb-2">
          <img src={uniteSolarLogoSrc} alt="Unite Solar" className="h-16 object-contain" />
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full space-y-8 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">ID Card Generator</h1>
              <p className="text-muted-foreground text-sm">Professional Employee ID Cards</p>
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
                <span className="text-xs text-muted-foreground">A4 sheet — choose 1 to 100 cards</span>
              </button>
            </div>

            {/* Template Manager */}
            <TemplateManager />
          </div>
        </div>

        {/* Powered by footer */}
        <footer className="py-4 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by{" "}
            <span className="font-semibold text-foreground">Unite Developers Global Inc</span>
          </p>
        </footer>
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
              {mode === "single" ? "Single Card" : `Multiple Cards (${cardCount})`}
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
                  max={100}
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
                  ref={(el) => { cardRefs.current[0] = el; }}
                  data={cards[0]}
                  onChange={(next) => handleCardChange(0, next)}
                />
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-4 overflow-auto">
                <div className="grid grid-cols-3 gap-3 justify-items-center">
                  {cards.map((card, index) => (
                    <IDCard
                      key={index}
                      ref={(el) => { cardRefs.current[index] = el; }}
                      data={card}
                      scale={0.55}
                      onChange={(next) => handleCardChange(index, next)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center border-t border-border mt-8">
        <p className="text-xs text-muted-foreground">
          Powered by <span className="font-semibold text-foreground">Unite Developers Global Inc</span>
        </p>
      </footer>
    </div>
  );
};

export default Index;
