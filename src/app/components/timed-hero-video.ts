import {
  Component,
  DestroyRef,
  Input,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-timed-hero-video',
  template: `
    <div
      class="cinematic-media timed-hero-media hero-media"
      [class.timed-hero-media--ready]="ready()"
      [style.background-image]="'url(' + poster + ')'"
      aria-hidden="true"
    >
      <img
        class="timed-hero-media__poster"
        [src]="poster"
        alt=""
        decoding="async"
        fetchpriority="high"
        draggable="false"
      />
      @if (!failed() && source()) {
        <video
          #video
          class="cinematic-media__video timed-hero-media__video"
          [src]="source()"
          muted
          autoplay
          playsinline
          preload="auto"
          [poster]="poster"
          tabindex="-1"
          disablePictureInPicture
          (error)="onError()"
        ></video>
      }
    </div>
  `,
  styles: ':host { display: contents; }',
})
export class TimedHeroVideo {
  @Input() stageEl?: HTMLElement;
  @Input({ required: true }) poster = '';
  @Input() webm?: string;
  @Input() mp4?: string;
  @Input() maxTime = 9;

  private readonly videoRef = viewChild<HTMLVideoElement>('video');
  private readonly destroyRef = inject(DestroyRef);

  readonly failed = signal(false);
  readonly ready = signal(false);
  readonly source = signal<string | undefined>(undefined);

  private bound = false;

  constructor() {
    afterNextRender(() => {
      this.resolveSource();
      requestAnimationFrame(() => {
        if (this.bound || !this.source() || !this.videoRef()) return;
        this.bound = true;
        this.bind();
      });
    });
  }

  onError() {
    this.ready.set(false);
    this.failed.set(true);
  }

  private resolveSource() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (
      navigator as Navigator & {
        connection?: EventTarget & { saveData?: boolean };
      }
    ).connection;
    const allowed = !reducedMotion.matches && !connection?.saveData;
    this.source.set(allowed ? this.mp4 ?? this.webm : undefined);
  }

  private bind() {
    const source = this.source();
    const stage = this.stageEl;
    const staticMode = !source || this.failed();
    if (stage) {
      stage.dataset['heroMotion'] = staticMode ? 'static' : 'autoplay';
      if (staticMode) stage.style.setProperty('--hero-progress', '0');
    }

    const video = this.videoRef();
    if (!stage || !video || this.failed() || !source) return;

    const maxTime = this.maxTime;
    let stopTime = maxTime;
    let started = false;
    let finished = false;
    let progressFrameId = 0;

    stage.style.setProperty('--hero-progress', '0');
    video.pause();

    const cancelProgressFrame = () => {
      if (!progressFrameId) return;
      window.cancelAnimationFrame(progressFrameId);
      progressFrameId = 0;
    };

    const publishProgress = () => {
      const progress =
        stopTime > 0 ? Math.min(1, Math.max(0, video.currentTime / stopTime)) : 1;
      stage.style.setProperty('--hero-progress', progress.toFixed(4));
    };

    const stopAtFinalFrame = () => {
      if (finished) return;
      finished = true;
      cancelProgressFrame();
      video.pause();
      try {
        video.currentTime = stopTime;
      } catch {
        /* keep last frame */
      }
      stage.style.setProperty('--hero-progress', '1');
      stage.dataset['heroMotion'] = 'complete';
    };

    const tick = () => {
      progressFrameId = 0;
      if (finished) return;
      if (video.currentTime >= stopTime - 1 / 120 || video.ended) {
        stopAtFinalFrame();
        return;
      }
      publishProgress();
      if (!video.paused) progressFrameId = window.requestAnimationFrame(tick);
    };

    const startProgress = () => {
      if (!progressFrameId && !finished) {
        progressFrameId = window.requestAnimationFrame(tick);
      }
    };

    const attemptPlayback = () => {
      if (finished || document.hidden) return;
      const playAttempt = video.play();
      if (playAttempt) {
        void playAttempt.then(startProgress).catch(() => {
          stage.dataset['heroMotion'] = 'blocked';
        });
      } else {
        startProgress();
      }
    };

    const startPlayback = () => {
      if (started || finished) return;
      started = true;
      this.ready.set(true);
      try {
        video.currentTime = 0;
      } catch {
        /* poster matches opening frame */
      }
      attemptPlayback();
    };

    const handleLoadedMetadata = () => {
      stopTime = Number.isFinite(video.duration)
        ? Math.min(maxTime, Math.max(0, video.duration))
        : maxTime;
    };
    const handleLoadedData = () => startPlayback();
    const handleTimeUpdate = () => {
      if (video.currentTime >= stopTime - 1 / 120 || video.ended) stopAtFinalFrame();
      else publishProgress();
    };
    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
        cancelProgressFrame();
      } else if (started && !finished) {
        attemptPlayback();
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('playing', startProgress);
    video.addEventListener('pause', cancelProgressFrame);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', stopAtFinalFrame);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) handleLoadedMetadata();
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) handleLoadedData();

    this.destroyRef.onDestroy(() => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('playing', startProgress);
      video.removeEventListener('pause', cancelProgressFrame);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', stopAtFinalFrame);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelProgressFrame();
      video.pause();
      delete stage.dataset['heroMotion'];
    });
  }
}
