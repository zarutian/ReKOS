
See Figure 12 page 62 of [Disk Monitor v1 Reference](http://media.ibm1130.org/1130-055-ocr.pdf) for what kind of cards are to be loaded.
See [this](https://www.ibm1130.net/functional/index.html) on how to read cards and the restriction on the loader card.

The restrictions on the loader card:
1. short instructions only
2. all displacements in instructions are relative to Instruction Address except for Shift, BOSC and BSC instructions.

```txt

Loader card 0 in format A:              op      ss displ 
           rows on card                 cell in core
            11    ______                     000==111111
            210123456789   dat   addr   0123456789012345
column 0: 0b110000000110 0xC06 0x0000 0b11000___00000110  LD_s  IA+6        # load constant 1 into the accumulator
       1: 0b000100001010 0x10A 0x0001 0b00010___00001010  SLA_s 10          # shift it left 10 bit places
       2: 0b110101111110 0xD7E 0x0002 0b11010___11111110  STO_s IA-2        # store it as constant 0x0200 (0b0000001000000000)
       3: 0b111010001011 0xE8B 0x0003 0b11101___00001011  OR_s  IA+11       # or it with the BOSC_s instruction at address 0x000F, turning it into BOSC_l
       4: 0b110100001001 0xD09 0x0004 0b11010___00001001  STO_s IA+9        # store it back
       5: 0b110001111011 0xC7B 0x0005 0b11000___11111011  LD_s  IA-5        # load constant 0x0200
       6: 0b011000110100 0x634 0x0006 0b01100___00110100  LDX_s IA = 0x34   # jump to further fixups 
       7: 0b000000000001 0x001 0x0007 0b00000___00000001  constant 1
       8: 0b000000010100 0x014 0x0008 0b00000___00010100  0x14 # Interrupt vector (lvl 0) for 1442 Card Read Punch (column read, punch), we want the column read        
       9: 0b000000001111 0x00F 0x0009 0b00000___00001111  0x0F #                   lvl 1
      10: 0b000000001111 0x00F 0x000A 0b00000___00001111  0x0F #                   lvl 2
      11: 0b000000001111 0x010 0x000B 0b00000___00001111  0x0F #                   lvl 3
      12: 0b000000110100 0x034 0x000C 0b00000___00110100  0x34 # Interrupt vector (lvl 4) for 1442 (operation complete), that is card completely read
      13: 0b000000001111 0x010 0x000D 0b00000___00001111  0x0F #                   lvl 5
      14: 0b010011000000 0x4C0 0x000E 0b01001___11000000  BOSC_l            # needs fixup!
      15: 0b010001000000 0x440 0x000F 0b01000___11000000                    # 'L' gets replaced by any unwanted interrupt 'calling' it
      16: 0b011000001110 0x60E 0x0010 0b01100___00001110  LDX_s IA = 0x0E   # jump back two cells
      17: 0b010000001000 0x408 0x0011 0b01000___00001000                    # 'O' gets replaced by saved accumulator
      18: 0b110001111110 0xC7E 0x0012 0b11000___11111110  LD_s  IA-2        # restore accumulator       
      19: 0b010011000000 0x4C0 0x0013 0b01001___11000000  BOSC_l            # needs fixup!
      20: 0b000000010010 0x012 0x0014 0b00000___00000000  0x0012            # gets replaced with saved IA during interrupt, set here by default to looping
      21: 0b110101111011 0xD7B 0x0015 0b11010___11111011  ST0_s IA-5        # temp save accumulator
      22: 0b000010010110 0x096 0x0016 0b00001___00010110  XIO_s IA+0x16     # do a Read XIO  ( 0x2E - 0x18 = 0x16 )
      23: 0b110000010101 0xC15 0x0017 0b11000___00010101  LD_s  IA+0x15     # load the address part of the Read IOCC into the accumulator
      24: 0b100001101000 0x868 0x0018 0b10000___11101000  ADD_s IA-18       # incr it by one
      25: 0b110100010011 0xD13 0x0019 0b11010___00010011  STO_s IA+0x13     # store it back
      26: 0b110000100100 0xC14 0x001A 0b11000___00010100  LD_s  IA+0x14     # load the state variable
      27: 0b111111101011 0xFEB 0x001B 0b11111___11101011  XOR_s IA-21       # xor it with one        ( 0d21 = 0d16 + 0d05 = 0x15 )
      28: 0b110100010010 0xD12 0x001C 0b11010___00010010  STO_s IA+0x12     # store it back
      29: 0b010010000100 0x484 0x001D 0b01001___00000100  SKAEV             # SKip if Accumulator is EVen
      30: 0b011000010010 0x612 0x001E 0b01100___00010010  LDX_s IA = 0x12   # go and return from the interrupt
      31: 0b110000001110 0xC0E 0x001F 0b11000___00001110  LD_s  IA+14       # load the address part of the Read IOCC into the accumulator
      32: 0b100101100111 0x967 0x0020 0b10010___11100111  MINUS_s IA-26     # subtract one from it ( 0d26 = 0d16 + 0d09 = 0x19 )
      33: 0b110100001100 0xD0C 0x0021 0b11010___00001100  STO_s IA+12       # store it back
      34: 0b110100000100 0xD04 0x0022 0b11010___00000100  STO_s IA+4        # store it as the target address of LD_l downrange
      35: 0b100101100100 0x964 0x0023 0b10010___11100100  MINUS_s IA-29     # subtract one again from it ( 0d29 = 0d16 + 0d12 = 0x1C )
      36: 0b110100000101 0xD05 0x0024 0b11010___00000101  STO_s IA+5        # store it as the target address of OR_l downrange
      37: 0b110100000111 0xD07 0x0025 0b11010___00000110  STO_s IA+7        # store it as the target address of STO_l downrange
      38: 0b110000000000 0xC00 0x0026 0b11000___00000000  LD_l              # needs fixup!  load B
      39: 0b100100000000 0x900 0x0027 0b10010___00000000                    # 'A' gets replaced
      40: 0b000110001000 0x188 0x0028 0b00011___00001000  SRL_s 8           # shift B right 8 bit places
      41: 0b111110000000 0xF80 0x0029 0b11111___00000000  XOR_l             # needs fixup!  or B with A
      42: 0b100000100000 0x820 0x002A 0b10000___00100000                                    # 'D' gets replaced
      43: 0b110100000000 0xD00 0x002B 0b11010___00000000  STO_l             # needs fixup!  overwrite A with the result
      44: 0b100000010000 0x810 0x002C 0b01100___00100000                    # 'E' gets replaced
      45: 0b011000010011 0x612 0x002D 0b01100___00010010  LDX_s IA = 0x12   # return from interrupt
      46: 0b000000110101 0x034 0x002E 0b00000___00110100  0x0034            #                                Read IOCC1
      47: 0b000000100001 0x021 0x002F 0b00000___00100001  0x0021            # needs fixup via <<_9 !         Read IOCC2
      48: 0b000000000000 0x000 0x0030 0b00000___00000000  0x0000            # the state variable
      49: 0b010000000001 0x401 0x0031 0b01000___00000001                    # 'R' gets replaced by saved accumulator
      50: 0b110001111110 0xC7E 0x0032 0b11000___11111110  LD_s  IA-2        # restore accumulator
      51: 0b010011000000 0x4C0 0x0033 0b01001___11000000  BOSC_l            # needs fixup!
      52: 0b111011011100 0xEDC 0x0034 0b11101___11011100  OR_s  IA-34       # or it with the BOSC_s instruction at address 0x0013, turning it into BOSC_l
      53: 0b110101011011 0xD5B 0x0035 0b11010___11011011  STO_s IA-35       # store it back                                       # gets replaced by loader card 1
      54: 0b110001000111 0xC47 0x0036 0b11000___11000111  LD_s  IA-0x36     # load constant 0x0200  ( 0x37 - 0x01 = 0x36 )        # gets replaced by loader card 1
      55: 0b111011111011 0xEFB 0x0037 0b11101___11111011  OR_s  IA-5        # or it with the BOSC_s instruction at address 0x0033 # gets replaced by loader card 1
      56: 0b110101110111 0xD77 0x0038 0b11010___11110111  STO_s IA-6        # store it back                                       # gets replaced by loader card 1
      57: 0b110001000111 0xC47 0x0039 0b11000___11000111  LD_s  IA-0x39     # load constant 0x0200                                # gets replaced by loader card 1
      58: 0b111011101011 0xEEB 0x003A 0b11101___11101011  OR_s  IA-21       # or it with LD_s at 0x0026 (0d21 = 0d16+0d05 = 0x15) # gets replaced by loader card 1
      59: 0b110101101010 0xD6A 0x003B 0b11010___11101010  STO_s IA-22       # store it back                                       # gets replaced by loader card 1
      60: 0b110001000100 0xC44 0x003C 0b11000___11000100  LD_s  IA-0x3C     # load constant 0x0200                                # gets replaced by loader card 1
      61: 0b111011101011 0xEEB 0x003D 0b11101___11101011  OR_s  IA-0x15     # or it with the XOR_s at 0x0029 ( 0x3F - 0x2A = 0x15)# gets replaced by loader card 1
      62: 0b110101101010 0xD6A 0x003E 0b11010___11101010  STO_s IA-0x16     # store it back                                       # gets replaced by loader card 1
      63: 0b110101000001 0xD41 0x003F 0b11000___11000001  LD_s  IA-0x3F     # load constant 0x0200  ( tæpt! -Zarutian )           # gets replaced by loader card 1
      64: 0b111011101010 0xEEA 0x0040 0b11101___11101010  OR_s  IA-0x16     # or it with the STO_s at 0x02B ( 0x42 - 0x2C = 0x16) # gets replaced by loader card 1
      65: 0b110101101001 0xD69 0x0041 0b11010___11101001  STO_s IA-0x17     # store it back                                       # gets replaced by loader card 1
      66: 0b110000000110 0xC06 0x0042 0b11000___00000110  LD_s  IA+6        # load Control Start Read IOCC2                       # gets replaced by loader card 1
      67: 0b000100000101 0x105 0x0043 0b00010___00000101  SLA_s 5           # shift it left 5 bit places                          # gets replaced by loader card 1
      68: 0b110111000011 0xDC3 0x0044 0b11101___11000011  OR_s  IA-0x3D     # or it with constant 1 ( 0x44 - 0x07 = 0x3D )        # gets replaced by loader card 1
      69: 0b000100000010 0x102 0x0045 0b00010___00000010  SLA_s 2           # shift it left 2 bit places                          # gets replaced by loader card 1
U C I 70: 0b110100000010 0xD02 0x0046 0b11010___00000010  STO_s IA+2        # store it back                                       # gets replaced by loader card 1
S A N 71: 0b110001101000 0xC68 0x0047 0b11000___11101000  LD_s  IA-0x18     # load from 0x002F ( 0x47 - 0x2F = 0x40 - 0x29 = 0x20 - 0x09 = 0x18 )
U R   72: 0b000100001001 0x109 0x0048 0b00010___00001001  SLA_s 9           # shift it left 9 bit places                          # gets replaced by loader card 1
A D I 73: 0b110101100101 0xD65 0x0049 0b11010___11100101  STO_s IA-0x1B     # store it back                                       # gets replaced by loader card 1
L S B 74: 0b000010000000 0x080 0x004A 0b00001___00000000  XIO_s IA+0        # do XIO Control Start Read IOCC2                     # gets replaced by loader card 1
L E M 75: 0b011000010010 0x612 0x004B 0b01100___00010010  LDX_s IA = 12     # try to return from an never happened interrupt      # gets replaced by loader card 1
Y Q   76: 0b000000101000 0x028 0x004C 0b00000___00101000                    #                                                     # gets replaced by loader card 1
      77: 0b000000000000 0x000 0x004D 0b00000___00000000                    #                                                     # gets replaced by loader card 1
      78: 0b100100000000 0x900 0x004E 0b10010___00000000                    # 'A'                                                 # gets replaced by loader card 1
  #   79: 0b001000000000 0x200 0x004F 0b00100___00000000                    # '0'                                                 # gets replaced by loader card 1
    END OF CARD
```
[![Loader card A0](./LoaderCard_A0.png)](https://www.masswerk.at/keypunch/?q=%0B0306040A)

```txt
Loader card 1 in format B:
column 0: 0b000000000000 0x000 0x0034 0b00000000________
       1: 0b000000000000 0x000 0x0034 0b________00000000  NOP               # gets replaced by saved IA during the CARD COMPLETE interrupt
       2: 0b        0000 0x  0 0x0035 0b        ________
       3: 0b        0000 0x  0 0x0035 0b________          LD_s IA+          # load card down counter into accumlator
       4: 0b        0000 0x  0 0x0036 0b        ________
       5: 0b        0000 0x  0 0x0036 0b________          MINUS_s IA+       # decrement it by one
       6: 0b        0000 0x  0 0x0037 0b        ________
       7: 0b        0000 0x  0 0x0037 0b________          STO_s IA+         # store it back
       8: 0b        0000 0x  0 0x0038 0b        ________
       9: 0b        0000 0x  0 0x0038 0b________          BSC_l AZ          # branch if Accumulator is Zero
      10: 0b        0000 0x  0 0x0039 0b        ________
      11: 0b        0000 0x  0 0x0039 0b________                            # branch destination
      12: 0b        0000 0x  0 0x003A 0b        ________
      13: 0b        0000 0x  0 0x003A 0b________          LD_l              # load Read column IOCC1
      14: 0b000000000000 0x000 0x003B 0b00000000________  0x00__
      15: 0b001011110000 0x2F0 0x003B 0b________00101111  0x__2F            # the location of that IOCC1
      16: 0b        0000 0x  0 0x003C 0b        ________
      17: 0b        0000 0x  0 0x003C 0b________          MINUS_s IA+       
      18: 0b        0000 0x  0 0x003D 0b        ________
      19: 0b        0000 0x  0 0x003D 0b________          STO_l
      20: 0b000000000000 0x  0 0x003E 0b00000000________  0x00__
      21: 0b001011110000 0x  0 0x003E 0b________00101111  0x__2F
      22: 0b        0000 0x  0 0x003F 0b        ________
      23: 0b        0000 0x  0 0x003F 0b________          XIO_s IA+         # do a XIO Control Read Initial
      24: 0b        0000 0x  0 0x0040 0b        ________
      25: 0b        0000 0x  0 0x0040 0b________          LDX_s IA = 0x33   # return from the interrupt
      26: 0b000000000000 0x000 0x0041 0b00000000________
      27: 0b000000010000 0x010 0x0041 0b________00000001                    # constant 1       
      28: 0b000000000000 0x000 0x0044 0b00000000________
      29: 0b0000    0000 0x0 0 0x0044 0b________0000                        # card downcounter
      30: 0b        0000 0x  0 0x0045                     
      31: 0b        0000 0x  0 0x0045                                       # Ctrl Read Init IOCC2
      32: 0b        0000 0x  0 0x0046
      33: 0b        0000 0x  0 0x0046                     LD_s IA+          # load the LDX_l IA instruction at 0x004E into the accumulator
      34: 0b        0000 0x  0 0x0047
      35: 0b        0000 0x  0 0x0047                     STO_l             # overwrite part of the Card Column Read Interrupt Service Routine
      36: 0b000000000000 0x000 0x0048 0b00000000________  0x00__
      37: 0b000110110000 0x080 0x0048 0b________000011011 0x__1B
      38: 0b        0000 0x  0 0x0049 0b        ________
      39: 0b        0000 0x  0 0x0049 0b________          LD_s IA+          # load the destination branch address of that new jump being patched in
      40: 0b        0000 0x  0 0x004A 0b        ________
      41: 0b        0000 0x  0 0x004A 0b________          STO_l             # store it after that copied LDX_l IA
      42: 0b000000000000 0x  0 0x004B 0b00000000________  0x00__
      43: 0b000111000000 0x  0 0x004B 0b________00011100  0x__1C
      44: 0b        0000 0x  0 0x004C 0b        ________
      45: 0b        0000 0x  0 0x004C 0b________          LD_s IA+          # load the new Card Complete Interrupt vector
      46: 0b        0000 0x  0 0x004D 0b        ________
      47: 0b        0000 0x  0 0x004D 0b________          STO_l             # overwrite that interrupt vector
      48: 0b000000000000 0x  0 0x004E 0b00000000________  0x00__
      49: 0b000011000000 0x  0 0x004E 0b________00001100  0x__0C
      50: 0b        0000 0x  0 0x004F 0b        ________  
      51: 0b        0000 0x  0 0x004F 0b________          LD_s IA+          # load starting address
      52: 0b        0000 0x  0 0x0050 0b        ________
      53: 0b        0000 0x  0 0x0050 0b________          STO_l
      54: 0b000000000000 0x000 0x0051 0b00000000________
      55: 0b001011110000 0x2F0 0x0051 0b________00101111  0x__2F            # the location of Read Column IOCC1
      56: 0b        0000 0x  0 0x0052 0b        ________
      57: 0b        0000 0x  0 0x0052 0b________          LDX_l IA        
      58: 0b000000000000 0x000 0x0053 0b00000000________  0x00__
      59: 0b010000000000 0x400 0x0053 0b________01000000  0x__40
      60: 0b        0000 0x  0 0x0054 0b        ________
      61: 0b        0000 0x  0 0x0054 0b________          Card Column Read interrupt routine continuence vector
      62: 0b        0000 0x  0 0x0055 0b        ________
      63: 0b        0000 0x  0 0x0055 0b________          New Card Complete interrupt vector
      64: 0b000000010000 0x010 0x0056 0b00000001________
      65: 0b000000000000 0x000 0x0056 0b________00000000  New Start address
      66: 0b        0000 0x  0 0x0057 0b        ________
      67: 0b        0000 0x  0 0x0057 0b________          LD_l              # load the address part of the Read IOCC into the accumulator
      68: 0b000000000000 0x000 0x0058 0b00000000________  0x00__
      69: 0b001011110000 0x2F0 0x0058 0b________00101111  0x__2F            # the location of that IOCC1
      70: 0b        0000 0x  0 0x0059 0b        ________
      71: 0b        0000 0x  0 0x0059 0b________          MINUS_s IA+       # subtract four from it
      72: 0b        0000 0x  0 0x005A 0b        ________
      73: 0b        0000 0x  0 0x005A 0b________          STO_l             # set the X1 register to what is in the accumulator
      74: 0b000000000000 0x000 0x005B 0b00000000________  0x00__
      75: 0b000000010000 0x010 0x005B 0b________00000001  0x__01
      76: 0b        0000 0x  0 0x005C 0b        ________
      77: 0b        0000 0x  0 0x005C 0b________          LD_li  (X1+1)     # load cell B into accumulator
      78: 0b100010000000 0x880 0x005D 0b10001000________                    # 'B'   gets overwritten in core by loader card 2
      79: 0b000100000000 0x100 0x005D 0b________00010000                    # '1'   ditto
    END OF CARD

Loader card 2 in format B:
column 0: 0b000000000000 0x000 0x005D 0b00000000________  0x00__
       1: 0b000000010000 0x010 0x005D 0b________00000001  0x__01
       2: 0b000110000000 0x180 0x005E 0b00011000________
       3: 0b000011000000 0x0C0 0x005E 0b________00001100  SRL_s  12         # shift right by 12 bits
       4: 0b        0000 0x  0 0x005F 0b        ________
       5: 0b        0000 0x  0 0x005F 0b________          OR_li  (X1+0)     # or that part by cell A
       6: 0b000000000000 0x000 0x0060 0b00000000________  0x00__
       7: 0b000000000000 0x000 0x0060 0b________00000000  0x__00
       8: 0b        0000 0x  0 0x0061 0b        ________
       9: 0b        0000 0x  0 0x0061 0b________          STO_li (X1+0)     # store now full cell A
      10: 0b000000000000 0x000 0x0062 0b00000000________  0x00__
      11: 0b000000000000 0x000 0x0062 0b________00000000  0x__00
      12: 0b        0000 0x  0 0x0063 0b        ________
      13: 0b        0000 0x  0 0x0063 0b________          LD_li  (X1+1)     # load cell B again
      14: 0b000000000000 0x000 0x0064 0b00000000________  0x00__
      15: 0b000000010000 0x010 0x0064 0b________00000001  0x__01
      16: 0b        0000 0x  0 0x0065 0b        ________
      17: 0b        0000 0x  0 0x0065 0b________          SLA_s  8          # shift left by 8 bits
      18: 0b        0000 0x  0 0x0066 0b        ________
      19: 0b        0000 0x  0 0x0066 0b________          STO_li (X1+1)     # store the now half cell B
      20: 0b000000000000 0x000 0x0067 0b00000000________  0x00__
      21: 0b000000010000 0x010 0x0067 0b________00000000  0x__01
      22: 0b        0000 0x  0 0x0068 0b        ________
      23: 0b        0000 0x  0 0x0068 0b________          LD_si  (X1+2)     # load cell C
      24: 0b000000000000 0x000 0x0069 0b00000000________  0x00__
      25: 0b000000100000 0x020 0x0069 0b________00000010  0x__02
      26: 0b        0000 0x  0 0x006A 0b        ________
      27: 0b        0000 0x  0 0x006A 0b________          SRL_s  8          # shift right by 8 bits
      28: 0b        0000 0x  0 0x006B 0b        ________
      29: 0b        0000 0x  0 0x006B 0b________          OR_li  (X1+1)     #  or it with cell B
      30: 0b000000000000 0x000 0x006C 0b00000000________  0x00__
      31: 0b000000010000 0x010 0x006C 0b________00000001  0x__01
      32: 0b        0000 0x  0 0x006D 0b        ________
      33: 0b        0000 0x  0 0x006D 0b________          STO_li (X1+1)     #  store now full cell B
      34: 0b000000000000 0x000 0x006E 0b00000000________  0x00__
      35: 0b000000010000 0x010 0x006E 0b________00000001  0x__01
      36: 0b        0000 0x  0 0x006F 0b        ________
      37: 0b        0000 0x  0 0x006F 0b________          LD_li  (X1+2)     #  load cell C again
      38: 0b000000000000 0x000 0x0070 0b00000000________  0x00__
      39: 0b000000100000 0x020 0x0070 0b________00000010  0x__02
      40: 0b        0000 0x  0 0x0071 0b        ________
      41: 0b        0000 0x  0 0x0071 0b________          SLA_s  8          #  shift left it 8bits
      42: 0b        0000 0x  0 0x0072 0b        ________
      43: 0b        0000 0x  0 0x0072 0b________          STO_li (X1+2)     #  store it back
      44: 0b000000000000 0x000 0x0073 0b        ________  0x00__
      45: 0b000000100000 0x020 0x0073 0b________          0x__02
      46: 0b        0000 0x  0 0x0074 0b        ________  
      47: 0b        0000 0x  0 0x0074 0b________          LD_li  (X1+3)     #  load cell D
      48: 0b000000000000 0x000 0x0075 0b00000000________  0x00__
      49: 0b000000110000 0x030 0x0075 0b________00000011  0x__03
      50: 0b        0000 0x  0 0x0076 0b        ________
      51: 0b        0000 0x  0 0x0076 0b________          OR_li  (X1+2)     #  or it with what is left of cell C
      52: 0b000000000000 0x000 0x0077 0b00000000________  0x00__
      53: 0b000000100000 0x020 0x0077 0b________00000010  0x__02
      54: 0b        0000 0x  0 0x0078 0b        ________
      55: 0b        0000 0x  0 0x0078 0b________          STO_li (X1+2)     #   store cell C and D back
      56: 0b000000000000 0x000 0x0079 0b00000000________  0x00__
      57: 0b000000100000 0x020 0x0079 0b________00000010  0x__02
      58: 0b        0000 0x  0 0x007A 0b        ________
      59: 0b        0000 0x  0 0x007A 0b________          LD_l              #  load the address part of the Read IOCC into the accumulator
      60: 0b        0000 0x  0 0x007B 0b        ________
      61: 0b        0000 0x  0 0x007B 0b________
      62: 0b        0000 0x  0 0x007C 0b        ________
      63: 0b        0000 0x  0 0x007C 0b________          MINUS_l IA+       #  decr by one
      64: 0b        0000 0x  0 0x007D 0b        ________
      65: 0b        0000 0x  0 0x007D 0b________          STO_l             #  store it back
      66: 0b        0000 0x  0 0x007E 0b        ________
      67: 0b        0000 0x  0 0x007E 0b________
      68: 0b        0000 0x  0 0x007F 0b        ________
      69: 0b        0000 0x  0 0x007F 0b________          LDX_s IA = 0x     # go and return from the interrupt
      70: 0b000000000000 0x000 0x0080 0b00000000________
      71: 0b000001000000 0x040 0x0080 0b________00000100                    # constant 4
      72: 0b000000000000 0x000 0x0081 0b00000000________
      73: 0b000000110000 0x030 0x0081 0b________00000011                    # constant 3
      74: 0b000000000000 0x000 0x0082 0b00000000________
      75: 0b000000010000 0x010 0x0082 0b________00000001                    # constant 1
      76: 0b        0000 0x  0 0x0083 0b        ________
      77: 0b        0000 0x  0 0x0083 0b________          XIO_s             # do Sense Device   New Card Complete Interrupt vector points here
      78: 0b100010000000 0x880 0x0084 0b10001000________                    # 'B'   gets overwritten in core by loader card 3
      79: 0b000010000000 0x100 0x0084 0b________00001000                    # '2'   ditto
    END OF CARD

Loader card 3 in format B:
column 0: 0b        0000 0x  0 0x0084 0b        ________                    # Check if this was the last card
       1: 0b        0000 0x  0 0x0084 0b________          SLA_s 4           # Shift Last Card bit into the carry
       2: 0b        0000 0x  0 0x0085 0b        ________
       3: 0b        0000 0x  0 0x0085 0b________          BRCZ_l
       4: 0b000000000000 0x000 0x0086 0b00000000________  0x00__
       5: 0b100010100000 0x8A0 0x0086 0b________10001010  0x__8A            # branch target
       6: 0b        0000 0x  0 0x0087 0b        ________
       7: 0b        0000 0x  0 0x0087 0b________          BOSC_l
       8: 0b000000010000 0x010 0x0088 0b00000001________
       9: 0b000000000000 0x000 0x0088 0b________00000000
      10: 0b        0000 0x  0 0x0089 0b        ________
      11: 0b        0000 0x  0 0x0089 0b________                            # Sense Device IOCC2
      12: 0b        0000 0x  0 0x008A 0b        ________
      13: 0b        0000 0x  0 0x008A 0b________          LD_l              # Load Read Column IOCC1 into accumulator
      14: 0b000000000000 0x000 0x008B 0b00000000________  0x00__
      15: 0b001011110000 0x2F0 0x008B 0b________00101111  0x__2F
      16: 0b        0000 0x  0 0x008C 0b        ________
      17: 0b        0000 0x  0 0x008C 0b________          MINUS_s IA+       # Subtract six from it
      18: 0b        0000 0x  0 0x008D 0b        ________
      19: 0b        0000 0x  0 0x008D 0b________          STO_l             # Store it back
      20: 0b000000000000 0x000 0x008E 0b00000000________  0x00__
      21: 0b001011110000 0x2F0 0x008E 0b________00101111  0x__2F
      22: 0b        0000 0x  0 0x008F 0b        ________
      23: 0b        0000 0x  0 0x008F 0b________          STO_l             # Store it into X1  Check for the 'END CARD' ?stub? card, that is a card whose columns 73-80 spell out that.
      24: 0b000000000000 0x000 0x0090 0b00000000________  0x00__            #                   alternatively one can switch out the last loader card to have the loader finish at
      25: 0b000000010000 0x010 0x0090 0b________00000001  0x__01            #                   and spefic card and start executing the loaded core
      26: 0b        0000 0x  0 0x0091 0b        ________  
      27: 0b        0000 0x  0 0x0091 0b________          LD_s  IA+         # Load str_addr
      28: 0b        0000 0x  0 0x0092 0b        ________
      29: 0b        0000 0x  0 0x0093 0b________          STO_l             # Store it into X2
      30: 0b000000000000 0x000 0x0094 0b00000000________  0x00__
      31: 0b000000100000 0x020 0x0094 0b________00000010  0x__02
      32: 
      33: 0b        0000 0x  0 0x0095 0b________          LD_s  IA+         # Load count
      34:
      35: 0b        0000 0x  0 0x0096 0b________          STO_l             # Store it into X3
      36: 0b000000000000 0x000 0x0097 0b00000000________  0x00__
      37: 0b000000110000 0x030 0x0097 0b________00000011  0x__03
      38: 0b        0000 0x  0 0x0098 0b        ________
      39: 0b        0000 0x  0 0x0098 0b________          LD_li (X1+0)      #
      40: 0b000000000000 0x000 0x0099 0b00000000________  0x00__
      41: 0b000000000000 0x000 0x0099 0b________00000000  0x__00
      42: 0b        0000 0x  0 0x009A 0b        ________  
      43: 0b        0000 0x  0 0x009A 0b________          XOR_li (X2+0)     #
      44: 0b000000000000 0x000 0x009B 0b00000000________  0x00__
      45: 0b000000000000 0x000 0x009B 0b________00000000  0x__00
      46:
      47: 0b        0000 0x  0 0x009C 0b________          BRAZ_l
      48:
      49:
      50:
      51: 0b        0000 0x  0 0x009E 0b________          LDX_l IA =        # go and issue a new card read init
      52:
      53:
      54:
      55: 0b        0000 0x  0 0x00A0 0b________          LD_l              # load X3
      56:
      57:
      58:
      59: 0b        0000 0x  0 0x00A2 0b________          MINUS_l IA+       # decrement it by one
      60:
      61: 0b        0000 0x  0 0x00A3 0b________          STO_l             # store it back
      62:
      63:
      64:
      65: 0b        0000 0x  0 0x00A5 0b________          BRAZ_l            # branch to loading done if accumulator is zero
      66:
      67:
      68:
      69: 0b        0000 0x  0 0x00A7 0b________          LDX_l IA
      70:
      71:
      72: 0b000000000000 0x000 0x00A9 0b00000000________  0x00__
      73: 0b000001100000 0x060 0x00A9 0b________00000110  0x__06
      74: 0b000000000000 0x000 0x00AA 0b00000000________  0x00__
      75: 0b000000010000 0x010 0x00AA 0b________00000001  0x__01
      76:
      77:
      78: 0b100010000000 0x880 0x00AC 0b10001000________                    # 'B'   gets overwritten in core by loader card 4
      79: 0b             0x    0x00AC 0b________                            # '3'   ditto
    END OF CARD

Loader card 4 in packed IBM EBDIC CARD CODE in format B:
column 0: 0b        0000 0x  0 0x00AC 'E'
       1: 0b        0000 0x  0 0x00AC
       2: 0b        0000 0x  0 0x00AD 'N'
       3: 0b        0000 0x  0 0x00AD
       4: 0b        0000 0x  0 0x00AE 'D'
       5: 0b        0000 0x  0 0x00AE
       6: 0b        0000 0x  0 0x00AF ' '
       7: 0b        0000 0x  0 0x00AF
       8: 0b        0000 0x  0 0x00B0 'C'
       9: 0b        0000 0x  0 0x00B0
      10: 0b        0000 0x  0 0x00B1 'A'
      11: 0b        0000 0x  0 0x00B1
      12: 0b        0000 0x  0 0x00B2 'R'
      13: 0b        0000 0x  0 0x00B2
      14: 0b        0000 0x  0 0x00B3 'D'
      15: 0b        0000 0x  0 0x00B3
      16:
      17:
      18:
      19:
      20:
      21:
      22:
      23:
      24:
      25:
      26:
      27:
      28:
      29:
      30:
      31:
      32:
      33:
      34:
      35:
      36:
      37:
      38:
      39:
      40:
      41:
      42:
      43:
      44:
      45:
      46:
      47:
      48:
      49:
      50:
      51:
      52:
      53:
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
      72:
      73:
      74:
      75:
      76:
      77:
      78: 0b100010000000 0x880 0x00__ 0b10001000________                    # 'B'
      79: 0b____________ 0x020 0x00__ 0b________                            # '4'   ditto
    END OF CARD
      
      
      
 
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

[Empty but marked B format punchcard](https://www.masswerk.at/keypunch/?b=DCA2OQwMNjg5DAw2NzkMDDY5DCAMNzg5DAw2OAwMNzg5DCAMNjc4OQwMNjgMDDc5DCAMNzg5NgwMOQwMNjc4OQwgDDYMDDY3ODkMDDYMIAw2OQwMNzg5NgwMNjkMIAw3ODkMDDY4DAw3ODkMIAw2Nzg5DAw3DAw4DAw2Nzg5DCAMNjcMIAw3OQwMNjkMDDY4DCAgIAw2Nzg5DAw5DAw5DCAMNzgMDDY5DAw3OAwgDDc4OQwMNjgMDDc4OQwgDDY3ODkMDDY5DAw3OAwgDDY3DCAMNjc4OQwMNjgMDDc5)


