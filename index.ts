// Import stylesheets
import './style.css';

// Write TypeScript code!
const appDiv: HTMLElement = document.getElementById('app');
appDiv.innerHTML = `<h1>Pattern test</h1>`;

type SourcePattern = RegExp | string;
type TargetPattern = string;

function match(source: SourcePattern, target: TargetPattern): boolean {
  if (source instanceof RegExp) {
    return source.test(target);
  } else if (typeof source === 'string') {
    return source === target;
  }
}

const sourceString: SourcePattern = 'sourceString';
const matchAll: SourcePattern = /(.*?)/;

console.log(match(sourceString, 'a'));
console.log(match(matchAll, 'a'));
