import React from 'react';
import './App.css';

import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';

import GitHubCorners from '@uiw/react-github-corners';
import MarkdownPreview from '@uiw/react-markdown-preview';

import CodeMirror from '@uiw/react-codemirror';
import 'codemirror/keymap/sublime';
import 'codemirror/theme/monokai.css';

import SVG from 'react-inlinesvg';
import ok_icon from './media/ok-icon.svg';
import error_icon from './media/error-icon.svg';

const REQUEST_TIMEOUT = 800;
const DEFAULT_CODEMIRROR_OPTIONS = {
  mode: 'jsx',
  theme: 'monokai',
  keyMap: 'sublime',
};
const INITIAL_CODE =
  '\
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

function api_endpoint() {
  return (
    window.location.protocol +
    '//' +
    process.env.REACT_APP_API_HOSTNAME +
    process.env.REACT_APP_API_ENDPOINT
  );
}

function handleErrorsAndClearTimer(timer) {
  return response => {
    clearTimeout(timer);
    if (!response.ok) {
      throw Error(response.status + ' ' + response.statusText);
    }
    return response.json();
  };
}

class HOAValidationResult extends React.Component {
  render() {
    return (
      <Paper className={(this.props.classes, 'result')}>
        {this.props.result}
      </Paper>
    );
  }
}

class HOAValidator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      result: null,
      code: this.props.code,
    };
    this.timer = null;
    this.onChange = this.onChange.bind(this);
  }

  updateResult() {
    let url = new URL(api_endpoint() + 'validate/');
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: btoa(this.state.code) }),
    };

    this.timer = setTimeout(() => {
      this.setState({
        result: () => <CircularProgress classes={this.props.classes} />,
      });
    }, REQUEST_TIMEOUT);
    fetch(url, requestOptions)
      .then(handleErrorsAndClearTimer(this.timer))
      .then(res => {
        this.setState({ result: () => this.buildResult(res) });
      })
      .catch(error => {
        clearTimeout(this.timer);
        var res = {
          ok: false,
          message: error.message,
        };
        this.setState({ result: () => this.handleError(res) });
      });
  }

  handleError(res) {
    return (
      <div className={this.props.classes}>
        <SVG className="icon" src={error_icon} />
        <p>{'Error: ' + res.message}</p>
      </div>
    );
  }

  buildResult(res) {
    if (!res.success) {
      return (
        <div className={this.props.classes}>
          <SVG className="icon" src={error_icon} />
          <p>{'Invalid: ' + res.message}</p>
        </div>
      );
    }
    return (
      <div className={this.props.classes}>
        <SVG className="icon" src={ok_icon} />
        <p>OK!</p>
      </div>
    );
  }

  onChange(editor, data, value) {
    this.state.code = editor.getValue();
    this.updateResult();
  }

  render() {
    return (
      <>
        <CodeMirror
          value={this.state.code}
          options={{
            theme: DEFAULT_CODEMIRROR_OPTIONS.theme,
            keyMap: DEFAULT_CODEMIRROR_OPTIONS.keyMap,
            fullScreen: false,
            mode: DEFAULT_CODEMIRROR_OPTIONS.mode,
          }}
          onChange={this.onChange}
        />
        <React.Fragment>
          {this.state.result && (
            <HOAValidationResult
              classes={this.props.classes}
              result={this.state.result()}
            />
          )}
        </React.Fragment>
      </>
    );
  }
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      code: INITIAL_CODE,
    };
  }

  render() {
    return (
      <div className="App">
        <GitHubCorners
          fixed
          target="__blank"
          zIndex={10}
          href="https://github.com/whitemech/hoa-utils"
          rel="noopener noreferrer"
        />
        <header className="App-header">
          <h1>HOA Format Validator</h1>
          <p>
            An online, interactive HOA format validator.{' '}
            <a
              href="http://adl.github.io/hoaf/"
              target="blank_"
              rel="noopener noreferrer"
            >
              http://adl.github.io/hoaf/
            </a>
          </p>
        </header>
        <main className="App-main">
          <HOAValidator code={INITIAL_CODE} />
          <MarkdownPreview className="markdown" source={content} />
        </main>
        <footer className="App-footer">
          © 2020{' '}
          <a
            href="https://whitemech.github.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            Whitemech{' '}
          </a>
        </footer>
      </div>
    );
  }
}
