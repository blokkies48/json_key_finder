import { Expansion } from '@angular/compiler';
import { Component, AfterViewInit, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';  // Import if using ngModel (add to NgModule or standalone imports)

declare const require: any; 
declare var monaco: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  // If standalone: imports: [FormsModule, /* other forms stuff */]
})
export class AppComponent implements OnInit, AfterViewInit {  // Add OnInit
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

  editorInput: any;
  editorOutput: any;
  showFix = false;
  jsonTree = `<h1>HEST</h1>`

  ngOnInit(): void {
    // Load early, before view/editor init
    const savedJson = localStorage.getItem('savedJson');
    const setKey = localStorage.getItem('setKey');

    if (savedJson) {
      this.jsonInput = savedJson;
    }
    if (setKey) {
      this.key = setKey; 
    }
  }

  ngAfterViewInit() {
    // Wait until Monaco loader available
    const check = setInterval(() => {
      if ((window as any).require) {
        clearInterval(check);
        this.initMonaco();
      }
    }, 100);
  }

  initMonaco() {
    const monacoLoader = (window as any).require;
    monacoLoader.config({
      paths: { vs: 'https://unpkg.com/monaco-editor@0.47.0/min/vs' }
    });

    monacoLoader(['vs/editor/editor.main'], (monacoInstance: any) => {
      this.editorInput = monacoInstance.editor.create(document.getElementById('jsonEditor'), {
        value: this.jsonInput,  // Use loaded value
        language: 'json',
        theme: 'light',
        minimap: { enabled: false },
        automaticLayout: true
      });

      this.editorOutput = monacoInstance.editor.create(document.getElementById('outputEditor'), {
        value: '',
        language: 'json',
        readOnly: true,
        theme: 'vs-light',
        minimap: { enabled: false },
        automaticLayout: true
      });

      if (this.jsonInput) {
        this.editorInput.setValue(this.jsonInput);
        this.processData(); 
      }

      // Auto-process on input changes
      this.editorInput.onDidChangeModelContent(() => this.processData());
    });
  }

  // Initialize available keys and set them all as selected initially
  initializeKeys() {
    if (!this.globalOutput) return;
    const jsonData = JSON.parse(this.globalOutput);
    let firstItem = Array.isArray(jsonData[0]) ? jsonData[0][0] || jsonData[0] : jsonData[0];
    if (!firstItem || typeof firstItem !== 'object') return;

    this.availableKeys = Object.keys(firstItem);
    this.availableKeys.forEach(key => {
      this.selectedKeys[key] = true; // All keys selected initially
    });
  }

  updateData() {
    const jsonData = JSON.parse(this.globalOutput)

    console.log("JsonData", jsonData)
    const filteredOutput: any = []
    let data: any[] = []
    if (!Array.isArray(jsonData[0])) {
      data = jsonData
    } else { 
      data = jsonData[0]
    }
    this.filteredData = data.map(user => {
      let filteredUser: any = {};
      this.availableKeys.forEach(key => {
        if (this.selectedKeys[key] && user.hasOwnProperty(key)) {
          filteredUser[key] = user[key];
        }
      });
      return filteredUser;
    });
    this.output = JSON.stringify([this.filteredData], null, 2);
  }
  
  processData() {
    this.isError = false;
    this.availableKeys = [];

    try {
      const text = this.editorInput ? this.editorInput.getValue() : this.jsonInput;
      const jsonData = JSON.parse(text);
      this.output = JSON.stringify(jsonData, null, 2);

      localStorage.setItem('savedJson', text);  // Save raw input

      if (this.key) {
        let filteredJson = this.getKeyValue(jsonData, this.key)
        if (filteredJson && Object.keys(filteredJson).length === 0) {
          this.output = "No data found";
        }
        else {
          this.output = JSON.stringify(filteredJson, null, 2);
        }
        localStorage.setItem('setKey', this.key);  // Save key every time it's used
      } else {
        localStorage.removeItem('setKey');  // Clear if empty
      }
      this.editorOutput?.setValue(this.output);

    } catch (error) {
      this.showFix = true
      this.isError = true;
      this.output = `${error}`;
      this.editorOutput?.setValue(this.output);
    }
  }

  createTree (data: JSON): string {
    return `<h1>HEST</h1>`
  }

  getKeyValue(data: { [key: string]: any }, search: string): { [key: string]: any } {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        if (key.toLowerCase() === search.toLowerCase()) {
          return { [key]: data[key] }; // return as JSON object
        }
        if (typeof data[key] === 'object' && data[key] !== null) {
          let valueList = []
          for (const key2 in data[key]) {
            if (data[key].hasOwnProperty(key2)) {
              if (data[key][key2][search]) {
                valueList.push(data[key][key2][search])
              }
            }
          }
          if (valueList.length !== 0) {
            return {[search] : valueList} // return found JSON
          }
        }
      }
    }
    return {}; // not found, return empty object
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
    this.key = '';
    localStorage.removeItem('setKey');  // Clear saved key
    this.availableKeys = [];
    this.processData();  // Re-process without key
  }
}