const BoundUnaryOperatorKind = {
    identity: 'identity',
    negation: 'negation',
}

const BoundBinaryOperatorKind = {
    plus: 'plus',
    minus: 'minus',
    multiplication: 'multiplication',
    division: 'division',
}

const BoundNodeKind = {
    literalExpression: 'bound literal expression',
    unaryExpression: 'bound unary expression',
    binaryExpression: 'bound binary expression'
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

    bindLiteralExpression(expressionSyntax)
    {
        let value = expressionSyntax.literalToken.value
        value = value || 0

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
        if (operandType != 'number') {
            return null
        }

        switch (syntaxKind) {
            case SyntaxKind.plus:
                return BoundUnaryOperatorKind.identity
            case SyntaxKind.minus:
                return BoundUnaryOperatorKind.negation
            default:
                throw new Error(`unexpected unary operator ${syntaxKind}`)
        }
    }

    bindBinaryExpression(expressionSyntax)
    {
        const boundLeftExpression = this.bindExpression(expressionSyntax.leftExpression)
        const boundRightExpression = this.bindExpression(expressionSyntax.rightExpression)
        const boundOperatorTokenKind = this.bindBinaryOperatorKind(expressionSyntax.operatorToken.kind, boundLeftExpression.type)

        if (boundOperatorTokenKind == null) {
            const message = `Unary operator ${expressionSyntax.operatorToken.text} is not defined for type ${boundOperandExpression.type}`
            this.diagnostics.push(message)

            // returned value is arbitrary
            return boundLeftExpression
        }

        return new BoundBinaryExpression(boundLeftExpression, boundOperatorTokenKind, boundRightExpression)
    }

    bindBinaryOperatorKind(kind, leftType, rightType)
    {
        if (leftType != 'number' || leftType != 'number') {
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