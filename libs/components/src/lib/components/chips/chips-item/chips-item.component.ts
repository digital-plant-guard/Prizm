import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { PrizmOverlayOutsidePlacement } from '../../../modules';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { prizmIsTextOverflow$ } from '../../../util/dom/is-textoverflow';
import { PrizmAbstractTestId } from '@prizm-ui/core';

@Component({
  selector: 'prizm-chips-item',
  templateUrl: './chips-item.component.html',
  styleUrls: ['./chips-item.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrizmChipsItemComponent extends PrizmAbstractTestId {
  @Input() disabled = false;
  @Input() deletable = true;
  @Output() deleted = new EventEmitter<MouseEvent>();
  @Input() hintCanShow = true;
  @Input() hintText!: string;
  @Input() hintDirection: PrizmOverlayOutsidePlacement = PrizmOverlayOutsidePlacement.RIGHT;

  override readonly testId_ = 'ui_chips_item';

  readonly prizmIsTextOverflow$ = (
    elem: HTMLElement,
    hintCanShow: boolean,
    forceShowHint: boolean
  ): Observable<boolean> => {
    return of(forceShowHint).pipe(
      switchMap(val => {
        if (val) {
          return of(true);
        }

        if (!hintCanShow) {
          return of(false);
        }

        return prizmIsTextOverflow$(elem);
      })
    );
  };
  constructor(public readonly el: ElementRef) {
    super();
  }
}
