// import { StatemachineAstReflection } from './generated/ast';
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import type { ValidationAcceptor, ValidationChecks } from 'langium';
import { type State, type Statemachine, type StatemachineAstType, type Event, type Attribute, Assignment, Expression, PrintStatement, isStringLiteral, Transition } from './generated/ast.js';
import type { StatemachineServices } from './statemachine-module.js';
import { MultiMap } from 'langium';
import { getDefaultAttributeValue, evalExpression, inferType } from '../cli/interpret-util.js';
import { attributeNames, env } from '../cli/interpreter.js';

// let previousAttributes = new MultiMap<string, Attribute>();

export function registerValidationChecks(services: StatemachineServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.StatemachineValidator;
    const checks: ValidationChecks<StatemachineAstType> = {
        State: validator.checkStateNameStartsWithCapital,
        Statemachine: validator.checkUniqueStatesEventsAndAttributes,
        // Attribute: validator.checkAttribute,
        Assignment: validator.checkAssignment,
        Expression: validator.checkExpression,
        PrintStatement: validator.checkPrintStatement,
        Transition: validator.checkTransition,

    };
    registry.register(checks, validator);
}

export class StatemachineValidator {
    /**
     * Checks if the state name starts with a capital letter.
     * @param state the state to check
     * @param accept the acceptor to report errors
     */
    checkStateNameStartsWithCapital(state: State, accept: ValidationAcceptor): void {
        if (state.name) {
            const firstChar = state.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'State name should start with a capital letter.', { node: state, property: 'name' });
            }
        }
    }

    /**
     * Checks if there are duplicate state and event names.
     * @param statemachine the statemachine to check
     * @param accept the acceptor to report errors
     */
    checkUniqueStatesEventsAndAttributes(statemachine: Statemachine, accept: ValidationAcceptor): void {
        const names = new MultiMap<string, State | Event | Attribute>();
        const allSymbols = [...statemachine.states, ...statemachine.events, ...statemachine.attributes];
        const attributes = [...statemachine.attributes];
        const initialStateName = statemachine.init?.ref?.name;
        // const currentAttributes = new MultiMap<string, Attribute>(); 
        const initialStateExists = statemachine.states.some(state => state.name === initialStateName);
        if (!initialStateExists) {
            accept('error', 'Initial state must be a state in the statemachine.', { node: statemachine, property: 'init' });
        }
        // Add all symbols to the MultiMap
        for (const symbol of allSymbols) {
            if (symbol.name) {
                names.add(symbol.name, symbol);
            }
        }

        // Check for duplicates
        for (const [name, symbols] of names.entriesGroupedByKey()) {
            if (symbols.length > 1) {
                for (const symbol of symbols) {
                    accept('error', `Duplicate identifier name: ${name}`, { node: symbol, property: 'name' });
                }
            }
        }

        for (const attribute of attributes) {
            // update attributeNames array 
            const idx = attributes.indexOf(attribute);
            // console.log(' idx : '+ idx)
            attributeNames.splice(idx, 0, attribute.name);
            attributeNames.push(attribute.name);

            //validating initialization attribute expresssions and ensuring refs are in scope  
            if (attribute.defaultValue) 
                try {
                    const inferredType = inferType(attribute.defaultValue, env, attribute.name); // Adjust env as needed
                    if (inferredType !== attribute.type) {
                        accept('error', `Type mismatch: ${attribute.name} is of type ${attribute.type}, ${attribute.defaultValue?.$cstNode}, ${attribute.defaultValue?.$cstNode} but assigned value is of type ${inferredType}.`, { node: attribute, property: 'defaultValue' });
                    }
                    const value = evalExpression(attribute.defaultValue, env) ?? getDefaultAttributeValue(attribute);
                    env.set(attribute.name,value);
                    // console.log('Attribute name:', attribute.name, 'Attribute value:', value);
                } catch (error) {
                    accept('error', ` In Attribute initialization: ${(error as Error).message}`, { node: attribute, property: 'defaultValue' });
                }
            }

        //check for repetetive events in a state i.e. multiple transitions with the same event
        // for (const state of statemachine.states) {
        //     const eventMap = new MultiMap<string, Transition>();
        //     for (const transition of state.transitions) {
        //         if (transition.event.ref) {
        //             eventMap.add(transition.event.ref?.name, transition);
        //         }
        //     }
        //     for (const [eventName, transitions] of eventMap.entriesGroupedByKey()) {
        //         if (transitions.length > 1) {
        //             for (const transition of transitions) {
        //                 accept('error', `Multiple transitions with the same event: ${eventName} in state ${state.name}`, { node: transition, property: 'event' });
        //             }
        //         }
        //     }
        // }
        }
        
    checkAssignment(assignment: Assignment, accept: ValidationAcceptor): void {
        if (assignment.variable && assignment.value) {
            try {
                const inferredType = inferType(assignment.value, env); // Adjust env as needed
                if (inferredType !== assignment.variable.ref?.type) {
                    accept('error', `Type mismatch: ${assignment.variable.ref?.name} is of type ${assignment.variable.ref?.type}, but assigned value is of type ${inferredType}.`, { node: assignment, property: 'value' });
                }
            } catch (error) {
                accept('error', ` In Assignment: ${(error as Error).message}`, { node: assignment, property: 'value' });
            }
        }
    }

    checkExpression(expression: Expression, accept: ValidationAcceptor): void {
        try {
            inferType(expression, env);
        } catch (error) {
            accept('error', ` In Expression: ${(error as Error).message}`, { node: expression, property: 'value' });
        }
    }

    checkPrintStatement(printStatement: PrintStatement, accept: ValidationAcceptor): void {
        for (const value of printStatement.values) {
            if (!isStringLiteral(value)) {  // Only infer type if it's not a StringLiteral
                try {
                    inferType(value, env);
                } catch (error) {
                    accept('error', (error as Error).message, { node: value });
                }
            }
        }
    }

    checkTransition(transition: Transition, accept: ValidationAcceptor): void {
        if (transition.guard) {
            try {
                if(inferType(transition.guard, env) !== 'bool') {
                    accept('error', 'Guard condition must be of type bool.', { node: transition.guard });
                }
            } catch (error) {
                accept('error', (error as Error).message, { node: transition.guard });
            }
        }
    }
    // checkAttribute(attribute: Attribute, accept: ValidationAcceptor): void {
    //     // const model = await extractAstNode<Statemachine>(fileName, StatemachineLanguageMetaData.fileExtensions, services);
    //     // const currentAttributes = new MultiMap<string, Attribute>(); 
        
    //     if (attribute.defaultValue) {
    //         try {
    //             const inferredType = inferType(attribute.defaultValue, env, attribute.name); // Adjust env as needed
    //             if (inferredType !== attribute.type) {
    //                 accept('error', `Type mismatch: ${attribute.name} is of type ${attribute.type}, ${attribute.defaultValue?.$cstNode}, ${attribute.defaultValue?.$cstNode} but assigned value is of type ${inferredType}.`, { node: attribute, property: 'defaultValue' });
    //             }
    //             const value = evalExpression(attribute.defaultValue, env) ?? getDefaultAttributeValue(attribute);
    //             env.set(attribute.name,value);
    //             // console.log('Attribute name:', attribute.name, 'Attribute value:', value);
    //         } catch (error) {
    //             accept('error', ` In Attribute initialization: ${(error as Error).message}`, { node: attribute, property: 'defaultValue' });
    //         }
    //     }
    // }
}

