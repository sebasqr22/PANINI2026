import { Injectable } from '@angular/core';
import { CollectionService } from './collection.service';
import { TEAMS, FWC_STICKERS, COCA_STICKERS } from '../models/album-data';
import jsPDF from 'jspdf';

const LOGO_B64 = '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';

@Injectable({ providedIn: 'root' })
export class PdfService {
  constructor(private col: CollectionService) {}

  exportMissing(): void {
    const doc = new jsPDF();
    const user = this.col.currentUser() ?? 'Usuario';
    const missingIds = new Set(this.col.getMissingIds());
    let y = this.header(doc, 'Postales Faltantes', user);
    doc.setFontSize(9); doc.setTextColor(120);
    doc.text('Faltan: ' + this.col.missingCount() + ' de ' + this.col.totalBase + '   -   ' + this.today(), 14, y);
    y += 10;

    const fwcM = FWC_STICKERS.filter(s => missingIds.has(s.id)).map(s => s.id);
    if (fwcM.length) y = this.block(doc, 'Seccion FWC', fwcM, y);

    for (const team of TEAMS) {
      const ids = team.stickers.filter(s => missingIds.has(s.id)).map(s => s.id);
      if (ids.length) y = this.block(doc, team.name, ids, y);
    }

    const cocaM = COCA_STICKERS.filter(s => missingIds.has(s.id)).map(s => s.id);
    if (cocaM.length) y = this.block(doc, 'Coca-Cola', cocaM, y);

    doc.save('urisco_faltantes_' + user + '.pdf');
  }

  exportRepeated(): void {
    const doc = new jsPDF();
    const user = this.col.currentUser() ?? 'Usuario';
    const repMap = this.col.getRepeatedMap();
    let y = this.header(doc, 'Postales Repetidas', user);
    doc.setFontSize(9); doc.setTextColor(120);
    doc.text('Total repetidas: ' + this.col.repeatedCount() + '   -   ' + this.today(), 14, y);
    y += 10;

    if (Object.keys(repMap).filter(k => repMap[k] > 0).length === 0) {
      doc.setFontSize(11); doc.setTextColor(100);
      doc.text('No tenes postales repetidas aun.', 14, y);
    } else {
      const fwcR = FWC_STICKERS.filter(s => (repMap[s.id] ?? 0) > 0);
      if (fwcR.length) y = this.repBlock(doc, 'Seccion FWC', fwcR.map(s => s.id + 'x' + repMap[s.id]), y);
      for (const team of TEAMS) {
        const tr = team.stickers.filter(s => (repMap[s.id] ?? 0) > 0);
        if (tr.length) y = this.repBlock(doc, team.name, tr.map(s => s.id + 'x' + repMap[s.id]), y);
      }
      const cocaR = COCA_STICKERS.filter(s => (repMap[s.id] ?? 0) > 0);
      if (cocaR.length) y = this.repBlock(doc, 'Coca-Cola', cocaR.map(s => s.id + 'x' + repMap[s.id]), y);
    }

    doc.save('urisco_repetidas_' + user + '.pdf');
  }

  exportAll(): void {
    const doc = new jsPDF();
    const user = this.col.currentUser() ?? 'Usuario';
    const missingIds = new Set(this.col.getMissingIds());
    let y = this.header(doc, 'Coleccion Completa', user);
    doc.setFontSize(9); doc.setTextColor(120);
    doc.text('Tengo: ' + this.col.ownedCount() + ' | Faltan: ' + this.col.missingCount() + ' | ' + this.col.completionPct() + '%   -   ' + this.today(), 14, y);
    y += 10;

    // FWC
    const fwcOwned   = FWC_STICKERS.filter(s => !missingIds.has(s.id)).map(s => s.id);
    const fwcMissing = FWC_STICKERS.filter(s =>  missingIds.has(s.id)).map(s => s.id);
    if (fwcOwned.length || fwcMissing.length)
      y = this.teamBlock(doc, 'Seccion FWC', fwcOwned.length, 20, fwcOwned, fwcMissing, y);

    for (const team of TEAMS) {
      const owned   = team.stickers.filter(s => !missingIds.has(s.id)).map(s => s.id);
      const missing = team.stickers.filter(s =>  missingIds.has(s.id)).map(s => s.id);
      if (owned.length > 0)
        y = this.teamBlock(doc, team.name, owned.length, 20, owned, missing, y);
    }

    const cocaOwned   = COCA_STICKERS.filter(s => !missingIds.has(s.id)).map(s => s.id);
    const cocaMissing = COCA_STICKERS.filter(s =>  missingIds.has(s.id)).map(s => s.id);
    if (cocaOwned.length > 0)
      y = this.teamBlock(doc, 'Coca-Cola', cocaOwned.length, 14, cocaOwned, cocaMissing, y);

    doc.save('urisco_coleccion_' + user + '.pdf');
  }

