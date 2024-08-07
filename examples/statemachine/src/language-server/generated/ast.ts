/******************************************************************************
 * This file was generated by langium-cli 3.1.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

/* eslint-disable */
import type { AstNode, Reference, ReferenceInfo, TypeMetaData } from 'langium';
import { AbstractAstReflection } from 'langium';

export const StatemachineTerminals = {
    WS: /\s+/,
    TYPE: /(int|bool)/,
    BOOL_VALUE: /(true|false)/,
    ID: /[_a-zA-Z][\w_]*/,
    NUMBER: /(?:(?:-?[0-9]+)?\.[0-9]+)|-?[0-9]+/,
    STRING: /"([^"\\]|\\.)*"/,
    ML_COMMENT: /\/\*[\s\S]*?\*\//,
    SL_COMMENT: /\/\/[^\n\r]*/,
};

export type Expression = BinExpr | PrimaryExpr;

export const Expression = 'Expression';

export function isExpression(item: unknown): item is Expression {
    return reflection.isInstance(item, Expression);
}

export type NegExpr = NegBoolExpr | NegIntExpr;

export const NegExpr = 'NegExpr';

export function isNegExpr(item: unknown): item is NegExpr {
    return reflection.isInstance(item, NegExpr);
}

export type PrimaryExpr = Group | Literal | NegExpr | Ref;

export const PrimaryExpr = 'PrimaryExpr';

export function isPrimaryExpr(item: unknown): item is PrimaryExpr {
    return reflection.isInstance(item, PrimaryExpr);
}

export type PrintValue = Expression | StringLiteral;

export const PrintValue = 'PrintValue';

export function isPrintValue(item: unknown): item is PrintValue {
    return reflection.isInstance(item, PrintValue);
}

export interface Action extends AstNode {
    readonly $container: State | Transition;
    readonly $type: 'Action';
    assignment?: Assignment;
    command?: Reference<Command>;
    print?: PrintStatement;
}

export const Action = 'Action';

export function isAction(item: unknown): item is Action {
    return reflection.isInstance(item, Action);
}

export interface Assignment extends AstNode {
    readonly $container: Action;
    readonly $type: 'Assignment';
    value: Expression;
    variable: Reference<Attribute>;
}

export const Assignment = 'Assignment';

export function isAssignment(item: unknown): item is Assignment {
    return reflection.isInstance(item, Assignment);
}

export interface Attribute extends AstNode {
    readonly $container: Statemachine;
    readonly $type: 'Attribute';
    defaultValue?: Expression;
    name: string;
    type: string;
}

export const Attribute = 'Attribute';

export function isAttribute(item: unknown): item is Attribute {
    return reflection.isInstance(item, Attribute);
}

export interface BinExpr extends AstNode {
    readonly $container: Assignment | Attribute | BinExpr | Group | NegBoolExpr | NegIntExpr | PrintStatement | Transition;
    readonly $type: 'BinExpr';
    e1: Expression | PrimaryExpr;
    e2: Expression | PrimaryExpr;
    op: '!=' | '&&' | '*' | '+' | '-' | '/' | '<' | '<=' | '==' | '>' | '>=' | '||';
}

export const BinExpr = 'BinExpr';

export function isBinExpr(item: unknown): item is BinExpr {
    return reflection.isInstance(item, BinExpr);
}

export interface Command extends AstNode {
    readonly $container: Statemachine;
    readonly $type: 'Command';
    name: string;
}

export const Command = 'Command';

export function isCommand(item: unknown): item is Command {
    return reflection.isInstance(item, Command);
}

export interface Event extends AstNode {
    readonly $container: Statemachine;
    readonly $type: 'Event';
    name: string;
}

export const Event = 'Event';

export function isEvent(item: unknown): item is Event {
    return reflection.isInstance(item, Event);
}

export interface Group extends AstNode {
    readonly $container: Assignment | Attribute | BinExpr | Group | NegBoolExpr | NegIntExpr | PrintStatement | Transition;
    readonly $type: 'Group';
    ge: Expression;
}

export const Group = 'Group';

export function isGroup(item: unknown): item is Group {
    return reflection.isInstance(item, Group);
}

