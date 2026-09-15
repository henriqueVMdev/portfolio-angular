import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-blueprint-link',
  imports: [RouterLink],
  styles: `:host { display: contents; }`,
  template: `
    <a
      [class]="'blueprint-link ' + hostClass()"
      [routerLink]="path()"
      [fragment]="fragment()"
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

  readonly path = computed(() => this.href().split('#')[0] || '/');
  readonly fragment = computed(() => this.href().split('#')[1]);
}
