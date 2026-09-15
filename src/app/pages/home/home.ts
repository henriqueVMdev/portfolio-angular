import {
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import gsap from 'gsap';
import { profile } from '../../data/portfolio';
import { HeroParticles } from '../../components/hero-particles';

const navigation = [
  { href: '#inicio', label: 'Início' },
  { href: '#projetos', label: 'Projetos' },
  { href: '#metodo', label: 'Método' },
  { href: '#trajetoria', label: 'Trajetória' },
  { href: '#contato', label: 'Contato' },
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

@Component({
  selector: 'app-home',
  imports: [HeroParticles],
  templateUrl: './home.html',
})
export class Home {
  private readonly destroyRef = inject(DestroyRef);
  readonly navRef = viewChild<HTMLElement>('nav');
  readonly menuButton = viewChild<HTMLButtonElement>('menuButton');

  readonly profile = profile;
  readonly navigation = navigation;
  readonly heroParticles = heroParticlesConfig;
  readonly menuOpen = signal(false);

  readonly nameParts = profile.name.trim().split(/\s+/);
  readonly firstName = this.nameParts[0] || 'SEU';
  readonly remainingName = this.nameParts.slice(1).join(' ') || 'NOME';

  readonly heroStage = viewChild<HTMLElement>('heroStage');
  readonly heroVideo = viewChild<HTMLVideoElement>('heroVideo');
  readonly heroReady = signal(false);
  readonly heroSource = signal<string | undefined>(undefined);

  constructor() {
    afterNextRender(() => {
      this.setupHeroVideo();
      this.setupHeroMotion();
      this.setupNavShift();
      this.setupMenuEscape();
    });
  }

  onHeroError() {
    this.heroReady.set(false);
    this.heroSource.set(undefined);
  }

  toggleMenu() {
    const next = !this.menuOpen();
    this.menuOpen.set(next);
    document.body.classList.toggle('menu-is-open', next);
  }

  closeMenu() {
    this.menuOpen.set(false);
    document.body.classList.remove('menu-is-open');
  }

  private setupHeroVideo() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (
      navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }
    ).connection;
    const allowed = !reducedMotion.matches && !connection?.saveData;
    const stage = this.heroStage();

    if (!allowed) {
      if (stage) {
        stage.dataset['heroMotion'] = 'static';
        stage.style.setProperty('--hero-progress', '0');
      }
      return;
    }

    this.heroSource.set('/media/hero-1920-5s.mp4');

    requestAnimationFrame(() => {
      const video = this.heroVideo();
      if (!stage || !video) return;

      const maxTime = 9;
      let stopTime = maxTime;
      let finished = false;

      stage.dataset['heroMotion'] = 'autoplay';
      stage.style.setProperty('--hero-progress', '0');

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

      video.addEventListener('loadedmetadata', onMeta);
      video.addEventListener('timeupdate', onTime);
      video.addEventListener('ended', stop);
      void video.play().then(() => this.heroReady.set(true)).catch(() => {
        stage.dataset['heroMotion'] = 'blocked';
      });

      this.destroyRef.onDestroy(() => {
        video.removeEventListener('loadedmetadata', onMeta);
        video.removeEventListener('timeupdate', onTime);
        video.removeEventListener('ended', stop);
        video.pause();
      });
    });
  }

  private setupHeroMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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
    });

    this.destroyRef.onDestroy(() => context.revert());
  }

  private setupNavShift() {
    const nav = this.navRef();
    if (!nav) return;

    let frameId = 0;
    let lastY = window.scrollY;
    let shift = 0;

    const update = () => {
      frameId = 0;
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

    const schedule = () => {
      if (frameId === 0) frameId = window.requestAnimationFrame(update);
    };

    window.addEventListener('scroll', schedule, { passive: true });
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', schedule);
      if (frameId) window.cancelAnimationFrame(frameId);
    });
  }

  private setupMenuEscape() {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !this.menuOpen()) return;
      this.closeMenu();
      this.menuButton()?.focus();
    };
    document.addEventListener('keydown', onKey);
    this.destroyRef.onDestroy(() => document.removeEventListener('keydown', onKey));
  }
}
