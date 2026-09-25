import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  PLATFORM_ID,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

let renderQueue: Promise<void> = Promise.resolve();
let mermaidPromise: Promise<typeof import('mermaid').default> | undefined;
let diagramSeq = 0;

function getMermaid() {
  mermaidPromise ??= import('mermaid').then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      flowchart: { htmlLabels: false },
    });
    return mermaid;
  });
  return mermaidPromise;
}

function renderDiagram(id: string, definition: string) {
  const task = renderQueue.then(async () => {
    const mermaid = await getMermaid();
    return mermaid.render(id, definition);
  });
  renderQueue = task.then(
    () => undefined,
    () => undefined,
  );
  return task;
}

@Component({
  selector: 'app-mermaid-diagram',
  host: { ngSkipHydration: 'true' },
  template: `
    <div
      [class]="'myrias-mermaid myrias-mermaid--' + variant()"
      role="img"
      [attr.aria-label]="label()"
      [attr.aria-describedby]="description() ? descriptionId : null"
      [attr.aria-busy]="!svg() && !failed()"
      tabindex="0"
    >
      @if (svg()) {
        <div class="myrias-mermaid__canvas" aria-hidden="true" [innerHTML]="svg()"></div>
      } @else {
        <p class="myrias-mermaid__status">
          {{ failed() ? 'Diagrama indisponível. A leitura em texto está logo abaixo.' : 'Preparando diagrama…' }}
        </p>
      }
    </div>
    <!-- O SVG encolhe para caber no card e o rótulo fica ilegível: o texto é a leitura real.
         É também a descrição do role=img, então o leitor de tela não ouve duas vezes. -->
    @if (description()) {
      <details class="myrias-mermaid__text" [open]="failed()">
        <summary>Ler o diagrama em texto</summary>
        <p [id]="descriptionId">{{ description() }}</p>
      </details>
    }
  `,
})
export class MermaidDiagram {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly platform = inject(PLATFORM_ID);
  readonly descriptionId = `project-diagram-${++diagramSeq}-description`;

  readonly definition = input.required<string>();
  readonly label = input.required<string>();
  readonly description = input<string>();
  readonly variant = input<'flowchart' | 'sequence'>('flowchart');

  readonly svg = signal<SafeHtml | null>(null);
  readonly failed = signal(false);
  private readonly ready = signal(false);

  constructor() {
    afterNextRender(() => this.ready.set(true));

    effect((onCleanup) => {
      const definition = this.definition();
      if (!this.ready() || !isPlatformBrowser(this.platform)) return;

      let active = true;
      this.svg.set(null);
      this.failed.set(false);
      const id = `d${++diagramSeq}`;

      renderDiagram(id, definition).then(
        (result) => {
          if (active) this.svg.set(this.sanitizer.bypassSecurityTrustHtml(result.svg));
        },
        () => {
          if (active) this.failed.set(true);
        },
      );

      onCleanup(() => {
        active = false;
      });
    });
  }
}
