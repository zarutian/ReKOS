const src = `
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
  
`;
export { src };

