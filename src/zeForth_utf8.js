const src = `
  :f utf8_is_full_codepoint
  # ( addr len -- flag )
  .dhw 2DUP 1= SWAP BYTE@ 0x80& CLEANBOOL INVERT &
  .dhw (BRZ) utf8_is_full_codepoint_L0
  # the ASCII subset
  .dhw 2DROP (JMP) TRUE
  : utf8_is_full_codepoint_L0
  .dhw OVER BYTE@ 0xC0& 0x80 =
  .dhw (BRZ) utf8_is_full_codepoint_L1
  # starting in the middle of a codepoint
  .dhw 2DROP (JMP) FALSE
  : utf8_is_full_codepoint_L1
  .dhw OVER BYTE@ CountLeadingOnesInByte # ( addr len count )
  .dhw 2DUP < (BRZ) utf8_is_full_codepoint_L2
  .dhw 3DROP (JMP) FALSE
  : utf8_is_full_codepoint_L2
  .dhw NIP >R 1+ (JMP) utf8_is_full_codepoint_L5
  : utf8_is_full_codepoint_L3
  .dhw DUP BYTE@ 0xC0& 0x80 =
  .dhw INVERT (BRZ) utf8_is_full_codepoint_L4
  .dhw DROP RDROP (JMP) FALSE
  : utf8_is_full_codepoint_L4
  .dhw 1+
  : utf8_is_full_codepoint_L5
  .dhw (NEXT) utf8_is_full_codepoint_L3
  .dhw DROP (JMP) TRUE
`;
export { src };
