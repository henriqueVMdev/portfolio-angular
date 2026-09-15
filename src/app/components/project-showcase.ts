import { Component } from '@angular/core';
import { projects } from '../data/portfolio';
import { BlueprintLink } from './blueprint-link';
import { InterfacePreview } from './interface-preview';

@Component({
  selector: 'app-project-showcase',
  imports: [BlueprintLink, InterfacePreview],
  templateUrl: './project-showcase.html',
})
export class ProjectShowcase {
  readonly projects = projects;

  repoLabel(url: string) {
    return url.replace(/^https?:\/\/(www\.)?github\.com\//, '');
  }
}
