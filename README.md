
#     Scratchlang
Scratchlang is an interpreted language that is run in scratch. It is a lower level language, and while it does have some nice features, there are also some things that make it rather difficult to use.

How are instructions called?
Instructions are all three letter long mnemonics, such as 'new' or 'clc.' Each instruction has inputs, and semicolons are the separators.
For example, you would do something like `spk;12` and not 
`spk 12` or `spk(12)`.



#     Prefixes
Prefixes are a big thing in Scratchlang, allowing you to use so many more values with specific IDs, as both system constants, local constants, global variables, local variables, strings, and labels.
The five prefixes are 's', 'l', 'g', 'v', '"' (quotation mark), and '$' (dollar sign).



* S: System constants. (ie. `spk;s5`)
    * (`s1`, `s2`): Mouse position (x, y)
    * `s3`: Mouse down (1 if true, 0 if false)
    * `s4`: Loudness
    * `s5`: Timer
    * `s6`: Days since 2000
    * `s7`: Username
    * `s8`: Online? (1 if true, 0 if false)
    * `s9`: Seconds since 2000
* L: Local constants. (ie. `jle;l3;20;4`)
    * (`l1`, `l2`): Sprite position (x, y)
    * `l3`: Distance to mouse
    * `l4`: FileID (not really a thing yet)
    * `l5`: Seconds since file existence
    * `l6`: Amount of variables
* G: Global variables (ie. `new;g;g1`)
* V: Local variables (ie. `clc;v3+1;v3`)
* ": Strings (ie. `cmd;"files`)
* $: Labels (ie. `jmp;$main_label`)
    * Labels are declared using a string! For example:
        ```
        lbl;"main_loop
        upd
        jmp;$main_loop
        ```
    	Makes a loop.



#     Mnemonics

1. `lay;"f/b`                              - Layer front/back
2. `lbl;"label_name                    `   - Add label
3. `rst                                `   - Reset timer
4. `hlt                                `   - Halt
5. `run;"file_name;run_settings(optional)` - Run file
6. `spk;"text                          `   - Print
7. `exc;"text                          `   - Print with newline
8. `crc;raw_char_id                    `   - Print raw character
9. `cmd;"command_name                  `   - Console command
10. `clc;expression;variable           `   - Calculate expression
11. `imp;package                       `   - Import
12. `new;type(v/g);initialize_data     `   - New variable
13. `del;variable                      `   - Delete variable
14. `inp;"question;variable            `   - Input (ask and wait)
15. `upd                               `   - Update screen
16. `jmp;$label / jmp;123              `   - Jump
17. `jlt;value_1;value_2;$label / 123  `   - Branch if v1 < v2
18. `jle;value_1;value_2;$label / 123  `   - Branch if v1 <= v2
19. `jeq;value_1;value_2;$label / 123  `   - Branch if v1 == v2
20. `jne;value_1;value_2;$label / 123  `   - Branch if v1 != v2
21. `jgt;value_1;value_2;$label / 123  `   - Branch if v1 > v2
22. `jge;value_1;value_2;$label / 123  `   - Branch if v1 >= v2
23. `get;v/g;variable_number;var       `   - Get arbitrary var
24. `sov;file_id;local_var;value       `   - Set var of file with id
24. `hlo;file_id;local_var;value       `   - Halt file with id


#     Packages
There are currently three "packages" which allow you to use more functionality in a file. These packages include (as of v1.3a)

* Pen
* Mus
* Mth
* Str
* Fle (planned for v1.3b)

To use an imported package, you write mnemonics like `pck.mne;a;b;c`


* ## Pen
The pen package lets you draw using the scratch 'pen' addon, using a few mnemonics.


1. `drw                                 ` - Pen down
2. `stp                                 ` - Pen up
3. `mov;x;y                             ` - Move to x, y
4. `hsv;hue;value;saturation            ` - Pen color
5. `rgb;red;green;blue                  ` - Pen color
6. `hex;"#hexcode                       ` - Pen color
7. `siz;size_value                      ` - Pen size
8. `dot                                 ` - Single dot
9. `chr;glyph_chr;size;font_id          ` - Draw char
10. `clr                                ` - Clear
11. `scb;size;color;brightness          ` - Sprite data
12. `dir;direction                      ` - Point at dir
13. `cst;costume_number or "costume_name` - Costume
14. `dsp                                ` - Stamp
15. `tri;x1;y1;x2;y2;x3;y3`               - Triangle drawer
* ## Mus

The music package lets you play some sounds. It is very limited at the time, because scratch kind of sucks with sound.



1. `pla;sound_number or "sound_name `  - Play sound
2. `pch;pitch                       `  - Set pitch
3. `pan;pan                         `  - Set pan
4. `vol;volume                      `  - Set volume
5. `stp                             `  - Stop all sounds
6. `rst                             `  - Reset sfx
* ## Mth

The math package lets you do arbitrary calculations with many more tools than the simple operations you can use in cl c.



1. `pow;value_1;value_2;variable `
2. `log;value_1;value_2;variable `
3. `mod;value_1;value_2;variable `
4. `sin;value;variable `
5. `cos;value;variable `
6. `tan;value;variable `
7. `csc;value;variable `
8. `sec;value;variable `
9. `cot;value;variable `
10. `sgn;value;variable `
11. `abs;value;variable `
12. `int;value;variable `
13. `flr;value;variable `
14. `cel;value;variable `
15. `rng;variable `
* ## Str

The string package lets you do string manipulation



1. `cat;"a;"b;variable` - Concatenate
2. `idx;id;"string;variable` - Index of String
3. `len;"string;variable` - Length of String
* ## Fle (Planned for v1.3b)

The file package lets you use file data (reading and writing), and create/destroy files.


1. `red;"filename;var           `   - Read whole file
2. `rdl;"filename;line;var      `   - Read line
3. `rdc;"filename;char;var      `   - Read char
4. `wsf;"filename;"str          `   - Write str to file
5. `wcf;"filename;char_id       `   - Write chr to file
6. `nwf;"file_name              `   - New file
7. `rmf;"file_name              `   - Remove file
8. `fln;"file_name;variable     `   - File length