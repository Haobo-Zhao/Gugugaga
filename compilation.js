class EvaluationResult {
    constructor(diagnostics, value) {
        this.diagnostics = diagnostics
        this.value = value
    }
}

class Compilation {
    constructor(syntaxTree) {
        this.syntaxTree = syntaxTree
    }

    evaluate() {
        const binder = new Binder()
        const boundExpression = binder.bindExpression(this.syntaxTree.rootExpression)

        const diagnostics = this.syntaxTree.diagnostics.concat(binder.diagnostics)

        if (diagnostics.length == 0) {
            const e = new Evaluator(boundExpression)
            const value = e.evaluate()
            return new EvaluationResult([], value)
        } else {
            return new EvaluationResult(diagnostics, null)
        }
    }
}
