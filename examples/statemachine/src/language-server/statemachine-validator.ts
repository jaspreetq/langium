import type { ValidationAcceptor, ValidationChecks } from 'langium';
import { type State, type Statemachine, type StatemachineAstType, type Event, type Attribute, Assignment, PrintStatement, isStringLiteral, Transition } from './generated/ast.js';
import type { StatemachineServices } from './statemachine-module.js';
import { MultiMap } from 'langium';
import { evalExpression, inferType } from '../cli/interpret-util.js';
import { attributeNames, env } from '../cli/interpreter.js';

export function registerValidationChecks(services: StatemachineServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.StatemachineValidator;
    const checks: ValidationChecks<StatemachineAstType> = {
        State: validator.checkStateNameStartsWithCapital,
        Statemachine: validator.checkStatemachine,
        Assignment: validator.checkAssignment,
        PrintStatement: validator.checkPrintStatement,
        Transition: validator.checkTransition,
    };
    registry.register(checks, validator);
}
// Expression: validator.checkExpression,
// Attribute: validator.validateAttributeInitialization,

export class StatemachineValidator {
    checkStateNameStartsWithCapital(state: State, accept: ValidationAcceptor): void {
        if (state.name) {
            const firstChar = state.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'State name should start with a capital letter.', { node: state, property: 'name' });
            }
        }
    }

    /* Checks for unique state, event, and attribute names and validates attributes and initial state */
    checkStatemachine(statemachine: Statemachine, accept: ValidationAcceptor): void {
        const names = new MultiMap<string, State | Event | Attribute>();
        const allSymbols = [...statemachine.states, ...statemachine.events, ...statemachine.attributes];
        const attributes = [...statemachine.attributes];
        const initialStateName = statemachine.init?.ref?.name;

        if (!this.initialStateExists(statemachine, initialStateName)) {
            accept('error', 'Initial state must be a state in the statemachine.', { node: statemachine, property: 'init' });
        }

        this.addSymbolsToMap(allSymbols, names);
        this.checkForDuplicateNames(names, accept);
        this.updateAndValidateAttributes(attributes, accept);
    }

    initialStateExists(statemachine: Statemachine, initialStateName: string | undefined): boolean {
        return statemachine.states.some(state => state.name === initialStateName);
    }

    addSymbolsToMap(symbols: (State | Event | Attribute)[], map: MultiMap<string, State | Event | Attribute>): void {
        for (const symbol of symbols) {
            if (symbol.name) {
                map.add(symbol.name, symbol);
            }
        }
    }

    checkForDuplicateNames(names: MultiMap<string, State | Event | Attribute>, accept: ValidationAcceptor): void {
        for (const [name, symbols] of names.entriesGroupedByKey()) {
            if (symbols.length > 1) {
                for (const symbol of symbols) {
                    accept('error', `Duplicate identifier name: ${name}`, { node: symbol, property: 'name' });
                }
            }
        }
    }

    updateAndValidateAttributes(attributes: Attribute[], accept: ValidationAcceptor): void {
        for (const attribute of attributes) {
            this.updateAttributeSequence(attribute, attributes);
            this.validateAttributeInitialization(attribute, accept);
        }
    }

    updateAttributeSequence(attribute: Attribute, attributes: Attribute[]): void {
        const idx = attributes.indexOf(attribute);
        attributeNames.splice(idx, 0, attribute.name);
    }

    validateAttributeInitialization(attribute: Attribute, accept: ValidationAcceptor): void {
        if (attribute.defaultValue) {
            try {
                const inferredType = inferType(attribute.defaultValue, env, attribute.name);
                if (inferredType !== attribute.type) {
                    accept('error', `In Statemachine: Attribute initialization: Type mismatch: ${attribute.name} is of type ${attribute.type}, but assigned value is of type ${inferredType}.`, { node: attribute, property: 'defaultValue' });
                }
                const value = evalExpression(attribute.defaultValue, env);
                env.set(attribute.name, value);
            } catch (error) {
                accept('error', `In Statemachine: Attribute initialization: ${(error as Error).message}`, { node: attribute, property: 'defaultValue' });
            }
            // this.checkAssignment(attribute, accept);
        }
        else {
            env.set(attribute.name, undefined);
            // accept('error', `Attribute initialization fdsoaij ${env.get(attribute.name)}`, { node: attribute, property: 'defaultValue' });
        }
        // evalExpression(attribute.defaultValue, env);
    }

    checkAssignment(assignment: Assignment, accept: ValidationAcceptor): void {
        if (assignment.variable && assignment.value) {
            try {
                if (!assignment.variable.ref) {
                    accept('error', `In Assignment: This variable is not declared.`, { node: assignment, property: 'variable' });
                }
                const inferredType = inferType(assignment.value, env);
                if (inferredType !== assignment.variable.ref?.type) {
                    accept('error', `In Assignment: Type mismatch: ${assignment.variable.ref?.name} is of type ${assignment.variable.ref?.type}, but assigned value is of type ${inferredType}.`, { node: assignment, property: 'value' });
                }
            } catch (error) {
                accept('error', `In Assignment: ${(error as Error).message}`, { node: assignment, property: 'value' });
            }
        }
    }

    // checkExpression(expression: Expression, accept: ValidationAcceptor): void {
    //     try {
    //         inferType(expression, env);
    //     } catch (error) {
    //         accept('error', `In Expression: ${(error as Error).message}`, { node: expression, property: 'value' });
    //     }
    // }

    checkPrintStatement(printStatement: PrintStatement, accept: ValidationAcceptor): void {
        for (const value of printStatement.values) {
            if (!isStringLiteral(value)) {
                try {
                    inferType(value, env);
                } catch (error) {
                    accept('error', `In PrintStatement Node: ${(error as Error).message}`, { node: value });
                }
            }
        }
    }

    checkTransition(transition: Transition, accept: ValidationAcceptor): void {
        if (transition.guard) {
            try {
                if (inferType(transition.guard, env) !== 'bool') {
                    accept('error', 'In Transition: Guard condition must be of type bool.', { node: transition.guard });
                }
            } catch (error) {
                accept('error', `In Transition: ${(error as Error).message}`, { node: transition.guard });
            }
        }
    }
}