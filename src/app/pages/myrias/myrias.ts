import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { BlueprintLink } from '../../components/blueprint-link';
import { InterfacePreview } from '../../components/interface-preview';
import { MermaidDiagram } from '../../components/mermaid-diagram';
import { myriasLayerFlow, myriasOauthFlow, myriasPackageMap } from '../../data/myrias-diagrams';
import { getProject, profile, projects } from '../../data/portfolio';

@Component({
  selector: 'app-myrias',
  imports: [RouterLink, BlueprintLink, InterfacePreview, MermaidDiagram],
  templateUrl: './myrias.html',
})
export class MyriasPage {
  readonly project = getProject('myrias')!;
  readonly next = getProject('basanos')!;
  readonly projectCount = projects.length;
  readonly packageMap = myriasPackageMap;
  readonly layerFlow = myriasLayerFlow;
  readonly oauthFlow = myriasOauthFlow;

  constructor() {
    const title = `${this.project.name} · ${this.project.category} · ${profile.name}`;
    inject(Title).setTitle(title);
    inject(Meta).updateTag({ name: 'description', content: this.project.summary });
  }
}
