import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { BlueprintLink } from '../../components/blueprint-link';
import { InterfacePreview } from '../../components/interface-preview';
import { MermaidDiagram } from '../../components/mermaid-diagram';
import { basanosArchitecture, basanosFunnel, basanosLimits } from '../../data/basanos-content';
import { getProject, profile, projects } from '../../data/portfolio';

@Component({
  selector: 'app-basanos',
  imports: [RouterLink, BlueprintLink, InterfacePreview, MermaidDiagram],
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
    const title = `${this.project.name} · ${this.project.category} · ${profile.name}`;
    inject(Title).setTitle(title);
    inject(Meta).updateTag({ name: 'description', content: this.project.summary });
  }
}
