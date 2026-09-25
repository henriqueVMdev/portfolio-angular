import { Component } from '@angular/core';
import { projects } from '../data/portfolio';
import { BlueprintLink } from './blueprint-link';

@Component({
  selector: 'app-project-showcase',
  imports: [BlueprintLink],
  templateUrl: './project-showcase.html',
})
export class ProjectShowcase {
  readonly projects = projects;

  repoLabel(url: string) {
    return url.replace(/^https?:\/\/(www\.)?github\.com\//, '');
  }
}
