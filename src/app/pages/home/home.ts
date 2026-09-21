import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { profile } from '../../data/portfolio';
import { HeroParticles } from '../../components/hero-particles';
import { ProjectShowcase } from '../../components/project-showcase';
import { ResumeModal } from '../../components/resume-modal';
import { TrajectoryTimeline } from '../../components/trajectory-timeline';

const navigation = [
  { href: '#inicio', label: 'Início' },
  { href: '#projetos', label: 'Projetos' },
  { href: '#metodo', label: 'Método' },
  { href: '#trajetoria', label: 'Trajetória' },
  { href: '#contato', label: 'Contato' },
];

const methodPrinciples = [
  {
    marker: 'Δ',
    title: 'Modelar pelo gargalo',
    text: 'A arquitetura serve à restrição real, não à simetria do diagrama. Em Myrias o limite é a cota do marketplace, e o acesso externo passa por um único cliente. Em Basanos o limite é a honestidade temporal do dado, não a velocidade do cálculo.',
  },
  {
    marker: 'Σ',
    title: 'Restringir na fonte',
    text: 'Invariante que depende de disciplina do chamador não é invariante. Autorização vive no banco, sob RLS por papel; candles em formação são descartados antes de qualquer cálculo.',
  },
  {
    marker: 'Ω',
    title: 'Declarar o limite',
    text: 'O que o sistema não faz é documentado com a mesma clareza do que ele faz. Um projeto que esconde onde quebra não pode ser avaliado nem é confiável em produção.',
  },
];

const heroParticlesConfig = {
  lightMask: {
    desktop: { cx: 0.24, cy: 0.38, rx: 0.32, ry: 0.36 },
    mobile: { cx: 0.24, cy: 0.38, rx: 0.32, ry: 0.36 },
  },
  textSafeZone: {
    desktop: { x: 0.5, y: 0.18, w: 0.48, h: 0.8 },
    mobile: { x: 0.03, y: 0.07, w: 0.94, h: 0.26 },
  },
};

type HeaderSurface = 'dark' | 'limestone' | 'saffron';

const isPlaceholderContact = (contact: { href: string; value: string }) =>
  contact.href === '#' ||
  contact.href === 'https://github.com' ||
  contact.href === 'https://linkedin.com' ||
  contact.value.includes('exemplo.dev');

@Component({
  selector: 'app-home',
  imports: [HeroParticles, ProjectShowcase, ResumeModal, TrajectoryTimeline],
  templateUrl: './home.html',
})
export class Home {
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  readonly navRef = viewChild<ElementRef<HTMLElement>>('nav');
  readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  readonly mobileMenu = viewChild<ElementRef<HTMLElement>>('mobileMenu');
  readonly shell = viewChild<ElementRef<HTMLElement>>('shell');

  readonly profile = profile;
  readonly navigation = navigation;
  readonly methodPrinciples = methodPrinciples;
  readonly heroParticles = heroParticlesConfig;
  readonly menuOpen = signal(false);
  readonly resumeOpen = signal(false);
  readonly activeSection = signal('inicio');
  readonly headerSurface = signal<HeaderSurface>('dark');
  readonly contactStatus = signal<'idle' | 'sending' | 'sent' | 'error'>('idle');
  readonly contactError = signal('');

  readonly nameParts = profile.name.trim().split(/\s+/);
  readonly firstName = this.nameParts[0] || 'SEU';
  readonly remainingName = this.nameParts.slice(1).join(' ') || 'NOME';
  readonly primaryContact = profile.contacts[0];
  readonly primaryContactIsPlaceholder = isPlaceholderContact(this.primaryContact);
  readonly resumeContact = profile.contacts.find((contact) => contact.label === 'Currículo');

  readonly heroStage = viewChild<ElementRef<HTMLElement>>('heroStage');
  readonly heroVideo = viewChild<ElementRef<HTMLVideoElement>>('heroVideo');
  readonly heroReady = signal(false);
  readonly heroSource = signal<string | null>(null);

  get contactBusy() {
    return this.contactStatus() === 'sending';
  }

  get contactDisabled() {
    return this.primaryContactIsPlaceholder || this.contactBusy;
  }

  constructor() {
    afterNextRender(() => {
      this.setupHeroVideo();
      this.setupMotion();
      this.setupNav();
      this.setupMenuKeys();
      this.setupSectionObserver();
    });
  }

  onHeroError() {
    this.heroReady.set(false);
    this.heroSource.set(null);
  }

  toggleMenu() {
    this.menuOpen() ? this.closeMenu() : this.openMenu();
  }

  openMenu() {
    this.menuOpen.set(true);
    this.document.body.classList.add('menu-is-open');
    const panel = this.mobileMenu()?.nativeElement;
    const focusable = this.menuFocusable(panel);
    requestAnimationFrame(() => focusable[0]?.focus());
  }

  closeMenu() {
    this.menuOpen.set(false);
    this.document.body.classList.remove('menu-is-open');
  }

