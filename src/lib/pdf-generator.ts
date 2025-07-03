import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ItineraryType, DayItineraryType, AccommodationType, TransportationType, BudgetBreakdownType } from '@/types';

// PDF Generation Configuration
interface PDFConfig {
  pageSize: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  fonts: {
    title: { size: number; style: 'normal' | 'bold' };
    heading: { size: number; style: 'normal' | 'bold' };
    subheading: { size: number; style: 'normal' | 'bold' };
    body: { size: number; style: 'normal' | 'bold' };
    caption: { size: number; style: 'normal' | 'bold' };
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    lightText: string;
    border: string;
    background: string;
  };
  logo?: {
    src: string;
    width: number;
    height: number;
  };
}

// Default professional configuration
const DEFAULT_CONFIG: PDFConfig = {
  pageSize: 'a4',
  orientation: 'portrait',
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  fonts: {
    title: { size: 24, style: 'bold' },
    heading: { size: 16, style: 'bold' },
    subheading: { size: 14, style: 'bold' },
    body: { size: 10, style: 'normal' },
    caption: { size: 8, style: 'normal' }
  },
  colors: {
    primary: '#1e40af',    // Blue-700
    secondary: '#64748b',  // Slate-500
    accent: '#059669',     // Emerald-600
    text: '#1f2937',       // Gray-800
    lightText: '#6b7280',  // Gray-500
    border: '#e5e7eb',     // Gray-200
    background: '#f8fafc'  // Slate-50
  },
  logo: {
    src: '/globe.svg',     // Using the existing globe SVG from public folder
    width: 15,
    height: 15
  }
};

// Trip metadata for PDF generation
interface TripMetadata {
  destination: string;
  duration: number;
  peopleCount: number;
  budget: number;
  currency: string;
  generatedAt: Date;
  ownerName?: string;
}

/**
 * Professional PDF Generator for Travel Itineraries
 * 
 * This class generates high-quality, structured PDF documents from travel itinerary data.
 * It uses jsPDF-autotable for professional table layouts and maintains consistent
 * typography and styling throughout the document.
 */
export class TravelItineraryPDFGenerator {
  private doc: jsPDF;
  private config: PDFConfig;
  private currentY: number = 0;
  private pageHeight: number;
  private pageWidth: number;
  private logoLoaded: boolean = false;

  constructor(config: Partial<PDFConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.doc = new jsPDF({
      orientation: this.config.orientation,
      unit: 'mm',
      format: this.config.pageSize
    });
    
    this.pageHeight = this.doc.internal.pageSize.height;
    this.pageWidth = this.doc.internal.pageSize.width;
    this.currentY = this.config.margins.top;
  }

  /**
   * Generate complete PDF for travel itinerary
   */
  public async generatePDF(
    itinerary: ItineraryType, 
    metadata: TripMetadata,
    filename?: string
  ): Promise<void> {
    try {
      // Validate destination before proceeding
      if (!metadata.destination || 
          metadata.destination.trim().length < 2 || 
          /^[0-9]+$/.test(metadata.destination) || 
          ["test", "hi", "hello", "asdf", "123", "none", "n/a", "na"].includes(metadata.destination.toLowerCase().trim())) {
        throw new Error("Invalid destination provided. Cannot generate PDF for invalid locations.");
      }
      
      this.setupDocument(metadata);
      
      // Try to add logo if configured
      if (this.config.logo) {
        try {
          await this.addLogo();
        } catch (logoError) {
          console.warn('Could not add logo to PDF:', logoError);
          // Continue without logo
        }
      }
      
      this.addDocumentHeader(metadata);
      this.addTripOverview(itinerary, metadata);
      this.addDailyItinerary(itinerary.days);
      this.addAccommodationSection(itinerary.accommodation);
      this.addTransportationSection(itinerary.transportation);
      this.addBudgetBreakdown(itinerary.budgetBreakdown, metadata.currency);
      this.addTipsAndInsights(itinerary);
      this.addDocumentFooter();

      // Save the PDF
      const pdfFilename = filename || `${metadata.destination.replace(/\s+/g, '_')}_Itinerary_${new Date().toISOString().split('T')[0]}.pdf`;
      this.doc.save(pdfFilename);

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }

  /**
   * Add logo to the PDF
   */
  private addLogo(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.config.logo) {
        resolve();
        return;
      }

      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
        try {
          // Convert the image to a data URL
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          
          this.logoLoaded = true;
          resolve();
        } catch (err) {
          reject(err);
        }
      };
      
