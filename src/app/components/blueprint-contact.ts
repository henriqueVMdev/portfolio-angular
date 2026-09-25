import { Component, input } from '@angular/core';
import { profile, type PortfolioProject } from '../data/portfolio';
import { BlueprintLink } from './blueprint-link';

/** Fecho das plantas: o interesse é maior no fim do estudo de caso, então a saída é o contato. */
@Component({
  selector: 'app-blueprint-contact',
  imports: [BlueprintLink],
  template: `
    <section class="blueprint-contact" aria-labelledby="blueprint-contact-title">
      <h2 id="blueprint-contact-title">Conversar sobre o {{ project().name }}</h2>
      <div class="blueprint-contact__body">
        <p>Decisões, custos e o que ficou de fora cabem melhor numa conversa do que numa planta.</p>
        <div class="blueprint-contact__actions">
          <app-blueprint-link href="/#contato" class="mint-link mint-link--primary">
            <span>Iniciar conversa</span>
            <span aria-hidden="true">↗</span>
          </app-blueprint-link>
          @if (resume) {
            <a class="mint-link" [href]="resume.href" target="_blank" rel="noopener">
              <span>Currículo em PDF</span>
              <span aria-hidden="true">↗</span>
            </a>
          }
        </div>
      </div>
    </section>
  `,
})
export class BlueprintContact {
  readonly project = input.required<PortfolioProject>();
  readonly resume = profile.contacts.find((contact) => contact.label === 'Currículo');
}