// // Add only attributes to the currentAttributes MultiMap
        // for (const attribute of statemachine.attributes) {
        //     if (attribute.name) {
        //         currentAttributes.add(attribute.name, attribute);
        //     }
        // }
        
        // // Detect new attributes
        // for (const [name, attributes] of currentAttributes.entriesGroupedByKey()) {
        //     if (!previousAttributes.has(name)) {
        //         for (const attribute of attributes) {
        //             const idx = attributes.indexOf(attribute);
        //             console.log(' idx : '+ idx)
        //             attributeNames.splice(idx, 0, attribute.name);
        //             attributeNames.push(attribute.name);
        //         }
        //     }
        // }

        // // Detect removed attributes
        // for (const [name, attributes] of previousAttributes.entriesGroupedByKey()) {
        //     if (!currentAttributes.has(name)) {
        //         for (const attribute of attributes) {
        //             const index = attributeNames.indexOf(attribute.name);
        //             if (index !== -1) {
        //                 attributeNames.splice(index, 1);
        //             }
        //         }
        //     }
        // }

        // Update the previousAttributes to the current state

        
    // }

 


    // checkAttribute(attribute: Attribute, accept: ValidationAcceptor): void {
    //     if (attribute.defaultValue) {
    //         const deferred = new Deferred();
    //         try {
    //             const inferredType = inferType(attribute.defaultValue, env);
    //             if (inferredType !== attribute.type) {
    //                 deferred.promise = deferred.promise.then(() => {
    //                     accept('error', `Type mismatch: ${attribute.name} is of type ${attribute.type}, but assigned value is of type ${inferredType}.`, { node: attribute, property: 'defaultValue' });
    //                 });
    //             }
    //         } catch (error) {
    //             deferred.promise = deferred.promise.then(() => {
    //                 accept('error', (error as Error).message, { node: attribute, property: 'defaultValue' });
    //             });
    //         }
    //         deferred.resolve();
    //     }
    // }
    
