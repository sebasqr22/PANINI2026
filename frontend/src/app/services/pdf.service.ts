import { Injectable } from '@angular/core';
import { CollectionService } from './collection.service';
import { TEAMS, FWC_STICKERS, COCA_STICKERS } from '../models/album-data';
import jsPDF from 'jspdf';

const MASCOTA_B64 = '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';

@Injectable({ providedIn: 'root' })
export class PdfService {
  constructor(private col: CollectionService) {}

  // ── PDF: Solo Faltantes ───────────────────────────────────
  exportMissing(): void {
    const doc = new jsPDF();
    const user = this.col.currentUser() ?? 'Usuario';
    const missingIds = new Set(this.col.getMissingIds());
    let y = this.addHeader(doc, 'Postales Faltantes', user);

    doc.setFontSize(9); doc.setTextColor(120);
    doc.text(`Faltan: ${this.col.missingCount()} de ${this.col.totalBase}   ·   ${this.today()}`, 14, y);
    y += 10;

    const fwcMissing = FWC_STICKERS.filter(s => missingIds.has(s.id)).map(s => s.id);
    if (fwcMissing.length) y = this.addBlock(doc, 'Sección FWC', fwcMissing, y, '#1a3a6b');

    for (const team of TEAMS) {
      const ids = team.stickers.filter(s => missingIds.has(s.id)).map(s => s.id);
      if (ids.length) y = this.addBlock(doc, `${team.flag} ${team.name}`, ids, y, '#1a3a6b');
    }

    const cocaMissing = COCA_STICKERS.filter(s => missingIds.has(s.id)).map(s => s.id);
    if (cocaMissing.length) y = this.addBlock(doc, '🥤 Coca-Cola', cocaMissing, y, '#8b0000');

    doc.save(`urisco_faltantes_${user}.pdf`);
  }

  // ── PDF: Solo Repetidas ───────────────────────────────────
  exportRepeated(): void {
    const doc = new jsPDF();
    const user = this.col.currentUser() ?? 'Usuario';
    const repMap = this.col.getRepeatedMap();
    let y = this.addHeader(doc, 'Postales Repetidas', user);

    doc.setFontSize(9); doc.setTextColor(120);
    doc.text(`Total repetidas: ${this.col.repeatedCount()}   ·   ${this.today()}`, 14, y);
    y += 10;

    if (Object.keys(repMap).length === 0) {
      doc.setFontSize(12); doc.setTextColor(100);
      doc.text('No tenés postales repetidas aún.', 14, y);
    } else {
      const fwcRep = FWC_STICKERS.filter(s => (repMap[s.id] ?? 0) > 0);
      if (fwcRep.length) y = this.addRepBlock(doc, 'Sección FWC', fwcRep.map(s => ({ id: s.id, count: repMap[s.id] })), y);

      for (const team of TEAMS) {
        const tr = team.stickers.filter(s => (repMap[s.id] ?? 0) > 0).map(s => ({ id: s.id, count: repMap[s.id] }));
        if (tr.length) y = this.addRepBlock(doc, `${team.flag} ${team.name}`, tr, y);
      }

      const cocaRep = COCA_STICKERS.filter(s => (repMap[s.id] ?? 0) > 0);
      if (cocaRep.length) y = this.addRepBlock(doc, '🥤 Coca-Cola', cocaRep.map(s => ({ id: s.id, count: repMap[s.id] })), y);
    }

    doc.save(`urisco_repetidas_${user}.pdf`);
  }

  // ── PDF: Colección Completa ───────────────────────────────
  exportAll(): void {
    const doc = new jsPDF();
    const user = this.col.currentUser() ?? 'Usuario';
    const missingIds = new Set(this.col.getMissingIds());
    let y = this.addHeader(doc, 'Colección Completa', user);

    doc.setFontSize(9); doc.setTextColor(120);
    doc.text(`Tengo: ${this.col.ownedCount()} | Faltan: ${this.col.missingCount()} | Progreso: ${this.col.completionPct()}%   ·   ${this.today()}`, 14, y);
    y += 10;

    // FWC
    const fwcOwned   = FWC_STICKERS.filter(s => !missingIds.has(s.id)).map(s => s.id);
    const fwcMissing = FWC_STICKERS.filter(s =>  missingIds.has(s.id)).map(s => s.id);
    if (fwcOwned.length || fwcMissing.length) {
      y = this.checkPage(doc, y, 18);
      y = this.addTeamBlock(doc, 'Sección FWC', fwcOwned.length, 20, fwcOwned, fwcMissing, y);
    }

    // Teams — solo los que tienen al menos 1 carta
    for (const team of TEAMS) {
      const owned   = team.stickers.filter(s => !missingIds.has(s.id)).map(s => s.id);
      const missing = team.stickers.filter(s =>  missingIds.has(s.id)).map(s => s.id);
      if (owned.length > 0) {
        y = this.checkPage(doc, y, 18);
        y = this.addTeamBlock(doc, `${team.flag} ${team.name}`, owned.length, 20, owned, missing, y);
      }
    }

    // Coca — solo si tiene alguna
    const cocaOwned   = COCA_STICKERS.filter(s => !missingIds.has(s.id)).map(s => s.id);
    const cocaMissing = COCA_STICKERS.filter(s =>  missingIds.has(s.id)).map(s => s.id);
    if (cocaOwned.length > 0) {
      y = this.checkPage(doc, y, 18);
      y = this.addTeamBlock(doc, '🥤 Coca-Cola', cocaOwned.length, 14, cocaOwned, cocaMissing, y);
    }

    doc.save(`urisco_coleccion_${user}.pdf`);
  }

