import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";

interface Quotation {
    quotationNumber: string;
    issueDate: string;
    validUntil: string;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    notes: string;
    terms: string;
}

interface QuotationLine {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    lineTotal: number;
}

interface Client {
    name: string;
    nameUrdu: string | null;
    address: string;
    city: string;
    phone: string;
    ntnNumber: string;
}

interface Company {
    name: string;
    nameUrdu: string | null;
    address: string;
    city: string;
    phone: string;
    email: string;
    ntnNumber: string;
    strnNumber: string;
}

const formatCurrencyPKR = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount) + " PKR";
};

export const generateQuotationDoc = async (
    quotation: Quotation,
    lines: QuotationLine[],
    client: Client,
    company: Company | null
) => {
    // Colors
    const PRIMARY_COLOR = "2F5496"; // Dark Blue

    const rows = [
        new TableRow({
            children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "#", bold: true, color: "FFFFFF" })] })], width: { size: 5, type: WidthType.PERCENTAGE }, shading: { fill: PRIMARY_COLOR, color: "auto" } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Description", bold: true, color: "FFFFFF" })] })], width: { size: 45, type: WidthType.PERCENTAGE }, shading: { fill: PRIMARY_COLOR, color: "auto" } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Qty", bold: true, color: "FFFFFF" })], alignment: AlignmentType.RIGHT })], width: { size: 10, type: WidthType.PERCENTAGE }, shading: { fill: PRIMARY_COLOR, color: "auto" } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Rate", bold: true, color: "FFFFFF" })], alignment: AlignmentType.RIGHT })], width: { size: 20, type: WidthType.PERCENTAGE }, shading: { fill: PRIMARY_COLOR, color: "auto" } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Amount", bold: true, color: "FFFFFF" })], alignment: AlignmentType.RIGHT })], width: { size: 20, type: WidthType.PERCENTAGE }, shading: { fill: PRIMARY_COLOR, color: "auto" } }),
            ],
        }),
    ];

    lines.forEach((line, index) => {
        rows.push(
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph(String(index + 1))] }),
                    new TableCell({ children: [new Paragraph(line.description)] }),
                    new TableCell({ children: [new Paragraph({ text: String(line.quantity), alignment: AlignmentType.RIGHT })] }),
                    new TableCell({ children: [new Paragraph({ text: formatCurrencyPKR(line.unitPrice), alignment: AlignmentType.RIGHT })] }),
                    new TableCell({ children: [new Paragraph({ text: formatCurrencyPKR(line.lineTotal), alignment: AlignmentType.RIGHT })] }),
                ],
            })
        );
    });

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    // Header Section
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE } },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [
                                            new Paragraph({ children: [new TextRun({ text: company?.name || "Company Name", bold: true, color: PRIMARY_COLOR, size: 28 })] }),
                                            new Paragraph(company?.address || ""),
                                            new Paragraph(company?.city || ""),
                                            new Paragraph(`Phone: ${company?.phone || ""}`),
                                            new Paragraph(`Email: ${company?.email || ""}`),
                                            new Paragraph(company?.ntnNumber ? `NTN: ${company.ntnNumber}` : ""),
                                        ],
                                        width: { size: 60, type: WidthType.PERCENTAGE },
                                    }),
                                    new TableCell({
                                        children: [
                                            new Paragraph({ children: [new TextRun({ text: "QUOTATION", bold: true, color: PRIMARY_COLOR, size: 32 })], alignment: AlignmentType.RIGHT }),
                                            new Paragraph({ text: `Date: ${new Date(quotation.issueDate).toLocaleDateString()}`, alignment: AlignmentType.RIGHT }),
                                            new Paragraph({ children: [new TextRun({ text: `Quote No: ${quotation.quotationNumber}`, bold: true })], alignment: AlignmentType.RIGHT }),
                                            new Paragraph({ text: `Valid Until: ${quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : 'N/A'}`, alignment: AlignmentType.RIGHT }),
                                        ],
                                        width: { size: 40, type: WidthType.PERCENTAGE },
                                    }),
                                ],
                            }),
                        ],
                    }),
                    new Paragraph({ text: "" }), // Spacer

                    // Bill To Section
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE } },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [
                                            new Paragraph({ children: [new TextRun({ text: "Billed To", bold: true, color: PRIMARY_COLOR })] }),
                                            new Paragraph({ children: [new TextRun({ text: client.name, bold: true })] }),
                                            new Paragraph(client.address || ""),
                                            new Paragraph(client.city || ""),
                                            new Paragraph(client.phone || ""),
                                        ],
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                    }),
                                    new TableCell({ children: [], width: { size: 50, type: WidthType.PERCENTAGE } })
                                ]
                            })
                        ]
                    }),
                    new Paragraph({ text: "" }), // Spacer

                    // Items Table
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: rows,
                    }),
                    new Paragraph({ text: "" }), // Spacer

                    // Totals Section
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE } },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [], width: { size: 60, type: WidthType.PERCENTAGE } }),
                                    new TableCell({
                                        children: [
                                            new Paragraph({ text: `Subtotal: ${formatCurrencyPKR(quotation.subtotal)}`, alignment: AlignmentType.RIGHT }),
                                            new Paragraph({ text: `Tax: ${formatCurrencyPKR(quotation.taxAmount)}`, alignment: AlignmentType.RIGHT }),
                                            new Paragraph({ text: `Discount: ${formatCurrencyPKR(quotation.discountAmount)}`, alignment: AlignmentType.RIGHT }),
                                            new Paragraph({ children: [new TextRun({ text: `TOTAL: ${formatCurrencyPKR(quotation.total)}`, bold: true, size: 24, color: PRIMARY_COLOR })], alignment: AlignmentType.RIGHT }),
                                        ],
                                        width: { size: 40, type: WidthType.PERCENTAGE },
                                    }),
                                ],
                            }),
                        ],
                    }),
                    new Paragraph({ text: "" }), // Spacer

                    // Notes & Terms
                    new Paragraph({ children: [new TextRun({ text: "Notes", bold: true, color: PRIMARY_COLOR })] }),
                    new Paragraph(quotation.notes || "None"),
                    new Paragraph({ text: "" }),
                    new Paragraph({ children: [new TextRun({ text: "Terms & Conditions", bold: true, color: PRIMARY_COLOR })] }),
                    new Paragraph(quotation.terms || "None"),

                    new Paragraph({ text: "" }),
                    new Paragraph({ children: [new TextRun({ text: "Thank you for your business!", bold: true, color: "808080" })], alignment: AlignmentType.CENTER }),
                ],
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Quotation_${quotation.quotationNumber}.docx`);
};
