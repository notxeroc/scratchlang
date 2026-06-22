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
    'hlo'
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
        'cat', 'idx', 'len'
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

        if (isPackageQualified && validImports.has(packageName)) {
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

            if (validImports.has(importPackageName)) {
                importedPackages.add(importPackageName);
            } else {
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

    vscode.workspace.textDocuments.forEach(document => updateOpenDocument(document));
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
