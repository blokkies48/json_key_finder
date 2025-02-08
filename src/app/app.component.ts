import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  jsonInput: string = '';
  key: string = '';
  output: string = '';
  isError: boolean = false;
  includeFullObject: boolean = false;

  // Generated keys
  availableKeys: string[] = [];
  selectedKeys: any = {};
  filteredData: any[] = [];


  processData() {
    this.isError = false;
    try {
      const jsonData = JSON.parse(this.jsonInput);
      if (!this.key) {
        this.output = JSON.stringify(jsonData, null, 2);
        return
      }
      const results = this.searchForKey(jsonData, this.key);
      if (!results.length) {
        this.output = 'Key not found!';
        this.isError = true;
        return;
      }

      this.output = JSON.stringify(results, null, 2);
      this.isError = false;
    } catch (error) {
      this.isError = true;
      this.output = 'Invalid JSON!';
    }
  }

  searchForKey(obj: any, searchKey: string): any[] {
    let results: any[] = [];

    function recursiveSearch(data: any) {
      if (typeof data === 'object' && data !== null) {
        for (const key in data) {
          if (key === searchKey) {
            results.push(data[key]);
          }
          recursiveSearch(data[key]);
        }
      } else if (Array.isArray(data)) {
        data.forEach(item => recursiveSearch(item));
      }
    }

    recursiveSearch(obj);
    return results;
  }

  clearKey() {
    this.key= '';
  }
  
}
