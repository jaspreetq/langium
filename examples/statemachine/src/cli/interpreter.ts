// import { Model, State, Event, Transition, Action, PrintStatement, Assignment, BoolExpr, Expr, Attribute, isLit, isRef, isBinExpr, isNegExpr, isGroup, isPrintStatement, isAssignment } from '../language-server/generated/ast.js';

// // Type for Statemachine environment
// type StatemachineEnv = {
//     [key: string]: any;
// };

// // Initialize environment with default attribute values
// function initEnv(model: Model): StatemachineEnv {
//     const env: StatemachineEnv = {};
//     if (model.attributes) {
//         model.attributes.forEach(attr => {
//             env[attr.name] = getDefault(attr.type);
//         });
//     }
//     return env;
// }

// // Helper to get default values for types
// function getDefault(type: string): any {
//     if (type === 'int') return 0;
//     if (type === 'bool') return false;
//     throw new Error(`Unknown type: ${type}`);
// }

// // Interpret the statemachine model
// export function interpretStatemachine(model: Model): void {
//     const env = initEnv(model);
//     const initialState = model.states.find(state => state.name === model.init.name);
//     if (!initialState) {
//         throw new Error(`Initial state '${model.init.name}' not found`);
//     }
//     runState(initialState, env, model.events);
// }

// // Run a state and process its transitions
// function runState(state: State, env: StatemachineEnv, events: Event[]): void {
//     console.log(`Entering state: ${state.name}`);
//     processActions(state.actions, env);

//     const event = getEvent(events, state.transitions);
//     if (event) {
//         const transition = state.transitions.find(trans => trans.event.name === event.name);
//         if (transition) {
//             const guard = transition.guard;
//             if (!guard || evalBoolExpr(guard, env)) {
//                 const nextState = transition.state.ref;
//                 if (nextState) {
//                     runState(nextState, env, events);
//                 } else {
//                     throw new Error(`Next state '${transition.state.$refText}' not found`);
//                 }
//             } else {
//                 console.log('Transition not allowed.');
//             }
//         }
//     }
// }

// // Get an event to process based on available transitions
// function getEvent(events: Event[], transitions: Transition[]): Event | undefined {
//     // Placeholder for event handling logic
//     return events.length ? events[0] : undefined;
// }

// // Process actions in a state
// function processActions(actions: Action[], env: StatemachineEnv): void {
//     actions.forEach(action => {
//         if (isPrintStatement(action)) {
//             console.log(evalExpr(action.value, env));
//         } else if (isAssignment(action)) {
//             env[action.variable.name] = evalExpr(action.value, env);
//         }
//     });
// }

// // Evaluate boolean expressions
// function evalBoolExpr(expr: BoolExpr, env: StatemachineEnv): boolean {
//     // Add your evaluation logic here
//     return true;
// }

// // Evaluate expressions
// function evalExpr(expr: Expr, env: StatemachineEnv): any {
//     if (isLit(expr)) {
//         return expr.val;
//     } else if (isRef(expr)) {
//         return env[expr.val.name];
//     } else if (isBinExpr(expr)) {
//         const left = evalExpr(expr.e1, env);
//         const right = evalExpr(expr.e2, env);
//         switch (expr.op) {
//             case '+': return left + right;
//             case '-': return left - right;
//             case '*': return left * right;
//             case '/': return left / right;
//             default: throw new Error(`Unknown operator: ${expr.op}`);
//         }
//     } else if (isNegExpr(expr)) {
//         return -evalExpr(expr.ne, env);
//     } else if (isGroup(expr)) {
//         return evalExpr(expr.ge, env);
//     }
//     throw new Error(`Unhandled expression: ${JSON.stringify(expr)}`);
// }


// // interface Statemachine {
// //     name: string;
// //     events: Event[];
// //     attributes: Attribute[];
// //     initialState: State;
// //     states: State[];
// // }

// // interface Event {
// //     name: string;
// // }

// // interface Attribute {
// //     name: string;
// //     type: 'int' | 'bool';
// //     defaultValue?: Expr | BoolExpr;
// // }

// // interface State {
// //     name: string;
// //     transitions: Transition[];
// // }

// // interface Transition {
// //     event: Event;
// //     guard?: BoolExpr;
// //     targetState: State;
// //     actions: Action[];
// // }

// // type Action = Assignment | PrintStatement;

// // interface Assignment {
// //     variable: Attribute;
// //     value: Expr | BoolExpr;
// // }

// // interface PrintStatement {
// //     value: Expr | BoolExpr;
// // }

// // type Expr = AddExpr | MultExpr | LitExpr | RefExpr | GroupExpr | NegExpr;

// // interface AddExpr {
// //     type: 'add';
// //     left: Expr;
// //     right: Expr;
// // }

// // interface MultExpr {
// //     type: 'mult';
// //     left: Expr;
// //     right: Expr;
// // }

// // interface LitExpr {
// //     type: 'lit';
// //     value: number;
// // }

// // interface RefExpr {
// //     type: 'ref';
// //     attribute: Attribute;
// // }

// // interface GroupExpr {
// //     type: 'group';
// //     expr: Expr;
// // }

