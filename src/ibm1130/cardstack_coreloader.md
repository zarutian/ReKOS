
See Figure 12 page 62 of [Disk Monitor v1 Reference](http://media.ibm1130.org/1130-055-ocr.pdf) for what kind of cards are to be loaded.
See [this](https://www.ibm1130.net/functional/index.html) on how to read cards and the restriction on the loader card.

The restrictions on the loader card:
1. short instructions only
2. all displacements in instructions are relative to Instruction Address except for Shift, BOSC and BSC instructions.

```txt

Loader card:                            op      ss displ.
           rows on card                 cell in core
            11                               000==111111
            210123456789   dat   addr   0123456789012345
column 0: 0b11000        0xC   0x0000 0b11000___          LDX_s IA =        # jump to
       1: 0b000001000000 0x    0x0001 0b00000___11000000  0x00C0            # X1   Read IOCC1
       2: 0b             0x    0x0002 0b00000___00100001  0x0021            # needs fixup via <<_9 !  Read IOCC2
       3: 0b110000000000 0x    0x0003 0b11000___00000000  LDX_l IA          # needs fixup via or_0x0200 !
       4: 0b000000000000 0x000 0x0004 0b00000___00000000  0x0000            # gets replaced via a BSI call
       5: 0b             0x    0x0005 0b11000___11111011  LD_s  IA-5        #
       6: 0b             0x    0x0006 0b10000___          ADD_s IA+         # add y to it
       7: 0b             0x    0x00
     

the following ran out of space (0v1):
column 0: 0b000000000000 0x000 0x0000 0b00000___00000000  NOP               # mainly due to that cut corner on the card (is: aðalega út af fláanum á horni gataspjaldsins)
       1: 0b11000        0xC   0x0001 0b11000___          LD_s  IA          # load constant 1 into the accumulator
       2: 0b             0x    0x0002 0b00010___00001010  SLA_s 10          # shift it left 10 bit places
       3: 0b             0x    0x0003 0b11101___          OR_s  IA          # or it with the BOSC_s instruction at address 0x000F, turning it into BOSC_l
       4: 0b             0x    0x0005 0b11010___          STO_s IA          # store it back
       5: 0b             0x
       6: 0b             0x
       7: 0b             0x    0x0007 0b01100___00        LDX_s IA =        # jump to further fixups
       8: 0b             0x    0x0008 0b00000___00010010  # Interrupt vector (lvl 0) for 1442 Card Read Punch (column read, punch), we want the column read        
       9: 0b             0x    0x0009 0b00000___00001111  #                   lvl 1
      10: 0b             0x    0x000A 0b00000___00001111  #                   lvl 2
      11: 0b             0x    0x000B 0b00000___00001111  #                   lvl 3
      12: 0b             0x    0x000C 0bXXXXX___YYZZZZZZ  # Interrupt vector (lvl 4) for 1442 (operation complete), that is card completely read
      13: 0b             0x    0x000D 0b00000___00001111  #                   lvl 5
      14: 0b010011000000 0x4C0 0x000E 0b01001___11000000  BOSC_s            # will become BOSC_l after fixups
      15: 0b110111101101 0xDED 0x000F 0b11011___11111101  # gets replaced by any unwanted interrupt 'calling' it
      16: 0b             0x60F 0x0010 0b01100___00001111  LDX_s IA = 0x0F   # jump back two cells
      17: 0b             0x    0x0011 0b01001___11000000  BOSC_l            # needs fixup!
      18: 0b000000000000 0x000 0x0012 0b00000___00000000                    # gets replaced with saved IA during interrupt
      19: 0b             0x    0x0013 0b11010___00        ST0_s IA+         # temp save accumulator
      20: 0b             0x    0x0014 0b00001___00        XIO_s IA+         # do a Sense Device XIO  as only the ibm1442 card reader/punch is at interrupt level 0
      21: 0b             0x    0x0015 0b00010___00000001  SLA_s 1           # shift Read response bit into Carry
      22: 0b             0x    0x0016 0b01001___00000010  SKCO_s            # SKip next cell if Carry Off
      23: 0b             0x    0x0017 0b01100___00011010  LDX_s IA = 0x1A   # 
      24: 0b             0x    0x0018 0b11000___00        LD_s  IA+         # restore accumulator
      25: 0b             0x    0x0019 0b01100___00010001  LDX_s IA = 0x11   # go and return from the interrupt
      26: 0b             0x    0x001A 0b00010___00000010  SLA_s 2           # shift Error Check bit into Carry
      27: 0b             0x    0x001B 0b01001___00000010  SKCO_s            # SKip next cell if Carry Off
      28: 0b             0x    0x001C 0b                  tbd               # an Error occured at the ibm1442 card reader
      29: 0b             0x    0x001D 0b00001___00        XIO_s IA+         # do a Read XIO
      30: 0b             0x    0x001E 0b11000___00        LD_s IA+          # load the address part of the Read IOCC into the accumulator
      31: 0b             0x    0x001F 0b10000___          ADD_s IA          # incr it by one         ( 0d24 = 0d16 + 0d08 = 0x18 = 0b00011000 )
      32: 0b             0x    0x0020 0b11010___00        STO_s IA+         # store it back
      33: 0b             0x    0x0021 0b11100___00        AND_s IA+         # and it with 0x0003
      34: 0b             0x    0x0022 0b01001___00100000  SKAZ_s            # SKip next cell if Accumulator is Zero
      35: 0b             0x    0x0023 0b01100___00        LDX_s IA = 0x18   # jump to 
      36: 0b             0x    0x0024 0b11000___00        LD_s IA+          # load the address part of the Read IOCC into the accumulator
      37: 0b             0x    0x0025 0b10010___00        MINUS_s IA+       # subtract four from it
      38: 0b             0x    0x0026 0b11010___00000000  STO_l             # needs fixup!
      39: 0b000000000001 0x001 0x0027 0b00000___00000001
      40: 0b             0x    0x0028 0b                  LD_si  (X1+1)     # needs fixup both via <<_8 and then or_1 !  load cell B into accumulator
      41: 0b             0x    0x0029 0b00011___00001100  SRL_s  12         # shift right by 12 bits
      42: 0b             0x    0x002A 0b                  OR_si  (X1+0)     # needs fixup via <<_8 !  or that part by cell A
      43: 0b             0x    0x002B 0b                  STO_si (X1+0)     # needs fixup via <<_8 !  store now full cell A
      44: 0b             0x    0x002C 0b                  LD_si  (X1+1)     # needs fixup via <<_8 !  load cell B again
      45: 0b             0x    0x002D 0b                  SLA_s  8          # shift left by 8 bits
      46: 0b             0x    0x002E 0b                  STO_si (X1+1)     # needs fixup via <<_8 and then or_1 !  store the now half cell B
      47: 0b             0x    0x002F 0b                  LD_si  (X1+2)     # needs fixup via <<_8 and then or_2 !  load cell C
      48: 0b             0x    0x0030 0b                  SRL_s  8          #
      49: 0b             0x    0x0031 0b                  OR_si  (X1+1)     #  ! or it with cell B
      50: 0b             0x    0x0032 0b                  STO_si (X1+1)     #  ! store now full cell B
      51: 0b             0x    0x0033 0b                  LD_si  (X1+2)     #  ! load cell C again
      52: 0b             0x    0x0034 0b                  SLA_s  8          #  ! shift left it 8bits
      53: 0b             0x    0x0035 0b                  STO_si (X1+2)     #  ! store it back
      54: 0b             0x    0x0036 0b                  LD_si  (X1+3)     #  ! load cell D
      55: 0b             0x    0x0037 0b                  OR_si  (X1+2)     #  ! or it with what is left of cell C
      56: 0b             0x    0x0038 0b                  STO_si (X1+2)     #  ! store cell C and D back
      57: 0b             0x    0x0039 0b                  LD_s   IA+        #  load the address part of the Read IOCC into the accumulator
      58: 0b             0x    0x003A 0b                  MINUS_s IA-       #  decr by one
      59: 0b             0x    0x003B 0b                  STO_s  IA         #  store it back
      60: 0b             0x    0x003C 0b01100___00        LDX_s IA = 0x1E   # jump to 0x1E
      61: 0b             0x    0x003D 0b00000___00000000                    # saved accumulator
      62: 0b             0x    0x003E 0b00000___00000100                    # constant 4
      63: 0b             0x    0x003F 0b00000___00000011                    # constant 3
      64: 0b             0x    0x0040 0b                                    #                 Sense Devive IOCC2
      65: 0b             0x    0x0041 0b00000___11000000  0x00C0            #                         Read IOCC1
      66: 0b             0x    0x0042 0b00000___00100001  0x0021            # needs fixup via <<_9 !  Read IOCC2
      67: 0b             0x    0x0043 0b                  
      67: 0b             0x    0x00   0b
      68: 0b             0x    0x00   0b
      69: 0b             0x    0x00   0b
      70: 0b             0x    0x00   0b
      71: 0b             0x    0x0047 0b
 C I  72: 0b001000000000 0x200 0x0048 0b00100___00000000  # tbd: 0 or L
 A N  73: 0b001000000000 0x200 0x0049 0b00100___00000000  # tbd: 0 or O
 R    74: 0b001000000000 0x200 0x004A 0b00100___00000000  # tbd: 0 or A
 D I  75: 0b001000000000 0x200 0x004B 0b00100___00000000  # tbd: 0 or D
 S B  76: 0b001000000000 0x200 0x004C 0b00100___00000000  # tbd: 0 or E
 E M  77: 0b001000000000 0x200 0x004D 0b00100___00000000  # tbd: 0 or R
 Q    78: 0b001000000000 0x200 0x004E 0b00100___00000000  # tbd: 0
 #    79: 0b001000000000 0x200 0x004F 0b00100___00000000  # tbd: 0
    END OF CARD

  0d80 = 0d64 + 0d16 = 0x40 + 0x10 = 0x50
  0x15 - 0x03 = 0x12
  0x0012 ^ 0xFFFF = 0xFFED
  0xFFED + 0x0001 = 0xFFEE
                    0x00
```

```
                 11 1111
     0123 4567 8901 2345
     AAAA AAAA AAAA BBBB
     BBBB BBBB CCCC CCCC
     CCCC DDDD DDDD DDDD
```

Loader program flow:
  1. Various fixups of cells/words from the loadercard
  2. do Start Read IOCC

  In response to column read interrupt
  1. do the Read Column IOCC


