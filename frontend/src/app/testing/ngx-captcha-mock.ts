import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'ngx-recaptcha2',
    standalone: true,
    template: '',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MockNgxCaptchaComponent),
            multi: true
        }
    ]
})
export class MockNgxCaptchaComponent implements ControlValueAccessor {
    @Input() siteKey: string = '';
    @Input() useGlobalDomain: boolean = false;
    @Input() size: any;
    @Input() hl: any;
    @Input() theme: any;
    @Input() type: any;

    @Output() success = new EventEmitter<string>();
    @Output() error = new EventEmitter<void>();
    @Output() expire = new EventEmitter<void>();
    @Output() load = new EventEmitter<void>();

    writeValue(obj: any): void { }
    registerOnChange(fn: any): void { }
    registerOnTouched(fn: any): void { }
    setDisabledState?(isDisabled: boolean): void { }
}
