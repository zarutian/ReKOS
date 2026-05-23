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
  .dhw 6<<>
  .dhw 0xF&
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
  .dhw LIT_11
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

  : make_powers_of_2
  # ( veldi -- num )
  .dhw LIT_1 SWAP 1- << EXIT
  
  : within_which_powers_of_2
  # ( num -- veldi )
  .dhw DUP
  .dhw 0=
  .dhw OVER
  .dhw 1=
  .dhw EXIT
  .dhw (BRZ)
  .dhw within_which_powers_of_2_L3
  .dhw EXIT
  : within_which_powers_of_2_L3
  .dhw LIT_2            # ( num veldi )
  : within_which_powers_of_2_L0
  .dhw 2DUP             # ( num veldi num veldi )
  .dhw make_powers_of_2 # ( num veldi num test )
  .dhw <                # ( num veldi bool )
  .dhw (BRZ)            # ( num veldi )
  .dhw within_which_powers_of_2_L1
  .dhw NIP
  .dhw EXIT
  : within_which_powers_of_2_L1
  .dhw 1+               # ( num veldi+1 )
  .dhw DUP
  .dhw LIT_16
  .dhw >=
  .dhw (BRZ)
  .dhw within_which_powers_of_2_L0
  .dhw 2DROP
  .dhw LIT_16
  .dhw EXIT

  : GET_BIT_NR
  # ( cell bitnr -- bit )
  .dhw 1+ <<> 1& EXIT

  : zobj_makeObjectHDR
  # ( ref_nrs dat_nrs -- hdr )
  .dhw (LIT)
  .dhw 0x03FF
  .dhw OVER        # ( r d 0x07FF d )
  .dhw <           # ( r d bool )
  .dhw 3RD_DEEP    # ( r d bool r )
  .dhw (LIT)
  .dhw 0x03FF
  .dhw >
  .dhw OR          # ( r d bool )
  .dhw (BRZ)
  .dhw zobj_makeObjectHDR_L0
  .dhw (ABORT")
  .utf8_hwc "either number of refs or number of datums wont fit in object header"
  : zobj_makeObjectHDR_L0
  .dhw SWAP        # ( d r )
  .dhw DUP         # ( d r r )
  .dhw within_which_powers_of_2 # ( d r pr )
  .dhw ROT         # ( r pr d )
  .dhw DUP         # ( r pr d d )
  .dhw within_which_powers_of_2 # ( r pr d pd )
  .dhw 3RD_DEEP    # ( r pr d pd pr )
  .dhw +
  .dhw (LIT)
  .dhw 11
  .dhw <=          # ( r pr d bool )
  .dhw NOT
  .dhw (BRZ)       # ( r pr d )
  .dhw zobj_makeObjectHDR_L1
  .dhw (ABORT")
  .utf8_hwc "mutually too big number of refs and number of datums"
  : zobj_makeObjectHDR_L1
  .dhw ROT         # ( pr d r )
  .dhw LIT_0       # ( pr d r typ )
  .dhw OR          # ( pr d hdr )
  .dhw 3RD_DEEP    # ( pr d hdr pr )
  .dhw 6<>>        # ( pr d hdr pr<>>6 )
  .dhw OR          # ( pr d hdr )
  .dhw -ROT        # ( hdr d pr )
  .dhw <<          # ( hdr d<<pr )
  .dhw OR          # ( hdr )
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
  
  : zobj_become:
  # ( a_optr b_optr -- )
  .dhw OVER            # ( a_optr b_optr a_optr )
  .dhw zobj_move2new   # ( old_a_optr b_optr new_a_optr )
  .dhw OVER            # ( old_a_optr b_optr new_a_optr b_optr )
  .dhw zobj_move2new   # ( old_a_optr old_b_optr new_a_optr new_b_optr )
  .dhw >R              # ( old_a_optr old_b_optr new_a_optr )
  .dhw zobj_breakheart # ( old_a_optr )
  .dhw R>              # ( old_a_optr new_b_optr )
  .dhw zobj_breakheart # ( )
  .dhw EXIT

  : zobj_migrate2new
  # ( old_optr -- )
  .dhw DUP
  .dhw zobj_move2new
  .dhw zobj_breakheart
  .dhw EXIT
  
  : zobj_ptr_within
  # ( ptr lower upper -- T | F )
  .dhw OVER      # ( ptr lower upper lower )
  .dhw zobj_ptr- # ( ptr lower u-l )
  .dhw >R        # ( ptr lower )
  .dhw zobj_ptr- # ( p-l )
  .dhw R>        # ( p-l u-l )
  .dhw <
  .dhw EXIT
  
  : zobj_ptr_in_oldspace
  # ( ptr -- flag )
  .dhw zobj_oldspace_start
  .dhw @
  .dhw zobj_newspace_start
  .dhw @
  .dhw zobj_ptr_within
  .dhw EXIT
  
  : zobj_gc
  # ( -- )
  .dhw zobj_newspace_start
  .dhw @
  .dhw zobj_oldspace_start
  .dhw ! #
  .dhw zobj_HERE
  .dhw @
  .dhw DUP
  .dhw zobj_newspace_start
  .dhw ! #
  .dhw zobj_scanptr
  .dhw ! #
  .dhw zobj_root_optr
  .dhw @
  .dhw DUP
  .dhw zobj_migrate2new
  .dhw zobj_follow_brokenhearts #
  .dhw zobj_root_optr
  .dhw ! #
  : zobj_gc_L0
  .dhw zobj_gc_scan #
  .dhw zobj_scanptr
  .dhw @
  .dhw zobj_HERE
  .dhw @
  .dhw =
  .dhw (BRZ)
  .dhw zobj_gc_L0
  .dhw zobj_flush_watchedRefEvents2event_queue
  .dhw EXIT

  : zobj_gc_scan
  # ( -- )
  .dhw zobj_scanptr
  .dhw @            # ( ptr )
  : zobj_gc_scan_L0
  .dhw DUP
  .dhw zobj_typ@    # ( ptr typ )
  .dhw (JMPTBL)
  .dhw 0x4
  .dhw zobj_gc_scan_L_object
  .dhw zobj_gc_scan_L_refWatcher
  .dhw zobj_gc_scan_L_brokenheart
  .dhw zobj_gc_scan_L_refWatchEvent
  .dhw NOP
  .dhw NOP
  : zobj_gc_scan_L_object
  # ( optr )
  .dhw DUP
  .dhw zobj_size@
  .dhw zobj_scanptr
  .dhw zobj_ptr+!   #
  .dhw DUP
  .dhw zobj_refs_size@
  .dhw >R
  .dhw LIT_0
  .dhw (JMP)
  .dhw zobj_gc_scan_L2
  : zobj_gc_scan_L1
  # ( optr refNr )
  .dhw 2DUP
  .dhw zobj_ref@    # ( optr refNr reffed_optr )
  .dhw DUP          # ( optr refNr reffed_optr reffed_optr )
  .dhw zobj_ptr_in_oldspace # ( optr refNr reffed_optr bool )
  .dhw (BRZ)        #
  .dhw zobj_gc_scan_L3 # ( optr refNr reffed_optr )
  .dhw DUP
  .dhw zobj_migrate2new # ( optr refNr reffed_optr )
  .dhw zobj_gc_scan_L3
  .dhw zobj_follow_brokenhearts # ( optr refNr new_reffed_optr )
  .dhw 3DUP
  .dhw DROP         # ( optr refNr new_reffed_optr optr refNr )
  .dhw zobj_ref!
  .dhw 1+           # ( optr refNr+1 )
  : zobj_gc_scan_L2 # ( optr refNr )
  .dhw (NEXT)
  .dhw zobj_gc_scan_L1
  .dhw (JMP)
  .dhw 2DROP
  : zobj_gc_scan_L_refWatcher
  # ( optr )
  .dhw DUP
  .dhw zobj_size@
  .dhw zobj_scanptr
  .dhw zobj_ptr+!   #
  .dhw DUP
  .dhw zobj_refs_size@
  .dhw >R
  .dhw LIT_0
  .dhw (JMP)
  .dhw zobj_gc_scan_L5 #
  : zobj_gc_scan_L4
  # ( optr refNr )
  .dhw 2DUP
  .dhw zobj_ref@             # ( optr refNr reffed_optr )
  .dhw DUP                   # ( optr refNr reffed_optr reffed_optr )
  .dhw zobj_ptr_in_oldspace  # ( optr refNr reffed_optr bool )
  .dhw (BRZ)
  .dhw zobj_gc_scan_L6       # ( optr refNr reffed_optr )
  .dhw zobj_HERE
  .dhw @
  .dhw >R                    # ( optr refNr reffed_optr ) R:( count new_optr )
  .dhw OVER
  .dhw (LIT)
  .dhw 0xC000
  .dhw OR
  .dhw zobj_,                #
  .dhw 3RD_DEEP
  .dhw zobj_,                # ( optr refNr reffrd_optr ) R:( count new_optr )
  .dhw zobj_watchedRefEvent_tail
  .dhw @
  .dhw zobj_,                #
  .dhw zobj_watchedRefEvent_tail
  .dhw @                     # ( optr refNr reffed_optr ptr )
  .dhw LIT_3
  .dhw zobj_ptr+             # ( optr refNr reffed_optr ptr+3 )
  .dhw DUP
  .dhw zobj_@
  .dhw DUP                   # ( optr refNr reffed_optr ptr+3 tail_next tail_next )
  .dhw zobj_,                # ( optr refNr reffed_optr ptr+3 tail_next )
  .dhw LIT_2
  .dhw zobj_ptr+             # ( optr refNr reffed_optr ptr+3 tail_next_prev )
  .dhw R@
  .dhw SWAP
  .dhw zobj_!                # ( optr refNr reffed_optr ptr+3 )
  .dhw R@
  .dhw SWAP
  .dhw zobj_!                # ( optr refNr reffed_optr )
  .dhw DUP
  .dhw R@
  .dhw LIT_4
  .dhw zobj_ptr+
  .dhw OVER
  .dhw zobj_size@
  .dhw zobj_move2new         #
  .dhw R@
  .dhw zobj_breakheart       # ( optr refNr )
  .dhw 2DUP
  .dhw R>
  .dhw -ROT
  .dhw zobj_ref!             #
  : zobj_gc_scan_L6
  .dhw 1+                    # ( optr refNr+1 )
  : zobj_gc_scan_L5
  .dhw (NEXT)
  .dhw zobj_gc_scan_L4
  .dhw (JMP)
  .dhw 2DROP
  : zobj_gc_scan_L_brokenheart
  # ( optr )
  .dhw LIT_2
  .dhw zobj_scanptr
  .dhw zobj_ptr+!            #
  .dhw zobj_follow_brokenhearts
  .dhw (JMP)
  .dhw zobj_gc_scan_L0
  : zobj_gc_scan_L_refWatchEvent
  # ( optr )
  .dhw LIT_4
  .dhw zobj_scanptr
  .dhw zobj_ptr+!    #
  .dhw DUP
  .dhw LIT_1
  .dhw zobj_ptr+
  .dhw DUP
  .dhw zobj_@
  .dhw zobj_follow_brokenhearts
  .dhw SWAP
  .dhw zobj_!   #
  .dhw LIT_4
  .dhw zobj_ptr+
  .dhw (JMP)
  .dhw zobj_gc_scan_L1
  
  : zobj_get_nilObjecten
  # ( -- optr2nil )
  .dhw zobj_root_optr
  .dhw @
  .dhw LIT_1
  .dhw zobj_ref@
  .dhw EXIT
  
  : zobj_get_symbolsInterningRoot
  # ( -- optr )
  .dhw zobj_root_optr
  .dhw @
  .dhw LIT_2
  .dhw zobj_ref@
  .dhw EXIT
  
  : zobj_get_primordialsRoot
  # ( -- optr )
  .dhw zobj_root_optr
  .dhw @
  .dhw LIT_3
  .dhw zobj_ref@
  .dhw EXIT

  # primordials:
  // ref 0:
  // ref 1: watchedRefEventObject_script
  // ref 2: verb_symbol_enqueue
  // ref 3: verb_symbol_dequeue
  
  : zobj_get_eventQueueHead
  # ( -- optr )
  .dhw zobj_root_optr
  .dhw @
  .dhw LIT_4
  .dhw zobj_ref@
  .dhw EXIT
  
  : zobj_get_eventQueueTail
  # ( -- optr )
  .dhw zobj_root_optr
  .dhw @
  .dhw LIT_5
  .dhw zobj_ref@
  .dhw EXIT
  
  : zobj_invoke
  # ( ... arg(s) argc verb target_optr -- ... result(s) resultc )
  .dhw zobj_follow_brokenhearts
  .dhw DUP
  .dhw zobj_xt@
  .dhw (JMP)
  .dhw EXECUTE

  : zobj_invocationHandler_for_objscript_list
  # meant as an xt for objects
  # same stack diagram as zobj_invoke
  # all except for the 0th and nth refs in objscript_list
  # are pair of symbol_optr and method_optr
  .dhw DUP
  .dhw LIT_0
  .dhw zobj_ref@     # ( ... a ac v t objscript_optr )
  .dhw DUP
  .dhw zobj_refs_size@
  .dhw 2/
  .dhw 1-
  .dhw >R
  .dhw LIT_1
  .dhw (JMP)
  .dhw zobj_invocationHandler_for_objscript_list_L1
  : zobj_invocationHandler_for_objscript_list_L0
                  # ( ... a ac v t os idx )
  .dhw 4TH_DEEP   # ( ... a ac v t os idx v )
  .dhw 3RD_DEEP   # ( ... a ac v t os idx v os )
  .dhw 3RD_DEEP   # ( ... a ac v t os idx v os idx )
  .dhw zobj_ref@  # ( ... a ac v t os idx verb sym )
  .dhw =          # ( ... a ac v t os idx bool )
  .dhw (BRZ)      # ( ... a ac v t os idx )
  .dhw zobj_invocationHandler_for_objscript_list_L2");
  .dhw 1+         # ( ... a ac v t os idx+1 )
  .dhw zobj_ref@  # ( ... a ac v t method_optr )
  # todo: ? tbdecided ?
  # 1. find the symbol object for the string "[apply]"
  # 2. invoke the method with that as verb
  # but for now, assume datum 0 is xt to handling invocations
  .dhw DUP
  : zobj_invocationHandler_for_objscript_list_L3
  .dhw LIT_0
  .dhw zobj_datum@   #
  .dhw R>
  .dhw DROP          #
  .dhw (JMP)
  .dhw EXECUTE       #
  : zobj_invocationHandler_for_objscript_list_L2
  .dhw 2+
  : zobj_invocationHandler_for_objscript_list_L1
  .dhw (NEXT)
  .dhw zobj_invocationHandler_for_objscript_list_L0
  .dhw zobj_ref@
  .dhw (JMP)
  .dhw zobj_invocationHandler_for_objscript_list_L3
 
  : zobj_flush_watchedRefEvents2event_queue
  # ( -- )
  .dhw zobj_watchedRefEvent_tail
  .dhw @
  .dhw DUP   # ( wRE_tail wRE_tail )
  : zobj_flush_watchedRefEvents2event_queue_L0
  # ( start_tail struct )
  # struct.next -> struct
  .dhw DUP
  .dhw LIT_3
  .dhw zobj_ptr+
  .dhw zobj_@
  .dhw SWAP          # ( st next struct )
  # make an watchedRef event object from struct
  .dhw DUP
  .dhw LIT_1
  .dhw zobj_ptr+
  .dhw zobj_@        # ( st nt struct watcher )
  .dhw OVER
  .dhw zobj_@
  .dhw (LIT)
  .dhw 0x0FFF
  .dhw &             # ( st nt struct watcher refNr )
  .dhw zobj_make_watchedRefEventObject  # ( st nt struct event )
  # add the callback object to eventQueue
  .dhw zobj_eventQueue_enqueue          # ( st nt struct )
  # remove struct from the doubly linked list
  .dhw zobj_remove_watchedRefEvent
  .dhw DROP          #
  .dhw 2DUP
  .dhw =             # ( start_tail struct bool )
  .dhw (BRZ)
  .dhw zobj_flush_watchedRefEvents2event_queue_L0
  .dhw (JMP)
  .dhw 2DROP

  : zobj_make_watchedRefEventObject
  # ( watcher_optr refNr -- optr )
  .dhw zobj_HERE
  .dhw @
  .dhw >R            # ( watcher refNr ) R:( optr )
  .dhw (LIT)
  .dhw 0x0806
  .dhw zobj_,        # write object header
  .dhw (LIT)
  .dhw zobj_invocationHandler_for_objscript_list
  .dhw zobj_,        # write xt
  .dhw zobj_get_primordialsRoot
  .dhw LIT_1
  .dhw zobj_ref@     # get optr to watchedRefEventObject_script
  .dhw zobj_,        # ( watcher refNr )
  .dhw SWAP
  .dhw zobj_,
  .dhw zobj_,        # ( ) R:( optr )
  .dhw R>
  .dhw EXIT
  
  : zobj_eventQueue_enqueue
  # ( callback_optr -- )
  .dhw LIT_1
  .shw zobj_get_primordialsRoot
  .dhw LIT_2
  .dhw zobj_refs@
  .dhw zobj_get_eventQueueTail
  .dhw zobj_invoke
  .dhw DROP
  .dhw EXIT
  
  : zobj_eventQueue_dequeue
  # ( -- callback_optr )
  .dhw LIT_0
  .dhw zobj_get_primordialsRoot
  .dhw LIT_3
  .dhw zobj_refs@
  .dhw zobj_get_eventQueueHead
  .dhw zobj_invoke
  .dhw 1=
  .dhw SKNZ
  .dhw zobj_throwWrongArity
  .dhw EXIT
  
  : zobj_eventloop_turn
  # ( -- )
  .dhw zobj_eventQueue_dequeue # ( callback_optr )
  # start watchdog timer, throws if it runs out
  # invoke callback_optr with run/0
  # stop watchdog timer
  .dhw zobj_gc
  .dhw EXIT

  # ---
  # Array based of https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
  : zobj_verb_at
  : zobj_verb_@
  .dhw (CONST) 0x4210

  : zobj_verb_!
  .dhw (CONST) 0x4211

  : zobj_verb_getLength
  .dhw (CONST) 0x4212

  # -
  : zobj_verb_concat
  .dhw (CONST) 0x4220
  : zobj_verb_copyWithin
  .dhw (CONST) 0x4221
  : zobj_verb_entries
  .dhw (CONST) 0x4223
  : zobj_verb_every
  .dhw (CONST) 0x4224
  : zobj_verb_fill
  .dhw (CONST) 0x4225
  : zobj_verb_filter
  .dhw (CONST) 0x4226
  : zobj_verb_find
  .dhw (CONST) 0x4227
  : zobj_verb_findIndex
  .dhw (CONST) 0x4228
  : zobj_verb_findLast
  .dhw (CONST) 0x4229
  : zobj_verb_findLastIndex
  .dhw (CONST) 0x422A

  : zobj_makeArray 
  # ( starting_size -- objref )
  .dhw DUP LIT_32 <
  .dhw (BRZ) zobj_makeArray_L0
  .dhw zobj_HERE @ >R       # ( ss ) R:( objref )
  .dhw DUP DUP 2+           # ( ss ss ss+2 ) R:( objref )
  .dhw zobj_makeObjectHDR   # ( ss hdr ) R:( objref )
  .dhw zobj_,               # ( ss ) R:( objref )
  .dhw (LIT)                # ( ss xt ) R:( objref )
  .dhw zobj_(Array)
  .dhw zobj_,               # ( ss ) R:( objref )
  .dhw zobj_get_nilObjecten # ( ss nil ) R:( objref )
  .dhw (JMP) zobj_makeArray_L2
  : zobj_makeArray_L1
  .dhw 2DUP                 # ( ss nil ss nil ) R:( objref )
  .dhw SWAP                 # ( ss nil nil ss ) R:( objref )
  .dhw R@
  .dhw zobj_refs!           # ( ss nil )
  .dhw SWAP 1- SWAP         # ( ss-1 nil )
  : zobj_makeArray_L2
  .dhw OVER 0=
  .dhw (BRZ) zobj_makeArray_L1
  .dhw 2DROP
  .shw LIT_0
  .dhw DUP
  .dhw R@
  .dhw zobj_dat!
  .dhw LIT_0
  .dhw LIT_1
  .dhw R@
  .dhw zobj_dat!
  .dhw R>
  .dhw EXIT
  : zobj_makeArray_L0
  .dhw LIT_32 /%            # ( ss_r ss_q )
  .dhw 1- >R
  .dhw LIT_32
  .dhw zobj_makeArray       # ( ss_r car )
  .dhw (JMP)
  .dhw zobj_makeArray_L0_L1
  : zobj_makeArray_L0_L0
  .dhw LIT_32               # ( ss_r car 32 )
  .dhw zobj_makeArray       # ( ss_r car cdr )
  .dhw zobj_makeArraySpliceTwogether # ( ss_r car' )
  : zobj_makeArray_L0_L1
  .dhw (NEXT) zobj_makeArray_L0_L0
  .dhw SWAP                 # ( car" ss_r )
  .dhw DUP
  .dhw (BRZ)
  .dhw zobj_makeArray_L0_L2
  .dhw zobj_makeArray
  .dhw zobj_makeArraySpliceTwogether
  .dhw EXIT
  : zobj_makeArray_L0_L2
  .dhw DROP
  .dhw EXIT

  : zobj_(Array)
  # ( ... arity verb self -- ... )
  .dhw OVER zobj_verb_getLength = NOT (BRZ) zobj_(Array)_getLength
  .dhw OVER zobj_verb_@         = NOT (BRZ) zobj_(Array)_@
  .dhw OVER zobj_verb_!         = NOT (BRZ) zobj_(Array)_!
  .dhw (ABORT")
  .utf8_hwc "array did not understand invocation"
  : zobj_(Array)_getLength
  # ( ... 0 getLength self -- length 1 )
  .dhw >R
  .dhw zobj_verb_getLength = NOT
  .dhw SWAP 0= NOT
  .dhw OR
  .dhw (BRZ) zobj_(Array)_getLength_L0
  .dhw (ABORT")
  .utf8_hwc "arity or verb of invocation didnt match getLength/0"
  : zobj_(Array)_getLength_L0
  .dhw R>      # ( self )
  .dhw zobj_refs_size@  # ( length )
  .dhw LIT_1 EXIT
  : zobj_(Array)_@
  # ( idx 1 at self -- item refflag 2 )
  .dhw >R 2DROP DUP     # ( idx idx ) R:( self )
  .dhw LIT_0
  .dhw zobj_verb_getLength 
  .dhw R@
  .dhw zobj_invoke
  .dhw DROP             # ( idx idx length ) R:( self )
  .dhw > (BRZ) zobj_(Array)_@_L0
  .dhw DROP
  .dhw zobj_get_nilObjecten
  : zobj_(Array)_@_L2
  .dhw TRUE
  .dhw LIT_2
  .dhw EXIT
  : zobj_(Array)_@_L0
  .dhw DUP DUP           # ( idx idx idx ) R:( self )
  .dhw LIT_16 < >R       # ( idx idx ) R:( self bool )
  .dhw LIT_1 LIT_0 R@ ?: # ( idx idx 1|0 ) R:( self bool )
  .dhw R> ROT            # ( idx bool idx 1|0 ) R:( self )
  .dhw R@ zobj_dat@      # ( idx bool idx bitmap ) R:( self )
  .dhw SWAP GET_BIT_NR   # ( idx bool bit ) R:( self )
  .dhw >R
  .dhw NOT SKZ 16-       # ( idx-x ) R:( self bit )
  .dhw R> (BRZ) zobj_(Array)_@_L1
  .dhw 2+ R> zobj_dat@
  .dhw FALSE LIT_2 EXIT
  : zobj_(Array)_@_L1
  .dhw R> zobj_refs@
  .dhw (JMP) zobj_(Array)_@_L2
  : zobj_(Array)_!
  # ( item refflag idx 3 store self -- 0 )
  .dhw >R
  .dhw 2DROP
  .dhw DUP
  .dhw LIT_0
  .dhw zobj_verb_getLength 
  .dhw R@
  .dhw zobj_invoke
  .dhw DROP              # ( item refflag idx idx length ) R:( self )
  .dhw <                 # ( item refflag idx bool ) R:( self )
  .dhw (BRZ)             # ( item refflag idx ) R:( self )
  .dhw zobj_(Array)_!_L0
  .dhw 2DUP              # ( item refflag idx refflag idx ) R:( self )
  .dhw DUP LIT_16 > SLZ 16-
  .dhw GET_BIT_NR        # ( item refflag idx refflag bit ) R:( self )
  .dhw DUP               # ( item refflag idx refflag bit bit ) R:( self )
  .dhw INVERT            # ( item refflag idx refflag bit ~bit ) R:( self )
  .dhw >R                # ( item refflag idx refflag bit ) R:( self ~bit )
  .dhw LIT_0             # ( item refflag idx refflag bit 0 ) R:( self ~bit )
  .dhw ROT               # ( item refflag idx bit 0 refflag ) R:( self ~bit )
  .dhw ?:                # ( item refflag idx bit' ) R:( self ~bit )
  .dhw R>                # ( item refflag idx bit' ~bit ) R:( self )
  .dhw 3RD_DEEP          # ( item refflag idx bit' ~bit idx ) R:( self )
  .dhw >R                # ( item refflag idx bit' ~bit ) R:( self idx )
  .dhw LIT_1 LIT_0 R>    # ( item refflag idx bit' ~bit 1 0 idx ) R:( self )
  .dhw < LIT_16          # ( item refflag idx bit' ~bit 1 0 bool ) R:( self )
  .dhw ?:                # ( item refflag idx bit' ~bit 1|0 ) R:( self )
  .dhw R@ OVER >R        # ( item refflag idx bit' ~bit 1|0 self ) R:( self 1|0 )
  .dhw zobj_dat@         # ( item refflag idx bit' ~bit cell ) R:( self 1|0 )
  .dhw &                 # ( item refflag idx bit' cell_masked ) R:( self 1|0 )
  .dhw OR                # ( item refflag idx cell' ) R:( self 1|0 )
  .dhw R> R@             # ( item refflag idx cell' 1|0 self ) R:( self )
  .dhw zobj_dat!         # ( item refflag idx ) R:( self )
  .dhw SWAP              # ( item idx refflag ) R:( self )
  .dhw (BRZ)             # ( item idx ) R:( self )
  .dhw zobj_(Array)_!_L1
  .dhw R>
  .dhw zobj_refs!        # ( ) R:( self )
  .dhw (JMP) LIT_0
  : zobj_(Array)_!_L1
  .dhw 2+
  .dhw R>
  .dhw zobj_dat!
  .dhw (JMP) LIT_0
  : zobj_(Array)_!_L0
  .dhw R@                # ( item refflag idx self ) R:( self )
  .dhw LIT_0             # ( item refflag idx self 0 ) R:( self )
  .dhw zobj_verb_getLength 
  .dhw R@
  .dhw zobj_invoke       # ( item refflag idx self length 0 ) R:( self )
  .dhw DROP              # ( item refflag idx self length ) R:( self )
  .dhw TUCK              # ( item refflag idx length self length ) R:( self )
  .dhw zobj_make_array_copy # ( item refflag idx length copy ) R:( self )
  .dhw SWAP              # ( item refflag idx copy length ) R:( self )
  .dhw zobj_makeArray    # ( item refflag idx copy new ) R:( self )
  .dhw zobj_makeArraySpliceTwogether # ( item refflag idx bigger ) R:( self )
  .dhw DUP               # ( item refflag idx bigger bigger ) R:( self )
  .dhw R>                # ( item refflag idx bigger bigger self ) R:( )
  .dhw zobj_become:      # ( item refflag idx bigger ) R:( )
  .dhw LIT_3 SWAP
  .dhw zobj_verb_! SWAP  # ( item refflag idx 3 store bigger ) R:( )
  .dhw (JMP) zobj_invoke

  : zobj_make_array_copy
  # ( src length -- objref )
  .dhw DUP              # ( src len len )
  .dhw zobj_makeArray   # ( src len objref )
  .dhw SWAP >R          # ( src objref ) R:( count )
  .dhw (JMP) zobj_make_array_copy_L1
  : zobj_make_array_copy_L0
  .dhw OVER             # ( src objref src ) R:( count )
  .dhw R@ SWAP          # ( src objref count src ) R:( count )
  .dhw LIT_1 SWAP       # ( src objref count 1 src ) R:( count )
  .dhw zobj_verb_@ SWAP # ( src objref count 1 verb src ) R:( count )
  .dhw zobj_invoke      # ( src objref item refflag 2 ) R:( count )
  .dhw DROP             # ( src objref item refflag ) R:( count )
  .dhw 3RD_DEEP         # ( src objref item refflag objref ) R:( count )
  .dhw LIT_3 SWAP       # ( src objref item refflag 3 objref ) R:( count )
  .dhw zobj_invoke      # ( src objref 0 ) R:( count )
  .dhw DROP             # ( src objref ) R:( count )
  : zobj_make_array_copy_L1
  .dhw (NEXT) zobj_make_array_copy_L0
  .dhw NIP              # ( objref ) R:( )
  .dhw EXIT
  
  : zobj_makeArraySpliceTwogether
  # ( src_A src_B -- objref )
  .dhw zobj_HERE @ >R   # ( ) R:( objref )
  .dhw LIT_2 LIT_0
  .dhw zobj_makeObjectHDR
  .dhw zobj_,
  .dhw (LIT)
  .dhw zobj_(Array_2splice)
  .dhw zobj_,
  .dhw LIT_1
  .dhw R@
  .dhw zobj_refs!
  .dhw LIT_0
  .dhw R@
  .dhw zobj_refs!
  .dhw R>
  .dhw EXIT

  : zobj_(Array_2splice)
  # ( .. arity verb self -- ... )
  .dhw OVER zobj_verb_getLength = NOT (BRZ) zobj_(Array_2splice)_getLength
  .dhw OVER zobj_verb_@         = NOT (BRZ) zobj_(Array_2splice)_@|!
  .dhw OVER zobj_verb_!         = NOT (BRZ) zobj_(Array_2splice)_@|!
  .dhw (ABORT")
  .utf8_hwc "array did not understand invocation"
  : zobj_(Array)_getLength
  # ( ... 0 getLength self -- length 1 )
  .dhw >R               # ( 0 getLength ) R:( self )
  .dhw 2DUP             # ( 0 getLength 0 getLength ) R:( self )
  .dhw LIT_0 R@         # ( 0 getLength 0 getLength 0 self ) R:( self )
  .dhw zobj_refs@       # ( 0 getLength 0 getLength src_A ) R:( self )
  .dhw zobj_invoke      # ( 0 getLength len_A 1 ) R:( self )
  .dhw DROP -ROT        # ( len_A 0 getLength ) R:( self )
  .dhw LIT_1 R>         # ( len_A 0 getLength 1 self ) R:( )
  .dhw zobj_refs@       # ( len_A 0 getLength src_B ) R:( )
  .dhw zobj_invoke      # ( len_A len_B ) R:( )
  .dhw +
  .dhw (JMP) LIT_1
  : zobj_(Array_2splice)_@|!
  # ( ... arity verb self -- ... )
  # ( idx 1 fetch self -- item refflag 2 )
  # ( item refflag idx 3 store self -- 0 )
  .dhw SWAP >R SWAP >R  # ( ... idx self ) R:( verb arity )
  .dhw >R               # ( ... idx ) R:( verb arity self )
  .dhw LIT_0            # ( ... idx 0 ) R:( verb arity self )
  .dhw zobj_verb_getLength
  .dhw LIT_0            # ( ... idx 0 getLength 0 ) R:( verb arity self )
  .dhw R@               # ( ... idx 0 getLength 0 self ) R:( verb arity self )
  .dhw zobj_refs@       # ( ... idx 0 getLength src_A ) R:( verb arity self )
  .dhw zobj_invoke      # ( ... idx len_A 1 ) R:( verb arity self )
  .dhw DROP
  .dhw 2DUP             # ( ... idx len_A idx len_A ) R:( verb arity self )
  .dhw <                # ( ... idx len_A bool ) R:( verb arity self )
  .dhw (BRZ)            # ( ... idx len_A ) R:( verb arity self )
  .dhw zobj_(Array_2splice)_@|!_L1
  .dhw DROP             # ( ... idx ) R:( verb arity self )
  .dhw LIT_0
  : zobj_(Array_2splice)_@|!_L0
  .dhw R>
  .dhw zobj_refs@       # ( ... idx src_A ) R:( verb arity )
  .dhw R> SWAP R> SWAP  # ( ... idx arity verb src_A ) R:( )
  .dhw (JMP)
  .dhw zobj_invoke
  : zobj_(Array_2splice)_@|!_L1
  .dhw -                # ( ... idx-len_A )
  .dhw LIT_1
  .dhw (JMP)
  .dhw zobj_(Array_2splice)_@|!_L0

  : zobj_(Array_common)_concat
  # ( ... arity verb self -- newArray 1 )
  .dhw NIP              # ( ... arity self )
  .dhw LIT_0            # ( ... arity self 0 )
  .dhw zobj_verb_getLength
  .dhw 3RD_DEEP         # ( ... arity self 0 getLength self )
  .dhw zobj_invoke      # ( ... arity self len 1 )
  .dhw DROP             # ( ... arity self len )
  .dhw >R OVER R@       # ( ... arity self len arity ) R:( len )
  .dhw +                # ( ... arity self new_len ) R:( len )
  .dhw zobj_make_array_copy # ( ... arity new ) R:( len )
  .dhw SWAP R> SWAP >R  # ( ... new idx ) R:( count )
  .dhw (JMP)
  .dhw zobj_(Array_common)_concat_L1
  : zobj_(Array_common)_concat_L0
  .dhw OVER >R >R       # ( ... idx ) R:( count idx new )
  .dhw LIT_3            # ( ... idx 3 ) R:( count idx new )
  .dhw zobj_verb_!      # ( ... idx 3 store ) R:( count idx new )
  .dhw R@               # ( ... idx 3 store new ) R:( count idx new )
  .dhw zobj_invoke      # ( ... 0 ) R:( count idx new )
  .dhw DROP             # ( ... ) R:( count idx new )
  .dhw R> R>            # ( ... new idx ) R:( count )
  .dhw 1+               # ( ... new idx+1 ) R:( count )
  : zobj_(Array_common)_concat_L1
  .dhw SWAP             # ( ... idx new ) R:( count )
  .dhw (NEXT)
  .dhw zobj_(Array_common)_concat_L0
  .dhw NIP
  .dhw EXIT

  : zobj_(Array_common)_copyWithin
  # ( target_idx start_idx end_idx 3 copyWithin self -- self 1 )
  # ( target_idx start_idx 2 copyWithin self -- self 1 )
  .dhw NIP >R           # ( ... target start (end) arity ) R:( self )
  .dhw DUP 2=           # ( ... target start (end) arity bool ) R:( self )
  .dhw (BRZ)
  .dhw zobj_(Array_common)_copyWithin_L0
  .dhw 

  : zobj_makeArraySlice
  # ( src start end -- objref )
  
`;
export { src };

