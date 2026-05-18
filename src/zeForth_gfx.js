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
  .utf8_hwc "PixBuff does not understand method selector or verb"
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
  .dhw R>                         # ( x y objref ) R:( objref )
  .dhw zgfx_(PixBuff)_xxxPixel    # ( offset r objref )
  .dhw ROT                        # ( r objref offset )
  .dhw zobj_dat@                  # ( r cell )
  # -byrjun-
  .dhw OVER                       # ( r cell r )
  .dhw LIT_16 # ætti að vera CELL_bitsize  # ( r cell r 16 )
  .dhw SWAP                       # ( r cell 16 r )
  .dhw -                          # ( r cell 16-r )
  .dhw >>                         # ( r cell>>x )
  # -lok-
  .dhw SWAP                       # ( cell>>x r )
  .dhw generate_bitmask           # ( cell>>x bitmask )
  .dhw &                          # ( colour )
  .dhw LIT_1                      # ( colour 1 )
  .dhw EXIT
  : zgfx_(PixBuff)_putPixel
  # ( colour x y 3 zgfx_verb_putPixel objref -- 0 )
  .dhw LIT_3
  .dhw zgfx_too_few_or_many_args? # ( colour x y 3 v objref )
  .dhw >R                         # ( colour x y 3 v ) R:( objref )
  .dhw 2DROP                      # ( colour x y ) R:( objref )
  .dhw R@                         # ( colour x y objref ) R:( objref )
  .dhw zgfx_(PixBuff)_xxxPixel    # ( colour offset r objref ) R:( objref )
  .dhw 3RD_DEEP                   # ( colour offset r objref offset ) R:( objref )
  .dhw zobj_dat@                  # ( colour offset r cell ) R:( objref )
  .dhw OVER                       # ( colour offset r cell r ) R:( objref )
  .dhw generate_bitmask           # ( colour offset r cell bitmask ) R:( objref )
  .dhw SWAP
  .dhw >R                         # ( colour offset r bitmask ) R:( objref cell )
  .dhw >R                         # ( colour offset r ) R:( objref cell bitmask )
  .dhw ROT                        # ( offset r colour ) R:( objref cell bitmask )
  .dhw R@                         # ( offset r colour bitmask ) R:( objref cell bitmask )
  .dhw &                          # ( offset r colour_masked ) R:( objref cell bitmask )
  .dhw -ROT                       # ( colour_masked offset r ) R:( objref cell bitmask )
  .dgw R>                         # ( colour_masked offset r bitmask ) R:( objref cell )
  # -byrjun-
  .dhw OVER                       # ( colour_masked offset r bitmask r ) R:( objref cell )
  .dhw LIT_16 # ætti að vera CELL_bitsize  # ( colour_masked offset r bitmask r 16) R:( objref cell )
  .dhw SWAP                       # ( colour_masked offset r bitmask 16 r ) R:( objref cell )
  .dhw -                          # ( colour_masked offset r bitmask 16-r ) R:( objref cell )
  .dhw >>                         # ( colour_masked offset r bitmask>>x )   R:( objref cell )
  # -lok-
  .dhw INVERT                     # ( colour_masked offset r ~(bitmask>>x) ) R:( objref cell )
  .dhw R>                         # ( colour_masked offset r ~(bitmask>>x) cell ) R:( objref )
  .dhw &                          # ( colour_masked offset r cell_masked ) R:( objref )
  .dhw >R                         # ( colour_masked offset r ) R:( objref cell_masked )
  .dhw ROT                        # ( offset r colour_masked ) R:( objref cell_masked )
  .dhw LIT_16 # ætti að vera CELL_bitsize 
  .dhw SWAP                       # ( offset colour_masked 16 r ) R:( objref cell_masked )
  .dhw -                          # ( offset colour_masked 16-r ) R:( objref cell_masked )
  .dhw <<                         # ( offset colour_masked<<x ) R:( objref cell_masked )
  .dhw R>                         # ( offset colour_masked<<x cell_masked ) R:( objref )
  .dhw OR                         # ( offset new_cell ) R:( objref )
  .dhw SWAP                       # ( new_cell offset ) R:( objref )
  .dhw R>                         # ( new_cell offset objref ) R:( )
  .dhw SWAP                       # ( new_cell objref offset )
  .dhw zobj_dat!                  # ( )
  .dhw LIT_0                      # ( 0 )
  .dhw EXIT

  // Subrect references PixBuff compatible obj and only gives pixels from that subrect
  : zgfx_makeSubRect
  # ( src width height -- objref )
  .dhw zobj_HERE
  .dhw @
  .dhw >R             # ( s w h ) R:( objref )
  .dhw (LIT)
  .dhw <header tbc>
  .dhw zobj_,         # ( s w h ) R:( objref )
  .dhw (LIT)
  .dhw zobj_(SubRect) # ( s w h xt ) R:( objref )
  .dhw zobj_,         # ( s w h ) R:( objref )
  .dhw SWAP
  .dhw R@             # ( s h w objref ) R:( objref )
  .dhw LIT_0
  .dhw zobj_dat!      # ( s h ) R:( objref )
  .dhw R@
  .dhw LIT_1          # ( s h objref 1 ) R:( objref )
  .dhw zobj_dat!      # ( s ) R:( objref )
  .dhw R@
  .dhw LIT_0
  .dhw zobj_ref!      # ( ) R:( objref )
  .dhw R>
  .dgw EXIT

  : zobj_(SubRect)
  # ( ... argN verb self -- ... )
  .dhw OVER zgfx_verb_getWidth  = NOT (BRZ) zgfx_common_getWidth
  .dhw OVER zgfx_verb_getHeight = NOT (BRZ) zgfx_common_getHeight
  .dhw OVER zgfx_verb_getPixel  = NOT (BRZ) zfgx_(SubRect)_xxxPixel
  .dhw OVER zgfx_verb_putPixel  = NOT (BRZ) zfgx_(SubRect)_xxxPixel
  .dhw (ABORT\")
  .utf8_hwc "SubRect does not understand method selector or verb"
  : zgfx_(SubRect)_xxxPixel
  # ( (colour) x y (2|3) verb objref -- )
  .dhw SWAP        # ( (colour) x y (2|3) objref verb ) R:( )
  .dhw >R          # ( (colour) x y (2|3) objref ) R:( verb )
  .dhw SWAP        # ( (colour) x y objref (2|3) ) R:( verb )
  .dhw >R          # ( (colour) x y objref ) R:( verb arity )
  .dhw >R          # ( (colour) x y ) R:( verb arity objref )
  .dhw LIT_0       # ( (colour) x y 0 ) R:( verb arity objref )
  .dhw zgfx_verb_getHeight # ( (colour) x y 0 v ) R:( verb arity objref )
  .dhw R@          # ( (colour) x y 0 v objref ) R:( verb arity objref )
  .dhw zobj_invoke # ( (colour) x y height 1 ) R:( verb arity objref )
  .dhw DROP        # ( (colour) x y height ) R:( verb arity objref )
  .dhw %           # ( (colour) x y_%ed ) R:( verb arity objref )
  .dhw SWAP        # ( (colour) y_%ed x ) R:( verb arity objref )
  .dhw LIT_0       #
  .dhw zgfx_verb_getWidth #
  .dhw R@
  .dhw zobj_invoke # ( (colour) y_%ed x width 1 ) R:( verb arity objref )
  .dhw DROP
  .dhw %
  .dhw SWAP        # ( (colour) x_%ed y_%ed ) R:( verb arity objref )
  .dhw R>          # ( (colour) x_%ed y_%ed objref ) R:( verb arity )
  .dhw R>          # ( (colour) x_%ed y_%ed objref arity ) R:( verb )
  .dhw SWAP
  .dhw R>
  .dhw SWAP        # ( (colour) x_%ed y_%ed arity verb objref ) R:( )
  .dhw LIT_0
  .dhw zobj_refs@  # ( (colour) x_%ed y_%ed arity verb delegated_to )
  .dhw (JMP)
  .dhw zobj_invoke

  // Translate  ref to PixBuff, translates coordnates by offset
  : zfgx_makeTranslate
  # ( src offset_x offset_y -- objref )
`);
export { src };
