import {
  Component,
  DestroyRef,
  ElementRef,
  Input,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';

type EllipseMask = { cx: number; cy: number; rx: number; ry: number };
type SafeZone = { x: number; y: number; w: number; h: number };
type ResponsiveValue<T> = { desktop: T; mobile: T };
type Particle = {
  across: number;
  alpha: number;
  color: string;
  depth: number;
  drift: number;
  driftSpeed: number;
  flow: number;
  phase: number;
  size: number;
  speed: number;
  twinkle: number;
};

const SOURCE_WIDTH = 1920;
const SOURCE_HEIGHT = 1080;
const HERO_MEDIA_MAX_WIDTH = 1920;
const MOBILE_BREAKPOINT = 680;
const FRAME_INTERVAL = 1000 / 30;
const MAX_PIXEL_RATIO = 1;
const MAX_CANVAS_WIDTH = 1920;
const MAX_CANVAS_HEIGHT = 1080;
const TEXT_SAFE_SELECTORS = ['.hero__role', '.hero__name', '.hero__copy', '.hero__actions'].join(',');

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const progress = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return progress * progress * (3 - 2 * progress);
};

const createRandom = (seed: number) => {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
};

const createParticles = (count: number): Particle[] => {
  const random = createRandom(0x74657472);
  return Array.from({ length: count }, (_, index): Particle => {
    const depth = random();
    return {
      across: random() * 2 - 1,
      alpha: 0.07 + depth * 0.18,
      color: index % 4 === 0 ? 'rgb(244 226 190)' : index % 3 === 0 ? 'rgb(205 224 218)' : 'rgb(222 174 112)',
      depth,
      drift: 0.025 + random() * 0.085,
      driftSpeed: 0.18 + random() * 0.34,
      flow: random(),
      phase: random() * Math.PI * 2,
      size: 0.45 + depth * 1.35,
      speed: 0.008 + depth * 0.018,
      twinkle: 0.45 + random() * 0.8,
    };
  });
};

const resolveVideoContent = (width: number, height: number, mobile: boolean) => {
  const elementWidth = Math.min(width, HERO_MEDIA_MAX_WIDTH);
  const elementLeft = (width - elementWidth) / 2;
  const scale = mobile
    ? Math.min(elementWidth / SOURCE_WIDTH, height / SOURCE_HEIGHT)
    : Math.max(elementWidth / SOURCE_WIDTH, height / SOURCE_HEIGHT);
  const renderedWidth = SOURCE_WIDTH * scale;
  const renderedHeight = SOURCE_HEIGHT * scale;
  return {
    height: renderedHeight,
    left: elementLeft + (elementWidth - renderedWidth) * (mobile ? 0.5 : 0.32),
    top: (height - renderedHeight) * (mobile ? 0.34 : 0.5),
    width: renderedWidth,
  };
};

const safeZoneAttenuation = (x: number, y: number, zones: SafeZone[]) =>
  zones.reduce((attenuation, zone) => {
    const horizontalDistance = Math.max(zone.x - x, 0, x - (zone.x + zone.w));
    const verticalDistance = Math.max(zone.y - y, 0, y - (zone.y + zone.h));
    return Math.min(attenuation, smoothstep(0.012, 0.055, Math.hypot(horizontalDistance, verticalDistance)));
  }, 1);

