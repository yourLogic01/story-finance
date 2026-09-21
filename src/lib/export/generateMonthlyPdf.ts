import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MonthlyRecapData } from "@/app/actions/recap";
import { formatIDR } from "@/lib/utils/currency";
import { formatDisplayDate } from "@/lib/utils/date";

export function generateMonthlyPdf(recapData: MonthlyRecapData): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182 mm
  let yPos = 16;

  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // -------------------------------------------------------------
  // 1. HEADER DOKUMEN
  // -------------------------------------------------------------
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, yPos, contentWidth, 22, "F");

  // Title left
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("STORY FINANCE", margin + 5, yPos + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Laporan & Evaluasi Keuangan Bulanan", margin + 5, yPos + 12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.text(`Periode: ${recapData.monthName}`, margin + 5, yPos + 17);

  // Metadata right
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`Pengguna: ${recapData.userDisplayName}`, pageWidth - margin - 5, yPos + 7, { align: "right" });
  if (recapData.userEmail) {
    doc.text(recapData.userEmail, pageWidth - margin - 5, yPos + 12, { align: "right" });
  }
  doc.setTextColor(148, 163, 184);
  doc.text(`Tanggal Cetak: ${currentDate}`, pageWidth - margin - 5, yPos + 17, { align: "right" });

  yPos += 27;

  // -------------------------------------------------------------
  // 2. RINGKASAN ARUS KAS & TABUNGAN (4 KOTAK)
  // -------------------------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("1. RINGKASAN ARUS KAS & TABUNGAN", margin, yPos);
  yPos += 4;

  const cardWidth = (contentWidth - 9) / 4; // 4 cards with 3mm gap
  const cardHeight = 15;

  const cashflowCards = [
    { label: "Total Pemasukan", value: formatIDR(recapData.totalIncome), color: [5, 150, 105] }, // emerald-600
    { label: "Total Pengeluaran", value: formatIDR(recapData.totalExpenses), color: [225, 29, 72] }, // rose-600
    {
      label: "Sisa Dana (Net)",
      value: formatIDR(recapData.netSavings),
      color: recapData.netSavings >= 0 ? [5, 150, 105] : [225, 29, 72],
    },
    { label: "Rasio Tabungan", value: `${recapData.savingsRate}%`, color: [37, 99, 235] }, // blue-600
  ];

  cashflowCards.forEach((card, i) => {
    const x = margin + i * (cardWidth + 3);
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(x, yPos, cardWidth, cardHeight, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(card.label, x + 3, yPos + 4.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(card.color[0], card.color[1], card.color[2]);
    doc.text(card.value, x + 3, yPos + 10.5);
  });

  yPos += cardHeight + 4;

  // Habit Bar (Konsistensi & Hari Tanpa Belanja)
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, yPos, contentWidth, 9, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  const colWidth = contentWidth / 3;
  doc.text(
    `Konsistensi: ${recapData.totalLoggedDays} dari ${recapData.daysPassed} hari (${recapData.consistencyRate}%)`,
    margin + 4,
    yPos + 5.5
  );
  doc.text(
    `Hari Tanpa Belanja: ${recapData.noSpendDaysCount} hari`,
    margin + colWidth + 4,
    yPos + 5.5
  );
  const topCatText = recapData.topExpenseCategory
    ? `Pos Terbesar: ${recapData.topExpenseCategory.name} (${recapData.topExpenseCategory.percentage}%)`
    : "Pos Terbesar: -";
  doc.text(topCatText, margin + colWidth * 2 + 4, yPos + 5.5);

  yPos += 14;

  // -------------------------------------------------------------
  // 3. REALISASI ANGGARAN PER KATEGORI (TABLE)
  // -------------------------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("2. REALISASI ANGGARAN PER KATEGORI", margin, yPos);
  if (recapData.totalBudget !== null && recapData.totalBudget > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`(Batas Total: ${formatIDR(recapData.totalBudget)})`, margin + 68, yPos);
  }
  yPos += 2.5;

  const budgetRows =
    recapData.budgetBreakdowns && recapData.budgetBreakdowns.length > 0
      ? recapData.budgetBreakdowns.map((b) => [
          b.categoryName,
          formatIDR(b.targetAmount),
          formatIDR(b.spentAmount),
          formatIDR(b.remainingAmount),
          `${b.percentageUsed}%`,
        ])
      : [["Belum ada batasan anggaran khusus yang ditentukan pada periode ini.", "-", "-", "-", "-"]];

  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: margin, bottom: 15 },
    head: [["Pos Kategori", "Batas Anggaran", "Realisasi", "Sisa Anggaran", "% Pakai"]],
    body: budgetRows,
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: "bold",
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { halign: "right", cellWidth: 32 },
      2: { halign: "right", cellWidth: 32 },
      3: { halign: "right", cellWidth: 35 },
      4: { halign: "center", cellWidth: 28 },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
        const valStr = String(data.cell.raw);
        const valNum = parseInt(valStr, 10);
        if (!isNaN(valNum)) {
          if (valNum > 100) data.cell.styles.textColor = [225, 29, 72];
          else if (valNum >= 85) data.cell.styles.textColor = [217, 119, 6];
          else data.cell.styles.textColor = [5, 150, 105];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  // @ts-expect-error autoTable adds lastAutoTable to doc
  yPos = doc.lastAutoTable.finalY + 6;

  // -------------------------------------------------------------
  // 4. ALOKASI SELF-REWARD (APRESIASI DIRI)
  // -------------------------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("3. ALOKASI BELANJA APRESIASI DIRI (SELF-REWARD)", margin, yPos);
  yPos += 2.5;

  let selfRewardBody: string[][];
  if (recapData.selfReward && (recapData.selfReward.configured || recapData.selfReward.spent > 0)) {
    selfRewardBody = [
      [
        recapData.selfReward.configured ? formatIDR(recapData.selfReward.limit) : "Fleksibel",
        formatIDR(recapData.selfReward.spent),
        recapData.selfReward.configured ? formatIDR(recapData.selfReward.remaining) : "-",
        recapData.selfReward.configured ? `${recapData.selfReward.percentageUsed}%` : "Sesuai kebutuhan",
      ],
    ];
  } else {
    selfRewardBody = [
      ["Tidak ada pengeluaran atau kuota khusus untuk pos Self-Reward bulan ini.", "-", "-", "-"],
    ];
  }

  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: margin, bottom: 15 },
    head: [["Batas Alokasi", "Realisasi Terpakai", "Sisa Kuota Aman", "% Pemakaian"]],
    body: selfRewardBody,
    theme: "grid",
    headStyles: {
      fillColor: [217, 119, 6], // amber-600
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: "bold",
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 45, halign: "left" },
      1: { cellWidth: 45, halign: "right" },
      2: { cellWidth: 46, halign: "right" },
      3: { cellWidth: 46, halign: "center" },
    },
  });

  // @ts-expect-error autoTable adds lastAutoTable to doc
  yPos = doc.lastAutoTable.finalY + 6;

  // -------------------------------------------------------------
  // 5. CELENGAN VIRTUAL & BARANG IMPIAN (WISHLIST)
  // -------------------------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("4. CELENGAN VIRTUAL & BARANG IMPIAN (WISHLIST BAG)", margin, yPos);
  if (recapData.wishlist) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(5, 150, 105);
    doc.text(`(Total Tersimpan: ${formatIDR(recapData.wishlist.totalSaved)})`, margin + 98, yPos);
  }
  yPos += 2.5;

  const wishlistRows =
    recapData.wishlist && recapData.wishlist.activeItems.length > 0
      ? recapData.wishlist.activeItems.map((item) => [
          item.name,
          formatIDR(item.targetAmount),
          formatIDR(item.savedAmount),
          `${item.percentage}%`,
        ])
      : [["Belum ada barang impian yang sedang ditabung aktif.", "-", "-", "-"]];

  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: margin, bottom: 15 },
    head: [["Nama Barang Impian", "Target Harga", "Terkumpul", "Progres"]],
    body: wishlistRows,
    theme: "grid",
    headStyles: {
      fillColor: [13, 148, 136], // teal-600
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: "bold",
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 42, halign: "right" },
      2: { cellWidth: 42, halign: "right" },
      3: { cellWidth: 38, halign: "center" },
    },
  });

  // @ts-expect-error autoTable adds lastAutoTable to doc
  yPos = doc.lastAutoTable.finalY + 4;

  // Purchased wishlist note if any
  if (recapData.wishlist && recapData.wishlist.purchasedItemsThisMonth.length > 0) {
    const purchasedList = recapData.wishlist.purchasedItemsThisMonth
      .map((p) => `${p.name} (${formatIDR(p.amount)})`)
      .join(", ");
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(167, 243, 208); // emerald-200
    doc.roundedRect(margin, yPos, contentWidth, 7, 1, 1, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(6, 95, 70);
    doc.text(`Barang impian berhasil ditebus bulan ini: ${purchasedList}`, margin + 3, yPos + 4.5);
    yPos += 10;
  } else {
    yPos += 2;
  }

  // -------------------------------------------------------------
  // 6. CATATAN EVALUASI BULANAN
  // -------------------------------------------------------------
  if (yPos > pageHeight - 35) {
    doc.addPage();
    yPos = 16;
  }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, yPos, contentWidth, 14, 1.5, 1.5, "FD");

  // Emerald left accent bar
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(margin, yPos, 2, 14, 0.5, 0.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("CATATAN EVALUASI BULANAN", margin + 5, yPos + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  const splitAdvice = doc.splitTextToSize(recapData.summaryAdvice, contentWidth - 10);
  doc.text(splitAdvice, margin + 5, yPos + 9);

  yPos += 18;

  // -------------------------------------------------------------
  // 7. RINCIAN RIWAYAT TRANSAKSI LENGKAP (ITEMIZED HISTORY)
  // -------------------------------------------------------------
  // If remaining space on this page is small, start transactions on a new page
  if (yPos > pageHeight - 45) {
    doc.addPage();
    yPos = 16;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("5. RINCIAN RIWAYAT TRANSAKSI BULAN INI", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`(${recapData.transactions.length} Transaksi Dicatat)`, margin + 76, yPos);
  yPos += 2.5;

  const transactionRows =
    recapData.transactions && recapData.transactions.length > 0
      ? recapData.transactions.map((tx) => [
          formatDisplayDate(tx.date) || tx.date,
          tx.categoryName,
          tx.note || "-",
          tx.type === "income" ? "Pemasukan" : "Pengeluaran",
          tx.type === "income" ? `+${formatIDR(tx.amount)}` : `-${formatIDR(tx.amount)}`,
        ])
      : [["Belum ada transaksi yang dicatat pada periode ini.", "-", "-", "-", "-"]];

  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: margin, bottom: 15 },
    head: [["Tanggal", "Kategori", "Catatan / Keterangan", "Tipe", "Nominal"]],
    body: transactionRows,
    theme: "striped",
    headStyles: {
      fillColor: [15, 23, 42], // slate-900
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: "bold",
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 35 },
      2: { cellWidth: 60 },
      3: { cellWidth: 22, halign: "center" },
      4: { cellWidth: 33, halign: "right" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
        const valStr = String(data.cell.raw);
        if (valStr.startsWith("+")) {
          data.cell.styles.textColor = [5, 150, 105]; // emerald-600
        } else if (valStr.startsWith("-")) {
          data.cell.styles.textColor = [225, 29, 72]; // rose-600
        }
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  // -------------------------------------------------------------
  // 8. FOOTER HALAMAN (PAGINATION) PADA SETIAP HALAMAN
  // -------------------------------------------------------------
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = pageHeight - 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("Story Finance — Catatan Keuangan & Petualangan Pribadi", margin, footerY);
    doc.text(
      `Halaman ${i} dari ${totalPages} • Dokumen resmi diunduh pada ${currentDate}`,
      pageWidth - margin,
      footerY,
      { align: "right" }
    );
  }

  // Directly trigger download in browser!
  const sanitizedMonth = recapData.monthName.toLowerCase().replace(/\s+/g, "-");
  doc.save(`Laporan-Keuangan-${sanitizedMonth}.pdf`);
}
