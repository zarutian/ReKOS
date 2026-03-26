
See Figure 12 page 62 of [Disk Monitor v1 Reference](http://media.ibm1130.org/1130-055-ocr.pdf) for what kind of cards are to be loaded.
See [this](https://www.ibm1130.net/functional/index.html) on how to read cards and the restriction on the loader card.

The restrictions on the loader card:
1. short instructions only
2. all displacements in instructions are relative to Instruction Address except for Shift instructions.

```txt

Loader card:                            op      ss displ.
           rows on card                 cell in core
            11                               000==111111
            210123456789   dat   addr   01234___89012345
column 0: 0b11000        0xC   0x0000 0b11000___00        LD (IA+
       1: 
       2:
       3:
       4:
       5:
       6:
       7:
       8:
       9:
      10:
      11:
      12:
      13:
      14:
      15:
      69:
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
