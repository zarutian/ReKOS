
package require Tcl 8.5

# taken from https://wiki.tcl-lang.org/page/Zarutian
proc thingy {name} {
  if {[lsearch -exact [info commands] $name] != -1} {
      error "a command/thingy with $name already exists!"
  }
  namespace eval ::things::[set name] {}
  proc ::things::[set name]::self {} "return [namespace current]::$name"
  proc ::things::[set name]::initialize {args} {}
  proc ::things::[set name]::destroy {args} {
    namespace delete [namespace current]
  }
  proc ::things::[set name]::dispatch {args} {
    return [uplevel 1 $args]
  }
  proc $name args "namespace eval ::things::[set name] dispatch \$args"
}

# see https://github.com/TYMCOM-X/169281.tape/blob/61a4c1fcd77c19952506cd141ca9bb9dd0adfd4c/fremontdoc/tbase.doc
# for Lemcom '83
proc make_tymnet_adapter {tna send_base_a_packet recieptionist} {
  thingy $tna
  $tna variable sbp [set send_base_a_packet]
  $tna variable recieptionist $recieptionist
  $tna variable circuits [dict new]
  $tna variable queries2supervisor [dict new]
  $tna variable hostnr ""
  $tna variable is_shut yes
  $tna proc recieve_a_packet_from_base {packet} {
    if {![string equal "\x00\xFF" [string range $packet 0 1]]} {
      error ""
    }
    set packet_checksum [string range $packet 2 3]
    if {![string equal [Tymnet_calculate_lemcom_checksum [string range $packet 4]] $packet_checksum]} {
      # checksum errir
    }
    set packet_seqnum   [string index $packet 4]
    binary scan [string index $packet 5] H* packet_halfwordcount
    if {((0x$packet_halfwordcount - 1) * 2) != [string length $packet]} {
      # tbd: ætti þetta að vera villa eða ætti að sneiða raunpakkan framanaf $packet ?
      error ""
    }
    set packet [string range $packet 6 end]
    while {[string length $packet] > 0} {
      set message_type [string index $packet 0]
      set packet [string range $packet 1 end]
      # see APPENDIX V. Summary of Base-to-Host Messages
      switch $message_type -- -exact {
        "\x03" {
          # Reset Interface
          if {![string equal "\x00" [string index $packet 0]]} {
            error ""
          }
          set d1 [string index $packet 1]
          set d2 [string index $packet 2]
          set d3 [string index $packet 3]
          set d4 [string index $packet 4]
          set d5 [string index $packet 5]
          set d6 [string index $packet 6]
          set d7 [string index $packet 7]
          set d8 [string index $packet 8]
          set packet [string range $packet 9 end]
        }
        "\x04" {
          # Reset Acknowledge
          if {![string equal "\x00" [string index $packet 0]]} {
            error ""
          }
          set d1 [string index $packet 1]
          set d2 [string index $packet 2]
          set d3 [string index $packet 3]
          set d4 [string index $packet 4]
          set d5 [string index $packet 5]
          set d6 [string index $packet 6]
          set d7 [string index $packet 7]
          set d8 [string index $packet 8]
          set packet [string range $packet 9 end]
        }
        "\x05" {
          # Supervisor Takeover
        }
        "\x06" {
          # Externally-Initiated New Circuit
          set p [string index $packet 0]
          set packet [string range $packet 1 end]
        }
        "\x07" {
          # Internally-Initiated New Circuit
          set p [string index $packet 0]
          set packet [string range $packet 1 end]
        }
        "\x08" {
          # Backpressure On
          set p [string index $packet 0]
          set packet [string range $packet 1 end]
        }
        "\x09" {
          # Backpressure Off
          set p [string index $packet 0]
          set packet [string range $packet 1 end]
        }
        "\x0A" {
          # Character Gobbler
          set p [string index $packet 0]
          set packet [string range $packet 1 end]
        }
        "\x0B" {
          # Circuit Zapper
          set p [string index $packet 0]
          set packet [string range $packet 1 end]
        }
        "\x0C" {
          # Enter Deferred Echo Mode
          set p [string index $packet 0]
          set packet [string range $packet 1 end]
        }
        "\x0D" {
          # Leave Deferred Echo Mode
          set p [string index $packet 0]
          set packet [string range $packet 1 end]
        }
        "\x0E" {
          # Green Ball
          set p [string index $packet 0]
          set packet [string range $packet 1 end]
        }
        "\x0F" {
          # Red Ball
          set p [string index $packet 0]
          set packet [string range $packet 1 end]
        }
        "\x10" {
          # Yellow Ball
          set p [string index $packet 0]
          set packet [string range $packet 1 end]
        }
        "\x11" {
          # Orange Ball
          set p [string index $packet 0]
          set packet [string range $packet 1 end]
        }
        "\x15" {
          # Gray and Black Balls
          set p [string index $packet 0]
          set colour [string index $packet 1]
          # 0x00 Gray
          # 0xFF Black
          set packet [string range $packet 2 end]
        }
        "\x17" {
          # Supervisor Response
          set q [string index $packet 0]
          set e [string index $packet 1]
          set packet [string range $packet 2 end]
        }
        "\x1A" {
          # Test Pattern Response
          if {![string equal "\x00" [string index $packet 0]]} {
            error ""
          }
          set d1 [string index $packet 1]
          set d2 [string index $packet 2]
          set d3 [string index $packet 3]
          set d4 [string index $packet 4]
          set packet [string range $packet 5 end]
        }
        "\x20" {
          # Terminal Characteristics Response
          set p   [string index $packet 0]
          set tc  [string index $packet 1]
          set val [string index $packet 2]
          set packet [string range $packet 3 end]
        }
        "\x23" {
          # Supervisor Clock Data
          if {![string equal "\x00" [string index $packet 0]]} {
            error ""
          }
          set t1 [string index $packet 1]
          set t2 [string index $packet 2]
          set t3 [string index $packet 3]
          set t4 [string index $packet 4]
          set packet [string range $packet 5 end]
        }
        "\x2F" {
          # Break Character
          set p [string index $packet 0]
          set packet [string range $packet 1 end]
        }
        "\x30" {
          # Special Port Condition
          set p [string index $packet 0]
          set v [string index $packet 1]
          # CR Delay and Input Baud Rate
          set packet [string range $packet 2 end]
        }
        "\x37" {
          # Negative Acknowledgement
          set p [string index $packet 0]
          set packet [string range $packet 1 end]
        }
        "\x38" {
          # Environmental Data
          binary scan  [string index $packet 0] H* len
          set env_data [string range $packet 1 [expr 0x$len]]
          set packet   [string range $packet [expr 0x$len + 1]]
          set ver [string index $env_data 0]
          # ver is either 0x00 or 0x01
          set reset_cause [string index $env_data 1]
          # reset_cause is
          #   0x00 - Reset message from host
          #   0x01 - Base slot code crashed and restarted
          #   0x02 - Base timed out host
          #   0x03 - message format error in message from host
          #   0x04 - sequence error in packet from host
          #   0x05 - checksum error in packet from host
          #   0x06 - invalid message type in message from host
          #   0x07 - base slot code has been reloaded
          if {[string equal "\x01" $ver]} {
            set slot_code_version_number [string range $env_data 2 3]
            set slot_number              [string range $env_data 4 5]
            set ISIS_version_number      [string range $env_data 6 7]
            set Node_number              [string range $env_data 8 9]
            set Kernel_host_number       [string range $env_data 10 11]
          }
        }
        # 80+n, p, n bytes of data       Data Bytes
        default {
          binary scan $message_type H* n
          if {($n & 0x80) == 0x00} {
            error ""
          }
          set p [string index $packet 0]
          set data [string range $packet 1 [expr {(0x$n & 0x7F)}]]
          set packet [string range $packet [expr {(0x$n & 0x7F) + 1}] end]
        }
      }
    }
  }
  $tna proc packet_to_base {messages} {
    if {([string length $messaged] % 2) != 0} {
      append messages "\x00"
    }
    variable sbp
    variable packet_seqno
    set payload    [binary format H* [format "%02x" [expr {$packet_seqno & 0xFF}]]]
    append payload [binary format H* [format "%02x" [expr {(([string length $messages] + 6) / 2) & 0xFF}]]]
    append payload $messages
    set packet "\x00\xFF"
    append packet [Tymnet_calculate_lemcom_checksum $payload]
    append packet $payload
    $sbp $packet
    incr packet_seqno
  }
  $tna proc Reset_Interface {} {
    variable hostnr
    variable is_shut
       set msgs ""
    append msgs "\x03"; # message type is Reset Interface
    append msgs "\x00"; # filler byte
    append msgs "\xDE\xAD\xCA\xFE\xBE\xEF\xFE\xED"; # the eight d bytes
       set is_shut yes
    append msgs "\x21"; # message type is Set Host Number
    append msgs "\xFF"; # 255 ports
    append msgs [string range [binary format H* [format "%04x" $hostnr]] 0 1]
    append msgs "\x01"; # message type is Host is Open
       set is_shut no
    append msgs "\x22"; # message type is Supervisor Clock Request
    packet_to_base $msgs
  }
  $tna proc build_Aux_Circuit {login_string} {
    if {![string equal "\r" [string index $login_string end]] &&
        ![string equal ";"  [string index $login_string end]]} {
        error "login string must end with either Carrage Return or Semicolon"
    }
    if {[string first ":" $login_string] == -1} {
      error "login string is missing a colon"
    }
    set host_number [string range $login_string [expr {[string last ":" $login_string] + 1}] end-1]
    variable queries2supervisor
       set q #tbd
       set msgs ""
    append msgs "\x16"; # message type is Supervisor Request
    append msgs $q    ; # query port in question
    append msgs "\x00"; # constant zero byte
    foreach char [split $login_string ""] {
      append msgs "\x18"; # message type is Supervisor Login Character
      append msgs $q
      append msgs $char
    }
    packet_to_base $msgs
  }
}

proc Tymnet_calculate_lemcom_checksum {halfwords} {
  set sum "\x00\x00"
  set i 0
  set l [string length $halfwords]
  while {$i < $l} {
    set halfword [string range $halfwords $i [expr { $i + 1 }]]
    set sum [XOR $sum $halfword]
    incr i 2
  }
  return $sum
}

proc XOR {a b} {
  binary scan $a B* operand_a
  binary scan $b B* operand_b
  if {[string length $operand_a] != [string length $operand_b]} {
    error "operand A and B must be of same size"
  }
  set c ""
  set i 0
  set l [string length $operand_a]
  while {$i < $l} {
    append c [string replace {00 0 01 1 10 1 11 0} "[string index $operand_a $i][string index $operand_b $i]"]
    incr i
  }
  return [binary format B* $c]
}
