import { Attribute, Command, Event } from './../language-server/generated/ast.js';
import { State, Transition, Action, BoolExpr, Expr, isLit, isRef, isBoolLit, isBoolRef, isBoolGroup, isBinExpr, isNegExpr, isGroup, isBoolExpr } from '../language-server/generated/ast.js';

export type StatemachineEnv = Map<string, number | boolean | undefined>;
export const env: StatemachineEnv = new Map();

interface ExecutionContext {
    currentState: State | undefined;
    events: Event[];
    commands: Command[];
    env: StatemachineEnv;
    Attributes: Attribute[];
    states: State[];
}

// function extractAttributes(model: any): StatemachineEnv {
//     const attributes = new Map();
//     if (model.attributes) {
//         model.attributes.forEach((attribute: any) => {
//             const name = attribute.name;
//             const defaultValue = attribute.defaultValue ? evalBoolExprWithEnv(attribute.defaultValue, attributes) : undefined;
//             attributes.set(name, defaultValue);
//         });
//     }
//     return attributes;
// }

// function extractInitialState(model: any): any {
//     if (model.init && model.init.$ref) {
//         const stateRef = model.init.$ref;
//         return resolveReference(stateRef, model.states);
//     }
//     throw new Error("Initial state is undefined.");
// }

// function extractStatesAndTransitions(model: any): Map<string, any> {
//     const states = new Map();
//     if (model.states) {
//         model.states.forEach((state: any) => {
//             const stateName = state.name;
//             const transitions = state.transitions.map((transition: any) => {
//                 return {
//                     event: transition.event.$refText,
//                     guard: transition.guard,
//                     actions: transition.actions,
//                     targetState: resolveReference(transition.state.$ref, model.states)
//                 };
//             });
//             states.set(stateName, { transitions });
//         });
//     }
//     return states;
// }

// function resolveReference(ref: string, collection: any): any {
//     const refIndex = parseInt(ref.split('@')[1]);
//     return collection[refIndex];
// }

export function evalExprWithEnv(e: BoolExpr | Expr | undefined, env: StatemachineEnv): number {
    if (e === undefined) {
        throw new Error('Undefined expression');
    }
    if (isLit(e)) {
        return e.val;
    } else if (isRef(e)) {
        const v = env.get(e.val.ref?.name ?? '');
        if (typeof v === 'boolean') {
            throw new Error(e.val.error?.message ?? `Boolean attribute being accessed in a non-boolean expression.`);
        } else if (v !== undefined) {
            return v;
        }
        throw new Error(e.val.error?.message ?? `Attempted to lookup an unbound reference '${v}${e.val.$refText}' in the env.`);
    } else if (isBinExpr(e)) {
        let opval = e.op;
        let v1 = evalExprWithEnv(e.e1, env);
        let v2 = evalExprWithEnv(e.e2, env);

        switch (opval) {
            case '+': return v1 + v2;
            case '-': return v1 - v2;
            case '*': return v1 * v2;
            case '/': return v1 / v2;
            default: throw new Error(`Unrecognized bin op passed: ${opval}`);
        }
    } else if (isNegExpr(e)) {
        return -1 * evalExprWithEnv(e.ne, env);
    } else if (isGroup(e)) {
        return evalExprWithEnv(e.ge, env);
    } else if (isBoolExpr(e)) {
        if (isBoolLit(e) || isBoolRef(e)) {
            throw new Error('Unhandled Expression: ' + e);
        } else if (isBoolGroup(e)) {
            return evalExprWithEnv(e.gbe, env);
        }
    }
    throw new Error('Unhandled Expression: ' + e);
}

