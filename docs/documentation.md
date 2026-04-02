
#### 2026-03-01T15:00 ####

Been trying to suss out the bitpatterns of KeyKos keys.
There are references in the manual to enum in an assembler source file. A file that I do not have.

I have found out that in KeyKos keys are 12 bytes on disk and 16 bytes in memory. (See prepared keys)

The kernel implementation manual indicates that base key types are at most 32, the bits 3-7 (IBM way) of the first byte of a key. The key type byte (not to be confused with KT returncodes).

I have decided on the following key type byte enumeration (subject to change and updates):
```
  0b___00000  Data key
  0b___00001  -tbd-
  0b___00010  Page key (read only)
  0b___00011  Page key (read/write)
  0b___00100  Device key
  0b___00101  -tbd-
  0b___00110  Page Range Key
  0b___00111  Node Range Key
  0b___01000  Node key
  0b___01001  Segmode key (also a node key)
  0b___01010  Meter key (also a node key)
  0b___01011  Domain key (also a node key)
  0b___01100  Start key to a domain (also a node key)
  0b___01101  Resume key to a domain (also a node key)
  0b___01110  -tbd-
  0b___01111  -tbd-
  0b___10000  -tbd-
  0b___10001  -tbd-
  0b___10010  -tbd-
  0b___10011  -tbd-
  0b___10100  -tbd-
  0b___10101  -tbd-
  0b___10110  -tbd-
  0b___10111  -tbd-
  0b___11000  -tbd-
  0b___11001  -tbd-
  0b___11010  -tbd-
  0b___11011  -tbd-
  0b___11100  -tbd-
  0b___11101  -tbd-
  0b___11110  zeForth kernel console input key  (follows the bytestream protocol)
  0b___11111  zeForth kernel console output key  (follows the bytestream protocol)

```

Data keys have 11 databytes, can never be revoked or prepared as such is pointless. DK(0) is shorthand for an all zeros data key.

Page keys and node keys have 6 bytes of CodedDiskAddress, a databyte, and an allocation count.

Resume keys additionally have callcount thay MUST match the callcount in the domain they refer to.
If they do not match the kernel, when it notices, turns the resume key into DK(0). Domain's callcount increaments every time it is resumed.

Device keys have 2 byte device nr (same as SUBCHAN nr) and a 'B' number.
I suspect that this 'B' number is to facilitate device key revocation upon restart.

-Zarutian

#### Various documentation links refered to:
* [Alleged KeyTypes in KeyKos](http://cap-lore.com/CapTheory/KK/m/181.html)
* [Scheduling in KeyKos](http://cap-lore.com/CapTheory/KK/m/137.html#supsched)
* [More on scheduling in KeyKos](http://cap-lore.com/CapTheory/KK/m/kl.html#scheduler)
* [IBM z/Arch PoOPs](https://www.ibm.com/docs/en/module_1678991624569/pdf/SA22-7832-14.pdf)
* [Bitsavers copy of IBM 3880 manual](http://www.bitsavers.org/pdf/ibm/3880/GA26-1661-3_IBM_3880_Storage_Control_Description_May80.pdf)
* [Bitsavers copy of IBM 370 PoOPs](http://www.bitsavers.org/pdf/ibm/370/princOps/)
* [IBM 370 system summary](https://www.bitsavers.org/pdf/ibm/370/systemSummary/GA22-7001-6_370_System_Summary_Dec76.pdf)
* [Archive.org ibm360 console]( https://archive.org/details/bitsavers_ibm360fe20terand2150ConsoleFETOPJan69_5926345)
* [Daignose Power Off in hercules360](https://github.com/SDL-Hercules-390/hyperion/blob/master/diagnose.c#L265)
* [Bitsavers copy of Channel-To-Channel-Adapter (used for Hercules Networking via TUNTAP on host)](http://www.bitsavers.org/pdf/ibm/370/CTCA/GA22-6983-0_Special_Feature_Description_Channel-to-Channel_Adapter_Mar72.pdf)
* [Hercules ctcadpt.h]( https://github.com/SDL-Hercules-390/hyperion/blob/master/ctcadpt.h) for figuring out _how_ that net interface works
* [Vendor mac address prefix list](https://gist.github.com/aallan/b4bb86db86079509e6159810ae9bd3e4)
* [IPv6 on Ethernet](https://www.rfc-editor.org/rfc/rfc2464.txt)
* [TCP rfc9293](https://www.rfc-editor.org/rfc/rfc9293.txt)
* [Copy of eForth_x86.asm](https://gist.github.com/zarutian/2fde8380eace3c3e7ab778dd9827d121)
* [Hercules config docu](https://sdl-hercules-390.github.io/html/hercconf.html)

---
* [ASCII table](https://www.asciitable.com/asciifull.gif)
* [utf-8 rfc](https://www.rfc-editor.org/rfc/rfc3629) Go a bit further and just use following on first byte in a codepoint: `( byte -- byte_count ) INVERT CountLeadingZerosInByte`. This will support up to and including seven bytes per codepoint.
* [ANSI escape codes that xterm understands](https://invisible-island.net/xterm/ctlseqs/ctlseqs.html)
* [xtermjs (for if/when a website is made)](http://xtermjs.org/)
* [asciinema (for same website purposes)](https://asciinema.org/)
* [Tmux cheatsheet (eventually for KK Context Switches etc)](https://tmuxai.dev/tmux-cheat-sheet/)
* [Ncurses](https://invisible-island.net/ncurses/)
* [Nifty 3d rendering to ASCII](https://alexharri.com/blog/ascii-rendering)
* [SSH rfc4251](https://www.rfc-editor.org/rfc/rfc4251.txt)
* [Kitty Terminal Graphics protocol](https://sw.kovidgoyal.net/kitty/graphics-protocol/)
* [stdg](https://github.com/calebwin/stdg)
* [NAPLPS](https://www.martinreddy.net/gfx/2d/NAP.txt)
---

* [Linux syscall table](https://github.com/torvalds/linux/blob/master/arch/s390/kernel/syscalls/syscall.tbl) for possible Linux Process in a KK Domain emulation
* [CloudABI](https://github.com/NuxiNL/cloudabi/blob/master/cloudabi.txt) even though that project is no longer maintained it is a nice subset.
* [QubesOs Networking](https://doc.qubes-os.org/en/latest/developer/system/networking.html)
* 
---
* [IBM 2250 links](https://sites.google.com/site/2250programminginformation/home/5-online-resources)
* [IBM 2250-4 at bitsavers](https://www.bitsavers.org/pdf/ibm/2250/A27-2723-0_2250mod4Descr.pdf)
* https://www.ibm1130.net/functional/index.html
* http://ibm1130.org/sim/downloads/
* [SAC OEM](https://archive.org/details/ibm-file-1130-19-ga-26-3645-5/page/1/mode/1up)







