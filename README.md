# Scratchlang
Scratchlang is an interpreted language that is run in scratch. It is a lower level language, and while it does have some nice features, there are also some things that make it rather difficult to use.

## How are instructions called?
Instructions are all three letter long mnemonics, such as ‘new’ or ‘clc.’ Each instruction has inputs, and semicolons are the separators.
For example, you would do something like `spk;12` and not `spk 12`.

## Prefixes
Prefixes are a big thing in Scratchlang, allowing you to use so many more values with specific IDs, as both system constants, local constants, global variables, local variables, strings, and labels.
The five prefixes are ‘s’, ‘l’, ‘g’, ‘v’, ‘“’ (quotation mark), and ‘$’ (dollar sign).
* S: System variables. (ie. spk;s5)
    * (s1, s2): Mouse position (x, y)
    * s3: Mouse down (1 if true, 0 if false)
    * s4: Loudness
    * s5: Timer
    * s6: Days since 2000
    * s7: Username
    * s8: Online?
    * s9: Seconds since 2000
* L: Local variables. (ie. jle;l3;20;14)
    * (l1, l2): Sprite position (x, y)
    * l3: Distance to mouse
    * l4: FileID (not really a thing yet)
    * l5: Seconds since file existence
    * l6: Amount of variables
* G: Global variables (ie. new;g;g1)
* V: Local variables (ie. clc;v3+1;v3)
* “: Strings (ie. cmd;”files)
* $: Labels (ie. jmp;$main_label)
    * Labels are declared using a string!
    For example:
    ```
    lbl;"main_loop
    upd
    jmp;$main_loop
    ```
	Makes a loop.

# Mnemonics
1. lay;”f/b                              - Layer at front/back
2. lbl;”label_name                       - Add label
3. rst                                   - Reset timer
4. hlt                                   - Halt
5. run;”file_name;run_settings(optional) - Run file
6. spk;”text                             - Print
7. exc;”text                             - Print with newline
8. crc;raw_char_id                       - Print raw character
9. cmd;”command_name                     - Console Command
10. clc;expression;variable             - Calculate Expression
11. imp;package                         - Import
new;type(v/g);initialize_data       - New variable
12. del;variable                        - Delete variable
13. inp;”question;variable              - Input (ask and wait)
14. upd                                 - Update screen
15. jmp;$label / jmp;123                - Jump
16. jlt;value_1;value_2;$label / 123    - Branch if v1 < v2
17. jle;value_1;value_2;$label / 123    - Branch if v1 <= v2
18. jeq;value_1;value_2;$label / 123    - Branch if v1 == v2
19. jne;value_1;value_2;$label / 123    - Branch if v1 != v2
20. jgt;value_1;value_2;$label / 123    - Branch if v1 > v2
21. jge;value_1;value_2;$label / 123    - Branch if v1 >= v2

Packages
There are currently three “packages” which allow you to use more functionality in a file. These packages include (as of v1.2)
* Pen
* Mus
* Mth

## Pen
The pen package is very turtle-like, with a few mnemonics.
1. drw                                      - Pen Down
2. stp                                      - Pen Up
3. mov;x;y                                  - Move to x, y
4. hsv;hue;value;saturation                 - Pen Color
5. rgb;red;green;blue                       - Pen Color
6. hex;”#hexcode                            - Pen Color
7. siz;size_value                           - Pen Size
8. dot                                      - Single Dot
9. chr;glyph_chr;size;font_id               - Draw Char
10. clr                                     - Clear
11. scb;size;color;brightness               - Sprite Data
12. dir;direction                           - Point at Dir
13. cst;costume_number or “costume_name     - Costume
14. dsp                                     - Stamp

## Mus
The music package lets you play some sounds. It is very limited at the time, because scratch kind of sucks with sound.
1. pla;sound_number or “sound_name   - Play Sound
2. pch;pitch                         - Set Pitch
3. pan;pan                           - Set Pan
4. vol;volume                        - Set Volume
5. stp                               - Stop all sounds
6. rst                               - Reset Sound Effects

## Mth
The math package lets you do arbitrary calculations with many more tools than the simple operations you can use in clc.
1. pow;value_1;value_2;variable 
2. log;value_1;value_2;variable 
3. mod;value_1;value_2;variable 
4. sin;value;variable 
5. cos;value;variable 
6. tan;value;variable 
7. csc;value;variable 
8. sec;value;variable 
9. cot;value;variable 
10. sgn;value;variable 
11. abs;value;variable 
12. int;value;variable 
13. flr;value;variable 
14. cel;value;variable 
15. rng;variable 
