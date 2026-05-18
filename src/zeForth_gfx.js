import { src as objs_src } from "./zeForth_objs.js";
const src = objs_src.concat(`
  : zgfx
  .dhw (JMP)
  .dhw TRUE
  
  : zgfx_verb_getWidth
  # ( pixBuff -- u )
  .dhw (CONST) 0x4201
  
  : zgfx_verb_getHeight
  # ( pixBuff -- u )
  .dhw (CONST) 0x4202
  
  : zgfx_verb_getPixel
  # ( x y pixBuff -- colour )
  .dhw (CONST) 0x4203
  
  : zgfx_verb_putPixel
  # ( colour x y pixBuff -- )
  .dhw (CONST) 0x4204
  
  : zgfx_verb_getColour
  # ( idxIntoPalette )
  .dhw (CONST) 0x4205
  
  : zgfx_common_getWidth
  # ( ... argN verb obj -- width )
  .dhw LIT_0
  .dhw zgfx_too_few_or_many_args?
  .dhw 2NIP
  .dhw LIT_0
  .dhw zobj_dat@
  .dhw LIT_1
  .dhw EXIT
  
  : zgfx_common_getHeight
  # ( verb obj -- height )
  .dhw LIT_0
  .dhw zgfx_too_few_or_many_args?
  .dhw 2NIP
  .dhw LIT_1
  .dhw zobj_dat@
  .dhw LIT_1
  .dhw EXIT
  
  : zgfx_too_few_or_many_args?
  # ( ... argN verb obj arity -- ... argN verb obj )
  .dhw SWAP
  .dhw >R
  .dhw SWAP
  .dhw >R
  .dhw OVER
  .dhw =
  .dhw R>
  .dhw SWAP
  .dhw R>
  .dhw SWAP
  .dhw (SKZ)
  .dhw EXIT
  .dhw (ABORT\")
  .utf8_hwc "TOO MANY OR TOO FEW ARGS GIVEN IN METHOD INVOCATION"

`);
export { src };
