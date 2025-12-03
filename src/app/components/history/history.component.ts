import { Component, EventEmitter, Output, OnInit } from '@angular/core';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  @Output() closeMe = new EventEmitter();
  @Output() selectItem = new EventEmitter<any>();

  savedList: any[] = []; // caveman store list

  ngOnInit() {
    let saved = localStorage.getItem('savedJson');
    if (saved) {
      let parsed = JSON.parse(saved);
      this.savedList = parsed || [];
      console.log("savedList", this.savedList)
    }
  }

  pick(item: any) {
    this.selectItem.emit(item);
  }

  getPreview(obj: any): string {
    const entries = Object.entries(obj); // turn into [key,value]
    const firstThree = entries.slice(0, 3)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    this.close()
    return entries.length > 3 ? firstThree + ', ...' : firstThree;
  }

  close() {
    this.closeMe.emit();
  }
}
