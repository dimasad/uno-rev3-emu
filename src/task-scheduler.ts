// SPDX-License-Identifier: MIT
// Adapted from avr8js demo

export class MicroTaskScheduler {
  private stopped = false;

  start() {
    this.stopped = false;
  }

  stop() {
    this.stopped = true;
  }

  postTask(task: () => void) {
    if (!this.stopped) {
      setTimeout(task, 0);
    }
  }
}