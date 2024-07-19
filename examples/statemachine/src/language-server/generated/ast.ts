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
    NUMBER: /[0-9]+(\.[0-9]*)?/,
    ML_COMMENT: /\/\*[\s\S]*?\*\//,
    SL_COMMENT: /\/\/[^\n\r]*/,
};

export type BooleanPrimExpr = BoolGroup | BoolLit | BoolRef | Expr;

export const BooleanPrimExpr = 'BooleanPrimExpr';

export function isBooleanPrimExpr(item: unknown): item is BooleanPrimExpr {
    return reflection.isInstance(item, BooleanPrimExpr);
}

export type BoolExpr = BinExpr | BooleanPrimExpr;

export const BoolExpr = 'BoolExpr';

export function isBoolExpr(item: unknown): item is BoolExpr {
    return reflection.isInstance(item, BoolExpr);
}

export type Expr = BinExpr | PrimExpr;

export const Expr = 'Expr';

export function isExpr(item: unknown): item is Expr {
    return reflection.isInstance(item, Expr);
}

export type PrimExpr = Group | Lit | NegExpr | Ref;

export const PrimExpr = 'PrimExpr';

export function isPrimExpr(item: unknown): item is PrimExpr {
    return reflection.isInstance(item, PrimExpr);
}

export interface Action extends AstNode {
    readonly $container: State | Transition;
    readonly $type: 'Action';
    assignment?: Assignment;
    print?: PrintStatement;
}

export const Action = 'Action';

export function isAction(item: unknown): item is Action {
    return reflection.isInstance(item, Action);
}

export interface Assignment extends AstNode {
    readonly $container: Action | Statemachine;
    readonly $type: 'Assignment' | 'BinExpr' | 'Expr' | 'Group' | 'Lit' | 'NegExpr' | 'PrimExpr' | 'Ref';
    value: BoolExpr;
    variable: Reference<Attribute>;
}

export const Assignment = 'Assignment';

export function isAssignment(item: unknown): item is Assignment {
    return reflection.isInstance(item, Assignment);
}

export interface Attribute extends AstNode {
    readonly $container: Statemachine;
    readonly $type: 'Attribute' | 'BinExpr' | 'Expr' | 'Group' | 'Lit' | 'NegExpr' | 'PrimExpr' | 'Ref';
    defaultValue?: BoolExpr;
    name: string;
    type: string;
}

export const Attribute = 'Attribute';

export function isAttribute(item: unknown): item is Attribute {
    return reflection.isInstance(item, Attribute);
}

export interface BinExpr extends AstNode {
    readonly $container: Assignment | Attribute | BinExpr | BoolGroup | Group | NegExpr | PrintStatement | Transition;
    readonly $type: 'BinExpr';
    e1: BoolExpr | BooleanPrimExpr | Expr | PrimExpr;
    e2: BoolExpr | BooleanPrimExpr | Expr | PrimExpr;
    op: '!=' | '&&' | '*' | '+' | '-' | '/' | '<' | '<=' | '==' | '>' | '>=' | '||';
}

export const BinExpr = 'BinExpr';

export function isBinExpr(item: unknown): item is BinExpr {
    return reflection.isInstance(item, BinExpr);
}

export interface BoolGroup extends AstNode {
    readonly $container: Assignment | Attribute | BinExpr | BoolGroup | PrintStatement | Transition;
    readonly $type: 'BoolGroup';
    gbe: BoolExpr;
}

export const BoolGroup = 'BoolGroup';

export function isBoolGroup(item: unknown): item is BoolGroup {
    return reflection.isInstance(item, BoolGroup);
}

export interface BoolLit extends AstNode {
    readonly $container: Assignment | Attribute | BinExpr | BoolGroup | PrintStatement | Transition;
    readonly $type: 'BoolLit';
    val: boolean;
}

export const BoolLit = 'BoolLit';

export function isBoolLit(item: unknown): item is BoolLit {
    return reflection.isInstance(item, BoolLit);
}

export interface BoolRef extends AstNode {
    readonly $container: Assignment | Attribute | BinExpr | BoolGroup | PrintStatement | Transition;
    readonly $type: 'BoolRef';
    val: Reference<Attribute>;
}

export const BoolRef = 'BoolRef';

export function isBoolRef(item: unknown): item is BoolRef {
    return reflection.isInstance(item, BoolRef);
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
    readonly $container: Assignment | Attribute | BinExpr | BoolGroup | Group | NegExpr | PrintStatement | Transition;
    readonly $type: 'Group';
    ge: Expr;
}

export const Group = 'Group';

export function isGroup(item: unknown): item is Group {
    return reflection.isInstance(item, Group);
}

