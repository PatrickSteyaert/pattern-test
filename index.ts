// Import stylesheets
import './style.css';

// Write TypeScript code!
const appDiv: HTMLElement = document.getElementById('app');
appDiv.innerHTML = `<h1>Pattern test</h1>`;

function log(t) {
  console.log(t);
  var tag = document.createElement('p');
  var text = document.createTextNode(t);
  tag.appendChild(text);
  appDiv.appendChild(tag);
}

export interface Pattern<T> {
  [key: string]: T;
}

export type Strand = null | string | Pattern<Yarn>;
export type Yarn = Strand | Array<Strand>;

export type BaseClause = null | string | RegExp | Pattern<Filter>;
export type OrClause = Set<BaseClause>;

export type Filter = BaseClause | OrClause;

export type Projection<R> = Map<BaseClause, R>;
export type SortOrder = Projection<number>;

function notString(s: string): BaseClause {
  return new RegExp(`(?!${s})`);
}

export function anyFromAll(clauses: { [key: string]: any }): Filter {
  return new Set(Object.values(clauses));
}

export function anyOf(...clauses: BaseClause[]): Filter {
  return new Set(clauses);
}

export function weaveFrom(...strands: Strand[]): Yarn {
  return strands;
}

export function mapFrom<R>(...pairs: [BaseClause, R][]): Projection<R> {
  return new Map(pairs);
}

export function isOrClause(filter: Filter): boolean {
  return filter instanceof Set;
}

export function testPatterns(
  strand: Pattern<Strand>,
  clause: Pattern<Filter>
): boolean {
  let result = true;
  for (const key in clause) {
    if (clause.hasOwnProperty(key) && clause[key] !== null) {
      if (strand[key] && testStrand(key, new Set(Object.keys(clause)))) {
        result = result && testYarn(strand[key], clause[key]);
      } else {
        result = false;
      }
    } else {
      result =
        result &&
        ((clause[key] === null &&
          (strand[key] === null || typeof strand[key] === 'undefined')) ||
          (typeof clause[key] === 'function' &&
            typeof strand[key] === 'function'));
    }
  }
  return result;
}

export function testBaseClause(
  strand: Strand,
  baseClause: BaseClause
): boolean {
  if (baseClause === null) {
    return strand === null || typeof strand === 'undefined';
  } else if (typeof strand === 'string' && typeof baseClause === 'string') {
    return strand === baseClause;
  } else if (typeof strand === 'string' && baseClause instanceof RegExp) {
    return baseClause.test(strand);
  } else {
    return testPatterns(
      strand as Pattern<Strand>,
      baseClause as Pattern<Filter>
    );
  }
}

export function testOrClause(strand: Strand, orClause: OrClause): boolean {
  return !!Array.from(orClause).find((clause) => testStrand(strand, clause));
}

export function testStrand(strand: Strand, filter: Filter): boolean {
  if (isOrClause(filter)) {
    return testOrClause(strand, filter as OrClause);
  } else {
    return testBaseClause(strand, filter as BaseClause);
  }
}

export function testYarn(yarn: Yarn, filter: Filter): boolean {
  if (Array.isArray(yarn)) {
    return yarn.some((strand) => testStrand(strand, filter));
  } else {
    return testStrand(yarn as Strand, filter);
  }
}

export function filterYarn(yarn: Yarn, filter: Filter): Yarn {
  if (Array.isArray(yarn)) {
    return yarn.filter((strand) => testStrand(strand, filter));
  } else {
    return testStrand(yarn as Strand, filter) ? yarn : null;
  }
}

export function filterObjects<T>(objects: T[], filter: Filter): T[] {
  return filterYarn(objects as any as Yarn, filter) as any as T[];
}

export function matchStrand<R>(
  strand: Strand,
  matchExpression: Projection<R>
): [BaseClause, R] {
  return Array.from(matchExpression).find((pair) =>
    testStrand(strand, pair[0])
  );
}

export function matchObject<T, R>(
  object: T,
  matchExpression: Projection<R>
): R {
  const result = matchStrand(object as any as Strand, matchExpression);
  if (result) {
    return result[1];
  } else {
    return null;
  }
}

export function sortYarn(yarn: Yarn, sortOrder: SortOrder): Yarn {
  if (Array.isArray(yarn)) {
    return yarn.sort((c1, c2) =>
      matchObject(c1, sortOrder) < matchObject(c2, sortOrder) ? -1 : 1
    );
  }
}

export function sortObjects<T>(objects: T[], sortOrder: SortOrder): T[] {
  return sortYarn(objects as any as Yarn, sortOrder) as any as T[];
}

const noParticipant = { color: null };
const redParticipant = { color: 'red' };
const blueParticipant = { color: 'blue' };

const noFilter = anyOf(noParticipant);
const redFilter = anyOf({ color: 'red' });

log(testStrand(redParticipant, redFilter));
log(testStrand(noParticipant, redFilter));

const notRed = notString('red');
const notRedFilter = anyOf({ color: notRed });
log(testStrand(blueParticipant, notRedFilter));

log(testYarn([redParticipant, blueParticipant], notRedFilter));

enum state {
  A = 'A',
  B = 'B',
}

function linearOrder(e) {
  return Object.keys(e).reduce( (acc, key, index) => ({...acc, [key]: index}), {});
}

log( JSON.stringify(linearOrder(state)));

/*
const sourceString: Strand = 's';
const matchAll: BaseClause = /(.*?)/;

console.log(testStrand(sourceString, 'a'));
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
  state: choiceOf(State),
};

const ActiveWorkItemPattern: Filter = {
  entity: EntityType.WorkItem,
  state: chooseFrom(State.s1),
};

const InActiveWorkItemPattern: Filter = {
  entity: EntityType.WorkItem,
  state: chooseFrom(State.s2),
};

const activeWorkItem: Strand = {
  entity: EntityType.WorkItem,
  state: State.s1,
};

const inActiveWorkItem: Strand = {
  entity: EntityType.WorkItem,
  state: State.s2,
};

const allItems: Yarn = weaveFrom(activeWorkItem, inActiveWorkItem);

const matcher: Projection = mapFrom(
  [ActiveWorkItemPattern, 'active'],
  [InActiveWorkItemPattern, 'in-active']
);

console.log('Work item tests');
console.log(testStrand(activeWorkItem, WorkItemPattern));
console.log(testStrand(inActiveWorkItem, WorkItemPattern));

console.log();
console.log('Active item test');
console.log(testStrand(activeWorkItem, ActiveWorkItemPattern));
console.log(testStrand(inActiveWorkItem, ActiveWorkItemPattern));

console.log();
console.log('Filter item test');
console.log(JSON.stringify(filterYarn(allItems, WorkItemPattern)));
console.log(JSON.stringify(filterYarn(allItems, ActiveWorkItemPattern)));

console.log('Matching test');
console.log(JSON.stringify(matchStrand(activeWorkItem, matcher)));
console.log(JSON.stringify(matchStrand(inActiveWorkItem, matcher)));
*/
