
import {
    Component,
    AfterViewInit,
    OnInit
} from '@angular/core';

import dirtyJSON from 'dirty-json';

declare const require: any;
declare var monaco: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    // If standalone: imports: [FormsModule, /* other forms stuff */]
})
export class AppComponent implements OnInit, AfterViewInit { // Add OnInit
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
        this.processData()
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
            paths: {
                vs: 'https://unpkg.com/monaco-editor@0.47.0/min/vs'
            }
        });

        monacoLoader(['vs/editor/editor.main'], (monacoInstance: any) => {
            this.editorInput = monacoInstance.editor.create(document.getElementById('jsonEditor'), {
                value: this.jsonInput, // Use loaded value
                language: 'json',
                theme: 'light',
                minimap: {
                    enabled: false
                },
                automaticLayout: true
            });

            this.editorOutput = monacoInstance.editor.create(document.getElementById('outputEditor'), {
                value: '',
                language: 'json',
                readOnly: true,
                theme: 'vs-light',
                minimap: {
                    enabled: false
                },
                automaticLayout: true
            });

            if (this.jsonInput) {
                this.editorInput.setValue(this.jsonInput);
                this.processData();
            }

            // Auto-process on input changes
            // this.editorInput.onDidChangeModelContent(() => this.processData());
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
        this.filteredData = []
        const jsonData = JSON.parse(this.editorInput.getValue())[this.key]
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
                if (this.selectedKeys[key]) {
                    filteredUser[key] = user[key];
                }
            });
            return filteredUser;
        });
        const newOutput = {
            [this.key]: this.filteredData
        };
        this.editorOutput?.setValue(JSON.stringify(newOutput, null, 2));
    }

    processData() {
        this.isError = false;
        this.availableKeys = [];

        try {
            const text = this.editorInput ? this.editorInput.getValue() : this.jsonInput;

            if (!text) {
                this.editorOutput?.setValue('')
                this.key = ''
                localStorage.setItem('savedJson', ''); // Save raw input
                return
            }
            const jsonData = JSON.parse(text);
            this.output = JSON.stringify(jsonData, null, 2);

            localStorage.setItem('savedJson', text); // Save raw input
            if (this.key) {
                let filteredJson = this.getKeyValueDynamic(jsonData, this.key)

                if (filteredJson && Object.keys(filteredJson).length === 0) {
                    this.output = "No data found";
                } else {
                    this.output = JSON.stringify(filteredJson, null, 2);
                    try {
                        if (Array.isArray(filteredJson[this.key])) {
                            for (let key in filteredJson[this.key]) {
                                const item = filteredJson[this.key][key];
                                for (let availableKey in item) {
                                    if (!this.availableKeys.includes(availableKey)) {
                                        this.availableKeys.push(availableKey)
                                    }
                                }
                            }
                            this.selectAll()
                        }
                    } catch {
                        this.availableKeys = []
                    }
                }
                localStorage.setItem('setKey', this.key); // Save key every time it's used
            } else {
                localStorage.removeItem('setKey'); // Clear if empty
            }
            this.editorOutput?.setValue(this.output);

        } catch (error) {
            this.isError = true;
            this.output = `${error}`;
            this.editorOutput?.setValue(this.output);
        }
    }

    createTree(data: JSON): string {
        return `<h1>HEST</h1>`
    }

    getKeyValueDynamic(data: any, search: string): {
        [key: string]: any
    } {
        let results: any[] = [];

        function dig(obj: any) {
            if (typeof obj !== 'object' || obj === null) return;

            for (const key in obj) {
                if (!obj.hasOwnProperty(key)) continue;

                const value = obj[key];

                if (key.toLowerCase() === search.toLowerCase()) {
                    results.push(value);
                }

                if (typeof value === 'object' && value !== null) {
                    dig(value);
                }
            }
        }

        dig(data);

        if (results.length === 0) {
            return {}; // nothing found
        } else if (results.length === 1) {
            return {
                [search]: results[0]
            }; // only one, return single
        } else {
            return {
                [search]: results
            }; // multiple, return list
        }
    }

    fixStructure() {
      this.isError = false

      try {
        
        let text = this.editorInput ? this.editorInput.getValue() : this.jsonInput;
          text = text.replace(/'/g, '"');
          text = text.replace(/\bTrue\b/g, 'true');
          text = text.replace(/\bFalse\b/g, 'false');
          text = text.replace(/\bNone\b/g, 'null');
          text = text.replace(/,\s*([}\]])/g, '$1'); 
          text = text.replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":'); 

          let openBraces = (text.match(/{/g) || []).length;
          let closeBraces = (text.match(/}/g) || []).length;
          let openBrackets = (text.match(/\[/g) || []).length;
          let closeBrackets = (text.match(/]/g) || []).length;

          text += '}'.repeat(openBraces - closeBraces);
          text += ']'.repeat(openBrackets - closeBrackets);

          let data;
          try {
            data = JSON.parse(text);
          } catch(e) {
            data = dirtyJSON.parse(text); // very strong repair
          }

          this.editorInput?.setValue(JSON.stringify(data, null, 2));
          this.processData()
          
        } catch (error) {
            this.isError = true;
            this.output = `${error}`;
            this.editorOutput?.setValue(this.output);
        }
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
        localStorage.removeItem('setKey'); // Clear saved key
        this.availableKeys = [];
        this.processData(); // Re-process without key
    }
}