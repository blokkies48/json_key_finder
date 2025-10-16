import { Component, AfterViewInit } from '@angular/core';

declare const require: any; 
declare var monaco: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit{
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

  jsonTree = `<h1>HEST</h1>`

  ngAfterViewInit() {
    // wait until Monaco loader available
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
      // use monacoInstance inside callback, not global var
      this.editorInput = monacoInstance.editor.create(document.getElementById('jsonEditor'), {
        value: this.jsonInput,
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


    if (this.key) {
      let filteredJson = this.getKeyValue(jsonData, this.key)
      this.output = JSON.stringify(filteredJson, null, 2);
    }
    this.editorOutput?.setValue(this.output);

  } catch (error) {
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
              valueList.push(data[key][key2][search])
            }
          }
          return {[search] : valueList} // return found JSON
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
    this.key= '';
    this.availableKeys= [];
  }
  
}