  // ── Exportar como texto para WhatsApp ─────────────────────
  exportAsText(type: 'missing' | 'repeated' | 'all'): string {
    const user = this.col.currentUser() ?? 'Usuario';
    const missingIds = new Set(this.col.getMissingIds());
    const repMap = this.col.getRepeatedMap();
    const lines: string[] = [];

    lines.push(`🏆 URISCO PANINI 2026 — ${user}`);
    lines.push(`📅 ${this.today()}`);
    lines.push('');

    if (type === 'missing') {
      lines.push(`❌ POSTALES FALTANTES (${this.col.missingCount()})`);
      lines.push('');

      const fwcM = FWC_STICKERS.filter(s => missingIds.has(s.id)).map(s => s.id);
      if (fwcM.length) {
        lines.push('📋 *Sección FWC*');
        lines.push(fwcM.join(' · '));
        lines.push('');
      }

      for (const team of TEAMS) {
        const ids = team.stickers.filter(s => missingIds.has(s.id)).map(s => s.id);
        if (ids.length) {
          lines.push(`${team.flag} *${team.name}* (${ids.length} faltan)`);
          lines.push(ids.join(' · '));
          lines.push('');
        }
      }

      const cocaM = COCA_STICKERS.filter(s => missingIds.has(s.id)).map(s => s.id);
      if (cocaM.length) {
        lines.push('🥤 *Coca-Cola*');
        lines.push(cocaM.join(' · '));
      }

    } else if (type === 'repeated') {
      lines.push(`🔄 POSTALES REPETIDAS (${this.col.repeatedCount()} total)`);
      lines.push('');

      const fwcR = FWC_STICKERS.filter(s => (repMap[s.id] ?? 0) > 0);
      if (fwcR.length) {
        lines.push('📋 *Sección FWC*');
        lines.push(fwcR.map(s => `${s.id}×${repMap[s.id]}`).join(' · '));
        lines.push('');
      }

      for (const team of TEAMS) {
        const tr = team.stickers.filter(s => (repMap[s.id] ?? 0) > 0);
        if (tr.length) {
          lines.push(`${team.flag} *${team.name}*`);
          lines.push(tr.map(s => `${s.id}×${repMap[s.id]}`).join(' · '));
          lines.push('');
        }
      }

      const cocaR = COCA_STICKERS.filter(s => (repMap[s.id] ?? 0) > 0);
      if (cocaR.length) {
        lines.push('🥤 *Coca-Cola*');
        lines.push(cocaR.map(s => `${s.id}×${repMap[s.id]}`).join(' · '));
      }

    } else {
      lines.push(`📊 RESUMEN: ${this.col.ownedCount()}/${this.col.totalBase} (${this.col.completionPct()}%)`);
      lines.push(`🥤 Coca-Cola: ${this.col.cocaOwnedCount()}/14`);
      lines.push(`🔄 Repetidas: ${this.col.repeatedCount()}`);
      lines.push('');

      for (const team of TEAMS) {
        const owned = team.stickers.filter(s => !missingIds.has(s.id));
        if (owned.length > 0) {
          lines.push(`${team.flag} ${team.name}: ${owned.length}/20 → ${owned.map(s => s.id).join(' · ')}`);
        }
      }
    }

    return lines.join('\n');
  }

  copyToClipboard(type: 'missing' | 'repeated' | 'all'): void {
    const text = this.exportAsText(type);
    navigator.clipboard.writeText(text).then(() => {
      alert('📋 ¡Copiado! Podés pegarlo en WhatsApp o cualquier mensaje.');
    });
  }

