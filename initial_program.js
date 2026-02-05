
import { src as zeForth_src } from "./zeForth.js";

const src = `

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
  .ddw 0x63xxxxxx_6000_0010 # 0x000014  CCW: Define Extent  parameter bytes at xxxxxx in memory
  .ddw 0x43xxxxxx_6000_0008 # 0x00001C  CCW: Locate         parameter bytes at xxxxxx in memory
  .ddw 0x42002000_6000_8000 # 0x000024  CCW: Read           read the blocks into memory
  .ddw 0x4200A000_6000_8000 # 0x00002C  CCW: Read           - || -
  .ddw 0x42012000_6000_8000 # 0x000034  CCW: Read           - || -
  .ddw 0x4201A000_2000_8000 # 0x00003C  CCW: Read           - || -
                            # 0x000044
  .org 0x000060
  : params_for_Define_Extent
  .db  

`;
