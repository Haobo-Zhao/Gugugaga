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

    evaluate(variables) {
        const binder = new Binder(variables)
        const boundExpression = binder.bindExpression(this.syntaxTree.rootExpression)

        const diagnostics = this.syntaxTree.diagnosticBag.diagnostics.concat(binder.diagnosticBag.diagnostics)

        if (diagnostics.length == 0) {
            const e = new Evaluator(boundExpression, variables)
            const value = e.evaluate()

            return new EvaluationResult([], value)
        } else {
            return new EvaluationResult(diagnostics, null)
        }
    }
}
