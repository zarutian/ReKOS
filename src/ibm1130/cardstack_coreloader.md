
See Figure 12 page 62 of [Disk Monitor v1 Reference](http://media.ibm1130.org/1130-055-ocr.pdf) for what kind of cards are to be loaded.
See [this](https://www.ibm1130.net/functional/index.html) on how to read cards and the restriction on the loader card.

```txt

Loader card:
           rows                   cell in core
            11                            ==111111
            210123456789   addr   01234___89012345
column 0: 0b000000000000 0x0000 0b0000000000000000  NOP
       1:
```
