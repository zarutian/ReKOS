const src = `
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

`;
export { src };
