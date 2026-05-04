import { Injectable } from '@angular/core';
import { CollectionService } from './collection.service';
import { TEAMS, FWC_STICKERS, COCA_STICKERS } from '../models/album-data';
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
    y += 18;
    doc.setFontSize(9); doc.setTextColor(120);
    doc.text(`Faltan: ${this.col.missingCount()} de ${this.col.totalBase}   ·   ${new Date().toLocaleDateString('es-CR')}`, 14, y);
    y += 12;

    // FWC
    const fwcMissing = FWC_STICKERS.filter(s => missingIds.has(s.id)).map(s => s.id);
    if (fwcMissing.length) y = this.addIdList(doc, 'Sección FWC', fwcMissing, y);

    // Teams
    for (const team of TEAMS) {
      const ids = team.stickers.filter(s => missingIds.has(s.id)).map(s => s.id);
      if (ids.length) y = this.addIdList(doc, `${team.flag} ${team.name} (${team.group})`, ids, y);
    }

    // Coca
    const cocaMissing = COCA_STICKERS.filter(s => missingIds.has(s.id)).map(s => s.id);
    if (cocaMissing.length) y = this.addIdList(doc, '🥤 Coca-Cola', cocaMissing, y);

    doc.save(`urisco_faltantes_${user}.pdf`);
  }

  exportRepeated(): void {
    const doc = new jsPDF();
    const user = this.col.currentUser() ?? 'Usuario';
    const repMap = this.col.getRepeatedMap();
    const repIds = Object.keys(repMap).filter(k => repMap[k] > 0);

    let y = 20;
    this.addTitle(doc, `Postales Repetidas — ${user}`, y);
    y += 18;
    doc.setFontSize(9); doc.setTextColor(120);
    doc.text(`Total repetidas: ${this.col.repeatedCount()}   ·   ${new Date().toLocaleDateString('es-CR')}`, 14, y);
    y += 12;

    if (repIds.length === 0) {
      doc.setFontSize(12); doc.setTextColor(100);
      doc.text('¡No tenés postales repetidas aún!', 14, y);
    } else {
      // FWC
      const fwcRep = FWC_STICKERS.filter(s => repMap[s.id] > 0);
      if (fwcRep.length) y = this.addRepList(doc, 'Sección FWC', fwcRep.map(s => ({ id: s.id, count: repMap[s.id] })), y);

      // Teams
      for (const team of TEAMS) {
        const tr = team.stickers.filter(s => repMap[s.id] > 0).map(s => ({ id: s.id, count: repMap[s.id] }));
        if (tr.length) y = this.addRepList(doc, `${team.flag} ${team.name}`, tr, y);
      }

      // Coca
      const cocaRep = COCA_STICKERS.filter(s => repMap[s.id] > 0);
      if (cocaRep.length) y = this.addRepList(doc, '🥤 Coca-Cola', cocaRep.map(s => ({ id: s.id, count: repMap[s.id] })), y);
    }

    doc.save(`urisco_repetidas_${user}.pdf`);
  }

  exportAll(): void {
    const doc = new jsPDF();
    const user = this.col.currentUser() ?? 'Usuario';
    const missingIds = new Set(this.col.getMissingIds());

    let y = 20;
    this.addTitle(doc, `Colección Completa — ${user}`, y);
    y += 18;
    doc.setFontSize(9); doc.setTextColor(120);
    doc.text(`Tengo: ${this.col.ownedCount()} | Faltan: ${this.col.missingCount()} | ${this.col.completionPct()}%   ·   ${new Date().toLocaleDateString('es-CR')}`, 14, y);
    y += 12;

    // FWC
    const fwcOwned   = FWC_STICKERS.filter(s => !missingIds.has(s.id)).map(s => s.id);
    const fwcMissing = FWC_STICKERS.filter(s => missingIds.has(s.id)).map(s => s.id);
    y = this.checkPageBreak(doc, y, 20);
    doc.setFontSize(10); doc.setTextColor(20); doc.setFont('helvetica','bold');
    doc.text(`Sección FWC — ${fwcOwned.length}/20`, 14, y); y += 6;
    doc.setFont('helvetica','normal'); doc.setFontSize(8);
    if (fwcMissing.length) { doc.setTextColor(180,30,30); doc.text('Faltan: ' + fwcMissing.join('  '), 14, y, { maxWidth: 182 }); y += 5; }
    if (fwcOwned.length)   { doc.setTextColor(30,130,60); doc.text('Tengo:  ' + fwcOwned.join('  '), 14, y, { maxWidth: 182 }); y += 8; }

    for (const team of TEAMS) {
      const owned   = team.stickers.filter(s => !missingIds.has(s.id)).map(s => s.id);
      const missing = team.stickers.filter(s =>  missingIds.has(s.id)).map(s => s.id);
      y = this.checkPageBreak(doc, y, 20);
      doc.setFontSize(10); doc.setTextColor(20); doc.setFont('helvetica','bold');
      doc.text(`${team.name} — ${owned.length}/20`, 14, y); y += 6;
      doc.setFont('helvetica','normal'); doc.setFontSize(8);
      if (missing.length) { doc.setTextColor(180,30,30); doc.text('Faltan: ' + missing.join('  '), 14, y, { maxWidth: 182 }); y += 5; }
      if (owned.length)   { doc.setTextColor(30,130,60); doc.text('Tengo:  ' + owned.join('  '), 14, y, { maxWidth: 182 }); y += 8; }
    }

    // Coca
    const cocaOwned   = COCA_STICKERS.filter(s => !missingIds.has(s.id)).map(s => s.id);
    const cocaMissing = COCA_STICKERS.filter(s =>  missingIds.has(s.id)).map(s => s.id);
    y = this.checkPageBreak(doc, y, 20);
    doc.setFontSize(10); doc.setTextColor(20); doc.setFont('helvetica','bold');
    doc.text(`Coca-Cola — ${cocaOwned.length}/14`, 14, y); y += 6;
    doc.setFont('helvetica','normal'); doc.setFontSize(8);
    if (cocaMissing.length) { doc.setTextColor(180,30,30); doc.text('Faltan: ' + cocaMissing.join('  '), 14, y, { maxWidth: 182 }); y += 5; }
    if (cocaOwned.length)   { doc.setTextColor(30,130,60); doc.text('Tengo:  ' + cocaOwned.join('  '), 14, y, { maxWidth: 182 }); y += 8; }

    doc.save(`urisco_coleccion_${user}.pdf`);
  }

  // ── Helpers ───────────────────────────────────────────────
  private addTitle(doc: jsPDF, subtitle: string, y: number): void {
    doc.setFontSize(16); doc.setTextColor(20); doc.setFont('helvetica','bold');
    doc.text('URISCO · PANINI Mundial 2026', 14, y);
    doc.setFontSize(11); doc.setTextColor(80); doc.setFont('helvetica','normal');
    doc.text(subtitle, 14, y + 8);
  }

  private addIdList(doc: jsPDF, title: string, ids: string[], y: number): number {
    y = this.checkPageBreak(doc, y, 16);
    doc.setFontSize(10); doc.setTextColor(30,80,160); doc.setFont('helvetica','bold');
    doc.text(title, 14, y); y += 5;
    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(50);
    const lines = doc.splitTextToSize(ids.join('   '), 182);
    lines.forEach((l: string) => {
      y = this.checkPageBreak(doc, y, 6);
      doc.text(l, 14, y); y += 5;
    });
    return y + 3;
  }

  private addRepList(doc: jsPDF, title: string, items: { id: string; count: number }[], y: number): number {
    y = this.checkPageBreak(doc, y, 16);
    doc.setFontSize(10); doc.setTextColor(30,80,160); doc.setFont('helvetica','bold');
    doc.text(title, 14, y); y += 5;
    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(50);
    const line = items.map(i => `${i.id} ×${i.count}`).join('   ');
    const lines = doc.splitTextToSize(line, 182);
    lines.forEach((l: string) => {
      y = this.checkPageBreak(doc, y, 6);
      doc.text(l, 14, y); y += 5;
    });
    return y + 3;
  }

  private checkPageBreak(doc: jsPDF, y: number, needed: number): number {
    if (y + needed > 280) { doc.addPage(); return 20; }
    return y;
  }
}