// Import stylesheets
import './style.css';

// Write TypeScript code!
const appDiv: HTMLElement = document.getElementById('app');
appDiv.innerHTML = `<h1>Pattern test</h1>`;


interface Pattern<T> { [key: string]: T; } ;

type Strand = string | Pattern<Strand>;
type Yarn = Array<Strand> ;

type BaseClause = string | RegExp | Pattern<Filter> ;
type OrClause = Set<BaseClause> ;

type Filter = BaseClause | OrClause ;

type MatchExpression = Map<BaseClause, any>;


function orClause(...clauses: BaseClause[]): Filter {
  return new Set(clauses);
}

function yarn(...strands: Strand[]): Yarn {
  return strands;
}

function isOrClause(filter: Filter): boolean {
  return filter instanceof Set;
}

function testPatterns(strand: Pattern<Strand>, clause: Pattern<Filter>): boolean {
  let result = true;
  for (const key in clause) {
    if (clause.hasOwnProperty(key)) {
      if (test(key, new Set(Object.keys(clause)))) {
        result = result && test(strand[key], clause[key]);
      }
    }
  }
  return result;
}

function testBaseClause(strand: Strand, baseClause: BaseClause): boolean {
  if (typeof strand === 'string' && typeof baseClause === 'string') {
    return strand === baseClause;
  } else if (typeof strand === 'string' && baseClause instanceof RegExp ) {
    return baseClause.test(strand);
  } else {
    return 
  }
}

function testOrClause(strand: Strand, orClause: OrClause): boolean {
  if (orClause.has(strand)) {
    return true;
  } else {
    return !!Array.from(orClause).find((clause) => test(strand, clause));
  }
}

function test(strand: Strand, filter: Filter): boolean {
  if (isOrClause(filter)) {
    return testOrClause(strand, filter as OrClause);
  } else {
    return testBaseClause(strand, filter as BaseClause)
  }
}

function filter(yarn: Yarn, filter: Filter): Yarn {
  yarn.filter(strand => {
    test(strand, filter)
  })
}

const sourceString: Strand = 's';
const matchAll: BaseClause = /(.*?)/;

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
  state: orClause(State.s1, State.s2),
};

const ActiveWorkItemPattern: Filter = {
  entity: EntityType.WorkItem,
  state: orClause(State.s1),
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

console.log('Work item tests');
console.log(test(activeWorkItem, WorkItemPattern));
console.log(test(inActiveWorkItem, WorkItemPattern));

console.log();
console.log('Active item test');
console.log(test(activeWorkItem, ActiveWorkItemPattern));
console.log(test(inActiveWorkItem, ActiveWorkItemPattern));

console.log();
console.log('Filter item test');
console.log(JSON.stringify(filter(testYarn, WorkItemPattern)));
console.log(JSON.stringify(filter(testYarn, ActiveWorkItemPattern)));
