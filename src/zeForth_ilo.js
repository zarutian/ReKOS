// References:
//   https://konilo.org/ilo.txt
//   https://9fans.github.io/plan9port/man/man4/9pfuse.html
//   https://9fans.github.io/plan9port/man/man9/intro.html
//   9p tcp and udp portnr 564
//   https://github.com/zzJinux/simpletun/blob/master/simpletun.c
//     2 bytes length (big endian)
//
const src = `
  .def ilo_nop 0x00
  .def ilo_li  0x01  # literal
  .def ilo_du  0x02  # duplicate
  .def ilo_dr  0x03  # drop
  .def ilo_sw  0x04  # swap
  .def ilo_pu  0x05  # >R
  .def ilo_po  0x06  # R>
  .def ilo_ju  0x07  # jump
  .def ilo_ca  0x08  # call
  .def ilo_cc  0x09  # conditional call
  .def ilo_cj  0x0A  # conditional jump
  .def ilo_re  0x0B  # return
  .def ilo_eq  0x0C  # compare two values for equality.   a == b
  .def ilo_ne  0x0D  # compare two values for inequality. a != b
  .def ilo_lt  0x0E  # compare two values for less than.  a < b 
  .def ilo_gt  0x0F  # compare two values for greater than. a > b
  .def ilo_fe  0x10  # fetch a stored value in memory
  .def ilo_st  0x11  # store a value into memory 
  .def ilo_ad  0x12  # add two numbers. a + b
  .def ilo_su  0x13  # subtract two numbers. a - b  
  .def ilo_mu  0x14  # multiply two numbers. a * b 
  .def ilo_di  0x15  # divide and get remainder. a % b, a / b 
  .def ilo_an  0x16  # bitwise and 
  .def ilo_or  0x17  # bitwise or
  .def ilo_xo  0x18  # bitwise xor
  .def ilo_sl  0x19  # shift left. a << b
  .def ilo_sr  0x1A  # shift right. a >> b 
  .def ilo_cp  0x1B  # compare two memory regions 
  .def ilo_cy  0x1C  # copy memory                               |
  .def ilo_io  0x1D  # perform i/o operation

`;
