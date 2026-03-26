
See Figure 12 page 62 of [Disk Monitor v1 Reference](http://media.ibm1130.org/1130-055-ocr.pdf) for what kind of cards are to be loaded.
See [this](https://www.ibm1130.net/functional/index.html) on how to read cards and the restriction on the loader card.

The restrictions on the loader card:
1. short instructions only
2. all displacements in instructions are relative to Instruction Address except for Shift, BOSC and BSC instructions.

```txt

Loader card:                            op      ss displ.
           rows on card                 cell in core
            11                               000==111111
            210123456789   dat   addr   01234___89012345
column 0: 0b11000        0xC   0x0000 0b11000___00        LD (IA+
       1: 0b             0x    0x00   0b
       2: 0b             0x    0x00   0b
       3: 0b             0x    0x00   0b
       4: 0b             0x    0x00   0b
       5: 0b             0x    0x00   0b
       6: 0b             0x    0x00   0b
       7: 0b             0x    0x00   0b
       8: 0b             0x    0x0008 0bXXXXX___YYZZZZZZ  # Interrupt vector (lvl 0) for 1442 Card Read Punch (column read, punch), we want the column read        
       9: 0b             0x    0x0009 0b                  #                   lvl 1
      10: 0b             0x    0x000A 0b                  #                   lvl 2
      11: 0b             0x    0x000B 0b                  #                   lvl 3
      12: 0b             0x    0x000C 0bXXXXX___YYZZZZZZ  # Interrupt vector (lvl 4) for 1442 (operation complete), that is card completely read
      13: 0b             0x    0x000D 0b                  #                   lvl 5
      14: 0b110111101101 0xDED 0x000F 0b11011___11111101  # gets replaced by any unwanted interrupt 'calling'
      15  0b010011000000 0x    0x0010 0b01001___11000000  BOSC
      16: 0b             0x    0x0011 0b
      17: 0b             0x    0x0012 0b
      18: 0b             0x    0x00   0b
      19: 0b             0x    0x00   0b
      20: 0b             0x    0x00   0b
      21: 0b             0x    0x00   0b
      22: 0b             0x    0x00   0b
      23: 0b             0x    0x00   0b
      24: 0b             0x    0x00   0b
      25: 0b             0x    0x00   0b
      26: 0b             0x    0x00   0b
      27:
      28:
      29:
      30:
      68: 0b             0x    0x0044 0b
      69: 0b             0x    0x0045 0b
      70: 0b             0x    0x0046 0b
      71: 0b             0x    0x0047 0b
 C I  72: 0b001000000000 0x200 0x0048 0b00100___00000000  
 A N  73: 0b001000000000 0x200 0x0049 0b00100___00000000
 R    74: 0b001000000000 0x200 0x004A 0b00100___00000000
 D I  75: 0b001000000000 0x200 0x004B 0b00100___00000000
 S B  76: 0b001000000000 0x200 0x004C 0b00100___00000000
 E M  77: 0b001000000000 0x200 0x004D 0b00100___00000000
 Q    78: 0b001000000000 0x200 0x004E 0b00100___00000000
 #    79: 0b001000000000 0x200 0x004F 0b00100___00000000
    END OF CARD

  0d80 = 0d64 + 0d16 = 0x40 + 0x10 = 0x50
```
