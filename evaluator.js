class Evaluator {
    constructor(rootExpression) {
        this.rootExpression = rootExpression
    }

    evaluate() {
        return this.evaluateExpression(this.rootExpression)
    }

    evaluateExpression(syntaxNode) {
        // NumberExpression
        // BinaryExpression
        // ParenthesizedExpression

        if (syntaxNode.kind == SyntaxKind.numberExpression) {
            return syntaxNode.numberToken.value
        } else if (syntaxNode.kind == SyntaxKind.binaryExpression) {
            // postorder traversal

            const leftVal = this.evaluateExpression(syntaxNode.left)
            const rightVal = this.evaluateExpression(syntaxNode.right)
            const operatorToken = syntaxNode.operatorToken

            if (operatorToken.kind == SyntaxKind.plus) {
                return leftVal + rightVal
            } else if (operatorToken.kind == SyntaxKind.minus) {
                return leftVal - rightVal
            } else if (operatorToken.kind == SyntaxKind.multiplication) {
                return leftVal * rightVal
            } else if (operatorToken.kind == SyntaxKind.division) {
                return leftVal / rightVal
            } else {
                throw new Error(`${operatorToken.kind} is not a valid binary operator`)
            }
        } else if (syntaxNode.kind == SyntaxKind.parenthesizedExpression) {
            const value = this.evaluateExpression(syntaxNode.expression)
            return value
        } else if (syntaxNode.kind == SyntaxKind.unaryExpression) {
            const operandValue = this.evaluateExpression(syntaxNode.operandExpression)
            if (syntaxNode.operatorToken.kind == SyntaxKind.minus) {
                return -operandValue
            } else if (syntaxNode.operatorToken.kind == SyntaxKind.plus) {
                return operandValue
            } else {
                throw new Error(`${syntaxNode.kind} is not a valid unary operator.`)
            }
        }

        throw new Error(`${syntaxNode.kind} is not a valid expression node.`)
    }
}
