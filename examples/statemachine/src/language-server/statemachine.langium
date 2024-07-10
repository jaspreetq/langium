grammar Statemachine

entry Statemachine:
    'statemachine' name=ID
    ('events' events+=Event+)?
    ('commands'    commands+=Command+)?
    ('attributes' attributes+=Attribute+)?
    'initialState' init=[State]
    states+=State*;

Event:
    name=ID;

Command:
    name=ID;

State:
    'state' name=ID
        ('actions' '{' actions+=Action+ '}')?
        transitions+=Transition*
    'end';

Transition:
    event=[Event:ID] ('when' guard=Expr)? '=>' state=[State] ('with' actions+=Action+)?;

// yet to include LessThan | GreaterThan | Equal | NotEqual | And | Or | Not | 
// GuardCondition: 
//     expression= '(' GuardCondition ')';

Action:
    assignment=Assignment | print=PrintStatement;

PrintStatement:     
    'print' '(' value=( Expr) ')';

Assignment:
    variable=[Attribute] '=' expression=Expr;

Attribute:
    name=ID ('=' defaultValue=Expr)? ; //expression

// Expressions
Expr: Or; 

Or infers Expr:
    And ({infer BinExpr.e1=current} op='||' e2=And)*;

And infers Expr:
    Equality ({infer BinExpr.e1=current} op='&&' e2=Equality)*;

Equality infers Expr:
    Comparison ({infer BinExpr.e1=current} op=('==' | '!=') e2=Comparison)*;

Comparison infers Expr:
    Add ({infer BinExpr.e1=current} op=('<' | '>' | '<=' | '>=') e2=Add)*;

Add  infers Expr: 
    Mult     ({infer BinExpr.e1=current} op=('+'|'-') e2=Mult)*;
Mult infers Expr: 
    PrimExpr ({infer BinExpr.e1=current} op=('*'|'/') e2=PrimExpr)*;

PrimExpr: Lit | Ref | Group | NegExpr;

Lit:        val=NUMBER;
Ref:        val=[Attribute:ID];
Group:      '(' ge=Expr ')';    
NegExpr:    '-' ne=Expr;

hidden terminal WS: /\s+/;
terminal BoolExpr returns boolean: 'true' | 'false';
terminal ID: /[_a-zA-Z][\w_]*/;
terminal NUMBER returns number: /[0-9]+(\.[0-9]*)?/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;