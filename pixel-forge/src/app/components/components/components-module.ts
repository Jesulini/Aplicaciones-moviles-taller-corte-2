import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { InputComponent } from '../input/input.component';
import { ToggleTranslateComponent } from '../toggle-translate/toggle-translate.component';
import { ButtonComponent } from '../button/button.component';
import { FloatingButtonComponent } from '../floating-button/floating-button.component';
import { CardComponent } from '../card/card.component';
import { LinkComponent } from '../link/link.component';

@NgModule({
  declarations: [
    InputComponent,
    ToggleTranslateComponent,
    ButtonComponent,
    FloatingButtonComponent,
    CardComponent,
    LinkComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
  exports: [
    InputComponent,
    ToggleTranslateComponent,
    ButtonComponent,
    FloatingButtonComponent,
    CardComponent,
    LinkComponent
  ]
})
export class ComponentsModule {}
