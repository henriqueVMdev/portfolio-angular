import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  PLATFORM_ID,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist';

const PDF_WORKER_SRC = '/vendor/pdf.worker.min.mjs';
const MAX_PIXEL_RATIO = 2;

@Component({
  selector: 'app-resume-modal',
  templateUrl: './resume-modal.html',
})
export class ResumeModal {
  private readonly platform = inject(PLATFORM_ID);
  readonly fileUrl = input.required<string>();
  readonly open = input(false);
  readonly closed = output();

  readonly status = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
  readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');
  readonly pages = viewChild<ElementRef<HTMLDivElement>>('pages');
  readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');

  private previousFocus: HTMLElement | null = null;
  private loadingTask: PDFDocumentLoadingTask | null = null;
  private pdf: PDFDocumentProxy | null = null;
  private renderToken = 0;

  constructor() {
    effect((onCleanup) => {
      if (!isPlatformBrowser(this.platform)) return;
      const open = this.open();
      const dialog = this.dialog()?.nativeElement;
      if (!dialog) return;

      if (open) {
        this.previousFocus =
          document.activeElement instanceof HTMLElement ? document.activeElement : null;
        if (!dialog.open) dialog.showModal();
        document.body.classList.add('resume-is-open');
        requestAnimationFrame(() => this.closeButton()?.nativeElement.focus());
        void this.loadPdf();
      } else {
        if (dialog.open) dialog.close();
        document.body.classList.remove('resume-is-open');
        this.previousFocus?.focus();
        this.previousFocus = null;
        this.teardownPdf();
      }

      onCleanup(() => {
        document.body.classList.remove('resume-is-open');
      });
    });
  }

  onBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) this.closed.emit();
  }

  onCancel(event: Event) {
    event.preventDefault();
    this.closed.emit();
  }

  private async loadPdf() {
    this.teardownPdf();
    this.status.set('loading');

    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
      const task = pdfjs.getDocument({ url: this.fileUrl() });
      this.loadingTask = task;
      const pdf = await task.promise;
      this.pdf = pdf;
      await this.renderPages(pdf);
      this.status.set('ready');
    } catch {
      this.status.set('error');
    }
  }

  private async renderPages(pdf: PDFDocumentProxy) {
    const host = this.pages()?.nativeElement;
    if (!host) return;

    const token = ++this.renderToken;
    const cssWidth = host.clientWidth;
    if (cssWidth <= 0) return;

    const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    const fragment = document.createDocumentFragment();

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      if (token !== this.renderToken) return;

      const unscaled = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({
        scale: (cssWidth / unscaled.width) * ratio,
      });

      const canvas = document.createElement('canvas');
      canvas.className = 'resume-modal__page';
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.height = `${Math.floor(viewport.height / ratio)}px`;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute(
        'aria-label',
        `Currículo, página ${pageNumber} de ${pdf.numPages}`,
      );

      await page.render({ canvas, viewport }).promise;
      if (token !== this.renderToken) return;
      fragment.append(canvas);
    }

    host.replaceChildren(fragment);
  }

  private teardownPdf() {
    this.renderToken += 1;
    void this.loadingTask?.destroy();
    this.loadingTask = null;
    this.pdf = null;
    this.pages()?.nativeElement.replaceChildren();
    this.status.set('idle');
  }
}
