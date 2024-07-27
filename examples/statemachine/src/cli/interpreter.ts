import chalk from 'chalk';
import { Attribute, Command, Event, State, Transition, Action, BoolExpr, Expr, isLit, isRef, isBoolLit, isBoolRef, isBoolGroup, isBinExpr, isNegExpr, isGroup, Statemachine } from './../language-server/generated/ast.js';
import { defaultAttributeValue } from './interpret-util.js';

export type StatemachineEnv = Map<string, number | boolean | undefined>;
export const env: StatemachineEnv = new Map();

interface ExecutionContext {
    currentState: State | undefined;
    events: Event[];
    commands: Command[];
    env: StatemachineEnv;
    attributes: any[];
    states: State[];
}

export function evalBoolExprWithEnv(e: BoolExpr | Expr, env: StatemachineEnv): any {
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
    } else if (isLit(e)) {
        return e.val;
    } else if (isRef(e)) {
        const v = env.get(e.val.ref?.name ?? '');
        if (typeof v === 'boolean') {
            throw new Error(e.val.error?.message ?? `Boolean attribute being accessed in a non-boolean expression.`);
        } else if (v !== undefined) {
            return v;
        }
        throw new Error(e.val.error?.message ?? `Attempted to lookup an unbound reference '${v}${e.val.$refText}' in the env.`);
    } else if (isNegExpr(e)) {
        return -1 * evalBoolExprWithEnv(e.ne, env);
    } else if (isGroup(e)) {
        return evalBoolExprWithEnv(e.ge, env);
    } else if (isBinExpr(e)) {
        let opval = e.op;
        let v1 = evalBoolExprWithEnv(e.e1, env);
        let v2 = evalBoolExprWithEnv(e.e2, env);

        const leftType = typeof v1;
        const rightType = typeof v2;
        if (leftType != rightType) {
            console.log(`Type sd mismatch: ${leftType} ${e.op} ${rightType} ${v1} ${v2}`);
            throw new Error(`Type sd mismatch: ${leftType} ${e.op} ${rightType}`);
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
    }
    throw new Error('Unhandled Boolean Expression: ' + e);
}

function executeAction(action: Action, context: ExecutionContext): void {
    if (action.assignment) {
        const variableName = action.assignment.variable.ref?.name;
        if (variableName) {
            const value = evalBoolExprWithEnv(action.assignment.value, context.env);
            context.env.set(variableName, value);
        }
    } else if (action.print) {
        const value = action.print.value;
        if (value) {
            console.log(evalBoolExprWithEnv(value, context.env));
        }
    } else if (action.command) {
        console.log(`Executing command: ${action.command.ref?.name}`);
    }
}

function executeTransition(transition: Transition, context: ExecutionContext): void {
    if (transition.guard && !evalBoolExprWithEnv(transition.guard, context.env)) {
        console.log(chalk.yellow(`Guard failed for transition from ${context.currentState?.name} to ${transition.state?.ref?.name} due to guard condition.`));
        return;
    }
    const oldState = context.currentState?.name;
    transition.actions.forEach(action => executeAction(action, context));
    context.currentState = transition.state.ref;
    console.log(chalk.green(`${oldState} ==> ${context.currentState?.name}`));
}

function handleEvents(context: ExecutionContext): void {
    while (context.events.length > 0 && context.currentState) {
        console.log(chalk.green(`Current State: ${context.currentState.name}`));
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

function interpretModel(model: Statemachine) {
    const attributes = model.attributes.map((attribute: Attribute) => {
        const attributeValue = attribute.defaultValue ? evalBoolExprWithEnv(attribute.defaultValue, env) : defaultAttributeValue(attribute);
        env.set(attribute.name, attributeValue);
        return {
            ...attribute,
            name: attribute.name,
            type: attribute.type,
            defaultValue: attributeValue
        };
    });

    const events = model.events.map((event: Event) => {
        return {
            ...event,
            name: event.name,
        };
    });

    const commands = model.commands.map((command: Command) => {
        return {
            ...command,
            name: command.name
        };
    });

    const states = model.states.map((state: State) => {
        return {
            ...state,
            name: state.name,
            transitions: state.transitions,
            actions: state.actions
        };
    });

    const initialState = states.find(state => state.name === model?.init?.ref?.name);

    return {
        attributes,
        events,
        commands,
        initialState,
        states
    };
}


export function interpretStatemachine(model: Statemachine, eventQueue: string[]): void {
    const interpretedModel = interpretModel(model);
    // interpretedModel.attributes.forEach((attribute: any) => { env.set(attribute.name, attribute.defaultValue); });
    const context: ExecutionContext = {
        currentState: interpretedModel.initialState,
        events: [], // Events passed or called in the terminal
        env: env,
        commands: interpretedModel.commands,
        attributes: interpretedModel.attributes,
        states: interpretedModel.states
    };

    if (!context.currentState) {
        throw new Error("Initial state is undefined.");
    }

    eventQueue.forEach(eventName => {
        const event = interpretedModel.events.find(e => e.name === eventName);
        if (event) {
            context.events.push(event);
        } else {
            console.error(`Event ${eventName} not found in the model.`);
        }
    });

    while (context.currentState && context.events.length > 0) {
        console.log(chalk.green(`[${context.currentState.name}]`));
        handleEvents(context);
    }


    console.log('Current State: ' + chalk.green(`[${context.currentState.name}]`));
    console.log(chalk.green('Interpretation completed succesfully!'));
}