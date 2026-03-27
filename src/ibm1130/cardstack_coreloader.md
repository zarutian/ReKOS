
See Figure 12 page 62 of [Disk Monitor v1 Reference](http://media.ibm1130.org/1130-055-ocr.pdf) for what kind of cards are to be loaded.
See [this](https://www.ibm1130.net/functional/index.html) on how to read cards and the restriction on the loader card.

The restrictions on the loader card:
1. short instructions only
2. all displacements in instructions are relative to Instruction Address except for Shift, BOSC and BSC instructions.

``txt

Loader card:                            op      ss displ.
           rows on card                 cell in core
            11                               000==111111
            210123456789   dat   addr   01234___89012345
column 0: 0b000000000000 0x000 0x0000 0b00000___00000000  NOP          # mainly due to that cut corner on the card (is: aðalega út af fláanum á horni gataspjaldsins)
       1: 0b             0x    0x0001 0b01100___00010100  LDX_s IA = 0x14
       2: 0b             0x    0x00   0b                  # tbd: L
       3: 0b             0x    0x00   0b                  # tbd: O
       4: 0b             0x    0x00   0b                  # tbd: A
       5: 0b             0x    0x00   0b                  # tbd: D
       6: 0b             0x    0x00   0b                  # tbd: E
       7: 0b             0x    0x00   0b                  # tbd: R
       8: 0b             0x    0x0008 0bXXXXX___YYZZZZZZ  # Interrupt vector (lvl 0) for 1442 Card Read Punch (column read, punch), we want the column read        
       9: 0b             0x    0x0009 0b00000___00010000  #                   lvl 1
      10: 0b             0x    0x000A 0b00000___00010000  #                   lvl 2
      11: 0b             0x    0x000B 0b00000___00010000  #                   lvl 3
      12: 0b             0x    0x000C 0bXXXXX___YYZZZZZZ  # Interrupt vector (lvl 4) for 1442 (operation complete), that is card completely read
      13: 0b             0x    0x000D 0b00000___00010000  #                   lvl 5
      14: 0b000000000001 0x001 0x000E 0b00000___00000001  # constant 1
      15: 0b010011000000 0x4C0 0x000F 0b01001___11000000  BOSC_s            # will become BOSC_l after fixups
      16: 0b110111101101 0xDED 0x0010 0b11011___11111101  # gets replaced by any unwanted interrupt 'calling' it
      17: 0b             0x60F 0x0011 0b01100___00001111  LDX_s IA = 0x0F   # jump back two cells
      18: 0b             0x    0x0012 0b01100___00000000  LDX_s IA = 0x00   # will become LDX_l IA after fixups
      19: 0b             0x    0x0013 0b                  #
      20: 0b11000        0xC   0x0014 0b11000___11111001  LD_s IA-7    # load constant 1 into the accumulator
      21: 0b             0x    0x0015 0b00010___00001010  SLA_s 10     # shift it left 10 bit places
      22: 0b             0x    0x0016 0b11101___11111000  OR_s IA-8    # or it with the BOSC_s instruction, turning it into BOSC_l
      23: 0b000000000000 0x000 0x0017 0b00000___00000000  NOP
      24: 0b             0x    0x0018 0b11010___11110110  STO_s IA-10  # store it back
      25: 0b000000000000 0x000 0x0019 0b00000___00000000  NOP
      26: 0b             0x    0x001A 0b11000___11110011  LD_s  IA-13  # load constant 1 into the accumulator
      27: 0b             0x    0x001B 0b00010___00001010  SLA_s 10     # shift it left 10 bit places
      28: 0b             0x    0x001C 0b11101___11110101  OR_s  IA-11  # or it with the LDX_s at address 0x0012
      29: 0b             0x    0x001D 0b11010___11110100  STO_s IA-12  # store it back
      30: 0b             0x    0x001E 0b11000___11101111  LD_s  IA-17  # load constant 1 into the accumulator     0d17 = 0x11 = 0b00010001
      31: 0b             0x    0x001F 0b00010___00001010  SLA_s 10     # shift it left 10 bit places
      32: 0b             0x    0x0020 0b11101___11110101  OR_s  IA-11  # or it with the OR_s  at address 0x0016
      33: 0b             0x    0x0021 0b11010___11110110  STO_s IA-12  # store it back
      34: 0b             0x    0x0022 0b
      35: 0b             0x    0x00   0b
      36: 0b             0x    0x00   0b
      37: 0b             0x    0x00   0b
      38: 0b             0x    0x00   0b
      39: 0b             0x    0x00   0b
      40: 0b             0x    0x00   0b
      41: 0b             0x    0x00   0b
      42: 0b             0x    0x00   0b
      43: 0b             0x    0x00   0b
      44: 0b             0x    0x00   0b
      45: 0b             0x    0x00   0b
      46: 0b             0x    0x00   0b
      47: 0b             0x    0x00   0b
      48: 0b             0x    0x00   0b
      49: 0b             0x    0x00   0b
      50: 0b             0x    0x00   0b
      51: 0b             0x    0x00   0b
      52: 0b             0x    0x00   0b
      53: 0b             0x    0x00   0b
      54: 0b             0x    0x00   0b
      55: 0b             0x    0x00   0b
      56: 0b             0x    0x00   0b
      57: 0b             0x    0x00   0b
      58: 0b             0x    0x00   0b
      59: 0b             0x    0x00   0b
      60: 0b             0x    0x00   0b
      61: 0b             0x    0x00   0b
      62: 0b             0x    0x00   0b
      63: 0b             0x    0x00   0b
      64: 0b             0x    0x00   0b
      65: 0b             0x    0x00   0b
      66: 0b             0x    0x00   0b
      67: 0b             0x    0x00   0b
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
  0x15 - 0x03 = 0x12
  0x0012 ^ 0xFFFF = 0xFFED
  0xFFED + 0x0001 = 0xFFEE
                    0x00
```

Loader program flow:
  1. Various fixups of cells/words from the loadercard
  2. do Start Read IOCC

  In response to column read interrupt
  1. do the Read Column IOCC


