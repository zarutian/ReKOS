const src = `
  : generate_bitmask
  # ( nrOfBits -- mask )
  .dhw DUP
  .dhw 0=
  .dhw (BRZ)
  .dhw generate_bitmask_L0
  .dhw DROP
  .dhw (JMP)
  .dhw LIT_0
  : generate_bitmask_L0
  .dhw 1-
  .dhw 0xF&
  .dhw 1+
  .dhw >R
  .dhw LIT_1
  .dhw (JMP)
  .dhw generate_bitmask_L2
  : generate_bitmask_L1
  .dhw 1<<>
  .dhw LIT_1
  .dhw OR
  : generate_bitmask_L2
  .dhw (NEXT)
  .dhw generate_bitmask_L1
  .dhw EXIT
  
  : 3RD_DEEP
  # ( a b c -- a b c a )
  .dhw >R
  .dhw OVER
  .dhw R>
  .dhw SWAP
  .dhw EXIT
  
  # zobj version whatever
  : zobj_@
  # ( ptr -- cell )
  .dhw @
  .dhw EXIT
  
  : zobj_!
  # ( cell ptr -- )
  .dhw !
  .dhw EXIT
  
  : zobj_objspace_start
  .dhw (CONST)
  .dhw 0x4000
  
  : zobj_objspace_size
  .dhw (CONST)
  .dhw 0xC000
  
  : zobj_ptr+
  # ( ptr offset -- ptr )
  .dhw >R
  .dhw zobj_objspace_start
  .dhw -
  .dhw R>
  .dhw +
  .dhw zobj_objspace_size
  .dhw %
  .dhw zobj_objspace_start
  .dhw +
  .dhw EXIT
  
  : zobj_ptr-
  # ( ptr offset -- ptr )
  .dhw >R
  .dhw zobj_objspace_start
  .dhw -
  .dhw R>
  .dhw -
  .dhw zobj_objspace_size
  .dhw %
  .dhw zobj_objspace_start
  .dhw +
  .dhw EXIT

  : zobj_ptr++
  # ( ptr -- ptr+1 )
  .dhw LIT_1
  .dhw zobj_ptr+
  .dhw EXIT

  # obj header: 0b ttzz zzSS SSSS SSSS
  #   t: type
  #   z: size of refs size in S
  #   S: datum size in words | refs size in refs
  : zobj_header@
  # ( optr -- hdr )
  .dhw zobj_@
  .dhw EXIT
  
  : zobj_header!
  .dhw zobj_!
  .dhw EXIT
  
  : zobj_invocation_handler@
  # ( optr -- xt )
  : zobj_xt@
  # ( optr -- xt )
  .dhw zobj_ptr++
  .dhw zobj_@
  .dhw EXIT
  
  : zobj_invocation_handler!
  # ( xt optr -- )
  : zobj_xt!
  # ( xt optr -- )
  .dhw zobj_ptr++
  .dhw zobj_!
  .dhw EXIT
  
  : zobj_sizeof_ref
  .dhw (CONST)
  .dhw 1

  : zobj_refs_size_size@
  # ( optr -- u )
  .dhw zobj_header@
  .dhw 7<<>
  .dhw 7&
  .dhw EXIT
  
  : zobj_refs_size@
  # ( optr -- nrOfRefs )
  .dhw DUP
  .dhw zobj_refs_size_size@
  .dhw generate_bitmask
  .dhw SWAP
  .dhw zobj_header@
  .dhw &
  .dhw EXIT
  
  : zobj_data_size@
  # ( optr -- nrOfCells )
  .dhw DUP
  .dhw zobj_refs_size_size@  # ( optr rss )
  .dhw DUP
  .dhw LIT_10
  .dhw SWAP
  .dhw -                     # ( optr rss dss )
  .dhw generate_bitmask
  .dhw ROT                   # ( rss mask optr )
  .dhw zobj_header@
  .dhw ROT
  .dhw >>                    # ( mask cell )
  .dhw &
  .dhw EXIT

  : zobj_size@
  # ( optr -- nrOfCells )
  .dhw DUP
  .dhw zobj_data_size@
  .dhw SWAP
  .dhw zobj_refs_size@
  .dhw zobj_sizeof_ref
  .dhw *
  .dhw +
  .dhw 2+
  .dhw EXIT
  
  : zobj_raw_ref_common
  # ( optr refNr -- ptr )
  .dhw OVER
  .dhw zobj_refs_size@
  .dhw OVER
  .dhw <=
  .dhw SKZ
  .dhw zobj_throw_refnr_out_of_bounds
  .dhw zobj_sizeof_ref
  .dhw *
  .dhw 2+
  .dhw zobj_ptr+
  .dhw EXIT
  
  : zobj_raw_ref@
  # ( optr refNr -- reffed_optr )
  .dhw zobj_raw_ref_common
  .dhw zobj_@
  .dhw EXIT
  
  : zobj_raw_ref!
  # ( reffed_optr optr refNr -- )
  .dhw zobj_raw_ref_common
  .dhw zobj_!
  .dhw EXIT

  : zobj_raw_datum_common
  # ( optr datumNr -- ptr )
  .dhw OVER
  .dhw zobj_data_size@
  .dhw OVER
  .dhw <=
  .dhw SKZ
  .dhw zobj_throw_datumnr_out_of_bounds
  .dhw OVER
  .dhw zobj_refs_size@
  .dhw zobj_sizeof_ref
  .dhw *
  .dhw 2+
  .dhw +
  .dhw zobj_ptr+
  .dhw EXIT
  
  : zobj_raw_datum@
  # ( optr datumNr -- cell )
  .dhw zobj_raw_datum_common
  .dhw zobj_@
  .dhw EXIT
  
  : zobj_raw_datum!
  # ( cell optr datumNr -- )
  .dhw zobj_raw_datum_common
  .dhw zobj_!
  .dhw EXIT
  
  : zobj_typ@
  # ( optr -- typ )
  .dhw zobj_header@
  .dhw 2<<>
  .dhw 2&
  .dhw EXIT

  : zobj_is_object
  # ( optr -- bool )
  .dhw zobj_typ@
  .dhw 0=
  .dhw EXIT
  
  : zobj_is_refWatchingObject
  # ( optr -- bool )
  .dhw zobj_typ@
  .dhw 1=
  .dhw EXIT
  
  : zobj_is_brokenheart
  # ( optr -- bool )
  .dhw zobj_typ@
  .dhw 2=
  .dhw EXIT
  
  : zobj_is_refWatchEvent
  # ( optr -- bool )
  .dhw zobj_typ@
  .dhw 3=
  .dhw EXIT

  : zobj_breakheart
  # ( old_optr new_optr -- )
  .dhw OVER
  .dhw (LIT)
  .dhw 0x8000
  .dhw SWAP
  .dhw zobj_!
  .dhw SWAP
  .dhw zobj_ptr++
  .dhw zobj_!
  .dhw EXIT
  
  : zobj_remove_watchedRefEvent
  # ( optr -- optr+4 )
  # refWatchEvent structure:
  #  0b01 refNr of the ref that went linear reference (that is, only one ref exists to the reffed object)
  #  optr to the refWatching object
  #  ptr  to prev refWatchEvent
  #  ptr  to next refWatchEvent
  #  original reffed to object follows
  .dhw DUP             # ( optr optr )
  .dhw LIT_2           # ( optr optr 2 )
  .dhw zobj_ptr+       # ( optr optr+2 )
  .dhw DUP             # ( optr optr+2 optr+2 )
  .dhw zobj_@          # ( optr optr+2 prev )
  .dhw SWAP            # ( optr prev optr+2 )
  .dhw LIT_1           #
  .dhw zobj_ptr+       # ( optr prev optr+3 )
  .dhw zobj_@          # ( optr prev next )
  .dhw 2DUP            # ( optr prev next prev next )
  .dhw LIT_2           #
  .dhw zobj_ptr+       # ( optr prev next prev next+2 )
  .dhw zobj_!          #
  .dhw SWAP            # ( optr next prev )
  .dhw LIT_3           #
  .dhw zobj_ptr+       # ( optr next prev+3 )
  .dhw zobj_!          #
  .dhw DUP             # ( optr optr )
  .dhw LIT_4           # ( optr optr 4 )
  .dhw zobj_ptr+       # ( optr optr+4 )
  .dhw DUP             #
  .dhw >R              # ( optr optr+4 ) R:( optr+4 )
  .dhw zobj_breakheart # ( )
  .dhw R>              # ( optr+4 )
  .dhw EXIT

  : zobj_follow_brokenhearts
  # ( optr -- optr )
  .dhw DUP
  .dhw zobj_is_brokenheart
  .dhw (BRZ)
  .dhw zobj_follow_brokenhearts_L0
  .dhw LIT_1
  .dhw zobj_ptr+
  .dhw (JMP)
  .dhw zobj_follow_brokenhearts
  : zobj_follow_brokenhearts_L0
  .dhw DUP
  .dhw zobj_is_refWatchEvent
  .dhw SKZ
  .dhw zobj_remove_watchedRefEvent
  .dhw EXIT
  
  : zobj_ref@
  # ( optr refNr -- reffed_optr )
  .dhw >R
  .dhw zobj_follow_brokenhearts
  .dhw R>
  .dhw zobj_raw_ref@
  .dhw zobj_follow_brokenhearts
  .dhw EXIT
  
  : zobj_ref!
  # ( new_reffed_optr optr refNr -- )
  .dhw >R
  .dhw zobj_follow_brokenhearts
  .dhw R>
  .dhw zobj_raw_ref!
  .dhw EXIT
  
  : zobj_datum@
  # ( optr datumNr -- cell )
  .dhw >R
  .dhw zobj_follow_brokenhearts
  .dhw R>
  .dhw zobj_raw_datum@
  .dhw EXIT
  
  : zobj_datum!
  # ( cell optr datumNr -- )
  .dhw >R
  .dhw zobj_follow_brokenhearts
  .dhw R>
  .dhw zobj_raw_datum!
  .dhw EXIT
  
  : zobj_HERE
  .dhw (VAR)
  .dhw 0x4000

  : zobj_newspace_start
  .dhw (VAR)
  .dhw 0x0000
  
  : zobj_oldspace_start
  .dhw (VAR)
  .dhw 0x0000
  
  : zobj_scanptr
  .dhw (VAR)
  .dhw 0x0000
  
  : zobj_root_optr
  .dhw (VAR)
  .dhw 0x0000
  
  : zobj_watchedRefEvent_tail
  .dhw (VAR)
  .dhw 0x0000
  
  : zobj_ptr+!
  # ( increment addr -- )
  .dhw DUP
  .dhw >R
  .dhw @
  .dhw zobj_ptr+
  .dhw R>
  .dhw !
  .dhw EXIT
  
  : zobj_ptr++!
  # ( addr -- )
  .dhw LIT_1
  .dhw SWAP
  .dhw zobj_ptr+!
  .dhw EXIT
  
  : zobj_,
  # ( cell -- )
  .dhw zobj_HERE
  .dhw @
  .dhw zobj_!
  .dhw zobj_HERE
  .dhw zobj_ptr++!
  .dhw EXIT
  
  : zobj_move
  # ( src dst count -- )
  .dhw >R
  .dhw (JMP)
  .dhw zobj_move_L1
  : zobj_move_L0
  .dhw OVER
  .dhw zobj_@
  .dhw OVER
  .dhw zobj_!
  .dhw zobj_ptr++
  .dhw SWAP
  .dhw zobj_ptr++
  .dhw SWAP
  : zobj_move_L1
  .dhw (NEXT)
  .dhw zobj_move_L0
  .dhw 2DROP
  .dhw EXIT

  : zobj_move2new
  # ( old_optr -- new_optr  )
  .dhw zobj_HERE  # ( old_optr addr )
  .dhw @          # ( old_optr new_optr )
  .dhw SWAP       # ( new_optr old_optr )
  .dhw 2DUP       # ( new_optr old_optr new_optr old_optr )  
  .dhw zobj_size@ # ( new_optr old_optr new_optr osize )
  .dhw 2DUP       # ( new_optr old_optr new_optr osize new_optr osize )
  .dhw zobj_ptr+  # ( new_optr old_optr new_optr osize optr )
  .dhw zobj_HERE  # ( new_optr old_optr new_optr osize optr addr )
  .dhw !          # ( new_optr old_optr new_optr osize )
  .dhw (JMP)      #
  .dhw zobj_move  # ( new_optr )
  
  : zobj_become:       # ( a_optr b_optr -- )
  .dhw OVER            # ( a_optr b_optr a_optr )
  .dhw zobj_move2new   # ( old_a_optr b_optr new_a_optr )
  .dhw OVER            # ( old_a_optr b_optr new_a_optr b_optr )
  .dhw zobj_move2new   # ( old_a_optr old_b_optr new_a_optr new_b_optr )
  .dhw >R              # ( old_a_optr old_b_optr new_a_optr )
  .dhw zobj_breakheart # ( old_a_optr )
  .dhw R>              # ( old_a_optr new_b_optr )
  .dhw zobj_breakheart # ( )
  .dhw EXIT
  
`;
export { src };

