const BoundUnaryOperatorKind = {
    identity: 'identity',
    negation: 'negation',

    logicalNegation: 'logicalNegation',
}

const BoundBinaryOperatorKind = {
    plus: 'plus',
    minus: 'minus',
    multiplication: 'multiplication',
    division: 'division',

    logicalAnd: 'logicalAnd',
    logicalOr: 'logicalOr',

    equals: 'equals',
    unequals: 'unequals',
}

class BoundUnaryOperator
{
    constructor(syntaxKind, boundUnaryOperatorKind, operandType)
    {
        this.syntaxKind = syntaxKind
        this.boundUnaryOperatorKind = boundUnaryOperatorKind
        this.operandType = operandType
        this.resultType = operandType
    }

    static bind(syntaxKind, operandType)
    {
        for (const boundUnaryOperator of BOUND_UNARY_OPERATORS) {
            if (boundUnaryOperator.syntaxKind == syntaxKind && boundUnaryOperator.operandType == operandType) {
                return boundUnaryOperator
            }
        }

        return null
    }
}

const BOUND_UNARY_OPERATORS = [
    new BoundUnaryOperator(SyntaxKind.plus, BoundUnaryOperatorKind.identity, typeof (1)),
    new BoundUnaryOperator(SyntaxKind.minus, BoundUnaryOperatorKind.negation, typeof (1)),

    new BoundUnaryOperator(SyntaxKind.logicalNegation, BoundUnaryOperatorKind.logicalNegation, typeof (true)),
]


class BoundBinaryOperator
{
    constructor(syntaxKind, boundBinaryOperatorKind, leftOperandType, rightOperandType, resultType)
    {
        this.syntaxKind = syntaxKind
        this.boundBinaryOperatorKind = boundBinaryOperatorKind
        this.leftOperandType = leftOperandType
        this.rightOperandType = rightOperandType
        this.resultType = resultType
    }

    static bind(syntaxKind, leftOperandType, rightOperandType)
    {
        for (const boundBinaryOperator of BOUND_BINARY_OPERATORS) {
            if (boundBinaryOperator.syntaxKind == syntaxKind && boundBinaryOperator.leftOperandType == leftOperandType && boundBinaryOperator.rightOperandType == rightOperandType) {
                return boundBinaryOperator
            }
        }

        return null
    }
}

const BOUND_BINARY_OPERATORS = [
    // of numbers
    new BoundBinaryOperator(SyntaxKind.plus, BoundBinaryOperatorKind.plus, typeof (1), typeof (1), typeof(1)),
    new BoundBinaryOperator(SyntaxKind.minus, BoundBinaryOperatorKind.nimus, typeof (1), typeof (1), typeof(1)),
    new BoundBinaryOperator(SyntaxKind.multiplication, BoundBinaryOperatorKind.multiplication, typeof (1), typeof (1), typeof(1)),
    new BoundBinaryOperator(SyntaxKind.division, BoundBinaryOperatorKind.division, typeof (1), typeof (1), typeof(1)),

    new BoundBinaryOperator(SyntaxKind.equals, BoundBinaryOperatorKind.equals, typeof (1), typeof(1), typeof (true)),
    new BoundBinaryOperator(SyntaxKind.unequals, BoundBinaryOperatorKind.unequals, typeof (1), typeof(1), typeof (true)),

    // of booleans
    new BoundBinaryOperator(SyntaxKind.logicalAnd, BoundBinaryOperatorKind.logicalAnd, typeof (true), typeof (true), typeof (true)),
    new BoundBinaryOperator(SyntaxKind.logicalOr, BoundBinaryOperatorKind.logicalOr, typeof (true), typeof (true), typeof (true)),

    new BoundBinaryOperator(SyntaxKind.equals, BoundBinaryOperatorKind.equals, typeof (true), typeof (true), typeof (true)),
    new BoundBinaryOperator(SyntaxKind.unequals, BoundBinaryOperatorKind.unequals, typeof (true), typeof (true), typeof (true)),
]


class Binder
{
    constructor(variables)
    {
        this.variables = variables
        this.diagnosticBag = new DiagnosticBag()
    }

    bindExpression(expressionSyntax)
    {
        switch (expressionSyntax.kind) {
            case SyntaxKind.literalExpression:
                return this.bindLiteralExpression(expressionSyntax)

            case SyntaxKind.nameExpression:
                return this.bindNameExpression(expressionSyntax)

            case SyntaxKind.assignmentExpression:
                return this.bindAssignmentExpression(expressionSyntax)

            case SyntaxKind.unaryExpression:
                return this.bindUnaryExpression(expressionSyntax)

            case SyntaxKind.binaryExpression:
                return this.bindBinaryExpression(expressionSyntax)

            case SyntaxKind.parenthesizedExpression:
                return this.bindParenthesizedExpression(expressionSyntax)

            default:
                throw new Error(`unexpected expression syntax ${expressionSyntax.kind}`)
        }
    }