export interface Literal extends AstNode {
    readonly $container: Assignment | Attribute | BinExpr | Group | NegBoolExpr | NegIntExpr | PrintStatement | Transition;
    readonly $type: 'Literal';
    val: boolean | number;
}

export const Literal = 'Literal';

export function isLiteral(item: unknown): item is Literal {
    return reflection.isInstance(item, Literal);
}

export interface NegBoolExpr extends AstNode {
    readonly $container: Assignment | Attribute | BinExpr | Group | NegBoolExpr | NegIntExpr | PrintStatement | Transition;
    readonly $type: 'NegBoolExpr';
    ne: Expression;
}

export const NegBoolExpr = 'NegBoolExpr';

export function isNegBoolExpr(item: unknown): item is NegBoolExpr {
    return reflection.isInstance(item, NegBoolExpr);
}

export interface NegIntExpr extends AstNode {
    readonly $container: Assignment | Attribute | BinExpr | Group | NegBoolExpr | NegIntExpr | PrintStatement | Transition;
    readonly $type: 'NegIntExpr';
    ne: Expression;
}

export const NegIntExpr = 'NegIntExpr';

export function isNegIntExpr(item: unknown): item is NegIntExpr {
    return reflection.isInstance(item, NegIntExpr);
}

export interface PrintStatement extends AstNode {
    readonly $container: Action;
    readonly $type: 'PrintStatement';
    values: Array<PrintValue>;
}

export const PrintStatement = 'PrintStatement';

export function isPrintStatement(item: unknown): item is PrintStatement {
    return reflection.isInstance(item, PrintStatement);
}

export interface Ref extends AstNode {
    readonly $container: Assignment | Attribute | BinExpr | Group | NegBoolExpr | NegIntExpr | PrintStatement | Transition;
    readonly $type: 'Ref';
    val: Reference<Attribute>;
}

export const Ref = 'Ref';

export function isRef(item: unknown): item is Ref {
    return reflection.isInstance(item, Ref);
}

export interface State extends AstNode {
    readonly $container: Statemachine;
    readonly $type: 'State';
    actions: Array<Action>;
    name: string;
    transitions: Array<Transition>;
}

export const State = 'State';

export function isState(item: unknown): item is State {
    return reflection.isInstance(item, State);
}

export interface Statemachine extends AstNode {
    readonly $type: 'Statemachine';
    attributes: Array<Attribute>;
    commands: Array<Command>;
    events: Array<Event>;
    init: Reference<State>;
    name: string;
    states: Array<State>;
}

export const Statemachine = 'Statemachine';

export function isStatemachine(item: unknown): item is Statemachine {
    return reflection.isInstance(item, Statemachine);
}

export interface StringLiteral extends AstNode {
    readonly $container: PrintStatement;
    readonly $type: 'StringLiteral';
    value: string;
}

export const StringLiteral = 'StringLiteral';

export function isStringLiteral(item: unknown): item is StringLiteral {
    return reflection.isInstance(item, StringLiteral);
}

export interface Transition extends AstNode {
    readonly $container: State;
    readonly $type: 'Transition';
    actions: Array<Action>;
    event: Reference<Event>;
    guard?: Expression;
    state: Reference<State>;
}

export const Transition = 'Transition';

export function isTransition(item: unknown): item is Transition {
    return reflection.isInstance(item, Transition);
}

export type StatemachineAstType = {
    Action: Action
    Assignment: Assignment
    Attribute: Attribute
    BinExpr: BinExpr
    Command: Command
    Event: Event
    Expression: Expression
    Group: Group
    Literal: Literal
    NegBoolExpr: NegBoolExpr
    NegExpr: NegExpr
    NegIntExpr: NegIntExpr
    PrimaryExpr: PrimaryExpr
    PrintStatement: PrintStatement
    PrintValue: PrintValue
    Ref: Ref
    State: State
    Statemachine: Statemachine
    StringLiteral: StringLiteral
    Transition: Transition
}

export class StatemachineAstReflection extends AbstractAstReflection {

    getAllTypes(): string[] {
        return [Action, Assignment, Attribute, BinExpr, Command, Event, Expression, Group, Literal, NegBoolExpr, NegExpr, NegIntExpr, PrimaryExpr, PrintStatement, PrintValue, Ref, State, Statemachine, StringLiteral, Transition];
    }

