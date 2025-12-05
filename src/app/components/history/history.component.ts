import { Component, EventEmitter, Output, OnInit } from '@angular/core';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  @Output() close = new EventEmitter();
  @Output() clearHis = new EventEmitter();
  @Output() selectItem = new EventEmitter<any>();

  savedList: any[] = []; // caveman store list
  showConfirm = false;
  hoveredItem: any = null;
  mouseX = 0;
  mouseY = 0;

  onMouseMove(event: MouseEvent, item: any) {
    this.hoveredItem = item;
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  onMouseLeave() {
    this.hoveredItem = null;
  }

  getFullJson(obj: any) {
    return JSON.stringify(obj, null, 2);
  }

  ngOnInit() {
    let saved = localStorage.getItem('savedJson');
    if (saved) {
      let parsed = JSON.parse(saved);
      this.savedList = parsed || [];
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
    return entries.length > 3 ? firstThree + ', ...' : firstThree;
  }

  getJsonPreview(obj: any): string {
    const tiny: any = {};
    const keys = Object.keys(obj);

    for (let i = 0; i < Math.min(3, keys.length); i++) {
      tiny[keys[i]] = obj[keys[i]];
    }

    if (keys.length > 3) tiny["..."] = "...";

    return JSON.stringify(tiny, null, 2); // pretty JSON
  }


  closeHistory() {
    this.close.emit();
  }

  clearHistory() {
    localStorage.removeItem('savedJson')
    this.savedList = []
    this.clearHis.emit()
  }


  tryClear() {
    this.showConfirm = true;
  }

  confirmClear() {
    this.showConfirm = false;
    this.clearHistory()
  }

  cancelClear() {
    this.showConfirm = false;
  }
}
