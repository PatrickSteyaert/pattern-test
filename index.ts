// Import stylesheets
import './style.css';

// Write TypeScript code!
const appDiv: HTMLElement = document.getElementById('app');
appDiv.innerHTML = `<h1>Pattern test</h1>`;

interface Pattern<T> {
  [key: string]: T;
}

type Strand = string | Pattern<Strand>;
type Yarn = Array<Strand>;

type BaseClause = string | RegExp | Pattern<Filter>;
type OrClause = Set<BaseClause>;

type Filter = BaseClause | OrClause;

type Projection = Map<BaseClause, any>;

function chooseFrom(...clauses: BaseClause[]): Filter {
  return new Set(clauses);
}

function choiceOf(clauses: {[key: string]: any}): Filter {
  return new Set(Object.keys(clauses));
}

function weaveFrom(...strands: Strand[]): Yarn {
  return strands;
}

function mapFrom(...pairs: [BaseClause, any][]): Projection {
  return new Map(pairs);
}

function isOrClause(filter: Filter): boolean {
  return filter instanceof Set;
}

function testPatterns(
  strand: Pattern<Strand>,
  clause: Pattern<Filter>
): boolean {
  let result = true;
  for (const key in clause) {
    if (clause.hasOwnProperty(key)) {
      if (testStrand(key, new Set(Object.keys(clause)))) {
        result = result && testStrand(strand[key], clause[key]);
      }
    }
  }
  return result;
}

function testBaseClause(strand: Strand, baseClause: BaseClause): boolean {
  if (typeof strand === 'string' && typeof baseClause === 'string') {
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

function testOrClause(strand: Strand, orClause: OrClause): boolean {
  if (orClause.has(strand)) {
    return true;
  } else {
    return !!Array.from(orClause).find((clause) => testStrand(strand, clause));
  }
}

function testStrand(strand: Strand, filter: Filter): boolean {
  if (isOrClause(filter)) {
    return testOrClause(strand, filter as OrClause);
  } else {
    return testBaseClause(strand, filter as BaseClause);
  }
}

function filterYarn(yarn: Yarn, filter: Filter): Yarn {
  return yarn.filter((strand) => testStrand(strand, filter));
}

function matchStrand(strand: Strand, matchExpression: Projection): Yarn {
  return Array.from(matchExpression).find((pair) =>
    testStrand(strand, pair[0]) ? true : false
  );
}

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
