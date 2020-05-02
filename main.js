const main = () => {
    const line = '1 + 2 * 3'
    const lexer = new Lexer(line)

    log('******** Start parsing ********\n\n')
    log(`parsing ${line}:\n\n`)
    while (true) {
        const token = lexer.nextToken()
        // log(token)
        if (token.kind == SyntaxKind.EndOfFile) {
            log('\n******** Finish parsing ********')
            break
        }

        const tokenInfo = `Token: ${token.kind} '${token.text}' ${token.value ? token.value : ''}\n\n`
        log(tokenInfo)
    }
}

main()
