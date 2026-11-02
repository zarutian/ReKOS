
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
  $tna proc recieve_a_packet_from_base {packet} {
    set packet_header   [string range $packet 0 1]
    set packet_checksum [string range $packet 2 3]
    set packet [string range $packet 4 end]
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
          
      }
    }
  }
}