      img.onerror = (err) => {
        reject(err);
      };
      
      img.src = this.config.logo.src;
    });
  }

  /**
   * Setup document metadata and properties
   */
  private setupDocument(metadata: TripMetadata): void {
    this.doc.setProperties({
      title: `Travel Itinerary - ${metadata.destination}`,
      subject: `${metadata.duration} Day Travel Plan for ${metadata.destination}`,
      author: metadata.ownerName || 'AI Travel Planner',
      creator: 'AI Travel Planner App',
      keywords: `travel, itinerary, ${metadata.destination}, vacation, planning`
    });
  }

  /**
   * Add professional document header with branding
   */
  private addDocumentHeader(metadata: TripMetadata): void {
    const { margins } = this.config;
    const headerHeight = 30;

    // Background header area
    this.doc.setFillColor(this.config.colors.primary);
    this.doc.rect(0, 0, this.pageWidth, headerHeight, 'F');

    // AI Travel Planner at top
    this.doc.setTextColor('#ffffff');
    this.doc.setFontSize(this.config.fonts.title.size);
    this.doc.setFont('helvetica', this.config.fonts.title.style);
    this.doc.text('AI Travel Planner', margins.left, 15);

    // Developer credit below
    this.doc.setFontSize(this.config.fonts.caption.size);
    this.doc.setFontSize(this.config.fonts.caption.size + 2);
    this.doc.text('Developed by Richad Ali', margins.left, 22);
    this.doc.setFontSize(this.config.fonts.caption.size);

    // Main title - Travel Itinerary
    this.doc.setFontSize(this.config.fonts.heading.size);
    this.doc.setFont('helvetica', this.config.fonts.heading.style);
    const itineraryText = 'Travel Itinerary';
    const itineraryWidth = this.doc.getTextWidth(itineraryText);
    this.doc.text(itineraryText, this.pageWidth - margins.right - itineraryWidth, 15);

    // Destination subtitle
    this.doc.setFontSize(this.config.fonts.subheading.size);
    this.doc.setFont('helvetica', 'normal');
    const destinationText = metadata.destination;
    const destinationWidth = this.doc.getTextWidth(destinationText);
    this.doc.text(destinationText, this.pageWidth - margins.right - destinationWidth, 22);

    this.currentY = headerHeight + 10;
  }

  /**
   * Add trip overview section
   */
  private addTripOverview(itinerary: ItineraryType, metadata: TripMetadata): void {
    this.addSectionHeader('Trip Overview');

    // Add generated date (right aligned)
    this.doc.setFontSize(this.config.fonts.body.size);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(this.config.colors.lightText);
    const dateText = `Generated: ${metadata.generatedAt.toLocaleDateString()}`;
    const dateWidth = this.doc.getTextWidth(dateText);
    this.doc.text(dateText, this.pageWidth - this.config.margins.right - dateWidth, this.currentY - 10);

    const overviewData = [
      ['Destination', metadata.destination],
      ['Duration', `${metadata.duration} ${metadata.duration === 1 ? 'Day' : 'Days'}`],
      ['Travelers', `${metadata.peopleCount} ${metadata.peopleCount === 1 ? 'Person' : 'People'}`],
      ['Total Budget', `${this.formatCurrency(metadata.budget, metadata.currency)}`],
      ['Budget Per Person', `${this.formatCurrency(metadata.budget / metadata.peopleCount, metadata.currency)}`]
    ];

    if (itinerary.bestTimeToVisit) {
      overviewData.push(['Best Time to Visit', itinerary.bestTimeToVisit]);
    }

    this.addInfoTable(overviewData);
    this.addVerticalSpace(10);
  }

  /**
   * Add daily itinerary section with activities and meals
   */
  private addDailyItinerary(days: DayItineraryType[]): void {
    this.addSectionHeader('Daily Itinerary');

    days.forEach((day, index) => {
      this.checkPageSpace(60);
      
      // Day header
      this.doc.setFontSize(this.config.fonts.subheading.size);
      this.doc.setFont('helvetica', this.config.fonts.subheading.style);
      this.doc.setTextColor(this.config.colors.primary);
      this.doc.text(`Day ${day.day}`, this.config.margins.left, this.currentY);
      this.currentY += 8;

      // Activities table
      if (day.activities && day.activities.length > 0) {
        const activityHeaders = ['Time', 'Activity', 'Description', 'Cost'];
        const activityData = day.activities.map(activity => [
          activity.time,
          activity.name,
          activity.description, // Don't truncate - let the table handle wrapping
          this.formatCurrency(activity.cost, 'INR')
        ]);

        // Calculate column widths based on standard table width
        const availableWidth = this.standardTableWidth;
        
        autoTable(this.doc, {
          startY: this.currentY,
          head: [activityHeaders],
          body: activityData,
          margin: { left: this.config.margins.left, right: this.config.margins.right },
          styles: { 
            fontSize: this.config.fonts.body.size,
            cellPadding: 3,
            textColor: this.config.colors.text,
            overflow: 'linebreak',
            cellWidth: 'wrap',
            font: 'helvetica',
            fontStyle: 'normal'
          },
          headStyles: { 
            fillColor: this.config.colors.secondary,
            textColor: '#ffffff',
            fontStyle: 'bold'
          },
          alternateRowStyles: { fillColor: this.config.colors.background },
          tableWidth: 'auto',
          columnStyles: {
            0: { cellWidth: Math.floor(availableWidth * 0.15), overflow: 'linebreak' }, // Time - 15%
            1: { cellWidth: Math.floor(availableWidth * 0.15), overflow: 'linebreak' }, // Activity - 15%
            2: { cellWidth: Math.floor(availableWidth * 0.55), overflow: 'linebreak' }, // Description - 55%
            3: { cellWidth: Math.floor(availableWidth * 0.15), halign: 'right', overflow: 'linebreak' } // Cost - 15%
          },
          didParseCell: function(data) {
            // Ensure consistent font for all cells
            if (data.section === 'body' || data.section === 'head') {
              data.cell.styles.font = 'helvetica';
              data.cell.styles.fontStyle = data.section === 'head' ? 'bold' : 'normal';
              
              // Ensure proper text rendering for special characters
              if (data.column.index === 2 && data.section === 'body') {
                // Make sure description text has proper spacing
                data.cell.text = data.cell.text.map(text => 
                  typeof text === 'string' ? text.replace(/\s+/g, ' ').trim() : text
                );
              }
            }
          }
        });

        this.currentY = (this.doc as any).lastAutoTable.finalY + 5;
      }

      // Meals section
      if (day.meals && day.meals.length > 0) {
        this.doc.setFontSize(this.config.fonts.caption.size + 1);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(this.config.colors.text);
        this.doc.text('Meals', this.config.margins.left, this.currentY);
        this.currentY += 5;

        const mealData = day.meals.map(meal => [
          meal.type.charAt(0).toUpperCase() + meal.type.slice(1),
          meal.suggestion,
          meal.location || 'Various',
          this.formatCurrency(meal.cost, 'INR')
        ]);

        // Use standard table width for consistency
        const mealsTableWidth = this.standardTableWidth;
        
        autoTable(this.doc, {
          startY: this.currentY,
          head: [['Type', 'Suggestion', 'Location', 'Cost']],
          body: mealData,
          margin: { left: this.config.margins.left, right: this.config.margins.right },
          styles: { 
            fontSize: this.config.fonts.caption.size,
            cellPadding: 2,
            textColor: this.config.colors.text,
            overflow: 'linebreak',
            cellWidth: 'wrap',
            font: 'helvetica',
            fontStyle: 'normal',
            minCellHeight: 8
          },
          headStyles: { 
            fillColor: this.config.colors.accent,
            textColor: '#ffffff',
            fontStyle: 'bold',
            fontSize: this.config.fonts.caption.size
          },
          columnStyles: {
            0: { cellWidth: Math.floor(mealsTableWidth * 0.15), overflow: 'linebreak' }, // 15% for Type
            1: { cellWidth: Math.floor(mealsTableWidth * 0.50), overflow: 'linebreak' }, // 50% for Suggestion
            2: { cellWidth: Math.floor(mealsTableWidth * 0.20), overflow: 'linebreak' }, // 20% for Location
            3: { cellWidth: Math.floor(mealsTableWidth * 0.15), halign: 'right', overflow: 'linebreak' } // 15% for Cost
          },
          tableWidth: 'auto',
          didParseCell: function(data) {
            // Ensure consistent font for all cells
            if (data.section === 'body' || data.section === 'head') {
              data.cell.styles.font = 'helvetica';
              data.cell.styles.fontStyle = data.section === 'head' ? 'bold' : 'normal';
              
              // Ensure proper text rendering for special characters
              if (data.column.index === 2 && data.section === 'body') {
                // Make sure description text has proper spacing
                data.cell.text = data.cell.text.map(text => 
                  typeof text === 'string' ? text.replace(/\s+/g, ' ').trim() : text
                );
              }
            }
          }
        });

        this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
      }
    });
  }

  /**
   * Add accommodation section
   */
  private addAccommodationSection(accommodations: AccommodationType[]): void {
    if (!accommodations || accommodations.length === 0) return;

    this.addSectionHeader('Accommodations');

    const accommodationData = accommodations.map(acc => [
      acc.name,
      acc.location,
      acc.description, // Don't truncate - let the table handle wrapping
      this.formatCurrency(acc.pricePerNight, 'INR') + '/night',
      acc.amenities ? acc.amenities.slice(0, 3).join(', ') : 'Standard'
    ]);

    // Use standard table width for consistency
    const availableWidth = this.standardTableWidth;
    
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Name', 'Location', 'Description', 'Price/Night', 'Key Amenities']],
      body: accommodationData,
      margin: { left: this.config.margins.left, right: this.config.margins.right },
      styles: { 
        fontSize: this.config.fonts.body.size,
        cellPadding: 3,
        textColor: this.config.colors.text,
        overflow: 'linebreak',
        cellWidth: 'wrap',
        font: 'helvetica',
        fontStyle: 'normal'
      },
      headStyles: { 
        fillColor: this.config.colors.primary,
        textColor: '#ffffff',
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: this.config.colors.background },
      columnStyles: {
        0: { cellWidth: Math.floor(availableWidth * 0.15), overflow: 'linebreak' }, // Name - 15%
        1: { cellWidth: Math.floor(availableWidth * 0.15), overflow: 'linebreak' }, // Location - 15%
        2: { cellWidth: Math.floor(availableWidth * 0.35), overflow: 'linebreak' }, // Description - 35%
        3: { cellWidth: Math.floor(availableWidth * 0.15), halign: 'right', overflow: 'linebreak' }, // Price - 15%
        4: { cellWidth: Math.floor(availableWidth * 0.20), overflow: 'linebreak' } // Amenities - 20%
      },
      didParseCell: function(data) {
        // Ensure consistent font for all cells
        if (data.section === 'body' || data.section === 'head') {
          data.cell.styles.font = 'helvetica';
          data.cell.styles.fontStyle = data.section === 'head' ? 'bold' : 'normal';
          
          // Ensure proper text rendering for special characters
          if (data.column.index === 2 && data.section === 'body') {
            // Make sure description text has proper spacing
            data.cell.text = data.cell.text.map(text => 
              typeof text === 'string' ? text.replace(/\s+/g, ' ').trim() : text
            );
          }
        }
      }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
  }

  /**
   * Add transportation section
   */
  private addTransportationSection(transportation: TransportationType[]): void {
    if (!transportation || transportation.length === 0) return;

    this.addSectionHeader('Transportation');

    const transportData = transportation.map(transport => [
      transport.type,
      transport.description, // Don't truncate - let the table handle wrapping
      this.formatCurrency(transport.cost, 'INR'),
      transport.recommendedFor || 'All travelers'
    ]);

    // Use standard table width for consistency
    const availableWidth = this.standardTableWidth;
    
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Type', 'Description', 'Cost', 'Recommended For']],
      body: transportData,
      margin: { left: this.config.margins.left, right: this.config.margins.right },
      styles: { 
        fontSize: this.config.fonts.body.size,
        cellPadding: 3,
        textColor: this.config.colors.text,
        overflow: 'linebreak',
        cellWidth: 'wrap',
        font: 'helvetica',
        fontStyle: 'normal'
      },
      headStyles: { 
        fillColor: this.config.colors.primary,
        textColor: '#ffffff',
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: this.config.colors.background },
      columnStyles: {
        0: { cellWidth: Math.floor(availableWidth * 0.15), overflow: 'linebreak' }, // Type - 15%
        1: { cellWidth: Math.floor(availableWidth * 0.45), overflow: 'linebreak' }, // Description - 45%
        2: { cellWidth: Math.floor(availableWidth * 0.15), halign: 'right', overflow: 'linebreak' }, // Cost - 15%
        3: { cellWidth: Math.floor(availableWidth * 0.25), overflow: 'linebreak' } // Recommended For - 25%
      },
      didParseCell: function(data) {
        // Ensure consistent font for all cells
        if (data.section === 'body' || data.section === 'head') {
          data.cell.styles.font = 'helvetica';
          data.cell.styles.fontStyle = data.section === 'head' ? 'bold' : 'normal';
          
          // Ensure proper text rendering for special characters
          if (data.column.index === 1 && data.section === 'body') {
            // Make sure description text has proper spacing
            data.cell.text = data.cell.text.map(text => 
              typeof text === 'string' ? text.replace(/\s+/g, ' ').trim() : text
            );
          }
        }
      }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
  }

  /**
   * Add budget breakdown section
   */
  private addBudgetBreakdown(budget: BudgetBreakdownType, currency: string): void {
    this.addSectionHeader('Budget Breakdown');

    const budgetData = [
      ['Accommodation', this.formatCurrency(budget.accommodation, currency)],
      ['Food & Dining', this.formatCurrency(budget.food, currency)],
      ['Activities & Tours', this.formatCurrency(budget.activities, currency)],
      ['Transportation', this.formatCurrency(budget.transportation, currency)],
      ['Miscellaneous', this.formatCurrency(budget.miscellaneous, currency)]
    ];

    // Use standard table width for consistency
    const availableWidth = this.standardTableWidth;
    
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Category', 'Amount']],
      body: budgetData,
      foot: [[{content: 'Total Budget', styles: {halign: 'left'}}, this.formatCurrency(budget.total, currency)]],
      margin: { left: this.config.margins.left, right: this.config.margins.right },
      styles: { 
        fontSize: this.config.fonts.body.size,
        cellPadding: 3,
        textColor: this.config.colors.text,
        overflow: 'linebreak',
        cellWidth: 'wrap',
        font: 'helvetica',
        fontStyle: 'normal'
      },
      headStyles: { 
        fillColor: this.config.colors.accent,
        textColor: '#ffffff',
        fontStyle: 'bold'
      },
      footStyles: {
        fillColor: this.config.colors.primary,
        textColor: '#ffffff',
        fontStyle: 'bold',
        fontSize: this.config.fonts.subheading.size,
        halign: 'right' // Make total budget right-aligned
      },
      alternateRowStyles: { fillColor: this.config.colors.background },
      columnStyles: {
        0: { cellWidth: Math.floor(availableWidth * 0.70), overflow: 'linebreak' }, // Category - 70%
        1: { cellWidth: Math.floor(availableWidth * 0.30), halign: 'right', overflow: 'linebreak' } // Amount - 30%
      },
      didParseCell: function(data) {
        // Ensure consistent font for all cells
        if (data.section === 'body' || data.section === 'head' || data.section === 'foot') {
          data.cell.styles.font = 'helvetica';
          data.cell.styles.fontStyle = data.section === 'body' ? 'normal' : 'bold';
        }
      }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
  }

  /**
   * Add tips and insights section
   */
  private addTipsAndInsights(itinerary: ItineraryType): void {
    if (!itinerary.tips || itinerary.tips.length === 0) return;

    this.addSectionHeader('Local Tips & Insights');

    // Add tips as bullet points
    this.doc.setFontSize(this.config.fonts.body.size);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(this.config.colors.text);

    itinerary.tips.forEach((tip, index) => {
      const bulletPoint = '•';
      const leftMargin = this.config.margins.left;
      const bulletX = leftMargin + 2;
      const textX = leftMargin + 8;
      const maxWidth = this.pageWidth - this.config.margins.left - this.config.margins.right - 10;

      // Normalize the text to ensure proper spacing
      const normalizedTip = tip.replace(/\s+/g, ' ').trim();

      // Calculate how much space this tip will need
      const wrappedText = this.doc.splitTextToSize(normalizedTip, maxWidth);
      const requiredSpace = (wrappedText.length * 4) + 3;
      
      // Check if we need a new page for this tip
      this.checkPageSpace(requiredSpace + 5);

      // Add bullet point
      this.doc.text(bulletPoint, bulletX, this.currentY);

      // Add tip text with word wrapping
      this.doc.text(wrappedText, textX, this.currentY);
      
      this.currentY += requiredSpace;
    });

    // Add local cuisine if available
    if (itinerary.localCuisine && itinerary.localCuisine.length > 0) {
      this.addVerticalSpace(8);
      this.doc.setFontSize(this.config.fonts.subheading.size);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(this.config.colors.primary);
      this.doc.text('Local Cuisine to Try:', this.config.margins.left, this.currentY);
      this.currentY += 6;

      this.doc.setFontSize(this.config.fonts.body.size);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(this.config.colors.text);
      
      const cuisineText = itinerary.localCuisine.join(', ');
      // Normalize the text to ensure proper spacing
      const normalizedCuisineText = cuisineText.replace(/\s+/g, ' ').trim();
      
      const maxWidth = this.pageWidth - this.config.margins.left - this.config.margins.right;
      const wrappedCuisine = this.doc.splitTextToSize(normalizedCuisineText, maxWidth);
      this.doc.text(wrappedCuisine, this.config.margins.left, this.currentY);
      this.currentY += wrappedCuisine.length * 4;
    }
  }

  /**
   * Add document footer with page numbers and branding
   */
  private addDocumentFooter(): void {
    const totalPages = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      
      // Footer line
      this.doc.setDrawColor(this.config.colors.border);
      this.doc.line(
        this.config.margins.left, 
        this.pageHeight - this.config.margins.bottom + 5,
        this.pageWidth - this.config.margins.right, 
        this.pageHeight - this.config.margins.bottom + 5
      );

      // Page number
      this.doc.setFontSize(this.config.fonts.caption.size);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(this.config.colors.lightText);
      const pageText = `Page ${i} of ${totalPages}`;
      const pageTextWidth = this.doc.getTextWidth(pageText);
      this.doc.text(
        pageText, 
        this.pageWidth - this.config.margins.right - pageTextWidth, 
        this.pageHeight - this.config.margins.bottom + 10
      );

      // Branding
      this.doc.text(
        'Generated by AI Travel Planner | Developed by Richad Ali', 
        this.config.margins.left, 
        this.pageHeight - this.config.margins.bottom + 10
      );
    }
  }

  // Utility methods
  private addSectionHeader(title: string): void {
    this.checkPageSpace(15);
    
    this.doc.setFontSize(this.config.fonts.heading.size);
    this.doc.setFont('helvetica', this.config.fonts.heading.style);
    this.doc.setTextColor(this.config.colors.primary);
    this.doc.text(title, this.config.margins.left, this.currentY);
    
    // Add underline
    const titleWidth = this.doc.getTextWidth(title);
    this.doc.setDrawColor(this.config.colors.primary);
    this.doc.line(
      this.config.margins.left, 
      this.currentY + 2, 
      this.config.margins.left + titleWidth, 
      this.currentY + 2
    );
    
    this.currentY += 10;
  }

  // Define a standard table width for consistency across all tables
  private get standardTableWidth(): number {
    return this.pageWidth - this.config.margins.left - this.config.margins.right;
  }

  private addInfoTable(data: string[][]): void {
    // Use standard table width
    const availableWidth = this.standardTableWidth;
    
    autoTable(this.doc, {
      startY: this.currentY,
      body: data,
      margin: { left: this.config.margins.left, right: this.config.margins.right },
      styles: { 
        fontSize: this.config.fonts.body.size,
        cellPadding: 3,
        textColor: this.config.colors.text,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      columnStyles: {
        0: { 
          fontStyle: 'bold', 
          cellWidth: Math.floor(availableWidth * 0.3), // 30% of available width
          fillColor: this.config.colors.background 
        },
        1: { 
          cellWidth: Math.floor(availableWidth * 0.7) // 70% of available width
        }
      },
      tableWidth: 'auto'
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY;
  }

  private checkPageSpace(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.config.margins.bottom - 20) {
      this.doc.addPage();
      this.currentY = this.config.margins.top;
    }
  }

  private addVerticalSpace(space: number): void {
    this.currentY += space;
  }

  private formatCurrency(amount: number, currency: string): string {
    const currencySymbols: Record<string, string> = {
      'INR': 'Rs.',
      'USD': '$',
      'EUR': 'EUR',
      'GBP': 'GBP'
    };

    const symbol = currencySymbols[currency] || currency;
    
    // Manual number formatting to avoid font rendering issues
    const numStr = Math.round(amount).toString();
    const parts = [];
    
    // Add commas manually for thousands separator
    for (let i = numStr.length - 1, j = 0; i >= 0; i--, j++) {
      if (j > 0 && j % 3 === 0) {
        parts.unshift(',');
      }
      parts.unshift(numStr[i]);
    }
    
    return `${symbol} ${parts.join('')}`;
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
}

/**
 * Convenience function to generate PDF from itinerary data
 */
export async function generateTravelItineraryPDF(
  itinerary: ItineraryType,
  metadata: TripMetadata,
  filename?: string,
  config?: Partial<PDFConfig>
): Promise<void> {
  const generator = new TravelItineraryPDFGenerator(config);
  await generator.generatePDF(itinerary, metadata, filename);
} 