@Component({
  selector: 'app-hero-particles',
  template: `<canvas #canvas class="hero-particles" aria-hidden="true" tabindex="-1"></canvas>`,
  styles: `:host { display: contents; }`,
})
export class HeroParticles {
  @Input({ required: true }) lightMask!: ResponsiveValue<EllipseMask>;
  @Input({ required: true }) textSafeZone!: ResponsiveValue<SafeZone>;
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => this.start());
  }

  private start() {
    const canvas = this.canvasRef()?.nativeElement;
    // ponytail: o host <app-hero-particles> e display:contents, nao gera caixa,
    // entao medir por parentElement da 0x0. O offsetParent do canvas absoluto e a .hero.
    const container = (canvas?.offsetParent as HTMLElement | null) ?? canvas?.parentElement;
    const context = canvas?.getContext('2d', { alpha: true, desynchronized: true });
    if (!canvas || !container || !context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const forcedColors = window.matchMedia('(forced-colors: active)');
    const mobileViewport = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const connection = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
    const lightMask = this.lightMask;
    const textSafeZone = this.textSafeZone;

    let animationFrame = 0;
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let safeZones: SafeZone[] = [];
    let isIntersecting = true;
    let lastDrawAt = 0;
    const clockOrigin = performance.now();

    const cancelAnimation = () => {
      if (!animationFrame) return;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const draw = (timestamp: number) => {
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      if (forcedColors.matches || width === 0 || height === 0) return;

      const mobile = mobileViewport.matches;
      const mask = mobile ? lightMask.mobile : lightMask.desktop;
      const media = resolveVideoContent(width, height, mobile);
      const centerX = media.left + mask.cx * media.width;
      const centerY = media.top + mask.cy * media.height;
      const radiusX = mask.rx * media.width;
      const radiusY = mask.ry * media.height;
      const elapsed = Math.max(0, timestamp - clockOrigin) / 1000;

      context.globalCompositeOperation = 'source-over';
      particles.forEach((particle) => {
        const flow = (particle.flow + elapsed * particle.speed) % 1;
        const normalizedY = 1 - flow * 2;
        const availableWidth = Math.sqrt(Math.max(0, 1 - normalizedY * normalizedY));
        const drift = Math.sin(elapsed * particle.driftSpeed + particle.phase) * particle.drift;
        const normalizedX = clamp((particle.across + drift) * availableWidth, -availableWidth, availableWidth);
        const x = centerX + normalizedX * radiusX;
        const y = centerY + normalizedY * radiusY;
        const safeAlpha = safeZoneAttenuation(x / width, y / height, safeZones);
        if (safeAlpha <= 0.001) return;
        const edgeFade = Math.pow(Math.max(0, 1 - normalizedX * normalizedX - normalizedY * normalizedY), 0.45);
        const twinkle = 0.72 + 0.18 * Math.sin(elapsed * particle.twinkle + particle.phase);
        const alpha = particle.alpha * edgeFade * twinkle * safeAlpha;
        if (alpha <= 0.005) return;
        const size = particle.size * (0.82 + particle.depth * 0.42);
        context.globalAlpha = alpha * 0.1;
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(x, y, size * 2.15, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = alpha * 0.78;
        context.beginPath();
        context.arc(x, y, size, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;
    };

    const render = (timestamp: number) => {
      animationFrame = 0;
      const timeSinceDraw = timestamp - lastDrawAt;
      if (timeSinceDraw >= FRAME_INTERVAL - 1) {
        draw(timestamp);
        lastDrawAt = timestamp - (timeSinceDraw % FRAME_INTERVAL);
      }
      if (isIntersecting && !document.hidden) animationFrame = window.requestAnimationFrame(render);
    };

    const resize = () => {
      const bounds = container.getBoundingClientRect();
      width = Math.max(0, Math.round(bounds.width));
      height = Math.max(0, Math.round(bounds.height));
      const mobile = mobileViewport.matches;
      pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        MAX_PIXEL_RATIO,
        width > 0 ? MAX_CANVAS_WIDTH / width : 1,
        height > 0 ? MAX_CANVAS_HEIGHT / height : 1,
      );
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      const fallbackZone = mobile ? textSafeZone.mobile : textSafeZone.desktop;
      const safeMargin = mobile ? 12 : 18;
      const measuredZones = Array.from(container.querySelectorAll<HTMLElement>(TEXT_SAFE_SELECTORS)).map(
        (element): SafeZone => {
          const rect = element.getBoundingClientRect();
          const left = clamp(rect.left - bounds.left - safeMargin, 0, width);
          const top = clamp(rect.top - bounds.top - safeMargin, 0, height);
          const right = clamp(rect.right - bounds.left + safeMargin, 0, width);
          const bottom = clamp(rect.bottom - bounds.top + safeMargin, 0, height);
          return {
            x: width > 0 ? left / width : 0,
            y: height > 0 ? top / height : 0,
            w: width > 0 ? Math.max(0, right - left) / width : 0,
            h: height > 0 ? Math.max(0, bottom - top) / height : 0,
          };
        },
      );
      safeZones = [fallbackZone, ...measuredZones];
      const media = resolveVideoContent(width, height, mobile);
      const mask = mobile ? lightMask.mobile : lightMask.desktop;
      const ellipseArea = Math.PI * mask.rx * media.width * mask.ry * media.height;
      const animatedCount = clamp(Math.round(ellipseArea / 6500), mobile ? 20 : 30, mobile ? 32 : 52);
      const staticMode = reducedMotion.matches || Boolean(connection?.saveData);
      particles = createParticles(staticMode ? Math.min(animatedCount, mobile ? 10 : 16) : animatedCount);
    };

    const start = () => {
      cancelAnimation();
      resize();
      lastDrawAt = 0;
      if (forcedColors.matches) {
        draw(performance.now());
        return;
      }
      if (reducedMotion.matches || connection?.saveData) {
        draw(clockOrigin + 12000);
        return;
      }
      if (isIntersecting && !document.hidden) animationFrame = window.requestAnimationFrame(render);
    };

    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(start);
    const intersectionObserver =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              isIntersecting = entry.isIntersecting;
              start();
            },
            { rootMargin: '12% 0px', threshold: 0 },
          );

    resizeObserver?.observe(container);
    intersectionObserver?.observe(container);
    if (!resizeObserver) window.addEventListener('resize', start);
    document.addEventListener('visibilitychange', start);
    reducedMotion.addEventListener('change', start);
    forcedColors.addEventListener('change', start);
    mobileViewport.addEventListener('change', start);
    connection?.addEventListener('change', start);
    start();

    this.destroyRef.onDestroy(() => {
      cancelAnimation();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      if (!resizeObserver) window.removeEventListener('resize', start);
      document.removeEventListener('visibilitychange', start);
      reducedMotion.removeEventListener('change', start);
      forcedColors.removeEventListener('change', start);
      mobileViewport.removeEventListener('change', start);
      connection?.removeEventListener('change', start);
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
    });
  }
}
