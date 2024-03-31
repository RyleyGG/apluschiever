import { Directive, ElementRef, HostListener, Renderer2, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: 'p-fileUpload[ngModel], [appCustomFileUpload]',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CustomFileUploadDirective),
    multi: true
  }]
})
export class CustomFileUploadDirective implements ControlValueAccessor {

  onChange: any = () => { };
  onTouch: any = () => { };

  constructor(private el: ElementRef) { }

  writeValue(value: any): void {
    // No need to set value here as it will be handled by the change event
    console.log(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
    console.log(fn)
    console.log("registerOnChange");
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
    console.log("registerOnTouched");
  }

  @HostListener('change', ['$event.target.files']) emitFiles(event: FileList) {
    const files = Array.from(event);
    console.log(files)
    this.onChange(files);
    this.onTouch();
    console.log("Changed");
  }
}
