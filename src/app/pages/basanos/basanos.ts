import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { setPageMeta } from '../../seo';
import { BlueprintLink } from '../../components/blueprint-link';
import { BlueprintContact } from '../../components/blueprint-contact';
import { MermaidDiagram } from '../../components/mermaid-diagram';
import { basanosArchitecture, basanosFunnel, basanosLimits } from '../../data/basanos-content';
import { getProject, profile, projects } from '../../data/portfolio';

@Component({
  selector: 'app-basanos',
  imports: [RouterLink, BlueprintLink, BlueprintContact, MermaidDiagram],
  templateUrl: './basanos.html',
})
export class BasanosPage {
  readonly project = getProject('basanos')!;
  readonly next = getProject('omniseg')!;
  readonly projectCount = projects.length;
  readonly funnel = basanosFunnel;
  readonly architecture = basanosArchitecture;
  readonly limits = basanosLimits;

  constructor() {
    const title = `${this.project.name} · ${this.project.category.toLowerCase()} · ${profile.name}`;
    setPageMeta(title, this.project.summary);
  }
}