// // interface NegExpr {
// //     type: 'neg';
// //     expr: Expr;
// // }

// // type BoolExpr = BoolLitExpr | BoolGroupExpr | BoolComparisonExpr | BoolBinExpr | ExprAsBoolExpr;

// // interface BoolLitExpr {
// //     type: 'boolLit';
// //     value: boolean;
// // }

// // interface BoolGroupExpr {
// //     type: 'group';
// //     expr: BoolExpr;
// // }

// // interface BoolComparisonExpr {
// //     type: 'comparison';
// //     left: Expr;
// //     operator: '<=' | '<' | '>=' | '>' | '==' | '!=';
// //     right: Expr;
// // }

// // interface BoolBinExpr {
// //     type: 'bin';
// //     left: BoolExpr;
// //     operator: '||' | '&&';
// //     right: BoolExpr;
// // }

// // interface ExprAsBoolExpr {
// //     type: 'exprAsBool';
// //     expr: Expr;
// // }


// // class Environment {
// //     private values: Map<string, number | boolean> = new Map();

// //     set(name: string, value: number | boolean): void {
// //         this.values.set(name, value);
// //     }

// //     get(name: string): number | boolean {
// //         if (!this.values.has(name)) {
// //             throw new Error(`Undefined attribute: ${name}`);
// //         }
// //         return this.values.get(name)!;
// //     }
// // }

// // function evalExpr(expr: Expr, env: Environment): number {
// //     switch (expr.type) {
// //         case 'lit':
// //             return expr.value;
// //         case 'ref':
// //             return env.get(expr.attribute.name) as number;
// //         case 'add':
// //             return evalExpr(expr.left, env) + evalExpr(expr.right, env);
// //         case 'mult':
// //             return evalExpr(expr.left, env) * evalExpr(expr.right, env);
// //         case 'neg':
// //             return -evalExpr(expr.expr, env);
// //         case 'group':
// //             return evalExpr(expr.expr, env);
// //     }
// // }

// // function evalBoolExpr(expr: BoolExpr, env: Environment): boolean {
// //     switch (expr.type) {
// //         case 'boolLit':
// //             return expr.value;
// //         case 'group':
// //             return evalBoolExpr(expr.expr, env);
// //         case 'comparison':
// //             const left = evalExpr(expr.left, env);
// //             const right = evalExpr(expr.right, env);
// //             switch (expr.operator) {
// //                 case '<=': return left <= right;
// //                 case '<': return left < right;
// //                 case '>=': return left >= right;
// //                 case '>': return left > right;
// //                 case '==': return left === right;
// //                 case '!=': return left !== right;
// //             }
// //         case 'bin':
// //             const leftBool = evalBoolExpr(expr.left, env);
// //             const rightBool = evalBoolExpr(expr.right, env);
// //             switch (expr.operator) {
// //                 case '||': return leftBool || rightBool;
// //                 case '&&': return leftBool && rightBool;
// //             }
// //         case 'exprAsBool':
// //             return evalExpr(expr.expr, env) !== 0;
// //     }
// // }

// // function initializeAttributes(attributes: Attribute[], env: Environment): void {
// //     for (const attribute of attributes) {
// //         if (attribute.defaultValue) {
// //             if (attribute.type === 'int') {
// //                 env.set(attribute.name, evalExpr(attribute.defaultValue as Expr, env));
// //             } else {
// //                 env.set(attribute.name, evalBoolExpr(attribute.defaultValue as BoolExpr, env));
// //             }
// //         } else {
// //             env.set(attribute.name, attribute.type === 'int' ? 0 : false);
// //         }
// //     }
// // }

// // function executeAction(action: Action, env: Environment): void {
// //     if ('variable' in action) {
// //         const value = 'value' in action && action.value ?
// //             (action.value as BoolExpr).type ? evalBoolExpr(action.value as BoolExpr, env) : evalExpr(action.value as Expr, env) :
// //             0;
// //         env.set(action.variable.name, value);
// //     } else if ('print' in action) {
// //         const value = 'value' in action && action.value ?
// //             (action.value as BoolExpr).type ? evalBoolExpr(action.value as BoolExpr, env) : evalExpr(action.value as Expr, env) :
// //             '';
// //         console.log(value);
// //     }
// // }

// // function handleTransition(state: State, event: Event, env: Environment): State | null {
// //     for (const transition of state.transitions) {
// //         if (transition.event.name === event.name) {
// //             if (!transition.guard || evalBoolExpr(transition.guard, env)) {
// //                 for (const action of transition.actions) {
// //                     executeAction(action, env);
// //                 }
// //                 return transition.targetState;
// //             }
// //         }
// //     }
// //     return null;
// // }

// // function runStatemachine(statemachine: Statemachine, events: Event[]): void {
// //     const env = new Environment();
// //     initializeAttributes(statemachine.attributes, env);

// //     let currentState = statemachine.initialState;

// //     for (const event of events) {
// //         const nextState = handleTransition(currentState, event, env);
// //         if (nextState) {
// //             currentState = nextState;
// //         }
// //     }
// // }


