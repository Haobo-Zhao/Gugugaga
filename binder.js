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
}

const BoundNodeKind = {
    literalExpression: 'boundLiteralExpression',
    unaryExpression: 'boundUunaryExpression',
    binaryExpression: 'boundBinaryExpression',
}

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
        const boundOperatorTokenKind = this.bindUnaryOperatorKind(expressionSyntax.operatorToken.kind, boundOperandExpression.type)

        if (boundOperatorTokenKind == null) {
            const message = `Unary operator ${expressionSyntax.operatorToken.text} is not defined for type ${boundOperandExpression.type}`
            this.diagnostics.push(message)

            return boundOperandExpression
        }

        return new BoundUnaryExpression(boundOperatorTokenKind, boundOperandExpression)
    }

    bindUnaryOperatorKind(syntaxKind, operandType)
    {
        if (operandType != 'number' && operandType != 'boolean') {
            return null
        }

        switch (syntaxKind) {
            case SyntaxKind.plus:
                return BoundUnaryOperatorKind.identity

            case SyntaxKind.minus:
                return BoundUnaryOperatorKind.negation

            case SyntaxKind.logicalNegation:
                return BoundUnaryOperatorKind.logicalNegation

            default:
                throw new Error(`unexpected unary operator ${syntaxKind}`)
        }
    }

    bindBinaryExpression(expressionSyntax)
    {
        const boundLeftExpression = this.bindExpression(expressionSyntax.leftExpression)
        const boundRightExpression = this.bindExpression(expressionSyntax.rightExpression)
        const boundOperatorTokenKind = this.bindBinaryOperatorKind(expressionSyntax.operatorToken.kind, boundLeftExpression.type, boundRightExpression.type)

        if (boundOperatorTokenKind == null) {
            const message = `Binary operator ${expressionSyntax.operatorToken.text} is not defined for type ${boundLeftExpression.type}`
            this.diagnostics.push(message)

            // returned value is arbitrary
            return boundLeftExpression
        }

        return new BoundBinaryExpression(boundLeftExpression, boundOperatorTokenKind, boundRightExpression)
    }

    bindBinaryOperatorKind(kind, leftType, rightType)
    {
        if ((leftType != 'number' || rightType != 'number') && (leftType != 'boolean' || rightType != 'boolean')) {
            return null
        }

        switch (kind) {
            case SyntaxKind.plus:
                return BoundBinaryOperatorKind.plus

            case SyntaxKind.minus:
                return BoundBinaryOperatorKind.minus

            case SyntaxKind.multiplication:
                return BoundBinaryOperatorKind.multiplication

            case SyntaxKind.division:
                return BoundBinaryOperatorKind.division

            case SyntaxKind.logicalAnd:
                return BoundBinaryOperatorKind.logicalAnd

            case SyntaxKind.logicalOr:
                return BoundBinaryOperatorKind.logicalOr

            default:
                throw new Error(`unexpected binary operator ${kind}`)
        }
    }
}

class BoundNode
{
    constructor() { }
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
        this.type = typeof (value)
    }

    getChildren() {
        return []
    }
}

class BoundUnaryExpression
{
    constructor(boundUnaryOperatorKind, boundOperandExpression)
    {
        this.boundUnaryOperatorKind = boundUnaryOperatorKind
        this.boundOperandExpression = boundOperandExpression

        this.kind = BoundNodeKind.unaryExpression
        this.type = this.boundOperandExpression.type
    }
}

class BoundBinaryExpression
{
    constructor(boundLeftExpression, boundBinaryOperatorKind, boundRightExpression)
    {
        this.boundLeftExpression = boundLeftExpression
        this.boundBinaryOperatorKind = boundBinaryOperatorKind
        this.boundRightExpression = boundRightExpression

        this.kind = BoundNodeKind.binaryExpression
        this.type = boundLeftExpression.type        // left or right, arbitrary
    }
}