
import { src as zeForth_src } from "./zeForth.js";

const src = `
  # see http://www.bitsavers.org/pdf/ibm/3880/GA26-1661-3_IBM_3880_Storage_Control_Description_May80.pdf

  .def IPL_PSW_addr   0x000000
  .def IPL_CCW1_addr  0x000008
  .def IPL_CCW2_addr  0x000010

  # we start at 0x0000 in both main storage and FixedBlockAddress image
  # due to Initial Program Load as specified in hercules.rc puts the 
  # first 512 Bytes block there
  .org 0x000000
                            # address
  .ddw IPL_PSW              # 0x000000
  .ddw IPL_CCW              # 0x000008
  .ddw 0x63000060_6000_0010 # 0x000014  CCW: Define Extent  parameter bytes at xxxxxx in memory
  .ddw 0x43xxxxxx_6000_0008 # 0x00001C  CCW: Locate         parameter bytes at xxxxxx in memory
  .ddw 0x42002000_6000_8000 # 0x000024  CCW: Read           read the blocks into memory
  .ddw 0x4200A000_6000_8000 # 0x00002C  CCW: Read           - || -
  .ddw 0x42012000_6000_8000 # 0x000034  CCW: Read           - || -
  .ddw 0x4201A000_2000_8000 # 0x00003C  CCW: Read           - || -
                            # 0x000044
  .org 0x000060
  : params_for_Define_Extent
  .db  0x40                 # 0x000060  Mask byte:  Inhibit all write operations
  .db  0x00                 # 0x000061  Must be zero
  .dhw 0x0200               # 0x000062  Block Size  512 byte
  .dw  0x000000000          # 0x000064  block offset of the extent  (in blocks)
  .dw  0x000000000          # 0x000068  relative displacement of start block (in blocks)
  .dw  0x000000000          # 0x00006C  relative displacement of end block   (in blocks)

`;
