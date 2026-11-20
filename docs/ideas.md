
One idea is to have in the Tymnet equiv Recieptionist LocalUserDirectory
the username ANONYMOUS or ZOFT whose LUD key is to a domain
that builds another domain that responds with (when login string terminator is CR):

```txt
YYYY-MM-DDThh:mm:ssZ Welcome to ZOFT services. LOGIN timeout is 120 seconds.
type 'm' 'menu' (without quotes) and carrage return to get menu.
>
```

And the menu:
```txt
>menu
  'login <UID>' logs in under User/Unique/Utility-IDentifier account
  'establish'   establish such an account
  'paymir'      gives you access to paymir cheques/coupon services
  'logout'      disconnects the circuit
  'logoff'      ditto
```

The paymir (a slight pun on the old now discontinued russian paymer service)
provides nearly the same service as the USER.PUB.ZOFT.PAYMIR key does:

1. Verify (only cheques/coupons serial number required.)
   Gives back amount (both how much and brand like Agoric.com ERTP uses)
   tbd: and the date of issuance in rfc3339 format.
2. Change passcode (both serial number and old passcode required. Also requires new passcode twice)
3. Transfer (requires serial number and passcode of the cheque/coupon from which to draw, the amount, and the serial number if the destination cheque/coupon)
4. Split    (requires serial number and passcode of the cheque/coupon from which to draw and (an array of) the amount(s))
   Gives back (an array of) serial number and passcode of the new cheque(s)/coupon(s)
5. Merge

And two more that is only available via aforesaid key:

6. Issue (requires a key to an [Account](http://cap-lore.com/CapTheory/KK/m/154.html#account) to draw from and the amount to draw)
   Returns in the return string ((1:snlen)(snlen:serial_number)(1:pclen)(pclen:passcode))
7. Withdraw (requires a key to an Account to withdraw to, the serial number and passcode of the cheque/coupon)

Basically see [this](https://community.spritely.institute/t/approaches-to-delay-tolerant-networking/352/13?u=zarutian)

The 'establish' option responds with:

```txt
  To establish a ZOFT account you are require to give a valid paymir cheque/coupon
  of at least 250 T(ymshare/ilda)/Z(oft/arutia's)ResourceUnits for randomly-genetated UID.
  Such account lasts at least 96 hours.
  To pick your an UID of your choice 250 ZRUs (pronounced shrews) extra is required.
```
  In the DIRECTORY that is given to the newly established users Context Switcher and Command Systems will be the following keys:
    PUB per usual
    ACCOUNT (branded ZRU)
    SPACEBANK that buys pages and nodes from a ZOFT spacebank billing aforesaid ACCOUNT
    METER that bills to same ACCOUNT
    Change ZLUD key that works the same as Tymnet receiptionst LUD change but for ZOFT only

(For rehistory: This would have lived on Tymnet hostnr 2686)

