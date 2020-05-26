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
    constructor(syntaxKind, boundBinaryOperatorKind, operandType, resultType)
    {
        this.syntaxKind = syntaxKind
        this.boundBinaryOperatorKind = boundBinaryOperatorKind
        this.operandType = operandType
        this.resultType = resultType
    }

    static bind(syntaxKind, operandType)
    {
        for (const boundBinaryOperator of BOUND_BINARY_OPERATORS) {
            if (boundBinaryOperator.syntaxKind == syntaxKind && boundBinaryOperator.operandType == operandType) {
                return boundBinaryOperator
            }
        }

        return null
    }
}

const BOUND_BINARY_OPERATORS = [
    // of numbers
    new BoundBinaryOperator(SyntaxKind.plus, BoundBinaryOperatorKind.plus, typeof (1), typeof (1)),
    new BoundBinaryOperator(SyntaxKind.minus, BoundBinaryOperatorKind.nimus, typeof (1), typeof (1)),
    new BoundBinaryOperator(SyntaxKind.multiplication, BoundBinaryOperatorKind.multiplication, typeof (1), typeof (1)),
    new BoundBinaryOperator(SyntaxKind.division, BoundBinaryOperatorKind.division, typeof (1), typeof (1)),

    new BoundBinaryOperator(SyntaxKind.equals, BoundBinaryOperatorKind.equals, typeof (1), typeof (true)),
    new BoundBinaryOperator(SyntaxKind.unequals, BoundBinaryOperatorKind.unequals, typeof (1), typeof (true)),

    // of booleans
    new BoundBinaryOperator(SyntaxKind.logicalAnd, BoundBinaryOperatorKind.logicalAnd, typeof (true), typeof (true)),
    new BoundBinaryOperator(SyntaxKind.logicalOr, BoundBinaryOperatorKind.logicalOr, typeof (true), typeof (true)),

    new BoundBinaryOperator(SyntaxKind.equals, BoundBinaryOperatorKind.equals, typeof (true), typeof (true)),
    new BoundBinaryOperator(SyntaxKind.unequals, BoundBinaryOperatorKind.unequals, typeof (true), typeof (true)),
]


class Binder
{
    constructor()
    {
        this.diagnostics = []
    }

    bindExpression(expressionSyntax)
    {
        switch (expressionSyntax.kind) {
            case SyntaxKind.literalExpression:
                return this.bindLiteralExpression(expressionSyntax)
            case SyntaxKind.unaryExpression:
                return this.bindUnaryExpression(expressionSyntax)
            case SyntaxKind.binaryExpression:
                return this.bindBinaryExpression(expressionSyntax)
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

    bindUnaryExpression(expressionSyntax)
    {
        const boundOperandExpression = this.bindExpression(expressionSyntax.operandExpression)
        const boundOperator = BoundUnaryOperator.bind(expressionSyntax.operatorToken.kind, boundOperandExpression.resultType)

        if (boundOperator == null) {
            const message = `Unary operator ${expressionSyntax.operatorToken.text} is not defined for type ${boundOperandExpression.resultType}`
            this.diagnostics.push(message)

            return boundOperandExpression
        }

        return new BoundUnaryExpression(boundOperator, boundOperandExpression)
    }


    bindBinaryExpression(expressionSyntax)
    {
        const boundLeftExpression = this.bindExpression(expressionSyntax.leftExpression)
        const boundRightExpression = this.bindExpression(expressionSyntax.rightExpression)
        const boundOperator = BoundBinaryOperator.bind(expressionSyntax.operatorToken.kind, boundLeftExpression.resultType)

        if (boundOperator == null) {
            const message = `Binary operator ${expressionSyntax.operatorToken.text} is not defined for type ${boundLeftExpression.resultType}`
            this.diagnostics.push(message)

            // returned value is arbitrary
            return boundLeftExpression
        }

        return new BoundBinaryExpression(boundLeftExpression, boundOperator, boundRightExpression)
    }

}

class BoundNode
{
    constructor() { }
}

const BoundNodeKind = {
    literalExpression: 'boundLiteralExpression',
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

    getChildren() {
        return []
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