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

const diagramFiles = {
  cycle: '01-ciclo-custodia.svg',
  context: '02-contexto.svg',
  layers: '03-camadas.svg',
} as const;

export type OmniSegDiagram = keyof typeof diagramFiles;

@Component({
  selector: 'app-omniseg-svg-diagram',
  host: { ngSkipHydration: 'true' },
  template: `
    <div
      [class]="'omniseg-svg-diagram omniseg-svg-diagram--' + diagram()"
      role="region"
      [attr.aria-label]="label()"
      tabindex="0"
      [innerHTML]="svg()"
    ></div>
  `,
})
export class OmniSegSvgDiagram {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly platform = inject(PLATFORM_ID);

  readonly diagram = input.required<OmniSegDiagram>();
  readonly label = input.required<string>();
  readonly svg = signal<SafeHtml | null>(null);
  private readonly ready = signal(false);

  constructor() {
    afterNextRender(() => this.ready.set(true));

    effect((onCleanup) => {
      const diagram = this.diagram();
      if (!this.ready() || !isPlatformBrowser(this.platform)) return;

      let active = true;
      fetch(`/media/diagramas/omniseg/${diagramFiles[diagram]}`)
        .then((response) => (response.ok ? response.text() : Promise.reject()))
        .then((markup) => {
          if (active) this.svg.set(this.sanitizer.bypassSecurityTrustHtml(markup));
        })
        .catch(() => undefined);

      onCleanup(() => {
        active = false;
      });
    });
  }
}
