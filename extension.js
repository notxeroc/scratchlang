const vscode = require('vscode');

// Dictionary containing your Scratchlang variables and descriptions
const docs = {
    // System Variables
    "s1": "**Mouse X Position**\n\nReturns the current horizontal position of the mouse cursor.",
    "s2": "**Mouse Y Position**\n\nReturns the current vertical position of this sprite.",
    "s3": "**Mouse Down Status**\n\nReturns `1` if the mouse is clicked/held down, and `0` if false.",
    "s4": "**Loudness**\n\nReturns the current microphone input volume level (0 to 100).",
    "s5": "**Timer**\n\nReturns the total elapsed seconds since the project timer was last reset.",
    "s6": "**Days Since 2000**\n\nReturns the exact number of days (including decimals) passed since Jan 1, 2000.",
    "s7": "**Username**\n\nReturns the Scratch username of the person viewing or running the project.",
    "s8": "**Online Status**\n\nReturns `1` if the user is connected to cloud variables, otherwise `0`.",
    "s9": "**Seconds Since 2000**\n\nReturns the exact UNIX-style seconds elapsed since Jan 1, 2000.",

    // Local Variables
    "l1": "**Sprite X Position**\n\nReturns the current horizontal coordinate of this sprite.",
    "l2": "**Sprite Y Position**\n\nReturns the current vertical coordinate of this sprite.",
    "l3": "**Distance to Mouse**\n\nCalculates the precise distance in pixels from this sprite to the cursor.",
    "l4": "**FileID**\n\n*Placeholder attribute* (Feature planned for future release).",
    "l5": "**File Age**\n\nReturns the elapsed runtime duration in seconds since this specific file was created.",
    "l6": "**Variable Count**\n\nReturns the grand total of active variables declared in this instance."
};

const baseMnemonics = [
    'lay', 'lbl', 'rst', 'hlt', 'run', 'spk', 'exc', 'crc', 'cmd',
    'clc', 'imp', 'new', 'del', 'inp', 'upd', 'jmp', 'jlt', 'jle',
    'jeq', 'jne', 'jgt', 'jge', 'jkp', 'jkt', 'jnp', 'jnt', 'sov',
    'hlo', 'set', 'gkt', 'gkp', 'dbg', 'cal', 'ret'
];

const packageMnemonics = {
    pen: [
        'drw', 'stp', 'mov', 'hsv', 'rgb', 'hex', 'siz', 'dot',
        'chr', 'clr', 'scb', 'dir', 'cst', 'dsp', 'tri'
    ],
    mus: [
        'pla', 'pch', 'pan', 'vol', 'stp', 'rst'
    ],
    mth: [
        'pow', 'log', 'mod', 'sin', 'cos', 'tan', 'csc', 'sec',
        'cot', 'sgn', 'abs', 'int', 'flr', 'cel', 'rng'
    ],
    str: [
        'cat', 'idx', 'len', 'chr', 'ord', 'pop'
    ],
    fle: [
        'red', 'rdl', 'rdc', 'wsf', 'wcf', 'nwf', 'rmf', 'fln'
    ]
};

const validImports = new Set(Object.keys(packageMnemonics));
const allPackageMnemonics = new Set();
for (const packageName of Object.keys(packageMnemonics)) {
    for (const mnemonic of packageMnemonics[packageName]) {
        allPackageMnemonics.add(mnemonic);
    }
}

const mnemonicToPackage = new Map();
for (const packageName of Object.keys(packageMnemonics)) {
    for (const mnemonic of packageMnemonics[packageName]) {
        mnemonicToPackage.set(mnemonic, packageName);
    }
}

