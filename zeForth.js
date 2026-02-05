const src = `

  # looks like its save to start here in main storage
  .org 0x2000
  : __start
  .dhw 0x1788        # XR  GR8, GR8              gr8 := 0
  .dhw 0x4188 0x0200 # LA  GR8, 0x200 (GR8, 0)   gr8 := 0x200
  .dhw 0x8980 0x0004 # SLL GR8, 0x004            gr8 := gr8 << 4
  : NXT
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
                     # PLUS:
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11             tmp2 := memory[datastack_ptr]
  .dhw 0x1E12        # ALR GR1, GR2              tmp1 := (tmp1 + tmp2) & 0xFFFFFFFF
  .org 0x2052
                     # COMMON_TAIL1:
  .dhw 0x501B 0x0000 # ST GR1,  0x000 (GR11, 0)  memory[datastack_ptr] := tmp1
  .dhw 0x41BB 0x0004 # LA GR11, 0x004 (GR11, 0)  datastack_ptr := datastack_ptr + 4
  .dhw 0x47F0 0x800A # BC 0xF,  0x00A (0, GR8)   jump to NXT

  : (AND)
  .dhw (ibmz)
                     # AND:
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11             tmp2 := memory[datastack_ptr]
  .dhw 0x1412        # NR GR1,  GR2              tmp1 := tmp1 & tmp2
  .dhw 0x47F0 0x8052 # BC 0xF,  0x052 (0, GR8)   jump to COMMON_TAIL1

  : (XOR)
  .dhw (ibmz)
                     # XOR:
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11             tmp2 := memory[datastack_ptr]
  .dhw 0x1712        # XR GR1,  GR2              tmp1 := tmp1 ^ tmp2
  .dhw 0x47F0 0x8052 # BC 0xF,  0x052 (0, GR8)   jump to COMMON_TAIL1

  : (1LBR)
  .dhw (ibmz)
                     # ONELBR:
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
                     # INCR:
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x4111 0x0001 # LA GR1,  0x001 (GR1, 0)   tmp1 := tmp1 + 1
  .dhw 0x47F0 0x8052 # BC 0xF,  0x052 (0, GR8)   jump to COMMON_TAIL1

  : (@)
  .dhw (ibmz)
                     # FETCH:
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11             tmp2 := memory[datastack_ptr]
  .dhw 0x1812        # LR GR1,  GR2              tmp1 := memory[tmp2]
  .dhw 0x47F0 0x8052 # BC 0xF,  0x052 (0, GR8)   jump to COMMON_TAIL1

  : (!)
  .dhw (ibmz)
                     # STORE:
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x182B        # LR GR2,  GR11             tmp2 := memory[datastack_ptr]
  .dhw 0x5021 0x0000 # ST GR2,  0x000 (GR1, 0)   memory[tmp1] := tmp2
  .dhw 0x47F0 0x800A # BC 0xF,  0x00A (0, GR8)   jump to NXT

  : (DUP)
  .dhw (ibmz)
                     # DUP:
  .dhw 0x5FB0 0x82F0 # SL GR11, 0x2F0 (0, GR8)   datastack_ptr := datastack_ptr - 4
  .dhw 0x181B        # LR GR1,  GR11             tmp1 := memory[datastack_ptr]
  .dhw 0x41BB 0x0004 # LA GR11, 0x004 (GR11, 0)  datastack_ptr := datastack_ptr + 4
  .dhw 0x47F0 0x8052 # BC 0xF,  0x052 (0, GR8)   jump to COMMON_TAIL1

`
const img = new Map();
assemble({ src, img });

