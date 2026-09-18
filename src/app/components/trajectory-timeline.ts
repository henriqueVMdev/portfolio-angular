import { Component, computed, signal } from '@angular/core';
import { trajectory } from '../data/trajectory';

const CHART_WIDTH = 100;
const CHART_HEIGHT = 68;

@Component({
  selector: 'app-trajectory-timeline',
  // ponytail: o grid de .trajectory-stage aponta col/row em .trajectory-timeline;
  // sem contents o host vira item auto e a carta vai para o meio, o capítulo some.
  styles: ':host { display: contents; }',
  templateUrl: './trajectory-timeline.html',
})
export class TrajectoryTimeline {
  readonly trajectory = trajectory;
  readonly chartWidth = CHART_WIDTH;
  readonly chartHeight = CHART_HEIGHT;
  readonly activeIndex = signal(0);
  readonly active = computed(() => trajectory[this.activeIndex()]);
  readonly previous = computed(() => {
    const i = this.activeIndex() - 1;
    return i >= 0 ? trajectory[i] : undefined;
  });
  readonly next = computed(() => {
    const i = this.activeIndex() + 1;
    return i < trajectory.length ? trajectory[i] : undefined;
  });

  starState(index: number) {
    const active = this.activeIndex();
    if (index < active) return 'past';
    if (index === active) return 'current';
    return 'ahead';
  }

  starStyle(index: number, x: number, y: number) {
    return {
      '--star-x': `${x * 100}%`,
      '--star-y': `${y * 100}%`,
      '--twinkle-delay': `${((index * 0.83) % 2.5).toFixed(2)}s`,
      '--twinkle-duration': `${(3.2 + index * 0.29).toFixed(2)}s`,
    };
  }

  go(index: number) {
    if (index < 0 || index >= trajectory.length) return;
    this.activeIndex.set(index);
  }
}