export function evalBoolExprWithEnv(e: BoolExpr | Expr, env: StatemachineEnv): boolean | number {
    if (e === undefined) {
        throw new Error('Undefined expression');
    } else if (isBoolLit(e)) {
        return e.val ?? false;
    } else if (isBoolRef(e)) {
        const v = env.get(e.val.ref?.name ?? '');
        if (v !== undefined) {
            return v;
        }
        throw new Error(e.val.error?.message ?? `Attempted to lookup an unbound reference '${v}${e.val.$refText}' in the env.`);
    } else if (isBoolGroup(e)) {
        return evalBoolExprWithEnv(e.gbe, env);
    } else if (isBinExpr(e)) {
        let opval = e.op;
        let v1 = evalBoolExprWithEnv(e.e1, env);
        let v2 = evalBoolExprWithEnv(e.e2, env);
        const leftType = typeof v1;
        const rightType = typeof v2;
        if (leftType != rightType) {
            throw new Error(`Type mismatch: ${leftType} ${e.op} ${rightType}`);
        }
        if (e.op === '||' || e.op === '&&') {
            if (leftType !== 'boolean' || rightType !== 'boolean') {
                throw new Error(`Invalid types for boolean operation: ${leftType} ${e.op} ${rightType}`);
            }
            return e.op === '||' ? v1 || v2 : v1 && v2;
        }
        if (e.op === '!=' || e.op === '==') {
            if (leftType === 'boolean' && rightType === 'boolean') {
                return e.op === '==' ? v1 === v2 : v1 !== v2;
            }
        }
        if ((typeof v1 === 'number' && typeof v2 === 'number' && (['<', '>', '<=', '>=', '==', '!=', '/', '*', '+', '-'].includes(opval)))) {
            switch (opval) {
                case '<': return v1 < v2;
                case '>': return v1 > v2;
                case '<=': return v1 <= v2;
                case '>=': return v1 >= v2;
                case '==': return v1 === v2;
                case '!=': return v1 !== v2;
                case '/': return v1 / v2;
                case '*': return v1 * v2;
                case '+': return v1 + v2;
                case '-': return v1 - v2;
                default: throw new Error(`Unrecognized bin op passed: ${opval}`);
            }
        } else {
            throw new Error(`Unrecognized bin op passed: ${opval}`);
        }
    } else if (isNegExpr(e) || isGroup(e) || isLit(e) || isRef(e)) {
        return evalExprWithEnv(e, env);
    }
    throw new Error('Unhandled Boolean Expression: ' + e);
}

function executeAction(action: Action, context: ExecutionContext): void {
    if (action.assignment) {
        const variableName = action.assignment.variable.ref?.name;
        if (variableName) {
            const value = evalBoolExprWithEnv(action.assignment.value as BoolExpr, context.env);
            context.env.set(variableName, value);
        }
    } else if (action.print) {
        const value = action.print.value;
        if (value) {
            console.log(evalBoolExprWithEnv(value as BoolExpr, context.env));
        }
    } else if (action.command) {
        // Execute the command logic, assuming it is properly implemented elsewhere
        console.log(`Executing command: ${action.command.ref?.name}`);
    }
}

function executeTransition(transition: Transition, context: ExecutionContext): void {
    if (transition.guard && !evalBoolExprWithEnv(transition.guard, context.env)) {
        return;
    }
    transition.actions.forEach(action => executeAction(action, context));
    context.currentState = transition.state.ref;
}

function handleEvents(context: ExecutionContext): void {
    while (context.events.length > 0 && context.currentState) {
        const event = context.events.shift();
        if (event) {
            for (const transition of context.currentState.transitions) {
                if (transition.event.ref?.name === event.name) {
                    executeTransition(transition, context);
                    break;
                }
            }
        }
    }
}

function interpretModel(model: any) {

    const attributes = model?.attributes?.map((attribute: any) => {
        return {
            name: attribute.name,
            type: attribute.type,
            defaultValue: attribute.defaultValue
        }
    });
    const events = model?.events?.map((event: any) => {
        return {
            name: event.name,
        }
    });

    const commands = model?.commands?.map((command: any) => { return { name: command.name } });
    const states = model?.states?.map((state: any) => {
        return {
            name: state?.name,
            transitions: state?.transitions,
            actions: state?.actions
        }
    });
    const initialState = states[0];
    return {
        attributes,
        events,
        commands,
        initialState,
        states
    };
}


export function interpretStatemachine(model: any): void {
    const interpretedModel = interpretModel(model);
    interpretedModel?.attributes?.forEach((attribute: any) => { env.set(attribute.name, attribute.defaultValue) });
    const context: ExecutionContext = {
        currentState: interpretedModel.initialState,
        events: interpretedModel.events, // Populate this as needed
        env: env,
        commands: interpretedModel.commands,
        Attributes: interpretedModel.attributes,
        states: interpretedModel.states

    };
    console.log(" guard " + context.currentState?.transitions[0].guard?.$type);
    if (!context.currentState) {
        throw new Error("Initial state is undefined.");
    }

    // Example of event injection

    while (context.currentState) {
        handleEvents(context);
        // Additional logic to prevent infinite loops and manage state
    }
}