    protected override computeIsSubtype(subtype: string, supertype: string): boolean {
        switch (subtype) {
            case BinExpr:
            case PrimaryExpr: {
                return this.isSubtype(Expression, supertype);
            }
            case Expression:
            case StringLiteral: {
                return this.isSubtype(PrintValue, supertype);
            }
            case Group:
            case Literal:
            case NegExpr:
            case Ref: {
                return this.isSubtype(PrimaryExpr, supertype);
            }
            case NegBoolExpr:
            case NegIntExpr: {
                return this.isSubtype(NegExpr, supertype);
            }
            default: {
                return false;
            }
        }
    }

    getReferenceType(refInfo: ReferenceInfo): string {
        const referenceId = `${refInfo.container.$type}:${refInfo.property}`;
        switch (referenceId) {
            case 'Action:command': {
                return Command;
            }
            case 'Assignment:variable':
            case 'Ref:val': {
                return Attribute;
            }
            case 'Statemachine:init':
            case 'Transition:state': {
                return State;
            }
            case 'Transition:event': {
                return Event;
            }
            default: {
                throw new Error(`${referenceId} is not a valid reference id.`);
            }
        }
    }

    getTypeMetaData(type: string): TypeMetaData {
        switch (type) {
            case Action: {
                return {
                    name: Action,
                    properties: [
                        { name: 'assignment' },
                        { name: 'command' },
                        { name: 'print' }
                    ]
                };
            }
            case Assignment: {
                return {
                    name: Assignment,
                    properties: [
                        { name: 'value' },
                        { name: 'variable' }
                    ]
                };
            }
            case Attribute: {
                return {
                    name: Attribute,
                    properties: [
                        { name: 'defaultValue' },
                        { name: 'name' },
                        { name: 'type' }
                    ]
                };
            }
            case BinExpr: {
                return {
                    name: BinExpr,
                    properties: [
                        { name: 'e1' },
                        { name: 'e2' },
                        { name: 'op' }
                    ]
                };
            }
            case Command: {
                return {
                    name: Command,
                    properties: [
                        { name: 'name' }
                    ]
                };
            }
            case Event: {
                return {
                    name: Event,
                    properties: [
                        { name: 'name' }
                    ]
                };
            }
            case Group: {
                return {
                    name: Group,
                    properties: [
                        { name: 'ge' }
                    ]
                };
            }
            case Literal: {
                return {
                    name: Literal,
                    properties: [
                        { name: 'val', defaultValue: false }
                    ]
                };
            }
            case NegBoolExpr: {
                return {
                    name: NegBoolExpr,
                    properties: [
                        { name: 'ne' }
                    ]
                };
            }
            case NegIntExpr: {
                return {
                    name: NegIntExpr,
                    properties: [
                        { name: 'ne' }
                    ]
                };
            }
            case PrintStatement: {
                return {
                    name: PrintStatement,
                    properties: [
                        { name: 'values', defaultValue: [] }
                    ]
                };
            }
            case Ref: {
                return {
                    name: Ref,
                    properties: [
                        { name: 'val' }
                    ]
                };
            }
            case State: {
                return {
                    name: State,
                    properties: [
                        { name: 'actions', defaultValue: [] },
                        { name: 'name' },
                        { name: 'transitions', defaultValue: [] }
                    ]
                };
            }
            case Statemachine: {
                return {
                    name: Statemachine,
                    properties: [
                        { name: 'attributes', defaultValue: [] },
                        { name: 'commands', defaultValue: [] },
                        { name: 'events', defaultValue: [] },
                        { name: 'init' },
                        { name: 'name' },
                        { name: 'states', defaultValue: [] }
                    ]
                };
            }
            case StringLiteral: {
                return {
                    name: StringLiteral,
                    properties: [
                        { name: 'value' }
                    ]
                };
            }
            case Transition: {
                return {
                    name: Transition,
                    properties: [
                        { name: 'actions', defaultValue: [] },
                        { name: 'event' },
                        { name: 'guard' },
                        { name: 'state' }
                    ]
                };
            }
            default: {
                return {
                    name: type,
                    properties: []
                };
            }
        }
    }
}

export const reflection = new StatemachineAstReflection();