// const inferredType = inferType(attribute.defaultValue, env);
            // if (inferredType === '') {
            //     accept('error', 'Could not infer type of attribute.', { node: attribute, property: 'defaultValue' });
            // } else if (inferredType !== attribute.type) {
            //     accept('error', `Type mismatch: ${attribute.name} is of type ${attribute.type}, but assigned value is of type ${inferredType}.`, { node: attribute, property: 'defaultValue' });
            // }

// const inferredType = inferType(assignment.value, env); // Adjust env as needed
// if (inferredType === '') {
//     accept('error', 'Could not infer type of assignment expression.', { node: assignment, property: 'value' });
// } else if (inferredType !== assignment.variable.ref?.type) {
//     accept('error', `Type mismatch: ${assignment.variable.ref?.name} is of type ${assignment.variable.ref?.type}, but assigned value is of type ${inferredType}.`, { node: assignment, property: 'value' });
// }
// }

// }

// checkAttributeType(attribute: Attribute, accept: ValidationAcceptor): void {
//     if(attribute.type && attribute.defaultValue) {
//     try {
//         evalBoolExprWithEnv(attribute.defaultValue, new Map());
//     } catch (error) {
//         console.log(error);
//     }
//     // const type = attribute.type;
//     // if (type !== 'int' && type !== 'bool') {
//     //     accept('error', `Unsupported attribute type: ${type}`, { node: attribute, property: 'type' });
//     // } else if (type === 'int') {
//     //     if (!isLit(attribute.defaultValue) && !isExpr(attribute.defaultValue) && isRef(attribute.defaultValue)) {
//     //         accept('error', `Attribute value does not match the type: ${attribute.defaultValue?.$type}`, { node: attribute, property: 'defaultValue' });
//     //     }
//     // } else {
//     //     if (isExpr(attribute.defaultValue)) {
//     //         accept('error', `Attribute value does not match the type: ${attribute.defaultValue?.$type}`, { node: attribute, property: 'defaultValue' });
//     //     }
//     // }
// }

// }|



// checkAssignment(assignment: Assignment, accept: ValidationAcceptor): void {
//     const expectedType = this.inferType(assignment.variable.ref?.type);
//     const actualType = this.inferType(assignment.value);
//     if (expectedType !== actualType) {
//         accept('error', `Type mismatch in assignment: expected ${expectedType}, got ${actualType}`, { node: assignment, property: 'value' });
//     }
// }

// inferType(expression: BoolExpr | Expr): string {
//     if (isBoolExpr(expression)) {
//         return 'bool';
//     } else if (isExpr(expression)) {
//         return 'int';
//     } else if (isNegExpr(expression)) {
//         return this.inferType(expression.ne);
//     } else if (isRef(expression)) {
//         return expression.type;
//     }
//     return 'unknown';
// }

// checkAttributeTypeConsistency(attribute: Attribute, accept: ValidationAcceptor): void {
//     if (attribute) {
//         const type = attribute.type;
//         const defaultValue = attribute.defaultValue;
//         const isBooleanValue = isBoolExpr(defaultValue);
//         const isNumberValue = isExpr(defaultValue);

//         if (type === 'bool' && !isBooleanValue) {
//             accept('error', 'The default value must be a boolean.', { node: attribute, property: 'defaultValue' });
//         } else if (type === 'int' && !isNumberValue) {
//             accept('error', 'The default value must be a number.', { node: attribute, property: 'defaultValue' });
//         }
//     }
// }
// matchAttributeTypeWithValues(attribute: Attribute, accept: ValidationAcceptor): void {
//     if (attribute.type) {
//         const type = attribute.type;
//         if (type === 'int') {
//             if (attribute.defaultValue && isNaN(+attribute.defaultValue)) {
//                 accept('error', `Attribute value does not match the type: ${attribute.defaultValue}`, { node: attribute, property: 'defaultValue' });
//             }
//         } else if (type === 'boolean') {
//             if (attribute.defaultValue?.$type !== BoolLit) {
//                 accept('error', `Attribute value does not match the type: ${attribute.defaultValue}`, { node: attribute, property: 'defaultValue' });
//             }
//         }
//     }
// }