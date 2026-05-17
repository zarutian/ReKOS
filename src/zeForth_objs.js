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
  
`;
export { src };

