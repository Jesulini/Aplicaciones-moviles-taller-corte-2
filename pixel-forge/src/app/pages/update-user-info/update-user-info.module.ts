import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { UpdateUserInfoPageRoutingModule } from './update-user-info-routing.module';
import { UpdateUserInfoPage } from './update-user-info.page';

import { TranslateModule } from '@ngx-translate/core';

import { ComponentsModule } from 'src/app/components/components/components-module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UpdateUserInfoPageRoutingModule,
    ComponentsModule,
    TranslateModule
  ],
  declarations: [UpdateUserInfoPage]
})
export class UpdateUserInfoPageModule {}