    // 1) number
    // 2) boolean
    bindLiteralExpression(expressionSyntax)
    {
        let value = expressionSyntax.literalToken.value

        return new BoundLiteralExpression(value)
    }

    bindNameExpression(expressionSyntax) {
        const name = expressionSyntax.identifierToken.text

        if (!(name in this.variables)) {
            const textSpan = expressionSyntax.identifierToken.textSpan
            this.diagnosticBag.reportUndefinedName(textSpan, name)

            return new BoundLiteralExpression(0)
        } else {
            const value = this.variables[name]
            const type = typeof(value)

            return new BoundNameExpression(name, type)
        }
    }

    bindAssignmentExpression(expressionSyntax) {
        const name = expressionSyntax.identifierToken.text
        const boundExpression = this.bindExpression(expressionSyntax.expressionSyntax)

        const defaultValue = boundExpression.resultType == typeof(1)
            ? 0
            : boundExpression.resultType == typeof(true)
                ? false
                : null

        if (defaultValue == null) {
            throw new Error(`Unsupported variable type: ${boundExpression.Type}`)
        }

        this.variables[name] = defaultValue

        return new BoundAssignmentExpression(name, boundExpression)
    }

    bindUnaryExpression(expressionSyntax)
    {
        const boundOperandExpression = this.bindExpression(expressionSyntax.operandExpression)
        const boundOperandExpressionResultType = boundOperandExpression.resultType
        const boundOperator = BoundUnaryOperator.bind(expressionSyntax.operatorToken.kind, boundOperandExpressionResultType)

        if (boundOperator == null) {
            const textSpan = expressionSyntax.operatorToken.textSpan
            const text = expressionSyntax.operatorToken.text

            this.diagnosticBag.reportUndefinedUnaryOperator(textSpan, text, boundOperandExpressionResultType)

            return boundOperandExpression
        }

        return new BoundUnaryExpression(boundOperator, boundOperandExpression)
    }


    bindBinaryExpression(expressionSyntax)
    {
        const boundLeftExpression = this.bindExpression(expressionSyntax.leftExpression)
        const boundLeftExpressionResultType = boundLeftExpression.resultType

        const boundRightExpression = this.bindExpression(expressionSyntax.rightExpression)
        const boundRightExpressionResultType = boundRightExpression.resultType

        const boundOperator = BoundBinaryOperator.bind(expressionSyntax.operatorToken.kind, boundLeftExpressionResultType, boundRightExpressionResultType)

        if (boundOperator == null) {
            const textSpan = expressionSyntax.operatorToken.textSpan
            const text = expressionSyntax.operatorToken.text

            this.diagnosticBag.reportUndefinedBinaryOperator(textSpan, text, boundLeftExpressionResultType, boundRightExpressionResultType)

            return boundLeftExpression
        }

        return new BoundBinaryExpression(boundLeftExpression, boundOperator, boundRightExpression)
    }

    bindParenthesizedExpression(expressionSyntax) {
        return this.bindExpression(expressionSyntax.expression)
    }
}

class BoundNode
{
    constructor() { }
}

const BoundNodeKind = {
    literalExpression: 'boundLiteralExpression',
    nameExpression: 'boundNameExpression',
    assignmentExpression: 'boundAssignmentExpression',
    unaryExpression: 'boundUunaryExpression',
    binaryExpression: 'boundBinaryExpression',
}

class BoundExpression extends BoundNode
{
    constructor() { super() }
}

class BoundLiteralExpression extends BoundExpression
{
    constructor(value)
    {
        super()

        this.value = value

        this.kind = BoundNodeKind.literalExpression
        this.resultType = typeof (value)
    }
}

class BoundNameExpression {
    constructor(name, resultType) {
        this.name = name;

        this.kind = BoundNodeKind.nameExpression
        this.resultType = resultType;
    }
}

class BoundAssignmentExpression extends BoundExpression
{
    constructor(name, boundExpression)
    {
        super()

        this.name = name
        this.boundExpression = boundExpression

        this.kind = BoundNodeKind.assignmentExpression
        this.resultType = boundExpression.resultType
    }
}

class BoundUnaryExpression extends BoundExpression
{
    constructor(boundUnaryOperator, boundOperandExpression)
    {
        super()

        this.boundUnaryOperator = boundUnaryOperator
        this.boundOperandExpression = boundOperandExpression

        this.kind = BoundNodeKind.unaryExpression
        this.resultType = boundUnaryOperator.resultType
    }
}

class BoundBinaryExpression extends BoundExpression
{
    constructor(boundLeftExpression, boundBinaryOperator, boundRightExpression)
    {
        super()

        this.boundLeftExpression = boundLeftExpression
        this.boundBinaryOperator = boundBinaryOperator
        this.boundRightExpression = boundRightExpression

        this.kind = BoundNodeKind.binaryExpression
        this.resultType = boundBinaryOperator.resultType
    }
}