  // ── Texto para WhatsApp ───────────────────────────────────
  exportAsText(type: 'missing' | 'repeated' | 'all'): string {
    const user = this.col.currentUser() ?? 'Usuario';
    const missingIds = new Set(this.col.getMissingIds());
    const repMap = this.col.getRepeatedMap();
    const lines: string[] = [];

    lines.push('URISCO PANINI 2026 - ' + user);
    lines.push(this.today());
    lines.push('');

    if (type === 'missing') {
      lines.push('FALTAN (' + this.col.missingCount() + ')');
      lines.push('');
      const fwcM = FWC_STICKERS.filter(s => missingIds.has(s.id)).map(s => s.id);
      if (fwcM.length) { lines.push('*Seccion FWC*'); lines.push(fwcM.join(' - ')); lines.push(''); }
      for (const team of TEAMS) {
        const ids = team.stickers.filter(s => missingIds.has(s.id)).map(s => s.id);
        if (ids.length) { lines.push('*' + team.name + '* (' + ids.length + ')'); lines.push(ids.join(' - ')); lines.push(''); }
      }
      const cocaM = COCA_STICKERS.filter(s => missingIds.has(s.id)).map(s => s.id);
      if (cocaM.length) { lines.push('*Coca-Cola*'); lines.push(cocaM.join(' - ')); }

    } else if (type === 'repeated') {
      lines.push('REPETIDAS (' + this.col.repeatedCount() + ')');
      lines.push('');
      const fwcR = FWC_STICKERS.filter(s => (repMap[s.id] ?? 0) > 0);
      if (fwcR.length) { lines.push('*Seccion FWC*'); lines.push(fwcR.map(s => s.id + 'x' + repMap[s.id]).join(' - ')); lines.push(''); }
      for (const team of TEAMS) {
        const tr = team.stickers.filter(s => (repMap[s.id] ?? 0) > 0);
        if (tr.length) { lines.push('*' + team.name + '*'); lines.push(tr.map(s => s.id + 'x' + repMap[s.id]).join(' - ')); lines.push(''); }
      }
      const cocaR = COCA_STICKERS.filter(s => (repMap[s.id] ?? 0) > 0);
      if (cocaR.length) { lines.push('*Coca-Cola*'); lines.push(cocaR.map(s => s.id + 'x' + repMap[s.id]).join(' - ')); }

    } else {
      lines.push('RESUMEN: ' + this.col.ownedCount() + '/' + this.col.totalBase + ' (' + this.col.completionPct() + '%)');
      lines.push('Coca-Cola: ' + this.col.cocaOwnedCount() + '/14');
      lines.push('Repetidas: ' + this.col.repeatedCount());
      lines.push('');
      for (const team of TEAMS) {
        const owned = team.stickers.filter(s => !missingIds.has(s.id));
        if (owned.length > 0)
          lines.push(team.name + ': ' + owned.length + '/20 -> ' + owned.map(s => s.id).join(' - '));
      }
    }
    return lines.join('\n');
  }

  copyToClipboard(type: 'missing' | 'repeated' | 'all'): void {
    const text = this.exportAsText(type);
    navigator.clipboard.writeText(text).then(() => {
      alert('Copiado! Podes pegarlo en WhatsApp.');
    });
  }

