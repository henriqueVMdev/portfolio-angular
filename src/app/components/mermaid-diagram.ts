import {
  Component,
  PLATFORM_ID,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
          {{ failed() ? 'Diagrama indisponível.' : 'Preparando diagrama…' }}
        </p>
      }
      @if (description()) {
        <span [id]="descriptionId" class="visually-hidden">{{ description() }}</span>
      }
    </div>
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

  constructor() {
    effect((onCleanup) => {
      const definition = this.definition();
      if (!isPlatformBrowser(this.platform)) return;

      let active = true;
      this.svg.set(null);
      this.failed.set(false);
      const id = `project-diagram-${++diagramSeq}`;

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
