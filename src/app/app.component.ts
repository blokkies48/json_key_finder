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
  globalOutput: string = '';
  isError: boolean = false;
  includeFullObject: boolean = false;

  // Generated keys
  availableKeys: string[] = [];
  selectedKeys: any = {};
  filteredData: any[] = [];

    // Initialize available keys and set them all as selected initially
  initializeKeys() {
    if (this.output.length > 0) {
      const jsonData = JSON.parse(this.output)
      let firstUser = jsonData[0][0];
      if (!firstUser) {
        firstUser = jsonData[0]
      }
      this.availableKeys = Object.keys(firstUser);
      if (this.availableKeys.includes("0")) {
        this.availableKeys = []
      }
      this.availableKeys.forEach(key => {
        this.selectedKeys[key] = true; // All keys selected initially
      });
    }
  }

  updateData() {
    const jsonData = JSON.parse(this.globalOutput)
    const filteredOutput: any = []
    let data: any[] = []
    if (!Array.isArray(jsonData[0])) {
      data = jsonData
    } else { 
      data = jsonData[0]
    }
    console.log(data)
    this.filteredData = data.map((user: any) => {
      let filteredUser: any = {};
      this.availableKeys.forEach(key => {
        if (this.selectedKeys[key]) {
          filteredUser[key] = user[key]; // Include the key if selected
        }
      });
      filteredOutput.push(filteredUser);
      return filteredUser;
    });
    this.output = JSON.stringify([filteredOutput], null, 2);
  }
  
  processData() {
    this.isError = false;
    this.availableKeys = [];
    try {
      const jsonData = JSON.parse(this.jsonInput);
      if (!this.key) {
        this.output = JSON.stringify(jsonData, null, 2);
        return
      }
      const results = this.searchForKey(jsonData, this.key);
      if (results.includes('There once was a similar key zzz')) {
        results.pop();
        this.output = 'Key not found! Did you maybe mean?\n' + JSON.stringify(results, null, 2);
        this.isError = true;
        return;
      }
      if (!results.length) {
        this.output = 'Key not found!';
        this.isError = true;
        return;
      }

      this.output = JSON.stringify(results, null, 2);
      this.globalOutput = this.output;
      this.isError = false;
      try {

        this.initializeKeys();
      } catch {

      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
      this.isError = true;
      this.output = 'Invalid JSON!';
    }
  }
  searchForKey(obj: any, searchKey: string): any[] {
    let results: any[] = [];
    let similarKeys: string[] = []; // To store similar keys
  
    // Convert the searchKey to lowercase for case-insensitive comparison
    const lowerSearchKey = searchKey.toLowerCase();
  
    function recursiveSearch(data: any) {
      if (typeof data === 'object' && data !== null) {
        for (const key in data) {
          // Convert the key to lowercase for comparison
          if (key.toLowerCase() === lowerSearchKey) {
            results.push(data[key]);
          }
  
          // Check for similar keys using substring matching
          if (key.toLowerCase().includes(lowerSearchKey) && !similarKeys.includes(key)) {
            similarKeys.push(key);  // Add similar key to the list
          }
          recursiveSearch(data[key]);
        }
      } else if (Array.isArray(data)) {
        data.forEach(item => recursiveSearch(item));
      }
    }
  
    recursiveSearch(obj);
  
    // If no exact match is found, return similar keys
    if (results.length === 0 && similarKeys.length > 0) {
      similarKeys.push('There once was a similar key zzz')
      return similarKeys;
    }
  
    return results;
  }
  
  selectAll() {
    this.availableKeys.forEach(key => this.selectedKeys[key] = true);
    this.updateData();
  }
  
  deselectAll() {
    this.availableKeys.forEach(key => this.selectedKeys[key] = false);
    this.updateData();
  }

  clearKey() {
    this.key= '';
    this.availableKeys= [];
  }
  
}
