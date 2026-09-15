import { Component, input } from '@angular/core';
import type { PortfolioProject } from '../data/portfolio';

@Component({
  selector: 'app-interface-preview',
  template: `
    <figure
      aria-hidden="true"
      class="interface-preview"
      [class]="'interface-preview--' + project().preview"
      [class.interface-preview--compact]="compact()"
    >
      <div class="interface-preview__frame">
        <div class="interface-preview__placeholder">
          <p>Trabalhando nas previews</p>
        </div>
      </div>
    </figure>
  `,
})
export class InterfacePreview {
  readonly project = input.required<PortfolioProject>();
  readonly compact = input(false);
}
