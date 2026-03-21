const src = `

  #  fcpu32/16 ( cell is 32bit, instr is 16bit )
  .def CELL            0d4
  .def NAME_START      0x4000
  .def NAME_LINK       0x0000_0000
  .def NAME_PTR        NAME_START

  
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
  .def Q@_             0x0024
  .def Q!_             0x0025
  .def TRANSLATE_1T1   0x0026
  .def TRANSLATE_1T2   0x0027
  .def TRANSLATE_2T2   0x0028
  
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
  # GR13  user_vars_ptr

  # layout of the 0x00Fxxx USER_VARS page:
  #
  # 0xF000-0xF7FF  Various Domain spefic variables
  # 0xF800-0xF9FF  CPU state save area. See figs 4-30 and 4-31 in z/Arch PoOPs
  # 0xFA00-0xFA3F  User Variables
  # 0xFA40-0xFA7B  More User variables? tbd
  # 0xFA7C-0xFA7F  ext_traphandler_ptr
  # 0xFA80-0xFAFF  TBD: Channel Program?
  # 0xFBxx  Buffers
  #     00-4F  Terminal Output Buffer
  #     50-9F  Raw Terminal Input  Buffer
  #     A0     Raw Terminal Input  Buffer length
  #     A1-AF  TBD
  #     B0-FF  PAD
  # 0xFCxx  Call Transfer Block, for KFORK, KALL, and KRET
  # 0xFDxx  Datastack,   64 items deep (due to cell being 4 bytes)
  # 0xFExx  Returnstack, 64 items - || - || - || - || - || - || -
  # 0xFFxx  Scratchpad? tbd
  # 0xFFF8  Pointer to USER_VAR page of Prev Task
  # 0xFFFC  Pointer to USER_VAR page of Next Task

  # Memory layout (all addresses are absolute and real unless otherwise noted)
  # 0x000000-0x001FFF  IBM z/Arch or ESA/390 spefic hardcoded addresses
  # 0x002000-0x00EFFF  zeForth
  # 0x00F000-0x00FFFF  USER_VARS page for main zeForth console task
  # 0x010000-0x010FFF  USER_VARS page for IO interrupt handler task
  # 0x011000-0x011FFF  USER_VARS page for External interrupt handler task
  # 0x012000-0x012FFF  USER_VARS page for Program  interrupt handler task (pagefaults, floating point calcfaults, and such)
  # 0x013000-0x013FFF  USER_VARS page for SuperVisorCall interrupt handler task (syscalls handler)
  # 0x014000-0x014FFF  USER_VARS page for the Migrator task
  #
  # 0x020000-0x05FFFF  IO SubChannel interrupt dispatch table (indexed by halfcell SubChan id)
  # 0x060000-          TBD: KK Item space?

  .def_calc NXT_ibmz_instrprt     lookup(NXT_ibmz)    0x0FFF & 0x8000 | 
  .def_calc 0xFFFF_ibmz_instrprt  lookup(0xFFFF_ibmz) 0x0FFF & 0x8000 |
  .def_calc 0xFFC0_ibmz_instrprt  lookup(0xFFC0_ibmz) 0x0FFF & 0x8000 | 
  .def_calc 4_ibmz_instrprt       lookup(4_ibmz)      0x0FFF & 0x8000 |
  .def_calc DOPRIM_ibmz_instrprt  lookup(DOPRIM_ibmz) 0x0FFF & 0x8000 |
  .def_calc COMMON_TAIL1_ibmz_instrprt  lookup(COMMON_TAIL1_ibmz)  0x0FFF & 0x8000 |
  .def_calc COMMON_TAIL2_ibmz_instrprt  lookup(COMMON_TAIL2_ibmz)  0x0FFF & 0x8000 |
  .def_calc COMMON_TAIL3_ibmz_instrprt  lookup(COMMON_TAIL3_ibmz)  0x0FFF & 0x8000 |
  .def_calc COMMON_TAIL4_ibmz_instrprt  lookup(COMMON_TAIL4_ibmz)  0x0FFF & 0x8000 |
  .def_calc COMMON_TAIL5_ibmz_instrprt  lookup(COMMON_TAIL5_ibmz)  0x0FFF & 0x8000 |
  
  # looks like its safe to start here in main storage
  .org 0x2000
  : __start
  .dhw 0x1788        # XR  GR8, GR8              gr8 := 0
  .dhw 0x4188 0x0200 # LA  GR8, 0x200 (GR8, 0)   gr8 := 0x200
  .dhw 0x8980 0x0004 # SLL GR8, 0x004            gr8 := gr8 << 4
  : NOP_ibmz
  : NXT_ibmz
  .dhw 0x48A9 0x0000 # LH GR10, 0x000 (GR9, 0)   instr := memory[instr_ptr]
  .dhw 0x4199 0x0002 # LA GR9,  0x002 (GR9, 0)   incr instr_ptr by halfcell (2 bytes)
  .dhw 0x5410 0xFFFF_ibmz_instrprt # N  GR1,  0x___ (0, GR8)   tmp1 := tmp1 & 0xFFFF  cancel out the sign extension
  .dhw 0x5810 0xFFC0_ibmz_instrprt # L  GR1,  0x___ (0, GR8)   tmp1 := 0xFFC0
  .dhw 0x141A        # NR GR1,  GR10             tmp1 := tmp1 & instr
  .dhw 0x4780 DOPRIM_ibmz_instrprt # BC 8,    0x030 (0, GR8)   jump if result was zero
  : DOCALL_ibmz
  .dhw 0x509C 0x0000 # ST GR9,  0x000 (GR12, 0)  push instr_ptr onto returnstack
  .dhw 0x41CC 0x0004 # LA GR12, 0x004 (GR12, 0)  incr returnstack_ptr by 4
  .dhw 0x1799        # XR GR9,  GR9              zero out instr_ptr ...
  .dhw 0x179A        # XR GR9,  GR10             instr_ptr := instr
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (0, GR8)   jump to NXT
  : DOPRIM_ibmz
  .dhw 0x1711        # XR GR1,  GR1              zero out tmp1
  .dhw 0x171A        # XR GR1,  GR10             tmp1 := instr
  .dhw 0x8910 0x0001 # SLL GR1, 1 (0, 0)         tmp1 := tmp1 << 1
  .dhw 0x4821 0x8302 # LH GR2,  0x302 (GR1, GR8) tmp2 := memory[tmp1 + ibm370_start + opcode_jmptbl]
  .dhw 0x5420 0xFFFF_ibmz_instrprt # N  GR2,  0x___ (0, GR8)   tmp2 := tmp2 & 0xFFFF   cancel out the sign extension
  .dhw 0x07F2        # BCR 0xF, GR2              jump to where tmp2 points to

  : (PLUS)
  .dhw (ibmz)
  : PLUS_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11             tmp2 := memory[datastack_ptr]
  .dhw 0x1E12        # ALR GR1, GR2              tmp1 := (tmp1 + tmp2) & 0xFFFFFFFF
  .org 0x2052
  : COMMON_TAIL1_ibmz
  .dhw 0x501B 0x0000 # ST GR1,  0x000 (GR11, 0)  memory[datastack_ptr] := tmp1
  .dhw 0x41BB 0x0004 # LA GR11, 0x004 (GR11, 0)  datastack_ptr := datastack_ptr + 4
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (0, GR8)   jump to NXT

  : (AND)
  .dhw (ibmz)
  : AND_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11             tmp2 := memory[datastack_ptr]
  .dhw 0x1412        # NR GR1,  GR2              tmp1 := tmp1 & tmp2
  .dhw 0x47F0 COMMON_TAIL1_ibmz_instrprt # BC 0xF,  0x052 (0, GR8)   jump to COMMON_TAIL1

  : (XOR)
  .dhw (ibmz)
  : XOR_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11             tmp2 := memory[datastack_ptr]
  .dhw 0x1712        # XR GR1,  GR2              tmp1 := tmp1 ^ tmp2
  .dhw 0x47F0 COMMON_TAIL1_ibmz_instrprt # BC 0xF,  0x052 (0, GR8)   jump to COMMON_TAIL1

  : (1LBR)
  .dhw (ibmz)
  : ONELBR_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x1722        # XR GR2,  GR2              tmp2 := 0
  .dhw 0x1721        # XR GR2,  GR1              tmp2 := tmp1
  .dhw 0x8910 0x0001 # SLL GR1, 0x001 (0, 0)     tmp1 := tmp1 << 1
  .dhw 0x8820 0x001F # SRL GR2, 0x01F (0, 0)     tmp2 := tmp2 >> 31
  .dhw 0x1612        # OR GR1,  GR2              tmp1 := tmp1 | tmp2
  .dhw 0x47F0 COMMON_TAIL1_ibmz_instrprt # BC 0xF,  0x052 (0, GR8)   jump to COMMON_TAIL1

  : (1+)
  .dhw (ibmz)
  : INCR_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x4111 0x0001 # LA GR1,  0x001 (GR1, 0)   tmp1 := tmp1 + 1
  .dhw 0x47F0 COMMON_TAIL1_ibmz_instrprt # BC 0xF,  0x052 (0, GR8)   jump to COMMON_TAIL1

  : (@)
  .dhw (ibmz)
  : FETCH_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11             tmp2 := memory[datastack_ptr]
  .dhw 0x1812        # LR GR1,  GR2              tmp1 := memory[tmp2]
  .dhw 0x47F0 COMMON_TAIL1_ibmz_instrprt # BC 0xF,  0x052 (0, GR8)   jump to COMMON_TAIL1

  : (!)
  .dhw (ibmz)
  : STORE_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11             tmp2 := memory[datastack_ptr]
  .dhw 0x5021 0x0000 # ST GR2,  0x000 (GR1, 0)   memory[tmp1] := tmp2
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (0, GR8)   jump to NXT

  : (DUP)
  .dhw (ibmz)
  : DUP_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x41BB 0x0004 # LA GR11, 0x004 (GR11, 0)  datastack_ptr := datastack_ptr + 4
  .dhw 0x47F0 COMMON_TAIL1_ibmz_instrprt # BC 0xF,  0x052 (0, GR8)   jump to COMMON_TAIL1

  : (DROP)
  .dhw (ibmz)
  : DROP_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (0, GR8)   jump to NXT

  : (SWAP)
  .dhw (ibmz)
  : SWAP_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11             tmp2 := memory[datastack_ptr]
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x502B 0x0000 # ST GR2,  0x000 (GR11, 0)  memory[datastack_ptr] := tmp2
  .dhw 0x41BB 0x0004 # LA GR11, 0x004 (GR11, 0)  datastack_ptr := datastack_ptr + 4
  .dhw 0x47F0 COMMON_TAIL1_ibmz_instrprt # BC 0xF,  0x052 (0, GR8)   jump to COMMON_TAIL1

  : (SKZ)
  .dhw (ibmz)
  : SKZ_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x121B        # LTR GR1, GR11             tmp1 := memory[datastack_ptr]   conditioncode updated
  .dhw 0x4770 NXT_ibmz_instrprt # BC 0x7, 0x00A (0, GR8)    if tmp1 isnt zero then jump to NXT
  .dhw 0x4199 0x0002 # LA GR9, 0x002 (GR9, 0)    instruction_ptr := instruction_pointer + 2
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF, 0x00A (0, GR8)    jump to NXT

  : (>R)
  .dhw (ibmz)
  : TO_R_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x501C 0x0000 # ST GR1,  0x000 (GR12, 0)  memory[returnstack_pointer] := tmp1
  .dhw 0x41CC 0x0004 # LA GR12, 0x004 (GR7, 0)   returnstack_pointer := returnstack_pointer + 4
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (0, GR8)   jump to NXT

  : (R>)
  .dhw (ibmz)
  : R_FROM_ibmz
  .dhw 0x5FC0 4_ibmz_instrprt # SL GR12, 0x___ (0, GR8)   returnstack_ptr := returnstack_ptr - 4
  .dhw 0x181C        # LR GR1,  GR12             tmp1 := memory[returnstack_ptr]
  .dhw 0x47F0 COMMON_TAIL1_ibmz_instrprt # BC 0xF,  0x052 (0, GR8)   jump to COMMON_TAIL1

  : (EXIT)
  .dhw (ibmz)
  : EXIT_ibmz
  .dhw 0x5FC0 4_ibmz_instrprt # SL GR12, 0x___ (0, GR8)   returnstack_ptr := returnstack_ptr - 4
  .dhw 0x189C        # LR GR9,  GR12             instr_ptr := memory[returnstack_ptr]
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (0, GR8)   jump to NXT

  : (EXT)
  .dhw (ibmz)
  : EXT_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11              tmp1 := memory[datastack_ptr]
  .dhw 0x5910 0x8384 # C  GR1,  0x384 (0, GR8)    compare tmp1 to 'IBMe'
  .dhw 0x4770 IBMe_ibmz_instrprt # BC 0x7,  0x160 (0, GR8)    if tmp1 != 'IBMe' then jump to ext_trapvectoring
  : jump2ibmz
  .dhw 0x5FC0 4_ibmz_instrprt # SL GR12, 0x04A (0, GR8)    returnstack_ptr := returnstack_ptr - 4
  .dhw 0x181C        # LR GR1,  GR12              tmp1 := memory[returnstack_ptr]
  .dhw 0x07F1        # BCR 0xF, GR1               jump to where tmp1 points to
  : ext_trapvectoring
  .dhw 0x41BB 0x0004 # LA GR11, 0x004 (GR11, 0)   datastack_ptr := datastack_ptr + 4
  : trapvector
  .dhw 0x509C 0x0000 # ST GR9,  0x000 (GR12, 0)   memory[returnstack_ptr] := instruction_ptr
  .dhw 0x41CC 0x0004 # LA GR12, 0x004 (GR12, 0)   returnstack_ptr := returnstack_ptr + 4
  .dhw 0x48AD 0x0000 # LH GR10, 0xA7E (GR13, 0)   instr := memory[user_vars_ptr + 0xA7E]
  .dhw 0x47F0 DOCALL_ibmz_instrprt # BC 0xF,  0x___ (0, GR8)    jump to DOCALL_ibmz

  : (KFORK)
  .dhw (ibmz)
  : KFORK_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x187B        # LR GR7,  GR11              tmp7 := memory[datastack_ptr]       ctb
  .dhw 0x1807        # LR GR0,  GR7               tmp0 := memory[tmp7]
  .dhw 0x5810 0x7004 # L  GR1,  0x004 (0, GR7)    tmp1 := memory[tmp7 + 0x004]
  .dhw 0x5820 0x7008 # L  GR2,  0x008 (0, GR7)    tmp2 := memory[tmp7 + 0x008]
  .dhw 0x5830 0x700C # L  GR3,  0x00C (0, GR7)    tmp3 := memory[tmp7 + 0x00C]
  .dhw 0x0AFF        # SVC 0xFF                   keykos fork syscall
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (0, GR8)    jump to NXT

  : (KALL)
  .dhw (ibmz)
  : KALL_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)    datastack_ptr := datastack_ptr - 4
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
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (0, GR8)    jump to NXT

  : (KRET)
  .dhw (ibmz)
  : KRET_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)    datastack_ptr := datastack_ptr - 4
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
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (0, GR8)    jump to NXT

  : (C@)
  .dhw (ibmz)
  : CHAR_FETCH_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11              tmp2 := memory[datastack_ptr]  addr
  .dhw 0x1711        # XR GR1,  GR1               tmp1 := 0
  .dhw 0x4312 0x0000 # IC GR1,  0x000 (GR2, 0)    tmp1 := memory[tmp2 - 3] & 0xFF
  .dhw 0x47F0 COMMON_TAIL1_ibmz_instrprt # BC 0xF,  0x052 (0, GR8)    jump to COMMON_TAIL1

  : (C!)
  .dhw (ibmz)
  : CHAR_STORE_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11              tmp2 := memory[datastack_ptr]  addr
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11              tmp1 := memory[datastack_ptr]  char
  .dhw 0x4212 0x0000 # STC GR1, 0x000 (GR2, 0)    memory[tmp2 - 3] := (tmp1 & 0xFF) | (memory[tmp2 - 3] & 0xFFFFFF00)
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (0, GR8)    jump to NXT

  : (H@)
  .dhw (ibmz)
  : HALFCELL_FETCH_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11              tmp2 := memory[datastack_ptr]  addr
  .dhw 0x4812 0x0000 # LH GR1,  0x000 (GR2, 0)    tmp1 := memory[tmp2]
  .dhw 0x5410 0xFFFF_ibmz_instrprt # N  GR1,  0x___ (0, GR8)    tmp1 := tmp1 & 0xFFFF   cancel out the sign extension
  .dhw 0x47F0 COMMON_TAIL1_ibmz_instrprt # BC 0xF,  0x052 (0, GR8)    jump to COMMON_TAIL1

  : (H!)
  .dhw (ibmz)
  : HALFCELL_STORE_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11              tmp2 := memory[datastack_ptr]  addr
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11              tmp1 := memory[datastack_ptr]  halfcell
  .dhw 0x4012 0x0000 # STH GR1, GR2               store the halfcell
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (0, GR8)    jump to NXT

  : (-)
  .dhw (ibmz)
  : MINUS_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11              tmp2 := memory[datastack_ptr]  addr
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11
  : COMMON_TAIL2_ibmz
  .dhw 0x1F12        # SLR GR1, GR2
  .dhw 0x47F0 COMMON_TAIL1_ibmz_instrprt # BC 0xF,  0x052 (0, GR8)    jump to COMMON_TAIL1

  : (1-)
  .dhw (ibmz)
  : DECR_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11              tmp1 := memory[datastack_ptr]
  .dhw 0x1722        # XR GR2,  GR2               tmp2 := 0
  .dhw 0x4122 0x0001 # LA GR2,  0x001 (GR2, 0)    tmp2 := 1
  .dhw 0x47F0 COMMON_TAIL2_ibmz_instrprt # BC 0xF,  0x254 (0, GR8)    jump to COMMON_TAIL2

  : (OR)
  .dhw (ibmz)
  : OR_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11              tmp1 := TOS
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11              tmp2 := NOS
  .dhw 0x1612        # OR GR1,  GR2               tmp1 := tmp1 | tmp2
  .dhw 0x47F0 COMMON_TAIL1_ibmz_instrprt # BC 0xF,  0x052 (0, GR8)    jump to COMMON_TAIL1

  : (*)
  .dhw (ibmz)
  : MULTIPLY_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11              tmp1 := TOS
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)    datastack_ptr := datastack_ptr - 4
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
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (0, GR8)    jump to NXT

  : (/%)
  .dhw (ibmz)
  : DIVMOD_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11              tmp1 := memory[datastack_ptr]   divisor
  .dhw 0x1722        # XR GR2,  GR2               tmp2 := 0
  .dhw 0x1733        # XR GR3,  GR3               tmp3 := 0
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x1912        # CR GR1,  GR2               tmp1 compared to tmp2
  .dhw 0x4780 COMMON_TAIL3_ibmz_instrprt # BC 0x8,  0x290 (0, GR8)    if equal then jump to COMMON_TAIL3
  .dhw 0x183B        # LR GR3,  GR11              tmp3 := memory[datastack_ptr]   dividend
  .dhw 0x1D21        # DR GR2,  GR1               divide
  .dhw 0x47F0 COMMON_TAIL3_ibmz_instrprt # BC 0xF,  0x290 (0, GR8)    jump to COMMON_TAIL3

  : (<<)
  .dhw (ibmz)
  : LSHIFT_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x___ (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11
  .dhw 0x8910 0x2000 # SLL GR1, 0x000 (0, GR2)
  .dhw 0x47F0 COMMON_TAIL1_ibmz_instrprt # BC 0xF,  0x052 (0, GR8)    jump to COMMON_TAIL1

  : (>>)
  .dhw (ibmz)
  : RSHIFT_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11
  .dhw 0x8810 0x2000 # SRL GR1, 0x000 (0, GR2)
  .dhw 0x47F0 COMMON_TAIL1_ibmz_instrprt # BC 0xF,  0x052 (0, GR8)    jump to COMMON_TAIL1

  :f 4
  .dhw (CONST)
  : 4_ibmz
  .dw 0x0000_0004    #  4       \ note: also refered to in ibmz code
  :f 0xFFFF
  .dhw (CONST)
  : 0xFFFF_ibmz
  .dw 0x0000_FFFF    #  0xFFFF  \ note: also refered to in ibmz code
  :f 0xFFC0
  .dhw (CONST)
  : 0xFFC0_ibmz
  .dw 0x0000_FFC0    #  0xFFC0  \ note: also refered to in ibmz code

  .org 0x2300
  :f fcpu_opcode_jmptbl
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
  .dhw trapvector  # Q@
  .dhw trapvector  # Q!
  .dhw TRANSLATE_ibmz 
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
  .dhw 0x5490 0xFFFF_ibmz_instrprt # N  GR9,  0x2F6 (0, GR8)    instr_ptr := instr_ptr & 0xFFFF   cancel out the sign extension
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x000 (0, GR8)    jump to NXT

  : (R@)
  .dhw (ibmz)
  # R_AT:
  : R@_ibmz
  .dhw 0x5FC0 4_ibmz_instrprt # SL GR12, 0x___ (0, GR8)    returnstack_ptr := returnstack_ptr - 4
  .dhw 0x181C        # LR GR1,  GR12              tmp1 := memory[returnstack_ptr]
  .dhw 0x41CC 0x0004 # LA GR12, 0x004 (GR12, 0)   returnstack_ptr := returnstack_ptr + 4
  .dhw 0x47F0 COMMON_TAIL1_ibmz_instrprt # BC 0xF,  0x052             jump to COMMON_TAIL1

  : ((BRZ))
  .dhw (ibmz)
  # BRZERO:
  : (BRZ)_ibmz
  .dhw 0x4829 0x0000 # LH GR2,  0x000 (GR9, 0)    tmp2 := memory[instr_ptr]
  .dhw 0x5420 0xFFFF_ibmz_instrprt # N  GR2,  0x2F6 (0, GR8)    tmp2 := tmp2 & 0xFFFF   cancel out the sign extension
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11              tmp1 := memory[instr_ptr]
  .dhw 0x1733        # XR GR3,  GR3               tmp3 := 0
  .dhw 0x1913        # CR GR1,  GR3               compare tmp1 to tmp3
  .dhw 0x4780        # BC 0x8,  0x3C6 (0, GR8)    if equal the jump to BRZERO_L0
  .dhw_calc lookup(BRZERO_L0) 0x0FFF & 0x8000 |
  : COMMON_TAIL4_ibmz
  .dhw 0x4199 0x0002 # LA GR9,  0x002 (GR9, 0)    instr_ptr := instr_ptr + 2
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (0, GR8)    jump to NXT
  # BRZERO_L0:
  .dhw 0x1799        # XR GR9,  GR9               instr_ptr := 0
  .dhw 0x1792        # XR GR9,  GR2               instr_ptr := tmp2
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (0, GR8)    jump to NXT

  : ((NEXT))
  .dhw (ibmz)
  # DONEXT:
  : (NEXT)_ibmz
  .dhw 0x5FC0 4_ibmz_instrprt # SL GR12, 0x2F0 (0, GR8)    returnstack_ptr := returnstack_ptr - 4
  .dhw 0x181C        # LR GR1,  GR12              tmp1 := memory[returnstack_ptr]
  .dhw 0x1722        # XR GR2,  GR2               tmp2 := 0
  .dhw 0x1912        # CR GR1,  GR2               compare tmp1 to tmp2
  .dhw 0x4780 COMMON_TAIL4_ibmz_instrprt # BC 0x8,  0x3BE (0, GR8)    if equal then jump to COMMON_TAIL4
  .dhw 0x4122 0x0001 # LA GR2,  0x001 (GR2, 0)    tmp2 := 1
  .dhw 0x1F12        # SLR GR1, GR2               tmp1 := tmp1 - tmp2
  .dhw 0x501C 0x0000 # ST GR1,  0x000 (GR12, 0)   memory[returnstack_ptr] := tmp1
  .dhw 0x41CC 0x0004 # LA GR12, 0x004 (GR12, 0)   returnstack_ptr := returnstack_ptr + 4
  .dhw 0x47F0 DOJMP_ibmz_instrprt # BC 0xF,  0x38A (0, GR8)    jump to DOJMP

  :f 31
  .dhw (CONST)
  .dw  0x0000_001F

  .org 0x23F6
  :f COLD_vector
  .dhw (CONST)
  : COLD_vector_ibmz
  .dw COLD_boot

  .org 0x2400
  :f (JMP)_model
  .dhw R> H@
  :f (EXIT)_model
  .dhw EXIT
  
  :f 4+
  .dhw 1+
  :f 3+
  .dhw 1+
  :f 2+
  .dhw 1+ 1+ EXIT

  :f 31>>
  .dhw 31 >> EXIT

  :f RP@
  # ( -- a )
  # Push the current RP to the data stack.
  .dhw (IBMz)
  : RP@_ibmz
  .dhw 0x1711 # XR GR1, GR1
  .dhw 0x171C # XR GR1, GR12
  .dhw 0x47F0 COMMON_TAIL1_ibmz_instrprt # BC 0xF,  0x052             jump to COMMON_TAIL1

  :f RP!
  # ( a -- )
  # Set the return stack pointer.
  .dhw (IBMz)
  : RP!_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt   # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x18CB                   # LR GR12,  GR11             tmp1 := memory[instr_ptr]
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (0, GR8)    jump to NXT

  :f SP@
  # ( -- a )
  # Push the current data stack pointer.
  .dhw (IBMz)
  : SP@_ibmz
  .dhw 0x1712 # XR GR1, GR1
  .dhw 0x171B # XR GR1, GR11
  .dhw 0x47F0 COMMON_TAIL1_ibmz_instrprt # BC 0xF,  0x052             jump to COMMON_TAIL1

  :f SP!
  # ( a -- )
  # Set the data stack pointer.
  .dhw (IBMz)
  : SP!_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt   # SL GR11, 0x2F0 (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x18BB                   # LR GR11,  GR11             tmp1 := memory[instr_ptr]
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (0, GR8)    jump to NXT

  
  :f ?: 
  # ( alt conseq cond -- alt | conseq )
  .dhw SKZ SWAP DROP EXIT
  
  :f OVER
  # ( a b -- a b a )
  .dhw >R    # ( a )     R:( b )
  .dhw DUP   # ( a a )   R:( b )
  .dhw R>    # ( a a b ) R:( )
  .dhw SWAP  # ( a b a )
  .dhw EXIT
  
  :f (BRZ)_model
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
  :f EXECUTE
  :f EXEC
  # ( addr -- )
  .dhw >R    # ( ) R:( addr )
  .dhw EXIT  #
  
  :f 2DUP
  # ( a b -- a b a b )
  .dhw OVER OVER EXIT

  :f ?DUP
  # ( w -- w w | 0 )
  # Dup TOS if its is not zero.
  .dhw DUP SKZ DUP EXIT
  
  :f (CONST)
  # ( -- datum )
  .dhw R>       # ( raddr ) R:( )
  .dhw @        # ( datum )
  .dhw EXIT

  :f (CONST_D)
  # ( -- DatumU DatumL )
  .dhw R> D@ EXIT

  :f (CONST_H)
  .dhw R> H@ EXIT
  
  :f 0xFFFFFFFF
  :f TRUE
  .dhw (CONST)
  .dw  0xFFFF_FFFF
  
  :f INVERT
  # ( datum -- datumb )
  .dhw 0xFFFFFFFF XOR EXIT
  
  :f NEGATE
  # ( n -- -n )
  .dhw INVERT 1+ EXIT
  
  :f 1-_model
  # ( u -- u-1 )
  .dhw NEGATE 1+ NEGATE EXIT
  
  :f (NEXT)_model
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
  
  :f 1   
  # ( -- 1 )
  .dhw (CONST_H) 0x0001
  
  :f 0x7FFFFFFF
  # ( -- datum )
  .dhw (CONST)
  .dw  0x7FFF_FFFF
  
  :f 1<<
  # ( u -- u<<1 )
  :f 2*
  # ( u -- u*2 )
  .dhw 0x7FFFFFFF & 1<<> EXIT
  
  :f 0x1F
  .dhw (CONST)
  .dw 0x0000_001F
  
  :f <<>_model
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

  :f (IBMz)
  :f (ibmz)
  # ( ... -- ... ) R:( raddr -- )
  # registers GR8 to GR14 must be preserved or handled correctly
  # suggest to re enter NXT at GR8 + 0x00A
  .dhw IBMe EXT EXIT

  :f <<>_ibmz_model
  # ( u count -- u<<>count )
  .dhw (ibmz)
  : LBR_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11             tmp2 := memory[datastack_ptr]
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x183B        # LR GR3,  GR11             tmp3 := tmp1
  .dhw 0x8910 0x2000 # SLL GR1, 0x000 (0, GR2)   tmp1 := tmp1 << tmp2
  .dhw 0x1744        # XR GR4,  GR4              tmp4 := 0
  .dhw 0x4144 0x0020 # LA GR4,  0x020 (GR4, 0)   tmp4 := 32
  .dhw 0x5F42 0x0000 # SL GR4,  0x000 (GR2, 0)   tmp4 := tmp4 - tmp2
  .dhw 0x8830 0x4000 # SRL GR3, 0x000 (0, GR4)   tmp3 := tmp3 >> tmp4
  .dhw 0x1613        # OR GR1,  GR3
  .dhw 47F0 8052 # BC 0xF,  0x052 (0, GR8)   jump to COMMON_TAIL1

  :f NAND
  # ( a b -- c )
  .dhw & INVERT EXIT

  :f OR_model
  # ( a b -- a|b )
  .dhw INVERT SWAP INVERT NAND EXIT

  :f make_mask
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

  :f <<_model 
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

  :f 0xFF
  .dhw (CONST)
  .dw  0x0000_00FF
  
  :f -_model
  # ( a b -- a-b )
  .dhw NEGATE   ( a -b )
  .dhw +
  .dhw EXIT

  :f >>_model 
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

  :f 24
  .dhw (CONST_H) 0x0018 # 24

  :f C@_model
  # ( addr -- char )
  .dhw @ 24 >>_model EXIT

  :f C!_model
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

  :f CMOVE_modelA
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

  :f 2
  .dhw (CONST_H) 0x0002 # 2

  :f CMOVE_modelB
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

  :f CMOVE
  # ( src dest len -- )
  .dhw (ibmz)
  : CMOVE_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x2D8 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x183B        # LR GR3,  GR11             tmp3 := memory[datastack_ptr]   len
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x2D8 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11             tmp2 := memory[datastack_ptr]   dest
  .dhw 0x5FB0 4_ibmz_instrprt # SL GR11, 0x2D8 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x184B        # LR GR4,  GR11             tmp4 := memory[datastack_ptr]   src
  .dhw 0x1755        # XR GR5,  GR5              tmp5 := 0
  .dhw 0x1753        # XR GR5,  GR3              tmp5 := tmp4 ^ tmp3   effectively tmp5 := tmp3
  .dhw 0x0E24        # MVCL GR2, GR4             move the datablock
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (0, GR8)   jump to NXT

  :f ROT
  # ( a b c -- b c a )
  .dhw >R       # ( a b ) R:( c )
  .dhw SWAP     # ( b a ) R:( c )
  .dhw R>       # ( b a c ) R:( )
  .dhw SWAP     # ( b c a )
  .dhw EXIT

  :f TRANSLATE_model ( ptr len tbl -- )
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

  :f TRANSLATE_obsolete
  # ( ptr len tbl -- )
  .dhw (ibmz)
  : TRANSLATE_obsolete_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt          # SL GR11, 0x04A (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x182B                          # LR GR2,  GR11              tmp2 := tbl
  .dhw 0x5FB0 4_ibmz_instrprt          # SL GR11, 0x04A (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x183B                          # LR GR3,  GR11              tmp3 := len
  .dhw 0x5FB0 4_ibmz_instrprt          # SL GR11, 0x04A (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B                          # LR GR1,  GR11              tmp1 := ptr
  .dhw 0x1744                          # XR GR4,  GR4               tmp4 := 0
  .dhw 0x1934                          # CR GR3,  GR4
  .dhw 0x4780 NXT_ibmz_instrprt        # BC 0x8,  0x00A (0, GR8)    jump to NXT iff tmp3 == 0
  .dhw 0x4144 0x0001                   # LA GR4,  0x001 (GR4, 0)    tmp4 := tmp4 + 1
  .dhw 0x1F34                          # SLR GR3, GR4               tmp3 := tmp3 - tmp4
  .dhw 0x4430 EXECUTE_instr_ibmz_instr # EX GR3,  0x672 (0, GR8)    execute the TRANSLATE instruction from 0x2672
  .dhw 0x4133 0x0001                   # LA GR3,  0x001 (0, GR3)    tmp3 := tmp3 + 1
  .dhw 0x1744                          # XR GR4,  GR4               tmp4 := 0
  .dhw 0x4144 0x00FF                   # LA GR4,  0x0FF (GR4, 0)    tmp4 := 0xFF
  .dhw 0x1743                          # XR GR4,  GR3               tmp4 := tmp4 ^ tmp3
  .dhw 0x4114 0x0000                   # LA GR1,  0x000 (GR4, 0)    tmp1 := tmp1 + tmp4
  .dhw 0x8830 0x0008                   # SRL GR3, 0x008 (0, 0)      tmp3 := tmp3 >> 8
  .dhw 0x1744                          # XR GR4,  GR4
  .dhw 0x1934                          # CR GR3,  GR4
  .dhw 0x4780 NXT_ibmz_instrprt        # BC 0x8,  0x000 (0, GR8)    jump to NXT iff tmp3 == 0
  .dhw 0x1744                          # XR GR4,  GR4               tmp4 := 0
  .dhw 0x4144 0x00FF                   # LA GR4,  0x0FF (GR4, 0)    tmp4 := 0xFF
  : TRANSLATE_L0_ibmz
  .dhw 0x4440 EXECUTE_instr_ibmz_instr # EX GR4,  0x672 (0, GR8)    execute the TRANSLATE instruction from 0x2672
  .dhw 0x4111 0x0100                   # LA GR1,  0x100 (GR1, 0)    tmp1 := tmp1 + 0x100
  .dhw 0x4630 TRANSLATE_L0_ibmz_instrptr # BCT GR3  0x662 (0, GR8)    downcount tmp3 until zero and jump if tmp3 isnt zero
  .dhw 0x47F0 NXT_ibmz_instrprt          # BC 0xF,  0x00A (0, GR8)    jump to NXT
  : TRANSLATE_instr_ibmz
  .dhw 0xDC00 0x1000 0x2000            # TR 0x0 (1, GR1), 0x0, (GR2)   TRANSLATE

  :f TRANSLATE
  # ( ptr len tbl -- )
  .dhw (ibmz)
  : TRANSLATE_ibmz
  .dhw 0x1700                          # XR GR0, GR0                gr0 := 0x00
  .dhw 0x5FB0 4_ibmz_instrprt          # SL GR11, 0x04A (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B                          # LR GR1,  GR11              tmp1 := tbl
  .dhw 0x5FB0 4_ibmz_instrprt          # SL GR11, 0x04A (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x183B                          # LR GR3,  GR11              tmp3 := len
  .dhw 0x5FB0 4_ibmz_instrprt          # SL GR11, 0x04A (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x182B                          # LR GR2,  GR11              tmp2 := ptr
  : TRANSLATE_ibmz_L0
  .dhw 0xB2A5 0x0021                   # TRE GR2, GR1
  .dhw 0xA714 0xFFFC                   # BRC 0x1, -4                branch to TRANSLATE_ibmz_L0 on condition 3
  .dhw 0xA744 0x0002                   # BRC 0x4,  2                branch to TRANSLATE_ibmz_L1 on condition 1
  .dhw 0x47F0 NXT_ibmz_instrprt        # BC 0xF,  0x00A (0, GR8)    jump to NXT
  : TRANSLATE_ibmz_L1
  .dhw 0x4341 0x0000                   # IC GR4,  0x000 (GR1, 0)    tmp4 := memory[tmp1 - 3] & 0xFF
  .dhw 0x4242 0x0000                   # STC GR4, 0x000 (GR2, 0)    memory[tmp2 - 3] := (tmp4 & 0xFF) | (memory[tmp2 - 3] & 0xFFFFFF00)
  .dhw 0x4122 0x0001                   # LA GR2,  0x001 (GR2, 0)    tmp2 := tmp2 + 1
  .dhw 0x1744                          # XR GR4,  GR4               tmp4 := 0
  .dhw 0x4144 0x0001                   # LA GR4,  0x001 (GR4, 0)    tmp4 := 1
  .dhw 0x1B34                          # SR GR3,  GR4               tmp3 := tmp3 - tmp4
  .dhw 0xA7F4 0xFFEA                   # BCR 0xF, 0xFFEA            jump to TRANSLATE_ibmz_L0

  :f TRANSLATE&TEST_model
  # ( ptr len tbl -- ptr' len' tbl funcbyte )
  # when len is exhausted with no non-zero funcbyte found then funcbyte will be zero
  .dhw -ROT >R         # ( tbl ptr ) R:( len )
  .dhw (JMP) TRANSLATE&TEST_model_L2
  : TRANSLATE&TEST_model_L0
  .dhw 2DUP C@         # ( tbl ptr tbl byte )
  .dhw + C@            # ( tbl ptr funcbyte )
  .dhw DUP 0= INVERT   # ( tbl ptr funcbyte nonzero? )
  .dhw (BRZ) TRANSLATE&TEST_model_L1
  .dhw R> QROT         # ( ptr funcbyte len tbl ) R:( )
  .dhw ROT EXIT        # ( ptr len tbl funcbyte )
  : TRANSLATE&TEST_model_L1
  .dhw DROP 1+         # ( tbl ptr+1 )
  : TRANSLATE&TEST_model_L2
  .dhw (NEXT) TRANSLATE&TEST_model_L0
  .dhw SWAP 0 TUCK     # ( ptr+n 0 tbl 0 )
  .dhw EXIT

  :f TRANSLATE&TEST
  # ( ptr len tbl -- ptr' len' tbl funcbyte )
  # when len is exhausted with no non-zero funcbyte found then funcbyte will be zero
  : TRANSLATE&TEST_ibmz
  .dhw 0x5FB0 4_ibmz_instrprt          # SL GR11, 0x04A (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B                          # LR GR1,  GR11              tmp1 := tbl
  .dhw 0x5FB0 4_ibmz_instrprt          # SL GR11, 0x04A (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x183B                          # LR GR3,  GR11              tmp3 := len
  .dhw 0x5FB0 4_ibmz_instrprt          # SL GR11, 0x04A (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x182B                          # LR GR2,  GR11              tmp2 := ptr
  : TRANSLATE&TEST_ibmz_L0
  .dhw 0xB9BF 0x0024                   # TRTE GR2, GR4
  .dhw 0xA714 0xFFFC                   # BRC 0x1, -4                branch to TRANSLATE&TEST_ibmz_L0 on condition 3
  .dhw 0xA744 0x0001                   # BRC 0x4,  _                branch to TRANSLATE&TEST_ibmz_L1 on condition 1
  # 0 Entire first operand processed without selecting a nonzero function code
  .dhw 0x1744                          # XR GR4,  GR4               tmp4 := funcbyte := 0x00
  : TRANSLATE&TEST_ibmz_L1
  # 1 Nonzero function code selected
  .dhw 0x502B 0x0000                   # ST GR2,  0x000 (GR11, 0)   memory[datastack_ptr] := tmp2 := ptr'
  .dhw 0x41BB 0x0004                   # LA GR11, 0x004 (GR11, 0)   datastack_ptr := datastack_ptr + 4
  .dhw 0x503B 0x0000                   # ST GR3,  0x000 (GR11, 0)   memory[datastack_ptr] := tmp3 := len'
  .dhw 0x41BB 0x0004                   # LA GR11, 0x004 (GR11, 0)   datastack_ptr := datastack_ptr + 4
  .dhw 0x501B 0x0000                   # ST GR1,  0x000 (GR11, 0)   memory[datastack_ptr] := tmp1 := tbl
  .dhw 0x41BB 0x0004                   # LA GR11, 0x004 (GR11, 0)   datastack_ptr := datastack_ptr + 4
  .dhw 0x504B 0x0000                   # ST GR1,  0x000 (GR11, 0)   memory[datastack_ptr] := tmp4 := funcbyte
  .dhw 0x41BB 0x0004                   # LA GR11, 0x004 (GR11, 0)   datastack_ptr := datastack_ptr + 4
  .dhw 0x47F0 NXT_ibmz_instrprt        # BC 0xF,  0x00A (0, GR8)    jump to NXT

  :f 16<<>
  .dhw 8<<>
  :f 8<<>
  .dhw 4<<>
  :f 4<<>
  .dhw 2<<>
  :f 2<<>
  .dhw 1<<> 1<<> EXIT

  :f H@_model
  # ( addr -- halfcell )
  .dhw @        # ( cell )
  .dhw 16<<>    # ( llce )
  .dhw 0xFFFF   # ( llce mask )
  .dhw &        # (   ce )
  .dhw EXIT

  :f H!_model
  # ( halfcell addr -- )
  .dhw SWAP     # ( addr halfcell )
  .dhw 0xFFFF   # ( addr halfcell 0xFFFF )
  .dhw &        # ( addr halfcell )
  .dhw 16<<>    # ( addr cellhalf )
  .dhw OVER     # ( addr cellhalf addr )
  .dhw @        # ( addr cellhalf origcell )
  .dhw 0xFFFF   # ( addr cellhalf origcell )
  .dhw OR_model # ( addr updated )
  .dhw SWAP     # ( updated addr )
  .dhw !        # ( )
  .dhw EXIT

  :f Q@
  # ( addr -- UU UL LU LL )
  .dhw DUP >R   # ( addr ) R:( addr )
  .dhw D@       # ( UU UL ) R:( addr )
  .dhw R> 8+    # ( UU UL addr+8 ) R:( )
  .dhw D@       # ( UU UL LU LL )
  .dhw EXIT

  :f Q!
  # ( UU UL LU LL addr -- )
  .dhw DUP >R   # ( UU UL LU LL addr ) R:( addr )
  .dhw 8+ D!    # ( UU UL ) R:( addr )
  .dhw R> D!    # ( ) R:( )
  .dhw EXIT

  :f 0xF 
  .dhw (CONST_H) 0x000F

  :f -ROT
  # ( b c a -- a b c )
  .dhw ROT    # ( c a b )
  .dhw ROT    # ( a b c )
  .dhw EXIT

  :f R@_model
  # ( -- a ) R:( a raddr -- a )  \ controlflow returns to raddr
  .dhw R>     # ( raddr ) R:( a )
  .dhw R>     # ( raddr a ) R:( )
  .dhw DUP    # ( raddr a a )
  .dhw >R     # ( raddr a ) R:( a )
  .dhw SWAP   # ( a raddr ) R:( a )
  .dhw >R     # ( a ) R:( a raddr )
  .dhw EXIT

  :f CLEANBOOL
  # ( dirty -- clean )
  .dhw (BRZ) FALSE  # aka 0x00000000
  .dhw (JMP) TRUE   # aka 0xFFFFFFFF
  
  :f 0
  :f FALSE
  .dhw (CONST_H) 0x0000 # 0
  
  :f =
  # ( a b -- T | F )
  .dhw XOR          # aka ^
  .dhw CLEANBOOL
  .dhw INVERT
  .dhw EXIT
  
  :f 3
  .dhw (CONST_H) 0x0003

  :f (VAR)
  .dhw R> EXIT

  :f 0xFFFFFF
  .dhw (CONST) 0x00FF 0xFFFF
  :f 0x3F
  .dhw (CONST) 0x0000 0x003F
  :f 6
  .dhw (CONST) 0x0000 0x0006
  :f 0xFF
  .dhw (CONST) 0x0000 0x00FF
  :f 64
  :f 0x40
  .dhw (CONST) 0x0000 0x0040
  :f 8
  .dhw (CONST) 0x0000 0x0008
  :f 0xFFF
  .dhw (CONST) 0x0000 0x0FFF
  :f 0x3FFFF
  .dhw (CONST) 0x0003 0xFFFF
  :f 16
  :f 0x10
  .dhw (CONST) 0x0000 0x0010
  :f 0x4040
  .dhw (CONST) 0x0000 0x4040
  :f 0x80
  .dhw (CONST) 0x0000 0x0080
  :f 20
  .dhw (CONST) 0x0000 0x0014
  :f 12
  :f 0xC
  .dhw (CONST) 0x0000 0x000C
  :f 0x1000
  .dhw (CONST) 0x0000 0x1000
  :f 0x04000000
  .dhw (CONST) 0x0400 0x0000
  :f 0xFCFFFFFF
  .dhw (CONST) 0xFCFF 0xFFFF
  :f 0x80000000
  :f KT
  .dhw (CONST) 0x8000 0x0000
  :f 0x03000000
  .dhw (CONST) 0x0300 0x0000
  :f 7
  .dhw (CONST) 0x0000 0x0007
  :f 9
  .dhw (CONST) 0x0000 0x0009
  :f 10
  :f 0xA
  .dhw (CONST) 0x0000 0x000A
  :f 5
  .dhw (CONST) 0x0000 0x0005
  :f 14
  :f 0xE
  .dhw (CONST) 0x0000 0x000E
  :f 11
  :f 0xB
  .dhw (CONST) 0x0000 0x000B
  :f 13
  :f 0xD
  .dhw (CONST) 0x0000 0x000D

  :f 0=
  .dhw 0 = EXIT

  :f 3DUP
  # ( a b c -- a b c a b c )
  .dhw >R     # ( a b ) R:( c )
  .dhw 2DUP   # ( a b a b ) R:( c )
  .dhw R@     # ( a b a b c ) R:( c )
  .dhw -ROT   # ( a b c a b ) R:( c )
  .dhw R>     # ( a b c a b c ) R:( )
  .dhw EXIT

  :f 3C!
  # ( 3bytes addr -- )
  .dhw 1-         # ( 3bytes addr-1 )
  .dhw SWAP       # ( addr-1 3bytes )
  .dhw 0xFFFFFF   # ( addr-1 3bytes 0xFFFFFF )
  .dhw &          # ( addr-1 3bytes_masked )
  .dhw OVER       # ( addr-1 3bytes_masked addr-1 )
  .dhw @          # ( addr-1 3bytes_masked cell )
  .dhw 0xFFFFFF   # ( addr-1 3bytes_masked cell 0xFFFFFF )
  .dhw INVERT     # ( addr-1 3bytes_masked cell 0xFF000000 )
  .dhw &          # ( addr-1 3bytes_masked cell_masked )
  .dhw OR         # ( addr-1 masked )
  .dhw SWAP       # ( masked addr-1 )
  .dhw STORE      # ( )
  .dhw EXIT

  :f OVER3
  # ( a b c d - a b c d a )
  .dhw >R      # ( a b c ) R:( d )
  .dhw ROT     # ( b c a ) R:( d )
  .dhw DUP     # ( b c a a ) R:( d )
  .dhw >R      # ( b c a ) R:( d a )
  .dhw -ROT    # ( a b c )
  .dhw R>      # ( a b c a ) R:( d )
  .dhw R>      # ( a b c a d ) R:( )
  .dhw SWAP    # ( a b c d a )
  .dhw EXIT

  :f NIP
  # ( a b -- b )
  .dhw SWAP       # ( b a )
  .dhw DROP       # ( b )
  .dhw EXIT

  :f TUCK
  # ( a b -- b a b )
  .dhw SWAP       # ( b a )
  .dhw OVER       # ( b a b )
  .dhw EXIT

  :f CELL*
  :f 4* 
  :f 2<<
  .dhw 2 << EXIT

  :f 4/
  :f 2>>
  .dhw 2 >> EXIT

  :f 0<
  # ( n -- bool )
  .dhw 0x80000000 & (JMP) CLEANBOOL

  :f U<
  # ( u u -- t )
  # Unsigned compare of top two items.
  .dhw 2DUP XOR 0<
  .dhw (BRZ) U<_L1
  .dhw SWAP DROP 0< EXIT
  : U<_L1
  .dhw - 0< EXIT

  :f < 
  # ( a b -- bool )
  .dhw - 0< INVERT EXIT

  :f MIN
  # ( a b -- a | b )
  .dhw 2DUP
  .dhw SWAP  # ( a b b a )
  .dhw <     # ( a b bool )
  .dhw (JMP) ?:

  :f MAX
  # ( a b -- a | b )
  .dhw 2DUP  # ( a b a b )
  .dhw <     # ( a b bool )
  .dhw (JMP) ?:

  :f WITHIN
  # ( u ul uh -- t )
  # Return true if u is within the range of ul and uh.
  .dhw OVER - >R  # ul <= u < uh
  .dhw - R> U< EXIT

  :f KT+1
  .dhw KT 1+ EXIT

  :f 3DROP
  .dhw DROP 2DROP EXIT

  :f FILL
  # ( caddr count char -- )
  .dhw OVER   # ( caddr count char count )
  .dhw (BRZ)  # ( caddr count char )
  .dhw 3DROP
  .dhw ROT    # ( count char caddr )
  .dhw 2DUP   # ( count char caddr char caddr )
  .dhw C!     # ( count char caddr )
  .dhw ROT    # ( char caddr count )
  .dhw 1-     # ( char caddr count-1 )
  .dhw DUP    # ( char caddr count-1 count-1 )
  .dhw (BRZ)  # ( char caddr count-1 )
  .dhw 3DROP
  .dhw ROT    # ( caddr count-1 char )
  .dhw DROP   # ( caddr count-1 )
  .dhw SWAP   # ( count-1 caddr )
  .dhw DUP    # ( count-1 caddr caddr )
  .dhw 1+     # ( count-1 caddr caddr+1 )
  .dhw ROT    # ( caddr caddr+1 countz1 )
  .dhw (JMP) CMOVE

  :f 0x7FFFFFFF&
  .dhw 0x7FFFFFFF & EXIT
  
  :f UM+
  # ( a b -- sum carry )
  .dhw 2DUP   # ( a b a b )
  .dhw 0x7FFFFFFF&
  .dhw SWAP
  .dhw 0x7FFFFFFF&
  .dhw +      # ( a b sum1 )
  .dhw -ROT   # ( sum1 a b )
  .dhw 31>>   # ( sum1 a b>>31 )
  .dhw SWAP   # ( sum1 b>>31 a )
  .dhw 31>>   # ( sum1 b>>31 a>>31 )
  .dhw +      # ( sum1 sum2 )
  .dhw 1 <>>  # ( sum1 sum2<>>1 )
  .dhw DUP    # ( sum1 sum2<>>1 sum2<>>1 )
  .dhw 0x80000000
  .dhw &      # ( sum1 sum2<>>1 s )
  .dhw ROT    # ( sum2<>>1 s sum1 )
  .dhw OR     # ( sum2<>>1 sum )
  .dhw SWAP   # ( sum sum2<>>1 )
  .dhw 1      # ( sum sum2<>>1 1 )
  .dhw &      # ( sum carry )
  .dhw EXIT

  :f D+n 
  # ( Du Dl increment -- Du+c Dl+n )
  .dhw UM+    # ( Du Dl+incr carry )
  .dhw ROT    # ( Dl+incr carry Du )
  .dhw +      # ( Dl+incr Du+C )
  .dhw SWAP
  .dhw EXIT

  :f D@
  # ( addr -- Du Dl )
  .dhw DUP    # ( addr addr )
  .dhw @      # ( addr Du )
  .dhw SWAP   # ( Du addr )
  .dhw 4+     # ( Du addr+4 )
  .dhw @      # ( Du Dl )
  .dhw EXIT

  :f D+!
  # ( incrment addr -- )
  .dhw SWAP  # ( addr incr )
  .dhw OVER  # ( addr incr addr )
  .dhw D@    # ( addr incr 
  .dhw ROT   # ( addr Du Dl incr )
  .dhw D+n   # ( addr Du+c Dl+n )
  .dhw ROT   # ( Du+C Dl+n addr )
  :f D!
  .dhw SWAP  # ( Du addr Dl )
  .dhw OVER  # ( Du addr Dl addr )
  .dhw 4+    # ( Du addr Dl addr+4 )
  .dhw !     # ( Du addr )
  .dhw !     # ( )
  .dhw EXIT

  :f ABS
  # ( n -- n )
  # Return the absolute value of n.
  .dhw DUP 0<
  .dhw SKZ NEGATE
  .dhw EXIT

  :f UM/MOD
  # ( udl udh u -- ur uq )
  # Unsigned divide of a double by a single. Return mod and quotient.
  .dhw DUP U<
  .dhw (BRZ) UM/MOD_L4
  .dhw NEGATE (LIT_H) 31 >R
  : UM/MOD_L1
  .dhw >R DUP UM+
  .dhw >R >R DUP UM+
  .dhw R> + DUP
  .dhw R> R@ SWAP >R
  .dhw UM+ R> OR
  .dhw (BRZ) UM/MOD_L2
  .dhw >R DROP 1+ R>
  .dhw (JMP) UM/MOD_L3
  : UM/MOD_L2
  .dhw DROP
  : UM/MOD_L3
  .dhw R>
  .dhw (NEXT) UM/MOD_L1
  .dhw DROP SWAP EXIT
  : UM/MOD_L4
  .dhw 3DROP
  .dhw -1
  .dhw DUP EXIT # overflow, return max

  :f M/MOD
  # ( d n -- r q )
  # Signed floored divide of double by single. Return mod and quotient.
  .dhw DUP 0< DUP >R
  .dhw (BRZ) M/MOD_L1
  .dhw NEGATE >R DNEGATE R>
  : M/MOD_L1
  .dhw >R DUP 0<
  .dhw (BRZ) M/MOD_L2
  .dhw R@ +
  : M/MOD_L2
  .dhw R> UM/MOD R>
  .dhw (BRZ) M/MOD_L3
  .dhw SWAP NEGATE SWAP
  : M/MOD_L3
  .dhw EXIT

  :f /%_model
  :f /MOD
  # ( n n -- r q )
  # Signed divide. Return mod and quotient.
  .dhw OVER 0< SWAP M/MOD EXIT

  :f %
  :f MOD
  # ( n n -- r )
  # Signed divide. Return mod only.
  .dhw /% DROP EXIT

  :f /
  # ( n n -- q )
  # Signed divide. Return quotient only.
  .dhw /% NIP EXIT

  :f UM*
  # ( u u -- ud )
  # Unsigned multiply. Return double product.
  .dhw 0 SWAP 31 >R
  : UM*_L1
  .dhw DUP UM+ >R >R
  .dhw DUP UM+ R> + R>
  .dhw (BRZ) UM*_L2
  .dhw >R OVER UM+ R> +
  : UM*_L2
  .dhw (NEXT) UM*_L1
  .dhw ROT DROP EXIT

  :f *_model
  # ( n n -- n )
  # Signed multiply. Return single product.
  .dhw UM* DROP EXIT

  :f M*
  # ( n n -- d )
  # Signed multiply. Return double product.
  .dhw DUP XOR 0< >R
  .dhw ABS SWAP ABS UM*
  .dhw R>
  .dhw SKZ DNEGATE
  .dhw EXIT

  :f */%
  :f */MOD
  # ( n1 n2 n3 -- r q )
  # Multiply n1 and n2, then divide by n3. Return mod and quotient.
  .dhw >R M* R> M/MOD EXIT

  :f */
  # ( n1 n2 n3 -- q )
  # Multiply n1 by n2, then divide by n3. Return quotient only.
  .dhw */% NIP EXIT

  :f CELL+
  # ( a -- a )
  # Add cell size in byte to address.
  .dhw (LIT_H) CELLL + EXIT

  :f CELL-
  # ( a -- a )
  # Subtract cell size in byte from address.
  .dhw (LIT_H) CELLL - EXIT

  :f CELLS
  # ( n -- n )
  # Multiply tos by cell size in bytes.
  .dhw (LIT_H) CELLL * EXIT

  :f ALIGNED
  # ( b -- a )
  # Align address to the cell boundary.
  .dhw DUP 0 (LIT_H) CELLL
  .dhw UM/MOD DROP DUP
  .dhw (BRZ) ALIGNED_L1
  .dhw (LIT_H) CELLL SWAP -
  : ALIGNED_L1
  .dhw + EXIT

  :f 8+
  .dhw 4+ 4+ EXIT
  
  :f RDROP
  # R:( a raddr -- raddr )
  .dhw R>      # ( raddr ) R:( a )
  .dhw R>      # ( raddr a ) R:( )
  .dhw DROP    # ( raddr ) R:( )
  .dhw >R      # ( ) R:( raddr )
  .dhw EXIT

  :f (USER_PTR@)
  .dhw (IBMz)
  .dhw 0x1711        # XR GR1, GR1
  .dhw 0x171D        # XR GR1, GR13
  .dhw 0x47F0 COMMON_TAIL1_ibmz_instrprt # BC 0xF,  0x052 (GR8)        jump to COMMON_TAIL1

  :f UserVarArea_init
  .dhw UZERO (LIT)
  .dw_calc  0x0000_FA00
  .dhw (USER_PTR@) +
  .dhw 64 CELLS CMOVE EXIT

  :f UZERO
  .dhw (VAR)
  .dw  0 0 0 0
  .dw  SPP     # SP0
  .dw  RPP     # RP0
  .dw  ?RX     # '?KEY
  .dw  TX!     # 'EMIT
  .dw  ACCEPT  # 'EXPECT
  .dw  KTAP    # 'TAP
  .dw  TX!     # 'ECHO
  .dw  .OK     # 'PROMPT
  .dw  BASEE   # BASE
  .dw  0       # tmp
  .dw  0       # SPAN
  .dw  0       # >IN
  .dw  0       # #TIB
  .dw  TIBB    # TIB
  .dw  0       # CSP
  .dw  INTER   # 'EVAL
  .dw  NUMBQ   # 'NUMBER
  .dw  0       # HLD
  .dw  0       # HANDLER
  .dw  0       # CONTEXT pointer
  .dw  0       # vocabulary stack  VOCSS
  .dw  0       # - || -
  .dw  0       # - || -
  .dw  0       # - || -
  .dw  0       # - || -
  .dw  0       # - || -
  .dw  0       # - || -
  .dw  0       # - || -
  .dw  0       # CURRENT pointer
  .dw  0       # vocabulary link pointer
  .dw  CTOP    # CP
  .dw  NTOP    # NP
  .dw  LASTN   # LAST

  :f (USER_VAR)
  # ( -- addr )
  .dhw R> @ (USER_PTR@) + EXIT

  :f USERPTR
  # ( -- a )
  # Pointer to the user area.
  .dhw (LIT_H)
  .dhw_calc 0xFA00
  .dhw (USER_PTR@) + EXIT

  :f doUSER
  # ( -- a )
  # Run time routine for user variables.
  .dhw R> H@ CELLS USERPTR + EXIT

  :f SP0
  # ( -- a )
  # Pointer to bottom of the data stack.
  .dhw doUSER
  .dhw_calc 0x5

  :f RP0
  # ( -- a )
  # Pointer to bottom of the return stack.
  .dhw doUSER
  .dhw_calc 0x6

  :f '?KEY
  # ( -- a )
  # Execution vector of ?KEY.
  .dhw doUSER
  .dhw_calc 0x7

  :f 'EMIT
  # ( -- a )
  # Execution vector of EMIT.
  .dhw doUSER
  .dhw_calc 0x8

  :f 'EXPECT
  # ( -- a )
  # Execution vector of EXPECT.
  .dhw doUSER
  .dhw_calc 0x9

  :f 'TAP
  # ( -- a )
  # Execution vector of TAP.
  .dhw doUSER
  .dhw_calc 0xA

  :f 'ECHO
  # ( -- a )
  # Execution vector of ECHO.
  .dhw doUSER
  .dhw_calc 0xB

  :f 'PROMPT
  # ( -- a )
  # Execution vector of PROMPT.
  .dhw doUSER
  .dhw_calc 0xC

  :f BASE
  # ( -- a )
  # Storage of the radix base for numeric I/O.
  .dhw doUSER
  .dhw_calc 0xD

  :f tmp COMPILE
  # ( -- a )
  # A temporary storage location used in parse and find.
  .dhw doUSER
  .dhw_calc 0xE

  :f SPAN
  # ( -- a )
  # Hold character count received by EXPECT.
  .dhw doUSER
  .dhw_calc 0xF

  :f >IN
  # ( -- a )
  # Hold the character pointer while parsing input stream.
  .dhw doUSER
  .dhw_calc 0x10

  :f #TIB
  # ( -- a )
  # Hold the current count and address of the terminal input buffer.
  .dhw doUSER
  .dhw_calc 0x11
  # alott 2 cells

  :f CSP
  # ( -- a )
  # Hold the stack pointer for error checking.
  .dhw doUSER
  .dhw_calc 0x13

  :f 'EVAL
  # ( -- a )
  # Execution vector of EVAL.
  .dhw doUSER
  .dhw_calc 0x14

  :f 'NUMBER
  # ( -- a )
  # Execution vector of NUMBER?.
  .dhw doUSER
  .dhw_calc 0x15

  :f HLD
  # ( -- a )
  # Hold a pointer in building a numeric output string.
  .dhw doUSER
  .dhw_calc 0x16

  :f HANDLER
  # ( -- a )
  # Hold the return stack pointer for error handling.
  .dhw doUSER
  .dhw_calc 0x17

  :f CONTEXT
  # ( -- a )
  # A area to specify vocabulary search order.
  .dhw doUSER
  .dhw_calc 0x18
  # alott 8 cells when VOCSS == 8

  :f CURRENT
  # ( -- a )
  # Point to the vocabulary to be extended.
  .dhw doUSER
  .dhw_calc 0x20

  :f CP
  # ( -- a )
  # Point to the top of the code dictionary.
  .dhw doUSER
  .dhw_calc 0x21

  :f NP
  # ( -- a )
  # Point to the bottom of the name dictionary.
  .dhw doUSER
  .dhw_calc 0x22

  : LAST
  # ( -- a )
  # Point to the last name in the name dictionary.
  .dhw doUSER
  .dhw_calc 0x23


  :f BYE
  .dhw .|"
  .utf8_hwc " Quitting zeForth to where? \\n"
  .dhw EXIT

  :f ?RX
  # ( -- c T | F )
  # Return input character and true, or a false if no input.
  # TBD on what to do here
  .dhw FALSE
  .dhw EXIT

  :f TX!
  # ( c -- )
  # Send character c to the output device.
  # TBD on what to do here
  .dhw DROP
  .dhw EXIT

  :f COUNT
  # ( b -- b +n )
  # Return count halfcell of a string and add 2 to byte address.
  .dhw DUP 2+
  .dhw SWAP H@ EXIT

  : EMIT
  # ( c -- )
  # Send a character to the output device.
  .dhw 'EMIT @EXECUTE EXIT

  : PACE
  # ( -- )
  # Send a pace character for the file downloading process.
  .dhw (LIT_H)
  .dhw_calc 11
  .dhw EMIT EXIT

  :f SPACE
  # ( -- )
  # Send the blank character to the output device.
  .dhw BLANK EMIT EXIT

  :f TYPE
  # ( b u -- )
  # Output u characters from b.
  .dhw >R
  .dhw (JMP) TYPE_L2
  : TYPE_L1
  .dhw DUP C@ EMIT
  .dhw 1+
  : TYPE_L2
  .dhw (NEXT) TYPE_L1
  .dhw DROP EXIT

  :f ."| COMPILE
  # ( -- )
  # Run time routine of ." . Output a compiled string.
  .dhw do$ COUNT TYPE EXIT

  :f kTAP
  # ( bot eot cur c -- bot eot cur )
  # Process a key stroke, CR or backspace.
  .dhw DUP (LIT_H) CRR XOR
  .dhw (BRZ) kTAP_L2
  .dhw (LIT_H) BKSPP XOR
  .dhw (BRZ) kTAP_L1
  .dhw BLANK TAP EXIT
  : kTAP_L1
  .dhw BKSP EXIT
  : kTAP_L2
  .dhw DROP SWAP DROP DUP EXIT

  :f accept
  # ( b u -- b u )
  # Accept characters to input buffer. Return with actual count.
  .dhw OVER + OVER
  : accept_L1
  .dhw 2DUP  XOR
  .dhw (BRZ) accept_L4
  .dhw KEY   DUP
  # .dhw BLANK - (LIT_H) 95 U<
  .dhw BLANK (LIT_H) 0d127 WITHIN
  .dhw (BRZ) accept_L2
  .dhw TAP
  .dhw (JMP) accept_L3
  : accept_L2
  .dhw 'TAP @EXECUTE
  : accept_L3
  .dhw (JMP) accept_L1
  : accept_L4
  .dhw DROP OVER - EXIT

  :f QUERY
  # ( -- )
  # Accept input stream to terminal input buffer.
  .dhw TIB (LIT_H)
  .dhw_calc 0d80
  .dhw 'EXPECT @EXECUTE #TIB !
  .dhw DROP 0 >IN ! EXIT

  :f CATCH
  # ( ca -- 0 | err# )
  # Execute word at ca and set up an error frame for it.
  .dhw SP@ >R HANDLER @ >R    # save error frame
  .dhw RP@ HANDLER ! EXECUTE  # execute
  .dhw R>  HANDLER !          # restore error frame
  .dhw R>  DROP 0    EXIT     # no error

  :f NULL$
  # ( -- a )
  # Return address of a null string with zero count.
  .dhw (VAR)     # emulate CREATE
	.dhw_calc 0x0000
  .utf8 "tófa, melrakki, rebbi."
  # it was coyote in the original eForth

  :f [ IMMEDIATE
  # ( -- )
  # Start the text interpreter.
  .dhw (LIT_H) $INTERPRET 'EVAL ! EXIT

  :f .OK
  # ( -- )
  # Display 'ok' only while interpreting.
  .dhw (LIT_H) $INTERPRET 'EVAL @ =
  .dhw (BRZ) .OK_L1
  .dhw ."|
  .utf8_hwc " ok"
  : .OK_L1
  .dhw CR EXIT

  :f EVAL
  # ( -- )
  # Interpret the input stream.
  : EVAL_L1
  .dhw TOKEN DUP H@          # ?input stream empty
  .dhw (BRZ) EVAL_L2
  .dhw 'EVAL @EXECUTE ?STACK # evaluate input, check stack
  .dhw (JMP) EVAL_L1
  : EVAL_L2
  .dhw 'PROMPT @EXECUTE EXIT # prompt

  :f PRESET
  # ( -- )
  # Reset data stack pointer and the terminal input buffer.
  .dhw SP0 @ SP!
  .dhw (LIT_H) TIBB #TIB CELL+ ! EXIT

  :f xio
  # ( a a a -- )
  # Reset the I/O vectors 'EXPECT, 'TAP, 'ECHO and 'PROMPT.
  .dhw (LIT_H) accept 'EXPECT D!
  .dhw 'ECHO D! EXIT

  :f FILE
  # ( -- )
  # Select I/O vectors for file download.
  .dhw (LIT_H) PACE (LIT_H) (DROP)
  .dhw (LIT_H) kTAP xio EXIT

  :f HAND
  # ( -- )
  # Select I/O vectors for terminal interface.
  .dhw (LIT_H) .OK  (LIT_H) EMIT
  .dhw (LIT_H) kTAP xio EXIT

  :f I/O
  # ( -- a )
  # Array to store default I/O vectors.
  .dhw (VAR)    # emulate CREATE
  .dw  ?RX  TX! # default I/O vectors

  :f CONSOLE
  # ( -- )
  # Initiate terminal interface.
  .dhw I/O D@ '?KEY D!  # restore default I/O device
  .dhw HAND EXIT        # keyboard input

  :f QUIT
  # ( -- )
  .dhw RP0 @ RP!                # reset return stack pointer
  : QUIT_L1
  .dhw [                        # start interpretation
  : QUIT_L2
  .dhw QUERY                    # get input
  .dhw (LIT_H) EVAL CATCH ?DUP	# evaluate input
  .dhw (BRZ) QUIT_L2            # continue till error
  .dhw 'PROMPT @ SWAP           # save input device
  .dhw CONSOLE NULL$ OVER XOR   # ?display error message
  .dhw (BRZ) QUIT_L3
  .dhw SPACE COUNT TYPE         # error message
  .dhw ."|                      # error prompt
  .utf8_hwc " ? "
  : QUIT_L3
  .dhw (LIT_H) .OK XOR          # ?file input
  .dhw (BRZ) QUIT_L4
  .dhw (LIT_H) ERR DUP EMIT EMIT # file error, tell host
  : QUIT_L4
  .dhw PRESET                   # some cleanup
  .dhw (JMP) QUIT_L1

  
  # ##########

  :f CPU_saved_state_base
  # ( -- offset )
  .dhw (CONST_H) 0x800

  :f CPU_saved_state_base_offset
  # ( -- offset ) R:( client_raddr raddr -- )
  .dhw CPU_saved_state_base R> H@ + EXIT

  :f CPU_saved_state_CPU_Timer_390
  # ( -- offset )
  .dhw CPU_saved_state_base_offset
  .dhw_calc 0d216

  :f CPU_saved_state_Clock_comparator_390
  # ( -- offset )
  .dhw CPU_saved_state_base_offset
  .dhw_calc 0d224

  :f CPU_saved_state_PSW
  # ( -- offset )   its at same offset both in ESA/390 and z/Arch
  .dhw CPU_saved_state_base_offset
  .dhw_calc 0d256

  :f CPU_saved_state_Prefix_390
  # ( -- offset )
  .dhw CPU_saved_state_base_offset
  .dhw_calc 0d264

  :f CPU_saved_state_AR_390
  # ( -- offset )
  .dhw CPU_saved_state_base_offset
  .dhw_calc 0d288

  :f CPU_saved_state_FPR_390
  # ( -- offset )
  .dhw CPU_saved_state_base_offset
  .dhw_calc 0d352

  :f CPU_saved_state_GR_390
  # ( -- offset )
  .dhw CPU_saved_state_base_offset
  .dhw_calc 0d384

  :f CPU_saved_state_CR_390
  # ( -- offset )
  .dhw CPU_saved_state_base_offset
  .dhw_calc 0d448

  :f CPU_saved_state__sub0
  # ( CPU_ss_addr -- CPU_ss_addr ... ) R:( raddr --)
  .dhw DUP                 # ( ss ss )
  .dhw CPU_saved_state_PSW # ( ss ss off )
  .dhw +                   # ( ss addr )
  .dhw H@                  # ( ss halfcell )
  .dhw 4>> 1&              # ( ss bit )  we want bit 12 as IBM counts them
  .dhw 2*                  # ( ss bit<<1 )
  .dhw R>                  # ( ss selection raddr )
  .dhw DUP                 # ( ss selection raddr raddr )
  .dhw 4+                  # ( ss selection raddr raddr+4 ) skip next two halfcells
  .dhw >R                  # ( ss selection raddr ) R:( raddr+4 )
  .dhw +                   # ( ss raddr+sel ) R:( raddr+4 )
  .dhw >R                  # ( ss ) R:( raddr+4 raddr+sel )
  .dhw EXIT
  
  :f CPU_saved_state_CPU_Timer_D@
  # ( CPU_ss_addr -- TimerU TimerL )
  .dhw CPU_saved_state__sub0
  .dhw CPU_saved_state_CPU_Timer_zArch
  .dhw CPU_saved_state_CPU_Timer_390
  .dhw + D@ EXIT

  :f CPU_saved_state_CPU_Timer_D!
  # ( TimerU TimerL CPU_ss_addr -- )
  .dhw CPU_saved_state__sub0
  .dhw CPU_saved_state_CPU_Timer_zArch
  .dhw CPU_saved_state_CPU_Timer_390
  .dhw + D! EXIT

  :f CPU_saved_state_Clock_comparator_D@
  # ( CPU_ss_addr -- ccU ccL )
  .dhw CPU_saved_state__sub0
  .dhw CPU_saved_state_Clock_comparator_zArch
  .dhw CPU_saved_state_Clock_comparator_390
  .dhw + D@ EXIT

  :f CPU_saved_state_Clock_comparator_D!
  # ( ccU ccL CPU_ss_addr -- )
  .dhw CPU_saved_state__sub0
  .dhw CPU_saved_state_Clock_comparator_zArch
  .dhw CPU_saved_state_Clock_comparator_390
  .dhw + D! EXIT

  :f CPU_saved_state_PSW_Q@
  # ( CPU_ss_addr -- PSW_UU PSW_UL PSW_LU PSW_LL )
  .dhw CPU_saved_state_PSW + Q@ EXIT

  :f CPU_saved_state_PSW_Q!
  # ( PSW_UU PSW_UL PSW_LU PSW_LL CPU_ss_addr -- )
  .dhw CPU_saved_state_PSW + Q! EXIT

  :f able_interrupts__common1
  .dhw CPU_saved_state_PSW # ( ss off )
  .dhw +                   # ( addr )
  .dhw DUP                 # ( addr addr )
  .dhw @                   # ( addr PSW_UU )
  .dhw EXIT

  :f SWAP_!_EXIT
  .dhw SWAP ! RDROP EXIT
  
  :f enable_external_interrupts
  # ( CPU_ss_addr -- )
  .dhw able_interrupts__common1 # ( addr PSW_UU )
  .dhw 1 24 << OR               # ( addr PSW_UU' )
  .dhw SWAP_!_EXIT

  :f disable_external_interrupts
  # ( CPU_ss_addr -- )
  .dhw able_interrupts__common1 # ( addr PSW_UU )
  .dhw 1 24 << INVERT &         # ( addr PSW_UU' )
  .dhw SWAP_!_EXIT

  :f external_interrupts@
  # ( CPU_ss_addr -- bool )
  .dhw able_interrupts__common1 # ( addr PSW_UU )
  .dhw NIP                      # ( PSW_UU )
  .dhw 1 24 << &                # ( dirty_bool )
  .dhw (JMP) CLEANBOOL

  :f enable_IO_interrupts
  # ( CPU_ss_addr -- )
  .dhw able_interrupts__common1 # ( addr PSW_UU )
  .dhw 2 24 << OR               # ( addr PSW_UU' )
  .dhw SWAP_!_EXIT

  :f disable_IO_interrupts
  # ( CPU_ss_addr -- )
  .dhw able_interrupts__common1 # ( addr PSW_UU )
  .dhw 2 24 << INVERT &         # ( addr PSW_UU' )
  .dhw SWAP_!_EXIT              #

  :f IO_interrupts@
  # ( CPU_ss_addr -- bool )
  .dhw able_interrupts__common1 # ( addr PSW_UU )
  .dhw NIP                      # ( PSW_UU )
  .dhw 2 24 << &                # ( dirty_bool )
  .dhw (JMP) CLEANBOOL

  :f enable_PER_interrupts
  # ( CPU_ss_addr -- )
  .dhw able_interrupts__common1 # ( addr PSW_UU )
  .dhw 0x40 24 << OR            # ( addr PSW_UU' )
  .dhw SWAP_!_EXIT

  :f disable_PER_interrupts
  # ( CPU_ss_addr -- )
  .dhw able_interrupts__common1 # ( addr PSW_UU )
  .dhw 0x40 24 << INVERT &      # ( addr PSW_UU' )
  .dhw SWAP_!_EXIT

  :f PER_interrupts@
  # ( CPU_ss_addr -- bool )
  .dhw able_interrupts__common1 # ( addr PSW_UU )
  .dhw NIP                      # ( PSW_UU )
  .dhw 0x40 24 << &             # ( dirty_bool )
  .dhw (JMP) CLEANBOOL

  :f turn_DAT_mode_on
  # ( CPU_ss_addr -- )
  .dhw able_interrupts__common1 # ( addr PSW_UU )
  .dhw 4 24 << OR               # ( addr PSW_UU' )
  .dhw SWAP_!_EXIT

  :f turn_DAT_mode_off
  # ( CPU_ss_addr -- )
  .dhw able_interrupts__common1 # ( addr PSW_UU )
  .dhw 4 24 << INVERT &
  .dhw SWAP_!_EXIT

  :f DAT_mode@
  # ( CPU_ss_addr -- bool )
  .dhw able_interrupts__common1 # ( addr PSW_UU )
  .dhw NIP                      # ( PSW_UU )
  .dhw 4 24 << &                # ( dirty_bool )
  .dhw (JMP) CLEANBOOL

  :f PSW_storageKey@
  # ( CPU_ss_addr -- keynybble )
  # Key here is an IBM term and not a KeyKOS term
  .dhw able_interrupts__common1 # ( addr PSW_UU )
  .dhw NIP                      # ( PSW_UU )
  .dhw 20 >> 0xF & EXIT         # ( keynybble )

  :f PSW_storageKey!
  # ( keynybble CPU_ss_addr -- )
  # Key here is an IBM term and not a KeyKOS term
  .dhw 0xF &                    # ( keynybble )
  .dhw able_interrupts__common1 # ( keynybble addr PSW_UU )
  .dhw 0xF 20 << INVERT &       # ( keynybble addr PSW_UU' )
  .dhw ROT 20 << OR             # ( addr PSW_UU" )
  .dhw SWAP_!_EXIT

  :f enable_MachineCheck_interrupts
  # ( CPU_ss_addr -- )
  .dhw able_interrupts__common1 # ( addr PSW_UU )
  .dhw 4 16 << OR
  .dhw SWAP_!_EXIT

  :f disable_MachineCheck_interrupts
  # ( CPU_ss_addr -- )
  .dhw able_interrupts__common1 # ( addr PSW_UU )
  .dhw 4 16 << INVERT &
  .dhw SWAP_!_EXIT

  :f MachineCheck_interrupts@
  # ( CPU_ss_addr -- bool )
  .dhw able_interrupts__common1 # ( addr PSW_UU )
  .dhw NIP                      # ( PSW_UU )
  .dhw 4 16 << &                # ( dirty_bool )
  .dhw (JMP) CLEANBOOL

  :f turn_WaitState_on
  # ( CPU_ss_addr -- )
  .dhw able_interrupts__common1 # ( addr PSW_UU )
  .dhw 2 16 << OR
  .dhw SWAP_!_EXIT

  :f turn_WaitState_off
  # ( CPU_ss_addr -- )
  .dhw able_interrupts__common1 # ( addr PSW_UU )
  .dhw 2 16 << INVERT &
  .dhw SWAP_!_EXIT

  :f WaitState@
  # ( CPU_ss_addr -- bool )
  .dhw able_interrupts__common1
  .dhw NIP
  .dhw 2 16 << &
  .dhw (JMP) CLEANBOOL

  :f turn_ProblemMode_on
  # ( CPU_ss_addr -- )
  .dhw able_interrupts__common1
  .dhw 1 16 << OR
  .dhw SWAP_!_EXIT

  :f turn_ProblemMode_off
  # ( CPU_ss_addr -- )
  .dhw able_interrupts__common1
  .dhw 1 16 << INVERT &
  .dhw SWAP_!_EXIT

  :f ProblemMode@
  # ( CPU_ss_addr -- bool )
  .dhw able_interrupts__common1
  .dhw 1 16 << &
  .dhw (JMP) CLEANBOOL
  

  # ----

  :f IO_Interruption_Code
  .dhw (CONST)
  .dw  0x000000B8

  :f IO_interrupt_handler_addr_ibm390
  .dhw (VAR)
  :f IO_interrupt_handler_ibm390
  # IO New PSW (REALADDR: 0x78) points here, disables interrupts
  .dhw 0x900F 0x0180 # STM GR0, GR15, 0x180 (0)  ESA/390 mode. See instruction STMG for z/Arch mode
  .dhw 0x41DD 0x0xxx # LA  GR13, 0x___ (GR13, 0) gr13 := 0x___  tbd: where does the USER_VARS page for IO interrupt handling task live?
  .dhw 0x89D0 0x0004 # SLL GR13, 0x004           gr13 := gr13 << 4
  .dhw 0x980F 0xD980 # LM  GR0, GR15, 0x980 (GR13)  ESA/390 mode. See instruction LMG for z/Arch mode. 
                     #                              Note there is different offset for z/Arch.
                     #                              0d384 = 0x180    0x800 + 0x180 = 0x980
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (GR8)        jump to NXT

  :f IO_return_from_interrupt_ibm390
  .dhw (USER_PTR@)
  .dhw (IBMz)
  .dhw 0x5FB0 4_ibmz_instrprt   # SL GR11, 0x04A (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B                   # LR GR1,  GR11              gr1 := stored General Registers
  .dhw 0x980F 0x1000            # LM  GR0, GR15, 0x000 (GR1) ESA/390 mode. See instruction LMG for z/Arch mode
  .dhw 0x8200 0x0038            # LPSW 0x0038 (GR0)          Load the interrupted PSW into the PSW register

  :f IO_TestSubChan
  # ( SubChan IRB_addr -- ConditionCode )
  .dhw (IBMz)
  .dhw 0x5FB0 4_ibmz_instrprt   # SL GR11, 0x04A (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x182B                   # LR GR2,  GR11              tmp2 := IRB_addr
  .dhw 0x5FB0 4_ibmz_instrprt   # SL GR11, 0x04A (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B                   # LR GR1,  GR11              gr1 := tmp1 := SubChan
  .dhw 0xB235 0x2000            # TSCH 0 (GR2)               TestSubCHannel stores the InterruptRequestBlock
  : COMMON_TAIL5_ibmz
  .dhw 0xB222 0x0010            # IPM GR1                    bits 34 and 35 (in 64 bit reg) is the condition code, we want them at 62 and 63
  .dhw 0x8810 0x001C            # SRL GR1, 0x01C             gr1 := gr1 >> 0d28     63-35=28  0d28=0x1C
  .dhw 0x47F0 COMMON_TAIL1_ibmz_instrprt # BC 0xF,  0x052 (GR8)        jump to COMMON_TAIL1

  :f IO_task_subchan_interrupt_dispatch_tbl
  .dhw (USER_VAR)
  .dw  0x0000_09FC

  :f IO_interrupt_handler_task
  # fcpu32/16 instruction pointer for task points here when IO interrupts happen
  .dhw (LIT)
  .dhw_calc 0x0180
  .dhw (USER_PTR@) 64 CMOVE    # copy saved GeneralRegisters for safe keeping
  .dhw IO_Interruption_Code @  # get which SubChannel was the cause
  .dhw DUP
  .dhw 1+
  .dhw 2<<
  .dhw IO_task_subchan_interrupt_dispatch_tbl @
  .dhw + @                     # ( subchan requesting_task )
  .dhw (LIT_H) 0x0FB0 +        # ( subchan IRB_addr-4 )
  .dhw 2DUP                    # ( subchan IRB_addr-4 subchan IRB_addr-4 )
  .dhw ! 4+                    # ( subchan IRB_addr )
  .dhw TUCK                    # ( IRB_addr subchan IRB_addr )
  .dhw DUP 24 4* 0 FILL        # ( IRB_addr subchan IRB_addr ) zero out where Interrupt Request Block goes
  .dhw IO_TestSubChan          # ( IRB_addr condition_code )
  .dhw SWAP 24 4* + C!         # ( )
  .dhw IO_return_from_interrupt # ( )
  .dhw (JMP) IO_interrupt_handler_task # the task is an endless loop

  # 2026-02-11T00:20 Zarutian:
  #   I am musing on if I should have a mapping of a SubChan to Task_ptr
  #   This enables Task pending on a SubChannel interrupt
  #   When such interrupt occurs the store the IRB (max 24 cells) in that tasks USER_VARS at offset 0xFB0
  #
  # 2026-02-12T12:47 Zarutian:
  #   Task switching is, for now, basic preemptive round robin except for interrupt handler tasks
  #   Happens at 100 Hz or every 10 milliseconds per the CPU Timer
  #
  # 2026-02-13T12:20 Zarutian:
  #   In a Multiprocessing (IBM term) setup, each CPU has its own entry in the
  #   global__current_task table
  #
  #   Each KK Domain process runs inside of a Domain runner task.
  #   (There are more Domains than processes)
  #   Each KFORK spawns a new Domain runner task or, if max_domain_tasks is reach, waits for one to become
  #   available.
  #   Each KRET to a non-returning key, such as a DataKey (KK term) terminates a Domain runner task
  #
  # 2026-02-21T02:06 Zarutian:
  #   Been musing on the Task layout for storing a CPU's state.
  #   I am thinking of just stealing IBMs layout as written out by Store Status at Address
  #   See Figures 4-30 and 4-31 in the z/Arch PoOPs.
  #   Restriction is that it takes 512 bytes and if done via the CPU SIGNAL mechanism must start on 512 alignment

  :f External_Interruption_Code
  # its is a halfword, so use H@
  .dhw (CONST)
  .dw  0x00000086

  :f External_Interrupt_Code_CPU_Timer
  .dhw (CONST)
  .dhw 0x1005

  :f External_interrupt_handler_ibm390
  .dhw (VAR)
  : External_interrupt_handler_ibm390
  # External interrupt New PSW (REALADR: 0x58) points here.
  .dhw 0x900F 0x0180 # STM GR0, GR15, 0x180 (0)  ESA/390 mode. See instruction STMG for z/Arch mode
  .dhw 0x41DD 0x0xxx # LA  GR13, 0x___ (GR13, 0) gr13 := 0x___  tbd: where does the USER_VARS page for External interrupt handling task live?
  .dhw 0x89D0 0x0004 # SLL GR13, 0x004            gr13 := gr8 << 4
  .dhw 0x980F 0xD980 # LM  GR0, GR15, 0x980 (GR13)  ESA/390 mode. See instruction LMG for z/Arch mode
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (GR8)        jump to NXT

  :f External_return_from_interrupt_ibm390
  .dhw (USER_PTR@)
  .dhw (IBMz)
  .dhw 0x5FB0 4_ibmz_instrprt   # SL GR11, 0x04A (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B                   # LR GR1,  GR11              gr1 := stored General Registers
  .dhw 0x980F 0x1000            # LM  GR0, GR15, 0x000 (GR1) ESA/390 mode. See instruction LMG for z/Arch mode
  .dhw 0x8200 0x0018            # LPSW 0x0018 (GR0)          Load the interrupted PSW into the PSW register
  
  :f External_interrupt_handler_task
  # fcpu32/16 instruction pointer for task points here when External interrupts happen
  .dhw (LIT)
  .dw_calc 0x00000180
  .dhw (USER_PTR@) 64 CMOVE    # copy saved GeneralRegisters for safe keeping
  .dhw External_Interruption_Code H@ # ( interruption_code )
  .dhw DUP
  .dhw External_Interrupt_Code_CPU_Timer
  .dhw =                       # ( interruption_code cpu_timer? )
  .dhw (BRZ)
  .dhw External_interrupt_handler_task_L0
  .dhw DROP
  .dhw (USER_PTR@)
  .dhw global__current_task @  # ( extint_task_ptr task_USER_VARS_ptr )
  .dhw 0x0980 CMOVE            # save the interupted task General Registers
  .dhw External_interrupt_old_PSW D@
  .dhw global__current_task @  # ( Old_PSW_u Old_PSW_l task_USER_VARS_ptr )
  .dhw 0x0900 + D!             # ( )
  .dhw global__current_task @  #
  .dhw 0x0F00 64 + +           #
  .dhw control_registers@
  .dhw global__current_task @  #
  .dhw 0x0FFC + @              #
  .dhw global__current_task !  # next task is now current task
  .dhw global__current_task @  #
  .dhw 0x0F00 +                #
  .dhw (USER_PTR@) 64 CMOVE
  .dhw global__current_task @  #
  .dhw 0x0FF0 +
  .dhw External_interrupt_old_PSW
  .dhw 8 CMOVE                 #
  .dhw global__current_task @  #
  .dhw 0x0F00 64 + +           #
  .dhw control_registers!      #
  .dhw 10millisecond_in_TOD_Clock_units
  .dhw CPU_Timer!
  .dhw External_return_from_interrupt
  : External_interrupt_handler_task_L0
  
  .dhw External_return_from_interrupt
  .dhw (JMP) External_interrupt_handler_task

  :f CPU_address
  # ( -- cpu_address )
  # cpu_address is a halfcell (16 bits)
  .dhw (IBMz)
  .dhw 0x1711                   # XR GR1, GR1
  .dhw 0x501B 0x0000            # ST GR1,  0x000 (GR11, 0)  memory[datastack_ptr] := tmp1
  .dhw 0x41BB 0x0002            # LA GR11, 0x002 (GR11, 0)  datastack_ptr := datastack_ptr + 2
  .dhw 0xB212 0xB000            # STAP 0x000 (GR11)
  .dhw 0x41BB 0x0002            # LA GR11, 0x002 (GR11, 0)  datastack_ptr := datastack_ptr + 2
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (GR8)       jump to NXT

  :f CPU_prefix!
  # store into the cpu prefix register
  # ( Prefix -- )
  .dhw (IBMz)
  .dhw 0x5FB0 4_ibmz_instrprt   # SL GR11, 0x04A (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0xB210 B000              # SPX 0 (GR11)
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (GR8)       jump to NXT

  :f CPU_prefix@
  # fetch from the cpu prefix register
  # ( -- Prefix )
  .dhw (IBMz)
  .dhw 0xB211 B000              # STPX 0 (GR11)
  .dhw 0x41BB 0x0004            # LA GR11, 0x004 (GR11, 0)   datastack_ptr := datastack_ptr + 4
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (GR8)       jump to NXT


  :f global__current_task
  .dhw (VAR)
  .dw  0x0000F000 # the bootup/main task

  :f CPU_Timer!
  # ( Du Dl -- )
  .dhw (IBMz)
  .dhw 0x5FB0 4_ibmz_instrprt   # SL GR11, 0x04A (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x5FB0 4_ibmz_instrprt   # SL GR11, 0x04A (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0xB208 B000              # SPT 0 (GR111)              CPU_Timer := datastack
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (GR8)       jump to NXT
  
  :f 10millisecond_in_TOD_Clock_units
  .dhw (CONST_D)
  # .ddw 0x0000_0000_003E_8000 # 1 ms
  .ddw_calc 0x0038_8000 0d10 *

  :f control_registers!
  # store into control registers
  # ( ptr -- )
  .dhw (IBMz)
  .dhw 0x5FB0 4_ibmz_instrprt   # SL GR11, 0x___ (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B                   # LR GR1,  GR11              gr1 := ptr
  .dhw 0xB70F 0x1000            # LCTL CR0, CR15, 0 (GR1)    ESA/390 mode. See LCTLG for z/Arch
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (GR8)       jump to NXT

  :f control_registers@
  # fetch from control registers
  # ( ptr -- )
  .dhw (IBMz)
  .dhw 0x5FB0 4_ibmz_instrprt   # SL GR11, 0x___ (0, GR8)    datastack_ptr := datastack_ptr - 4
  .dhw 0x181B                   # LR GR1,  GR11              gr1 := ptr
  .dhw 0xB60F 0x1000            # STCTL CR0, CR15, 0 (GR1)   ESA/390 mode. See STCTG for z/Arch
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (GR8)       jump to NXT


  :f COLDD
  .dhw (IBMz)
  ########################
  # Cold start  ibmz (z/Arch or z390 code)
  # (Re)start PSW points here
  : COLDD_start
  # zero out the z390 General Registers
  .dhw 0x1700        # XR GR0, GR0
  .dhw 0x1711        # XR GR1, GR1
  .dhw 0x1722        # XR GR2, GR2
  .dhw 0x1733        # XR GR3, GR3
  .dhw 0x1744        # XR GR4, GR4
  .dhw 0x1755        # XR GR5, GR5
  .dhw 0x1766        # XR GR6, GR6
  .dhw 0x1777        # XR GR7, GR7
  .dhw 0x1788        # XR GR8, GR8
  .dhw 0x1799        # XR GR9, GR9
  .dhw 0x17AA        # XR GR10, GR10
  .dhw 0x17BB        # XR GR11, GR11
  .dhw 0x17CC        # XR GR12, GR12
  .dhw 0x17DD        # XR GR13, GR13
  .dhw 0x17EE        # XR GR14, GR14
  .dhw 0x17FF        # XR GR15, GR15
  # ibmz_start := 0x00002000
  .dhw 0x4188 0x0200 # LA  GR8, 0x200 (GR8, 0)   gr8 := 0x200
  .dhw 0x8980 0x0004 # SLL GR8, 0x004            gr8 := gr8 << 4
  # datastack_ptr := 0x0000FD00
  .dhw 0x41BB 0x0FD0 # LA  GR11, 0xFD0 (GR11, 0) gr11 := 0xFD0
  .dhw 0x89B0 0x0004 # SLL GR11, 0x004           gr11 := gr11 << 4
  # returnstack_ptr := 0x000FE00
  .dhw 0x41CC 0x0FE0 # LA  GR12, 0xFE0 (GR12, 0) gr12 := 0xFE0
  .dhw 0x89C0 0x0004 # SLL GR12, 0x004           gr12 := gr12 << 4
  # instruction_ptr := COLD_boot
  .dhw 0x5890 0x83F8 # L   GR9,  0x3F8 (GR8, 0)  gr9  := COLD_boot
  # usr_ptr := 0x0000F000
  .dhw 0x4177 0x0F00 # LA  GR7,  0xF00 (GR7, 0)  gr7  := 0x0000F000
  .dhw 0x47F0 NXT_ibmz_instrprt # BC 0xF,  0x00A (GR8)       jump to NXT

  :f COLD_boot
  .dhw UserVarArea_init
  . merkill
  
  :f COLD_boot2
  .dhw NL EMIT
  .dhw ."
  .utf8_hwc "ReKOS Version 0.1"
  .dhw NL EMIT
  .utf8_hwc "  To boot type 'boot' without quotes and then press ENTER or PROCEED"
  .dhw NL EMIT
  .dhw ."
  .utf8_hwc "  To get further help type 'help' without quotes and then press ENTER or PROCEED"
  .dhw NL EMIT
  .dhw ."
  .utf8_hwc "  Note: If you are using the hercules-390 console you need to enter / in front of every line to interact with ReKOS"
  .dhw NL EMIT NL EMIT
  .dhw QUIT

  
  ########################
  # There seems to be no spefic documentation on 
  # how you CCW a console printer-keyboard combo
  # so I am just assuming you just Write (CCW opcode 0x01) to it
  # probably in EBDIC, which means we need an ASCII to EBDIC TRANSLATE
 
  : TOB
  :f TerminalOutputBuffer
  .dhw (USER_VAR)
  .dw  0x0000_0B00  # because in KeyKos zeForth domains page at 0x00Fxxx is W/R

  :f console_devicenr
  .dhw (CONST)
  .dw  0x0000_0009
  
  :f console_TX!_chars
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
  .dhw console_devicenr IO_StartSubChan # ( condition_code )
  .dhw DROP
  .dhw EXIT
  
  :f console_TX!
  # ( char -- )
  .dhw TerminalOutputBuffer C!
  .dhw TerminalOutputBuffer 1
  .dhw (JMP) console_TX!_common

  :f console_?RX_chars
  # ( char_addr length -- returned_length T | F )
  .dhw FALSE EXIT

  :f console_?RX
  # ( -- char T | F )
  
`;
const src2 = `
  # a bit unrelated but wanted to save this from a handwritten note.

  :f 3NIP
  # ( a b c -- c )
  .dhw >R 3DROP R> EXIT

  :f 0<=
  # ( num -- flag )
  .dhw DUP 0< SWAP 0= OR EXIT

  :f 2RDROP
  # ( -- ) R:( a b raddr -- raddr )
  .dhw R> RDROP RDROP >R EXIT

  :f 4DUP
  # ( a b c d -- a b c d a b c d )
  .dhw >R >R               # ( a b ) R:( d c )
  .dhw 2DUP                # ( a b a b ) R:( d c )
  .dhw R@ -ROT             # ( a b c a b ) R:( d c )
  .dhw R> R> SWAP >R DUP   # ( a b c a b d d ) R:( c )
  .dhw >R -ROT             # ( a b c d a b ) R:( c d )
  .dhw R> R> SWAP EXIT     # ( a b c d a b c d ) R:( )

  :f 4DROP
  # ( a b c d -- )
  .dhw 2DROP 2DROP EXIT

  :f QROT
  # ( a b c d -- b c d a )
  .dhw >R ROT R> SWAP EXIT

  :f -QROT
  # ( a b c d -- d a b c )
  .dhw -ROT  # ( a d b c )
  .dhw >R >R # ( a d ) R:( c b )
  .dhw SWAP  # ( d a ) R:( c b )
  .dhw R> R> # ( d a b c ) R:( )
  .dhw EXIT

  :f Tcl_list_first
  # ( addr len -- addr len' )
  # Takes an ASCII string and returns the first 'word' of it per Tcl parsing rules
  # todo eventually: make an utf-8 version
  .dhw SWAP TUCK           # ( addr addr len )
  .dhw Tcl_list_first_sub0 # ( addr bralvl brclvl inquote addr' )
  .dhw 2NIP                # ( addr addr' )
  .dhw OVER MINUS          # ( addr len' )
  .dhw EXIT

  :f Tcl_list_first_sub0
  # ( addr len -- bralvl brclvl inquote addr' )
  # todo: incorporate last_bracer_char idea
  .dhw >R                  # ( addr ) R:( len )
  .dhw BL        SWAP      # ( bracer addr ) R:( len )
  .dhw LIT_0     SWAP      # ( bracer bralvl addr ) R:( len )
  .dhw LIT_0     SWAP      # ( bracer bralvl brclvl addr ) R:( len )
  .dhw LIT_FALSE SWAP      # ( bracer bralvl brclvl inquote addr ) R:( len )
  .dhw (JMP) Tcl_list_first_sub0_L1
  : Tcl_list_first_sub0_L0
  .dhw DUP >R              # ( bracer bralvl brclvl inquote addr ) R:( len addr )
  .dhw C@                  # ( bracer bralvl brclvl inquote addr char ) R:( len addr )
  .dhw DUP LIT_'\\' =      # ( bracer bralvl brclvl inquote char flag ) R:( len addr )
  .dhw INVERT              # ( bracer bralvl brclvl inquote char ~flag ) R:( len addr )
  .dhw (BRZ) Tcl_list_first_sub0_L2
  .dhw DUP LIT_'"' =       # ( bracer bralvl brclvl inquote char flag ) R:( len addr )
  .dhw (BRZ) Tcl_list_first_sub0_L3
  .dhw SWAP INVERT SWAP    # ( bracer bralvl brclvl inquote' char ) R:( len addr )
  .dhw (JMP) Tcl_list_first_sub0_L2
  : Tcl_list_first_sub0_L3
  .dhw OVER                # ( bracer bralvl brclvl inquote char inquote ) R:( len addr )
  .dhw (BRZ) Tcl_list_first_sub0_L2
  .dhw DUP LIT_'[' =       # ( bracer bralvl brclvl inquote char flag ) R:( len addr )
  .dhw (BRZ) Tcl_list_first_sub0_L4
  .dhw >R >R >R 1+ >R      # ( bracer ) R:( len addr char inquote brclvl bralvl+1 )
  .dhw DROP LIT_'[' R>     # ( bracer bralvl+1 )
  .dhw R> R> R>            # ( bracer bralvl+1 brclvl inquote char ) R:( len addr )
  .dhw (JMP) Tcl_list_first_sub0_L2
  : Tcl_list_first_sub0_L4
  .dhw DUP LIT_']' =       # ( bracer bralvl brclvl inquote char flag ) R:( len addr )
  .dhw (BRZ) Tcl_list_first_sub0_L5
  .dhw >R >R >R >R         # ( bracer ) R:( len addr char inquote brclvl bralvl )
  .dhw DUP LIT_'[' =       # ( bracer flag )
  .dhw (BRZ) Tcl_list_first_sub0_L8
  .dhw DROP BL R>          # ( bracer bralvl )
  .dhw 1- R> R> R>         # ( bracer bralvl-1 brclvl inquote char ) R:( len addr )
  .dhw (JMP) Tcl_list_first_sub0_L2
  : Tcl_list_first_sub0_L5
  .dhw DUP LIT_'{' =       # ( bracer bralvl brclvl inquote char flag ) R:( len addr )
  .dhw (BRZ) Tcl_list_first_sub0_L6
  .dhw >R >R 1+
  .dhw >R >R DROP LIT_'{' R> R>
  .dhw R> R>
  .dhw (JMP) Tcl_list_first_sub0_L2
  : Tcl_list_first_sub0_L6
  .dhw DUP LIT_'}' =       # ( bracer bralvl brclvl inquote char flag ) R:( len addr )
  .dhw (BRZ) Tcl_list_first_sub0_L7
  .dhw >R                  # ( bracer bralvl brclvl inquote ) R:( len addr char )
  .dhw >R                  # ( bracer bralvl brclvl ) R:( len addr char inquote )
  .dhw 1-                  # ( bracer bralvl brclvl-1 ) R:( len addr char inquote )
  .dhw >R >R               # ( bracer ) R:( len addr char inquote brclvl-1 bralvl )
  .dhw DUP LIT_'{' =       # ( bracer flag ) R:( len addr char inquote brclvl-1 bralvl )
  .dhw INVERT (BRZ) Tcl_list_first_sub0_L8
  .dhw R> R>
  .dhw (JMP) Tcl_list_first_sub0_L2
  : Tcl_list_first_sub0_L7
  .dhw DUP LIT_'\\n' =     # ( bracer bralvl brclvl inquote char flag ) R:( len addr )
  .dhw OVER BL = OR        # ( bracer bralvl brclvl inquote char flag ) R:( len addr )
  .dhw SWAP >R SWAP DUP >R # ( bracer bralvl brclvl flag inquote ) R:( len addr char inquote )
  .dhw INVERT AND          # ( bracer bralvl brclvl flag' ) R:( len addr char inquote )
  .dhw >R 2DUP 0= SWAP 0=  # ( bracer bralvl brclvl brclvl=0 bralvl=0 ) R:( len addr char inquote flag' )
  .dhw AND R> AND          # ( bracer bralvl brclvl flag" ) R:( len addr char inquote )
  .dhw R> SWAP R> SWAP     # ( bracer bralvl brclvl inquote char flag" ) R:( len addr )
  .dhw (BRZ) Tcl_list_first_sub0_L2
  .dhw DROP R> RDROP       # ( bracer bralvl brclvl inquote addr' )
  .dhw >R >R >R >R DROP R> R> R> R> EXIT
  : Tcl_list_first_sub0_L2
  .dhw DROP                # ( bracer bralvl brclvl inquote ) R:( len addr )
  .dhw R> 1+               # ( bracer bralvl brclvl inquote addr+1 ) R:( len )
  : Tcl_list_first_sub0_L1
  .dhw (NEXT) Tcl_list_first_sub0_L0
  .dhw EXIT                # ( bralvl brclvl inquote addr' )
  : Tcl_list_first_sub0_L8
                           # ( bracer ) R:( len addr char inquote brclvl bralvl )
  .dhw DROP                # ( ) R:( len addr char inquote brclvl bralvl )
  .dhw R> R> R> R> DROP    # ( bralvl brclvl inquote ) R:( len addr )
  .dhw R> R> DROP EXIT
  

  :f Tcl_list_is_complete
  # ( addr len -- flag )
  # Takes a string and tells if its 'complete' per Tcl parsing rules
  # That is, if all the quotemarks, curly braces and brackets are balanced
  .dhw 2DUP                # ( addr len addr len )
  .dhw Tcl_list_first_sub0 # ( addr len bralvl brclvl inquote addr' )
  .dhw >R INVERT SWAP 0= & # ( addr len bralvl flag ) R:( addr' )
  .dhw SWAP 0= & R> SWAP   # ( addr len addr' flag ) R:( )
  .dhw >R SWAP - = R> &    # ( flag )
  .dhw EXIT

  :f Tcl_list_length
  # ( addr len -- nrOfItems )
  .dhw 2DUP Tcl_list_is_complete INVERT
  .dhw (BRZ) Tcl_list_length_L0
  .dhw 2DROP LIT_0 EXIT
  : Tcl_list_length_L0
  .dhw LIT_1 -ROT          # ( count addr len )
  : Tcl_list_length_L1
  .dhw 2DUP                # ( count addr len addr len )
  .dhw Tcl_list_first NIP  # ( count addr len len' )
  .dhw SWAP OVER -         # ( count addr len' remaining_len )
  .dhw DUP 0<=             # ( count addr len' remaining_len flag )
  .dhw INVERT (BRZ) 3DROP  # ( count addr len' remaining_len )
  .dhw >R + R> ROT 1+ -ROT # ( count+1 addr' remaining_len )
  .dhw (JMP) Tcl_list_length_L1

  :f Tcl_list_range
  # ( addr len start_idx end_idx -- addr' len' )
  .dhw >R >R               # ( addr len ) R:( end_idx start_idx )
  .dhw LIT_0 -ROT          # ( idx addr len ) R:( end_idx start_idx )
  : Tcl_list_range_L0
  .dhw 2DUP Tcl_list_first # ( idx addr len addr len' ) R:( end_idx start_idx )
  .dhw NIP  SWAP OVER -    # ( idx addr len' remaining_len ) R:( end_idx start_idx )
  .dhw R@   SWAP >R -ROT   # ( idx start_idx addr len' ) R:( end_idx start_idx remaining_len )
  .dhw >R >R OVER =        # ( idx idx=start? ) R:( end_idx start_idx remaining_len len' addr )
  .dhw INVERT (BRZ) Tcl_list_range_L1 # ( idx ) R:( end_idx start_idx remaining_len len' addr )
  .dhw 1+ R> R> + R>       # ( idx+1 addr' remaining_len ) R:( end_idx start_idx )
  .dhw DUP 0<= INVERT (BRZ) Tcl_list_range_L0
  .dhw RDROP RDROP ROT DROP EXIT # ( addr' 0 )
  : Tcl_list_range_L1
                           # ( idx ) R:( end_idx start_idx remaining_len len' addr )
  .dhw R> RDROP R> RDROP   # ( idx addr remaining_len ) R:( end_idx )
  .dhw OVER R> SWAP >R >R  # ( idx addr remaining_len ) R:( start_addr end_idx )
  : Tcl_list_range_L2
  .dhw 2DUP Tcl_list_first # ( idx addr len addr len' ) R:( start_addr end_idx )
  .dhw NIP  SWAP OVER -    # ( idx addr len' remaining_len ) R:( start_addr end_idx )
  .dhw R@   SWAP >R -ROT   # ( idx end_idx addr len' ) R:( start_addr end_idx remaining_len )
  .dhw >R >R OVER =        # ( idx idx=end? ) R:( start_addr end_idx remaining_len len' addr )
  .dhw INVERT (BRZ) Tcl_list_range_L4 # ( idx ) R:( start_addr end_idx remaining_len len' addr )
  .dhw 1+ R> R> + R>       # ( idx+1 addr' remaining_len ) R:( start_addr end_idx )
  .dhw DUP 0<= INVERT (BRZ) Tcl_list_range_L2
  : Tcl_list_range_L3
  .dhw DROP                # ( idx   addr' ) R:( start_addr end_idx )
  .dhw RDROP               # ( idx   addr' ) R:( start_addr )
  .dhw NIP R> TUCK -       # ( start_addr len ) R:( )
  .dhw EXIT
  : Tcl_list_range_L4      # ( idx ) R:( start_addr end_idx remaining_len len' addr )
  .dhw R> 2RDROP           # ( idx addr ) R:( start_addr end_idx )
  .dhw (JMP) Tcl_list_range_L3

  :f Tcl_list_index
  # ( addr len idx -- addr' len' )
  .dhw DUP (JMP) Tcl_list_range

  :f Tcl_simple_foreach
  # ( addr len xt -- )
  # xt ( idx addr' len' -- )
  .dhw -ROT                # ( xt addr len )
  .dhw LIT_0 -ROT          # ( xt idx addr len ) R:( )
  : Tcl_simple_foreach_L0
  .dhw DUP >R              # ( xt idx addr len ) R:( len )
  .dhw Tcl_list_first      # ( xt idx addr len' ) R:( len )
  .dhw 4DUP                # ( xt idx addr len' xt idx addr len' ) R:( len )
  .dhw QROT                # ( xt idx addr len' idx addr len' xt ) R:( len )
  .dhw EXECUTE             # ( xt idx addr len' ) R:( len )
  .dhw DUP >R + R> R>      # ( xt idx addr' len' len ) R:( )
  .dhw SWAP - DUP 0<=      # ( xt idx addr' len" flag )
  .dhw INVERT (BRZ)        # ( xt idx addr' len" )
  .dhw Tcl_simple_foreach_L1
  .dhw >R >R 1+ R> R>      # ( xt idx+1 addr' len" )
  .dhw (JMP) Tcl_simple_foreach_L0
  : Tcl_simple_foreach_L1
  .dhw (JMP) 4DROP


  :f utf8_is_full_codepoint
  # ( addr len -- flag )
  .dhw 2DUP 1= SWAP BYTE@ 0x80& CLEANBOOL INVERT &
  .dhw (BRZ) utf8_is_full_codepoint_L0
  # the ASCII subset
  .dhw 2DROP (JMP) TRUE
  : utf8_is_full_codepoint_L0
  .dhw OVER BYTE@ 0xC0& 0x80 =
  .dhw (BRZ) utf8_is_full_codepoint_L1
  # starting in the middle of a codepoint
  .dhw 2DROP (JMP) FALSE
  : utf8_is_full_codepoint_L1
  .dhw OVER BYTE@ CountLeadingOnesInByte # ( addr len count )
  .dhw 2DUP < (BRZ) utf8_is_full_codepoint_L2
  .dhw 3DROP (JMP) FALSE
  : utf8_is_full_codepoint_L2
  .dhw NIP >R 1+ (JMP) utf8_is_full_codepoint_L5
  : utf8_is_full_codepoint_L3
  .dhw DUP BYTE@ 0xC0& 0x80 =
  .dhw INVERT (BRZ) utf8_is_full_codepoint_L4
  .dhw DROP RDROP (JMP) FALSE
  : utf8_is_full_codepoint_L4
  .dhw 1+
  : utf8_is_full_codepoint_L5
  .dhw (NEXT) utf8_is_full_codepoint_L3
  .dhw DROP (JMP) TRUE

  :f NIP_0
  .dhw NIP 0 EXIT

  :f >
  .dhw SWAP < EXIT

  :f >=
  .dhw 2DUP > >R = R> OR EXIT

  :f decode_diffManchesterEncoding_discernAbit
  # ( clk_cnt accumulator -- bit )
  .dhw 1 INVERT & 1>>  # clean out the last bit
  .dhw SWAP 2* >= EXIT 

  :f decode_diffManchesterEncoding
  # ( src_addr src_len dest_addr max_len -- len_r len_q )
  # source is a bytestring where each byte is 0bLLLLLLLI sample
  # where L is unsigned time Length and I is bIt value of the sample
  # time unit not specified
  # destination is a bytestring
  # len_q (quotent) is the length of the bytestring
  # len_r (reminder) is the remaining length in bits of decoded data
  # len_r will be higher than 7 if decoded data is longer than max_len
  .dhw 8*
  .dhw -QROT       # ( max_len*8 src_addr src_len dest_addr ) R:( )
  .dhw SWAP >R     # ( max_len*8 src_addr dest_addr ) R:( src_len )
  .dhw 0 DUP DUP   # ( max_len*8 src_addr dest_addr byte clk_cnt accum ) R:( src_len )
  .dhw (JMP) decode_diffManchesterEncoding_L4
  : decode_diffManchesterEncoding_L0
                   # ( max_len*8 src_addr dest_addr byte clk_cnt accum ) R:( src_len )
  .dhw QROT >R     # ( max_len*8 src_addr byte clk_cnt accum ) R:( src_len dest_addr )
  .dhw QROT DUP >R # ( max_len*8 byte clk_cnt accum src_addr ) R:( src_len dest_addr src_addr )
  .dhw C@          # ( max_len*8 byte clk_cnt accum sample   ) R:( src_len dest_addr src_addr )
  .dhw 2DUP        # ( max_len*8 byte clk_cnt accum sample accum sample ) R:( src_len dest_addr src_addr )
  .dhw 1& SWAP 1&  # ( max_len*8 byte clk_cnt accum sample sbit abit ) R:( src_len dest_addr src_addr )
  .dhw XOR         # ( max_len*8 byte clk_cnt accum sample change? ) R:( src_len dest_addr src_addr )
  .dhw SWAP >R     # ( max_len*8 byte clk_cnt accum change? ) R:( src_len dest_addr src_addr sample )
  .dhw DUP  >R     # ( max_len*8 byte clk_cnt accum change? ) R:( src_len dest_addr src_addr sample change? )
  .dhw (BRZ) decode_diffManchesterEncoding_L1
  .dhw 2DUP
  .dhw decode_diffManchesterEncoding_discernAbit
  .dhw 1& >R ROT   # ( max_len*8 clk_cnt accum byte )  R:( src_len dest_addr src_addr sample change? bit )
  .dhw 1<< R> OR   # ( max_len*8 clk_cnt accum byte' ) R:( src_len dest_addr src_addr sample change? )
  .dhw QROT 1-     #
  .dhw DUP 0<=
  .dhw (BRNZ) decode_diffManchesterEncoding_L3
  .dhw DUP >R      # ( clk_cnt accum byte' max_len*8 ) R:( src_len dest_addr src_addr sample change? max_len*8 )
  .dhw 8_%         # ( clk_cnt accum byte' reminder )  R:( src_len dest_addr src_addr sample change? max_len*8 )
  .dhw R> SWAP >R  #
  .dhw -QROT       # ( max_len*8 clk_cnt accum byte' ) R:( src_len dest_addr src_addr sample change? reminder )
  .dhw R>          # ( max_len*8 clk_cnt accum byte' reminder ) R:( src_len dest_addr src_addr sample change? )
  .dhw (BRNZ) decode_diffManchesterEncoding_L2
  .dhw R> R> R> R> # ( max_len*8 clk_cnt accum byte' change? sample src_addr dest_addr ) R:( src_len )
  .dhw -QROT       # ( max_len*8 clk_cnt accum byte' dest_addr change? sample src_addr ) R:( src_len )
  .dhw >R >R >R    #
  .dhw DUP 1+ >R   # ( max_len*8 clk_cnt accum byte' dest_addr ) R:( src_len src_addr sample change? dest_addr+1 )
  .dhw C! 0        # ( max_len*8 clk_cnt accum zero ) R:( src_len src_addr sample change? dest_addr+1 )
  .dhw R> R> R> R> # ( max_len*8 clk_cnt accum zero dest_addr+1 change? sample src_addr ) R:( src_len )
  .dhw QROT        # ( max_len*8 clk_cnt accum zero change? sample src_addr dest_addr+1 ) R:( src_len )
  .dhw >R >R >R >R # ( max_len*8 clk_cnt accum zero ) R:( src_len dest_addr+1 src_addr sample change? )
  : decode_diffManchesterEncoding_L2
  .dhw -ROT        # ( max_len*8 byte clk_cnt accum ) R:( src_len dest_addr src_addr sample change? )
  .dhw DUP 1& >R
  .dhw 2DUP
  .dhw decode_diffManchesterEncoding_discernAbit
  .dhw INVERT
  .dhw SKZ 1>>     # if databit was one then half the accumulator
  .dhw 1>>         # take into account that lsb of accum is last bit
  .dhw + 2/        # average last clk_cnt and the value of the accumulator together
  .dhw R>          # ( max_len*8 byte clk_cnt' last_bit ) R:( src_len dest_addr src_addr sample change? )
  .dhw INVERT 1&   # ( max_len*8 byte clk_cnt' ~last_bit ) R:( src_len dest_addr src_addr sample change? )
  : decode_diffManchesterEncoding_L1
  .dhw R> R> SWAP  # ( max_len*8 byte clk_cnt accum sample change? ) R:( src_len dest_addr src_addr )
  .dhw SKZ NIP_0
  .dhw 0xFE& +     # ( max_len*8 byte clk_cnt accum' ) R:( src_len dest_addr src_addr )
  .dhw R> 1+       # ( max_len*8 byte clk_cnt accum src_addr+1 ) R:( src_len dest_addr )
  .dhw -QROT       # ( max_len*8 src_addr+1 byte clk_cnt accum ) R:( src_len dest_addr )
  .dhw R> -QROT    # ( max_len*8 src_addr+1 dest_addr byte clk_cnt accum ) R:( src_len )
  : decode_diffManchesterEncoding_L4
  .dhw (NEXT) decode_diffManchesterEncoding_L0
  .dhw 2DROP       # ( max_len*8 src_addr+1 dest_addr+n byte ) R:( )
  .dhw ROT DROP    # ( max_len*8 dest_addr+n byte )
  .dhw ROT 8/%     # ( dest_addr+n byte r q ) R:( )
  .dhw >R DUP      # ( dest_addr+n byte r r ) R:( q )
  .dhw (BRNZ) decode_diffManchesterEncoding_L5
  .dhw >R 2DROP    # ( ) R:( q r )
  .dhw R> R> EXIT  # ( r q ) R:( )
  : decode_diffManchesterEncoding_L5
  .dhw DUP >R 
  .dhw 8 SWAP - >>
  .dhw SWAP C!     # ( ) R:( q r )
  .dhw R> R> EXIT  #
  : decode_diffManchesterEncoding_L3
  
`;
const src3 = `
  # ibm1130 5D acting as a bit richer terminal
  # devices:
  # 0b00001  Console keyboard and console printer
  # 0b00011  1134 Paper Tape Reader and Paper Tape Punch, will IPL'ed at startup
  # 0b00101  1627 Plotter, modified to take 0,01 millimetre steps (plot area 75cm y-axis 4m x-axis), pen is 0,4mm wide, black ink
  # 0b01010  Synchronous Communications Adapter, in BSC mode 4800 baud connected to the IBM z/390
  # 0b11001	 2250 Display Unit, with both Alphanumeric keyboard and Programmed Function Lighted Keypad
  # 
  # 0b11010  Monochrome (not grayscale) Display unit
  #          512x512 pixels  (can fake Macintosh SE 512x384 )
  #            split into 4x4 pixel tile per cell (no tileset, just directly addressable)
  #            first nybble is first line in tile and so on
  #          Initiate Write IOCC tells where in IBM 1130 the framebuffer starts
  #          Initiate Read  IOCC:
  #            WCA+0:  Word Count
  #            WCA+1:  0bTTTT_LMRX_XXXX_XXXX  Mouse Left Middle and Right buttons and X coord
  #            WCA+2:  0bTTTT_TTTY_YYYY_YYYY  Mouse Y coord
  #            WCA+3:  Full ISO Keyboard 1st Cell
  #            WCA+4:                    2nd Cell
  #            WCA+5:                    3rd Cell
  #            WCA+6:                    4th Cell
  #            WCA+7:                    5th Cell
  #            WCA+8:                    6th Cell
  #            WCA+9:                    7th Cell
  #            WCA+10:                   8th Cell

  :f ibm1130_5D_IPL_papertape
  .dhw (VAR)
  .def 《NO_SYM_LOOKUP》 1
  .dhw <length>
  # use lem1802 font for "<= IBM1130 IPL PROGRAM 0V1 "
  .db 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF  # Leader
  .db 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF  # Leader
                          # ibm1130
                          #   addr   data   instruction
  .db 0x06 0x04 0x00 0x00 # 0x0000 0x6400   LDX_l IA
  .db 0x00 0x00 0x01 0x03 # 0x0001 0x0013   ibm1130_papertape_loader   : XR1
  .db 0x0C 0x0A 0x0F 0x0E # 0x0002 0xCAFE   : XR2 
  .db 0x00 0x00 0x04 0x05 # 0x0003 0x0045   : XR3  cell addr
  .db 0x0_ 0x0_ 0x0_ 0x0_ # 0x0004 0x____   byte count
  .db 0x0B 0x0A 0x0B 0x0E # 0x0005 0xBABE   tmp
  .db 0x0F 0x0E 0x0E 0x0D # 0x0006 0xFEED   : bytebuff
  .db 0x00 0x00 0x00 0x01 # 0x0007 0x0001   constant 0x0001
  .db 0x00 0x00 0x04 0x02 # 0x0008 0x0042
  .db 0x00 0x00 0x04 0x02 # 0x0009 0x0042
  .db 0x00 0x00 0x04 0x02 # 0x000A 0x0042
  .db 0x00 0x00 0x04 0x02 # 0x000B 0x0042
  .db 0x00 0x00 0x01 0x08 # 0x000C 0x0018   ibm1130_papertape_loader_intrpLvl4_hndlr
  .db 0x00 0x00 0x04 0x02 # 0x000D 0x0042
  .db 0x00 0x00 0x00 0x00 # 0x000E 0x0000   IOCC_1stCell zero
  .db 0x00 0x03 0x00 0x00 # 0x000F 0x0300   IOCC_2ndCell Sense Interrupt
  .db 0x00 0x00 0x00 0x06 # 0x0010 0x0006   IOCC_1stCell bytebuff
  .db 0x01 0x0A 0x00 0x00 # 0x0011 0x1A00   IOCC_2ndCell papertape Read
  .db 0x01 0x0C 0x00 0x00 # 0x0012 0x1C00   IOCC_2ndCell papertape Control
  .db 0x00 0x08 0x0F 0x0C # 0x0013 0x08FC   XIO_s IA-4  do pt Control  : ibm1130_papertape_loader
  .db 0x03 0x00 0x00 0x00 # 0x0014 0x3000   WAIT
  .db 0x06 0x04 0x00 0x00 # 0x0015 0x6400   LDX_l IA
  .db 0x00 0x00 0x01 0x03 # 0x0016 0x0013   ibm1130_papertape_loader
  .db 0x06 0x04 0x00 0x00 # 0x0017 0x6400   LDX_l IA  : ISR_exit
  .db 0x00 0x00 0x00 0x00 # 0x0018 0x0000   InterruptServiceRoutine saved IA
  .db 0x0D 0x04 0x00 0x00 # 0x0019 0xD400   STO_l    : ibm1130_papertape_loader_intrpLvl4_hndlr
  .db 0x00 0x00 0x00 0x05 # 0x001A 0x0005   tmp
  .db 0x00 0x0C 0x00 0x00 # 0x001B 0x0C00   XIO_l  do Sense Interrupts
  .db 0x00 0x00 0x00 0x0E # 0x001C 0x000E   address of Sense Interrupts IOCC
  .db 0x01 0x00 0x00 0x01 # 0x001D 0x1001   SLA 1
  .db 0x04 0x0C 0x00 0x02 # 0x001E 0x4C02   Branch to 0x____ if Carry is off
  .db 0x00 0x00 0x03 0x08 # 0x001F 0x0038   branch target
  .db 0x00 0x0C 0x00 0x00 # 0x0020 0x0C00   XIO_l  do papertape read
  .db 0x00 0x00 0x01 0x00 # 0x0021 0x0010   address of IOCC
  .db 0x0C 0x04 0x00 0x00 # 0x0022 0xC400   LD     load accumulator from bytecount
  .db 0x00 0x00 0x00 0x04 # 0x0023 0x0004   address of byte count
  .db 0x04 0x0C 0x00 0x04 # 0x0024 0x4C04   BRanch if accumulator is Even
  .db 0x00 0x00 0x03 0x0C # 0x0025 0x003C   branch target
  .db 0x0C 0x04 0x00 0x00 # 0x0026 0xC400   LD     load accumulator from bytebuff
  .db 0x00 0x00 0x00 0x06 # 0x0027 0x0006   address of bytebuff
  .db 0x01 0x08 0x00 0x08 # 0x0028 0x1808   SRA 8
  .db 0x0E 0x0B 0x00 0x00 # 0x0029 0xEB00   OR_s  XR3+0x00
  .db 0x0D 0x03 0x00 0x00 # 0x002A 0xD300   STO_s XR3+0x00  store cell at cell address
  .db 0x0C 0x04 0x00 0x00 # 0x002B 0xC400   LD     load accumulator with constant 1
  .db 0x00 0x00 0x00 0x07 # 0x002C 0x0007   address of constant 1
  .db 0x08 0x03 0x00 0x00 # 0x002D 0x8300   A XR3+0x00  incr accumulator
  .db 0x0D 0x04 0x00 0x00 # 0x002E 0xD400   STO_l  store in XR3
  .db 0x00 0x00 0x00 0x03 # 0x002F 0x0003   XR3
  .db 0x0C 0x04 0x00 0x00 # 0x0030 0xC400   LD     load accumulator with bytecount
  .db 0x00 0x00 0x00 0x04 # 0x0031 0x0004   address of bytecount
  .db 0x09 0x04 0x00 0x00 # 0x0032 0x9400   S_l    decr accumulator
  .db 0x00 0x00 0x00 0x07 # 0x0033 0x0007   address of constant 1
  .db 0x0D 0x04 0x00 0x00 # 0x0034 0xD400   STO_l  store accumulator into bytecount
  .db 0x00 0x00 0x00 0x04 # 0x0035 0x0004   address of bytecount
  .db 0x04 0x0C 0x02 0x00 # 0x0036 0x4C20   BRAZ
  .db 0x00 0x00 0x05 0x00 # 0x0037 0x0050   __start__
  .db 0x0C 0x04 0x00 0x00 # 0x0038 0xC400   LD     load saved accumulator
  .db 0x00 0x00 0x00 0x05 # 0x0039 0x0005   address of tmp
  .db 0x06 0x04 0x00 0x00 # 0x003A 0x6400   LDX_l  jump to ISR exit
  .db 0x00 0x00 0x01 0x07 # 0x003B 0x0017
  .db 0x0C 0x04 0x00 0x00 # 0x003C 0xC400   LD     load accumulator from bytebuff
  .db 0x00 0x00 0x00 0x06 # 0x003D 0x0006   address of bytebuff
  .db 0x0D 0x03 0x00 0x00 # 0x003E 0xD300   STO_s XR3+00  store byte att cell address
  .db 0x06 0x04 0x00 0x00 # 0x003F 0x6400   LDX_l  jump to
  .db 0x00 0x00 0x03 0x00 # 0x0040 0x0030
  .db 0x06 0x04 0x00 0x00 # 0x0041 0x6400   LDX_l  jump to whatever was interrupted
  .db 0x00 0x00 0x00 0x00 # 0x0042 0x0000     as we ignore these interrupts
  .db 0x06 0x04 0x00 0x00 # 0x0043 0x6400   LDX_l
  .db 0x00 0x00 0x04 0x0E # 0x0044 0x0041
  .dhw 0xFFFF # end of first part of IPL program on tape
              #                 0x0001 XR1 is Forth Instruction Pointer
              #                 0x0002 XR2 is datastack pointer
              #                 0x0003 XR3 is returnstack pointer
  .dhw 0x0D00 # 0x0045 0x0D00   : (SP0)
  .dhw 0x0E00 # 0x0046 0x0E00   : (RP0)
  .dhw 0x____ # 0x0047 0x____   : COLD_vector
  .dhw 0x0087 # 0x0048 0x0087   : where opcode jmptbl is
  .dhw 0x____ # 0x0049 0x____
  .dhw 0x____ # 0x004A 0x____
  .dhw 0x____ # 0x004B 0x____
  .dhw 0x____ # 0x004C 0x____   
  .dhw 0x0002 # 0x004D 0x0002   constant 2
  .dhw 0x0001 # 0x004E 0x0001   constant 1
  .dhw 0xFFF0 # 0x004F 0xFFF0   mask 
  .dhw 0xC400 # 0x0050 0xC400   LD  : __start__
  .dhw 0x0045 # 0x0051 0x0045   address of (SP0)
  .dhw 0xD400 # 0x0052 0xD400   STO_l
  .dhw 0x0002 # 0x0053 0x0002   address of XR2
  .dhw 0xC400 # 0x0054 0xC400   LD
  .dhw 0x0046 # 0x0055 0x0046   address of (RP0)
  .dhw 0xD400 # 0x0056 0xD400   STO_l
  .dhw 0x0003 # 0x0057 0x0003   address of XR3
  .dhw 0xC400 # 0x0058 0xC400   LD
  .dhw 0x0047 # 0x0059 0x0047   address of COLD_vector
  .dhw 0xD400 # 0x005A 0xD400   STO_l
  .dhw 0x0001 # 0x005B 0x0001   address of XR1
  .dhw 0x0000 # 0x005C 0x0000   NOP
  .dhw 0x0000 # 0x005D 0x0000   NOP
  .dhw 0x0000 # 0x005E 0x0000   NOP
  .dhw 0x0000 # 0x005F 0x0000   NOP
  .dhw 0xC100 # 0x0060 0xC100   LD XR1+0x00  : NXT_ibm1130
  .dhw 0xE400 # 0x0061 0xE400   AND_l
  .dhw 0x00F4 # 0x0062 0x00F4   address 0x00F4
  .dhw 0x4C20 # 0x0063 0x4C20   BRAZ
  .dhw 0x0075 # 0x0064 0x0075   address 0x0075   
  .dhw 0xC400 # 0x0065 0xC400   LD      do a Forth call
  .dhw 0x0001 # 0x0066 0x0001   address of XR1
  .dhw 0x8400 # 0x0067 0x8400   ADD_l
  .dhw 0x004E # 0x0068 0x004E   address of constant 1
  .dhw 0xD300 # 0x0069 0xD300   STO_s XR3+0x00
  .dhw 0xC400 # 0x006A 0xC400   LD
  .dhw 0x0003 # 0x006B 0x0003   address of XR3
  .dhw 0x8400 # 0x006C 0x8400   ADD_l
  .dhw 0x004E # 0x006D 0x004E   address of constant 1
  .dhw 0xD400 # 0x006E 0xD400   STO_l
  .dhw 0x0003 # 0x006F 0x0003   address of XR3
  .dhw 0xC100 # 0x0070 0xC100   LD XR1+0x00
  .dhw 0xD400 # 0x0071 0xD400   STO_l
  .dhw 0x0001 # 0x0072 0x0001   address of XR1
  .dhw 0x6400 # 0x0073 0x6400   LDX_l
  .dhw 0x0060 # 0x0074 0x0060   NXT_ibm1130
  .dhw 0xC100 # 0x0075 0xC100   LD XR1+0x00
  .dhw 0x8400 # 0x0076 0x8400   ADD_l
  .dhw 0x0048 # 0x0077 0x0048   optable
  .dhw 0xD400 # 0x0078 0xD400   STO_l
  .dhw 0x007B # 0x0079 0x007B
  .dhw 0xC400 # 0x007A 0xC400   LD
  .dhw 0xDEAD # 0x007B 0xDEAD
  .dhw 0xD400 # 0x007C 0xD400   STO_l
  .dhw 0x0085 # 0x007D 0x0085
  .dhw 0xC400 # 0x007E 0xC400   LD
  .dhw 0x0001 # 0x007F 0x0001   address of XR1
  .dhw 0x8400 # 0x0080 0x8400   ADD_l
  .dhw 0x004E # 0x0081 0x004E   address of constant 1
  .dhw 0xD400 # 0x0082 0xD400   STO_l
  .dhw 0x0001 # 0x0083 0x0001   address of XR1
  .dhw 0x6400 # 0x0084 0x6400   LDX_l
  .dhw 0x0060 # 0x0085 0x0060
  .dhw 0x____ # 0x0086 0x____
  .dhw 0x0060 # 0x0087 0x0060   NOP
  .dhw 0x0098 # 0x0088 0x0098   +
  .dhw 0x00AB # 0x0089 0x00AB   &
  .dhw 0x00B0 # 0x008A 0x00B0   XOR
  .dhw 0x00B5 # 0x008B 0x00B5   1<<>
  .dhw 0x00A4 # 0x008C 0x00A4   1+
  .dhw 0x00BE # 0x008D 0x00BE   @
  .dhw 0x00C6 # 0x008E 0x00C6   !
  .dhw 0x00D3 # 0x008F 0x00D3   DUP
  .dhw 0x00DE # 0x0090 0x00DE   DROP
  .dhw 0x00E1 # 0x0091 0x00E1   SWAP
  .dhw 0x00EB # 0x0092 0x00EB   SKZ
  .dhw 0x00F9 # 0x0093 0x00F9   >R
  .dhw 0x0104 # 0x0094 0x0104   R>
  .dhw 0x____ # 0x0095 0x____   EXT
  .dhw 0x010E # 0x0096 0x010E   EXIT
  .dhw 0x0140 # 0x0097 0x0140   (ibm1130)
  .dhw 0xC2FE # 0x0098 0xC2FE   LD_s XR2-2   : +_ibm1130
  .dhw 0x82FF # 0x0099 0x82FF   ADD_s XR2-1
  .dhw 0xD2FE # 0x009A 0xD2FE   STO_s XR2-2  : COMMON_TAIL1_ibm1130
  .dhw 0xC400 # 0x009B 0xC400   LD_l         : COMMON_TAIL3_ibm1130
  .dhw 0x0002 # 0x009C 0x0002   address of XR2
  .dhw 0x9400 # 0x009D 0x9400   SUBTRACT__l
  .dhw 0x004E # 0x009E 0x004E   address of constant 1
  .dhw 0xD400 # 0x009F 0xD400   STO_l
  .dhw 0x0002 # 0x00A0 0x0002   address of XR2
  .dhw 0x6400 # 0x00A1 0x6400   LDX_l IA
  .dhw 0x0060 # 0x00A2 0x0060   NXT_ibm1130
  .dhw 0x0140 # 0x00A3 0x0140   (ibm1130)
  .dhw 0xC2FF # 0x00A4 0xC2FF   LD_s XR2-1   : 1+_ibm1130
  .dhw 0x8400 # 0x00A5 0x8400   ADD_l
  .dhw 0x004E # 0x00A6 0x004E   address of constant 1
  .dhw 0xD2FF # 0x00A7 0xD2FF   STO_s XR2-1  : COMMON_TAIL2_ibm1130
  .dhw 0x6400 # 0x00A8 0x6400   LDX_l
  .dhw 0x0060 # 0x00A9 0x0060   NXT_ibm1130
  .dhw 0x0140 # 0x00AA 0x0140   (ibm1130)
  .dhw 0xC2FE # 0x00AB 0xC2FE   LD_s XR2-2   : &_ibm1130
  .dhw 0xE2FF # 0x00AC 0xE2FF   AND_s XR2-1
  .dhw 0x6400 # 0x00AD 0x6400   LDX_l IA
  .dhw 0x009A # 0x00AE 0x009A   COMMON_TAIL1_ibm1130
  .dhw 0x0140 # 0x00AF 0x0140   (ibm1130)
  .dhw 0xC2FE # 0x00B0 0xC2FE   LD_s XR2-2   : XOR_ibm1130
  .dhw 0xF2FF # 0x00B1 0xF2FF   EOR_s XR2-1
  .dhw 0x6400 # 0x00B2 0x6400   LDX_l IA
  .dhw 0x009A # 0x00B3 0x009A   COMMON_TAIL1_ibm1130
  .dhw 0x0140 # 0x00B4 0x0140   (ibm1130)
  .dhw 0xC2FF # 0x00B5 0xC2FF   LD_s XR2-1   : 1<<>_ibm1130
  .dhw 0x1001 # 0x00B6 0x1001   SLA 1
  .dhw 0x4C02 # 0x00B7 0x4C02   BRCZ
  .dhw 0x00A7 # 0x00B8 0x00A7   COMMON_TAIL2_ibm1130
  .dhw 0xEC00 # 0x00B9 0xEC00   OR_l
  .dhw 0x004E # 0x00BA 0x004E   address of constant 1
  .dhw 0x6400 # 0x00BB 0x6400   LDX_l IA
  .dhw 0x00A7 # 0x00BC 0x00A7   COMMON_TAIL2_ibm1130
  .dhw 0x0140 # 0x00BD 0x0140   (ibm1130)
  .dhw 0xC2FF # 0x00BE 0xC2FF   LD_s XR2-1   : @_ibm1130
  .dhw 0xD400 # 0x00BF 0xD400   STO_l
  .dhw 0x00C2 # 0x00C0 0x00C2
  .dhw 0xC400 # 0x00C1 0xC400   LD_l
  .dhw 0xDEAD # 0x00C2 0xDEAD
  .dhw 0x6400 # 0x00C3 0x6400   LDX_l IA
  .dhw 0x00A7 # 0x00C4 0x00A7   COMMON_TAIL2_ibm1130
  .dhw 0x0140 # 0x00C5 0x0140   (ibm1130)
  .dhw 0xC2FF # 0x00C6 0xC2FF   LD_s XR2-1   : !_ibm1130
  .dhw 0xD400 # 0x00C7 0xD400   STO_l
  .dhw 0x00CB # 0x00C8 0x00CB
  .dhw 0xC2FE # 0x00C9 0xC2FE   LD_s XR2-2
  .dhw 0xD400 # 0x00CA 0xD400   STO_l
  .dhw 0xDEAD # 0x00CB 0xDEAD
  .dhw 0xC400 # 0x00CC 0xC400   LD_l
  .dhw 0x0002 # 0x00CD 0x0002   address of XR2
  .dhw 0x9400 # 0x00CE 0x9400   SUBTRACT__l
  .dhw 0x004D # 0x00CF 0x004D   address of constant 2
  .dhw 0x6400 # 0x00D0 0x6400   LDX_l IA
  .dhw 0x0060 # 0x00D1 0x0060   NXT_ibm1130
  .dhw 0x0140 # 0x00D2 0x0140   (ibm1130)
  .dhw 0xC2FF # 0x00D3 0xC2FF   LD_s XR2-1   : DUP_ibm1130
  .dhw 0xD200 # 0x00D4 0xD200   STO_s XR2    : COMMON_TAIL4_ibm1130
  .dhw 0xC400 # 0x00D5 0xC400   LD_l
  .dhw 0x0002 # 0x00D6 0x0002   address of XR2
  .dhw 0x8400 # 0x00D7 0x8400   ADD_l
  .dhw 0x004E # 0x00D8 0x004E   address of constant 1
  .dhw 0xD400 # 0x00D9 0xD400   STO_l
  .dhw 0x0002 # 0x00DA 0x0002   address of XR2
  .dhw 0x6400 # 0x00DB 0x6400   LDX_l IA
  .dhw 0x0060 # 0x00DC 0x0060   NXT_ibm1130
  .dhw 0x0140 # 0x00DD 0x0140   (ibm1130)
  .dhw 0x6400 # 0x00DE 0x6400   LDX_l IA     : DROP_ibm1130
  .dhw 0x009B # 0x00DF 0x009B   COMMON_TAIL3_ibm1130
  .dhw 0x0140 # 0x00E0 0x0140   (ibm1130)
  .dhw 0xC2FF # 0x00E1 0xC2FF   LD_s XR2-1   : SWAP_ibm1130
  .dhw 0xD200 # 0x00E2 0xD200   STO_s XR2
  .dhw 0xC2FE # 0x00E4 0xC2FE   LD_s XR2-2
  .dhw 0xD2FF # 0x00E5 0xD2FF   STO_s XR2-1
  .dhw 0xC200 # 0x00E6 0xC200   LD_s XR2
  .dhw 0xD2FE # 0x00E7 0xD2FE   STO_s XR2-2
  .dhw 0x6400 # 0x00E8 0x6400   LDX_l IA
  .dhw 0x0060 # 0x00E9 0x0060   NXT_ibm1130
  .dhw 0x0140 # 0x00EA 0x0140   (ibm1130)
  .dhw 0xC2FF # 0x00EB 0xC2FF   LD_s XR2-1   : SKZ_ibm1130
  .dhw 0x4C20 # 0x00EC 0x4C20   BRAZ
  .dhw 0x00F0 # 0x00ED 0x00F0
  .dhw 0x6400 # 0x00EE 0x6400   LDX_l IA
  .dhw 0x009B # 0x00EF 0x009B   COMMON_TAIL3_ibm1130
  .dhw 0xC400 # 0x00F0 0xC400   LD_l
  .dhw 0x0001 # 0x00F1 0x0001   address of XR1
  .dhw 0x8400 # 0x00F2 0x8400   ADD_l
  .dhw 0x004E # 0x00F3 0x004E   address of constant 1
  .dhw 0xD400 # 0x00F4 0xD400   STO_l
  .dhw 0x0001 # 0x00F5 0x0001   address of XR1
  .dhw 0x6400 # 0x00F6 0x6400   LDX_l IA
  .dhw 0x009B # 0x00F7 0x009B   COMMON_TAIL3_ibm1130
  .dhw 0x0140 # 0x00F8 0x0140   (ibm1130)
  .dhw 0xC2FF # 0x00F9 0xC2FF   LD_s XR2-1   : >R_ibm1130
  .dhw 0xD300 # 0x00FA 0xD300   STO_s XR3
  .dhw 0xC400 # 0x00FB 0xC400   LD_l
  .dhw 0x0003 # 0x00FC 0x0003   address of XR3
  .dhw 0x8400 # 0x00FD 0x8400   ADD_l
  .dhw 0x004E # 0x00FE 0x004E   address of constant 1
  .dhw 0xD400 # 0x00FF 0xD400   STO_l
  .dhw 0x0003 # 0x0100 0x0003   address of XR3
  .dhw 0x6400 # 0x0101 0x6400   LDX_l IA
  .dhw 0x009B # 0x0102 0x009B   COMMON_TAIL3_ibm1130
  .dhw 0x0140 # 0x0103 0x0140   (ibm1130)
  .dhw 0xC400 # 0x0104 0xC400   LD_l         : R>_ibm1130
  .dhw 0x0003 # 0x0105 0x0003   address of XR3
  .dhw 0x9400 # 0x0106 0x9400   SUBTRACT__l
  .dhw 0x004E # 0x0107 0x004E   address of constant 1
  .dhw 0xD400 # 0x0108 0xD400   STO_l
  .dhw 0x0003 # 0x0109 0x0003   address of XR3
  .dhw 0xC300 # 0x010A 0xC300   LD_s XR3
  .dhw 0x6400 # 0x010B 0x6400   LDX_L IA
  .dhw 0x00D4 # 0x010C 0x00D4   COMMON_TAIL4_ibm1130
  .dhw 0x0140 # 0x010D 0x0140   (ibm1130)
  .dhw 0xC3FF # 0x010E 0xC3FF   LD_s XR3-1   : EXIT_ibm1130
  .dhw 0xD100 # 0x010F 0xD100   STO_s XR1
  .dhw 0xC400 # 0x0110 0xC400   LD_l
  .dhw 0x0003 # 0x0111 0x0003   address of XR3
  .dhw 0x9400 # 0x0112 0x9400   SUBTRACT__l
  .dhw 0x004E # 0x0113 0x004E   address of constant 1
  .dhw 0xD400 # 0x0114 0xD400   STO_l
  .dhw 0x0003 # 0x0115 0x0003   address of XR3
  .dhw 0x6400 # 0x0116 0x6400   LDX_l IA
  .dhw 0x0060 # 0x0117 0x0060   NXT_ibm1130
  .dhw 0x0140 # 0x0118 0x0140   (ibm1130)
  .dhw 0xC2FF # 0x0119 0xC2FF   LD_s XR2-1   : EXT_ibm1130
  .dhw 0xF400 # 0x011A 0xF400   EOR_l
  .dhw 0x013F # 0x011B 0x013F   address of the ibm1130 marker
  .dhw 0x4C20 # 0x011C 0x4C20   BRAZ
  .dhw 0x012C # 0x011D 0x012C
  .dhw 0xC400 # 0x011E 0xC400   LD_l
  .dhw 0x0001 # 0x011F 0x0001   address of XR1
  .dhw 0xD300 # 0x0120 0xD300   STO_s XR3
  .dhw 0xC400 # 0x0121 0xC400   LD_l
  .dhw 0x0003 # 0x0122 0x0003   address of XR3
  .dhw 0x8400 # 0x0123 0x8400   ADD_l
  .dhw 0x004E # 0x0124 0x004E   address of constant 1
  .dhw 0xD400 # 0x0125 0xD400   STO_l
  .dhw 0x0003 # 0x0126 0x0003   address of XR3
  .dhw 0xC400 # 0x0127 0xC400   LD_l
  .dhw 0x____ # 0x0128 0x____   address of EXT handler vector
  .dhw 0xD100 # 0x0129 0xD100   STO_s XR1
  .dhw 0x6400 # 0x012A 0x6400   LDX_l IA
  .dhw 0x0060 # 0x012B 0x0060   NXT_ibm1130
  .dhw 0xC3FF # 0x012C 0xC3FF   LD_s XR3-1
  .dhw 0xD400 # 0x012D 0xD400   STO_l
  .dhw 0x0136 # 0x012E 0x0136
  .dhw 0xC400 # 0x012F 0xC400   LD_l
  .dhw 0x0003 # 0x0130 0x0003   address of XR3
  .dhw 0x9400 # 0x0131 0x9400   SUBTRACT_l
  .dhw 0x004E # 0x0132 0x004E   address of constant 1
  .dhw 0xD400 # 0x0133 0xD400   STO_l
  .dhw 0x0003 # 0x0134 0x0003   address of XR3
  .dhw 0xC400 # 0x0135 0xC400   LD_l
  .dhw 0xDEAD # 0x0136 0xDEAD
  .dhw 0xD400 # 0x0137 0xD400   STO_l
  .dhw 0x013A # 0x0138 0x013A
  .dhw 0x6400 # 0x0139 0x6400   LDX_l IA
  .dhw 0xDEAD # 0x013A 0xDEAD
  .dhw 0x000D # 0x013B 0x000D   R>   : (CONST)
  .dhw 0x0006 # 0x013C 0x0006   @
  .dhw 0x000F # 0x013D 0x000F   EXIT
  .dhw 0x013B # 0x013E 0x013B   (CONST)   : ibm1130_mark
  .dhw 0x1130 # 0x013F 0x1130
  .dhw 0x013E # 0x0140 0x013E   ibm1130_mark   : (ibm1130)
  .dhw 0x000E # 0x0141 0x000E   EXT
  .dhw 0x000D # 0x0142 0x000D   R>   : (JMP)
  .dhw 0x0006 # 0x0143 0x0006   @    : @EXECUTE
  .dhw 0x000C # 0x0144 0x000C   >R   : EXECUTE
  .dhw 0x000E # 0x0145 0x000E   EXIT
  .dhw 0x000B # 0x0146 0x000B   SKZ   : ?:   ( alt conseq cond -- alt | conseq )
  .dhw 0x000A # 0x0147 0x000A   SWAP
  .dhw 0x0009 # 0x0148 0x0009   DROP
  .dhw 0x000F # 0x0149 0x000F   EXIT
  .dhw 0x000C # 0x014A 0x000C   >R   : OVER  ( a b -- a b a )
  .dhw 0x0008 # 0x014B 0x0008   DUP          ( a a )   R:( b )
  .dhw 0x000D # 0x014C 0x000D   R>           ( a a b ) R:( )
  .dhw 0x000A # 0x014D 0x000A   SWAP         ( a b a )
  .dhw 0x000F # 0x014E 0x000F   EXIT
  .dhw 0x000D # 0x014F 0x000D   R>   : (BRZ)  ( cond -- )
  .dhw 0x000A # 0x0150 0x000A   SWAP          ( raddr cond )  R:( )
  .dhw 0x000C # 0x0151 0x000C   >R            ( raddr )       R:( cond )
  .dhw 0x0008 # 0x0152 0x0008   DUP           ( raddr raddr )
  .dhw 0x0006 # 0x0153 0x0006   @             ( raddr dest )
  .dhw 0x0008 # 0x0154 0x0008   SWAP          ( dest raddr )
  .dhw 0x0005 # 0x0155 0x0005   1+            ( dest raddr ) R:( cond )
  .dhw 0x000D # 0x0156 0x000D   R>            ( dest raddr+1 cond ) R:( cond )
  .dhw 0x0146 # 0x0157 0x0146   ?:            ( addr )
  .dhw 0x000C # 0x0158 0x000C   >R            ( ) R:( addr )
  .dhw 0x000F # 0x0159 0x000F   EXIT
  .dhw 0x014A # 0x015A 0x014A   OVER   : 2DUP ( a b -- a b a b )
  .dhw 0x014A # 0x015B 0x014A   OVER
  .dhw 0x000F # 0x015C 0x000F   EXIT
  .dhw 0x000D # 0x015D 0x000D   R>   : (LUT)  ( inp -- outp | default )
  .dhw 0x0008 # 0x015E 0x0008   DUP           ( inp raddr raddr )
  .dhw 0x0005 # 0x015F 0x0005   1+            ( inp raddr raddr+1 )
  .dhw 0x000C # 0x0160 0x000C   >R            ( inp raddr ) R:( raddr+1 )
  .dhw 0x0006 # 0x0161 0x0006   @             ( inp nrOfEntries ) R:( raddr+1 )
  .dhw 0x015A # 0x0162 0x015A   2DUP          ( inp nrOfEntries inp nrOfEntries ) R:( raddr+1 )
  .dhw 0x0169 # 0x0163 0x0169   >=            ( inp nrOfEntries bool ) R:( raddr+1 )
  .dhw 0x0146 # 0x0164 0x0146   ?:            ( value ) R:( raddr+1 )
  .dhw 0x000D # 0x0165 0x000D   R>            ( value raddr+1 ) R:( )
  .dhw 0x0001 # 0x0166 0x0001   +             ( addr )
  .dhw 0x0006 # 0x0167 0x0006   @             ( outp )
  .dhw 0x000F # 0x0168 0x000F   EXIT
  .dhw 0x015A # 0x0169 0x015A   2DUP   : >=   ( n n -- bool )
  .dhw 0x0180 # 0x016A 0x0180   =             ( n n bool1 )
  .dhw 0x000C # 0x016B 0x000C   >R            ( n n ) R:( bool1 )
  .dhw 0x0197 # 0x016C 0x0197   >             ( bool2 ) R:( bool1 )
  .dhw 0x000D # 0x016D 0x000D   R>            ( bool2 bool1 ) R:( )
  .dhw 0x0187 # 0x016E 0x0187   OR            ( bool )
  .dhw 0x000F # 0x016F 0x000F   EXIT
  .dhw 0x013B # 0x0170 0x013B   (CONST)   : FALSE  aka ZERO 
  .dhw 0x0000 # 0x0171 0x0000
  .dhw 0x013B # 0x0172 0x013B   (CONST)   : TRUE   aka 0xFFFF_const
  .dhw 0xFFFF # 0x0173 0xFFFF
  .dhw 0x014F # 0x0174 0x014F   (BRZ)   : CLEANBOOL   ( dirty_bool -- bool )
  .dhw 0x0170 # 0x0175 0x0170   FALSE
  .dhw 0x0142 # 0x0176 0x0142   (JMP)
  .dhw 0x0172 # 0x0177 0x0172   TRUE    : INVERT  ( u -- ~u )
  .dhw 0x0003 # 0x0178 0x0003   XOR
  .dhw 0x000F # 0x0179 0x000F   EXIT
  .dhw 0x0177 # 0x017A 0x0177   INVERT  : NEGATE  ( n -- -n )
  .dhw 0x0005 # 0x017B 0x0005   1+
  .dhw 0x000F # 0x017C 0x000F   EXIT
  .dhw 0x017A # 0x017D 0x017A   NEGATE  : -   ( a b -- a-b )
  .dhw 0x0001 # 0x017E 0x0001   +
  .dhw 0x000F # 0x017F 0x0000   EXIT
  .dhw 0x0003 # 0x0180 0x0003   XOR     : = ( a b -- a==b )
  .dhw 0x0174 # 0x0181 0x0174   CLEANBOOL
  .dhw 0x0177 # 0x0182 0x0177   INVERT
  .dhw 0x000F # 0x0183 0x000F   EXIT
  .dhw 0x0002 # 0x0184 0x0002   &       : NAND ( a b -- c )
  .dhw 0x0177 # 0x0185 0x0177   INVERT
  .dhw 0x000F # 0x0186 0x000F   EXIT
  .dhw 0x0177 # 0x0187 0x0177   INVERT  : OR # ( a b -- a|b )
  .dhw 0x000A # 0x0188 0x000A   SWAP
  .dhw 0x0177 # 0x0189 0x0177   INVERT
  .dhw 0x0184 # 0x018A 0x0184   NAND
  .dhw 0x000F # 0x018B 0x000F   EXIT
  .dhw 0x013B # 0x018C 0x013B   (CONST)   : 0x8000_const
  .dhw 0x8000 # 0x018D 0x8000
  .dhw 0x018C # 0x018E 0x018C   0x8000_const   : 0<   ( n -- bool )
  .dhw 0x0002 # 0x018F 0x0002   &
  .dhw 0x0142 # 0x0190 0x0142   (JMP)
  .dhw 0x0174 # 0x0192 0x0174   CLEANBOOL
  .dhw 0x017D # 0x0193 0x017D   -  : < ( a b -- bool )
  .dhw 0x018E # 0x0194 0x018E   0<
  .dhw 0x0177 # 0x0195 0x0177   INVERT
  .dhw 0x000F # 0x0196 0x000F   EXIT
  .dhw 0x000A # 0x0197 0x000A   SWAP  : >
  .dhw 0x0193 # 0x0198 0x0193   <
  .dhw 0x000F # 0x0199 0x000F   EXIT
  .dhw 0x0140 # 0x019A 0x0140   (ibm1130)   : (IO) ( IOCC1 IOCC2 -- cell )
  .dhw 0xC400 # 0x019B 0xC400   LD_l
  .dhw 0x0171 # 0x019C 0x0171   address of constant zero
  .dhw 0x0AFE # 0x019D 0x0AFE   XIO_s XR2-1
  .dhw 0x6400 # 0x019E 0x6400   LDX_l IA
  .dhw 0x009A # 0x019F 0x009A   COMMON_TAIL1_ibm1130
  .dhw 0x000D # 0x01A0 0x000D   R>   : (VAR)
  .dhw 0x000F # 0x01A1 0x000F   EXIT
  .dhw 0x01A0 # 0x01A2 0x01A0   (VAR)   : console_ready?_IOCC
  .dhw 0x0000 # 0x01A3 0x0000
  .dhw 0x0F00 # 0x01A4 0x0F00
  .dhw 0x013B # 0x01A5 0x013B   (CONST)   : console_printer_ready?_mask
  .dhw 0x8C00 # 0x01A6 0x8C00
  .dhw 0x013B # 0x01A7 0x013B   (CONST)   : console_print_IOCC2
  .dhw 0x0900 # 0x01A8 0x0900
  .dhw 0xBEEF # 0x01A9 0xBEEF
  .dhw 0x0008 # 0x01AA 0x0008   DUP  : D@  ( addr -- cellU cellL )
  .dhw 0x0006 # 0x01AB 0x0006   @          ( addr cellU )
  .dhw 0x000A # 0x01AC 0x000A   SWAP       ( cellU addr )
  .dhw 0x0005 # 0x01AD 0x0005   1+         ( cellU addr+1 )
  .dhw 0x0006 # 0x01AE 0x0006   @          ( cellU cellL )
  .dhw 0x000F # 0x01AF 0x000F   EXIT
  .dhw 0x0277 # 0x01B0 0x0277   ASCII2CONSOLE_PRINTER_CODE   : console_TX!  ( char -- )
  .dhw 0x01A2 # 0x01B2 0x01A2   console_ready?_IOCC          ( ebdic addr )
  .dhw 0x01AA # 0x01B3 0x01AA   D@
  .dhw 0x019A # 0x01B4 0x019A   (IO)
  .dhw 0x01A5 # 0x01B5 0x01A5   console_printer_ready?_mask
  .dhw 0x0002 # 0x01B6 0x0002   &
  .dhw 0x018C # 0x01B7 0x018C   0x8000_const
  .dhw 0x0180 # 0x01B8 0x0180   =
  .dhw 0x0177 # 0x01B9 0x0177   INVERT
  .dhw 0x014F # 0x01BA 0x014F   (BRZ)
  .dhw 0x01B2 # 0x01BB 0x01B2
  .dhw 0x01C1 # 0x01BC 0x01C1   SP@
  .dhw 0x01A7 # 0x01BD 0x01A7   console_print_IOCC2
  .dhw 0x019A # 0x01BE 0x019A   (IO)
  .dhw 0x0009 # 0x01BF 0x0009   DROP
  .dhw 0x000F # 0x01C0 0x000F   EXIT
  .dhw 0x0140 # 0x01C1 0x0140   (ibm1130)   : SP@
  .dhw 0xC400 # 0x01C2 0xC400   LD_l
  .dhw 0x0002 # 0x01C3 0x0002   address of XR2
  .dhw 0x6400 # 0x01C4 0x6400   LDX_l IA
  .dhw 0x00D4 # 0x01C5 0x00D4   COMMON_TAIL4_ibm1130
  .dhw 0x0140 # 0x01C6 0x0140   (ibm1130)   : RP@
  .dhw 0xC400 # 0x01C7 0xC400   LD_l
  .dhw 0x0003 # 0x01C8 0x0003   address of XR3
  .dhw 0x6400 # 0x01C9 0x6400   LDX_l IA
  .dhw 0x00D4 # 0x01CA 0x00D4   COMMON_TAIL4_ibm1130
  .dhw 0x000D # 0x01CB 0x000D   R>  : (SPARSE_LUT)  ( key -- value )
  .dhw 0x0008 # 0x01CC 0x0008   DUP                 ( key raddr raddr ) R:( )
  .dhw 0x0006 # 0x01CD 0x0006   @                   ( key raddr nrOfEntries )
  .dhw 0x000C # 0x01CE 0x000C   >R                  ( key raddr ) R:( nrOfEntries )
  .dhw 0x0005 # 0x01CF 0x0005   1+                  ( key addr  ) Rv( nrOfEntries )
  .dhw 0x0142 # 0x01D0 0x0142   (JMP)
  .dhw 0x01DF # 0x01D1 0x01DF
  .dhw 0x015A # 0x01D3 0x015A   2DUP                ( key addr key addr ) R:( nrOfEntries )
  .dhw 0x0006 # 0x01D4 0x0006   @                   ( key addr key entryKey )
  .dhw 0x0180 # 0x01D5 0x0180   =                   ( key addr bool )
  .dhw 0x014F # 0x01D6 0x014F   (BRZ)               ( key addr )
  .dhw 0x01DE # 0x01D7 0x01DE 
  .dhw 0x01E4 # 0x01D8 0x01E4   NIP                 ( addr )
  .dhw 0x0005 # 0x01D9 0x0005   1+                  ( addr+1 )
  .dhw 0x0006 # 0x01DA 0x0006   @                   ( value )
  .dhw 0x000D # 0x01DB 0x000D   R>                  ( value count )
  .dhw 0x0009 # 0x01DC 0x0009   DROP                ( value )
  .dhw 0x000F # 0x01DD 0x000F   EXIT
  .dhw 0x01E7 # 0x01DE 0x01E7   2+                  ( key addr+2 )
  .dhw 0x01EE # 0x01DF 0x01EE   (NEXT)
  .dhw 0x01D3 # 0x01E0 0x01D3
  .dhw 0x01EA # 0x01E1 0x01EA   1-                  ( key raddr ) R:( )
  .dhw 0x000C # 0x01E2 0x000C   >R                  ( key ) R:( raddr )
  .dhw 0x000F # 0x01E3 0x000F   EXIT
  .dhw 0x000A # 0x01E4 0x000A   SWAP   : NIP  ( a b -- b )
  .dhw 0x0009 # 0x01E5 0x0009   DROP
  .dhw 0x000F # 0x01E6 0x000F   EXIT
  .dhw 0x0005 # 0x01E7 0x0005   1+     : 2+
  .dhw 0x0005 # 0x01E8 0x0005   1+
  .dhw 0x000F # 0x01E9 0x000F   EXIT
  .dhw 0x017A # 0x01EA 0x017A   NEGATE : 1-
  .dhw 0x0005 # 0x01EB 0x0005   1+
  .dhw 0x017A # 0x01EC 0x017A   NEGATE
  .dhw 0x000F # 0x01ED 0x000F   EXIT
  .dhw 0x000D # 0x01EE 0x000D   R>     : (NEXT)
  .dhw 0x000D # 0x01EF 0x000D   R>              ( raddr count ) R:( )
  .dhw 0x0008 # 0x01F0 0x0008   DUP             ( raddr count count )
  .dhw 0x014F # 0x01F1 0x014F   (BRZ)           ( raddr count )
  .dhw 0x01F8 # 0x01F2 0x01F8
  .dhw 0x01EA # 0x01F3 0x01EA   1-              ( raddr count-1 )
  .dhw 0x000C # 0x01F4 0x000C   >R              ( raddr ) R:( count-1 )
  .dhw 0x0006 # 0x01F5 0x0006   @               ( dest ) R:( count-1 )
  .dhw 0x000C # 0x01F6 0x000C   >R
  .dhw 0x000F # 0x01F7 0x000F   EXIT
  .dhw 0x0009 # 0x01F8 0x0009   DROP
  .dhw 0x0005 # 0x01F9 0x0005   1+
  .dhw 0x000C # 0x01FA 0x000C   >R
  .dhw 0x000F # 0x01FB 0x000F   EXIT
  .dhw 0x013B # 0x01FC 0x013B   (CONST) : 8_const
  .dhw 0x0008 # 0x01FD 0x0008   0d8
  .dhw 0x01FC # 0x01FE 0x01FC   8_const : ASCII2CONSOLE_PRINTER_CODE_sub1 ( ascii -- consolecode | TRUE )
  .dhw 0x017D # 0x01FF 0x017D   -
  .dhw 0x015D # 0x01FC 0x015D   (LUT)
  .dhw 0x0006 # 0x01FD 0x0006   nr of entries
  .dhw 0x1100 # 0x01FE 0x1100   ASCII Backspace  0b0001_0001  0x08 ASCII
  .dhw 0x4100 # 0x01FD 0x4100   Horizational Tab 0b0100_0001
  .dhw 0x0300 # 0x0203 0x0300   New Line         0b0000_0011  (the \\n char)
  .dhw 0x8100 # 0x0205 0x8100   Carriage Return  0b1000_0001
  .dhw 0x0500 # 0x0207 0x0500   Shift to Black   0b0000_0101  Shift In
  .dhw 0x0900 # 0x0209 0x0900   Shift to Red     0b0000_?001  Shift Out
  .dhw 0xFFFF # 0x020A 0xFFFF   equiv to TRUE
  .dhw 0x013B # 0x020B 0x013B   (CONST)   : 0x20_const
  .dhw 0x0020 # 0x020C 0x0020   0x20 0d32 or ASCII Space
  .dhw 0x020B # 0x020D 0x020B   0x20_const   : ASCII2CONSOLE_PRINTER_CODE_sub2 ( ascii -- consolecode )
  .dhw 0x017D # 0x020E 0x017D   -
  .dhw 0x015D # 0x020F 0x015D   (LUT)
  .dhw 0x003A # 0x0210 0x003A   nr of entries    0x024B - 0x0211 = 0x003A
  .dhw 0x2100 # 0x0211 0x2100   Space            0b0010_0001  ASCII 0x20
  .dhw 0x4200 # 0x0212 0x4200   !                0b0100_0010
  .dhw 0xE200 # 0x0213 0xE200   "                0b1110_0010
  .dhw 0xC000 # 0x0214 0xC000   #                0b1100_0000
  .dhw 0x4000 # 0x0215 0x4000   $                0b0100_0000
  .dhw 0x0600 # 0x0216 0x0600   %                0b0110_0000
  .dhw 0x4400 # 0x0217 0x4400   &                0b0100_0100
  .dhw 0xE600 # 0x0218 0xE600   '                0b1110_0110
  .dhw 0xFE00 # 0x0219 0xFE00   (                0b1111_1110
  .dhw 0xF600 # 0x021A 0xF600   )                0b1111_0110
  .dhw 0xD600 # 0x021B 0xD600   *                0b1101_0110
  .dhw 0xDA00 # 0x021C 0xDA00   +                0b1101_1010
  .dhw 0x8000 # 0x021D 0x8000   ,                0b1000_0000
  .dhw 0x8400 # 0x021E 0x8400   -                0b1000_0100
  .dhw 0x0000 # 0x021F 0x0000   .                0b0000_0000
  .dhw 0xBC00 # 0x0220 0xBC00   /                0b1011_1100
  .dhw 0xC400 # 0x0221 0xC400   0                0b1100_0100
  .dhw 0xFC00 # 0x0222 0xFC00   1                0b1111_1100
  .dhw 0xD800 # 0x0223 0xD800   2                0b1101_1000
  .dhw 0xDC00 # 0x0224 0xDC00   3                0b1101_1100
  .dhw 0xF000 # 0x0225 0xF000   4                0b1111_0000
  .dhw 0xF400 # 0x0226 0xF400   5                0b1111_0100
  .dhw 0xD000 # 0x0227 0xD000   6                0b1101_0000
  .dhw 0xD400 # 0x0228 0xD400   7                0b1101_0100
  .dhw 0xE400 # 0x0229 0xE400   8                0b1110_0100
  .dhw 0xE000 # 0x022A 0xE000   9                0b1110_0000
  .dhw 0x8200 # 0x022B 0x8200   :                0b1000_0010
  .dhw 0xD200 # 0x022C 0xD200   ;                0b1101_0010
  .dhw 0xDE00 # 0x022D 0xDE00   <                0b1101_1110
  .dhw 0xC200 # 0x022E 0xC200   =                0b1100_0010
  .dhw 0x4600 # 0x022F 0x4600   >                0b0100_0110
  .dhw 0x8600 # 0x0230 0x8600   ?                0b1000_0110
  .dhw 0x0400 # 0x0231 0x0400   @                0b0100_0000
  .dhw 0x3E00 # 0x0232 0x3E00   A                0b0011_1110
  .dhw 0x1A00 # 0x0233 0x1A00   B                0b0001_1010
  .dhw 0x1E00 # 0x0234 0x1E00   C                0b0001_1110
  .dhw 0x3200 # 0x0235 0x3200   D                0b0011_0010
  .dhw 0x3600 # 0x0236 0x3600   E                0b0011_0110
  .dhw 0x1200 # 0x0237 0x1200   F                0b0001_0010
  .dhw 0x1600 # 0x0238 0x1600   G                0b0001_0110
  .dhw 0x2600 # 0x0239 0x2600   H                0b0010_0110
  .dhw 0x2200 # 0x023A 0x2200   I                0b0010_0010
  .dhw 0xCE00 # 0x023B 0xCE00   J                0b1100_1110
  .dhw 0x5A00 # 0x023C 0x5A00   K                0b0101_1010
  .dhw 0x5E00 # 0x023D 0x5E00   L                0b0101_1110
  .dhw 0x7200 # 0x023E 0x7200   M                0b0111_0010
  .dhw 0x7600 # 0x023F 0x7600   N                0b0111_0110
  .dhw 0x5200 # 0x0240 0x5200   O                0b0101_0010
  .dhw 0x5600 # 0x0241 0x5600   P                0b0101_0110
  .dhw 0x6600 # 0x0242 0x6600   Q                0b0110_0110
  .dhw 0x6200 # 0x0243 0x6200   R                0b0110_0010
  .dhw 0x9A00 # 0x0244 0x9A00   S                0b1001_1010
  .dhw 0x9E00 # 0x0245 0x9E00   T                0b1001_1110
  .dhw 0xB200 # 0x0246 0xB200   U                0b1011_0010
  .dhw 0xB600 # 0x0247 0xB600   V                0b1011_0110
  .dhw 0x9200 # 0x0248 0x9200   W                0b1001_0010
  .dhw 0x9600 # 0x0249 0x9600   X                0b1001_0110
  .dhw 0xA600 # 0x024A 0xA600   Y                0b1010_0110
  .dhw 0xA200 # 0x024B 0xA200   Z                0b1010_0010
  .dhw 0xFFFF # 0x024C 0xFFFF   equiv to TRUE
  .dhw 0x013B # 0x024D 0x013B   (CONST)   : 0x61_const
  .dhw 0x0061 # 0x024E 0x0061   0x61 or ASCII a
  .dhw 0x013B # 0x024F 0x013B   (CONST)   : 0x7B_const
  .dhw 0x007B # 0x0250 0x007B
  .dhw 0x0008 # 0x0251 0x0008   DUP  : ASCII2CONSOLE_PRINTER_CODE_sub3 ( ascii -- consolecode )
  .dhw 0x024D # 0x0252 0x024D   0x61_const
  .dhw 0x024F # 0x0253 0x024F   0x7B_const
  .dhw 0x0264 # 0x0254 0x0264   WITHINu
  .dhw 0x014F # 0x0256 0x014F   (BRZ)
  .dhw 0x025F # 0x0257 0x025F
  .dhw 0x020B # 0x0258 0x020B   0x20_const
  .dhw 0x017D # 0x0259 0x017D   -
  .dhw 0x020D # 0x025A 0x020D   ASCII2CONSOLE_PRINTER_CODE_sub2
  .dhw 0x0262 # 0x025B 0x0262   2_const
  .dhw 0x0177 # 0x025C 0x0177   INVERT
  .dhw 0x0002 # 0x025D 0x0002   &
  .dhw 0x000F # 0x025E 0x000F   EXIT
  .dhw 0x0009 # 0x025F 0x0009   DROP
  .dhw 0x0172 # 0x0260 0x0172   TRUE
  .dhw 0x000F # 0x0261 0x000F   EXIT
  .dhw 0x013B # 0x0262 0x013B   (CONST)   : 2_const
  .dhw 0x0002 # 0x0263 0x0002   0d2
  .dhw 0x014A # 0x0264 0x014A   OVER   : WITHINu ( test low high -- flag ) 
  .dhw 0x017D # 0x0265 0x017D   -
  .dhw 0x000C # 0x0266 0x000C   >R
  .dhw 0x017D # 0x0267 0x017D   -
  .dhw 0x000D # 0x0268 0x000D   R>
  .dhw 0x026B # 0x0269 0x026B   U<
  .dhw 0x000F # 0x026A 0x000F   EXIT
  .dhw 0x015A # 0x026B 0x015A   2DUP   : U< ( u u -- t )  Unsigned compare of top two items.
  .dhw 0x0003 # 0x026C 0x0003   XOR
  .dhw 0x018E # 0x026D 0x018E   0<
  .dhw 0x014F # 0x026E 0x014F   (BRZ)
  .dhw 0x0274 # 0x026F 0x0274   U<_L1
  .dhw 0x000A # 0x0270 0x000A   SWAP
  .dhw 0x0009 # 0x0271 0x0009   DROP
  .dhw 0x018E # 0x0272 0x018E   0<
  .dhw 0x000F # 0x0273 0x000F   EXIT
  .dhw 0x017D # 0x0274 0x017D   -  : U<_L1
  .dhw 0x018E # 0x0275 0x018E   0<
  .dhw 0x000F # 0x0276 0x000F   EXIT
  .dhw 0x0008 # 0x0277 0x0008   DUP  : ASCII2CONSOLE_PRINTER_CODE ( ascii -- console_printer_code )
  .dhw 0x01FE # 0x0278 0x01FE   ASCII2CONSOLE_PRINTER_CODE_sub1
  .dhw 0x0008 # 0x0279 0x0008   DUP
  .dhw 0x0172 # 0x027A 0x0172   TRUE
  .dhw 0x0293 # 0x027B 0x0293   ~=
  .dhw 0x014F # 0x027C 0x014F   (BRZ)
  .dhw 0x0280 # 0x027D 0x0280
  .dhw 0x01E4 # 0x027E 0x01E4   NIP
  .dhw 0x000F # 0x027F 0x000F   EXIT
  .dhw 0x0009 # 0x0280 0x0009   DROP
  .dhw 0x0008 # 0x0281 0x0008   DUP
  .dhw 0x020D # 0x0282 0x020D   ASCII2CONSOLE_PRINTER_CODE_sub2
  .dhw 0x0008 # 0x0283 0x0008   DUP
  .dhw 0x0172 # 0x0284 0x0172   TRUE
  .dhw 0x0180 # 0x0285 0x0180   =
  .dhw 0x014F # 0x0286 0x014F   (BRZ)
  .dhw 0x027E # 0x0287 0x027E
  .dhw 0x0009 # 0x0288 0x0009   DROP
  .dhw 0x0251 # 0x0289 0x0251   ASCII2CONSOLE_PRINTER_CODE_sub3
  .dhw 0x0008 # 0x028A 0x0008   DUP
  .dhw 0x0172 # 0x028B 0x0172   TRUE
  .dhw 0x0180 # 0x028C 0x0180   =
  .dhw 0x014F # 0x028D 0x014F   (BRZ)
  .dhw 0x027E # 0x028E 0x027E
  .dhw 0x0296 # 0x028F 0x0296   2DROP
  .dhw 0x0142 # 0x0290 0x0142   (JMP)
  .dhw 0x0170 # 0x0292 0x0170   FALSE
  .dhw 0x0180 # 0x0293 0x0180   =   : ~=
  .dhw 0x0177 # 0x0294 0x0177   INVERT
  .dhw 0x000F # 0x0295 0x000F   EXIT
  .dhw 0x0009 # 0x0296 0x0009   DROP  : 2DROP
  .dhw 0x0009 # 0x0297 0x0009   DROP
  .dhw 0x000F # 0x0298 0x000F   EXIT
  .dhw 0x0008 # 0x0299 0x0008   DUP   : C@ ( byteaddress -- byte )
  .dhw 0x02AB # 0x029A 0x02AB   1>>
  .dhw 0x0006 # 0x029B 0x0006   @
  .dhw 0x000A # 0x029C 0x000A   SWAP
  .dhw 0x02B4 # 0x029D 0x02B4   1_const
  .dhw 0x0002 # 0x029E 0x0002   &
  .dhw 0x000B # 0x029F 0x000B   SKZ
  .dhw 0x02A6 # 0x02A0 0x02A6   SWAP_BYTES_IN_CELL
  .dhw 0x02B0 # 0x02A1 0x02B0   8>>
  .dhw 0x000F # 0x02A2 0x000F   EXIT
  .dhw 0x0004 # 0x02A3 0x0004   1<<> : 15<<>
  .dhw 0x02A8 # 0x02A4 0x02A8   2<<> : 14<<>
  .dhw 0x02A7 # 0x02A5 0x02A7   4<<> : 12<<>
  .dhw 0x02A7 # 0x02A6 0x02A7   4<<> : SWAP_BYTES_IN_CELL ( 0xXXYY -- 0xYYXX )  aka : 8<<>
  .dhw 0x02A8 # 0x02A7 0x02A8   2<<> : 4<<>
  .dhw 0x0004 # 0x02A8 0x0004   1<<> : 2<<>
  .dhw 0x0004 # 0x02A9 0x0004   1<<>
  .dhw 0x000F # 0x02AA 0x000F
  .dhw 0x018C # 0x02AB 0x018C   0x8000_const  : 1>>
  .dhw 0x0177 # 0x02AC 0x0177   INVERT
  .dhw 0x0002 # 0x02AD 0x0002   &
  .dhw 0x02A3 # 0x02AE 0x02A3   15<<>
  .dhw 0x000F # 0x02AF 0x000F   EXIT
  .dhw 0x02A6 # 0x02B0 0x02A6   8<<>   : 8>>
  .dhw 0x02B6 # 0x02B1 0x02B6   0xFF_const : 0xFF&
  .dhw 0x0002 # 0x02B2 0x0002   &
  .dhw 0x000F # 0x02B3 0x000F   EXIT
  .dhw 0x013B # 0x02B4 0x013B   (CONST)  : 1_const
  .dhw 0x0001 # 0x02B5 0x0001   0d1
  .dhw 0x013B # 0x02B6 0x013B   (CONST)  : 0xFF_const
  .dhw 0x00FF # 0x02B7 0x00FF   0xFF
  .dhw 0x0008 # 0x02B8 0x0008   DUP   : SHORT_STR_COUNT ( byteaddr -- byteaddr+1 count )
  .dhw 0x0005 # 0x02B9 0x0005   1+
  .dhw 0x000A # 0x02BA 0x000A   SWAP
  .dhw 0x0299 # 0x02BB 0x0299   C@
  .dhw 0x000F # 0x02BC 0x000F   EXIT
  .dhw 0x000C # 0x02BF 0x000C   >R   : console_TYPE_STR ( byteaddr count -- )
  .dhw 0x0142 # 0x02C0 0x0142   (JMP)
  .dhw 0x02C6 # 0x02C1 0x02C6
  .dhw 0x0008 # 0x02C2 0x0008   DUP         ( byteaddr byteaddr ) R:( count )
  .dhw 0x0299 # 0x02C3 0x0299   C@          ( byteaddr ascii )
  .dhw 0x01B0 # 0x02C4 0x01B0   console_TX! ( byteaddr )
  .dhw 0x0005 # 0x02C5 0x0005   1+          ( byteaddr+1 ) R:( count )
  .dhw 0x01EE # 0x02C6 0x01EE   (NEXT)
  .dhw 0x02C2 # 0x02C7 0x02C2
  .dhw 0x0009 # 0x02C8 0x0009   DROP
  .dhw 0x000F # 0x02C9 0x000F   EXIT
  .dhw 0x01CB # 0x02CA 0x01CB   (SPARSE_LUT)  : IBM_CARDCODE2ASCII ( cardcode -- ascii )
  .dhw 0x00BA # 0x02CB 0x00BA   nr of entries   0x039F - 0x02CB =  0x0174  0b0000_0001_0111_0100
  .dhw 0x0004 # 0x02CC 0x0004   Backspace                                  0b0000_0000_1011_1010
  .dhw 0x0008 # 0x02CD 0x0008   ASCII BackSpace                                 0    0    B A
  .dhw 0x0008 # 0x02CE 0x0008   End Of Field
  .dhw 0x100A # 0x02CF 0x100A   ASCII New Line + 0x8000
  .dhw 0xB030 # 0x02D0 0xB030   NUL
  .dhw 0x0000 # 0x02D1 0x0000   ASCII NULl
  .dhw 0x9010 # 0x02D2 0x9010   SOH
  .dhw 0x0001 # 0x02D3 0x0001   ASCII StartOfHeader
  .dhw 0x8810 # 0x02D4 0x8810   STX
  .dhw 0x0002 # 0x02D5 0x0002   ASCII Start of TeXt
  .dhw 0x8410 # 0x02D6 0x8410   ETX
  .dhw 0x0003 # 0x02D7 0x0003   ASCII End of TeXt
  .dhw 0x8110 # 0x02D8 0x8110   HT
  .dhw 0x0009 # 0x02D9 0x0009   ASCII TAB
  .dhw 0x8050 # 0x02DA 0x8050   DEL
  .dhw 0x007F # 0x02DB 0x007F   ASCII DEL
  .dhw 0x8430 # 0x02DC 0x8430   VT
  .dhw 0x000B # 0x02DD 0x000B   ASCII Vertical Tab
  .dhw 0x8230 # 0x02DE 0x8230   FF
  .dhw 0x000C # 0x02DF 0x000C   ASCII Form Feed  (often used as CLear Screen)
  .dhw 0x8130 # 0x02E0 0x8130   CR
  .dhw 0x000D # 0x02E1 0x000D   ASCII Carrage Return
  .dhw 0x80B0 # 0x02E2 0x80B0   SO
  .dhw 0x000E # 0x02E3 0x000E   ASCII Shift Out
  .dhw 0x8070 # 0x02E4 0x8070   SI
  .dhw 0x000F # 0x02E5 0x000F   ASCII Shift In
  .dhw 0xD030 # 0x02E6 0xD030   DLE
  .dhw 0x0010 # 0x02E7 0x0010   ASCII Data Link Escape
  .dhw 0x5010 # 0x02E8 0x5010   DC1
  .dhw 0x0011 # 0x02E9 0x0011   ASCII Device Control 1
  .dhw 0x4810 # 0x02EA 0x4810   DC2
  .dhw 0x0012 # 0x02EB 0x0012   ASCII Device Control 2
  .dhw 0x4410 # 0x02EC 0x4410   DC3
  .dhw 0x0013 # 0x02ED 0x0013   ASCII Device Control 3
  .dhw 0x4110 # 0x02EE 0x4110   NL
  .dhw 0x000A # 0x02EF 0x000A   ASCII New Line
  .dhw 0x4090 # 0x02F0 0x4090   BS
  .dhw 0x0008 # 0x02F1 0x0008   ASCII BackSpace
  .dhw 0x4050 # 0x02F2 0x4050   IDL  idle
  .dhw 0x0016 # 0x02F3 0x0016   ASCII SYNchronous idle
  .dhw 0x4030 # 0x02F4 0x4030   CAN
  .dhw 0x0018 # 0x02F5 0x0018   ASCII CANcel
  .dhw 0x5030 # 0x02F6 0x5030   EM
  .dhw 0x0019 # 0x02F7 0x0019   ASCII End of Medium
  .dhw 0x2130 # 0x02F8 0x2130   ENQ
  .dhw 0x0005 # 0x02F9 0x0005   ASCII ENQuiry
  .dhw 0x20B0 # 0x02FA 0x20B0   ACK
  .dhw 0x0006 # 0x02FB 0x0006   ASCII ACKnowledge
  .dhw 0x2070 # 0x02FC 0x2070   BEL
  .dhw 0x0007 # 0x02FD 0x0007   ASCII BELl
  .dhw 0x0810 # 0x02FE 0x0810   SYN
  .dhw 0x0016 # 0x02FF 0x0016   ASCII SYNchronous idle
  .dhw 0x0050 # 0x0300 0x0050   ETB
  .dhw 0x0017 # 0x0301 0x0017   ASCII End of Transmission Block
  .dhw 0x0130 # 0x0302 0x0130   NAK
  .dhw 0x0015 # 0x0302 0x0015   ASCII Negative AcKnowledge
  .dhw 0x0070 # 0x0304 0x0070   SUB
  .dhw 0x001A # 0x0305 0x001A   ASCII SUBstitude
  .dhw 0x0000 # 0x0306 0x0000   space
  .dhw 0x0020 # 0x0307 0x0020   ASCII space
  .dhw 0x8420 # 0x0308 0x8420   .
  .dhw 0x002E # 0x0309 0x002E   ASCII .
  .dhw 0x8220 # 0x030A 0x8220   <
  .dhw 0x003C # 0x030B 0x003C   ASCII <
  .dhw 0x8120 # 0x030C 0x8120   (
  .dhw 0x0028 # 0x030D 0x0028   ASCII (
  .dhw 0x80A0 # 0x030E 0x80A0   +
  .dhw 0x002B # 0x030F 0x002B   ASCII +
  .dhw 0x8060 # 0x0310 0x8060   |
  .dhw 0x007C # 0x0311 0x007C   ASCII |
  .dhw 0x8000 # 0x0312 0x8000   &
  .dhw 0x0026 # 0x0313 0x0026   ASCII &
  .dhw 0x4820 # 0x0314 0x4820   !
  .dhw 0x0021 # 0x0315 0x0021   ASCII !
  .dhw 0x4420 # 0x0316 0x4420   $
  .dhw 0x0024 # 0x0317 0x0024   ASCII $
  .dhw 0x4220 # 0x0318 0x4220   *
  .dhw 0x002A # 0x0319 0x002A   ASCII *
  .dhw 0x4120 # 0x031A 0x4120   )
  .dhw 0x0029 # 0x031B 0x0029   ASCII )
  .dhw 0x40A0 # 0x031C 0x40A0   ;
  .dhw 0x003B # 0x031D 0x003B   ASCII ;
  .dhw 0x4000 # 0x031E 0x4000   -
  .dhw 0x002D # 0x031F 0x002D   ASCII -
  .dhw 0x3000 # 0x0320 0x3000   /
  .dhw 0x002F # 0x0321 0x002F   ASCII /
  .dhw 0x2420 # 0x0322 0x2420   ,
  .dhw 0x002C # 0x0323 0x002C   ASCII ,
  .dhw 0x2220 # 0x0324 0x2220   %
  .dhw 0x0025 # 0x0325 0x0025   ASCII %
  .dhw 0x2120 # 0x0326 0x2120   _
  .dhw 0x005F # 0x0327 0x005F   ASCII _
  .dhw 0x20A0 # 0x0328 0x20A0   >
  .dhw 0x003E # 0x0329 0x003E   ASCII >
  .dhw 0x2060 # 0x032A 0x2060   ?
  .dhw 0x003F # 0x032B 0x003F   ASCII ?
  .dhw 0x0820 # 0x032C 0x0820   :
  .dhw 0x003A # 0x032D 0x003A   ASCII :
  .dhw 0x0420 # 0x032E 0x0420   #
  .dhw 0x0023 # 0x032F 0x0023   ASCII #
  .dhw 0x0220 # 0x0330 0x0220   @
  .dhw 0x0040 # 0x0331 0x0040   ASCII @
  .dhw 0x0120 # 0x0332 0x0120   '
  .dhw 0x0027 # 0x0333 0x0027   ASCII '
  .dhw 0x00A0 # 0x0334 0x00A0   =
  .dhw 0x003D # 0x0335 0x003D   ASCII =
  .dhw 0x0060 # 0x0336 0x0060   "
  .dhw 0x0022 # 0x0337 0x0022   ASCII "
  .dhw 0xB000 # 0x0338 0xB000   a
  .dhw 0x0061 # 0x0339 0x0061   ASCII a
  .dhw 0xA800 # 0x033A 0xA800   b
  .dhw 0x0062 # 0x033B 0x0062   ASCII b
  .dhw 0xA400 # 0x033C 0xA400   c
  .dhw 0x0063 # 0x033D 0x0063   ASCII c
  .dhw 0xA200 # 0x033E 0xA200   d
  .dhw 0x0064 # 0x033F 0x0064   ASCII d
  .dhw 0xA100 # 0x0340 0xA100   e
  .dhw 0x0065 # 0x0341 0x0065   ASCII e
  .dhw 0xA080 # 0x0342 0xA080   f
  .dhw 0x0066 # 0x0343 0x0066   ASCII f
  .dhw 0xA040 # 0x0344 0xA040   g
  .dhw 0x0067 # 0x0345 0x0067   ASCII g
  .dhw 0xA020 # 0x0346 0xA020   h
  .dhw 0x0068 # 0x0347 0x0068   ASCII h
  .dhw 0xA010 # 0x0348 0xA010   i
  .dhw 0x0069 # 0x0349 0x0069   ASCII i
  .dhw 0xD000 # 0x034A 0xD000   j
  .dhw 0x006A # 0x034B 0x006A   ASCII j
  .dhw 0xC800 # 0x034C 0xC800   k
  .dhw 0x006B # 0x034D 0x006B   ASCII k
  .dhw 0xC400 # 0x034E 0xC400   l
  .dhw 0x006C # 0x034F 0x006C   ASCII l
  .dhw 0xC200 # 0x0350 0xC200   m
  .dhw 0x006D # 0x0351 0x006D   ASCII m
  .dhw 0xC100 # 0x0352 0xC100   n
  .dhw 0x006E # 0x0353 0x006E   ASCII n
  .dhw 0xC080 # 0x0354 0xC080   o
  .dhw 0x006F # 0x0355 0x006F   ASCII o
  .dhw 0xC040 # 0x0356 0xC040   p
  .dhw 0x0070 # 0x0357 0x0070   ASCII p
  .dhw 0xC020 # 0x0358 0xC020   q
  .dhw 0x0071 # 0x0359 0x0071   ASCII q
  .dhw 0xC010 # 0x035A 0xC010   r
  .dhw 0x0072 # 0x035B 0x0072   ASCII r
  .dhw 0x6800 # 0x035C 0x6800   s
  .dhw 0x0073 # 0x035D 0x0073   ASCII s
  .dhw 0x6400	# 0x035E 0x6400   t
  .dhw 0x0074 # 0x035F 0x0074   ASCII t
  .dhw 0x6200 # 0x0360 0x6200   u
  .dhw 0x0075 # 0x0361 0x0075   ASCII u
  .dhw 0x6100 # 0x0362 0x6100   v
  .dhw 0x0076 # 0x0363 0x0076   ASCII v
  .dhw 0x6080 # 0x0364 0x6080   w
  .dhw 0x0077 # 0x0365 0x0077   ASCII w
  .dhw 0x6040 # 0x0366 0x6040   x
  .dhw 0x0078 # 0x0367 0x0078   ASCII x
  .dhw 0x6020 # 0x0368 0x6020   y
  .dhw 0x0079 # 0x0369 0x0079   ASCII y
  .dhw 0x6010 # 0x036A 0x6010   z
  .dhw 0x007A # 0x036B 0x007A   ASCII z
  .dhw 0x9000 # 0x036C 0x9000   A
  .dhw 0x0041 # 0x036D 0x0041   ASCII A
  .dhw 0x8800 # 0x036E 0x8800   B
  .dhw 0x0042 # 0x036F 0x0042   ASCII B
  .dhw 0x8400 # 0x0370 0x8400   C
  .dhw 0x0043 # 0x0371 0x0043   ASCII C
  .dhw 0x8200 # 0x0372 0x8200   D
  .dhw 0x0044 # 0x0373 0x0044   ASCII D
  .dhw 0x8100 # 0x0374 0x8100   E
  .dhw 0x0045 # 0x0375 0x0045   ASCII E
  .dhw 0x8080 # 0x0376 0x8080   F
  .dhw 0x0046 # 0x0377 0x0046   ASCII F
  .dhw 0x8040 # 0x0378 0x8040   G
  .dhw 0x0047 # 0x0379 0x0047   ASCII G
  .dhw 0x8020 # 0x037A 0x8020   H
  .dhw 0x0048 # 0x037B 0x0048   ASCII H
  .dhw 0x8010 # 0x037C 0x8010   I
  .dhw 0x0049 # 0x037D 0x0049   ASCII I
  .dhw 0x5000 # 0x037E 0x5000   J
  .dhw 0x004A # 0x037F 0x004A   ASCII J
  .dhw 0x4800 # 0x0380 0x4800   K
  .dhw 0x004B # 0x0381 0x004B   ASCII K
  .dhw 0x4400 # 0x0382 0x4400   L
  .dhw 0x004C # 0x0383 0x004C   ASCII L
  .dhw 0x4200 # 0x0384 0x4200   M
  .dhw 0x004D # 0x0385 0x004D   ASCII M
  .dhw 0x4100 # 0x0386 0x4100   N
  .dhw 0x004E # 0x0387 0x004E   ASCII N
  .dhw 0x4080 # 0x0388 0x4080   O
  .dhw 0x004F # 0x0389 0x004F   ASCII O
  .dhw 0x4040 # 0x038A 0x4040   P
  .dhw 0x0050 # 0x038B 0x0050   ASCII P
  .dhw 0x4020 # 0x038C 0x4020   Q
  .dhw 0x0051 # 0x038D 0x0051   ASCII Q
  .dhw 0x4010 # 0x038E 0x4010   R
  .dhw 0x0052 # 0x038F 0x0052   ASCII R
  .dhw 0x2800 # 0x0390 0x2800   S
  .dhw 0x0053 # 0x0391 0x0053   ASCII S
  .dhw 0x2400 # 0x0392 0x2400   T
  .dhw 0x0054 # 0x0393 0x0054   ASCII T
  .dhw 0x2200 # 0x0394 0x2200   U
  .dhw 0x0055 # 0x0395 0x0055   ASCII U
  .dhw 0x2100 # 0x0396 0x2100   V
  .dhw 0x0056 # 0x0397 0x0056   ASCII V
  .dhw 0x2080 # 0x0398 0x2080   W
  .dhw 0x0057 # 0x0399 0x0057   ASCII W
  .dhw 0x2040 # 0x039A 0x2040   X
  .dhw 0x0058 # 0x039B 0x0058   ASCII X
  .dhw 0x2020 # 0x039C 0x2020   Y
  .dhw 0x0059 # 0x039D 0x0059   ASCII Y
  .dhw 0x2010 # 0x039E 0x2010   Z
  .dhw 0x005A # 0x039F 0x005A   ASCII Z
  .dhw 0x0009 # 0x03A0 0x0009   DROP
  .dhw 0x0172 # 0x03A1 0x0172   TRUE
  .dhw 0x000F # 0x03A2 0x000F   EXIT
  .dhw 0x013B # 0x03A3 0x013B   (CONST)  : 0x4400_const
  .dhw 0x4400 # 0x03A4 0x4400   0x4400
  .dhw 0x013B # 0x03A5 0x013B   (CONST)  : 0x4000_const
  .dhw 0x4000 # 0x03A6 0x4000   0x4000
  .dhw 0x013B # 0x03A7 0x013B   (CONST)  : console_keyboard_ctrl_IOCC
  .dhw 0x0000 # 0x03A8 0x0000   0x0000
  .dhw 0x0C00 # 0x03A9 0x0C00   0x0C00
  .dhw 0x01A0 # 0x03AA 0x01A0   (VAR)    : ISR_lvl1_tmp
  .dhw 0x0000 # 0x03AB 0x0000
  .dhw 0x03A7 # 0x03AC 0x03A7   console_keyboard_ctrl_IOCC  ( addr ) : console_?RX ( -- char T | F )
  .dhw 0x01AA # 0x03AD 0x01AA   D@
  .dhw 0x019A # 0x03AE 0x019A   (IO)
  .dhw 0x0009 # 0x03AF 0x0009   DROP
  .dhw 0x01A2 # 0x03B0 0x01A2   console_ready?_IOCC  ( addr )
  .dhw 0x01AA # 0x03B1 0x01AA   D@           ( IOCC1 IOCC2 )
  .dhw 0x019A # 0x03B2 0x019A   (IO)         ( DSW )
  .dhw 0x03A4 # 0x03B3 0x03A4   0x4400_const
  .dhw 0x0002 # 0x03B4 0x0002   &
  .dhw 0x03A7 # 0x03B5 0x03A7   0x4000_const
  .dhw 0x0180 # 0x03B6 0x0180   =
  .dhw 0x014F # 0x03B7 0x014F   (BRZ)
  .dhw 0x0170 # 0x03B8 0x0170   FALSE
  .dhw 0x0170 # 0x03B9 0x0170   FALSE   this gets replaced by (IO)
  .dhw 0x01C1 # 0x03BA 0x01C1   SP@
  .dhw 0x03C1 # 0x03BB 0x03C1   console_keyboard_read_IOCC2
  .dhw 0x019A # 0x03BC 0x019A   (IO)
  .dhw 0x0009 # 0x03BD 0x0009   DROP
  .dhw 0x02CA # 0x03BE 0x02CA   IBM_CARDCODE2ASCII
  .dhw 0x0142 # 0x03BF 0x0142   (JMP)
  .dhw 0x0172 # 0x03C0 0x0172   TRUE
  .dhw 0x013B # 0x03C1 0x013B   (CONST) : console_keyboard_read_IOCC2
  .dhw 0x0A00 # 0x03C2 0x0A00
  .dhw 0x000D # 0x03C3 0x000D   R>   : type_on_console_inline_short_string ( -- )
  .dhw 0x0008 # 0x03C4 0x0008   DUP             ( raddr raddr )
  .dhw 0x044B # 0x03C5 0x044B   1<<             ( raddr raddr*2 )
  .dhw 0x02B8 # 0x03C6 0x02B8   SHORT_STR_COUNT ( raddr byteaddr length )
  .dhw 0x044F # 0x03C7 0x044F   ROT             ( byteaddr length raddr )
  .dhw 0x014A # 0x03C8 0x014A   OVER            ( byteaddr length raddr length )
  .dhw 0x02AB # 0x03C9 0x02AB   1>>             ( byteaddr length raddr length/2 )
  .dhw 0x0001 # 0x03CA 0x0001   +               ( byteaddr length raddr+n )
  .dhw 0x000C # 0x03CB 0x000C   >R
  .dhw 0x02BF # 0x03CC 0x02BF   console_TYPE_STR
  .dhw 0x000F # 0x03CD 0x000F   EXIT
  .dhw 0x01A0 # 0x03CE 0x01A0   (VAR)  : BSC_tx_addr
  .dhw 0x4000 # 0x03CF 0x4000   addr
  .dhw 0x0000 # 0x03D0 0x0000   length
  .dhw 0x0140 # 0x03D1 0x0140   (ibm1130)
  .dhw 0xC400 # 0x03D2 0xC400   LD_l
  .dhw 0x03AB # 0x03D3 0x03AB   address of SCA_ISR_tmp1
  .dhw 0x6400 # 0x03D4 0x6400   LDX_l IA
  .dhw 0xDEAD # 0x03D5 0xDEAD 
  .dhw 0xD400 # 0x03D6 0xD400   STO_l   Interrupt vector for level 1 points here
  .dhw 0x03AB # 0x03D7 0x03AB   address of SCA_ISR_tmp1
  .dhw 0x0C00 # 0x03D8 0x0C00   XIO_l
  .dhw 0x000E # 0x03D9 0x000E   address of Sense Interrupts IOCC
  .dhw 0xE400 # 0x03DA 0xE400   AND_l
  .dhw 0x03A8 # 0x03DB 0x03A8   address of constant 0x4000
  .dhw 0x4C20 # 0x03DC 0x4C20   BRAZ
  .dhw 0x03D2 # 0x03DD 0x03D2   not the SCA, so bail!
  .dhw 0x0C00 # 0x03DE 0x0C00   XIO_l
  .dhw 0x041C # 0x03DF 0x041C   address of SCA_Sense_IOCC
  .dhw 0x1001 # 0x03E0 0x1001   SLA 1
  .dhw 0x4C02 # 0x03E2 0x4C02   BRCZ
  .dhw 0x03FA # 0x03E3 0x03FA
  .dhw 0xD400 # 0x03E4 0xD400   STO_l
  .dhw 0x041A # 0x03E5 0x041A   address of SCA_ISR_tmp2
  .dhw 0xC400 # 0x03E6 0xC400   LD_l
  .dhw 0x042E # 0x03E7 0x042E   address of BSC_rx_addr+1, the length
  .dhw 0x4C20 # 0x03E8 0x4C20   BRAZ
  .dhw 0x03F8 # 0x03E9 0x03F8
  .dhw 0x9400 # 0x03EA 0x9400   SUBTRACT_l
  .dhw 0x02B5 # 0x03EB 0x02B5   address of constant 1
  .dhw 0xD400 # 0x03EC 0xD400   STO_l
  .dhw 0x042E # 0x03ED 0x042E   address of BSC_rx_addr+1, the length
  .dhw 0xC400 # 0x03EE 0xC400   LD_l
  .dhw 0x03CF # 0x03EF 0x03CF   address of BSC_rx_addr
  .dhw 0xD400 # 0x03F0 0xD400   STO_l
  .dhw 0x041F # 0x03F1 0x041F   address of BSC_read_IOCC
  .dhw 0x8400 # 0x03F2 0x8400   ADD_l
  .dhw 0x02B5 # 0x03F3 0x02B5   address of constant 1
  .dhw 0xD400 # 0x03F4 0xD400   STO_l
  .dhw 0x042D # 0x03F5 0x042D   address of BSC_rx_addr
  .dhw 0x0C00 # 0x03F6 0x0C00   XIO_l
  .dhw 0x041F # 0x03F7 0x041F   address of BSC_read_IOCC
  .dhw 0xC400 # 0x03F8 0xC400   LD_l
  .dhw 0x041A # 0x03F9 0x041A   address of SCA_ISR_tmp2
  .dhw 0x1001 # 0x03FA 0x1001   SLA 1
  .dhw 0x4C02 # 0x03FB 0x4C02   BRCZ
  .dhw 0x0413 # 0x03FC 0x0413   
  .dhw 0xD400 # 0x03FD 0xD400   STO_l
  .dhw 0x041A # 0x03FE 0x041A   address of SCA_ISR_tmp2
  .dhw 0xC400 # 0x03FF 0xC400   LD_l
  .dhw 0x03D0 # 0x0400 0x03D0   address of BSC_tx_addr+1, the length
  .dhw 0x4C20 # 0x0401 0x4C20   BRAZ
  .dhw 0x0411 # 0x0402 0x0411
  .dhw 0x9400 # 0x0403 0x9400   SUBTRACT_l
  .dhw 0x02B5 # 0x0404 0x02B5   address of constant 1
  .dhw 0xD400 # 0x0405 0xD400   STO_l
  .dhw 0x03D0 # 0x0406 0x03D0   address of BSC_tx_addr+1, the length
  .dhw 0xC400 # 0x0407 0xC400   LD_l
  .dhw 0x03CF # 0x0408 0x03CF   address of BSC_tx_addr
  .dhw 0xD400 # 0x0409 0xD400   STO_l
  .dhw 0x0422 # 0x040A 0x0422   address of BSC_write_IOCC
  .dhw 0x8400 # 0x040B 0x8400   ADD_l
  .dhw 0x02B5 # 0x040C 0x02B5   address of constant 1
  .dhw 0xD400 # 0x040D 0xD400   STO_l
  .dhw 0x03CF # 0x040E 0x03CF   address of BSC_tx_addr
  .dhw 0x0C00 # 0x040F 0x0C00   XIO_l
  .dhw 0x0422 # 0x0410 0x0422   address of BSC_write_IOCC
  .dhw 0xC400 # 0x0411 0xC400   LD_l
  .dhw 0x041A # 0x0412 0x041A   address of SCA_ISR_tmp2
  .dhw 0xE800 # 0x0413 0xE800   OR_l
  .dhw 0x02B5 # 0x0414 0x02B5   address of constant 1
  .dhw 0xD400 # 0x0415 0xD400   STO_l
  .dhw 0x041A # 0x0416 0x041A   address of SCA_ISR_tmp2
  .dhw 0x6400 # 0x0417 0x6400   LDX_l IA
  .dhw 0x03D2 # 0x0418 0x03D2
  .dhw 0x01A0 # 0x0419 0x01A0   (VAR) : SCA_ISR_status
  .dhw 0x0BEE # 0x041A 0x0BEE   SCA_ISR_tmp2
  .dhw 0x01A0 # 0x041B 0x01A0   (VAR)
  .dhw 0x0000 # 0x041C 0x0000   SCA_Sense_IOCC
  .dhw 0x5700 # 0x041D 0x5700
  .dhw 0x01A0 # 0x041E 0x01A0   (VAR)
  .dhw 0xDEAD # 0x041F 0xDEAD   BSC_read_IOCC
  .dhw 0x5200 # 0x0420 0x5200
  .dhw 0x01A0 # 0x0421 0x01A0   (VAR)
  .dhw 0xDEAD # 0x0422 0xDEAD   BSC_write_IOCC
  .dhw 0x5100 # 0x0423 0x5100
  .dhw 0x013B # 0x0424 0x013B   (CONST)   : BSC_init_read_IOCC2
  .dhw 0x5601 # 0x0425 0x5601
  .dhw 0x013B # 0x0426 0x013B   (CONST)   : BSC_init_write_IOCC2
  .dhw 0x5540 # 0x0427 0x5540
  .dhw 0x013B # 0x0428 0x013B   (CONST)   : BSC_ctrl_IOCC2
  .dhw 0x5400 # 0x0429 0x5400
  .dhw 0x013B # 0x042A 0x013B   (CONST)   : BSC_set_syncchar_IOCC2
  .dhw 0x5104 # 0x042B 0x5104
  .dhw 0x01A0 # 0x042C 0x01A0   (VAR)     : BSC_rx_addr
  .dhw 0x0000 # 0x042D 0x0000   addr
  .dhw 0x0000 # 0x042E 0x0000   length
  .dhw 0x013B # 0x042F 0x013B   (CONST)   : 0x1600_const
  .dhw 0x1600 # 0x0430 0x1600
  .dhw 0x042F # 0x0431 0x042F   0x1600_const   : BSC_init
  .dhw 0x01C1 # 0x0432 0x01C1   SP@
  .dhw 0x042A # 0x0433 0x042A   BSC_set_syncchar_IOCC2
  .dhw 0x019A # 0x0434 0x019A   (IO)
  .dhw 0x0009 # 0x0435 0x0009   DROP           SYNc char set
  .dhw 0x0170 # 0x0436 0x0170   FALSE
  .dhw 0x0428 # 0x0437 0x0428   BSC_ctrl_IOCC2
  .dhw 0x0454 # 0x0438 0x0454   0x14_const
  .dhw 0x0187 # 0x0439 0x0187   OR
  .dhw 0x019A # 0x043A 0x019A   (IO)
  .dhw 0x0009 # 0x043B 0x0009   DROP           SCA modes set
  .dhw 0x0442 # 0x043C 0x0442   (LIT)
  .dhw 0x03D6 # 0x043D 0x03D6
  .dhw 0x0442 # 0x043E 0x0442   (LIT)
  .dhw 0x0009 # 0x043F 0x0009
  .dhw 0x0007 # 0x0440 0x0007   !              pointer to SCA ISR set
  .dhw 0x000F # 0x0441 0x000F   EXIT
  .dhw 0x000D # 0x0442 0x000D   R>   : (LIT)  ( -- value )
  .dhw 0x0008 # 0x0443 0x0008   DUP
  .dhw 0x0005 # 0x0444 0x0004   1+
  .dhw 0x000C # 0x0445 0x000C   >R
  .dhw 0x0006 # 0x0446 0x0006   @
  .dhw 0x000F # 0x0447 0x000F   EXIT
  .dhw 0x02B5 # 0x0448 0x02B5   1_const : 0xFFFE_const
  .dhw 0x0177 # 0x0449 0x0177   INVERT
  .dhw 0x000F # 0x044A 0x000F   EXIT
  .dhw 0x0004 # 0x044B 0x0004   1<<>   : 1<<
  .dhw 0x0448 # 0x044C 0x0448   0xFFFE_const
  .dhw 0x0002 # 0x044D 0x0002   &
  .dhw 0x000F # 0x044E 0x000F   EXIT
  .dhw 0x000C # 0x044F 0x000C   >R   : ROT  ( a b c -- b c a )
  .dhw 0x000A # 0x0450 0x000A   SWAP
  .dhw 0x000D # 0x0451 0x000D   R>
  .dhw 0x000A # 0x0452 0x000A   SWAP
  .dhw 0x000F # 0x0453 0x000F   EXIT
  .dhw 0x013B # 0x0454 0x013B   (CONST)   : 0x14_const
  .dhw 0x0014 # 0x0455 0x0014
  .dhw 0x000C # 0x0456 0x000C   >R   : PACKBYTES ( src_addr dest_addr length_in_cells -- )
  .dhw 0x0___ # 0x0457 0x0___   (JMP)
  .dhw 0x0466 # 0x0458 0x0466
  .dhw 0x014A # 0x0459 0x014A   OVER     ( src dest src )
  .dhw 0x0006 # 0x045A 0x0006   @        ( src dest 0xXX__ )
  .dhw 0x000C # 0x045B 0x000C   >R       ( src dest )
  .dhw 0x046A # 0x045C 0x046A   incr_NOS ( src+1 dest )
  .dhw 0x014A # 0x045D 0x014A   OVER     ( src+1 dest src+1 )
  .dhw 0x0006 # 0x045E 0x0006   @        ( src+1 dest 0xXX__ )
  .dhw 0x0___ # 0x045F 0x0___   8<<>     ( src+1 dest 0x__XX )
  .dhw 0x000D # 0x0460 0x000D   R>       ( src+1 dest 0x__XX 0xXX__ )
  .dhw 0x0003 # 0x0461 0x0003   XOR      ( src+1 dest 0xXXXX )
  .dhw 0x014A # 0x0462 0x014A   OVER     ( src+1 dest 0xXXXX dest )
  .dhw 0x0007 # 0x0463 0x0007   !        ( src+1 dest )
  .dhw 0x0005 # 0x0464 0x0005   1+       ( src+1 dest+1 )
  .dhw 0x046A # 0x0465 0x046A   incr_NOS ( src+2 dest+1 )
  .dhw 0x0___ # 0x0466 0x0___   (NEXT)
  .dhw 0x0459 # 0x0467 0x0459
  .dhw 0x0___ # 0x0468 0x0___   (JMP)
  .dhw 0x0___ # 0x0469 0x0___   2DROP
  .dhw 0x000A # 0x046A 0x000A   SWAP   : incr_NOS
  .dhw 0x0005 # 0x046B 0x0005   1+
  .dhw 0x000A # 0x046C 0x000A   SWAP
  .dhw 0x000F # 0x046D 0x000F   EXIT
  .dhw 0x000C # 0x046E 0x000C   >R     : UNPACKBYTES ( src_addr dest_addr length_in_bytes -- )
  .dhw 0x000A # 0x046F 0x000A   SWAP     ( dest_addr src_addr )
  .dhw 0x0___ # 0x0470 0x0___   1<<      ( dest_addr src_byteaddr )
  .dhw 0x000A # 0x0471 0x000A   SWAP     ( src dest )
  .dhw 0x0___ # 0x0472 0x0___   (JMP)
  .dhw 0x047B # 0x0473 0x047B
  .dhw 0x014A # 0x0474 0x014A   OVER     ( src dest src )
  .dhw 0x0___ # 0x0475 0x0___   C@       ( src dest byte )
  .dhw 0x0___ # 0x0476 0x0___   8<<>
  .dhw 0x014A # 0x0477 0x014A   OVER     ( src dest cell dest )
  .dhw 0x0007 # 0x0478 0x0007   !        ( src dest )
  .dhw 0x0005 # 0x0479 0x0005   1+       ( src dest+1 )
  .dhw 0x046A # 0x047A 0x046A   incr_NOS ( src+1 dest+1 )
  .dhw 0x0___ # 0x047B 0x0___   (NEXT)
  .dhw 0x0474 # 0x047C 0x0474
  .dhw 0x0___ # 0x047D 0x0___   (JMP)
  .dhw 0x0___ # 0x047E 0x0___   2DROP
  .dhw 0x03CE # 0x047F 0x03CE   BSC_tx_addr   : BSC_ready?
  .dhw 0x0005 # 0x0480 0x0005   1+
  .dhw 0x0006 # 0x0481 0x0006   @
  .dhw 0x0___ # 0x0482 0x0___   (BRZ)     wait for previous send to finish
  .dhw 0x0486 # 0x0483 0x0486
  .dhw 0x0___ # 0x0484 0x0___   (JMP)
  .dhw 0x047F # 0x0485 0x047F
  .dhw 0x042C # 0x0486 0x042C   BSC_rx_addr
  .dhw 0x0005 # 0x0487 0x0005   1+
  .dhw 0x0006 # 0x0488 0x0006   @
  .dhw 0x0___ # 0x0489 0x0___   (BRZ)     wait for previous recieve to finish
  .dhw 0x048B # 0x048A 0x048B
  .dhw 0x0___ # 0x0489 0x0___   (JMP)
  .dhw 0x0486 # 0x048A 0x0486
  .dhw 0x0419 # 0x048B 0x0419   SCA_ISR_status
  .dhw 0x0006 # 0x048C 0x0006   @
  .dhw 0x0___ # 0x048D 0x0___   1_const
  .dhw 0x0002 # 0x048E 0x0002   &
  .dhw 0x0___ # 0x048F 0x0___   (BRZ)
  .dhw 0x048B # 0x0490 0x048B
  .dhw 0x0419 # 0x0491 0x0418   SCA_ISR_status
  .dhw 0x0006 # 0x0492 0x0006   @
  .dhw 0x0___ # 0x0493 0x0___   0x0400_const
  .dhw 0x0002 # 0x0494 0x0002   &
  .dhw 0x0___ # 0x0495 0x0___   (BRZ)
  .dhw 0x048B # 0x0496 0x048B
  .dhw 0x000F # 0x0497 0x000F   EXIT
  .dhw 0x0___ # 0x0498 0x0___   BSC_ready?   : BSC_send ( addr length -- )
  .dhw 0x03CE # 0x0499 0x03CE   BSC_tx_addr
  .dhw 0x0___ # 0x049A 0x0___   D!
  .dhw 0x0___ # 0x049B 0x0___   FALSE
  .dhw 0x0___ # 0x049C 0x0___   BSC_init_write_IOCC2
  .dhw 0x0___ # 0x049D 0x0___   (IO)
  .dhw 0x0009 # 0x049E 0x0009   DROP
  .dhw 0x000F # 0x049F 0x000F   EXIT
  .dhw 0x0___ # 0x04A0 0x0___   BSC_ready?   : BSC_recieve ( addr length -- )
  .dhw 0x042C # 0x04A1 0x042C   BSC_rx_addr
  .dhw 0x0___ # 0x04A2 0x0___   D!
  .dhw 0x0___ # 0x04A3 0x0___   FALSE
  .dhw 0x0___ # 0x04A4 0x0___   BSC_init_read_IOCC2
  .dhw 0x0___ # 0x04A5 0x0___   (IO)
  .dhw 0x0009 # 0x04A6 0x0009   DROP
  .dhw 0x000F # 0x04A7 0x000F   EXIT
  .dhw 0x0431 # 0x04A8 0x0431   BSC_init   : remotely_controlled_via
  .dhw 0x0___ # 0x04A9 0x0___   BSC_greeting
  .dhw 0x0008 # 0x04AA 0x0008   DUP
  .dhw 0x0005 # 0x04AB 0x0005   1+
  .dhw 0x000A # 0x04AC 0x000A   SWAP
  .dhw 0x0006 # 0x04AD 0x0006   @
  .dhw 0x0___ # 0x04AE 0x0___   BSC_send
  .dhw 0x0___ # 0x04AF 0x0___   0xF00_const
  .dhw 0x0___ # 0x04B0 0x0___   4_const
  .dhw 0x0___ # 0x04B1 0x0___   BSC_recieve
  .dhw 0x0___ # 0x04B2 0x0___   0xF00_const
  .dhw 0x0___ # 0x04B3 0x0___   0xC00_const
  .dhw 0x0___ # 0x04B4 0x0___   2_const
  .dhw 0x0___ # 0x04B5 0x0___   PACKBYTES
  .dhw 0x0___ # 0x04B6 0x0___   0xC00_const
  .dhw 0x0005 # 0x04B7 0x0005   1+
  .dhw 0x0006 # 0x04B8 0x0006   @
  .dhw 0x0___ # 0x04B9 0x0___   (BRZ)
  .dhw 0x04C9 # 0x04BA 0x04CA
  .dhw 0x0___ # 0x04BB 0x0___   0xC00_const
  .dhw 0x0008 # 0x04BC 0x0008   DUP
  .dhw 0x0006 # 0x04BD 0x0006   @
  .dhw 0x000A # 0x04BE 0x000A   SWAP
  .dhw 0x0005 # 0x04BF 0x0005   1+
  .dhw 0x000A # 0x04C0 0x000A   @
  .dhw 0x0___ # 0x04C1 0x0___   2DUP
  .dhw 0x0___ # 0x04C2 0x0___   1<<
  .dhw 0x0___ # 0x04C3 0x0___   BSC_recieve
  .dhw 0x0___ # 0x04C4 0x0___   OVER
  .dhw 0x000A # 0x04C5 0x000A   SWAP
  .dhw 0x0___ # 0x04C6 0x0___   PACKBYTES
  .dhw 0x0___ # 0x04C7 0x0___   (JMP)
  .dhw 0x04AF # 0x04C8 0x04AF
  .dhw 0x0___ # 0x04C9 0x0___   0xC00_const
  .dhw 0x0___ # 0x04CA 0x0___   @EXECUTE
  .dhw 0x0___ # 0x04CB 0x0___   (JMP)
  .dhw 0x04AF # 0x04CC 0x04AF
  

  .dhw 0x____ # 0x1000 0x____   (JMP)
  .dhw 0x____ # 0x1001 0x____
  .dhw 0x____ # 0x1002 0x____   (CONST)  : lower_pen_const aka 0x8000_const
  .dhw 0x8000 # 0x1003 0x8000
  .dhw 0x____ # 0x1004 0x____   (CONST)  : raise_pen_const
  .dhw 0x0400 # 0x1005 0x0400
  .dhw 0x____ # 0x1006 0x____   (CONST)  : +X_const
  .dhw 0x4000 # 0x1007 0x4000
  .dhw 0x____ # 0x1008 0x____   (CONST)  : -X_const
  .dhw 0x2000 # 0x1009 0x2000
  .dhw 0x____ # 0x100A 0x____   (CONST)  : +Y_const
  .dhw 0x0200 # 0x100B 0x0200
  .dhw 0x____ # 0x100C 0x____   (CONST)  : -Y_const
  .dhw 0x1000 # 0x100D 0x1000
  .dhw 0x____ # 0x100E 0x____   (CONST)  : plotter_write_IOCC2
  .dhw 0x2900 # 0x100F 0x2900
  .dhw 0x____ # 0x1010 0x____   (CONST)  : plotter_sense_IOCC2
  .dhw 0x2F01 # 0x1011 0x2F01
  .dhw 0x____ # 0x1012 0x____   SP@   : ((plot_IO)) ( plotcode -- )
  .dhw 0x____ # 0x1013 0x____   plotter_write_IOCC2
  .dhw 0x____ # 0x1014 0x____   (IO)
  .dhw 0x0009 # 0x1015 0x0009   DROP
  .dhw 0x____ # 0x1016 0x____   FALSE
  .dhw 0x____ # 0x1017 0x____   SP@
  .dhw 0x____ # 0x1018 0x____   plotter_sense_IOCC2
  .dhw 0x____ # 0x1019 0x____   (IO)
  .dhw 0x____ # 0x101A 0x____   0x8000_const
  .dhw 0x____ # 0x101B 0x____   =
  .dhw 0x____ # 0x101C 0x____   (BRZ)
  .dhw 0x1016 # 0x101D 0x1016
  .dhw 0x000F # 0x101E 0x000F   EXIT
  .dhw 0x____ # 0x101F 0x____   raise_pen_const   : pen_up
  .dhw 0x____ # 0x1020 0x____   (plot_IO)
  .dhw 0x000F # 0x1021 0x000F   EXIT
  .dhw 0x____ # 0x1022 0x____   lower_pen_const   : pen_down
  .dhw 0x____ # 0x1023 0x____   (plot_IO)
  .dhw 0x000F # 0x1024 0x000F   EXIT
  .dhw 0x____ # 0x1025 0x____   set_last_pen_act  : pen_N
  .dhw 0x____ # 0x1026 0x____   +Y_const
  .dhw 0x____ # 0x1027 0x____   (plot_IO)
  .dhw 0x000F # 0x1028 0x000F   EXIT
  .dhw 0x____ # 0x1029 0x____   set_last_pen_act  : pen_S
  .dhw 0x____ # 0x102A 0x____   -Y_const
  .dhw 0x____ # 0x102B 0x____   (plot_IO)
  .dhw 0x000F # 0x102C 0x000F   EXIT
  .dhw 0x____ # 0x102D 0x____   set_last_pen_act  : pen_E
  .dhw 0x____ # 0x102E 0x____   +X_const
  .dhw 0x____ # 0x102F 0x____   (plot_IO)
  .dhw 0x000F # 0x1030 0x000F   EXIT
  .dhw 0x____ # 0x1031 0x____   set_last_pen_act  : pen_W
  .dhw 0x____ # 0x1032 0x____   -X_const
  .dhw 0x____ # 0x1033 0x____   (plot_IO)
  .dhw 0x000F # 0x1034 0x000F   EXIT
  .dhw 0x____ # 0x1035 0x____   set_last_pen_act  : pen_NE
  .dhw 0x____ # 0x1036 0x____   +Y_const
  .dhw 0x____ # 0x1037 0x____   +X_const
  .dhw 0x____ # 0x1038 0x____   OR
  .dhw 0x____ # 0x1039 0x____   (plot_IO)
  .dhw 0x000F # 0x103A 0x000F   EXIT
  .dhw 0x____ # 0x103B 0x____   set_last_pen_act  : pen_NW
  .dhw 0x____ # 0x103C 0x____   +Y_const
  .dhw 0x____ # 0x103D 0x____   -X_const
  .dhw 0x____ # 0x103E 0x____   OR
  .dhw 0x____ # 0x103F 0x____   (plot_IO)
  .dhw 0x000F # 0x1040 0x000F   EXIT
  .dhw 0x____ # 0x1041 0x____   set_last_pen_act  : pen_SE
  .dhw 0x____ # 0x1042 0x____   -Y_const
  .dhw 0x____ # 0x1043 0x____   +X_const
  .dhw 0x____ # 0x1044 0x____   OR
  .dhw 0x____ # 0x1045 0x____   (plot_IO)
  .dhw 0x000F # 0x1046 0x000F   EXIT
  .dhw 0x____ # 0x1047 0x____   set_last_pen_act  : pen_SW
  .dhw 0x____ # 0x1048 0x____   -Y_const
  .dhw 0x____ # 0x1049 0x____   -X_const
  .dhw 0x____ # 0x104A 0x____   OR
  .dhw 0x____ # 0x104B 0x____   (plot_IO)
  .dhw 0x000F # 0x104C 0x000F   EXIT
  .dhw 0x____ # 0x104D 0x____   (VAR)   : last_pen_act
  .dhw 0xBEEF # 0x104E 0xBEEF
  .dhw 0x000D # 0x104F 0x000D   R>      : set_last_pen_act
  .dhw 0x0008 # 0x1050 0x0008   DUP
  .dhw 0x000C # 0x1051 0x000C   >R
  .dhw 0x____ # 0x1052 0x____   1-
  .dhw 0x____ # 0x1053 0x____   last_pen_act
  .dhw 0x0007 # 0x1054 0x0007   !
  .dhw 0x000F # 0x1055 0x000F   EXIT
  .dhw 0x____ # 0x1056 0x____   last_pen_act   : repeat_last_pen_act
  .dhw 0x____ # 0x1057 0x____   @EXECUTE
  .dhw 0x000F # 0x1058 0x000F   EXIT
  .dhw 0x____ # 0x1059 0x____   98_const   : 1mm   otherwise it would be off by two
  .dhw 0x000D # 0x105A 0x000D   >R
  .dhw 0x____ # 0x105B 0x____   repeat_last_pen_act
  .dhw 0x____ # 0x105C 0x____   (NEXT)
  .dhw 0x105B # 0x105D 0x105B
  .dhw 0x000F # 0x105E 0x000F   EXIT
  .dhw 0x____ # 0x105F 0x____   (VAR)   : pen_direction
  .dhw 0x0000 # 0x1060 0x0000
  .dhw 0x____ # 0x1061 0x____   (CONST)   : 3_const
  .dhw 0x0003 # 0x1062 0x0003
  .dhw 0x____ # 0x1063 0x____   pen_direction : turn_common ( turn_dir -- )
  .dhw 0x0006 # 0x1064 0x0006   @        ( turn_dir pen_dir )
  .dhw 0x0008 # 0x1065 0x0008   DUP      ( turn_dir pen_dir pen_dir )
  .dhw 0x____ # 0x1066 0x____   3_const  ( turn_dir pen_dir pen_dir 3 )
  .dhw 0x____ # 0x1067 0x____   INVERT   ( turn_dir pen_dir pen_dir 0xFFFC )
  .dhw 0x0002 # 0x1068 0x0002   &        ( turn_dir pen_dir ~masked )
  .dhw 0x000A # 0x1069 0x000A   SWAP     ( turn_dir ~masked pen_dir )
  .dhw 0x____ # 0x106A 0x____   3_const  ( turn_dir ~masked pen_dir 3 )
  .dhw 0x0002 # 0x106B 0x0002   &        ( turn_dir ~masked masked )
  .dhw 0x____ # 0x106C 0x____   ROT      ( ~masked masked turn_dir )
  .dhw 0x0001 # 0x106D 0x0001   +        ( ~masked turned )
  .dhw 0x____ # 0x106E 0x____   3_const  ( ~masked turned 3 )
  .dhw 0x0002 # 0x106F 0x0002   &
  .dhw 0x____ # 0x1070 0x____   OR
  .dhw 0x____ # 0x1071 0x____   pen_direction
  .dhw 0x0007 # 0x1072 0x0007   !
  .dhw 0x000F # 0x1073 0x000F   EXIT
  .dhw 0x____ # 0x1074 0x____   1_const   : turn_right
  .dhw 0x____ # 0x1075 0x____   turn_common
  .dhw 0x000F # 0x1076 0x000F   EXIT
  .dhw 0x____ # 0x1077 0x____   1_const   : turn_left
  .dhw 0x____ # 0x1078 0x____   NEGATE
  .dhw 0x____ # 0x107A 0x____   turn_common
  .dhw 0x000F # 0x107B 0x000F   EXIT
  .dhw 0x____ # 0x107C 0x____   pen_direction   : pen_forward ( -- )
  .dhw 0x0006 # 0x107D 0x0006   @
  .dhw 0x____ # 0x107E 0x____   3_const
  .dhw 0x0002 # 0x107F 0x0002   &
  .dhw 0x____ # 0x1080 0x____   (JMPTBL)
  .dhw 0x0004 # 0x1081 0x0004
  .dhw 0x____ # 0x1082 0x____   pen_forward_N
  .dhw 0x____ # 0x1083 0x____   pen_forward_E
  .dhw 0x____ # 0x1084 0x____   pen_forward_S
  .dhw 0x____ # 0x1085 0x____   pen_forward_W
  .dhw 0x0009 # 0x1086 0x0009   DROP
  .dhw 0x000F # 0x1087 0x000F
  .dhw 0x____ # 0x1088 0x____   hilbert_curve_A   : hilbert_curve ( level -- )
  .dhw 0x0009 # 0x1089 0x0009   DROP
  .dhw 0x000F # 0x108A 0x000F   EXIT
  .dhw 0x0008 # 0x108B 0x0008   DUP  : hilbert_exit?  ( level -- level )
  .dhw 0x____ # 0x108C 0x____   (BRZ)
  .dhw 0x108F # 0x108D 0x108F
  .dhw 0x000F # 0x108E 0x000F   EXIT
  .dhw 0x000D # 0x108F 0x000D   R>
  .dhw 0x000F # 0x1090 0x000F   EXIT
  .dhw 0x____ # 0x1091 0x____   hilbert_exit?   : hilbert_curve_A ( level -- level )
  .dhw 0x____ # 0x1092 0x____   1-
  .dhw 0x____ # 0x1093 0x____   turn_left
  .dhw 0x____ # 0x1094 0x____   hilbert_curve_B
  .dhw 0x____ # 0x1095 0x____   pen_forward
  .dhw 0x____ # 0x1096 0x____   turn_right
  .dhw 0x____ # 0x1097 0x____   hilbert_curve_A
  .dhw 0x____ # 0x1098 0x____   pen_forward
  .dhw 0x____ # 0x1099 0x____   hilbert_curve_A
  .dhw 0x____ # 0x109A 0x____   turn_right
  .dhw 0x____ # 0x109B 0x____   pen_forward
  .dhw 0x____ # 0x109C 0x____   hilbert_curve_B
  .dhw 0x____ # 0x109D 0x____   turn_left
  .dhw 0x0005 # 0x109E 0x0005   1+
  .dhw 0x000F # 0x109F 0x000F   EXIT
  .dhw 0x____ # 0x10A0 0x____   hilbert_exit?   : hilbert_curve_B ( level -- level )
  .dhw 0x____ # 0x10A1 0x____   1-
  .dhw 0x____ # 0x10A2 0x____   turn_right
  .dhw 0x____ # 0x10A3 0x____   hilbert_curve_A
  .dhw 0x____ # 0x10A4 0x____   pen_forward
  .dhw 0x____ # 0x10A5 0x____   turn_left
  .dhw 0x____ # 0x10A6 0x____   hilbert_curve_B
  .dhw 0x____ # 0x10A7 0x____   pen_forward
  .dhw 0x____ # 0x10A8 0x____   hilbert_curve_B
  .dhw 0x____ # 0x10A9 0x____   turn_left
  .dhw 0x____ # 0x10AA 0x____   pen_forward
  .dhw 0x____ # 0x10AB 0x____   hilbert_curve_A
  .dhw 0x____ # 0x10AC 0x____   turn_right
  .dhw 0x0005 # 0x10AD 0x0005   1+
  .dhw 0x000F # 0x10AE 0x000F   EXIT
  .dhw 0x____ # 0x10AF 0x____   (VAR)   : plotter_X_coord
  .dhw 0x0000 # 0x10B0 0x0000
  .dhw 0x0000 # 0x10B1 0x0000
  .dhw 0x____ # 0x10B2 0x____   (VAR)   : plotter_Y_coord
  .dhw 0x0000 # 0x10B3 0x0000
  .dhw 0x0000 # 0x10B4 0x0000
  .dhw 0x0008 # 0x10B5 0x0008   DUP   : (plot_IO)  ( plot_code -- )
  .dhw 0x____ # 0x10B6 0x____   +X_const
  .dhw 0x0002 # 0x10B7 0x0002   &
  .dhw 0x____ # 0x10B8 0x____   (BRZ)
  .dhw 0x10BC # 0x10B9 0x10BC
  .dhw 0x____ # 0x10BA 0x____   plotter_X_coord
  .dhw 0x____ # 0x10BB 0x____   1+D!
  .dhw 0x0008 # 0x10BC 0x0008   DUP
  .dhw 0x____ # 0x10BD 0x____   -X_const
  .dhw 0x0002 # 0x10BE 0x0002   &
  .dhw 0x____ # 0x10BF 0x____   (BRZ)
  .dhw 0x10C3 # 0x10C0 0x10C3
  .dhw 0x____ # 0x10C1 0x____   plotter_X_coord
  .dhw 0x____ # 0x10C2 0x____   1-D!
  .dhw 0x0008 # 0x10C3 0x0008   DUP
  .dhw 0x____ # 0x10C4 0x____   +Y_const
  .dhw 0x0002 # 0x10C5 0x0002   &
  .dhw 0x____ # 0x10C6 0x____   (BRZ)
  .dhw 0x10CA # 0x10C7 0x10CA
  .dhw 0x____ # 0x10C8 0x____   plotter_Y_coord
  .dhw 0x____ # 0x10C9 0x____   1+D!
  .dhw 0x0008 # 0x10CA 0x0008   DUP
  .dhw 0x____ # 0x10CB 0x____   -Y_const
  .dhw 0x0002 # 0x10CC 0x0002   &
  .dhw 0x____ # 0x10CD 0x____   (BRZ)
  .dhw 0x10D1 # 0x10CE 0x10D1
  .dhw 0x____ # 0x10CF 0x____   plotter_Y_coord
  .dhw 0x____ # 0x10D0 0x____   1-D!
  .dhw 0x0008 # 0x10D1 0x0008   DUP
  .dhw 0x____ # 0x10D2 0x____   lower_pen_const
  .dhw 0x0002 # 0x10D3 0x0002   &
  .dhw 0x____ # 0x10D4 0x____   (BRZ)
  .dhw 0x10D9 # 0x10D5 0x10D9
  .dhw 0x____ # 0x10D6 0x____   TRUE
  .dhw 0x____ # 0x10D7 0x____   pen_state
  .dhw 0x0007 # 0x10D8 0x0007   !
  .dhw 0x0008 # 0x10D9 0x0008   DUP
  .dhw 0x____ # 0x10DA 0x____   raise_pen_const
  .dhw 0x0002 # 0x10DB 0x0002   &
  .dhw 0x____ # 0x10DC 0x____   (BRZ)
  .dhw 0x10E1 # 0x10DD 0x10E1
  .dhw 0x____ # 0x10DE 0x____   FALSE
  .dhw 0x____ # 0x10DF 0x____   pen_state
  .dhw 0x0007 # 0x10E0 0x0007   !
  .dhw 0x____ # 0x10E1 0x____   plotter_X_coord
  .dhw 0x____ # 0x10E2 0x____   D@
  .dhw 0x____ # 0x10E3 0x____   min_X_coord
  .dhw 0x____ # 0x10E4 0x____   D@
  .dhw 0x____ # 0x10E5 0x____   max_X_coord
  .dhw 0x____ # 0x10E6 0x____   D@
  .dhw 0x____ # 0x10E7 0x____   WITHIN_D
  .dhw 0x____ # 0x10E8 0x____   plotter_Y_coord
  .dhw 0x____ # 0x10E9 0x____   D@
  .dhw 0x____ # 0x10EA 0x____   min_Y_coord
  .dhw 0x____ # 0x10EB 0x____   D@
  .dhw 0x____ # 0x10EC 0x____   max_Y_coord
  .dhw 0x____ # 0x10ED 0x____   D@
  .dhw 0x____ # 0x10EE 0x____   WITHIN_D
  .dhw 0x0002 # 0x10EF 0x0002   &
  .dhw 0x____ # 0x10F0 0x____   (BRZ)
  .dhw 0x____ # 0x10F1 0x____   (DROP) galli?
  .dhw 0x____ # 0x10F2 0x____   ((plot_IO))
  .dhw 0x000F # 0x10F3 0x000F   EXIT
  .dhw 0x____ # 0x10F4 0x____   (CONST)   : 38_const
  .dhw 0x0026 # 0x10F5 0x0026   38
  .dhw 0x____ # 0x10F6 0x____   38_const  : 0.4mm
  .dhw 0x000C # 0x10F7 0x000C   >R
  .dhw 0x____ # 0x10F8 0x____   repeat_last_pen_act
  .dhw 0x____ # 0x10F9 0x____   (NEXT)
  .dhw 0x10F8 # 0x10FA 0x10F8
  .dhw 0x000F # 0x10FB 0x000F   EXIT
  .dhw 0x000A # 0x10FC 0x000A   SWAP   : BIT@ ( cell_addr bitnr -- flag )
  .dhw 0x0006 # 0x10FD 0x0006   @       ( bitnr cell )
  .dhw 0x000A # 0x10FE 0x000A   SWAP    ( cell bitnr )
  .dhw 0x____ # 0x10FF 0x____   <<      ( cell )
  .dhw 0x____ # 0x1100 0x____   0x8000_const
  .dhw 0x0002 # 0x1101 0x0002   &
  .dhw 0x____ # 0x1102 0x____   (JMP)
  .dhw 0x____ # 0x1103 0x____   CLEANBOOL

  
  .dhw 0x000D # 0x1104 0x000D   R>   : (bitmap)
  .dhw 0x0008 # 0x1105 0x0008   DUP     ( raddr raddr )
  .dhw 0x0008 # 0x1106
  .dhw 0x0006 # 0x1107 0x0006   @       ( raddr raddr width&height )
  .dhw 0x000A # 0x1108 0x000A   SWAP    ( raddr width&height raddr )
  .dhw 0x____ # 0x1109 0x____   OVER    ( raddr width&height raddr width&height )
  .dhw 0x0008 # 0x110A 0x0008   DUP     ( raddr width&height raddr width&height width&height )
  .dhw 0x____ # 0x110B 0x____   8<<>    ( raddr width&height raddr width&height height&width )
  .dhw 0x____ # 0x110C 0x____   0xFF&   ( raddr width&height raddr width&height width )
  .dhw 0x000A # 0x110D 0x000A   SWAP    ( raddr width&height raddr width width&height )
  .dhw 0x____ # 0x110E 0x____   0xFF&   ( raddr width&height raddr width height )
  .dhw 0x____ # 0x110F 0x____   *       ( raddr width&height raddr offset )
  .dhw 0x____ # 0x1110 0x____   4>>
  .dhw 0x0001 # 0x1111 0x0001   +       ( raddr width&height raddr+offset )
  .dhw 0x0005 # 0x1112 0x0005   1+      ( raddr width&height raddr+offset+1 )
  .dhw 0x000D # 0x1113 0x000D   >R      ( raddr width&height ) R:( raddr' )
  .dhw 0x0008 # 0x1114 0x0008   DUP     ( raddr width&height width&height )
  .dhw 0x____ # 0x1115 0x____   0xFF&   ( raddr width&height height )
  .dhw 0x000D # 0x1116 0x000D   >R      ( raddr width&height ) R:( raddr' height )
  .dhw 0x____ # 0x1117 0x____   8<<>    ( raddr height&width ) R:( raddr' height )
  .dhw 0x____ # 0x1118 0x____   0xFF&   ( raddr width ) R:( raddr' height )
  .dhw 0x000A # 0x1119 0x000A   SWAP    ( width raddr ) R:( raddr' height )
  .dhw 0x0005 # 0x111A 0x0005   1+      ( width raddr+1 ) R:( raddr' height )
  .dhw 0x____ # 0x111B 0x____   0_const ( width addr bitnr ) R:( raddr' height )
  .dhw 0x____ # 0x111C 0x____   (JMP)
  .dhw 0x1140 # 0x111D 0x1140
  .dhw 0x____ # 0x111E 0x____   ROT     ( addr bitnr width ) R:( raddr' height )
  .dhw 0x0008 # 0x111F 0x0008   DUP
  .dhw 0x000C # 0x1120 0x000C   >R
  .dhw 0x____ # 0x1121 0x____   -ROT    ( width addr bitnr ) R:( raddr' height width )
  .dhw 0x____ # 0x1122 0x____   (JMP)
  .dhw 0x112D # 0x1123 0x112D
  .dhw 0x____ # 0x1124 0x____   2DUP    ( w a b a b ) R:( raddr' height width )
  .dhw 0x____ # 0x1125 0x____   BIT@    ( w a b flag )
  .dhw 0x____ # 0x1126 0x____   (BRZ)   ( w a b )
  .dhw 0x112A # 0x1127 0x112A
  .dhw 0x____ # 0x1128 0x____   pen_down
  .dhw 0x____ # 0x1129 0x____   pen_up
  .dhw 0x____ # 0x112A 0x____   pen_forward
  .dhw 0x____ # 0x112B 0x____   0.4mm
  .dhw 0x____ # 0x112C 0x____   BIT_+   ( width addr' bitnr' ) R:( raddr' height width )
  .dhw 0x____ # 0x112D 0x____   (NEXT)
  .dhw 0x1124 # 0x112E 0x1124
  .dhw 0x____ # 0x112F 0x____   turn_right
  .dhw 0x____ # 0x1130 0x____   turn_right
  .dhw 0x____ # 0x1131 0x____   ROT     ( addr' bitnr' width ) R:( raddr' height )
  .dhw 0x0008 # 0x1132 0x0008   DUP
  .dhw 0x000C # 0x1133 0x000C   >R
  .dhw 0x____ # 0x1134 0x____   -ROT
  .dhw 0x____ # 0x1135 0x____   (JMP)
  .dhw 0x1139 # 0x1136 0x1139
  .dhw 0x____ # 0x1137 0x____   pen_forward
  .dhw 0x____ # 0x1138 0x____   0.4mm
  .dhw 0x____ # 0x1139 0x____   (NEXT)
  .dhw 0x1137 # 0x113A 0x1137
  .dhw 0x____ # 0x113B 0x____   turn_left
  .dhw 0x____ # 0x113C 0x____   pen_forward
  .dhw 0x____ # 0x113D 0x____   0.4mm
  .dhw 0x____ # 0x113E 0x____   turn_left
  .dhw 0x____ # 0x1140 0x____   (NEXT)
  .dhw 0x111E # 0x1141 0x111E
  .dhw 0x0009 # 0x1142 0x0009   DROP
  .dhw 0x0009 # 0x1143 0x0009   DROP
  .dhw 0x0009 # 0x1144 0x0009   DROP
  .dhw 0x000F # 0x1145 0x000F   EXIT
  .dhw 0x0005 # 0x1146 0x0005   1+   : BIT_+ ( addr bitnr -- addr' bitnr' )
  .dhw 0x0008 # 0x1147 0x0008   DUP
  .dhw 0x____ # 0x1148 0x____   16_const
  .dhw 0x____ # 0x1149 0x____   =
  .dhw 0x____ # 0x114A 0x____   (BRZ)
  .dhw 0x114F # 0x114B 0x114F
  .dhw 0x0009 # 0x114C 0x____   DROP
  .dhw 0x0005 # 0x114D 0x0005   1+
  .dhw 0x____ # 0x114E 0x____   0_const
  .dhw 0x000F # 0x114F 0x000F   EXIT
  
  .undef 《NO_SYM_LOOKUP》
`;
export { src };








