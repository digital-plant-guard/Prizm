import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RawLoaderContent, TuiDocExample } from '@prizm-ui/doc';
import {
  PolymorphContent,
  PrizmContextWithImplicit,
  PrizmSizeL,
  PrizmSizeM,
  PrizmSizeS,
  PrizmSizesXl,
} from '@prizm-ui/components';

@Component({
  selector: 'prizm-progress-example',
  templateUrl: './progress-circle-bar.component.html',
  styleUrls: ['./progress-circle-bar.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressCircleBarComponent {
  public max = 100;
  public value = 50;

  readonly sizeVariants: ReadonlyArray<PrizmSizeS | PrizmSizesXl> = ['s', 'm', 'l', 'xl'];
  size: PrizmSizeS | PrizmSizesXl = this.sizeVariants[2];

  readonly colorVariants: ReadonlyArray<string | null> = [
    null,
    'transparent',
    'var(--prizm-index-danger)',
    'var(--prizm-index-warning)',
    'var(--prizm-index-plan)',
    'var(--prizm-index-good)',
    'lightblue',
  ];
  color: string | null = this.colorVariants[0];

  readonly trackColorVariants: ReadonlyArray<string | null> = [
    null,
    'transparent',
    'var(--prizm-index-danger)',
    'var(--prizm-index-warning)',
    'lightblue',
    'gray',
    'green',
  ];
  trackColor: string | null = this.trackColorVariants[0];

  readonly setupModule: RawLoaderContent = import('./examples/setup-module.md?raw');

  readonly exampleCircle: TuiDocExample = {
    TypeScript: import('./examples/circle/progress-circle-example.component.ts?raw'),
    HTML: import('./examples/circle/progress-circle-example.component.html?raw'),
  };
}
