import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { setPageMeta } from '../../seo';
import { BlueprintLink } from '../../components/blueprint-link';
import { InterfacePreview } from '../../components/interface-preview';
import { OmniSegSvgDiagram } from '../../components/omniseg-svg-diagram';
import { omnisegLimits } from '../../data/omniseg-content';
import { getProject, profile, projects } from '../../data/portfolio';

@Component({
  selector: 'app-omniseg',
  imports: [RouterLink, BlueprintLink, InterfacePreview, OmniSegSvgDiagram],
  templateUrl: './omniseg.html',
})
export class OmniSegPage {
  readonly project = getProject('omniseg')!;
  readonly next = getProject('myrias')!;
  readonly projectCount = projects.length;
  readonly limits = omnisegLimits;

  constructor() {
    const title = `${this.project.name} · ${this.project.category.toLowerCase()} · ${profile.name}`;
    setPageMeta(title, this.project.summary);
  }
}
