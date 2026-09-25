import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { setPageMeta } from '../../seo';
import { BlueprintLink } from '../../components/blueprint-link';
import { InterfacePreview } from '../../components/interface-preview';
import { MermaidDiagram } from '../../components/mermaid-diagram';
import {
  myriasAuthGates,
  myriasCatalogFlow,
  myriasContextFlow,
  myriasDataModel,
  myriasLayerFlow,
  myriasOauthFlow,
  myriasPackageMap,
} from '../../data/myrias-diagrams';
import { myriasIdentities, myriasLimits, myriasResults } from '../../data/myrias-content';
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
  readonly contextFlow = myriasContextFlow;
  readonly catalogFlow = myriasCatalogFlow;
  readonly dataModel = myriasDataModel;
  readonly authGates = myriasAuthGates;
  readonly results = myriasResults;
  readonly identities = myriasIdentities;
  readonly limits = myriasLimits;

  constructor() {
    const title = `${this.project.name} · ${this.project.category.toLowerCase()} · ${profile.name}`;
    setPageMeta(title, this.project.summary);
  }
}
