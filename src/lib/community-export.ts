import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/** Export every .pdf-page child of #community-deck to a multi-page A4 landscape PDF. */
export async function exportCommunityDeckPdf(filename: string) {
  const root = document.getElementById("community-deck");
  if (!root) throw new Error("Community deck not found");
  const pages = Array.from(root.querySelectorAll<HTMLElement>(".pdf-page"));
  if (!pages.length) throw new Error("No slides to export");

  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pages.length; i++) {
    const canvas = await html2canvas(pages[i], {
      scale: 2, useCORS: true, backgroundColor: "#0b0d12", logging: false,
    });
    const img = canvas.toDataURL("image/jpeg", 0.92);
    if (i > 0) pdf.addPage("a4", "landscape");
    pdf.addImage(img, "JPEG", 0, 0, w, h, undefined, "FAST");
  }
  pdf.save(filename);
}