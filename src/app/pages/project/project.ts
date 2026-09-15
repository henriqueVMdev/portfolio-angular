import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { BlueprintLink } from '../../components/blueprint-link';
import { InterfacePreview } from '../../components/interface-preview';
import { MermaidDiagram } from '../../components/mermaid-diagram';
import { OmniSegSvgDiagram } from '../../components/omniseg-svg-diagram';
import { basanosArchitecture, basanosFunnel, basanosLimits } from '../../data/basanos-content';
import { myriasLayerFlow, myriasOauthFlow, myriasPackageMap } from '../../data/myrias-diagrams';
import { omnisegLimits } from '../../data/omniseg-content';
import { getProject, profile, projects } from '../../data/portfolio';

const listedProjects = projects.filter((project) => project.detailsAvailable !== false);

const myriasSections = [
  { href: '#visao-geral', marker: '01', label: 'Visão geral' },
  { href: '#arquitetura', marker: '02', label: 'Arquitetura' },
  { href: '#documentacao', marker: '03', label: 'Contrato da API' },
  { href: '#decisoes', marker: '04', label: 'Decisões' },
];

const basanosSections = [
  { href: '#visao-geral', marker: '01', label: 'Visão geral' },
  { href: '#disciplina', marker: '02', label: 'A disciplina' },
  { href: '#funil', marker: '03', label: 'O funil' },
  { href: '#arquitetura', marker: '04', label: 'Arquitetura' },
  { href: '#limites', marker: '05', label: 'Limites conhecidos' },
  { href: '#escopo', marker: '06', label: 'Escopo adicional' },
];

const omnisegSections = [
  { href: '#visao-geral', marker: '01', label: 'Visão geral' },
  { href: '#regras', marker: '02', label: 'As regras' },
  { href: '#ciclo', marker: '03', label: 'O ciclo' },
  { href: '#arquitetura', marker: '04', label: 'Arquitetura' },
  { href: '#limites', marker: '05', label: 'Limites conhecidos' },
];

@Component({
  selector: 'app-project',
  imports: [BlueprintLink, InterfacePreview, MermaidDiagram, OmniSegSvgDiagram],
  templateUrl: './project.html',
})
export class ProjectPage {
  private readonly slug = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { initialValue: inject(ActivatedRoute).snapshot.paramMap.get('slug') ?? '' },
  );

  readonly project = computed(() => getProject(this.slug())!);
  readonly isMyrias = computed(() => this.project().slug === 'myrias');
  readonly isBasanos = computed(() => this.project().slug === 'basanos');
  readonly isOmniSeg = computed(() => this.project().slug === 'omniseg');
  readonly currentIndex = computed(() =>
    projects.findIndex((item) => item.slug === this.project().slug),
  );
  readonly sections = computed(() =>
    this.isMyrias() ? myriasSections : this.isBasanos() ? basanosSections : omnisegSections,
  );
  readonly nextProject = computed(() => {
    const index = listedProjects.findIndex((item) => item.slug === this.project().slug);
    return listedProjects.length > 1 && index >= 0
      ? listedProjects[(index + 1) % listedProjects.length]
      : undefined;
  });
  readonly wrapsToFirst = computed(() => this.nextProject()?.slug === listedProjects[0]?.slug);
  readonly statusLabel = computed(() => {
    if (this.isMyrias()) return 'Em produção, usado em operações internas, protegido por firewall';
    if (this.isBasanos()) return 'Pesquisa pessoal · uso local single-node';
    if (this.isOmniSeg()) return 'Projeto acadêmico individual · concluído';
    return 'Projeto demonstrativo';
  });
  readonly architectureSerial = computed(() =>
    this.isMyrias() ? '2' : this.isBasanos() || this.isOmniSeg() ? '4' : 'A',
  );

  readonly myriasPackageMap = myriasPackageMap;
  readonly myriasLayerFlow = myriasLayerFlow;
  readonly myriasOauthFlow = myriasOauthFlow;
  readonly basanosFunnel = basanosFunnel;
  readonly basanosArchitecture = basanosArchitecture;
  readonly basanosLimits = basanosLimits;
  readonly omnisegLimits = omnisegLimits;
  readonly projectCount = projects.length;

  constructor() {
    const title = inject(Title);
    const meta = inject(Meta);
    effect(() => {
      const project = this.project();
      if (!project) return;
      const pageTitle = `${project.name} · ${project.category} · ${profile.name}`;
      title.setTitle(pageTitle);
      meta.updateTag({ name: 'description', content: project.summary });
    });
  }
}