// function extractAttributes(model: any): StatemachineEnv {
//     const attributes = new Map();
//     if (model.attributes) {
//         model.attributes.forEach((attribute: any) => {
//             const name = attribute.name;
//             const defaultValue = attribute.defaultValue ? evaluateExpression(attribute.defaultValue) : undefined;
//             attributes.set(name, defaultValue);
//         });
//     }
//     return attributes;
// }

// function extractInitialState(model: any): any {
//     if (model.init && model.init.$ref) {
//         const stateRef = model.init.$ref;
//         return resolveReference(stateRef, model.states);
//     }
//     throw new Error("Initial state is undefined.");
// }

// function extractStatesAndTransitions(model: any): Map<string, any> {
//     const states = new Map();
//     if (model.states) {
//         model.states.forEach((state: any) => {
//             const stateName = state.name;
//             const transitions = state.transitions.map((transition: any) => {
//                 return {
//                     event: transition.event.$refText,
//                     guard: transition.guard,
//                     actions: transition.actions,
//                     targetState: resolveReference(transition.state.$ref, model.states)
//                 };
//             });
//             states.set(stateName, { transitions });
//         });
//     }
//     return states;
// }

// function resolveReference(ref: string, collection: any): any {
//     const refIndex = parseInt(ref.split('@')[1]);
//     return collection[refIndex];
// }

// function evaluateExpression(expr: any): any {
//     if (expr.$type === 'Lit') {
//         return expr.val;
//     } else if (expr.$type === 'NegExpr') {
//         return -evaluateExpression(expr.ne);
//     } else if (expr.$type === 'BinExpr') {
//         const left = evaluateExpression(expr.e1);
//         const right = evaluateExpression(expr.e2);
//         switch (expr.op) {
//             case '+': return left + right;
//             case '-': return left - right;
//             case '*': return left * right;
//             case '/': return left / right;
//             default: throw new Error(`Unsupported binary operator: ${expr.op}`);
//         }
//     }
//     // Add more expression types as needed
//     throw new Error(`Unsupported expression type: ${expr.$type}`);
// }

// function interpretModel(model: any) {
//     const attributes = extractAttributes(model);
//     const initialState = extractInitialState(model);
//     const states = extractStatesAndTransitions(model);

//     return {
//         attributes,
//         initialState,
//         states
//     };
// }

// function evaluateBoolExpr(expr: BoolExpr, context: ExecutionContext): boolean | number {
//     // Implement boolean expression evaluation based on the structure of BoolExpr
//     return evaluateExpression(expr);
// }

// function executeAction(action: Action, context: ExecutionContext): void {
//     if (action.assignment) {
//         const variableName = action.assignment.variable.ref?.name;
//         if (variableName) {
//             const value = evaluateExpression(action.assignment.value as BoolExpr);
//             context.env.set(variableName, value);
//         }
//     } else if (action.print) {
//         const value = action.print.value;
//         if (value) {
//             console.log(evaluateExpression(value as BoolExpr));
//         }
//     } else if (action.command) {
//         // Execute the command logic, assuming it is properly implemented elsewhere
//         console.log(`Executing command: ${action.command.ref?.name}`);
//     }
// }

// function executeTransition(transition: Transition, context: ExecutionContext): void {
//     if (transition.guard && !evaluateBoolExpr(transition.guard, context)) {
//         return;
//     }
//     transition.actions.forEach(action => executeAction(action, context));
//     context.currentState = transition.state.ref;
// }

// function handleEvents(context: ExecutionContext): void {
//     while (context.events.length > 0 && context.currentState) {
//         const event = context.events.shift();
//         if (event) {
//             for (const transition of context.currentState.transitions) {
//                 if (transition.event.ref?.name === event) {
//                     executeTransition(transition, context);
//                     break;
//                 }
//             }
//         }
//     }
// }

// export function interpretStatemachine(model: any): void {
//     const interpretedModel = interpretModel(model);

//     const context: ExecutionContext = {
//         currentState: interpretedModel.initialState,
//         events: [], // Populate this as needed
//         env: interpretedModel.attributes
//     };

//     if (!context.currentState) {
//         throw new Error("Initial state is undefined.");
//     }

