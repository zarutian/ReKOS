const src = `
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

  :f CountLeadingOnesInByte
  # ( byte -- count )
  .dhw 0_const        # ( byte count )
  : CountLeadingOnesInByte_L0
  .dhw OVER           # ( byte count byte ) 
  .dhw 0x80&          # ( byte count bit<<7 )
  .dhw (BRZ)
  .dhw CountLeadingOnesInByte_L1
  .dhw 1+             # ( byte count+1 )
  .dhw SWAP           # ( count+1 byte )
  .dhw 1<<            # ( count+1 byte<<1 )
  .dhw SWAP           # ( byte<<1 count+1 )
  .dhw (JMP)
  .dhw CountLeadingOnesInByte_L0
  : CountLeadingOnesInByte_L1
  .dhw NIP            # ( count ) 
  .dhw EXIT

  :f utf8_codepoint_idx_2_byte_str
  # ( src_addr src_len cdpt_idx -- byte_str_addr byte_str_len )
  .dhw >R 2DUP        # ( src_addr src_len src_addr src_len ) R:( cdpt_idx )
  .dhw utf8_is_full_codepoint # ( src_addr src_len bool ) R:( cdpt_idx )
  .dhw R> SWAP        # ( src_addr src_len cdpt_idx bool ) R:( )
  .dhw INVERT (BRZ)
  .dhw utf8_codepoint_idx_2_byte_str_L0
  .dhw 3DROP 0_const DUP EXIT # src string must start with a whole code point
  : utf8_codepoint_idx_2_byte_str_L0
  .dhw >R             # ( src_addr src_len ) R:( cdpt_idx )
  : utf8_codepoint_idx_2_byte_str_L1
  .dhw >R 1_const     # ( src_addr 1 ) R:( cdpt_idx src_len )
  : utf8_codepoint_idx_2_byte_str_L2
  .dhw 2DUP           # ( src_addr len src_addr len ) R:( cdpt_idx src_len )
  .dhw utf8_is_full_codepoint # ( src_addr len bool ) R:( cdpt_idx src_len )
  .dhw INVERT
  .dhw (BRZ) utf8_codepoint_idx_2_byte_str_L3
  .dhw 1+ DUP R@      # ( src_addr len+1 len+1 src_len ) R:( cdpt_idx src_len )
  .dhw >              # ( src_addr len+1 bool ) R:( cdpt_idx src_len )
  .dhw (BRZ) utf8_codepoint_idx_2_byte_str_L2
  .dhw 2DROP R> R> 2DROP 1_const 0_const EXIT # str must end with a whole codepoint
  : utf8_codepoint_idx_2_byte_str_L3
  .dhw R> R@ 0=       # ( src_addr len src_len bool ) R:( cdpt_idx )
  .dhw (BRZ) utf8_codepoint_idx_2_byte_str_L4
  .dhw DROP R> DROP EXIT
  : utf8_codepoint_idx_2_byte_str_L4
  .dhw OVER - -ROT + SWAP # ( src_addr' src_len' ) R:( cdpt_idx )
  .dhw (NEXT) utf8_codepoint_idx_2_byte_str_L1
  .dhw 2DROP 2_const 0_const EXIT

  :f utf8_str_length_in_codepoints
  # ( addr length_in_bytes -- length_in_codepoints )
  .dhw 0_const   # ( addr blen idx )
  : utf8_str_length_in_codepoints_L0
  .dhw 3DUP      # ( addr blen idx addr blen idx )
  .dhw utf8_codepoint_idx_2_byte_str # ( addr blen idx codepoint_addr codepoint_len )
  .dhw 2DUP      # ( addr blen idx codepoint_addr codepoint_len codepoint_addr codepoint_len )
  .dhw 0= SWAP
  .dhw 0= &      # ( addr blen idx codepoint_addr codepoint_len bool )
  .dhw INVERT (BRZ) utf8_str_length_in_codepoints_L1
  .dhw 2DROP -ROT 2DROP ?1+ EXIT
  : utf8_str_length_in_codepoints_L1
  .dhw NIP SWAP >R DUP >R # ( addr blen codepoint_len ) R:( idx codepoint_len )
  .dhw - SWAP R> + SWAP   # ( addr' blen' ) R:( idx )
  .dhw DUP 0=
  .dhw (BRZ) utf8_str_length_in_codepoints_L2
  .dhw 2DROP R> 1+ EXIT
  : utf8_str_length_in_codepoints_L2
  .dhw R> (JMP) utf8_str_length_in_codepoints_L0

  :f 3DUP
  # ( a b c -- a b c a b c )
  .dhw >R    # ( a b ) R:( c )
  .dhw 2DUP  # ( a b a b ) R:( c )
  .dhw R@    # ( a b a b c ) R:( c )
  .dhw -ROT  # ( a b c a b ) R:( c )
  .dhw R>    # ( a b c a b c ) R:( )
  .dhw EXIT

  :f ?1+ ( u -- u+1 | 0 )
  .dhw DUP 0= SKZ 1+ EXIT

  # getur verið að eftirfarandi sé tvítekið og til annarstaðar? -Zarutian
  :f BYTESTR=
  # ( A_addr A_len B_addr B_len -- bool )
  # note: this timing-leaks the fact of A_len and B_len being of equal length or not
  .dhw ROT    # ( A_addr B_addr B_len A_len )
  .dhw 2DUP   #
  .dhw =      #
  .dhw INVERT #
  .dhw (BRZ) BYTESTR=_L0
  .dhw 4DROP  # ( )
  .dhw (JMP) FALSE
  : BYTESTR=_L0
  .dhw DROP   # ( A_addr B_addr B_len )
  .dhw >R     # ( A_addr B_addr ) R:( B_len )
  .dhw TRUE   # ( A_addr B_addr bool ) R:( B_len )
  .dhw (JMP) BYTESTR=_L2
  : BYTESTR=_L1
  .dhw >R     #
  .dhw OVER   # ( A_addr B_addr A_addr )
  .dhw BYTE@  # ( A_addr B_addr A_byte )
  .dhw OVER   # ( A_addr B_addr A_byte B_addr )
  .dhw BYTE@  # ( A_addr B_addr A_byte B_byte )
  .dhw =      # ( A_addr B_addr bool )
  .dhw R>
  .dhw &
  .dhw >R
  .dhw 1+
  .dhw SWAP
  .dhw 1+
  .dhw SWAP
  .dhw R>
  : BYTESTR=_L2
  .dhw (NEXT) BYTESTR=_L1
  .dhw >R 2DROP R> EXIT

  :f 4DROP
  # ( a b c d -- )
  .dhw 2DROP 2DROP EXIT

`;
export { src };
