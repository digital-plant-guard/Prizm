import { PzmToastOptions } from './types';
import { ReplaySubject, Subject, timer } from 'rxjs';
import { PzmToastDefaultOptions } from './toast-options';
import { takeUntil, tap } from 'rxjs/operators';
import { PolymorphContent } from '../../directives/polymorph';
import { PzmToastService } from './toast.service';
import { pzmGenerateId } from '../../util';

export class PzmToastRef {
  private show$ = new ReplaySubject<boolean>(1);
  private destroy$ = new Subject<void>();
  private hash_ = pzmGenerateId();
  get hash(): string {
    return this.hash_;
  };
  get buttonAppearance(): string {
    return this.appearance === 'info' ? 'primary' : this.appearance;
  };
  constructor(
    public content: PolymorphContent,
    readonly weight: PzmToastOptions['weight'],
    readonly closeAfter: PzmToastOptions['timer'],
    public title: PzmToastOptions['title'],
    readonly data: PzmToastOptions['data'],
    readonly position: PzmToastOptions['position'],
    readonly id: PzmToastOptions['id'],
    readonly appearance: PzmToastOptions['appearance'],
    readonly options: PzmToastDefaultOptions,
    readonly toastService: PzmToastService,
    public show: boolean = true,
    readonly isPlatform: PzmToastOptions['isPlatform'],
  ) {
    if (this.show) this.open();
    if (this.closeAfter) this.close(this.closeAfter);
  }

  public readonly destroy = (): void => {
    this.destroy$.next();
  }

  public readonly close = (closeAfterMs?: number): void => {
    this.destroy();
    if (!closeAfterMs) {
      this.toastService.delete(this.id);
    }

    if (!closeAfterMs) return void this.changeVisibleState(false);
    timer(closeAfterMs).pipe(
      tap(() => this.close()),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public readonly open = (): void => {
    this.changeVisibleState(true);
  }

  public readonly updateContent = (content: PolymorphContent): void => {
    if (content === this.content) return;
    this.content = content;
    this.detect();
  }

  public readonly updateTitle = (title: PzmToastOptions['title']): void => {
    if (title === this.title) return;
    this.title = title;
    this.detect();
  }


  private changeVisibleState(show: boolean): void {
    this.show$.next(this.show = show);
    this.detect();
  }

  private detect(): void {
    this.hash_ = pzmGenerateId();
    this.toastService.detect();
  }
}
