// References:
//   https://konilo.org/ilo.txt
//   https://9fans.github.io/plan9port/man/man4/9pfuse.html
//   https://9fans.github.io/plan9port/man/man9/intro.html
//   9p tcp and udp portnr 564
//   https://github.com/zzJinux/simpletun/blob/master/simpletun.c
//     2 bytes length (big endian)
//     length bytes raw IP packet
const src = `
  .def ilo_no  0x00
  .def ilo_li  0x01  # literal
  .def ilo_du  0x02  # duplicate
  .def ilo_dr  0x03  # drop
  .def ilo_sw  0x04  # swap
  .def ilo_pu  0x05  # >R
  .def ilo_po  0x06  # R>
  .def ilo_ju  0x07  # jump
  .def ilo_ca  0x08  # call
  .def ilo_cc  0x09  # conditional call
  .def ilo_cj  0x0A  # conditional jump
  .def ilo_re  0x0B  # return
  .def ilo_eq  0x0C  # compare two values for equality.   a == b
  .def ilo_ne  0x0D  # compare two values for inequality. a != b
  .def ilo_lt  0x0E  # compare two values for less than.  a < b 
  .def ilo_gt  0x0F  # compare two values for greater than. a > b
  .def ilo_fe  0x10  # fetch a stored value in memory
  .def ilo_st  0x11  # store a value into memory 
  .def ilo_ad  0x12  # add two numbers. a + b
  .def ilo_su  0x13  # subtract two numbers. a - b  
  .def ilo_mu  0x14  # multiply two numbers. a * b 
  .def ilo_di  0x15  # divide and get remainder. a % b, a / b 
  .def ilo_an  0x16  # bitwise and 
  .def ilo_or  0x17  # bitwise or
  .def ilo_xo  0x18  # bitwise xor
  .def ilo_sl  0x19  # shift left. a << b
  .def ilo_sr  0x1A  # shift right. a >> b 
  .def ilo_cp  0x1B  # compare two memory regions 
  .def ilo_cy  0x1C  # copy memory
  .def ilo_io  0x1D  # perform i/o operation

  .def_calc ilo_licanono ilo_li ilo_ca 8 << ilo_no 16 << ilo_no 24 << | | |
  .def_calc ilo_fefenono ilo_fe ilo_fe 8 << ilo_no 16 << ilo_no 24 << | | |
  .def_calc ilo_dufeliad ilo_du ilo_fe 8 << ilo_li 16 << ilo_ad 24 << | | |
  .def_calc ilo_swstduli ilo_sw ilo_st 8 << ilo_du 16 << ilo_li 24 << | | |
  .def_calc ilo_annolicj ilo_an ilo_no 8 << ilo_li 16 << ilo_cj 24 << | | |
  .def_calc ilo_lianlica ilo_li ilo_an 8 << ilo_li 16 << ilo_ca 24 << | | |
  .def_calc ilo_adfejuno ilo_ad ilo_fe 8 << ilo_ju 16 << ilo_no 24 << | | |
  .def_calc ilo_dufelica ilo_du ilo_fe 8 << ilo_li 16 << ilo_ca 24 << | | |
  .def_calc ilo_stlijuno ilo_st ilo_li 8 << ilo_ju 16 << ilo_no 24 << | | |
  .def_calc ilo_poliadre ilo_po ilo_li 8 << ilo_ad 16 << ilo_re 24 << | | |
  .def_calc ilo_adnoliju ilo_ad ilo_no 8 << ilo_li 16 << ilo_ju 24 << | | |
  .def_calc ilo_annoliju ilo_an ilo_no 8 << ilo_li 16 << ilo_ju 24 << | | |
  .def_calc ilo_xonoliju ilo_xo ilo_no 8 << ilo_li 16 << ilo_ju 24 << | | |
  .def_calc ilo_dulislli ilo_du ilo_li 8 << ilo_sl 16 << ilo_li 24 << | | |
  .def_calc ilo_srorliju ilo_sr ilo_or 8 << ilo_li 16 << ilo_ju 24 << | | |
  .def_calc ilo_liadliju ilo_li ilo_ad 8 << ilo_li 16 << ilo_ju 24 << | | |
  .def_calc ilo_fenoliju ilo_fe ilo_no 8 << ilo_li 16 << ilo_ju 24 << | | |
  .def_calc ilo_stnoliju ilo_st ilo_no 8 << ilo_li 16 << ilo_ju 24 << | | |
  .def_calc ilo_dunoliju ilo_du ilo_no 8 << ilo_li 16 << ilo_ju 24 << | | |
  .def_calc ilo_drnoliju ilo_dr ilo_no 8 << ilo_li 16 << ilo_ju 24 << | | |
  .def_calc ilo_swnoliju ilo_sw ilo_no 8 << ilo_li 16 << ilo_ju 24 << | | |
  .def_calc ilo_licjnono ilo_li ilo_cj 8 << ilo_no 16 << ilo_no 24 << | | |
  .def_calc ilo_swstliju ilo_sw ilo_st 8 << ilo_li 16 << ilo_ju 24 << | | |
  .def_calc ilo_punoliju ilo_pu ilo_no 8 << ilo_li 16 << ilo_ju 24 << | | |
  .def_calc ilo_ponoliju ilo_po ilo_no 8 << ilo_li 16 << ilo_ju 24 << | | |
  .def_calc ilo_poliadfe ilo_po ilo_li 8 << ilo_ad 16 << ilo_fe 24 << | | |
  .def_calc ilo_renonono ilo_re ilo_no 8 << ilo_no 16 << ilo_no 24 << | | |
  .def_calc ilo_dulieqno ilo_du ilo_li 8 << ilo_eq 16 << ilo_no 24 << | | |
  .def_calc ilo_licjnono ilo_li ilo_cj 8 << ilo_no 16 << ilo_no 24 << | | |
  .def_calc ilo_junonono ilo_ju ilo_no 8 << ilo_no 16 << ilo_no 24 << | | |

  : FCPU32_ilo_dispatch
  # the $NEXT
  .dw_le ilo_licanono 
  .dw_le FCPU32_ilo_IP  # ( addr )
  .dw_le ilo_fefenono   # ( fcpu32_instr )
  .dw_le ilo_licanono
  .dw_le FCPU32_ilo_IP  # ( fcpu32_instr addr )
  .dw_le ilo_dufeliad   # ( fcpu32_instr addr IP+1 )
  .dw_le 0x00000001
  .dw_le ilo_swstduli   # ( fcpu32_instr fcpu32_instr 0xFFFFFFF0 )
  .dw_le 0xFFFFFFF0
  .dw_le ilo_annolicj   # ( fcpu32_instr )
  .dw_le FCPU32_ilo_call
  .dw_le ilo_lianlica
  .dw_le 0x0000000F
  .dw_le FCPU32_ilo_dispatch_table
  .dw_le ilo_adfejuno   # ( )
  : FCPU32_ilo_call
  # ( fcpu32_instr )
  .dw_le ilo_licanono
  .dw_le FCPU32_ilo_IP
  .dw_le ilo_dufelica
  .dw_le FCPU32_ilo_PUSH2RS
  .dw_le ilo_stlijuno
  .dw_le FCPU32_ilo_dispatch

  : FCPU32_ilo_(VAR)
  .dw_le ilo_poliadre   # ( -- vaddr )
  .dw_le 0x00000001

  : FCPU32_ilo_(CONST)
  .dw_le ilo_poliadfe
  .dw_le 0x00000001
  .dw_le ilo_renonono

  : FCPU32_ilo_dispatch_table
  .dw_le ilo_licanono
  .dw_le FCPU32_ilo_(VAR)
  .dw_le FCPU32_ilo_dispatch  # NOP
  .dw_le FCPU32_ilo_PLUS
  .dw_le FCPU32_ilo_AND
  .dw_le FCPU32_ilo_XOR
  .dw_le FCPU32_ilo_ONELBR
  .dw_le FCPU32_ilo_INCR
  .dw_le FCPU32_ilo_FETCH
  .dw_le FCPU32_ilo_STORE
  .dw_le FCPU32_ilo_DUP
  .dw_le FCPU32_ilo_DROP
  .dw_le FCPU32_ilo_SWAP
  .dw_le FCPU32_ilo_SKZ
  .dw_le FCPU32_ilo_TO_R
  .dw_le FCPU32_ilo_R_FROM
  .dw_le FCPU32_ilo_EXT
  .dw_le FCPU32_ilo_EXIT

  : FCPU32_ilo_PLUS
  .dw_le ilo_adnoliju
  .dw_le FCPU32_ilo_dispatch

  : FCPU32_ilo_AND
  .dw_le ilo_annoliju
  .dw_le FCPU32_ilo_dispatch

  : FCPU32_ilo_XOR
  .dw_le ilo_xonoliju
  .dw_le FCPU32_ilo_dispatch

  : FCPU32_ilo_ONELBR
  .dw_le ilo_dulislli
  .dw_le 0x00000001
  .dw_le 0x0000001F
  .dw_le ilo_srorliju
  .dw_le FCPU32_ilo_dispatch

  : FCPU32_ilo_INCR
  .dw_le ilo_liadliju
  .dw_le 0x0000001
  .dw_le FCPU32_ilo_dispatch

  : FCPU32_ilo_FETCH
  .dw_le ilo_fenoliju
  .dw_le FCPU32_ilo_dispatch

  : FCPU32_ilo_STORE
  .dw_le ilo_stnoliju
  .dw_le FCPU32_ilo_dispatch

  : FCPU32_ilo_DUP
  .dw_le ilo_dunoliju
  .dw_le FCPU32_ilo_dispatch

  : FCPU32_ilo_DROP
  .dw_le ilo_drnoliju
  .dw_le FCPU32_ilo_dispatch

  : FCPU32_ilo_SWAP
  .dw_le ilo_swnoliju
  .dw_le FCPU32_ilo_dispatch

  : FCPU32_ilo_SKZ
  .dw_le ilo_licjnono
  .dw_le FCPU32_ilo_dispatch
  .dw_le FCPU32_ilo_IP  #
  .dw_le ilo_dufeliad   #
  .dw_le 0x00000001
  .dw_le ilo_swstliju
  .dw_le FCPU32_ilo_dispatch

  : FCPU32_ilo_TO_R
  .dw_le ilo_punoliju
  .dw_le FCPU32_ilo_dispatch

  : FCPU32_ilo_R_FROM
  .dw_le ilo_ponoliju
  .dw_le FCPU32_ilo_dispatch

  : FCPU32_ilo_(ILO)_marker
  .dw_le ilo_licanono
  .dw_le FCPU32_ilo_(CONST)
  .utf8 "ILO "
  
  : FCPU32_ilo_EXT
  # ( ... extnr -- ... )
  .dw_le ilo_dulieqno
  .utf8 "ILO "
  .dw_le ilo_licjnono
  .dw_le FCPU32_ilo_EXT_jump_into_ilo_code
  .dw_le ilo_dulieqno
  .dw_le 0x00000001
  .dw_le ilo_licjnono
  .dw_le FCPU32_ilo_EXT_TX!
  .dw_le ilo_dulieqno
  .dw_le 0x00000002
  .dw_le ilo_licjnono
  .dw_le FCPU32_ilo_EXT_?RX
  .dw_le ilo_licanono
  .dw_le FCPU32_ilo_EXT_handler_vector
  .dw_le ilo_junonono

  : FCPU32_ilo_EXT_handler_vector
  .dw_le ilo_licanono
  .dw_le FCPU32_ilo_(CONST)
  .dw_le FCPU32_ilo_EXT_handler_vector_addr
`;
