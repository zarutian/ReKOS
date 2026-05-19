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

  # obj header: 0b ttzz zSSS SSSS SSSS
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
  .dhw 5<<>
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

  : zobj_makeObjectHDR
  # ( ref_nrs dat_nrs -- hdr )
  .dhw 
  .dhw LIT_0
  
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

  : zobj_makeArray 
  # ( starting_size -- objref )

  : zobj_makeArraySlice
  # ( src start end -- objref )

  : zobj_makeArraySpliceTwogether
  # ( src_A src_B -- objref )
  
`;
export { src };