export interface Lit extends AstNode {
    readonly $container: Assignment | Attribute | BinExpr | BoolGroup | Group | NegExpr | PrintStatement | Transition;
    readonly $type: 'Lit';
    val: number;
}

export const Lit = 'Lit';

export function isLit(item: unknown): item is Lit {
    return reflection.isInstance(item, Lit);
}

export interface NegExpr extends AstNode {
    readonly $container: Assignment | Attribute | BinExpr | BoolGroup | Group | NegExpr | PrintStatement | Transition;
    readonly $type: 'NegExpr';
    ne: Expr;
}

export const NegExpr = 'NegExpr';

export function isNegExpr(item: unknown): item is NegExpr {
    return reflection.isInstance(item, NegExpr);
}

export interface PrintStatement extends AstNode {
    readonly $container: Action;
    readonly $type: 'PrintStatement';
    value: BoolExpr | Expr;
}

export const PrintStatement = 'PrintStatement';

export function isPrintStatement(item: unknown): item is PrintStatement {
    return reflection.isInstance(item, PrintStatement);
}

export interface Ref extends AstNode {
    readonly $container: Assignment | Attribute | BinExpr | BoolGroup | Group | NegExpr | PrintStatement | Transition;
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
    Assignments: Array<Assignment>;
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

export interface Transition extends AstNode {
    readonly $container: State;
    readonly $type: 'Transition';
    actions: Array<Action>;
    event: Reference<Event>;
    guard?: BoolExpr;
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
    BoolExpr: BoolExpr
    BoolGroup: BoolGroup
    BoolLit: BoolLit
    BoolRef: BoolRef
    BooleanPrimExpr: BooleanPrimExpr
    Command: Command
    Event: Event
    Expr: Expr
    Group: Group
    Lit: Lit
    NegExpr: NegExpr
    PrimExpr: PrimExpr
    PrintStatement: PrintStatement
    Ref: Ref
    State: State
    Statemachine: Statemachine
    Transition: Transition
}

export class StatemachineAstReflection extends AbstractAstReflection {

    getAllTypes(): string[] {
        return [Action, Assignment, Attribute, BinExpr, BoolExpr, BoolGroup, BoolLit, BoolRef, BooleanPrimExpr, Command, Event, Expr, Group, Lit, NegExpr, PrimExpr, PrintStatement, Ref, State, Statemachine, Transition];
    }

    protected override computeIsSubtype(subtype: string, supertype: string): boolean {
        switch (subtype) {
            case BinExpr: {
                return this.isSubtype(BoolExpr, supertype) || this.isSubtype(Expr, supertype);
            }
            case BooleanPrimExpr: {
                return this.isSubtype(BoolExpr, supertype);
            }
            case BoolGroup:
            case BoolLit:
            case BoolRef: {
                return this.isSubtype(BooleanPrimExpr, supertype);
            }
            case Expr: {
                return this.isSubtype(Assignment, supertype) || this.isSubtype(Attribute, supertype) || this.isSubtype(BooleanPrimExpr, supertype);
            }
            case Group:
            case Lit:
            case NegExpr:
            case Ref: {
                return this.isSubtype(PrimExpr, supertype);
            }
            case PrimExpr: {
                return this.isSubtype(Expr, supertype);
            }
            default: {
                return false;
            }
        }
    }

    getReferenceType(refInfo: ReferenceInfo): string {
        const referenceId = `${refInfo.container.$type}:${refInfo.property}`;
        switch (referenceId) {
            case 'Assignment:variable':
            case 'BoolRef:val':
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
            case BoolGroup: {
                return {
                    name: BoolGroup,
                    properties: [
                        { name: 'gbe' }
                    ]
                };
            }
            case BoolLit: {
                return {
                    name: BoolLit,
                    properties: [
                        { name: 'val', defaultValue: false }
                    ]
                };
            }
            case BoolRef: {
                return {
                    name: BoolRef,
                    properties: [
                        { name: 'val' }
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
            case Lit: {
                return {
                    name: Lit,
                    properties: [
                        { name: 'val' }
                    ]
                };
            }
            case NegExpr: {
                return {
                    name: NegExpr,
                    properties: [
                        { name: 'ne' }
                    ]
                };
            }
            case PrintStatement: {
                return {
                    name: PrintStatement,
                    properties: [
                        { name: 'value' }
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
                        { name: 'Assignments', defaultValue: [] },
                        { name: 'attributes', defaultValue: [] },
                        { name: 'commands', defaultValue: [] },
                        { name: 'events', defaultValue: [] },
                        { name: 'init' },
                        { name: 'name' },
                        { name: 'states', defaultValue: [] }
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
