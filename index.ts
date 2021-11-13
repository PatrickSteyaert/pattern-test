// Import stylesheets
import './style.css';

// Write TypeScript code!
const appDiv: HTMLElement = document.getElementById('app');
appDiv.innerHTML = `<h1>Pattern test</h1>`;


interface Pattern<T> { [key: string]: T; } ;

type Strand = string | Pattern<Strand>;
type Yarn = Strand | Array<Strand> ;

type Clause = string | RegExp | Pattern<Filter> ;

type Filter = Clause | Set<Clause> ;
type MatchExpression = Map<Clause, any>;

function isSourceAtomPattern(source: SourcePattern): boolean {
  return typeof source === 'string' || source instanceof RegExp;
}

function isTargetAtomPattern(target: TargetPattern): boolean {
  return typeof target === 'string';
}

function isSourceChoicePattern(source: SourcePattern): boolean {
  return source instanceof Set;
}

function filter(...clauses: Clause[]): Filter {
  return new Set(clauses);
}

function yarn(...strands: Strand[]): Yarn {
  return strands;
}

function matchAtomPatterns(source: SourceAtomPattern, target: TargetAtomPattern): boolean {
  if (source instanceof RegExp && typeof target === 'string') {
    return source.test(target);
  } else if (typeof source === 'string' && typeof target === 'string') {
    return source === target;
  }
}

function matchChoicePattern(source: SourceChoicePattern, target: TargetPattern): boolean {
  if (source.has(target)) {
    return true;
  } else {
    return !!Array.from(source).find((element) => match(element, target));
  }
}

function matchObjectPatterns(source: SourceObjectPattern, target: TargetObjectPattern): boolean {
  let result = true;
  for (const key in target) {
    if (target.hasOwnProperty(key)) {
      if (match(new Set(Object.keys(source)), key)) {
        result = result && match(source[key], target[key]);
      }
    }
  }
  return result;
}

function match(source: SourcePattern, target: TargetPattern): boolean {
  if (isSourceAtomPattern(source) && isTargetAtomPattern(target)) {
    return matchAtomPatterns(source as SourceAtomPattern, target as TargetAtomPattern);
  } else if (isSourceChoicePattern(source)) {
    return matchChoicePattern(source as SourceChoicePattern, target);
  } else if (typeof source === 'object' && typeof target === 'object') {
    return matchObjectPatterns(source as SourceObjectPattern, target);
  }
}

const sourceString: Strand = 's';
const matchAll: Clause = /(.*?)/;

console.log(match(sourceString, 'a'));
console.log(typeof ['a', 'b']);

enum EntityType {
  WorkItem = 'WorkItem',
}

enum State {
  s1 = 's1',
  s2 = 's2',
}

enum CoS {
  s = 's',
  u = 'u',
}

const WorkItemPattern: Filter = {
  entity: EntityType.WorkItem,
  state: filter(State.s1, State.s2),
};

const ActiveWorkItemPattern: Filter = {
  entity: EntityType.WorkItem,
  state: filter(State.s1),
};

const activeWorkItem: Strand = {
  entity: EntityType.WorkItem,
  state: State.s1,
};

const inActiveWorkItem: Strand = {
  entity: EntityType.WorkItem,
  state: State.s2,
};

const testYarn: Yarn = yarn(activeWorkItem, inActiveWorkItem)

console.log(match(WorkItemPattern, activeWorkItem));
console.log(match(ActiveWorkItemPattern, activeWorkItem));

console.log(match(WorkItemPattern, inActiveWorkItem));
console.log(match(ActiveWorkItemPattern, inActiveWorkItem));