  // ── Helpers ───────────────────────────────────────────────
  private header(doc: jsPDF, subtitle: string, user: string): number {
    try { doc.addImage(LOGO_B64, 'PNG', 140, 5, 55, 22); } catch(e) {}
    doc.setFontSize(20); doc.setTextColor(255,130,0); doc.setFont('helvetica','bold');
    doc.text('URISCO', 14, 16);
    doc.setFontSize(9); doc.setTextColor(140); doc.setFont('helvetica','normal');
    doc.text('PANINI - FIFA WORLD CUP 2026', 14, 23);
    doc.setDrawColor(255,130,0); doc.setLineWidth(0.4);
    doc.line(14, 27, 196, 27);
    doc.setFontSize(13); doc.setTextColor(30); doc.setFont('helvetica','bold');
    doc.text(subtitle + ' - ' + user, 14, 36);
    doc.setFont('helvetica','normal');
    return 44;
  }

  private block(doc: jsPDF, title: string, ids: string[], y: number): number {
    y = this.pg(doc, y, 14);
    doc.setFillColor(235, 240, 255);
    doc.rect(13, y - 4, 184, 7, 'F');
    doc.setFontSize(8); doc.setTextColor(40,80,160); doc.setFont('helvetica','bold');
    doc.text(title, 15, y);
    y += 6;
    doc.setFont('helvetica','normal'); doc.setTextColor(50);
    for (const chunk of this.chunks(ids, 18)) {
      y = this.pg(doc, y, 5);
      doc.text(chunk.join('  '), 15, y);
      y += 5;
    }
    return y + 2;
  }

  private repBlock(doc: jsPDF, title: string, items: string[], y: number): number {
    y = this.pg(doc, y, 14);
    doc.setFillColor(235, 245, 255);
    doc.rect(13, y - 4, 184, 7, 'F');
    doc.setFontSize(8); doc.setTextColor(40,80,160); doc.setFont('helvetica','bold');
    doc.text(title, 15, y);
    y += 6;
    doc.setFont('helvetica','normal'); doc.setTextColor(50);
    for (const chunk of this.chunks(items, 14)) {
      y = this.pg(doc, y, 5);
      doc.text(chunk.join('   '), 15, y);
      y += 5;
    }
    return y + 2;
  }

  private teamBlock(doc: jsPDF, title: string, ownedCount: number, total: number, owned: string[], missing: string[], y: number): number {
    y = this.pg(doc, y, 12);
    const pct = Math.round((ownedCount / total) * 100);
    doc.setFillColor(235, 248, 235);
    doc.rect(13, y - 4, 184, 7, 'F');
    doc.setFontSize(8); doc.setTextColor(30,100,30); doc.setFont('helvetica','bold');
    doc.text(title + '  -  ' + ownedCount + '/' + total + '  (' + pct + '%)', 15, y);
    y += 5;
    doc.setFont('helvetica','normal'); doc.setFontSize(8);
    if (owned.length) {
      for (const chunk of this.chunks(owned, 18)) {
        y = this.pg(doc, y, 5);
        doc.setTextColor(30,120,30);
        doc.text('+ ' + chunk.join('  '), 15, y);
        y += 4.5;
      }
    }
    if (missing.length) {
      for (const chunk of this.chunks(missing, 18)) {
        y = this.pg(doc, y, 5);
        doc.setTextColor(160,40,40);
        doc.text('- ' + chunk.join('  '), 15, y);
        y += 4.5;
      }
    }
    return y + 3;
  }

  private pg(doc: jsPDF, y: number, needed: number): number {
    if (y + needed > 278) {
      doc.addPage();
      doc.setFontSize(7); doc.setTextColor(180); doc.setFont('helvetica','normal');
      doc.text('URISCO - PANINI 2026', 14, 8);
      doc.setDrawColor(220); doc.setLineWidth(0.2); doc.line(14, 10, 196, 10);
      return 15;
    }
    return y;
  }

  private chunks<T>(arr: T[], size: number): T[][] {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  private today(): string { return new Date().toLocaleDateString('es-CR'); }
}