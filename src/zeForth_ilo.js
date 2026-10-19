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
  .def_calc ilo_drliiono ilo_dr ilo_li 8 << ilo_io 16 << ilo_no 24 << | | |
  .def_calc ilo_lijunono ilo_li ilo_ju 8 << ilo_no 16 << ilo_no 24 << | | |
  .def_calc ilo_lilijuno ilo_li ilo_li 8 << ilo_ju 16 << ilo_no 24 << | | |

  : FCPU32_ilo_dispatch
  # the $NEXT
  .dw_le ilo_licanono 
  .dw_le FCPU32_ilo_IP  # ( addr )
  .dw_le ilo_fenolica   # ( fcpu32_instr )
  .dw_le FCPU32_ilo_fetch_instr
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

  : FCPU32_ilo_OVER
  # ( a b -- a b a )
  # SWAP ( b a )
  # DUP  ( b a a )
  # >R   ( b a ) R:( a )
  # SWAP ( a b ) R:( a )
  # R>   ( a b a ) R:( )
  # EXIT
  .dw_le ilo_swdupusw
  .dw_le ilo_porenono

  : FCPU32_ilo_2DUP
  # ( a b -- a b a b )
  .dw_le ilo_licanono
  .dw_le FCPU32_ilo_OVER
  .dw_le ilo_licanono
  .dw_le FCPU32_ilo_OVER
  .dw_le ilo_renonono

  : FCPU32_ilo_NIP
  # ( a b -- b )
  .dw_le ilo_swdrnore

  : FCPU32_ilo_R2nd@
  # ( -- a ) R:( a b ra -- a b )
  .dw_le ilo_popopodu  # ( ra b a a )
  .dw_le ilo_puswpusw  # ( ra a ) R:( a b )

  : FCPU32_ilo_(NEXT)
  # ( -- ) R:( count ra )
  # R>     ( ra )
  # R>     ( ra count )
  # DUP    ( ra count count )
  # BRZ    ( ra count )
  # (NEXT)_L0
  # 1-     ( ra count-1 )
  # >R     ( ra ) R:( count-1 )
  # @      ( dest )
  # >R     ( ) R:( count-1 dest )
  # EXIT
  # : (NEXT)_L0
  # DROP   ( ra )
  # 1+     ( ra+1 )
  # >R
  # EXIT
  .dw_le ilo_popoduno         # ( ra-1 count count )
  .dw_le ilo_lieqlicj         # ( ra-1 count )
  .dw_le 0x00000000
  .dw_le FCPU32_ilo_(NEXT)_L0
  .dw_le ilo_lisupuno         # ( ra-1 ) R:( count-1 )
  .dw_le 0x00000001
  .dw_le ilo_liadfeli         # ( dest 1 )
  .dw_le 0x00000001
  .dw_le 0x00000001
  .dw_le ilo_supureno
  : FCPU32_ilo_(NEXT)_L0
  .dw_le ilo_drliadpu        # ( ) R:( ra+1 )
  .dw_le 0x00000002

  : FCPU32_ilo_-ROT
  # ( a b c -- c a b )
  .dw_le ilo_swpuswpo        # ( c a b )
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

  : FCPU32_ilo_fetch_instr
  .dw_le ilo_fenonore

  : FCPU32_ilo_FETCH
  .dw_le ilo_fenoliju
  .dw_le FCPU32_ilo_dispatch

  : FCPU32_ilo_STORE
  .dw_le ilo_stnoliju
  .dw_le FCPU32_ilo_dispatch

  # Entry:
  #    3         2         1
  #   10987654321098765432109876543210
  # 1 D             xxxxxx      xxxxxx
  #   I               P   xxxxxx  N
  #   R               A     P     E
  #   T               G     R     X
  #   Y               E     E     T
  #                         V
  # 2 blocknr
  : FCPU32_ilo_MEMLRU_getKeyOfEntry
  # ( ptr -- entry.key )
  .dw_le ilo_liadfere
  .dw_le 0x0000001

  : FCPU32_ilo_MEMLRU_getNextOfEntry
  # ( ptr -- next_ptr )
  .dw_le ilo_felianno
  .dw_le 0x0000003F
  .dw_le ilo_licanono
  .dw_le FCPU32_ilo_MEMLRU_base_addr
  .dw_le ilo_adrenono

  : FCPU32_ilo_MEMLRU_getPrevOfEntry
  # ( ptr -- prev_ptr )
  .dw_le ilo_felisrno
  .dw_le 0x00000006
  .dw_le ilo_liannono
  .dw_le 0x0000003F
  .dw_le ilo_licanono
  .dw_le FCPU32_ilo_MEMLRU_base_addr
  .dw_le ilo_adrenono

  : FCPU32_ilo_MEMLRU_getPageOfEntry
  # ( ptr -- pagenr )
  .dw_le ilo_felisrno
  .dw_le 0x0000000C    # 12
  .dw_le ilo_liadreno
  .dw_le 0x0000003F

  : FCPU32_ilo_MEMLRU_getDirtyOfEntry
  # ( ptr -- dirty )
  .dw_le ilo_felisrno
  .dw_le 0x0000001F
  .dw_le ilo_liadreno
  .dw_le 0x00000001

  : FCPU32_ilo_MEMLRU_access
  # ( dirty? blocknr -- base_addr )
  .dw_le ilo_licanono  # ( dirty? blocknr vaddr )
  .dw_le FCPU32_ilo_MEMLRU_head
  : FCPU32_ilo_MEMLRU_access_L0
  .dw_le ilo_feswnono
  .dw_le ilo_licanono  # ( dirty? ptr2blockEntry blocknr ptr2blockEntry )
  .dw_le FCPU32_ilo_OVER
  .dw_le ilo_licanono  # ( dirty? ptr2blockEntry blocknr entry.key )
  .dw_le FCPU32_ilo_MEMLRU_getKeyOfEntry
  .dw_le ilo_licanono  # ( dirty? ptr2blockEntry blocknr entry.key blocknr )
  .dw_le FCPU32_ilo_OVER
  .dw_le ilo_eqlicjno  # ( dirty? ptr2blockEntry blocknr )
  .dw_le FCPU32_ilo_MEMLRU_access_L2
  # this entry isnt it.
  .dw_le ilo_swdulica  # ( dirty? blocknr ptr next )
  .dw_le FCPU32_ilo_MEMLRU_getNextOfEntry
  .dw_le ilo_dulieqno  # ( dirty? blocknr ptr next bool )
  .dw_le 0x00000000
  .dw_le ilo_licjnono  # ( dirty? blocknr ptr next )
  .dw_le FCPU32_ilo_MEMLRU_access_L1
  .dw_le ilo_swdrswno
  .dw_le ilo_lijunono
  .dw_le FCPU32_ilo_MEMLRU_access_L0
  : FCPU32_ilo_MEMLRU_access_L1
  # entry not found for blocknr
  .dw_le ilo_drdulica  # ( dirty? blocknr ptr entry.dirty )
  .dw_le FCPU32_ilo_MEMLRU_getDirtyOfEntry
  .dw_le ilo_lieqlicj  # ( dirty? blocknr ptr )
  .dw_le 0x00000000
  .dw_le FCPU32_ilo_MEMLRU_access_L1_0
  .dw_le ilo_dulicano  # ( dirty? blocknr ptr )
  .dw_le FCPU32_ilo_MEMLRU_clean_entry
  : FCPU32_ilo_MEMLRU_access_L1_0
  
  : FCPU32_ilo_MEMLRU_access_L2
  # entry     found for blocknr


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
  .dw_le ilo_felijuno
  .dw_le FCPU32_ilo_call

  : FCPU32_ilo_EXT_TX!
  # ( byte ext -- )
  .dw_le ilo_drliiono
  .dw_le 0x00000000
  .dw_le ilo_lijunono
  .dw_le FCPU32_ilo_dispatch

  : FCPU32_ilo_EXT_?RX
  # ( ext -- byte true )
  .dw_le ilo_drliiono
  .dw_le 0x00000001
  .dw_le ilo_lilijuno
  .dw_le 0xFFFFFFFF
  .dw_le FCPU32_ilo_dispatch

  : FCPU32_ilo_EXT_handler_vector
  .dw_le ilo_licanono
  .dw_le FCPU32_ilo_(CONST)
  .dw_le FCPU32_ilo_EXT_handler_vector_addr

  : FCPU32_ilo_save_stacks
  # ( ... addr -- addr+n ) R:( ... -- )
  # saves data stack then return stack
  .dw_le ilo_liiopuli  # ( ... addr ds_depth 1 ) R:( ... rs_depth )
  .dw_le 0x00000007
  .dw_le 0x00000001
  .dw_le ilo_sudupuno  # ( ... addr ds_depth-1 ) R:( ... rs_depth ds_depth-1 )
  .dw_le ilo_licanono  # ( ... addr ds_depth-1 addr ) R:( ... rs_depth ds_depth-1 )
  .dw_le FCPU32_ilo_OVER
  .dw_le ilo_stliadno  # ( ... addr+1 ) R:( ... rs_depth ds_depth-1 )
  .dw_le ilo_lijunono
  .dw_le FCPU32_ilo_save_stacks_L1
  : FCPU32_ilo_save_stacks_L0
  .dw_le ilo_licanono  # ( ... item addr item addr ) R:( ... rs_depth count )
  .dw_le FCPU32_ilo_2DUP
  .dw_le ilo_stliadno  # ( ... item addr+1 ) R:( ... rs_depth count )
  .dw_le ilo_licanono  # ( ... addr+1 ) R:( ... rs_depth count )
  .dw_le FCPU32_ilo_NIP
  : FCPU32_ilo_save_stacks_L1
  .dw_le ilo_licanono  #
  .dw_le FCPU32_ilo_(NEXT)
  .dw_le FCPU32_ilo_save_stacks_L0
  .dw_le ilo_polisupo  # ( addr+n rs_depth-1 ra ) R:( ... )
  .dw_le 0x00000001
  .dw_le ilo_licanono  # ( ra addr+n rs_depth-1 ) R:( ... )
  .dw_le FCPU32_ilo_-ROT
  .dw_le ilo_swlicano  # ( ra rs_depth-1 addr+n rs_depth-1 addr+n ) R:( ... )
  .dw_le FCPU32_ilo_2DUP
  : FCPU32_ilo_save_stacks_L2
  .dw_le ilo_stliadsw  # ( ra addr+n+1 rs_depth-1 ) R:( ... )
  .dw_le 0x00000001
  .dw_le ilo_dulieqno  # ( ra addr+n+1 rs_depth-1 bool ) R:( ... )
  .dw_le 0x00000000
  .dw_le ilo_licjnono  # ( ra addr+n+1 rs_depth-1 ) R:( ... item )
  .dw_le FCPU32_ilo_save_stacks_L3
  .dw_le ilo_lisuswpo  # ( ra rs_depth-2 addr+n+1 item ) R:( ... )
  .dw_le 0x00000001
  .dw_le ilo_licanono  # ( ra rs_depth-2 addr+n+1 item addr+n+1 ) R:( ... )
  .dw_le FCPU32_ilo_OVER
  .dw_le ilo_lijunono
  .dw_le FCPU32_ilo_save_stacks_L2
  : FCPU32_ilo_save_stacks_L3
  .dw_le ilo_drswpure

  : FCPU32_ilo_restore_stacks
  # ( addr -- ... addr+n ) R:( ra -- ... ra )
  .dw_le ilo_dufepuno  # ( addr ) R:( ra ds_depth )
  .dw_le ilo_liadliju
  .dw_le 0x00000001
  .dw_le FCPU32_ilo_restore_stacks_L1
  : FCPU32_ilo_restore_stacks_L0
  .dw_le ilo_dufeswli  # ( item addr 1 ) R:( ra count )
  .dw_le 0x00000001
  .dw_le ilo_adnonono  # ( item addr+1 ) R:( ra count )
  : FCPU32_ilo_restore_stacks_L1
  .dw_le ilo_licanono
  .dw_le FCPU32_ilo_(NEXT)
  .dw_le FCPU32_ilo_restore_stacks_L0
  .dw_le ilo_poswdufe  # ( ... ra addr+1 rs_depth ) R:( )
  .dw_le ilo_swliadsw  # ( ... ra addr+2 rs_depth ) R:( )
  .dw_le 0x00000001
  : FCPU32_ilo_restore_stacks_L2
  .dw_le ilo_dulieqno  # ( ... ra addr+n rs_depth bool ) R:( )
  .dw_le 0x00000000
  .dw_le ilo_licjnono  # ( ... ra addr+n rs_depth ) R:( )
  .dw_le FCPU32_ilo_restore_stacks_L3
  .dw_le ilo_lisuswdu  # ( ... ra rs_depth-1 addr+n addr+n ) R:( )
  .dw_le 0x00000001
  .dw_le ilo_fepuliad  # ( ... ra rs_depth-1 addr+n+1 ) R:( item )
  .dw_le 0x00000001
  .dw_le ilo_swnoliju  # ( ... ra addr+n+1 rs_depth-1 ) R:( item )
  .dw_le FCPU32_ilo_restore_stacks_L2
  : FCPU32_ilo_restore_stacks_L3
  .dw_le ilo_drswpure

  : FCPU32_ilo_swap_endianess
  # that is betwixt little and big endian ( not a word about middle endian )
  # ( abcd -- dcba )
  .dw_le ilo_dulislsw  # ( dxxx abcd )
  .dw_le 0x00000018    # 24
  .dw_le ilo_lisrswno  # ( xabc dxxx )
  .dw_le 0x00000008    # 8
  .dw_le ilo_licanono  # ( xabc dxxx xabc )
  .dw_le FCPU32_ilo_OVER
  .dw_le ilo_lislorsw  # ( dcxx xabc )
  .dw_le 0x00000010    # 16
  .dw_le ilo_lisrswno  # ( xxab dcxx )
  .dw_le 0x00000008    # 8
  .dw_le ilo_licanono  # ( xxab dcxx xxab )
  .dw_le FCPU32_ilo_OVER
  .dw_le ilo_lislorsw  # ( dcbx xxab )
  .dw_le 0x00000008    # 8
  .dw_le ilo_lisrorre  # ( dcba )
  .dw_le 0x00000008

  : FCPU32_ilo_applyFunc_to_block
  # ( src dest len func -- )
  .dw_le ilo_pupuliju  # ( src dest ) R:( func len )
  .dw_le FCPU32_ilo_applyFunc_to_block_L1
  : FCPU32_ilo_applyFunc_to_block_L0
  .dw_le ilo_licanono  # ( src dest src ) R:( func len )
  .dw_le FCPU32_ilo_OVER
  .dw_le ilo_felicano  # ( src dest item func ) R:( func len )
  .dw_le FCPU32_ilo_R2nd@
  .dw_le ilo_canonono  # ( src dest item' ) R:( func len )
  .dw_le ilo_licanono  # ( src dest item' dest ) R:( func len )
  .dw_le FCPU32_ilo_OVER
  .dw_le ilo_stliadsw  # ( dest+1 src ) R:( func len )
  .dw_le 0x00000001
  .dw_le ilo_liadswno  # ( src+1 dest+1 ) R:( func len )
  .dw_le 0x00000001
  : FCPU32_ilo_applyFunc_to_block_L1
  .dw_le ilo_licanono
  .dw_le FCPU32_ilo_(NEXT)
  .dw_le FCPU32_ilo_applyFunc_to_block_L0
  .dw_le ilo_drdrpodr  # ( ) R:( )
  .dw_le ilo_renonono

`;
