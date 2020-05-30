function main() {
    log('\n******** Start parsing ********\n\n')

    // const line = '1 1 * @#'
    // const line = '1 + 2 + 3'
    // const line = '-(1 + 1) + 2 * 3'
    // const line = '(1 + 2) * 3'
    // const line = '-1 + 2 * 3'
    const line = '(1 == 1) && true != false'

    const parser = new Parser(line)
    const syntaxTree = parser.parse()
    const rootExpression = syntaxTree.rootExpression

    const compilation = new Compilation(syntaxTree)
    const evaluationResult = compilation.evaluate()

    const diagnostics = evaluationResult.diagnostics
    const value = evaluationResult.value

    log(`Parsing '${line}':\n\n`)
    prettyLog(rootExpression)

    if (diagnostics.length == 0) {
        log('\n******** Start evaluating ********\n\n')
        log(`> ${value}`)
    } else {
        diagnostics.forEach(errorMessage => {
            console.error(errorMessage)
        });
    }
}

main()
