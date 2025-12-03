import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent {
  @Output() closeMe = new EventEmitter();

  close() {
    this.closeMe.emit();
  }
}
