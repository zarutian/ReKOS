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
  # ( ptr offsett -- ptr )
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

`;
export { src };

