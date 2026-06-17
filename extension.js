const vscode = require('vscode');

// Dictionary containing your Scratchlang variables and descriptions
const docs = {
    // System Variables
    "s1": "**Mouse X Position**\n\nReturns the current horizontal position of the mouse cursor.",
    "s2": "**Mouse Y Position**\n\nReturns the current vertical position of the mouse cursor.",
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

function activate(context) {
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

    context.subscriptions.push(hoverProvider);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
