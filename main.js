function main() {
    // log(`\n******** Start parsing ********\n\n`)

    // const line = `1 1 * @#`
    // const line = `1 + 2 + 3`
    // const line = `-(1 + 1) + 2 * 3`
    // const line = `(1 + 2) * 3`
    // const line = `(1 == 1) && true != false`
    // const line = `a`

    const lines = [
        `a = 1`,
        `a + 2`,
    ]
    const variables = {}

    lines.forEach(line => {
        const parser = new Parser(line)

        const syntaxTree = parser.parse()
        const rootExpression = syntaxTree.rootExpression

        const compilation = new Compilation(syntaxTree)
        const evaluationResult = compilation.evaluate(variables)

        const diagnostics = evaluationResult.diagnostics
        const value = evaluationResult.value

        log(`> ${line}`)
        prettyLog(rootExpression)

        if (diagnostics.length == 0) {
            // log(`\n******** Start evaluating ********\n\n`)
            log(`> ${value}`)
        } else {
            diagnostics.forEach(diagnostic =>
            {
                console.log(`%c${diagnostic.message}`, LOG_COLOR.error)

                const textSpan = diagnostic.textSpan
                const prefix = line.substring(0, textSpan.start)
                const error = line.substr(textSpan.start, textSpan.length)
                const suffix = line.substr(textSpan.end)

                log(`    ${prefix}%c${error}%c${suffix}`, LOG_COLOR.error, LOG_COLOR.default)
            });

            log(``)
        }
    })

    // const parser = new Parser(line)

    // const syntaxTree = parser.parse()
    // const rootExpression = syntaxTree.rootExpression

    // const compilation = new Compilation(syntaxTree)
    // const evaluationResult = compilation.evaluate(variables)

    // const diagnostics = evaluationResult.diagnostics
    // const value = evaluationResult.value

    // log(`Parsing '${line}':\n\n`)
    // prettyLog(rootExpression)

    // if (diagnostics.length == 0) {
    //     log(`\n******** Start evaluating ********\n\n`)
    //     log(`> ${value}`)
    // } else {
    //     diagnostics.forEach(diagnostic => {
    //         console.log(`%c${diagnostic.message}`, LOG_COLOR.error)

    //         const textSpan = diagnostic.textSpan
    //         const prefix = line.substring(0, textSpan.start)
    //         const error = line.substr(textSpan.start, textSpan.length)
    //         const suffix = line.substr(textSpan.end)

    //         log(`    ${prefix}%c${error}%c${suffix}`, LOG_COLOR.error, LOG_COLOR.default)
    //     });

    //     log(``)
    // }
}

main()
