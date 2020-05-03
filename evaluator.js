class Evaluator {
    constructor(rootExpression) {
        this.rootExpression = rootExpression
    }

    evaluate() {
        return this.evaluateExpression(this.rootExpression)
    }

    evaluateExpression(expression) {
        // NumberExpression
        // BinaryExpression
        // ParenthesizedExpression

        if (expression.kind == SyntaxKind.numberExpression) {
            return expression.numberToken.value
        } else if (expression.kind == SyntaxKind.binaryExpression) {
            // postorder traversal

            const leftVal = this.evaluateExpression(expression.left)
            const rightVal = this.evaluateExpression(expression.right)
            const operatorToken = expression.operatorToken

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
        } else if (expression.kind == SyntaxKind.parenthesizedExpression) {
            const value = this.evaluateExpression(expression.expression)
            return value
        }

        throw new Error(`${expression.kind} is not a valid expression node.`)
    }
}