  isPlaceholder(contact: { href: string; value: string }) {
    return isPlaceholderContact(contact);
  }

  async onContactSubmit(event: Event) {
    event.preventDefault();
    if (this.contactDisabled) return;

    const form = event.target as HTMLFormElement;
    const data = new FormData(form);
    const from = String(data.get('from') || '').trim();
    const message = String(data.get('message') || '').trim();
    if (!from || !message) return;

    this.contactStatus.set('sending');
    this.contactError.set('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, message }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        this.contactStatus.set('error');
        this.contactError.set(payload?.error || 'Não foi possível enviar a mensagem agora.');
        return;
      }
      this.contactStatus.set('sent');
      form.reset();
    } catch {
      this.contactStatus.set('error');
      this.contactError.set('Falha de rede ao enviar a mensagem.');
    }
  }

  onContactInput() {
    if (this.contactStatus() !== 'idle') this.contactStatus.set('idle');
  }

  private menuFocusable(panel?: HTMLElement | null) {
    if (!panel) return [];
    return Array.from(
      panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
  }

  private setupHeroVideo() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (
      navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }
    ).connection;
    const stage = this.heroStage()?.nativeElement;
    const video = this.heroVideo()?.nativeElement;
    if (!stage || !video) return;

    // ponytail: o atributo `muted` so alimenta a propriedade IDL quando o parser cria o
    // elemento (HTML do SSR). Criado pelo Angular (navegacao de rota, HMR), `video.muted`
    // fica false e o Chrome recusa o autoplay.
    video.muted = true;

    stage.style.setProperty('--hero-progress', '0');

    if (reducedMotion.matches || connection?.saveData) {
      stage.dataset['heroMotion'] = 'static';
      return;
    }

    const maxTime = 9;
    let stopTime = maxTime;
    let started = false;
    let finished = false;

    stage.dataset['heroMotion'] = 'autoplay';

    const stop = () => {
      if (finished) return;
      finished = true;
      video.pause();
      try {
        video.currentTime = stopTime;
      } catch {
        /* keep last frame */
      }
      stage.style.setProperty('--hero-progress', '1');
      stage.dataset['heroMotion'] = 'complete';
    };

    const onMeta = () => {
      stopTime = Number.isFinite(video.duration)
        ? Math.min(maxTime, Math.max(0, video.duration))
        : maxTime;
    };

    const onTime = () => {
      if (video.currentTime >= stopTime - 1 / 120 || video.ended) {
        stop();
        return;
      }
      stage.style.setProperty(
        '--hero-progress',
        (stopTime > 0 ? Math.min(1, video.currentTime / stopTime) : 1).toFixed(4),
      );
    };

    // ponytail: o poster so pode sair depois que ha frame decodificado,
    // senao o video aparece preto entre o play() e o primeiro frame.
    const onData = () => {
      if (started || finished) return;
      started = true;
      this.heroReady.set(true);
      void video.play().catch(() => {
        stage.dataset['heroMotion'] = 'blocked';
      });
    };

    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('loadeddata', onData);
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('ended', stop);

    this.heroSource.set('/media/hero-1920-5s.mp4');

    this.destroyRef.onDestroy(() => {
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('loadeddata', onData);
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('ended', stop);
      video.pause();
    });
  }

  private setupMotion() {
    gsap.registerPlugin(ScrollTrigger);
    const root = this.shell()?.nativeElement;
    if (!root) return;

    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.fromTo(
          '[data-hero-reveal]',
          { y: 34, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
          {
            y: 0,
            opacity: 1,
            clipPath: 'inset(0 0 0% 0)',
            duration: 1.25,
            stagger: 0.14,
            ease: 'power3.out',
            clearProps: 'clipPath',
          },
        );

        gsap.utils.toArray<HTMLElement>('[data-project-stratum]').forEach((stratum) => {
          const projectMedia = stratum.querySelector<HTMLElement>('[data-project-media]');
          const projectNumber = stratum.querySelector<HTMLElement>('[data-project-number]');

          if (projectMedia) {
            gsap.fromTo(
              projectMedia,
              { clipPath: 'inset(0 100% 0 0)' },
              {
                clipPath: 'inset(0 0% 0 0)',
                duration: 1.2,
                ease: 'power3.out',
                clearProps: 'clipPath',
                scrollTrigger: {
                  trigger: stratum,
                  start: 'top 72%',
                  once: true,
                },
              },
            );
          }

          if (projectNumber) {
            gsap.fromTo(
              projectNumber,
              { yPercent: 38, opacity: 0 },
              {
                yPercent: 0,
                opacity: 1,
                duration: 1.1,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: stratum,
                  start: 'top 76%',
                  once: true,
                },
              },
            );
          }
        });

        gsap.fromTo(
          '.method-ledger__item',
          { x: 44, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.05,
            stagger: 0.16,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '.method-stage',
              start: 'top 68%',
              once: true,
            },
          },
        );

        gsap.fromTo(
          '.contact-stage__word',
          { clipPath: 'inset(0 100% 0 0)' },
          {
            clipPath: 'inset(0 0% 0 0)',
            duration: 1.35,
            ease: 'power3.out',
            clearProps: 'clipPath',
            scrollTrigger: {
              trigger: '.contact-stage',
              start: 'top 70%',
              once: true,
            },
          },
        );
      }, root);

      return () => context.revert();
    });

    media.add('(prefers-reduced-motion: no-preference) and (pointer: fine)', () => {
      const orbit = root.querySelector<HTMLElement>('.method-orbit');
      const outer = orbit?.querySelector('.method-orbit__ring--outer');
      const inner = orbit?.querySelector('.method-orbit__ring--inner');
      if (!orbit || !outer || !inner) return;

      const rotateOuter = gsap.quickTo(outer, 'rotation', {
        duration: 0.9,
        ease: 'power3.out',
      });
      const rotateInner = gsap.quickTo(inner, 'rotation', {
        duration: 1.35,
        ease: 'power3.out',
      });

      // ponytail: atan2 salta de +180 para -180, então acumulamos o delta
      // para o anel girar sempre pelo caminho curto em vez de dar a volta.
      let lastAngle = 0;
      let turned = 0;

      const followPointer = (event: PointerEvent) => {
        const rect = orbit.getBoundingClientRect();
        const angle =
          (Math.atan2(
            event.clientY - (rect.top + rect.height / 2),
            event.clientX - (rect.left + rect.width / 2),
          ) *
            180) /
          Math.PI;

        let delta = angle - lastAngle;
        if (delta > 180) delta -= 360;
        else if (delta < -180) delta += 360;

        lastAngle = angle;
        turned += delta;
        rotateOuter(turned);
        rotateInner(turned * -0.55);
      };

      this.zone.runOutsideAngular(() => {
        window.addEventListener('pointermove', followPointer, { passive: true });
      });

      return () => window.removeEventListener('pointermove', followPointer);
    });

    void document.fonts.ready.then(() => ScrollTrigger.refresh());
    this.destroyRef.onDestroy(() => media.revert());
  }

  private setupNav() {
    const root = this.shell()?.nativeElement;
    const nav = this.navRef()?.nativeElement;
    if (!root || !nav) return;

    const surfaces = Array.from(root.querySelectorAll<HTMLElement>('[data-header-surface]'));
    let frameId = 0;
    let lastY = window.scrollY;
    let shift = 0;

    const updateHeaderVisibility = () => {
      const y = window.scrollY;
      const height = nav.offsetHeight;
      const delta = y - lastY;
      lastY = y;
      shift =
        nav.classList.contains('mint-nav--open') || y <= height
          ? 0
          : Math.min(height, Math.max(0, shift + delta));
      nav.style.setProperty('--nav-shift', `${-shift}px`);
    };

    const updateHeaderSurface = () => {
      frameId = 0;
      updateHeaderVisibility();

      const navRect = nav.getBoundingClientRect();
      const sampleX = Math.max(0, Math.min(window.innerWidth - 1, window.innerWidth / 2));
      const sampleY = Math.max(
        0,
        Math.min(window.innerHeight - 1, navRect.top + navRect.height / 2),
      );

      const surface = this.document
        .elementsFromPoint(sampleX, sampleY)
        .map((element) => element.closest<HTMLElement>('[data-header-surface]'))
        .find((element): element is HTMLElement => Boolean(element && root.contains(element)));

      const detected = surface?.dataset['headerSurface'];
      const nextSurface: HeaderSurface =
        detected === 'limestone' || detected === 'saffron' ? detected : 'dark';
      if (this.headerSurface() !== nextSurface) this.headerSurface.set(nextSurface);
    };

    const schedule = () => {
      if (frameId === 0) frameId = window.requestAnimationFrame(updateHeaderSurface);
    };

    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
    resizeObserver?.observe(nav);
    surfaces.forEach((surface) => resizeObserver?.observe(surface));
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    updateHeaderSurface();

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      resizeObserver?.disconnect();
      if (frameId) window.cancelAnimationFrame(frameId);
    });
  }

  private setupMenuKeys() {
    const onKey = (event: KeyboardEvent) => {
      if (!this.menuOpen()) return;

      if (event.key === 'Escape') {
        this.closeMenu();
        this.menuButton()?.nativeElement.focus();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = this.menuFocusable(this.mobileMenu()?.nativeElement);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && this.document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && this.document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    this.document.addEventListener('keydown', onKey);
    this.destroyRef.onDestroy(() => {
      this.document.removeEventListener('keydown', onKey);
      this.document.body.classList.remove('menu-is-open');
    });
  }

  private setupSectionObserver() {
    const sections = navigation
      .map((item) => this.document.querySelector<HTMLElement>(item.href))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) this.activeSection.set(visible.target.id);
      },
      { rootMargin: '-28% 0px -58%', threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}
