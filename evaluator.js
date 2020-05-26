class Evaluator
{
    constructor(rootExpression)
    {
        this.rootExpression = rootExpression
    }

    evaluate()
    {
        return this.evaluateExpression(this.rootExpression)
    }

    evaluateExpression(syntaxNode)
    {
        // BoundLiteralExpression
        // BoundBinaryExpression
        // BoundParenthesizedExpression

        switch (syntaxNode.kind) {
            case BoundNodeKind.literalExpression:
                return syntaxNode.value

            case BoundNodeKind.unaryExpression:
                {
                    const operandValue = this.evaluateExpression(syntaxNode.boundOperandExpression)

                    switch (syntaxNode.boundUnaryOperator.boundUnaryOperatorKind) {
                        case BoundUnaryOperatorKind.identity:
                            return operandValue

                        case BoundUnaryOperatorKind.negation:
                            return -operandValue

                        case BoundUnaryOperatorKind.logicalNegation:
                            return !operandValue

                        default:
                            throw new Error(`Unexpected unary operator ${syntaxNode.boundUnaryOperatorKind}`)
                    }
                }

            case BoundNodeKind.binaryExpression:
                {
                    const leftValue = this.evaluateExpression(syntaxNode.boundLeftExpression)
                    const rightValue = this.evaluateExpression(syntaxNode.boundRightExpression)

                    switch (syntaxNode.boundBinaryOperator.boundBinaryOperatorKind) {
                        case BoundBinaryOperatorKind.plus:
                            return leftValue + rightValue

                        case BoundBinaryOperatorKind.minus:
                            return leftValue - rightValue

                        case BoundBinaryOperatorKind.multiplication:
                            return leftValue * rightValue

                        case BoundBinaryOperatorKind.division:
                            return leftValue / rightValue

                        case BoundBinaryOperatorKind.logicalAnd:
                            return leftValue && rightValue

                        case BoundBinaryOperatorKind.logicalOr:
                            return leftValue || rightValue

                        case BoundBinaryOperatorKind.equals:
                            return leftValue == rightValue

                        case BoundBinaryOperatorKind.unequals:
                            return leftValue != rightValue

                        default:
                            throw new Error(`unexpected binary operator ${syntaxNode.boundBinaryOperatorKind}`)
                    }
                }

            default:
                break;
        }

        throw new Error(`${syntaxNode.kind} is not a valid expression node.`)
    }
}
