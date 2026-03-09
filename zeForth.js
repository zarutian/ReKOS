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

export { src };

