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

  : zgfx_common_delegate
  # ( ... argN verb obj -- ... )
  .dhw LIT_0
  .dhw zobj_refs@
  .dhw (JMP)
  .dhw zobj_invoke
  
  : zgfx_common_getWidth
  # ( ... argN verb obj -- width 1 )
  .dhw LIT_0
  .dhw zgfx_too_few_or_many_args?
  .dhw 2NIP
  .dhw LIT_0
  .dhw zobj_dat@
  .dhw LIT_1
  .dhw EXIT
  
  : zgfx_common_getHeight
  # ( verb obj -- height 1 )
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

  : zgfx_make_common2
  # ( src datum1 datum2 invication_handler_xt -- objref )
  .dhw zobj_HERE
  .dhw @              # ( s w h xt objref ) R:( )
  .dhw >R             # ( s w h xt ) R:( objref )
  .dhw (LIT)          # ( s w h xt hdr ) R:( objref )
  .dhw <header tbc>
  .dhw zobj_,         # ( s w h xt ) R:( objref )
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
  .dhw EXIT

  // Subrect references PixBuff compatible obj and only gives pixels from that subrect
  : zgfx_makeSubRect
  # ( src width height -- objref )
  .dhw (LIT)
  .dhw zobj_(SubRect) # ( s w h xt ) R:( objref )
  .dhw (JMP)
  .dhw zgfx_make_common2

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
  .dhw (LIT)
  .dhw zgfx_(Translate)
  .dhw (JMP)
  .dhw zgfx_make_common2
  
  : zgfx_(Translate)
  # ( ... argN verb self -- ... )
  .dhw OVER zgfx_verb_getPixel  = NOT (BRZ) zfgx_(Translate)_xxxPixel
  .dhw OVER zgfx_verb_putPixel  = NOT (BRZ) zfgx_(Translate)_xxxPixel
  .dhw (JMP) zgfx_common_delegate
  : zgfx_(Translate)_xxxPixel
  # ( (colour) x y arity verb self )
  .dhw SWAP           # ( (colour) x y arity self verb ) R:( )
  .dhw >R
  .dhw SWAP
  .dhw >R
  .dhw >R             # ( (colour) x y ) R:( verb arity self )
  .dhw LIT_1          # ( (colour) x y 1 ) R:( verb arity self )
  .dhw R@             # ( (colour) x y 1 self ) R:( verb arity self )
  .dhw zobj_dat@      # ( (colour) x y offset_y ) R:( verb arity self )
  .dhw +              #
  .dhw SWAP           #
  .dhw LIT_0          #
  .dhw R@             #
  .dhw zobj_dat@      #
  .dhw +              #
  .dhw SWAP           # ( (colour) x_offsetted y_offsetted ) R:( verb arity self )
  : zgfx_(Translate)_xxxPixel_L0
  .dhw R>
  .dhw R>
  .dhw SWAP           # ( (colour) x_offsetted y_offsetted arity self ) R:( verb )
  .dhw R>
  .dhw SWAP           # ( (colour) x_offsetted y_offsetted arity verb self ) R:( )
  .dhw (JMP)
  .dhw zgfx_common_delegate

  : zgfx_make_common1
  # ( src invocation_handler_xt -- objref )
  .dhw zobj_HERE      # ( src xt varaddr )
  .dhw @              # ( src xt objref )
  .dhw >R             # ( src xt ) R:( objref )
  .dhw (LIT)          # ( src xt hdr ) R:( objref )
  .dhw <header tbc>
  .dhw zobj_,         # ( src xt ) R:( objref )
  .dhw zobj_,         # ( src ) R:( objref )
  .dhw LIT_0          # ( src 0 ) R:( objref )
  .dhw R@             # ( src 0 objref ) R:( objref )
  .dhw zobj_refs!     # ( ) R:( objref )
  .dhw R>             # ( objref ) R:( )
  .dhw EXIT

  # 90°rotate  ref to PixBuff, rotate coordnates clockwise 90°
  : zgfx_make90°rotate_clockwise
  # ( src -- objref )
  .dhw (LIT)
  .dhw zgfx_(90°rotate_clockwise)
  .dhw (JMP)
  .dhw zgfx_make_common1

  : zgfx_(90°rotate_clockwise)
  # ( ... argN verb self -- ... )
  .dhw OVER zgfx_verb_getPixel  = NOT (BRZ) zgfx_(90°rotate_clockwise)_xxxPixel
  .dhw OVER zgfx_verb_putPixel  = NOT (BRZ) zgfx_(90°rotate_clockwise)_xxxPixel
  .dhw (JMP) zgfx_common_delegate
  : zgfx_(90°rotate_clockwise)_xxxPixel
  # ( (colour) x y arity verb self )
  .dhw SWAP           # ( (colour) x y arity self verb ) R:( )
  .dhw >R
  .dhw SWAP
  .dhw >R
  .dhw >R             # ( (colour) x y ) R:( verb arity self )
  .dhw LIT_0
  .dhw (LIT)
  .dhw zgfx_verb_getWidth
  .dhw R@
  .dhw zobj_invoke
  .dhw DROP           # ( (colour) x y width ) R:( verb arity self )
  .dhw SWAP           # ( (colour) x width y ) R:( verb arity self )
  .dhw -              # ( (colour) x new_x ) R:( verb arity self )
  .dhw SWAP           # ( (colour) new_x new_y ) R:( verb arity self )
  .dhw (JMP)
  .dhw zgfx_(Translate)_xxxPixel_L0

  # FlipVert   ref to PixBuff, flip the y axis so positive x coords are negative from bottom edge
  : zgfx_makeFlipVert
  # ( src -- objref )
  .dhw (LIT)
  .dhw zgfx_(FlipVert)
  .dhw (JMP)
  .dhw zgfx_make_common1

  : zgfx_(FlipVert)
  # ( ... argN verb self -- ... )
  .dhw OVER zgfx_verb_getPixel  = NOT (BRZ) zgfx_(FlipVert)_xxxPixel
  .dhw OVER zgfx_verb_putPixel  = NOT (BRZ) zgfx_(FlipVert)_xxxPixel
  .dhw (JMP) zgfx_common_delegate
  : zgfx_(FlipVert)_xxxPixel
  # ( (colour) x y arity verb self )
  .dhw SWAP           # ( (colour) x y arity self verb ) R:( )
  .dhw >R
  .dhw SWAP
  .dhw >R
  .dhw >R             # ( (colour) x y ) R:( verb arity self )
  .dhw LIT_0
  .dhw (LIT)
  .dhw zgfx_verb_getHeight
  .dhw R@
  .dhw zobj_invoke
  .dhw DROP           # ( (colour) x y height ) R:( verb arity self )
  .dhw SWAP
  .dhw -
  .dhw (JMP)
  .dhw zgfx_(Translate)_xxxPixel_L0

  # FlipHorz   ref to PixBuff, flip the x axis so positive y coords are negative from right edge
  : zgfx_makeFlipHorz
  # ( src -- objref )
  .dhw (LIT)
  .dhw zgfx_(FlipHorz)
  .dhw (JMP)
  .dhw zgfx_make_common1

  : zgfx_(FlipHorz)
  # ( ... argN verb self -- ... )
  .dhw OVER zgfx_verb_getPixel  = NOT (BRZ) zgfx_(FlipHorz)_xxxPixel
  .dhw OVER zgfx_verb_putPixel  = NOT (BRZ) zgfx_(FlipHorz)_xxxPixel
  .dhw (JMP) zgfx_common_delegate
  : zgfx_(FlipVert)_xxxPixel
  # ( (colour) x y arity verb self )
  .dhw SWAP           # ( (colour) x y arity self verb ) R:( )
  .dhw >R
  .dhw SWAP
  .dhw >R
  .dhw >R             # ( (colour) x y ) R:( verb arity self )
  .dhw SWAP           # ( (colour) y x ) R:( verb arity self )
  .dhw LIT_0
  .dhw (LIT)
  .dhw zgfx_verb_getWidth
  .dhw R@
  .dhw zobj_invoke
  .dhw DROP           # ( (colour) y x width ) R:( verb arity self )
  .dhw SWAP
  .dhw -
  .dhw SWAP
  .dhw (JMP)
  .dhw zgfx_(Translate)_xxxPixel_L0

  # ScaleUp integerwise
  : zgfx_makeScaleUpInt
  # ( src x_multiplier y_multiplier -- objref )
  .dhw (LIT)
  .dhw zgfx_(ScaleUpInt)
  .dhw (JMP)
  .dhw zgfx_make_common2

  : zgfx_(ScaleUpInt)
  # ( ... argN verb self -- ... )
  .dhw OVER zgfx_verb_getPixel  = NOT (BRZ) zgfx_(ScaleUpInt)_xxxPixel
  .dhw OVER zgfx_verb_putPixel  = NOT (BRZ) zgfx_(ScaleUpInt)_xxxPixel
  .dhw (JMP) zgfx_common_delegate
  : zgfx_(ScaleUpInt)_xxxPixel
  # ( (colour) x y arity verb self )
  .dhw SWAP           # ( (colour) x y arity self verb ) R:( )
  .dhw >R
  .dhw SWAP
  .dhw >R
  .dhw >R             # ( (colour) x y ) R:( verb arity self )
  .dhw LIT_1          # ( (colour) x y 1 ) R:( verb arity self )
  .dhw R@             # ( (colour) x y 1 self ) R:( verb arity self )
  .dhw zobj_dat@      # ( (colour) x y y_multiplier ) R:( verb arity self )
  .dhw /              # ( (colour) x new_y ) R:( verb arity self )
  .dhw SWAP           # ( (colour) new_y x ) R:( verb arity self )
  .dhw LIT_0
  .dhw R@
  .dhw zobj_dat@      # ( (colour) new_y x x_multiplier ) R:( verb arity self )
  .dhw /
  .dhw SWAP
  .dhw (JMP)
  .dhw zgfx_(Translate)_xxxPixel_L0

  # ScaleDown integerwise
    : zgfx_makeScaleDownInt
  # ( src x_divider y_divider -- objref )
  .dhw (LIT)
  .dhw zgfx_(ScaleDownInt)
  .dhw (JMP)
  .dhw zgfx_make_common2

  : zgfx_(ScaleDownInt)
  # ( ... argN verb self -- ... )
  .dhw OVER zgfx_verb_getPixel  = NOT (BRZ) zgfx_(ScaleDownInt)_xxxPixel
  .dhw OVER zgfx_verb_putPixel  = NOT (BRZ) zgfx_(ScaleDownInt)_xxxPixel
  .dhw (JMP) zgfx_common_delegate
  : zgfx_(ScaleDownInt)_xxxPixel
  # ( (colour) x y arity verb self )
  .dhw SWAP           # ( (colour) x y arity self verb ) R:( )
  .dhw >R
  .dhw SWAP
  .dhw >R
  .dhw >R             # ( (colour) x y ) R:( verb arity self )
  .dhw LIT_1          # ( (colour) x y 1 ) R:( verb arity self )
  .dhw R@             # ( (colour) x y 1 self ) R:( verb arity self )
  .dhw zobj_dat@      # ( (colour) x y y_divider ) R:( verb arity self )
  .dhw *
  .dhw LIT_0
  .dhw R@
  .dhw zobj_dat@      # ( (colour) new_y x x_multiplier ) R:( verb arity self )
  .dhw *
  .dhw SWAP
  .dhw (JMP)
  .dhw zgfx_(Translate)_xxxPixel_L0

  # PaletteTranslate  ref to PixBuff  ref to Palette
  : zgfx_makePaletteTranslate
  # ( src palette -- obj )
  .dhw zobj_HERE
  .dhw @             # ( src pal objref )
  .dhw (LIT)
  .dhw <header tbc>
  .dhw zobj_,
  .dhw (LIT)
  .dhw zgfx_(PaletteTranslate)
  .dhw zobj_,
  .dhw LIT_1
  .dhw R@            # ( src pal 1 objref ) R:( objref )
  .dhw zobj_refs!    # ( src ) R:( objref )
  .dhw LIT_0
  .dhw R@            # ( src 0 objref ) R:( objref )
  .dhw zobj_refs!    # ( )
  .dhw R>
  .dhw EXIT

  : zgfx_(PaletteTranslate)
    # ( ... argN verb self -- ... )
  .dhw OVER zgfx_verb_getPixel  = NOT (BRZ) zgfx_(PaletteTranslate)_getPixel
  .dhw OVER zgfx_verb_putPixel  = NOT (BRZ) zgfx_(PaletteTranslate)_putPixel
  .dhw (JMP) zgfx_common_delegate
  : zgfx_(PaletteTranslate)_getPixel
  # ( x y 2 verb self -- colour 1 )
  .dhw >R            # ( x y 2 verb ) R:( self )
  .dhw LIT_0         # ( x y 2 verb 0 ) R:( self )
  .dhw R@            # ( x y 2 verb 0 self ) R:( self )
  .dhw zobj_refs@    # ( x y 2 verb src ) R:( self )
  .dhw zobj_invoke   # ( idx 1 ) R:( self )
  .dhw zobj_verb_at  # ( idx 1 at ) R:( self )
  .dhw LIT_1         # ( idx 1 at 1 ) R:( self )
  .dhw R>            # ( idx 1 at 1 self ) R:( )
  .dhw zobj_refs@    # ( idx 1 at pal ) R:( )
  .dhw zobj_invoke   # ( colour 1 ) R:( )
  .dhw EXIT

  : zgfx_make_SlantVert
  # ( src stepsize -- objref )
  .dhw zobj_HERE @   # ( src stepsize objref )
  .dhw >R            # ( src stepsize ) R:( objref )
  .dhw LIT_1 DUP     # ( src stepsize 1 1 ) R:( objref )
  .dhw zobj_makeHDR  # ( src stepsize hdr ) R:( objref )
  .dhw zobj_,        # ( src stepsize ) R:( objref )
  .dhw (LIT)
  .dhw zgfx_(SlantVert)
  .dhw zobj_,        # ( src stepsize ) R:( objref )
  .dhw LIT_2         # ( src stepsize 2 ) R:( objref )
  .dhw zobj_allot    # ( src stepsize ) R:( objref )
  .dhw R@            # ( src stepsize objref ) R:( objref )
  .dhw LIT_0         # ( src stepsize objref 0 ) R:( objref )
  .dhw zobj_dat!     # ( src ) R:( objref )
  .dhw R@            # ( src objref ) R:( objref )
  .dhw LIT_0         # ( src objref 0 ) R:( objref )
  .dhw zobj_ref!     # ( ) R:( objref )
  .dhw R>            # ( objref ) R:( )
  .dhw EXIT

  : zgfx_(SlantVert)
  # ( ... arity verb self -- ... return_arity )
  .dhw OVER zgfx_verb_getPixel  = NOT (BRZ) zgfx_(SlantVert)_xxxPixel
  .dhw OVER zgfx_verb_putPixel  = NOT (BRZ) zgfx_(SlantVert)_xxxPixel
  .dhw (JMP) zgfx_common_delegate
  : zgfx_(SlantVert)_xxxPixel
  # ( (color) x y arity verb self )
  .dhw -ROT          # ( (color) x y self arity verb ) R:( )
  .dhw >R >R >R      # ( (color) x y ) R:( verb arity self )
  .dhw --merkill--

  
  # Like bitplanes but if a pixel bit is on then the colour is spefic opaque
  # if it is off then its delegated.
  # Achived by 1x1 PixBuff, bitmask, and BlitComposer
`);
export { src };
