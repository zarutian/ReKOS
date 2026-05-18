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

  # PixBuff  contains pixel data, often true colour or indexed colour
  : zgfx_makePixBuff
  # ( width height bitsPerPixel -- objref )
  .dhw zobj_HERE @    # ( w h bpp objref )
  .dhw >R 3DUP *      # ( w h bbp w u ) R:( objref )
  .dhw *              # ( w h bbp sizeInBits ) R:( objref )
  .dhw DUP 0xF&       # ( w h bbp sizeInBits reminder ) R:( objref )
  .dhw SWAP 4>>       # ( w h bbp reminder sizeInCells ) R:( objref )
  .dhw SWAP >R        # ( w h bbp sizeInCells ) R:( objref reminder )
  .dhw LIT_0 LIT_1    # ( w h bbp sizeInCells 0 1 ) R:( objref reminder )
  .dhw R> ?: +        # ( w h bbp sizeInCells ) R:( objref )
  .dhw DUP >R         # ( w h bbp sizeInCells ) R:( objref sizeInCells )
  .dhw 2+             # ( w h bbp sizeInCells+2 ) R:( objref sizeInCells )
  .dhw zobj_, >R      # ( w h ) R:( objref sizeInCells bbp )
  .dhw (LIT) 
  .dhw zgfx_(PixBuff) # ( w h xt ) R:( objref sizeInCells bbp )
  .dhw zobj_, SWAP    # ( h w ) R:( objref sizeInCells bbp )
  .dhw zobj_, R>      # ( bbp ) R:( objref sizeInCells )
  .dhw zobj_, R>      # ( sizeInCells ) R:( objref )
  .dhw zobj_ALOT      # ( ) R:( objref )
  .dhw R> EXIT        # ( objref )

  : zgfx_(PixBuff)
  # ( ... argN verb self -- ... )
  .dhw OVER zgfx_verb_getWidth  = NOT (BRZ) zgfx_common_getWidth
  .dhw OVER zgfx_verb_getHeight = NOT (BRZ) zgfx_common_getHeight
  .dhw OVER zgfx_verb_getPixel  = NOT (BRZ) zfgx_(PixBuff)_getPixel
  .dhw OVER zgfx_verb_putPixel  = NOT (BRZ) zfgx_(PixBuff)_putPixel
  .dhw (ABORT\")
  .utf8_hwc "PixBuff does not understand method selector or verb
  : zgfx_(PixBuff)_xxxPixel
  # ( (colour) x y objref -- (colour) offset r objref )
  .dhw >R          # ( (colour) x y ) R:( objref )
  .dhw LIT_0       # ( (colour) x y 0 ) R:( objref )
  .dhw zgfx_verb_getWidth
  .dhw R@          # ( (colour) x y 0 getWidth_verb or ) R:( objref )
  .dhw zobj_invoke # ( (colour) x y width 1 ) R:( objref )
  .dhw DROP        # ( (colour) x y width ) R:( objref )
  .dhw *           # ( (colour) x y*w ) R:( objref )
  .dhw +           # ( (colour) x+y*w )
  .dhw R@ LIT_2 zobj_dat@ # ( (colour) pixelNr bbp )
  .dhw /%          # ( (colour) offset r )
  .dhw SWAP        # ( (colour) r offset )
  .dhw 3+          # ( (colour) r offset+3 )
  .dhw SWAP        # ( (colour) offset+3 r )
  .dhw R>          # ( (colour) offset+3 r objref )
  .dhw EXIT        #
  : zgfx_(PixBuff)_getPixel
  # ( x y 2 zgfx_verb_getPixel objref -- colour 1 )
  .dhw LIT_2                      # ( x y 2 v objref 2 )
  .dhw zgfx_too_few_or_many_args? # ( x y 2 v objref )
  .dhw >R                         # ( x y 2 v ) R:( objref )
  .dhw 2DROP                      # ( x y ) R:( objref )
  .dhw R@                         # ( x y objref ) R:( objref )
  .dhw zgfx_(PixBuff)_xxxPixel    # ( offset r objref )
  .dhw ROT                        # ( r objref offset )
  .dhw zobj_dat@                  # ( r cell )
  .dhw OVER                       # ( r cell r )
  .dhw LIT_16 # ætti að vera CELL_butsize  # ( r cell r 16 )
  .dhw SWAP                       # ( r cell 16 r )
  .dhw -                          # ( r cell 16-r )
  .dhw >>                         # ( r cell>>x )
  .dhw SWAP                       # ( cell>>x r )
  .dhw generate_bitmask           # ( cell>>x bitmask )
  .dhw &                          # ( colour )
  .dhw LIT_1                      # ( colour 1 )
  .dhw EXIT
`);
export { src };