function updateDiagnostics(document, collection) {
    if (document.languageId !== 'scratchlang') {
        return;
    }

    const diagnostics = [];
    const importedPackages = new Set();

    // First pass: collect all imported packages anywhere in the document
    for (let i = 0; i < document.lineCount; i++) {
        const ln = document.lineAt(i).text;
        if (/^%\s*/.test(ln)) continue;
        const segs = ln.split(';').map(s => s.trim());
        if (!segs[0]) continue;
        if (segs[0].toLowerCase() === 'imp' && segs[1]) {
            const arg = segs[1].trim();
            const importPackageName = arg.replace(/^['"]|['"]$/g, '');
            if (validImports.has(importPackageName)) {
                importedPackages.add(importPackageName);
            }
        }
    }

    // Second pass: validate uses against collected imports
    for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
        const line = document.lineAt(lineIndex);
        const text = line.text;

        if (/^%\s*/.test(text)) {
            continue;
        }

        const rawSegments = text.split(';').map(segment => segment.trim());

        if (rawSegments.length === 0 || !rawSegments[0]) {
            continue;
        }

        const firstSegment = rawSegments[0];
        const commandStart = text.indexOf(firstSegment);
        const commandEnd = commandStart + firstSegment.length;

        const packageQualifiedMatch = firstSegment.match(/^([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)$/);
        const isPackageQualified = Boolean(packageQualifiedMatch);
        const packageName = isPackageQualified ? packageQualifiedMatch[1].toLowerCase() : null;
        const qualifiedMnemonic = isPackageQualified ? packageQualifiedMatch[2].toLowerCase() : null;

        if (isPackageQualified) {
            // Require that the package be imported even when using package-qualified syntax
            if (!validImports.has(packageName)) {
                const unknownRange = new vscode.Range(
                    lineIndex,
                    commandStart,
                    lineIndex,
                    commandEnd
                );
                diagnostics.push(new vscode.Diagnostic(
                    unknownRange,
                    `Unknown package '${packageName}' in '${firstSegment}'. Use one of: ${Array.from(validImports).join(', ')}`,
                    vscode.DiagnosticSeverity.Warning
                ));
                continue;
            }

            if (!importedPackages.has(packageName)) {
                const importRange = new vscode.Range(
                    lineIndex,
                    commandStart,
                    lineIndex,
                    commandEnd
                );
                diagnostics.push(new vscode.Diagnostic(
                    importRange,
                    `Package '${packageName}' must be imported before use with 'imp;${packageName}'.`,
                    vscode.DiagnosticSeverity.Error
                ));
                continue;
            }

            const packageCommand = qualifiedMnemonic;
            const isKnownPackageMnemonic = packageMnemonics[packageName]?.includes(packageCommand);
            if (!isKnownPackageMnemonic) {
                const unknownRange = new vscode.Range(
                    lineIndex,
                    commandStart,
                    lineIndex,
                    commandEnd
                );
                diagnostics.push(new vscode.Diagnostic(
                    unknownRange,
                    `Unknown mnemonic '${firstSegment}'. It is not a valid command for package '${packageName}'.`,
                    vscode.DiagnosticSeverity.Warning
                ));
            }

            continue;
        }

        if (firstSegment.toLowerCase() === 'imp' && rawSegments[1]) {
            const arg = rawSegments[1].trim();
            const importPackageName = arg.replace(/^['"]|['"]$/g, '');
            const argStart = text.indexOf(arg, commandEnd);

            if (!validImports.has(importPackageName)) {
                const importRange = new vscode.Range(
                    lineIndex,
                    argStart,
                    lineIndex,
                    argStart + arg.length
                );
                diagnostics.push(new vscode.Diagnostic(
                    importRange,
                    `Unknown package '${importPackageName}'. Use one of: ${Array.from(validImports).join(', ')}`,
                    vscode.DiagnosticSeverity.Warning
                ));
            }
            continue;
        }

        const mnemonic = firstSegment.toLowerCase();
        const isKnownBaseMnemonic = baseMnemonics.includes(mnemonic);
        const packageInfo = mnemonicToPackage.get(mnemonic);
        const isKnownPackageMnemonic = Boolean(packageInfo);

        if (!isKnownBaseMnemonic && !isKnownPackageMnemonic) {
            const unknownRange = new vscode.Range(
                lineIndex,
                commandStart,
                lineIndex,
                commandEnd
            );
            diagnostics.push(new vscode.Diagnostic(
                unknownRange,
                `Unknown mnemonic '${mnemonic}'. It must be one of the base instructions or an imported package command.`,
                vscode.DiagnosticSeverity.Warning
            ));
            continue;
        }

        if (isKnownPackageMnemonic && !importedPackages.has(packageInfo)) {
            const instructionRange = new vscode.Range(
                lineIndex,
                commandStart,
                lineIndex,
                commandEnd
            );
            diagnostics.push(new vscode.Diagnostic(
                instructionRange,
                `Package '${packageInfo}' must be imported before use with 'imp;${packageInfo}'.`,
                vscode.DiagnosticSeverity.Error
            ));
        }
    }

    collection.set(document.uri, diagnostics);
}

function activate(context) {
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('scratchlang');

    // Register a hover handler specifically for the scratchlang language mode
    let hoverProvider = vscode.languages.registerHoverProvider('scratchlang', {
        provideHover(document, position, token) {
            // Get the word currently being hovered over
            const range = document.getWordRangeAtPosition(position);
            const word = document.getText(range);

            // Look up the word in our documentation object
            if (docs[word]) {
                return new vscode.Hover(new vscode.MarkdownString(docs[word]));
            }
            
            return null; // Return nothing if the word doesn't match our list
        }
    });

    const updateOpenDocument = (document) => updateDiagnostics(document, diagnosticCollection);

    context.subscriptions.push(
        hoverProvider,
        diagnosticCollection,
        vscode.workspace.onDidOpenTextDocument(updateOpenDocument),
        vscode.workspace.onDidChangeTextDocument(event => {
            if (event.document.languageId === 'scratchlang') {
                updateDiagnostics(event.document, diagnosticCollection);
            }
        }),
        vscode.workspace.onDidCloseTextDocument(document => {
            if (document.languageId === 'scratchlang') {
                diagnosticCollection.delete(document.uri);
            }
        })
    );

    // Command to insert '%' as a comment prefix for multiple selected lines
    const percentCommand = vscode.commands.registerTextEditorCommand('scratchlang.insertPercentComment', (editor, edit) => {
        const doc = editor.document;
        for (const sel of editor.selections) {
            if (sel.isEmpty) {
                edit.insert(sel.start, '% ');
                continue;
            }

            const startLine = sel.start.line;
            let endLine = sel.end.line;

            // If selection ends at column 0 on a later line, treat it as not including that line
            if (sel.end.character === 0 && endLine > startLine) {
                endLine = endLine - 1;
            }

            const lineInfos = [];
            for (let l = startLine; l <= endLine; l++) {
                const lineText = doc.lineAt(l).text;
                const isComment = lineText.trim().startsWith('%');
                lineInfos.push({ line: l, text: lineText, isComment });
            }

            const commentCount = lineInfos.filter(info => info.isComment).length;
            const shouldUncomment = commentCount > lineInfos.length / 2;

            if (shouldUncomment) {
                for (let idx = lineInfos.length - 1; idx >= 0; idx--) {
                    const info = lineInfos[idx];
                    if (!info.isComment) {
                        continue;
                    }

                    const commentMatch = info.text.match(/^(\s*)%\s?/);
                    if (commentMatch) {
                        const prefix = commentMatch[0];
                        const start = new vscode.Position(info.line, commentMatch[1].length);
                        const end = start.translate(0, prefix.length - commentMatch[1].length);
                        edit.delete(new vscode.Range(start, end));
                    }
                }
            } else {
                for (let idx = lineInfos.length - 1; idx >= 0; idx--) {
                    const info = lineInfos[idx];
                    if (!info.isComment) {
                        edit.insert(new vscode.Position(info.line, 0), '% ');
                    }
                }
            }
        }
    });

    context.subscriptions.push(percentCommand);

    vscode.workspace.textDocuments.forEach(document => updateOpenDocument(document));
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