//     // Example of event injection
//     context.events.push('switchCapacity');

//     while (context.currentState) {
//         handleEvents(context);
//         // Additional logic to prevent infinite loops and manage state
//     }
// }

// export function evalExprWithEnv(e: BoolExpr | Expr | undefined, env: StatemachineEnv): number {//
//     if (e === undefined) {
//         throw new Error('Undefined expression');
//     }
//     if (isLit(e)) {
//         return e.val;

//     } else if (isRef(e)) {
//         const v = env.get(e.val.ref?.name ?? '');
//         if (typeof v === 'boolean') {
//             throw new Error(e.val.error?.message ?? `Boolean attribute being accessed in a non boolean expression.`);
//         } else if (v != undefined) {
//             return v;
//         }
//         throw new Error(e.val.error?.message ?? `Attempted to lookup an unbound reference '${v}${e.val.$refText}' in the env.`);

//     } else if (isBinExpr(e)) {
//         let opval = e.op;
//         let v1 = evalExprWithEnv(e.e1, env);
//         let v2 = evalExprWithEnv(e.e2, env);

//         switch (opval) {
//             case '+': return v1 + v2;
//             case '-': return v1 - v2;
//             case '*': return v1 * v2;
//             case '/': return v1 / v2;
//             default: throw new Error(`Unrecognized bin op passed: ${opval}`);
//         }

//     } else if (isNegExpr(e)) {
//         return -1 * evalExprWithEnv(e.ne, env);

//     } else if (isGroup(e)) {
//         return evalExprWithEnv(e.ge, env);

//     } else if (isBoolExpr(e)) {
//         if (isBoolLit(e) || isBoolRef(e)) {
//             throw new Error('Unhandled Expression: ' + e);
//         } else if (isBoolGroup(e)) {
//             return evalExprWithEnv(e.gbe, env);
//         }
//     }
//     throw new Error('Unhandled Expression: ' + e);

// }

// export function evalBoolExprWithEnv(e: BoolExpr | Expr | undefined, env: StatemachineEnv): boolean | number {
//     if (isBoolLit(e)) {
//         return e.val ?? false;
//     } else if (isBoolRef(e)) {
//         const v = env.get(e.val.ref?.name ?? '');
//         if (v != undefined) {
//             return v;
//         }
//         throw new Error(e.val.error?.message ?? `Attempted to lookup an unbound reference '${v}${e.val.$refText}' in the env.`);
//     } else if (isBoolGroup(e)) {
//         return evalBoolExprWithEnv(e.gbe, env);
//     } else if (isBinExpr(e)) {
//         let opval = e.op;
//         let v1 = evalBoolExprWithEnv(e.e1, env);
//         let v2 = evalBoolExprWithEnv(e.e2, env);
//         if ((typeof v1 === 'number' && typeof v2 === 'number' && (opval === '/' || opval === '*' || opval === '+' || opval === '-' || opval === '==' || opval === '!=' || opval === '<' || opval === '>' || opval === '<=' || opval === '>='))) {
//             switch (opval) {
//                 case '<': return v1 < v2;
//                 case '>': return v1 > v2;
//                 case '<=': return v1 <= v2;
//                 case '>=': return v1 >= v2;
//                 case '==': return v1 === v2;
//                 case '!=': return v1 !== v2;
//                 case '/': return v1 / v2;
//                 case '*': return v1 * v2;
//                 case '+': return v1 + v2;
//                 case '-': return v1 - v2;
//                 default: throw new Error(`Unrecognized bin op passed: ${opval}`);
//             }

//         } else if (typeof v1 === 'boolean' && typeof v2 === 'boolean' && (opval === '||' || opval === '&&')) {
//             switch (opval) {
//                 case '||': return v1 || v2;
//                 case '&&': return v1 && v2;
//                 default: throw new Error(`Unrecognized bin op passed: ${opval}`);
//             }
//         } else {
//             throw new Error(`Unrecognized bin op passed: ${opval}`);
//         }
//     } else if (isExpr(e)) {
//         return evalExprWithEnv(e, env);
//     } else if (e === undefined) {
//         return false;
//     } else if (isNegExpr(e) || isGroup(e) || isLit(e) || isRef(e)) {
//         return evalExprWithEnv(e, env);
//     }
//     throw new Error('Unhandled Boolean Expression: ' + e);
// }