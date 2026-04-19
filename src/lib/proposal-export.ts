// Render the on-screen #proposal-doc element to a multi-page A4 PDF.
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportProposalPdf(filename: string) {
  const root = document.getElementById("proposal-doc");
  if (!root) throw new Error("Proposal element not found");
  const pages = Array.from(root.querySelectorAll<HTMLElement>(".pdf-page"));
  if (!pages.length) throw new Error("No pages to export");

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pages.length; i++) {
    const canvas = await html2canvas(pages[i], {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });
    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight, undefined, "FAST");
  }
  pdf.save(filename);
}
