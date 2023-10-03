import { Directive, ElementRef, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { PrizmDestroyService } from '@prizm-ui/helpers';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { PrizmThemeService } from '../../services/theme.service';
import { PrizmTheme } from '../../types/theme';
import { prizmObservable } from '@prizm-ui/core';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { PrizmThemeInvertedValues } from './model';

@Directive({
  selector: '[prizmThemeInverted]',
  providers: [PrizmDestroyService],
})
export class PrizmThemeInvertedDirective implements OnInit {
  readonly themeService: PrizmThemeService = inject(PrizmThemeService);
  readonly elementRef: ElementRef = inject(ElementRef);
  readonly destroy$: PrizmDestroyService = inject(PrizmDestroyService);

  @Output()
  public readonly prizmThemeChange = new EventEmitter<PrizmTheme>();

  @Input()
  @prizmObservable({
    name: 'invertedValues$$',
    subject: () => new ReplaySubject(1),
  })
  public invertedValues: PrizmThemeInvertedValues = {
    dark: 'light',
    light: 'dark',
  };

  @Input()
  @prizmObservable({
    name: 'themeElement$$',
    subject: () => new ReplaySubject(1),
  })
  public themeElement = this.themeService.rootElement;

  private readonly invertedValues$$!: Observable<Record<string, string>>;
  private readonly themeElement$$!: Observable<HTMLElement>;

  public ngOnInit(): void {
    combineLatest([this.invertedValues$$, this.themeElement$$])
      .pipe(
        switchMap(
          ([invertedValues, themeElement]) =>
            invertedValues?.['*'] ??
            this.themeService.getInvertedThemeByElement$(themeElement, invertedValues)
        ),
        tap(newTheme => this.themeService.update(newTheme, this.elementRef.nativeElement)),
        tap(newTheme => this.prizmThemeChange.next(newTheme)),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }
}
