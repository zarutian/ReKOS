
See Figure 12 page 62 of [Disk Monitor v1 Reference](http://media.ibm1130.org/1130-055-ocr.pdf) for what kind of cards are to be loaded.
See [this](https://www.ibm1130.net/functional/index.html) on how to read cards and the restriction on the loader card.

The restrictions on the loader card:
1. short instructions only
2. all displacements in instructions are relative to Instruction Address except for Shift, BOSC and BSC instructions.

```txt

Loader card 0x00:                       op      ss displ.
           rows on card                 cell in core
            11                               000==111111
            210123456789   dat   addr   0123456789012345
column 0: 0b000000000000 0x000 0x0000 0b00000___00000000  NOP               # mainly due to that cut corner on the card (is: aðalega út af fláanum á horni gataspjaldsins)
       1: 0b11000        0xC   0x0001 0b11000___00001100  LD_s  IA+12       # load constant 1 into the accumulator
       2: 0b             0x    0x0002 0b00010___00001010  SLA_s 10          # shift it left 10 bit places
       3: 0b             0x    0x0003 0b11101___00001011  OR_s  IA+11       # or it with the BOSC_s instruction at address 0x000F, turning it into BOSC_l
       4: 0b             0x    0x0004 0b11010___00001010  STO_s IA+10       # store it back
       5: 0b             0x    0x0005 0b11000___00001000  LD_s  IA+8        # load constant 1
       6: 0b             0x    0x0006 0b00010___00001010  SLA_s 10
       7: 0b             0x    0x0007 0b01100___00110110  LDX_s IA = 0x36   # jump to further fixups
       8: 0b             0x    0x0008 0b00000___00010101  # Interrupt vector (lvl 0) for 1442 Card Read Punch (column read, punch), we want the column read        
       9: 0b             0x    0x0009 0b00000___00010000  #                   lvl 1
      10: 0b             0x    0x000A 0b00000___00010000  #                   lvl 2
      11: 0b             0x    0x000B 0b00000___00010000  #                   lvl 3
      12: 0b             0x    0x000C 0b00000___00101111  # Interrupt vector (lvl 4) for 1442 (operation complete), that is card completely read
      13: 0b             0x    0x000D 0b00000___00001111  #                   lvl 5
      14: 0b000000000001 0x001 0x000E 0b00000___00000001  constant 1
      15: 0b010011000000 0x4C0 0x000F 0b01001___11000000  BOSC_s            # will become BOSC_l after fixups
      16: 0b000000000000 0x000 0x0010 0b00000___00000000                    # gets replaced by any unwanted interrupt 'calling' it
      17: 0b011000001111 0x60F 0x0011 0b01100___00001111  LDX_s IA = 0x0F   # jump back two cells
      18: 0b000000000000 0x000 0x0012 0b00000___00000000                    # gets replaced by saved accumulator
      19: 0b             0x    0x0013 0b11000___00111110  LD_s  IA-2        # restore accumulator       
      20: 0b             0x    0x0014 0b01001___11000000  BOSC_l            # needs fixup!
      21: 0b000000000000 0x000 0x0015 0b00000___00000000                    # gets replaced with saved IA during interrupt
      22: 0b             0x    0x0016 0b11010___11111011  ST0_s IA-5        # temp save accumulator
      23: 0b             0x    0x0017 0b00001___00010000  XIO_s IA+16       # do a Sense Device XIO  as only the ibm1442 card reader/punch is at interrupt level 0
      24: 0b             0x    0x0018 0b00010___00000001  SLA_s 1           # shift Read response bit into Carry
      25: 0b             0x    0x0019 0b01001___00000010  SKCO_s            # SKip next cell if Carry Off
      26: 0b             0x    0x001A 0b01100___00011100  LDX_s IA = 0x1C   # 
      27: 0b             0x    0x001B 0b01100___00010011  LDX_s IA = 0x13   # go and return from the interrupt
      28: 0b             0x    0x001C 0b00010___00000010  SLA_s 2           # shift Error Check bit into Carry
      29: 0b             0x    0x001D 0b01001___00000010  SKCO_s            # SKip next cell if Carry Off
      30: 0b             0x    0x001E 0b01100___00011110  LDX_s IA = 0x1E   # an Error occured at the ibm1442 card reader, so infinity loop
      31: 0b             0x    0x001F 0b00001___00001010  XIO_s IA+10       # do a Read XIO
      32: 0b             0x    0x0020 0b11000___00001001  LD_s  IA+9        # load the address part of the Read IOCC into the accumulator
      33: 0b             0x    0x0021 0b10000___11100000  ADD_s IA-20       # incr it by one         ( 0d24 = 0d16 + 0d08 = 0x18 = 0b00011000 )
      34: 0b             0x    0x0022 0b11010___00000111  STO_s IA+7        # store it back
      35: 0b             0x    0x0023 0b11100___00000100  AND_s IA+4        # and it with 0x0003
      36: 0b             0x    0x0024 0b01001___00100000  SKAZ_s            # SKip next cell if Accumulator is Zero
      37: 0b             0x    0x0025 0b01100___00010011  LDX_s IA = 0x13   # go and return from the interrupt
      38: 0b             0x    0x0026 0b01100___00010011  LDX_s IA = 0x13   # gets overwritten by later loader card
      39: 0b000000000000 0x000 0x0027 0b00000___00000000                    # ditto
      40: 0b000000000011 0x003 0x0028 0b00000___00000011  constant 3
      41: 0b             0x    0x0029 0b00000___00010111  0x0017            # needs fixup via <<_8 ! Sense Devive IOCC2
      42: 0b             0x    0x002A 0b00000___00111111  0x003F            #                                Read IOCC1
      43: 0b             0x    0x002B 0b00000___00100001  0x0021            # needs fixup via <<_9 !         Read IOCC2
      44: 0b000000000000 0x000 0x002C 0b00000___00000000                    # gets replaced by saved accumulator
      45: 0b             0x    0x002D 0b11000___00111110  LD_s  IA-2        # restore accumulator
      46: 0b             0x    0x002E 0b01001___11000000  BOSC_l            # needs fixup!
      47: 0b000000000000 0x000 0x002F 0b00000___00000000                    # gets replaced by saved IA
      48: 0b             0x    0x0030 0b00001___00000011  XIO IA+3          # do Sense Interrupt
      49: 0b             0x    0x0031 0b00010___00000011  SLA 3
      50: 0b             0x    0x0032 0b01001___00000010  SKCO_s            # SKip next cell if Carry Off
      51: 0b             0x    0x0033 0b01100___00101101  LDX_s IA = 0x3F   # jump to newly loaded code
      52: 0b             0x    0x0034 0b01100___00111111  LDX_s IA = 0x2D   # interrupt not from ibm1442 card read, so return from the interrupt
      53: 0b000000000011 0x003 0x0035 0b00000___00000011  0x0003            # needs fixup via <<_8 !  Sense Interrupt IOCC2
      54:
      55:
      56:
      57:
      58:
      59:
      60:
      61:
      62:
      63:
      64:
      65:
      66:
      67:
      68:
      69:
      70:
      71:
 C I  72: 0b             0x___ 0x0048 0b00100___00000000  # L
 A N  73: 0b             0x200 0x0049 0b00100___00000000  # O
 R    74: 0b             0x___ 0x004A 0b00100___00000000  # A
 D I  75: 0b             0x___ 0x004B 0b00100___00000000  # D
 S B  76: 0b             0x___ 0x004C 0b00100___00000000  # E
 E M  77: 0b             0x___ 0x004D 0b00100___00000000  # R
 Q    78: 0b001000000000 0x200 0x004E 0b00100___00000000  # tbd: 0
 #    79: 0b001000000000 0x200 0x004F 0b00100___00000000  # tbd: 0
    END OF CARD

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

      67: 0b             0x    0x0043 0b                  
      68: 0b             0x    0x00   0b
      69: 0b             0x    0x00   0b
      70: 0b             0x    0x00   0b
      71: 0b             0x    0x0047 0b


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


