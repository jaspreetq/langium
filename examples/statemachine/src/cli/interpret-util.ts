import { Attribute, Statemachine } from "../language-server/generated/ast.js";

export function defaultAttributeValue(attribute: Attribute): number | boolean {
    return attribute.type == 'bool' ? false : 0;
}

export function eventsAreValid(model: Statemachine, eventNames: string[]): boolean {
    const validEventNames = model.events.map(event => event.name);
    const invalidEvents = eventNames.filter(eventName => !validEventNames.includes(eventName));

    if (invalidEvents.length > 0) {
        return false;
    }
    return true;
}
