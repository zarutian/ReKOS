
See Figure 12 page 62 of [Disk Monitor v1 Reference](http://media.ibm1130.org/1130-055-ocr.pdf) for what kind of cards are to be loaded.
See [this](https://www.ibm1130.net/functional/index.html) on how to read cards and the restriction on the loader card.

The restrictions on the loader card:
1. short instructions only
2. all displacements in instructions are relative to Instruction Address except for Shift, BOSC and BSC instructions.

```txt

Loader card 0 in format A:              op      ss displ 
           rows on card                 cell in core
            11                               000==111111
            210123456789   dat   addr   0123456789012345
column 0: 0b110000001100 0xC0C 0x0000 0b11000___00001100  LD_s  IA+13       # load constant 1 into the accumulator
       1: 0b000100001010 0x10A 0x0001 0b00010___00001010  SLA_s 10          # shift it left 10 bit places
       2: 0b110100000100 0xD04 0x0002 0b11010___00000100  STO_s IA+4        # store it as constant 0x0200 (0b0000001000000000)
       3: 0b111010001011 0xE8B 0x0003 0b11101___00001011  OR_s  IA+11       # or it with the BOSC_s instruction at address 0x000F, turning it into BOSC_l
       4: 0b110100001010 0xD0A 0x0004 0b11010___00001010  STO_s IA+10       # store it back
       5: 0b110000000001 0xC01 0x0005 0b11000___00000001  LD_s  IA+1        # load constant 0x0200
       6: 0b011000110101 0x635 0x0006 0b01100___00110101  LDX_s IA = 0x35   # jump to further fixups 
       7: 0b000001000010 0x042 0x0007 0b00000___11000010
       8: 0b000000010101 0x015 0x0008 0b00000___00010101  0x15 # Interrupt vector (lvl 0) for 1442 Card Read Punch (column read, punch), we want the column read        
       9: 0b000000010000 0x010 0x0009 0b00000___00010000  0x10 #                   lvl 1
      10: 0b000000010000 0x010 0x000A 0b00000___00010000  0x10 #                   lvl 2
      11: 0b000000010000 0x010 0x000B 0b00000___00010000  0x10 #                   lvl 3
      12: 0b000000110101 0x035 0x000C 0b00000___00110101  0x35 # Interrupt vector (lvl 4) for 1442 (operation complete), that is card completely read
      13: 0b000000010000 0x010 0x000D 0b00000___00001111  0x10 #                   lvl 5
      14: 0b000000000001 0x001 0x000E 0b00000___00000001  constant 1
      15: 0b010011000000 0x4C0 0x000F 0b01001___11000000  BOSC_l            # needs fixup!
      16: 0b000000000000 0x000 0x0010 0b00000___00000000                    # gets replaced by any unwanted interrupt 'calling' it
      17: 0b011000001111 0x60F 0x0011 0b01100___00001111  LDX_s IA = 0x0F   # jump back two cells
      18: 0b000000000000 0x000 0x0012 0b00000___00000000                    # gets replaced by saved accumulator
      19: 0b110001111110 0xC7E 0x0013 0b11000___11111110  LD_s  IA-2        # restore accumulator       
      20: 0b010011000000 0x4C0 0x0014 0b01001___11000000  BOSC_l            # needs fixup!
      21: 0b000000010011 0x000 0x0015 0b00000___00000000  0x0013            # gets replaced with saved IA during interrupt
      22: 0b110101111011 0xD7B 0x0016 0b11010___11111011  ST0_s IA-5        # temp save accumulator
      23: 0b000010010110 0x096 0x0017 0b00001___00010110  XIO_s IA+0x16     # do a Read XIO  ( 0x2F - 0x19 = 0x16 )
      24: 0b110000010101 0xC15 0x0018 0b11000___00010101  LD_s  IA+0x15     # load the address part of the Read IOCC into the accumulator
      25: 0b100001100000 0x860 0x0019 0b10000___11100000  ADD_s IA-20       # incr it by one         ( 0d24 = 0d16 + 0d08 = 0x18 = 0b00011000 )
      26: 0b110100010011 0xD13 0x001A 0b11010___00010011  STO_s IA+0x13     # store it back
      27: 0b110000100100 0xC14 0x001B 0b11000___00010100  LD_s  IA+0x14     # load the state variable
      28: 0b111111110010 0xFF2 0x001C 0b11111___11110010  XOR_s IA-15       # xor it with one
      29: 0b110100010010 0xD12 0x001D 0b11010___00010010  STO_s IA+0x12     # store it back
      30: 0b010010000100 0x484 0x001E 0b01001___00000100  SKAEV             # SKip if Accumulator is EVen
      31: 0b011000010011 0x613 0x001F 0b01100___00010011  LDX_s IA = 0x13   # go and return from the interrupt
      32: 0b             0x    0x0020 0b11000___00001110  LD_s  IA+14       # load the address part of the Read IOCC into the accumulator
      33: 0b             0x    0x0021 0b10010___11101100  MINUS_s IA-20     # subtract one from it ( 0d20 = 0x14 )
      34: 0b             0x    0x0022 0b11010___00001100  STO_s IA+12       # store it back
      35: 0b             0x    0x0023 0b11010___00000100  STO_s IA+4         # store it as the target address of LD_l downrange
      36: 0b             0x    0x0024 0b10010___11101001  MINUS_s IA-23     # subtract one again from it ( 0d23 = 0x17 )
      37: 0b             0x    0x0025 0b11010___00000101  STO_s IA+5        # store it as the target address of OR_l downrange
      38: 0b             0x    0x0026 0b11010___00000110  STO_s IA+7        # store it as the target address of STO_l downrange
      39: 0b             0x    0x0027 0b11000___00000000  LD_l              # needs fixup!  load B
      40: 0b001000000001 0x201 0x0028 0b00100___00000001                    # gets replaced
      41: 0b             0x    0x0029 0b00011___00001000  SRL_s 8           # shift B right 8 bit places
      42: 0b111110000000 0xF80 0x002A 0b11111___00000000  XOR_l             # needs fixup!  or B with A
      43: 0b110000001000 0xC08 0x002B 0b11000___00001000                    # gets replaced
      44: 0b110100000000 0xD00 0x002C 0b11010___00000000  STO_l             # needs fixup!  overwrite A with the result
      45: 0b011000100000 0x620 0x002D 0b01100___00100000                    # gets replaced
      46: 0b011000010011 0x613 0x002E 0b01100___00010011  LDX_s IA = 0x13   # return from interrupt
      47: 0b000000110101 0x035 0x002F 0b00000___00110101  0x0035            #                                Read IOCC1
      48: 0b000000100001 0x021 0x0030 0b00000___00100001  0x0021            # needs fixup via <<_9 !         Read IOCC2
      49: 0b000000000000 0x000 0x0031 0b00000___00000000  0x0000            # the state variable
      50: 0b101000000001 0xA01 0x0032 0b10100___00000001                    # gets replaced by saved accumulator
      51: 0b             0x    0x0033 0b11000___00111110  LD_s  IA-2        # restore accumulator
      52: 0b             0x    0x0034 0b01001___11000000  BOSC_l            # needs fixup!
      53: 0b             0x    0x0035 0b11101___11011100  OR_s  IA-34       # or it with the BOSC_s instruction at address 0x0014, turning it into BOSC_l
      54: 0b             0x    0x0036 0b11010___11011011  STO_s IA-35       # store it back                                       # gets replaced by loader card 1
      55: 0b             0x    0x0037 0b11000___11010000  LD_s  IA-0x30     # load constant 0x0200  ( 0x37 - 0x07 = 0x30 )        # gets replaced by loader card 1
      56: 0b             0x    0x0038 0b11101___11111011  OR_s  IA-5        # or it with the BOSC_s instruction at address 0x0034 # gets replaced by loader card 1
      57: 0b             0x    0x0039 0b11010___11110111  STO_s IA-6        # store it back
      58: 0b             0x    0x003A 0b11000___11001101  LD_s  IA-0x33     # load constant 0x0200
      59: 0b             0x    0x003C 0b11101___11101011  OR_s  IA-21       # or it with LD_s at 0x0027 (0d21 = 0d16+0d05 = 0x15) # gets replaced by loader card 1
      60: 0b             0x    0x003D 0b11010___11101010  STO_s IA-22       # store it back
      61: 0b             0x    0x003E 0b11000___11001010  LD_s  IA-0x36     # load constant 0x0200
      62: 0b             0x    0x003F 0b11101___11101011  OR_s  IA-0x15     # or it with the XOR_s at 0x002A ( 0x3F - 0x2A = 0x15)# gets replaced by loader card 1
      63: 0b             0x    0x0040 0b11010___11101010  STO_s IA-0x16     # store it back
      64: 0b             0x    0x0041 0b11000___11000111  LD_s  IA-0x39     # load constant 0x0200
      66: 0b             0x    0x0042 0b11101___11101010  OR_s  IA-0x16     # or it with the STO_s at 0x02C ( 0x42 - 0x2C = 0x16) # gets replaced by loader card 1
      67: 0b             0x    0x0043 0b11010___11101001  STO_s IA-0x17     # store it back
      68: 0b             0x    0x0044 0b11000___11101100  LD_s  IA-0x14     # load from 0x0030 ( 0x44 - 0x30 = 0x14 )
      69: 0b             0x    0x0045 0b00010___00001001  SLA_s 9           # shift it left 9 bit placrs
      70: 0b             0x    0x0046 0b11010___11101010  STO_s IA-0x16     # store it back
      71: 0b110000000110 0xC06 0x0047 0b11000___00000110  LD_s  IA+6        # load Control Start Read IOCC2
U C I 72: 0b000100000101 0x105 0x0048 0b00010___00000101  SLA_s 5           # shift it left 5 bit places
S A N 73: 0b111011000101 0xEC5 0x0049 0b11101___11000101  OR_s  IA-0x3B     # or it with constant 1 ( 0x49 - 0x0E = 0x40 - 0x05 = 0x3B )
U R   74: 0b000100000010 0x102 0x004A 0b00010___00000010  SLA_s 2           # shift it left 2 bit places
A D I 75: 0b110100000010 0xD02 0x004B 0b11010___00000010  STO_s IA+2        # store it back
L S B 76: 0b000010000000 0x080 0x004C 0b00001___00000000  XIO_s IA+0        # do XIO Control Start Read IOCC2
L E M 77: 0b011000010011 0x613 0x004D 0b01100___00010011  LDX_s IA = 13     # try to return from an non existant interrupt
Y Q   78: 0b000000101000 0x028 0x004E 0b00000___00101000
  #   79: 0b001000000000 0x200 0x004F 0b00100___00000000                    # '0'
    END OF CARD

Loader card 1 in format B:
column 0: 0b000000000000 0x000 0x0035 0b00000000________
       1: 0b000000000000 0x000 0x0035 0b________00000000  NOP               # gets replaced by saved IA during the CARD COMPLETE interrupt
       2: 0b        0000 0x  0 0x0036 0b        ________
       3: 0b        0000 0x  0 0x0036 0b________          LD_s IA+          # load card down counter into accumlator
       4: 0b        0000 0x  0 0x0037 0b        ________
       5: 0b        0000 0x  0 0x0037 0b________          MINUS_s IA+       # decrement it by one
       6: 0b        0000 0x  0 0x0038 0b        ________
       7: 0b        0000 0x  0 0x0038 0b________          STO_s IA+         # store it back
       8: 0b        0000 0x  0 0x0039 0b        ________
       9: 0b        0000 0x  0 0x0039 0b________          BSC_l AZ          # branch if Accumulator is Zero
      10: 0b        0000 0x  0 0x003A 0b        ________
      11: 0b        0000 0x  0 0x003A 0b________                            # branch destination
      12: 0b        0000 0x  0 0x003B 0b        ________
      13: 0b        0000 0x  0 0x003B 0b________          LD_l              # load Read column IOCC1
      14: 0b000000000000 0x000 0x003C 0b00000000________  0x00__
      15: 0b001011110000 0x2F0 0x003C 0b________00101111  0x__2F            # the location of that IOCC1
      16: 0b        0000 0x  0 0x003D 0b        ________
      17: 0b        0000 0x  0 0x003D 0b________          MINUS_s IA+       
      18: 0b        0000 0x  0 0x003E 0b        ________
      19: 0b        0000 0x  0 0x003E 0b________          STO_l
      20: 0b000000000000 0x  0 0x003F 0b00000000________  0x00__
      21: 0b001011110000 0x  0 0x003F 0b________00101111  0x__2F
      22: 0b        0000 0x  0 0x0040 0b        ________
      23: 0b        0000 0x  0 0x0040 0b________          XIO_s IA+         # do a XIO Control Read Initial
      24: 0b        0000 0x  0 0x0041 0b        ________
      25: 0b        0000 0x  0 0x0041 0b________          LDX_s IA = 0x33   # return from the interrupt
      26: 0b000000000000 0x000 0x0042 0b00000000________
      27: 0b000000010000 0x010 0x0042 0b________00000001                    # constant 1       
      28: 0b000000000000 0x000 0x0043 0b00000000________
      29: 0b0000    0000 0x0 0 0x0043 0b________0000                        # card downcounter
      30: 0b        0000 0x  0 0x0044                     
      31: 0b        0000 0x  0 0x0044                                       # Ctrl Read Init IOCC2
      32: 0b        0000 0x  0 0x0045
      33: 0b        0000 0x  0 0x0045                     LD_s IA+          # load the LDX_l IA instruction at 0x004E into the accumulator
      34: 0b        0000 0x  0 0x0046
      35: 0b        0000 0x  0 0x0046                     STO_l             # overwrite part of the Card Column Read Interrupt Service Routine
      36: 0b000000000000 0x000 0x0047 0b00000000________  0x00__
      37: 0b000110110000 0x080 0x0047 0b________000011011 0x__1B
      38: 0b        0000 0x  0 0x0048 0b        ________
      39: 0b        0000 0x  0 0x0048 0b________          LD_s IA+          # load the destination branch address of that new jump being patched in
      40: 0b        0000 0x  0 0x0049 0b        ________
      41: 0b        0000 0x  0 0x0049 0b________          STO_l             # store it after that copied LDX_l IA
      42: 0b000000000000 0x  0 0x004A 0b00000000________  0x00__
      43: 0b000111000000 0x  0 0x004A 0b________00011100  0x__1C
      44: 0b        0000 0x  0 0x004B 0b        ________
      45: 0b        0000 0x  0 0x004B 0b________          LD_s IA+          # load the new Card Complete Interrupt vector
      46: 0b        0000 0x  0 0x004C 0b        ________
      47: 0b        0000 0x  0 0x004C 0b________          STO_l             # overwrite that interrupt vector
      48: 0b000000000000 0x  0 0x004D 0b00000000________  0x00__
      49: 0b000011000000 0x  0 0x004D 0b________00001100  0x__0C
      50: 0b        0000 0x  0 0x004E 0b        ________
      51: 0b        0000 0x  0 0x004E 0b________          LDX_l IA        
      52: 0b000000000000 0x000 0x004C 0b00000000________  0x00__
      53: 0b010000000000 0x400 0x004C 0b________01000000  0x__40
      54: 0b        0000 0x  0 0x004D 0b        ________
      55: 0b        0000 0x  0 0x004D 0b________          Card Column Read interrupt routine continuence vector
      56: 0b        0000 0x  0 0x004E 0b        ________
      57: 0b        0000 0x  0 0x004E 0b________          New Card Complete interrupt vector
      58: 0b        0000 0x  0 0x004F 0b        ________
      59: 0b        0000 0x  0 0x004F 0b________          LD_l              # load the address part of the Read IOCC into the accumulator
      60: 0b000000000000 0x000 0x0050 0b00000000________  0x00__
      61: 0b001011110000 0x2F0 0x0050 0b________00101111  0x__2F            # the location of that IOCC1
      62: 0b        0000 0x  0 0x0051 0b        ________
      63: 0b        0000 0x  0 0x0051 0b________          MINUS_s IA+       # subtract four from it
      64: 0b        0000 0x  0 0x0052 0b        ________
      65: 0b        0000 0x  0 0x0052 0b________          STO_l             # set the X1 register to what is in the accumulator
      66: 0b000000000000 0x000 0x0053 0b00000000________  0x00__
      67: 0b000000010000 0x010 0x0053 0b________00000001  0x__01
      68: 0b        0000 0x  0 0x0054 0b        ________
      69: 0b        0000 0x  0 0x0054 0b________          LD_li  (X1+1)     # load cell B into accumulator
      70: 0b000000000000 0x000 0x0055 0b00000000________  0x00__
      71: 0b000000010000 0x010 0x0055 0b________00000000  0x__01
      72: 0b000110000000 0x180 0x0056 0b00011000________
      73: 0b000011000000 0x0C0 0x0056 0b________00001100  SRL_s  12         # shift right by 12 bits
      74: 0b        0000 0x  0 0x0057 0b        ________
      75: 0b        0000 0x  0 0x0057 0b________          OR_li  (X1+0)     # or that part by cell A
      76: 0b000000000000 0x000 0x0058 0b00000000________  0x00__
      77: 0b000000000000 0x000 0x0058 0b________00000000  0x__00
      78: 0b100010000000 0x880 0x0059 0b10001000________                    # 'B'   gets overwritten in core by loader card 2
      79: 0b000100000000 0x100 0x0059 0b________00010000                    # '1'   ditto
    END OF CARD

Loader card 2 in format B:
column 0: 0b        0000 0x  0 0x0059 0b        ________
       1: 0b        0000 0x  0 0x0059 0b________          STO_li (X1+0)     # store now full cell A
       2: 0b000000000000 0x000 0x005A 0b00000000________  0x00__
       3: 0b000000000000 0x000 0x005A 0b________00000000  0x__00
       4: 0b        0000 0x  0 0x005B 0b        ________
       6: 0b        0000 0x  0 0x005B 0b________          LD_li  (X1+1)     # load cell B again
       7: 0b000000000000 0x000 0x005C 0b00000000________  0x00__
       8: 0b000000010000 0x010 0x005C 0b________00000001  0x__01
       9: 0b        0000 0x  0 0x005D 0b        ________
      10: 0b        0000 0x  0 0x005D 0b________          SLA_s  8          # shift left by 8 bits
      11: 0b        0000 0x  0 0x005E 0b        ________
      12: 0b             0x    0x005E 0b                  STO_si (X1+1)     # store the now half cell B

      47: 0b             0x    0x002F 0b                  LD_si  (X1+2)     # load cell C
      48: 0b             0x    0x0030 0b                  SRL_s  8          # shift right by 8 bits
      49: 0b             0x    0x0031 0b                  OR_si  (X1+1)     #  or it with cell B
      50: 0b             0x    0x0032 0b                  STO_si (X1+1)     #  store now full cell B
      51: 0b             0x    0x0033 0b                  LD_si  (X1+2)     #  load cell C again
      52: 0b             0x    0x0034 0b                  SLA_s  8          #  shift left it 8bits
      53: 0b             0x    0x0035 0b                  STO_si (X1+2)     #  store it back
      54: 0b             0x    0x0036 0b                  LD_si  (X1+3)     #  load cell D
      55: 0b             0x    0x0037 0b                  OR_si  (X1+2)     #  or it with what is left of cell C
      56: 0b             0x    0x0038 0b                  STO_si (X1+2)     #   store cell C and D back
      57: 0b             0x    0x0039 0b                  LD_s   IA+        #  load the address part of the Read IOCC into the accumulator
      58: 0b             0x    0x003A 0b                  MINUS_s IA-       #  decr by one
      59: 0b             0x    0x003B 0b                  STO_s  IA         #  store it back
      60: 0b             0x    0x003C 0b01100___00        LDX_s IA = 0x     # go and return from the interrupt
      62: 0b             0x    0x003E 0b00000___00000100                    # constant 4
      63: 0b             0x    0x003F 0b00000___00000011                    # constant 3


 
```

```
A:   the native loader card format
B:
     11
     2101 2345 6789
     AAAA AAAA 0000
     BBBB BBBB 0000

                 11 1111
     0123 4567 8901 2345
     AAAA AAAA BBBB BBBB
C:
     11
     2101 2345 6789
     AAAA AAAA AAAA
     BBBB BBBB BBBB
     CCCC CCCC CCCC
     DDDD DDDD DDDD

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


