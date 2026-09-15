import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-blueprint-link',
  imports: [RouterLink],
  template: `
    <a
      class="blueprint-link"
      [class]="hostClass()"
      [routerLink]="href()"
      [attr.aria-label]="label()"
    >
      <ng-content />
    </a>
  `,
})
export class BlueprintLink {
  readonly href = input.required<string>();
  readonly hostClass = input('', { alias: 'class' });
  readonly label = input<string>();
}
