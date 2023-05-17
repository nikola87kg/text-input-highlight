import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TextInputComponent } from './text-input/text-input.component';



@NgModule({
  declarations: [TextInputComponent],
  exports: [TextInputComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
})
export class SeparateModule { }
