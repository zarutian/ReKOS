const src = `

  # looks like its save to start here in main storage
  .org 0x2000
  : __start
  .dhw 0x1788        # XR  GR8, GR8              gr8 := 0
  .dhw 0x4188 0x0200 # LA  GR8, 0x200 (GR8, 0)   gr8 := 0x200
  .dhw 0x8980 0x0004 # SLL GR8, 0x004            gr8 := gr8 << 4
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
  .dhw 0x47F0 0x8000 # BC 0xF,  0x000 (0, GR8)   jump to NXT
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
  .dhw 0x4770 0x8160 # BC 0x7,  0x160 (0, GR8)    if tmp1 != 'KK' then jump to ext_trapvectoring
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
  : COMMON_TAIL3_ibmz
  .dhw 0x502B 0x0000 # ST GR2,  0x000 (GR11, 0)   memory[datastack_ptr] := tmp2    reminder or upper half of product
  .dhw 0x41BB 0x0004 # LA GR11, 0x004 (GR11, 0)   datastack_ptr := datastack_ptr + 4
  .dhw 0x503B 0x0000 # ST GR3,  0x000 (GR11, 0)   memory[datastack_ptr] := tmp3    quotent  or lower half of product
  .dhw 0x41BB 0x0004 # LA GR11, 0x004 (GR11, 0)   datastack_ptr := datastack_ptr + 4
  .dhw 0x47F0 0x800A # BC 0xF,  0x00A (0, GR8)    jump to NXT

`
export { src };

