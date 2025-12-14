// PDF export utility using jsPDF
import jsPDF from 'jspdf';

interface Expense {
  id: string;
  amount: number;
  description: string | null;
  date: string;
  category: {
    name: string;
  };
}

interface ExportData {
  expenses: Expense[];
  total: number;
  currency: string;
  startDate: string;
  endDate: string;
  userName: string;
}

/**
 * Generate PDF report from expense data
 */
export function generatePDF(data: ExportData): void {
  const doc = new jsPDF();
  let yPosition = 20;

  // Title
  doc.setFontSize(20);
  doc.text('SpendWise Expense Report', 14, yPosition);
  yPosition += 10;

  // User and date range
  doc.setFontSize(12);
  doc.text(`User: ${data.userName}`, 14, yPosition);
  yPosition += 7;
  doc.text(
    `Period: ${new Date(data.startDate).toLocaleDateString()} - ${new Date(data.endDate).toLocaleDateString()}`,
    14,
    yPosition
  );
  yPosition += 15;

  // Table header
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Date', 14, yPosition);
  doc.text('Category', 50, yPosition);
  doc.text('Description', 90, yPosition);
  doc.text('Amount', 170, yPosition);
  yPosition += 7;

  // Table rows
  doc.setFont(undefined, 'normal');
  data.expenses.forEach((expense) => {
    if (yPosition > 270) {
      // New page if needed
      doc.addPage();
      yPosition = 20;
    }

    const date = new Date(expense.date).toLocaleDateString();
    const category = expense.category.name;
    const description = expense.description || '-';
    const amount = `${data.currency} ${expense.amount.toFixed(2)}`;

    doc.text(date, 14, yPosition);
    doc.text(category, 50, yPosition);
    doc.text(description.substring(0, 30), 90, yPosition); // Truncate if too long
    doc.text(amount, 170, yPosition);
    yPosition += 7;
  });

  // Total
  yPosition += 5;
  doc.setFont(undefined, 'bold');
  doc.text(
    `Total: ${data.currency} ${data.total.toFixed(2)}`,
    14,
    yPosition
  );

  // Save PDF
  doc.save(`SpendWise-Report-${data.startDate}-${data.endDate}.pdf`);
}

/**
 * Generate WhatsApp share link (opens WhatsApp with pre-filled message)
 */
export function generateWhatsAppLink(data: ExportData): string {
  const totalFormatted = `${data.currency} ${data.total.toFixed(2)}`;
  const period = `${new Date(data.startDate).toLocaleDateString()} - ${new Date(data.endDate).toLocaleDateString()}`;
  const message = `SpendWise Expense Report\n\nPeriod: ${period}\nTotal Expenses: ${totalFormatted}\nNumber of transactions: ${data.expenses.length}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Generate email share link
 */
export function generateEmailLink(data: ExportData): string {
  const totalFormatted = `${data.currency} ${data.total.toFixed(2)}`;
  const period = `${new Date(data.startDate).toLocaleDateString()} - ${new Date(data.endDate).toLocaleDateString()}`;
  const subject = 'SpendWise Expense Report';
  const body = `SpendWise Expense Report\n\nPeriod: ${period}\nTotal Expenses: ${totalFormatted}\nNumber of transactions: ${data.expenses.length}`;
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
