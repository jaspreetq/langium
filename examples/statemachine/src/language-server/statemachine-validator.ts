/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import type { ValidationAcceptor, ValidationChecks } from 'langium';
import { type State, type Statemachine, type StatemachineAstType, type Event, type Attribute, isExpr, isBoolExpr, BoolLit } from './generated/ast.js';
import type { StatemachineServices } from './statemachine-module.js';
import { MultiMap } from 'langium';

export function registerValidationChecks(services: StatemachineServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.StatemachineValidator;
    const checks: ValidationChecks<StatemachineAstType> = {
        State: validator.checkStateNameStartsWithCapital,
        Statemachine: validator.checkUniqueStatesEventsAndAttributes
        // Attribute: validator.checkAttributeType,
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
        // check for duplicate state and event names and add them to the map
        const names = new MultiMap<string, State | Event | Attribute>();
        const allSymbols = [...statemachine.states, ...statemachine.events, ...statemachine.attributes];
        for (const symbol of allSymbols) {
            if (symbol.name) {
                names.add(symbol.name, symbol);
            }
        }
        for (const [name, symbols] of names.entriesGroupedByKey()) {
            if (symbols.length > 1) {
                for (const symbol of symbols) {
                    accept('error', `Duplicate identifier name: ${name}`, { node: symbol, property: 'name' });
                }
            }
        }
    }

    checkAttributeType(attribute: Attribute, accept: ValidationAcceptor): void {
        if (attribute.type) {
            const type = attribute.type;
            if (type !== 'int' && type !== 'bool') {
                accept('error', `Unsupported attribute type: ${type}`, { node: attribute, property: 'type' });
            } else if (type === 'int') {
                if (!isExpr(attribute.defaultValue)) {
                    accept('error', `Attribute value does not match the type: ${attribute.defaultValue?.$type}`, { node: attribute, property: 'defaultValue' });
                }
            } else {
                if (isExpr(attribute.defaultValue)) {
                    accept('error', `Attribute value does not match the type: ${attribute.defaultValue?.$type}`, { node: attribute, property: 'defaultValue' });
                }
            }
        }

    }

    checkAttributeTypeConsistency(attribute: Attribute, accept: ValidationAcceptor): void {
        if (attribute) {
            const type = attribute.type;
            const defaultValue = attribute.defaultValue;
            const isBooleanValue = isBoolExpr(defaultValue);
            const isNumberValue = isExpr(defaultValue);

            if (type === 'bool' && !isBooleanValue) {
                accept('error', 'The default value must be a boolean.', { node: attribute, property: 'defaultValue' });
            } else if (type === 'int' && !isNumberValue) {
                accept('error', 'The default value must be a number.', { node: attribute, property: 'defaultValue' });
            }
        }
    }
    matchAttributeTypeWithValues(attribute: Attribute, accept: ValidationAcceptor): void {
        if (attribute.type) {
            const type = attribute.type;
            if (type === 'int') {
                if (attribute.defaultValue && isNaN(+attribute.defaultValue)) {
                    accept('error', `Attribute value does not match the type: ${attribute.defaultValue}`, { node: attribute, property: 'defaultValue' });
                }
            } else if (type === 'boolean') {
                if (attribute.defaultValue?.$type !== BoolLit) {
                    accept('error', `Attribute value does not match the type: ${attribute.defaultValue}`, { node: attribute, property: 'defaultValue' });
                }
            }
        }
    }
}
