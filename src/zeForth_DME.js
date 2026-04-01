const src =`
  :f NIP_0
  .dhw NIP 0 EXIT

  :f >
  .dhw SWAP < EXIT

  :f >=
  .dhw 2DUP > >R = R> OR EXIT

  :f decode_diffManchesterEncoding_discernAbit
  # ( clk_cnt accumulator -- bit )
  .dhw 1 INVERT & 1>>  # clean out the last bit
  .dhw SWAP 2* >= EXIT 

  :f decode_diffManchesterEncoding
  # ( src_addr src_len dest_addr max_len -- len_r len_q )
  # source is a bytestring where each byte is 0bLLLLLLLI sample
  # where L is unsigned time Length and I is bIt value of the sample
  # time unit not specified
  # destination is a bytestring
  # len_q (quotent) is the length of the bytestring
  # len_r (reminder) is the remaining length in bits of decoded data
  # len_r will be higher than 7 if decoded data is longer than max_len
  .dhw 8*
  .dhw -QROT       # ( max_len*8 src_addr src_len dest_addr ) R:( )
  .dhw SWAP >R     # ( max_len*8 src_addr dest_addr ) R:( src_len )
  .dhw 0 DUP DUP   # ( max_len*8 src_addr dest_addr byte clk_cnt accum ) R:( src_len )
  .dhw (JMP) decode_diffManchesterEncoding_L4
  : decode_diffManchesterEncoding_L0
                   # ( max_len*8 src_addr dest_addr byte clk_cnt accum ) R:( src_len )
  .dhw QROT >R     # ( max_len*8 src_addr byte clk_cnt accum ) R:( src_len dest_addr )
  .dhw QROT DUP >R # ( max_len*8 byte clk_cnt accum src_addr ) R:( src_len dest_addr src_addr )
  .dhw C@          # ( max_len*8 byte clk_cnt accum sample   ) R:( src_len dest_addr src_addr )
  .dhw 2DUP        # ( max_len*8 byte clk_cnt accum sample accum sample ) R:( src_len dest_addr src_addr )
  .dhw 1& SWAP 1&  # ( max_len*8 byte clk_cnt accum sample sbit abit ) R:( src_len dest_addr src_addr )
  .dhw XOR         # ( max_len*8 byte clk_cnt accum sample change? ) R:( src_len dest_addr src_addr )
  .dhw SWAP >R     # ( max_len*8 byte clk_cnt accum change? ) R:( src_len dest_addr src_addr sample )
  .dhw DUP  >R     # ( max_len*8 byte clk_cnt accum change? ) R:( src_len dest_addr src_addr sample change? )
  .dhw (BRZ) decode_diffManchesterEncoding_L1
  .dhw 2DUP
  .dhw decode_diffManchesterEncoding_discernAbit
  .dhw 1& >R ROT   # ( max_len*8 clk_cnt accum byte )  R:( src_len dest_addr src_addr sample change? bit )
  .dhw 1<< R> OR   # ( max_len*8 clk_cnt accum byte' ) R:( src_len dest_addr src_addr sample change? )
  .dhw QROT 1-     #
  .dhw DUP 0<=
  .dhw (BRNZ) decode_diffManchesterEncoding_L3
  .dhw DUP >R      # ( clk_cnt accum byte' max_len*8 ) R:( src_len dest_addr src_addr sample change? max_len*8 )
  .dhw 8_%         # ( clk_cnt accum byte' reminder )  R:( src_len dest_addr src_addr sample change? max_len*8 )
  .dhw R> SWAP >R  #
  .dhw -QROT       # ( max_len*8 clk_cnt accum byte' ) R:( src_len dest_addr src_addr sample change? reminder )
  .dhw R>          # ( max_len*8 clk_cnt accum byte' reminder ) R:( src_len dest_addr src_addr sample change? )
  .dhw (BRNZ) decode_diffManchesterEncoding_L2
  .dhw R> R> R> R> # ( max_len*8 clk_cnt accum byte' change? sample src_addr dest_addr ) R:( src_len )
  .dhw -QROT       # ( max_len*8 clk_cnt accum byte' dest_addr change? sample src_addr ) R:( src_len )
  .dhw >R >R >R    #
  .dhw DUP 1+ >R   # ( max_len*8 clk_cnt accum byte' dest_addr ) R:( src_len src_addr sample change? dest_addr+1 )
  .dhw C! 0        # ( max_len*8 clk_cnt accum zero ) R:( src_len src_addr sample change? dest_addr+1 )
  .dhw R> R> R> R> # ( max_len*8 clk_cnt accum zero dest_addr+1 change? sample src_addr ) R:( src_len )
  .dhw QROT        # ( max_len*8 clk_cnt accum zero change? sample src_addr dest_addr+1 ) R:( src_len )
  .dhw >R >R >R >R # ( max_len*8 clk_cnt accum zero ) R:( src_len dest_addr+1 src_addr sample change? )
  : decode_diffManchesterEncoding_L2
  .dhw -ROT        # ( max_len*8 byte clk_cnt accum ) R:( src_len dest_addr src_addr sample change? )
  .dhw DUP 1& >R
  .dhw 2DUP
  .dhw decode_diffManchesterEncoding_discernAbit
  .dhw INVERT
  .dhw SKZ 1>>     # if databit was one then half the accumulator
  .dhw 1>>         # take into account that lsb of accum is last bit
  .dhw + 2/        # average last clk_cnt and the value of the accumulator together
  .dhw R>          # ( max_len*8 byte clk_cnt' last_bit ) R:( src_len dest_addr src_addr sample change? )
  .dhw INVERT 1&   # ( max_len*8 byte clk_cnt' ~last_bit ) R:( src_len dest_addr src_addr sample change? )
  : decode_diffManchesterEncoding_L1
  .dhw R> R> SWAP  # ( max_len*8 byte clk_cnt accum sample change? ) R:( src_len dest_addr src_addr )
  .dhw SKZ NIP_0
  .dhw 0xFE& +     # ( max_len*8 byte clk_cnt accum' ) R:( src_len dest_addr src_addr )
  .dhw R> 1+       # ( max_len*8 byte clk_cnt accum src_addr+1 ) R:( src_len dest_addr )
  .dhw -QROT       # ( max_len*8 src_addr+1 byte clk_cnt accum ) R:( src_len dest_addr )
  .dhw R> -QROT    # ( max_len*8 src_addr+1 dest_addr byte clk_cnt accum ) R:( src_len )
  : decode_diffManchesterEncoding_L4
  .dhw (NEXT) decode_diffManchesterEncoding_L0
  .dhw 2DROP       # ( max_len*8 src_addr+1 dest_addr+n byte ) R:( )
  .dhw ROT DROP    # ( max_len*8 dest_addr+n byte )
  .dhw ROT 8/%     # ( dest_addr+n byte r q ) R:( )
  .dhw >R DUP      # ( dest_addr+n byte r r ) R:( q )
  .dhw (BRNZ) decode_diffManchesterEncoding_L5
  .dhw >R 2DROP    # ( ) R:( q r )
  .dhw R> R> EXIT  # ( r q ) R:( )
  : decode_diffManchesterEncoding_L5
  .dhw DUP >R 
  .dhw 8 SWAP - >>
  .dhw SWAP C!     # ( ) R:( q r )
  .dhw R> R> EXIT  #
  : decode_diffManchesterEncoding_L3
  
`;
export { src };