  // ── Helpers PDF ───────────────────────────────────────────
  private addHeader(doc: jsPDF, subtitle: string, user: string): number {
    // Logo mascota
    try {
      doc.addImage(MASCOTA_B64, 'PNG', 170, 8, 28, 28);
    } catch(e) {}

    doc.setFontSize(18); doc.setTextColor(255, 130, 0); doc.setFont('helvetica', 'bold');
    doc.text('URISCO', 14, 18);
    doc.setFontSize(10); doc.setTextColor(100); doc.setFont('helvetica', 'normal');
    doc.text('PANINI · FIFA WORLD CUP 2026', 14, 25);

    doc.setDrawColor(255, 130, 0); doc.setLineWidth(0.5);
    doc.line(14, 30, 196, 30);

    doc.setFontSize(13); doc.setTextColor(30); doc.setFont('helvetica', 'bold');
    doc.text(`${subtitle} — ${user}`, 14, 40);
    doc.setFont('helvetica', 'normal');
    return 48;
  }

  private addBlock(doc: jsPDF, title: string, ids: string[], y: number, color: string): number {
    y = this.checkPage(doc, y, 16);
    // Title row with colored background
    doc.setFillColor(240, 244, 255);
    doc.roundedRect(13, y - 4, 184, 8, 1, 1, 'F');
    doc.setFontSize(9); doc.setTextColor(30, 80, 160); doc.setFont('helvetica', 'bold');
    doc.text(title, 16, y + 0.5);
    y += 7;

    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(60);
    // Chunk ids into rows of ~12
    const chunks = this.chunkArray(ids, 14);
    for (const chunk of chunks) {
      y = this.checkPage(doc, y, 6);
      doc.text(chunk.join('  '), 16, y);
      y += 5;
    }
    return y + 3;
  }

  private addRepBlock(doc: jsPDF, title: string, items: {id:string,count:number}[], y: number): number {
    y = this.checkPage(doc, y, 16);
    doc.setFillColor(240, 248, 255);
    doc.roundedRect(13, y - 4, 184, 8, 1, 1, 'F');
    doc.setFontSize(9); doc.setTextColor(30, 80, 160); doc.setFont('helvetica', 'bold');
    doc.text(title, 16, y + 0.5);
    y += 7;

    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(60);
    const chunks = this.chunkArray(items.map(i => `${i.id}×${i.count}`), 12);
    for (const chunk of chunks) {
      y = this.checkPage(doc, y, 6);
      doc.text(chunk.join('   '), 16, y);
      y += 5;
    }
    return y + 3;
  }

  private addTeamBlock(doc: jsPDF, title: string, ownedCount: number, total: number, owned: string[], missing: string[], y: number): number {
    y = this.checkPage(doc, y, 14);
    // Header row
    const pct = Math.round((ownedCount / total) * 100);
    doc.setFillColor(240, 248, 235);
    doc.roundedRect(13, y - 4, 184, 8, 1, 1, 'F');
    doc.setFontSize(9); doc.setTextColor(30, 100, 30); doc.setFont('helvetica', 'bold');
    doc.text(`${title}  —  ${ownedCount}/${total}  (${pct}%)`, 16, y + 0.5);
    y += 7;

    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);

    if (owned.length) {
      doc.setTextColor(30, 120, 30);
      const chunks = this.chunkArray(owned, 16);
      for (const chunk of chunks) {
        y = this.checkPage(doc, y, 5);
        doc.text('✓ ' + chunk.join('  '), 16, y);
        y += 4.5;
      }
    }
    if (missing.length) {
      doc.setTextColor(160, 40, 40);
      const chunks = this.chunkArray(missing, 16);
      for (const chunk of chunks) {
        y = this.checkPage(doc, y, 5);
        doc.text('✗ ' + chunk.join('  '), 16, y);
        y += 4.5;
      }
    }
    return y + 4;
  }

  private checkPage(doc: jsPDF, y: number, needed: number): number {
    if (y + needed > 278) {
      doc.addPage();
      // Mini header on continuation pages
      doc.setFontSize(7); doc.setTextColor(180); doc.setFont('helvetica', 'normal');
      doc.text('URISCO · PANINI 2026', 14, 8);
      doc.setDrawColor(220); doc.setLineWidth(0.3);
      doc.line(14, 10, 196, 10);
      return 16;
    }
    return y;
  }

  private chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
    return chunks;
  }

  private today(): string {
    return new Date().toLocaleDateString('es-CR');
  }
}
