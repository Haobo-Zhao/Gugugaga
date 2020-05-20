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
        // LiteralExpression
        // BinaryExpression
        // ParenthesizedExpression

        switch (syntaxNode.kind) {
            case BoundNodeKind.literalExpression:
                return syntaxNode.value

            case BoundNodeKind.unaryExpression:
                {
                    const operandValue = this.evaluateExpression(syntaxNode.boundOperandExpression)

                    switch (syntaxNode.boundUnaryOperatorKind) {
                        case BoundUnaryOperatorKind.identity:
                            return operandValue

                        case BoundUnaryOperatorKind.negation:
                            return -operandValue

                        default:
                            throw new Error(`Unexpected unary operator ${syntaxNode.boundUnaryOperatorKind}`)
                    }
                }

            case BoundNodeKind.binaryExpression:
                {
                    const leftValue = this.evaluateExpression(syntaxNode.boundLeftExpression)
                    const rightValue = this.evaluateExpression(syntaxNode.boundRightExpression)

                    switch (syntaxNode.boundBinaryOperatorKind) {
                        case BoundBinaryOperatorKind.plus:
                            return leftValue + rightValue

                        case BoundBinaryOperatorKind.minus:
                            return leftValue - rightValue

                        case BoundBinaryOperatorKind.multiplication:
                            return leftValue * rightValue

                        case BoundBinaryOperatorKind.division:
                            return leftValue / rightValue

                        default:
                            debugger
                            throw new Error(`unexpected binary operator ${syntaxNode.boundBinaryOperatorKind}`)
                    }
                }

            default:
                break;
        }

        throw new Error(`${syntaxNode.kind} is not a valid expression node.`)
    }
}
