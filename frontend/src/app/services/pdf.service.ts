import { Injectable } from '@angular/core';
import { CollectionService } from './collection.service';
import { TEAMS, FWC_STICKERS, COCA_STICKERS } from '../models/album-data';
import { Sticker } from '../models/sticker.model';
import jsPDF from 'jspdf';

@Injectable({ providedIn: 'root' })
export class PdfService {
  constructor(private col: CollectionService) {}

  exportMissing(): void {
    const doc = new jsPDF();
    const user = this.col.currentUser() ?? 'Usuario';
    const missingIds = new Set(this.col.getMissingIds());

    let y = 20;
    this.addTitle(doc, `Postales Faltantes — ${user}`, y);
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Total faltantes: ${this.col.missingCount()} de ${this.col.totalBase} (álbum base)`, 14, y);
    y += 8;
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CR')}`, 14, y);
    y += 12;

    // FWC missing
    const fwcMissing = FWC_STICKERS.filter(s => missingIds.has(s.id));
    if (fwcMissing.length) {
      y = this.addSection(doc, 'Sección FWC (Introducción e Historia)', fwcMissing, y);
    }

    // Teams missing
    for (const team of TEAMS) {
      const tm = team.stickers.filter(s => missingIds.has(s.id));
      if (tm.length > 0) {
        y = this.addSection(doc, `${team.name} (${tm.length} faltantes)`, tm, y);
      }
    }

    // Coca
    const cocaMissing = COCA_STICKERS.filter(s => missingIds.has(s.id));
    if (cocaMissing.length) {
      y = this.checkPageBreak(doc, y, 30);
      y = this.addSection(doc, 'Coca-Cola Exclusivas', cocaMissing, y);
    }

    doc.save(`panini2026_faltantes_${user}.pdf`);
  }

  exportRepeated(): void {
    const doc = new jsPDF();
    const user = this.col.currentUser() ?? 'Usuario';
    const repeated = this.col.getRepeatedMap();
    const repIds = Object.keys(repeated).filter(k => repeated[k] > 0);

    let y = 20;
    this.addTitle(doc, `Postales Repetidas — ${user}`, y);
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Total repetidas: ${this.col.repeatedCount()} stickers`, 14, y);
    y += 8;
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CR')}`, 14, y);
    y += 12;

    if (repIds.length === 0) {
      doc.setFontSize(12);
      doc.setTextColor(80);
      doc.text('¡No tenés postales repetidas aún!', 14, y);
    } else {
      // Group by team
      const allStickersById = new Map<string, Sticker>();
      FWC_STICKERS.forEach(s => allStickersById.set(s.id, s));
      TEAMS.forEach(t => t.stickers.forEach(s => allStickersById.set(s.id, s)));
      COCA_STICKERS.forEach(s => allStickersById.set(s.id, s));

      const fwcRep = repIds.filter(id => id.startsWith('FWC')).map(id => allStickersById.get(id)!).filter(Boolean);
      if (fwcRep.length) y = this.addSectionWithCount(doc, 'Sección FWC', fwcRep, repeated, y);

      for (const team of TEAMS) {
        const tr = repIds.filter(id => id.startsWith(team.code)).map(id => allStickersById.get(id)!).filter(Boolean);
        if (tr.length) y = this.addSectionWithCount(doc, team.name, tr, repeated, y);
      }

      const cocaRep = repIds.filter(id => id.startsWith('CC')).map(id => allStickersById.get(id)!).filter(Boolean);
      if (cocaRep.length) y = this.addSectionWithCount(doc, 'Coca-Cola', cocaRep, repeated, y);
    }

    doc.save(`panini2026_repetidas_${user}.pdf`);
  }

  exportAll(): void {
    const doc = new jsPDF();
    const user = this.col.currentUser() ?? 'Usuario';

    let y = 20;
    this.addTitle(doc, `Colección Completa — ${user}`, y);
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Tengo: ${this.col.ownedCount()} | Faltan: ${this.col.missingCount()} | Progreso: ${this.col.completionPct()}%`, 14, y);
    y += 8;
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CR')}`, 14, y);
    y += 12;

    const missingIds = new Set(this.col.getMissingIds());

    for (const team of TEAMS) {
      const owned = team.stickers.filter(s => !missingIds.has(s.id));
      const missing = team.stickers.filter(s => missingIds.has(s.id));
      y = this.checkPageBreak(doc, y, 30);
      doc.setFontSize(11);
      doc.setTextColor(20);
      doc.setFont('helvetica', 'bold');
      doc.text(`${team.name} — ${owned.length}/20`, 14, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      if (missing.length > 0) {
        doc.setTextColor(180, 30, 30);
        doc.text('Faltan: ' + missing.map(s => s.id).join(', '), 14, y, { maxWidth: 182 });
        y += 6;
      }
      if (owned.length > 0) {
        doc.setTextColor(30, 130, 60);
        doc.text('Tengo: ' + owned.map(s => s.id).join(', '), 14, y, { maxWidth: 182 });
        y += 8;
      }
      y += 2;
    }

    doc.save(`panini2026_coleccion_${user}.pdf`);
  }

  // ── Helpers ──────────────────────────────────
  private addTitle(doc: jsPDF, title: string, y: number): void {
    doc.setFontSize(18);
    doc.setTextColor(20);
    doc.setFont('helvetica', 'bold');
    doc.text('🏆 Álbum Panini — Mundial 2026', 14, y);
    doc.setFontSize(13);
    doc.setTextColor(60);
    doc.setFont('helvetica', 'normal');
    doc.text(title, 14, y + 8);
  }

  private addSection(doc: jsPDF, title: string, stickers: Sticker[], y: number): number {
    y = this.checkPageBreak(doc, y, 20);
    doc.setFontSize(11);
    doc.setTextColor(30, 80, 160);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50);
    const line = stickers.map(s => `${s.id}: ${s.name}`).join('  |  ');
    const lines = doc.splitTextToSize(line, 182);
    lines.forEach((l: string) => {
      y = this.checkPageBreak(doc, y, 8);
      doc.text(l, 14, y);
      y += 5;
    });
    y += 3;
    return y;
  }

  private addSectionWithCount(doc: jsPDF, title: string, stickers: Sticker[], repeated: Record<string, number>, y: number): number {
    y = this.checkPageBreak(doc, y, 20);
    doc.setFontSize(11);
    doc.setTextColor(30, 80, 160);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50);
    stickers.forEach(s => {
      y = this.checkPageBreak(doc, y, 6);
      doc.text(`${s.id}: ${s.name}  → x${repeated[s.id]}`, 18, y);
      y += 5;
    });
    y += 3;
    return y;
  }

  private checkPageBreak(doc: jsPDF, y: number, needed: number): number {
    if (y + needed > 280) { doc.addPage(); return 20; }
    return y;
  }
}
