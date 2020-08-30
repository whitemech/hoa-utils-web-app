import React from 'react';
import logo from './logo.svg';
import './App.css';

import GitHubCorners from '@uiw/react-github-corners';
import MarkdownPreview from '@uiw/react-markdown-preview';

import CodeMirror from '@uiw/react-codemirror';
import 'codemirror/keymap/sublime';
import 'codemirror/theme/monokai.css';

import MarkdownContent from './content.md'

const code = '\
HOA: v1 \n \
States: 2 \n \
Start: 0 \n \
acc-name: Rabin 1 \n \
Acceptance: 2 (Fin(0) & Inf(1)) \n \
AP: 2 "a" "b" \n \
--BODY-- \n \
State: 0 "a U b"   /* An example of named state */ \n \
  [0 & !1] 0 {0} \n \
  [1] 1 {0} \n \
State: 1 \n \
  [t] 1 {1} \n \
--END-- \n \
';

const content = `
The HOA format validator is backed by the Python package [hoa-utils](https://github.com/whitemech/hoa-utils).
You can find the source code of this web app [here](https://github.com/whitemech/hoa-utils-web-app).

## How to use

- Edit the file
- Wait for response from the server

## License

Both \`hoa-utils\` and the web app are released under the GNU lesser general public license v3.0 or later.
`;



export default class App extends React.Component {

  constructor() {
    super();
    this.state = {
      code: code,
      mode: 'jsx',
      theme: 'monokai',
    };
    this.onChanges = this.onChanges.bind(this);
  }

  getInstance = (instance) => {
    if (instance) {
        this.codemirror = instance.codemirror;
        this.editor = instance.editor;
      }
    }

  onChanges(e) {
    console.log("Changes detected.", e);
  }

  render(){
    return (
      <div className="App">
        <GitHubCorners fixed target="__blank" zIndex={10} href="https://github.com/whitemech/hoa-utils" />
      <header className="App-header">
        <h1>HOA Format Validator</h1>
        <p>An online, interactive HOA format valiator. <a href="http://adl.github.io/hoaf/" target="blank_">http://adl.github.io/hoaf/</a></p>
      </header>
      <main className="App-main">
        <CodeMirror
              value={this.state.code}
              ref={this.getInstance}
              options={{
                theme: "monokai",
                keyMap: 'sublime',
                fullScreen: false,
                mode: "jsx",
              }}
              onChange={this.onChanges}
            />
        <MarkdownPreview className="markdown" source={content}/>
      </main>
      <footer className="App-footer">
        <div>
          © 2020 Whitemech 
        </div>
      </footer>
    </div>
    );
  }
}
