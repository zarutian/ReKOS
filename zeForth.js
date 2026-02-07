const src = `

  #  fcpu32/16 ( cell is 32bit, instr is 16bit )
  
  .def NOP             0x0000
  .def +               0x0001
  .def PLUS            +
  .def &               0x0002
  .def AND             &
  .def ^               0x0003
  .def XOR             ^
  .def 1<<>            0x0004
  .def ONELBR          1<<>
  .def 1+              0x0005
  .def INCR            1+
  .def @               0x0006
  .def FETCH           @
  .def !               0x0007
  .def STORE           !
  .def DUP             0x0008
  .def DROP            0x0009
  .def SWAP            0x000A
  .def SKZ             0x000B
  # SKip if Zero
  .def >R              0x000C
  .def TO_R            >R
  .def R>              0x000D
  .def R_FROM          R>
  .def EXT             0x000E
  .def EXIT            0x000F
  .def ;               EXIT
  # above is fcpu16 compatible
  .def C@              0x0010
  .def CHAR_FETCH      C@
  .def C!              0x0011
  .def CHAR_STORE      C!
  .def H@              0x0012
  .def HALFCELL_FETCH  H@
  .def H!              0x0013
  .def HALFCELL_STORE  H!
  .def -               0x0014
  .def MINUS           -
  .def 1-              0x0015
  .def DECR            1-
  .def <<>             0x0016
  .def LBR             <<>
  .def LeftBitRotate   <<>
  .def <>>             0x0017
  .def RBR             <>>
  .def RightBitRotate  <>>
  .def <<              0x0018
  .def LSHIFT          <<
  .def LeftSHIFT       <<
  .def >>              0x0019
  .def RSHIFT          >>
  .def RightSHIFT      >>
  .def /%              0x001A
  .def DIVMOD          /%
  .def |               0x001B
  .def OR              |
  .def *               0x001C
  .def MULTIPLY        *
  .def KALL            0x001D
  .def KRET            0x001E
  .def KFORK           0x001F
  .def (JMP)           0x0020
  .def (BRZ)           0x0021
  .def (NXT)           0x0022
  .def R@              0x0023
  
  # IBMz  fcpu32/16
  # GR0   tmp0
  # GR1   tmp1
  # GR2   tmp2
  # GR3   tmp3
  # GR4   tmp4
  # GR5   tmp5
  # GR6   tmp6    
  # GR7   tmp7
  # GR8   ibmz_start       used in ibmz code for easier jumps and constants accesses
  # GR9   instruction_ptr
  # GR10  instruction
  # GR11  datastack_ptr    (usually 0x00FDxx)
  # GR12  returnstack_ptr  (usually 0x00FExx)
  # GR13  ext_traphandler


  # looks like its save to start here in main storage
  .org 0x2000
  : __start
  .dhw 0x1788        # XR  GR8, GR8              gr8 := 0
  .dhw 0x4188 0x0200 # LA  GR8, 0x200 (GR8, 0)   gr8 := 0x200
  .dhw 0x8980 0x0004 # SLL GR8, 0x004            gr8 := gr8 << 4
  : NOP_ibmz
  : NXT_ibmz
  .dhw 0x48A9 0x0000 # LH GR10, 0x000 (GR9, 0)   instr := memory[instr_ptr]
  .dhw 0x4199 0x0002 # LA GR9,  0x002 (GR9, 0)   incr instr_ptr by halfcell (2 bytes)
  .dhw 0x5410 0x82F6 # N  GR1,  0x2F6 (0, GR8)   tmp1 := tmp1 & 0xFFFF  cancel out the sign extension
  .dhw 0x5810 0x82FC # L  GR1,  0x2FC (0, GR8)   tmp1 := 0xFFC0
  .dhw 0x141A        # NR GR1,  GR10             tmp1 := tmp1 & instr
  .dhw 0x4780 0x8030 # BC 8,    0x030 (0, GR8)   jump if result was zero
  .dhw 0x509C 0x0000 # ST GR9,  0x000 (GR12, 0)  push instr_ptr onto returnstack
  .dhw 0x41CC 0x0004 # LA GR12, 0x004 (GR12, 0)  incr returnstack_ptr by 4
  .dhw 0x1799        # XR GR9,  GR9              zero out instr_ptr ...
  .dhw 0x179A        # XR GR9,  GR10             instr_ptr := instr
  .dhw 0x47F0 0x800A # BC 0xF,  0x00A (0, GR8)   jump to NXT
  .dhw 0x1711        # XR GR1,  GR1              zero out tmp1
  .dhw 0x171A        # XR GR1,  GR10             tmp1 := instr
  .dhw 0x8910 0x0001 # SLL GR1, 1 (0, 0)         tmp1 := tmp1 << 1
  .dhw 0x4821 0x8302 # LH GR2,  0x302 (GR1, GR8) tmp2 := memory[tmp1 + ibm370_start + opcode_jmptbl]
  .dhw 0x5420 0x82F6 # N  GR2,  0x2F6 (0, GR8)   tmp2 := tmp2 & 0xFFFF   cancel out the sign extension
  .dhw 0x07F2        # BCR 0xF, GR2

  : (PLUS)
  .dhw (ibmz)
  : PLUS_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11             tmp2 := memory[datastack_ptr]
  .dhw 0x1E12        # ALR GR1, GR2              tmp1 := (tmp1 + tmp2) & 0xFFFFFFFF
  .org 0x2052
  : COMMON_TAIL1_ibmz
  .dhw 0x501B 0x0000 # ST GR1,  0x000 (GR11, 0)  memory[datastack_ptr] := tmp1
  .dhw 0x41BB 0x0004 # LA GR11, 0x004 (GR11, 0)  datastack_ptr := datastack_ptr + 4
  .dhw 0x47F0 0x800A # BC 0xF,  0x00A (0, GR8)   jump to NXT

  : (AND)
  .dhw (ibmz)
  : AND_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11             tmp2 := memory[datastack_ptr]
  .dhw 0x1412        # NR GR1,  GR2              tmp1 := tmp1 & tmp2
  .dhw 0x47F0 0x8052 # BC 0xF,  0x052 (0, GR8)   jump to COMMON_TAIL1

  : (XOR)
  .dhw (ibmz)
  : XOR_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11             tmp2 := memory[datastack_ptr]
  .dhw 0x1712        # XR GR1,  GR2              tmp1 := tmp1 ^ tmp2
  .dhw 0x47F0 0x8052 # BC 0xF,  0x052 (0, GR8)   jump to COMMON_TAIL1

  : (1LBR)
  .dhw (ibmz)
  : ONELBR_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x1722        # XR GR2,  GR2              tmp2 := 0
  .dhw 0x1721        # XR GR2,  GR1              tmp2 := tmp1
  .dhw 0x8910 0x0001 # SLL GR1, 0x001 (0, 0)     tmp1 := tmp1 << 1
  .dhw 0x8820 0x001F # SRL GR2, 0x01F (0, 0)     tmp2 := tmp2 >> 31
  .dhw 0x1612        # OR GR1,  GR2              tmp1 := tmp1 | tmp2
  .dhw 0x47F0 0x8052 # BC 0xF,  0x052 (0, GR8)   jump to COMMON_TAIL1

  : (1+)
  .dhw (ibmz)
  : INCR_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x4111 0x0001 # LA GR1,  0x001 (GR1, 0)   tmp1 := tmp1 + 1
  .dhw 0x47F0 0x8052 # BC 0xF,  0x052 (0, GR8)   jump to COMMON_TAIL1

  : (@)
  .dhw (ibmz)
  : FETCH_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11             tmp2 := memory[datastack_ptr]
  .dhw 0x1812        # LR GR1,  GR2              tmp1 := memory[tmp2]
  .dhw 0x47F0 0x8052 # BC 0xF,  0x052 (0, GR8)   jump to COMMON_TAIL1

  : (!)
  .dhw (ibmz)
  : STORE_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11             tmp2 := memory[datastack_ptr]
  .dhw 0x5021 0x0000 # ST GR2,  0x000 (GR1, 0)   memory[tmp1] := tmp2
  .dhw 0x47F0 0x800A # BC 0xF,  0x00A (0, GR8)   jump to NXT

  : (DUP)
  .dhw (ibmz)
  : DUP_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x41BB 0x0004 # LA GR11, 0x004 (GR11, 0)  datastack_ptr := datastack_ptr + 4
  .dhw 0x47F0 0x8052 # BC 0xF,  0x052 (0, GR8)   jump to COMMON_TAIL1

  : (DROP)
  .dhw (ibmz)
  : DROP_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x47F0 0x800A # BC 0xF,  0x00A (0, GR8)   jump to NXT

  : (SWAP)
  .dhw (ibmz)
  : SWAP_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11             tmp2 := memory[datastack_ptr]
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x502B 0x0000 # ST GR2,  0x000 (GR11, 0)  memory[datastack_ptr] := tmp2
  .dhw 0x41BB 0x0004 # LA GR11, 0x004 (GR11, 0)  datastack_ptr := datastack_ptr + 4
  .dhw 0x47F0 0x8052 # BC 0xF,  0x052 (0, GR8)   jump to COMMON_TAIL1

  : (SKZ)
  .dhw (ibmz)
  : SKZ_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x121B        # LTR GR1, GR11             tmp1 := memory[datastack_ptr]   conditioncode updated
  .dhw 0x4770 0x8000 # BC 0x7, 0x000 (0, GR8)    if tmp1 isnt zero then jump to NXT
  .dhw 0x4199 0x0002 # LA GR9, 0x002 (GR9, 0)    instruction_ptr := instruction_pointer + 2
  .dhw 0x47F0 0x800A # BC 0xF, 0x00A (0, GR8)    jump to NXT

  : (>R)
  .dhw (ibmz)
  : TO_R_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x501C 0x0000 # ST GR1,  0x000 (GR12, 0)  memory[returnstack_pointer] := tmp1
  .dhw 0x41CC 0x0004 # LA GR12, 0x004 (GR7, 0)   returnstack_pointer := returnstack_pointer + 4
  .dhw 0x47F0 0x800A # BC 0xF,  0x00A (0, GR8)   jump to NXT

  : (R>)
  .dhw (ibmz)
  : R_FROM_ibmz
  .dhw 0x5FC0 0x82F0 # SL GR12, 0x2F0 (0, GR8)   returnstack_ptr := returnstack_ptr - 4
  .dhw 0x181C        # LR GR1,  GR12             tmp1 := memory[returnstack_ptr]
  .dhw 0x47F0 0x8052 # BC 0xF,  0x052 (0, GR8)   jump to COMMON_TAIL1

  : (EXIT)
  .dhw (ibmz)
  : EXIT_ibmz
  .dhw 0x5FC0 0x82F0 # SL GR12, 0x2F0 (0, GR8)   returnstack_ptr := returnstack_ptr - 4
  .dhw 0x189C        # LR GR9,  GR12             instr_ptr := memory[returnstack_ptr]
  .dhw 0x47F0 0x800A # BC 0xF,  0x00A (0, GR8)   jump to NXT

  : (EXT)
  .dhw (ibmz)
  : EXT_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11              tmp1 := memory[datastack_ptr]
  .dhw 0x5910 0x8384 # C  GR1,  0x384 (0, GR8)    compare tmp1 to 'IBMe'
  .dhw 0x4770 0x8160 # BC 0x7,  0x160 (0, GR8)    if tmp1 != 'IBMe' then jump to ext_trapvectoring
  : jump2ibmz
  .dhw 0x5FC0 0x82F0 # SL GR12, 0x04A (0, GR8)    returnstack_ptr := returnstack_ptr - 4
  .dhw 0x181C        # LR GR1,  GR12              tmp1 := memory[returnstack_ptr]
  .dhw 0x07F1        # BCR 0xF, GR1               jump to where tmp1 points to
  : ext_trapvectoring
  .dhw 0x41BB 0x0004 # LA GR11, 0x004 (GR11, 0)   datastack_ptr := datastack_ptr + 4
  : trapvector
  .dhw 0x509C 0x0000 # ST GR9,  0x000 (GR12, 0)   memory[returnstack_ptr] := instruction_ptr
  .dhw 0x41CC 0x0004 # LA GR12, 0x004 (GR12, 0)   returnstack_ptr := returnstack_ptr + 4
  .dhw 0x47F0 0d8000 # BC 0xF,  0x000 (0, GR13)   jump to trap handling code

  : (KFORK)
  .dhw (ibmz)
  : KFORK_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x187B        # LR GR7,  GR11              tmp7 := memory[datastack_ptr]       ctb
  .dhw 0x1807        # LR GR0,  GR7               tmp0 := memory[tmp7]
  .dhw 0x5810 0x7004 # L  GR1,  0x004 (0, GR7)    tmp1 := memory[tmp7 + 0x004]
  .dhw 0x5820 0x7008 # L  GR2,  0x008 (0, GR7)    tmp2 := memory[tmp7 + 0x008]
  .dhw 0x5830 0x700C # L  GR3,  0x00C (0, GR7)    tmp3 := memory[tmp7 + 0x00C]
  .dhw 0x0AFF        # SVC 0xFF                   keykos fork syscall
  .dhw 0x47F0 0x800A # BC 0xF,  0x00A (0, GR8)    jump to NXT

  : (KALL)
  .dhw (ibmz)
  : KALL_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x187B        # LR GR7,  GR11              tmp7 := memory[datastack_ptr]       ctb
  .dhw 0x1807        # LR GR0,  GR7               tmp0 := memory[tmp7]
  .dhw 0x5810 0x7004 # L  GR1,  0x004 (0, GR7)    tmp1 := memory[tmp7 + 0x004]
  .dhw 0x5820 0x7008 # L  GR2,  0x008 (0, GR7)    tmp2 := memory[tmp7 + 0x008]
  .dhw 0x5830 0x700C # L  GR3,  0x00C (0, GR7)    tmp3 := memory[tmp7 + 0x00C]
  .dhw 0x6820 0x7010 # LD FR2   0x010 (0, GR7)     fr2 := memory[tmp7 + 0x010]
  .dhw 0x5840 0x7018 # L  GR4,  0x018 (0, GR7)    tmp4 := memory[tmp7 + 0x018]
  .dhw 0x5850 0x701C # L  GR5,  0x01C (0, GR7)    tmp5 := memory[tmp7 + 0x01C]
  .dhw 0x0AFD        # SVC 0xFD                   keykos call syscall
  .dhw 0x5030 0x7020 # ST GR3,  0x020 (0, GR7)    memory[tmp7 + 0x020] := tmp3
  .dhw 0x5010 0x7024 # ST GR1,  0x024 (0, GR7)    memory[tmp7 + 0x024] := tmp1
  .dhw 0x5020 0x7028 # ST GR2,  0x028 (0, GR7)    memory[tmp7 + 0x028] := tmp2
  .dhw 0x47F0 0x800A # BC 0xF,  0x00A (0, GR8)    jump to NXT

  : (KRET)
  .dhw (ibmz)
  : KRET_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x187B        # LR GR7,  GR11              tmp7 := memory[datastack_ptr]       ctb
  .dhw 0x1807        # LR GR0,  GR7               tmp0 := memory[tmp7]
  .dhw 0x5810 0x7004 # L  GR1,  0x004 (0, GR7)    tmp1 := memory[tmp7 + 0x004]
  .dhw 0x5820 0x7008 # L  GR2,  0x008 (0, GR7)    tmp2 := memory[tmp7 + 0x008]
  .dhw 0x5830 0x700C # L  GR3,  0x00C (0, GR7)    tmp3 := memory[tmp7 + 0x00C]
  .dhw 0x6820 0x7010 # LD FR2   0x010 (0, GR7)     fr2 := memory[tmp7 + 0x010]
  .dhw 0x5840 0x7018 # L  GR4,  0x018 (0, GR7)    tmp4 := memory[tmp7 + 0x018]
  .dhw 0x5850 0x701C # L  GR5,  0x01C (0, GR7)    tmp5 := memory[tmp7 + 0x01C]
  .dhw 0x0AFE        # SVC 0xFE                   keykos return syscall
  .dhw 0x5030 0x7020 # ST GR3,  0x020 (0, GR7)    memory[tmp7 + 0x020] := tmp3
  .dhw 0x5010 0x7024 # ST GR1,  0x024 (0, GR7)    memory[tmp7 + 0x024] := tmp1
  .dhw 0x5020 0x7028 # ST GR2,  0x028 (0, GR7)    memory[tmp7 + 0x028] := tmp2
  .dhw 0x47F0 0x800A # BC 0xF,  0x00A (0, GR8)    jump to NXT

  : (C@)
  .dhw (ibmz)
  : CHAR_FETCH_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11              tmp2 := memory[datastack_ptr]  addr
  .dhw 0x1711        # XR GR1,  GR1               tmp1 := 0
  .dhw 0x4312 0x0000 # IC GR1,  0x000 (GR2, 0)    tmp1 := memory[tmp2 - 3] & 0xFF
  .dhw 0x47F0 0x8052 # BC 0xF,  0x052 (0, GR8)    jump to COMMON_TAIL1

  : (C!)
  .dhw (ibmz)
  : CHAR_STORE_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11              tmp2 := memory[datastack_ptr]  addr
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11              tmp1 := memory[datastack_ptr]  char
  .dhw 0x4212 0x0000 # STC GR1, 0x000 (GR2, 0)    memory[tmp2 - 3] := (tmp1 & 0xFF) | (memory[tmp2 - 3] & 0xFFFFFF00)
  .dhw 0x47F0 0x800A # BC 0xF,  0x00A (0, GR8)    jump to NXT

  : (H@)
  .dhw (ibmz)
  : HALFCELL_FETCH_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11              tmp2 := memory[datastack_ptr]  addr
  .dhw 0x4812 0x0000 # LH GR1,  0x000 (GR2, 0)    tmp1 := memory[tmp2]
  .dhw 0x5410 0x82F6 # N  GR1,  0x2F6 (0, GR8)    tmp1 := tmp1 & 0xFFFF   cancel out the sign extension
  .dhw 0x47F0 0x8052 # BC 0xF,  0x052 (0, GR8)    jump to COMMON_TAIL1

  : (H!)
  .dhw (ibmz)
  : HALFCELL_STORE_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11              tmp2 := memory[datastack_ptr]  addr
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11              tmp1 := memory[datastack_ptr]  halfcell
  .dhw 0x4012 0x0000 # STH GR1, GR2               store the halfcell
  .dhw 0x47F0 0c800A # BC 0xF,  0x00A (0, GR8)    jump to NXT

  : (-)
  .dhw (ibmz)
  : MINUS_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11              tmp2 := memory[datastack_ptr]  addr
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11
  : COMMON_TAIL2_ibmz
  .dhw 0x1F12        # SLR GR1, GR2
  .dhw 0x47F0 0x8052 # BC 0xF,  0x052 (0, GR8)    jump to COMMON_TAIL1

  : (1-)
  .dhw (ibmz)
  : DECR_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11              tmp1 := memory[datastack_ptr]
  .dhw 0x1722        # XR GR2,  GR2               tmp2 := 0
  .dhw 0x4122 0x0001 # LA GR2,  0x001 (GR2, 0)    tmp2 := 1
  .dhw 0x47F0 0x8254 # BC 0xF,  0x254 (0, GR8)    jump to COMMON_TAIL2

  : (OR)
  .dhw (ibmz)
  : OR_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11              tmp1 := TOS
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11              tmp2 := NOS
  .dhw 0x1612        # OR GR1,  GR2               tmp1 := tmp1 | tmp2
  .dhw 0x47F0 0x8052 # BC 0xF,  0x052 (0, GR8)    jump to COMMON_TAIL1

  : (*)
  .dhw (ibmz)
  : MULTIPLY_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11              tmp1 := TOS
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x183B        # LR GR3,  GR11              tmp3 := NOS
  .dhw 0x1C21        # MR GR2,  GR1               xxx: possibly a bug here as the MultiplyRegister instruction
                     #                                 specifies as a destination a register pair GR2 and GR3
                     #                                 need to zero out GR2 beforehand? if so do it with XR GR2, GR2
                     #                                 After consulting IBM Z PoOPs  GR2 does not need to be zeroed out.
  : COMMON_TAIL3_ibmz
  .dhw 0x502B 0x0000 # ST GR2,  0x000 (GR11, 0)   memory[datastack_ptr] := tmp2    reminder or upper half of product
  .dhw 0x41BB 0x0004 # LA GR11, 0x004 (GR11, 0)   datastack_ptr := datastack_ptr + 4
  .dhw 0x503B 0x0000 # ST GR3,  0x000 (GR11, 0)   memory[datastack_ptr] := tmp3    quotent  or lower half of product
  .dhw 0x41BB 0x0004 # LA GR11, 0x004 (GR11, 0)   datastack_ptr := datastack_ptr + 4
  .dhw 0x47F0 0x800A # BC 0xF,  0x00A (0, GR8)    jump to NXT

  : (/%)
  .dhw (ibmz)
  : DIVMOD_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11              tmp1 := memory[datastack_ptr]   divisor
  .dhw 0x1722        # XR GR2,  GR2               tmp2 := 0
  .dhw 0x1733        # XR GR3,  GR3               tmp3 := 0
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x1912        # CR GR1,  GR2               tmp1 compared to tmp2
  .dhw 0x4780 0x8290 # BC 0x8,  0x290 (0, GR8)    if equal then jump to COMMON_TAIL3
  .dhw 0x183B        # LR GR3,  GR11              tmp3 := memory[datastack_ptr]   dividend
  .dhw 0x1D21        # DR GR2,  GR1               divide
  .dhw 0x47F0 0x8290 # BC 0xF,  0x290 (0, GR8)    jump to COMMON_TAIL3

  : (<<)
  .dhw (ibmz)
  : LSHIFT_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11
  .dhw 0x8910 0x2000 # SLL GR1, 0x000 (0, GR2)
  .dhw 0x47F0 0x8052 # BC 0xF,  0x052 (0, GR8)    jump to COMMON_TAIL1

  : (>>)
  .dhw (ibmz)
  : RSHIFT_ibmz
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11
  .dhw 0x8810 0x2000 # SRL GR1, 0x000 (0, GR2)
  .dhw 0x47F0 0x8052 # BC 0xF,  0x052 (0, GR8)    jump to COMMON_TAIL1

  : 4
  .dhw (CONST)
  .org 0x22F0
  .dw 0x0000_0004    #  4       \ note: also refered to in ibmz code
  : 0xFFFF
  .dhw (CONST)
  .org 0x22F6
  .dw 0x0000_FFFF    #  0xFFFF  \ note: also refered to in ibmz code
  : 0xFFC0
  .dhw (CONST)
  .org 0x22FC
  .dw 0x0000_FFC0    #  0xFFC0  \ note: also refered to in ibmz code

  .org 0x2300
  : fcpu_opcode_jmptbl
  .dhw (VAR)
  .dhw NOP_ibmz
  .dhw PLUS_ibmz
  .dhw AND_ibmz
  .dhw XOR_ibmz
  .dhw ONELBR_ibmz
  .dhw INCR_ibmz
  .dhw FETCH_ibmz
  .dhw STORE_ibmz
  .dhw DUP_ibmz
  .dhw DROP_ibmz
  .dhw SWAP_ibmz
  .dhw SKZ_ibmz
  .dhw TO_R_ibmz
  .dhw R_FROM_ibmz
  .dhw EXT_ibmz
  .dhw EXIT_ibmz
  # above is fcpu16 compatible
  .dhw CHAR_FETCH_ibmz
  .dhw CHAR_STORE_ibmz
  .dhw HALFCELL_FETCH_ibmz
  .dhw HALFCELL_STORE_ibmz
  .dhw MINUS_ibmz
  .dhw DECR_ibmz
  .dhw LBR_ibmz
  .dhw RBR_ibmz
  .dhw LSHIFT_ibmz
  .dhw RSHIFT_ibmz
  .dhw DIVMOD_ibmz
  .dhw OR_ibmz
  .dhw MULTIPLY_ibmz
  .dhw KALL_ibmz
  .dhw KRET_ibmz
  .dhw KFORK_ibmz
  #
  .dhw (JMP)_ibmz
  .dhw (BRZ)_ibmz
  .dhw (NEXT)_ibmz
  .dhw R@_ibmz
  .dhw TRANSLATE_ibmz
  .dhw trapvector  # instrtrap for 0x25
  .dhw trapvector  # instrtrap for 0x26
  .dhw trapvector  # instrtrap for 0x27
  .dhw trapvector  # instrtrap for 0x28
  .dhw trapvector  # instrtrap for 0x29
  .dhw trapvector  # instrtrap for 0x2A
  .dhw trapvector  # instrtrap for 0x2B
  .dhw trapvector  # instrtrap for 0x2C
  .dhw trapvector  # instrtrap for 0x2D
  .dhw trapvector  # instrtrap for 0x2E
  .dhw trapvector  # instrtrap for 0x2F
  .dhw trapvector  # instrtrap for 0x30
  .dhw trapvector  # instrtrap for 0x31
  .dhw trapvector  # instrtrap for 0x32
  .dhw trapvector  # instrtrap for 0x33
  .dhw trapvector  # instrtrap for 0x34
  .dhw trapvector  # instrtrap for 0x35
  .dhw trapvector  # instrtrap for 0x36
  .dhw trapvector  # instrtrap for 0x37
  .dhw trapvector  # instrtrap for 0x38
  .dhw trapvector  # instrtrap for 0x39
  .dhw trapvector  # instrtrap for 0x3A
  .dhw trapvector  # instrtrap for 0x3B
  .dhw trapvector  # instrtrap for 0x3C
  .dhw trapvector  # instrtrap for 0x3D
  .dhw trapvector  # instrtrap for 0x3E
  .dhw trapvector  # instrtrap for 0x3F
  : IBMe
  .dhw (CONST)
  .dhw 0x4942 0x4D65 # 'IBMe'

  : ((JMP))
  .dhw (ibmz)
  : (JMP)_ibmz
  .dhw 0x4899 0x0000 # LH GR9,  0x000 (GR9, 0)    instr_ptr := memory[instr_ptr]
  .dhw 0x5490 0x82F6 # N  GR9,  0x2F6 (0, GR8)    instr_ptr := instr_ptr & 0xFFFF   cancel out the sign extension
  .dhw 0x47F0 0x8000 # BC 0xF,  0x000 (0, GR8)    jump to NXT

  : (R@)
  .dhw (ibmz)
  # R_AT:
  : R@_ibmz
  .dhw 0x5FC0 0x82F0 # SL GR12, 0x2F0 (0, GR8)    returnstack_ptr := returnstack_ptr - 4
  .dhw 0x181C        # LR GR1,  GR12              tmp1 := memory[returnstack_ptr]
  .dhw 0x41CC 0x0004 # LA GR12, 0x004 (GR12, 0)   returnstack_ptr := returnstack_ptr + 4
  .dhw 0x47F0 0x8052 # BC 0xF,  0x052             jump to COMMON_TAIL1

  : ((BRZ))
  .dhw (ibmz)
  # BRZERO:
  : (BRZ)_ibmz
  .dhw 0x4829 0x0000 # LH GR2,  0x000 (GR9, 0)    tmp2 := memory[instr_ptr]
  .dhw 0x5420 0x82F6 # N  GR2,  0x2F6 (0, GR8)    tmp2 := tmp2 & 0xFFFF   cancel out the sign extension
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11              tmp1 := memory[instr_ptr]
  .dhw 0x1733        # XR GR3,  GR3               tmp3 := 0
  .dhw 0x1913        # CR GR1,  GR3               compare tmp1 to tmp3
  .dhw 0x4780 0x83C6 # BC 0x8,  0x3C6 (0, GR8)    if equal the jump to BRZERO_L0
  : COMMON_TAIL4_ibmz
  .dhw 0x4199 0x0002 # LA GR9,  0x002 (GR9, 0)    instr_ptr := instr_ptr + 2
  .dhw 0x47F0 0x800A # BC 0xF,  0x00A (0, GR8)    jump to NXT
  # BRZERO_L0:
  .dhw 0x1799        # XR GR9,  GR9               instr_ptr := 0
  .dhw 0x1792        # XR GR9,  GR2               instr_ptr := tmp2
  .dhw 0x47F0 0x800A # BC 0xF,  0x00A (0, GR8)    jump to NXT

  : ((NEXT))
  .dhw (ibmz)
  # DONEXT:
  : (NEXT)_ibmz
  .dhw 0x5FC0 0x82F0 # SL GR12, 0x2F0 (0, GR8)    returnstack_ptr := returnstack_ptr - 4
  .dhw 0x181C        # LR GR1,  GR12              tmp1 := memory[returnstack_ptr]
  .dhw 0x1722        # XR GR2,  GR2               tmp2 := 0
  .dhw 0x1912        # CR GR1,  GR2               compare tmp1 to tmp2
  .dhw 0x4780 0x83BE # BC 0x8,  0x3BE (0, GR8)    if equal then jump to COMMON_TAIL4
  .dhw 0x4122 0x0001 # LA GR2,  0x001 (GR2, 0)    tmp2 := 1
  .dhw 0x1F12        # SLR GR1, GR2               tmp1 := tmp1 - tmp2
  .dhw 0x501C 0x0000 # ST GR1,  0x000 (GR12, 0)   memory[returnstack_ptr] := tmp1
  .dhw 0x41CC 0x0004 # LA GR12, 0x004 (GR12, 0)   returnstack_ptr := returnstack_ptr + 4
  .dhw 0x47F0 0x838A # BC 0xF,  0x38A (0, GR8)    jump to DOJMP

  : 31
  .dhw (CONST)
  .dw  0x0000_001F
  : 31>>
  .dhw 31 >> ;       # semicolon here is EXIT

  .org 0x2400
  : (JMP)_model
  .dhw R> H@
  : (EXIT)_model
  .dhw EXIT
  
  : 4+
  .dhw 1+
  : 3+
  .dhw 1+
  : 2+
  .dhw 1+ 1+ EXIT
  
  : ?: 
  # ( alt conseq cond -- alt | conseq )
  .dhw SKZ SWAP DROP EXIT
  
  : OVER
  # ( a b -- a b a )
  .dhw >R    # ( a )     R:( b )
  .dhw DUP   # ( a a )   R:( b )
  .dhw R>    # ( a a b ) R:( )
  .dhw SWAP  # ( a b a )
  .dhw EXIT
  
  : (BRZ)_model
  # ( cond -- )
  .dhw R>    # ( cond raddr )  R:( )
  .dhw SWAP  # ( raddr cond )  R:( )
  .dhw >R    # ( raddr )       R:( cond )
  .dhw DUP   # ( raddr raddr )
  .dhw H@    # ( raddr dest )
  .dhw SWAP  # ( dest raddr )
  .dhw 2+    # ( dest raddr+2 ) R:( cond )
  .dhw R>    # ( dest raddr+2 cond ) R:( cond )
  .dhw ?:    # ( addr )
  : EXEC 
  # ( addr -- )
  .dhw >R    # ( ) R:( addr )
  .dhw EXIT  #
  
  : 2DUP
  # ( a b -- a b a b )
  .dhw OVER OVER EXIT
  
  : (CONST)
  # ( -- datum )
  .dhw R>       # ( raddr ) R:( )
  .dhw @        # ( datum )
  .dhw EXIT
  
  : 0xFFFFFFFF
  : TRUE
  .dhw (CONST)
  .dw  0xFFFF_FFFF
  
  : INVERT
  # ( datum -- datumb )
  .dhw 0xFFFFFFFF XOR EXIT
  
  : NEGATE
  # ( n -- -n )
  .dhw INVERT 1+ EXIT
  
  : 1-_model
  # ( u -- u-1 )
  .dhw NEGATE 1+ NEGATE EXIT
  
  : (NEXT)_model
  # ( ) R:( count raddr -- )
  .dhw R>       # ( raddr ) R:( count )
  .dhw R>       # ( raddr count ) R:( )
  .dhw DUP      # ( raddr count count )
  .dhw (BRZ)    # ( raddr count )
  .dhw (NEXT)_model_L0
  .dhw 1-       # ( raddr count-1 )
  .dhw >R       # ( raddr ) R:( count-1 )
  .dhw H@       # ( dest )  R:( count-1 )
  .dhw >R       # ( ) R:( count-1 dest )
  .dhw EXIT
  : (NEXT)_model_L0
  # ( raddr 0 )
  .dhw DROP     # ( raddr )
  .dhw 2+       # ( raddr+2 )
  .dhw >R       # ( ) R:( raddr+4 )
  .dhw EXIT
  
  : 1   
  # ( -- 1 )
  .dhw (CONST)
  .dw  0x0000_0001
  
  : 0x7FFFFFFF
  # ( -- datum )
  .dhw (CONST)
  .dw  0x7FFF_FFFF
  
  : 1<<
  # ( u -- u<<1 )
  : 2*
  # ( u -- u*2 )
  .dhw 0x7FFFFFFF & 1<<> EXIT
  
  : 0x1F
  .dhw (CONST)
  .dw 0x0000_001F
  
  : <<>_model
  # ( u count -- u<<>count )
  .dhw 0x1F & >R # ( u ) R:( count )
  .dhw (JMP)
  .dhw <<>_L1
  : <<>_L0
  .dhw 1<<>
  : <<>_L1
  .dhw (NEXT)
  .dhw <<>_L0
  .dhw EXIT
  
  : (ibmz)
  # ( ... -- ... ) R:( raddr -- )
  # registers GR8 to GR14 must be preserved or handled correctly
  # suggest to re enter NXT at GR8 + 0x00A
  .dhw IBMe EXT EXIT

  : <<>_ibmz_model
  # ( u count -- u<<>count )
  .dhw (ibmz)
  # LBR:
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11             tmp2 := memory[datastack_ptr]
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x183B        # LR GR3,  GR11             tmp3 := tmp1
  .dhw 0x8910 0x2000 # SLL GR1, 0x000 (0, GR2)   tmp1 := tmp1 << tmp2
  .dhw 0x1744        # XR GR4,  GR4              tmp4 := 0
  .dhw 0x4144 0x0020 # LA GR4,  0x020 (GR4, 0)   tmp4 := 32
  .dhw 0x5F42 0x0000 # SL GR4,  0x000 (GR2, 0)   tmp4 := tmp4 - tmp2
  .dhw 0x8830 0x4000 # SRL GR3, 0x000 (0, GR4)   tmp3 := tmp3 >> tmp4
  .dhw 0x1613        # OR GR1,  GR3
  .dhw 47F0 8052 # BC 0xF,  0x052 (0, GR8)   jump to COMMON_TAIL1

  : NAND
  # ( a b -- c )
  .dhw & INVERT EXIT

  : OR_model
  # ( a b -- a|b )
  .dhw INVERT SWAP INVERT NAND EXIT

  : make_mask
               # ( nrOfBits -- mask )
  .dhw 0x1F    # ( nrOfBits 0x1F )
  .dhw &       # ( nrOfBits )
  .dhw 1       # ( nrOfBits 1 )
  .dhw SWAP    # ( 1 nrOfBits )
  .dhw >R      # ( 1 ) R:( nrOfBits )
  .dhw (JMP) make_mask_L1
  : make_mask_L0
  .dhw DUP     # ( datum datum ) R:( count )
  .dhw 1<<>    # ( datum atumd )
  .dhw OR      # ( datum )
  : make_mask_L1
  .dhw (NEXT) make_mask_L0
  .dhw EXIT

  : <<_model 
  # ( u count -- u<<count )
  .dhw 0x1F      # ( u count 0x1F )
  .dhw &         # ( u count )
  .dhw DUP       # ( u count count )
  .dhw >R        # ( u count ) R:( count )
  .dhw make_mask # ( u maskb ) R:( count )
  .dhw INVERT    # ( u mask ) R:( count )
  .dhw SWAP      # ( mask u ) R:( count )
  .dhw R>        # ( mask u count ) R:( )
  .dhw <<>       # ( mask datum )
  .dhw &         # ( datum )
  .dhw EXIT

  : 0xFF
  .dhw (CONST)
  .dw  0x0000_00FF
  
  : -_model
  # ( a b -- a-b )
  .dhw NEGATE   ( a -b )
  .dhw +
  .dhw EXIT

  : >>_model 
  # ( u count -- u>>count )
  .dhw DUP       # ( u count count )
  .dhw >R        # ( u count ) R:( count )
  .dhw make_mask # ( u mask )
  .dhw SWAP      # ( mask u )
  .dhw 0x1F      # ( mask u 0x1F )
  .dhw 1+        # ( mask u 0x20 ) R:( count )
  .dhw R>        # ( mask u 0x20 count ) R:( )
  .dhw -_model   # ( mask u new_count )
  .dhw <<>_model # ( mask datum )
  .dhw &         # ( datum )
  .dhw EXIT

  : 24
  .dhw (CONST)
  .dw  0x0000_0018 # 24

  : C@_model
  # ( addr -- char )
  .dhw @ 24 >>_model EXIT

  : C!_model
  # ( char addr -- )
  .dhw SWAP      # ( addr char )
  .dhw 0xFF      # ( addr char 0xFF )
  .dhw &         # ( addr char
  .dhw OVER      # ( addr char addr )
  .dhw @         # ( addr char cell )
  .dhw 0xFF      # ( addr char cell 0xFF )
  .dhw 24        # ( addr char cell 0xFF 24 )
  .dhw <<_model  # ( addr char cell 0xFF000000 )
  .dhw INVERT    # ( addr char cell 0x00FFFFFF )
  .dhw &         # ( addr char masked )
  .dhw SWAP      # ( addr masked char )
  .dhw 24        # ( addr masked char 24 )
  .dhw <<_model  # ( addr masked char<<24 )
  .dhw OR_model  # ( addr new_datum )
  .dhw SWAP      # ( new_datum addr )
  .dhw !         # ( )
  .dhw EXIT

  : CMOVE_modelA
  # ( src dest len -- src )
  .dhw >R        # ( src dest ) R:( len )
  .dhw (JMP)     # ( src dest ) R:( len )
  .dhw CMOVE_modelA_L1
  : CMOVE_modelA_L0
  .dhw OVER      # ( src dest src ) R:( len )
  .dhw C@_model  # ( src dest char ) R:( len )
  .dhw OVER      # ( src dest char dest ) R:( len )
  .dhw C!_model  # ( src dest ) R:( len )
  .dhw 1+        # ( src dest+1 ) R:( len )
  .dhw SWAP      # ( dest+1 src ) R:( len )
  .dhw 1+        # ( dest+1 src+1 ) R:( len )
  .dhw SWAP      # ( src+1 dest+1 )
  : CMOVE_modelA_L1
  .dhw (NEXT) CMOVE_modelA_L0
  : 2DROP
  .dhw DROP
  : 1DROP
  .dhw DROP
  .dhw EXIT

  : 2
  .dhw (CONST)
  .dw  0x0000_0002 # 2

  : CMOVE_modelB
                # ( src dest len -- )
  .dhw DUP      # ( src dest len len )
  .dhw 2
  .dhw 1+       # ( src dest len len 3 )
  .dhw &        # ( src dest len n )
  .dhw >R       # ( src dest len ) R:( n )
  .dhw 2        # ( src dest len 2 )
  .dhw >>       # ( src dest len/4 )
  .dhw >R       # ( src dest ) R:( n len/4 )
  .dhw (JMP)
  .dhw CMOVE_modelB_L1
  : CMOVE_modelB_L0
                # ( src dest ) R:( n len/4 )
  .dhw OVER     # ( src dest src )
  .dhw @        # ( src dest cell )
  .dhw OVER     # ( src dest cell dest )
  .dhw !        # ( src dest )
  .dhw 4+       # ( src dest+4 )
  .dhw SWAP     # ( dest+4 src )
  .dhw 4+       # ( dest+4 src+4 )
  .dhw SWAP     # ( src+4 dest+4 )
  : CMOVE_modelB_L1
  .dhw (NEXT) CMOVE_modelB_L0
                # ( src+(len/4) dest+(len/4) ) R:( n )
  .dhw R>       # ( src+(len/4) dest+(len/4) n )
  .dhw CMOVE_modelA
  .dhw EXIT

  : CMOVE
  : CMOVE_ibmz
  # ( src dest len -- )
  .dhw (ibmz)
  .dhw 0x5FB0 0x82D8 # SL GR11, 0x2D8 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x183B        # LR GR3,  GR11             tmp3 := memory[datastack_ptr]   len
  .dhw 0x5FB0 0x82D8 # SL GR11, 0x2D8 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11             tmp2 := memory[datastack_ptr]   dest
  .dhw 0x5FB0 0x82D8 # SL GR11, 0x2D8 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x184B        # LR GR4,  GR11             tmp4 := memory[datastack_ptr]   src
  .dhw 0x1755        # XR GR5,  GR5              tmp5 := 0
  .dhw 0x1753        # XR GR5,  GR3              tmp5 := tmp4 ^ tmp3   effectively tmp5 := tmp3
  .dhw 0x0E24        # MVCL GR2, GR4             move the datablock
  .dhw 0x47F0 0x800A # BC 0xF,  0x00A (0, GR8)   jump to NXT

  : ROT
  # ( a b c -- b c a )
  .dhw >R       # ( a b ) R:( c )
  .dhw SWAP     # ( b a ) R:( c )
  .dhw R>       # ( b a c ) R:( )
  .dhw SWAP     # ( b c a )
  .dhw EXIT

  : TRANSLATE_model ( ptr len tbl -- )
  .dhw SWAP     # ( ptr tbl len )
  .dhw >R       # ( ptr tbl ) R:( len )
  .dhw (JMP)    # ( ptr tbl ) R:( len )
  .dhw TRANSLATE_model_L1
  : TRANSLATE_model_L0
  .dhw OVER     # ( ptr tbl ptr ) R:( len )
  .dhw C@_model # ( ptr tbl idx ) R:( len )
  .dhw OVER     # ( ptr tbl idx tbl ) R:( len )
  .dhw +        # ( ptr tbl idx+tbl ) R:( len )
  .dhw C@_model # ( ptr tbl char ) R:( len )
  .dhw ROT      # ( tbl char ptr ) R:( len )
  .dhw DUP      # ( tbl char ptr ptr ) R:( len )
  .dhw >R       # ( tbl char ptr ) R:( len ptr )
  .dhw C!_model # ( tbl ) R:( len ptr )
  .dhw R>       # ( tbl ptr ) R:( len )
  .dhw 1+       # ( tbl ptr+1 ) R:( len )
  .dhw SWAP     # ( ptr+1 tbl ) R:( len )
  : TRANSLATE_model_L1
  .dhw (NEXT)
  .dhw TRANSLATE_model_L0
  .dhw 2DROP
  .dhw EXIT

  : TRANSLATE
  : TRANSLATE_ibmz
  # ( ptr len tbl -- )
  .dhw (ibmz)
  .dhw 0x5FB0 0x8xxx # SL GR11, 0x04A (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11              tmp2 := tbl
  .dhw 0x5FB0 0x8xxx # SL GR11, 0x04A (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x183B        # LR GR3,  GR11              tmp3 := len
  .dhw 0x5FB0 0x8xxx # SL GR11, 0x04A (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11              tmp1 := ptr
  .dhw 0x1744        # XR GR4,  GR4               tmp4 := 0
  .dhw 0x1934        # CR GR3,  GR4
  .dhw 0x4780 0x8000 # BC 0x8,  0x000 (0, GR8)    jump to NXT iff tmp3 == 0
  .dhw 0x4144 0x0001 # LA GR4,  0x001 (GR4, 0)    tmp4 := tmp4 + 1
  .dhw 0x1F34        # SLR GR3, GR4               tmp3 := tmp3 - tmp4
  .dhw 0x4430 0x8672 # EX GR3,  0x672 (0, GR8)    execute the TRANSLATE instruction from 0x2672
  .dhw 0x4133 0x0001 # LA GR3,  0x001 (0, GR3)    tmp3 := tmp3 + 1
  .dhw 0x1744        # XR GR4,  GR4               tmp4 := 0
  .dhw 0x4144 0x00FF # LA GR4,  0x0FF (GR4, 0)    tmp4 := 0xFF
  .dhw 0x1743        # XR GR4,  GR3               tmp4 := tmp4 ^ tmp3
  .dhw 0x4114 0x0000 # LA GR1,  0x000 (GR4, 0)    tmp1 := tmp1 + tmp4
  .dhw 0x8830 0x0008 # SRL GR3, 0x008 (0, 0)      tmp3 := tmp3 >> 8
  .dhw 0x1744        # XR GR4,  GR4
  .dhw 0x1934        # CR GR3,  GR4
  .dhw 0x4780 0x8000 # BC 0x8,  0x000 (0, GR8)    jump to NXT iff tmp3 == 0
  .dhw 0x1744        # XR GR4,  GR4               tmp4 := 0
  .dhw 0x4144 0x00FF # LA GR4,  0x0FF (GR4, 0)    tmp4 := 0xFF
  .dhw 0x4440 0x8672 # EX GR4,  0x672 (0, GR8)    execute the TRANSLATE instruction from 0x2672
  .dhw 0x4111 0x0100 # LA GR1,  0x100 (GR1, 0)    tmp1 := tmp1 + 0x100
  .dhw 0x4630 0x8662 # BCT GR3  0x662 (0, GR8)    downcount tmp3 until zero and jump if tmp3 isnt zero
  .dhw 0x47F0 0x800A # BC 0xF,  0x00A (0, GR8)    jump to NXT
  .dhw 0xDC00 0x1000 0x2000 # TR 0x0 (1, GR1), 0x0, (GR2)   TRANSLATE

  : 16<<>
  .dhw 8<<>
  : 8<<>
  .dhw 4<<>
  : 4<<>
  .dhw 2<<>
  : 2<<>
  .dhw 1<<> 1<<> EXIT

  ###########
  # There seems to be no spefic documentation on 
  # how you CCW a console printer-keyboard combo
  # so I am just assuming you just Write (CCW opcode 0x01) to it
  # probably in EBDIC, which means we need an ASCII to EBDIC TRANSLATE
 
  : TOB
  : TerminalOutputBuffer
  .dhw (CONST)
  .dw  0x0000_FB00  # because in KeyKos zeForth domains page at 0x00Fxxx is W/R

  : console_devicenr
  .dhw (CONST)
  .dw 0x0000_0009
  
  : console_TX!_chars
  # ( char_addr length -- )
  .dhw 2DUP TerminalOutputBuffer CMOVE  # ( caddr len )
  .dhw NIP  TerminalOutputBuffer SWAP   # ( TOB_addr len )
  : console_TX!_common
  .dhw 2DUP EBDIC2ASCII_table TRANSLATE # ( TOB_addr len )
  .dhw SWAP                             # ( len TOB_addr )
  .dhw (LIT_w)                          # ( len TOB_addr mask )
  .dw  0x00FFFFFF
  .dhw &                                # ( len TOB_addr&mask )
  .dhw (LIT_w)                          # ( len TOB_addr&mask WRITE_CCW )
  .dw  0x01000000
  .dhw OR                               # ( len CCW1 )
  .dhw TerminalOutputBuffer 8 - !       # ( len )
  .dhw 0xFFFF &                         # ( len&mask )
  .dhw TerminalOutputBuffer 4 - !       # ( )
  .dhw TerminalOutputBuffer 8 -         # ( CCW1_addr )
  .dhw console_devicenr IBMz_SIO        # ( condition_code )
  .dhw DROP
  .dhw EXIT
  
  : console_TX!
  # ( char -- )
  .dhw TerminalOutputBuffer C!
  .dhw TerminalOutputBuffer 1
  .dhw (JMP) console_TX!_common
  
`
export { src };

