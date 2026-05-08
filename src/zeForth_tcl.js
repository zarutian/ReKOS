import { src as utf8_src } from "./zeForth_utf8.js";
const src = utf8_src.concat(`
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

  :f 2R@
  # ( -- a b ) R:( b a -- b a )
  .dhw R>    # ( ra ) R:( b a )
  .dhw R>    # ( ra a ) R:( b )
  .dhw R>    # ( ra a b ) R:( )
  .dhw ROT   # ( a b ra ) R:( )
  .dhw >R    # ( a b ) R:( ra )
  .dhw 2DUP  # ( a b a b ) R:( ra )
  .dhw R>    # ( a b a b ra ) R:( )
  .dhw -ROT  # ( a b ra a b ) R:( )
  .dhw >R    # ( a b ra a ) R:( b )
  .dhw >R    # ( a b ra ) R:( b a )
  .dhw >R    # ( a b ) R:( b a ra )
  .dhw EXIT  # ( a b ) R:( b a )

  :f Tcl_list_first
  # ( addr len -- addr len' )
  # Takes an ASCII string and returns the first 'word' of it per Tcl parsing rules
  # todo eventually: make an utf-8 version
  .dhw SWAP TUCK           # ( addr addr len )
  .dhw Tcl_list_first_sub0 # ( addr bralvl brclvl inquote addr' )
  .dhw 2NIP                # ( addr addr' )
  .dhw OVER MINUS          # ( addr len' )
  .dhw EXIT

  # BYTESTR_PREFIX?
  # ( hay_addr hay_maxlen needle_addr needle_len -- needle_len T | F )

  :f Tcl_const_str_backslash
  # ( -- addr len )
  .dhw ($|")
  .utf8_hwc "\\"
  .dhw EXIT

  :f Tcl_const_str_doublequote
  # ( -- addr len )
  .dhw ($|")
  .utf8_hwc "\""
  .dhw EXIT

  :f Tcl_const_str_leftsquarebracket
  # ( -- addr len )
  .dhw ($|")
  .utf8_hwc "["
  .dhw EXIT

  :f Tcl_const_str_rightsquarebracket
  # ( -- addr len )
  .dhw ($|")
  .utf8_hwc "]"
  .dhw EXIT

  :f Tcl_const_str_leftcurlybracket
  # ( -- addr len )
  .dhw ($|")
  .utf8_hwc "{"
  .dhw EXIT

  :f Tcl_const_str_rightcurlybracket
  # ( -- addr len )
  .dhw ($|")
  .utf8_hwc "}"
  .dhw EXIT

  :f Tcl_const_str_newline
  # ( -- addr len )
  .dhw ($|")
  .utf8_hwc "\n"
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
  .dhw R>                  # ( bracer bralvl brclvl inquote addr len ) R:( )
  .dhw 2DUP                # ( bracer bralvl brclvl inquote addr len addr len ) R:( )
  .dhw >R >R               # ( bracer bralvl brclvl inquote addr len ) R:( len addr )
  .dhw Tcl_const_str_backslash # ( bracer bralvl brclvl inquote hay_addr hay_len needle_addr needle_len ) R:( len addr )
  .dhw BYTESTR_PREFIX?     # ( bracer bralvl brclvl inquote ( needle_len T | F ) ) R:( len addr )
  .dhw INVERT (BRZ) Tcl_list_first_sub0_L2
  .dhw 2R@ -merkill-
  
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
  
`);
export { src };
