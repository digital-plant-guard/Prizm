import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { generateRoutes, TuiAddonDocModule } from '@taiga-ui/addon-doc';
import { RouterModule } from '@angular/router';
import { ScrollbarComponent } from './scrollbar.component';
import { PrizmScrollbarModule } from '@prizm-ui/components';
import { PrizmScrollbarBaseExampleComponent } from './examples/base/scrollbar-base-example.component';
import { PrizmScrollbarHorizontalExampleComponent } from './examples/horizontal/scrollbar-horizontal-example.component';
import { PrizmScrollbarHiddenExampleComponent } from './examples/hidden/scrollbar-hidden-example.component';
import { PrizmScrollbarVisibleExampleComponent } from './examples/visible/scrollbar-visible-example.component';
import { PrizmScrollbarAllExampleComponent } from './examples/all/scrollbar-all-example.component';

@NgModule({
  imports: [
    CommonModule,
    TuiAddonDocModule,
    PrizmScrollbarModule,
    RouterModule.forChild(generateRoutes(ScrollbarComponent)),
  ],
  declarations: [
    PrizmScrollbarBaseExampleComponent,
    PrizmScrollbarHorizontalExampleComponent,
    PrizmScrollbarHiddenExampleComponent,
    PrizmScrollbarVisibleExampleComponent,
    PrizmScrollbarAllExampleComponent,
    ScrollbarComponent
  ],
  exports: [ScrollbarComponent],
})
export class ScrollbarModule {}
