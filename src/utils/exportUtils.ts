import * as XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileRecord } from '../types';

export const exportToExcel = (data: FileRecord[], year?: number) => {
  try {
    let exportData = data;
    if (year) {
      exportData = data.filter(item => {
        const startYear = item.startDate ? new Date(item.startDate).getFullYear() : null;
        return startYear === year;
      });
    }

    // Formatear los datos para la exportación
    const formattedData = exportData.map(item => ({
      'No. ITEM': item.itemNumber,
      'CÓDIGO': item.code || '-',
      'NOMBRE DE LAS SERIES': item.name,
      'FECHA INICIAL': item.startDate || '-',
      'FECHA FINAL': item.endDate || '-',
      'UNIDAD DE CONSERVACIÓN': item.storageUnit,
      'FOLIO INICIAL': item.folioStart,
      'FOLIO FINAL': item.folioEnd,
      'BLOQUE': item.block || '-',
      'ENTREPAÑO': item.shelf || '-',
      'SOPORTE': item.support,
      'ESTADO': item.status,
      'PRESTADO A': item.borrowedTo || '-',
      'FECHA DE PRÉSTAMO': item.borrowedDate || '-',
      'FECHA DE DEVOLUCIÓN': item.returnDate || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Archivos");

    // Ajustar el ancho de las columnas
    const maxWidth = formattedData.reduce((acc, row) => {
      Object.keys(row).forEach(key => {
        const length = String(row[key]).length;
        acc[key] = Math.max(acc[key] || 0, length);
      });
      return acc;
    }, {} as Record<string, number>);

    worksheet['!cols'] = Object.keys(maxWidth).map(key => ({
      wch: Math.min(maxWidth[key] + 2, 50)
    }));

    XLSX.writeFile(workbook, `archivos${year ? `_${year}` : ''}.xlsx`);
  } catch (error) {
    console.error('Error exportando a Excel:', error);
    throw error;
  }
};

export const exportToPDF = (data: FileRecord[], year?: number) => {
  try {
    let exportData = data;
    if (year) {
      exportData = data.filter(item => {
        const startYear = item.startDate ? new Date(item.startDate).getFullYear() : null;
        return startYear === year;
      });
    }

    const doc = new jsPDF();
    
    // Agregar encabezado
    doc.setFontSize(16);
    doc.text('Registro de Archivos', 14, 15);
    if (year) {
      doc.setFontSize(12);
      doc.text(`Año: ${year}`, 14, 25);
    }

    autoTable(doc, {
      startY: year ? 30 : 20,
      head: [['No.', 'CÓDIGO', 'NOMBRE', 'F. INICIAL', 'F. FINAL', 'UNIDAD', 'FOLIOS', 'SOPORTE', 'ESTADO', 'PRESTADO A']],
      body: exportData.map(item => [
        item.itemNumber,
        item.code || '-',
        item.name,
        item.startDate || '-',
        item.endDate || '-',
        item.storageUnit,
        `${item.folioStart}-${item.folioEnd}`,
        item.support,
        item.status,
        item.borrowedTo || '-'
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { 
        fillColor: [16, 185, 129],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 20 },
      theme: 'grid'
    });

    doc.save(`archivos${year ? `_${year}` : ''}.pdf`);
  } catch (error) {
    console.error('Error exportando a PDF:', error);
    throw error;
  }
};