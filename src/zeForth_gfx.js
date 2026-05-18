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

  def("zgfx_(PixBuff)");   // ( ... argN verb self -- ... )
  dat("OVER", "zgfx_verb_getWidth",  "=", "NOT", "(BRZ)", "zgfx_common_getWidth");
  dat("OVER", "zgfx_verb_getHeight", "=", "NOT", "(BRZ)", "zgfx_common_getHeight");
  dat("OVER", "zgfx_verb_getPixel",  "=", "NOT", "(BRZ)", "zfgx_(PixBuff)_getPixel");
  dat("OVER", "zgfx_verb_putPixel",  "=", "NOT", "(BRZ)", "zfgx_(PixBuff)_putPixel");
  dat("(ABORT\")");
  asciic("PixBuff does not understand method selector or verb");
  def("zgfx_(PixBuff)_xxxPixel"); // ( (colour) x y objref -- (colour) offset r objref )
  dat(">R");          // ( (colour) x y ) R:( objref )
  dat("LIT_0");       // ( (colour) x y 0 ) R:( objref )
  dat("zgfx_verb_getWidth"); //
  dat("R@");          // ( (colour) x y 0 getWidth_verb or ) R:( objref )
  dat("zobj_invoke"); // ( (colour) x y width 1 ) R:( objref )
  dat("DROP");        // ( (colour) x y width ) R:( objref )
  dat("*");           // ( (colour) x y*w ) R:( objref )
  dat("+");           // ( (colour) x+y*w )
  dat("R@", "LIT_2", "zobj_dat@"); // ( (colour) pixelNr bbp )
  dat("/%");          // ( (colour) offset r )
  dat("SWAP");        // ( (colour) r offset )
  dat("3+",);         // ( (colour) r offset+3 )
  dat("SWAP");        // ( (colour) offset+3 r )
  dat("R>");          // ( (colour) offset+3 r objref )
  dat("EXIT");        //
  def("zgfx_(PixBuff)_getPixel"); // ( x y 2 zgfx_verb_getPixel objref -- colour )
  dat("LIT_2");                   // ( x y 2 v objref 2 )
  dat("zgfx_too_few_or_many_args?"); // ( x y 2 v objref )
  dat(">R");                      // ( x y 2 v ) R:( objref )
  dat("2DROP");                   // ( x y ) R:( objref )
  dat("R@");                      // ( x y objref ) R:( objref )
  dat("zgfx_(PixBuff)_xxxPixel"); // ( offset r objref )
  dat("ROT");                     // ( r objref offset )
  dat("zobj_dat@");
`);
export { src };
