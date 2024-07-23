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
    event=[Event:ID] ('when' guard=BoolExpr)? '=>' state=[State] ('with' actions+=Action+)? 'end';

Action:
    assignment=Assignment | print=PrintStatement | command=[Command];

PrintStatement:     
    'print' '(' value=(BoolExpr|Expr) ')';

Assignment:
     variable=[Attribute] '=' value=BoolExpr | Expr;

Attribute:
    name=ID ':' type=TYPE ('=' defaultValue=(BoolExpr|Expr))?; // expression
    
// BoolExpr
BoolExpr: Conditional;

Conditional infers BoolExpr:
    Comparison ({infer BinExpr.e1=current} op=('||' | '&&') e2=Comparison)*;

Comparison infers BoolExpr:
    BooleanPrimExpr ({infer BinExpr.e1=current} op=('<=' | '<' | '>=' |  '>' | '==' | '!=') e2=BooleanPrimExpr)*;

BooleanPrimExpr: BoolLit | BoolRef | BoolGroup |Expr;
BoolLit: val=BOOL_VALUE;
BoolRef: val=[Attribute:ID];
BoolGroup: '(' gbe=BoolExpr ')';

// Expressions
Expr: Add; 
Add  infers Expr: 
    Mult     ({infer BinExpr.e1=current} op=('+'|'-') e2=Mult)*;
Mult infers Expr: 
    PrimExpr ({infer BinExpr.e1=current} op=('*'|'/') e2=PrimExpr)*;

PrimExpr: Lit | Ref | Group | NegExpr;

Lit:        val=NUMBER ;
Ref:        val=[Attribute:ID];
Group:      '(' ge=Expr  ')';    
NegExpr:    '-' ne=Expr;

hidden terminal WS: /\s+/;
terminal TYPE returns string: 'int' | 'bool';
terminal BOOL_VALUE returns boolean: 'true' | 'false';
terminal ID: /[_a-zA-Z][\w_]*/;
terminal NUMBER returns number: /[0-9]+(\.[0-9]*)?/;
// terminal STRING returns string: /"([^"\\]|\\.)*"/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;