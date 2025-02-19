import { DOCUMENT, ViewportScroller } from '@angular/common';
import { Directive, ElementRef, Inject, Input, NgZone, Optional, Renderer2 } from '@angular/core';
import { ANIMATION_FRAME, WINDOW } from '@ng-web-apis/common';
import { fromEvent, merge, Observable } from 'rxjs';
import { map, switchMap, takeUntil, throttleTime } from 'rxjs/operators';
import { PrizmDestroyService } from '@prizm-ui/helpers';
import { PRIZM_ELEMENT_REF, PRIZM_SCROLL_REF } from '../../tokens';
import {
  prizmPreventDefault,
  prizmStopPropagation,
  prizmTypedFromEvent,
  prizmZoneFree,
} from '../../observables';
import { PrizmOrientation } from '../../types';

const MIN_WIDTH = 24;
const POLLING_TIME = 1000 / 15;

@Directive({
  selector: '[prizmScrollbar]',
  providers: [PrizmDestroyService],
})
export class PrizmScrollbarDirective {
  @Input()
  public prizmScrollbar: PrizmOrientation = 'vertical';

  constructor(
    @Inject(NgZone) ngZone: NgZone,
    @Inject(Renderer2) renderer: Renderer2,
    @Inject(PrizmDestroyService) destroy$: Observable<void>,
    @Inject(ANIMATION_FRAME) animationFrame$: Observable<number>,
    @Inject(PRIZM_ELEMENT_REF) private readonly wrapper: ElementRef<HTMLElement>,
    @Optional()
    @Inject(PRIZM_SCROLL_REF)
    private readonly container: ElementRef<HTMLElement> | null,
    @Inject(DOCUMENT) private readonly documentRef: Document,
    @Inject(WINDOW) private readonly windowRef: Window,
    @Inject(ElementRef) private readonly elementRef: ElementRef<HTMLElement>,
    @Inject(ViewportScroller) private readonly viewportScroller: ViewportScroller
  ) {
    const { nativeElement } = this.elementRef;
    const mousedown$ = prizmTypedFromEvent(nativeElement, 'mousedown');
    const mousemove$ = prizmTypedFromEvent(this.documentRef, 'mousemove');
    const mouseup$ = prizmTypedFromEvent(this.documentRef, 'mouseup');
    const mousedownWrapper$ = prizmTypedFromEvent(wrapper.nativeElement, 'mousedown');

    merge(
      mousedownWrapper$.pipe(
        prizmPreventDefault(),
        map(event => this.getScrolled(event, 0.5, 0.5))
      ),
      mousedown$.pipe(
        prizmPreventDefault(),
        prizmStopPropagation(),
        switchMap(event => {
          const rect = nativeElement.getBoundingClientRect();
          const vertical = getOffsetVertical(event, rect);
          const horizontal = getOffsetHorizontal(event, rect);

          return mousemove$.pipe(
            map(event => this.getScrolled(event, vertical, horizontal)),
            takeUntil(mouseup$)
          );
        })
      )
    )
      .pipe(prizmZoneFree(ngZone), takeUntil(destroy$))
      .subscribe(([scrollTop, scrollLeft]) => {
        const [x, y] = this.viewportScroller.getScrollPosition();

        if (!this.container) {
          this.viewportScroller.scrollToPosition([
            this.prizmScrollbar === 'vertical' ? x : scrollLeft,
            this.prizmScrollbar === 'vertical' ? scrollTop : y,
          ]);

          return;
        }

        if (this.prizmScrollbar === 'vertical') {
          renderer.setProperty(this.container.nativeElement, 'scrollTop', scrollTop);
        } else {
          renderer.setProperty(this.container.nativeElement, 'scrollLeft', scrollLeft);
        }
      });

    merge(
      fromEvent(this.container ? this.container.nativeElement : this.windowRef, 'scroll'),
      animationFrame$.pipe(throttleTime(POLLING_TIME))
    )
      .pipe(prizmZoneFree(ngZone), takeUntil(destroy$))
      .subscribe(() => {
        if (this.prizmScrollbar === 'vertical') {
          renderer.setStyle(nativeElement, 'top', `${this.thumb * 100}%`);
          renderer.setStyle(nativeElement, 'height', `${this.view * 100}%`);
        } else {
          renderer.setStyle(nativeElement, 'left', `${this.thumb * 100}%`);
          renderer.setStyle(nativeElement, 'width', `${this.view * 100}%`);
        }
      });
  }

  private get scrolled(): number {
    const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } =
      this.computedContainer;

    return this.prizmScrollbar === 'vertical'
      ? scrollTop / (scrollHeight - clientHeight)
      : scrollLeft / (scrollWidth - clientWidth);
  }

  private get compensation(): number {
    const { clientHeight, scrollHeight, clientWidth, scrollWidth } = this.computedContainer;

    if (
      ((clientHeight * clientHeight) / scrollHeight > MIN_WIDTH && this.prizmScrollbar === 'vertical') ||
      ((clientWidth * clientWidth) / scrollWidth > MIN_WIDTH && this.prizmScrollbar === 'horizontal')
    ) {
      return 0;
    }

    return this.prizmScrollbar === 'vertical' ? MIN_WIDTH / clientHeight : MIN_WIDTH / clientWidth;
  }

  private get thumb(): number {
    const compensation = this.compensation || this.view;

    return this.scrolled * (1 - compensation);
  }

  private get view(): number {
    const { clientHeight, scrollHeight, clientWidth, scrollWidth } = this.computedContainer;

    return this.prizmScrollbar === 'vertical'
      ? Math.ceil((clientHeight / scrollHeight) * 100) / 100
      : Math.ceil((clientWidth / scrollWidth) * 100) / 100;
  }

  private get computedContainer(): Element {
    const el = this.container ? this.container.nativeElement : this.documentRef.scrollingElement;
    return el as Element;
  }

  private getScrolled(
    { clientY, clientX }: MouseEvent,
    offsetVertical: number,
    offsetHorizontal: number
  ): [number, number] {
    const { offsetHeight, offsetWidth } = this.elementRef.nativeElement;
    const { top, left, width, height } = this.wrapper.nativeElement.getBoundingClientRect();

    const maxTop = this.computedContainer.scrollHeight - height;
    const maxLeft = this.computedContainer.scrollWidth - width;
    const scrolledTop = (clientY - top - offsetHeight * offsetVertical) / (height - offsetHeight);
    const scrolledLeft = (clientX - left - offsetWidth * offsetHorizontal) / (width - offsetWidth);

    return [maxTop * scrolledTop, maxLeft * scrolledLeft];
  }
}

function getOffsetVertical({ clientY }: MouseEvent, { top, height }: ClientRect): number {
  return (clientY - top) / height;
}

function getOffsetHorizontal({ clientX }: MouseEvent, { left, width }: ClientRect): number {
  return (clientX - left) / width;
}
