import { Component, forwardRef, Input, Output, EventEmitter, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-dropdown.component.html',
  styleUrls: ['./custom-dropdown.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDropdownComponent),
      multi: true
    }
  ]
})
export class CustomDropdownComponent implements ControlValueAccessor, OnInit {
  @Input() options: string[] = [];
  @Input() placeholder: string = 'Select an option';
  @Input() showSearch: boolean = false;
  @Input() disabled: boolean = false;
  @Output() selectionChanged = new EventEmitter<string>();
  
  isOpen = false;
  selectedOption: string = '';
  searchTerm: string = '';
  filteredOptions: string[] = [];
  
  private onChange: any = () => {};
  private onTouched: any = () => {};
  
  ngOnInit() {
    this.filteredOptions = [...this.options];
  }
  
  toggleDropdown() {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
      if (!this.isOpen) {
        this.searchTerm = '';
        this.filteredOptions = [...this.options];
      }
    }
  }
  
  selectOption(option: string) {
    this.selectedOption = option;
    this.isOpen = false;
    this.onChange(option);
    this.onTouched();
    this.selectionChanged.emit(option);
    this.searchTerm = '';
    this.filteredOptions = [...this.options];
  }
  
  filterOptions() {
    this.filteredOptions = this.options.filter(option =>
      option.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.searchTerm = '';
      this.filteredOptions = [...this.options];
    }
  }
  
  writeValue(value: string): void {
    this.selectedOption = value;
  }
  
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
  
  constructor(private elementRef: ElementRef) {}
}